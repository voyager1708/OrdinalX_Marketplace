(() => {
  // src/js/market-sell.js
  (function() {
    const state = { nfts: [], selected: null, feeBps: null };
    function $(id) {
      return document.getElementById(id);
    }
    function status(message) {
      const el = $("sell-status");
      if (el) el.textContent = message || "";
    }
    function fail(message) {
      const el = $("sell-error");
      if (!el) return;
      el.textContent = message;
      el.classList.remove("hidden");
    }
    function clearError() {
      const el = $("sell-error");
      if (el) el.classList.add("hidden");
    }
    function needsSignin() {
      $("sell-main").classList.add("hidden");
      $("sell-signin").classList.remove("hidden");
    }
    function price() {
      const raw = Number(($("sell-price") || {}).value || 0);
      return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
    }
    function refreshFee() {
      const el = $("sell-fee");
      if (!el) return;
      const bps = state.feeBps;
      el.textContent = bps && price() ? Math.floor(price() * bps / 1e4).toLocaleString() : "\u2014";
    }
    function refreshSubmit() {
      const button = $("sell-submit");
      if (button) button.disabled = !(state.selected && price() > 0);
      refreshFee();
    }
    function renderNfts() {
      const host = $("sell-nfts");
      if (!state.nfts.length) {
        host.innerHTML = '<div class="s006-empty"><div class="s006-empty__icon"><i class="bi bi-image" aria-hidden="true"></i></div><p class="s006-empty__title">\u51FA\u54C1\u3067\u304D\u308B\u4F5C\u54C1\u304C\u3042\u308A\u307E\u305B\u3093</p><p class="s006-empty__body">\u30A6\u30A9\u30EC\u30C3\u30C8\u3067\u4F5C\u54C1\u3092\u4F5C\u308B\u304B\u3001\u53D7\u3051\u53D6\u3063\u3066\u304F\u3060\u3055\u3044\u3002</p></div>';
        return;
      }
      const list = document.createElement("ul");
      list.className = "s006-txlist";
      list.setAttribute("role", "list");
      state.nfts.forEach((nft) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "s006-tx w-full text-left";
        button.disabled = Boolean(nft.listed) || !nft.current_nft_location;
        button.setAttribute("aria-pressed", "false");
        button.dataset.origin = nft.nft_origin;
        const note = nft.listed ? "\u51FA\u54C1\u4E2D" : nft.current_nft_location ? nft.content_type || "" : "\u5834\u6240\u304C\u672A\u78BA\u5B9A";
        button.innerHTML = `<div class="s006-tx__icon"><i class="bi bi-image" aria-hidden="true"></i></div><div class="s006-tx__body"><p class="s006-tx__title">${escapeHtml(nft.name || nft.nft_origin)}</p><p class="s006-meta">${escapeHtml(note)}</p></div>`;
        button.addEventListener("click", () => select(nft, button, list));
        item.appendChild(button);
        list.appendChild(item);
      });
      host.innerHTML = "";
      host.appendChild(list);
    }
    function select(nft, button, list) {
      state.selected = nft;
      list.querySelectorAll("button").forEach((el) => {
        el.setAttribute("aria-pressed", String(el === button));
        el.classList.toggle("is-active", el === button);
      });
      refreshSubmit();
    }
    function escapeHtml(value) {
      const div = document.createElement("div");
      div.textContent = String(value == null ? "" : value);
      return div.innerHTML;
    }
    async function listIt() {
      clearError();
      const nft = state.selected;
      const satoshis = price();
      if (!nft || !satoshis) return;
      $("sell-submit").disabled = true;
      try {
        await window.MarketSign.withMnemonic(async (mnemonic) => {
          const keys = window.NcListing.deriveListingKeys(mnemonic);
          status("\u5E02\u5834\u306B\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u4F5C\u3089\u305B\u3066\u3044\u307E\u3059\u2026");
          const draft = await window.MarketSign.api("/market/api/v1/listings/draft", {
            nft_origin: nft.nft_origin,
            price_satoshis: satoshis,
            payout_script: keys.payoutScriptHex,
            cancel_pubkey: keys.publicKeyHex
          });
          status("\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u7AEF\u672B\u3067\u691C\u8A3C\u3057\u3066\u3044\u307E\u3059\u2026");
          window.NcListing.verifyListingDraft(draft, {
            nftLocation: nft.current_nft_location,
            priceSatoshis: satoshis,
            payoutScriptHex: keys.payoutScriptHex,
            cancelPublicKeyHex: keys.publicKeyHex
          });
          window.NcListing.assertAnnouncedFee(
            satoshis,
            draft.fee_bps,
            draft.fee_satoshis
          );
          status("\u3053\u306E\u7AEF\u672B\u3067\u7F72\u540D\u3057\u3066\u3044\u307E\u3059\u2026");
          const signed = await window.NcSend.signTemplate(draft.template, mnemonic);
          status("\u653E\u9001\u3057\u3066\u3044\u307E\u3059\u2026");
          const result = await window.MarketSign.api("/market/api/v1/listings/submit", {
            template_id: draft.template_id,
            signed_transaction_hex: signed
          });
          status("");
          $("sell-main").classList.add("hidden");
          $("sell-done").classList.remove("hidden");
          $("sell-txid").textContent = result.txid || "";
        });
      } catch (error) {
        status("");
        if (error && error.message === "cancelled") return;
        if (error && error.message === "auth_required") {
          needsSignin();
          return;
        }
        fail(error && error.message ? error.message : "\u51FA\u54C1\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
      } finally {
        const button = $("sell-submit");
        if (button) button.disabled = false;
        refreshSubmit();
      }
    }
    async function start() {
      if (!$("sell-nfts")) return;
      state.feeBps = Number($("sell-price").dataset.feeBps || 0) || null;
      $("sell-price").addEventListener("input", refreshSubmit);
      $("sell-submit").addEventListener("click", listIt);
      try {
        const data = await window.MarketSign.api("/market/api/v1/me/nfts");
        state.nfts = data.nfts || [];
        renderNfts();
        refreshSubmit();
      } catch (error) {
        if (error && error.message === "auth_required") {
          needsSignin();
          return;
        }
        $("sell-nfts").innerHTML = "";
        fail("\u624B\u6301\u3061\u306E\u4F5C\u54C1\u3092\u8AAD\u3081\u307E\u305B\u3093\u3067\u3057\u305F");
      }
    }
    document.addEventListener("DOMContentLoaded", start);
  })();
})();
