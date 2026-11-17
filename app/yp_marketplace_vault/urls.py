"""
vault の URL（S009 §17.1）。

    POST /vault/api/v1/works/{work_id}/key   CK を現在の所有者の公開鍵へ再封して返す

view は Phase 2.5 で入れる（鍵の保管方式が未決。Specification.md §18 #4）。
それまで URL は予約しない — 鍵を返す EP を空実装で置くと、
うっかり通る経路が先に出来てしまう。
"""

urlpatterns: list = []
