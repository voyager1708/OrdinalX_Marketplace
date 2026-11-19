/**
 * 自分の出品と取り下げ（Specification.md §8.3）。
 *
 * 取り下げも**端末の署名**が要る。ロックに焼き込まれた鍵（m/1/0）でしか
 * 解けないので、市場は手数料を出して放送するだけ。
 *
 * 署名範囲は `SINGLE|ANYONECANPAY|FORKID`（キットの `signCancel` が面倒を見る）。
 * 戻り先は**端末が自分で導出した**受取先で、市場の言い値は使わない。
 *
 * 依存（実行時）: window.ncAuth / NcWallet / NcListing / MarketSign
 */
(function () {
    const OPEN = ['pending', 'active'];
    const LABELS = {
        draft: '下書き', pending: '放送済み（確認待ち）', active: '出品中',
        sold: '売れました', cancelled: '取り下げ済み', invalid: '無効',
    };

    function $(id) { return document.getElementById(id); }

    function status(message) {
        const el = $('mine-status');
        if (el) el.textContent = message || '';
    }

    function fail(message) {
        const el = $('mine-error');
        if (!el) return;
        el.textContent = message;
        el.classList.remove('hidden');
    }

    function clearError() {
        const el = $('mine-error');
        if (el) el.classList.add('hidden');
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value == null ? '' : value);
        return div.innerHTML;
    }

    function render(listings) {
        const host = $('mine-list');
        if (!listings.length) {
            host.innerHTML = '<div class="s006-empty">'
                + '<div class="s006-empty__icon"><i class="bi bi-shop" aria-hidden="true"></i></div>'
                + '<p class="s006-empty__title">まだ出品していません</p>'
                + '</div>';
            return;
        }
        const list = document.createElement('ul');
        list.className = 's006-txlist';
        list.setAttribute('role', 'list');

        listings.forEach((listing) => {
            const item = document.createElement('li');
            item.className = 's006-tx';
            item.innerHTML =
                '<div class="s006-tx__icon"><i class="bi bi-image" aria-hidden="true"></i></div>'
                + '<div class="s006-tx__body">'
                + `<p class="s006-tx__title">${escapeHtml(listing.work_title || listing.nft_origin)}</p>`
                + `<p class="s006-meta">${escapeHtml(LABELS[listing.status] || listing.status)}</p>`
                + '</div>'
                + `<p class="s006-tx__amount s006-num">${Number(listing.price_satoshis).toLocaleString()}`
                + ' <span class="s006-sub">sat</span></p>';

            if (OPEN.indexOf(listing.status) !== -1) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 's006-btn ml-3';
                button.textContent = '取り下げる';
                button.addEventListener('click', () => cancel(listing, button));
                item.appendChild(button);
            }
            list.appendChild(item);
        });
        host.innerHTML = '';
        host.appendChild(list);
    }

    async function cancel(listing, button) {
        clearError();
        button.disabled = true;
        try {
            await window.MarketSign.withMnemonic(async (mnemonic) => {
                const keys = window.NcListing.deriveListingKeys(mnemonic);

                status('取り下げのテンプレートを作っています…');
                const draft = await window.MarketSign.api(
                    `/market/api/v1/listings/${listing.id}/cancel/draft`,
                    { receive_script: keys.payoutScriptHex });

                status('この端末で署名しています…');
                // 検証も signCancel の中で走る（戻り先と署名範囲）
                const signed = await window.NcListing.signCancel(draft, mnemonic, {
                    listedOutpoint: listing.listed_outpoint,
                    receiveScriptHex: keys.payoutScriptHex,
                });

                status('放送しています…');
                await window.MarketSign.api(
                    `/market/api/v1/listings/${listing.id}/cancel/submit`,
                    { template_id: draft.template_id, ...signed });

                status('取り下げました。作品はウォレットに戻ります。');
                await load();
            });
        } catch (error) {
            status('');
            if (error && error.message === 'cancelled') return;
            fail(error && error.message ? error.message : '取り下げに失敗しました');
        } finally {
            button.disabled = false;
        }
    }

    async function load() {
        const data = await window.MarketSign.api('/market/api/v1/me/listings');
        render(data.listings || []);
    }

    async function start() {
        if (!$('mine-list')) return;
        try {
            await load();
        } catch (error) {
            if (error && error.message === 'auth_required') {
                $('mine-list').classList.add('hidden');
                $('mine-signin').classList.remove('hidden');
                return;
            }
            $('mine-list').innerHTML = '';
            fail('自分の出品を読めませんでした');
        }
    }

    document.addEventListener('DOMContentLoaded', start);
})();
