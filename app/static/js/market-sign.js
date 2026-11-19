(() => {
  // src/js/market-sign.js
  (function() {
    const ids = {
      modal: "market-unlock",
      password: "market-unlock-password",
      confirm: "market-unlock-confirm",
      cancel: "market-unlock-cancel",
      error: "market-unlock-error"
    };
    function $(id) {
      return document.getElementById(id);
    }
    async function withMnemonic(run) {
      if (!window.NcWallet) throw new Error("market: NcWallet \u304C\u8AAD\u307F\u8FBC\u307E\u308C\u3066\u3044\u306A\u3044");
      const modal = $(ids.modal);
      if (!modal) throw new Error("market: \u89E3\u9320\u30C0\u30A4\u30A2\u30ED\u30B0\u304C\u7121\u3044");
      const mnemonic = await askPassword(modal);
      try {
        return await run(mnemonic);
      } finally {
        close(modal);
      }
    }
    function open(modal) {
      modal.classList.remove("hidden");
      const field = $(ids.password);
      if (field) {
        field.value = "";
        field.focus();
      }
      hideError();
    }
    function close(modal) {
      modal.classList.add("hidden");
      const field = $(ids.password);
      if (field) field.value = "";
    }
    function showError(message) {
      const el = $(ids.error);
      if (!el) return;
      el.textContent = message;
      el.classList.remove("hidden");
    }
    function hideError() {
      const el = $(ids.error);
      if (el) el.classList.add("hidden");
    }
    function askPassword(modal) {
      return new Promise((resolve, reject) => {
        const confirm = $(ids.confirm);
        const cancel = $(ids.cancel);
        const cleanup = () => {
          confirm.removeEventListener("click", onConfirm);
          cancel.removeEventListener("click", onCancel);
          modal.removeEventListener("keydown", onKey);
        };
        const onConfirm = async () => {
          const password = ($(ids.password) || {}).value || "";
          if (!password) {
            showError("\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044");
            return;
          }
          confirm.disabled = true;
          try {
            const mnemonic = await window.NcWallet.loadMnemonic(void 0, password);
            cleanup();
            resolve(mnemonic);
          } catch (e) {
            showError(e && e.message === "no-local-key" ? "\u3053\u306E\u7AEF\u672B\u306B\u9375\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u30A6\u30A9\u30EC\u30C3\u30C8\u3067\u5FA9\u5143\u3057\u3066\u304F\u3060\u3055\u3044" : "\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u9055\u3044\u307E\u3059");
          } finally {
            confirm.disabled = false;
          }
        };
        const onCancel = () => {
          cleanup();
          close(modal);
          reject(new Error("cancelled"));
        };
        const onKey = (event) => {
          if (event.key === "Escape") onCancel();
          if (event.key === "Enter") onConfirm();
        };
        confirm.addEventListener("click", onConfirm);
        cancel.addEventListener("click", onCancel);
        modal.addEventListener("keydown", onKey);
        open(modal);
      });
    }
    function unwrap(body) {
      if (body && body.status === "success") return body.data;
      const error = body && body.error || {};
      throw new Error(error.message || error.code || "unknown error");
    }
    async function api(path, payload) {
      if (!window.ncAuth) throw new Error("market: ncAuth \u304C\u8AAD\u307F\u8FBC\u307E\u308C\u3066\u3044\u306A\u3044");
      const body = payload === void 0 ? await window.ncAuth.apiGet(path) : await window.ncAuth.apiPost(path, payload);
      return unwrap(body);
    }
    window.MarketSign = { withMnemonic, api, unwrap };
  })();
})();
