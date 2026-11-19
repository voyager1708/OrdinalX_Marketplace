(() => {
  // src/js/market-buy.js
  (function() {
    const MAX_MINER_FEE_SATOSHIS = 5e3;
    function $(id) {
      return document.getElementById(id);
    }
    function status(message) {
      const el = $("buy-status");
      if (el) el.textContent = message || "";
    }
    function fail(message) {
      const el = $("buy-error");
      if (!el) return;
      el.textContent = message;
      el.classList.remove("hidden");
    }
    function clearError() {
      const el = $("buy-error");
      if (el) el.classList.add("hidden");
    }
    function listingId() {
      const card = document.querySelector("[data-listing-id]");
      return card ? Number(card.dataset.listingId) : null;
    }
    function priceSatoshis() {
      const el = $("buy-price");
      return el ? Number(el.dataset.price || 0) : 0;
    }
    function feeBps() {
      const el = $("buy-fee");
      return el ? Number(el.dataset.feeBps || 0) : 0;
    }
    function showFee() {
      const el = $("buy-fee");
      if (!el) return;
      const fee = Math.floor(priceSatoshis() * feeBps() / 1e4);
      el.textContent = `${fee.toLocaleString()} sat`;
    }
    async function buy() {
      clearError();
      const id = listingId();
      if (!id) return;
      $("buy-submit").disabled = true;
      try {
        await window.MarketSign.withMnemonic(async (mnemonic) => {
          const keys = window.NcListing.deriveListingKeys(mnemonic);
          status("\u5E02\u5834\u306B\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u4F5C\u3089\u305B\u3066\u3044\u307E\u3059\u2026");
          const draft = await window.MarketSign.api("/market/api/v1/purchases/draft", {
            listing_id: id,
            receive_script: keys.payoutScriptHex
          });
          status("\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u7AEF\u672B\u3067\u691C\u8A3C\u3057\u3066\u3044\u307E\u3059\u2026");
          window.NcListing.verifyPurchaseDraft(draft, {
            receiveScriptHex: keys.payoutScriptHex,
            priceSatoshis: priceSatoshis(),
            feeBps: feeBps(),
            maxMinerFeeSatoshis: MAX_MINER_FEE_SATOSHIS
          });
          status("\u3053\u306E\u7AEF\u672B\u3067\u7F72\u540D\u3057\u3066\u3044\u307E\u3059\u2026");
          const signed = await window.NcSend.signTemplate(draft.template, mnemonic);
          status("\u653E\u9001\u3057\u3066\u3044\u307E\u3059\u2026");
          const result = await window.MarketSign.api("/market/api/v1/purchases/submit", {
            template_id: draft.template_id,
            signed_transaction_hex: signed
          });
          status("");
          $("buy-main").classList.add("hidden");
          $("buy-done").classList.remove("hidden");
          $("buy-txid").textContent = result.txid || "";
        });
      } catch (error) {
        status("");
        if (error && error.message === "cancelled") return;
        if (error && error.message === "auth_required") {
          $("buy-main").classList.add("hidden");
          $("buy-signin").classList.remove("hidden");
          return;
        }
        fail(error && error.message ? error.message : "\u8CFC\u5165\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
      } finally {
        const button = $("buy-submit");
        if (button) button.disabled = false;
      }
    }
    function start() {
      if (!$("buy-price")) return;
      showFee();
      const button = $("buy-submit");
      if (button) button.addEventListener("click", buy);
    }
    document.addEventListener("DOMContentLoaded", start);
  })();
})();
