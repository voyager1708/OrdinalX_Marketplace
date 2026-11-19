/**
 * 出品の画面（Specification.md §8.2・§14-2）。
 *
 * 流れは「市場に未署名テンプレートを作らせる → **端末が検証する** → 署名 → 放送」。
 * 検証を省いた実装はマージしない（§14-2）ので、`NcListing.verifyListingDraft` と
 * `assertAnnouncedFee` を必ず通してから署名する。
 *
 * 依存（実行時）: window.ncAuth / NcWallet / NcSend / NcListing / MarketSign
 */
(function () {
    const state = { nfts: [], selected: null, feeBps: null };

    function $(id) { return document.getElementById(id); }

    function status(message) {
        const el = $('sell-status');
        if (el) el.textContent = message || '';
    }

    function fail(message) {
        const el = $('sell-error');
        if (!el) return;
        el.textContent = message;
        el.classList.remove('hidden');
    }

    function clearError() {
        const el = $('sell-error');
        if (el) el.classList.add('hidden');
    }

    function needsSignin() {
        $('sell-main').classList.add('hidden');
        $('sell-signin').classList.remove('hidden');
    }

    function price() {
        const raw = Number(($('sell-price') || {}).value || 0);
        return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
    }

    function refreshFee() {
        const el = $('sell-fee');
        if (!el) return;
        const bps = state.feeBps;
        el.textContent = (bps && price())
            ? Math.floor(price() * bps / 10000).toLocaleString()
            : '—';
    }

    function refreshSubmit() {
        const button = $('sell-submit');
        if (button) button.disabled = !(state.selected && price() > 0);
        refreshFee();
    }

    /** 手持ちの作品を描く。出品中のものは選べない（二重出品は市場も塞ぐ）。 */
    function renderNfts() {
        const host = $('sell-nfts');
        if (!state.nfts.length) {
            host.innerHTML = '<div class="s006-empty">'
                + '<div class="s006-empty__icon"><i class="bi bi-image" aria-hidden="true"></i></div>'
                + '<p class="s006-empty__title">出品できる作品がありません</p>'
                + '<p class="s006-empty__body">ウォレットで作品を作るか、受け取ってください。</p>'
                + '</div>';
            return;
        }
        const list = document.createElement('ul');
        list.className = 's006-txlist';
        list.setAttribute('role', 'list');
        state.nfts.forEach((nft) => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 's006-tx w-full text-left';
            button.disabled = Boolean(nft.listed) || !nft.current_nft_location;
            button.setAttribute('aria-pressed', 'false');
            button.dataset.origin = nft.nft_origin;
            const note = nft.listed
                ? '出品中'
                : (nft.current_nft_location ? (nft.content_type || '') : '場所が未確定');
            button.innerHTML =
                '<div class="s006-tx__icon"><i class="bi bi-image" aria-hidden="true"></i></div>'
                + '<div class="s006-tx__body">'
                + `<p class="s006-tx__title">${escapeHtml(nft.name || nft.nft_origin)}</p>`
                + `<p class="s006-meta">${escapeHtml(note)}</p>`
                + '</div>';
            button.addEventListener('click', () => select(nft, button, list));
            item.appendChild(button);
            list.appendChild(item);
        });
        host.innerHTML = '';
        host.appendChild(list);
    }

    function select(nft, button, list) {
        state.selected = nft;
        list.querySelectorAll('button').forEach((el) => {
            el.setAttribute('aria-pressed', String(el === button));
            el.classList.toggle('is-active', el === button);
        });
        refreshSubmit();
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value == null ? '' : value);
        return div.innerHTML;
    }

    /** 出品する。検証 → 署名 → 放送（どこで待っているかを出す）。 */
    async function listIt() {
        clearError();
        const nft = state.selected;
        const satoshis = price();
        if (!nft || !satoshis) return;

        $('sell-submit').disabled = true;
        try {
            await window.MarketSign.withMnemonic(async (mnemonic) => {
                const keys = window.NcListing.deriveListingKeys(mnemonic);

                status('市場にテンプレートを作らせています…');
                const draft = await window.MarketSign.api('/market/api/v1/listings/draft', {
                    nft_origin: nft.nft_origin,
                    price_satoshis: satoshis,
                    payout_script: keys.payoutScriptHex,
                    cancel_pubkey: keys.publicKeyHex,
                });

                status('テンプレートを端末で検証しています…');
                window.NcListing.verifyListingDraft(draft, {
                    nftLocation: nft.current_nft_location,
                    priceSatoshis: satoshis,
                    payoutScriptHex: keys.payoutScriptHex,
                    cancelPublicKeyHex: keys.publicKeyHex,
                });
                window.NcListing.assertAnnouncedFee(
                    satoshis, draft.fee_bps, draft.fee_satoshis);

                status('この端末で署名しています…');
                const signed = await window.NcSend.signTemplate(draft.template, mnemonic);

                status('放送しています…');
                const result = await window.MarketSign.api('/market/api/v1/listings/submit', {
                    template_id: draft.template_id,
                    signed_transaction_hex: signed,
                });

                status('');
                $('sell-main').classList.add('hidden');
                $('sell-done').classList.remove('hidden');
                $('sell-txid').textContent = result.txid || '';
            });
        } catch (error) {
            status('');
            if (error && error.message === 'cancelled') return;
            if (error && error.message === 'auth_required') { needsSignin(); return; }
            fail(error && error.message ? error.message : '出品に失敗しました');
        } finally {
            const button = $('sell-submit');
            if (button) button.disabled = false;
            refreshSubmit();
        }
    }

    async function start() {
        if (!$('sell-nfts')) return;              // 出品の画面でなければ何もしない
        // 表示用の手数料率（端末は署名の前に draft の告知額を計算し直す。§14-4）
        state.feeBps = Number($('sell-price').dataset.feeBps || 0) || null;
        $('sell-price').addEventListener('input', refreshSubmit);
        $('sell-submit').addEventListener('click', listIt);

        try {
            const data = await window.MarketSign.api('/market/api/v1/me/nfts');
            state.nfts = data.nfts || [];
            renderNfts();
            refreshSubmit();
        } catch (error) {
            if (error && error.message === 'auth_required') { needsSignin(); return; }
            $('sell-nfts').innerHTML = '';
            fail('手持ちの作品を読めませんでした');
        }
    }

    document.addEventListener('DOMContentLoaded', start);
})();
