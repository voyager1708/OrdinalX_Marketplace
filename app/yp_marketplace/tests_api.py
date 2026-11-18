"""
API 共通層の契約テスト（documents/Specification.md §6・§15）。

守るのは 1 つ: **成功も失敗も FE の `unwrap()` が読める形で返る**こと。
`{"status": "success", "data": …}` / `{"status":"error","error":{"code","message"}}`
以外が出たらそれはバグ。
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import Client, SimpleTestCase, TestCase, override_settings
from rest_framework import exceptions
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView

from yp_marketplace.api import ErrorCode, MarketError, error, success
from yp_marketplace.api.errors import AlreadyListedError, UpstreamError
from yp_marketplace.api.exception_handler import exception_handler


class EnvelopeTests(SimpleTestCase):
    def test_success_wraps_data(self):
        response = success({'listing_id': 7})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {'status': 'success', 'data': {'listing_id': 7}})

    def test_success_without_data_is_empty_dict(self):
        # data を省いても data キーは必ずある（FE が data.foo を触っても落ちない）
        self.assertEqual(success().data, {'status': 'success', 'data': {}})

    def test_error_shape(self):
        response = error('already listed', ErrorCode.ALREADY_LISTED, 409)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data, {
            'status': 'error',
            'error': {'code': 'ALREADY_LISTED', 'message': 'already listed'},
        })


class _DummyView(APIView):
    pass


class ExceptionHandlerTests(SimpleTestCase):
    def setUp(self):
        self.context = {'view': _DummyView(), 'request': APIRequestFactory().get('/')}

    def _handle(self, exc):
        return exception_handler(exc, self.context)

    def test_market_error_keeps_its_code_and_status(self):
        response = self._handle(AlreadyListedError('nft already on the board'))
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['error']['code'], 'ALREADY_LISTED')
        self.assertEqual(response.data['status'], 'error')

    def test_market_error_subclass_can_be_upstream(self):
        response = self._handle(UpstreamError('BE did not answer'))
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data['error']['code'], 'UPSTREAM_ERROR')

    def test_not_authenticated_maps_to_unauthenticated(self):
        response = self._handle(exceptions.NotAuthenticated())
        self.assertEqual(response.data['error']['code'], 'UNAUTHENTICATED')
        self.assertEqual(response.data['status'], 'error')

    def test_not_found_maps_to_not_found(self):
        response = self._handle(exceptions.NotFound())
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['error']['code'], 'NOT_FOUND')

    def test_throttled_maps_to_rate_limited(self):
        response = self._handle(exceptions.Throttled(wait=30))
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.data['error']['code'], 'RATE_LIMITED')

    def test_validation_error_flattens_detail_to_one_line(self):
        response = self._handle(exceptions.ValidationError(
            {'price_satoshis': ['must be positive'], 'payout_script': ['required']}))
        self.assertEqual(response.data['error']['code'], 'INVALID_REQUEST')
        message = response.data['error']['message']
        self.assertIn('price_satoshis', message)
        self.assertIn('payout_script', message)

    def test_django_http404_is_translated(self):
        from django.http import Http404
        response = self._handle(Http404('nope'))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['error']['code'], 'NOT_FOUND')

    def test_unhandled_exception_does_not_leak_detail(self):
        response = self._handle(RuntimeError('psycopg: password authentication failed'))
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data['error']['code'], 'INTERNAL_ERROR')
        # 内部の文言を外に出さない
        self.assertNotIn('psycopg', response.data['error']['message'])

    def test_every_handled_case_is_an_envelope(self):
        for exc in (MarketError('x'), exceptions.PermissionDenied(),
                    exceptions.MethodNotAllowed('POST'), RuntimeError('boom')):
            with self.subTest(exc=type(exc).__name__):
                data = self._handle(exc).data
                self.assertEqual(data['status'], 'error')
                self.assertIn('code', data['error'])
                self.assertIn('message', data['error'])


class BoundaryTests(SimpleTestCase):
    """
    §4・§14-13: vault は market のプロセスに同居させない。
    `vault` が market の INSTALLED_APPS に入ると、鍵のテーブルが帳簿 DB に出来る。
    """

    def test_vault_is_not_installed_in_market(self):
        from django.conf import settings
        self.assertNotIn('vault', settings.INSTALLED_APPS)

    def test_market_api_is_sessionless(self):
        """
        §2: セッションレス。認証は BE へのイントロスペクション（§7）だけで、
        Cookie を見る認証を足さない（同一オリジンなのでウォレットの Cookie が
        そのまま届いてしまう）。
        """
        from django.conf import settings
        classes = tuple(settings.REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'])
        self.assertEqual(
            classes, ('yp_marketplace.auth.BearerIntrospectionAuthentication',))
        for cookie_auth in ('SessionAuthentication', 'BasicAuthentication'):
            self.assertNotIn(cookie_auth, ' '.join(classes))

    @override_settings(ADMIN_URL='market/admin/')
    def test_session_cookie_is_scoped_to_market(self):
        # 同一オリジンにウォレットが居るので、名前と path を分ける（§14-9）
        from django.conf import settings
        self.assertEqual(settings.SESSION_COOKIE_NAME, 'market_sessionid')
        self.assertEqual(settings.SESSION_COOKIE_PATH, '/market/')
        self.assertFalse(hasattr(settings, 'SESSION_COOKIE_DOMAIN')
                         and settings.SESSION_COOKIE_DOMAIN)


class AdminSmokeTests(TestCase):
    """
    Phase 0 の完了条件のうち「admin に入れる」を自動で確かめる。

    admin は §7 の唯一の例外（market に認証主体を増やさない方針の外）。
    露出先は ADMIN_URL で変えられ、nginx 側でも遮断する。
    """

    def test_operator_can_reach_admin_index(self):
        User = get_user_model()
        User.objects.create_superuser(username='ops', password='pw-for-test')
        client = Client()
        self.assertTrue(client.login(username='ops', password='pw-for-test'))
        response = client.get('/' + settings.ADMIN_URL)
        self.assertEqual(response.status_code, 200)

    def test_schema_endpoint_is_served_under_market_prefix(self):
        # §6: nginx が /market/ をパスごと渡すので Django 側も market/ 付きで受ける
        response = Client().get('/market/api/v1/schema/')
        self.assertEqual(response.status_code, 200)

    def test_registered_models_are_all_visible_to_admin(self):
        # 骨格の取りこぼし検出。admin に出ない＝運用で触れないモデルを早めに気づく
        from django.contrib import admin as dj_admin
        registered = {model._meta.label for model in dj_admin.site._registry}
        for label in ('accounts.User', 'vendor.Vendor', 'product.Work',
                      'product.Category', 'chain.Edition', 'chain.ContentPart',
                      'chain.MintJob', 'chain.Manifest', 'chain.NftCache',
                      'listing.Listing', 'listing.TxTemplate', 'listing.Purchase',
                      'listing.SettlementJob', 'listing.ListingEvent',
                      'listing.TakedownRequest', 'listing.BlockedContent'):
            with self.subTest(model=label):
                self.assertIn(label, registered)
