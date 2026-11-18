(() => {
  // ../vendor/wallet-ui/app/packages/wallet-kit/js/gaudi.js
  (function() {
    "use strict";
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var growObserver = null;
    function growObserverFor() {
      if (growObserver) return growObserver;
      growObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-grown");
          growObserver.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
      return growObserver;
    }
    function growOnScroll() {
      var targets = document.querySelectorAll(".gaudi-grow");
      if (!targets.length) return;
      if (reduced || !("IntersectionObserver" in window)) {
        for (var i = 0; i < targets.length; i++) targets[i].classList.add("is-grown");
        return;
      }
      var io = growObserverFor();
      Array.prototype.forEach.call(targets, function(el, i2) {
        if (el.classList.contains("is-grown")) return;
        if (!el.style.getPropertyValue("--g-i")) el.style.setProperty("--g-i", i2 % 6);
        io.observe(el);
      });
    }
    function branchMenu() {
      if (reduced) return;
      var lists = document.querySelectorAll("#sidebar-main-menu, .main-menu");
      if (!lists.length) return;
      Array.prototype.forEach.call(lists, function(list) {
        Array.prototype.forEach.call(list.children, function(li, i) {
          li.style.setProperty("--g-i", i);
        });
      });
      function play() {
        Array.prototype.forEach.call(lists, function(list) {
          list.classList.remove("gaudi-branch");
          void list.offsetWidth;
          list.classList.add("gaudi-branch");
        });
      }
      play();
      var root = document.documentElement;
      var wasOpen = isMenuOpen();
      new MutationObserver(function() {
        var open = isMenuOpen();
        if (open && !wasOpen) play();
        wasOpen = open;
      }).observe(root, { attributes: true, attributeFilter: ["data-toggled"] });
      function isMenuOpen() {
        var v = root.getAttribute("data-toggled") || "";
        return v !== "" && !/clos(e|ed)$/.test(v);
      }
    }
    function liquidModals() {
      if (reduced) return;
      var overlays = document.querySelectorAll(".hs-overlay");
      if (!overlays.length) return;
      var mo = new MutationObserver(function(records) {
        records.forEach(function(r) {
          var el = r.target;
          if (el.classList.contains("hidden")) return;
          var panel = el.querySelector(".ti-modal-content, .gaudi-modal") || el.firstElementChild;
          if (!panel || panel.classList.contains("gaudi-liquid")) return;
          panel.classList.add("gaudi-liquid");
          panel.addEventListener("animationend", function handler() {
            panel.classList.remove("gaudi-liquid");
            panel.removeEventListener("animationend", handler);
          });
        });
      });
      Array.prototype.forEach.call(overlays, function(o) {
        mo.observe(o, { attributes: true, attributeFilter: ["class"] });
      });
    }
    function pulseBalance() {
      if (reduced) return;
      var el = document.getElementById("id_bsv_balance");
      if (!el) return;
      var now = el.getAttribute("data-bsv");
      if (!now) return;
      var KEY = "gaudi:last-bsv";
      var prev;
      try {
        prev = sessionStorage.getItem(KEY);
      } catch (e) {
        return;
      }
      if (prev !== null && prev !== now) {
        el.classList.add("gaudi-pulse");
        el.addEventListener("animationend", function() {
          el.classList.remove("gaudi-pulse");
        }, { once: true });
      }
      try {
        sessionStorage.setItem(KEY, now);
      } catch (e) {
      }
    }
    function init() {
      growOnScroll();
      branchMenu();
      liquidModals();
      pulseBalance();
      document.addEventListener("htmx:load", function() {
        growOnScroll();
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
})();
