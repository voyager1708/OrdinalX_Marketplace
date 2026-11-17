"""
BE ユーザーの投影（documents/Specification.md §5・§7）。

market は認証主体を持たない。ログイン・登録・パスワード再設定の view と URL は
**作らない**。ここにあるのは BE の `GET /api/v1/user/info` でイントロスペクション
した結果の写しで、`principal`（= BE の user id）を人が読める形にするための表である。

他のモデルは User への FK を張らず `*_principal` のスカラで参照する
（§13.4-2「参照は nft_origin / txid / principal だけで閉じる」）。投影が遅れても
板と取引は壊れない、という性質をこれで保つ。
"""

from __future__ import annotations

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class AccountType(models.TextChoices):
    CUSTODIAL = 'custodial', 'custodial'
    NON_CUSTODIAL = 'non_custodial', 'non_custodial'


class UserManager(BaseUserManager):
    """投影の upsert と、admin 用のローカル運用アカウント作成だけを持つ。"""

    use_in_migrations = True

    def _create(self, username: str, password=None, **extra):
        if not username:
            raise ValueError('username is required')
        user = self.model(username=username, **extra)
        if password:
            user.set_password(password)
        else:
            # 投影ユーザーはパスワードを持たない（§7）
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, username: str, password=None, **extra):
        extra.setdefault('is_staff', False)
        extra.setdefault('is_superuser', False)
        return self._create(username, password, **extra)

    def create_superuser(self, username: str, password=None, **extra):
        """admin に入るためのローカル運用アカウント（§7 の例外）。BE とは無関係。"""
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        if not extra['is_staff'] or not extra['is_superuser']:
            raise ValueError('superuser must have is_staff=True and is_superuser=True')
        return self._create(username, password, **extra)

    def upsert_projection(self, *, be_user_id: int, username: str,
                          paymail: str = '', account_type: str = '',
                          email: str = ''):
        """
        イントロスペクションの結果を投影する（§7）。

        キーは `be_user_id`。username は BE 側で変わり得るので毎回上書きする。
        """
        defaults = {
            'username': username,
            'paymail': paymail or '',
            'account_type': account_type or '',
            'email': email or '',
            'last_introspected_at': timezone.now(),
        }
        user, created = self.update_or_create(be_user_id=be_user_id, defaults=defaults)
        if created:
            user.set_unusable_password()
            user.save(using=self._db, update_fields=['password'])
        return user


class User(AbstractBaseUser, PermissionsMixin):
    # BE の user id（= principal）。ローカル運用アカウントは null。
    be_user_id = models.PositiveBigIntegerField(
        unique=True, null=True, blank=True,
        help_text='BE の user id。これが principal。投影でない運用アカウントは null',
    )
    # BE の username（paymail 形式のことが多い）。ローカル運用アカウントは任意の識別子。
    username = models.CharField(max_length=255, unique=True)
    paymail = models.CharField(max_length=255, blank=True)
    account_type = models.CharField(max_length=32, blank=True, choices=AccountType.choices)
    email = models.EmailField(blank=True)

    # 審査者ロール（§9.1）。所有権判定の例外になるので明示的に持つ。
    is_reviewer = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_introspected_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        db_table = 'accounts_user'
        indexes = [
            models.Index(fields=['paymail']),
        ]

    def __str__(self) -> str:
        return f'{self.username} (be:{self.be_user_id})' if self.be_user_id else self.username

    @property
    def principal(self):
        """他モデルの `*_principal` に入る値。投影でなければ None。"""
        return self.be_user_id
