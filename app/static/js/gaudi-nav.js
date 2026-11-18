(() => {
  // ../vendor/wallet-ui/app/packages/wallet-kit/js/gaudi-nav.js
  (function() {
    "use strict";
    var SEED = 12;
    var CEIL = 90;
    var TAU = 700;
    var TICK = 100;
    var BAR_DELAY = 150;
    var root = null;
    var bar = null;
    var timer = null;
    var delayTimer = null;
    var startedAt = 0;
    var pending = null;
    function ensureEls() {
      if (root) {
        return true;
      }
      root = document.querySelector("[data-gaudi-navprogress]");
      bar = root && root.querySelector(".gaudi-navprogress__bar");
      return !!bar;
    }
    function setValue(pct) {
      bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      if (delayTimer) {
        window.clearTimeout(delayTimer);
        delayTimer = null;
      }
    }
    function reset() {
      stop();
      if (pending) {
        pending.classList.remove("is-pending");
        pending.removeAttribute("aria-busy");
        pending = null;
      }
      if (root) {
        root.classList.remove("is-running");
        root.hidden = true;
        if (bar) {
          setValue(0);
        }
      }
    }
    function start(tab) {
      if (!ensureEls()) {
        return;
      }
      reset();
      pending = tab;
      tab.classList.add("is-pending");
      tab.setAttribute("aria-busy", "true");
      startedAt = Date.now();
      delayTimer = window.setTimeout(function() {
        delayTimer = null;
        root.hidden = false;
        setValue(SEED);
        window.requestAnimationFrame(function() {
          if (pending) {
            root.classList.add("is-running");
          }
        });
      }, BAR_DELAY);
      timer = window.setInterval(function() {
        var elapsed = Date.now() - startedAt;
        setValue(SEED + (CEIL - SEED) * (1 - Math.exp(-elapsed / TAU)));
      }, TICK);
    }
    function isPlainNavigation(event) {
      return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    }
    document.addEventListener("click", function(event) {
      var tab = event.target.closest && event.target.closest(".s006-tabbar__item");
      if (!tab || !isPlainNavigation(event)) {
        return;
      }
      if (tab.target === "_blank" || tab.hasAttribute("download")) {
        return;
      }
      start(tab);
    });
    window.addEventListener("pageshow", function(event) {
      if (event.persisted) {
        reset();
      }
    });
    window.addEventListener("pagehide", stop);
  })();
})();
