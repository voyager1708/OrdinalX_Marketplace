"""
イントロスペクション（documents/Specification.md §7）。

押さえるのは 4 つ:
  - **JWT をローカル検証しない**（鍵を持たない）。本人確定は BE の 200 だけ
  - 問い合わせ先は**固定 URL**（SSRF）
  - トークンをログに書かない（出すのは jti の先頭 8 文字）
  - (jti, exp) 単位で 60 秒キャッシュし、毎リクエスト BE を叩かない
"""

import base64
import json
from unittest import mock

from django.core.cache import cache
from django.test import TestCase, override_settings

from accounts.models import User
from yp_marketplace.auth import (
    BEIntrospectionVerifier,
    IntrospectionError,
    Principal,
    TokenVerifier,
    set_verifier,
)

BE = 'http://be.invalid:8002'


def make_token(user_id=7, jti='abcd1234efgh', exp=9999999999):
    """署名しない。market は検証しないので、形だけあればよい。"""
    def chunk(payload):
        raw = json.dumps(payload).encode()
        return base64.urlsafe_b64encode(raw).decode().rstrip('=')
    return f"{chunk({'alg': 'HS256'})}.{chunk({'user_id': user_id, 'jti': jti, 'exp': exp})}.sig"


class FakeResponse:
    def __init__(self, status_code=200, payload=None):
        self.status_code = status_code
        self._payload = payload if payload is not None else {}

    def json(self):
        return self._payload


@override_settings(BE_API_BASE_URL=BE)
class IntrospectionTests(TestCase):
    def setUp(self):
        cache.clear()
        self.verifier = BEIntrospectionVerifier()

    def test_principal_comes_from_the_token_claim_when_be_omits_id(self):
        """
        BE の /user/info は id を返さない（2026-11-18 実測）。有効性は BE の
        200 が担保しているので、同じトークンの user_id を principal にする。
        """
        payload = {'username': 'nc1@spv.buxbit.net', 'paymail': 'nc1@spv.buxbit.net'}
        with mock.patch('yp_marketplace.auth.requests.get',
                        return_value=FakeResponse(200, payload)) as get:
            principal = self.verifier.verify(make_token(user_id=7))

        self.assertEqual(principal.be_user_id, 7)
        self.assertEqual(principal.paymail, 'nc1@spv.buxbit.net')
        # 固定 URL のみ（リクエスト由来の値を混ぜない）
        self.assertEqual(get.call_args.args[0], f'{BE}/api/v1/user/info')

    def test_be_id_wins_when_present(self):
        with mock.patch('yp_marketplace.auth.requests.get',
                        return_value=FakeResponse(200, {'id': 42, 'username': 'x'})):
            self.assertEqual(self.verifier.verify(make_token(user_id=7)).be_user_id, 42)

    def test_401_from_be_is_rejected(self):
        with mock.patch('yp_marketplace.auth.requests.get', return_value=FakeResponse(401)):
            with self.assertRaises(IntrospectionError):
                self.verifier.verify(make_token())

    def test_backend_down_is_rejected_not_passed(self):
        import requests as requests_module
        with mock.patch('yp_marketplace.auth.requests.get',
                        side_effect=requests_module.ConnectionError('refused')):
            with self.assertRaises(IntrospectionError):
                self.verifier.verify(make_token())

    def test_unknown_principal_is_rejected(self):
        # BE は 200 を返したが id が分からない → 黙って通さない
        token = 'not.a.jwt'
        with mock.patch('yp_marketplace.auth.requests.get',
                        return_value=FakeResponse(200, {'username': 'x'})):
            with self.assertRaises(IntrospectionError):
                self.verifier.verify(token)

    def test_result_is_cached_per_jti_and_exp(self):
        with mock.patch('yp_marketplace.auth.requests.get',
                        return_value=FakeResponse(200, {'username': 'x'})) as get:
            token = make_token(jti='same-jti')
            self.verifier.verify(token)
            self.verifier.verify(token)
            self.assertEqual(get.call_count, 1, '2 回目も BE を叩いている')

            # jti が違えば別物として引き直す
            self.verifier.verify(make_token(jti='other-jti'))
            self.assertEqual(get.call_count, 2)

    def test_token_is_never_logged(self):
        import requests as requests_module
        with self.assertLogs('market.auth', level='WARNING') as logs:
            with mock.patch('yp_marketplace.auth.requests.get',
                            side_effect=requests_module.ConnectionError('refused')):
                with self.assertRaises(IntrospectionError):
                    self.verifier.verify(make_token(jti='secret-jti-value'))
        joined = '\n'.join(logs.output)
        self.assertNotIn('secret-jti-value', joined, 'jti を丸ごと出している')
        self.assertIn('secret-j', joined, 'jti の先頭 8 文字は出す（追跡のため）')

    def test_no_be_url_is_a_failure_not_a_pass(self):
        with override_settings(BE_API_BASE_URL=''):
            with self.assertRaises(IntrospectionError):
                BEIntrospectionVerifier().verify(make_token())


class _StubVerifier(TokenVerifier):
    def __init__(self, principal):
        self.principal = principal

    def verify(self, token):
        return self.principal


class ProjectionTests(TestCase):
    """認証が通ると accounts に投影される（§5・§7）。"""

    def tearDown(self):
        set_verifier(None)

    def test_projection_is_upserted_on_authentication(self):
        from rest_framework.test import APIRequestFactory
        from yp_marketplace.auth import BearerIntrospectionAuthentication

        set_verifier(_StubVerifier(Principal(
            be_user_id=11, username='nc9@spv.buxbit.net', paymail='nc9@spv.buxbit.net')))

        request = APIRequestFactory().get('/market/api/v1/stats',
                                          HTTP_AUTHORIZATION='Bearer whatever')
        user, principal = BearerIntrospectionAuthentication().authenticate(request)

        self.assertEqual(principal.be_user_id, 11)
        self.assertEqual(user.be_user_id, 11)
        self.assertFalse(user.has_usable_password(), '投影はパスワードを持たない')
        self.assertEqual(User.objects.count(), 1)

        # 2 回目は増えない
        BearerIntrospectionAuthentication().authenticate(request)
        self.assertEqual(User.objects.count(), 1)

    def test_no_header_means_anonymous(self):
        from rest_framework.test import APIRequestFactory
        from yp_marketplace.auth import BearerIntrospectionAuthentication

        request = APIRequestFactory().get('/market/api/v1/stats')
        self.assertIsNone(BearerIntrospectionAuthentication().authenticate(request))
