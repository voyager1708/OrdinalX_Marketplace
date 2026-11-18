"use strict";
(() => {
  // ../vendor/wallet-ui/app/packages/wallet-kit/js/backend-status.js
  var SESSION_EXPIRED = "SESSION_EXPIRED";
  var BACKEND_UNAVAILABLE = "BACKEND_UNAVAILABLE";
  function kitPath(key, fallback) {
    const ds = typeof document !== "undefined" && document.body && document.body.dataset || {};
    return ds[key] || fallback;
  }
  var SIGNIN_PATH = kitPath("kitSignin", "/view/auth/signin");
  var LOGOUT_ENDPOINT = kitPath("kitLogout", "/auth/bff/logout");
  var currentDialog = null;
  function csrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  }
  function styleButton(button, primary) {
    button.style.cssText = [
      "appearance:none",
      "border:0",
      "cursor:pointer",
      "font:inherit",
      "font-size:15px",
      "font-weight:600",
      "padding:10px 24px",
      "border-radius:9999px",
      "min-width:120px",
      primary ? "background:#2563eb" : "background:#e5e7eb",
      primary ? "color:#ffffff" : "color:#374151"
    ].join(";");
  }
  function openDialog({ title, message, buttons, dismissible }) {
    if (currentDialog) return currentDialog;
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("data-testid", "backend-status-dialog");
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483000",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "padding:16px",
      "background:rgba(17,24,39,0.6)",
      "font-family:system-ui,-apple-system,sans-serif"
    ].join(";");
    const panel = document.createElement("div");
    panel.style.cssText = [
      "background:#ffffff",
      "color:#111827",
      "border-radius:14px",
      "box-shadow:0 20px 40px rgba(0,0,0,0.25)",
      "max-width:380px",
      "width:100%",
      "padding:28px 24px",
      "text-align:center"
    ].join(";");
    const heading = document.createElement("h2");
    heading.textContent = title;
    heading.style.cssText = "margin:0 0 8px;font-size:18px;font-weight:600;";
    const body = document.createElement("p");
    body.textContent = message;
    body.setAttribute("role", "status");
    body.style.cssText = "margin:0 0 22px;font-size:14px;line-height:1.7;color:#4b5563;";
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:10px;justify-content:center;flex-wrap:wrap;";
    const close = () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener("keydown", onKeydown);
      currentDialog = null;
    };
    function onKeydown(event) {
      if (dismissible && event.key === "Escape") close();
    }
    buttons.forEach((spec, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = spec.label;
      styleButton(button, Boolean(spec.primary));
      button.addEventListener("click", () => {
        if (spec.keepOpen !== true) close();
        if (typeof spec.onClick === "function") spec.onClick();
      });
      actions.appendChild(button);
      if (index === 0) setTimeout(() => button.focus(), 0);
    });
    panel.appendChild(heading);
    panel.appendChild(body);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.addEventListener("keydown", onKeydown);
    (document.body || document.documentElement).appendChild(overlay);
    currentDialog = { close };
    return currentDialog;
  }
  async function signOut() {
    try {
      await fetch(LOGOUT_ENDPOINT, {
        method: "POST",
        credentials: "same-origin",
        headers: { "X-CSRFToken": csrfToken(), "X-Requested-With": "XMLHttpRequest" }
      });
    } catch (e) {
      console.warn("backend-status: logout call failed", e);
    }
    window.location.assign(SIGNIN_PATH);
  }
  function showSessionExpired() {
    return openDialog({
      title: "\u30BB\u30C3\u30B7\u30E7\u30F3\u304C\u5207\u308C\u307E\u3057\u305F",
      message: "\u30BB\u30C3\u30B7\u30E7\u30F3\u304C\u5207\u308C\u307E\u3057\u305F\u3002\u518D\u5EA6\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      dismissible: false,
      buttons: [{ label: "OK", primary: true, keepOpen: true, onClick: signOut }]
    });
  }
  function showBackendUnavailable() {
    return openDialog({
      title: "\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093",
      message: "\u30B5\u30FC\u30D0\u30FC\u304C\u5FDC\u7B54\u3057\u307E\u305B\u3093\u3002\u30E1\u30F3\u30C6\u30CA\u30F3\u30B9\u307E\u305F\u306F\u4E00\u6642\u7684\u306A\u969C\u5BB3\u306E\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      dismissible: true,
      // ログイン画面へは送らない。ログインも同じ BE を叩くため意味がない。
      buttons: [
        { label: "\u518D\u8A66\u884C", primary: true, keepOpen: true, onClick: () => window.location.reload() },
        { label: "\u9589\u3058\u308B", primary: false }
      ]
    });
  }
  function codeFromBody(body) {
    if (!body) return null;
    const error = body.error;
    if (error && typeof error === "object" && typeof error.code === "string") return error.code;
    if (typeof body.code === "string") return body.code;
    return null;
  }
  function handle(status, body) {
    const code = codeFromBody(body);
    if (code === SESSION_EXPIRED || status === 401 && !code) {
      showSessionExpired();
      return true;
    }
    if (code === BACKEND_UNAVAILABLE || status === 503) {
      showBackendUnavailable();
      return true;
    }
    return false;
  }
  async function handleResponse(response) {
    if (!response || response.ok) return false;
    let body = null;
    try {
      body = await response.clone().json();
    } catch (e) {
      body = null;
    }
    return handle(response.status, body);
  }
  function handleXhr(xhr) {
    if (!xhr || xhr.status >= 200 && xhr.status < 300) return false;
    let body = null;
    try {
      body = JSON.parse(xhr.responseText);
    } catch (e) {
      body = null;
    }
    return handle(xhr.status, body);
  }
  function onHtmxResponseError(event) {
    const xhr = event.detail && event.detail.xhr;
    if (xhr) handleXhr(xhr);
  }
  function looksLikeFullDocument(text) {
    if (!text) return false;
    const head = text.slice(0, 512).replace(/^\uFEFF/, "").trimStart();
    if (/^<!DOCTYPE\s+html/i.test(head)) return true;
    return /<title[\s>]/i.test(text);
  }
  function onHtmxBeforeSwap(event) {
    const detail = event.detail;
    if (!detail || !detail.shouldSwap) return;
    if (!looksLikeFullDocument(detail.serverResponse)) return;
    console.warn(
      "[backend-status] refusing to swap a full document into",
      detail.target && detail.target.id,
      "\u2014 treating it as a session problem"
    );
    detail.shouldSwap = false;
    detail.isError = true;
    showSessionExpired();
  }
  if (typeof document !== "undefined") {
    document.addEventListener("htmx:responseError", onHtmxResponseError);
    document.addEventListener("htmx:beforeSwap", onHtmxBeforeSwap);
  }
  window.BackendStatus = {
    SESSION_EXPIRED,
    BACKEND_UNAVAILABLE,
    signOut,
    showSessionExpired,
    showBackendUnavailable,
    codeFromBody,
    handle,
    handleResponse,
    handleXhr,
    // テスト用（Jest からイベントハンドラを直接叩けるように）
    _looksLikeFullDocument: looksLikeFullDocument
  };
})();
