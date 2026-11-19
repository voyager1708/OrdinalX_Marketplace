(() => {
  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // node_modules/@noble/hashes/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
  }
  var atitle = (title) => title ? `"${title}" ` : "";
  function anumber(n, title = "") {
    if (typeof n !== "number")
      throw new TypeError(atitle(title) + "expected number, got " + typeof n);
    if (!Number.isSafeInteger(n) || n < 0)
      throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
    return n;
  }
  function abytes(value, length, title = "") {
    if (isBytes(value) && (length === void 0 || value.length === length))
      return value;
    if (length !== void 0)
      anumber(length, "length");
    const bytes2 = isBytes(value);
    const ofLen = length !== void 0 ? ` of length ${length}` : "";
    const got = bytes2 ? `length=${value.length}` : `type=${typeof value}`;
    const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes2)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new TypeError("expected hash wrapped by utils.createHasher");
    anumber(h.outputLen);
    anumber(h.blockLen);
    if (h.outputLen < 1 || h.blockLen < 1)
      throw new Error("hash blockLen / outputLen must be >= 1");
  }
  var aobject = (value, label) => {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
  };
  var aopts = (value, label) => {
    aobject(value, label);
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null)
      throw new TypeError(`"${label}" expected plain object`);
    if (Object.hasOwn(value, "__proto__"))
      throw new TypeError(`"${label}.__proto__" is not allowed`);
  };
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("hash was destroyed");
    if (checkFinished && instance.finished)
      throw new Error("digest() was already called");
  }
  function aoutput(out, instance) {
    abytes(out, void 0, "output");
    const min = instance.outputLen;
    if (!(out.length >= min)) {
      throw new RangeError('"output" expected length >= ' + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  function rotl(word, shift) {
    return word << shift | word >>> 32 - shift >>> 0;
  }
  var hasHexBuiltin = /* @__PURE__ */ (() => (
    // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
  ))();
  var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes2) {
    abytes(bytes2);
    if (hasHexBuiltin)
      return bytes2.toHex();
    let hex = "";
    for (let i = 0; i < bytes2.length; i++) {
      hex += hexes[bytes2[i]];
    }
    return hex;
  }
  function asciiToBase16(ch) {
    return ch >= 48 && ch <= 57 ? ch - 48 : ch >= 65 && ch <= 70 ? ch - (65 - 10) : ch >= 97 && ch <= 102 ? ch - (97 - 10) : void 0;
  }
  function hexToBytes(hex) {
    if (typeof hex !== "string")
      throw new TypeError("hex string expected, got " + typeof hex);
    if (hasHexBuiltin) {
      try {
        return Uint8Array.fromHex(hex);
      } catch (error) {
        if (error instanceof SyntaxError)
          throw new RangeError(error.message);
        throw error;
      }
    }
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new RangeError("hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex.charCodeAt(hi));
      const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex[hi] + hex[hi + 1];
        throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new TypeError("string expected");
    const encoded = new TextEncoder().encode(str);
    try {
      return new Uint8Array(encoded);
    } finally {
      clean(encoded);
    }
  }
  function kdfInputToBytes(data, errorTitle = "") {
    if (typeof data === "string")
      return utf8ToBytes(data);
    return abytes(data, void 0, errorTitle);
  }
  function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  function checkOpts(defaults, opts, title = "opts") {
    aopts(defaults, "defaults");
    if (opts !== void 0)
      aopts(opts, title);
    const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
    return merged;
  }
  function createHasher(hashCons, info = {}) {
    if (typeof hashCons !== "function")
      throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
    info = checkOpts({}, info, "info");
    const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
    const tmp = hashCons(void 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.canXOF = tmp.canXOF;
    hashC.create = (opts) => hashCons(opts);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
  }
  function randomBytes(bytesLength = 32) {
    anumber(bytesLength, "bytesLength");
    const cr = typeof globalThis === "object" ? globalThis.crypto : null;
    if (typeof cr?.getRandomValues !== "function")
      throw new Error("crypto.getRandomValues must be defined");
    if (bytesLength > 65536)
      throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
    return cr.getRandomValues(new Uint8Array(bytesLength));
  }
  var oidNist = (suffix) => ({
    // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
    // Larger suffix values would need base-128 OID encoding and a different length byte.
    oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
  });

  // node_modules/@noble/hashes/hmac.js
  var _HMAC = class {
    constructor(hash, key) {
      __publicField(this, "oHash");
      __publicField(this, "iHash");
      __publicField(this, "blockLen");
      __publicField(this, "outputLen");
      __publicField(this, "canXOF", false);
      __publicField(this, "finished", false);
      __publicField(this, "destroyed", false);
      ahash(hash);
      abytes(key, void 0, "key");
      this.iHash = hash.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("expected Hash instance");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash.create();
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      clean(pad);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const buf = out.subarray(0, this.outputLen);
      this.iHash.digestInto(buf);
      this.oHash.update(buf);
      this.oHash.digestInto(buf);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.canXOF = canXOF;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  var hmac = /* @__PURE__ */ (() => {
    const hmac_ = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
    hmac_.create = (hash, key) => new _HMAC(hash, key);
    return hmac_;
  })();

  // node_modules/@noble/hashes/pbkdf2.js
  function pbkdf2Init(hash, _password, _salt, _opts) {
    ahash(hash);
    const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
    const { c, dkLen, asyncTick } = opts;
    anumber(c, "c");
    anumber(dkLen, "dkLen");
    anumber(asyncTick, "asyncTick");
    if (c < 1)
      throw new Error('"c" (iterations) must be >= 1');
    if (dkLen < 1)
      throw new Error('"dkLen" must be >= 1');
    if (dkLen > (2 ** 32 - 1) * hash.outputLen)
      throw new Error("derived key too long");
    const p = kdfInputToBytes(_password, "password");
    try {
      const s2 = kdfInputToBytes(_salt, "salt");
      try {
        const DK = new Uint8Array(dkLen);
        const { iHash, oHash, outputLen } = hmac.create(hash, p);
        const u = new Uint8Array(outputLen);
        const eng = pbkdf2Engine(iHash, oHash, s2, u);
        return { c, dkLen, asyncTick, DK, outputLen, eng };
      } finally {
        if (typeof _salt === "string")
          clean(s2);
      }
    } finally {
      if (typeof _password === "string")
        clean(p);
    }
  }
  function pbkdf2Engine(iHash, oHash, salt, u) {
    const counter = new Uint8Array(4);
    const view = createView(counter);
    const salted = iHash._cloneInto().update(salt);
    const work = oHash._cloneInto();
    const iClone = iHash._cloneInto;
    const oClone = oHash._cloneInto;
    return {
      u1: (ti, Ti) => {
        view.setInt32(0, ti, false);
        salted._cloneInto(work).update(counter).digestInto(u);
        oHash._cloneInto(work).update(u).digestInto(u);
        Ti.set(u.subarray(0, Ti.length));
      },
      // Whole `F` inner loop for the sync variant: one optimized function owns the hot loop.
      rounds: (c, Ti) => {
        for (let ui = 1; ui < c; ui++) {
          iClone.call(iHash, work).update(u).digestInto(u);
          oClone.call(oHash, work).update(u).digestInto(u);
          for (let i = 0; i < Ti.length; i++)
            Ti[i] ^= u[i];
        }
      },
      output: (DK) => {
        iHash.destroy();
        oHash.destroy();
        salted.destroy();
        work.destroy();
        clean(u);
        return DK;
      }
    };
  }
  function pbkdf2(hash, password, salt, opts) {
    const { c, dkLen, DK, outputLen, eng } = pbkdf2Init(hash, password, salt, opts);
    for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += outputLen) {
      const Ti = DK.subarray(pos, pos + outputLen);
      eng.u1(ti, Ti);
      eng.rounds(c, Ti);
    }
    return eng.output(DK);
  }

  // node_modules/@noble/hashes/_u64.js
  var U32_MASK64 = /* @__PURE__ */ (() => BigInt(2 ** 32 - 1))();
  var _32n = /* @__PURE__ */ BigInt(32);
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len = lst.length;
    let Ah = new Uint32Array(len);
    let Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig(lst[i], le);
      [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
  }
  var fromNumH = (n) => n / 2 ** 32 | 0;
  var fromNumL = (n) => n >>> 0;
  function setU64FromNum(view, byteOffset, n, isLE) {
    const h = fromNumH(n);
    const l = fromNumL(n);
    view.setUint32(byteOffset, isLE ? l : h, isLE);
    view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
  }
  var shrSH = (h, _l, s2) => h >>> s2;
  var shrSL = (h, l, s2) => h << 32 - s2 | l >>> s2;
  var rotrSH = (h, l, s2) => h >>> s2 | l << 32 - s2;
  var rotrSL = (h, l, s2) => h << 32 - s2 | l >>> s2;
  var rotrBH = (h, l, s2) => h << 64 - s2 | l >>> s2 - 32;
  var rotrBL = (h, l, s2) => h >>> s2 - 32 | l << 64 - s2;
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
  var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
  var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
  var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
  var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
  var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

  // node_modules/@noble/hashes/_md.js
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD = class {
    constructor(blockLen, outputLen, padOffset, isLE) {
      __publicField(this, "blockLen");
      __publicField(this, "outputLen");
      __publicField(this, "canXOF", false);
      __publicField(this, "padOffset");
      __publicField(this, "isLE");
      // For partial updates less than block size
      __publicField(this, "buffer");
      __publicField(this, "view");
      __publicField(this, "finished", false);
      __publicField(this, "length", 0);
      __publicField(this, "pos", 0);
      __publicField(this, "destroyed", false);
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      let processed = false;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (; blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          processed = true;
          continue;
        }
        buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
          processed = true;
        }
      }
      this.length += data.length;
      if (processed)
        this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      buffer.fill(0, pos);
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        buffer.fill(0);
      }
      setU64FromNum(view, blockLen - 8, this.length * 8, isLE);
      this.process(view, 0);
      this.roundClean();
      const oview = out === buffer ? view : createView(out);
      const len = this.outputLen;
      const outLen = len / 4;
      const state = this.get();
      if (len % 4 || outLen > state.length)
        throw new Error("invalid outputLen");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneIntoMeta(to) {
      const { buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (pos)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    4089235720,
    3144134277,
    2227873595,
    1013904242,
    4271175723,
    2773480762,
    1595750129,
    1359893119,
    2917565137,
    2600822924,
    725511199,
    528734635,
    4215389547,
    1541459225,
    327033209
  ]);

  // node_modules/@noble/hashes/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  var SHA2_32B = class extends HashMD {
    constructor(outputLen, IV) {
      super(64, outputLen, 8, false);
      // We cannot use array here since array allows indexing by variable
      // which means optimizer/compiler cannot use registers.
      // Numeric initializers matter: starting the fields as `undefined` changes
      // V8's field representation and makes sha256 3x slower (measured).
      __publicField(this, "A", 0);
      __publicField(this, "B", 0);
      __publicField(this, "C", 0);
      __publicField(this, "D", 0);
      __publicField(this, "E", 0);
      __publicField(this, "F", 0);
      __publicField(this, "G", 0);
      __publicField(this, "H", 0);
      this.A = IV[0] | 0;
      this.B = IV[1] | 0;
      this.C = IV[2] | 0;
      this.D = IV[3] | 0;
      this.E = IV[4] | 0;
      this.F = IV[5] | 0;
      this.G = IV[6] | 0;
      this.H = IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    _cloneInto(to) {
      (to || (to = new this.constructor())).set(...this.get());
      return this._cloneIntoMeta(to);
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16; i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.destroyed = true;
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  };
  var _SHA256 = class extends SHA2_32B {
    constructor() {
      super(32, SHA256_IV);
    }
  };
  var K512 = /* @__PURE__ */ (() => split([
    "0x428a2f98d728ae22",
    "0x7137449123ef65cd",
    "0xb5c0fbcfec4d3b2f",
    "0xe9b5dba58189dbbc",
    "0x3956c25bf348b538",
    "0x59f111f1b605d019",
    "0x923f82a4af194f9b",
    "0xab1c5ed5da6d8118",
    "0xd807aa98a3030242",
    "0x12835b0145706fbe",
    "0x243185be4ee4b28c",
    "0x550c7dc3d5ffb4e2",
    "0x72be5d74f27b896f",
    "0x80deb1fe3b1696b1",
    "0x9bdc06a725c71235",
    "0xc19bf174cf692694",
    "0xe49b69c19ef14ad2",
    "0xefbe4786384f25e3",
    "0x0fc19dc68b8cd5b5",
    "0x240ca1cc77ac9c65",
    "0x2de92c6f592b0275",
    "0x4a7484aa6ea6e483",
    "0x5cb0a9dcbd41fbd4",
    "0x76f988da831153b5",
    "0x983e5152ee66dfab",
    "0xa831c66d2db43210",
    "0xb00327c898fb213f",
    "0xbf597fc7beef0ee4",
    "0xc6e00bf33da88fc2",
    "0xd5a79147930aa725",
    "0x06ca6351e003826f",
    "0x142929670a0e6e70",
    "0x27b70a8546d22ffc",
    "0x2e1b21385c26c926",
    "0x4d2c6dfc5ac42aed",
    "0x53380d139d95b3df",
    "0x650a73548baf63de",
    "0x766a0abb3c77b2a8",
    "0x81c2c92e47edaee6",
    "0x92722c851482353b",
    "0xa2bfe8a14cf10364",
    "0xa81a664bbc423001",
    "0xc24b8b70d0f89791",
    "0xc76c51a30654be30",
    "0xd192e819d6ef5218",
    "0xd69906245565a910",
    "0xf40e35855771202a",
    "0x106aa07032bbd1b8",
    "0x19a4c116b8d2d0c8",
    "0x1e376c085141ab53",
    "0x2748774cdf8eeb99",
    "0x34b0bcb5e19b48a8",
    "0x391c0cb3c5c95a63",
    "0x4ed8aa4ae3418acb",
    "0x5b9cca4f7763e373",
    "0x682e6ff3d6b2b8a3",
    "0x748f82ee5defb2fc",
    "0x78a5636f43172f60",
    "0x84c87814a1f0ab72",
    "0x8cc702081a6439ec",
    "0x90befffa23631e28",
    "0xa4506cebde82bde9",
    "0xbef9a3f7b2c67915",
    "0xc67178f2e372532b",
    "0xca273eceea26619c",
    "0xd186b8c721c0c207",
    "0xeada7dd6cde0eb1e",
    "0xf57d4f7fee6ed178",
    "0x06f067aa72176fba",
    "0x0a637dc5a2c898a6",
    "0x113f9804bef90dae",
    "0x1b710b35131c471b",
    "0x28db77f523047d84",
    "0x32caab7b40c72493",
    "0x3c9ebe0a15c9bebc",
    "0x431d67c49c100d4c",
    "0x4cc5d4becb3e42b6",
    "0x597f299cfc657e2a",
    "0x5fcb6fab3ad6faec",
    "0x6c44198c4a475817"
  ].map((n) => BigInt(n))))();
  var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
  var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
  var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
  var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
  var SHA2_64B = class extends HashMD {
    constructor(outputLen, IV) {
      super(128, outputLen, 16, false);
      // We cannot use array here since array allows indexing by variable
      // which means optimizer/compiler cannot use registers.
      // h -- high 32 bits, l -- low 32 bits
      // Numeric initializers matter: starting the fields as `undefined` changes
      // V8's field representation and slows hashing down (measured on sha256).
      __publicField(this, "Ah", 0);
      __publicField(this, "Al", 0);
      __publicField(this, "Bh", 0);
      __publicField(this, "Bl", 0);
      __publicField(this, "Ch", 0);
      __publicField(this, "Cl", 0);
      __publicField(this, "Dh", 0);
      __publicField(this, "Dl", 0);
      __publicField(this, "Eh", 0);
      __publicField(this, "El", 0);
      __publicField(this, "Fh", 0);
      __publicField(this, "Fl", 0);
      __publicField(this, "Gh", 0);
      __publicField(this, "Gl", 0);
      __publicField(this, "Hh", 0);
      __publicField(this, "Hl", 0);
      this.Ah = IV[0] | 0;
      this.Al = IV[1] | 0;
      this.Bh = IV[2] | 0;
      this.Bl = IV[3] | 0;
      this.Ch = IV[4] | 0;
      this.Cl = IV[5] | 0;
      this.Dh = IV[6] | 0;
      this.Dl = IV[7] | 0;
      this.Eh = IV[8] | 0;
      this.El = IV[9] | 0;
      this.Fh = IV[10] | 0;
      this.Fl = IV[11] | 0;
      this.Gh = IV[12] | 0;
      this.Gl = IV[13] | 0;
      this.Hh = IV[14] | 0;
      this.Hl = IV[15] | 0;
    }
    // prettier-ignore
    get() {
      const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
      return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
    }
    // prettier-ignore
    set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
      this.Ah = Ah | 0;
      this.Al = Al | 0;
      this.Bh = Bh | 0;
      this.Bl = Bl | 0;
      this.Ch = Ch | 0;
      this.Cl = Cl | 0;
      this.Dh = Dh | 0;
      this.Dl = Dl | 0;
      this.Eh = Eh | 0;
      this.El = El | 0;
      this.Fh = Fh | 0;
      this.Fl = Fl | 0;
      this.Gh = Gh | 0;
      this.Gl = Gl | 0;
      this.Hh = Hh | 0;
      this.Hl = Hl | 0;
    }
    _cloneInto(to) {
      (to || (to = new this.constructor())).set(...this.get());
      return this._cloneIntoMeta(to);
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4) {
        SHA512_W_H[i] = view.getUint32(offset);
        SHA512_W_L[i] = view.getUint32(offset += 4);
      }
      for (let i = 16; i < 80; i++) {
        const W15h = SHA512_W_H[i - 15] | 0;
        const W15l = SHA512_W_L[i - 15] | 0;
        const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
        const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
        const W2h = SHA512_W_H[i - 2] | 0;
        const W2l = SHA512_W_L[i - 2] | 0;
        const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
        const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
        const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
        const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
        SHA512_W_H[i] = SUMh | 0;
        SHA512_W_L[i] = SUMl | 0;
      }
      let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
      for (let i = 0; i < 80; i++) {
        const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
        const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
        const CHIh = Eh & Fh ^ ~Eh & Gh;
        const CHIl = El & Fl ^ ~El & Gl;
        const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
        const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
        const T1l = T1ll | 0;
        const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
        const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
        const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
        const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
        Hh = Gh | 0;
        Hl = Gl | 0;
        Gh = Fh | 0;
        Gl = Fl | 0;
        Fh = Eh | 0;
        Fl = El | 0;
        ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
        Dh = Ch | 0;
        Dl = Cl | 0;
        Ch = Bh | 0;
        Cl = Bl | 0;
        Bh = Ah | 0;
        Bl = Al | 0;
        const All = add3L(T1l, sigma0l, MAJl);
        Ah = add3H(All, T1h, sigma0h, MAJh);
        Al = All | 0;
      }
      ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
      ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
      ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
      ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
      ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
      ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
      ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
      ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
      this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
      clean(SHA512_W_H, SHA512_W_L);
    }
    destroy() {
      this.destroyed = true;
      clean(this.buffer);
      this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  };
  var _SHA512 = class extends SHA2_64B {
    constructor() {
      super(64, SHA512_IV);
    }
  };
  var sha256 = /* @__PURE__ */ createHasher(
    () => new _SHA256(),
    /* @__PURE__ */ oidNist(1)
  );
  var sha512 = /* @__PURE__ */ createHasher(
    () => new _SHA512(),
    /* @__PURE__ */ oidNist(3)
  );

  // node_modules/@scure/bip39/index.js
  var isJapanese = (wordlist2) => wordlist2[0] === "\u3042\u3044\u3053\u304F\u3057\u3093";
  function isWellFormedUnicode(value) {
    for (let i = 0; i < value.length; i++) {
      const current = value.charCodeAt(i);
      if (current >= 55296 && current <= 56319) {
        if (i + 1 >= value.length)
          return false;
        const next = value.charCodeAt(++i);
        if (next < 56320 || next > 57343)
          return false;
      } else if (current >= 56320 && current <= 57343) {
        return false;
      }
    }
    return true;
  }
  function nfkd(str) {
    if (typeof str !== "string")
      throw new TypeError("invalid mnemonic type: " + typeof str);
    if (!isWellFormedUnicode(str))
      throw new TypeError("expected well-formed Unicode string");
    return str.normalize("NFKD");
  }
  function normalize(str) {
    const norm2 = nfkd(str);
    const words = norm2.split(" ");
    if (![12, 15, 18, 21, 24].includes(words.length))
      throw new Error("Invalid mnemonic");
    return { nfkd: norm2, words };
  }
  function aentropy(ent) {
    abytes(ent);
    if (![16, 20, 24, 28, 32].includes(ent.length))
      throw new RangeError("invalid entropy length");
  }
  function generateMnemonic(wordlist2, strength = 128) {
    anumber(strength);
    if (strength % 32 !== 0 || strength > 256)
      throw new RangeError("Invalid entropy");
    return entropyToMnemonic(randomBytes(strength / 8), wordlist2);
  }
  var calcChecksum = (entropy) => {
    const bitsLeft = 8 - entropy.length / 4;
    return sha256(entropy)[0] >> bitsLeft << bitsLeft;
  };
  function awordlist(wordlist2) {
    if (!Array.isArray(wordlist2) || wordlist2.length !== 2048 || typeof wordlist2[0] !== "string")
      throw new TypeError("Wordlist: expected array of 2048 strings");
    wordlist2.forEach((i) => {
      if (typeof i !== "string")
        throw new TypeError("wordlist: non-string element: " + i);
      if (!isWellFormedUnicode(i))
        throw new TypeError("wordlist: expected well-formed Unicode string");
    });
  }
  function encodeWords(entropy, wordlist2) {
    awordlist(wordlist2);
    const bytes2 = new Uint8Array(entropy.length + 1);
    bytes2.set(entropy);
    bytes2[entropy.length] = calcChecksum(entropy);
    const words = [];
    let carry = 0;
    let bits = 0;
    for (const byte of bytes2) {
      carry = carry << 8 | byte;
      bits += 8;
      if (bits >= 11) {
        bits -= 11;
        words.push(wordlist2[carry >>> bits & 2047]);
        carry &= (1 << bits) - 1;
      }
    }
    return words;
  }
  function decodeWords(words, wordlist2) {
    awordlist(wordlist2);
    const entLen = words.length / 3 * 4;
    const bytes2 = new Uint8Array(entLen + 1);
    let carry = 0;
    let bits = 0;
    let pos = 0;
    for (const word of words) {
      const index = wordlist2.indexOf(word);
      if (index === -1)
        throw new Error("Unknown word: " + word);
      carry = carry << 11 | index;
      bits += 11;
      while (bits >= 8) {
        bits -= 8;
        bytes2[pos++] = carry >>> bits & 255;
      }
      carry &= (1 << bits) - 1;
    }
    if (bits > 0)
      bytes2[pos] = carry << 8 - bits;
    const entropy = bytes2.subarray(0, entLen);
    if (bytes2[entLen] !== calcChecksum(entropy))
      throw new Error("Invalid checksum");
    return Uint8Array.from(entropy);
  }
  function mnemonicToEntropy(mnemonic, wordlist2) {
    const { words } = normalize(mnemonic);
    const entropy = decodeWords(words, wordlist2);
    aentropy(entropy);
    return entropy;
  }
  function entropyToMnemonic(entropy, wordlist2) {
    aentropy(entropy);
    const words = encodeWords(entropy, wordlist2);
    return words.join(isJapanese(wordlist2) ? "\u3000" : " ");
  }
  function validateMnemonic(mnemonic, wordlist2) {
    try {
      mnemonicToEntropy(mnemonic, wordlist2);
    } catch (e) {
      return false;
    }
    return true;
  }
  var psalt = (passphrase) => {
    if (typeof passphrase !== "string")
      throw new TypeError("invalid passphrase type: " + typeof passphrase);
    return nfkd("mnemonic" + passphrase);
  };
  function mnemonicToSeedSync(mnemonic, passphrase = "") {
    return pbkdf2(sha512, normalize(mnemonic).nfkd, psalt(passphrase), {
      c: 2048,
      dkLen: 64
    });
  }

  // node_modules/@scure/bip39/wordlists/english.js
  var wordlist = /* @__PURE__ */ Object.freeze(`abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split("\n"));

  // node_modules/@noble/curves/utils.js
  function aarray(item, title, inner = () => {
  }) {
    if (!Array.isArray(item))
      throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
    for (let i = 0; i < item.length; i++)
      inner(item[i], `${title}[${i}]`);
    return item;
  }
  var abytes2 = (value, length, title) => abytes(value, length, title);
  var anumber2 = anumber;
  function astring(value, title = "") {
    if (typeof value !== "string") {
      const prefix2 = title && `"${title}" `;
      throw new TypeError(prefix2 + "expected string, got type=" + typeof value);
    }
    return value;
  }
  function aobject2(value, title = "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
    return value;
  }
  function afunction(value, title) {
    if (typeof value !== "function")
      throw new TypeError(`"${title}" is invalid: expected function, got ${typeof value}`);
    return value;
  }
  var bytesToHex2 = bytesToHex;
  var concatBytes2 = (...arrays) => concatBytes(...arrays);
  var hexToBytes2 = (hex) => hexToBytes(hex);
  var isBytes2 = isBytes;
  var randomBytes2 = (bytesLength) => randomBytes(bytesLength);
  var _0n = /* @__PURE__ */ BigInt(0);
  var _1n = /* @__PURE__ */ BigInt(1);
  var atitle2 = (title) => title ? `"${title}" ` : "";
  function abool(value, title = "") {
    if (typeof value !== "boolean")
      throw new TypeError(atitle2(title) + "expected boolean, got type=" + typeof value);
    return value;
  }
  function abignumber(n) {
    if (typeof n === "bigint") {
      if (!isPosBig(n))
        throw new RangeError("positive bigint expected, got " + n);
    } else
      anumber2(n);
    return n;
  }
  function asafenumber(value, title = "") {
    if (typeof value !== "number") {
      const prefix2 = title && `"${title}" `;
      throw new TypeError(prefix2 + "expected number, got type=" + typeof value);
    }
    if (!Number.isSafeInteger(value)) {
      const prefix2 = title && `"${title}" `;
      throw new RangeError(prefix2 + "expected safe integer, got " + value);
    }
  }
  function numberToHexUnpadded(num) {
    const hex = abignumber(num).toString(16);
    return hex.length & 1 ? "0" + hex : hex;
  }
  function hexToNumber(hex) {
    if (typeof hex !== "string")
      throw new TypeError("hex string expected, got " + typeof hex);
    return hex === "" ? _0n : BigInt("0x" + hex);
  }
  function bytesToNumberBE(bytes2) {
    return hexToNumber(bytesToHex(bytes2));
  }
  function bytesToNumberLE(bytes2) {
    return hexToNumber(bytesToHex(copyBytes(abytes(bytes2)).reverse()));
  }
  function numberToBytesBE(n, len) {
    anumber(len);
    if (len === 0)
      throw new Error("zero output length is invalid");
    n = abignumber(n);
    const expectedLen = len * 2;
    const hex = n.toString(16);
    if (hex.length > expectedLen)
      throw new RangeError("number is too large");
    return hexToBytes(hex.padStart(expectedLen, "0"));
  }
  function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
  }
  function copyBytes(bytes2) {
    return Uint8Array.from(abytes2(bytes2));
  }
  function isPosBig(n) {
    return typeof n === "bigint" && _0n <= n;
  }
  function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
  }
  function aInRange(title, n, min, max) {
    if (!inRange(n, min, max))
      throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
  }
  function bitLen(n) {
    if (n < _0n)
      throw new Error("expected non-negative bigint, got " + n);
    return n === _0n ? 0 : n.toString(2).length;
  }
  var bitMask = (n) => {
    asafenumber(n, "n");
    return (_1n << BigInt(n)) - _1n;
  };
  function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    anumber(hashLen, "hashLen");
    anumber(qByteLen, "qByteLen");
    if (typeof hmacFn !== "function")
      throw new TypeError("hmacFn must be a function");
    const u8n = (len) => new Uint8Array(len);
    const NULL = Uint8Array.of();
    const byte0 = Uint8Array.of(0);
    const byte1 = Uint8Array.of(1);
    const _maxDrbgIters = 1e3;
    let v = u8n(hashLen);
    let k = u8n(hashLen);
    let i = 0;
    const reset = () => {
      v.fill(1);
      k.fill(0);
      i = 0;
    };
    const h = (...msgs) => hmacFn(k, concatBytes2(v, ...msgs));
    const reseed = (seed = NULL) => {
      k = h(byte0, seed);
      v = h();
      if (seed.length === 0)
        return;
      k = h(byte1, seed);
      v = h();
    };
    const gen = () => {
      if (i++ >= _maxDrbgIters)
        throw new Error("drbg: tried max amount of iterations");
      let len = 0;
      const out = [];
      while (len < qByteLen) {
        v = h();
        const sl = v.slice();
        out.push(sl);
        len += v.length;
      }
      return concatBytes2(...out);
    };
    const genUntil = (seed, pred) => {
      reset();
      reseed(seed);
      let res = void 0;
      while ((res = pred(gen())) === void 0)
        reseed();
      reset();
      return res;
    };
    return genUntil;
  }
  function validateObject(object, fields = {}, optFields = {}, title = "object") {
    aobject2(object, title);
    aobject2(fields, "fields");
    aobject2(optFields, "optFields");
    function checkField(fieldName, expectedType, isOpt) {
      const label = title === "object" ? `param "${String(fieldName)}"` : `"${title}.${String(fieldName)}"`;
      const val = object[fieldName];
      if (!Object.hasOwn(object, fieldName) && (isOpt ? val !== void 0 : expectedType !== "function")) {
        throw new TypeError(`${label} is invalid: expected own property`);
      }
      if (isOpt && val === void 0)
        return;
      const current = typeof val;
      if (current !== expectedType || val === null)
        throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
    }
    const iter = (f2, isOpt) => Object.entries(f2).forEach(([k, v]) => checkField(k, v, isOpt));
    iter(fields, false);
    iter(optFields, true);
  }

  // node_modules/@noble/curves/abstract/modular.js
  var _0n2 = /* @__PURE__ */ BigInt(0);
  var _1n2 = /* @__PURE__ */ BigInt(1);
  var _2n = /* @__PURE__ */ BigInt(2);
  var _3n = /* @__PURE__ */ BigInt(3);
  var _4n = /* @__PURE__ */ BigInt(4);
  var _5n = /* @__PURE__ */ BigInt(5);
  var _7n = /* @__PURE__ */ BigInt(7);
  var _8n = /* @__PURE__ */ BigInt(8);
  var _9n = /* @__PURE__ */ BigInt(9);
  var _15n = /* @__PURE__ */ BigInt(15);
  var _16n = /* @__PURE__ */ BigInt(16);
  var POW_WINDOWED_MIN = /* @__PURE__ */ BigInt("0x10000000000000000");
  function mod(a, b) {
    if (b <= _0n2)
      throw new Error("mod: expected positive modulus, got " + b);
    const result = a % b;
    return result >= _0n2 ? result : b + result;
  }
  function pow(num, power, modulo) {
    if (modulo <= _1n2)
      throw new Error("pow: expected modulus > 1, got " + modulo);
    if (typeof power !== "bigint")
      throw new TypeError("invalid exponent: expected bigint, got " + typeof power);
    if (power < _0n2)
      throw new Error("invalid exponent, negatives unsupported");
    if (power === _0n2)
      return _1n2;
    if (power === _1n2)
      return num;
    let d = num % modulo;
    if (d < _0n2)
      d += modulo;
    if (power < POW_WINDOWED_MIN) {
      let p2 = _1n2;
      while (power > _0n2) {
        if (power & _1n2)
          p2 = p2 * d % modulo;
        d = d * d % modulo;
        power >>= _1n2;
      }
      return p2;
    }
    const digits = [];
    while (power > _0n2) {
      digits.push(Number(power & _15n));
      power >>= _4n;
    }
    const table = new Array(16);
    table[0] = _1n2;
    table[1] = d;
    for (let i = 2; i < 16; i++)
      table[i] = table[i - 1] * d % modulo;
    let p = table[digits[digits.length - 1]];
    for (let w = digits.length - 2; w >= 0; w--) {
      p = p * p % modulo;
      p = p * p % modulo;
      p = p * p % modulo;
      p = p * p % modulo;
      const digit = digits[w];
      if (digit !== 0)
        p = p * table[digit] % modulo;
    }
    return p;
  }
  function pow2(x, power, modulo) {
    if (modulo <= _1n2)
      throw new Error("pow2: expected modulus > 1, got " + modulo);
    if (power < _0n2)
      throw new Error("pow2: expected non-negative exponent, got " + power);
    let res = x;
    while (power-- > _0n2) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert(number, modulo) {
    if (number === _0n2)
      throw new Error("invert: expected non-zero number");
    if (modulo <= _1n2)
      throw new Error("invert: expected modulus > 1, got " + modulo);
    let a = mod(number, modulo);
    let b = modulo;
    let x = _0n2, u = _1n2;
    while (a !== _0n2) {
      const q = b / a;
      const r2 = b - a * q;
      const m = x - u * q;
      b = a, a = r2, x = u, u = m;
    }
    const gcd = b;
    if (gcd !== _1n2)
      throw new Error("invert: does not exist");
    return mod(x, modulo);
  }
  function invertCt(a, prime) {
    if (prime <= _1n2)
      throw new Error("invertCt: expected prime modulus > 1, got " + prime);
    const an = mod(a, prime);
    if (an === _0n2)
      throw new Error("invertCt: expected non-zero number");
    const inverse = pow(an, prime - _2n, prime);
    if (mod(an * inverse, prime) !== _1n2)
      throw new Error("invertCt: does not exist");
    return inverse;
  }
  function assertIsSquare(Fp, root, n) {
    const F = Fp;
    if (!F.eql(F.sqr(root), n))
      throw new Error("Cannot find square root");
  }
  function aoddModulus(order, fnName) {
    if ((order & _1n2) === _0n2)
      throw new Error(fnName + ": expected odd modulus, got " + order);
  }
  function sqrt3mod4(Fp, n) {
    const F = Fp;
    const p1div4 = (F.ORDER + _1n2) / _4n;
    const root = F.pow(n, p1div4);
    assertIsSquare(F, root, n);
    return root;
  }
  function sqrt5mod8(Fp, n) {
    const F = Fp;
    const p5div8 = (F.ORDER - _5n) / _8n;
    const n2 = F.mul(n, _2n);
    const v = F.pow(n2, p5div8);
    const nv = F.mul(n, v);
    const i = F.mul(F.mul(nv, _2n), v);
    const root = F.mul(nv, F.sub(i, F.ONE));
    assertIsSquare(F, root, n);
    return root;
  }
  function sqrt9mod16(P) {
    const Fp_ = Field(P);
    const tn = tonelliShanks(P);
    const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
    const c2 = tn(Fp_, c1);
    const c3 = tn(Fp_, Fp_.neg(c1));
    const c4 = (P + _7n) / _16n;
    return (Fp, n) => {
      const F = Fp;
      let tv1 = F.pow(n, c4);
      let tv2 = F.mul(tv1, c1);
      const tv3 = F.mul(tv1, c2);
      const tv4 = F.mul(tv1, c3);
      const e1 = F.eql(F.sqr(tv2), n);
      const e2 = F.eql(F.sqr(tv3), n);
      tv1 = F.cmov(tv1, tv2, e1);
      tv2 = F.cmov(tv4, tv3, e2);
      const e3 = F.eql(F.sqr(tv2), n);
      const root = F.cmov(tv1, tv2, e3);
      assertIsSquare(F, root, n);
      return root;
    };
  }
  function tonelliShanks(P) {
    if (P < _3n)
      throw new Error("sqrt is not defined for small field");
    aoddModulus(P, "tonelliShanks");
    let Q = P - _1n2;
    let S = 0;
    while (Q % _2n === _0n2) {
      Q /= _2n;
      S++;
    }
    let Z = _2n;
    const _Fp = Field(P);
    while (FpLegendre(_Fp, Z) === 1) {
      if (Z++ > 1e3)
        throw new Error("Cannot find square root: probably non-prime P");
    }
    if (S === 1)
      return sqrt3mod4;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n2) / _2n;
    return function tonelliSlow(Fp, n) {
      const F = Fp;
      if (F.is0(n))
        return n;
      if (FpLegendre(F, n) !== 1)
        throw new Error("Cannot find square root");
      let M = S;
      let c = F.mul(F.ONE, cc);
      let t = F.pow(n, Q);
      let R = F.pow(n, Q1div2);
      while (!F.eql(t, F.ONE)) {
        if (F.is0(t))
          throw new Error("Cannot find square root: probably non-prime P");
        let i = 1;
        let t_tmp = F.sqr(t);
        while (!F.eql(t_tmp, F.ONE)) {
          i++;
          t_tmp = F.sqr(t_tmp);
          if (i === M)
            throw new Error("Cannot find square root");
        }
        const exponent = _1n2 << BigInt(M - i - 1);
        const b = F.pow(c, exponent);
        M = i;
        c = F.sqr(b);
        t = F.mul(t, c);
        R = F.mul(R, b);
      }
      return R;
    };
  }
  function FpSqrt(P) {
    aoddModulus(P, "Fp.sqrt");
    if (P % _4n === _3n)
      return sqrt3mod4;
    if (P % _8n === _5n)
      return sqrt5mod8;
    if (P % _16n === _9n)
      return sqrt9mod16(P);
    return tonelliShanks(P);
  }
  var FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
  function validateField(field) {
    aobject2(field, "field");
    if (typeof field.ORDER !== "bigint")
      throw new TypeError('param "ORDER" is invalid: expected bigint, got ' + typeof field.ORDER);
    asafenumber(field.BYTES, "BYTES");
    asafenumber(field.BITS, "BITS");
    for (const name of FIELD_FIELDS)
      afunction(field[name], "field." + name);
    if (field.BYTES < 1 || field.BITS < 1)
      throw new Error("invalid field: expected BYTES/BITS > 0");
    if (field.ORDER <= _1n2)
      throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
    return field;
  }
  function FpInvertBatch(Fp, nums, passZero = false) {
    validateField(Fp);
    aarray(nums, "nums");
    abool(passZero, "passZero");
    const F = Fp;
    const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
    const multipliedAcc = nums.reduce((acc, num, i) => {
      if (F.is0(num))
        return acc;
      inverted[i] = acc;
      return F.mul(acc, num);
    }, F.ONE);
    const invertedAcc = F.inv(multipliedAcc);
    nums.reduceRight((acc, num, i) => {
      if (F.is0(num))
        return acc;
      inverted[i] = F.mul(acc, inverted[i]);
      return F.mul(acc, num);
    }, invertedAcc);
    return inverted;
  }
  function FpLegendre(Fp, n) {
    validateField(Fp);
    const F = Fp;
    aoddModulus(F.ORDER, "FpLegendre");
    const p1mod2 = (F.ORDER - _1n2) / _2n;
    const powered = F.pow(n, p1mod2);
    const yes = F.eql(powered, F.ONE);
    const zero = F.eql(powered, F.ZERO);
    const no = F.eql(powered, F.neg(F.ONE));
    if (!yes && !zero && !no)
      throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1;
  }
  function nLength(n, nBitLength) {
    if (nBitLength !== void 0)
      anumber2(nBitLength);
    if (n <= _0n2)
      throw new Error("invalid n length: expected positive n, got " + n);
    if (nBitLength !== void 0 && nBitLength < 1)
      throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
    const bits = bitLen(n);
    if (nBitLength !== void 0 && nBitLength < bits)
      throw new Error(`invalid n length: expected nBitLength (${nBitLength}) >= bitLen(n) (${bits})`);
    const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  var FIELD_SQRT = /* @__PURE__ */ new WeakMap();
  var _Field = class {
    constructor(ORDER, opts = {}) {
      __publicField(this, "ORDER");
      __publicField(this, "BITS");
      __publicField(this, "BYTES");
      __publicField(this, "isLE");
      __publicField(this, "ZERO", _0n2);
      __publicField(this, "ONE", _1n2);
      __publicField(this, "_lengths");
      __publicField(this, "_mod");
      if (ORDER <= _1n2)
        throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
      let _nbitLength = void 0;
      this.isLE = false;
      if (opts != null && typeof opts === "object") {
        if (typeof opts.BITS === "number")
          _nbitLength = opts.BITS;
        if (typeof opts.sqrt === "function")
          Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
        if (typeof opts.isLE === "boolean")
          this.isLE = opts.isLE;
        if (opts.allowedLengths)
          this._lengths = Object.freeze(opts.allowedLengths.slice());
        if (typeof opts.modFromBytes === "boolean")
          this._mod = opts.modFromBytes;
      }
      const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
      if (nByteLength > 2048)
        throw new Error("invalid field: expected ORDER of <= 2048 bytes");
      this.ORDER = ORDER;
      this.BITS = nBitLength;
      this.BYTES = nByteLength;
      Object.freeze(this);
    }
    create(num) {
      return mod(num, this.ORDER);
    }
    isValid(num) {
      if (typeof num !== "bigint")
        throw new TypeError("invalid field element: expected bigint, got " + typeof num);
      return _0n2 <= num && num < this.ORDER;
    }
    is0(num) {
      return num === _0n2;
    }
    // is valid and invertible
    isValidNot0(num) {
      return !this.is0(num) && this.isValid(num);
    }
    isOdd(num) {
      return (num & _1n2) === _1n2;
    }
    neg(num) {
      return mod(-num, this.ORDER);
    }
    eql(lhs, rhs) {
      return lhs === rhs;
    }
    sqr(num) {
      return mod(num * num, this.ORDER);
    }
    add(lhs, rhs) {
      return mod(lhs + rhs, this.ORDER);
    }
    sub(lhs, rhs) {
      return mod(lhs - rhs, this.ORDER);
    }
    mul(lhs, rhs) {
      return mod(lhs * rhs, this.ORDER);
    }
    pow(num, power) {
      return pow(num, power, this.ORDER);
    }
    div(lhs, rhs) {
      return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
    }
    // Same as above, but doesn't normalize
    sqrN(num) {
      return num * num;
    }
    addN(lhs, rhs) {
      return lhs + rhs;
    }
    subN(lhs, rhs) {
      return lhs - rhs;
    }
    mulN(lhs, rhs) {
      return lhs * rhs;
    }
    inv(num) {
      return invert(num, this.ORDER);
    }
    sqrt(num) {
      let sqrt = FIELD_SQRT.get(this);
      if (!sqrt)
        FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
      return sqrt(this, num);
    }
    toBytes(num) {
      return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES);
    }
    fromBytes(bytes2, skipValidation = false) {
      abytes2(bytes2);
      const { _lengths: allowedLengths, BYTES, isLE, ORDER, _mod: modFromBytes } = this;
      if (allowedLengths) {
        if (bytes2.length < 1 || !allowedLengths.includes(bytes2.length) || bytes2.length > BYTES) {
          throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes2.length);
        }
        const padded = new Uint8Array(BYTES);
        padded.set(bytes2, isLE ? 0 : padded.length - bytes2.length);
        bytes2 = padded;
      }
      if (bytes2.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes2.length);
      let scalar = isLE ? bytesToNumberLE(bytes2) : bytesToNumberBE(bytes2);
      if (modFromBytes)
        scalar = mod(scalar, ORDER);
      if (!skipValidation) {
        if (!this.isValid(scalar))
          throw new Error("invalid field element: outside of range 0..ORDER");
      }
      return scalar;
    }
    // TODO: we don't need it here, move out to separate fn
    invertBatch(lst) {
      return FpInvertBatch(this, lst, true);
    }
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov(a, b, condition) {
      abool(condition, "condition");
      return condition ? b : a;
    }
  };
  function Field(ORDER, opts = {}) {
    Object.freeze(_Field.prototype);
    return new _Field(ORDER, opts);
  }
  function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== "bigint")
      throw new Error("field order must be bigint");
    if (fieldOrder <= _1n2)
      throw new Error("field order must be greater than 1");
    const bitLength = bitLen(fieldOrder - _1n2);
    return Math.ceil(bitLength / 8);
  }
  function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
  }
  function mapHashToField(key, fieldOrder, isLE = false) {
    abytes2(key);
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = Math.max(getMinHashLength(fieldOrder), 16);
    if (len < minLen || len > 1024)
      throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
    const num = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
    const reduced = mod(num, fieldOrder - _1n2) + _1n2;
    return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
  }

  // node_modules/@noble/curves/abstract/curve.js
  var _0n3 = /* @__PURE__ */ BigInt(0);
  var _1n3 = /* @__PURE__ */ BigInt(1);
  var _4n2 = /* @__PURE__ */ BigInt(4);
  var BLIND_BYTES = 16;
  var BLIND_BITS = 128;
  var FW_WINDOW = 5;
  var TABLE_BYTES_MAX = /* @__PURE__ */ (() => 2 ** 31)();
  function validatePointCons(Point3) {
    const pc = Point3;
    if (typeof pc !== "function")
      throw new TypeError('"Point" expected constructor, got type=' + typeof Point3);
    afunction(pc.fromAffine, "Point.fromAffine");
    afunction(pc.fromBytes, "Point.fromBytes");
    afunction(pc.fromHex, "Point.fromHex");
    aobject2(pc.BASE, "Point.BASE");
    aobject2(pc.ZERO, "Point.ZERO");
    validateField(pc.Fp);
    validateField(pc.Fn);
  }
  function normalizeZ(c, points) {
    validatePointCons(c);
    validateMSMPoints(points, c);
    const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
    return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
  }
  function validateW(W, bits, min = 1) {
    if (!Number.isSafeInteger(W) || W < min || W > bits)
      throw new Error("invalid window size, expected [" + min + ".." + bits + "], got W=" + W);
  }
  function validateTableBytes(numPoints, fpBytes) {
    const bytes2 = numPoints * (4 * fpBytes + 128);
    if (bytes2 > TABLE_BYTES_MAX)
      throw new Error("invalid window size: table would need ~" + Math.ceil(bytes2 / 2 ** 20) + " MiB, max " + TABLE_BYTES_MAX / 2 ** 20 + " MiB");
  }
  function probeRandomBytes(randomBytes3, length) {
    if (randomBytes3 === void 0)
      return void 0;
    afunction(randomBytes3, "randomBytes");
    try {
      const probe = randomBytes3(length);
      if (!isBytes2(probe) || probe.length !== length)
        return void 0;
    } catch {
      return void 0;
    }
    return randomBytes3;
  }
  function validateMSMPoints(points, c) {
    aarray(points, "points");
    points.forEach((p, i) => {
      if (!(p instanceof c))
        throw new Error("invalid point at index " + i);
    });
  }
  function validateMSMScalars(scalars, field, maxScalar) {
    if (!Array.isArray(scalars))
      throw new Error("array of scalars expected");
    scalars.forEach((s2, i) => {
      const ok = maxScalar === void 0 ? field.isValid(s2) : isPosBig(s2) && s2 < maxScalar;
      if (!ok)
        throw new Error("invalid scalar at index " + i);
    });
  }
  var pointWindowSizes = /* @__PURE__ */ new WeakMap();
  function getWindowSize(P) {
    return pointWindowSizes.get(P) || 1;
  }
  function oddMultiples(p, size) {
    const dbl = p.double();
    const t = [p];
    for (let j = 1; j < size; j++)
      t.push(t[j - 1].add(dbl));
    return t;
  }
  function wnafDigits(n, W) {
    const size = 2 ** W;
    const half = size / 2;
    const mask = BigInt(size - 1);
    const d = [];
    while (n > _0n3) {
      let w = 0;
      if (n & _1n3) {
        w = Number(n & mask);
        if (w >= half)
          w -= size;
        n -= BigInt(w);
      }
      d.push(w);
      n >>= _1n3;
    }
    return d;
  }
  function signedWindowDigits(n, W, windows) {
    const size = 2 ** W;
    const half = size / 2;
    const mask = BigInt(size - 1);
    const shiftBy = BigInt(W);
    const d = [];
    for (let w = 0; w < windows; w++) {
      let v = Number(n & mask);
      n >>= shiftBy;
      if (v > half) {
        v -= size;
        n += _1n3;
      }
      d.push(v);
    }
    if (n !== _0n3)
      throw new Error("invalid wnaf");
    return d;
  }
  function wnafWalk(zero, tables, digits) {
    let max = 0;
    for (const d of digits)
      max = Math.max(max, d.length);
    let acc = zero;
    for (let bit = max - 1; bit >= 0; bit--) {
      if (bit !== max - 1)
        acc = acc.double();
      for (let i = 0; i < digits.length; i++) {
        const w = digits[i][bit];
        if (w) {
          const item = tables[i][Math.abs(w) - 1 >> 1];
          acc = acc.add(w < 0 ? item.negate() : item);
        }
      }
    }
    return acc;
  }
  var ScalarMultiplier = class {
    // Parametrized with a given Point class (not individual point)
    constructor(Point3, randomBytes3) {
      __publicField(this, "Point");
      __publicField(this, "BASE");
      __publicField(this, "ZERO");
      __publicField(this, "randomBytes");
      __publicField(this, "wnafPrecomputes", /* @__PURE__ */ new WeakMap());
      __publicField(this, "baseCanBeBlinded");
      __publicField(this, "bits");
      validatePointCons(Point3);
      this.randomBytes = probeRandomBytes(randomBytes3, BLIND_BYTES);
      this.Point = Point3;
      this.BASE = Point3.BASE;
      this.ZERO = Point3.ZERO;
      this.bits = Point3.Fn.BITS;
    }
    /**
     * Creates a signed fixed-window wNAF precomputation table: for every window w, the
     * multiples `[1..2^(W−1)]⋅2^(w⋅W)⋅P`, flattened. All doublings are baked into the table,
     * so cached multiplication is additions-only. `windows = ceil(bits/W) + 1`: the extra
     * window absorbs the final carry of signed-digit recoding.
     * For a 256-bit curve and W=6, the table is 44⋅32 = 1408 points.
     * @param point - Point instance
     * @param W - window size
     * @param bits - scalar bitlength the table must cover
     */
    buildWnafTable(point, W, bits) {
      const windows = Math.ceil(bits / W) + 1;
      const half = 2 ** (W - 1);
      const comp = [];
      let base = point;
      for (let w = 0; w < windows; w++) {
        let acc = base;
        for (let i = 0; i < half; i++) {
          comp.push(acc);
          acc = acc.add(base);
        }
        base = comp[comp.length - 1].double();
      }
      return { W, bits, windows, comp };
    }
    /**
     * Implements ec multiplication using precomputed signed fixed-window wNAF tables.
     * Constant-time: fixed window count with one table addition per window — zero digits feed
     * the fake accumulator — and no doublings; the lookup scans the whole window slice.
     * Scalar bounds are validated by the public entry points ({@link ScalarMultiplier.mulCT},
     * {@link ScalarMultiplier.mulCTBlinded}, {@link ScalarMultiplier.mulUnsafe});
     * signedWindowDigits throws if `n` exceeds the table.
     * @returns real and fake (for const-time) points
     */
    wnafCachedCT(precomputes, n) {
      const { W, windows, comp } = precomputes;
      const half = 2 ** (W - 1);
      const digits = signedWindowDigits(n, W, windows);
      let p = this.ZERO;
      let f2 = this.BASE;
      for (let w = 0; w < windows; w++) {
        const digit = digits[w];
        const start = w * half;
        const idx = Math.abs(digit) - 1;
        let sel = comp[start];
        for (let i = 1; i < half; i++)
          sel = i === idx ? comp[start + i] : sel;
        const neg = sel.negate();
        if (digit === 0)
          f2 = f2.add(comp[start]);
        else
          p = p.add(digit < 0 ? neg : sel);
      }
      return { p, f: f2 };
    }
    // Cache key is point identity plus (W, bits); at most two entries exist per point (public-width
    // `Fn.BITS` and blinded `Fn.BITS + BLIND_BITS`). Callers must not reuse the same point with
    // incompatible `transform(...)` layouts and expect a separate cache entry.
    getWnafPrecomputes(W, point, bits, transform) {
      let entries = this.wnafPrecomputes.get(point);
      let comp = entries?.find((entry) => entry.W === W && entry.bits === bits);
      if (!comp) {
        comp = this.buildWnafTable(point, W, bits);
        if (typeof transform === "function")
          comp = { ...comp, comp: transform(comp.comp) };
        if (!entries) {
          entries = [];
          this.wnafPrecomputes.set(point, entries);
        }
        entries.push(comp);
      }
      return comp;
    }
    assertPoint(point) {
      if (!(point instanceof this.Point))
        throw new TypeError('"point" expected Point instance, got type=' + typeof point);
    }
    // Shared prologue of the constant-time entry points. Rejects scalar 0: in key/signature-style
    // callers a zero scalar means broken upstream plumbing, and concrete Points already reject it.
    // Uses inRange instead of Fn.isValidNot0: validateField() only certifies the arithmetic subset.
    validateMulInput(point, scalar) {
      this.assertPoint(point);
      if (!inRange(scalar, _1n3, this.Point.Fn.ORDER))
        throw new Error("invalid scalar");
    }
    // Constant-time dispatch shared by mulCT / mulCTBlinded. Un-precomputed points (W===1, e.g.
    // ECDH peer keys) skip building a throwaway cached table in favor of a small fixed-window
    // multiply. `n` must be < 2^bits.
    runCT(point, n, bits, transform) {
      const W = getWindowSize(point);
      if (W === 1)
        return this.fixedWindowCT(point, n, bits);
      return this.wnafCachedCT(this.getWnafPrecomputes(W, point, bits, transform), n);
    }
    mulCT(point, scalar, transform) {
      this.validateMulInput(point, scalar);
      return this.runCT(point, scalar, this.bits, transform);
    }
    mulCTBlinded(point, scalar, transform) {
      this.validateMulInput(point, scalar);
      if (this.randomBytes === void 0)
        throw new Error("randomBytes is required for scalar blinding");
      const bits = this.Point.Fn.BITS + BLIND_BITS;
      const blind = this.randomBytes(BLIND_BYTES);
      if (!isBytes2(blind) || blind.length !== BLIND_BYTES)
        throw new Error("randomBytes returned invalid byte array");
      blind[0] = blind[0] & 63 | 128;
      const n = scalar + bytesToNumberBE(blind) * this.Point.Fn.ORDER;
      return this.runCT(point, n, bits, transform);
    }
    /**
     * Constant-time multiplication `n*point` for an un-precomputed point, via a small fixed window.
     * A cached wNAF table only pays off when reused; a flat 2^FW_WINDOW table (`size-1` adds) is
     * far cheaper to build for a single use. The point-operation sequence is independent of `n`:
     * build the table, then per window exactly FW_WINDOW doublings, a data-oblivious scan over
     * every table entry, and one addition (adds the identity when the window digit is 0 — never
     * skipped).
     *
     * `n` must be `< 2^bits`. Assumes complete addition (adding the identity costs the same as any
     * add), which holds for the Weierstrass/Edwards point types used here. The table is left in
     * projective form (no normalizeZ): normalizing this small a table costs more than the
     * mixed-add savings it would buy for a single multiply.
     * @returns real point `p`; `f` duplicates it only to match {@link wnafCachedCT}'s return shape
     * (this path needs no fake accumulator — its op-count is already scalar-independent).
     */
    fixedWindowCT(point, n, bits) {
      const W = FW_WINDOW;
      const size = 1 << W;
      const mask = bitMask(W);
      const table = new Array(size);
      table[0] = this.ZERO;
      for (let i = 1; i < size; i++)
        table[i] = table[i - 1].add(point);
      const windows = Math.ceil(bits / W);
      let acc = this.ZERO;
      for (let window2 = windows - 1; window2 >= 0; window2--) {
        if (window2 !== windows - 1)
          for (let d = 0; d < W; d++)
            acc = acc.double();
        const digit = Number(n >> BigInt(window2 * W) & mask);
        let sel = table[0];
        for (let i = 1; i < size; i++)
          sel = i === digit ? table[i] : sel;
        acc = acc.add(sel);
      }
      return { p: acc, f: acc };
    }
    shouldBlind(point, cofactor) {
      if (this.randomBytes === void 0)
        return false;
      if (cofactor === _1n3)
        return true;
      if (point !== this.BASE)
        return false;
      if (this.baseCanBeBlinded === void 0)
        this.baseCanBeBlinded = this.mulUnsafe(this.BASE, this.Point.Fn.ORDER).is0();
      return this.baseCanBeBlinded;
    }
    mulSecret(point, scalar, cofactor, transform) {
      return this.shouldBlind(point, cofactor) ? this.mulCTBlinded(point, scalar, transform) : this.mulCT(point, scalar, transform);
    }
    mulUnsafe(point, scalar, transform) {
      this.assertPoint(point);
      if (!isPosBig(scalar))
        throw new Error("invalid scalar");
      const W = getWindowSize(point);
      if (W === 1 || scalar >= this.Point.Fn.ORDER)
        return mulAddUnsafe(this.Point, [point], [scalar], true);
      const precomputes = this.getWnafPrecomputes(W, point, this.bits, transform);
      return this.wnafCachedCT(precomputes, scalar).p;
    }
    // Remembers the window size used for precomputed wNAF multiplication of the given point
    // and drops any previously built tables. Usually only the base point is precomputed.
    // W=1 resets the point to the un-precomputed (table-less) paths.
    // W is additionally capped so tables stay under ~2 GiB ({@link TABLE_BYTES_MAX}).
    setWindowSize(point, W) {
      this.assertPoint(point);
      validateW(W, this.bits);
      const windows = Math.ceil((this.bits + BLIND_BITS) / W) + 1;
      validateTableBytes(windows * 2 ** (W - 1), this.Point.Fp.BYTES);
      pointWindowSizes.set(point, W);
      this.wnafPrecomputes.delete(point);
    }
    // True when a window size is set: tables themselves are built lazily on first multiply.
    hasWindowSize(point) {
      return getWindowSize(point) !== 1;
    }
  };
  function mulAddUnsafe(c, points, scalars, allowOversized = false) {
    validatePointCons(c);
    validateMSMPoints(points, c);
    abool(allowOversized, "allowOversized");
    validateMSMScalars(scalars, c.Fn, allowOversized ? c.Fn.ORDER ** _4n2 : void 0);
    if (points.length !== scalars.length)
      throw new Error("arrays of points and scalars must have equal length");
    const tables = points.map((p) => oddMultiples(p, 4));
    const digits = scalars.map((n) => wnafDigits(n, 4));
    return wnafWalk(c.ZERO, tables, digits);
  }
  function createField(order, field, isLE) {
    if (field) {
      if (field.ORDER !== order)
        throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
      validateField(field);
      return field;
    } else {
      return Field(order, { isLE });
    }
  }
  function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
    if (type !== "weierstrass" && type !== "edwards")
      throw new Error('expected curve type "weierstrass" or "edwards"');
    if (FpFnLE === void 0)
      FpFnLE = type === "edwards";
    if (!CURVE || typeof CURVE !== "object")
      throw new Error(`expected valid ${type} CURVE object`);
    validateObject(curveOpts);
    for (const p of ["p", "n", "h"]) {
      const val = CURVE[p];
      if (!(isPosBig(val) && val !== _0n3))
        throw new Error(`CURVE.${p} must be positive bigint`);
    }
    const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
    const Fn2 = createField(CURVE.n, curveOpts.Fn, FpFnLE);
    const _b = type === "weierstrass" ? "b" : "d";
    const params = ["Gx", "Gy", "a", _b];
    for (const p of params) {
      if (!Fp.isValid(CURVE[p]))
        throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
    }
    CURVE = Object.freeze(Object.assign({}, CURVE));
    return { CURVE, Fp, Fn: Fn2 };
  }
  function createKeygen(randomSecretKey, getPublicKey) {
    return function keygen(seed) {
      const secretKey = randomSecretKey(seed);
      return { secretKey, publicKey: getPublicKey(secretKey) };
    };
  }

  // node_modules/@noble/curves/abstract/der.js
  var _0n4 = /* @__PURE__ */ BigInt(0);
  var DERErr = class extends Error {
    constructor(m = "") {
      super(m);
    }
  };
  var _DER = {
    // asn.1 DER encoding utils
    Err: DERErr,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
      encode: (tag, data) => {
        const { Err: E } = _DER;
        asafenumber(tag, "tag");
        if (tag < 0 || tag > 255)
          throw new E("tlv.encode: wrong tag");
        astring(data, "data");
        if (data.length & 1)
          throw new E("tlv.encode: unpadded data");
        const dataLen = data.length / 2;
        const len = numberToHexUnpadded(dataLen);
        if (len.length / 2 & 128)
          throw new E("tlv.encode: long form length too big");
        const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
        const t = numberToHexUnpadded(tag);
        return t + lenLen + len + data;
      },
      // v - value, l - left bytes (unparsed)
      decode(tag, data) {
        const { Err: E } = _DER;
        data = abytes2(data, void 0, "DER data");
        let pos = 0;
        if (tag < 0 || tag > 255)
          throw new E("tlv.decode: wrong tag");
        if (data.length < 2 || data[pos++] !== tag)
          throw new E("tlv.decode: wrong tlv");
        const first = data[pos++];
        const isLong = !!(first & 128);
        let length = 0;
        if (!isLong)
          length = first;
        else {
          const lenLen = first & 127;
          if (!lenLen)
            throw new E("tlv.decode(long): indefinite length not supported");
          if (lenLen > 4)
            throw new E("tlv.decode(long): byte length is too big");
          const lengthBytes = data.subarray(pos, pos + lenLen);
          if (lengthBytes.length !== lenLen)
            throw new E("tlv.decode: length bytes not complete");
          if (lengthBytes[0] === 0)
            throw new E("tlv.decode(long): zero leftmost byte");
          for (const b of lengthBytes)
            length = length << 8 | b;
          pos += lenLen;
          if (length < 128)
            throw new E("tlv.decode(long): not minimal encoding");
        }
        const v = data.subarray(pos, pos + length);
        if (v.length !== length)
          throw new E("tlv.decode: wrong value length");
        return { v, l: data.subarray(pos + length) };
      }
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
      encode(num) {
        const { Err: E } = _DER;
        abignumber(num);
        if (num < _0n4)
          throw new E("integer: negative integers are not allowed");
        let hex = numberToHexUnpadded(num);
        if (Number.parseInt(hex[0], 16) & 8)
          hex = "00" + hex;
        if (hex.length & 1)
          throw new E("unexpected DER parsing assertion: unpadded hex");
        return hex;
      },
      decode(data) {
        const { Err: E } = _DER;
        if (data.length < 1)
          throw new E("invalid signature integer: empty");
        if (data[0] & 128)
          throw new E("invalid signature integer: negative");
        if (data.length > 1 && data[0] === 0 && !(data[1] & 128))
          throw new E("invalid signature integer: unnecessary leading zero");
        return bytesToNumberBE(data);
      }
    },
    toSig(bytes2, maxScalarBytes) {
      const { Err: E, _int: int, _tlv: tlv } = _DER;
      if (maxScalarBytes !== void 0) {
        asafenumber(maxScalarBytes, "maxScalarBytes");
        if (maxScalarBytes < 1)
          throw new E("invalid signature: maxScalarBytes must be positive");
      }
      const data = abytes2(bytes2, void 0, "signature");
      const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
      if (seqLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
      const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
      if (sLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      if (maxScalarBytes !== void 0 && (rBytes.length > maxScalarBytes || sBytes.length > maxScalarBytes))
        throw new E("invalid signature: integer too large");
      return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
      const { _tlv: tlv, _int: int } = _DER;
      validateObject(sig, { r: "bigint", s: "bigint" }, {}, "sig");
      const rs = tlv.encode(2, int.encode(sig.r));
      const ss = tlv.encode(2, int.encode(sig.s));
      const seq = rs + ss;
      return tlv.encode(48, seq);
    }
  };
  var DER = /* @__PURE__ */ (() => {
    Object.freeze(_DER._tlv);
    Object.freeze(_DER._int);
    return Object.freeze(_DER);
  })();

  // node_modules/@noble/curves/abstract/weierstrass.js
  var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n2) / den;
  function _splitEndoScalar(k, basis, n) {
    aInRange("scalar", k, _0n5, n);
    const [[a1, b1], [a2, b2]] = basis;
    const c1 = divNearest(b2 * k, n);
    const c2 = divNearest(-b1 * k, n);
    let k1 = k - c1 * a1 - c2 * a2;
    let k2 = -c1 * b1 - c2 * b2;
    const k1neg = k1 < _0n5;
    const k2neg = k2 < _0n5;
    if (k1neg)
      k1 = -k1;
    if (k2neg)
      k2 = -k2;
    const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
    if (k1 < _0n5 || k1 >= MAX_NUM || k2 < _0n5 || k2 >= MAX_NUM) {
      throw new Error("splitScalar (endomorphism): failed for k");
    }
    return { k1neg, k1, k2neg, k2 };
  }
  function validateSigFormat(format) {
    if (!["compact", "recovered", "der"].includes(format))
      throw new Error('Signature format must be "compact", "recovered", or "der"');
    return format;
  }
  function validateSigOpts(opts, def) {
    validateObject(opts);
    const optsn = {};
    for (let optName of Object.keys(def)) {
      optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
    }
    abool(optsn.lowS, "lowS");
    abool(optsn.prehash, "prehash");
    if (optsn.format !== void 0)
      validateSigFormat(optsn.format);
    return optsn;
  }
  var _0n5 = /* @__PURE__ */ BigInt(0);
  var _1n4 = /* @__PURE__ */ BigInt(1);
  var _2n2 = /* @__PURE__ */ BigInt(2);
  var _3n2 = /* @__PURE__ */ BigInt(3);
  var _4n3 = /* @__PURE__ */ BigInt(4);
  function weierstrass(params, extraOpts = {}) {
    const validated = createCurveFields("weierstrass", params, extraOpts);
    const Fp = validated.Fp;
    const Fn2 = validated.Fn;
    let CURVE = validated.CURVE;
    const { h: cofactor, n: CURVE_ORDER } = CURVE;
    validateObject(extraOpts, {}, {
      allowInfinityPoint: "boolean",
      clearCofactor: "function",
      isTorsionFree: "function",
      fromBytes: "function",
      toBytes: "function",
      endo: "object",
      randomBytes: "function"
    });
    const { endo: endoOpts, allowInfinityPoint, clearCofactor, isTorsionFree, fromBytes, toBytes: toBytes2 } = extraOpts;
    const randomBytes3 = extraOpts.randomBytes === void 0 ? randomBytes2 : extraOpts.randomBytes;
    if (endoOpts) {
      if (!Fp.is0(CURVE.a) || typeof endoOpts.beta !== "bigint" || !Array.isArray(endoOpts.basises)) {
        throw new Error('invalid endo: expected "beta": bigint and "basises": array');
      }
    }
    const endo = endoOpts ? {
      beta: endoOpts.beta,
      basises: endoOpts.basises.map((basis) => [...basis])
    } : void 0;
    const lengths = getWLengths(Fp, Fn2);
    function assertCompressionIsSupported() {
      if (!Fp.isOdd)
        throw new Error("compression is not supported: Field does not have .isOdd()");
    }
    function pointToBytes(_c, point, isCompressed) {
      if (point.is0()) {
        if (!allowInfinityPoint)
          throw new Error("bad point: ZERO");
        return Uint8Array.of(0);
      }
      const { x, y } = point.toAffine();
      const bx = Fp.toBytes(x);
      abool(isCompressed, "isCompressed");
      if (isCompressed) {
        assertCompressionIsSupported();
        const hasEvenY = !Fp.isOdd(y);
        return concatBytes2(pprefix(hasEvenY), bx);
      } else {
        return concatBytes2(Uint8Array.of(4), bx, Fp.toBytes(y));
      }
    }
    function pointFromBytes(bytes2) {
      abytes2(bytes2, void 0, "Point");
      const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
      const length = bytes2.length;
      const head = bytes2[0];
      const tail = bytes2.subarray(1);
      if (allowInfinityPoint && length === 1 && head === 0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (length === comp && (head === 2 || head === 3)) {
        const x = Fp.fromBytes(tail);
        if (!Fp.isValid(x))
          throw new Error("bad point: is not on curve, wrong x");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("bad point: is not on curve, sqrt error" + err);
        }
        assertCompressionIsSupported();
        const evenY = Fp.isOdd(y);
        const evenH = (head & 1) === 1;
        if (evenH !== evenY)
          y = Fp.neg(y);
        return { x, y };
      } else if (length === uncomp && head === 4) {
        const L = Fp.BYTES;
        const x = Fp.fromBytes(tail.subarray(0, L));
        const y = Fp.fromBytes(tail.subarray(L, L * 2));
        if (!isValidXY(x, y))
          throw new Error("bad point: is not on curve");
        return { x, y };
      } else {
        throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
      }
    }
    const encodePoint = toBytes2 === void 0 ? pointToBytes : toBytes2;
    const decodePoint = fromBytes === void 0 ? pointFromBytes : fromBytes;
    const b3 = Fp.mul(CURVE.b, _3n2);
    const mulA = Fp.is0(CURVE.a) ? (_) => Fp.ZERO : (x) => Fp.mul(CURVE.a, x);
    function weierstrassEquation(x) {
      const x2 = Fp.sqr(x);
      const x3 = Fp.mul(x2, x);
      return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
    }
    function isValidXY(x, y) {
      const left = Fp.sqr(y);
      const right = weierstrassEquation(x);
      return Fp.eql(left, right);
    }
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n3);
    const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2)))
      throw new Error("bad curve params: a or b");
    function acoord(title, n, banZero = false) {
      if (!Fp.isValid(n) || banZero && Fp.is0(n))
        throw new Error(`bad point coordinate ${title}`);
      return typeof n === "object" && n !== null ? Fp.create(n) : n;
    }
    function aprjpoint(other) {
      if (!(other instanceof Point3))
        throw new Error("Weierstrass Point expected");
    }
    function splitEndoScalarN(k) {
      if (!endo || !endo.basises)
        throw new Error("no endo");
      return _splitEndoScalar(k, endo.basises, Fn2.ORDER);
    }
    function pushWnafPair(points, scalars, p, k) {
      if (!Fn2.isValid(k))
        throw new RangeError("invalid scalar: out of range");
      if (endo) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(k);
        const psi = new Point3(Fp.mul(p.X, endo.beta), p.Y, p.Z);
        points.push(k1neg ? p.negate() : p, k2neg ? psi.negate() : psi);
        scalars.push(k1, k2);
      } else {
        points.push(p);
        scalars.push(k);
      }
    }
    const validityCache = /* @__PURE__ */ new WeakSet();
    const _Point2 = class _Point2 {
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      constructor(X, Y, Z) {
        __publicField(this, "X");
        __publicField(this, "Y");
        __publicField(this, "Z");
        this.X = acoord("x", X);
        this.Y = acoord("y", Y, true);
        this.Z = acoord("z", Z);
        Object.freeze(this);
      }
      static CURVE() {
        return CURVE;
      }
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      static fromAffine(p) {
        const { x, y } = p || {};
        if (!p || !Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("invalid affine point");
        if (p instanceof _Point2)
          throw new Error("projective point not allowed");
        if (Fp.is0(x) && Fp.is0(y))
          return _Point2.ZERO;
        return new _Point2(x, y, Fp.ONE);
      }
      static fromBytes(bytes2) {
        const P = _Point2.fromAffine(decodePoint(abytes2(bytes2, void 0, "point")));
        P.assertValidity();
        return P;
      }
      static fromHex(hex) {
        return _Point2.fromBytes(hexToBytes2(hex));
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      /**
       * @param isLazy - true will defer table computation until the first multiplication
       */
      precompute(windowSize = 6, isLazy = true) {
        wnaf.setWindowSize(this, windowSize);
        if (!isLazy)
          this.multiply(_3n2);
        return this;
      }
      // TODO: return `this`
      /** A point on curve is valid if it conforms to equation. */
      assertValidity() {
        const p = this;
        if (p.is0()) {
          if (allowInfinityPoint && Fp.is0(p.X) && Fp.eql(p.Y, Fp.ONE) && Fp.is0(p.Z))
            return;
          throw new Error("bad point: ZERO");
        }
        if (validityCache.has(p))
          return;
        const { x, y } = p.toAffine();
        if (!Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("bad point: x or y not field elements");
        if (!isValidXY(x, y))
          throw new Error("bad point: equation left != right");
        if (!p.isTorsionFree())
          throw new Error("bad point: not in prime-order subgroup");
        validityCache.add(p);
      }
      hasEvenY() {
        const { y } = this.toAffine();
        if (!Fp.isOdd)
          throw new Error("Field doesn't support isOdd");
        return !Fp.isOdd(y);
      }
      /** Compare one point to another. */
      equals(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
        const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
        return U1 && U2;
      }
      /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
      negate() {
        return new _Point2(this.X, Fp.neg(this.Y), this.Z);
      }
      // Renes-Costello-Batina exception-free doubling formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 3
      // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
      double() {
        const { X: X1, Y: Y1, Z: Z1 } = this;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        let t0 = Fp.mul(X1, X1);
        let t1 = Fp.mul(Y1, Y1);
        let t2 = Fp.mul(Z1, Z1);
        let t3 = Fp.mul(X1, Y1);
        t3 = Fp.add(t3, t3);
        Z3 = Fp.mul(X1, Z1);
        Z3 = Fp.add(Z3, Z3);
        X3 = mulA(Z3);
        Y3 = Fp.mul(b3, t2);
        Y3 = Fp.add(X3, Y3);
        X3 = Fp.sub(t1, Y3);
        Y3 = Fp.add(t1, Y3);
        Y3 = Fp.mul(X3, Y3);
        X3 = Fp.mul(t3, X3);
        Z3 = Fp.mul(b3, Z3);
        t2 = mulA(t2);
        t3 = Fp.sub(t0, t2);
        t3 = mulA(t3);
        t3 = Fp.add(t3, Z3);
        Z3 = Fp.add(t0, t0);
        t0 = Fp.add(Z3, t0);
        t0 = Fp.add(t0, t2);
        t0 = Fp.mul(t0, t3);
        Y3 = Fp.add(Y3, t0);
        t2 = Fp.mul(Y1, Z1);
        t2 = Fp.add(t2, t2);
        t0 = Fp.mul(t2, t3);
        X3 = Fp.sub(X3, t0);
        Z3 = Fp.mul(t2, t1);
        Z3 = Fp.add(Z3, Z3);
        Z3 = Fp.add(Z3, Z3);
        return new _Point2(X3, Y3, Z3);
      }
      // Renes-Costello-Batina exception-free addition formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 1
      // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
      add(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        let t0 = Fp.mul(X1, X2);
        let t1 = Fp.mul(Y1, Y2);
        let t2 = Fp.mul(Z1, Z2);
        let t3 = Fp.add(X1, Y1);
        let t4 = Fp.add(X2, Y2);
        t3 = Fp.mul(t3, t4);
        t4 = Fp.add(t0, t1);
        t3 = Fp.sub(t3, t4);
        t4 = Fp.add(X1, Z1);
        let t5 = Fp.add(X2, Z2);
        t4 = Fp.mul(t4, t5);
        t5 = Fp.add(t0, t2);
        t4 = Fp.sub(t4, t5);
        t5 = Fp.add(Y1, Z1);
        X3 = Fp.add(Y2, Z2);
        t5 = Fp.mul(t5, X3);
        X3 = Fp.add(t1, t2);
        t5 = Fp.sub(t5, X3);
        Z3 = mulA(t4);
        X3 = Fp.mul(b3, t2);
        Z3 = Fp.add(X3, Z3);
        X3 = Fp.sub(t1, Z3);
        Z3 = Fp.add(t1, Z3);
        Y3 = Fp.mul(X3, Z3);
        t1 = Fp.add(t0, t0);
        t1 = Fp.add(t1, t0);
        t2 = mulA(t2);
        t4 = Fp.mul(b3, t4);
        t1 = Fp.add(t1, t2);
        t2 = Fp.sub(t0, t2);
        t2 = mulA(t2);
        t4 = Fp.add(t4, t2);
        t0 = Fp.mul(t1, t4);
        Y3 = Fp.add(Y3, t0);
        t0 = Fp.mul(t5, t4);
        X3 = Fp.mul(t3, X3);
        X3 = Fp.sub(X3, t0);
        t0 = Fp.mul(t3, t1);
        Z3 = Fp.mul(t5, Z3);
        Z3 = Fp.add(Z3, t0);
        return new _Point2(X3, Y3, Z3);
      }
      subtract(other) {
        aprjpoint(other);
        return this.add(other.negate());
      }
      is0() {
        return this.equals(_Point2.ZERO);
      }
      /**
       * Constant time multiplication.
       * Uses precomputed tables (signed fixed-window wNAF) when available.
       * Uses scalar blinding and avoids endomorphism splitting in the secret-scalar path.
       * @param scalar - by which the point would be multiplied
       * @returns New point
       */
      multiply(scalar) {
        if (!Fn2.isValidNot0(scalar))
          throw new RangeError("invalid scalar: out of range");
        const { p, f: f2 } = wnaf.mulSecret(this, scalar, cofactor, normalize2);
        return normalize2([p, f2])[0];
      }
      /**
       * Non-constant-time multiplication. Uses width-4 wNAF with GLV endomorphism splitting
       * when available (two half-width scalars sharing one halved doubling chain).
       * It's faster, but should only be used when you don't care about
       * an exposed secret key e.g. sig verification, which works over *public* keys.
       */
      multiplyUnsafe(scalar) {
        const p = this;
        const sc = scalar;
        if (!Fn2.isValid(sc))
          throw new RangeError("invalid scalar: out of range");
        if (sc === _0n5 || p.is0())
          return _Point2.ZERO;
        if (sc === _1n4)
          return p;
        if (wnaf.hasWindowSize(this))
          return wnaf.mulUnsafe(p, sc, normalize2);
        const points = [];
        const scalars = [];
        pushWnafPair(points, scalars, p, sc);
        return mulAddUnsafe(_Point2, points, scalars);
      }
      /**
       * Non-constant-time double-scalar multiplication `a⋅this + b⋅other` (Strauss–Shamir).
       * Both walks share one doubling chain via {@link mulAddUnsafe}, and GLV endomorphism
       * (when available) halves the chain again by splitting each scalar into two half-width
       * parts. Used by ECDSA verification and public-key recovery for `R = u1⋅G + u2⋅P`.
       * Only for public scalars.
       */
      mulAddUnsafe(a, other, b) {
        aprjpoint(other);
        const points = [];
        const scalars = [];
        pushWnafPair(points, scalars, this, a);
        pushWnafPair(points, scalars, other, b);
        return mulAddUnsafe(_Point2, points, scalars);
      }
      /**
       * Converts Projective point to affine (x, y) coordinates.
       * (X, Y, Z) ∋ (x=X/Z, y=Y/Z).
       * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
       */
      toAffine(invertedZ) {
        const p = this;
        let iz = invertedZ;
        if (iz != null && !Fp.isValid(iz))
          throw new RangeError('"invertedZ" expected valid field element');
        const { X, Y, Z } = p;
        if (Fp.eql(Z, Fp.ONE))
          return { x: X, y: Y };
        const is0 = p.is0();
        if (iz == null)
          iz = is0 ? Fp.ONE : Fp.inv(Z);
        const x = Fp.mul(X, iz);
        const y = Fp.mul(Y, iz);
        const zz = Fp.mul(Z, iz);
        if (is0)
          return { x: Fp.ZERO, y: Fp.ZERO };
        if (!Fp.eql(zz, Fp.ONE))
          throw new Error("invZ was invalid");
        return { x, y };
      }
      /**
       * Checks whether Point is free of torsion elements (is in prime subgroup).
       * Always torsion-free for cofactor=1 curves.
       */
      isTorsionFree() {
        if (cofactor === _1n4)
          return true;
        if (isTorsionFree)
          return isTorsionFree(_Point2, this);
        return wnaf.mulUnsafe(this, CURVE_ORDER).is0();
      }
      clearCofactor() {
        if (cofactor === _1n4)
          return this;
        if (clearCofactor)
          return clearCofactor(_Point2, this);
        return this.multiplyUnsafe(cofactor);
      }
      isSmallOrder() {
        if (cofactor === _1n4)
          return this.is0();
        return this.clearCofactor().is0();
      }
      toBytes(isCompressed = true) {
        abool(isCompressed, "isCompressed");
        this.assertValidity();
        return encodePoint(_Point2, this, isCompressed);
      }
      toHex(isCompressed = true) {
        return bytesToHex2(this.toBytes(isCompressed));
      }
      toString() {
        return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
      }
    };
    __publicField(_Point2, "BASE", new _Point2(CURVE.Gx, CURVE.Gy, Fp.ONE));
    __publicField(_Point2, "ZERO", new _Point2(Fp.ZERO, Fp.ONE, Fp.ZERO));
    __publicField(_Point2, "Fp", Fp);
    __publicField(_Point2, "Fn", Fn2);
    let Point3 = _Point2;
    const normalize2 = (points) => normalizeZ(Point3, points);
    const wnaf = new ScalarMultiplier(Point3, randomBytes3);
    if (wnaf.bits >= 6)
      Point3.BASE.precompute(6);
    Object.freeze(Point3.prototype);
    Object.freeze(Point3);
    return Point3;
  }
  function pprefix(hasEvenY) {
    return Uint8Array.of(hasEvenY ? 2 : 3);
  }
  function getWLengths(Fp, Fn2) {
    return {
      secretKey: Fn2.BYTES,
      publicKey: 1 + Fp.BYTES,
      publicKeyUncompressed: 1 + 2 * Fp.BYTES,
      publicKeyHasPrefix: true,
      // Raw compact `(r || s)` signature width; DER and recovered signatures use
      // different lengths outside this helper.
      signature: 2 * Fn2.BYTES
    };
  }
  function ecdh(Point3, ecdhOpts = {}) {
    validatePointCons(Point3);
    const { Fn: Fn2 } = Point3;
    const randomBytes_ = ecdhOpts.randomBytes === void 0 ? randomBytes2 : ecdhOpts.randomBytes;
    const lengths = Object.assign(getWLengths(Point3.Fp, Fn2), {
      seed: Math.max(getMinHashLength(Fn2.ORDER), 16)
    });
    function isValidSecretKey(secretKey) {
      try {
        const num = Fn2.fromBytes(secretKey);
        return Fn2.isValidNot0(num);
      } catch (error) {
        return false;
      }
    }
    function isValidPublicKey(publicKey, isCompressed) {
      const { publicKey: comp, publicKeyUncompressed } = lengths;
      try {
        const l = publicKey.length;
        if (isCompressed === true && l !== comp)
          return false;
        if (isCompressed === false && l !== publicKeyUncompressed)
          return false;
        return !Point3.fromBytes(publicKey).is0();
      } catch (error) {
        return false;
      }
    }
    function randomSecretKey(seed) {
      seed = seed === void 0 ? randomBytes_(lengths.seed) : seed;
      return mapHashToField(abytes2(seed, lengths.seed, "seed"), Fn2.ORDER);
    }
    function getPublicKey(secretKey, isCompressed = true) {
      return Point3.BASE.multiply(Fn2.fromBytes(secretKey)).toBytes(isCompressed);
    }
    function isProbPub(item) {
      const { secretKey, publicKey, publicKeyUncompressed } = lengths;
      const allowedLengths = Fn2._lengths;
      if (!isBytes2(item))
        return void 0;
      const l = abytes2(item, void 0, "key").length;
      const isPub = l === publicKey || l === publicKeyUncompressed;
      const isSec = l === secretKey || !!allowedLengths?.includes(l);
      if (isPub && isSec)
        return void 0;
      return isPub;
    }
    function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
      if (isProbPub(secretKeyA) === true)
        throw new Error("first arg must be private key");
      if (isProbPub(publicKeyB) === false)
        throw new Error("second arg must be public key");
      const s2 = Fn2.fromBytes(secretKeyA);
      const b = Point3.fromBytes(publicKeyB);
      if (b.is0())
        throw new Error("invalid public key: point at infinity");
      return b.multiply(s2).toBytes(isCompressed);
    }
    const utils = {
      isValidSecretKey,
      isValidPublicKey,
      randomSecretKey
    };
    const keygen = createKeygen(randomSecretKey, getPublicKey);
    Object.freeze(utils);
    Object.freeze(lengths);
    return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point: Point3, utils, lengths });
  }
  function ecdsa(Point3, hash, ecdsaOpts = {}) {
    validatePointCons(Point3);
    const hash_ = hash;
    ahash(hash_);
    validateObject(ecdsaOpts, {}, {
      hmac: "function",
      lowS: "boolean",
      randomBytes: "function",
      bits2int: "function",
      bits2int_modN: "function"
    });
    const opts = Object.assign({}, ecdsaOpts);
    const randomBytes3 = opts.randomBytes === void 0 ? randomBytes2 : opts.randomBytes;
    const hmac3 = opts.hmac === void 0 ? (key, msg) => hmac(hash_, key, msg) : opts.hmac;
    const { Fp, Fn: Fn2 } = Point3;
    const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn2;
    const blindLength = getMinHashLength(CURVE_ORDER);
    const csprng = probeRandomBytes(randomBytes3, blindLength);
    const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point3, opts);
    const defaultSigOpts = {
      prehash: true,
      lowS: typeof opts.lowS === "boolean" ? opts.lowS : true,
      format: "compact",
      extraEntropy: false
    };
    const hasLargeRecoveryLifts = CURVE_ORDER * _2n2 + _1n4 < Fp.ORDER;
    function isBiggerThanHalfOrder(number) {
      const HALF = CURVE_ORDER >> _1n4;
      return number > HALF;
    }
    function validateRS(title, num) {
      if (!Fn2.isValidNot0(num))
        throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
      return num;
    }
    function assertFieldSignIsSupported() {
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
    }
    function getRecoveryBit(x, y, r2) {
      assertFieldSignIsSupported();
      return (x === r2 ? 0 : 2) | Number(Fp.isOdd(y));
    }
    function assertRecoverableCurve() {
      if (hasLargeRecoveryLifts)
        throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
    }
    function validateSigLength(bytes2, format) {
      validateSigFormat(format);
      const size = lengths.signature;
      const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
      return abytes2(bytes2, sizer);
    }
    class Signature2 {
      constructor(r2, s2, recovery) {
        __publicField(this, "r");
        __publicField(this, "s");
        __publicField(this, "recovery");
        this.r = validateRS("r", r2);
        this.s = validateRS("s", s2);
        if (recovery != null) {
          assertRecoverableCurve();
          if (![0, 1, 2, 3].includes(recovery))
            throw new Error("invalid recovery id");
          this.recovery = recovery;
        }
        Object.freeze(this);
      }
      static fromBytes(bytes2, format = defaultSigOpts.format) {
        validateSigLength(bytes2, format);
        let recid;
        if (format === "der") {
          if (bytes2.length > 2 * Fn2.BYTES + 16)
            throw new DER.Err("invalid signature: DER signature too long");
          const { r: r3, s: s3 } = DER.toSig(abytes2(bytes2), Fn2.BYTES + 1);
          return new Signature2(r3, s3);
        }
        if (format === "recovered") {
          recid = bytes2[0];
          format = "compact";
          bytes2 = bytes2.subarray(1);
        }
        const L = lengths.signature / 2;
        const r2 = bytes2.subarray(0, L);
        const s2 = bytes2.subarray(L, L * 2);
        return new Signature2(Fn2.fromBytes(r2), Fn2.fromBytes(s2), recid);
      }
      static fromHex(hex, format) {
        return this.fromBytes(hexToBytes2(hex), format);
      }
      assertRecovery() {
        const { recovery } = this;
        if (recovery == null)
          throw new Error("invalid recovery id: must be present");
        return recovery;
      }
      addRecoveryBit(recovery) {
        return new Signature2(this.r, this.s, recovery);
      }
      // Unlike the top-level helper below, this method expects a digest that has
      // already been hashed to the curve's message representative.
      recoverPublicKey(messageHash) {
        const { r: r2, s: s2 } = this;
        const recovery = this.assertRecovery();
        const radj = recovery === 2 || recovery === 3 ? r2 + CURVE_ORDER : r2;
        if (!Fp.isValid(radj))
          throw new Error("invalid recovery id: sig.r+curve.n != R.x");
        const x = Fp.toBytes(radj);
        const R = Point3.fromBytes(concatBytes2(pprefix((recovery & 1) === 0), x));
        const ir = Fn2.inv(radj);
        const h = bits2int_modN(abytes2(messageHash, void 0, "msgHash"));
        const u1 = Fn2.create(-h * ir);
        const u2 = Fn2.create(s2 * ir);
        const Q = Point3.BASE.mulAddUnsafe(u1, R, u2);
        if (Q.is0())
          throw new Error("invalid recovery: point at infinify");
        Q.assertValidity();
        return Q;
      }
      // Signatures should be low-s, to prevent malleability.
      hasHighS() {
        return isBiggerThanHalfOrder(this.s);
      }
      toBytes(format = defaultSigOpts.format) {
        validateSigFormat(format);
        if (format === "der")
          return hexToBytes2(DER.hexFromSig(this));
        const { r: r2, s: s2 } = this;
        const rb = Fn2.toBytes(r2);
        const sb = Fn2.toBytes(s2);
        if (format === "recovered") {
          assertRecoverableCurve();
          return concatBytes2(Uint8Array.of(this.assertRecovery()), rb, sb);
        }
        return concatBytes2(rb, sb);
      }
      toHex(format) {
        return bytesToHex2(this.toBytes(format));
      }
    }
    Object.freeze(Signature2.prototype);
    Object.freeze(Signature2);
    const bits2int = opts.bits2int === void 0 ? function bits2int_def(bytes2) {
      if (bytes2.length > 8192)
        throw new Error("input is too large");
      const num = bytesToNumberBE(bytes2);
      const delta = bytes2.length * 8 - fnBits;
      return delta > 0 ? num >> BigInt(delta) : num;
    } : opts.bits2int;
    const bits2int_modN = opts.bits2int_modN === void 0 ? function bits2int_modN_def(bytes2) {
      return Fn2.create(bits2int(bytes2));
    } : opts.bits2int_modN;
    const ORDER_MASK = bitMask(fnBits);
    function int2octets(num) {
      aInRange("num < 2^" + fnBits, num, _0n5, ORDER_MASK);
      return Fn2.toBytes(num);
    }
    function validateMsgAndHash(message, prehash) {
      abytes2(message, void 0, "message");
      return prehash ? abytes2(hash_(message), void 0, "prehashed message") : message;
    }
    function prepSig(message, secretKey, opts2) {
      const { lowS, prehash, extraEntropy } = validateSigOpts(opts2, defaultSigOpts);
      message = validateMsgAndHash(message, prehash);
      const h1int = bits2int_modN(message);
      const d = Fn2.fromBytes(secretKey);
      if (!Fn2.isValidNot0(d))
        throw new Error("invalid private key");
      const seedArgs = [int2octets(d), int2octets(h1int)];
      if (extraEntropy != null && extraEntropy !== false) {
        const e = extraEntropy === true ? randomBytes3(lengths.secretKey) : extraEntropy;
        seedArgs.push(abytes2(e, void 0, "extraEntropy"));
      }
      const seed = concatBytes2(...seedArgs);
      const m = h1int;
      function k2sig(kBytes) {
        const k = bits2int(kBytes);
        if (!Fn2.isValidNot0(k))
          return;
        const q = Point3.BASE.multiply(k).toAffine();
        const r2 = Fn2.create(q.x);
        if (r2 === _0n5)
          return;
        let s2;
        if (csprng !== void 0) {
          const b = bytesToNumberBE(mapHashToField(csprng(blindLength), CURVE_ORDER));
          const ibk = Fn2.inv(Fn2.mul(b, k));
          const bm = Fn2.mul(b, m);
          const bd = Fn2.mul(b, d);
          s2 = Fn2.create(ibk * Fn2.create(bm + bd * r2));
        } else {
          const ik = invertCt(k, CURVE_ORDER);
          s2 = Fn2.create(ik * Fn2.create(m + r2 * d));
        }
        if (s2 === _0n5)
          return;
        let recovery = getRecoveryBit(q.x, q.y, r2);
        let normS = s2;
        if (lowS && isBiggerThanHalfOrder(s2)) {
          normS = Fn2.neg(s2);
          recovery ^= 1;
        }
        return new Signature2(r2, normS, hasLargeRecoveryLifts ? void 0 : recovery);
      }
      return { seed, k2sig };
    }
    function sign3(message, secretKey, opts2 = {}) {
      const { seed, k2sig } = prepSig(message, secretKey, opts2);
      const drbg = createHmacDrbg(hash_.outputLen, Fn2.BYTES, hmac3);
      const sig = drbg(seed, k2sig);
      return sig.toBytes(opts2.format);
    }
    function verify3(signature, message, publicKey, opts2 = {}) {
      const { lowS, prehash, format } = validateSigOpts(opts2, defaultSigOpts);
      publicKey = abytes2(publicKey, void 0, "publicKey");
      message = validateMsgAndHash(message, prehash);
      if (!isBytes2(signature)) {
        const end = signature instanceof Signature2 ? ", use sig.toBytes()" : "";
        throw new Error("verify expects Uint8Array signature" + end);
      }
      validateSigLength(signature, format);
      try {
        const sig = Signature2.fromBytes(signature, format);
        const P = Point3.fromBytes(publicKey);
        if (P.is0())
          return false;
        if (lowS && sig.hasHighS())
          return false;
        const { r: r2, s: s2 } = sig;
        const h = bits2int_modN(message);
        const is = Fn2.inv(s2);
        const u1 = Fn2.create(h * is);
        const u2 = Fn2.create(r2 * is);
        const R = Point3.BASE.mulAddUnsafe(u1, P, u2);
        if (R.is0())
          return false;
        const q = R.toAffine();
        const v = Fn2.create(q.x);
        if (v !== r2)
          return false;
        if (format === "recovered" && sig.recovery !== getRecoveryBit(q.x, q.y, r2))
          return false;
        return true;
      } catch (e) {
        return false;
      }
    }
    function recoverPublicKey(signature, message, opts2 = {}) {
      const { prehash } = validateSigOpts(opts2, defaultSigOpts);
      message = validateMsgAndHash(message, prehash);
      return Signature2.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
    }
    return Object.freeze({
      keygen,
      getPublicKey,
      getSharedSecret,
      utils,
      lengths,
      Point: Point3,
      sign: sign3,
      verify: verify3,
      recoverPublicKey,
      Signature: Signature2,
      hash: hash_
    });
  }

  // node_modules/@noble/curves/secp256k1.js
  var secp256k1_CURVE = {
    p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
  };
  var secp256k1_ENDO = {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    basises: [
      [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
      [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
    ]
  };
  var _2n3 = /* @__PURE__ */ BigInt(2);
  function sqrtMod(y) {
    const P = secp256k1_CURVE.p;
    const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P;
    const b3 = b2 * b2 * y % P;
    const b6 = pow2(b3, _3n3, P) * b3 % P;
    const b9 = pow2(b6, _3n3, P) * b3 % P;
    const b11 = pow2(b9, _2n3, P) * b2 % P;
    const b22 = pow2(b11, _11n, P) * b11 % P;
    const b44 = pow2(b22, _22n, P) * b22 % P;
    const b88 = pow2(b44, _44n, P) * b44 % P;
    const b176 = pow2(b88, _88n, P) * b88 % P;
    const b220 = pow2(b176, _44n, P) * b44 % P;
    const b223 = pow2(b220, _3n3, P) * b3 % P;
    const t1 = pow2(b223, _23n, P) * b22 % P;
    const t2 = pow2(t1, _6n, P) * b2 % P;
    const root = pow2(t2, _2n3, P);
    if (!Fpk1.eql(Fpk1.sqr(root), y))
      throw new Error("Cannot find square root");
    return root;
  }
  var Fpk1 = /* @__PURE__ */ Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
  var Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
    Fp: Fpk1,
    endo: secp256k1_ENDO
  });
  var secp256k1 = /* @__PURE__ */ ecdsa(Pointk1, sha256);

  // node_modules/@noble/hashes/legacy.js
  var Rho160 = /* @__PURE__ */ Uint8Array.from([
    7,
    4,
    13,
    1,
    10,
    6,
    15,
    3,
    12,
    0,
    9,
    5,
    2,
    14,
    11,
    8
  ]);
  var Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
  var Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
  var idxLR = /* @__PURE__ */ (() => {
    const L = [Id160];
    const R = [Pi160];
    const res = [L, R];
    for (let i = 0; i < 4; i++)
      for (let j of res)
        j.push(j[i].map((k) => Rho160[k]));
    return res;
  })();
  var idxL = /* @__PURE__ */ (() => idxLR[0])();
  var idxR = /* @__PURE__ */ (() => idxLR[1])();
  var shifts160 = /* @__PURE__ */ [
    [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
    [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
    [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
    [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
    [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
  ].map((i) => Uint8Array.from(i));
  var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
  var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
  var Kl160 = /* @__PURE__ */ Uint32Array.from([
    0,
    1518500249,
    1859775393,
    2400959708,
    2840853838
  ]);
  var Kr160 = /* @__PURE__ */ Uint32Array.from([
    1352829926,
    1548603684,
    1836072691,
    2053994217,
    0
  ]);
  function ripemd_f(group, x, y, z) {
    if (group === 0)
      return x ^ y ^ z;
    if (group === 1)
      return x & y | ~x & z;
    if (group === 2)
      return (x | ~y) ^ z;
    if (group === 3)
      return x & z | y & ~z;
    return x ^ (y | ~z);
  }
  var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
  var _RIPEMD160 = class extends HashMD {
    constructor() {
      super(64, 20, 8, true);
      __publicField(this, "h0", 1732584193 | 0);
      __publicField(this, "h1", 4023233417 | 0);
      __publicField(this, "h2", 2562383102 | 0);
      __publicField(this, "h3", 271733878 | 0);
      __publicField(this, "h4", 3285377520 | 0);
    }
    get() {
      const { h0, h1, h2, h3, h4 } = this;
      return [h0, h1, h2, h3, h4];
    }
    set(h0, h1, h2, h3, h4) {
      this.h0 = h0 | 0;
      this.h1 = h1 | 0;
      this.h2 = h2 | 0;
      this.h3 = h3 | 0;
      this.h4 = h4 | 0;
    }
    _cloneInto(to) {
      (to || (to = new this.constructor())).set(...this.get());
      return this._cloneIntoMeta(to);
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        BUF_160[i] = view.getUint32(offset, true);
      let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
      for (let group = 0; group < 5; group++) {
        const rGroup = 4 - group;
        const hbl = Kl160[group], hbr = Kr160[group];
        const rl = idxL[group], rr = idxR[group];
        const sl = shiftsL160[group], sr = shiftsR160[group];
        for (let i = 0; i < 16; i++) {
          const tl = rotl(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
          al = el, el = dl, dl = rotl(cl, 10) | 0, cl = bl, bl = tl;
        }
        for (let i = 0; i < 16; i++) {
          const tr = rotl(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
          ar = er, er = dr, dr = rotl(cr, 10) | 0, cr = br, br = tr;
        }
      }
      this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
    }
    roundClean() {
      clean(BUF_160);
    }
    destroy() {
      this.destroyed = true;
      clean(this.buffer);
      this.set(0, 0, 0, 0, 0);
    }
  };
  var ripemd160 = /* @__PURE__ */ createHasher(() => new _RIPEMD160());

  // node_modules/@scure/base/index.js
  var freeze = (fn) => Object.freeze(fn());
  function isBytes3(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
  }
  function abytes3(b) {
    if (!isBytes3(b))
      throw new TypeError("Uint8Array expected");
  }
  function afn(input) {
    if (typeof input !== "function")
      throw new TypeError("function expected");
    return true;
  }
  function astr(label, input) {
    if (typeof input !== "string")
      throw new TypeError(`${label}: string expected`);
    return true;
  }
  function anumber3(n, title = "number") {
    if (typeof n !== "number")
      throw new TypeError(`${title}: expected number, got ${typeof n}`);
    if (!Number.isSafeInteger(n))
      throw new RangeError(`${title}: expected safe integer, got ${n}`);
  }
  function chain(...args) {
    const id = (a) => a;
    const wrap = (a, b) => (c) => a(b(c));
    const encode2 = args.map((x) => x.encode).reduceRight(wrap, id);
    const decode = args.map((x) => x.decode).reduce(wrap, id);
    return { encode: encode2, decode };
  }
  var asciiDecoder = /* @__PURE__ */ (() => {
    try {
      const decoder = new TextDecoder();
      return decoder.decode(Uint8Array.of(65, 48, 43, 127)) === "A0+\x7F" ? decoder : void 0;
    } catch (e) {
      return void 0;
    }
  })();
  var B2S_CHUNK = 8192;
  function charcodesToString(codes) {
    const len = codes.length;
    if (asciiDecoder !== void 0 && len >= 12)
      return asciiDecoder.decode(codes);
    if (len <= B2S_CHUNK)
      return String.fromCharCode.apply(null, codes);
    let res = "";
    for (let i = 0; i < len; i += B2S_CHUNK)
      res += String.fromCharCode.apply(null, codes.subarray(i, i + B2S_CHUNK));
    return res;
  }
  function alphabet(letters, aliases) {
    const len = letters.length;
    if (len > 128)
      throw new Error("alphabet: max 128 letters");
    const encTable = new Uint8Array(len);
    const decTable = new Int8Array(128).fill(-1);
    for (let i = 0; i < len; i++) {
      const code = letters.charCodeAt(i);
      if (letters.codePointAt(i) !== code || code > 127)
        throw new Error("alphabet: single-char ASCII letters only");
      encTable[i] = code;
      decTable[code] = i;
    }
    if (aliases !== void 0) {
      for (const alias of Object.keys(aliases)) {
        const code = alias.charCodeAt(0);
        const target = decTable[aliases[alias].charCodeAt(0)];
        if (alias.length !== 1 || code > 127 || target === void 0 || target === -1)
          throw new Error(`alphabet: invalid alias ${alias}`);
        decTable[code] = target;
      }
    }
    return {
      encode: (digits) => {
        const codes = new Uint8Array(digits.length);
        for (let i = 0; i < digits.length; i++) {
          const d = digits[i];
          const code = encTable[d];
          if (code === void 0)
            throw new Error(`alphabet.encode: invalid digit ${d}`);
          codes[i] = code;
        }
        return charcodesToString(codes);
      },
      decode: (input) => {
        astr("decode", input);
        const slen = input.length;
        const digits = new Uint8Array(slen);
        for (let i = 0; i < slen; i++) {
          const code = input.charCodeAt(i);
          const digit = code < 128 ? decTable[code] : -1;
          if (digit === -1)
            throw new Error(`Unknown letter "${input[i]}". Allowed: ${letters}`);
          digits[i] = digit;
        }
        return digits;
      }
    };
  }
  function checksum(len, fn) {
    anumber3(len);
    if (len <= 0)
      throw new RangeError(`checksum length must be positive: ${len}`);
    afn(fn);
    const _fn = fn;
    return {
      encode(data) {
        abytes3(data);
        const sum = _fn(data).slice(0, len);
        const res = new Uint8Array(data.length + len);
        res.set(data);
        res.set(sum, data.length);
        return res;
      },
      decode(data) {
        abytes3(data);
        const payload = data.slice(0, -len);
        const oldChecksum = data.slice(-len);
        const newChecksum = _fn(payload).slice(0, len);
        for (let i = 0; i < len; i++)
          if (newChecksum[i] !== oldChecksum[i])
            throw new Error("Invalid checksum");
        return payload;
      }
    };
  }
  var B58_GROUP = 656356768;
  var RADIX_BASE_N_MAX_LENGTH = 65536;
  var BASE_N_MAX_BYTES = 2048;
  var BASE_N_MAX_CHARS = 4096;
  var radixBaseN = (BASE, GROUP) => ({
    encode: (bytes2) => {
      abytes3(bytes2);
      const blen = bytes2.length;
      if (blen === 0)
        return new Uint8Array(0);
      if (blen >= RADIX_BASE_N_MAX_LENGTH)
        throw new Error("invalid length");
      let zeros = 0;
      while (zeros < blen - 1 && bytes2[zeros] === 0)
        zeros++;
      const nlimbs = Math.ceil(blen / 2);
      const limbs = new Uint16Array(nlimbs);
      const odd = blen & 1;
      if (odd)
        limbs[0] = bytes2[0];
      for (let i = odd, j2 = odd; i < blen; i += 2, j2++)
        limbs[j2] = bytes2[i] << 8 | bytes2[i + 1];
      const groups = [];
      let pos = 0;
      while (pos < nlimbs) {
        let carry = 0;
        for (let i = pos; i < nlimbs; i++) {
          const cur = carry * 65536 + limbs[i];
          const q = Math.floor(cur / GROUP);
          carry = cur - q * GROUP;
          limbs[i] = q;
          if (q === 0 && i === pos)
            pos++;
        }
        groups.push(carry);
      }
      const top = groups.length - 1;
      let sig = top * 5;
      for (let v = groups[top]; ; v = Math.floor(v / BASE)) {
        sig++;
        if (v < BASE)
          break;
      }
      const res = new Uint8Array(zeros + sig);
      let j = res.length - 1;
      for (let g = 0; g < top; g++) {
        let v = groups[g];
        for (let k = 0; k < 5; k++) {
          res[j--] = v % BASE;
          v = Math.floor(v / BASE);
        }
      }
      for (let v = groups[top]; j >= zeros; v = Math.floor(v / BASE))
        res[j--] = v % BASE;
      return res;
    },
    decode: (digits) => {
      abytes3(digits);
      const dlen = digits.length;
      if (dlen === 0)
        return new Uint8Array(0);
      if (dlen >= RADIX_BASE_N_MAX_LENGTH)
        throw new Error("invalid length");
      let zeros = 0;
      while (zeros < dlen - 1 && digits[zeros] === 0)
        zeros++;
      const limbs = new Uint16Array(Math.ceil(dlen * 6 / 16) + 1);
      let used = 0;
      let i = 0;
      let group = dlen % 5 || 5;
      while (i < dlen) {
        let gval = 0;
        let factor = 1;
        for (const end = i + group; i < end; i++) {
          const d = digits[i];
          if (d >= BASE)
            throw new Error(`invalid integer: ${d}`);
          gval = gval * BASE + d;
          factor *= BASE;
        }
        group = 5;
        let carry = gval;
        for (let k = 0; k < used; k++) {
          const cur = limbs[k] * factor + carry;
          carry = Math.floor(cur / 65536);
          limbs[k] = cur - carry * 65536;
        }
        for (; carry > 0; carry = Math.floor(carry / 65536))
          limbs[used++] = carry % 65536;
      }
      const valueBytes = used === 0 ? 1 : used * 2 - (limbs[used - 1] < 256 ? 1 : 0);
      const res = new Uint8Array(zeros + valueBytes);
      let j = res.length - 1;
      for (let k = 0; k < used; k++) {
        const limb = limbs[k];
        res[j--] = limb & 255;
        if (j >= zeros)
          res[j--] = limb >> 8;
      }
      return res;
    }
  });
  var genBaseN = (radix, abc) => {
    const letters = alphabet(abc);
    return {
      encode(bytes2) {
        abytes3(bytes2);
        if (bytes2.length > BASE_N_MAX_BYTES)
          throw new Error("invalid length");
        return letters.encode(radix.encode(bytes2));
      },
      decode(str) {
        astr("baseN.decode", str);
        if (str.length > BASE_N_MAX_CHARS)
          throw new Error("invalid length");
        return radix.decode(letters.decode(str));
      }
    };
  };
  var radix58 = /* @__PURE__ */ radixBaseN(58, B58_GROUP);
  var genBase58 = (abc) => genBaseN(radix58, abc);
  var base58 = /* @__PURE__ */ freeze(() => genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"));
  var createBase58check = (sha2563) => {
    afn(sha2563);
    const _sha256 = sha2563;
    return chain(checksum(4, (data) => _sha256(_sha256(data))), base58);
  };

  // node_modules/@scure/bip32/index.js
  var Point = /* @__PURE__ */ (() => secp256k1.Point)();
  var Fn = /* @__PURE__ */ (() => Point.Fn)();
  var base58check = /* @__PURE__ */ createBase58check(sha256);
  var MASTER_SECRET = /* @__PURE__ */ (() => {
    return Uint8Array.from("Bitcoin seed".split(""), (char) => char.charCodeAt(0));
  })();
  var BITCOIN_VERSIONS = { private: 76066276, public: 76067358 };
  var HARDENED_OFFSET = 2147483648;
  var MAX_DEPTH = 255;
  var hash160 = (data) => ripemd160(sha256(data));
  var fromU32 = (data) => createView(data).getUint32(0, false);
  var toU32 = (n, title = "number") => {
    if (typeof n !== "number")
      throw new TypeError(`"${title}" expected number, got type=${typeof n}`);
    if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1)
      throw new RangeError(`"${title}" expected integer in range 0..2**32-1, got ${n}`);
    const buf = new Uint8Array(4);
    createView(buf).setUint32(0, n, false);
    return buf;
  };
  var validateVersions = (versions, title = "versions") => {
    if (!(typeof versions === "object" && versions !== null))
      throw new Error("versions must be an object");
    toU32(versions.private, `${title}.private`);
    toU32(versions.public, `${title}.public`);
    return versions;
  };
  var HDKey = class _HDKey {
    constructor(opt) {
      __publicField(this, "versions");
      __publicField(this, "depth", 0);
      __publicField(this, "index", 0);
      __publicField(this, "parentFingerprint", 0);
      __publicField(this, "_chainCode", null);
      __publicField(this, "_privateKey");
      __publicField(this, "_publicKey");
      __publicField(this, "_pubHash");
      if (!opt || typeof opt !== "object") {
        throw new Error("HDKey.constructor must not be called directly");
      }
      const depth = opt.depth ?? 0;
      const index = opt.index ?? 0;
      const parentFingerprint = opt.parentFingerprint ?? 0;
      if (!Number.isSafeInteger(depth) || depth < 0 || depth > MAX_DEPTH) {
        throw new RangeError("HDKey: depth must be an integer in range 0..255");
      }
      toU32(index, "index");
      toU32(parentFingerprint, "parentFingerprint");
      if (depth === 0 && (index !== 0 || parentFingerprint !== 0)) {
        throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
      }
      this.versions = opt.versions ? validateVersions(opt.versions) : BITCOIN_VERSIONS;
      this.depth = depth;
      if (opt.chainCode)
        abytes(opt.chainCode, 32);
      this._chainCode = opt.chainCode ? Uint8Array.from(opt.chainCode) : null;
      this.index = index;
      this.parentFingerprint = parentFingerprint;
      if (opt.publicKey && opt.privateKey) {
        throw new Error("HDKey: publicKey and privateKey at same time.");
      }
      if (opt.privateKey) {
        if (!secp256k1.utils.isValidSecretKey(opt.privateKey))
          throw new Error("Invalid private key");
        this._privateKey = Uint8Array.from(opt.privateKey);
        this._publicKey = secp256k1.getPublicKey(this._privateKey, true);
      } else if (opt.publicKey) {
        this._publicKey = Point.fromBytes(opt.publicKey).toBytes(true);
      } else {
        throw new Error("HDKey: no public or private key provided");
      }
      this._pubHash = hash160(this._publicKey);
    }
    get fingerprint() {
      if (!this._pubHash) {
        throw new Error("No publicKey set!");
      }
      return fromU32(this._pubHash);
    }
    get identifier() {
      return this._pubHash ? Uint8Array.from(this._pubHash) : void 0;
    }
    get pubKeyHash() {
      return this._pubHash ? Uint8Array.from(this._pubHash) : void 0;
    }
    get privateKey() {
      return this._privateKey ? Uint8Array.from(this._privateKey) : null;
    }
    get publicKey() {
      return this._publicKey ? Uint8Array.from(this._publicKey) : null;
    }
    get chainCode() {
      return this._chainCode ? Uint8Array.from(this._chainCode) : null;
    }
    get privateExtendedKey() {
      const priv = this._privateKey;
      if (!priv) {
        throw new Error("No private key");
      }
      return base58check.encode(this.serialize(this.versions.private, concatBytes(Uint8Array.of(0), priv)));
    }
    get publicExtendedKey() {
      if (!this._publicKey) {
        throw new Error("No public key");
      }
      return base58check.encode(this.serialize(this.versions.public, this._publicKey));
    }
    static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
      abytes(seed);
      versions = validateVersions(versions);
      if (8 * seed.length < 128 || 8 * seed.length > 512) {
        throw new RangeError("HDKey: seed length must be between 128 and 512 bits; 256 bits is advised, got " + seed.length);
      }
      const I = hmac(sha512, MASTER_SECRET, seed);
      const privateKey = I.slice(0, 32);
      const chainCode = I.slice(32);
      return new _HDKey({ versions, chainCode, privateKey });
    }
    static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
      versions = validateVersions(versions);
      const keyBuffer = base58check.decode(base58key);
      if (keyBuffer.length !== 78) {
        throw new Error(`HDKey: invalid extended key length: expected 78 bytes, got ${keyBuffer.length}`);
      }
      const keyView = createView(keyBuffer);
      const version = keyView.getUint32(0, false);
      const opt = {
        versions,
        depth: keyBuffer[4],
        parentFingerprint: keyView.getUint32(5, false),
        index: keyView.getUint32(9, false),
        chainCode: keyBuffer.slice(13, 45)
      };
      const key = keyBuffer.slice(45);
      const isPriv = key[0] === 0;
      if (version !== versions[isPriv ? "private" : "public"]) {
        throw new Error("Version mismatch");
      }
      if (isPriv) {
        return new _HDKey({ ...opt, privateKey: key.slice(1) });
      } else {
        return new _HDKey({ ...opt, publicKey: key });
      }
    }
    static fromJSON(json) {
      return _HDKey.fromExtendedKey("xpriv" in json ? json.xpriv : json.xpub);
    }
    derive(path) {
      if (!/^[mM]'?/.test(path)) {
        throw new Error('Path must start with "m" or "M"');
      }
      if (/^[mM]'?$/.test(path)) {
        return this;
      }
      const parts = path.replace(/^[mM]'?\//, "").split("/");
      if (parts.length > MAX_DEPTH - this.depth) {
        throw new Error("HDKey: path exceeds the serializable depth 255");
      }
      let child = this;
      for (const c of parts) {
        const m = /^(\d+)('?)$/.exec(c);
        const m1 = m && m[1];
        if (!m || m.length !== 3 || typeof m1 !== "string")
          throw new Error("invalid child index: " + c);
        let idx = +m1;
        if (!Number.isSafeInteger(idx) || idx >= HARDENED_OFFSET) {
          throw new Error("Invalid index");
        }
        if (m[2] === "'") {
          idx += HARDENED_OFFSET;
        }
        child = child.deriveChild(idx);
      }
      return child;
    }
    deriveChild(index) {
      return this._deriveChild(index);
    }
    /** Test-only implementation seam. Production callers must use deriveChild(). */
    _deriveChild(index, _I) {
      if (!this._publicKey || !this._chainCode) {
        throw new Error("No publicKey or chainCode set");
      }
      let data = toU32(index, "index");
      if (index >= HARDENED_OFFSET) {
        const priv = this._privateKey;
        if (!priv) {
          throw new Error("Could not derive hardened child key");
        }
        data = concatBytes(Uint8Array.of(0), priv, data);
      } else {
        data = concatBytes(this._publicKey, data);
      }
      const out = _I || hmac(sha512, this._chainCode, data);
      abytes(out, 64);
      const childTweak = out.slice(0, 32);
      const chainCode = out.slice(32);
      const opt = {
        versions: this.versions,
        chainCode,
        depth: this.depth + 1,
        parentFingerprint: this.fingerprint,
        index
      };
      if (opt.depth > MAX_DEPTH) {
        throw new Error("HDKey: depth exceeds the serializable value 255");
      }
      const retry = () => {
        const maxIndex = this._privateKey ? 2 ** 32 - 1 : HARDENED_OFFSET - 1;
        if (index >= maxIndex) {
          throw new Error(`HDKey: cannot retry child derivation at index ${index}`);
        }
        return this.deriveChild(index + 1);
      };
      const ctweak = Fn.fromBytes(childTweak, true);
      if (!Fn.isValid(ctweak))
        return retry();
      if (this._privateKey) {
        const added = Fn.create(Fn.fromBytes(this._privateKey) + ctweak);
        if (!Fn.isValidNot0(added))
          return retry();
        opt.privateKey = Fn.toBytes(added);
      } else {
        const point = Point.fromBytes(this._publicKey);
        const added = ctweak === 0n ? point : point.add(Point.BASE.multiply(ctweak));
        if (added.equals(Point.ZERO))
          return retry();
        opt.publicKey = added.toBytes(true);
      }
      return new _HDKey(opt);
    }
    sign(hash) {
      if (!this._privateKey) {
        throw new Error("No privateKey set!");
      }
      abytes(hash, 32);
      return secp256k1.sign(hash, this._privateKey, { prehash: false });
    }
    verify(hash, signature) {
      abytes(hash, 32);
      abytes(signature, 64);
      if (!this._publicKey) {
        throw new Error("No publicKey set!");
      }
      return secp256k1.verify(signature, hash, this._publicKey, { prehash: false });
    }
    wipePrivateData() {
      if (this._privateKey) {
        this._privateKey.fill(0);
        this._privateKey = void 0;
      }
      return this;
    }
    // TODO(v3): Make automatic JSON serialization public-only so JSON.stringify cannot expose xpriv.
    toJSON() {
      return this.toPrivateJSON();
    }
    /**
     * Explicitly exports private key material. Treat the returned value as a secret.
     */
    toPrivateJSON() {
      return {
        xpriv: this.privateExtendedKey,
        xpub: this.publicExtendedKey
      };
    }
    serialize(version, key) {
      if (!this._chainCode) {
        throw new Error("No chainCode set");
      }
      abytes(key, 33);
      return concatBytes(toU32(version, "version"), new Uint8Array([this.depth]), toU32(this.parentFingerprint, "parentFingerprint"), toU32(this.index, "index"), this._chainCode, key);
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/BigNumber.js
  var BufferCtor = globalThis.Buffer;
  var CAN_USE_BUFFER = BufferCtor != null && typeof BufferCtor.from === "function";
  var HEX_CHAR_TO_VALUE = new Int8Array(256).fill(-1);
  for (let i = 0; i < 10; i++) {
    HEX_CHAR_TO_VALUE[48 + i] = i;
  }
  for (let i = 0; i < 6; i++) {
    HEX_CHAR_TO_VALUE[65 + i] = 10 + i;
    HEX_CHAR_TO_VALUE[97 + i] = 10 + i;
  }
  var _WORD_SIZE_BIGINT, _WORD_MASK, _MAX_SAFE_INTEGER_BIGINT, _MIN_SAFE_INTEGER_BIGINT, _MAX_IMULN_ARG, _MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT, _MAX_NOMINAL_WORD_LENGTH, __magnitude, __sign, __nominalWordLength, _BigNumber_instances, _computedWordsArray_get, _initFromString_fn, _initFromHexString_fn, _initFromNonHexString_fn, _bigIntToStringInBase_fn, _parseBaseString_fn, _parseBaseWord_fn, _initializeState_fn, _finishInitialization_fn, assert_fn, initNumber_fn, initArray_fn, _getMinimalHex_fn, _toHexString_fn, toBaseString_fn, _BigNumber_static, _paddedZero_fn, _zeroPaddedChunk_fn, toArrayLikeGeneric_fn, _getSignedValue_fn, _setValueFromSigned_fn, _iuop_fn, _iop_fn, _uop_new_fn, normalizeNonNegativeBigInt_fn, _computeMod_fn, _bigNumberFromSigned_fn;
  var _BigNumber = class _BigNumber {
    /**
     * @constructor
     *
     * @param number - The number (various types accepted) to construct a BigNumber from. Default is 0.
     * @param base - The base of number provided. By default is 10.
     * @param endian - The endianness provided. By default is 'big endian'.
     */
    constructor(number = 0, base = 10, endian = "be") {
      __privateAdd(this, _BigNumber_instances);
      __privateAdd(this, __magnitude, 0n);
      __privateAdd(this, __sign, 0);
      __privateAdd(this, __nominalWordLength, 1);
      /**
       * Reduction context of the big number.
       *
       * @property red
       */
      __publicField(this, "red", null);
      number ?? (number = 0);
      if (typeof number === "bigint") {
        __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, number < 0n ? -number : number, number < 0n ? 1 : 0);
        this.normSign();
        return;
      }
      const baseIsEndian = base === "le" || base === "be";
      const effectiveBase = baseIsEndian ? 10 : base;
      const effectiveEndian = baseIsEndian ? base : endian;
      if (typeof number === "number") {
        __privateMethod(this, _BigNumber_instances, initNumber_fn).call(this, number, effectiveEndian);
        return;
      }
      if (Array.isArray(number)) {
        __privateMethod(this, _BigNumber_instances, initArray_fn).call(this, number, effectiveEndian);
        return;
      }
      if (typeof number === "string") {
        __privateMethod(this, _BigNumber_instances, _initFromString_fn).call(this, number, effectiveBase, effectiveEndian);
        return;
      }
      if (number !== 0) {
        __privateMethod(this, _BigNumber_instances, assert_fn).call(this, false, "Unsupported input type for BigNumber constructor");
      } else {
        __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, 0n, 0);
      }
    }
    /**
     * Negative flag. Indicates whether the big number is a negative number.
     * - If 0, the number is positive.
     * - If 1, the number is negative.
     *
     * @property negative
     */
    get negative() {
      return __privateGet(this, __sign);
    }
    /**
     * Sets the negative flag. Only 0 (positive) or 1 (negative) are allowed.
     */
    set negative(val) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, val === 0 || val === 1, "Negative property must be 0 or 1");
      const newSign = val === 1 ? 1 : 0;
      if (__privateGet(this, __magnitude) === 0n) {
        __privateSet(this, __sign, 0);
      } else {
        __privateSet(this, __sign, newSign);
      }
    }
    /**
     * Array of numbers, where each number represents a part of the value of the big number.
     *
     * @property words
     */
    get words() {
      if (!Number.isSafeInteger(__privateGet(this, __nominalWordLength)) || __privateGet(this, __nominalWordLength) < 1 || __privateGet(this, __nominalWordLength) > __privateGet(_BigNumber, _MAX_NOMINAL_WORD_LENGTH)) {
        throw new Error("BigNumber word length exceeds the supported limit");
      }
      const computed = __privateGet(this, _BigNumber_instances, _computedWordsArray_get);
      if (__privateGet(this, __nominalWordLength) <= computed.length) {
        return computed;
      }
      const paddedWords = Array.from({ length: __privateGet(this, __nominalWordLength) }).fill(0);
      for (let i = 0; i < computed.length; i++) {
        paddedWords[i] = computed[i];
      }
      return paddedWords;
    }
    /**
     * Sets the words array representing the value of the big number.
     */
    set words(newWords) {
      const oldSign = __privateGet(this, __sign);
      let newMagnitude = 0n;
      const len = newWords.length > 0 ? newWords.length : 1;
      for (let i = len - 1; i >= 0; i--) {
        const wordVal = newWords[i] ?? 0;
        newMagnitude = newMagnitude << __privateGet(_BigNumber, _WORD_SIZE_BIGINT) | BigInt(wordVal & Number(__privateGet(_BigNumber, _WORD_MASK)));
      }
      __privateSet(this, __magnitude, newMagnitude);
      __privateSet(this, __sign, oldSign);
      __privateSet(this, __nominalWordLength, len);
      this.normSign();
    }
    /**
     * Length of the words array.
     *
     * @property length
     */
    get length() {
      return Math.max(1, __privateGet(this, __nominalWordLength));
    }
    /**
     * Checks whether a value is an instance of BigNumber. Regular JS numbers fail this check.
     *
     * @method isBN
     * @param num - The value to be checked.
     * @returns - Returns a boolean value determining whether or not the checked num parameter is a BigNumber.
     */
    static isBN(num) {
      if (num instanceof _BigNumber)
        return true;
      return num !== null && typeof num === "object" && num.constructor?.wordSize === _BigNumber.wordSize && Array.isArray(num.words);
    }
    /**
     * Returns the bigger value between two BigNumbers
     *
     * @method max
     * @param left - The first BigNumber to be compared.
     * @param right - The second BigNumber to be compared.
     * @returns - Returns the bigger BigNumber between left and right.
     */
    static max(left, right) {
      return left.cmp(right) > 0 ? left : right;
    }
    /**
     * Returns the smaller value between two BigNumbers
     *
     * @method min
     * @param left - The first BigNumber to be compared.
     * @param right - The second BigNumber to be compared.
     * @returns - Returns the smaller value between left and right.
     */
    static min(left, right) {
      return left.cmp(right) < 0 ? left : right;
    }
    copy(dest) {
      __privateSet(dest, __magnitude, __privateGet(this, __magnitude));
      __privateSet(dest, __sign, __privateGet(this, __sign));
      __privateSet(dest, __nominalWordLength, __privateGet(this, __nominalWordLength));
      dest.red = this.red;
    }
    static move(dest, src) {
      __privateSet(dest, __magnitude, __privateGet(src, __magnitude));
      __privateSet(dest, __sign, __privateGet(src, __sign));
      __privateSet(dest, __nominalWordLength, __privateGet(src, __nominalWordLength));
      dest.red = src.red;
    }
    clone() {
      const r2 = new _BigNumber(0n);
      this.copy(r2);
      return r2;
    }
    expand(size) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, Number.isSafeInteger(size) && size >= 0 && size <= __privateGet(_BigNumber, _MAX_NOMINAL_WORD_LENGTH), "Expand size must be a non-negative safe integer within the supported word limit");
      __privateSet(this, __nominalWordLength, Math.max(__privateGet(this, __nominalWordLength), size, 1));
      return this;
    }
    strip() {
      __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
      return this.normSign();
    }
    normSign() {
      if (__privateGet(this, __magnitude) === 0n) {
        __privateSet(this, __sign, 0);
      }
      return this;
    }
    inspect() {
      return (this.red === null ? "<BN: " : "<BN-R: ") + this.toString(16) + ">";
    }
    /**
     * Converts the BigNumber instance to a string representation.
     *
     * @method toString
     * @param base - The base for representing number. Default is 10. Other accepted values are 16 and 'hex'.
     * @param padding - Represents the minimum number of digits to represent the BigNumber as a string. Default is 1.
     * @returns The string representation of the BigNumber instance
     */
    toString(base = 10, padding = 1) {
      if (base === 16 || base === "hex") {
        return __privateMethod(this, _BigNumber_instances, _toHexString_fn).call(this, padding);
      }
      if (typeof base !== "number" || base < 2 || base > 36 || base % 1 !== 0)
        throw new Error("Base should be an integer between 2 and 36");
      return __privateMethod(this, _BigNumber_instances, toBaseString_fn).call(this, base, padding);
    }
    /**
     * Converts the BigNumber instance to a JavaScript number.
     * Please note that JavaScript numbers are only precise up to 53 bits.
     *
     * @method toNumber
     * @throws If the BigNumber instance cannot be safely stored in a JavaScript number
     * @returns The JavaScript number representation of the BigNumber instance.
     */
    toNumber() {
      const val = __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
      if (val > __privateGet(_BigNumber, _MAX_SAFE_INTEGER_BIGINT) || val < __privateGet(_BigNumber, _MIN_SAFE_INTEGER_BIGINT))
        throw new Error("Number can only safely store up to 53 bits");
      return Number(val);
    }
    /**
     * Returns the signed BigInt representation of this BigNumber without any safety checks.
     *
     * @method toBigInt
     * @returns bigint value for this BigNumber.
     */
    toBigInt() {
      return __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
    }
    /**
     * Converts the BigNumber instance to a JSON-formatted string.
     *
     * @method toJSON
     * @returns The JSON string representation of the BigNumber instance.
     */
    toJSON() {
      const hex = __privateMethod(this, _BigNumber_instances, _getMinimalHex_fn).call(this);
      return (this.isNeg() ? "-" : "") + hex;
    }
    /**
     * Converts the BigNumber instance to an array of bytes.
     *
     * @method toArray
     * @param endian - Endianness of the output array, defaults to 'be'.
     * @param length - Optional length of the output array.
     * @returns Array of bytes representing the BigNumber.
     */
    toArray(endian = "be", length) {
      this.strip();
      const actualByteLength = this.byteLength();
      const reqLength = length ?? Math.max(1, actualByteLength);
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, actualByteLength <= reqLength, "byte array longer than desired length");
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, reqLength > 0, "Requested array length <= 0");
      const res = Array.from({ length: reqLength }).fill(0);
      if (__privateGet(this, __magnitude) === 0n && reqLength > 0)
        return res;
      if (__privateGet(this, __magnitude) === 0n && reqLength === 0)
        return [];
      __privateMethod(this, _BigNumber_instances, toArrayLikeGeneric_fn).call(this, res, endian === "le");
      return res;
    }
    /**
     * Calculates the number of bits required to represent the BigNumber.
     *
     * @method bitLength
     * @returns The bit length of the BigNumber.
     */
    bitLength() {
      if (__privateGet(this, __magnitude) === 0n) {
        return 0;
      }
      return __privateGet(this, __magnitude).toString(2).length;
    }
    /**
     * Converts a BigNumber to an array of bits.
     *
     * @method toBitArray
     * @param num - The BigNumber to convert.
     * @returns An array of bits.
     */
    static toBitArray(num) {
      const len = num.bitLength();
      if (len === 0)
        return [];
      const w = Array.from({ length: len });
      const mag = __privateGet(num, __magnitude);
      for (let bit = 0; bit < len; bit++) {
        w[bit] = (mag >> BigInt(bit) & 1n) === 0n ? 0 : 1;
      }
      return w;
    }
    /**
     * Instance version of {@link toBitArray}.
     */
    toBitArray() {
      return _BigNumber.toBitArray(this);
    }
    /**
     * Returns the number of trailing zero bits in the big number.
     *
     * @method zeroBits
     * @returns Returns the number of trailing zero bits
     * in the binary representation of the big number.
     *
     * @example
     * const bn = new BigNumber('8'); // binary: 1000
     * const zeroBits = bn.zeroBits(); // 3
     */
    zeroBits() {
      if (__privateGet(this, __magnitude) === 0n)
        return 0;
      let c = 0;
      let t = __privateGet(this, __magnitude);
      while ((t & 1n) === 0n && t !== 0n) {
        c++;
        t >>= 1n;
      }
      return c;
    }
    /**
     * Calculates the number of bytes required to represent the BigNumber.
     *
     * @method byteLength
     * @returns The byte length of the BigNumber.
     */
    byteLength() {
      if (__privateGet(this, __magnitude) === 0n) {
        return 0;
      }
      return Math.ceil(this.bitLength() / 8);
    }
    toTwos(width) {
      var _a;
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, width >= 0);
      const Bw = BigInt(width);
      let v = __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
      if (__privateGet(this, __sign) === 1 && __privateGet(this, __magnitude) !== 0n)
        v = (1n << Bw) + v;
      const m = (1n << Bw) - 1n;
      v &= m;
      const r2 = new _BigNumber(0n);
      __privateMethod(_a = r2, _BigNumber_instances, _initializeState_fn).call(_a, v, 0);
      return r2;
    }
    fromTwos(width) {
      var _a;
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, width >= 0);
      const Bw = BigInt(width);
      const m = __privateGet(this, __magnitude);
      if (width > 0 && (m >> Bw - 1n & 1n) !== 0n && __privateGet(this, __sign) === 0) {
        const sVal = m - (1n << Bw);
        const r2 = new _BigNumber(0n);
        __privateMethod(_a = r2, _BigNumber_instances, _setValueFromSigned_fn).call(_a, sVal);
        return r2;
      }
      return this.clone();
    }
    isNeg() {
      return __privateGet(this, __sign) === 1 && __privateGet(this, __magnitude) !== 0n;
    }
    neg() {
      return this.clone().ineg();
    }
    ineg() {
      if (__privateGet(this, __magnitude) !== 0n) {
        __privateSet(this, __sign, __privateGet(this, __sign) === 1 ? 0 : 1);
      }
      return this;
    }
    iuor(num) {
      return __privateMethod(this, _BigNumber_instances, _iuop_fn).call(this, num, (a, b) => a | b);
    }
    iuand(num) {
      return __privateMethod(this, _BigNumber_instances, _iuop_fn).call(this, num, (a, b) => a & b);
    }
    iuxor(num) {
      return __privateMethod(this, _BigNumber_instances, _iuop_fn).call(this, num, (a, b) => a ^ b, true);
    }
    ior(num) {
      return __privateMethod(this, _BigNumber_instances, _iop_fn).call(this, num, (a, b) => a | b);
    }
    iand(num) {
      return __privateMethod(this, _BigNumber_instances, _iop_fn).call(this, num, (a, b) => a & b);
    }
    ixor(num) {
      return __privateMethod(this, _BigNumber_instances, _iop_fn).call(this, num, (a, b) => a ^ b, true);
    }
    or(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0 && __privateGet(num, __sign) === 0);
      return __privateMethod(this, _BigNumber_instances, _uop_new_fn).call(this, num, "iuor");
    }
    uor(num) {
      return __privateMethod(this, _BigNumber_instances, _uop_new_fn).call(this, num, "iuor");
    }
    and(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0 && __privateGet(num, __sign) === 0);
      return __privateMethod(this, _BigNumber_instances, _uop_new_fn).call(this, num, "iuand");
    }
    uand(num) {
      return __privateMethod(this, _BigNumber_instances, _uop_new_fn).call(this, num, "iuand");
    }
    xor(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0 && __privateGet(num, __sign) === 0);
      return __privateMethod(this, _BigNumber_instances, _uop_new_fn).call(this, num, "iuxor");
    }
    uxor(num) {
      return __privateMethod(this, _BigNumber_instances, _uop_new_fn).call(this, num, "iuxor");
    }
    inotn(width) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof width === "number" && width >= 0);
      const Bw = BigInt(width);
      const m = (1n << Bw) - 1n;
      __privateSet(this, __magnitude, ~__privateGet(this, __magnitude) & m);
      const wfw = width === 0 ? 1 : Math.ceil(width / _BigNumber.wordSize);
      __privateSet(this, __nominalWordLength, Math.max(1, wfw));
      this.strip();
      __privateSet(this, __nominalWordLength, Math.max(__privateGet(this, __nominalWordLength), Math.max(1, wfw)));
      return this;
    }
    notn(width) {
      return this.clone().inotn(width);
    }
    setn(bit, val) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof bit === "number" && bit >= 0);
      const Bb = BigInt(bit);
      if (val === 1 || val === true)
        __privateSet(this, __magnitude, __privateGet(this, __magnitude) | 1n << Bb);
      else
        __privateSet(this, __magnitude, __privateGet(this, __magnitude) & ~(1n << Bb));
      const wnb = Math.floor(bit / _BigNumber.wordSize) + 1;
      __privateSet(this, __nominalWordLength, Math.max(__privateGet(this, __nominalWordLength), wnb));
      __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
      return this.strip();
    }
    iadd(num) {
      var _a;
      __privateMethod(this, _BigNumber_instances, _setValueFromSigned_fn).call(this, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) + __privateMethod(_a = num, _BigNumber_instances, _getSignedValue_fn).call(_a));
      return this;
    }
    add(num) {
      var _a, _b;
      const r2 = new _BigNumber(0n);
      __privateMethod(_b = r2, _BigNumber_instances, _setValueFromSigned_fn).call(_b, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) + __privateMethod(_a = num, _BigNumber_instances, _getSignedValue_fn).call(_a));
      return r2;
    }
    isub(num) {
      var _a;
      __privateMethod(this, _BigNumber_instances, _setValueFromSigned_fn).call(this, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) - __privateMethod(_a = num, _BigNumber_instances, _getSignedValue_fn).call(_a));
      return this;
    }
    sub(num) {
      var _a, _b;
      const r2 = new _BigNumber(0n);
      __privateMethod(_b = r2, _BigNumber_instances, _setValueFromSigned_fn).call(_b, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) - __privateMethod(_a = num, _BigNumber_instances, _getSignedValue_fn).call(_a));
      return r2;
    }
    mul(num) {
      const r2 = new _BigNumber(0n);
      __privateSet(r2, __magnitude, __privateGet(this, __magnitude) * __privateGet(num, __magnitude));
      __privateSet(r2, __sign, __privateGet(r2, __magnitude) === 0n ? 0 : __privateGet(this, __sign) ^ __privateGet(num, __sign));
      __privateSet(r2, __nominalWordLength, this.length + num.length);
      r2.red = null;
      return r2.normSign();
    }
    imul(num) {
      __privateSet(this, __magnitude, __privateGet(this, __magnitude) * __privateGet(num, __magnitude));
      __privateSet(this, __sign, __privateGet(this, __magnitude) === 0n ? 0 : __privateGet(this, __sign) ^ __privateGet(num, __sign));
      __privateSet(this, __nominalWordLength, this.length + num.length);
      this.red = null;
      return this.normSign();
    }
    imuln(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof num === "number", "Assertion failed");
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, Math.abs(num) <= __privateGet(_BigNumber, _MAX_IMULN_ARG), "Assertion failed");
      __privateMethod(this, _BigNumber_instances, _setValueFromSigned_fn).call(this, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) * BigInt(num));
      return this;
    }
    muln(num) {
      return this.clone().imuln(num);
    }
    sqr() {
      const r2 = new _BigNumber(0n);
      __privateSet(r2, __magnitude, __privateGet(this, __magnitude) * __privateGet(this, __magnitude));
      __privateSet(r2, __sign, 0);
      __privateSet(r2, __nominalWordLength, this.length * 2);
      r2.red = null;
      return r2;
    }
    isqr() {
      __privateSet(this, __magnitude, __privateGet(this, __magnitude) * __privateGet(this, __magnitude));
      __privateSet(this, __sign, 0);
      __privateSet(this, __nominalWordLength, this.length * 2);
      this.red = null;
      return this;
    }
    pow(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(num, __sign) === 0, "Exponent for pow must be non-negative");
      if (num.isZero())
        return new _BigNumber(1n);
      const res = new _BigNumber(1n);
      const currentBase = this.clone();
      const exp = num.clone();
      const baseIsNegative = currentBase.isNeg();
      const expIsOdd = exp.isOdd();
      if (baseIsNegative)
        currentBase.ineg();
      while (!exp.isZero()) {
        if (exp.isOdd()) {
          res.imul(currentBase);
        }
        currentBase.isqr();
        exp.iushrn(1);
      }
      if (baseIsNegative && expIsOdd) {
        res.ineg();
      }
      return res;
    }
    iushln(bits) {
      var _a;
      const normalizedBits = __privateMethod(_a = _BigNumber, _BigNumber_static, normalizeNonNegativeBigInt_fn).call(_a, bits, "Shift bits");
      if (normalizedBits === 0n)
        return this;
      __privateSet(this, __magnitude, __privateGet(this, __magnitude) << normalizedBits);
      __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
      return this.strip();
    }
    ishln(bits) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0, "ishln requires positive number");
      return this.iushln(bits);
    }
    iushrn(bits, hint, extended) {
      var _a, _b, _c;
      const normalizedBits = __privateMethod(_a = _BigNumber, _BigNumber_static, normalizeNonNegativeBigInt_fn).call(_a, bits, "Shift bits");
      if (normalizedBits === 0n) {
        if (extended != null)
          __privateMethod(_b = extended, _BigNumber_instances, _initializeState_fn).call(_b, 0n, 0);
        return this;
      }
      if (extended != null) {
        const m = (1n << normalizedBits) - 1n;
        const sOut = __privateGet(this, __magnitude) & m;
        __privateMethod(_c = extended, _BigNumber_instances, _initializeState_fn).call(_c, sOut, 0);
      }
      __privateSet(this, __magnitude, __privateGet(this, __magnitude) >> normalizedBits);
      __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
      return this.strip();
    }
    ishrn(bits, hint, extended) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0, "ishrn requires positive number");
      return this.iushrn(bits, hint, extended);
    }
    shln(bits) {
      return this.clone().ishln(bits);
    }
    ushln(bits) {
      return this.clone().iushln(bits);
    }
    shrn(bits) {
      return this.clone().ishrn(bits);
    }
    ushrn(bits) {
      return this.clone().iushrn(bits);
    }
    testn(bit) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof bit === "number" && bit >= 0);
      return (__privateGet(this, __magnitude) >> BigInt(bit) & 1n) !== 0n;
    }
    imaskn(bits) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof bits === "number" && bits >= 0);
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0, "imaskn works only with positive numbers");
      const Bb = BigInt(bits);
      const m = Bb === 0n ? 0n : (1n << Bb) - 1n;
      __privateSet(this, __magnitude, __privateGet(this, __magnitude) & m);
      const wfm = bits === 0 ? 1 : Math.max(1, Math.ceil(bits / _BigNumber.wordSize));
      __privateSet(this, __nominalWordLength, wfm);
      __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
      __privateSet(this, __nominalWordLength, Math.max(__privateGet(this, __nominalWordLength), wfm));
      return this.strip();
    }
    maskn(bits) {
      return this.clone().imaskn(bits);
    }
    iaddn(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof num === "number");
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, Math.abs(num) <= __privateGet(_BigNumber, _MAX_IMULN_ARG), "num is too large");
      __privateMethod(this, _BigNumber_instances, _setValueFromSigned_fn).call(this, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) + BigInt(num));
      return this;
    }
    _iaddn(num) {
      return this.iaddn(num);
    }
    isubn(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof num === "number");
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, Math.abs(num) <= __privateGet(_BigNumber, _MAX_IMULN_ARG), "Assertion failed");
      __privateMethod(this, _BigNumber_instances, _setValueFromSigned_fn).call(this, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) - BigInt(num));
      return this;
    }
    addn(num) {
      return this.clone().iaddn(num);
    }
    subn(num) {
      return this.clone().isubn(num);
    }
    iabs() {
      __privateSet(this, __sign, 0);
      return this;
    }
    abs() {
      return this.clone().iabs();
    }
    divmod(num, mode, positive) {
      var _a;
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, !num.isZero(), "Division by zero");
      if (this.isZero()) {
        const z = new _BigNumber(0n);
        return { div: mode === "mod" ? null : z, mod: mode === "div" ? null : z };
      }
      const tV = __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
      const nV = __privateMethod(_a = num, _BigNumber_instances, _getSignedValue_fn).call(_a);
      const dV = mode !== "mod" ? tV / nV : null;
      const mV = __privateMethod(this, _BigNumber_instances, _computeMod_fn).call(this, tV, nV, mode, positive);
      return { div: __privateMethod(this, _BigNumber_instances, _bigNumberFromSigned_fn).call(this, dV), mod: __privateMethod(this, _BigNumber_instances, _bigNumberFromSigned_fn).call(this, mV) };
    }
    div(num) {
      return this.divmod(num, "div", false).div;
    }
    mod(num) {
      return this.divmod(num, "mod", false).mod;
    }
    umod(num) {
      return this.divmod(num, "mod", true).mod;
    }
    divRound(num) {
      var _a, _b, _c;
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, !num.isZero());
      const tV = __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
      const nV = __privateMethod(_a = num, _BigNumber_instances, _getSignedValue_fn).call(_a);
      let d = tV / nV;
      const m = tV % nV;
      if (m === 0n) {
        const r3 = new _BigNumber(0n);
        __privateMethod(_b = r3, _BigNumber_instances, _setValueFromSigned_fn).call(_b, d);
        return r3;
      }
      const absM = m < 0n ? -m : m;
      const absNV = nV < 0n ? -nV : nV;
      if (absM * 2n >= absNV) {
        if (tV > 0n && nV > 0n || tV < 0n && nV < 0n) {
          d += 1n;
        } else {
          d -= 1n;
        }
      }
      const r2 = new _BigNumber(0n);
      __privateMethod(_c = r2, _BigNumber_instances, _setValueFromSigned_fn).call(_c, d);
      return r2;
    }
    modrn(numArg) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, numArg !== 0, "Division by zero in modrn");
      const absDivisor = BigInt(Math.abs(numArg));
      if (absDivisor === 0n)
        throw new Error("Division by zero in modrn");
      const remainderMag = __privateGet(this, __magnitude) % absDivisor;
      return numArg < 0 ? Number(-remainderMag) : Number(remainderMag);
    }
    idivn(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, num !== 0);
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, Math.abs(num) <= __privateGet(_BigNumber, _MAX_IMULN_ARG), "num is too large");
      __privateMethod(this, _BigNumber_instances, _setValueFromSigned_fn).call(this, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) / BigInt(num));
      return this;
    }
    divn(num) {
      return this.clone().idivn(num);
    }
    egcd(p) {
      var _a, _b, _c;
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, p.negative === 0, "p must not be negative");
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, !p.isZero(), "p must not be zero");
      let uV = __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
      let vV = __privateGet(p, __magnitude);
      let a = 1n;
      let pa = 0n;
      let b = 0n;
      let pb = 1n;
      while (vV !== 0n) {
        const q = uV / vV;
        let t = vV;
        vV = uV % vV;
        uV = t;
        t = pa;
        pa = a - q * pa;
        a = t;
        t = pb;
        pb = b - q * pb;
        b = t;
      }
      const ra = new _BigNumber(0n);
      __privateMethod(_a = ra, _BigNumber_instances, _setValueFromSigned_fn).call(_a, a);
      const rb = new _BigNumber(0n);
      __privateMethod(_b = rb, _BigNumber_instances, _setValueFromSigned_fn).call(_b, b);
      const rg = new _BigNumber(0n);
      __privateMethod(_c = rg, _BigNumber_instances, _initializeState_fn).call(_c, uV < 0n ? -uV : uV, 0);
      return { a: ra, b: rb, gcd: rg };
    }
    gcd(num) {
      var _a, _b, _c;
      let u = __privateGet(this, __magnitude);
      let v = __privateGet(num, __magnitude);
      if (u === 0n) {
        const r2 = new _BigNumber(0n);
        __privateMethod(_a = r2, _BigNumber_instances, _setValueFromSigned_fn).call(_a, v);
        return r2.iabs();
      }
      if (v === 0n) {
        const r2 = new _BigNumber(0n);
        __privateMethod(_b = r2, _BigNumber_instances, _setValueFromSigned_fn).call(_b, u);
        return r2.iabs();
      }
      while (v !== 0n) {
        const t = u % v;
        u = v;
        v = t;
      }
      const res = new _BigNumber(0n);
      __privateMethod(_c = res, _BigNumber_instances, _initializeState_fn).call(_c, u, 0);
      return res;
    }
    invm(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, !num.isZero() && __privateGet(num, __sign) === 0, "Modulus for invm must be positive and non-zero");
      const eg = this.egcd(num);
      if (!eg.gcd.eqn(1)) {
        throw new Error("Inverse does not exist (numbers are not coprime).");
      }
      return eg.a.umod(num);
    }
    isEven() {
      return __privateGet(this, __magnitude) % 2n === 0n;
    }
    isOdd() {
      return __privateGet(this, __magnitude) % 2n === 1n;
    }
    andln(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, num >= 0);
      return Number(__privateGet(this, __magnitude) & BigInt(num));
    }
    bincn(bit) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof bit === "number" && bit >= 0);
      const BVal = 1n << BigInt(bit);
      __privateMethod(this, _BigNumber_instances, _setValueFromSigned_fn).call(this, __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this) + BVal);
      return this;
    }
    isZero() {
      return __privateGet(this, __magnitude) === 0n;
    }
    cmpn(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, Math.abs(num) <= __privateGet(_BigNumber, _MAX_IMULN_ARG), "Number is too big");
      const tV = __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
      const nV = BigInt(num);
      if (tV < nV) {
        return -1;
      }
      if (tV > nV) {
        return 1;
      }
      return 0;
    }
    cmp(num) {
      var _a;
      const tV = __privateMethod(this, _BigNumber_instances, _getSignedValue_fn).call(this);
      const nV = __privateMethod(_a = num, _BigNumber_instances, _getSignedValue_fn).call(_a);
      if (tV < nV) {
        return -1;
      }
      if (tV > nV) {
        return 1;
      }
      return 0;
    }
    ucmp(num) {
      if (__privateGet(this, __magnitude) < __privateGet(num, __magnitude)) {
        return -1;
      }
      if (__privateGet(this, __magnitude) > __privateGet(num, __magnitude)) {
        return 1;
      }
      return 0;
    }
    gtn(num) {
      return this.cmpn(num) === 1;
    }
    gt(num) {
      return this.cmp(num) === 1;
    }
    gten(num) {
      return this.cmpn(num) >= 0;
    }
    gte(num) {
      return this.cmp(num) >= 0;
    }
    ltn(num) {
      return this.cmpn(num) === -1;
    }
    lt(num) {
      return this.cmp(num) === -1;
    }
    lten(num) {
      return this.cmpn(num) <= 0;
    }
    lte(num) {
      return this.cmp(num) <= 0;
    }
    eqn(num) {
      return this.cmpn(num) === 0;
    }
    eq(num) {
      return this.cmp(num) === 0;
    }
    toRed(ctx) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red == null, "Already a number in reduction context");
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0, "toRed works only with positives");
      return ctx.convertTo(this).forceRed(ctx);
    }
    fromRed() {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "fromRed works only with numbers in reduction context");
      return this.red.convertFrom(this);
    }
    forceRed(ctx) {
      this.red = ctx;
      return this;
    }
    redAdd(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redAdd works only with red numbers");
      return this.red.add(this, num);
    }
    redIAdd(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redIAdd works only with red numbers");
      return this.red.iadd(this, num);
    }
    redSub(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redSub works only with red numbers");
      return this.red.sub(this, num);
    }
    redISub(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redISub works only with red numbers");
      return this.red.isub(this, num);
    }
    redShl(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redShl works only with red numbers");
      return this.red.shl(this, num);
    }
    redMul(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redMul works only with red numbers");
      this.red.verify2(this, num);
      return this.red.mul(this, num);
    }
    redIMul(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redIMul works only with red numbers");
      this.red.verify2(this, num);
      return this.red.imul(this, num);
    }
    redSqr() {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redSqr works only with red numbers");
      this.red.verify1(this);
      return this.red.sqr(this);
    }
    redISqr() {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redISqr works only with red numbers");
      this.red.verify1(this);
      return this.red.isqr(this);
    }
    redSqrt() {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redSqrt works only with red numbers");
      this.red.verify1(this);
      return this.red.sqrt(this);
    }
    redInvm() {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redInvm works only with red numbers");
      this.red.verify1(this);
      return this.red.invm(this);
    }
    redNeg() {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red, "redNeg works only with red numbers");
      this.red.verify1(this);
      return this.red.neg(this);
    }
    redPow(num) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, this.red != null && num.red == null, "redPow(normalNum)");
      this.red.verify1(this);
      return this.red.pow(this, num);
    }
    /**
     * Creates a BigNumber from a hexadecimal string.
     *
     * @static
     * @method fromHex
     * @param hex - The hexadecimal string to create a BigNumber from.
     * @param endian - Optional endianness for parsing the hex string.
     * @returns Returns a BigNumber created from the hexadecimal input string.
     *
     * @example
     * const exampleHex = 'a1b2c3';
     * const bigNumber = BigNumber.fromHex(exampleHex);
     */
    static fromHex(hex, endian) {
      let eE = "be";
      if (endian === "little" || endian === "le")
        eE = "le";
      return new _BigNumber(hex, 16, eE);
    }
    /**
     * Converts this BigNumber to a hexadecimal string.
     *
     * @method toHex
     * @param length - The minimum length of the hex string
     * @returns Returns a string representing the hexadecimal value of this BigNumber.
     *
     * @example
     * const bigNumber = new BigNumber(255)
     * const hex = bigNumber.toHex()
     */
    toHex(byteLength = 0) {
      if (this.isZero() && byteLength === 0)
        return "";
      let hexStr = __privateMethod(this, _BigNumber_instances, _getMinimalHex_fn).call(this);
      if (hexStr !== "0" && hexStr.length % 2 !== 0) {
        hexStr = "0" + hexStr;
      }
      const minChars = byteLength * 2;
      while (hexStr.length < minChars) {
        hexStr = "0" + hexStr;
      }
      return (this.isNeg() ? "-" : "") + hexStr;
    }
    /**
     * Creates a BigNumber from a JSON-serialized string.
     *
     * @static
     * @method fromJSON
     * @param str - The JSON-serialized string to create a BigNumber from.
     * @returns Returns a BigNumber created from the JSON input string.
     */
    static fromJSON(str) {
      return new _BigNumber(str, 16);
    }
    /**
     * Creates a BigNumber from a number.
     *
     * @static
     * @method fromNumber
     * @param n - The number to create a BigNumber from.
     * @returns Returns a BigNumber equivalent to the input number.
     */
    static fromNumber(n) {
      return new _BigNumber(n);
    }
    /**
     * Creates a BigNumber from a string, considering an optional base.
     *
     * @static
     * @method fromString
     * @param str - The string to create a BigNumber from.
     * @param base - The base used for conversion. If not provided, base 10 is assumed.
     * @returns Returns a BigNumber equivalent to the string after conversion from the specified base.
     */
    static fromString(str, base) {
      return new _BigNumber(str, base);
    }
    /**
     * Creates a BigNumber from a signed magnitude number.
     *
     * @static
     * @method fromSm
     * @param bytes - The signed magnitude number to convert to a BigNumber.
     * @param endian - Defines endianess. If not provided, big endian is assumed.
     * @returns Returns a BigNumber equivalent to the signed magnitude number interpreted with specified endianess.
     */
    static fromSm(bytes2, endian = "big") {
      var _a;
      if (bytes2.length === 0)
        return new _BigNumber(0n);
      const beBytes = bytes2.slice();
      if (endian === "little") {
        beBytes.reverse();
      }
      let sign3 = 0;
      if (beBytes.length > 0 && (beBytes[0] & 128) !== 0) {
        sign3 = 1;
        beBytes[0] &= 127;
      }
      let hexStr;
      if (CAN_USE_BUFFER) {
        hexStr = BufferCtor.from(beBytes).toString("hex");
      } else {
        hexStr = "";
        for (const byte of beBytes) {
          hexStr += byte < 16 ? "0" + byte.toString(16) : byte.toString(16);
        }
      }
      const magnitude = hexStr.length === 0 ? 0n : BigInt("0x" + hexStr);
      const r2 = new _BigNumber(0n);
      __privateMethod(_a = r2, _BigNumber_instances, _initializeState_fn).call(_a, magnitude, sign3);
      return r2;
    }
    /**
     * Converts this BigNumber to a signed magnitude number.
     *
     * @method toSm
     * @param endian - Defines endianess. If not provided, big endian is assumed.
     * @returns Returns an array equivalent to this BigNumber interpreted as a signed magnitude with specified endianess.
     */
    toSm(endian = "big") {
      if (__privateGet(this, __magnitude) === 0n) {
        return __privateGet(this, __sign) === 1 ? [128] : [];
      }
      let hex = __privateMethod(this, _BigNumber_instances, _getMinimalHex_fn).call(this);
      if (hex.length % 2 !== 0)
        hex = "0" + hex;
      const byteLen = hex.length / 2;
      const bytes2 = Array.from({ length: byteLen });
      for (let i = 0, j = 0; i < hex.length; i += 2) {
        const high = HEX_CHAR_TO_VALUE[hex.codePointAt(i)];
        const low = HEX_CHAR_TO_VALUE[hex.codePointAt(i + 1)];
        bytes2[j++] = (high & 15) << 4 | low & 15;
      }
      let result;
      if (__privateGet(this, __sign) === 1) {
        if ((bytes2[0] & 128) === 0) {
          result = bytes2.slice();
          result[0] |= 128;
        } else {
          result = [128, ...bytes2];
        }
      } else if ((bytes2[0] & 128) === 0) {
        result = bytes2.slice();
      } else {
        result = [0, ...bytes2];
      }
      return endian === "little" ? result.reverse() : result;
    }
    /**
     * Creates a BigNumber from a number representing the "bits" value in a block header.
     *
     * @static
     * @method fromBits
     * @param bits - The number representing the bits value in a block header.
     * @param strict - If true, an error is thrown if the number has negative bit set.
     * @returns Returns a BigNumber equivalent to the "bits" value in a block header.
     * @throws Will throw an error if `strict` is `true` and the number has negative bit set.
     */
    static fromBits(bits, strict = false) {
      const nSize = bits >>> 24;
      const nWordCompact = bits & 8388607;
      const isNegativeFromBit = (bits & 8388608) !== 0;
      if (strict && isNegativeFromBit) {
        throw new Error("negative bit set");
      }
      if (nSize === 0 && nWordCompact === 0) {
        if (isNegativeFromBit && strict)
          throw new Error("negative bit set for zero value");
        return new _BigNumber(0n);
      }
      const bn = new _BigNumber(nWordCompact);
      if (nSize <= 3) {
        bn.iushrn((3 - nSize) * 8);
      } else {
        bn.iushln((nSize - 3) * 8);
      }
      if (isNegativeFromBit) {
        bn.ineg();
      }
      return bn;
    }
    /**
     * Converts this BigNumber to a number representing the "bits" value in a block header.
     *
     * @method toBits
     * @returns Returns a number equivalent to the "bits" value in a block header.
     */
    toBits() {
      this.strip();
      if (this.isZero() && !this.isNeg())
        return 0;
      const isActualNegative = this.isNeg();
      const bnAbs = this.abs();
      let mB = bnAbs.toArray("be");
      let firstNonZeroIdx = 0;
      while (firstNonZeroIdx < mB.length - 1 && mB[firstNonZeroIdx] === 0) {
        firstNonZeroIdx++;
      }
      mB = mB.slice(firstNonZeroIdx);
      let nSize = mB.length;
      let nWordNum;
      if (nSize === 0) {
        nWordNum = 0;
      } else if (nSize <= 3) {
        nWordNum = 0;
        for (let i = 0; i < nSize; i++) {
          nWordNum = nWordNum << 8 | mB[i];
        }
      } else {
        nWordNum = mB[0] << 16 | mB[1] << 8 | mB[2];
      }
      if ((nWordNum & 8388608) !== 0 && nSize <= 255) {
        nWordNum >>>= 8;
        nSize++;
      }
      let b = nSize << 24 | nWordNum;
      if (isActualNegative)
        b |= 8388608;
      return b >>> 0;
    }
    /**
     * Creates a BigNumber from the format used in Bitcoin scripts.
     *
     * @static
     * @method fromScriptNum
     * @param num - The number in the format used in Bitcoin scripts.
     * @param requireMinimal - If true, non-minimally encoded values will throw an error.
     * @param maxNumSize - The maximum allowed size for the number.
     * @returns Returns a BigNumber equivalent to the number used in a Bitcoin script.
     */
    static fromScriptNum(num, requireMinimal = false, maxNumSize) {
      if (maxNumSize !== void 0 && num.length > maxNumSize)
        throw new Error("script number overflow");
      if (num.length === 0)
        return new _BigNumber(0n);
      if (requireMinimal) {
        if ((num.at(-1) & 127) === 0) {
          if (num.length <= 1 || (num.at(-2) & 128) === 0) {
            throw new Error("non-minimally encoded script number");
          }
        }
      }
      return _BigNumber.fromSm(num, "little");
    }
    /**
     * Converts this BigNumber to a number in the format used in Bitcoin scripts.
     *
     * @method toScriptNum
     * @returns Returns the equivalent to this BigNumber as a Bitcoin script number.
     */
    toScriptNum() {
      return this.toSm("little");
    }
    /**
     * Compute the multiplicative inverse of the current BigNumber in the modulus field specified by `p`.
     * The multiplicative inverse is a number which when multiplied with the current BigNumber gives '1' in the modulus field.
     *
     * @method _invmp
     * @param p - The `BigNumber` specifying the modulus field.
     * @returns The multiplicative inverse `BigNumber` in the modulus field specified by `p`.
     */
    /**
     * SECURITY NOTE:
     * This implementation avoids variable-time extended Euclidean algorithms
     * to reduce timing side-channel leakage. However, JavaScript BigInt arithmetic
     * does not provide constant-time guarantees. This implementation is suitable
     * for browser and single-tenant environments but is not hardened against
     * high-resolution timing attacks in shared CPU contexts.
     */
    _invmp(p) {
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(p, __sign) === 0, "p must not be negative for _invmp");
      __privateMethod(this, _BigNumber_instances, assert_fn).call(this, !p.isZero(), "p must not be zero for _invmp");
      const a = this.umod(p);
      const exp = p.subn(2);
      if (a.red !== null) {
        return a.redPow(exp);
      }
      let result = new _BigNumber(1n);
      let base = a.clone();
      const e = exp.clone();
      while (!e.isZero()) {
        if (e.isOdd())
          result = result.mul(base).umod(p);
        base = base.sqr().umod(p);
        e.iushrn(1);
      }
      return result;
    }
    /**
     * Performs multiplication between the BigNumber instance and a given BigNumber.
     * It chooses the multiplication method based on the lengths of the numbers to optimize execution time.
     *
     * @method mulTo
     * @param num - The BigNumber multiply with.
     * @param out - The BigNumber where to store the result.
     * @returns The BigNumber resulting from the multiplication operation.
     */
    mulTo(num, out) {
      __privateSet(out, __magnitude, __privateGet(this, __magnitude) * __privateGet(num, __magnitude));
      __privateSet(out, __sign, __privateGet(out, __magnitude) === 0n ? 0 : __privateGet(this, __sign) ^ __privateGet(num, __sign));
      __privateSet(out, __nominalWordLength, this.length + num.length);
      out.red = null;
      out.normSign();
      return out;
    }
  };
  _WORD_SIZE_BIGINT = new WeakMap();
  _WORD_MASK = new WeakMap();
  _MAX_SAFE_INTEGER_BIGINT = new WeakMap();
  _MIN_SAFE_INTEGER_BIGINT = new WeakMap();
  _MAX_IMULN_ARG = new WeakMap();
  _MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT = new WeakMap();
  _MAX_NOMINAL_WORD_LENGTH = new WeakMap();
  __magnitude = new WeakMap();
  __sign = new WeakMap();
  __nominalWordLength = new WeakMap();
  _BigNumber_instances = new WeakSet();
  _computedWordsArray_get = function() {
    if (__privateGet(this, __magnitude) === 0n)
      return [0];
    const arr = [];
    let temp = __privateGet(this, __magnitude);
    while (temp > 0n) {
      arr.push(Number(temp & __privateGet(_BigNumber, _WORD_MASK)));
      temp >>= __privateGet(_BigNumber, _WORD_SIZE_BIGINT);
    }
    return arr.length > 0 ? arr : [0];
  };
  _initFromString_fn = function(number, effectiveBase, effectiveEndian) {
    if (effectiveBase === "hex")
      effectiveBase = 16;
    __privateMethod(this, _BigNumber_instances, assert_fn).call(this, typeof effectiveBase === "number" && effectiveBase === Math.trunc(effectiveBase) && effectiveBase >= 2 && effectiveBase <= 36, "Base must be an integer between 2 and 36");
    const originalNumberStr = number.toString().replace(/\s+/g, "");
    let start = 0;
    let sign3 = 0;
    if (originalNumberStr.startsWith("-")) {
      start++;
      sign3 = 1;
    } else if (originalNumberStr.startsWith("+")) {
      start++;
    }
    const numStr = originalNumberStr.substring(start);
    if (numStr.length === 0) {
      __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, 0n, sign3 === 1 && originalNumberStr.startsWith("-") ? 1 : 0);
      this.normSign();
      return;
    }
    if (effectiveBase === 16) {
      __privateMethod(this, _BigNumber_instances, _initFromHexString_fn).call(this, numStr, sign3, effectiveEndian);
    } else {
      __privateMethod(this, _BigNumber_instances, _initFromNonHexString_fn).call(this, numStr, effectiveBase, sign3, effectiveEndian);
    }
  };
  _initFromHexString_fn = function(numStr, sign3, effectiveEndian) {
    if (effectiveEndian === "le") {
      const bytes2 = [];
      let hexStr = numStr;
      if (hexStr.length % 2 !== 0)
        hexStr = "0" + hexStr;
      for (let i = 0; i < hexStr.length; i += 2) {
        const byteHex = hexStr.substring(i, i + 2);
        const byteVal = Number.parseInt(byteHex, 16);
        if (Number.isNaN(byteVal))
          throw new Error("Invalid character in " + hexStr);
        bytes2.push(byteVal);
      }
      __privateMethod(this, _BigNumber_instances, initArray_fn).call(this, bytes2, "le");
      __privateSet(this, __sign, sign3);
      this.normSign();
    } else {
      let tempMagnitude;
      try {
        tempMagnitude = BigInt("0x" + numStr);
      } catch {
        throw new Error("Invalid character in " + numStr);
      }
      __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, tempMagnitude, sign3);
      this.normSign();
    }
  };
  _initFromNonHexString_fn = function(numStr, base, sign3, effectiveEndian) {
    try {
      __privateMethod(this, _BigNumber_instances, _parseBaseString_fn).call(this, numStr, base);
      __privateSet(this, __sign, sign3);
      this.normSign();
      if (effectiveEndian === "le") {
        const currentSign = __privateGet(this, __sign);
        __privateMethod(this, _BigNumber_instances, initArray_fn).call(this, this.toArray("be"), "le");
        __privateSet(this, __sign, currentSign);
        this.normSign();
      }
    } catch (err) {
      const error = err;
      if (error.message.includes("Invalid character in string") || error.message.includes("Invalid digit for base") || error.message.startsWith("Invalid character:")) {
        throw new Error("Invalid character");
      }
      throw error;
    }
  };
  _bigIntToStringInBase_fn = function(num, base) {
    if (num === 0n)
      return "0";
    if (base < 2 || base > 36)
      throw new Error("Base must be between 2 and 36");
    const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    let result = "";
    let currentNum = num > 0n ? num : -num;
    const bigBase = BigInt(base);
    while (currentNum > 0n) {
      result = digits[Number(currentNum % bigBase)] + result;
      currentNum /= bigBase;
    }
    return result;
  };
  _parseBaseString_fn = function(numberStr, base) {
    __privateSet(this, __magnitude, 0n);
    const bigBase = BigInt(base);
    let groupSize = _BigNumber.groupSizes[base];
    let groupBaseBigInt = BigInt(_BigNumber.groupBases[base]);
    if (groupSize === 0 || groupBaseBigInt === 0n) {
      groupSize = Math.floor(Math.log(67108863) / Math.log(base));
      if (groupSize === 0)
        groupSize = 1;
      groupBaseBigInt = bigBase ** BigInt(groupSize);
    }
    let currentPos = 0;
    const totalLen = numberStr.length;
    let firstChunkLen = totalLen % groupSize;
    if (firstChunkLen === 0 && totalLen > 0)
      firstChunkLen = groupSize;
    if (firstChunkLen > 0) {
      const chunkStr = numberStr.substring(currentPos, currentPos + firstChunkLen);
      __privateSet(this, __magnitude, BigInt(__privateMethod(this, _BigNumber_instances, _parseBaseWord_fn).call(this, chunkStr, base)));
      currentPos += firstChunkLen;
    }
    while (currentPos < totalLen) {
      const chunkStr = numberStr.substring(currentPos, currentPos + groupSize);
      const wordVal = BigInt(__privateMethod(this, _BigNumber_instances, _parseBaseWord_fn).call(this, chunkStr, base));
      __privateSet(this, __magnitude, __privateGet(this, __magnitude) * groupBaseBigInt + wordVal);
      currentPos += groupSize;
    }
    __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
  };
  _parseBaseWord_fn = function(str, base) {
    let r2 = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.codePointAt(i);
      let digitVal;
      if (charCode >= 48 && charCode <= 57)
        digitVal = charCode - 48;
      else if (charCode >= 65 && charCode <= 90)
        digitVal = charCode - 65 + 10;
      else if (charCode >= 97 && charCode <= 122)
        digitVal = charCode - 97 + 10;
      else
        throw new Error("Invalid character: " + str[i]);
      if (digitVal >= base)
        throw new Error("Invalid character");
      r2 = r2 * base + digitVal;
    }
    return r2;
  };
  _initializeState_fn = function(magnitude, sign3) {
    __privateSet(this, __magnitude, magnitude);
    __privateSet(this, __sign, magnitude === 0n ? 0 : sign3);
    __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
  };
  _finishInitialization_fn = function() {
    if (__privateGet(this, __magnitude) === 0n) {
      __privateSet(this, __nominalWordLength, 1);
      __privateSet(this, __sign, 0);
    } else {
      const bitLen2 = __privateGet(this, __magnitude).toString(2).length;
      __privateSet(this, __nominalWordLength, Math.max(1, Math.ceil(bitLen2 / _BigNumber.wordSize)));
    }
  };
  assert_fn = function(val, msg = "Assertion failed") {
    if (!val)
      throw new Error(msg);
  };
  initNumber_fn = function(number, endian = "be") {
    __privateMethod(this, _BigNumber_instances, assert_fn).call(this, BigInt(Math.abs(number)) <= __privateGet(_BigNumber, _MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT), "The number is larger than 2 ^ 53 (unsafe)");
    __privateMethod(this, _BigNumber_instances, assert_fn).call(this, number % 1 === 0, "Number must be an integer for BigNumber conversion");
    __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, BigInt(Math.abs(number)), number < 0 ? 1 : 0);
    if (endian === "le") {
      const currentSign = __privateGet(this, __sign);
      const beBytes = this.toArray("be");
      __privateMethod(this, _BigNumber_instances, initArray_fn).call(this, beBytes, "le");
      __privateSet(this, __sign, currentSign);
      this.normSign();
    }
    return this;
  };
  initArray_fn = function(bytes2, endian) {
    if (bytes2.length === 0) {
      __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, 0n, 0);
      return this;
    }
    let magnitude = 0n;
    if (endian === "be") {
      for (const byte of bytes2)
        magnitude = magnitude << 8n | BigInt(byte & 255);
    } else {
      for (let i = bytes2.length - 1; i >= 0; i--)
        magnitude = magnitude << 8n | BigInt(bytes2[i] & 255);
    }
    __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, magnitude, 0);
    return this;
  };
  _getMinimalHex_fn = function() {
    if (__privateGet(this, __magnitude) === 0n)
      return "0";
    return __privateGet(this, __magnitude).toString(16);
  };
  _toHexString_fn = function(padding) {
    let hexStr = __privateMethod(this, _BigNumber_instances, _getMinimalHex_fn).call(this);
    if (padding > 1) {
      if (hexStr !== "0" && hexStr.length % 2 !== 0) {
        hexStr = "0" + hexStr;
      }
      while (hexStr.length % padding !== 0) {
        hexStr = "0" + hexStr;
      }
    }
    return (this.isNeg() ? "-" : "") + hexStr;
  };
  toBaseString_fn = function(base, padding) {
    var _a;
    if (__privateGet(this, __magnitude) === 0n) {
      return __privateMethod(_a = _BigNumber, _BigNumber_static, _paddedZero_fn).call(_a, padding);
    }
    let groupSize = _BigNumber.groupSizes[base];
    let groupBaseBigInt = BigInt(_BigNumber.groupBases[base]);
    if (groupSize === 0 || groupBaseBigInt === 0n) {
      groupSize = Math.floor(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(base));
      if (groupSize === 0)
        groupSize = 1;
      groupBaseBigInt = BigInt(base) ** BigInt(groupSize);
    }
    let out = "";
    let tempMag = __privateGet(this, __magnitude);
    while (tempMag > 0n) {
      const remainder = tempMag % groupBaseBigInt;
      tempMag /= groupBaseBigInt;
      const chunkStr = __privateMethod(this, _BigNumber_instances, _bigIntToStringInBase_fn).call(this, remainder, base);
      out = (tempMag > 0n ? __privateMethod(this, _BigNumber_instances, _zeroPaddedChunk_fn).call(this, chunkStr, groupSize) : chunkStr) + out;
    }
    if (padding > 0) {
      while (out.length < padding)
        out = "0" + out;
    }
    return (__privateGet(this, __sign) === 1 ? "-" : "") + out;
  };
  _BigNumber_static = new WeakSet();
  _paddedZero_fn = function(padding) {
    let out = "0";
    if (padding > 1) {
      while (out.length < padding)
        out = "0" + out;
    }
    return out;
  };
  /** Returns a chunk string zero-padded to groupSize (used by toBaseString for interior chunks). */
  _zeroPaddedChunk_fn = function(chunkStr, groupSize) {
    const zerosToPrepend = groupSize - chunkStr.length;
    if (zerosToPrepend <= 0)
      return chunkStr;
    if (zerosToPrepend < _BigNumber.zeros.length)
      return _BigNumber.zeros[zerosToPrepend] + chunkStr;
    return "0".repeat(zerosToPrepend) + chunkStr;
  };
  toArrayLikeGeneric_fn = function(res, isLE) {
    let tempMag = __privateGet(this, __magnitude);
    let position = isLE ? 0 : res.length - 1;
    const increment = isLE ? 1 : -1;
    for (const _byte of res) {
      if (tempMag === 0n && position >= 0 && position < res.length) {
        res[position] = 0;
      } else if (position >= 0 && position < res.length) {
        res[position] = Number(tempMag & 0xffn);
      } else {
        break;
      }
      tempMag >>= 8n;
      position += increment;
    }
  };
  _getSignedValue_fn = function() {
    return __privateGet(this, __sign) === 1 ? -__privateGet(this, __magnitude) : __privateGet(this, __magnitude);
  };
  _setValueFromSigned_fn = function(sVal) {
    if (sVal < 0n) {
      __privateSet(this, __magnitude, -sVal);
      __privateSet(this, __sign, 1);
    } else {
      __privateSet(this, __magnitude, sVal);
      __privateSet(this, __sign, 0);
    }
    __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
    this.normSign();
  };
  _iuop_fn = function(num, op, isXor = false) {
    const newMag = op(__privateGet(this, __magnitude), __privateGet(num, __magnitude));
    let targetNominalLength = __privateGet(this, __nominalWordLength);
    if (isXor)
      targetNominalLength = Math.max(this.length, num.length);
    __privateSet(this, __magnitude, newMag);
    __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
    if (isXor)
      __privateSet(this, __nominalWordLength, Math.max(__privateGet(this, __nominalWordLength), targetNominalLength));
    return this.strip();
  };
  _iop_fn = function(num, op, isXor = false) {
    __privateMethod(this, _BigNumber_instances, assert_fn).call(this, __privateGet(this, __sign) === 0 && __privateGet(num, __sign) === 0);
    return __privateMethod(this, _BigNumber_instances, _iuop_fn).call(this, num, op, isXor);
  };
  _uop_new_fn = function(num, opName) {
    if (this.length >= num.length) {
      return this.clone()[opName](num);
    }
    return num.clone()[opName](this);
  };
  normalizeNonNegativeBigInt_fn = function(value, label) {
    if (typeof value === "number") {
      if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0)
        throw new Error(`${label} must be a non-negative integer`);
      return BigInt(value);
    }
    if (value < 0n)
      throw new Error(`${label} must be a non-negative integer`);
    return value;
  };
  _computeMod_fn = function(tV, nV, mode, positive) {
    if (mode === "div")
      return null;
    let mV = tV % nV;
    if (positive === true && mV < 0n)
      mV += nV < 0n ? -nV : nV;
    return mV;
  };
  _bigNumberFromSigned_fn = function(v) {
    var _a;
    if (v === null)
      return null;
    const r2 = new _BigNumber(0n);
    __privateMethod(_a = r2, _BigNumber_instances, _setValueFromSigned_fn).call(_a, v);
    return r2;
  };
  __privateAdd(_BigNumber, _BigNumber_static);
  /**
   * @privateinitializer
   */
  __publicField(_BigNumber, "zeros", [
    "",
    "0",
    "00",
    "000",
    "0000",
    "00000",
    "000000",
    "0000000",
    "00000000",
    "000000000",
    "0000000000",
    "00000000000",
    "000000000000",
    "0000000000000",
    "00000000000000",
    "000000000000000",
    "0000000000000000",
    "00000000000000000",
    "000000000000000000",
    "0000000000000000000",
    "00000000000000000000",
    "000000000000000000000",
    "0000000000000000000000",
    "00000000000000000000000",
    "000000000000000000000000",
    "0000000000000000000000000"
  ]);
  /**
   * @privateinitializer
   */
  __publicField(_BigNumber, "groupSizes", [
    0,
    0,
    25,
    16,
    12,
    11,
    10,
    9,
    8,
    8,
    7,
    7,
    7,
    7,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5
  ]);
  /**
   * @privateinitializer
   */
  __publicField(_BigNumber, "groupBases", [
    0,
    0,
    33554432,
    43046721,
    16777216,
    48828125,
    60466176,
    40353607,
    16777216,
    43046721,
    1e7,
    19487171,
    35831808,
    62748517,
    7529536,
    11390625,
    16777216,
    24137569,
    34012224,
    47045881,
    64e6,
    4084101,
    5153632,
    6436343,
    7962624,
    9765625,
    11881376,
    14348907,
    17210368,
    20511149,
    243e5,
    28629151,
    33554432,
    39135393,
    45435424,
    52521875,
    60466176
  ]);
  /**
   * The word size of big number chunks.
   *
   * @property wordSize
   *
   * @example
   * console.log(BigNumber.wordSize);  // output: 26
   */
  __publicField(_BigNumber, "wordSize", 26);
  __privateAdd(_BigNumber, _WORD_SIZE_BIGINT, 26n);
  __privateAdd(_BigNumber, _WORD_MASK, (1n << 26n) - 1n);
  __privateAdd(_BigNumber, _MAX_SAFE_INTEGER_BIGINT, BigInt(Number.MAX_SAFE_INTEGER));
  __privateAdd(_BigNumber, _MIN_SAFE_INTEGER_BIGINT, BigInt(Number.MIN_SAFE_INTEGER));
  __privateAdd(_BigNumber, _MAX_IMULN_ARG, 67108864 - 1);
  __privateAdd(_BigNumber, _MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT, (1n << 53n) - 1n);
  // About 3.25 MiB of mathematical payload. Legitimate cryptographic values
  // are orders of magnitude smaller; this cap prevents hostile sparse-length
  // metadata from causing an unbounded dense JavaScript array allocation.
  __privateAdd(_BigNumber, _MAX_NOMINAL_WORD_LENGTH, 1048576);
  var BigNumber = _BigNumber;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Mersenne.js
  var Mersenne = class {
    /**
     * @constructor
     * @param name - An identifier for the Mersenne instance.
     * @param p - A string representation of the pseudo-Mersenne prime, expressed in hexadecimal.
     *
     * @example
     * const mersenne = new Mersenne('M31', '7FFFFFFF');
     */
    constructor(name, p) {
      __publicField(this, "name");
      __publicField(this, "p");
      __publicField(this, "k");
      __publicField(this, "n");
      __publicField(this, "tmp");
      this.name = name;
      this.p = new BigNumber(p, 16);
      this.n = this.p.bitLength();
      this.k = new BigNumber(BigInt(1)).iushln(this.n).isub(this.p);
      this.tmp = this._tmp();
    }
    /**
     * Creates a temporary BigNumber structure for computations,
     * ensuring the appropriate number of words are initially allocated.
     *
     * @method _tmp
     * @returns A BigNumber with scaled size depending on prime magnitude.
     */
    _tmp() {
      const tmp = new BigNumber(BigInt(0));
      const requiredWords = Math.ceil(this.n / BigNumber.wordSize);
      tmp.expand(Math.max(1, requiredWords));
      return tmp;
    }
    /**
     * Reduces an input BigNumber in place, under the assumption that
     * it is less than the square of the pseudo-Mersenne prime.
     *
     * @method ireduce
     * @param num - The BigNumber to be reduced.
     * @returns The reduced BigNumber.
     *
     * @example
     * const reduced = mersenne.ireduce(new BigNumber('2345', 16));
     */
    ireduce(num) {
      const r2 = num;
      let rlen;
      do {
        this.split(r2, this.tmp);
        this.imulK(r2);
        r2.iadd(this.tmp);
        rlen = r2.bitLength();
      } while (rlen > this.n);
      const cmp = rlen < this.n ? -1 : r2.ucmp(this.p);
      if (cmp === 0) {
        r2.words = [0];
      } else if (cmp > 0) {
        r2.isub(this.p);
      }
      r2.strip();
      return r2;
    }
    /**
     * Shifts bits of the input BigNumber to the right, in place,
     * to meet the magnitude of the pseudo-Mersenne prime.
     *
     * @method split
     * @param input - The BigNumber to be shifted (will contain HI part).
     * @param out - The BigNumber to hold the shifted result (LO part).
     *
     * @example
     * mersenne.split(new BigNumber('2345', 16), new BigNumber());
     */
    split(input, out) {
      input.iushrn(this.n, 0, out);
    }
    /**
     * Performs an in-place multiplication of the parameter by constant k.
     *
     * @method imulK
     * @param num - The BigNumber to multiply with k.
     * @returns The result of the multiplication, in BigNumber format.
     *
     * @example
     * const multiplied = mersenne.imulK(new BigNumber('2345', 16));
     */
    imulK(num) {
      return num.imul(this.k);
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/K256.js
  var K256 = class extends Mersenne {
    /**
     * Constructor for the K256 class.
     * Creates an instance of K256 using the super constructor from Mersenne.
     *
     * @constructor
     *
     * @example
     * const k256 = new K256();
     */
    constructor() {
      super("k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
    }
    /**
     * Splits a BigNumber into a new BigNumber based on specific computation
     * rules. This method modifies the input and output big numbers.
     *
     * @method split
     * @param input - The BigNumber to be split.
     * @param output - The BigNumber that results from the split.
     *
     * @example
     * const input = new BigNumber(3456);
     * const output = new BigNumber(0);
     * k256.split(input, output);
     */
    split(input, output) {
      const mask = 4194303;
      const inputWords = input.words;
      const inputNominalLength = input.length;
      const outLen = Math.min(inputNominalLength, 9);
      const tempOutputWords = Array.from({ length: outLen + (inputNominalLength > 9 ? 1 : 0) }, () => 0);
      for (let i = 0; i < outLen; i++) {
        tempOutputWords[i] = inputWords[i];
      }
      let currentOutputWordCount = outLen;
      if (inputNominalLength <= 9) {
        const finalOutputWords2 = Array.from({ length: currentOutputWordCount }, () => 0);
        for (let i = 0; i < currentOutputWordCount; ++i)
          finalOutputWords2[i] = tempOutputWords[i];
        output.words = finalOutputWords2;
        input.words = [0];
        return;
      }
      let prev = inputWords[9];
      tempOutputWords[currentOutputWordCount++] = prev & mask;
      const finalOutputWords = Array.from({ length: currentOutputWordCount }, () => 0);
      for (let i = 0; i < currentOutputWordCount; ++i)
        finalOutputWords[i] = tempOutputWords[i];
      output.words = finalOutputWords;
      const tempInputNewWords = Array.from({ length: Math.max(1, inputNominalLength - 9) }, () => 0);
      let currentInputNewWordCount = 0;
      for (let i = 10; i < inputNominalLength; i++) {
        const next = Math.trunc(inputWords[i]);
        if (currentInputNewWordCount < tempInputNewWords.length) {
          tempInputNewWords[currentInputNewWordCount++] = (next & mask) << 4 | prev >>> 22;
        }
        prev = next;
      }
      prev >>>= 22;
      if (currentInputNewWordCount < tempInputNewWords.length) {
        tempInputNewWords[currentInputNewWordCount++] = prev;
      } else if (prev !== 0 && tempInputNewWords.length > 0) {
      }
      const finalInputNewWords = Array.from({ length: currentInputNewWordCount }, () => 0);
      for (let i = 0; i < currentInputNewWordCount; ++i)
        finalInputNewWords[i] = tempInputNewWords[i];
      input.words = finalInputNewWords;
    }
    /**
     * Multiplies a BigNumber ('num') with the constant 'K' in-place and returns the result.
     * 'K' is equal to 0x1000003d1 or in decimal representation: [ 64, 977 ].
     *
     * @method imulK
     * @param num - The BigNumber to multiply with K.
     * @returns Returns the mutated BigNumber after multiplication.
     *
     * @example
     * const number = new BigNumber(12345);
     * const result = k256.imulK(number);
     */
    imulK(num) {
      const currentWords = num.words;
      const originalNominalLength = num.length;
      const newNominalLength = originalNominalLength + 2;
      const tempWords = Array.from({ length: newNominalLength }, () => 0);
      for (let i = 0; i < originalNominalLength; i++) {
        tempWords[i] = currentWords[i];
      }
      let lo = 0;
      for (let i = 0; i < newNominalLength; i++) {
        const w = Math.trunc(tempWords[i]);
        lo += w * 977;
        tempWords[i] = lo & 67108863;
        lo = w * 64 + Math.trunc(lo / 67108864);
      }
      num.words = tempWords;
      return num;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/ReductionContext.js
  var ReductionContext = class {
    /**
     * Constructs a new ReductionContext.
     *
     * @constructor
     * @param m - A BigNumber representing the modulus, or 'k256' to create a context for Koblitz curve.
     *
     * @example
     * new ReductionContext(new BigNumber(11));
     * new ReductionContext('k256');
     */
    constructor(m) {
      __publicField(this, "prime");
      __publicField(this, "m");
      if (m === "k256") {
        const prime = new K256();
        this.m = prime.p;
        this.prime = prime;
      } else {
        this.assert(m.gtn(1), "modulus must be greater than 1");
        this.m = m;
        this.prime = null;
      }
    }
    /**
     * Asserts that given value is truthy. Throws an Error with a provided message
     * if the value is falsy.
     *
     * @private
     * @param val - The value to be checked.
     * @param msg - The error message to be thrown if the value is falsy.
     *
     * @example
     * this.assert(1 < 2, '1 is not less than 2');
     * this.assert(2 < 1, '2 is less than 1'); // throws an Error with message '2 is less than 1'
     */
    assert(val, msg = "Assertion failed") {
      if (!val)
        throw new Error(msg);
    }
    /**
     * Verifies that a BigNumber is positive and red. Throws an error if these
     * conditions are not met.
     *
     * @param a - The BigNumber to be verified.
     *
     * @example
     * this.verify1(new BigNumber(10).toRed());
     * this.verify1(new BigNumber(-10).toRed()); //throws an Error
     * this.verify1(new BigNumber(10)); //throws an Error
     */
    verify1(a) {
      this.assert(a.negative === 0, "red works only with positives");
      this.assert(a.red, "red works only with red numbers");
    }
    /**
     * Verifies that two BigNumbers are both positive and red. Also checks
     * that they have the same reduction context. Throws an error if these
     * conditions are not met.
     *
     * @param a - The first BigNumber to be verified.
     * @param b - The second BigNumber to be verified.
     *
     * @example
     * this.verify2(new BigNumber(10).toRed(this), new BigNumber(20).toRed(this));
     * this.verify2(new BigNumber(-10).toRed(this), new BigNumber(20).toRed(this)); //throws an Error
     * this.verify2(new BigNumber(10).toRed(this), new BigNumber(20)); //throws an Error
     */
    verify2(a, b) {
      this.assert((a.negative | b.negative) === 0, "red works only with positives");
      this.assert(a.red != null && a.red === b.red, "red works only with red numbers");
    }
    /**
     * Performs an in-place reduction of the given BigNumber by the modulus of the reduction context, 'm'.
     *
     * @method imod
     *
     * @param a - BigNumber to be reduced.
     *
     * @returns Returns the reduced result.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * context.imod(new BigNumber(19)); // Returns 5
     */
    imod(a) {
      if (this.prime != null)
        return this.prime.ireduce(a).forceRed(this);
      BigNumber.move(a, a.umod(this.m).forceRed(this));
      return a;
    }
    /**
     * Negates a BigNumber in the context of the modulus.
     *
     * @method neg
     *
     * @param a - BigNumber to negate.
     *
     * @returns Returns the negation of 'a' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * context.neg(new BigNumber(3)); // Returns 4
     */
    neg(a) {
      if (a.isZero()) {
        return a.clone();
      }
      return this.m.sub(a).forceRed(this);
    }
    /**
     * Performs the addition operation on two BigNumbers in the reduction context.
     *
     * @method add
     *
     * @param a - First BigNumber to add.
     * @param b - Second BigNumber to add.
     *
     * @returns Returns the result of 'a + b' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(5));
     * context.add(new BigNumber(2), new BigNumber(4)); // Returns 1
     */
    add(a, b) {
      this.verify2(a, b);
      const res = a.clone();
      res.iadd(b);
      res.isub(this.m);
      if (res.isNeg()) {
        res.iadd(this.m);
      }
      return res;
    }
    /**
     * Performs an in-place addition operation on two BigNumbers in the reduction context
     * in order to avoid creating a new BigNumber, it modifies the first one with the result.
     *
     * @method iadd
     *
     * @param a - First BigNumber to add.
     * @param b - Second BigNumber to add.
     *
     * @returns Returns the modified 'a' after addition with 'b' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(5));
     * const a = new BigNumber(2);
     * context.iadd(a, new BigNumber(4)); // Modifies 'a' to be 1
     */
    iadd(a, b) {
      this.verify2(a, b);
      a.iadd(b);
      a.isub(this.m);
      if (a.isNeg()) {
        a.iadd(this.m);
      }
      return a;
    }
    /**
     * Subtracts one BigNumber from another BigNumber in the reduction context.
     *
     * @method sub
     *
     * @param a - BigNumber to be subtracted from.
     * @param b - BigNumber to subtract.
     *
     * @returns Returns the result of 'a - b' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * context.sub(new BigNumber(3), new BigNumber(2)); // Returns 1
     */
    sub(a, b) {
      this.verify2(a, b);
      const res = a.sub(b);
      if (res.cmpn(0) < 0) {
        res.iadd(this.m);
      }
      return res.forceRed(this);
    }
    /**
     * Performs in-place subtraction of one BigNumber from another in the reduction context,
     * it modifies the first BigNumber with the result.
     *
     * @method isub
     *
     * @param a - BigNumber to be subtracted from.
     * @param b - BigNumber to subtract.
     *
     * @returns Returns the modified 'a' after subtraction of 'b' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(5));
     * const a = new BigNumber(4);
     * context.isub(a, new BigNumber(2)); // Modifies 'a' to be 2
     */
    isub(a, b) {
      this.verify2(a, b);
      const res = a.isub(b);
      if (res.cmpn(0) < 0) {
        res.iadd(this.m);
      }
      return res;
    }
    /**
     * Performs bitwise shift left operation on a BigNumber in the reduction context.
     *
     * @method shl
     *
     * @param a - BigNumber to perform shift on.
     * @param num - The number of positions to shift.
     *
     * @returns Returns the result of shifting 'a' left by 'num' positions in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(32));
     * context.shl(new BigNumber(4), 2); // Returns 16
     */
    shl(a, num) {
      this.verify1(a);
      return this.imod(a.ushln(num));
    }
    /**
     * Performs in-place multiplication of two BigNumbers in the reduction context,
     * modifying the first BigNumber with the result.
     *
     * @method imul
     *
     * @param a - First BigNumber to multiply.
     * @param b - Second BigNumber to multiply.
     *
     * @returns Returns the modified 'a' after multiplication with 'b' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * const a = new BigNumber(3);
     * context.imul(a, new BigNumber(2)); // Modifies 'a' to be 6
     */
    imul(a, b) {
      this.verify2(a, b);
      return this.imod(a.imul(b));
    }
    /**
     * Multiplies two BigNumbers in the reduction context.
     *
     * @method mul
     *
     * @param a - First BigNumber to multiply.
     * @param b - Second BigNumber to multiply.
     *
     * @returns Returns the result of 'a * b' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * context.mul(new BigNumber(3), new BigNumber(2)); // Returns 6
     */
    mul(a, b) {
      this.verify2(a, b);
      return this.imod(a.mul(b));
    }
    /**
     * Calculates the square of a BigNumber in the reduction context,
     * modifying the original BigNumber with the result.
     *
     * @method isqr
     *
     * @param a - BigNumber to be squared.
     *
     * @returns Returns the squared 'a' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * const a = new BigNumber(3);
     * context.isqr(a); // Modifies 'a' to be 2 (9 % 7 = 2)
     */
    isqr(a) {
      return this.imul(a, a.clone());
    }
    /**
     * Calculates the square of a BigNumber in the reduction context.
     *
     * @method sqr
     *
     * @param a - BigNumber to be squared.
     *
     * @returns Returns the result of 'a^2' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * context.sqr(new BigNumber(3)); // Returns 2 (9 % 7 = 2)
     */
    sqr(a) {
      return this.mul(a, a);
    }
    /**
     * Calculates the square root of a BigNumber in the reduction context.
     *
     * @method sqrt
     *
     * @param a - The BigNumber to calculate the square root of.
     *
     * @returns Returns the square root of 'a' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(9));
     * context.sqrt(new BigNumber(4)); // Returns 2
     */
    sqrt(a) {
      if (a.isZero())
        return a.clone();
      const mod3 = this.m.andln(3);
      this.assert(mod3 % 2 === 1);
      if (mod3 === 3) {
        const pow3 = this.m.add(new BigNumber(1)).iushrn(2);
        return this.pow(a, pow3);
      }
      const q = this.m.subn(1);
      let s2 = 0;
      while (!q.isZero() && q.andln(1) === 0) {
        s2++;
        q.iushrn(1);
      }
      this.assert(!q.isZero());
      const one = new BigNumber(1).toRed(this);
      const nOne = one.redNeg();
      const lpow = this.m.subn(1).iushrn(1);
      const zl = this.m.bitLength();
      const z = new BigNumber(2 * zl * zl).toRed(this);
      while (this.pow(z, lpow).cmp(nOne) !== 0) {
        z.redIAdd(nOne);
      }
      let c = this.pow(z, q);
      let r2 = this.pow(a, q.addn(1).iushrn(1));
      let t = this.pow(a, q);
      let m = s2;
      while (t.cmp(one) !== 0) {
        let tmp = t;
        let i = 0;
        while (tmp.cmp(one) !== 0) {
          tmp = tmp.redSqr();
          i++;
        }
        this.assert(i < m);
        const b = this.pow(c, new BigNumber(1).iushln(m - i - 1));
        r2 = r2.redMul(b);
        c = b.redSqr();
        t = t.redMul(c);
        m = i;
      }
      return r2;
    }
    /**
     * Calculates the multiplicative inverse of a BigNumber in the reduction context.
     *
     * @method invm
     *
     * @param a - The BigNumber to find the multiplicative inverse of.
     *
     * @returns Returns the multiplicative inverse of 'a' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(11));
     * context.invm(new BigNumber(3)); // Returns 4 (3*4 mod 11 = 1)
     */
    invm(a) {
      const inv = a._invmp(this.m);
      if (inv.negative !== 0) {
        inv.negative = 0;
        return this.imod(inv).redNeg();
      } else {
        return this.imod(inv);
      }
    }
    /**
     * Raises a BigNumber to a power in the reduction context.
     *
     * @method pow
     *
     * @param a - The BigNumber to be raised to a power.
     * @param num - The power to raise the BigNumber to.
     *
     * @returns Returns the result of 'a' raised to the power of 'num' in the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * context.pow(new BigNumber(3), new BigNumber(2)); // Returns 2 (3^2 % 7)
     */
    pow(a, num) {
      this.verify1(a);
      if (num.isZero())
        return new BigNumber(1).toRed(this);
      let result = new BigNumber(1).toRed(this);
      const base = a.clone();
      const bits = num.bitLength();
      for (let i = bits - 1; i >= 0; i--) {
        result = this.sqr(result);
        if (num.testn(i)) {
          result = this.mul(result, base);
        }
      }
      return result;
    }
    /**
     * Converts a BigNumber to its equivalent in the reduction context.
     *
     * @method convertTo
     *
     * @param num - The BigNumber to convert to the reduction context.
     *
     * @returns Returns the converted BigNumber compatible with the reduction context.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * context.convertTo(new BigNumber(8)); // Returns 1 (8 % 7)
     */
    convertTo(num) {
      const r2 = num.umod(this.m);
      return r2 === num ? r2.clone() : r2;
    }
    /**
     * Converts a BigNumber from reduction context to its regular form.
     *
     * @method convertFrom
     *
     * @param num - The BigNumber to convert from the reduction context.
     *
     * @returns Returns the converted BigNumber in its regular form.
     *
     * @example
     * const context = new ReductionContext(new BigNumber(7));
     * const a = context.convertTo(new BigNumber(8)); // 'a' is now 1 in the reduction context
     * context.convertFrom(a); // Returns 1
     */
    convertFrom(num) {
      const res = num.clone();
      res.red = null;
      return res;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/MontgomoryMethod.js
  var MontgomoryMethod = class extends ReductionContext {
    /**
     * @constructor
     * @param m - The modulus to be used for the Montgomery method reductions.
     */
    constructor(m) {
      super(m);
      __publicField(this, "shift");
      __publicField(this, "r");
      __publicField(this, "r2");
      __publicField(this, "rinv");
      __publicField(this, "minv");
      this.shift = this.m.bitLength();
      if (this.shift % 26 !== 0) {
        this.shift += 26 - this.shift % 26;
      }
      this.r = new BigNumber(1).iushln(this.shift);
      this.r2 = this.imod(this.r.sqr());
      this.rinv = this.r._invmp(this.m);
      this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
      this.minv = this.minv.umod(this.r);
      this.minv = this.r.sub(this.minv);
    }
    /**
     * Converts a number into the Montgomery domain.
     *
     * @method convertTo
     * @param num - The number to be converted into the Montgomery domain.
     * @returns The result of the conversion into the Montgomery domain.
     *
     * @example
     * const montMethod = new MontgomoryMethod(m);
     * const convertedNum = montMethod.convertTo(num);
     */
    convertTo(num) {
      return this.imod(num.ushln(this.shift));
    }
    /**
     * Converts a number from the Montgomery domain back to the original domain.
     *
     * @method convertFrom
     * @param num - The number to be converted from the Montgomery domain.
     * @returns The result of the conversion from the Montgomery domain.
     *
     * @example
     * const montMethod = new MontgomoryMethod(m);
     * const convertedNum = montMethod.convertFrom(num);
     */
    convertFrom(num) {
      const r2 = this.imod(num.mul(this.rinv));
      r2.red = null;
      return r2;
    }
    /**
     * Performs an in-place multiplication of two numbers in the Montgomery domain.
     *
     * @method imul
     * @param a - The first number to multiply.
     * @param b - The second number to multiply.
     * @returns The result of the in-place multiplication.
     *
     * @example
     * const montMethod = new MontgomoryMethod(m);
     * const product = montMethod.imul(a, b);
     */
    imul(a, b) {
      if (a.isZero() || b.isZero()) {
        a.words[0] = 0;
        a.length = 1;
        return a;
      }
      const t = a.imul(b);
      const c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      const u = t.isub(c).iushrn(this.shift);
      let res = u;
      if (u.cmp(this.m) >= 0) {
        res = u.isub(this.m);
      } else if (u.cmpn(0) < 0) {
        res = u.iadd(this.m);
      }
      return res.forceRed(this);
    }
    /**
     * Performs the multiplication of two numbers in the Montgomery domain.
     *
     * @method mul
     * @param a - The first number to multiply.
     * @param b - The second number to multiply.
     * @returns The result of the multiplication.
     *
     * @example
     * const montMethod = new MontgomoryMethod(m);
     * const product = montMethod.mul(a, b);
     */
    mul(a, b) {
      if (a.isZero() || b.isZero())
        return new BigNumber(0).forceRed(this);
      const t = a.mul(b);
      const c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      const u = t.isub(c).iushrn(this.shift);
      let res = u;
      if (u.cmp(this.m) >= 0) {
        res = u.isub(this.m);
      } else if (u.cmpn(0) < 0) {
        res = u.iadd(this.m);
      }
      return res.forceRed(this);
    }
    /**
     * Calculates the modular multiplicative inverse of a number in the Montgomery domain.
     *
     * @method invm
     * @param a - The number to compute the modular multiplicative inverse of.
     * @returns The modular multiplicative inverse of 'a'.
     *
     * @example
     * const montMethod = new MontgomoryMethod(m);
     * const inverse = montMethod.invm(a);
     */
    invm(a) {
      const res = this.imod(a._invmp(this.m).mul(this.r2));
      return res.forceRed(this);
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/UTF8.js
  var encoder = new TextEncoder();
  function utf8Bytes(value) {
    return encoder.encode(value);
  }

  // node_modules/@bsv/sdk/dist/esm/src/primitives/hex.js
  var PURE_HEX_REGEX = /^[0-9a-fA-F]*$/;
  function assertValidHex(msg) {
    if (typeof msg !== "string") {
      throw new TypeError("Invalid hex string");
    }
    if (msg.length === 0)
      return;
    if (!PURE_HEX_REGEX.test(msg)) {
      throw new Error("Invalid hex string");
    }
  }
  function normalizeHex(msg) {
    assertValidHex(msg);
    if (msg.length === 0)
      return "";
    let normalized = msg.toLowerCase();
    if (normalized.length % 2 !== 0) {
      normalized = "0" + normalized;
    }
    return normalized;
  }

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Hash.js
  var assert = (expression, message = "Hash assertion failed") => {
    if (!expression) {
      throw new Error(message);
    }
  };
  var BaseHash = class {
    constructor(blockSize, outSize, hmacStrength, padLength) {
      __publicField(this, "pending", null);
      __publicField(this, "pendingTotal", 0);
      __publicField(this, "blockSize");
      __publicField(this, "outSize");
      __publicField(this, "endian");
      __publicField(this, "_delta8");
      __publicField(this, "_delta32");
      __publicField(this, "padLength");
      __publicField(this, "hmacStrength");
      this.blockSize = blockSize;
      this.outSize = outSize;
      this.hmacStrength = hmacStrength;
      this.padLength = padLength / 8;
      this.endian = "big";
      this._delta8 = this.blockSize / 8;
      this._delta32 = this.blockSize / 32;
    }
    _update(_msg, _start) {
      throw new Error("Not implemented");
    }
    _digest() {
      throw new Error("Not implemented");
    }
    _digestHex() {
      throw new Error("Not implemented");
    }
    /**
     * Converts the input message into an array, pads it, and joins into 32bit blocks.
     * If there is enough data, it tries updating the hash computation.
     *
     * @method update
     * @param msg - The message segment to include in the hashing computation.
     * @param enc - The encoding of the message. If 'hex', the string will be treated as such, 'utf8' otherwise.
     *
     * @returns Returns the instance of the object for chaining.
     *
     * @example
     * sha256.update('Hello World', 'utf8');
     */
    update(msg, enc) {
      msg = toArray(msg, enc);
      if (this.pending == null) {
        this.pending = msg;
      } else {
        this.pending = this.pending.concat(msg);
      }
      this.pendingTotal += msg.length;
      if (this.pending.length >= this._delta8) {
        msg = this.pending;
        const r2 = msg.length % this._delta8;
        this.pending = msg.slice(msg.length - r2, msg.length);
        if (this.pending.length === 0) {
          this.pending = null;
        }
        msg = join32(msg, 0, msg.length - r2, this.endian);
        for (let i = 0; i < msg.length; i += this._delta32) {
          this._update(msg, i);
        }
      }
      return this;
    }
    /**
     * Finalizes the hash computation and returns the hash value/result.
     *
     * @method digest
     *
     * @returns Returns the final hash value.
     *
     * @example
     * const hash = sha256.digest();
     */
    digest() {
      this.update(this._pad());
      assert(this.pending === null);
      return this._digest();
    }
    /**
     * Finalizes the hash computation and returns the hash value/result as a hex string.
     *
     * @method digest
     *
     * @returns Returns the final hash value as a hex string.
     *
     * @example
     * const hash = sha256.digestHex();
     */
    digestHex() {
      this.update(this._pad());
      assert(this.pending === null);
      return this._digestHex();
    }
    /**
     * [Private Method] Used internally to prepare the padding for the final stage of the hash computation.
     *
     * @method _pad
     * @private
     *
     * @returns Returns an array denoting the padding.
     */
    _pad() {
      const len = this.pendingTotal;
      if (!Number.isSafeInteger(len) || len < 0) {
        throw new Error("Message too long for this hash function");
      }
      const bytes2 = this._delta8;
      const k = bytes2 - (len + this.padLength) % bytes2;
      const res = Array.from({ length: k + this.padLength });
      res[0] = 128;
      let i;
      for (i = 1; i < k; i++) {
        res[i] = 0;
      }
      const lengthBytes = this.padLength;
      const maxBits = 1n << BigInt(lengthBytes * 8);
      let totalBits = BigInt(len) * 8n;
      if (totalBits >= maxBits) {
        throw new Error("Message too long for this hash function");
      }
      if (this.endian === "big") {
        const lenArray = Array.from({ length: lengthBytes });
        for (let b = lengthBytes - 1; b >= 0; b--) {
          lenArray[b] = Number(totalBits & 0xffn);
          totalBits >>= 8n;
        }
        for (let b = 0; b < lengthBytes; b++) {
          res[i++] = lenArray[b];
        }
      } else {
        for (let b = 0; b < lengthBytes; b++) {
          res[i++] = Number(totalBits & 0xffn);
          totalBits >>= 8n;
        }
      }
      return res;
    }
  };
  function appendUtf8CodeUnit(msg, i, out) {
    const c = msg.codePointAt(i);
    if (c < 128) {
      out.push(c);
      return i;
    }
    if (c < 2048) {
      out.push(c >> 6 | 192, c & 63 | 128);
      return i;
    }
    if (c > 65535) {
      out.push(c >> 18 | 240, c >> 12 & 63 | 128, c >> 6 & 63 | 128, c & 63 | 128);
      return i + 1;
    }
    out.push(c >> 12 | 224, c >> 6 & 63 | 128, c & 63 | 128);
    return i;
  }
  function utf8StringToArray(msg) {
    const res = [];
    let i = 0;
    while (i < msg.length) {
      const lastConsumed = appendUtf8CodeUnit(msg, i, res);
      i = lastConsumed + 1;
    }
    return res;
  }
  function hexStringToArray(msg) {
    assertValidHex(msg);
    const normalized = normalizeHex(msg);
    const res = [];
    for (let i = 0; i < normalized.length; i += 2) {
      res.push(Number.parseInt(normalized[i] + normalized[i + 1], 16));
    }
    return res;
  }
  function numberArrayToByteArray(msg) {
    const res = [];
    for (let i = 0; i < msg.length; i++) {
      res[i] = Math.trunc(msg[i]);
    }
    return res;
  }
  function toArray(msg, enc) {
    if (Array.isArray(msg)) {
      return msg.slice();
    }
    if (!msg) {
      return [];
    }
    if (typeof msg === "string") {
      return enc === "hex" ? hexStringToArray(msg) : utf8StringToArray(msg);
    }
    return numberArrayToByteArray(msg);
  }
  function htonl(w) {
    return swapBytes32(w);
  }
  function toHex32(msg, endian) {
    let res = "";
    for (let w of msg) {
      if (endian === "little") {
        w = htonl(w);
      }
      res += zero8(w.toString(16));
    }
    return res;
  }
  function zero8(word) {
    if (word.length === 7) {
      return "0" + word;
    } else if (word.length === 6) {
      return "00" + word;
    } else if (word.length === 5) {
      return "000" + word;
    } else if (word.length === 4) {
      return "0000" + word;
    } else if (word.length === 3) {
      return "00000" + word;
    } else if (word.length === 2) {
      return "000000" + word;
    } else if (word.length === 1) {
      return "0000000" + word;
    } else {
      return word;
    }
  }
  var BufferCtor2 = typeof globalThis === "undefined" ? void 0 : globalThis.Buffer;
  var CAN_USE_BUFFER2 = BufferCtor2 != null && typeof BufferCtor2.from === "function";
  var HEX_DIGITS = "0123456789abcdef";
  var HEX_BYTE_STRINGS = Array.from({ length: 256 });
  for (let i = 0; i < HEX_BYTE_STRINGS.length; i++) {
    HEX_BYTE_STRINGS[i] = HEX_DIGITS[i >> 4 & 15] + HEX_DIGITS[i & 15];
  }
  function bytesToHex3(data) {
    if (CAN_USE_BUFFER2) {
      return BufferCtor2.from(data).toString("hex");
    }
    const out = Array.from({ length: data.length });
    for (let i = 0; i < data.length; i++)
      out[i] = HEX_BYTE_STRINGS[data[i]];
    return out.join("");
  }
  var NODE_CRYPTO = (() => {
    const processLike = typeof globalThis === "undefined" ? void 0 : globalThis.process;
    const getBuiltinModule = processLike?.getBuiltinModule;
    if (typeof getBuiltinModule === "function") {
      try {
        const crypto2 = getBuiltinModule.call(processLike, "node:crypto");
        if (crypto2 != null)
          return crypto2;
      } catch {
      }
    }
    return void 0;
  })();
  function toHashBytes(msg, enc) {
    if (msg instanceof Uint8Array) {
      return msg;
    }
    if (Array.isArray(msg)) {
      return new Uint8Array(msg);
    }
    return Uint8Array.from(toArray(msg, enc));
  }
  function toHashKeyBytes(key) {
    return typeof key === "string" ? toHashBytes(key, "hex") : toHashBytes(key);
  }
  function updateNativeOrFallback(native, fallback, data) {
    if (native != null) {
      native.update(data);
    } else if (fallback != null) {
      fallback.update(data);
    }
  }
  function digestNativeOrFallback(native, fallback) {
    if (native != null)
      return Array.from(native.digest());
    if (fallback != null)
      return Array.from(fallback.digest());
    return [];
  }
  function digestHexNativeOrFallback(native, fallback) {
    if (native != null)
      return native.digest("hex");
    if (fallback != null)
      return bytesToHex3(fallback.digest());
    return "";
  }
  function createNodeHash(algorithm) {
    const createHash = NODE_CRYPTO?.createHash;
    if (typeof createHash !== "function")
      return void 0;
    try {
      return createHash(algorithm);
    } catch {
      return void 0;
    }
  }
  function createNodeHmac(algorithm, keyBytes) {
    const createHmac = NODE_CRYPTO?.createHmac;
    if (typeof createHmac !== "function")
      return void 0;
    try {
      return createHmac(algorithm, keyBytes);
    } catch {
      return void 0;
    }
  }
  function digestWithNodeHash(algorithm, msg, enc) {
    const hash = createNodeHash(algorithm);
    if (hash == null)
      return void 0;
    hash.update(toHashBytes(msg, enc));
    return hash.digest();
  }
  function digestWithNodeHmac(algorithm, key, msg, enc) {
    const hmac3 = createNodeHmac(algorithm, toHashKeyBytes(key));
    if (hmac3 == null)
      return void 0;
    hmac3.update(toHashBytes(msg, enc));
    return hmac3.digest();
  }
  function join32(msg, start, end, endian) {
    const len = end - start;
    assert(len % 4 === 0);
    const res = Array.from({ length: len / 4 });
    for (let i = 0, k = start; i < res.length; i++, k += 4) {
      let w;
      if (endian === "big") {
        w = msg[k] << 24 | msg[k + 1] << 16 | msg[k + 2] << 8 | msg[k + 3];
      } else {
        w = msg[k + 3] << 24 | msg[k + 2] << 16 | msg[k + 1] << 8 | msg[k];
      }
      res[i] = w >>> 0;
    }
    return res;
  }
  function split32(msg, endian) {
    const res = Array.from({ length: msg.length * 4 });
    for (let i = 0, k = 0; i < msg.length; i++, k += 4) {
      const m = msg[i];
      if (endian === "big") {
        res[k] = m >>> 24;
        res[k + 1] = m >>> 16 & 255;
        res[k + 2] = m >>> 8 & 255;
        res[k + 3] = m & 255;
      } else {
        res[k + 3] = m >>> 24;
        res[k + 2] = m >>> 16 & 255;
        res[k + 1] = m >>> 8 & 255;
        res[k] = m & 255;
      }
    }
    return res;
  }
  function rotr32(w, b) {
    return w >>> b | w << 32 - b;
  }
  function rotl32(w, b) {
    return w << b | w >>> 32 - b;
  }
  function sum32(a, b) {
    return a + b >>> 0;
  }
  function SUM32_3(a, b, c) {
    return a + b + c >>> 0;
  }
  function SUM32_4(a, b, c, d) {
    return a + b + c + d >>> 0;
  }
  function SUM32_5(a, b, c, d, e) {
    return a + b + c + d + e >>> 0;
  }
  function ch32(x, y, z) {
    return x & y ^ ~x & z;
  }
  function maj32(x, y, z) {
    return x & y ^ x & z ^ y & z;
  }
  function S0_256(x) {
    return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
  }
  function S1_256(x) {
    return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
  }
  function G0_256(x) {
    return rotr32(x, 7) ^ rotr32(x, 18) ^ x >>> 3;
  }
  function G1_256(x) {
    return rotr32(x, 17) ^ rotr32(x, 19) ^ x >>> 10;
  }
  var r = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    7,
    4,
    13,
    1,
    10,
    6,
    15,
    3,
    12,
    0,
    9,
    5,
    2,
    14,
    11,
    8,
    3,
    10,
    14,
    4,
    9,
    15,
    8,
    1,
    2,
    7,
    0,
    6,
    13,
    11,
    5,
    12,
    1,
    9,
    11,
    10,
    0,
    8,
    12,
    4,
    13,
    3,
    7,
    15,
    14,
    5,
    6,
    2,
    4,
    0,
    5,
    9,
    7,
    12,
    2,
    10,
    14,
    1,
    3,
    8,
    11,
    6,
    15,
    13
  ];
  var rh = [
    5,
    14,
    7,
    0,
    9,
    2,
    11,
    4,
    13,
    6,
    15,
    8,
    1,
    10,
    3,
    12,
    6,
    11,
    3,
    7,
    0,
    13,
    5,
    10,
    14,
    15,
    8,
    12,
    4,
    9,
    1,
    2,
    15,
    5,
    1,
    3,
    7,
    14,
    6,
    9,
    11,
    8,
    12,
    2,
    10,
    0,
    4,
    13,
    8,
    6,
    4,
    1,
    3,
    11,
    15,
    0,
    5,
    12,
    2,
    13,
    9,
    7,
    10,
    14,
    12,
    15,
    10,
    4,
    1,
    5,
    8,
    7,
    6,
    2,
    13,
    14,
    0,
    3,
    9,
    11
  ];
  var s = [
    11,
    14,
    15,
    12,
    5,
    8,
    7,
    9,
    11,
    13,
    14,
    15,
    6,
    7,
    9,
    8,
    7,
    6,
    8,
    13,
    11,
    9,
    7,
    15,
    7,
    12,
    15,
    9,
    11,
    7,
    13,
    12,
    11,
    13,
    6,
    7,
    14,
    9,
    13,
    15,
    14,
    8,
    13,
    6,
    5,
    12,
    7,
    5,
    11,
    12,
    14,
    15,
    14,
    15,
    9,
    8,
    9,
    14,
    5,
    6,
    8,
    6,
    5,
    12,
    9,
    15,
    5,
    11,
    6,
    8,
    13,
    12,
    5,
    12,
    13,
    14,
    11,
    8,
    5,
    6
  ];
  var sh = [
    8,
    9,
    9,
    11,
    13,
    15,
    15,
    5,
    7,
    7,
    8,
    11,
    14,
    14,
    12,
    6,
    9,
    13,
    15,
    7,
    12,
    8,
    9,
    11,
    7,
    7,
    12,
    7,
    6,
    15,
    13,
    11,
    9,
    7,
    15,
    11,
    8,
    6,
    6,
    14,
    12,
    13,
    5,
    14,
    13,
    13,
    7,
    5,
    15,
    5,
    8,
    11,
    14,
    14,
    6,
    14,
    6,
    9,
    12,
    9,
    12,
    5,
    15,
    8,
    8,
    5,
    12,
    9,
    12,
    5,
    14,
    6,
    8,
    13,
    6,
    5,
    15,
    13,
    11,
    11
  ];
  function f(j, x, y, z) {
    if (j <= 15) {
      return x ^ y ^ z;
    } else if (j <= 31) {
      return x & y | ~x & z;
    } else if (j <= 47) {
      return (x | ~y) ^ z;
    } else if (j <= 63) {
      return x & z | y & ~z;
    } else {
      return x ^ (y | ~z);
    }
  }
  function K(j) {
    if (j <= 15) {
      return 0;
    } else if (j <= 31) {
      return 1518500249;
    } else if (j <= 47) {
      return 1859775393;
    } else if (j <= 63) {
      return 2400959708;
    } else {
      return 2840853838;
    }
  }
  function Kh(j) {
    if (j <= 15) {
      return 1352829926;
    } else if (j <= 31) {
      return 1548603684;
    } else if (j <= 47) {
      return 1836072691;
    } else if (j <= 63) {
      return 2053994217;
    } else {
      return 0;
    }
  }
  var RIPEMD160 = class extends BaseHash {
    constructor() {
      super(512, 160, 192, 64);
      __publicField(this, "h");
      this.endian = "little";
      this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
      this.endian = "little";
    }
    _update(msg, start) {
      let A = this.h[0];
      let B = this.h[1];
      let C = this.h[2];
      let D = this.h[3];
      let E = this.h[4];
      let Ah = A;
      let Bh = B;
      let Ch = C;
      let Dh = D;
      let Eh = E;
      let T;
      for (let j = 0; j < 80; j++) {
        T = sum32(rotl32(SUM32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)), s[j]), E);
        A = E;
        E = D;
        D = rotl32(C, 10);
        C = B;
        B = T;
        T = sum32(rotl32(SUM32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)), sh[j]), Eh);
        Ah = Eh;
        Eh = Dh;
        Dh = rotl32(Ch, 10);
        Ch = Bh;
        Bh = T;
      }
      T = SUM32_3(this.h[1], C, Dh);
      this.h[1] = SUM32_3(this.h[2], D, Eh);
      this.h[2] = SUM32_3(this.h[3], E, Ah);
      this.h[3] = SUM32_3(this.h[4], A, Bh);
      this.h[4] = SUM32_3(this.h[0], B, Ch);
      this.h[0] = T;
    }
    _digest() {
      return split32(this.h, "little");
    }
    _digestHex() {
      return toHex32(this.h, "little");
    }
  };
  var _h, _native;
  var SHA256HMAC = class {
    /**
     * The constructor for the `SHA256HMAC` class.
     *
     * It initializes the `SHA256HMAC` object and sets up the inner and outer padded keys.
     * If the key size is larger than the blockSize, it is digested using SHA-256.
     * If the key size is less than the blockSize, it is padded with zeroes.
     *
     * @constructor
     * @param key - The key to use to create the HMAC. Can be a number array or a string in hexadecimal format.
     *
     * @example
     * const myHMAC = new SHA256HMAC('deadbeef');
     */
    constructor(key) {
      __privateAdd(this, _h);
      __privateAdd(this, _native);
      __publicField(this, "blockSize", 64);
      __publicField(this, "outSize", 32);
      const k = toHashKeyBytes(key);
      __privateSet(this, _native, createNodeHmac("sha256", k));
      if (__privateGet(this, _native) == null) {
        __privateSet(this, _h, new HMAC(sha256Fast, k));
      }
    }
    /**
     * Updates the `SHA256HMAC` object with part of the message to be hashed.
     *
     * @method update
     * @param msg - Part of the message to hash. Can be a number array or a string.
     * @param enc - If 'hex', then the input is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.
     * @returns Returns the instance of `SHA256HMAC` for chaining calls.
     *
     * @example
     * myHMAC.update('deadbeef', 'hex');
     */
    update(msg, enc) {
      updateNativeOrFallback(__privateGet(this, _native), __privateGet(this, _h), toHashBytes(msg, enc));
      return this;
    }
    /**
     * Finalizes the HMAC computation and returns the resultant hash.
     *
     * @method digest
     * @returns Returns the digest of the hashed data. Can be a number array or a string.
     *
     * @example
     * let hashedMessage = myHMAC.digest();
     */
    digest() {
      return digestNativeOrFallback(__privateGet(this, _native), __privateGet(this, _h));
    }
    /**
     * Finalizes the HMAC computation and returns the resultant hash as a hex string.
     *
     * @method digest
     * @returns Returns the digest of the hashed data as a hex string
     *
     * @example
     * let hashedMessage = myHMAC.digestHex();
     */
    digestHex() {
      return digestHexNativeOrFallback(__privateGet(this, _native), __privateGet(this, _h));
    }
  };
  _h = new WeakMap();
  _native = new WeakMap();
  var _h2, _native2;
  var SHA512HMAC = class {
    /**
     * The constructor for the `SHA512HMAC` class.
     *
     * It initializes the `SHA512HMAC` object and sets up the inner and outer padded keys.
     * If the key size is larger than the blockSize, it is digested using SHA-512.
     * If the key size is less than the blockSize, it is padded with zeroes.
     *
     * @constructor
     * @param key - The key to use to create the HMAC. Can be a number array or a string in hexadecimal format.
     *
     * @example
     * const myHMAC = new SHA512HMAC('deadbeef');
     */
    constructor(key) {
      __privateAdd(this, _h2);
      __privateAdd(this, _native2);
      __publicField(this, "blockSize", 128);
      __publicField(this, "outSize", 32);
      const k = toHashKeyBytes(key);
      __privateSet(this, _native2, createNodeHmac("sha512", k));
      if (__privateGet(this, _native2) == null) {
        __privateSet(this, _h2, new HMAC(sha512Fast, k));
      }
    }
    /**
     * Updates the `SHA512HMAC` object with part of the message to be hashed.
     *
     * @method update
     * @param msg - Part of the message to hash. Can be a number array or a string.
     * @param enc - If 'hex', then the input is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.
     * @returns Returns the instance of `SHA512HMAC` for chaining calls.
     *
     * @example
     * myHMAC.update('deadbeef', 'hex');
     */
    update(msg, enc) {
      updateNativeOrFallback(__privateGet(this, _native2), __privateGet(this, _h2), toHashBytes(msg, enc));
      return this;
    }
    /**
     * Finalizes the HMAC computation and returns the resultant hash.
     *
     * @method digest
     * @returns Returns the digest of the hashed data as a number array.
     *
     * @example
     * let hashedMessage = myHMAC.digest();
     */
    digest() {
      return digestNativeOrFallback(__privateGet(this, _native2), __privateGet(this, _h2));
    }
    /**
     * Finalizes the HMAC computation and returns the resultant hash as a hex string.
     *
     * @method digest
     * @returns Returns the digest of the hashed data as a hex string
     *
     * @example
     * let hashedMessage = myHMAC.digestHex();
     */
    digestHex() {
      return digestHexNativeOrFallback(__privateGet(this, _native2), __privateGet(this, _h2));
    }
  };
  _h2 = new WeakMap();
  _native2 = new WeakMap();
  function sha256Bytes(msg, enc) {
    const native = digestWithNodeHash("sha256", msg, enc);
    if (native != null)
      return native;
    return new FastSHA256().update(toHashBytes(msg, enc)).digest();
  }
  function ripemd160Bytes(msg, enc) {
    return digestWithNodeHash("ripemd160", msg, enc);
  }
  var sha2562 = (msg, enc) => {
    return Array.from(sha256Bytes(msg, enc));
  };
  var hash256 = (msg, enc) => {
    return Array.from(sha256Bytes(sha256Bytes(msg, enc)));
  };
  var hash1602 = (msg, enc) => {
    const first = sha256Bytes(msg, enc);
    const native = ripemd160Bytes(first);
    if (native != null)
      return Array.from(native);
    return new RIPEMD160().update(first).digest();
  };
  var sha256hmac = (key, msg, enc) => {
    const native = digestWithNodeHmac("sha256", key, msg, enc);
    if (native != null)
      return Array.from(native);
    return new SHA256HMAC(key).update(msg, enc).digest();
  };
  var sha512hmac = (key, msg, enc) => {
    const native = digestWithNodeHmac("sha512", key, msg, enc);
    if (native != null)
      return Array.from(native);
    return new SHA512HMAC(key).update(msg, enc).digest();
  };
  function isBytes4(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber4(n) {
    if (!Number.isSafeInteger(n) || n < 0) {
      throw new Error(`positive integer expected, got ${n}`);
    }
  }
  function abytes4(b, ...lengths) {
    if (!isBytes4(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length)) {
      const lens = lengths.join(",");
      throw new Error(`Uint8Array expected of length ${lens}, got length=${b.length}`);
    }
  }
  function ahash2(h) {
    if (typeof h !== "function" || typeof h.create !== "function") {
      throw new TypeError("Hash should be wrapped by utils.createHasher");
    }
    anumber4(h.outputLen);
    anumber4(h.blockLen);
  }
  function aexists2(instance, checkFinished = true) {
    if (instance.destroyed === true)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished === true) {
      throw new Error("Hash#digest() has already been called");
    }
  }
  function aoutput2(out, instance) {
    abytes4(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  }
  function clean2(...arrays) {
    for (const arr of arrays)
      arr.fill(0);
  }
  function createView2(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes2(data);
    abytes4(data);
    return data;
  }
  function utf8ToBytes2(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return utf8Bytes(str);
  }
  var kdfInputToBytes2 = toBytes;
  var Hash = class {
  };
  function createHasher2(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  var U32_MASK642 = BigInt(2 ** 32 - 1);
  var _32n2 = BigInt(32);
  function fromBig2(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK642), l: Number(n >> _32n2 & U32_MASK642) };
    return { h: Number(n >> _32n2 & U32_MASK642) | 0, l: Number(n & U32_MASK642) | 0 };
  }
  function split2(lst, le = false) {
    const len = lst.length;
    const Ah = new Uint32Array(len);
    const Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig2(lst[i], le);
      Ah[i] = h;
      Al[i] = l;
    }
    return [Ah, Al];
  }
  var shrSH2 = (h, _l, s2) => h >>> s2;
  var shrSL2 = (h, l, s2) => h << 32 - s2 | l >>> s2;
  var rotrSH2 = (h, l, s2) => h >>> s2 | l << 32 - s2;
  var rotrSL2 = (h, l, s2) => h << 32 - s2 | l >>> s2;
  var rotrBH2 = (h, l, s2) => h << 64 - s2 | l >>> s2 - 32;
  var rotrBL2 = (h, l, s2) => h >>> s2 - 32 | l << 64 - s2;
  function add2(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  var add3L2 = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
  var add3H2 = (low, Ah, Bh, Ch) => Math.trunc(Ah + Bh + Ch + Math.trunc(low / 2 ** 32));
  var add4L2 = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
  var add4H2 = (low, Ah, Bh, Ch, Dh) => Math.trunc(Ah + Bh + Ch + Dh + Math.trunc(low / 2 ** 32));
  var add5L2 = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
  var add5H2 = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
  var HashMD2 = class extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE) {
      super();
      __publicField(this, "blockLen");
      __publicField(this, "outputLen");
      __publicField(this, "padOffset");
      __publicField(this, "isLE");
      __publicField(this, "buffer");
      __publicField(this, "view");
      __publicField(this, "finished", false);
      __publicField(this, "length", 0);
      __publicField(this, "pos", 0);
      __publicField(this, "destroyed", false);
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView2(this.buffer);
    }
    update(data) {
      aexists2(this);
      data = toBytes(data);
      abytes4(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView2(data);
          for (; blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists2(this);
      aoutput2(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean2(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
      this.process(view, 0);
      const oview = createView2(out);
      const len = this.outputLen;
      if (len % 4 !== 0)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to ?? (to = new this.constructor());
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen !== 0)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE);
    const _32n3 = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n3 & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
  }
  var SHA256_IV2 = Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var K2562 = Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W2 = new Uint32Array(64);
  var FastSHA256 = class extends HashMD2 {
    constructor(outputLen = 32) {
      super(64, outputLen, 8, false);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "A", SHA256_IV2[0] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "B", SHA256_IV2[1] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "C", SHA256_IV2[2] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "D", SHA256_IV2[3] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "E", SHA256_IV2[4] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "F", SHA256_IV2[5] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "G", SHA256_IV2[6] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "H", SHA256_IV2[7] | 0);
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    set(...[A, B, C, D, E, F, G, H]) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4) {
        SHA256_W2[i] = view.getUint32(offset);
      }
      for (let i = 16; i < 64; i++) {
        const w15 = SHA256_W2[i - 15];
        const w2 = SHA256_W2[i - 2];
        const s0 = G0_256(w15);
        const s1 = G1_256(w2);
        SHA256_W2[i] = sum32(sum32(s0, SHA256_W2[i - 7]), sum32(s1, SHA256_W2[i - 16]));
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const T1 = SUM32_5(H, S1_256(E), ch32(E, F, G), K2562[i], SHA256_W2[i]);
        const T2 = sum32(S0_256(A), maj32(A, B, C));
        H = G;
        G = F;
        F = E;
        E = sum32(D, T1);
        D = C;
        C = B;
        B = A;
        A = sum32(T1, T2);
      }
      this.A = sum32(this.A, A);
      this.B = sum32(this.B, B);
      this.C = sum32(this.C, C);
      this.D = sum32(this.D, D);
      this.E = sum32(this.E, E);
      this.F = sum32(this.F, F);
      this.G = sum32(this.G, G);
      this.H = sum32(this.H, H);
    }
    roundClean() {
      clean2(SHA256_W2);
    }
    destroy() {
      clean2(this.buffer);
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
    }
  };
  var sha256Fast = createHasher2(() => new FastSHA256());
  var SHA512_IV2 = Uint32Array.from([
    1779033703,
    4089235720,
    3144134277,
    2227873595,
    1013904242,
    4271175723,
    2773480762,
    1595750129,
    1359893119,
    2917565137,
    2600822924,
    725511199,
    528734635,
    4215389547,
    1541459225,
    327033209
  ]);
  var K5122 = (() => split2([
    "0x428a2f98d728ae22",
    "0x7137449123ef65cd",
    "0xb5c0fbcfec4d3b2f",
    "0xe9b5dba58189dbbc",
    "0x3956c25bf348b538",
    "0x59f111f1b605d019",
    "0x923f82a4af194f9b",
    "0xab1c5ed5da6d8118",
    "0xd807aa98a3030242",
    "0x12835b0145706fbe",
    "0x243185be4ee4b28c",
    "0x550c7dc3d5ffb4e2",
    "0x72be5d74f27b896f",
    "0x80deb1fe3b1696b1",
    "0x9bdc06a725c71235",
    "0xc19bf174cf692694",
    "0xe49b69c19ef14ad2",
    "0xefbe4786384f25e3",
    "0x0fc19dc68b8cd5b5",
    "0x240ca1cc77ac9c65",
    "0x2de92c6f592b0275",
    "0x4a7484aa6ea6e483",
    "0x5cb0a9dcbd41fbd4",
    "0x76f988da831153b5",
    "0x983e5152ee66dfab",
    "0xa831c66d2db43210",
    "0xb00327c898fb213f",
    "0xbf597fc7beef0ee4",
    "0xc6e00bf33da88fc2",
    "0xd5a79147930aa725",
    "0x06ca6351e003826f",
    "0x142929670a0e6e70",
    "0x27b70a8546d22ffc",
    "0x2e1b21385c26c926",
    "0x4d2c6dfc5ac42aed",
    "0x53380d139d95b3df",
    "0x650a73548baf63de",
    "0x766a0abb3c77b2a8",
    "0x81c2c92e47edaee6",
    "0x92722c851482353b",
    "0xa2bfe8a14cf10364",
    "0xa81a664bbc423001",
    "0xc24b8b70d0f89791",
    "0xc76c51a30654be30",
    "0xd192e819d6ef5218",
    "0xd69906245565a910",
    "0xf40e35855771202a",
    "0x106aa07032bbd1b8",
    "0x19a4c116b8d2d0c8",
    "0x1e376c085141ab53",
    "0x2748774cdf8eeb99",
    "0x34b0bcb5e19b48a8",
    "0x391c0cb3c5c95a63",
    "0x4ed8aa4ae3418acb",
    "0x5b9cca4f7763e373",
    "0x682e6ff3d6b2b8a3",
    "0x748f82ee5defb2fc",
    "0x78a5636f43172f60",
    "0x84c87814a1f0ab72",
    "0x8cc702081a6439ec",
    "0x90befffa23631e28",
    "0xa4506cebde82bde9",
    "0xbef9a3f7b2c67915",
    "0xc67178f2e372532b",
    "0xca273eceea26619c",
    "0xd186b8c721c0c207",
    "0xeada7dd6cde0eb1e",
    "0xf57d4f7fee6ed178",
    "0x06f067aa72176fba",
    "0x0a637dc5a2c898a6",
    "0x113f9804bef90dae",
    "0x1b710b35131c471b",
    "0x28db77f523047d84",
    "0x32caab7b40c72493",
    "0x3c9ebe0a15c9bebc",
    "0x431d67c49c100d4c",
    "0x4cc5d4becb3e42b6",
    "0x597f299cfc657e2a",
    "0x5fcb6fab3ad6faec",
    "0x6c44198c4a475817"
  ].map(BigInt)))();
  var SHA512_Kh2 = (() => K5122[0])();
  var SHA512_Kl2 = (() => K5122[1])();
  var SHA512_W_H2 = new Uint32Array(80);
  var SHA512_W_L2 = new Uint32Array(80);
  var FastSHA512 = class extends HashMD2 {
    constructor(outputLen = 64) {
      super(128, outputLen, 16, false);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Ah", SHA512_IV2[0] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Al", SHA512_IV2[1] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Bh", SHA512_IV2[2] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Bl", SHA512_IV2[3] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Ch", SHA512_IV2[4] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Cl", SHA512_IV2[5] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Dh", SHA512_IV2[6] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Dl", SHA512_IV2[7] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Eh", SHA512_IV2[8] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "El", SHA512_IV2[9] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Fh", SHA512_IV2[10] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Fl", SHA512_IV2[11] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Gh", SHA512_IV2[12] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Gl", SHA512_IV2[13] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Hh", SHA512_IV2[14] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Hl", SHA512_IV2[15] | 0);
    }
    get() {
      const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
      return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
    }
    set(...[Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl]) {
      this.Ah = Ah | 0;
      this.Al = Al | 0;
      this.Bh = Bh | 0;
      this.Bl = Bl | 0;
      this.Ch = Ch | 0;
      this.Cl = Cl | 0;
      this.Dh = Dh | 0;
      this.Dl = Dl | 0;
      this.Eh = Eh | 0;
      this.El = El | 0;
      this.Fh = Fh | 0;
      this.Fl = Fl | 0;
      this.Gh = Gh | 0;
      this.Gl = Gl | 0;
      this.Hh = Hh | 0;
      this.Hl = Hl | 0;
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 8) {
        SHA512_W_H2[i] = view.getUint32(offset);
        SHA512_W_L2[i] = view.getUint32(offset + 4);
      }
      for (let i = 16; i < 80; i++) {
        const W15h = SHA512_W_H2[i - 15] | 0;
        const W15l = SHA512_W_L2[i - 15] | 0;
        const s0h = rotrSH2(W15h, W15l, 1) ^ rotrSH2(W15h, W15l, 8) ^ shrSH2(W15h, W15l, 7);
        const s0l = rotrSL2(W15h, W15l, 1) ^ rotrSL2(W15h, W15l, 8) ^ shrSL2(W15h, W15l, 7);
        const W2h = SHA512_W_H2[i - 2] | 0;
        const W2l = SHA512_W_L2[i - 2] | 0;
        const s1h = rotrSH2(W2h, W2l, 19) ^ rotrBH2(W2h, W2l, 61) ^ shrSH2(W2h, W2l, 6);
        const s1l = rotrSL2(W2h, W2l, 19) ^ rotrBL2(W2h, W2l, 61) ^ shrSL2(W2h, W2l, 6);
        const SUMl = add4L2(s0l, s1l, SHA512_W_L2[i - 7], SHA512_W_L2[i - 16]);
        const SUMh = add4H2(SUMl, s0h, s1h, SHA512_W_H2[i - 7], SHA512_W_H2[i - 16]);
        SHA512_W_H2[i] = SUMh | 0;
        SHA512_W_L2[i] = SUMl | 0;
      }
      let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
      for (let i = 0; i < 80; i++) {
        const sigma1h = rotrSH2(Eh, El, 14) ^ rotrSH2(Eh, El, 18) ^ rotrBH2(Eh, El, 41);
        const sigma1l = rotrSL2(Eh, El, 14) ^ rotrSL2(Eh, El, 18) ^ rotrBL2(Eh, El, 41);
        const CHIh = Eh & Fh ^ ~Eh & Gh;
        const CHIl = El & Fl ^ ~El & Gl;
        const T1ll = add5L2(Hl, sigma1l, CHIl, SHA512_Kl2[i], SHA512_W_L2[i]);
        const T1h = add5H2(T1ll, Hh, sigma1h, CHIh, SHA512_Kh2[i], SHA512_W_H2[i]);
        const T1l = T1ll | 0;
        const sigma0h = rotrSH2(Ah, Al, 28) ^ rotrBH2(Ah, Al, 34) ^ rotrBH2(Ah, Al, 39);
        const sigma0l = rotrSL2(Ah, Al, 28) ^ rotrBL2(Ah, Al, 34) ^ rotrBL2(Ah, Al, 39);
        const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
        const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
        Hh = Gh | 0;
        Hl = Gl | 0;
        Gh = Fh | 0;
        Gl = Fl | 0;
        Fh = Eh | 0;
        Fl = El | 0;
        ({ h: Eh, l: El } = add2(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
        Dh = Ch | 0;
        Dl = Cl | 0;
        Ch = Bh | 0;
        Cl = Bl | 0;
        Bh = Ah | 0;
        Bl = Al | 0;
        const T2l = add3L2(sigma0l, MAJl, T1l);
        Ah = add3H2(T2l, sigma0h, MAJh, T1h);
        Al = T2l | 0;
      }
      ;
      ({ h: Ah, l: Al } = add2(Ah, Al, this.Ah, this.Al));
      ({ h: Bh, l: Bl } = add2(Bh, Bl, this.Bh, this.Bl));
      ({ h: Ch, l: Cl } = add2(Ch, Cl, this.Ch, this.Cl));
      ({ h: Dh, l: Dl } = add2(Dh, Dl, this.Dh, this.Dl));
      ({ h: Eh, l: El } = add2(Eh, El, this.Eh, this.El));
      ({ h: Fh, l: Fl } = add2(Fh, Fl, this.Fh, this.Fl));
      ({ h: Gh, l: Gl } = add2(Gh, Gl, this.Gh, this.Gl));
      ({ h: Hh, l: Hl } = add2(Hh, Hl, this.Hh, this.Hl));
      this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
      clean2(SHA512_W_H2, SHA512_W_L2);
    }
    destroy() {
      clean2(this.buffer);
      this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  };
  var sha512Fast = createHasher2(() => new FastSHA512());
  var HMAC = class extends Hash {
    constructor(hash, _key) {
      super();
      __publicField(this, "oHash");
      __publicField(this, "iHash");
      __publicField(this, "blockLen");
      __publicField(this, "outputLen");
      __publicField(this, "finished", false);
      __publicField(this, "destroyed", false);
      ahash2(hash);
      const key = toBytes(_key);
      this.iHash = hash.create();
      if (typeof this.iHash.update !== "function") {
        throw new TypeError("Expected instance of class which extends utils.Hash");
      }
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash.create();
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      clean2(pad);
    }
    update(buf) {
      aexists2(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists2(this);
      abytes4(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to ?? (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash ?? void 0);
      to.iHash = iHash._cloneInto(to.iHash ?? void 0);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  function pbkdf2Core(hash, password, salt, opts) {
    ahash2(hash);
    const { c, dkLen = 32 } = { ...opts };
    anumber4(c);
    anumber4(dkLen);
    if (c < 1)
      throw new Error("iterations (c) should be >= 1");
    const pwd = kdfInputToBytes2(password);
    const slt = kdfInputToBytes2(salt);
    const DK = new Uint8Array(dkLen);
    const PRF = hmac2.create(hash, pwd);
    const PRFSalt = PRF._cloneInto().update(slt);
    let prfW;
    const arr = new Uint8Array(4);
    const view = createView2(arr);
    const u = new Uint8Array(PRF.outputLen);
    for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
      const Ti = DK.subarray(pos, pos + PRF.outputLen);
      view.setInt32(0, ti, false);
      prfW = PRFSalt._cloneInto(prfW);
      prfW.update(arr).digestInto(u);
      Ti.set(u.subarray(0, Ti.length));
      for (let ui = 1; ui < c; ui++) {
        PRF._cloneInto(prfW).update(u).digestInto(u);
        for (let i = 0; i < Ti.length; i++)
          Ti[i] ^= u[i];
      }
    }
    PRF.destroy();
    PRFSalt.destroy();
    if (prfW != null)
      prfW.destroy();
    clean2(u);
    return DK;
  }
  var hmac2 = (hash, key, message) => new HMAC(hash, key).update(message).digest();
  hmac2.create = (hash, key) => new HMAC(hash, key);
  function pbkdf2Fast(password, salt, iterations, keylen) {
    return pbkdf2Core(sha512Fast, password, salt, { c: iterations, dkLen: keylen });
  }
  function pbkdf22(password, salt, iterations, keylen, digest = "sha512") {
    if (digest !== "sha512") {
      throw new Error("Only sha512 is supported in this PBKDF2 implementation");
    }
    const pbkdf2Sync = NODE_CRYPTO?.pbkdf2Sync;
    if (typeof pbkdf2Sync === "function") {
      const out2 = pbkdf2Sync(toHashBytes(password), toHashBytes(salt), iterations, keylen, digest);
      return Array.from(out2);
    }
    const p = Uint8Array.from(password);
    const s2 = Uint8Array.from(salt);
    const out = pbkdf2Fast(p, s2, iterations, keylen);
    return Array.from(out);
  }
  function swapBytes32(w) {
    const res = w >>> 24 | w >>> 8 & 65280 | w << 8 & 16711680 | (w & 255) << 24;
    return res >>> 0;
  }
  var isLittleEndian = (() => {
    const b = new ArrayBuffer(4);
    const a = new Uint32Array(b);
    const c = new Uint8Array(b);
    a[0] = 16909060;
    return c[0] === 4;
  })();

  // node_modules/@bsv/sdk/dist/esm/src/primitives/readVarIntNumStrict.js
  var UINT32_MAX = new BigNumber(4294967295);
  var UINT64_MAX = new BigNumber(2).pow(new BigNumber(64)).sub(new BigNumber(1));
  var MAX_SAFE_INTEGER = new BigNumber(Number.MAX_SAFE_INTEGER);
  function readVarIntNumStrict(reader, signed = true) {
    const first = reader.readUInt8();
    if (first < 253)
      return first;
    if (first === 253) {
      const value2 = reader.readUInt16LE();
      if (value2 < 253)
        throw new Error("non-canonical varInt");
      return value2;
    }
    if (first === 254) {
      const value2 = reader.readUInt32LE();
      if (value2 <= 65535)
        throw new Error("non-canonical varInt");
      return value2;
    }
    const value = reader.readUInt64LEBn();
    if (value.lte(UINT32_MAX))
      throw new Error("non-canonical varInt");
    if (signed && value.eq(UINT64_MAX))
      return -1;
    if (value.gt(MAX_SAFE_INTEGER)) {
      throw new Error("number too large to retain precision - use readVarIntBn");
    }
    return value.toNumber();
  }

  // node_modules/@bsv/sdk/dist/esm/src/primitives/utils.js
  var BufferCtor3 = globalThis.Buffer;
  var CAN_USE_BUFFER3 = BufferCtor3 != null && typeof BufferCtor3.from === "function";
  var HEX_DIGITS2 = "0123456789abcdef";
  var HEX_BYTE_STRINGS2 = Array.from({ length: 256 }, () => "");
  for (let i = 0; i < 256; i++) {
    HEX_BYTE_STRINGS2[i] = HEX_DIGITS2[i >> 4 & 15] + HEX_DIGITS2[i & 15];
  }
  var toHex = (msg) => {
    if (CAN_USE_BUFFER3) {
      return BufferCtor3.from(msg).toString("hex");
    }
    if (msg.length === 0)
      return "";
    return Array.from(msg, (byte) => HEX_BYTE_STRINGS2[byte & 255]).join("");
  };
  var toArray2 = (msg, enc) => {
    if (Array.isArray(msg))
      return msg.slice();
    if (msg === void 0)
      return [];
    if (typeof msg !== "string") {
      return Array.from(msg, (item) => Math.trunc(item));
    }
    switch (enc) {
      case "hex":
        return hexToArray(msg);
      case "base64":
        return base64ToArray(msg);
      default:
        return utf8ToArray(msg);
    }
  };
  var HEX_CHAR_TO_VALUE2 = new Int8Array(256).fill(-1);
  for (let i = 0; i < 10; i++) {
    HEX_CHAR_TO_VALUE2[48 + i] = i;
  }
  for (let i = 0; i < 6; i++) {
    HEX_CHAR_TO_VALUE2[65 + i] = 10 + i;
    HEX_CHAR_TO_VALUE2[97 + i] = 10 + i;
  }
  var hexToArray = (msg) => {
    return Array.from(hexToUint8Array(msg));
  };
  var hexToUint8Array = (msg) => {
    assertValidHex(msg);
    const normalized = msg.length % 2 === 0 ? msg : "0" + msg;
    if (CAN_USE_BUFFER3) {
      const decoded = BufferCtor3.from(normalized, "hex");
      return new Uint8Array(decoded.buffer, decoded.byteOffset, decoded.byteLength);
    }
    const out = new Uint8Array(normalized.length / 2);
    let o = 0;
    for (let i = 0; i < normalized.length; i += 2) {
      const hi = HEX_CHAR_TO_VALUE2[normalized.codePointAt(i)];
      const lo = HEX_CHAR_TO_VALUE2[normalized.codePointAt(i + 1)];
      out[o++] = hi << 4 | lo;
    }
    return out;
  };
  var normalizeBase64 = (msg) => {
    if (typeof msg !== "string")
      throw new TypeError("msg must be a string");
    const normalized = msg.trim().replaceAll(/[\r\n\t\f\v ]+/g, "").replaceAll("-", "+").replaceAll("_", "/");
    const padIndex = normalized.indexOf("=");
    if (padIndex === -1)
      return normalized;
    const pad = normalized.slice(padIndex);
    if (!/^={1,2}$/.test(pad) || normalized.slice(0, padIndex).includes("=")) {
      throw new Error("Invalid base64 padding");
    }
    return normalized.slice(0, padIndex);
  };
  var base64CharacterValue = (codePoint, index) => {
    if (codePoint >= 65 && codePoint <= 90)
      return codePoint - 65;
    if (codePoint >= 97 && codePoint <= 122)
      return codePoint - 97 + 26;
    if (codePoint >= 48 && codePoint <= 57)
      return codePoint - 48 + 52;
    if (codePoint === 43)
      return 62;
    if (codePoint === 47)
      return 63;
    throw new Error(`Invalid base64 character at index ${index}`);
  };
  function base64ToArray(msg) {
    const s2 = normalizeBase64(msg);
    const result = [];
    let bitBuffer = 0;
    let bitCount = 0;
    for (let i = 0; i < s2.length; i++) {
      const c = s2.codePointAt(i);
      const v = base64CharacterValue(c, i);
      bitBuffer = bitBuffer << 6 | v;
      bitCount += 6;
      while (bitCount >= 8) {
        bitCount -= 8;
        result.push(bitBuffer >> bitCount & 255);
        bitBuffer &= (1 << bitCount) - 1;
      }
    }
    return result;
  }
  function utf8ToArray(str) {
    return Array.from(utf8Bytes(str));
  }
  var toUTF8 = (arr) => {
    return new TextDecoder().decode(arr instanceof Uint8Array ? arr : new Uint8Array(arr));
  };
  var encode = (arr, enc) => {
    switch (enc) {
      case "hex":
        return toHex(arr);
      case "utf8":
        return toUTF8(arr);
      // If no encoding is provided, return the original array
      default:
        return arr;
    }
  };
  function toBase64(byteArray) {
    const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i;
    for (i = 0; i < byteArray.length; i += 3) {
      const byte1 = byteArray[i];
      const byte2 = i + 1 < byteArray.length ? byteArray[i + 1] : 0;
      const byte3 = i + 2 < byteArray.length ? byteArray[i + 2] : 0;
      const encoded1 = byte1 >> 2;
      const encoded2 = (byte1 & 3) << 4 | byte2 >> 4;
      const encoded3 = (byte2 & 15) << 2 | byte3 >> 6;
      const encoded4 = byte3 & 63;
      result += base64Chars.charAt(encoded1) + base64Chars.charAt(encoded2);
      result += i + 1 < byteArray.length ? base64Chars.charAt(encoded3) : "=";
      result += i + 2 < byteArray.length ? base64Chars.charAt(encoded4) : "=";
    }
    return result;
  }
  var base58chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  var fromBase58 = (str) => {
    if (str === "" || typeof str !== "string") {
      throw new Error(`Expected base58 string but got \u201C${str}\u201D`);
    }
    const match = str.match(/[^1-9A-HJ-NP-Za-km-z]/gmu);
    if (match !== null) {
      throw new Error(`Invalid base58 character \u201C${match.join("")}\u201D`);
    }
    const lz = str.match(/^1+/gmu);
    const psz = lz === null ? 0 : lz[0].length;
    const size = (str.length - psz) * (Math.log(58) / Math.log(256)) + 1 >>> 0;
    const uint8 = new Uint8Array([
      ...new Uint8Array(psz),
      ...Array.from(str).map((i) => base58chars.indexOf(i)).reduce((acc, i) => {
        acc = acc.map((j) => {
          const x = j * 58 + i;
          i = x >> 8;
          return x;
        });
        return acc;
      }, new Uint8Array(size)).reverse().filter(/* @__PURE__ */ ((lastValue) => (value) => (
        // @ts-expect-error
        lastValue = lastValue || value
      ))(false))
    ]);
    return [...uint8];
  };
  var toBase58 = (bin) => {
    const base58Map = Array.from({ length: 256 }, () => -1);
    for (let i = 0; i < base58chars.length; ++i) {
      base58Map[base58chars.codePointAt(i)] = i;
    }
    const result = [];
    for (const byte of bin) {
      let carry = byte;
      for (let j = 0; j < result.length; ++j) {
        const x = (base58Map[result[j]] << 8) + carry;
        const quotient = Math.trunc(x / 58);
        const remainder = x - quotient * 58;
        result[j] = base58chars.codePointAt(remainder);
        carry = quotient;
      }
      while (carry !== 0) {
        const quotient = Math.trunc(carry / 58);
        const remainder = carry - quotient * 58;
        result.push(base58chars.codePointAt(remainder));
        carry = quotient;
      }
    }
    for (const byte of bin) {
      if (byte === 0)
        result.push("1".codePointAt(0));
      else
        break;
    }
    result.reverse();
    return String.fromCodePoint(...result);
  };
  var toBase58Check = (bin, prefix2 = [0]) => {
    let hash = hash256([...prefix2, ...bin]);
    hash = [...prefix2, ...bin, ...hash.slice(0, 4)];
    return toBase58(hash);
  };
  var fromBase58Check = (str, enc, prefixLength = 1) => {
    const bin = fromBase58(str);
    let prefix2 = bin.slice(0, prefixLength);
    let data = bin.slice(prefixLength, -4);
    let hash = [...prefix2, ...data];
    hash = hash256(hash);
    bin.slice(-4).forEach((check, index) => {
      if (check !== hash[index]) {
        throw new Error("Invalid checksum");
      }
    });
    if (enc === "hex") {
      prefix2 = toHex(prefix2);
      data = toHex(data);
    }
    return { prefix: prefix2, data };
  };
  var Writer = class _Writer {
    constructor(bufs) {
      __publicField(this, "bufs");
      __publicField(this, "length");
      this.bufs = bufs ?? [];
      this.length = 0;
      for (const b of this.bufs)
        this.length += b.length;
    }
    getLength() {
      return this.length;
    }
    toUint8Array() {
      const out = new Uint8Array(this.length);
      let offset = 0;
      for (const buf of this.bufs) {
        out.set(buf, offset);
        offset += buf.length;
      }
      return out;
    }
    toArray() {
      const totalLength = this.length;
      const ret = Array.from({ length: totalLength }, () => 0);
      let offset = 0;
      for (const buf of this.bufs) {
        if (buf instanceof Uint8Array) {
          for (const byte of buf) {
            ret[offset++] = byte;
          }
        } else {
          const arr = buf;
          for (const item of arr) {
            ret[offset++] = item;
          }
        }
      }
      return ret;
    }
    toHex() {
      return this.toArray().map((n) => n.toString(16).padStart(2, "0")).join("");
    }
    write(buf) {
      this.bufs.push(buf);
      this.length += buf.length;
      return this;
    }
    writeReverse(buf) {
      const buf2 = Array.from({ length: buf.length }, () => 0);
      for (let i = 0; i < buf2.length; i++) {
        buf2[i] = buf[buf.length - 1 - i];
      }
      return this.write(buf2);
    }
    writeUInt8(n) {
      const buf = Array.from({ length: 1 }, () => 0);
      buf[0] = n & 255;
      this.write(buf);
      return this;
    }
    writeInt8(n) {
      return this.writeUInt8(n);
    }
    writeUInt16BE(n) {
      const buf = [
        n >> 8 & 255,
        // shift right 8 bits to get the high byte
        n & 255
        // low byte is just the last 8 bits
      ];
      return this.write(buf);
    }
    writeInt16BE(n) {
      return this.writeUInt16BE(n & 65535);
    }
    writeUInt16LE(n) {
      const buf = [
        n & 255,
        // low byte is just the last 8 bits
        n >> 8 & 255
        // shift right 8 bits to get the high byte
      ];
      return this.write(buf);
    }
    writeInt16LE(n) {
      return this.writeUInt16LE(n & 65535);
    }
    writeUInt32BE(n) {
      const buf = [
        n >> 24 & 255,
        // highest byte
        n >> 16 & 255,
        n >> 8 & 255,
        n & 255
        // lowest byte
      ];
      return this.write(buf);
    }
    writeInt32BE(n) {
      return this.writeUInt32BE(n >>> 0);
    }
    writeUInt32LE(n) {
      const buf = [
        n & 255,
        // lowest byte
        n >> 8 & 255,
        n >> 16 & 255,
        n >> 24 & 255
        // highest byte
      ];
      return this.write(buf);
    }
    writeInt32LE(n) {
      return this.writeUInt32LE(n >>> 0);
    }
    writeUInt64BEBn(bn) {
      const buf = bn.toArray("be", 8);
      this.write(buf);
      return this;
    }
    writeUInt64LEBn(bn) {
      const buf = bn.toArray("be", 8);
      this.writeReverse(buf);
      return this;
    }
    writeUInt64LE(n) {
      if (n === -1) {
        this.write(Array.from({ length: 8 }, () => 255));
      } else {
        const buf = new BigNumber(n).toArray("be", 8);
        this.writeReverse(buf);
      }
      return this;
    }
    writeVarIntNum(n) {
      const buf = _Writer.varIntNum(n);
      this.write(buf);
      return this;
    }
    writeVarIntBn(bn) {
      const buf = _Writer.varIntBn(bn);
      this.write(buf);
      return this;
    }
    static varIntNum(n) {
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        throw new RangeError("CompactSize value must be a finite integer");
      }
      let buf;
      if (n < 0) {
        return this.varIntBn(new BigNumber(n));
      }
      if (n < 253) {
        buf = [n];
      } else if (n < 65536) {
        buf = [
          253,
          // 0xfd
          n & 255,
          // low byte
          n >> 8 & 255
          // high byte
        ];
      } else if (n < 4294967296) {
        buf = [
          254,
          // 0xfe
          n & 255,
          n >> 8 & 255,
          n >> 16 & 255,
          n >> 24 & 255
        ];
      } else {
        const low = n & 4294967295;
        const high = Math.floor(n / 4294967296) & 4294967295;
        buf = [
          255,
          // 0xff
          low & 255,
          low >> 8 & 255,
          low >> 16 & 255,
          low >> 24 & 255,
          high & 255,
          high >> 8 & 255,
          high >> 16 & 255,
          high >> 24 & 255
        ];
      }
      return buf;
    }
    static varIntBn(bn) {
      let buf;
      if (bn.isNeg()) {
        bn = bn.add(OverflowUint64);
      }
      if (bn.ltn(253)) {
        const n = bn.toNumber();
        buf = [n];
      } else if (bn.ltn(65536)) {
        const n = bn.toNumber();
        buf = [253, n & 255, n >> 8 & 255];
      } else if (bn.lt(new BigNumber(4294967296))) {
        const n = bn.toNumber();
        buf = [254, n & 255, n >> 8 & 255, n >> 16 & 255, n >> 24 & 255];
      } else {
        const bw = new _Writer();
        bw.writeUInt8(255);
        bw.writeUInt64LEBn(bn);
        buf = bw.toArray();
      }
      return buf;
    }
  };
  var Reader = class {
    constructor(bin = [], pos = 0) {
      __publicField(this, "bin");
      __publicField(this, "pos");
      __publicField(this, "length");
      this.bin = bin;
      this.length = bin.length;
      if (!Number.isSafeInteger(pos) || pos < 0 || pos > this.length) {
        throw new RangeError("Reader position exceeds available data");
      }
      this.pos = pos;
    }
    ensureAvailable(len) {
      if (!Number.isSafeInteger(len) || len < 0 || !Number.isSafeInteger(this.pos) || this.pos < 0 || this.pos + len > this.length) {
        throw new RangeError("Reader read exceeds available data");
      }
    }
    eof() {
      return this.pos >= this.length;
    }
    read(len = this.length - this.pos) {
      this.ensureAvailable(len);
      const start = this.pos;
      const end = this.pos + len;
      this.pos = end;
      return this.bin.slice(start, end);
    }
    readReverse(len = this.length - this.pos) {
      this.ensureAvailable(len);
      const buf2 = Array.from({ length: len }, () => 0);
      for (let i = 0; i < len; i++) {
        buf2[i] = this.bin[this.pos + len - 1 - i];
      }
      this.pos += len;
      return buf2;
    }
    readUInt8() {
      this.ensureAvailable(1);
      const val = this.bin[this.pos];
      this.pos += 1;
      return val;
    }
    readInt8() {
      const val = this.readUInt8();
      return (val & 128) === 0 ? val : val - 256;
    }
    readUInt16BE() {
      this.ensureAvailable(2);
      const val = this.bin[this.pos] << 8 | this.bin[this.pos + 1];
      this.pos += 2;
      return val;
    }
    readInt16BE() {
      const val = this.readUInt16BE();
      return (val & 32768) === 0 ? val : val - 65536;
    }
    readUInt16LE() {
      this.ensureAvailable(2);
      const val = this.bin[this.pos] | this.bin[this.pos + 1] << 8;
      this.pos += 2;
      return val;
    }
    readInt16LE() {
      const val = this.readUInt16LE();
      const x = (val & 32768) === 0 ? val : val - 65536;
      return x;
    }
    readUInt32BE() {
      this.ensureAvailable(4);
      const val = this.bin[this.pos] * 16777216 + // Shift the first byte by 24 bits
      (this.bin[this.pos + 1] << 16 | // Shift the second byte by 16 bits
      this.bin[this.pos + 2] << 8 | // Shift the third byte by 8 bits
      this.bin[this.pos + 3]);
      this.pos += 4;
      return val;
    }
    readInt32BE() {
      const val = this.readUInt32BE();
      return (val & 2147483648) === 0 ? val : val - 4294967296;
    }
    readUInt32LE() {
      this.ensureAvailable(4);
      const val = (this.bin[this.pos] | this.bin[this.pos + 1] << 8 | this.bin[this.pos + 2] << 16 | this.bin[this.pos + 3] << 24) >>> 0;
      this.pos += 4;
      return val;
    }
    readInt32LE() {
      const val = this.readUInt32LE();
      return (val & 2147483648) === 0 ? val : val - 4294967296;
    }
    readUInt64BEBn() {
      const bin = this.read(8);
      const bn = new BigNumber(bin);
      return bn;
    }
    readUInt64LEBn() {
      const bin = this.readReverse(8);
      const bn = new BigNumber(bin);
      return bn;
    }
    readInt64LEBn() {
      const bin = this.readReverse(8);
      let bn = new BigNumber(bin);
      if (bn.gte(OverflowInt64)) {
        bn = bn.sub(OverflowUint64);
      }
      return bn;
    }
    readVarIntNum(signed = true) {
      const first = this.readUInt8();
      let bn;
      switch (first) {
        case 253:
          return this.readUInt16LE();
        case 254:
          return this.readUInt32LE();
        case 255:
          bn = signed ? this.readInt64LEBn() : this.readUInt64LEBn();
          if (bn.lte(new BigNumber(2).pow(new BigNumber(53)))) {
            return bn.toNumber();
          } else {
            throw new Error("number too large to retain precision - use readVarIntBn");
          }
        default:
          return first;
      }
    }
    /**
     * Reads a canonical CompactSize value that can be represented exactly by
     * JavaScript. The legacy `-1` sentinel is accepted when `signed` is true;
     * pass `false` for untrusted lengths, counts, and indexes.
     */
    readVarIntNumStrict(signed = true) {
      return readVarIntNumStrict(this, signed);
    }
    readVarInt() {
      const first = this.bin[this.pos];
      switch (first) {
        case 253:
          return this.read(1 + 2);
        case 254:
          return this.read(1 + 4);
        case 255:
          return this.read(1 + 8);
        default:
          return this.read(1);
      }
    }
    readVarIntBn() {
      const first = this.readUInt8();
      switch (first) {
        case 253:
          return new BigNumber(this.readUInt16LE());
        case 254:
          return new BigNumber(this.readUInt32LE());
        case 255:
          return this.readUInt64LEBn();
        default:
          return new BigNumber(first);
      }
    }
  };
  var OverflowInt64 = new BigNumber(2).pow(new BigNumber(63));
  var OverflowUint64 = new BigNumber(2).pow(new BigNumber(64));

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Curve.js
  var globalCurve;
  function normalizedMod4(value, carry) {
    const mod4 = value.andln(3) + carry & 3;
    return mod4 === 3 ? -1 : mod4;
  }
  function jsfDigit(value, carry, mod4, otherMod4) {
    if ((mod4 & 1) === 0)
      return 0;
    const mod8 = value.andln(7) + carry & 7;
    return (mod8 === 3 || mod8 === 5) && otherMod4 === 2 ? -mod4 : mod4;
  }
  function nextJsfCarry(carry, digit) {
    return 2 * carry === digit + 1 ? 1 - carry : carry;
  }
  var _Curve_instances, _resolveEndomorphismBasis_fn;
  var _Curve = class _Curve {
    constructor() {
      __privateAdd(this, _Curve_instances);
      __publicField(this, "p");
      __publicField(this, "red");
      __publicField(this, "redN");
      __publicField(this, "zero");
      __publicField(this, "one");
      __publicField(this, "two");
      __publicField(this, "g");
      __publicField(this, "n");
      __publicField(this, "a");
      __publicField(this, "b");
      __publicField(this, "tinv");
      __publicField(this, "zeroA");
      __publicField(this, "threeA");
      __publicField(this, "endo");
      // beta, lambda, basis
      __publicField(this, "_endoWnafT1");
      __publicField(this, "_endoWnafT2");
      __publicField(this, "_wnafT1");
      __publicField(this, "_wnafT2");
      __publicField(this, "_wnafT3");
      __publicField(this, "_wnafT4");
      __publicField(this, "_bitLength");
      if (globalCurve === void 0) {
        globalCurve = this;
      } else {
        return globalCurve;
      }
      const precomputed = {
        doubles: {
          step: 4,
          points: [
            [
              "e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a",
              "f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"
            ],
            [
              "8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508",
              "11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"
            ],
            [
              "175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739",
              "d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"
            ],
            [
              "363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640",
              "4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"
            ],
            [
              "8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c",
              "4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"
            ],
            [
              "723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda",
              "96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"
            ],
            [
              "eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa",
              "5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"
            ],
            [
              "100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0",
              "cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"
            ],
            [
              "e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d",
              "9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"
            ],
            [
              "feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d",
              "e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"
            ],
            [
              "da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1",
              "9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"
            ],
            [
              "53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0",
              "5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"
            ],
            [
              "8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047",
              "10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"
            ],
            [
              "385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862",
              "283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"
            ],
            [
              "6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7",
              "7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"
            ],
            [
              "3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd",
              "56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"
            ],
            [
              "85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83",
              "7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"
            ],
            [
              "948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a",
              "53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"
            ],
            [
              "6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8",
              "bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"
            ],
            [
              "e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d",
              "4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"
            ],
            [
              "e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725",
              "7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"
            ],
            [
              "213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754",
              "4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"
            ],
            [
              "4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c",
              "17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"
            ],
            [
              "fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6",
              "6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"
            ],
            [
              "76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39",
              "c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"
            ],
            [
              "c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891",
              "893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"
            ],
            [
              "d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b",
              "febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"
            ],
            [
              "b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03",
              "2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"
            ],
            [
              "e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d",
              "eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"
            ],
            [
              "a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070",
              "7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"
            ],
            [
              "90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4",
              "e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"
            ],
            [
              "8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da",
              "662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"
            ],
            [
              "e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11",
              "1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"
            ],
            [
              "8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e",
              "efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"
            ],
            [
              "e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41",
              "2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"
            ],
            [
              "b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef",
              "67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"
            ],
            [
              "d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8",
              "db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"
            ],
            [
              "324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d",
              "648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"
            ],
            [
              "4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96",
              "35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"
            ],
            [
              "9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd",
              "ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"
            ],
            [
              "6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5",
              "9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"
            ],
            [
              "a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266",
              "40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"
            ],
            [
              "7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71",
              "34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"
            ],
            [
              "928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac",
              "c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"
            ],
            [
              "85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751",
              "1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"
            ],
            [
              "ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e",
              "493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"
            ],
            [
              "827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241",
              "c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"
            ],
            [
              "eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3",
              "be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"
            ],
            [
              "e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f",
              "4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"
            ],
            [
              "1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19",
              "aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"
            ],
            [
              "146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be",
              "b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"
            ],
            [
              "fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9",
              "6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"
            ],
            [
              "da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2",
              "8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"
            ],
            [
              "a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13",
              "7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"
            ],
            [
              "174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c",
              "ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"
            ],
            [
              "959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba",
              "2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"
            ],
            [
              "d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151",
              "e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"
            ],
            [
              "64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073",
              "d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"
            ],
            [
              "8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458",
              "38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"
            ],
            [
              "13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b",
              "69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"
            ],
            [
              "bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366",
              "d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"
            ],
            [
              "8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa",
              "40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"
            ],
            [
              "8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0",
              "620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"
            ],
            [
              "dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787",
              "7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"
            ],
            [
              "f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e",
              "ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"
            ]
          ]
        },
        naf: {
          wnd: 7,
          points: [
            [
              "f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
              "388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"
            ],
            [
              "2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4",
              "d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"
            ],
            [
              "5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc",
              "6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"
            ],
            [
              "acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe",
              "cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"
            ],
            [
              "774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb",
              "d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"
            ],
            [
              "f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8",
              "ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"
            ],
            [
              "d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e",
              "581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"
            ],
            [
              "defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34",
              "4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"
            ],
            [
              "2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c",
              "85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"
            ],
            [
              "352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5",
              "321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"
            ],
            [
              "2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f",
              "2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"
            ],
            [
              "9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714",
              "73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"
            ],
            [
              "daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729",
              "a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"
            ],
            [
              "c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db",
              "2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"
            ],
            [
              "6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4",
              "e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"
            ],
            [
              "1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5",
              "b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"
            ],
            [
              "605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479",
              "2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"
            ],
            [
              "62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d",
              "80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"
            ],
            [
              "80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f",
              "1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"
            ],
            [
              "7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb",
              "d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"
            ],
            [
              "d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9",
              "eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"
            ],
            [
              "49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963",
              "758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"
            ],
            [
              "77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74",
              "958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"
            ],
            [
              "f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530",
              "e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"
            ],
            [
              "463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b",
              "5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"
            ],
            [
              "f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247",
              "cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"
            ],
            [
              "caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1",
              "cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"
            ],
            [
              "2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120",
              "4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"
            ],
            [
              "7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435",
              "91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"
            ],
            [
              "754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18",
              "673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"
            ],
            [
              "e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8",
              "59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"
            ],
            [
              "186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb",
              "3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"
            ],
            [
              "df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f",
              "55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"
            ],
            [
              "5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143",
              "efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"
            ],
            [
              "290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba",
              "e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"
            ],
            [
              "af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45",
              "f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"
            ],
            [
              "766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a",
              "744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"
            ],
            [
              "59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e",
              "c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"
            ],
            [
              "f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8",
              "e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"
            ],
            [
              "7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c",
              "30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"
            ],
            [
              "948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519",
              "e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"
            ],
            [
              "7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab",
              "100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"
            ],
            [
              "3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca",
              "ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"
            ],
            [
              "d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf",
              "8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"
            ],
            [
              "1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610",
              "68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"
            ],
            [
              "733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4",
              "f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"
            ],
            [
              "15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c",
              "d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"
            ],
            [
              "a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940",
              "edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"
            ],
            [
              "e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980",
              "a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"
            ],
            [
              "311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3",
              "66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"
            ],
            [
              "34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf",
              "9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"
            ],
            [
              "f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63",
              "4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"
            ],
            [
              "d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448",
              "fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"
            ],
            [
              "32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf",
              "5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"
            ],
            [
              "7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5",
              "8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"
            ],
            [
              "ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6",
              "8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"
            ],
            [
              "16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5",
              "5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"
            ],
            [
              "eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99",
              "f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"
            ],
            [
              "78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51",
              "f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"
            ],
            [
              "494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5",
              "42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"
            ],
            [
              "a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5",
              "204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"
            ],
            [
              "c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997",
              "4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"
            ],
            [
              "841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881",
              "73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"
            ],
            [
              "5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5",
              "39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"
            ],
            [
              "36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66",
              "d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"
            ],
            [
              "336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726",
              "ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"
            ],
            [
              "8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede",
              "6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"
            ],
            [
              "1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94",
              "60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"
            ],
            [
              "85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31",
              "3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"
            ],
            [
              "29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51",
              "b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"
            ],
            [
              "a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252",
              "ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"
            ],
            [
              "4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5",
              "cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"
            ],
            [
              "d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b",
              "6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"
            ],
            [
              "ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4",
              "322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"
            ],
            [
              "af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f",
              "6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"
            ],
            [
              "e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889",
              "2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"
            ],
            [
              "591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246",
              "b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"
            ],
            [
              "11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984",
              "998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"
            ],
            [
              "3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a",
              "b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"
            ],
            [
              "cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030",
              "bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"
            ],
            [
              "c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197",
              "6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"
            ],
            [
              "c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593",
              "c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"
            ],
            [
              "a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef",
              "21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"
            ],
            [
              "347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38",
              "60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"
            ],
            [
              "da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a",
              "49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"
            ],
            [
              "c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111",
              "5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"
            ],
            [
              "4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502",
              "7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"
            ],
            [
              "3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea",
              "be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"
            ],
            [
              "cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26",
              "8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"
            ],
            [
              "b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986",
              "39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"
            ],
            [
              "d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e",
              "62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"
            ],
            [
              "48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4",
              "25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"
            ],
            [
              "dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda",
              "ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"
            ],
            [
              "6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859",
              "cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"
            ],
            [
              "e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f",
              "f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"
            ],
            [
              "eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c",
              "6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"
            ],
            [
              "13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942",
              "fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"
            ],
            [
              "ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a",
              "1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"
            ],
            [
              "b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80",
              "5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"
            ],
            [
              "ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d",
              "438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"
            ],
            [
              "8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1",
              "cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"
            ],
            [
              "52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63",
              "c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"
            ],
            [
              "e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352",
              "6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"
            ],
            [
              "7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193",
              "ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"
            ],
            [
              "5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00",
              "9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"
            ],
            [
              "32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58",
              "ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"
            ],
            [
              "e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7",
              "d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"
            ],
            [
              "8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8",
              "c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"
            ],
            [
              "4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e",
              "67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"
            ],
            [
              "3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d",
              "cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"
            ],
            [
              "674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b",
              "299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"
            ],
            [
              "d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f",
              "f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"
            ],
            [
              "30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6",
              "462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"
            ],
            [
              "be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297",
              "62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"
            ],
            [
              "93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a",
              "7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"
            ],
            [
              "b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c",
              "ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"
            ],
            [
              "d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52",
              "4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"
            ],
            [
              "d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb",
              "bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"
            ],
            [
              "463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065",
              "bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"
            ],
            [
              "7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917",
              "603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"
            ],
            [
              "74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9",
              "cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"
            ],
            [
              "30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3",
              "553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"
            ],
            [
              "9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57",
              "712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"
            ],
            [
              "176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66",
              "ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"
            ],
            [
              "75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8",
              "9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"
            ],
            [
              "809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721",
              "9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"
            ],
            [
              "1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180",
              "4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"
            ]
          ]
        }
      };
      const conf = {
        prime: "k256",
        p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
        a: "0",
        b: "7",
        n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
        h: "1",
        // Precomputed endomorphism
        beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
        lambda: "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
        basis: [
          {
            a: "3086d221a7d46bcde86c90e49284eb15",
            b: "-e4437ed6010e88286f547fa90abfe4c3"
          },
          {
            a: "114ca50f7a8e2f3f657c1108d9d44cfd8",
            b: "3086d221a7d46bcde86c90e49284eb15"
          }
        ],
        gRed: false,
        g: [
          "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
          "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
          precomputed
        ]
      };
      this.p = new BigNumber(conf.p, 16);
      this.red = new ReductionContext(conf.prime);
      this.zero = new BigNumber(0).toRed(this.red);
      this.one = new BigNumber(1).toRed(this.red);
      this.two = new BigNumber(2).toRed(this.red);
      this.n = new BigNumber(conf.n, 16);
      this.g = Point2.fromJSON(conf.g, conf.gRed);
      this._wnafT1 = Array.from({ length: 4 }, () => void 0);
      this._wnafT2 = Array.from({ length: 4 }, () => void 0);
      this._wnafT3 = Array.from({ length: 4 }, () => void 0);
      this._wnafT4 = Array.from({ length: 4 }, () => void 0);
      this._bitLength = this.n.bitLength();
      this.redN = this.n.toRed(this.red);
      this.a = new BigNumber(conf.a, 16).toRed(this.red);
      this.b = new BigNumber(conf.b, 16).toRed(this.red);
      this.tinv = this.two.redInvm();
      this.zeroA = this.a.fromRed().cmpn(0) === 0;
      this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;
      this.endo = this._getEndomorphism(conf);
      this._endoWnafT1 = Array.from({ length: 4 }, () => void 0);
      this._endoWnafT2 = Array.from({ length: 4 }, () => void 0);
    }
    // Represent num in a w-NAF form
    static assert(expression, message = "Elliptic curve assertion failed") {
      if (!expression) {
        throw new Error(message);
      }
    }
    getNAF(num, w, bits) {
      const naf = Array.from({ length: Math.max(num.bitLength(), bits) + 1 }, () => 0);
      naf.fill(0);
      const ws = 1 << w + 1;
      const k = num.clone();
      for (let i = 0; i < naf.length; i++) {
        let z;
        const mod2 = k.andln(ws - 1);
        if (k.isOdd()) {
          if (mod2 > (ws >> 1) - 1) {
            z = (ws >> 1) - mod2;
          } else {
            z = mod2;
          }
          k.isubn(z);
        } else {
          z = 0;
        }
        naf[i] = z;
        k.iushrn(1);
      }
      return naf;
    }
    // Represent k1, k2 in a Joint Sparse Form
    getJSF(k1, k2) {
      const jsf = [[], []];
      k1 = k1.clone();
      k2 = k2.clone();
      let d1 = 0;
      let d2 = 0;
      while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {
        const m14 = normalizedMod4(k1, d1);
        const m24 = normalizedMod4(k2, d2);
        const u1 = jsfDigit(k1, d1, m14, m24);
        jsf[0].push(u1);
        const u2 = jsfDigit(k2, d2, m24, m14);
        jsf[1].push(u2);
        d1 = nextJsfCarry(d1, u1);
        d2 = nextJsfCarry(d2, u2);
        k1.iushrn(1);
        k2.iushrn(1);
      }
      return jsf;
    }
    static cachedProperty(obj, name, computer) {
      const key = "_" + name;
      obj.prototype[name] = function cachedProperty() {
        if (this[key] === void 0) {
          this[key] = computer.call(this);
        }
        return this[key];
      };
    }
    static parseBytes(bytes2) {
      return typeof bytes2 === "string" ? toArray2(bytes2, "hex") : bytes2;
    }
    static intFromLE(bytes2) {
      return new BigNumber(bytes2, "hex", "le");
    }
    _getEndomorphism(conf) {
      if (!this.zeroA || this.p.modrn(3) !== 1) {
        return;
      }
      const beta = this._resolveEndomorphismBeta(conf);
      const lambda = this._resolveEndomorphismLambda(conf, beta);
      return {
        beta,
        lambda,
        basis: __privateMethod(this, _Curve_instances, _resolveEndomorphismBasis_fn).call(this, conf, lambda)
      };
    }
    _resolveEndomorphismBeta(conf) {
      if (conf.beta !== void 0)
        return new BigNumber(conf.beta, 16).toRed(this.red);
      const betas = this._getEndoRoots(this.p);
      if (betas == null)
        throw new Error("Failed to get endomorphism roots for beta.");
      const beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
      return beta.toRed(this.red);
    }
    _endomorphismLambdaMatches(lambda, beta, requireCoordinates = false) {
      if (this.g == null)
        throw new Error("Curve generator point (g) is not defined.");
      const gMulX = this.g.mul(lambda)?.x;
      const gXRedMulBeta = this.g.x == null ? void 0 : this.g.x.redMul(beta);
      if (gMulX == null || gXRedMulBeta == null) {
        if (requireCoordinates) {
          throw new Error("Lambda computation failed: g.mul(lambda).x or g.x.redMul(beta) is undefined.");
        }
        return false;
      }
      return gMulX.cmp(gXRedMulBeta) === 0;
    }
    _resolveEndomorphismLambda(conf, beta) {
      if (conf.lambda !== void 0)
        return new BigNumber(conf.lambda, 16);
      const lambdas = this._getEndoRoots(this.n);
      if (lambdas == null)
        throw new Error("Failed to get endomorphism roots for lambda.");
      if (this._endomorphismLambdaMatches(lambdas[0], beta))
        return lambdas[0];
      _Curve.assert(this._endomorphismLambdaMatches(lambdas[1], beta, true), "Lambda selection does not match computed beta.");
      return lambdas[1];
    }
    _getEndoRoots(num) {
      const red2 = num === this.p ? this.red : new MontgomoryMethod(num);
      const tinv = new BigNumber(2).toRed(red2).redInvm();
      const ntinv = tinv.redNeg();
      const s2 = new BigNumber(3).toRed(red2).redNeg().redSqrt().redMul(tinv);
      const l1 = ntinv.redAdd(s2).fromRed();
      const l2 = ntinv.redSub(s2).fromRed();
      return [l1, l2];
    }
    _getEndoBasis(lambda) {
      const aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2));
      let u = lambda;
      let v = this.n.clone();
      let x1 = new BigNumber(1);
      let y1 = new BigNumber(0);
      let x2 = new BigNumber(0);
      let y2 = new BigNumber(1);
      let a0;
      let b0;
      let a1;
      let b1;
      let a2;
      let b2;
      let prevR = new BigNumber(0);
      let i = 0;
      let r2 = new BigNumber(0);
      let x = new BigNumber(0);
      while (u.cmpn(0) !== 0) {
        const q = v.div(u);
        r2 = v.sub(q.mul(u));
        x = x2.sub(q.mul(x1));
        const y = y2.sub(q.mul(y1));
        if (a1 === void 0 && r2.cmp(aprxSqrt) < 0) {
          a0 = prevR.neg();
          b0 = x1;
          a1 = r2.neg();
          b1 = x;
        } else if (a1 !== void 0 && ++i === 2) {
          break;
        }
        prevR = r2;
        v = u;
        u = r2;
        x2 = x1;
        x1 = x;
        y2 = y1;
        y1 = y;
      }
      if (a0 === void 0 || b0 === void 0 || a1 === void 0 || b1 === void 0) {
        throw new Error("Failed to compute Endo Basis values");
      }
      a2 = r2.neg();
      b2 = x;
      const len1 = a1.sqr().add(b1.sqr());
      const len2 = a2.sqr().add(b2.sqr());
      if (len2.cmp(len1) >= 0) {
        a2 = a0;
        b2 = b0;
      }
      if (a1.negative !== 0) {
        a1 = a1.neg();
        b1 = b1.neg();
      }
      if (a2.negative !== 0) {
        a2 = a2.neg();
        b2 = b2.neg();
      }
      return [
        { a: a1, b: b1 },
        { a: a2, b: b2 }
      ];
    }
    _endoSplit(k) {
      if (this.endo == null) {
        throw new Error("Endomorphism is not defined.");
      }
      const basis = this.endo.basis;
      const v1 = basis[0];
      const v2 = basis[1];
      const c1 = v2.b.mul(k).divRound(this.n);
      const c2 = v1.b.neg().mul(k).divRound(this.n);
      const p1 = c1.mul(v1.a);
      const p2 = c2.mul(v2.a);
      const q1 = c1.mul(v1.b);
      const q2 = c2.mul(v2.b);
      const k1 = k.sub(p1).sub(p2);
      const k2 = q1.add(q2).neg();
      return { k1, k2 };
    }
    validate(point) {
      if (point.inf) {
        return true;
      }
      const x = point.x;
      const y = point.y;
      if (x === null || y === null) {
        throw new Error("Point coordinates cannot be null");
      }
      const ax = this.a.redMul(x);
      const rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
      return y.redSqr().redISub(rhs).cmpn(0) === 0;
    }
  };
  _Curve_instances = new WeakSet();
  _resolveEndomorphismBasis_fn = function(conf, lambda) {
    if (typeof conf.basis !== "object" || conf.basis === null) {
      return this._getEndoBasis(lambda);
    }
    return conf.basis.map((vec) => ({
      a: new BigNumber(vec.a, 16),
      b: new BigNumber(vec.b, 16)
    }));
  };
  var Curve = _Curve;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/BasePoint.js
  var BasePoint = class {
    constructor(type) {
      __publicField(this, "curve");
      __publicField(this, "type");
      __publicField(this, "precomputed");
      this.curve = new Curve();
      this.type = type;
      this.precomputed = null;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/JacobianPoint.js
  var JacobianPoint = class _JacobianPoint extends BasePoint {
    /**
     * Constructs a new `JacobianPoint` instance.
     *
     * @param x - If `null`, the x-coordinate will default to the curve's defined 'one' constant.
     * If `x` is not a BigNumber, `x` will be converted to a `BigNumber` assuming it is a hex string.
     *
     * @param y - If `null`, the y-coordinate will default to the curve's defined 'one' constant.
     * If `y` is not a BigNumber, `y` will be converted to a `BigNumber` assuming it is a hex string.
     *
     * @param z - If `null`, the z-coordinate will default to 0.
     * If `z` is not a BigNumber, `z` will be converted to a `BigNumber` assuming it is a hex string.
     *
     * @example
     * const pointJ1 = new JacobianPoint(null, null, null); // creates point at infinity
     * const pointJ2 = new JacobianPoint('3', '4', '1'); // creates point (3, 4, 1)
     */
    constructor(x, y, z) {
      super("jacobian");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "z");
      __publicField(this, "zOne");
      if (x === null && y === null && z === null) {
        this.x = this.curve.one;
        this.y = this.curve.one;
        this.z = new BigNumber(0);
      } else {
        if (!BigNumber.isBN(x)) {
          x = new BigNumber(x, 16);
        }
        this.x = x;
        if (!BigNumber.isBN(y)) {
          y = new BigNumber(y, 16);
        }
        this.y = y;
        if (!BigNumber.isBN(z)) {
          z = new BigNumber(z, 16);
        }
        this.z = z;
      }
      if (this.x.red == null) {
        this.x = this.x.toRed(this.curve.red);
      }
      if (this.y.red == null) {
        this.y = this.y.toRed(this.curve.red);
      }
      if (this.z.red == null) {
        this.z = this.z.toRed(this.curve.red);
      }
      this.zOne = this.z === this.curve.one;
      if (this.isInfinity()) {
        this.x = this.curve.one;
        this.y = this.curve.one;
        this.z = new BigNumber(0).toRed(this.curve.red);
        this.zOne = false;
      }
    }
    /**
     * Converts the `JacobianPoint` object instance to standard affine `Point` format and returns `Point` type.
     *
     * @returns The `Point`(affine) object representing the same point as the original `JacobianPoint`.
     *
     * If the initial `JacobianPoint` represents point at infinity, an instance of `Point` at infinity is returned.
     *
     * @example
     * const pointJ = new JacobianPoint('3', '4', '1');
     * const pointP = pointJ.toP();  // The point in affine coordinates.
     */
    toP() {
      if (this.isInfinity()) {
        return new Point2(null, null);
      }
      const zinv = this.z.redInvm();
      const zinv2 = zinv.redSqr();
      const ax = this.x.redMul(zinv2);
      const ay = this.y.redMul(zinv2).redMul(zinv);
      return new Point2(ax, ay);
    }
    /**
     * Negation operation. It returns the additive inverse of the Jacobian point.
     *
     * @method neg
     * @returns Returns a new Jacobian point as the result of the negation.
     *
     * @example
     * const jp = new JacobianPoint(x, y, z)
     * const result = jp.neg()
     */
    neg() {
      return new _JacobianPoint(this.x, this.y.redNeg(), this.z);
    }
    /**
     * Addition operation in the Jacobian coordinates. It takes a Jacobian point as an argument
     * and returns a new Jacobian point as a result of the addition. In the special cases,
     * when either one of the points is the point at infinity, it will return the other point.
     *
     * @method add
     * @param p - The Jacobian point to be added.
     * @returns Returns a new Jacobian point as the result of the addition.
     *
     * @example
     * const p1 = new JacobianPoint(x1, y1, z1)
     * const p2 = new JacobianPoint(x2, y2, z2)
     * const result = p1.add(p2)
     */
    add(p) {
      if (this.isInfinity()) {
        return p;
      }
      if (p.isInfinity()) {
        return this;
      }
      const pz2 = p.z.redSqr();
      const z2 = this.z.redSqr();
      const u1 = this.x.redMul(pz2);
      const u2 = p.x.redMul(z2);
      const s1 = this.y.redMul(pz2.redMul(p.z));
      const s2 = p.y.redMul(z2.redMul(this.z));
      const h = u1.redSub(u2);
      const r2 = s1.redSub(s2);
      if (h.cmpn(0) === 0) {
        if (r2.cmpn(0) === 0) {
          return this.dbl();
        } else {
          return new _JacobianPoint(null, null, null);
        }
      }
      const h2 = h.redSqr();
      const h3 = h2.redMul(h);
      const v = u1.redMul(h2);
      const nx = r2.redSqr().redIAdd(h3).redISub(v).redISub(v);
      const ny = r2.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
      const nz = this.z.redMul(p.z).redMul(h);
      return new _JacobianPoint(nx, ny, nz);
    }
    /**
     * Mixed addition operation. This function combines the standard point addition with
     * the transformation from the affine to Jacobian coordinates. It first converts
     * the affine point to Jacobian, and then preforms the addition.
     *
     * @method mixedAdd
     * @param p - The affine point to be added.
     * @returns Returns the result of the mixed addition as a new Jacobian point.
     *
     * @example
     * const jp = new JacobianPoint(x1, y1, z1)
     * const ap = new Point(x2, y2)
     * const result = jp.mixedAdd(ap)
     */
    mixedAdd(p) {
      if (this.isInfinity()) {
        return p.toJ();
      }
      if (p.isInfinity()) {
        return this;
      }
      if (p.x === null || p.y === null) {
        throw new Error("Point coordinates cannot be null");
      }
      const z2 = this.z.redSqr();
      const u1 = this.x;
      const u2 = p.x.redMul(z2);
      const s1 = this.y;
      const s2 = p.y.redMul(z2).redMul(this.z);
      const h = u1.redSub(u2);
      const r2 = s1.redSub(s2);
      if (h.cmpn(0) === 0) {
        if (r2.cmpn(0) === 0) {
          return this.dbl();
        } else {
          return new _JacobianPoint(null, null, null);
        }
      }
      const h2 = h.redSqr();
      const h3 = h2.redMul(h);
      const v = u1.redMul(h2);
      const nx = r2.redSqr().redIAdd(h3).redISub(v).redISub(v);
      const ny = r2.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
      const nz = this.z.redMul(h);
      return new _JacobianPoint(nx, ny, nz);
    }
    /**
     * Multiple doubling operation. It doubles the Jacobian point as many times as the pow parameter specifies. If pow is 0 or the point is the point at infinity, it will return the point itself.
     *
     * @method dblp
     * @param pow - The number of times the point should be doubled.
     * @returns Returns a new Jacobian point as the result of multiple doublings.
     *
     * @example
     * const jp = new JacobianPoint(x, y, z)
     * const result = jp.dblp(3)
     */
    dblp(pow3) {
      if (pow3 === 0) {
        return this;
      }
      if (this.isInfinity()) {
        return this;
      }
      if (pow3 === void 0) {
        return this.dbl();
      }
      let r2 = this;
      for (let i = 0; i < pow3; i++) {
        r2 = r2.dbl();
      }
      return r2;
    }
    /**
     * Point doubling operation in the Jacobian coordinates. A special case is when the point is the point at infinity, in this case, this function will return the point itself.
     *
     * @method dbl
     * @returns Returns a new Jacobian point as the result of the doubling.
     *
     * @example
     * const jp = new JacobianPoint(x, y, z)
     * const result = jp.dbl()
     */
    dbl() {
      if (this.isInfinity()) {
        return this;
      }
      let nx;
      let ny;
      let nz;
      if (this.zOne) {
        const xx = this.x.redSqr();
        const yy = this.y.redSqr();
        const yyyy = yy.redSqr();
        let s2 = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
        s2 = s2.redIAdd(s2);
        const m = xx.redAdd(xx).redIAdd(xx);
        const t = m.redSqr().redISub(s2).redISub(s2);
        let yyyy8 = yyyy.redIAdd(yyyy);
        yyyy8 = yyyy8.redIAdd(yyyy8);
        yyyy8 = yyyy8.redIAdd(yyyy8);
        nx = t;
        ny = m.redMul(s2.redISub(t)).redISub(yyyy8);
        nz = this.y.redAdd(this.y);
      } else {
        const a = this.x.redSqr();
        const b = this.y.redSqr();
        const c = b.redSqr();
        let d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
        d = d.redIAdd(d);
        const e = a.redAdd(a).redIAdd(a);
        const f2 = e.redSqr();
        let c8 = c.redIAdd(c);
        c8 = c8.redIAdd(c8);
        c8 = c8.redIAdd(c8);
        nx = f2.redISub(d).redISub(d);
        ny = e.redMul(d.redISub(nx)).redISub(c8);
        nz = this.y.redMul(this.z);
        nz = nz.redIAdd(nz);
      }
      return new _JacobianPoint(nx, ny, nz);
    }
    /**
     * Equality check operation. It checks whether the affine or Jacobian point is equal to this Jacobian point.
     *
     * @method eq
     * @param p - The affine or Jacobian point to compare with.
     * @returns Returns true if the points are equal, otherwise returns false.
     *
     * @example
     * const jp1 = new JacobianPoint(x1, y1, z1)
     * const jp2 = new JacobianPoint(x2, y2, z2)
     * const areEqual = jp1.eq(jp2)
     */
    eq(p) {
      if (p.type === "affine") {
        return this.eq(p.toJ());
      }
      if (this === p) {
        return true;
      }
      p = p;
      if (this.isInfinity() && p.isInfinity()) {
        return true;
      }
      if (this.isInfinity() !== p.isInfinity()) {
        return false;
      }
      const z2 = this.z.redSqr();
      const pz2 = p.z.redSqr();
      if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0) {
        return false;
      }
      const z3 = z2.redMul(this.z);
      const pz3 = pz2.redMul(p.z);
      return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
    }
    /**
     * Equality check operation in relation to an x coordinate of a point in projective coordinates.
     * It checks whether the x coordinate of the Jacobian point is equal to the provided x coordinate
     * of a point in projective coordinates.
     *
     * @method eqXToP
     * @param x - The x coordinate of a point in projective coordinates.
     * @returns Returns true if the x coordinates are equal, otherwise returns false.
     *
     * @example
     * const jp = new JacobianPoint(x1, y1, z1)
     * const isXEqual = jp.eqXToP(x2)
     */
    eqXToP(x) {
      const zs = this.z.redSqr();
      const rx = x.toRed(this.curve?.red).redMul(zs);
      if (this.x.cmp(rx) === 0) {
        return true;
      }
      const xc = x.clone();
      if (this.curve?.redN == null) {
        throw new Error("Curve or redN is not initialized.");
      }
      const t = this.curve.redN.redMul(zs);
      while (xc.cmp(this.curve.p) < 0) {
        xc.iadd(this.curve.n);
        if (xc.cmp(this.curve.p) >= 0) {
          return false;
        }
        rx.redIAdd(t);
        if (this.x.cmp(rx) === 0) {
          return true;
        }
      }
      return false;
    }
    /**
     * Returns the string representation of the JacobianPoint instance.
     * @method inspect
     * @returns Returns the string description of the JacobianPoint. If the JacobianPoint represents a point at infinity, the return value of this function is '<EC JPoint Infinity>'. For a normal point, it returns the string description format as '<EC JPoint x: x-coordinate y: y-coordinate z: z-coordinate>'.
     *
     * @example
     * const point = new JacobianPoint('5', '6', '1');
     * console.log(point.inspect()); // Output: '<EC JPoint x: 5 y: 6 z: 1>'
     */
    inspect() {
      if (this.isInfinity()) {
        return "<EC JPoint Infinity>";
      }
      return "<EC JPoint x: " + this.x.toString(16, 2) + " y: " + this.y.toString(16, 2) + " z: " + this.z.toString(16, 2) + ">";
    }
    /**
     * Checks whether the JacobianPoint instance represents a point at infinity.
     * @method isInfinity
     * @returns Returns true if the JacobianPoint's z-coordinate equals to zero (which represents the point at infinity in Jacobian coordinates). Returns false otherwise.
     *
     * @example
     * const point = new JacobianPoint('5', '6', '0');
     * console.log(point.isInfinity()); // Output: true
     */
    isInfinity() {
      return this.z.cmpn(0) === 0;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Point.js
  function ctSwap(swap, a, b) {
    const mask = -swap;
    const swapX = (a.X ^ b.X) & mask;
    const swapY = (a.Y ^ b.Y) & mask;
    const swapZ = (a.Z ^ b.Z) & mask;
    a.X ^= swapX;
    b.X ^= swapX;
    a.Y ^= swapY;
    b.Y ^= swapY;
    a.Z ^= swapZ;
    b.Z ^= swapZ;
  }
  var BI_ZERO = 0n;
  var BI_ONE = 1n;
  var BI_TWO = 2n;
  var BI_THREE = 3n;
  var BI_FOUR = 4n;
  var BI_EIGHT = 8n;
  var P_BIGINT = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
  var N_BIGINT = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
  var MASK_256 = (1n << 256n) - 1n;
  function red(x) {
    let hi = x >> 256n;
    x = (x & MASK_256) + (hi << 32n) + hi * 977n;
    hi = x >> 256n;
    x = (x & MASK_256) + (hi << 32n) + hi * 977n;
    if (x >= P_BIGINT)
      x -= P_BIGINT;
    return x;
  }
  var biMod = (a) => red((a % P_BIGINT + P_BIGINT) % P_BIGINT);
  var biModSub = (a, b) => a >= b ? a - b : P_BIGINT - (b - a);
  var biModMul = (a, b) => red(a * b);
  var biModAdd = (a, b) => red(a + b);
  var biModInv = (a) => {
    let lm = BI_ONE;
    let hm = BI_ZERO;
    let low = biMod(a);
    let high = P_BIGINT;
    while (low > BI_ONE) {
      const r2 = high / low;
      [lm, hm] = [hm - lm * r2, lm];
      [low, high] = [high - low * r2, low];
    }
    return biMod(lm);
  };
  var biModSqr = (a) => biModMul(a, a);
  var biModPow = (base, exp) => {
    let result = 1n;
    base = biMod(base);
    while (exp > 0n) {
      if ((exp & 1n) !== 0n) {
        result = biModMul(result, base);
      }
      base = biModMul(base, base);
      exp >>= 1n;
    }
    return result;
  };
  var P_PLUS1_DIV4 = P_BIGINT + 1n >> 2n;
  var biModSqrt = (a) => {
    const r2 = biModPow(a, P_PLUS1_DIV4);
    if (biModMul(r2, r2) !== biMod(a)) {
      return null;
    }
    return r2;
  };
  var toBigInt = (x) => {
    if (BigNumber.isBN(x))
      return BigInt("0x" + x.toString(16));
    if (typeof x === "string")
      return BigInt("0x" + x);
    if (Array.isArray(x))
      return BigInt("0x" + toHex(x));
    return BigInt(x);
  };
  var GX_BIGINT = BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798");
  var GY_BIGINT = BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8");
  var WNAF_TABLE_CACHE = /* @__PURE__ */ new Map();
  var jpDouble = (P) => {
    const { X: X1, Y: Y1, Z: Z1 } = P;
    if (Y1 === BI_ZERO)
      return { X: BI_ZERO, Y: BI_ONE, Z: BI_ZERO };
    const Y1sq = biModMul(Y1, Y1);
    const S = biModMul(BI_FOUR, biModMul(X1, Y1sq));
    const M = biModMul(BI_THREE, biModMul(X1, X1));
    const X3 = biModSub(biModMul(M, M), biModMul(BI_TWO, S));
    const Y3 = biModSub(biModMul(M, biModSub(S, X3)), biModMul(BI_EIGHT, biModMul(Y1sq, Y1sq)));
    const Z3 = biModMul(BI_TWO, biModMul(Y1, Z1));
    return { X: X3, Y: Y3, Z: Z3 };
  };
  var jpAdd = (P, Q) => {
    if (P.Z === BI_ZERO)
      return Q;
    if (Q.Z === BI_ZERO)
      return P;
    const Z1Z1 = biModMul(P.Z, P.Z);
    const Z2Z2 = biModMul(Q.Z, Q.Z);
    const U1 = biModMul(P.X, Z2Z2);
    const U2 = biModMul(Q.X, Z1Z1);
    const S1 = biModMul(P.Y, biModMul(Z2Z2, Q.Z));
    const S2 = biModMul(Q.Y, biModMul(Z1Z1, P.Z));
    const H = biModSub(U2, U1);
    const r2 = biModSub(S2, S1);
    if (H === BI_ZERO) {
      if (r2 === BI_ZERO)
        return jpDouble(P);
      return { X: BI_ZERO, Y: BI_ONE, Z: BI_ZERO };
    }
    const HH = biModMul(H, H);
    const HHH = biModMul(H, HH);
    const V = biModMul(U1, HH);
    const X3 = biModSub(biModSub(biModMul(r2, r2), HHH), biModMul(BI_TWO, V));
    const Y3 = biModSub(biModMul(r2, biModSub(V, X3)), biModMul(S1, HHH));
    const Z3 = biModMul(H, biModMul(P.Z, Q.Z));
    return { X: X3, Y: Y3, Z: Z3 };
  };
  var jpNeg = (P) => {
    if (P.Z === BI_ZERO)
      return P;
    return { X: P.X, Y: P_BIGINT - P.Y, Z: P.Z };
  };
  var wnafTable = (window2, P0) => {
    const key = `${window2}:${P0.x.toString(16)}:${P0.y.toString(16)}`;
    const cached = WNAF_TABLE_CACHE.get(key);
    if (cached !== void 0)
      return cached;
    const table = Array.from({ length: 1 << window2 - 1 }, () => ({
      X: BI_ZERO,
      Y: BI_ONE,
      Z: BI_ZERO
    }));
    const point = { X: P0.x, Y: P0.y, Z: BI_ONE };
    table[0] = point;
    const doubled = jpDouble(point);
    for (let i = 1; i < table.length; i++) {
      table[i] = jpAdd(table[i - 1], doubled);
    }
    WNAF_TABLE_CACHE.set(key, table);
    return table;
  };
  var wnafDigits2 = (scalar, window2) => {
    const digits = [];
    const windowSize = 1n << BigInt(window2);
    const halfWindow = windowSize >> 1n;
    let remaining = scalar;
    while (remaining > 0n) {
      if ((remaining & BI_ONE) === BI_ZERO) {
        digits.push(0);
      } else {
        let digit = remaining & windowSize - 1n;
        if (digit > halfWindow)
          digit -= windowSize;
        digits.push(Number(digit));
        remaining -= digit;
      }
      remaining >>= BI_ONE;
    }
    return digits;
  };
  var scalarMultiplyWNAF = (k, P0, window2 = 5) => {
    const table = wnafTable(window2, P0);
    const wnaf = wnafDigits2(k, window2);
    let Q = { X: BI_ZERO, Y: BI_ONE, Z: BI_ZERO };
    for (let i = wnaf.length - 1; i >= 0; i--) {
      Q = jpDouble(Q);
      const di = wnaf[i];
      if (di !== 0) {
        const idx = Math.abs(di) >> 1;
        const addend = di > 0 ? table[idx] : jpNeg(table[idx]);
        Q = jpAdd(Q, addend);
      }
    }
    return Q;
  };
  var modN = (a) => {
    let r2 = a % N_BIGINT;
    if (r2 < 0n)
      r2 += N_BIGINT;
    return r2;
  };
  var modMulN = (a, b) => modN(a * b);
  var modInvN = (a) => {
    let lm = 1n;
    let hm = 0n;
    let low = modN(a);
    let high = N_BIGINT;
    while (low > 1n) {
      const q = high / low;
      [lm, hm] = [hm - lm * q, lm];
      [low, high] = [high - low * q, low];
    }
    return modN(lm);
  };
  var _Point_instances, _getBeta_fn, _prepareWnafWindows_fn, _prepareWnafRepresentations_fn, _addWnafStep_fn, _wnafMulAdd_fn, _endoWnafMulAdd_fn, _getNAFPoints_fn;
  var _Point = class _Point extends BasePoint {
    /**
     * @constructor
     * @param x - The x-coordinate of the point. May be a number, a BigNumber, a string (which will be interpreted as hex), a number array, or null. If null, an "Infinity" point is constructed.
     * @param y - The y-coordinate of the point, similar to x.
     * @param isRed - A boolean indicating if the point is a member of the field of integers modulo the k256 prime. Default is true.
     *
     * @example
     * new Point('abc123', 'def456');
     * new Point(null, null); // Generates Infinity point.
     */
    constructor(x, y, isRed = true) {
      super("affine");
      __privateAdd(this, _Point_instances);
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "inf");
      this.precomputed = null;
      if (x === null && y === null) {
        this.x = null;
        this.y = null;
        this.inf = true;
      } else {
        if (!BigNumber.isBN(x)) {
          x = new BigNumber(x, 16);
        }
        this.x = x;
        if (!BigNumber.isBN(y)) {
          y = new BigNumber(y, 16);
        }
        this.y = y;
        if (isRed) {
          this.x.forceRed(this.curve.red);
          this.y.forceRed(this.curve.red);
        }
        if (this.x.red === null) {
          this.x = this.x.toRed(this.curve.red);
        }
        if (this.y.red === null) {
          this.y = this.y.toRed(this.curve.red);
        }
        this.inf = false;
      }
    }
    static _assertOnCurve(p) {
      if (!p.validate()) {
        throw new Error("Invalid point");
      }
      return p;
    }
    /**
     * Creates a point object from a given Array. These numbers can represent coordinates in hex format, or points
     * in multiple established formats.
     * The function verifies the integrity of the provided data and throws errors if inconsistencies are found.
     *
     * @method fromDER
     * @static
     * @param bytes - The point representation number array.
     * @returns Returns a new point representing the given string.
     * @throws `Error` If the point number[] value has a wrong length.
     * @throws `Error` If the point format is unknown.
     *
     * @example
     * const derPoint = [ 2, 18, 123, 108, 125, 83, 1, 251, 164, 214, 16, 119, 200, 216, 210, 193, 251, 193, 129, 67, 97, 146, 210, 216, 77, 254, 18, 6, 150, 190, 99, 198, 128 ];
     * const point = Point.fromDER(derPoint);
     */
    static fromDER(bytes2) {
      const len = 32;
      if ((bytes2[0] === 4 || bytes2[0] === 6 || bytes2[0] === 7) && bytes2.length - 1 === 2 * len) {
        if (bytes2[0] === 6) {
          if (bytes2.at(-1) % 2 !== 0) {
            throw new Error("Point string value is wrong length");
          }
        } else if (bytes2[0] === 7) {
          if (bytes2.at(-1) % 2 !== 1) {
            throw new Error("Point string value is wrong length");
          }
        }
        const res = new _Point(bytes2.slice(1, 1 + len), bytes2.slice(1 + len, 1 + 2 * len));
        return _Point._assertOnCurve(res);
      } else if ((bytes2[0] === 2 || bytes2[0] === 3) && bytes2.length - 1 === len) {
        return _Point._assertOnCurve(_Point.fromX(bytes2.slice(1, 1 + len), bytes2[0] === 3));
      }
      throw new Error("Unknown point format");
    }
    /**
     * Creates a point object from a given string. This string can represent coordinates in hex format, or points
     * in multiple established formats.
     * The function verifies the integrity of the provided data and throws errors if inconsistencies are found.
     *
     * @method fromString
     * @static
     *
     * @param str The point representation string.
     * @returns Returns a new point representing the given string.
     * @throws `Error` If the point string value has a wrong length.
     * @throws `Error` If the point format is unknown.
     *
     * @example
     * const pointStr = 'abcdef';
     * const point = Point.fromString(pointStr);
     */
    static fromString(str) {
      const bytes2 = toArray2(str, "hex");
      return _Point._assertOnCurve(_Point.fromDER(bytes2));
    }
    /**
     * Generates a point from an x coordinate and a boolean indicating whether the corresponding
     * y coordinate is odd.
     *
     * @method fromX
     * @static
     * @param x - The x coordinate of the point.
     * @param odd - Boolean indicating whether the corresponding y coordinate is odd or not.
     * @returns Returns the new point.
     * @throws `Error` If the point is invalid.
     *
     * @example
     * const xCoordinate = new BigNumber('10');
     * const point = Point.fromX(xCoordinate, true);
     */
    static fromX(x, odd) {
      let xBigInt = toBigInt(x);
      xBigInt = biMod(xBigInt);
      const y2 = biModAdd(biModMul(biModSqr(xBigInt), xBigInt), 7n);
      const y = biModSqrt(y2);
      if (y === null) {
        throw new Error("Invalid point");
      }
      let yBig = y;
      if ((yBig & BI_ONE) !== (odd ? BI_ONE : BI_ZERO)) {
        yBig = biModSub(P_BIGINT, yBig);
      }
      const xBN = new BigNumber(xBigInt.toString(16), 16);
      const yBN = new BigNumber(yBig.toString(16), 16);
      return _Point._assertOnCurve(new _Point(xBN, yBN));
    }
    /**
     * Generates a point from a serialized JSON object. The function accounts for different options in the JSON object,
     * including precomputed values for optimization of EC operations, and calls another helper function to turn nested
     * JSON points into proper Point objects.
     *
     * @method fromJSON
     * @static
     * @param obj - An object or array that holds the data for the point.
     * @param isRed - A boolean to direct how the Point is constructed from the JSON object.
     * @returns Returns a new point based on the deserialized JSON object.
     *
     * @example
     * const serializedPoint = '{"x":52,"y":15}';
     * const point = Point.fromJSON(serializedPoint, true);
     */
    static fromJSON(obj, isRed) {
      if (typeof obj === "string") {
        obj = JSON.parse(obj);
      }
      let res = new _Point(obj[0], obj[1], isRed);
      res = _Point._assertOnCurve(res);
      if (typeof obj[2] !== "object" || obj[2] === null) {
        return res;
      }
      const pre = obj[2];
      const obj2point = (p) => {
        const pt = new _Point(p[0], p[1], isRed);
        return _Point._assertOnCurve(pt);
      };
      res.precomputed = {
        beta: null,
        doubles: typeof pre.doubles === "object" && pre.doubles !== null ? {
          step: pre.doubles.step,
          points: [res].concat(pre.doubles.points.map(obj2point))
        } : void 0,
        naf: typeof pre.naf === "object" && pre.naf !== null ? {
          wnd: pre.naf.wnd,
          points: [res].concat(pre.naf.points.map(obj2point))
        } : void 0
      };
      return res;
    }
    /**
     * Validates if a point belongs to the curve. Follows the short Weierstrass
     * equation for elliptic curves: y^2 = x^3 + ax + b.
     *
     * @method validate
     * @returns {boolean} true if the point is on the curve, false otherwise.
     *
     * @example
     * const aPoint = new Point(x, y);
     * const isValid = aPoint.validate();
     */
    validate() {
      if (this.inf || this.x == null || this.y == null)
        return false;
      try {
        const xBig = BigInt("0x" + this.x.fromRed().toString(16));
        const yBig = BigInt("0x" + this.y.fromRed().toString(16));
        const lhs = biModMul(yBig, yBig);
        const rhs = biModAdd(biModMul(biModMul(xBig, xBig), xBig), 7n);
        return lhs === rhs;
      } catch {
        return false;
      }
    }
    /**
     * Encodes the coordinates of a point into an array or a hexadecimal string.
     * The details of encoding are determined by the optional compact and enc parameters.
     *
     * @method encode
     * @param compact - If true, an additional prefix byte 0x02 or 0x03 based on the 'y' coordinate being even or odd respectively is used. If false, byte 0x04 is used.
     * @param enc - Expects the string 'hex' if hexadecimal string encoding is required instead of an array of numbers.
     * @throws Will throw an error if the specified encoding method is not recognized. Expects 'hex'.
     * @returns If enc is undefined, a byte array representation of the point will be returned. if enc is 'hex', a hexadecimal string representation of the point will be returned.
     *
     * @example
     * const aPoint = new Point(x, y);
     * const encodedPointArray = aPoint.encode();
     * const encodedPointHex = aPoint.encode(true, 'hex');
     */
    encode(compact = true, enc) {
      if (this.inf) {
        if (enc === "hex")
          return "00";
        return [0];
      }
      const len = this.curve.p.byteLength();
      const x = this.getX().toArray("be", len);
      let res;
      if (compact) {
        res = [this.getY().isEven() ? 2 : 3].concat(x);
      } else {
        res = [4].concat(x, this.getY().toArray("be", len));
      }
      if (enc === "hex") {
        return toHex(res);
      } else {
        return res;
      }
    }
    /**
     * Converts the point coordinates to a hexadecimal string. A wrapper method
     * for encode. Byte 0x02 or 0x03 is used as prefix based on the 'y' coordinate being even or odd respectively.
     *
     * @method toString
     * @returns {string} A hexadecimal string representation of the point coordinates.
     *
     * @example
     * const aPoint = new Point(x, y);
     * const stringPoint = aPoint.toString();
     */
    toString() {
      return this.encode(true, "hex");
    }
    /**
     * Exports the x and y coordinates of the point, and the precomputed doubles and non-adjacent form (NAF) for optimization. The output is an array.
     *
     * @method toJSON
     * @returns An Array where first two elements are the coordinates of the point and optional third element is an object with doubles and NAF points.
     *
     * @example
     * const aPoint = new Point(x, y);
     * const jsonPoint = aPoint.toJSON();
     */
    toJSON() {
      if (this.precomputed == null) {
        return [this.x, this.y];
      }
      return [
        this.x,
        this.y,
        typeof this.precomputed === "object" && this.precomputed !== null ? {
          doubles: this.precomputed.doubles == null ? void 0 : {
            step: this.precomputed.doubles.step,
            points: this.precomputed.doubles.points.slice(1)
          },
          naf: this.precomputed.naf == null ? void 0 : {
            wnd: this.precomputed.naf.wnd,
            points: this.precomputed.naf.points.slice(1)
          }
        } : void 0
      ];
    }
    /**
     * Provides the point coordinates in a human-readable string format for debugging purposes.
     *
     * @method inspect
     * @returns String of the format '<EC Point x: x-coordinate y: y-coordinate>', or '<EC Point Infinity>' if the point is at infinity.
     *
     * @example
     * const aPoint = new Point(x, y);
     * console.log(aPoint.inspect());
     */
    inspect() {
      if (this.isInfinity()) {
        return "<EC Point Infinity>";
      }
      return "<EC Point x: " + (this.x?.fromRed()?.toString(16, 2) ?? "undefined") + " y: " + (this.y?.fromRed()?.toString(16, 2) ?? "undefined") + ">";
    }
    /**
     * Checks if the point is at infinity.
     * @method isInfinity
     * @returns Returns whether or not the point is at infinity.
     *
     * @example
     * const p = new Point(null, null);
     * console.log(p.isInfinity()); // outputs: true
     */
    isInfinity() {
      return this.inf;
    }
    /**
     * Adds another Point to this Point, returning a new Point.
     *
     * @method add
     * @param p - The Point to add to this one.
     * @returns A new Point that results from the addition.
     *
     * @example
     * const p1 = new Point(1, 2);
     * const p2 = new Point(2, 3);
     * const result = p1.add(p2);
     */
    add(p) {
      if (this.inf) {
        return p;
      }
      if (p.inf) {
        return this;
      }
      if (this.eq(p)) {
        return this.dbl();
      }
      if (this.neg().eq(p)) {
        return new _Point(null, null);
      }
      if (this.x?.cmp(p.x ?? new BigNumber(0)) === 0) {
        return new _Point(null, null);
      }
      const P1 = {
        X: BigInt("0x" + this.x.fromRed().toString(16)),
        Y: BigInt("0x" + this.y.fromRed().toString(16)),
        Z: BI_ONE
      };
      const Q1 = {
        X: BigInt("0x" + p.x.fromRed().toString(16)),
        Y: BigInt("0x" + p.y.fromRed().toString(16)),
        Z: BI_ONE
      };
      const R = jpAdd(P1, Q1);
      if (R.Z === BI_ZERO)
        return new _Point(null, null);
      const zInv = biModInv(R.Z);
      const zInv2 = biModMul(zInv, zInv);
      const xRes = biModMul(R.X, zInv2);
      const yRes = biModMul(R.Y, biModMul(zInv2, zInv));
      return new _Point(xRes.toString(16), yRes.toString(16));
    }
    /**
     * Doubles the current point.
     *
     * @method dbl
     *
     * @example
     * const P = new Point('123', '456');
     * const result = P.dbl();
     * */
    dbl() {
      if (this.inf)
        return this;
      if (this.x === null || this.y === null) {
        throw new Error("Point coordinates cannot be null");
      }
      const X = BigInt("0x" + this.x.fromRed().toString(16));
      const Y = BigInt("0x" + this.y.fromRed().toString(16));
      if (Y === BI_ZERO)
        return new _Point(null, null);
      const R = jpDouble({ X, Y, Z: BI_ONE });
      const zInv = biModInv(R.Z);
      const zInv2 = biModMul(zInv, zInv);
      const xRes = biModMul(R.X, zInv2);
      const yRes = biModMul(R.Y, biModMul(zInv2, zInv));
      return new _Point(xRes.toString(16), yRes.toString(16));
    }
    /**
     * Returns X coordinate of point
     *
     * @example
     * const P = new Point('123', '456');
     * const x = P.getX();
     */
    getX() {
      return (this.x ?? new BigNumber(0)).fromRed();
    }
    /**
     * Returns X coordinate of point
     *
     * @example
     * const P = new Point('123', '456');
     * const x = P.getX();
     */
    getY() {
      return (this.y ?? new BigNumber(0)).fromRed();
    }
    /**
     * Multiplies this Point by a scalar value, returning a new Point.
     *
     * @method mul
     * @param k - The scalar value to multiply this Point by.
     * @returns  A new Point that results from the multiplication.
     *
     * @example
     * const p = new Point(1, 2);
     * const result = p.mul(2); // this doubles the Point
     */
    mul(k) {
      if (!BigNumber.isBN(k)) {
        k = new BigNumber(k, 16);
      }
      k = k;
      if (this.inf) {
        return this;
      }
      const isNeg = k.isNeg();
      const kAbs = isNeg ? k.neg() : k;
      let kBig = BigInt("0x" + kAbs.toString(16));
      kBig = biMod(kBig);
      if (kBig === BI_ZERO) {
        return new _Point(null, null);
      }
      if (kBig === BI_ZERO) {
        return new _Point(null, null);
      }
      if (this.x === null || this.y === null) {
        throw new Error("Point coordinates cannot be null");
      }
      let Px;
      let Py;
      if (this === this.curve.g) {
        Px = GX_BIGINT;
        Py = GY_BIGINT;
      } else {
        Px = BigInt("0x" + this.x.fromRed().toString(16));
        Py = BigInt("0x" + this.y.fromRed().toString(16));
      }
      const R = scalarMultiplyWNAF(kBig, { x: Px, y: Py });
      if (R.Z === BI_ZERO) {
        return new _Point(null, null);
      }
      const zInv = biModInv(R.Z);
      const zInv2 = biModMul(zInv, zInv);
      const xRes = biModMul(R.X, zInv2);
      const yRes = biModMul(R.Y, biModMul(zInv2, zInv));
      const xBN = new BigNumber(xRes.toString(16), 16);
      const yBN = new BigNumber(yRes.toString(16), 16);
      const result = new _Point(xBN, yBN);
      if (isNeg) {
        return result.neg();
      }
      return result;
    }
    mulCT(k) {
      if (!BigNumber.isBN(k)) {
        k = new BigNumber(k, 16);
      }
      k = k;
      if (this.inf)
        return new _Point(null, null);
      const isNeg = k.isNeg();
      const kAbs = isNeg ? k.neg() : k;
      let kBig = BigInt("0x" + kAbs.toString(16));
      kBig = biMod(kBig);
      if (kBig === 0n)
        return new _Point(null, null);
      const Px = this === this.curve.g ? GX_BIGINT : BigInt("0x" + this.getX().toString(16));
      const Py = this === this.curve.g ? GY_BIGINT : BigInt("0x" + this.getY().toString(16));
      let R0 = { X: 0n, Y: 1n, Z: 0n };
      let R1 = { X: Px, Y: Py, Z: 1n };
      const bits = kBig.toString(2);
      for (const bitChar of bits) {
        const bit = bitChar === "1" ? 1n : 0n;
        ctSwap(bit, R0, R1);
        R1 = jpAdd(R0, R1);
        R0 = jpDouble(R0);
        ctSwap(bit, R0, R1);
      }
      if (R0.Z === 0n)
        return new _Point(null, null);
      const zInv = biModInv(R0.Z);
      const zInv2 = biModMul(zInv, zInv);
      const x = biModMul(R0.X, zInv2);
      const y = biModMul(R0.Y, biModMul(zInv2, zInv));
      const result = new _Point(x.toString(16), y.toString(16));
      return isNeg ? result.neg() : result;
    }
    /**
     * Performs a multiplication and addition operation in a single step.
     * Multiplies this Point by k1, adds the resulting Point to the result of p2 multiplied by k2.
     *
     * @method mulAdd
     * @param k1 - The scalar value to multiply this Point by.
     * @param p2 - The other Point to be involved in the operation.
     * @param k2 - The scalar value to multiply the Point p2 by.
     * @returns A Point that results from the combined multiplication and addition operations.
     *
     * @example
     * const p1 = new Point(1, 2);
     * const p2 = new Point(2, 3);
     * const result = p1.mulAdd(2, p2, 3);
     */
    mulAdd(k1, p2, k2) {
      const points = [this, p2];
      const coeffs = [k1, k2];
      return __privateMethod(this, _Point_instances, _endoWnafMulAdd_fn).call(this, points, coeffs);
    }
    /**
     * Performs the Jacobian multiplication and addition operation in a single
     * step. Instead of returning a regular Point, the result is a JacobianPoint.
     *
     * @method jmulAdd
     * @param k1 - The scalar value to multiply this Point by.
     * @param p2 - The other Point to be involved in the operation
     * @param k2 - The scalar value to multiply the Point p2 by.
     * @returns A JacobianPoint that results from the combined multiplication and addition operation.
     *
     * @example
     * const p1 = new Point(1, 2);
     * const p2 = new Point(2, 3);
     * const result = p1.jmulAdd(2, p2, 3);
     */
    jmulAdd(k1, p2, k2) {
      const points = [this, p2];
      const coeffs = [k1, k2];
      return __privateMethod(this, _Point_instances, _endoWnafMulAdd_fn).call(this, points, coeffs, true);
    }
    /**
     * Checks if the Point instance is equal to another given Point.
     *
     * @method eq
     * @param p - The Point to be checked if equal to the current instance.
     *
     * @returns Whether the two Point instances are equal. Both the 'x' and 'y' coordinates have to match, and both points have to either be valid or at infinity for equality. If both conditions are true, it returns true, else it returns false.
     *
     * @example
     * const p1 = new Point(5, 20);
     * const p2 = new Point(5, 20);
     * const areEqual = p1.eq(p2); // returns true
     */
    eq(p) {
      return this === p || this.inf === p.inf && (this.inf || (this.x ?? new BigNumber(0)).cmp(p.x ?? new BigNumber(0)) === 0 && (this.y ?? new BigNumber(0)).cmp(p.y ?? new BigNumber(0)) === 0);
    }
    /**
     * Negate a point. The negation of a point P is the mirror of P about x-axis.
     *
     * @method neg
     *
     * @example
     * const P = new Point('123', '456');
     * const result = P.neg();
     */
    neg(_precompute) {
      if (this.inf) {
        return this;
      }
      const res = new _Point(this.x, (this.y ?? new BigNumber(0)).redNeg());
      if (_precompute === true && this.precomputed != null) {
        const pre = this.precomputed;
        const negate = (p) => p.neg();
        res.precomputed = {
          naf: pre.naf == null ? void 0 : {
            wnd: pre.naf.wnd,
            points: pre.naf.points.map(negate)
          },
          doubles: pre.doubles == null ? void 0 : {
            step: pre.doubles.step,
            points: pre.doubles.points.map((p) => p.neg())
          },
          beta: void 0
        };
      }
      return res;
    }
    /**
     * Performs the "doubling" operation on the Point a given number of times.
     * This is used in elliptic curve operations to perform multiplication by 2, multiple times.
     * If the point is at infinity, it simply returns the point because doubling
     * a point at infinity is still infinity.
     *
     * @method dblp
     * @param k - The number of times the "doubling" operation is to be performed on the Point.
     * @returns The Point after 'k' "doubling" operations have been performed.
     *
     * @example
     * const p = new Point(5, 20);
     * const doubledPoint = p.dblp(10); // returns the point after "doubled" 10 times
     */
    dblp(k) {
      let r2;
      for (let i = 0; i < k; i++) {
        r2 = (r2 ?? this).dbl();
      }
      return r2 ?? this;
    }
    /**
     * Converts the point to a Jacobian point. If the point is at infinity, the corresponding Jacobian point
     * will also be at infinity.
     *
     * @method toJ
     * @returns Returns a new Jacobian point based on the current point.
     *
     * @example
     * const point = new Point(xCoordinate, yCoordinate);
     * const jacobianPoint = point.toJ();
     */
    toJ() {
      if (this.inf) {
        return new JacobianPoint(null, null, null);
      }
      const res = new JacobianPoint(this.x, this.y, this.curve.one);
      return res;
    }
    _combineWnafPair(a, b, context) {
      const { points, coeffs, wndWidth, wnd, naf, currentMax } = context;
      if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
        naf[a] = this.curve.getNAF(coeffs[a], wndWidth[a], this.curve._bitLength);
        naf[b] = this.curve.getNAF(coeffs[b], wndWidth[b], this.curve._bitLength);
        return Math.max(currentMax, naf[a].length, naf[b].length);
      }
      const comb = [points[a], null, null, points[b]];
      const aY = points[a].y ?? new BigNumber(0);
      const bY = points[b].y ?? new BigNumber(0);
      if (aY.cmp(bY) === 0) {
        comb[1] = points[a].add(points[b]);
        comb[2] = points[a].toJ().mixedAdd(points[b].neg());
      } else if (aY.cmp(bY.redNeg()) === 0) {
        comb[1] = points[a].toJ().mixedAdd(points[b]);
        comb[2] = points[a].add(points[b].neg());
      } else {
        comb[1] = points[a].toJ().mixedAdd(points[b]);
        comb[2] = points[a].toJ().mixedAdd(points[b].neg());
      }
      const index = [-3, -1, -5, -7, 0, 7, 5, 1, 3];
      const jsf = this.curve.getJSF(coeffs[a], coeffs[b]);
      const max = Math.max(currentMax, jsf[0].length);
      naf[a] = Array.from({ length: max });
      naf[b] = Array.from({ length: max });
      for (let position = 0; position < max; position++) {
        const ja = Math.trunc(jsf[0][position]);
        const jb = Math.trunc(jsf[1][position]);
        naf[a][position] = index[(ja + 1) * 3 + (jb + 1)];
        naf[b][position] = 0;
        wnd[a] = comb;
      }
      return max;
    }
    _collectWnafStep(start, len, naf, tmp) {
      let index = start;
      let doubles = 0;
      while (index >= 0) {
        let zero = true;
        for (let point = 0; point < len; point++) {
          tmp[point] = new BigNumber(typeof naf[point][index] === "number" ? naf[point][index] : 0);
          if (!tmp[point].isZero())
            zero = false;
        }
        if (!zero)
          break;
        doubles++;
        index--;
      }
      if (index >= 0)
        doubles++;
      return { index, doubles };
    }
    _getDoubles(step, power) {
      if (typeof this.precomputed === "object" && this.precomputed !== null && typeof this.precomputed.doubles === "object" && this.precomputed.doubles !== null) {
        return this.precomputed.doubles;
      }
      const doubles = [this];
      let acc;
      for (let i = 0; i < (power ?? 0); i += step ?? 1) {
        for (let j = 0; j < (step ?? 1); j++) {
          acc = (acc ?? this).dbl();
        }
        doubles.push(acc);
      }
      return {
        step: step ?? 1,
        points: doubles
      };
    }
  };
  _Point_instances = new WeakSet();
  _getBeta_fn = function() {
    if (typeof this.curve.endo !== "object") {
      return;
    }
    const pre = this.precomputed;
    if (typeof pre === "object" && pre !== null && typeof pre.beta === "object" && pre.beta !== null) {
      return pre.beta;
    }
    const beta = new _Point((this.x ?? new BigNumber(0)).redMul(this.curve.endo.beta), this.y);
    if (pre != null) {
      const curve2 = this.curve;
      const endoMul = (basePoint) => {
        const p = basePoint;
        if (p.x === null) {
          throw new Error("p.x is null");
        }
        if (curve2.endo === void 0 || curve2.endo === null) {
          throw new Error("curve.endo is undefined");
        }
        return new _Point(p.x.redMul(curve2.endo.beta), p.y);
      };
      pre.beta = beta;
      beta.precomputed = {
        beta: null,
        naf: pre.naf == null ? void 0 : {
          wnd: pre.naf.wnd,
          points: pre.naf.points.map(endoMul)
        },
        doubles: pre.doubles == null ? void 0 : {
          step: pre.doubles.step,
          points: pre.doubles.points.map(endoMul)
        }
      };
    }
    return beta;
  };
  _prepareWnafWindows_fn = function(defW, points, len, wndWidth, wnd) {
    var _a;
    for (let index = 0; index < len; index++) {
      const nafPoints = __privateMethod(_a = points[index], _Point_instances, _getNAFPoints_fn).call(_a, defW);
      wndWidth[index] = nafPoints.wnd;
      wnd[index] = nafPoints.points;
    }
  };
  _prepareWnafRepresentations_fn = function(points, coeffs, len, wndWidth, wnd, naf) {
    let max = 0;
    for (let index = len - 1; index >= 1; index -= 2) {
      max = this._combineWnafPair(index - 1, index, {
        points,
        coeffs,
        wndWidth,
        wnd,
        naf,
        currentMax: max
      });
    }
    return max;
  };
  _addWnafStep_fn = function(accumulator, len, tmp, wnd) {
    const one = new BigNumber(1);
    const two = new BigNumber(2);
    let result = accumulator;
    for (let index = 0; index < len; index++) {
      const value = tmp[index];
      if (value.cmpn(0) === 0)
        continue;
      const point = value.isNeg() ? wnd[index][value.neg().sub(one).div(two).toNumber()].neg() : wnd[index][value.sub(one).div(two).toNumber()];
      result = point.type === "affine" ? result.mixedAdd(point) : result.add(point);
    }
    return result;
  };
  _wnafMulAdd_fn = function(defW, points, coeffs, len, jacobianResult) {
    const scratchLength = this.curve._wnafT1.length;
    const wndWidth = Array.from({ length: scratchLength });
    const wnd = Array.from({ length: scratchLength }, () => []);
    const naf = Array.from({ length: scratchLength }, () => []);
    __privateMethod(this, _Point_instances, _prepareWnafWindows_fn).call(this, defW, points, len, wndWidth, wnd);
    const max = __privateMethod(this, _Point_instances, _prepareWnafRepresentations_fn).call(this, points, coeffs, len, wndWidth, wnd, naf);
    let acc = new JacobianPoint(null, null, null);
    const tmp = this.curve._wnafT4;
    let index = max;
    while (index >= 0) {
      const step = this._collectWnafStep(index, len, naf, tmp);
      index = step.index;
      acc = acc.dblp(step.doubles);
      if (index < 0)
        break;
      acc = __privateMethod(this, _Point_instances, _addWnafStep_fn).call(this, acc, len, tmp, wnd);
      index--;
    }
    for (let i = 0; i < len; i++) {
      wnd[i] = [];
    }
    if (jacobianResult === true) {
      return acc;
    } else {
      return acc.toP();
    }
  };
  _endoWnafMulAdd_fn = function(points, coeffs, jacobianResult) {
    var _a;
    const npoints = Array.from({ length: points.length * 2 });
    const ncoeffs = Array.from({ length: points.length * 2 });
    let i;
    for (i = 0; i < points.length; i++) {
      const split3 = this.curve._endoSplit(coeffs[i]);
      let p = points[i];
      let beta = __privateMethod(_a = p, _Point_instances, _getBeta_fn).call(_a) ?? new _Point(null, null);
      if (split3.k1.negative !== 0) {
        split3.k1.ineg();
        p = p.neg(true);
      }
      if (split3.k2.negative !== 0) {
        split3.k2.ineg();
        beta = beta.neg(true);
      }
      npoints[i * 2] = p;
      npoints[i * 2 + 1] = beta;
      ncoeffs[i * 2] = split3.k1;
      ncoeffs[i * 2 + 1] = split3.k2;
    }
    const res = __privateMethod(this, _Point_instances, _wnafMulAdd_fn).call(this, 1, npoints, ncoeffs, i * 2, jacobianResult);
    for (let j = 0; j < i * 2; j++) {
      npoints[j] = null;
      ncoeffs[j] = null;
    }
    return res;
  };
  _getNAFPoints_fn = function(wnd) {
    if (typeof this.precomputed === "object" && this.precomputed !== null && typeof this.precomputed.naf === "object" && this.precomputed.naf !== null) {
      return this.precomputed.naf;
    }
    const res = [this];
    const max = (1 << wnd) - 1;
    const dbl = max === 1 ? null : this.dbl();
    for (let i = 1; i < max; i++) {
      if (dbl !== null) {
        res[i] = res[i - 1].add(dbl);
      }
    }
    return {
      wnd,
      points: res
    };
  };
  var Point2 = _Point;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/PublicKey.js
  var PublicKey = class _PublicKey extends Point2 {
    /**
     * Static factory method to derive a public key from a private key.
     * It multiplies the generator point 'g' on the elliptic curve by the private key.
     *
     * @static
     * @method fromPrivateKey
     *
     * @param key - The private key from which to derive the public key.
     *
     * @returns Returns the PublicKey derived from the given PrivateKey.
     *
     * @example
     * const myPrivKey = new PrivateKey(...)
     * const myPubKey = PublicKey.fromPrivateKey(myPrivKey)
     */
    static fromPrivateKey(key) {
      const c = new Curve();
      const p = c.g.mul(key);
      return new _PublicKey(p.x, p.y);
    }
    /**
     * Static factory method to create a PublicKey instance from a string.
     *
     * @param str - A string representing a public key.
     *
     * @returns Returns the PublicKey created from the string.
     *
     * @example
     * const myPubKey = PublicKey.fromString("03....")
     */
    static fromString(str) {
      const p = Point2.fromString(str);
      return new _PublicKey(p.x, p.y);
    }
    /**
     * Static factory method to create a PublicKey instance from a number array.
     *
     * @param bytes - A number array representing a public key.
     *
     * @returns Returns the PublicKey created from the number array.
     *
     * @example
     * const myPubKey = PublicKey.fromString("03....")
     */
    static fromDER(bytes2) {
      const p = Point2.fromDER(bytes2);
      return new _PublicKey(p.x, p.y);
    }
    /**
     * @constructor
     * @param x - A point or the x-coordinate of the point. May be a number, a BigNumber, a string (which will be interpreted as hex), a number array, or null. If null, an "Infinity" point is constructed.
     * @param y - If x is not a point, the y-coordinate of the point, similar to x.
     * @param isRed - A boolean indicating if the point is a member of the field of integers modulo the k256 prime. Default is true.
     *
     * @example
     * new PublicKey(point1);
     * new PublicKey('abc123', 'def456');
     */
    constructor(x, y = null, isRed = true) {
      if (x instanceof Point2) {
        super(x.getX(), x.getY());
      } else {
        if (y === null && isRed && typeof x === "string") {
          if (x.length === 66 || x.length === 130) {
            throw new Error('You are using the "new PublicKey()" constructor with a DER hex string. You need to use "PublicKey.fromString()" instead.');
          }
        }
        super(x, y, isRed);
      }
    }
    /**
     * Derive a shared secret from a public key and a private key for use in symmetric encryption.
     * This method multiplies the public key (an instance of Point) with a private key.
     *
     * @param priv - The private key to use in deriving the shared secret.
     *
     * @returns Returns the Point representing the shared secret.
     *
     * @throws Will throw an error if the public key is not valid for ECDH secret derivation.
     *
     * @example
     * const myPrivKey = new PrivateKey(...)
     * const sharedSecret = myPubKey.deriveSharedSecret(myPrivKey)
     */
    deriveSharedSecret(priv) {
      if (!this.validate()) {
        throw new Error("Public key not valid for ECDH secret derivation");
      }
      return this.mulCT(priv);
    }
    /**
     * Verify a signature of a message using this public key.
     *
     * @param msg - The message to verify. It can be a string or an array of numbers.
     * @param sig - The Signature of the message that needs verification.
     * @param enc - The encoding of the message. It defaults to 'utf8'.
     *
     * @returns Returns true if the signature is verified successfully, otherwise false.
     *
     * @example
     * const myMessage = "Hello, world!"
     * const mySignature = new Signature(...)
     * const isVerified = myPubKey.verify(myMessage, mySignature)
     */
    verify(msg, sig, enc) {
      const msgHash = new BigNumber(sha2562(msg, enc), 16);
      return verify(msgHash, sig, this);
    }
    /**
     * Encode the public key to DER (Distinguished Encoding Rules) format.
     *
     * @returns Returns the DER-encoded public key in number array or string.
     *
     * @param enc - The encoding of the DER string. undefined = number array, 'hex' = hex string.
     *
     * @example
     * const derPublicKey = myPubKey.toDER()
     */
    toDER(enc) {
      if (enc === "hex")
        return this.encode(true, enc);
      return this.encode(true);
    }
    /**
     * Hash sha256 and ripemd160 of the public key.
     *
     * @returns Returns the hash of the public key.
     *
     * @example
     * const publicKeyHash = pubkey.toHash()
     */
    toHash(enc) {
      const pkh = hash1602(this.encode(true));
      if (enc === "hex") {
        return toHex(pkh);
      }
      return pkh;
    }
    /**
     * Base58Check encodes the hash of the public key with a prefix to indicate locking script type.
     * Defaults to P2PKH for mainnet, otherwise known as a "Bitcoin Address".
     *
     * @param prefix defaults to [0x00] for mainnet, set to [0x6f] for testnet or use the strings 'mainnet' or 'testnet'
     *
     * @returns Returns the address encoding associated with the hash of the public key.
     *
     * @example
     * const address = pubkey.toAddress()
     * const address = pubkey.toAddress('mainnet')
     * const testnetAddress = pubkey.toAddress([0x6f])
     * const testnetAddress = pubkey.toAddress('testnet')
     */
    toAddress(prefix2 = [0]) {
      if (typeof prefix2 === "string") {
        if (prefix2 === "testnet" || prefix2 === "test") {
          prefix2 = [111];
        } else if (prefix2 === "mainnet" || prefix2 === "main") {
          prefix2 = [0];
        } else {
          throw new Error(`Invalid prefix ${prefix2}`);
        }
      }
      return toBase58Check(this.toHash(), prefix2);
    }
    /**
     * Derives a child key with BRC-42.
     * @param privateKey The private key of the other party
     * @param invoiceNumber The invoice number used to derive the child key
     * @param cacheSharedSecret Optional function to cache shared secrets
     * @param retrieveCachedSharedSecret Optional function to retrieve shared secrets from the cache
     * @returns The derived child key.
     */
    deriveChild(privateKey, invoiceNumber, cacheSharedSecret, retrieveCachedSharedSecret) {
      let sharedSecret;
      if (typeof retrieveCachedSharedSecret === "function") {
        const retrieved = retrieveCachedSharedSecret(privateKey, this);
        if (retrieved === void 0) {
          sharedSecret = this.deriveSharedSecret(privateKey);
          if (typeof cacheSharedSecret === "function") {
            cacheSharedSecret(privateKey, this, sharedSecret);
          }
        } else {
          sharedSecret = retrieved;
        }
      } else {
        sharedSecret = this.deriveSharedSecret(privateKey);
      }
      const invoiceNumberBin = toArray2(invoiceNumber, "utf8");
      const hmac3 = sha256hmac(sharedSecret.encode(true), invoiceNumberBin);
      const curve2 = new Curve();
      const point = curve2.g.mul(new BigNumber(hmac3));
      const finalPoint = this.add(point);
      return new _PublicKey(finalPoint.x, finalPoint.y);
    }
    /**
     * Takes an array of numbers or a string and returns a new PublicKey instance.
     * This method will throw an error if the Compact encoding is invalid.
     * If a string is provided, it is assumed to represent a hexadecimal sequence.
     * compactByte value 27-30 means uncompressed public key.
     * 31-34 means compressed public key.
     * The range represents the recovery param which can be 0,1,2,3.
     *
     * @static
     * @method fromMsgHashAndCompactSignature
     * @param msgHash - The message hash which was signed.
     * @param signature - The signature in compact format.
     * @param enc - The encoding of the signature string.
     * @returns A PublicKey instance derived from the message hash and compact signature.
     * @example
     * const publicKey = Signature.fromMsgHashAndCompactSignature(msgHash, 'IMOl2mVKfDgsSsHT4uIYBNN4e...', 'base64');
     */
    static fromMsgHashAndCompactSignature(msgHash, signature, enc) {
      const data = toArray2(signature, enc);
      if (data.length !== 65) {
        throw new Error("Invalid Compact Signature");
      }
      const compactByte = data[0];
      if (compactByte < 27 || compactByte >= 35) {
        throw new Error("Invalid Compact Byte");
      }
      let r2 = data[0] - 27;
      if (r2 > 3) {
        r2 -= 4;
      }
      const s2 = new Signature(new BigNumber(data.slice(1, 33)), new BigNumber(data.slice(33, 65)));
      return s2.RecoverPublicKey(r2, msgHash);
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Signature.js
  var Signature = class _Signature {
    /**
     * Creates an instance of the Signature class.
     *
     * @constructor
     * @param r - The R component of the signature.
     * @param s - The S component of the signature.
     *
     * @example
     * const r = new BigNumber('208755674028...');
     * const s = new BigNumber('564745627577...');
     * const signature = new Signature(r, s);
     */
    constructor(r2, s2) {
      /**
       * @property Represents the "r" component of the digital signature
       */
      __publicField(this, "r");
      /**
       * @property Represents the "s" component of the digital signature
       */
      __publicField(this, "s");
      this.r = r2;
      this.s = s2;
    }
    /**
     * Takes an array of numbers or a string and returns a new Signature instance.
     * This method will throw an error if the DER encoding is invalid.
     * If a string is provided, it is assumed to represent a hexadecimal sequence.
     *
     * @static
     * @method fromDER
     * @param data - The sequence to decode from DER encoding.
     * @param enc - The encoding of the data string.
     * @returns The decoded data in the form of Signature instance.
     *
     * @example
     * const signature = Signature.fromDER('30440220018c1f5502f8...', 'hex');
     */
    static fromDER(data, enc) {
      const getLength = (buf, p2) => {
        const initial = buf[p2.place++];
        if ((initial & 128) === 0) {
          return initial;
        } else {
          throw new Error("Invalid DER entity length");
        }
      };
      class Position {
        constructor() {
          __publicField(this, "place", 0);
        }
      }
      data = toArray2(data, enc);
      const p = new Position();
      if (data[p.place++] !== 48) {
        throw new Error("Signature DER must start with 0x30");
      }
      const len = getLength(data, p);
      if (len + p.place !== data.length) {
        throw new Error("Signature DER invalid");
      }
      if (data[p.place++] !== 2) {
        throw new Error("Signature DER invalid");
      }
      const rlen = getLength(data, p);
      let r2 = data.slice(p.place, rlen + p.place);
      p.place += rlen;
      if (data[p.place++] !== 2) {
        throw new Error("Signature DER invalid");
      }
      const slen = getLength(data, p);
      if (data.length !== slen + p.place) {
        throw new Error("Invalid R-length in signature DER");
      }
      let s2 = data.slice(p.place, slen + p.place);
      if (r2[0] === 0) {
        if ((r2[1] & 128) === 0) {
          throw new Error("Invalid R-value in signature DER");
        } else {
          r2 = r2.slice(1);
        }
      }
      if (s2[0] === 0) {
        if ((s2[1] & 128) === 0) {
          throw new Error("Invalid S-value in signature DER");
        } else {
          s2 = s2.slice(1);
        }
      }
      return new _Signature(new BigNumber(r2), new BigNumber(s2));
    }
    /**
     * Takes an array of numbers or a string and returns a new Signature instance.
     * This method will throw an error if the Compact encoding is invalid.
     * If a string is provided, it is assumed to represent a hexadecimal sequence.
     * compactByte value 27-30 means uncompressed public key.
     * 31-34 means compressed public key.
     * The range represents the recovery param which can be 0,1,2,3.
     * We could support recovery functions in future if there's demand.
     *
     * @static
     * @method fromCompact
     * @param data - The sequence to decode from Compact encoding.
     * @param enc - The encoding of the data string.
     * @returns The decoded data in the form of Signature instance.
     *
     * @example
     * const signature = Signature.fromCompact('1b18c1f5502f8...', 'hex');
     */
    static fromCompact(data, enc) {
      data = toArray2(data, enc);
      if (data.length !== 65) {
        throw new Error("Invalid Compact Signature");
      }
      const compactByte = data[0];
      if (compactByte < 27 || compactByte >= 35) {
        throw new Error("Invalid Compact Byte");
      }
      return new _Signature(new BigNumber(data.slice(1, 33)), new BigNumber(data.slice(33, 65)));
    }
    /**
     * Verifies a digital signature.
     *
     * This method will return true if the signature, key, and message hash match.
     * If the data or key do not match the signature, the function returns false.
     *
     * @method verify
     * @param msg - The message to verify.
     * @param key - The public key used to sign the original message.
     * @param enc - The encoding of the msg string.
     * @returns A boolean representing whether the signature is valid.
     *
     * @example
     * const msg = 'The quick brown fox jumps over the lazy dog';
     * const publicKey = PublicKey.fromString('04188ca1050...');
     * const isVerified = signature.verify(msg, publicKey);
     */
    verify(msg, key, enc) {
      const msgHash = new BigNumber(sha2562(msg, enc), 16);
      return verify(msgHash, this, key);
    }
    /**
     * Converts an instance of Signature into DER encoding.
     * An alias for the toDER method.
     *
     * If the encoding parameter is set to 'hex', the function will return a hex string.
     * If 'base64', it will return a base64 string.
     * Otherwise, it will return an array of numbers.
     *
     * @method toDER
     * @param enc - The encoding to use for the output.
     * @returns The current instance in DER encoding.
     *
     * @example
     * const der = signature.toString('base64');
     */
    toString(enc) {
      return this.toDER(enc);
    }
    /**
     * Converts an instance of Signature into DER encoding.
     *
     * If the encoding parameter is set to 'hex', the function will return a hex string.
     * If 'base64', it will return a base64 string.
     * Otherwise, it will return an array of numbers.
     *
     * @method toDER
     * @param enc - The encoding to use for the output.
     * @returns The current instance in DER encoding.
     *
     * @example
     * const der = signature.toDER('hex');
     */
    toDER(enc) {
      const constructLength = (arr2, len) => {
        if (len < 128) {
          arr2.push(len);
        } else {
          throw new Error("len must be < 0x80");
        }
      };
      const rmPadding = (buf) => {
        let i = 0;
        const len = buf.length - 1;
        while (buf[i] === 0 && (buf[i + 1] & 128) === 0 && i < len) {
          i++;
        }
        if (i === 0) {
          return buf;
        }
        return buf.slice(i);
      };
      let r2 = this.r.toArray();
      let s2 = this.s.toArray();
      if ((r2[0] & 128) !== 0) {
        r2 = [0].concat(r2);
      }
      if ((s2[0] & 128) !== 0) {
        s2 = [0].concat(s2);
      }
      r2 = rmPadding(r2);
      s2 = rmPadding(s2);
      while (s2[0] === 0 && (s2[1] & 128) === 0) {
        s2 = s2.slice(1);
      }
      let arr = [2];
      constructLength(arr, r2.length);
      arr = arr.concat(r2);
      arr.push(2);
      constructLength(arr, s2.length);
      const backHalf = arr.concat(s2);
      let res = [48];
      constructLength(res, backHalf.length);
      res = res.concat(backHalf);
      if (enc === "hex") {
        return toHex(res);
      } else if (enc === "base64") {
        return toBase64(res);
      } else {
        return res;
      }
    }
    /**
     * Converts an instance of Signature into Compact encoding.
     *
     * If the encoding parameter is set to 'hex', the function will return a hex string.
     * If 'base64', it will return a base64 string.
     * Otherwise, it will return an array of numbers.
     *
     * @method toCompact
     * @param enc - The encoding to use for the output.
     * @returns The current instance in DER encoding.
     *
     * @example
     * const compact = signature.toCompact(3, true, 'base64');
     */
    toCompact(recovery, compressed, enc) {
      if (recovery < 0 || recovery > 3)
        throw new Error("Invalid recovery param");
      if (typeof compressed !== "boolean") {
        throw new TypeError("Invalid compressed param");
      }
      let compactByte = 27 + recovery;
      if (compressed) {
        compactByte += 4;
      }
      let arr = [compactByte];
      arr = arr.concat(this.r.toArray("be", 32));
      arr = arr.concat(this.s.toArray("be", 32));
      if (enc === "hex") {
        return toHex(arr);
      } else if (enc === "base64") {
        return toBase64(arr);
      } else {
        return arr;
      }
    }
    /**
     * Recovers the public key from a signature.
     * This method will return the public key if it finds a valid public key.
     * If it does not find a valid public key, it will throw an error.
     * The recovery factor is a number between 0 and 3.
     * @method RecoverPublicKey
     * @param recovery - The recovery factor.
     * @param e - The message hash.
     * @returns The public key associated with the signature.
     *
     * @example
     * const publicKey = signature.RecoverPublicKey(0, msgHash);
     */
    RecoverPublicKey(recovery, e) {
      const r2 = this.r;
      const s2 = this.s;
      const isYOdd = (recovery & 1) !== 0;
      const isSecondKey = recovery >> 1;
      const curve2 = new Curve();
      const n = curve2.n;
      const G = curve2.g;
      const x = isSecondKey === 0 ? r2 : r2.add(n);
      const R = Point2.fromX(x, isYOdd);
      const nR = R.mul(n);
      if (!nR.isInfinity()) {
        throw new Error("nR is not at infinity");
      }
      const eNeg = e.neg().umod(n);
      const rInv = r2.invm(n);
      const srInv = rInv.mul(s2).umod(n);
      const eInvrInv = rInv.mul(eNeg).umod(n);
      const Q = G.mul(eInvrInv).add(R.mul(srInv));
      const pubKey = new PublicKey(Q);
      pubKey.validate();
      return pubKey;
    }
    /**
     * Calculates the recovery factor which will work for a particular public key and message hash.
     * This method will return the recovery factor if it finds a valid recovery factor.
     * If it does not find a valid recovery factor, it will throw an error.
     * The recovery factor is a number between 0 and 3.
     *
     * @method CalculateRecoveryFactor
     * @param msgHash - The message hash.
     * @returns the recovery factor: number
     * /
     * @example
     * const recovery = signature.CalculateRecoveryFactor(publicKey, msgHash);
     */
    CalculateRecoveryFactor(pubkey, msgHash) {
      for (let recovery = 0; recovery < 4; recovery++) {
        let Qprime;
        try {
          Qprime = this.RecoverPublicKey(recovery, msgHash);
        } catch {
          continue;
        }
        if (pubkey.eq(Qprime)) {
          return recovery;
        }
      }
      throw new Error("Unable to find valid recovery factor");
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/DRBG.js
  var DRBG = class {
    constructor(entropy, nonce) {
      __publicField(this, "K");
      __publicField(this, "V");
      const entropyBytes = toArray2(entropy, "hex");
      const nonceBytes = toArray2(nonce, "hex");
      if (entropyBytes.length !== 32) {
        throw new Error("Entropy must be exactly 32 bytes (256 bits)");
      }
      if (nonceBytes.length !== 32) {
        throw new Error("Nonce must be exactly 32 bytes (256 bits)");
      }
      const seedMaterial = entropyBytes.concat(nonceBytes);
      this.K = Array.from({ length: 32 });
      this.V = Array.from({ length: 32 });
      for (let i = 0; i < 32; i++) {
        this.K[i] = 0;
        this.V[i] = 1;
      }
      this.update(seedMaterial);
    }
    /**
     * Generates HMAC using the K value of the instance. This method is used internally for operations.
     *
     * @method hmac
     * @returns The SHA256HMAC object created with K value.
     *
     * @example
     * const hmac = drbg.hmac();
     */
    hmac() {
      return new SHA256HMAC(this.K);
    }
    /**
     * Updates the `K` and `V` values of the instance based on the seed.
     * The seed if not provided uses `V` as seed.
     *
     * @method update
     * @param seed - an optional value that used to update `K` and `V`. Default is `undefined`.
     * @returns Nothing, but updates the internal state `K` and `V` value.
     *
     * @example
     * drbg.update('e13af...');
     */
    update(seed) {
      let kmac = this.hmac().update(this.V).update([0]);
      if (seed !== void 0) {
        kmac = kmac.update(seed);
      }
      this.K = kmac.digest();
      this.V = this.hmac().update(this.V).digest();
      if (seed === void 0) {
        return;
      }
      this.K = this.hmac().update(this.V).update([1]).update(seed).digest();
      this.V = this.hmac().update(this.V).digest();
    }
    /**
     * Generates deterministic random hexadecimal string of given length.
     * In every generation process, it also updates the internal state `K` and `V`.
     *
     * @method generate
     * @param len - The length of required random number.
     * @returns The required deterministic random hexadecimal string.
     *
     * @example
     * const randomHex = drbg.generate(256);
     */
    generate(len) {
      let temp = [];
      while (temp.length < len) {
        this.V = this.hmac().update(this.V).digest();
        temp = temp.concat(this.V);
      }
      const res = temp.slice(0, len);
      this.update();
      return toHex(res);
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/ECDSA.js
  function truncateToN(msg, truncOnly, curve2 = new Curve()) {
    const delta = msg.byteLength() * 8 - curve2.n.bitLength();
    if (delta > 0) {
      msg.iushrn(delta);
    }
    if (truncOnly !== true && msg.cmp(curve2.n) >= 0) {
      return msg.sub(curve2.n);
    } else {
      return msg;
    }
  }
  function bnToBigInt(bn) {
    const bytes2 = bn.toArray("be");
    let x = 0n;
    for (const byte of bytes2) {
      x = x << 8n | BigInt(byte);
    }
    return x;
  }
  var curve = new Curve();
  var bytes = curve.n.byteLength();
  var ns1 = curve.n.subn(1);
  var halfN = N_BIGINT >> 1n;
  function selectK(customK, iter, drbg) {
    let selected;
    if (typeof customK === "function") {
      selected = customK(iter);
    } else if (customK !== void 0 && BigNumber.isBN(customK)) {
      selected = customK;
    } else {
      selected = new BigNumber(drbg.generate(bytes), 16);
    }
    if (selected == null)
      throw new Error("k is undefined");
    return truncateToN(selected, true);
  }
  function retryOrRejectFixedK(fixedK, message) {
    if (fixedK)
      throw new Error(message);
    return void 0;
  }
  function signatureFromK(kBN, msgBig, keyBig, forceLowS, fixedK) {
    if (kBN.cmpn(1) < 0 || kBN.cmp(ns1) > 0) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (must be >1 and <N-1)");
    }
    const R = curve.g.mulCT(kBN);
    if (R.isInfinity()) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (k\xB7G at infinity)");
    }
    const rBig = modN(BigInt("0x" + R.getX().toString(16)));
    if (rBig === 0n) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (r == 0)");
    }
    const kInv = modInvN(BigInt("0x" + kBN.toString(16)));
    const sum = modN(msgBig + modMulN(rBig, keyBig));
    let sBig = modMulN(kInv, sum);
    if (sBig === 0n) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (s == 0)");
    }
    if (forceLowS && sBig > halfN)
      sBig = N_BIGINT - sBig;
    return new Signature(new BigNumber(rBig.toString(16), 16), new BigNumber(sBig.toString(16), 16));
  }
  var sign = (msg, key, forceLowS = false, customK) => {
    const nBitLength = curve.n.bitLength();
    if (msg.bitLength() > nBitLength) {
      throw new Error(`ECDSA message is too large: expected <= ${nBitLength} bits. Callers must hash messages before signing.`);
    }
    msg = truncateToN(msg);
    const msgBig = bnToBigInt(msg);
    const keyBig = bnToBigInt(key);
    const bkey = key.toArray("be", bytes);
    const nonce = msg.toArray("be", bytes);
    const drbg = new DRBG(bkey, nonce);
    const fixedK = BigNumber.isBN(customK);
    for (let iter = 0; ; iter++) {
      const signature = signatureFromK(selectK(customK, iter, drbg), msgBig, keyBig, forceLowS, fixedK);
      if (signature != null)
        return signature;
    }
  };
  var verify = (msg, sig, key) => {
    const nBitLength = curve.n.bitLength();
    if (msg.bitLength() > nBitLength) {
      return false;
    }
    const hash = bnToBigInt(msg);
    if (key.x == null || key.y == null) {
      throw new Error("Invalid public key: missing coordinates.");
    }
    const publicKey = {
      x: bnToBigInt(key.x),
      y: bnToBigInt(key.y)
    };
    const signature = {
      r: bnToBigInt(sig.r),
      s: bnToBigInt(sig.s)
    };
    const { r: r2, s: s2 } = signature;
    const z = hash;
    if (r2 <= BI_ZERO || r2 >= N_BIGINT || s2 <= BI_ZERO || s2 >= N_BIGINT) {
      return false;
    }
    const w = modInvN(s2);
    if (w === 0n)
      return false;
    const u1 = modMulN(z, w);
    const u2 = modMulN(r2, w);
    const RG = scalarMultiplyWNAF(u1, { x: GX_BIGINT, y: GY_BIGINT });
    const RQ = scalarMultiplyWNAF(u2, publicKey);
    const R = jpAdd(RG, RQ);
    if (R.Z === 0n)
      return false;
    const zInv = biModInv(R.Z);
    const zInv2 = biModMul(zInv, zInv);
    const xAff = biModMul(R.X, zInv2);
    const v = modN(xAff);
    return v === r2;
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Random.js
  var Rand = class {
    constructor() {
      __publicField(this, "_rand");
      const noRand = () => {
        throw new Error("No secure random number generator is available in this environment.");
      };
      this._rand = noRand;
      if (typeof globalThis !== "undefined" && typeof globalThis.crypto?.getRandomValues === "function") {
        this._rand = (n) => {
          return this.getRandomValues(globalThis, n);
        };
        return;
      }
      if (globalThis.self !== void 0 && typeof globalThis.self.crypto?.getRandomValues === "function") {
        this._rand = (n) => {
          return this.getRandomValues(globalThis.self, n);
        };
        return;
      }
      if (globalThis.window !== void 0 && typeof globalThis.window.crypto?.getRandomValues === "function") {
        this._rand = (n) => {
          return this.getRandomValues(globalThis.window, n);
        };
        return;
      }
      if (typeof process !== "undefined" && typeof process.getBuiltinModule === "function") {
        const nodeCrypto = process.getBuiltinModule("node:crypto");
        if (typeof nodeCrypto?.randomBytes === "function") {
          this._rand = (n) => Array.from(nodeCrypto.randomBytes(n));
          return;
        }
      }
      this._rand = noRand;
    }
    // ✅ Explicit function type
    getRandomValues(obj, n) {
      const arr = new Uint8Array(n);
      obj.crypto.getRandomValues(arr);
      return Array.from(arr);
    }
    generate(len) {
      return this._rand(len);
    }
  };
  var ayn = null;
  var Random = (len) => {
    ayn ?? (ayn = new Rand());
    return ayn.generate(len);
  };
  var Random_default = Random;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Polynomial.js
  var MAX_SHAMIR_SHARES = 255;
  var MAX_POINT_STRING_LENGTH = 129;
  var BASE58_FIELD = /^[1-9A-HJ-NP-Za-km-z]{1,64}$/;
  function assertPolynomialThreshold(threshold, pointCount, minimum) {
    if (!Number.isSafeInteger(threshold) || threshold < minimum || threshold > MAX_SHAMIR_SHARES) {
      throw new TypeError(`threshold must be a safe integer from ${minimum} to ${MAX_SHAMIR_SHARES}`);
    }
    if (threshold > pointCount)
      throw new Error("threshold cannot exceed the number of points");
  }
  var PointInFiniteField = class _PointInFiniteField {
    constructor(x, y) {
      __publicField(this, "x");
      __publicField(this, "y");
      const P = new Curve().p;
      this.x = x.umod(P);
      this.y = y.umod(P);
    }
    toString() {
      return toBase58(this.x.toArray()) + "." + toBase58(this.y.toArray());
    }
    static fromString(str) {
      if (typeof str !== "string" || str.length > MAX_POINT_STRING_LENGTH) {
        throw new TypeError("Finite-field point must use a bounded canonical Base58 representation");
      }
      const [x, y, extra] = str.split(".");
      if (extra !== void 0 || x === void 0 || y === void 0 || !BASE58_FIELD.test(x) || !BASE58_FIELD.test(y)) {
        throw new TypeError("Finite-field point must use a bounded canonical Base58 representation");
      }
      const point = new _PointInFiniteField(new BigNumber(fromBase58(x)), new BigNumber(fromBase58(y)));
      if (point.toString() !== str) {
        throw new TypeError("Finite-field point must use a bounded canonical Base58 representation");
      }
      return point;
    }
  };
  var Polynomial = class _Polynomial {
    constructor(points, threshold) {
      __publicField(this, "points");
      __publicField(this, "threshold");
      if (!Array.isArray(points) || points.length === 0 || points.length > MAX_SHAMIR_SHARES) {
        throw new TypeError(`points must contain from 1 to ${MAX_SHAMIR_SHARES} entries`);
      }
      const resolvedThreshold = threshold ?? points.length;
      assertPolynomialThreshold(resolvedThreshold, points.length, 1);
      this.points = points.slice();
      this.threshold = resolvedThreshold;
    }
    static fromPrivateKey(key, threshold) {
      if (!Number.isSafeInteger(threshold) || threshold < 2 || threshold > MAX_SHAMIR_SHARES) {
        throw new TypeError(`threshold must be a safe integer from 2 to ${MAX_SHAMIR_SHARES}`);
      }
      const P = new Curve().p;
      const points = [
        new PointInFiniteField(new BigNumber(0), new BigNumber(key.toArray()))
      ];
      for (let i = 1; i < threshold; i++) {
        const randomX = new BigNumber(Random_default(32)).umod(P);
        const randomY = new BigNumber(Random_default(32)).umod(P);
        points.push(new PointInFiniteField(randomX, randomY));
      }
      return new _Polynomial(points);
    }
    // Evaluate the polynomial at x by using Lagrange interpolation
    valueAt(x) {
      assertPolynomialThreshold(this.threshold, this.points.length, 1);
      if (!(x instanceof BigNumber))
        throw new TypeError("x must be a BigNumber");
      const P = new Curve().p;
      const seenXCoordinates = /* @__PURE__ */ new Set();
      for (let index = 0; index < this.threshold; index++) {
        const point = this.points[index];
        if (!(point instanceof PointInFiniteField) || !(point.x instanceof BigNumber) || !(point.y instanceof BigNumber)) {
          throw new TypeError("points must contain finite-field points");
        }
        if (point.x.isNeg() || point.y.isNeg() || point.x.gte(P) || point.y.gte(P)) {
          throw new TypeError("point coordinates must be canonical field elements");
        }
        const xCoordinate = point.x.toString(16);
        if (seenXCoordinates.has(xCoordinate))
          throw new Error("Polynomial points must have unique x coordinates");
        seenXCoordinates.add(xCoordinate);
      }
      const normalizedX = x.umod(P);
      let y = new BigNumber(0);
      for (let i = 0; i < this.threshold; i++) {
        let term = this.points[i].y;
        for (let j = 0; j < this.threshold; j++) {
          if (i !== j) {
            const xj = this.points[j].x;
            const xi = this.points[i].x;
            const numerator = normalizedX.sub(xj).umod(P);
            const denominator = xi.sub(xj).umod(P);
            const denominatorInverse = denominator.invm(P);
            const fraction = numerator.mul(denominatorInverse).umod(P);
            term = term.mul(fraction).umod(P);
          }
        }
        y = y.add(term).umod(P);
      }
      return y;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/PrivateKey.js
  var MAX_BACKUP_SHARE_LENGTH = 256;
  var BACKUP_SHARE_FIELD = /^[1-9A-HJ-NP-Za-km-z]{1,64}$/;
  var BACKUP_SHARE_THRESHOLD = /^(?:[2-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
  var BACKUP_SHARE_INTEGRITY = /^[0-9a-f]{8}$/;
  function assertKeyShareCollection(points, threshold, integrity) {
    if (!Array.isArray(points) || points.length === 0 || points.length > MAX_SHAMIR_SHARES) {
      throw new TypeError(`shares must contain from 1 to ${MAX_SHAMIR_SHARES} entries`);
    }
    if (!Number.isSafeInteger(threshold) || threshold < 2 || threshold > MAX_SHAMIR_SHARES) {
      throw new TypeError(`threshold must be a safe integer from 2 to ${MAX_SHAMIR_SHARES}`);
    }
    if (typeof integrity !== "string" || !BACKUP_SHARE_INTEGRITY.test(integrity)) {
      throw new TypeError("integrity must be an 8-character lowercase hexadecimal string");
    }
  }
  var KeyShares = class _KeyShares {
    constructor(points, threshold, integrity) {
      __publicField(this, "points");
      __publicField(this, "threshold");
      __publicField(this, "integrity");
      this.points = points;
      this.threshold = threshold;
      this.integrity = integrity;
    }
    /**
     * Parse one or more canonical bounded backup shares. Each share uses
     * `x.y.threshold.integrity`, where the threshold is from 2 through 255.
     */
    static fromBackupFormat(shares) {
      if (!Array.isArray(shares) || shares.length === 0 || shares.length > MAX_SHAMIR_SHARES) {
        throw new TypeError(`shares must contain from 1 to ${MAX_SHAMIR_SHARES} entries`);
      }
      let threshold = 0;
      let integrity = "";
      const points = [];
      for (let idx = 0; idx < shares.length; idx++) {
        if (!Object.prototype.hasOwnProperty.call(shares, idx))
          throw new TypeError("shares must be a dense array");
        const share = shares[idx];
        if (typeof share !== "string" || share.length > MAX_BACKUP_SHARE_LENGTH) {
          throw new TypeError(`Invalid share format in share ${idx.toString()}`);
        }
        const shareParts = share.split(".");
        if (shareParts.length !== 4) {
          throw new Error(`Invalid share format in share ${idx.toString()}. Expected format: "x.y.t.i"`);
        }
        const [x, y, t, i] = shareParts;
        if (x === void 0 || y === void 0 || t === void 0 || i === void 0 || !BACKUP_SHARE_FIELD.test(x) || !BACKUP_SHARE_FIELD.test(y) || !BACKUP_SHARE_THRESHOLD.test(t) || !BACKUP_SHARE_INTEGRITY.test(i)) {
          throw new TypeError(`Invalid canonical share data in share ${idx.toString()}`);
        }
        const tInt = Number(t);
        if (idx !== 0 && threshold !== tInt) {
          throw new Error("Threshold mismatch in share " + idx.toString());
        }
        if (idx !== 0 && integrity !== i) {
          throw new Error("Integrity mismatch in share " + idx.toString());
        }
        threshold = tInt;
        integrity = i;
        points.push(PointInFiniteField.fromString(`${x}.${y}`));
      }
      assertKeyShareCollection(points, threshold, integrity);
      return new _KeyShares(points, threshold, integrity);
    }
    toBackupFormat() {
      assertKeyShareCollection(this.points, this.threshold, this.integrity);
      const result = [];
      for (let index = 0; index < this.points.length; index++) {
        if (!Object.prototype.hasOwnProperty.call(this.points, index))
          throw new TypeError("shares must be a dense array");
        const point = this.points[index];
        if (!(point instanceof PointInFiniteField))
          throw new TypeError("shares must contain finite-field points");
        const serialized = point.toString();
        if (PointInFiniteField.fromString(serialized).toString() !== serialized) {
          throw new TypeError("shares must contain canonical finite-field points");
        }
        result.push(`${serialized}.${this.threshold.toString()}.${this.integrity}`);
      }
      return result;
    }
  };
  var PrivateKey = class _PrivateKey extends BigNumber {
    /**
     * Generates a private key randomly.
     *
     * @method fromRandom
     * @static
     * @returns The newly generated Private Key.
     *
     * @example
     * const privateKey = PrivateKey.fromRandom();
     */
    static fromRandom() {
      return new _PrivateKey(Random_default(32));
    }
    /**
     * Generates a private key from a string.
     *
     * @method fromString
     * @static
     * @param str - The string to generate the private key from.
     * @param base - The base of the string.
     * @returns The generated Private Key.
     * @throws Will throw an error if the string is not valid.
     **/
    static fromString(str, base = "hex") {
      return new _PrivateKey(super.fromString(str, base).toArray());
    }
    /**
     * Generates a private key from a hexadecimal string.
     *
     * @method fromHex
     * @static
     * @param {string} str - The hexadecimal string representing the private key. The string must represent a valid private key in big-endian format.
     * @returns {PrivateKey} The generated Private Key instance.
     * @throws {Error} If the string is not a valid hexadecimal or represents an invalid private key.
     **/
    static fromHex(str) {
      return new _PrivateKey(super.fromHex(str, "big"));
    }
    /**
     * Generates a private key from a WIF (Wallet Import Format) string.
     *
     * @method fromWif
     * @static
     * @param wif - The WIF string to generate the private key from.
     * @param base - The base of the string.
     * @returns The generated Private Key.
     * @throws Will throw an error if the string is not a valid WIF.
     **/
    static fromWif(wif, prefixLength = 1) {
      const decoded = fromBase58Check(wif, void 0, prefixLength);
      if (decoded.data.length !== 33) {
        throw new Error("Invalid WIF length");
      }
      if (decoded.data[32] !== 1) {
        throw new Error("Invalid WIF padding");
      }
      return new _PrivateKey(decoded.data.slice(0, 32));
    }
    /**
     * @constructor
     *
     * @param number - The number (various types accepted) to construct a BigNumber from. Default is 0.
     *
     * @param base - The base of number provided. By default is 10. Ignored if number is BigNumber.
     *
     * @param endian - The endianness provided. By default is 'big endian'. Ignored if number is BigNumber.
     *
     * @param modN - Optional. Default 'apply. If 'apply', apply modN to input to guarantee a valid PrivateKey. If 'error', if input is out of field throw new Error('Input is out of field'). If 'nocheck', assumes input is in field.
     *
     * @example
     * import PrivateKey from './PrivateKey';
     * import BigNumber from './BigNumber';
     * const privKey = new PrivateKey(new BigNumber('123456', 10, 'be'));
     */
    constructor(number = 0, base = 10, endian = "be", modN2 = "apply") {
      if (number instanceof BigNumber) {
        super();
        number.copy(this);
      } else {
        super(number, base, endian);
      }
      if (modN2 !== "nocheck") {
        const check = this.checkInField();
        if (!check.inField) {
          if (modN2 === "error") {
            throw new Error("Input is out of field");
          }
          BigNumber.move(this, check.modN);
        }
      }
    }
    /**
     * A utility function to check that the value of this PrivateKey lies in the field limited by curve.n
     * @returns { inField, modN } where modN is this PrivateKey's current BigNumber value mod curve.n, and inField is true only if modN equals current BigNumber value.
     */
    checkInField() {
      const curve2 = new Curve();
      const modN2 = this.mod(curve2.n);
      const inField = this.cmp(modN2) === 0;
      return { inField, modN: modN2 };
    }
    /**
     * @returns true if the PrivateKey's current BigNumber value lies in the field limited by curve.n
     */
    isValid() {
      return this.checkInField().inField;
    }
    /**
     * Signs a message using the private key.
     *
     * @method sign
     * @param msg - The message (array of numbers or string) to be signed.
     * @param enc - If 'hex' the string will be treated as hex, utf8 otherwise.
     * @param forceLowS - If true (the default), the signature will be forced to have a low S value.
     * @param customK — If provided, uses a custom K-value for the signature. Provie a function that returns a BigNumber, or the BigNumber itself.
     * @returns A digital signature generated from the hash of the message and the private key.
     *
     * @example
     * const privateKey = PrivateKey.fromRandom();
     * const signature = privateKey.sign('Hello, World!');
     */
    sign(msg, enc, forceLowS = true, customK) {
      const msgHash = new BigNumber(sha2562(msg, enc), 16);
      return sign(msgHash, this, forceLowS, customK);
    }
    /**
     * Verifies a message's signature using the public key associated with this private key.
     *
     * @method verify
     * @param msg - The original message which has been signed.
     * @param sig - The signature to be verified.
     * @param enc - The data encoding method.
     * @returns Whether or not the signature is valid.
     *
     * @example
     * const privateKey = PrivateKey.fromRandom();
     * const signature = privateKey.sign('Hello, World!');
     * const isSignatureValid = privateKey.verify('Hello, World!', signature);
     */
    verify(msg, sig, enc) {
      const msgHash = new BigNumber(sha2562(msg, enc), 16);
      return verify(msgHash, sig, this.toPublicKey());
    }
    /**
     * Converts the private key to its corresponding public key.
     *
     * The public key is generated by multiplying the base point G of the curve and the private key.
     *
     * @method toPublicKey
     * @returns The generated PublicKey.
     *
     * @example
     * const privateKey = PrivateKey.fromRandom();
     * const publicKey = privateKey.toPublicKey();
     */
    toPublicKey() {
      const c = new Curve();
      const p = c.g.mulCT(this);
      return new PublicKey(p.x, p.y);
    }
    /**
     * Converts the private key to a Wallet Import Format (WIF) string.
     *
     * Base58Check encoding is used for encoding the private key.
     * The prefix
     *
     * @method toWif
     * @returns The WIF string.
     *
     * @param prefix defaults to [0x80] for mainnet, set it to [0xef] for testnet.
     *
     * @throws Error('Value is out of field') if current BigNumber value is out of field limited by curve.n
     *
     * @example
     * const privateKey = PrivateKey.fromRandom();
     * const wif = privateKey.toWif();
     * const testnetWif = privateKey.toWif([0xef]);
     */
    toWif(prefix2 = [128]) {
      if (!this.isValid()) {
        throw new Error("Value is out of field");
      }
      return toBase58Check([...this.toArray("be", 32), 1], prefix2);
    }
    /**
     * Base58Check encodes the hash of the public key associated with this private key with a prefix to indicate locking script type.
     * Defaults to P2PKH for mainnet, otherwise known as a "Bitcoin Address".
     *
     * @param prefix defaults to [0x00] for mainnet, set to [0x6f] for testnet or use the strings 'testnet' or 'mainnet'
     *
     * @returns Returns the address encoding associated with the hash of the public key associated with this private key.
     *
     * @example
     * const address = privkey.toAddress()
     * const address = privkey.toAddress('mainnet')
     * const testnetAddress = privkey.toAddress([0x6f])
     * const testnetAddress = privkey.toAddress('testnet')
     */
    toAddress(prefix2 = [0]) {
      return this.toPublicKey().toAddress(prefix2);
    }
    /**
     * Converts this PrivateKey to a hexadecimal string.
     *
     * @method toHex
     * @param length - The minimum length of the hex string
     * @returns Returns a string representing the hexadecimal value of this BigNumber.
     *
     * @example
     * const bigNumber = new BigNumber(255);
     * const hex = bigNumber.toHex();
     */
    toHex() {
      return super.toHex(32);
    }
    /**
     * Converts this PrivateKey to a string representation.
     *
     * @method toString
     * @param {number | 'hex'} [base='hex'] - The base for representing the number. Default is hexadecimal ('hex').
     * @param {number} [padding=64] - The minimum number of digits for the output string. Default is 64, ensuring a 256-bit representation in hexadecimal.
     * @returns {string} A string representation of the PrivateKey in the specified base, padded to the specified length.
     *
     **/
    toString(base = "hex", padding = 64) {
      return super.toString(base, padding);
    }
    /**
     * Derives a shared secret from the public key.
     *
     * @method deriveSharedSecret
     * @param key - The public key to derive the shared secret from.
     * @returns The derived shared secret (a point on the curve).
     * @throws Will throw an error if the public key is not valid.
     *
     * @example
     * const privateKey = PrivateKey.fromRandom();
     * const publicKey = privateKey.toPublicKey();
     * const sharedSecret = privateKey.deriveSharedSecret(publicKey);
     */
    deriveSharedSecret(key) {
      if (!key.validate()) {
        throw new Error("Public key not valid for ECDH secret derivation");
      }
      return key.mulCT(this);
    }
    /**
     * SECURITY NOTE – DETERMINISTIC CHILD KEY DERIVATION
     *
     * This method derives child private keys deterministically from the caller’s
     * long-term private key, the counterparty’s public key, and a caller-supplied
     * invoice number using HMAC over an ECDH shared secret (BRC-42 style derivation).
     *
     * This construction does NOT implement a formally authenticated key exchange
     * (AKE) and does NOT provide the following security properties:
     *
     *  - Forward secrecy: Compromise of a long-term private key compromises all
     *    past and future child keys derived from it.
     *  - Replay protection: Child keys are deterministic for a given invoice
     *    number and key pair; previously observed messages can be replayed.
     *  - Explicit authentication / identity binding: Possession of a public key
     *    alone does not guarantee the intended peer identity, enabling potential
     *    identity misbinding attacks if higher-level identity verification is absent.
     *
     * This derivation is intended for lightweight, deterministic key hierarchies
     * where both parties already possess and trust each other’s long-term public
     * keys. It SHOULD NOT be used as a drop-in replacement for a standard
     * authenticated key exchange (e.g. X3DH, Noise, or SIGMA) in high-security or
     * high-value contexts.
     *
     * Any future protocol providing forward secrecy, replay protection, or strong
     * peer authentication will require a versioned, breaking change.
     */
    /**
     * Derives a child key with BRC-42.
     * @param publicKey The public key of the other party
     * @param invoiceNumber The invoice number used to derive the child key
     * @param cacheSharedSecret Optional function to cache shared secrets
     * @param retrieveCachedSharedSecret Optional function to retrieve shared secrets from the cache
     * @returns The derived child key.
     */
    deriveChild(publicKey, invoiceNumber, cacheSharedSecret, retrieveCachedSharedSecret) {
      let sharedSecret;
      if (typeof retrieveCachedSharedSecret === "function") {
        const retrieved = retrieveCachedSharedSecret(this, publicKey);
        if (retrieved === void 0) {
          sharedSecret = this.deriveSharedSecret(publicKey);
          if (typeof cacheSharedSecret === "function") {
            cacheSharedSecret(this, publicKey, sharedSecret);
          }
        } else {
          sharedSecret = retrieved;
        }
      } else {
        sharedSecret = this.deriveSharedSecret(publicKey);
      }
      const invoiceNumberBin = toArray2(invoiceNumber, "utf8");
      const hmac3 = sha256hmac(sharedSecret.encode(true), invoiceNumberBin);
      const curve2 = new Curve();
      return new _PrivateKey(this.add(new BigNumber(hmac3)).mod(curve2.n).toArray());
    }
    /**
     * Splits the private key into shares using Shamir's Secret Sharing Scheme.
     *
     * @param threshold The minimum number of shares required to reconstruct the private key.
     * @param totalShares The total number of shares to generate.
     * Both values must be safe integers from 2 through 255.
     * @param prime The prime number to be used in Shamir's Secret Sharing Scheme.
     * @returns An array of shares.
     *
     * @example
     * const key = PrivateKey.fromRandom()
     * const shares = key.toKeyShares(2, 5)
     */
    toKeyShares(threshold, totalShares) {
      if (typeof threshold !== "number" || typeof totalShares !== "number") {
        throw new TypeError("threshold and totalShares must be numbers");
      }
      if (!Number.isSafeInteger(threshold) || !Number.isSafeInteger(totalShares)) {
        throw new TypeError("threshold and totalShares must be safe integers");
      }
      if (threshold < 2)
        throw new Error("threshold must be at least 2");
      if (totalShares < 2)
        throw new Error("totalShares must be at least 2");
      if (threshold > totalShares) {
        throw new Error("threshold should be less than or equal to totalShares");
      }
      if (threshold > MAX_SHAMIR_SHARES || totalShares > MAX_SHAMIR_SHARES) {
        throw new RangeError(`threshold and totalShares cannot exceed ${MAX_SHAMIR_SHARES}`);
      }
      const poly = Polynomial.fromPrivateKey(this, threshold);
      const points = [];
      const usedXCoordinates = /* @__PURE__ */ new Set();
      const curve2 = new Curve();
      const seed = Random_default(64);
      for (let i = 0; i < totalShares; i++) {
        let x;
        let attempts = 0;
        do {
          const counter = [i, attempts, ...Random_default(32)];
          const h = sha512hmac(seed, counter);
          x = new BigNumber(h).umod(curve2.p);
          attempts++;
          if (attempts > 5) {
            throw new Error("Failed to generate unique x coordinate after 5 attempts");
          }
        } while (x.isZero() || usedXCoordinates.has(x.toString()));
        usedXCoordinates.add(x.toString());
        const y = poly.valueAt(x);
        points.push(new PointInFiniteField(x, y));
      }
      const integrity = this.toPublicKey().toHash("hex").slice(0, 8);
      return new KeyShares(points, threshold, integrity);
    }
    /**
     * @method toBackupShares
     *
     * Creates a backup of the private key by splitting it into shares.
     *
     *
     * @param threshold The number of shares which will be required to reconstruct the private key.
     * @param totalShares The number of shares to generate for distribution.
     * Both values must be safe integers from 2 through 255.
     * @returns
     */
    toBackupShares(threshold, totalShares) {
      return this.toKeyShares(threshold, totalShares).toBackupFormat();
    }
    /**
     *
     * @method fromBackupShares
     *
     * Creates a private key from backup shares.
     *
     * @param shares
     * @returns PrivateKey
     *
     * @example
     *
     * const share1 = '3znuzt7DZp8HzZTfTh5MF9YQKNX3oSxTbSYmSRGrH2ev.2Nm17qoocmoAhBTCs8TEBxNXCskV9N41rB2PckcgYeqV.2.35449bb9'
     * const share2 = 'Cm5fuUc39X5xgdedao8Pr1kvCSm8Gk7Cfenc7xUKcfLX.2juyK9BxCWn2DiY5JUAgj9NsQ77cc9bWksFyW45haXZm.2.35449bb9'
     *
     * const recoveredKey = PrivateKey.fromBackupShares([share1, share2])
     */
    static fromBackupShares(shares) {
      return _PrivateKey.fromKeyShares(KeyShares.fromBackupFormat(shares));
    }
    /**
     * Combines shares to reconstruct the private key.
     *
     * @param shares An array of points (shares) to be used to reconstruct the private key.
     * @param threshold The minimum number of shares required to reconstruct the private key.
     *
     * @returns The reconstructed private key.
     *
     **/
    static fromKeyShares(keyShares) {
      if (keyShares === null || typeof keyShares !== "object")
        throw new TypeError("keyShares must be an object");
      const points = keyShares.points;
      const threshold = keyShares.threshold;
      const integrity = keyShares.integrity;
      assertKeyShareCollection(points, threshold, integrity);
      if (points.length < threshold) {
        throw new Error(`At least ${threshold} shares are required to reconstruct the private key`);
      }
      const ownedPoints = [];
      const P = new Curve().p;
      for (let index = 0; index < threshold; index++) {
        if (!Object.prototype.hasOwnProperty.call(points, index))
          throw new TypeError("shares must be a dense array");
        const point = points[index];
        if (!(point instanceof PointInFiniteField) || !(point.x instanceof BigNumber) || !(point.y instanceof BigNumber)) {
          throw new TypeError("shares must contain finite-field points");
        }
        if (point.x.isNeg() || point.y.isNeg() || point.x.gte(P) || point.y.gte(P)) {
          throw new TypeError("share coordinates must be canonical field elements");
        }
        ownedPoints.push(new PointInFiniteField(new BigNumber(point.x.toArray()), new BigNumber(point.y.toArray())));
      }
      for (let i = 0; i < threshold; i++) {
        for (let j = i + 1; j < threshold; j++) {
          if (ownedPoints[i].x.eq(ownedPoints[j].x)) {
            throw new Error("Duplicate share detected, each must be unique.");
          }
        }
      }
      const poly = new Polynomial(ownedPoints, threshold);
      const privateKey = new _PrivateKey(poly.valueAt(new BigNumber(0)).toArray());
      const integrityHash = privateKey.toPublicKey().toHash("hex").slice(0, 8);
      if (integrityHash !== integrity) {
        throw new Error("Integrity hash mismatch");
      }
      return privateKey;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/compat/BSM.js
  var BSM_exports = {};
  __export(BSM_exports, {
    magicHash: () => magicHash,
    sign: () => sign2,
    verify: () => verify2
  });

  // node_modules/@bsv/sdk/dist/esm/src/compat/CompatValidation.js
  var MAX_COMPAT_BYTE_PAYLOAD = 16 * 1024 * 1024;
  function compatBytes(value, label, minimum = 0, maximum = MAX_COMPAT_BYTE_PAYLOAD) {
    if (!Array.isArray(value) && !(value instanceof Uint8Array) || value.length < minimum || value.length > maximum) {
      throw new TypeError(`${label} must be a bounded dense byte array`);
    }
    if (value instanceof Uint8Array)
      return Array.from(value);
    const copy = Array.from({ length: value.length }, () => 0);
    for (let index = 0; index < value.length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (descriptor == null || !("value" in descriptor) || typeof descriptor.value !== "number" || !Number.isInteger(descriptor.value) || descriptor.value < 0 || descriptor.value > 255) {
        throw new TypeError(`${label} must be a bounded dense byte array`);
      }
      copy[index] = descriptor.value;
    }
    return copy;
  }
  function compatString(value, label, maximum) {
    if (typeof value !== "string" || value.length > maximum) {
      throw new TypeError(`${label} must be a bounded string`);
    }
    return value;
  }
  function uint32(value, label) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > 4294967295) {
      throw new TypeError(`${label} must be a uint32`);
    }
    return value;
  }

  // node_modules/@bsv/sdk/dist/esm/src/compat/BSM.js
  var prefix = "Bitcoin Signed Message:\n";
  var computeMagicHash = (messageBuf) => {
    messageBuf = compatBytes(messageBuf, "BSM message");
    const bw = new Writer();
    bw.writeVarIntNum(prefix.length);
    bw.write(toArray2(prefix, "utf8"));
    bw.writeVarIntNum(messageBuf.length);
    bw.write(messageBuf);
    const buf = bw.toArray();
    const hashBuf = hash256(buf);
    return hashBuf;
  };
  var magicHash = (messageBuf) => computeMagicHash(messageBuf);
  var sign2 = (message, privateKey, mode = "base64") => {
    if (mode !== "raw" && mode !== "base64") {
      throw new TypeError("BSM signature mode must be raw or base64");
    }
    const hashBuf = computeMagicHash(message);
    const sig = sign(new BigNumber(hashBuf), privateKey, true);
    if (mode === "raw") {
      return sig;
    }
    const h = new BigNumber(hashBuf);
    const r2 = sig.CalculateRecoveryFactor(privateKey.toPublicKey(), h);
    return sig.toCompact(r2, true, "base64");
  };
  var verify2 = (message, sig, pubKey) => {
    const hashBuf = computeMagicHash(message);
    return verify(new BigNumber(hashBuf), sig, pubKey) === true;
  };

  // node_modules/@bsv/sdk/dist/esm/src/compat/HD.js
  var MAX_DERIVATION_PATH_LENGTH = 4096;
  var HD = class _HD {
    /**
     * Constructor for the BIP32 HD wallet.
     * Initializes an HD wallet with optional parameters for version bytes, depth, parent fingerprint, child index, chain code, private key, and public key.
     * @param versionBytesNum - Version bytes number for the wallet.
     * @param depth - Depth of the key in the hierarchy.
     * @param parentFingerPrint - Fingerprint of the parent key.
     * @param childIndex - Index of the child key.
     * @param chainCode - Chain code for key derivation.
     * @param privKey - Private key of the wallet.
     * @param pubKey - Public key of the wallet.
     */
    constructor(versionBytesNum, depth, parentFingerPrint, childIndex, chainCode, privKey, pubKey) {
      __publicField(this, "versionBytesNum");
      __publicField(this, "depth");
      __publicField(this, "parentFingerPrint");
      __publicField(this, "childIndex");
      __publicField(this, "chainCode");
      __publicField(this, "privKey");
      __publicField(this, "pubKey");
      __publicField(this, "constants", {
        pubKey: 76067358,
        privKey: 76066276
      });
      this.versionBytesNum = versionBytesNum;
      this.depth = depth;
      this.parentFingerPrint = parentFingerPrint;
      this.childIndex = childIndex;
      this.chainCode = chainCode;
      this.privKey = privKey;
      this.pubKey = pubKey;
    }
    /**
     * Generates a new HD wallet with random keys.
     * This method creates a root HD wallet with randomly generated private and public keys.
     * @returns {HD} The current HD instance with generated keys.
     */
    fromRandom() {
      this.versionBytesNum = this.constants.privKey;
      this.depth = 0;
      this.parentFingerPrint = [0, 0, 0, 0];
      this.childIndex = 0;
      this.chainCode = Random_default(32);
      this.privKey = PrivateKey.fromRandom();
      this.pubKey = this.privKey.toPublicKey();
      return this;
    }
    /**
     * Generates a new HD wallet with random keys.
     * This method creates a root HD wallet with randomly generated private and public keys.
     * @returns {HD} A new HD instance with generated keys.
     * @static
     */
    static fromRandom() {
      return new this().fromRandom();
    }
    /**
     * Initializes the HD wallet from a given base58 encoded string.
     * This method decodes a provided string to set up the HD wallet's properties.
     * @param str - A base58 encoded string representing the wallet.
     * @returns {HD} The new instance with properties set from the string.
     */
    static fromString(str) {
      return new this().fromString(str);
    }
    /**
     * Initializes the HD wallet from a given base58 encoded string.
     * This method decodes a provided string to set up the HD wallet's properties.
     * @param str - A base58 encoded string representing the wallet.
     * @returns {HD} The current instance with properties set from the string.
     */
    fromString(str) {
      str = compatString(str, "BIP32 extended key", 256);
      if (str.length === 0)
        throw new TypeError("BIP32 extended key must not be empty");
      const decoded = fromBase58Check(str);
      return this.fromBinary([...decoded.prefix, ...decoded.data]);
    }
    /**
     * Initializes the HD wallet from a seed.
     * This method generates keys and other properties from a given seed, conforming to the BIP32 specification.
     * @param bytes - An array of bytes representing the seed.
     * @returns {HD} The current instance with properties set from the seed.
     */
    static fromSeed(bytes2) {
      return new this().fromSeed(bytes2);
    }
    /**
     * Initializes the HD wallet from a seed.
     * This method generates keys and other properties from a given seed, conforming to the BIP32 specification.
     * @param bytes - An array of bytes representing the seed.
     * @returns {HD} The current instance with properties set from the seed.
     */
    fromSeed(bytes2) {
      bytes2 = compatBytes(bytes2, "BIP32 seed", 16, 64);
      if (bytes2.length < 128 / 8) {
        throw new Error("Need more than 128 bits of entropy");
      }
      if (bytes2.length > 512 / 8) {
        throw new Error("More than 512 bits of entropy is nonstandard");
      }
      const hash = sha512hmac(toArray2("Bitcoin seed", "utf8"), bytes2);
      this.depth = 0;
      this.parentFingerPrint = [0, 0, 0, 0];
      this.childIndex = 0;
      this.chainCode = hash.slice(32, 64);
      this.versionBytesNum = this.constants.privKey;
      const master = new BigNumber(hash.slice(0, 32));
      if (master.isZero() || master.gte(new Curve().n)) {
        throw new Error("Invalid BIP32 master key");
      }
      this.privKey = new PrivateKey(master);
      this.pubKey = this.privKey.toPublicKey();
      return this;
    }
    /**
     * Initializes the HD wallet from a binary buffer.
     * Parses a binary buffer to set up the wallet's properties.
     * @param buf - A buffer containing the wallet data.
     * @returns {HD} The new instance with properties set from the buffer.
     */
    static fromBinary(buf) {
      return new this().fromBinary(buf);
    }
    /**
     * Initializes the HD wallet from a binary buffer.
     * Parses a binary buffer to set up the wallet's properties.
     * @param buf - A buffer containing the wallet data.
     * @returns {HD} The current instance with properties set from the buffer.
     */
    fromBinary(buf) {
      buf = compatBytes(buf, "BIP32 data", 78, 78);
      const reader = new Reader(buf);
      const versionBytesNum = reader.readUInt32BE();
      const depth = reader.readUInt8();
      const parentFingerPrint = reader.read(4);
      const childIndex = reader.readUInt32BE();
      const chainCode = reader.read(32);
      const keyBytes = reader.read(33);
      const isPrivate = versionBytesNum === this.constants.privKey;
      const isPublic = versionBytesNum === this.constants.pubKey;
      let privKey;
      let pubKey;
      if (isPrivate && keyBytes[0] === 0) {
        const privateKey = new BigNumber(keyBytes.slice(1, 33));
        if (privateKey.isZero() || privateKey.gte(new Curve().n)) {
          throw new Error("Invalid key");
        }
        privKey = new PrivateKey(privateKey);
        pubKey = privKey.toPublicKey();
      } else if (isPublic && (keyBytes[0] === 2 || keyBytes[0] === 3)) {
        pubKey = PublicKey.fromString(toHex(keyBytes));
      } else {
        throw new Error("Invalid key");
      }
      if (depth === 0 && (childIndex !== 0 || parentFingerPrint.some((byte) => byte !== 0))) {
        throw new Error("Invalid BIP32 root metadata");
      }
      this.versionBytesNum = versionBytesNum;
      this.depth = depth;
      this.parentFingerPrint = parentFingerPrint;
      this.childIndex = childIndex;
      this.chainCode = chainCode;
      this.privKey = privKey;
      this.pubKey = pubKey;
      return this;
    }
    /**
     * Converts the HD wallet to a base58 encoded string.
     * This method provides a string representation of the HD wallet's current state.
     * @returns {string} A base58 encoded string of the HD wallet.
     */
    toString() {
      const bin = this.toBinary();
      return toBase58Check(bin, []);
    }
    /**
     * Derives a child HD wallet based on a given path.
     * The path specifies the hierarchy of the child key to be derived.
     * @param path - A string representing the derivation path (e.g., 'm/0'/1).
     * @returns {HD} A new HD instance representing the derived child wallet.
     */
    derive(path) {
      path = compatString(path, "BIP32 derivation path", MAX_DERIVATION_PATH_LENGTH);
      if (path === "m") {
        return this;
      }
      const e = path.split("/");
      if (e.length - 1 > 255 - this.depth) {
        throw new Error("BIP32 derivation depth exceeds 255");
      }
      let bip32;
      for (const [i, c] of e.entries()) {
        if (i === 0) {
          if (c !== "m") {
            throw new Error("invalid path");
          }
          continue;
        }
        const childMatch = /^(\d+)('?)$/.exec(c);
        if (childMatch === null) {
          throw new Error("invalid path");
        }
        const childIndexValue = Number.parseInt(childMatch[1], 10);
        if (childIndexValue > 2147483647) {
          throw new Error("invalid path");
        }
        const usePrivate = childMatch[2] === "'";
        let childIndex = childIndexValue;
        if (usePrivate) {
          childIndex += 2147483648;
        }
        bip32 = (bip32 ?? this).deriveChild(childIndex);
      }
      return bip32 ?? this;
    }
    /**
     * Derives a child HD wallet from the current wallet based on an index.
     * This method generates either a private or public child key depending on the current wallet's state.
     * @param i - The index of the child key to derive.
     * @returns {HD} A new HD instance representing the derived child wallet.
     */
    deriveChild(i) {
      i = uint32(i, "BIP32 child index");
      if (!Number.isSafeInteger(this.depth) || this.depth < 0 || this.depth >= 255) {
        throw new Error("BIP32 derivation depth exceeds 255");
      }
      const chainCode = compatBytes(this.chainCode, "BIP32 chain code", 32, 32);
      const ibc = [i >> 24 & 255, i >> 16 & 255, i >> 8 & 255, i & 255];
      const ib = [...ibc];
      const usePrivate = (i & 2147483648) !== 0;
      const isPrivate = this.versionBytesNum === this.constants.privKey;
      if (usePrivate && (this.privKey === null || this.privKey === void 0 || !isPrivate)) {
        throw new Error("Cannot do private key derivation without private key");
      }
      let ret = null;
      if (this.privKey !== null && this.privKey !== void 0) {
        let data = null;
        if (usePrivate) {
          data = [0, ...this.privKey.toArray("be", 32), ...ib];
        } else {
          data = [...this.pubKey.encode(true), ...ib];
        }
        const hash = sha512hmac(chainCode, data);
        const il = new BigNumber(hash.slice(0, 32));
        const ir = hash.slice(32, 64);
        const curve2 = new Curve();
        if (il.gte(curve2.n))
          throw new Error("Invalid BIP32 child derivation");
        const k = il.add(this.privKey).mod(curve2.n);
        if (k.isZero())
          throw new Error("Invalid BIP32 child derivation");
        ret = new _HD();
        ret.chainCode = ir;
        ret.privKey = new PrivateKey(k.toArray());
        ret.pubKey = ret.privKey.toPublicKey();
      } else {
        const data = [...this.pubKey.encode(true), ...ib];
        const hash = sha512hmac(chainCode, data);
        const il = new BigNumber(hash.slice(0, 32));
        const ir = hash.slice(32, 64);
        const curve2 = new Curve();
        if (il.gte(curve2.n))
          throw new Error("Invalid BIP32 child derivation");
        const ilG = curve2.g.mul(il);
        const Kpar = this.pubKey;
        const Ki = ilG.add(Kpar);
        if (Ki.isInfinity())
          throw new Error("Invalid BIP32 child derivation");
        const newpub = new PublicKey(Ki.x, Ki.y);
        ret = new _HD();
        ret.chainCode = ir;
        ret.pubKey = newpub;
      }
      ret.childIndex = i;
      const pubKeyhash = hash1602(this.pubKey.encode(true));
      ret.parentFingerPrint = pubKeyhash.slice(0, 4);
      ret.versionBytesNum = this.versionBytesNum;
      ret.depth = this.depth + 1;
      return ret;
    }
    /**
     * Converts the current HD wallet to a public-only wallet.
     * This method strips away the private key information, leaving only the public part.
     * @returns {HD} A new HD instance representing the public-only wallet.
     */
    toPublic() {
      const bip32 = new _HD(this.versionBytesNum, this.depth, compatBytes(this.parentFingerPrint, "BIP32 parent fingerprint", 4, 4), this.childIndex, compatBytes(this.chainCode, "BIP32 chain code", 32, 32), void 0, PublicKey.fromString(this.pubKey.toString()));
      bip32.versionBytesNum = this.constants.pubKey;
      bip32.privKey = void 0;
      return bip32;
    }
    /**
     * Converts the HD wallet into a binary representation.
     * This method serializes the wallet's properties into a binary format.
     * @returns {number[]} An array of numbers representing the binary data of the wallet.
     */
    toBinary() {
      if (!Number.isSafeInteger(this.depth) || this.depth < 0 || this.depth > 255) {
        throw new TypeError("BIP32 depth must be a uint8");
      }
      const parentFingerPrint = compatBytes(this.parentFingerPrint, "BIP32 parent fingerprint", 4, 4);
      const childIndex = uint32(this.childIndex, "BIP32 child index");
      const chainCode = compatBytes(this.chainCode, "BIP32 chain code", 32, 32);
      const isPrivate = this.versionBytesNum === this.constants.privKey;
      const isPublic = this.versionBytesNum === this.constants.pubKey;
      if (isPrivate) {
        return new Writer().writeUInt32BE(this.versionBytesNum).writeUInt8(this.depth).write(parentFingerPrint).writeUInt32BE(childIndex).write(chainCode).writeUInt8(0).write(this.privKey.toArray("be", 32)).toArray();
      } else if (isPublic) {
        return new Writer().writeUInt32BE(this.versionBytesNum).writeUInt8(this.depth).write(parentFingerPrint).writeUInt32BE(childIndex).write(chainCode).write(this.pubKey.encode(true)).toArray();
      } else {
        throw new Error("bip32: invalid versionBytesNum byte");
      }
    }
    /**
     * Checks if the HD wallet contains a private key.
     * This method determines whether the wallet is a private key wallet or a public key only wallet.
     * @returns {boolean} A boolean value indicating whether the wallet has a private key (true) or not (false).
     */
    isPrivate() {
      return this.versionBytesNum === this.constants.privKey;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/compat/bip-39-wordlist-en.js
  var wordList = {
    value: [
      "abandon",
      "ability",
      "able",
      "about",
      "above",
      "absent",
      "absorb",
      "abstract",
      "absurd",
      "abuse",
      "access",
      "accident",
      "account",
      "accuse",
      "achieve",
      "acid",
      "acoustic",
      "acquire",
      "across",
      "act",
      "action",
      "actor",
      "actress",
      "actual",
      "adapt",
      "add",
      "addict",
      "address",
      "adjust",
      "admit",
      "adult",
      "advance",
      "advice",
      "aerobic",
      "affair",
      "afford",
      "afraid",
      "again",
      "age",
      "agent",
      "agree",
      "ahead",
      "aim",
      "air",
      "airport",
      "aisle",
      "alarm",
      "album",
      "alcohol",
      "alert",
      "alien",
      "all",
      "alley",
      "allow",
      "almost",
      "alone",
      "alpha",
      "already",
      "also",
      "alter",
      "always",
      "amateur",
      "amazing",
      "among",
      "amount",
      "amused",
      "analyst",
      "anchor",
      "ancient",
      "anger",
      "angle",
      "angry",
      "animal",
      "ankle",
      "announce",
      "annual",
      "another",
      "answer",
      "antenna",
      "antique",
      "anxiety",
      "any",
      "apart",
      "apology",
      "appear",
      "apple",
      "approve",
      "april",
      "arch",
      "arctic",
      "area",
      "arena",
      "argue",
      "arm",
      "armed",
      "armor",
      "army",
      "around",
      "arrange",
      "arrest",
      "arrive",
      "arrow",
      "art",
      "artefact",
      "artist",
      "artwork",
      "ask",
      "aspect",
      "assault",
      "asset",
      "assist",
      "assume",
      "asthma",
      "athlete",
      "atom",
      "attack",
      "attend",
      "attitude",
      "attract",
      "auction",
      "audit",
      "august",
      "aunt",
      "author",
      "auto",
      "autumn",
      "average",
      "avocado",
      "avoid",
      "awake",
      "aware",
      "away",
      "awesome",
      "awful",
      "awkward",
      "axis",
      "baby",
      "bachelor",
      "bacon",
      "badge",
      "bag",
      "balance",
      "balcony",
      "ball",
      "bamboo",
      "banana",
      "banner",
      "bar",
      "barely",
      "bargain",
      "barrel",
      "base",
      "basic",
      "basket",
      "battle",
      "beach",
      "bean",
      "beauty",
      "because",
      "become",
      "beef",
      "before",
      "begin",
      "behave",
      "behind",
      "believe",
      "below",
      "belt",
      "bench",
      "benefit",
      "best",
      "betray",
      "better",
      "between",
      "beyond",
      "bicycle",
      "bid",
      "bike",
      "bind",
      "biology",
      "bird",
      "birth",
      "bitter",
      "black",
      "blade",
      "blame",
      "blanket",
      "blast",
      "bleak",
      "bless",
      "blind",
      "blood",
      "blossom",
      "blouse",
      "blue",
      "blur",
      "blush",
      "board",
      "boat",
      "body",
      "boil",
      "bomb",
      "bone",
      "bonus",
      "book",
      "boost",
      "border",
      "boring",
      "borrow",
      "boss",
      "bottom",
      "bounce",
      "box",
      "boy",
      "bracket",
      "brain",
      "brand",
      "brass",
      "brave",
      "bread",
      "breeze",
      "brick",
      "bridge",
      "brief",
      "bright",
      "bring",
      "brisk",
      "broccoli",
      "broken",
      "bronze",
      "broom",
      "brother",
      "brown",
      "brush",
      "bubble",
      "buddy",
      "budget",
      "buffalo",
      "build",
      "bulb",
      "bulk",
      "bullet",
      "bundle",
      "bunker",
      "burden",
      "burger",
      "burst",
      "bus",
      "business",
      "busy",
      "butter",
      "buyer",
      "buzz",
      "cabbage",
      "cabin",
      "cable",
      "cactus",
      "cage",
      "cake",
      "call",
      "calm",
      "camera",
      "camp",
      "can",
      "canal",
      "cancel",
      "candy",
      "cannon",
      "canoe",
      "canvas",
      "canyon",
      "capable",
      "capital",
      "captain",
      "car",
      "carbon",
      "card",
      "cargo",
      "carpet",
      "carry",
      "cart",
      "case",
      "cash",
      "casino",
      "castle",
      "casual",
      "cat",
      "catalog",
      "catch",
      "category",
      "cattle",
      "caught",
      "cause",
      "caution",
      "cave",
      "ceiling",
      "celery",
      "cement",
      "census",
      "century",
      "cereal",
      "certain",
      "chair",
      "chalk",
      "champion",
      "change",
      "chaos",
      "chapter",
      "charge",
      "chase",
      "chat",
      "cheap",
      "check",
      "cheese",
      "chef",
      "cherry",
      "chest",
      "chicken",
      "chief",
      "child",
      "chimney",
      "choice",
      "choose",
      "chronic",
      "chuckle",
      "chunk",
      "churn",
      "cigar",
      "cinnamon",
      "circle",
      "citizen",
      "city",
      "civil",
      "claim",
      "clap",
      "clarify",
      "claw",
      "clay",
      "clean",
      "clerk",
      "clever",
      "click",
      "client",
      "cliff",
      "climb",
      "clinic",
      "clip",
      "clock",
      "clog",
      "close",
      "cloth",
      "cloud",
      "clown",
      "club",
      "clump",
      "cluster",
      "clutch",
      "coach",
      "coast",
      "coconut",
      "code",
      "coffee",
      "coil",
      "coin",
      "collect",
      "color",
      "column",
      "combine",
      "come",
      "comfort",
      "comic",
      "common",
      "company",
      "concert",
      "conduct",
      "confirm",
      "congress",
      "connect",
      "consider",
      "control",
      "convince",
      "cook",
      "cool",
      "copper",
      "copy",
      "coral",
      "core",
      "corn",
      "correct",
      "cost",
      "cotton",
      "couch",
      "country",
      "couple",
      "course",
      "cousin",
      "cover",
      "coyote",
      "crack",
      "cradle",
      "craft",
      "cram",
      "crane",
      "crash",
      "crater",
      "crawl",
      "crazy",
      "cream",
      "credit",
      "creek",
      "crew",
      "cricket",
      "crime",
      "crisp",
      "critic",
      "crop",
      "cross",
      "crouch",
      "crowd",
      "crucial",
      "cruel",
      "cruise",
      "crumble",
      "crunch",
      "crush",
      "cry",
      "crystal",
      "cube",
      "culture",
      "cup",
      "cupboard",
      "curious",
      "current",
      "curtain",
      "curve",
      "cushion",
      "custom",
      "cute",
      "cycle",
      "dad",
      "damage",
      "damp",
      "dance",
      "danger",
      "daring",
      "dash",
      "daughter",
      "dawn",
      "day",
      "deal",
      "debate",
      "debris",
      "decade",
      "december",
      "decide",
      "decline",
      "decorate",
      "decrease",
      "deer",
      "defense",
      "define",
      "defy",
      "degree",
      "delay",
      "deliver",
      "demand",
      "demise",
      "denial",
      "dentist",
      "deny",
      "depart",
      "depend",
      "deposit",
      "depth",
      "deputy",
      "derive",
      "describe",
      "desert",
      "design",
      "desk",
      "despair",
      "destroy",
      "detail",
      "detect",
      "develop",
      "device",
      "devote",
      "diagram",
      "dial",
      "diamond",
      "diary",
      "dice",
      "diesel",
      "diet",
      "differ",
      "digital",
      "dignity",
      "dilemma",
      "dinner",
      "dinosaur",
      "direct",
      "dirt",
      "disagree",
      "discover",
      "disease",
      "dish",
      "dismiss",
      "disorder",
      "display",
      "distance",
      "divert",
      "divide",
      "divorce",
      "dizzy",
      "doctor",
      "document",
      "dog",
      "doll",
      "dolphin",
      "domain",
      "donate",
      "donkey",
      "donor",
      "door",
      "dose",
      "double",
      "dove",
      "draft",
      "dragon",
      "drama",
      "drastic",
      "draw",
      "dream",
      "dress",
      "drift",
      "drill",
      "drink",
      "drip",
      "drive",
      "drop",
      "drum",
      "dry",
      "duck",
      "dumb",
      "dune",
      "during",
      "dust",
      "dutch",
      "duty",
      "dwarf",
      "dynamic",
      "eager",
      "eagle",
      "early",
      "earn",
      "earth",
      "easily",
      "east",
      "easy",
      "echo",
      "ecology",
      "economy",
      "edge",
      "edit",
      "educate",
      "effort",
      "egg",
      "eight",
      "either",
      "elbow",
      "elder",
      "electric",
      "elegant",
      "element",
      "elephant",
      "elevator",
      "elite",
      "else",
      "embark",
      "embody",
      "embrace",
      "emerge",
      "emotion",
      "employ",
      "empower",
      "empty",
      "enable",
      "enact",
      "end",
      "endless",
      "endorse",
      "enemy",
      "energy",
      "enforce",
      "engage",
      "engine",
      "enhance",
      "enjoy",
      "enlist",
      "enough",
      "enrich",
      "enroll",
      "ensure",
      "enter",
      "entire",
      "entry",
      "envelope",
      "episode",
      "equal",
      "equip",
      "era",
      "erase",
      "erode",
      "erosion",
      "error",
      "erupt",
      "escape",
      "essay",
      "essence",
      "estate",
      "eternal",
      "ethics",
      "evidence",
      "evil",
      "evoke",
      "evolve",
      "exact",
      "example",
      "excess",
      "exchange",
      "excite",
      "exclude",
      "excuse",
      "execute",
      "exercise",
      "exhaust",
      "exhibit",
      "exile",
      "exist",
      "exit",
      "exotic",
      "expand",
      "expect",
      "expire",
      "explain",
      "expose",
      "express",
      "extend",
      "extra",
      "eye",
      "eyebrow",
      "fabric",
      "face",
      "faculty",
      "fade",
      "faint",
      "faith",
      "fall",
      "false",
      "fame",
      "family",
      "famous",
      "fan",
      "fancy",
      "fantasy",
      "farm",
      "fashion",
      "fat",
      "fatal",
      "father",
      "fatigue",
      "fault",
      "favorite",
      "feature",
      "february",
      "federal",
      "fee",
      "feed",
      "feel",
      "female",
      "fence",
      "festival",
      "fetch",
      "fever",
      "few",
      "fiber",
      "fiction",
      "field",
      "figure",
      "file",
      "film",
      "filter",
      "final",
      "find",
      "fine",
      "finger",
      "finish",
      "fire",
      "firm",
      "first",
      "fiscal",
      "fish",
      "fit",
      "fitness",
      "fix",
      "flag",
      "flame",
      "flash",
      "flat",
      "flavor",
      "flee",
      "flight",
      "flip",
      "float",
      "flock",
      "floor",
      "flower",
      "fluid",
      "flush",
      "fly",
      "foam",
      "focus",
      "fog",
      "foil",
      "fold",
      "follow",
      "food",
      "foot",
      "force",
      "forest",
      "forget",
      "fork",
      "fortune",
      "forum",
      "forward",
      "fossil",
      "foster",
      "found",
      "fox",
      "fragile",
      "frame",
      "frequent",
      "fresh",
      "friend",
      "fringe",
      "frog",
      "front",
      "frost",
      "frown",
      "frozen",
      "fruit",
      "fuel",
      "fun",
      "funny",
      "furnace",
      "fury",
      "future",
      "gadget",
      "gain",
      "galaxy",
      "gallery",
      "game",
      "gap",
      "garage",
      "garbage",
      "garden",
      "garlic",
      "garment",
      "gas",
      "gasp",
      "gate",
      "gather",
      "gauge",
      "gaze",
      "general",
      "genius",
      "genre",
      "gentle",
      "genuine",
      "gesture",
      "ghost",
      "giant",
      "gift",
      "giggle",
      "ginger",
      "giraffe",
      "girl",
      "give",
      "glad",
      "glance",
      "glare",
      "glass",
      "glide",
      "glimpse",
      "globe",
      "gloom",
      "glory",
      "glove",
      "glow",
      "glue",
      "goat",
      "goddess",
      "gold",
      "good",
      "goose",
      "gorilla",
      "gospel",
      "gossip",
      "govern",
      "gown",
      "grab",
      "grace",
      "grain",
      "grant",
      "grape",
      "grass",
      "gravity",
      "great",
      "green",
      "grid",
      "grief",
      "grit",
      "grocery",
      "group",
      "grow",
      "grunt",
      "guard",
      "guess",
      "guide",
      "guilt",
      "guitar",
      "gun",
      "gym",
      "habit",
      "hair",
      "half",
      "hammer",
      "hamster",
      "hand",
      "happy",
      "harbor",
      "hard",
      "harsh",
      "harvest",
      "hat",
      "have",
      "hawk",
      "hazard",
      "head",
      "health",
      "heart",
      "heavy",
      "hedgehog",
      "height",
      "hello",
      "helmet",
      "help",
      "hen",
      "hero",
      "hidden",
      "high",
      "hill",
      "hint",
      "hip",
      "hire",
      "history",
      "hobby",
      "hockey",
      "hold",
      "hole",
      "holiday",
      "hollow",
      "home",
      "honey",
      "hood",
      "hope",
      "horn",
      "horror",
      "horse",
      "hospital",
      "host",
      "hotel",
      "hour",
      "hover",
      "hub",
      "huge",
      "human",
      "humble",
      "humor",
      "hundred",
      "hungry",
      "hunt",
      "hurdle",
      "hurry",
      "hurt",
      "husband",
      "hybrid",
      "ice",
      "icon",
      "idea",
      "identify",
      "idle",
      "ignore",
      "ill",
      "illegal",
      "illness",
      "image",
      "imitate",
      "immense",
      "immune",
      "impact",
      "impose",
      "improve",
      "impulse",
      "inch",
      "include",
      "income",
      "increase",
      "index",
      "indicate",
      "indoor",
      "industry",
      "infant",
      "inflict",
      "inform",
      "inhale",
      "inherit",
      "initial",
      "inject",
      "injury",
      "inmate",
      "inner",
      "innocent",
      "input",
      "inquiry",
      "insane",
      "insect",
      "inside",
      "inspire",
      "install",
      "intact",
      "interest",
      "into",
      "invest",
      "invite",
      "involve",
      "iron",
      "island",
      "isolate",
      "issue",
      "item",
      "ivory",
      "jacket",
      "jaguar",
      "jar",
      "jazz",
      "jealous",
      "jeans",
      "jelly",
      "jewel",
      "job",
      "join",
      "joke",
      "journey",
      "joy",
      "judge",
      "juice",
      "jump",
      "jungle",
      "junior",
      "junk",
      "just",
      "kangaroo",
      "keen",
      "keep",
      "ketchup",
      "key",
      "kick",
      "kid",
      "kidney",
      "kind",
      "kingdom",
      "kiss",
      "kit",
      "kitchen",
      "kite",
      "kitten",
      "kiwi",
      "knee",
      "knife",
      "knock",
      "know",
      "lab",
      "label",
      "labor",
      "ladder",
      "lady",
      "lake",
      "lamp",
      "language",
      "laptop",
      "large",
      "later",
      "latin",
      "laugh",
      "laundry",
      "lava",
      "law",
      "lawn",
      "lawsuit",
      "layer",
      "lazy",
      "leader",
      "leaf",
      "learn",
      "leave",
      "lecture",
      "left",
      "leg",
      "legal",
      "legend",
      "leisure",
      "lemon",
      "lend",
      "length",
      "lens",
      "leopard",
      "lesson",
      "letter",
      "level",
      "liar",
      "liberty",
      "library",
      "license",
      "life",
      "lift",
      "light",
      "like",
      "limb",
      "limit",
      "link",
      "lion",
      "liquid",
      "list",
      "little",
      "live",
      "lizard",
      "load",
      "loan",
      "lobster",
      "local",
      "lock",
      "logic",
      "lonely",
      "long",
      "loop",
      "lottery",
      "loud",
      "lounge",
      "love",
      "loyal",
      "lucky",
      "luggage",
      "lumber",
      "lunar",
      "lunch",
      "luxury",
      "lyrics",
      "machine",
      "mad",
      "magic",
      "magnet",
      "maid",
      "mail",
      "main",
      "major",
      "make",
      "mammal",
      "man",
      "manage",
      "mandate",
      "mango",
      "mansion",
      "manual",
      "maple",
      "marble",
      "march",
      "margin",
      "marine",
      "market",
      "marriage",
      "mask",
      "mass",
      "master",
      "match",
      "material",
      "math",
      "matrix",
      "matter",
      "maximum",
      "maze",
      "meadow",
      "mean",
      "measure",
      "meat",
      "mechanic",
      "medal",
      "media",
      "melody",
      "melt",
      "member",
      "memory",
      "mention",
      "menu",
      "mercy",
      "merge",
      "merit",
      "merry",
      "mesh",
      "message",
      "metal",
      "method",
      "middle",
      "midnight",
      "milk",
      "million",
      "mimic",
      "mind",
      "minimum",
      "minor",
      "minute",
      "miracle",
      "mirror",
      "misery",
      "miss",
      "mistake",
      "mix",
      "mixed",
      "mixture",
      "mobile",
      "model",
      "modify",
      "mom",
      "moment",
      "monitor",
      "monkey",
      "monster",
      "month",
      "moon",
      "moral",
      "more",
      "morning",
      "mosquito",
      "mother",
      "motion",
      "motor",
      "mountain",
      "mouse",
      "move",
      "movie",
      "much",
      "muffin",
      "mule",
      "multiply",
      "muscle",
      "museum",
      "mushroom",
      "music",
      "must",
      "mutual",
      "myself",
      "mystery",
      "myth",
      "naive",
      "name",
      "napkin",
      "narrow",
      "nasty",
      "nation",
      "nature",
      "near",
      "neck",
      "need",
      "negative",
      "neglect",
      "neither",
      "nephew",
      "nerve",
      "nest",
      "net",
      "network",
      "neutral",
      "never",
      "news",
      "next",
      "nice",
      "night",
      "noble",
      "noise",
      "nominee",
      "noodle",
      "normal",
      "north",
      "nose",
      "notable",
      "note",
      "nothing",
      "notice",
      "novel",
      "now",
      "nuclear",
      "number",
      "nurse",
      "nut",
      "oak",
      "obey",
      "object",
      "oblige",
      "obscure",
      "observe",
      "obtain",
      "obvious",
      "occur",
      "ocean",
      "october",
      "odor",
      "off",
      "offer",
      "office",
      "often",
      "oil",
      "okay",
      "old",
      "olive",
      "olympic",
      "omit",
      "once",
      "one",
      "onion",
      "online",
      "only",
      "open",
      "opera",
      "opinion",
      "oppose",
      "option",
      "orange",
      "orbit",
      "orchard",
      "order",
      "ordinary",
      "organ",
      "orient",
      "original",
      "orphan",
      "ostrich",
      "other",
      "outdoor",
      "outer",
      "output",
      "outside",
      "oval",
      "oven",
      "over",
      "own",
      "owner",
      "oxygen",
      "oyster",
      "ozone",
      "pact",
      "paddle",
      "page",
      "pair",
      "palace",
      "palm",
      "panda",
      "panel",
      "panic",
      "panther",
      "paper",
      "parade",
      "parent",
      "park",
      "parrot",
      "party",
      "pass",
      "patch",
      "path",
      "patient",
      "patrol",
      "pattern",
      "pause",
      "pave",
      "payment",
      "peace",
      "peanut",
      "pear",
      "peasant",
      "pelican",
      "pen",
      "penalty",
      "pencil",
      "people",
      "pepper",
      "perfect",
      "permit",
      "person",
      "pet",
      "phone",
      "photo",
      "phrase",
      "physical",
      "piano",
      "picnic",
      "picture",
      "piece",
      "pig",
      "pigeon",
      "pill",
      "pilot",
      "pink",
      "pioneer",
      "pipe",
      "pistol",
      "pitch",
      "pizza",
      "place",
      "planet",
      "plastic",
      "plate",
      "play",
      "please",
      "pledge",
      "pluck",
      "plug",
      "plunge",
      "poem",
      "poet",
      "point",
      "polar",
      "pole",
      "police",
      "pond",
      "pony",
      "pool",
      "popular",
      "portion",
      "position",
      "possible",
      "post",
      "potato",
      "pottery",
      "poverty",
      "powder",
      "power",
      "practice",
      "praise",
      "predict",
      "prefer",
      "prepare",
      "present",
      "pretty",
      "prevent",
      "price",
      "pride",
      "primary",
      "print",
      "priority",
      "prison",
      "private",
      "prize",
      "problem",
      "process",
      "produce",
      "profit",
      "program",
      "project",
      "promote",
      "proof",
      "property",
      "prosper",
      "protect",
      "proud",
      "provide",
      "public",
      "pudding",
      "pull",
      "pulp",
      "pulse",
      "pumpkin",
      "punch",
      "pupil",
      "puppy",
      "purchase",
      "purity",
      "purpose",
      "purse",
      "push",
      "put",
      "puzzle",
      "pyramid",
      "quality",
      "quantum",
      "quarter",
      "question",
      "quick",
      "quit",
      "quiz",
      "quote",
      "rabbit",
      "raccoon",
      "race",
      "rack",
      "radar",
      "radio",
      "rail",
      "rain",
      "raise",
      "rally",
      "ramp",
      "ranch",
      "random",
      "range",
      "rapid",
      "rare",
      "rate",
      "rather",
      "raven",
      "raw",
      "razor",
      "ready",
      "real",
      "reason",
      "rebel",
      "rebuild",
      "recall",
      "receive",
      "recipe",
      "record",
      "recycle",
      "reduce",
      "reflect",
      "reform",
      "refuse",
      "region",
      "regret",
      "regular",
      "reject",
      "relax",
      "release",
      "relief",
      "rely",
      "remain",
      "remember",
      "remind",
      "remove",
      "render",
      "renew",
      "rent",
      "reopen",
      "repair",
      "repeat",
      "replace",
      "report",
      "require",
      "rescue",
      "resemble",
      "resist",
      "resource",
      "response",
      "result",
      "retire",
      "retreat",
      "return",
      "reunion",
      "reveal",
      "review",
      "reward",
      "rhythm",
      "rib",
      "ribbon",
      "rice",
      "rich",
      "ride",
      "ridge",
      "rifle",
      "right",
      "rigid",
      "ring",
      "riot",
      "ripple",
      "risk",
      "ritual",
      "rival",
      "river",
      "road",
      "roast",
      "robot",
      "robust",
      "rocket",
      "romance",
      "roof",
      "rookie",
      "room",
      "rose",
      "rotate",
      "rough",
      "round",
      "route",
      "royal",
      "rubber",
      "rude",
      "rug",
      "rule",
      "run",
      "runway",
      "rural",
      "sad",
      "saddle",
      "sadness",
      "safe",
      "sail",
      "salad",
      "salmon",
      "salon",
      "salt",
      "salute",
      "same",
      "sample",
      "sand",
      "satisfy",
      "satoshi",
      "sauce",
      "sausage",
      "save",
      "say",
      "scale",
      "scan",
      "scare",
      "scatter",
      "scene",
      "scheme",
      "school",
      "science",
      "scissors",
      "scorpion",
      "scout",
      "scrap",
      "screen",
      "script",
      "scrub",
      "sea",
      "search",
      "season",
      "seat",
      "second",
      "secret",
      "section",
      "security",
      "seed",
      "seek",
      "segment",
      "select",
      "sell",
      "seminar",
      "senior",
      "sense",
      "sentence",
      "series",
      "service",
      "session",
      "settle",
      "setup",
      "seven",
      "shadow",
      "shaft",
      "shallow",
      "share",
      "shed",
      "shell",
      "sheriff",
      "shield",
      "shift",
      "shine",
      "ship",
      "shiver",
      "shock",
      "shoe",
      "shoot",
      "shop",
      "short",
      "shoulder",
      "shove",
      "shrimp",
      "shrug",
      "shuffle",
      "shy",
      "sibling",
      "sick",
      "side",
      "siege",
      "sight",
      "sign",
      "silent",
      "silk",
      "silly",
      "silver",
      "similar",
      "simple",
      "since",
      "sing",
      "siren",
      "sister",
      "situate",
      "six",
      "size",
      "skate",
      "sketch",
      "ski",
      "skill",
      "skin",
      "skirt",
      "skull",
      "slab",
      "slam",
      "sleep",
      "slender",
      "slice",
      "slide",
      "slight",
      "slim",
      "slogan",
      "slot",
      "slow",
      "slush",
      "small",
      "smart",
      "smile",
      "smoke",
      "smooth",
      "snack",
      "snake",
      "snap",
      "sniff",
      "snow",
      "soap",
      "soccer",
      "social",
      "sock",
      "soda",
      "soft",
      "solar",
      "soldier",
      "solid",
      "solution",
      "solve",
      "someone",
      "song",
      "soon",
      "sorry",
      "sort",
      "soul",
      "sound",
      "soup",
      "source",
      "south",
      "space",
      "spare",
      "spatial",
      "spawn",
      "speak",
      "special",
      "speed",
      "spell",
      "spend",
      "sphere",
      "spice",
      "spider",
      "spike",
      "spin",
      "spirit",
      "split",
      "spoil",
      "sponsor",
      "spoon",
      "sport",
      "spot",
      "spray",
      "spread",
      "spring",
      "spy",
      "square",
      "squeeze",
      "squirrel",
      "stable",
      "stadium",
      "staff",
      "stage",
      "stairs",
      "stamp",
      "stand",
      "start",
      "state",
      "stay",
      "steak",
      "steel",
      "stem",
      "step",
      "stereo",
      "stick",
      "still",
      "sting",
      "stock",
      "stomach",
      "stone",
      "stool",
      "story",
      "stove",
      "strategy",
      "street",
      "strike",
      "strong",
      "struggle",
      "student",
      "stuff",
      "stumble",
      "style",
      "subject",
      "submit",
      "subway",
      "success",
      "such",
      "sudden",
      "suffer",
      "sugar",
      "suggest",
      "suit",
      "summer",
      "sun",
      "sunny",
      "sunset",
      "super",
      "supply",
      "supreme",
      "sure",
      "surface",
      "surge",
      "surprise",
      "surround",
      "survey",
      "suspect",
      "sustain",
      "swallow",
      "swamp",
      "swap",
      "swarm",
      "swear",
      "sweet",
      "swift",
      "swim",
      "swing",
      "switch",
      "sword",
      "symbol",
      "symptom",
      "syrup",
      "system",
      "table",
      "tackle",
      "tag",
      "tail",
      "talent",
      "talk",
      "tank",
      "tape",
      "target",
      "task",
      "taste",
      "tattoo",
      "taxi",
      "teach",
      "team",
      "tell",
      "ten",
      "tenant",
      "tennis",
      "tent",
      "term",
      "test",
      "text",
      "thank",
      "that",
      "theme",
      "then",
      "theory",
      "there",
      "they",
      "thing",
      "this",
      "thought",
      "three",
      "thrive",
      "throw",
      "thumb",
      "thunder",
      "ticket",
      "tide",
      "tiger",
      "tilt",
      "timber",
      "time",
      "tiny",
      "tip",
      "tired",
      "tissue",
      "title",
      "toast",
      "tobacco",
      "today",
      "toddler",
      "toe",
      "together",
      "toilet",
      "token",
      "tomato",
      "tomorrow",
      "tone",
      "tongue",
      "tonight",
      "tool",
      "tooth",
      "top",
      "topic",
      "topple",
      "torch",
      "tornado",
      "tortoise",
      "toss",
      "total",
      "tourist",
      "toward",
      "tower",
      "town",
      "toy",
      "track",
      "trade",
      "traffic",
      "tragic",
      "train",
      "transfer",
      "trap",
      "trash",
      "travel",
      "tray",
      "treat",
      "tree",
      "trend",
      "trial",
      "tribe",
      "trick",
      "trigger",
      "trim",
      "trip",
      "trophy",
      "trouble",
      "truck",
      "true",
      "truly",
      "trumpet",
      "trust",
      "truth",
      "try",
      "tube",
      "tuition",
      "tumble",
      "tuna",
      "tunnel",
      "turkey",
      "turn",
      "turtle",
      "twelve",
      "twenty",
      "twice",
      "twin",
      "twist",
      "two",
      "type",
      "typical",
      "ugly",
      "umbrella",
      "unable",
      "unaware",
      "uncle",
      "uncover",
      "under",
      "undo",
      "unfair",
      "unfold",
      "unhappy",
      "uniform",
      "unique",
      "unit",
      "universe",
      "unknown",
      "unlock",
      "until",
      "unusual",
      "unveil",
      "update",
      "upgrade",
      "uphold",
      "upon",
      "upper",
      "upset",
      "urban",
      "urge",
      "usage",
      "use",
      "used",
      "useful",
      "useless",
      "usual",
      "utility",
      "vacant",
      "vacuum",
      "vague",
      "valid",
      "valley",
      "valve",
      "van",
      "vanish",
      "vapor",
      "various",
      "vast",
      "vault",
      "vehicle",
      "velvet",
      "vendor",
      "venture",
      "venue",
      "verb",
      "verify",
      "version",
      "very",
      "vessel",
      "veteran",
      "viable",
      "vibrant",
      "vicious",
      "victory",
      "video",
      "view",
      "village",
      "vintage",
      "violin",
      "virtual",
      "virus",
      "visa",
      "visit",
      "visual",
      "vital",
      "vivid",
      "vocal",
      "voice",
      "void",
      "volcano",
      "volume",
      "vote",
      "voyage",
      "wage",
      "wagon",
      "wait",
      "walk",
      "wall",
      "walnut",
      "want",
      "warfare",
      "warm",
      "warrior",
      "wash",
      "wasp",
      "waste",
      "water",
      "wave",
      "way",
      "wealth",
      "weapon",
      "wear",
      "weasel",
      "weather",
      "web",
      "wedding",
      "weekend",
      "weird",
      "welcome",
      "west",
      "wet",
      "whale",
      "what",
      "wheat",
      "wheel",
      "when",
      "where",
      "whip",
      "whisper",
      "wide",
      "width",
      "wife",
      "wild",
      "will",
      "win",
      "window",
      "wine",
      "wing",
      "wink",
      "winner",
      "winter",
      "wire",
      "wisdom",
      "wise",
      "wish",
      "witness",
      "wolf",
      "woman",
      "wonder",
      "wood",
      "wool",
      "word",
      "work",
      "world",
      "worry",
      "worth",
      "wrap",
      "wreck",
      "wrestle",
      "wrist",
      "write",
      "wrong",
      "yard",
      "year",
      "yellow",
      "you",
      "young",
      "youth",
      "zebra",
      "zero",
      "zone",
      "zoo"
    ],
    space: " "
  };

  // node_modules/@bsv/sdk/dist/esm/src/compat/Mnemonic.js
  var BIP39_WORD_COUNTS = /* @__PURE__ */ new Set([12, 15, 18, 21, 24]);
  var MAX_MNEMONIC_LENGTH = 8192;
  var MAX_PASSPHRASE_LENGTH = 1024 * 1024;
  var MAX_WORD_LENGTH = 256;
  function validateWordlist(wordlist2) {
    if (wordlist2 == null || typeof wordlist2 !== "object") {
      throw new TypeError("Mnemonic wordlist must be an object");
    }
    const valueDescriptor = Object.getOwnPropertyDescriptor(wordlist2, "value");
    const spaceDescriptor = Object.getOwnPropertyDescriptor(wordlist2, "space");
    if (valueDescriptor == null || !("value" in valueDescriptor) || !Array.isArray(valueDescriptor.value) || valueDescriptor.value.length !== 2048) {
      throw new TypeError("Mnemonic wordlist must contain exactly 2048 words");
    }
    const values = valueDescriptor.value;
    const words = /* @__PURE__ */ new Set();
    for (let index = 0; index < values.length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(values, String(index));
      if (descriptor == null || !("value" in descriptor) || typeof descriptor.value !== "string" || descriptor.value.length === 0 || descriptor.value.length > MAX_WORD_LENGTH || words.has(descriptor.value)) {
        throw new TypeError("Mnemonic wordlist must contain unique bounded dense string entries");
      }
      words.add(descriptor.value);
    }
    if (spaceDescriptor == null || !("value" in spaceDescriptor) || typeof spaceDescriptor.value !== "string" || spaceDescriptor.value.length === 0 || spaceDescriptor.value.length > 8) {
      throw new TypeError("Mnemonic wordlist separator must be a bounded non-empty string");
    }
  }
  var Mnemonic = class _Mnemonic {
    /**
     * Constructs a Mnemonic object.
     * @param {string} [mnemonic] - An optional mnemonic phrase.
     * @param {number[]} [seed] - An optional seed derived from the mnemonic.
     * @param {object} [wordlist=wordList] - An object containing a list of words and space character used in the mnemonic.
     */
    constructor(mnemonic, seed, wordlist2 = wordList) {
      __publicField(this, "mnemonic");
      __publicField(this, "seed");
      __publicField(this, "Wordlist");
      validateWordlist(wordlist2);
      this.mnemonic = compatString(mnemonic ?? "", "Mnemonic", MAX_MNEMONIC_LENGTH);
      this.seed = compatBytes(seed ?? [], "Mnemonic seed", 0, 64);
      this.Wordlist = wordlist2;
    }
    /**
     * Converts the mnemonic and seed into a binary representation.
     * @returns {number[]} The binary representation of the mnemonic and seed.
     */
    toBinary() {
      validateWordlist(this.Wordlist);
      const mnemonic = compatString(this.mnemonic, "Mnemonic", MAX_MNEMONIC_LENGTH);
      const seed = compatBytes(this.seed, "Mnemonic seed", 0, 64);
      const bw = new Writer();
      if (mnemonic === "") {
        bw.writeVarIntNum(0);
      } else {
        const buf = toArray2(mnemonic, "utf8");
        bw.writeVarIntNum(buf.length);
        bw.write(buf);
      }
      if (seed.length > 0) {
        bw.writeVarIntNum(seed.length);
        bw.write(seed);
      } else {
        bw.writeVarIntNum(0);
      }
      return bw.toArray();
    }
    /**
     * Loads a mnemonic and seed from a binary representation.
     * @param {number[]} bin - The binary representation of a mnemonic and seed.
     * @returns {this} The Mnemonic instance with loaded mnemonic and seed.
     */
    fromBinary(bin) {
      bin = compatBytes(bin, "Mnemonic binary data", 2, MAX_MNEMONIC_LENGTH + 80);
      const br = new Reader(bin);
      const mnemoniclen = br.readVarIntNumStrict(false);
      if (mnemoniclen > MAX_MNEMONIC_LENGTH) {
        throw new RangeError("Mnemonic binary text exceeds the supported limit");
      }
      let mnemonic = "";
      if (mnemoniclen > 0) {
        const mnemonicBytes = br.read(mnemoniclen);
        mnemonic = encode(mnemonicBytes, "utf8");
        if (toArray2(mnemonic, "utf8").join(",") !== mnemonicBytes.join(",")) {
          throw new TypeError("Mnemonic binary text is not canonical UTF-8");
        }
      }
      const seedlen = br.readVarIntNumStrict(false);
      if (seedlen > 64)
        throw new RangeError("Mnemonic binary seed exceeds 64 bytes");
      let seed = [];
      if (seedlen > 0) {
        seed = br.read(seedlen);
      }
      if (!br.eof())
        throw new Error("Mnemonic binary data contains trailing bytes");
      if (mnemonic !== "") {
        const previousMnemonic = this.mnemonic;
        let valid = false;
        try {
          this.mnemonic = mnemonic;
          valid = this.check();
        } finally {
          this.mnemonic = previousMnemonic;
        }
        if (!valid)
          throw new Error("Mnemonic binary data contains an invalid BIP-39 phrase");
      }
      this.mnemonic = mnemonic;
      this.seed = seed;
      return this;
    }
    /**
     * Generates a random mnemonic from a given bit length.
     * @param {number} [bits=128] - The bit length for the random mnemonic (must be a multiple of 32 and at least 128).
     * @returns {this} The Mnemonic instance with the new random mnemonic.
     * @throws {Error} If the bit length is not a multiple of 32 or is less than 128.
     */
    fromRandom(bits) {
      if (bits === void 0 || bits === null || Number.isNaN(bits) || bits === 0) {
        bits = 128;
      }
      if (!Number.isSafeInteger(bits) || bits % 32 !== 0) {
        throw new Error("bits must be multiple of 32");
      }
      if (bits < 128) {
        throw new Error("bits must be at least 128");
      }
      if (bits > 256)
        throw new Error("bits must not exceed the BIP-39 maximum of 256");
      const buf = Random_default(bits / 8);
      this.entropy2Mnemonic(buf);
      this.mnemonic2Seed();
      return this;
    }
    /**
     * Static method to generate a Mnemonic instance with a random mnemonic.
     * @param {number} [bits=128] - The bit length for the random mnemonic.
     * @returns {Mnemonic} A new Mnemonic instance.
     */
    static fromRandom(bits) {
      return new this().fromRandom(bits);
    }
    /**
     * Converts given entropy into a mnemonic phrase.
     * This method is used to generate a mnemonic from a specific entropy source.
     * @param {number[]} buf - The entropy buffer, must be at least 128 bits.
     * @returns {this} The Mnemonic instance with the mnemonic set from the given entropy.
     * @throws {Error} If the entropy is less than 128 bits.
     */
    fromEntropy(buf) {
      this.entropy2Mnemonic(buf);
      return this;
    }
    /**
     * Static method to create a Mnemonic instance from a given entropy.
     * @param {number[]} buf - The entropy buffer.
     * @returns {Mnemonic} A new Mnemonic instance.
     */
    static fromEntropy(buf) {
      return new this().fromEntropy(buf);
    }
    /**
     * Sets the mnemonic for the instance from a string.
     * @param {string} mnemonic - The mnemonic phrase as a string.
     * @returns {this} The Mnemonic instance with the set mnemonic.
     * @throws {Error} If the mnemonic does not pass BIP-39 validation
     * (unknown words, invalid length, or bad checksum).
     */
    fromString(mnemonic) {
      mnemonic = compatString(mnemonic, "Mnemonic", MAX_MNEMONIC_LENGTH);
      const previousMnemonic = this.mnemonic;
      this.mnemonic = mnemonic;
      let valid = false;
      try {
        valid = this.check();
      } catch {
        valid = false;
      }
      if (!valid) {
        this.mnemonic = previousMnemonic;
        throw new Error("Mnemonic does not pass the check - was the mnemonic typed incorrectly? Are there extra spaces?");
      }
      this.seed = [];
      return this;
    }
    /**
     * Static method to create a Mnemonic instance from a mnemonic string.
     * @param {string} str - The mnemonic phrase.
     * @returns {Mnemonic} A new Mnemonic instance.
     */
    static fromString(str) {
      return new this().fromString(str);
    }
    /**
     * Converts the instance's mnemonic to a string representation.
     * @returns {string} The mnemonic phrase as a string.
     */
    toString() {
      return this.mnemonic;
    }
    /**
     * Converts the mnemonic to a seed.
     * The mnemonic must pass the validity check before conversion.
     * @param {string} [passphrase=''] - An optional passphrase for additional security.
     * @returns {number[]} The generated seed.
     * @throws {Error} If the mnemonic is invalid.
     */
    toSeed(passphrase) {
      this.mnemonic2Seed(passphrase);
      return this.seed;
    }
    /**
     * Converts entropy to a mnemonic phrase.
     * This method takes a buffer of entropy and converts it into a corresponding
     * mnemonic phrase based on the Mnemonic wordlist. The entropy should be at least 128 bits.
     * The method applies a checksum and maps the entropy to words in the wordlist.
     * @param {number[]} buf - The entropy buffer to convert. Must be at least 128 bits.
     * @returns {this} The Mnemonic instance with the mnemonic set from the entropy.
     * @throws {Error} If the entropy is less than 128 bits or if it's not an even multiple of 11 bits.
     */
    entropy2Mnemonic(buf) {
      validateWordlist(this.Wordlist);
      if (Array.isArray(buf) && buf.length < 128 / 8) {
        throw new Error("Entropy is less than 128 bits. It must be 128 bits or more.");
      }
      buf = compatBytes(buf, "Mnemonic entropy", 16, 32);
      if (buf.length > 32 || buf.length % 4 !== 0) {
        throw new Error("Entropy must be 128 to 256 bits in a multiple of 32 bits");
      }
      const hash = sha2562(buf);
      let bin = "";
      const bits = buf.length * 8;
      for (const byte of buf) {
        bin = bin + ("00000000" + byte.toString(2)).slice(-8);
      }
      let hashbits = hash[0].toString(2);
      hashbits = ("00000000" + hashbits).slice(-8).slice(0, bits / 32);
      bin = bin + hashbits;
      if (bin.length % 11 !== 0) {
        throw new Error("internal error - entropy not an even multiple of 11 bits - " + bin.length.toString());
      }
      let mnemonic = "";
      for (let i = 0; i < bin.length / 11; i++) {
        if (mnemonic !== "") {
          mnemonic = mnemonic + this.Wordlist.space;
        }
        const wi = Number.parseInt(bin.slice(i * 11, (i + 1) * 11), 2);
        mnemonic = mnemonic + this.Wordlist.value[wi];
      }
      this.mnemonic = mnemonic;
      this.seed = [];
      return this;
    }
    /**
     * Recovers the original entropy bytes from the instance's mnemonic phrase.
     * @returns {number[]} The entropy buffer that was originally used to generate the mnemonic.
     * @throws {Error} If the mnemonic is invalid or contains unknown words.
     */
    toEntropy() {
      validateWordlist(this.Wordlist);
      compatString(this.mnemonic, "Mnemonic", MAX_MNEMONIC_LENGTH);
      const words = this.mnemonic.split(this.Wordlist.space);
      if (!BIP39_WORD_COUNTS.has(words.length)) {
        throw new Error("Mnemonic must contain 12, 15, 18, 21, or 24 words");
      }
      let bin = "";
      for (const word of words) {
        const ind = this.Wordlist.value.indexOf(word);
        if (ind < 0) {
          throw new Error(`Unknown word in mnemonic: "${word}"`);
        }
        bin = bin + ("00000000000" + ind.toString(2)).slice(-11);
      }
      if (bin.length % 11 !== 0) {
        throw new Error("internal error - entropy not an even multiple of 11 bits - " + bin.length.toString());
      }
      const cs = bin.length / 33;
      const entropyBits = bin.slice(0, bin.length - cs);
      const buf = [];
      for (let i = 0; i < entropyBits.length / 8; i++) {
        buf.push(Number.parseInt(entropyBits.slice(i * 8, (i + 1) * 8), 2));
      }
      const hash = sha2562(buf);
      let expectedHashBits = hash[0].toString(2);
      expectedHashBits = ("00000000" + expectedHashBits).slice(-8).slice(0, cs);
      const actualHashBits = bin.slice(-cs);
      if (expectedHashBits !== actualHashBits) {
        throw new Error("Mnemonic checksum invalid");
      }
      return buf;
    }
    /**
     * Validates the mnemonic phrase.
     * Checks for correct length, absence of invalid words, and proper checksum.
     * @returns {boolean} True if the mnemonic is valid, false otherwise.
     * @throws {Error} If the mnemonic is not an even multiple of 11 bits.
     */
    check() {
      validateWordlist(this.Wordlist);
      const mnemonic = compatString(this.mnemonic, "Mnemonic", MAX_MNEMONIC_LENGTH);
      const words = mnemonic.split(this.Wordlist.space);
      if (!BIP39_WORD_COUNTS.has(words.length))
        return false;
      let bin = "";
      for (const word of words) {
        const ind = this.Wordlist.value.indexOf(word);
        if (ind < 0) {
          return false;
        }
        bin = bin + ("00000000000" + ind.toString(2)).slice(-11);
      }
      if (bin.length % 11 !== 0) {
        throw new Error("internal error - entropy not an even multiple of 11 bits - " + bin.length.toString());
      }
      const cs = bin.length / 33;
      const hashBits = bin.slice(-cs);
      const nonhashBits = bin.slice(0, bin.length - cs);
      const buf = [];
      for (let i = 0; i < nonhashBits.length / 8; i++) {
        buf.push(Number.parseInt(bin.slice(i * 8, (i + 1) * 8), 2));
      }
      const hash = sha2562(buf.slice(0, nonhashBits.length / 8));
      let expectedHashBits = hash[0].toString(2);
      expectedHashBits = ("00000000" + expectedHashBits).slice(-8).slice(0, cs);
      return expectedHashBits === hashBits;
    }
    /**
     * Converts a mnemonic to a seed.
     * This method takes the instance's mnemonic phrase, combines it with a passphrase (if provided),
     * and uses PBKDF2 to generate a seed. It also validates the mnemonic before conversion.
     * This seed can then be used for generating deterministic keys.
     * @param {string} [passphrase=''] - An optional passphrase for added security.
     * @returns {this} The Mnemonic instance with the seed generated from the mnemonic.
     * @throws {Error} If the mnemonic does not pass validation or if the passphrase is not a string.
     */
    mnemonic2Seed(passphrase = "") {
      let mnemonic = this.mnemonic;
      if (typeof passphrase !== "string") {
        throw new TypeError("passphrase must be a string or undefined");
      }
      compatString(passphrase, "Mnemonic passphrase", MAX_PASSPHRASE_LENGTH);
      if (!this.check()) {
        throw new Error("Mnemonic does not pass the check - was the mnemonic typed incorrectly? Are there extra spaces?");
      }
      mnemonic = mnemonic.normalize("NFKD");
      passphrase = passphrase.normalize("NFKD");
      const mbuf = toArray2(mnemonic, "utf8");
      const pbuf = [...toArray2("mnemonic", "utf8"), ...toArray2(passphrase, "utf8")];
      this.seed = pbkdf22(mbuf, pbuf, 2048, 64, "sha512");
      return this;
    }
    /**
     * Determines the validity of a given passphrase with the mnemonic.
     * This method is useful for checking if a passphrase matches with the mnemonic.
     * @param {string} [passphrase=''] - The passphrase to validate.
     * @returns {boolean} True if the mnemonic and passphrase combination is valid, false otherwise.
     */
    isValid(passphrase = "") {
      let isValid;
      try {
        this.mnemonic2Seed(passphrase);
        isValid = true;
      } catch {
        isValid = false;
      }
      return isValid;
    }
    /**
     * Static method to check the validity of a given mnemonic and passphrase combination.
     * @param {string} mnemonic - The mnemonic phrase.
     * @param {string} [passphrase=''] - The passphrase to validate.
     * @returns {boolean} True if the combination is valid, false otherwise.
     */
    static isValid(mnemonic, passphrase = "") {
      return new _Mnemonic(mnemonic).isValid(passphrase);
    }
  };

  // ../vendor/wallet-ui/app/packages/wallet-kit/js/nc-wallet.js
  var DB_NAME = "nc_wallet";
  var DB_VERSION = 1;
  var STORE = "keys";
  var PBKDF2_ITERATIONS = 6e5;
  function bytesToB64(bytes2) {
    let bin = "";
    const u8 = bytes2 instanceof Uint8Array ? bytes2 : new Uint8Array(bytes2);
    for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin);
  }
  function b64ToBytes(b64) {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: "username" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function idbPut(record) {
    return openDb().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    }));
  }
  function idbGet(username) {
    return openDb().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(username);
      req.onsuccess = () => {
        db.close();
        resolve(req.result || null);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    }));
  }
  function idbAll() {
    return openDb().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        db.close();
        resolve(req.result || []);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    }));
  }
  function isSupported() {
    return !!(typeof window !== "undefined" && window.isSecureContext && window.crypto && window.crypto.subtle);
  }
  function requireSecureContext() {
    if (isSupported()) return;
    throw new Error(
      "insecure-context: this browser only allows in-browser key generation over HTTPS or on localhost. Open this page via https:// (or http://localhost) and try again."
    );
  }
  async function deriveAesKey(password, saltBytes, iterations) {
    requireSecureContext();
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  async function encryptToBlob(mnemonic, backupPassword) {
    if (!mnemonic || !backupPassword) throw new Error("missing arguments");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveAesKey(backupPassword, salt, PBKDF2_ITERATIONS);
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(mnemonic)
    );
    return {
      ciphertext: bytesToB64(new Uint8Array(ct)),
      salt: bytesToB64(salt),
      iv: bytesToB64(iv),
      iterations: PBKDF2_ITERATIONS,
      kdf: "PBKDF2-SHA256"
    };
  }
  async function decryptFromBlob(blob, backupPassword) {
    const key = await deriveAesKey(backupPassword, b64ToBytes(blob.salt), blob.iterations);
    try {
      const pt = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: b64ToBytes(blob.iv) },
        key,
        b64ToBytes(blob.ciphertext)
      );
      return new TextDecoder().decode(pt);
    } catch (e) {
      throw new Error("bad-password");
    }
  }
  async function storeBlob(username, blob, overrides) {
    const id = identity(Object.assign({ username }, overrides || {}));
    if (!id.username) throw new Error("missing username");
    const rec = { username: id.username, ...blob, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    if (id.paymail) rec.paymail = id.paymail;
    if (id.userId) rec.userId = id.userId;
    await idbPut(rec);
  }
  function generateWallet() {
    requireSecureContext();
    const mnemonic = generateMnemonic(wordlist, 128);
    const seed = mnemonicToSeedSync(mnemonic, "");
    const xpub = HDKey.fromMasterSeed(seed).publicExtendedKey;
    seed.fill(0);
    return { mnemonic, xpub };
  }
  function signXpubProof(mnemonic, xpub) {
    const master = HD.fromSeed(Mnemonic.fromString(mnemonic.trim()).toSeed());
    const priv = master.derive("m/0/0").privKey;
    return BSM_exports.sign(Array.from(new TextEncoder().encode(xpub)), priv, "base64");
  }
  async function storeEncrypted(username, backupPassword, mnemonic, overrides) {
    if (!username) throw new Error("missing username");
    const blob = await encryptToBlob(mnemonic, backupPassword);
    await storeBlob(username, blob, overrides);
    return blob;
  }
  async function hasLocalKey(username) {
    return await idbGet(username) !== null;
  }
  function norm(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }
  function identity(overrides) {
    const ds = typeof document !== "undefined" && document.body && document.body.dataset || {};
    return {
      username: norm(overrides && overrides.username || ds.ncUsername),
      paymail: norm(overrides && overrides.paymail || ds.ncPaymail),
      userId: norm(overrides && overrides.userId || ds.ncUserid)
    };
  }
  async function resolveRecord(id) {
    const records = await idbAll();
    if (!records.length) return null;
    const keyOf = (rec) => String(rec && rec.username || "");
    const localPart = (value) => norm(value).split("@")[0];
    const locals = [localPart(id.username), localPart(id.paymail)].filter(Boolean);
    const tests = [];
    if (id.userId) tests.push(["userId", (rec) => norm(rec.userId) === id.userId]);
    if (id.paymail) tests.push(["paymail", (rec) => norm(rec.paymail) === id.paymail]);
    if (id.username) tests.push(["username", (rec) => norm(keyOf(rec)) === id.username]);
    if (locals.length) {
      tests.push(["local", (rec) => locals.indexOf(localPart(keyOf(rec))) !== -1]);
    }
    for (const [matched, test] of tests) {
      const hit = records.filter(test);
      if (hit.length === 1) return { key: keyOf(hit[0]), matched };
    }
    if (records.length === 1) return { key: keyOf(records[0]), matched: "only" };
    return null;
  }
  async function resolveKey(hint) {
    const id = hint && typeof hint === "object" ? identity(hint) : identity(hint ? { username: hint } : null);
    const found = await resolveRecord(id);
    return found ? found.key : null;
  }
  async function backfillIdentity(key, id) {
    if (!key) return;
    try {
      const rec = await idbGet(key);
      if (!rec) return;
      const patch = {};
      if (id.paymail && norm(rec.paymail) !== id.paymail) patch.paymail = id.paymail;
      if (id.userId && norm(rec.userId) !== id.userId) patch.userId = id.userId;
      if (!Object.keys(patch).length) return;
      await idbPut({ ...rec, ...patch });
    } catch (e) {
    }
  }
  async function resolveLocalKey(overrides) {
    const id = identity(overrides);
    const found = await resolveRecord(id);
    if (!found) return null;
    if (found.matched !== "only") await backfillIdentity(found.key, id);
    return found.key;
  }
  async function readBio(username) {
    const rec = await idbGet(username);
    return rec && rec.bio || null;
  }
  async function writeBio(username, bio) {
    const rec = await idbGet(username);
    if (!rec) throw new Error("no-local-key");
    await idbPut({ ...rec, bio });
  }
  async function clearBio(username) {
    const rec = await idbGet(username);
    if (!rec || !rec.bio) return;
    const next = { ...rec };
    delete next.bio;
    await idbPut(next);
  }
  async function loadMnemonic(username, backupPassword) {
    let rec = await idbGet(username);
    if (!rec) {
      const key = await resolveLocalKey({ username });
      if (key) rec = await idbGet(key);
    }
    if (!rec) throw new Error("no-local-key");
    return decryptFromBlob(rec, backupPassword);
  }
  window.NcWallet = {
    generateWallet,
    storeEncrypted,
    storeBlob,
    hasLocalKey,
    loadMnemonic,
    identity,
    resolveKey,
    resolveLocalKey,
    encryptToBlob,
    decryptFromBlob,
    signXpubProof,
    readBio,
    writeBio,
    clearBio,
    isSupported
  };
})();
/*! Bundled license information:

@scure/bip39/index.js:
  (*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)

@noble/curves/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/der.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/base/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/bip32/index.js:
  (*! scure-bip32 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)
*/
