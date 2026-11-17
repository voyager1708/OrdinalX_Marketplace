"""
BE ユーザーの投影（documents/Specification.md §7）。

market は認証主体を持たない。投影はパスワードを持たず、キーは `be_user_id`。
"""

from django.test import TestCase

from accounts.models import AccountType, User


class ProjectionTests(TestCase):
    def test_upsert_creates_projection_without_usable_password(self):
        user = User.objects.upsert_projection(
            be_user_id=2,
            username='test_yenpoint@linode.buxbit.net',
            paymail='test_yenpoint@linode.buxbit.net',
            account_type=AccountType.CUSTODIAL,
        )
        self.assertEqual(user.be_user_id, 2)
        self.assertEqual(user.principal, 2)
        self.assertFalse(user.has_usable_password())
        self.assertIsNotNone(user.last_introspected_at)

    def test_upsert_is_keyed_on_be_user_id_and_overwrites_username(self):
        User.objects.upsert_projection(be_user_id=2, username='old@example.com')
        user = User.objects.upsert_projection(
            be_user_id=2, username='new@example.com', paymail='new@spv.buxbit.net')
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(user.username, 'new@example.com')
        self.assertEqual(user.paymail, 'new@spv.buxbit.net')

    def test_local_operator_account_has_no_be_user_id(self):
        # admin に入るためのローカル運用アカウント（§7 の例外）
        admin = User.objects.create_superuser(username='ops', password='x')
        self.assertIsNone(admin.be_user_id)
        self.assertIsNone(admin.principal)
        self.assertTrue(admin.is_staff and admin.is_superuser)
        self.assertTrue(admin.has_usable_password())
