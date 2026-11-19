/**
 * 購入の画面（Specification.md §8.3・§8.4・§14-2）。
 *
 * 「市場に未署名テンプレートを作らせる → **端末が検証する** → 自分の入力だけ
 * 署名 → 放送」。検証を省いた実装はマージしない（§14-2）ので、
 * `NcListing.verifyPurchaseDraft` を必ず通してから署名する。
 *
 * 依存（実行時）: window.ncAuth / NcWallet / NcSend / NcListing / MarketSign
 */
(function () {
    // マイナー手数料の上限。これを超える draft には署名しない（市場が抜く余地を塞ぐ）
    const MAX_MINER_FEE_SATOSHIS = 5000;

    function $(id) { return document.getElementById(id); }

    function status(message) {
        const el = $('buy-status');
        if (el) el.textContent = message || '';
    }

    function fail(message) {
        const el = $('buy-error');
        if (!el) return;
        el.textContent = message;
        el.classList.remove('hidden');
    }

    function clearError() {
        const el = $('buy-error');
        if (el) el.classList.add('hidden');
    }

    function listingId() {
        const card = document.querySelector('[data-listing-id]');
        return card ? Number(card.dataset.listingId) : null;
    }

    function priceSatoshis() {
        const el = $('buy-price');
        return el ? Number(el.dataset.price || 0) : 0;
    }

    function feeBps() {
        const el = $('buy-fee');
        return el ? Number(el.dataset.feeBps || 0) : 0;
    }

    function showFee() {
        const el = $('buy-fee');
        if (!el) return;
        const fee = Math.floor(priceSatoshis() * feeBps() / 10000);
        el.textContent = `${fee.toLocaleString()} sat`;
    }

    async function buy() {
        clearError();
        const id = listingId();
        if (!id) return;

        $('buy-submit').disabled = true;
        try {
            await window.MarketSign.withMnemonic(async (mnemonic) => {
                const keys = window.NcListing.deriveListingKeys(mnemonic);

                status('市場にテンプレートを作らせています…');
                const draft = await window.MarketSign.api('/market/api/v1/purchases/draft', {
                    listing_id: id,
                    receive_script: keys.payoutScriptHex,
                });

                status('テンプレートを端末で検証しています…');
                window.NcListing.verifyPurchaseDraft(draft, {
                    receiveScriptHex: keys.payoutScriptHex,
                    priceSatoshis: priceSatoshis(),
                    feeBps: feeBps(),
                    maxMinerFeeSatoshis: MAX_MINER_FEE_SATOSHIS,
                });

                status('この端末で署名しています…');
                const signed = await window.NcSend.signTemplate(draft.template, mnemonic);

                status('放送しています…');
                const result = await window.MarketSign.api('/market/api/v1/purchases/submit', {
                    template_id: draft.template_id,
                    signed_transaction_hex: signed,
                });

                status('');
                $('buy-main').classList.add('hidden');
                $('buy-done').classList.remove('hidden');
                $('buy-txid').textContent = result.txid || '';
            });
        } catch (error) {
            status('');
            if (error && error.message === 'cancelled') return;
            if (error && error.message === 'auth_required') {
                $('buy-main').classList.add('hidden');
                $('buy-signin').classList.remove('hidden');
                return;
            }
            fail(error && error.message ? error.message : '購入に失敗しました');
        } finally {
            const button = $('buy-submit');
            if (button) button.disabled = false;
        }
    }

    function start() {
        if (!$('buy-price')) return;           // 購入の画面でなければ何もしない
        showFee();
        const button = $('buy-submit');
        if (button) button.addEventListener('click', buy);
    }

    document.addEventListener('DOMContentLoaded', start);
})();
