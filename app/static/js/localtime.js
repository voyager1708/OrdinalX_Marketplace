(() => {
  // ../vendor/wallet-ui/app/packages/wallet-kit/js/localtime.js
  (function() {
    "use strict";
    function localize(root) {
      var nodes = (root || document).querySelectorAll("time[datetime]");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.dataset.localized === "1") continue;
        var parsed = new Date(el.getAttribute("datetime"));
        if (isNaN(parsed.getTime())) continue;
        try {
          el.textContent = parsed.toLocaleString();
        } catch (e) {
          continue;
        }
        el.dataset.localized = "1";
      }
    }
    window.localTime = { apply: localize };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function() {
        localize();
      });
    } else {
      localize();
    }
    document.addEventListener("htmx:afterSwap", function() {
      localize();
    });
  })();
})();
