/**
 * 解錠（市場の画面で共通）。
 *
 * 鍵はこの端末の IndexedDB にあり、市場も BE も署名できない。出品・取り下げの
 * 直前にパスワードを受け取ってニーモニックを開き、**その場で使って捨てる**
 * （変数に残さない。`window` にも置かない）。
 *
 * 依存（実行時に読む）: `window.NcWallet`（キット）。無ければ無効化する。
 * DOM は `market/partials/unlock.html`。
 */
(function () {
    const ids = {
        modal: 'market-unlock',
        password: 'market-unlock-password',
        confirm: 'market-unlock-confirm',
        cancel: 'market-unlock-cancel',
        error: 'market-unlock-error',
    };

    function $(id) { return document.getElementById(id); }

    /**
     * パスワードを尋ね、ニーモニックを渡す。
     *
     * 呼ぶ側は `await MarketSign.withMnemonic(async (mnemonic) => {...})` の形で使う。
     * コールバックを抜けた時点で参照を落とすので、呼ぶ側が保持しない限り残らない。
     */
    async function withMnemonic(run) {
        if (!window.NcWallet) throw new Error('market: NcWallet が読み込まれていない');
        const modal = $(ids.modal);
        if (!modal) throw new Error('market: 解錠ダイアログが無い');

        const mnemonic = await askPassword(modal);
        try {
            return await run(mnemonic);
        } finally {
            close(modal);
        }
    }

    function open(modal) {
        modal.classList.remove('hidden');
        const field = $(ids.password);
        if (field) { field.value = ''; field.focus(); }
        hideError();
    }

    function close(modal) {
        modal.classList.add('hidden');
        const field = $(ids.password);
        if (field) field.value = '';
    }

    function showError(message) {
        const el = $(ids.error);
        if (!el) return;
        el.textContent = message;
        el.classList.remove('hidden');
    }

    function hideError() {
        const el = $(ids.error);
        if (el) el.classList.add('hidden');
    }

    /** ダイアログを開き、正しいパスワードが入るまで待つ。取り消しは例外。 */
    function askPassword(modal) {
        return new Promise((resolve, reject) => {
            const confirm = $(ids.confirm);
            const cancel = $(ids.cancel);

            const cleanup = () => {
                confirm.removeEventListener('click', onConfirm);
                cancel.removeEventListener('click', onCancel);
                modal.removeEventListener('keydown', onKey);
            };

            const onConfirm = async () => {
                const password = ($(ids.password) || {}).value || '';
                if (!password) { showError('パスワードを入れてください'); return; }
                confirm.disabled = true;
                try {
                    // 端末内の暗号文を開く。失敗＝パスワード違い（または鍵が無い）
                    const mnemonic = await window.NcWallet.loadMnemonic(undefined, password);
                    cleanup();
                    resolve(mnemonic);
                } catch (e) {
                    showError(e && e.message === 'no-local-key'
                        ? 'この端末に鍵がありません。ウォレットで復元してください'
                        : 'パスワードが違います');
                } finally {
                    confirm.disabled = false;
                }
            };

            const onCancel = () => {
                cleanup();
                close(modal);
                reject(new Error('cancelled'));
            };

            const onKey = (event) => {
                if (event.key === 'Escape') onCancel();
                if (event.key === 'Enter') onConfirm();
            };

            confirm.addEventListener('click', onConfirm);
            cancel.addEventListener('click', onCancel);
            modal.addEventListener('keydown', onKey);
            open(modal);
        });
    }

    /** エンベロープを外す（市場の API は BE と同形）。 */
    function unwrap(body) {
        if (body && body.status === 'success') return body.data;
        const error = (body && body.error) || {};
        throw new Error(error.message || error.code || 'unknown error');
    }

    /**
     * 市場の API を叩く（Bearer はキットの ncAuth が付ける）。
     *
     * `apiGet` / `apiPost` は**解析済みの JSON** を返す（Response ではない）。
     */
    async function api(path, payload) {
        if (!window.ncAuth) throw new Error('market: ncAuth が読み込まれていない');
        const body = payload === undefined
            ? await window.ncAuth.apiGet(path)
            : await window.ncAuth.apiPost(path, payload);
        return unwrap(body);
    }

    window.MarketSign = { withMnemonic, api, unwrap };
})();
