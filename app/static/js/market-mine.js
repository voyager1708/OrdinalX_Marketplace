(() => {
  // src/js/market-mine.js
  (function() {
    const OPEN = ["pending", "active"];
    const LABELS = {
      draft: "\u4E0B\u66F8\u304D",
      pending: "\u653E\u9001\u6E08\u307F\uFF08\u78BA\u8A8D\u5F85\u3061\uFF09",
      active: "\u51FA\u54C1\u4E2D",
      sold: "\u58F2\u308C\u307E\u3057\u305F",
      cancelled: "\u53D6\u308A\u4E0B\u3052\u6E08\u307F",
      invalid: "\u7121\u52B9"
    };
    function $(id) {
      return document.getElementById(id);
    }
    function status(message) {
      const el = $("mine-status");
      if (el) el.textContent = message || "";
    }
    function fail(message) {
      const el = $("mine-error");
      if (!el) return;
      el.textContent = message;
      el.classList.remove("hidden");
    }
    function clearError() {
      const el = $("mine-error");
      if (el) el.classList.add("hidden");
    }
    function escapeHtml(value) {
      const div = document.createElement("div");
      div.textContent = String(value == null ? "" : value);
      return div.innerHTML;
    }
    function render(listings) {
      const host = $("mine-list");
      if (!listings.length) {
        host.innerHTML = '<div class="s006-empty"><div class="s006-empty__icon"><i class="bi bi-shop" aria-hidden="true"></i></div><p class="s006-empty__title">\u307E\u3060\u51FA\u54C1\u3057\u3066\u3044\u307E\u305B\u3093</p></div>';
        return;
      }
      const list = document.createElement("ul");
      list.className = "s006-txlist";
      list.setAttribute("role", "list");
      listings.forEach((listing) => {
        const item = document.createElement("li");
        item.className = "s006-tx";
        item.innerHTML = `<div class="s006-tx__icon"><i class="bi bi-image" aria-hidden="true"></i></div><div class="s006-tx__body"><p class="s006-tx__title">${escapeHtml(listing.work_title || listing.nft_origin)}</p><p class="s006-meta">${escapeHtml(LABELS[listing.status] || listing.status)}</p></div><p class="s006-tx__amount s006-num">${Number(listing.price_satoshis).toLocaleString()} <span class="s006-sub">sat</span></p>`;
        if (OPEN.indexOf(listing.status) !== -1) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "s006-btn ml-3";
          button.textContent = "\u53D6\u308A\u4E0B\u3052\u308B";
          button.addEventListener("click", () => cancel(listing, button));
          item.appendChild(button);
        }
        list.appendChild(item);
      });
      host.innerHTML = "";
      host.appendChild(list);
    }
    async function cancel(listing, button) {
      clearError();
      button.disabled = true;
      try {
        await window.MarketSign.withMnemonic(async (mnemonic) => {
          const keys = window.NcListing.deriveListingKeys(mnemonic);
          status("\u53D6\u308A\u4E0B\u3052\u306E\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u4F5C\u3063\u3066\u3044\u307E\u3059\u2026");
          const draft = await window.MarketSign.api(
            `/market/api/v1/listings/${listing.id}/cancel/draft`,
            { receive_script: keys.payoutScriptHex }
          );
          status("\u3053\u306E\u7AEF\u672B\u3067\u7F72\u540D\u3057\u3066\u3044\u307E\u3059\u2026");
          const signed = await window.NcListing.signCancel(draft, mnemonic, {
            listedOutpoint: listing.listed_outpoint,
            receiveScriptHex: keys.payoutScriptHex
          });
          status("\u653E\u9001\u3057\u3066\u3044\u307E\u3059\u2026");
          await window.MarketSign.api(
            `/market/api/v1/listings/${listing.id}/cancel/submit`,
            { template_id: draft.template_id, ...signed }
          );
          status("\u53D6\u308A\u4E0B\u3052\u307E\u3057\u305F\u3002\u4F5C\u54C1\u306F\u30A6\u30A9\u30EC\u30C3\u30C8\u306B\u623B\u308A\u307E\u3059\u3002");
          await load();
        });
      } catch (error) {
        status("");
        if (error && error.message === "cancelled") return;
        fail(error && error.message ? error.message : "\u53D6\u308A\u4E0B\u3052\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
      } finally {
        button.disabled = false;
      }
    }
    async function load() {
      const data = await window.MarketSign.api("/market/api/v1/me/listings");
      render(data.listings || []);
    }
    async function start() {
      if (!$("mine-list")) return;
      try {
        await load();
      } catch (error) {
        if (error && error.message === "auth_required") {
          $("mine-list").classList.add("hidden");
          $("mine-signin").classList.remove("hidden");
          return;
        }
        $("mine-list").innerHTML = "";
        fail("\u81EA\u5206\u306E\u51FA\u54C1\u3092\u8AAD\u3081\u307E\u305B\u3093\u3067\u3057\u305F");
      }
    }
    document.addEventListener("DOMContentLoaded", start);
  })();
})();
