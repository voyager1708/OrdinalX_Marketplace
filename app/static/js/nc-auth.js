(() => {
  // ../vendor/wallet-ui/app/packages/wallet-kit/js/nc-auth.js
  var accessToken = null;
  var refreshInFlight = null;
  var TOKEN_ENDPOINT = "/auth/bff/token";
  async function fetchAccessToken(force) {
    const url = force ? `${TOKEN_ENDPOINT}?force=1` : TOKEN_ENDPOINT;
    const res = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store"
    });
    if (!res.ok) {
      accessToken = null;
      let body2 = null;
      try {
        body2 = await res.json();
      } catch (e) {
        body2 = null;
      }
      const err = new Error("auth_required");
      err.status = res.status;
      err.code = window.BackendStatus ? window.BackendStatus.codeFromBody(body2) : null;
      throw err;
    }
    const body = await res.json();
    accessToken = body.access_token;
    return accessToken;
  }
  async function ensureAccessToken(force = false) {
    if (accessToken && !force) return accessToken;
    if (!refreshInFlight) {
      refreshInFlight = fetchAccessToken(force).finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  }
  function clearAccessToken() {
    accessToken = null;
  }
  function announceFailure(err) {
    clearAccessToken();
    if (!window.BackendStatus) {
      const ds = document.body && document.body.dataset || {};
      window.location.assign(ds.kitSignin || "/view/auth/signin");
      return;
    }
    window.BackendStatus.handle(err && err.status, err && err.code ? { code: err.code } : null);
  }
  async function apiFetch(path, options = {}) {
    let token;
    try {
      token = await ensureAccessToken();
    } catch (e) {
      announceFailure(e);
      throw e;
    }
    const doFetch = (bearer) => fetch(path, {
      ...options,
      credentials: "omit",
      // JWT only — cookies play no role on NC APIs
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...options.headers || {},
        Authorization: `Bearer ${bearer}`
      }
    });
    let response = await doFetch(token);
    if (response.status === 401) {
      try {
        token = await ensureAccessToken(true);
      } catch (e) {
        announceFailure(e);
        throw e;
      }
      response = await doFetch(token);
      if (response.status === 401) {
        announceFailure({ status: 401, code: "SESSION_EXPIRED" });
        throw new Error("auth_required");
      }
    }
    if (response.status === 503 && window.BackendStatus) {
      let body = null;
      try {
        body = await response.clone().json();
      } catch (e) {
        body = null;
      }
      window.BackendStatus.handle(503, body);
    }
    return response;
  }
  var GATEWAY_CODES = {
    502: "BAD_GATEWAY",
    503: "BACKEND_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT"
  };
  async function readJson(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      const code = GATEWAY_CODES[res.status] || `HTTP_${res.status}`;
      const err = new Error(`${code}: server returned a non-JSON body (status ${res.status})`);
      err.status = res.status;
      err.code = code;
      err.bodySnippet = text.slice(0, 200);
      throw err;
    }
  }
  async function apiGet(path) {
    const res = await apiFetch(path);
    return readJson(res);
  }
  async function apiPost(path, body) {
    const res = await apiFetch(path, {
      method: "POST",
      body: JSON.stringify(body || {})
    });
    return readJson(res);
  }
  window.ncAuth = { ensureAccessToken, clearAccessToken, apiFetch, apiGet, apiPost };
})();
