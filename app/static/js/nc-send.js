(() => {
  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
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
      const hex2 = __privateMethod(this, _BigNumber_instances, _getMinimalHex_fn).call(this);
      return (this.isNeg() ? "-" : "") + hex2;
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
    static fromHex(hex2, endian) {
      let eE = "be";
      if (endian === "little" || endian === "le")
        eE = "le";
      return new _BigNumber(hex2, 16, eE);
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
    static fromSm(bytes3, endian = "big") {
      var _a;
      if (bytes3.length === 0)
        return new _BigNumber(0n);
      const beBytes = bytes3.slice();
      if (endian === "little") {
        beBytes.reverse();
      }
      let sign2 = 0;
      if (beBytes.length > 0 && (beBytes[0] & 128) !== 0) {
        sign2 = 1;
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
      __privateMethod(_a = r2, _BigNumber_instances, _initializeState_fn).call(_a, magnitude, sign2);
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
      let hex2 = __privateMethod(this, _BigNumber_instances, _getMinimalHex_fn).call(this);
      if (hex2.length % 2 !== 0)
        hex2 = "0" + hex2;
      const byteLen = hex2.length / 2;
      const bytes3 = Array.from({ length: byteLen });
      for (let i = 0, j = 0; i < hex2.length; i += 2) {
        const high = HEX_CHAR_TO_VALUE[hex2.codePointAt(i)];
        const low = HEX_CHAR_TO_VALUE[hex2.codePointAt(i + 1)];
        bytes3[j++] = (high & 15) << 4 | low & 15;
      }
      let result;
      if (__privateGet(this, __sign) === 1) {
        if ((bytes3[0] & 128) === 0) {
          result = bytes3.slice();
          result[0] |= 128;
        } else {
          result = [128, ...bytes3];
        }
      } else if ((bytes3[0] & 128) === 0) {
        result = bytes3.slice();
      } else {
        result = [0, ...bytes3];
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
    let sign2 = 0;
    if (originalNumberStr.startsWith("-")) {
      start++;
      sign2 = 1;
    } else if (originalNumberStr.startsWith("+")) {
      start++;
    }
    const numStr = originalNumberStr.substring(start);
    if (numStr.length === 0) {
      __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, 0n, sign2 === 1 && originalNumberStr.startsWith("-") ? 1 : 0);
      this.normSign();
      return;
    }
    if (effectiveBase === 16) {
      __privateMethod(this, _BigNumber_instances, _initFromHexString_fn).call(this, numStr, sign2, effectiveEndian);
    } else {
      __privateMethod(this, _BigNumber_instances, _initFromNonHexString_fn).call(this, numStr, effectiveBase, sign2, effectiveEndian);
    }
  };
  _initFromHexString_fn = function(numStr, sign2, effectiveEndian) {
    if (effectiveEndian === "le") {
      const bytes3 = [];
      let hexStr = numStr;
      if (hexStr.length % 2 !== 0)
        hexStr = "0" + hexStr;
      for (let i = 0; i < hexStr.length; i += 2) {
        const byteHex = hexStr.substring(i, i + 2);
        const byteVal = Number.parseInt(byteHex, 16);
        if (Number.isNaN(byteVal))
          throw new Error("Invalid character in " + hexStr);
        bytes3.push(byteVal);
      }
      __privateMethod(this, _BigNumber_instances, initArray_fn).call(this, bytes3, "le");
      __privateSet(this, __sign, sign2);
      this.normSign();
    } else {
      let tempMagnitude;
      try {
        tempMagnitude = BigInt("0x" + numStr);
      } catch {
        throw new Error("Invalid character in " + numStr);
      }
      __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, tempMagnitude, sign2);
      this.normSign();
    }
  };
  _initFromNonHexString_fn = function(numStr, base, sign2, effectiveEndian) {
    try {
      __privateMethod(this, _BigNumber_instances, _parseBaseString_fn).call(this, numStr, base);
      __privateSet(this, __sign, sign2);
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
  _initializeState_fn = function(magnitude, sign2) {
    __privateSet(this, __magnitude, magnitude);
    __privateSet(this, __sign, magnitude === 0n ? 0 : sign2);
    __privateMethod(this, _BigNumber_instances, _finishInitialization_fn).call(this);
  };
  _finishInitialization_fn = function() {
    if (__privateGet(this, __magnitude) === 0n) {
      __privateSet(this, __nominalWordLength, 1);
      __privateSet(this, __sign, 0);
    } else {
      const bitLen = __privateGet(this, __magnitude).toString(2).length;
      __privateSet(this, __nominalWordLength, Math.max(1, Math.ceil(bitLen / _BigNumber.wordSize)));
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
  initArray_fn = function(bytes3, endian) {
    if (bytes3.length === 0) {
      __privateMethod(this, _BigNumber_instances, _initializeState_fn).call(this, 0n, 0);
      return this;
    }
    let magnitude = 0n;
    if (endian === "be") {
      for (const byte of bytes3)
        magnitude = magnitude << 8n | BigInt(byte & 255);
    } else {
      for (let i = bytes3.length - 1; i >= 0; i--)
        magnitude = magnitude << 8n | BigInt(bytes3[i] & 255);
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
        const pow = this.m.add(new BigNumber(1)).iushrn(2);
        return this.pow(a, pow);
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

  // node_modules/@bsv/sdk/dist/esm/src/primitives/utils.js
  var utils_exports = {};
  __export(utils_exports, {
    Reader: () => Reader,
    ReaderUint8Array: () => ReaderUint8Array,
    Writer: () => Writer,
    WriterUint8Array: () => WriterUint8Array,
    base64ToArray: () => base64ToArray,
    constantTimeEquals: () => constantTimeEquals,
    encode: () => encode,
    fromBase58: () => fromBase58,
    fromBase58Check: () => fromBase58Check,
    hexToUint8Array: () => hexToUint8Array,
    minimallyEncode: () => minimallyEncode,
    toArray: () => toArray2,
    toBase58: () => toBase58,
    toBase58Check: () => toBase58Check,
    toBase64: () => toBase64,
    toHex: () => toHex,
    toSafeString: () => toSafeString,
    toUTF8: () => toUTF8,
    toUTF8Strict: () => toUTF8Strict,
    toUint8Array: () => toUint8Array,
    verifyNotNull: () => verifyNotNull,
    zero2: () => zero2
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/UTF8.js
  var encoder = new TextEncoder();
  function utf8Bytes(value) {
    return encoder.encode(value);
  }
  function utf8ByteLength(value) {
    return utf8Bytes(value).byteLength;
  }
  function hasControlCharacter(value) {
    for (const character of value) {
      const codePoint = character.codePointAt(0);
      if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159)
        return true;
    }
    return false;
  }

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Hash.js
  var Hash_exports = {};
  __export(Hash_exports, {
    RIPEMD160: () => RIPEMD160,
    SHA1: () => SHA1,
    SHA1HMAC: () => SHA1HMAC,
    SHA256: () => SHA256,
    SHA256HMAC: () => SHA256HMAC,
    SHA512: () => SHA512,
    SHA512HMAC: () => SHA512HMAC,
    hash160: () => hash160,
    hash256: () => hash256,
    htonl: () => htonl,
    pbkdf2: () => pbkdf2,
    realHtonl: () => realHtonl,
    ripemd160: () => ripemd160,
    sha1: () => sha1,
    sha256: () => sha256,
    sha256hmac: () => sha256hmac,
    sha512: () => sha512,
    sha512hmac: () => sha512hmac,
    swapBytes32: () => swapBytes32,
    toArray: () => toArray
  });

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
      const bytes3 = this._delta8;
      const k = bytes3 - (len + this.padLength) % bytes3;
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
  function bytesToHex(data) {
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
        const crypto = getBuiltinModule.call(processLike, "node:crypto");
        if (crypto != null)
          return crypto;
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
      return bytesToHex(fallback.digest());
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
    const hmac2 = createNodeHmac(algorithm, toHashKeyBytes(key));
    if (hmac2 == null)
      return void 0;
    hmac2.update(toHashBytes(msg, enc));
    return hmac2.digest();
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
  function FT_1(s2, x, y, z) {
    if (s2 === 0) {
      return ch32(x, y, z);
    }
    if (s2 === 1 || s2 === 3) {
      return p32(x, y, z);
    }
    if (s2 === 2) {
      return maj32(x, y, z);
    }
    return 0;
  }
  function ch32(x, y, z) {
    return x & y ^ ~x & z;
  }
  function maj32(x, y, z) {
    return x & y ^ x & z ^ y & z;
  }
  function p32(x, y, z) {
    return x ^ y ^ z;
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
  var SHA256 = class {
    constructor() {
      __privateAdd(this, _h);
      __privateAdd(this, _native);
      __privateSet(this, _native, createNodeHash("sha256"));
      if (__privateGet(this, _native) == null) {
        __privateSet(this, _h, new FastSHA256());
      }
    }
    update(msg, enc) {
      updateNativeOrFallback(__privateGet(this, _native), __privateGet(this, _h), toHashBytes(msg, enc));
      return this;
    }
    digest() {
      return digestNativeOrFallback(__privateGet(this, _native), __privateGet(this, _h));
    }
    digestHex() {
      return digestHexNativeOrFallback(__privateGet(this, _native), __privateGet(this, _h));
    }
  };
  _h = new WeakMap();
  _native = new WeakMap();
  var SHA1 = class extends BaseHash {
    constructor() {
      super(512, 160, 80, 64);
      __publicField(this, "h");
      __publicField(this, "W");
      __publicField(this, "k");
      this.k = [1518500249, 1859775393, 2400959708, 3395469782];
      this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
      this.W = Array.from({ length: 80 });
    }
    _update(msg, start) {
      const W = this.W;
      start ?? (start = 0);
      let i;
      for (i = 0; i < 16; i++) {
        W[i] = msg[start + i];
      }
      for (; i < W.length; i++) {
        W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
      }
      let a = this.h[0];
      let b = this.h[1];
      let c = this.h[2];
      let d = this.h[3];
      let e = this.h[4];
      for (i = 0; i < W.length; i++) {
        const s2 = Math.trunc(i / 20);
        const t = SUM32_5(rotl32(a, 5), FT_1(s2, b, c, d), e, W[i], this.k[s2]);
        e = d;
        d = c;
        c = rotl32(b, 30);
        b = a;
        a = t;
      }
      this.h[0] = sum32(this.h[0], a);
      this.h[1] = sum32(this.h[1], b);
      this.h[2] = sum32(this.h[2], c);
      this.h[3] = sum32(this.h[3], d);
      this.h[4] = sum32(this.h[4], e);
    }
    _digest() {
      return split32(this.h, "big");
    }
    _digestHex() {
      return toHex32(this.h, "big");
    }
  };
  var _h2, _native2;
  var SHA512 = class {
    constructor() {
      __privateAdd(this, _h2);
      __privateAdd(this, _native2);
      __privateSet(this, _native2, createNodeHash("sha512"));
      if (__privateGet(this, _native2) == null) {
        __privateSet(this, _h2, new FastSHA512());
      }
    }
    update(msg, enc) {
      updateNativeOrFallback(__privateGet(this, _native2), __privateGet(this, _h2), toHashBytes(msg, enc));
      return this;
    }
    digest() {
      return digestNativeOrFallback(__privateGet(this, _native2), __privateGet(this, _h2));
    }
    digestHex() {
      return digestHexNativeOrFallback(__privateGet(this, _native2), __privateGet(this, _h2));
    }
  };
  _h2 = new WeakMap();
  _native2 = new WeakMap();
  var _h3, _native3;
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
      __privateAdd(this, _h3);
      __privateAdd(this, _native3);
      __publicField(this, "blockSize", 64);
      __publicField(this, "outSize", 32);
      const k = toHashKeyBytes(key);
      __privateSet(this, _native3, createNodeHmac("sha256", k));
      if (__privateGet(this, _native3) == null) {
        __privateSet(this, _h3, new HMAC(sha256Fast, k));
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
      updateNativeOrFallback(__privateGet(this, _native3), __privateGet(this, _h3), toHashBytes(msg, enc));
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
      return digestNativeOrFallback(__privateGet(this, _native3), __privateGet(this, _h3));
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
      return digestHexNativeOrFallback(__privateGet(this, _native3), __privateGet(this, _h3));
    }
  };
  _h3 = new WeakMap();
  _native3 = new WeakMap();
  var SHA1HMAC = class {
    constructor(key) {
      __publicField(this, "inner");
      __publicField(this, "outer");
      __publicField(this, "blockSize", 64);
      key = toArray(key, "hex");
      if (key.length > this.blockSize) {
        key = new SHA1().update(key).digest();
      }
      let i;
      for (i = key.length; i < this.blockSize; i++) {
        key.push(0);
      }
      for (i = 0; i < key.length; i++) {
        key[i] ^= 54;
      }
      this.inner = new SHA1().update(key);
      for (i = 0; i < key.length; i++) {
        key[i] ^= 106;
      }
      this.outer = new SHA1().update(key);
    }
    update(msg, enc) {
      this.inner.update(msg, enc);
      return this;
    }
    digest() {
      this.outer.update(this.inner.digest());
      return this.outer.digest();
    }
    digestHex() {
      this.outer.update(this.inner.digest());
      return this.outer.digestHex();
    }
  };
  var _h4, _native4;
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
      __privateAdd(this, _h4);
      __privateAdd(this, _native4);
      __publicField(this, "blockSize", 128);
      __publicField(this, "outSize", 32);
      const k = toHashKeyBytes(key);
      __privateSet(this, _native4, createNodeHmac("sha512", k));
      if (__privateGet(this, _native4) == null) {
        __privateSet(this, _h4, new HMAC(sha512Fast, k));
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
      updateNativeOrFallback(__privateGet(this, _native4), __privateGet(this, _h4), toHashBytes(msg, enc));
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
      return digestNativeOrFallback(__privateGet(this, _native4), __privateGet(this, _h4));
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
      return digestHexNativeOrFallback(__privateGet(this, _native4), __privateGet(this, _h4));
    }
  };
  _h4 = new WeakMap();
  _native4 = new WeakMap();
  function sha256Bytes(msg, enc) {
    const native = digestWithNodeHash("sha256", msg, enc);
    if (native != null)
      return native;
    return new FastSHA256().update(toHashBytes(msg, enc)).digest();
  }
  function sha512Bytes(msg, enc) {
    const native = digestWithNodeHash("sha512", msg, enc);
    if (native != null)
      return native;
    return new FastSHA512().update(toHashBytes(msg, enc)).digest();
  }
  function ripemd160Bytes(msg, enc) {
    return digestWithNodeHash("ripemd160", msg, enc);
  }
  var ripemd160 = (msg, enc) => {
    const native = ripemd160Bytes(msg, enc);
    if (native != null)
      return Array.from(native);
    return new RIPEMD160().update(msg, enc).digest();
  };
  var sha1 = (msg, enc) => {
    return new SHA1().update(msg, enc).digest();
  };
  var sha256 = (msg, enc) => {
    return Array.from(sha256Bytes(msg, enc));
  };
  var sha512 = (msg, enc) => {
    return Array.from(sha512Bytes(msg, enc));
  };
  var hash256 = (msg, enc) => {
    return Array.from(sha256Bytes(sha256Bytes(msg, enc)));
  };
  var hash160 = (msg, enc) => {
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
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0) {
      throw new Error(`positive integer expected, got ${n}`);
    }
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length)) {
      const lens = lengths.join(",");
      throw new Error(`Uint8Array expected of length ${lens}, got length=${b.length}`);
    }
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function") {
      throw new TypeError("Hash should be wrapped by utils.createHasher");
    }
    anumber(h.outputLen);
    anumber(h.blockLen);
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed === true)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished === true) {
      throw new Error("Hash#digest() has already been called");
    }
  }
  function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  }
  function clean(...arrays) {
    for (const arr of arrays)
      arr.fill(0);
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes(data);
    return data;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return utf8Bytes(str);
  }
  var kdfInputToBytes = toBytes;
  var Hash = class {
  };
  function createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  var U32_MASK64 = BigInt(2 ** 32 - 1);
  var _32n = BigInt(32);
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len = lst.length;
    const Ah = new Uint32Array(len);
    const Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig(lst[i], le);
      Ah[i] = h;
      Al[i] = l;
    }
    return [Ah, Al];
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
  var add3H = (low, Ah, Bh, Ch) => Math.trunc(Ah + Bh + Ch + Math.trunc(low / 2 ** 32));
  var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
  var add4H = (low, Ah, Bh, Ch, Dh) => Math.trunc(Ah + Bh + Ch + Dh + Math.trunc(low / 2 ** 32));
  var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
  var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
  var HashMD = class extends Hash {
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
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      data = toBytes(data);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
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
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
      this.process(view, 0);
      const oview = createView(out);
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
    const _32n2 = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n2 & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
  }
  var SHA256_IV = Uint32Array.from([
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
  var SHA256_W = new Uint32Array(64);
  var FastSHA256 = class extends HashMD {
    constructor(outputLen = 32) {
      super(64, outputLen, 8, false);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "A", SHA256_IV[0] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "B", SHA256_IV[1] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "C", SHA256_IV[2] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "D", SHA256_IV[3] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "E", SHA256_IV[4] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "F", SHA256_IV[5] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "G", SHA256_IV[6] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "H", SHA256_IV[7] | 0);
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
        SHA256_W[i] = view.getUint32(offset);
      }
      for (let i = 16; i < 64; i++) {
        const w15 = SHA256_W[i - 15];
        const w2 = SHA256_W[i - 2];
        const s0 = G0_256(w15);
        const s1 = G1_256(w2);
        SHA256_W[i] = sum32(sum32(s0, SHA256_W[i - 7]), sum32(s1, SHA256_W[i - 16]));
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const T1 = SUM32_5(H, S1_256(E), ch32(E, F, G), K2562[i], SHA256_W[i]);
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
      clean(SHA256_W);
    }
    destroy() {
      clean(this.buffer);
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
    }
  };
  var sha256Fast = createHasher(() => new FastSHA256());
  var SHA512_IV = Uint32Array.from([
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
  var K512 = (() => split([
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
  var SHA512_Kh = (() => K512[0])();
  var SHA512_Kl = (() => K512[1])();
  var SHA512_W_H = new Uint32Array(80);
  var SHA512_W_L = new Uint32Array(80);
  var FastSHA512 = class extends HashMD {
    constructor(outputLen = 64) {
      super(128, outputLen, 16, false);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Ah", SHA512_IV[0] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Al", SHA512_IV[1] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Bh", SHA512_IV[2] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Bl", SHA512_IV[3] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Ch", SHA512_IV[4] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Cl", SHA512_IV[5] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Dh", SHA512_IV[6] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Dl", SHA512_IV[7] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Eh", SHA512_IV[8] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "El", SHA512_IV[9] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Fh", SHA512_IV[10] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Fl", SHA512_IV[11] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Gh", SHA512_IV[12] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Gl", SHA512_IV[13] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Hh", SHA512_IV[14] | 0);
      // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
      __publicField(this, "Hl", SHA512_IV[15] | 0);
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
        SHA512_W_H[i] = view.getUint32(offset);
        SHA512_W_L[i] = view.getUint32(offset + 4);
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
        const T2l = add3L(sigma0l, MAJl, T1l);
        Ah = add3H(T2l, sigma0h, MAJh, T1h);
        Al = T2l | 0;
      }
      ;
      ({ h: Ah, l: Al } = add(Ah, Al, this.Ah, this.Al));
      ({ h: Bh, l: Bl } = add(Bh, Bl, this.Bh, this.Bl));
      ({ h: Ch, l: Cl } = add(Ch, Cl, this.Ch, this.Cl));
      ({ h: Dh, l: Dl } = add(Dh, Dl, this.Dh, this.Dl));
      ({ h: Eh, l: El } = add(Eh, El, this.Eh, this.El));
      ({ h: Fh, l: Fl } = add(Fh, Fl, this.Fh, this.Fl));
      ({ h: Gh, l: Gl } = add(Gh, Gl, this.Gh, this.Gl));
      ({ h: Hh, l: Hl } = add(Hh, Hl, this.Hh, this.Hl));
      this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
      clean(SHA512_W_H, SHA512_W_L);
    }
    destroy() {
      clean(this.buffer);
      this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  };
  var sha512Fast = createHasher(() => new FastSHA512());
  var HMAC = class extends Hash {
    constructor(hash, _key) {
      super();
      __publicField(this, "oHash");
      __publicField(this, "iHash");
      __publicField(this, "blockLen");
      __publicField(this, "outputLen");
      __publicField(this, "finished", false);
      __publicField(this, "destroyed", false);
      ahash(hash);
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
      clean(pad);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      abytes(out, this.outputLen);
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
    ahash(hash);
    const { c, dkLen = 32 } = { ...opts };
    anumber(c);
    anumber(dkLen);
    if (c < 1)
      throw new Error("iterations (c) should be >= 1");
    const pwd = kdfInputToBytes(password);
    const slt = kdfInputToBytes(salt);
    const DK = new Uint8Array(dkLen);
    const PRF = hmac.create(hash, pwd);
    const PRFSalt = PRF._cloneInto().update(slt);
    let prfW;
    const arr = new Uint8Array(4);
    const view = createView(arr);
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
    clean(u);
    return DK;
  }
  var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
  hmac.create = (hash, key) => new HMAC(hash, key);
  function pbkdf2Fast(password, salt, iterations, keylen) {
    return pbkdf2Core(sha512Fast, password, salt, { c: iterations, dkLen: keylen });
  }
  function pbkdf2(password, salt, iterations, keylen, digest = "sha512") {
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
  function realHtonl(w) {
    return isLittleEndian ? swapBytes32(w) : w >>> 0;
  }

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

  // node_modules/@bsv/sdk/dist/esm/src/primitives/WriterUint8Array.js
  var _buffer, _pos, _capacity, _WriterUint8Array_instances, ensureCapacity_fn;
  var WriterUint8Array = class {
    constructor(bufs, initialCapacity = 256) {
      __privateAdd(this, _WriterUint8Array_instances);
      __privateAdd(this, _buffer);
      __privateAdd(this, _pos);
      __privateAdd(this, _capacity);
      if (!Number.isSafeInteger(initialCapacity) || initialCapacity < 0) {
        throw new RangeError("WriterUint8Array initial capacity must be a non-negative safe integer");
      }
      if (bufs != null && bufs.length > 0) {
        const totalLength = bufs.reduce((sum, buf) => sum + buf.length, 0);
        initialCapacity = Math.max(initialCapacity, totalLength);
      }
      initialCapacity = Math.max(1, initialCapacity);
      __privateSet(this, _buffer, new Uint8Array(initialCapacity));
      __privateSet(this, _pos, 0);
      __privateSet(this, _capacity, initialCapacity);
      if (bufs != null) {
        for (const buf of bufs) {
          this.write(buf);
        }
      }
    }
    /**
     * Returns the current length of written data
     */
    getLength() {
      return __privateGet(this, _pos);
    }
    /**
     * @return the written data as Uint8Array copy of the internal buffer
     */
    toUint8Array() {
      return __privateGet(this, _buffer).slice(0, __privateGet(this, _pos));
    }
    /**
     * Legacy compatibility method – returns number[] (Byte[])
     */
    toArray() {
      return Array.from(this.toUint8Array());
    }
    /**
     * @return the written data as Uint8Array. CAUTION: This is zero-copy subarray of the internal buffer).
     */
    toUint8ArrayZeroCopy() {
      return __privateGet(this, _buffer).subarray(0, __privateGet(this, _pos));
    }
    /** Ensures room for `additionalBytes` without changing the written length. */
    reserve(additionalBytes) {
      if (!Number.isSafeInteger(additionalBytes) || additionalBytes < 0) {
        throw new RangeError("WriterUint8Array reserve requires a non-negative safe integer");
      }
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, additionalBytes);
    }
    write(bytes3) {
      const data = bytes3 instanceof Uint8Array ? bytes3 : new Uint8Array(bytes3);
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, data.length);
      __privateGet(this, _buffer).set(data, __privateGet(this, _pos));
      __privateSet(this, _pos, __privateGet(this, _pos) + data.length);
      return this;
    }
    writeReverse(buf) {
      const data = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, data.length);
      for (let i = data.length - 1; i >= 0; i--) {
        __privateGet(this, _buffer)[__privateGet(this, _pos)] = data[i];
        __privateSet(this, _pos, __privateGet(this, _pos) + 1);
      }
      return this;
    }
    writeUInt8(value) {
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, 1);
      __privateGet(this, _buffer)[__privateGet(this, _pos)] = value & 255;
      __privateSet(this, _pos, __privateGet(this, _pos) + 1);
      return this;
    }
    writeInt8(value) {
      this.writeUInt8(value);
      return this;
    }
    writeUInt16LE(value) {
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, 2);
      __privateGet(this, _buffer)[__privateGet(this, _pos)] = value & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 1] = value >> 8 & 255;
      __privateSet(this, _pos, __privateGet(this, _pos) + 2);
      return this;
    }
    writeUInt16BE(value) {
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, 2);
      __privateGet(this, _buffer)[__privateGet(this, _pos)] = value >> 8 & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 1] = value & 255;
      __privateSet(this, _pos, __privateGet(this, _pos) + 2);
      return this;
    }
    writeInt16LE(value) {
      this.writeUInt16LE(value & 65535);
      return this;
    }
    writeInt16BE(value) {
      this.writeUInt16BE(value & 65535);
      return this;
    }
    writeUInt32LE(value) {
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, 4);
      __privateGet(this, _buffer)[__privateGet(this, _pos)] = value & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 1] = value >> 8 & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 2] = value >> 16 & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 3] = value >> 24 & 255;
      __privateSet(this, _pos, __privateGet(this, _pos) + 4);
      return this;
    }
    writeUInt32BE(value) {
      __privateMethod(this, _WriterUint8Array_instances, ensureCapacity_fn).call(this, 4);
      __privateGet(this, _buffer)[__privateGet(this, _pos)] = value >> 24 & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 1] = value >> 16 & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 2] = value >> 8 & 255;
      __privateGet(this, _buffer)[__privateGet(this, _pos) + 3] = value & 255;
      __privateSet(this, _pos, __privateGet(this, _pos) + 4);
      return this;
    }
    writeInt32LE(value) {
      this.writeUInt32LE(value >>> 0);
      return this;
    }
    writeInt32BE(value) {
      this.writeUInt32BE(value >>> 0);
      return this;
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
      const buf = new BigNumber(n).toArray("be", 8);
      this.writeReverse(buf);
      return this;
    }
    writeVarIntNum(n) {
      const buf = Writer.varIntNum(n);
      this.write(buf);
      return this;
    }
    writeVarIntBn(bn) {
      const buf = Writer.varIntBn(bn);
      this.write(buf);
      return this;
    }
    /**
     * Resets the writer to empty state (reuses the buffer)
     */
    reset() {
      __privateSet(this, _pos, 0);
    }
  };
  _buffer = new WeakMap();
  _pos = new WeakMap();
  _capacity = new WeakMap();
  _WriterUint8Array_instances = new WeakSet();
  ensureCapacity_fn = function(needed) {
    if (__privateGet(this, _pos) + needed > __privateGet(this, _capacity)) {
      let newCapacity = __privateGet(this, _capacity) * 2;
      while (__privateGet(this, _pos) + needed > newCapacity) {
        newCapacity *= 2;
      }
      const newBuffer = new Uint8Array(newCapacity);
      newBuffer.set(__privateGet(this, _buffer));
      __privateSet(this, _buffer, newBuffer);
      __privateSet(this, _capacity, newCapacity);
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/ReaderUint8Array.js
  var _length, _ReaderUint8Array_instances, ensureAvailable_fn;
  var _ReaderUint8Array = class _ReaderUint8Array {
    constructor(bin = new Uint8Array(0), pos = 0) {
      __privateAdd(this, _ReaderUint8Array_instances);
      __publicField(this, "bin");
      __publicField(this, "pos");
      __privateAdd(this, _length);
      if (bin instanceof Uint8Array) {
        this.bin = bin;
      } else if (Array.isArray(bin)) {
        this.bin = new Uint8Array(bin);
      } else {
        throw new TypeError("ReaderUint8Array constructor: bin must be Uint8Array or number[]");
      }
      __privateSet(this, _length, this.bin.length);
      if (!Number.isSafeInteger(pos) || pos < 0 || pos > __privateGet(this, _length)) {
        throw new RangeError("ReaderUint8Array position exceeds available data");
      }
      this.pos = pos;
    }
    static makeReader(bin, pos = 0) {
      if (bin instanceof Uint8Array) {
        return new _ReaderUint8Array(bin, pos);
      }
      if (Array.isArray(bin)) {
        return new Reader(bin, pos);
      }
      throw new Error("ReaderUint8Array.makeReader: bin must be Uint8Array or number[]");
    }
    eof() {
      return this.pos >= __privateGet(this, _length);
    }
    read(len = __privateGet(this, _length) - this.pos) {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, len);
      const start = this.pos;
      const end = this.pos + len;
      this.pos = end;
      return this.bin.slice(start, end);
    }
    /**
     * Reads a zero-copy view over the backing buffer. The view is valid for the
     * lifetime of the backing `Uint8Array`; callers that require isolation should
     * continue to use {@link read}.
     */
    readView(len = __privateGet(this, _length) - this.pos) {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, len);
      const start = this.pos;
      this.pos += len;
      return this.bin.subarray(start, this.pos);
    }
    /** Advances without allocating. */
    skip(len) {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, len);
      this.pos += len;
    }
    remaining() {
      return __privateGet(this, _length) - this.pos;
    }
    readReverse(len = __privateGet(this, _length) - this.pos) {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, len);
      const buf2 = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        buf2[i] = this.bin[this.pos + len - 1 - i];
      }
      this.pos += len;
      return buf2;
    }
    readUInt8() {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, 1);
      const val = this.bin[this.pos];
      this.pos += 1;
      return val;
    }
    readInt8() {
      const val = this.readUInt8();
      return (val & 128) === 0 ? val : val - 256;
    }
    readUInt16BE() {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, 2);
      const val = this.bin[this.pos] << 8 | this.bin[this.pos + 1];
      this.pos += 2;
      return val;
    }
    readInt16BE() {
      const val = this.readUInt16BE();
      return (val & 32768) === 0 ? val : val - 65536;
    }
    readUInt16LE() {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, 2);
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
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, 4);
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
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, 4);
      const val = (this.bin[this.pos] | this.bin[this.pos + 1] << 8 | this.bin[this.pos + 2] << 16 | this.bin[this.pos + 3] << 24) >>> 0;
      this.pos += 4;
      return val;
    }
    readInt32LE() {
      const val = this.readUInt32LE();
      return (val & 2147483648) === 0 ? val : val - 4294967296;
    }
    readUInt64BEBn() {
      __privateMethod(this, _ReaderUint8Array_instances, ensureAvailable_fn).call(this, 8);
      const bin = Array.from(this.bin.slice(this.pos, this.pos + 8));
      const bn = new BigNumber(bin);
      this.pos = this.pos + 8;
      return bn;
    }
    readUInt64LEBn() {
      const bin = Array.from(this.readReverse(8));
      const bn = new BigNumber(bin);
      return bn;
    }
    readInt64LEBn() {
      const OverflowInt642 = new BigNumber(2).pow(new BigNumber(63));
      const OverflowUint642 = new BigNumber(2).pow(new BigNumber(64));
      const bin = Array.from(this.readReverse(8));
      let bn = new BigNumber(bin);
      if (bn.gte(OverflowInt642)) {
        bn = bn.sub(OverflowUint642);
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
  _length = new WeakMap();
  _ReaderUint8Array_instances = new WeakSet();
  ensureAvailable_fn = function(len) {
    if (!Number.isSafeInteger(len) || len < 0 || !Number.isSafeInteger(this.pos) || this.pos < 0 || this.pos + len > __privateGet(this, _length)) {
      throw new RangeError("ReaderUint8Array read exceeds available data");
    }
  };
  var ReaderUint8Array = _ReaderUint8Array;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/utils.js
  var BufferCtor3 = globalThis.Buffer;
  var CAN_USE_BUFFER3 = BufferCtor3 != null && typeof BufferCtor3.from === "function";
  var toSafeString = (value, fallback = "Unknown value") => {
    if (value === null)
      return "null";
    if (value === void 0)
      return "undefined";
    if (typeof value === "string")
      return value;
    if (typeof value === "number" || typeof value === "bigint")
      return value.toString();
    if (typeof value === "boolean")
      return value ? "true" : "false";
    if (typeof value === "symbol")
      return value.description ?? value.toString();
    if (value instanceof Error && value.message.length > 0)
      return value.message;
    const message = value.message;
    if (typeof message === "string" && message.length > 0)
      return message;
    try {
      return JSON.stringify(value) ?? fallback;
    } catch {
      return fallback;
    }
  };
  var zero2 = (word) => {
    if (word.length % 2 === 1) {
      return "0" + word;
    } else {
      return word;
    }
  };
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
  var toUint8Array = (msg, enc) => {
    if (msg instanceof Uint8Array)
      return msg;
    if (typeof msg === "string" && enc === "hex")
      return hexToUint8Array(msg);
    return new Uint8Array(toArray2(msg, enc));
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
  var toUTF8Strict = (arr) => {
    return new TextDecoder("utf-8", { fatal: true }).decode(arr instanceof Uint8Array ? arr : new Uint8Array(arr));
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
  var toBase58Check = (bin, prefix = [0]) => {
    let hash = hash256([...prefix, ...bin]);
    hash = [...prefix, ...bin, ...hash.slice(0, 4)];
    return toBase58(hash);
  };
  var fromBase58Check = (str, enc, prefixLength = 1) => {
    const bin = fromBase58(str);
    let prefix = bin.slice(0, prefixLength);
    let data = bin.slice(prefixLength, -4);
    let hash = [...prefix, ...data];
    hash = hash256(hash);
    bin.slice(-4).forEach((check, index) => {
      if (check !== hash[index]) {
        throw new Error("Invalid checksum");
      }
    });
    if (enc === "hex") {
      prefix = toHex(prefix);
      data = toHex(data);
    }
    return { prefix, data };
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
  var minimallyEncode = (buf) => {
    if (buf.length === 0) {
      return buf;
    }
    const last = buf.at(-1);
    if ((last & 127) !== 0) {
      return buf;
    }
    if (buf.length === 1) {
      return [];
    }
    if ((buf.at(-2) & 128) !== 0) {
      return buf;
    }
    for (let i = buf.length - 1; i > 0; i--) {
      if (buf[i - 1] !== 0) {
        if ((buf[i - 1] & 128) === 0) {
          buf[i - 1] |= last;
          return buf.slice(0, i);
        } else {
          buf[i] = last;
          return buf.slice(0, i + 1);
        }
      }
    }
    return [];
  };
  var OverflowInt64 = new BigNumber(2).pow(new BigNumber(63));
  var OverflowUint64 = new BigNumber(2).pow(new BigNumber(64));
  function verifyNotNull(value, errorMessage = "Expected a valid value, but got undefined or null.") {
    if (value == null)
      throw new Error(errorMessage);
    return value;
  }
  function constantTimeEquals(a, b) {
    if (a.length !== b.length)
      return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }
    return diff === 0;
  }

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
      this.g = Point.fromJSON(conf.g, conf.gRed);
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
        const mod = k.andln(ws - 1);
        if (k.isOdd()) {
          if (mod > (ws >> 1) - 1) {
            z = (ws >> 1) - mod;
          } else {
            z = mod;
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
    static parseBytes(bytes3) {
      return typeof bytes3 === "string" ? toArray2(bytes3, "hex") : bytes3;
    }
    static intFromLE(bytes3) {
      return new BigNumber(bytes3, "hex", "le");
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
        return new Point(null, null);
      }
      const zinv = this.z.redInvm();
      const zinv2 = zinv.redSqr();
      const ax = this.x.redMul(zinv2);
      const ay = this.y.redMul(zinv2).redMul(zinv);
      return new Point(ax, ay);
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
    dblp(pow) {
      if (pow === 0) {
        return this;
      }
      if (this.isInfinity()) {
        return this;
      }
      if (pow === void 0) {
        return this.dbl();
      }
      let r2 = this;
      for (let i = 0; i < pow; i++) {
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
  var wnafDigits = (scalar, window2) => {
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
    const wnaf = wnafDigits(k, window2);
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
    static fromDER(bytes3) {
      const len = 32;
      if ((bytes3[0] === 4 || bytes3[0] === 6 || bytes3[0] === 7) && bytes3.length - 1 === 2 * len) {
        if (bytes3[0] === 6) {
          if (bytes3.at(-1) % 2 !== 0) {
            throw new Error("Point string value is wrong length");
          }
        } else if (bytes3[0] === 7) {
          if (bytes3.at(-1) % 2 !== 1) {
            throw new Error("Point string value is wrong length");
          }
        }
        const res = new _Point(bytes3.slice(1, 1 + len), bytes3.slice(1 + len, 1 + 2 * len));
        return _Point._assertOnCurve(res);
      } else if ((bytes3[0] === 2 || bytes3[0] === 3) && bytes3.length - 1 === len) {
        return _Point._assertOnCurve(_Point.fromX(bytes3.slice(1, 1 + len), bytes3[0] === 3));
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
      const bytes3 = toArray2(str, "hex");
      return _Point._assertOnCurve(_Point.fromDER(bytes3));
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
      const split2 = this.curve._endoSplit(coeffs[i]);
      let p = points[i];
      let beta = __privateMethod(_a = p, _Point_instances, _getBeta_fn).call(_a) ?? new _Point(null, null);
      if (split2.k1.negative !== 0) {
        split2.k1.ineg();
        p = p.neg(true);
      }
      if (split2.k2.negative !== 0) {
        split2.k2.ineg();
        beta = beta.neg(true);
      }
      npoints[i * 2] = p;
      npoints[i * 2 + 1] = beta;
      ncoeffs[i * 2] = split2.k1;
      ncoeffs[i * 2 + 1] = split2.k2;
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
  var Point = _Point;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/PublicKey.js
  var PublicKey = class _PublicKey extends Point {
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
      const p = Point.fromString(str);
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
    static fromDER(bytes3) {
      const p = Point.fromDER(bytes3);
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
      if (x instanceof Point) {
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
      const msgHash = new BigNumber(sha256(msg, enc), 16);
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
      const pkh = hash160(this.encode(true));
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
    toAddress(prefix = [0]) {
      if (typeof prefix === "string") {
        if (prefix === "testnet" || prefix === "test") {
          prefix = [111];
        } else if (prefix === "mainnet" || prefix === "main") {
          prefix = [0];
        } else {
          throw new Error(`Invalid prefix ${prefix}`);
        }
      }
      return toBase58Check(this.toHash(), prefix);
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
      const hmac2 = sha256hmac(sharedSecret.encode(true), invoiceNumberBin);
      const curve2 = new Curve();
      const point = curve2.g.mul(new BigNumber(hmac2));
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
      const msgHash = new BigNumber(sha256(msg, enc), 16);
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
      const R = Point.fromX(x, isYOdd);
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
    const bytes3 = bn.toArray("be");
    let x = 0n;
    for (const byte of bytes3) {
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
      const msgHash = new BigNumber(sha256(msg, enc), 16);
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
      const msgHash = new BigNumber(sha256(msg, enc), 16);
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
    toWif(prefix = [128]) {
      if (!this.isValid()) {
        throw new Error("Value is out of field");
      }
      return toBase58Check([...this.toArray("be", 32), 1], prefix);
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
    toAddress(prefix = [0]) {
      return this.toPublicKey().toAddress(prefix);
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
      const hmac2 = sha256hmac(sharedSecret.encode(true), invoiceNumberBin);
      const curve2 = new Curve();
      return new _PrivateKey(this.add(new BigNumber(hmac2)).mod(curve2.n).toArray());
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

  // node_modules/@bsv/sdk/dist/esm/src/script/OP.js
  var namedOP = {
    // push value
    OP_0: 0,
    // when two op codes have the same value, the top one will be used in standard ASM output
    OP_FALSE: 0,
    OP_PUSHDATA1: 76,
    OP_PUSHDATA2: 77,
    OP_PUSHDATA4: 78,
    OP_1NEGATE: 79,
    OP_RESERVED: 80,
    OP_1: 81,
    OP_TRUE: 81,
    OP_2: 82,
    OP_3: 83,
    OP_4: 84,
    OP_5: 85,
    OP_6: 86,
    OP_7: 87,
    OP_8: 88,
    OP_9: 89,
    OP_10: 90,
    OP_11: 91,
    OP_12: 92,
    OP_13: 93,
    OP_14: 94,
    OP_15: 95,
    OP_16: 96,
    // control
    OP_NOP: 97,
    OP_VER: 98,
    OP_IF: 99,
    OP_NOTIF: 100,
    OP_VERIF: 101,
    OP_VERNOTIF: 102,
    OP_ELSE: 103,
    OP_ENDIF: 104,
    OP_VERIFY: 105,
    OP_RETURN: 106,
    // stack ops
    OP_TOALTSTACK: 107,
    OP_FROMALTSTACK: 108,
    OP_2DROP: 109,
    OP_2DUP: 110,
    OP_3DUP: 111,
    OP_2OVER: 112,
    OP_2ROT: 113,
    OP_2SWAP: 114,
    OP_IFDUP: 115,
    OP_DEPTH: 116,
    OP_DROP: 117,
    OP_DUP: 118,
    OP_NIP: 119,
    OP_OVER: 120,
    OP_PICK: 121,
    OP_ROLL: 122,
    OP_ROT: 123,
    OP_SWAP: 124,
    OP_TUCK: 125,
    // data manipulation ops
    OP_CAT: 126,
    OP_SPLIT: 127,
    // after monolith upgrade (May 2018)
    OP_NUM2BIN: 128,
    // after monolith upgrade (May 2018)
    OP_BIN2NUM: 129,
    // after monolith upgrade (May 2018)
    OP_SIZE: 130,
    // bit logic
    OP_INVERT: 131,
    OP_AND: 132,
    OP_OR: 133,
    OP_XOR: 134,
    OP_EQUAL: 135,
    OP_EQUALVERIFY: 136,
    OP_RESERVED1: 137,
    OP_RESERVED2: 138,
    // numeric
    OP_1ADD: 139,
    OP_1SUB: 140,
    OP_2MUL: 141,
    OP_2DIV: 142,
    OP_NEGATE: 143,
    OP_ABS: 144,
    OP_NOT: 145,
    OP_0NOTEQUAL: 146,
    OP_ADD: 147,
    OP_SUB: 148,
    OP_MUL: 149,
    OP_DIV: 150,
    OP_MOD: 151,
    OP_LSHIFT: 152,
    OP_RSHIFT: 153,
    OP_BOOLAND: 154,
    OP_BOOLOR: 155,
    OP_NUMEQUAL: 156,
    OP_NUMEQUALVERIFY: 157,
    OP_NUMNOTEQUAL: 158,
    OP_LESSTHAN: 159,
    OP_GREATERTHAN: 160,
    OP_LESSTHANOREQUAL: 161,
    OP_GREATERTHANOREQUAL: 162,
    OP_MIN: 163,
    OP_MAX: 164,
    OP_WITHIN: 165,
    // crypto
    OP_RIPEMD160: 166,
    OP_SHA1: 167,
    OP_SHA256: 168,
    OP_HASH160: 169,
    OP_HASH256: 170,
    OP_CODESEPARATOR: 171,
    OP_CHECKSIG: 172,
    OP_CHECKSIGVERIFY: 173,
    OP_CHECKMULTISIG: 174,
    OP_CHECKMULTISIGVERIFY: 175,
    // expansion
    OP_NOP1: 176,
    OP_CHECKLOCKTIMEVERIFY: 177,
    // BIP65 - on BSV post-genesis acts as NOP
    OP_NOP2: 177,
    // alias for OP_CHECKLOCKTIMEVERIFY
    OP_CHECKSEQUENCEVERIFY: 178,
    // BIP112 - on BSV post-genesis acts as NOP
    OP_NOP3: 178,
    // alias for OP_CHECKSEQUENCEVERIFY
    OP_SUBSTR: 179,
    // restored in 2026 CHRONICLE upgrade (was OP_NOP4)
    OP_NOP4: 179,
    // alias for OP_SUBSTR
    OP_LEFT: 180,
    // restored in 2026 CHRONICLE upgrade (was OP_NOP5)
    OP_NOP5: 180,
    // alias for OP_LEFT
    OP_RIGHT: 181,
    // restored in 2026 CHRONICLE upgrade (was OP_NOP6)
    OP_NOP6: 181,
    // alias for OP_RIGHT
    OP_LSHIFTNUM: 182,
    // restored in 2026 CHRONICLE upgrade (was OP_NOP7)
    OP_NOP7: 182,
    // alias for OP_LSHIFTNUM
    OP_RSHIFTNUM: 183,
    // restored in 2026 CHRONICLE upgrade (was OP_NOP8)
    OP_NOP8: 183,
    // alias for OP_RSHIFTNUM
    OP_NOP9: 184,
    OP_NOP10: 185,
    // 0xba–0xf9 are FIRST_UNDEFINED_OP_VALUE in node v1.2.0 and return SCRIPT_ERR_BAD_OPCODE
    // when executed. The names below are retained for ASM parsing/serialisation only.
    OP_NOP11: 186,
    OP_NOP12: 187,
    OP_NOP13: 188,
    OP_NOP14: 189,
    OP_NOP15: 190,
    OP_NOP16: 191,
    OP_NOP17: 192,
    OP_NOP18: 193,
    OP_NOP19: 194,
    OP_NOP20: 195,
    OP_NOP21: 196,
    OP_NOP22: 197,
    OP_NOP23: 198,
    OP_NOP24: 199,
    OP_NOP25: 200,
    OP_NOP26: 201,
    OP_NOP27: 202,
    OP_NOP28: 203,
    OP_NOP29: 204,
    OP_NOP30: 205,
    OP_NOP31: 206,
    OP_NOP32: 207,
    OP_NOP33: 208,
    OP_NOP34: 209,
    OP_NOP35: 210,
    OP_NOP36: 211,
    OP_NOP37: 212,
    OP_NOP38: 213,
    OP_NOP39: 214,
    OP_NOP40: 215,
    OP_NOP41: 216,
    OP_NOP42: 217,
    OP_NOP43: 218,
    OP_NOP44: 219,
    OP_NOP45: 220,
    OP_NOP46: 221,
    OP_NOP47: 222,
    OP_NOP48: 223,
    OP_NOP49: 224,
    OP_NOP50: 225,
    OP_NOP51: 226,
    OP_NOP52: 227,
    OP_NOP53: 228,
    OP_NOP54: 229,
    OP_NOP55: 230,
    OP_NOP56: 231,
    OP_NOP57: 232,
    OP_NOP58: 233,
    OP_NOP59: 234,
    OP_NOP60: 235,
    OP_NOP61: 236,
    OP_NOP62: 237,
    OP_NOP63: 238,
    OP_NOP64: 239,
    OP_NOP65: 240,
    OP_NOP66: 241,
    OP_NOP67: 242,
    OP_NOP68: 243,
    OP_NOP69: 244,
    OP_NOP70: 245,
    OP_NOP71: 246,
    OP_NOP72: 247,
    OP_NOP73: 248,
    OP_NOP77: 252,
    // template matching params (not executable opcodes; 0xf9 was removed from node v1.2.0 opcodes.h
    // but retained here for ASM round-trip compatibility)
    OP_SMALLDATA: 249,
    OP_SMALLINTEGER: 250,
    OP_PUBKEYS: 251,
    OP_PUBKEYHASH: 253,
    OP_PUBKEY: 254,
    OP_INVALIDOPCODE: 255
  };
  var OP = namedOP;
  for (const name of Object.keys(namedOP)) {
    const opcode = namedOP[name];
    OP[opcode] ?? (OP[opcode] = name);
  }
  var OP_default = OP;

  // node_modules/@bsv/sdk/dist/esm/src/script/Script.js
  var BufferCtor4 = typeof globalThis === "undefined" ? void 0 : globalThis.Buffer;
  var serializedBytes = Symbol();
  function scriptSerializationIdentity(script) {
    return script[serializedBytes]();
  }
  function serializedChunkPrefix(chunk) {
    const dataLength = chunk.data?.length ?? 0;
    if (dataLength === 0 || chunk.op === OP_default.OP_RETURN || chunk.op < OP_default.OP_PUSHDATA1) {
      return [chunk.op];
    }
    if (chunk.op === OP_default.OP_PUSHDATA1) {
      return [chunk.op, dataLength & 255];
    }
    if (chunk.op === OP_default.OP_PUSHDATA2) {
      return [chunk.op, dataLength & 255, dataLength >> 8 & 255];
    }
    if (chunk.op === OP_default.OP_PUSHDATA4) {
      const size = dataLength >>> 0;
      return [chunk.op, size & 255, size >> 8 & 255, size >> 16 & 255, size >> 24 & 255];
    }
    return void 0;
  }
  function chunkMatchesBytes(chunk, targetBytes) {
    const prefix = serializedChunkPrefix(chunk);
    const data = chunk.data ?? [];
    if (prefix == null || targetBytes.length !== prefix.length + data.length)
      return false;
    for (let i = 0; i < prefix.length; i++) {
      if (targetBytes[i] !== prefix[i])
        return false;
    }
    for (let i = 0; i < data.length; i++) {
      if (targetBytes[prefix.length + i] !== data[i])
        return false;
    }
    return true;
  }
  var __chunks, _parsed, _rawBytesCache, _hexCache, _chunkCacheState, _Script_static, pushdataOpCodeNum_fn, parseASMToken_fn, _Script_instances, ensureParsed_fn, computeSerializedLength_fn, serializeChunksToBytes_fn, invalidateSerializationCaches_fn, captureChunkCacheState_fn, chunkCacheMatchesState_fn, getSerializedBytes_fn, writeChunkData_fn, readPushdataLength_fn, parseChunks_fn, removeOpcodeBytes_fn, copyRange_fn, _chunkToString_fn;
  var _Script = class _Script {
    /**
     * @constructor
     * Constructs a new Script object.
     * @param chunks=[] - An array of script chunks to directly initialize the script.
     * @param rawBytesCache - Optional serialized bytes that can be reused instead of reserializing `chunks`.
     * @param hexCache - Optional lowercase hex string that matches the serialized bytes, used to satisfy `toHex` quickly.
     * @param parsed - When false the script defers parsing `rawBytesCache` until `chunks` is accessed; defaults to true.
     */
    constructor(chunks = [], rawBytesCache, hexCache, parsed = true) {
      __privateAdd(this, _Script_instances);
      __privateAdd(this, __chunks);
      __privateAdd(this, _parsed);
      __privateAdd(this, _rawBytesCache);
      __privateAdd(this, _hexCache);
      __privateAdd(this, _chunkCacheState);
      __privateSet(this, __chunks, chunks);
      __privateSet(this, _parsed, parsed);
      __privateSet(this, _rawBytesCache, rawBytesCache);
      __privateSet(this, _hexCache, hexCache);
    }
    /**
     * @method fromASM
     * Static method to construct a Script instance from an ASM (Assembly) formatted string.
     * @param asm - The script in ASM string format.
     * @returns A new Script instance.
     * @example
     * const script = Script.fromASM("OP_DUP OP_HASH160 abcd... OP_EQUALVERIFY OP_CHECKSIG")
     */
    static fromASM(asm) {
      var _a;
      const chunks = [];
      const tokens = asm.split(" ");
      let i = 0;
      while (i < tokens.length) {
        const { chunk, advance } = __privateMethod(_a = _Script, _Script_static, parseASMToken_fn).call(_a, tokens, i);
        chunks.push(chunk);
        i += advance;
      }
      return new _Script(chunks);
    }
    /**
     * @method fromHex
     * Static method to construct a Script instance from a hexadecimal string.
     * @param hex - The script in hexadecimal format.
     * @returns A new Script instance.
     * @example
     * const script = Script.fromHex("76a9...");
     */
    static fromHex(hex2) {
      if (hex2.length === 0)
        return _Script.fromBinary([]);
      if (hex2.length % 2 !== 0) {
        throw new Error("There is an uneven number of characters in the string which suggests it is not hex encoded.");
      }
      let rawBytes;
      try {
        rawBytes = hexToUint8Array(hex2);
      } catch {
        throw new Error("Some elements in this string are not hex encoded.");
      }
      return new _Script([], rawBytes, hex2.toLowerCase(), false);
    }
    /**
     * @method fromBinary
     * Static method to construct a Script instance from a binary array.
     * @param bin - The script in binary array format.
     * @returns A new Script instance.
     * @example
     * const script = Script.fromBinary([0x76, 0xa9, ...])
     */
    static fromBinary(bin) {
      const rawBytes = Uint8Array.from(bin);
      return new _Script([], rawBytes, void 0, false);
    }
    /**
     * Constructs a lazily parsed script over an existing byte view without a copy.
     * The caller must not mutate `bin` while the script is in use.
     */
    static fromBinaryView(bin) {
      return new _Script([], bin, void 0, false);
    }
    /**
     * Script chunks. Prefer the Script mutation methods or assign a replacement
     * array through this property. In-place chunk and data changes are detected
     * before subsequent serialization.
     */
    get chunks() {
      __privateMethod(this, _Script_instances, ensureParsed_fn).call(this);
      return __privateGet(this, __chunks);
    }
    set chunks(value) {
      __privateSet(this, __chunks, value);
      __privateSet(this, _parsed, true);
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
    }
    /**
     * @method toASM
     * Serializes the script to an ASM formatted string.
     * @returns The script in ASM string format.
     */
    toASM() {
      let str = "";
      for (const chunk of this.chunks) {
        str += __privateMethod(this, _Script_instances, _chunkToString_fn).call(this, chunk);
      }
      return str.slice(1);
    }
    /**
     * @method toHex
     * Serializes the script to a hexadecimal string.
     * @returns The script in hexadecimal format.
     */
    toHex() {
      const bytes3 = __privateMethod(this, _Script_instances, getSerializedBytes_fn).call(this);
      if (__privateGet(this, _hexCache) != null) {
        return __privateGet(this, _hexCache);
      }
      const hex2 = BufferCtor4 == null ? encode(Array.from(bytes3), "hex") : BufferCtor4.from(bytes3).toString("hex");
      __privateSet(this, _hexCache, hex2);
      return hex2;
    }
    /**
     * @method toBinary
     * Serializes the script to a binary array.
     * @returns The script in binary array format.
     */
    toBinary() {
      return Array.from(this.toUint8Array());
    }
    toUint8Array() {
      return Uint8Array.from(__privateMethod(this, _Script_instances, getSerializedBytes_fn).call(this));
    }
    [serializedBytes]() {
      return __privateMethod(this, _Script_instances, getSerializedBytes_fn).call(this);
    }
    /**
     * @method writeScript
     * Appends another script to this script.
     * @param script - The script to append.
     * @returns This script instance for chaining.
     */
    writeScript(script) {
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
      this.chunks = this.chunks.concat(script.chunks);
      return this;
    }
    /**
     * @method writeOpCode
     * Appends an opcode to the script.
     * @param op - The opcode to append.
     * @returns This script instance for chaining.
     */
    writeOpCode(op) {
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
      this.chunks.push({ op });
      return this;
    }
    /**
     * @method setChunkOpCode
     * Sets the opcode of a specific chunk in the script.
     * @param i - The index of the chunk.
     * @param op - The opcode to set.
     * @returns This script instance for chaining.
     */
    setChunkOpCode(i, op) {
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
      this.chunks[i] = { op };
      return this;
    }
    /**
     * @method writeBn
     * Appends a BigNumber to the script as an opcode.
     * @param bn - The BigNumber to append.
     * @returns This script instance for chaining.
     */
    writeBn(bn) {
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
      if (bn.cmpn(0) === OP_default.OP_0) {
        this.chunks.push({
          op: OP_default.OP_0
        });
      } else if (bn.cmpn(-1) === 0) {
        this.chunks.push({
          op: OP_default.OP_1NEGATE
        });
      } else if (bn.cmpn(1) >= 0 && bn.cmpn(16) <= 0) {
        this.chunks.push({
          op: bn.toNumber() + OP_default.OP_1 - 1
        });
      } else {
        const buf = bn.toSm("little");
        this.writeBin(buf);
      }
      return this;
    }
    /**
     * @method writeBin
     * Appends binary data to the script, determining the appropriate opcode based on length.
     * @param bin - The binary data to append.
     * @returns This script instance for chaining.
     * @throws {Error} Throws an error if the data is too large to be pushed.
     */
    writeBin(bin) {
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
      let op;
      const data = bin.length > 0 ? bin : void 0;
      if (bin.length > 0 && bin.length < OP_default.OP_PUSHDATA1) {
        op = bin.length;
      } else if (bin.length === 0) {
        op = OP_default.OP_0;
      } else if (bin.length < Math.pow(2, 8)) {
        op = OP_default.OP_PUSHDATA1;
      } else if (bin.length < Math.pow(2, 16)) {
        op = OP_default.OP_PUSHDATA2;
      } else if (bin.length < Math.pow(2, 32)) {
        op = OP_default.OP_PUSHDATA4;
      } else {
        throw new Error("You can't push that much data");
      }
      this.chunks.push({
        data,
        op
      });
      return this;
    }
    /**
     * @method writeNumber
     * Appends a number to the script.
     * @param num - The number to append.
     * @returns This script instance for chaining.
     */
    writeNumber(num) {
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
      this.writeBn(new BigNumber(num));
      return this;
    }
    /**
     * @method removeCodeseparators
     * Removes all OP_CODESEPARATOR opcodes from the script.
     * @returns This script instance for chaining.
     */
    removeCodeseparators() {
      var _a;
      const bytes3 = this.toUint8Array();
      __privateSet(this, _rawBytesCache, Uint8Array.from(__privateMethod(_a = _Script, _Script_static, removeOpcodeBytes_fn).call(_a, bytes3, OP_default.OP_CODESEPARATOR)));
      __privateSet(this, _hexCache, void 0);
      __privateSet(this, __chunks, []);
      __privateSet(this, _parsed, false);
      return this;
    }
    /**
     * Deletes the given item wherever it appears in the current script.
     *
     * @param script - The script containing the item to delete from the current script.
     *
     * @returns This script instance for chaining.
     */
    findAndDelete(script) {
      __privateMethod(this, _Script_instances, invalidateSerializationCaches_fn).call(this);
      const targetBytes = script.toUint8Array();
      if (targetBytes.length === 0)
        return this;
      for (let i = 0; i < this.chunks.length; ) {
        if (chunkMatchesBytes(this.chunks[i], targetBytes)) {
          this.chunks.splice(i, 1);
        } else {
          i++;
        }
      }
      return this;
    }
    /**
     * @method isPushOnly
     * Checks if the script contains only push data operations.
     * @returns True if the script is push-only, otherwise false.
     */
    isPushOnly() {
      for (const chunk of this.chunks) {
        const opCodeNum = chunk.op;
        if (opCodeNum > OP_default.OP_16) {
          return false;
        }
      }
      return true;
    }
    /**
     * @method isLockingScript
     * Determines if the script is a locking script.
     * @returns True if the script is a locking script, otherwise false.
     */
    isLockingScript() {
      throw new Error("Not implemented");
    }
    /**
     * @method isUnlockingScript
     * Determines if the script is an unlocking script.
     * @returns True if the script is an unlocking script, otherwise false.
     */
    isUnlockingScript() {
      throw new Error("Not implemented");
    }
  };
  __chunks = new WeakMap();
  _parsed = new WeakMap();
  _rawBytesCache = new WeakMap();
  _hexCache = new WeakMap();
  _chunkCacheState = new WeakMap();
  _Script_static = new WeakSet();
  pushdataOpCodeNum_fn = function(len) {
    if (len >= 0 && len < OP_default.OP_PUSHDATA1)
      return len;
    if (len < Math.pow(2, 8))
      return OP_default.OP_PUSHDATA1;
    if (len < Math.pow(2, 16))
      return OP_default.OP_PUSHDATA2;
    return OP_default.OP_PUSHDATA4;
  };
  parseASMToken_fn = function(tokens, i) {
    var _a;
    const token = tokens[i];
    if (token === "0")
      return { chunk: { op: 0 }, advance: 1 };
    if (token === "-1")
      return { chunk: { op: OP_default.OP_1NEGATE }, advance: 1 };
    const isKnownOp = token.startsWith("OP_") && OP_default[token] !== void 0;
    const opCodeNum = isKnownOp ? OP_default[token] : 0;
    if (opCodeNum === OP_default.OP_PUSHDATA1 || opCodeNum === OP_default.OP_PUSHDATA2 || opCodeNum === OP_default.OP_PUSHDATA4) {
      return { chunk: { data: toArray2(tokens[i + 2], "hex"), op: opCodeNum }, advance: 3 };
    }
    if (!isKnownOp) {
      let hex2 = token;
      if (hex2.length % 2 !== 0)
        hex2 = "0" + hex2;
      const arr = toArray2(hex2, "hex");
      if (encode(arr, "hex") !== hex2) {
        throw new Error("invalid hex string in script");
      }
      return { chunk: { data: arr, op: __privateMethod(_a = _Script, _Script_static, pushdataOpCodeNum_fn).call(_a, arr.length) }, advance: 1 };
    }
    return { chunk: { op: opCodeNum }, advance: 1 };
  };
  _Script_instances = new WeakSet();
  ensureParsed_fn = function() {
    var _a;
    if (__privateGet(this, _parsed))
      return;
    if (__privateGet(this, _rawBytesCache) != null) {
      __privateSet(this, __chunks, __privateMethod(_a = _Script, _Script_static, parseChunks_fn).call(_a, __privateGet(this, _rawBytesCache)));
    } else {
      __privateSet(this, __chunks, []);
    }
    __privateSet(this, _parsed, true);
    __privateMethod(this, _Script_instances, captureChunkCacheState_fn).call(this);
  };
  computeSerializedLength_fn = function(chunks) {
    let total = 0;
    for (const chunk of chunks) {
      total += 1;
      if (chunk.data == null)
        continue;
      const len = chunk.data.length;
      if (chunk.op === OP_default.OP_RETURN) {
        total += len;
        break;
      }
      if (chunk.op < OP_default.OP_PUSHDATA1) {
        total += len;
      } else if (chunk.op === OP_default.OP_PUSHDATA1) {
        total += 1 + len;
      } else if (chunk.op === OP_default.OP_PUSHDATA2) {
        total += 2 + len;
      } else if (chunk.op === OP_default.OP_PUSHDATA4) {
        total += 4 + len;
      }
    }
    return total;
  };
  serializeChunksToBytes_fn = function() {
    var _a, _b;
    const chunks = this.chunks;
    const totalLength = __privateMethod(_a = _Script, _Script_static, computeSerializedLength_fn).call(_a, chunks);
    const bytes3 = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      bytes3[offset++] = chunk.op;
      if (chunk.data == null)
        continue;
      if (chunk.op === OP_default.OP_RETURN) {
        bytes3.set(chunk.data, offset);
        break;
      }
      offset = __privateMethod(_b = _Script, _Script_static, writeChunkData_fn).call(_b, bytes3, offset, chunk.op, chunk.data);
    }
    return bytes3;
  };
  invalidateSerializationCaches_fn = function() {
    __privateSet(this, _rawBytesCache, void 0);
    __privateSet(this, _hexCache, void 0);
    __privateSet(this, _chunkCacheState, void 0);
  };
  captureChunkCacheState_fn = function() {
    __privateSet(this, _chunkCacheState, __privateGet(this, __chunks).map((ref) => ({
      ref,
      op: ref.op,
      dataRef: ref.data,
      data: ref.data == null ? void 0 : Array.from(ref.data)
    })));
  };
  chunkCacheMatchesState_fn = function() {
    if (__privateGet(this, _chunkCacheState)?.length !== __privateGet(this, __chunks).length)
      return false;
    for (let index = 0; index < __privateGet(this, __chunks).length; index++) {
      const chunk = __privateGet(this, __chunks)[index];
      const state = __privateGet(this, _chunkCacheState)[index];
      if (state.ref !== chunk || state.op !== chunk.op || state.dataRef !== chunk.data || state.data?.length !== chunk.data?.length)
        return false;
      if (state.data != null && chunk.data != null) {
        for (let byte = 0; byte < state.data.length; byte++) {
          if (state.data[byte] !== chunk.data[byte])
            return false;
        }
      }
    }
    return true;
  };
  getSerializedBytes_fn = function() {
    if (!__privateGet(this, _parsed) && __privateGet(this, _rawBytesCache) != null)
      return __privateGet(this, _rawBytesCache);
    __privateMethod(this, _Script_instances, ensureParsed_fn).call(this);
    if (__privateGet(this, _rawBytesCache) == null || !__privateMethod(this, _Script_instances, chunkCacheMatchesState_fn).call(this)) {
      __privateSet(this, _rawBytesCache, __privateMethod(this, _Script_instances, serializeChunksToBytes_fn).call(this));
      __privateSet(this, _hexCache, void 0);
      __privateMethod(this, _Script_instances, captureChunkCacheState_fn).call(this);
    }
    return __privateGet(this, _rawBytesCache);
  };
  writeChunkData_fn = function(target, offset, op, data) {
    const len = data.length;
    if (op < OP_default.OP_PUSHDATA1) {
      target.set(data, offset);
      return offset + len;
    } else if (op === OP_default.OP_PUSHDATA1) {
      target[offset++] = len & 255;
      target.set(data, offset);
      return offset + len;
    } else if (op === OP_default.OP_PUSHDATA2) {
      target[offset++] = len & 255;
      target[offset++] = len >> 8 & 255;
      target.set(data, offset);
      return offset + len;
    } else if (op === OP_default.OP_PUSHDATA4) {
      const size = len >>> 0;
      target[offset++] = size & 255;
      target[offset++] = size >> 8 & 255;
      target[offset++] = size >> 16 & 255;
      target[offset++] = size >> 24 & 255;
      target.set(data, offset);
      return offset + len;
    }
    return offset;
  };
  readPushdataLength_fn = function(op, bytes3, pos, length) {
    if (op > 0 && op < OP_default.OP_PUSHDATA1) {
      return { len: op, newPos: pos, hasLength: true };
    }
    if (op === OP_default.OP_PUSHDATA1) {
      const hasLength2 = pos < length;
      const len2 = hasLength2 ? bytes3[pos++] ?? 0 : 0;
      return { len: len2, newPos: pos, hasLength: hasLength2 };
    }
    if (op === OP_default.OP_PUSHDATA2) {
      const hasLength2 = pos + 1 < length;
      const len2 = (bytes3[pos] ?? 0) | (bytes3[pos + 1] ?? 0) << 8;
      return { len: len2, newPos: Math.min(pos + 2, length), hasLength: hasLength2 };
    }
    const hasLength = pos + 3 < length;
    const len = ((bytes3[pos] ?? 0) | (bytes3[pos + 1] ?? 0) << 8 | (bytes3[pos + 2] ?? 0) << 16 | (bytes3[pos + 3] ?? 0) << 24) >>> 0;
    return { len, newPos: Math.min(pos + 4, length), hasLength };
  };
  parseChunks_fn = function(bytes3) {
    var _a, _b, _c;
    const chunks = [];
    const length = bytes3.length;
    let pos = 0;
    let inConditionalBlock = 0;
    while (pos < length) {
      const op = bytes3[pos++] ?? 0;
      if (op === OP_default.OP_RETURN && inConditionalBlock === 0) {
        chunks.push({ op, data: __privateMethod(_a = _Script, _Script_static, copyRange_fn).call(_a, bytes3, pos, length) });
        break;
      }
      if (op === OP_default.OP_IF || op === OP_default.OP_NOTIF || op === OP_default.OP_VERIF || op === OP_default.OP_VERNOTIF) {
        inConditionalBlock++;
      } else if (op === OP_default.OP_ENDIF) {
        inConditionalBlock--;
      }
      if (op > 0 && op <= OP_default.OP_PUSHDATA4) {
        const { len, newPos, hasLength } = __privateMethod(_b = _Script, _Script_static, readPushdataLength_fn).call(_b, op, bytes3, pos, length);
        pos = newPos;
        const end = Math.min(pos + len, length);
        const invalidLength = !hasLength || end - pos !== len;
        chunks.push({ data: __privateMethod(_c = _Script, _Script_static, copyRange_fn).call(_c, bytes3, pos, end), op, invalidLength });
        pos = end;
      } else {
        chunks.push({ op });
      }
    }
    return chunks;
  };
  removeOpcodeBytes_fn = function(bytes3, opcode) {
    var _a;
    const out = [];
    const length = bytes3.length;
    let pos = 0;
    while (pos < length) {
      const start = pos;
      const op = bytes3[pos++] ?? 0;
      if (op > 0 && op <= OP_default.OP_PUSHDATA4) {
        const { len, newPos } = __privateMethod(_a = _Script, _Script_static, readPushdataLength_fn).call(_a, op, bytes3, pos, length);
        pos = newPos;
        const end = Math.min(pos + len, length);
        if (op !== opcode) {
          for (let i = start; i < end; i++)
            out.push(bytes3[i] ?? 0);
        }
        pos = end;
      } else if (op !== opcode) {
        out.push(op);
      }
    }
    return out;
  };
  copyRange_fn = function(bytes3, start, end) {
    const size = Math.max(end - start, 0);
    const data = Array.from({ length: size }, () => 0);
    for (let i = 0; i < size; i++) {
      data[i] = bytes3[start + i] ?? 0;
    }
    return data;
  };
  _chunkToString_fn = function(chunk) {
    const op = chunk.op;
    let str = "";
    if (chunk.data === void 0) {
      const val = OP_default[op];
      str = `${str} ${val}`;
    } else {
      str = `${str} ${toHex(chunk.data)}`;
    }
    return str;
  };
  __privateAdd(_Script, _Script_static);
  var Script = _Script;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/TransactionSignature.js
  var EMPTY_SCRIPT = new Uint8Array(0);
  var ZERO_HASH = Object.freeze(Array.from({ length: 32 }, () => 0));
  function originalPushLength(source, position, opcode) {
    if (opcode > 0 && opcode < OP_default.OP_PUSHDATA1)
      return { length: opcode, nextPosition: position };
    if (opcode === OP_default.OP_PUSHDATA1) {
      if (source.length - position < 1)
        return void 0;
      return { length: source[position], nextPosition: position + 1 };
    }
    if (opcode === OP_default.OP_PUSHDATA2) {
      if (source.length - position < 2)
        return void 0;
      return { length: source[position] | source[position + 1] << 8, nextPosition: position + 2 };
    }
    if (opcode === OP_default.OP_PUSHDATA4) {
      if (source.length - position < 4)
        return void 0;
      return {
        length: (source[position] | source[position + 1] << 8 | source[position + 2] << 16 | source[position + 3] << 24) >>> 0,
        nextPosition: position + 4
      };
    }
    return { length: 0, nextPosition: position };
  }
  function originalScriptCode(script) {
    const source = script.toBinary();
    const bytes3 = [];
    let position = 0;
    let segmentStart = 0;
    let separators = 0;
    const appendSegment = (end) => {
      for (let index = segmentStart; index < end; index++)
        bytes3.push(source[index]);
    };
    while (position < source.length) {
      const opcodeStart = position;
      const opcode = source[position++];
      const push = originalPushLength(source, position, opcode);
      if (push == null)
        break;
      position = push.nextPosition;
      if (source.length - position < push.length)
        break;
      position += push.length;
      if (opcode === OP_default.OP_CODESEPARATOR) {
        appendSegment(opcodeStart);
        segmentStart = position;
        separators++;
      }
    }
    appendSegment(position);
    return { bytes: bytes3, encodedLength: source.length - separators };
  }
  function bip143Inputs(params, currentInput) {
    if (params.allInputs != null)
      return params.allInputs;
    const inputs = [...params.otherInputs];
    inputs.splice(params.inputIndex, 0, currentInput);
    return inputs;
  }
  function bip143InputAt(inputs, inputIndex, currentInput, index) {
    return index === inputIndex ? currentInput : inputs[index];
  }
  function hashPrevouts(inputs, inputIndex, currentInput) {
    const writer = new Writer();
    for (let index = 0; index < inputs.length; index++) {
      const input = bip143InputAt(inputs, inputIndex, currentInput, index);
      if (input.sourceTXID == null) {
        if (input.sourceTransaction == null)
          throw new Error("Missing sourceTransaction for input");
        writer.write(input.sourceTransaction.hash());
      } else {
        writer.writeReverse(toArray2(input.sourceTXID, "hex"));
      }
      writer.writeUInt32LE(input.sourceOutputIndex);
    }
    return hash256(writer.toUint8Array());
  }
  function hashSequences(inputs, inputIndex, currentInput) {
    const writer = new Writer();
    for (let index = 0; index < inputs.length; index++) {
      const input = bip143InputAt(inputs, inputIndex, currentInput, index);
      writer.writeUInt32LE(input.sequence ?? 4294967295);
    }
    return hash256(writer.toUint8Array());
  }
  function writeBip143Output(writer, output) {
    writer.writeUInt64LE(output.satoshis ?? 0);
    const script = output.lockingScript?.toUint8Array() ?? EMPTY_SCRIPT;
    writer.writeVarIntNum(script.length);
    writer.write(script);
  }
  function hashOutputs(outputs, outputIndex) {
    const writer = new Writer();
    if (outputIndex == null) {
      for (const output of outputs)
        writeBip143Output(writer, output);
    } else {
      const output = outputs[outputIndex];
      if (output == null)
        throw new Error(`Output at index ${outputIndex} does not exist`);
      writeBip143Output(writer, output);
    }
    return hash256(writer.toUint8Array());
  }
  function bip143PrevoutsHash(params, inputs, currentInput) {
    if ((params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) !== 0)
      return [...ZERO_HASH];
    if (params.cache?.hashPrevouts != null)
      return params.cache.hashPrevouts;
    const hash = hashPrevouts(inputs, params.inputIndex, currentInput);
    if (params.cache != null)
      params.cache.hashPrevouts = hash;
    return hash;
  }
  function bip143SequenceHash(params, inputs, currentInput) {
    const baseScope = params.scope & 31;
    if ((params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) !== 0 || baseScope === TransactionSignature.SIGHASH_SINGLE || baseScope === TransactionSignature.SIGHASH_NONE)
      return [...ZERO_HASH];
    if (params.cache?.hashSequence != null)
      return params.cache.hashSequence;
    const hash = hashSequences(inputs, params.inputIndex, currentInput);
    if (params.cache != null)
      params.cache.hashSequence = hash;
    return hash;
  }
  function bip143OutputsHash(params) {
    var _a;
    const baseScope = params.scope & 31;
    if (baseScope !== TransactionSignature.SIGHASH_SINGLE && baseScope !== TransactionSignature.SIGHASH_NONE) {
      if (params.cache?.hashOutputsAll != null)
        return params.cache.hashOutputsAll;
      const hash2 = hashOutputs(params.outputs);
      if (params.cache != null)
        params.cache.hashOutputsAll = hash2;
      return hash2;
    }
    if (baseScope !== TransactionSignature.SIGHASH_SINGLE || params.inputIndex >= params.outputs.length) {
      return [...ZERO_HASH];
    }
    const cached = params.cache?.hashOutputsSingle?.get(params.inputIndex);
    if (cached != null)
      return cached;
    const hash = hashOutputs(params.outputs, params.inputIndex);
    if (params.cache != null) {
      (_a = params.cache).hashOutputsSingle ?? (_a.hashOutputsSingle = /* @__PURE__ */ new Map());
      params.cache.hashOutputsSingle.set(params.inputIndex, hash);
    }
    return hash;
  }
  var _TransactionSignature = class _TransactionSignature extends Signature {
    constructor(r2, s2, scope) {
      super(r2, s2);
      __publicField(this, "scope");
      this.scope = scope;
    }
    /**
     * Implements the original bitcoin transaction signature digest preimage algorithm (OTDA).
     * @param params
     * @returns preimage as a byte array
     */
    static formatOTDA(params) {
      const isAnyoneCanPay = (params.scope & _TransactionSignature.SIGHASH_ANYONECANPAY) === _TransactionSignature.SIGHASH_ANYONECANPAY;
      const isSingle = (params.scope & 31) === _TransactionSignature.SIGHASH_SINGLE;
      const isNone = (params.scope & 31) === _TransactionSignature.SIGHASH_NONE;
      const isAll = (params.scope & 31) === _TransactionSignature.SIGHASH_ALL || !isSingle && !isNone;
      const subscript = originalScriptCode(params.subscript);
      const currentInput = {
        sourceTXID: params.sourceTXID,
        sourceOutputIndex: params.sourceOutputIndex,
        sequence: params.inputSequence,
        script: subscript.bytes,
        scriptLength: subscript.encodedLength
      };
      const writer = new Writer();
      function writeInputs(inputs) {
        writer.writeVarIntNum(inputs.length);
        for (const input of inputs) {
          writer.writeReverse(toArray2(input.sourceTXID, "hex"));
          writer.writeUInt32LE(input.sourceOutputIndex);
          writer.writeVarIntNum(input.scriptLength ?? input.script.length);
          writer.write(input.script);
          writer.writeUInt32LE(input.sequence);
        }
      }
      function writeOutputs(outputs) {
        writer.writeVarIntNum(outputs.length);
        for (const output of outputs) {
          writer.writeUInt64LE(output.satoshis);
          writer.writeVarIntNum(output.script.length);
          writer.write(output.script);
        }
      }
      writer.writeInt32LE(params.transactionVersion);
      const emptyScript = new Script().toBinary();
      if (!isAnyoneCanPay) {
        const inputs = params.allInputs == null ? params.otherInputs.map((input) => ({
          sourceTXID: input.sourceTXID ?? input.sourceTransaction?.id("hex") ?? "",
          sourceOutputIndex: input.sourceOutputIndex,
          sequence: isSingle || isNone ? 0 : input.sequence ?? 4294967295,
          script: emptyScript
        })) : params.allInputs.map((input, index) => index === params.inputIndex ? currentInput : {
          sourceTXID: input.sourceTXID ?? input.sourceTransaction?.id("hex") ?? "",
          sourceOutputIndex: input.sourceOutputIndex,
          sequence: isSingle || isNone ? 0 : input.sequence ?? 4294967295,
          script: emptyScript
        });
        if (params.allInputs == null)
          inputs.splice(params.inputIndex, 0, currentInput);
        writeInputs(inputs);
      } else if (isAnyoneCanPay) {
        writeInputs([currentInput]);
      }
      if (isAll) {
        const outputs = params.outputs.map((output) => ({
          satoshis: output.satoshis ?? 0,
          // Default to 0 if undefined
          script: output.lockingScript.toBinary()
        }));
        writeOutputs(outputs);
      } else if (isSingle) {
        const outputs = [];
        for (let i = 0; i < params.inputIndex; i++)
          outputs.push({ satoshis: -1, script: emptyScript });
        const o = params.outputs[params.inputIndex];
        if (o !== void 0) {
          outputs.push({ satoshis: o.satoshis ?? 0, script: o.lockingScript.toBinary() });
        }
        writeOutputs(outputs);
      } else if (isNone) {
        writeOutputs([]);
      }
      writer.writeUInt32LE(params.lockTime);
      writer.writeUInt32LE(params.scope >>> 0);
      const buf = writer.toUint8Array();
      return buf;
    }
    /**
     * Formats the same SIGHASH preimage bytes as `format`, supporting the optional cache for hash reuse.
     * @param params - Context for the signing operation.
     * @param params.cache - Optional `SignatureHashCache` that may already contain hashed prefixes and is populated during formatting.
     * @returns Bytes for signing.
     */
    static formatBip143(params) {
      const currentInput = {
        sourceTXID: params.sourceTXID,
        sourceOutputIndex: params.sourceOutputIndex,
        sequence: params.inputSequence
      };
      const inputs = bip143Inputs(params, currentInput);
      const hashPrevouts2 = bip143PrevoutsHash(params, inputs, currentInput);
      const hashSequence = bip143SequenceHash(params, inputs, currentInput);
      const outputsHash = bip143OutputsHash(params);
      const writer = new Writer();
      writer.writeInt32LE(params.transactionVersion);
      writer.write(hashPrevouts2);
      writer.write(hashSequence);
      writer.writeReverse(toArray2(params.sourceTXID, "hex"));
      writer.writeUInt32LE(params.sourceOutputIndex);
      const subscriptBin = params.subscript.toUint8Array();
      writer.writeVarIntNum(subscriptBin.length);
      writer.write(subscriptBin);
      writer.writeUInt64LE(params.sourceSatoshis);
      const sequenceNumber = currentInput.sequence ?? 4294967295;
      writer.writeUInt32LE(sequenceNumber);
      writer.write(outputsHash);
      writer.writeUInt32LE(params.lockTime);
      writer.writeUInt32LE(params.scope >>> 0);
      const buf = writer.toUint8Array();
      return buf;
    }
    /**
     * Formats the SIGHASH preimage for the targeted input, optionally using a cache to skip recomputing shared hash prefixes.
     * @param params - Context for the signing input plus transaction metadata.
     * @param params.cache - Optional cache storing previously computed `hashPrevouts`, `hashSequence`, or `hashOutputs*` values; it will be populated if present.
     */
    static format(params) {
      return Array.from(this.formatBytes(params));
    }
    static formatBytes(params) {
      const hasForkId = (params.scope & _TransactionSignature.SIGHASH_FORKID) !== 0;
      const hasChronicle = params.ignoreChronicle !== true && (params.scope & _TransactionSignature.SIGHASH_CHRONICLE) !== 0;
      if (hasForkId && params.sighashForkIdEnabled !== false && !hasChronicle) {
        return _TransactionSignature.formatBip143(params);
      }
      if (params.sighashForkIdEnabled === false || !hasForkId || hasChronicle) {
        return _TransactionSignature.formatOTDA(params);
      }
      return new Uint8Array(0);
    }
    static usesOtdaSingleBug(params) {
      const hasForkId = (params.scope & _TransactionSignature.SIGHASH_FORKID) !== 0;
      const hasChronicle = params.ignoreChronicle !== true && (params.scope & _TransactionSignature.SIGHASH_CHRONICLE) !== 0;
      const usesOtda = params.sighashForkIdEnabled === false || !hasForkId || hasChronicle;
      return usesOtda && (params.scope & 31) === _TransactionSignature.SIGHASH_SINGLE && params.inputIndex >= params.outputs.length;
    }
    // The format used in a tx
    static fromChecksigFormat(buf) {
      if (buf.length === 0) {
        const r2 = new BigNumber(1);
        const s2 = new BigNumber(1);
        const scope2 = 1;
        return new _TransactionSignature(r2, s2, scope2);
      }
      const scope = buf.at(-1);
      const derbuf = buf.slice(0, -1);
      const tempSig = Signature.fromDER(derbuf);
      return new _TransactionSignature(tempSig.r, tempSig.s, scope);
    }
    /**
     * Compares to bitcoind's IsLowDERSignature
     * See also Ecdsa signature algorithm which enforces this.
     * See also Bip 62, "low S values in signatures"
     */
    hasLowS() {
      if (this.s.ltn(1) || this.s.gt(new BigNumber("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0", "hex"))) {
        return false;
      }
      return true;
    }
    toChecksigFormat() {
      const derbuf = this.toDER();
      return [...derbuf, this.scope];
    }
  };
  __publicField(_TransactionSignature, "SIGHASH_ALL", 1);
  __publicField(_TransactionSignature, "SIGHASH_NONE", 2);
  __publicField(_TransactionSignature, "SIGHASH_SINGLE", 3);
  __publicField(_TransactionSignature, "SIGHASH_CHRONICLE", 32);
  __publicField(_TransactionSignature, "SIGHASH_FORKID", 64);
  __publicField(_TransactionSignature, "SIGHASH_ANYONECANPAY", 128);
  var TransactionSignature = _TransactionSignature;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/AsyncCryptoBackend.js
  function validateAsyncCryptoBytes(operation, value, expectedLength) {
    if (!(value instanceof Uint8Array)) {
      throw new TypeError(`${operation} returned a non-byte result`);
    }
    if (expectedLength !== void 0 && value.length !== expectedLength) {
      throw new Error(`${operation} returned ${value.length} bytes; expected ${expectedLength}`);
    }
    return value;
  }
  function backendGlobal() {
    return globalThis;
  }
  function readyAsyncCryptoBackend(operation) {
    const backend = backendGlobal().__bsvSdkAsyncCryptoBackendV1;
    if (backend === void 0)
      return void 0;
    if (!backend.isReady()) {
      void backend.preload().catch(() => {
      });
      return void 0;
    }
    return backend.supportsCrypto(operation) ? backend : void 0;
  }

  // node_modules/@bsv/sdk/dist/esm/src/script/LockingScript.js
  var LockingScript = class extends Script {
    /**
     * @method isLockingScript
     * Determines if the script is a locking script.
     * @returns {boolean} Always returns true for a LockingScript instance.
     */
    isLockingScript() {
      return true;
    }
    /**
     * @method isUnlockingScript
     * Determines if the script is an unlocking script.
     * @returns {boolean} Always returns false for a LockingScript instance.
     */
    isUnlockingScript() {
      return false;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/script/UnlockingScript.js
  var UnlockingScript = class extends Script {
    /**
     * @method isLockingScript
     * Determines if the script is a locking script.
     * @returns {boolean} Always returns false for an UnlockingScript instance.
     */
    isLockingScript() {
      return false;
    }
    /**
     * @method isUnlockingScript
     * Determines if the script is an unlocking script.
     * @returns {boolean} Always returns true for an UnlockingScript instance.
     */
    isUnlockingScript() {
      return true;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/script/ScriptEvaluationError.js
  function formatStackItem(item) {
    if (item == null)
      return "null/undef";
    if (item.length === void 0)
      return "INVALID_STACK_ITEM";
    return toHex(item);
  }
  var ScriptEvaluationError = class extends Error {
    constructor(params) {
      const stackHex = params.stackState.map(formatStackItem).join(", ");
      const altStackHex = params.altStackState.map(formatStackItem).join(", ");
      const pcInfo = `Context: ${params.context}, PC: ${params.programCounter}`;
      const stackInfo = `Stack: [${stackHex}] (len: ${params.stackState.length}, mem: ${params.stackMem})`;
      const altStackInfo = `AltStack: [${altStackHex}] (len: ${params.altStackState.length}, mem: ${params.altStackMem})`;
      const ifStackInfo = `IfStack: [${params.ifStackState.join(", ")}]`;
      const fullMessage = `Script evaluation error: ${params.message}
TXID: ${params.txid}, OutputIdx: ${params.outputIndex}
${pcInfo}
${stackInfo}
${altStackInfo}
${ifStackInfo}`;
      super(fullMessage);
      __publicField(this, "txid");
      __publicField(this, "outputIndex");
      __publicField(this, "context");
      __publicField(this, "programCounter");
      __publicField(this, "stackState");
      __publicField(this, "altStackState");
      __publicField(this, "ifStackState");
      __publicField(this, "stackMem");
      __publicField(this, "altStackMem");
      this.name = this.constructor.name;
      this.txid = params.txid;
      this.outputIndex = params.outputIndex;
      this.context = params.context;
      this.programCounter = params.programCounter;
      this.stackState = params.stackState.map((s2) => s2.slice());
      this.altStackState = params.altStackState.map((s2) => s2.slice());
      this.ifStackState = params.ifStackState.slice();
      this.stackMem = params.stackMem;
      this.altStackMem = params.altStackMem;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/script/ScriptResourceLimitError.js
  var ScriptResourceLimitError = class extends Error {
    constructor(resource, limit, attempted) {
      const labels = {
        stack: "Stack memory usage",
        "alt-stack": "Alt stack memory usage",
        "element-size": "Script element allocation"
      };
      const label = labels[resource];
      super(`${label} has exceeded ${limit} bytes`);
      __publicField(this, "resource");
      __publicField(this, "limit");
      __publicField(this, "attempted");
      this.resource = resource;
      this.limit = limit;
      this.attempted = attempted;
      this.name = "ScriptResourceLimitError";
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/transaction/ScriptVerificationBackend.js
  var registeredBackend;
  function scriptVerificationBackend() {
    return registeredBackend;
  }

  // node_modules/@bsv/sdk/dist/esm/src/script/Spend.js
  var maxScriptElementSizeBeforeGenesis = 520;
  var maxScriptSizeBeforeGenesis = 1e4;
  var maxOpsBeforeGenesis = 500;
  var maxNodeNum2BinSize = 0x7fffffffn;
  var maxScriptNumLengthAfterGenesis = 75e4;
  var maxScriptNumLengthAfterChronicle = 32e6;
  var maxStackItemsBeforeGenesis = 1e3;
  var maxMultisigKeyCount = Math.pow(2, 31) - 1;
  var maxMultisigKeyCountBigInt = BigInt(maxMultisigKeyCount);
  var maxMultisigKeyCountBeforeGenesis = 20;
  var sequenceLocktimeDisableFlag = 2147483648;
  var sequenceLocktimeTypeFlag = 4194304;
  var sequenceLocktimeMask = 65535;
  var locktimeThreshold = 5e8;
  var SCRIPTNUM_NEG_1 = Object.freeze(new BigNumber(-1).toScriptNum());
  var SCRIPTNUMS_0_TO_16 = Object.freeze(Array.from({ length: 17 }, (_, i) => Object.freeze(new BigNumber(i).toScriptNum())));
  function compareNumberArrays(a, b) {
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
        return false;
    }
    return true;
  }
  function scriptBoolean(value) {
    return new BigNumber(value ? 1 : 0);
  }
  function scriptBooleanAnd(left, right) {
    return scriptBoolean(left && right);
  }
  function scriptBooleanOr(left, right) {
    return scriptBoolean(left || right);
  }
  function smallerBigNumber(left, right) {
    return left.cmp(right) < 0 ? left : right;
  }
  function largerBigNumber(left, right) {
    return left.cmp(right) > 0 ? left : right;
  }
  function snapshotSpendVerificationContext(context) {
    if (typeof context.consensus !== "boolean") {
      throw new TypeError("Spend verification consensus must be boolean");
    }
    for (const [label, value] of [
      ["blockHeight", context.blockHeight],
      ["utxoHeight", context.utxoHeight]
    ]) {
      if (value !== void 0 && (!Number.isSafeInteger(value) || value < 0 || value > 4294967295)) {
        throw new RangeError(`Spend verification ${label} must be an unsigned 32-bit integer`);
      }
    }
    const verifyFlags = Array.isArray(context.verifyFlags) ? Array.from(context.verifyFlags) : context.verifyFlags;
    if (verifyFlags !== void 0 && typeof verifyFlags !== "string" && (!Array.isArray(verifyFlags) || verifyFlags.some((flag) => typeof flag !== "string"))) {
      throw new TypeError("Spend verification flags must be a string or an array of strings");
    }
    return {
      consensus: context.consensus,
      blockHeight: context.blockHeight,
      utxoHeight: context.utxoHeight,
      verifyFlags
    };
  }
  function isMinimallyEncodedHelper(buf, maxNumSize = Number.MAX_SAFE_INTEGER) {
    if (buf.length > maxNumSize) {
      return false;
    }
    if (buf.length > 0) {
      if ((buf.at(-1) & 127) === 0) {
        if (buf.length <= 1 || (buf.at(-2) & 128) === 0) {
          return false;
        }
      }
    }
    return true;
  }
  function isChecksigFormatHelper(buf) {
    if (buf.length < 9 || buf.length > 73)
      return false;
    if (buf[0] !== 48)
      return false;
    if (buf[1] !== buf.length - 3)
      return false;
    const rMarker = buf[2];
    const rLen = buf[3];
    if (rMarker !== 2)
      return false;
    if (rLen === 0)
      return false;
    if (5 + rLen >= buf.length)
      return false;
    const sMarkerOffset = 4 + rLen;
    const sMarker = buf[sMarkerOffset];
    const sLen = buf[sMarkerOffset + 1];
    if (sMarker !== 2)
      return false;
    if (sLen === 0)
      return false;
    if ((buf[4] & 128) !== 0)
      return false;
    if (rLen > 1 && buf[4] === 0 && (buf[5] & 128) === 0)
      return false;
    const sValueOffset = sMarkerOffset + 2;
    if ((buf[sValueOffset] & 128) !== 0)
      return false;
    if (sLen > 1 && buf[sValueOffset] === 0 && (buf[sValueOffset + 1] & 128) === 0)
      return false;
    if (rLen + sLen + 7 !== buf.length)
      return false;
    return true;
  }
  function isChunkMinimalPushHelper(chunk) {
    const data = chunk.data;
    const op = chunk.op;
    if (!Array.isArray(data))
      return true;
    if (data.length === 0)
      return op === OP_default.OP_0;
    if (data.length === 1 && data[0] >= 1 && data[0] <= 16)
      return op === OP_default.OP_1 + (data[0] - 1);
    if (data.length === 1 && data[0] === 129)
      return op === OP_default.OP_1NEGATE;
    if (data.length <= 75)
      return op === data.length;
    if (data.length <= 255)
      return op === OP_default.OP_PUSHDATA1;
    if (data.length <= 65535)
      return op === OP_default.OP_PUSHDATA2;
    return true;
  }
  var _sigHashCache, _ownsSigHashCache, _Spend_instances, isRelaxed_fn, hasExplicitFlags_fn, hasFlag_fn, isAfterGenesis_fn, isAfterChronicle_fn, enforceNonMalleability_fn, shouldEnforceMinimalData_fn, shouldEnforceLowS_fn, shouldEnforceNullDummy_fn, shouldEnforceSigPushOnly_fn, shouldEnforceCleanStack_fn, shouldEnforceDerSignatures_fn, shouldEnforceStrictEncoding_fn, scriptNumMaxSize_fn, maxPushSize_fn, ensureStackMem_fn, ensureAltStackMem_fn, pushStack_fn, pushStackCopy_fn, popStack_fn, stackTop_fn, requireStackItems_fn, requireAltStackItems_fn, setStack_fn, clearAltStack_fn, pushAltStack_fn, popAltStack_fn, readScriptNumber_fn, readSpliceOperand_fn, readLockTimeOperand_fn, isDefinedHashType_fn, enforceSignatureHashType_fn, enforceSignatureForkId_fn, checkSignatureEncoding_fn, parseChecksigSignature_fn, readLaxDERLength_fn, parseLaxDERInteger_fn, parseLaxChecksigSignature_fn, checkPublicKeyEncoding_fn, verifySignature_fn, enforceStepResourceLimits_fn, currentScriptForStep_fn, opcodeForOperation_fn, enforceChronicleOnlyOpcode_fn, executeDataPush_fn, countExecutedOpcode_fn, skipUnavailablePreChronicleOpcode_fn, enforceDiscouragedNop_fn, verifyCheckLockTime_fn, verifyCheckSequence_fn, advanceAfterStep_fn, snapshotForVerifier_fn, runScript_fn, isP2SHLockingScript_fn, requireTruthyTopStack_fn, castToBool_fn, scriptEvaluationError_fn;
  var _Spend = class _Spend {
    /**
     * @constructor
     * Constructs the Spend object with necessary transaction details.
     * @param {string} params.sourceTXID - The transaction ID of the source UTXO.
     * @param {number} params.sourceOutputIndex - The index of the output in the source transaction.
     * @param {BigNumber} params.sourceSatoshis - The amount of satoshis in the source UTXO.
     * @param {LockingScript} params.lockingScript - The locking script associated with the UTXO.
     * @param {number} params.transactionVersion - The version of the current transaction.
     * @param {Array<{ sourceTXID: string, sourceOutputIndex: number, sequence: number }>} params.otherInputs -
     *        An array of other inputs in the transaction.
     * @param {Array<{ satoshis: BigNumber, lockingScript: LockingScript }>} params.outputs -
     *        The outputs of the current transaction.
     * @param {number} params.inputIndex - The index of this input in the current transaction.
     * @param {UnlockingScript} params.unlockingScript - The unlocking script for this spend.
     * @param {number} params.inputSequence - The sequence number of this input.
     * @param {number} params.lockTime - The lock time of the transaction.
     * @param {number} params.memoryLimit - Optional caller-supplied local
     *        interpreter budget. Resource exhaustion is reported separately from
     *        script invalidity.
     * @param {boolean} params.isRelaxed - Optional. If true, disables all the unlocking script maleability restrictions consitent with Chronicle release. Maleability restrictions are neve appliced to locking scripts.
     *
     * @example
     * const spend = new Spend({
     *   sourceTXID: "abcd1234", // sourceTXID
     *   sourceOutputIndex: 0, // sourceOutputIndex
     *   sourceSatoshis: new BigNumber(1000), // sourceSatoshis
     *   lockingScript: LockingScript.fromASM("OP_DUP OP_HASH160 abcd1234... OP_EQUALVERIFY OP_CHECKSIG"),
     *   transactionVersion: 1, // transactionVersion
     *   otherInputs: [{ sourceTXID: "abcd1234", sourceOutputIndex: 1, sequence: 0xffffffff }], // otherInputs
     *   outputs: [{ satoshis: new BigNumber(500), lockingScript: LockingScript.fromASM("OP_DUP...") }], // outputs
     *   inputIndex: 0, // inputIndex
     *   unlockingScript: UnlockingScript.fromASM("3045... 02ab..."),
     *   inputSequence: 0xffffffff // inputSequence
     *   memoryLimit: 100000 // memoryLimit
     * });
     */
    constructor(params) {
      __privateAdd(this, _Spend_instances);
      __publicField(this, "sourceTXID");
      __publicField(this, "sourceOutputIndex");
      __publicField(this, "sourceSatoshis");
      __publicField(this, "lockingScript");
      __publicField(this, "transactionVersion");
      __publicField(this, "otherInputs");
      __publicField(this, "allInputs");
      __publicField(this, "outputs");
      __publicField(this, "inputIndex");
      __publicField(this, "unlockingScript");
      __publicField(this, "inputSequence");
      __publicField(this, "lockTime");
      __publicField(this, "context");
      __publicField(this, "programCounter");
      __publicField(this, "lastCodeSeparator");
      __publicField(this, "stack");
      __publicField(this, "altStack");
      __publicField(this, "ifStack");
      __publicField(this, "elseStack");
      __publicField(this, "memoryLimit");
      __publicField(this, "hasExplicitMemoryLimit");
      __publicField(this, "stackMem");
      __publicField(this, "altStackMem");
      __publicField(this, "isRelaxedOverride");
      __publicField(this, "verifyFlags");
      __publicField(this, "executedOpCount");
      __publicField(this, "returningFromConditional");
      __privateAdd(this, _sigHashCache);
      __privateAdd(this, _ownsSigHashCache);
      this.sourceTXID = params.sourceTXID;
      this.sourceOutputIndex = params.sourceOutputIndex;
      this.sourceSatoshis = params.sourceSatoshis;
      this.lockingScript = params.lockingScript;
      this.transactionVersion = params.transactionVersion;
      this.otherInputs = params.otherInputs;
      this.allInputs = params.allInputs;
      this.outputs = params.outputs;
      this.inputIndex = params.inputIndex;
      this.unlockingScript = params.unlockingScript;
      this.inputSequence = params.inputSequence;
      this.lockTime = params.lockTime;
      this.hasExplicitMemoryLimit = params.memoryLimit !== void 0;
      this.memoryLimit = params.memoryLimit ?? Number.POSITIVE_INFINITY;
      this.isRelaxedOverride = params.isRelaxed === true;
      if (params.verifyFlags === void 0) {
        this.verifyFlags = void 0;
      } else {
        const flagArr = Array.isArray(params.verifyFlags) ? params.verifyFlags : params.verifyFlags.split(",");
        this.verifyFlags = new Set(flagArr.map((flag) => flag.trim()).filter((flag) => flag.length > 0));
      }
      this.stack = [];
      this.altStack = [];
      this.ifStack = [];
      this.elseStack = [];
      this.stackMem = 0;
      this.altStackMem = 0;
      this.executedOpCount = 0;
      this.returningFromConditional = false;
      __privateSet(this, _ownsSigHashCache, params.sigHashCache == null);
      __privateSet(this, _sigHashCache, params.sigHashCache ?? { hashOutputsSingle: /* @__PURE__ */ new Map() });
      this.reset();
    }
    reset() {
      if (__privateGet(this, _ownsSigHashCache)) {
        delete __privateGet(this, _sigHashCache).hashPrevouts;
        delete __privateGet(this, _sigHashCache).hashSequence;
        delete __privateGet(this, _sigHashCache).hashOutputsAll;
        __privateGet(this, _sigHashCache).hashOutputsSingle?.clear();
      }
      this.context = "UnlockingScript";
      this.programCounter = 0;
      this.lastCodeSeparator = null;
      this.stack = [];
      this.altStack = [];
      this.ifStack = [];
      this.elseStack = [];
      this.stackMem = 0;
      this.altStackMem = 0;
      this.executedOpCount = 0;
      this.returningFromConditional = false;
    }
    step() {
      __privateMethod(this, _Spend_instances, enforceStepResourceLimits_fn).call(this);
      const currentScript = __privateMethod(this, _Spend_instances, currentScriptForStep_fn).call(this);
      if (this.programCounter >= currentScript.chunks.length) {
        return false;
      }
      const operation = currentScript.chunks[this.programCounter];
      const currentOpcode = __privateMethod(this, _Spend_instances, opcodeForOperation_fn).call(this, operation);
      const isScriptExecuting = !this.returningFromConditional && !this.ifStack.includes(false);
      __privateMethod(this, _Spend_instances, enforceChronicleOnlyOpcode_fn).call(this, currentOpcode);
      if (isScriptExecuting && currentOpcode >= 0 && currentOpcode <= OP_default.OP_PUSHDATA4) {
        __privateMethod(this, _Spend_instances, executeDataPush_fn).call(this, operation);
      } else if (isScriptExecuting || currentOpcode >= OP_default.OP_IF && currentOpcode <= OP_default.OP_ENDIF) {
        let buf, buf1, buf2, buf3;
        let x1, x2, x3;
        let bn, bn1, bn2, bn3;
        let n, size, fValue, fSuccess, subscript;
        let bufSig, bufPubkey;
        let sig, pubkey;
        let i, ikey, isig, nKeysCount, nSigsCount, fOk;
        __privateMethod(this, _Spend_instances, countExecutedOpcode_fn).call(this, currentOpcode, isScriptExecuting);
        if (__privateMethod(this, _Spend_instances, skipUnavailablePreChronicleOpcode_fn).call(this, currentOpcode, isScriptExecuting))
          return true;
        __privateMethod(this, _Spend_instances, enforceDiscouragedNop_fn).call(this, currentOpcode, isScriptExecuting);
        switch (currentOpcode) {
          case OP_default.OP_VER: {
            const ver = this.transactionVersion;
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, [
              ver & 255,
              ver >>> 8 & 255,
              ver >>> 16 & 255,
              ver >>> 24 & 255
            ]);
            break;
          }
          case OP_default.OP_SUBSTR: {
            ;
            (() => {
              if (this.stack.length < 3)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_SUBSTR requires at least three items to be on the stack.");
              const len = __privateMethod(this, _Spend_instances, readSpliceOperand_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
              const offset = __privateMethod(this, _Spend_instances, readSpliceOperand_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
              buf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const size2 = buf.length;
              if (offset < 0 || offset >= size2 || len < 0 || len > size2 - offset) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `OP_SUBSTR offset (${offset}) must be in range [0, ${size2}) and length (${len}) must be in range [0, ${size2 - offset}]`);
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, buf.slice(offset, offset + len));
            })();
            break;
          }
          case OP_default.OP_LEFT: {
            ;
            (() => {
              if (this.stack.length < 2)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_LEFT requires at least two items to be on the stack.");
              const len = __privateMethod(this, _Spend_instances, readSpliceOperand_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
              buf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const size2 = buf.length;
              if (len < 0 || len > size2) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `OP_LEFT length (${len}) must be in range [0, ${size2}]`);
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, buf.slice(0, len));
            })();
            break;
          }
          case OP_default.OP_RIGHT: {
            ;
            (() => {
              if (this.stack.length < 2)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_RIGHT requires at least two items to be on the stack.");
              const len = __privateMethod(this, _Spend_instances, readSpliceOperand_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
              buf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const size2 = buf.length;
              if (len < 0 || len > size2) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `OP_RIGHT length (${len}) must be in range [0, ${size2}]`);
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, buf.slice(size2 - len));
            })();
            break;
          }
          case OP_default.OP_LSHIFTNUM: {
            ;
            (() => {
              if (this.stack.length < 2)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_LSHIFTNUM requires at least two items to be on the stack.");
              const bits = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this)).toBigInt();
              if (bits < 0) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_LSHIFTNUM bits to shift must not be negative.");
              }
              if (bits > 0x7fffffffn) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_LSHIFTNUM shift count exceeds INT_MAX.");
              }
              const value = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this)).toBigInt();
              const maxBytes = __privateMethod(this, _Spend_instances, scriptNumMaxSize_fn).call(this);
              if (maxBytes !== void 0 && value !== 0n && bits >= BigInt(maxBytes) * 8n) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "script number overflow");
              }
              const resultBytes = new BigNumber(value << bits).toScriptNum();
              if (maxBytes !== void 0 && resultBytes.length > maxBytes) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "script number overflow");
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, resultBytes);
            })();
            break;
          }
          case OP_default.OP_RSHIFTNUM: {
            ;
            (() => {
              if (this.stack.length < 2)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_RSHIFTNUM requires at least two items to be on the stack.");
              const bits = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this)).toBigInt();
              if (bits < 0) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_RSHIFTNUM bits to shift must not be negative.");
              }
              if (bits > 0x7fffffffn) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_RSHIFTNUM shift count exceeds INT_MAX.");
              }
              const value = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this)).toBigInt();
              let resultBn;
              if (value < 0) {
                resultBn = new BigNumber(-(-value >> bits));
              } else {
                resultBn = new BigNumber(value >> bits);
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, resultBn.toScriptNum());
            })();
            break;
          }
          case OP_default.OP_1NEGATE:
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, SCRIPTNUM_NEG_1);
            break;
          case OP_default.OP_0:
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, SCRIPTNUMS_0_TO_16[0]);
            break;
          case OP_default.OP_1:
          case OP_default.OP_2:
          case OP_default.OP_3:
          case OP_default.OP_4:
          case OP_default.OP_5:
          case OP_default.OP_6:
          case OP_default.OP_7:
          case OP_default.OP_8:
          case OP_default.OP_9:
          case OP_default.OP_10:
          case OP_default.OP_11:
          case OP_default.OP_12:
          case OP_default.OP_13:
          case OP_default.OP_14:
          case OP_default.OP_15:
          case OP_default.OP_16:
            n = currentOpcode - (OP_default.OP_1 - 1);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, SCRIPTNUMS_0_TO_16[n]);
            break;
          case OP_default.OP_NOP:
          // OP_NOP1 (0xb0), OP_NOP9 (0xb8), OP_NOP10 (0xb9) are the only defined upgrade-NOP slots
          // in node v1.2.0. All other values above 0xb9 are FIRST_UNDEFINED_OP_VALUE and invalid.
          // falls through
          case OP_default.OP_NOP1:
            break;
          case OP_default.OP_CHECKLOCKTIMEVERIFY:
            __privateMethod(this, _Spend_instances, verifyCheckLockTime_fn).call(this);
            break;
          case OP_default.OP_CHECKSEQUENCEVERIFY:
            __privateMethod(this, _Spend_instances, verifyCheckSequence_fn).call(this);
            break;
          case OP_default.OP_NOP9:
          case OP_default.OP_NOP10:
            break;
          case OP_default.OP_VERIF:
          case OP_default.OP_VERNOTIF:
            ;
            (() => {
              fValue = false;
              if (isScriptExecuting) {
                if (this.stack.length < 1)
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_VERIF and OP_VERNOTIF require at least one item on the stack when they are used!");
                buf1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
                if (buf1.length === 4) {
                  const ver = this.transactionVersion;
                  buf2 = [ver & 255, ver >>> 8 & 255, ver >>> 16 & 255, ver >>> 24 & 255];
                  fValue = compareNumberArrays(buf1, buf2);
                }
                if (currentOpcode === OP_default.OP_VERNOTIF)
                  fValue = !fValue;
              }
              this.ifStack.push(fValue);
              this.elseStack.push(false);
            })();
            break;
          case OP_default.OP_IF:
          case OP_default.OP_NOTIF:
            ;
            (() => {
              fValue = false;
              if (isScriptExecuting) {
                if (this.stack.length < 1)
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_IF and OP_NOTIF require at least one item on the stack when they are used!");
                buf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
                if (__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "MINIMALIF") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this) && buf.length > 0 && !(buf.length === 1 && buf[0] === 1)) {
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_IF and OP_NOTIF require minimal truth values.");
                }
                fValue = __privateMethod(this, _Spend_instances, castToBool_fn).call(this, buf);
                if (currentOpcode === OP_default.OP_NOTIF)
                  fValue = !fValue;
              }
              this.ifStack.push(fValue);
              this.elseStack.push(false);
            })();
            break;
          case OP_default.OP_ELSE:
            ;
            (() => {
              if (this.ifStack.length === 0)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_ELSE requires a preceeding OP_IF.");
              if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && __privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && this.elseStack.at(-1) === true) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_ELSE may only be used once for each OP_IF or OP_NOTIF after Genesis.");
              }
              this.elseStack[this.elseStack.length - 1] = true;
              this.ifStack[this.ifStack.length - 1] = this.ifStack.at(-1) !== true;
            })();
            break;
          case OP_default.OP_ENDIF:
            ;
            (() => {
              if (this.ifStack.length === 0)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_ENDIF requires a preceeding OP_IF.");
              this.ifStack.pop();
              this.elseStack.pop();
            })();
            break;
          case OP_default.OP_VERIFY:
            ;
            (() => {
              if (this.stack.length < 1)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_VERIFY requires at least one item to be on the stack.");
              buf1 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this);
              fValue = __privateMethod(this, _Spend_instances, castToBool_fn).call(this, buf1);
              if (!fValue)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_VERIFY requires the top stack value to be truthy.");
              __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            })();
            break;
          case OP_default.OP_RETURN:
            ;
            (() => {
              if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this)) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_RETURN is invalid before Genesis.");
              }
              if (this.ifStack.length > 0) {
                this.returningFromConditional = true;
              } else {
                if (this.context === "UnlockingScript")
                  this.programCounter = this.unlockingScript.chunks.length;
                else
                  this.programCounter = this.lockingScript.chunks.length;
                this.programCounter--;
              }
            })();
            break;
          case OP_default.OP_TOALTSTACK:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_TOALTSTACK requires at oeast one item to be on the stack.");
            __privateMethod(this, _Spend_instances, pushAltStack_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
            break;
          case OP_default.OP_FROMALTSTACK:
            __privateMethod(this, _Spend_instances, requireAltStackItems_fn).call(this, 1, "OP_FROMALTSTACK requires at least one item to be on the stack.");
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, __privateMethod(this, _Spend_instances, popAltStack_fn).call(this));
            break;
          case OP_default.OP_2DROP:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_2DROP requires at least two items to be on the stack.");
            __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            break;
          case OP_default.OP_2DUP:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_2DUP requires at least two items to be on the stack.");
            buf1 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -2);
            buf2 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -1);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf1);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf2);
            break;
          case OP_default.OP_3DUP:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 3, "OP_3DUP requires at least three items to be on the stack.");
            buf1 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -3);
            buf2 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -2);
            buf3 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -1);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf1);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf2);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf3);
            break;
          case OP_default.OP_2OVER:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 4, "OP_2OVER requires at least four items to be on the stack.");
            buf1 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -4);
            buf2 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -3);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf1);
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf2);
            break;
          case OP_default.OP_2ROT: {
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 6, "OP_2ROT requires at least six items to be on the stack.");
            const rot6 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const rot5 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const rot4 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const rot3 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const rot2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const rot1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, rot3);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, rot4);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, rot5);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, rot6);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, rot1);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, rot2);
            break;
          }
          case OP_default.OP_2SWAP: {
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 4, "OP_2SWAP requires at least four items to be on the stack.");
            const swap4 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const swap3 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const swap2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            const swap1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, swap3);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, swap4);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, swap1);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, swap2);
            break;
          }
          case OP_default.OP_IFDUP:
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_IFDUP requires at least one item to be on the stack.");
              buf1 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this);
              if (__privateMethod(this, _Spend_instances, castToBool_fn).call(this, buf1)) {
                __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, buf1);
              }
            })();
            break;
          case OP_default.OP_DEPTH:
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, new BigNumber(this.stack.length).toScriptNum());
            break;
          case OP_default.OP_DROP:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_DROP requires at least one item to be on the stack.");
            __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            break;
          case OP_default.OP_DUP:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_DUP requires at least one item to be on the stack.");
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this));
            break;
          case OP_default.OP_NIP:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_NIP requires at least two items to be on the stack.");
            buf2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, buf2);
            break;
          case OP_default.OP_OVER:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_OVER requires at least two items to be on the stack.");
            __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -2));
            break;
          case OP_default.OP_PICK:
          case OP_default.OP_ROLL: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
              bn = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
              const nBigInt = bn.toBigInt();
              if (nBigInt < 0n || nBigInt >= BigInt(this.stack.length)) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires the top stack element to be 0 or a positive number less than the current size of the stack.`);
              }
              const nIndex = Number(nBigInt);
              const itemToMoveOrCopy = this.stack[this.stack.length - 1 - nIndex];
              if (currentOpcode === OP_default.OP_ROLL) {
                this.stack.splice(this.stack.length - 1 - nIndex, 1);
                this.stackMem -= itemToMoveOrCopy.length;
                __privateMethod(this, _Spend_instances, pushStack_fn).call(this, itemToMoveOrCopy);
              } else {
                __privateMethod(this, _Spend_instances, pushStackCopy_fn).call(this, itemToMoveOrCopy);
              }
            })();
            break;
          }
          case OP_default.OP_ROT:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 3, "OP_ROT requires at least three items to be on the stack.");
            x3 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            x2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            x1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, x2);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, x3);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, x1);
            break;
          case OP_default.OP_SWAP:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_SWAP requires at least two items to be on the stack.");
            x2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            x1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, x2);
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, x1);
            break;
          case OP_default.OP_TUCK:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_TUCK requires at least two items to be on the stack.");
            buf1 = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -1);
            __privateMethod(this, _Spend_instances, ensureStackMem_fn).call(this, buf1.length);
            this.stack.splice(-2, 0, buf1.slice());
            this.stackMem += buf1.length;
            break;
          case OP_default.OP_SIZE:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_SIZE requires at least one item to be on the stack.");
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, new BigNumber(__privateMethod(this, _Spend_instances, stackTop_fn).call(this).length).toScriptNum());
            break;
          case OP_default.OP_AND:
          case OP_default.OP_OR:
          case OP_default.OP_XOR: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, `${OP_default[currentOpcode]} requires at least two items on the stack.`);
              buf2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              buf1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              if (buf1.length !== buf2.length)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires the top two stack items to be the same size.`);
              const resultBufBitwiseOp = Array.from({ length: buf1.length }, () => 0);
              for (let k = 0; k < buf1.length; k++) {
                if (currentOpcode === OP_default.OP_AND)
                  resultBufBitwiseOp[k] = buf1[k] & buf2[k];
                else if (currentOpcode === OP_default.OP_OR)
                  resultBufBitwiseOp[k] = buf1[k] | buf2[k];
                else
                  resultBufBitwiseOp[k] = buf1[k] ^ buf2[k];
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, resultBufBitwiseOp);
            })();
            break;
          }
          case OP_default.OP_INVERT: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_INVERT requires at least one item to be on the stack.");
              buf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const invertedBufOp = Array.from({ length: buf.length }, () => 0);
              for (let k = 0; k < buf.length; k++) {
                invertedBufOp[k] = ~buf[k] & 255;
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, invertedBufOp);
            })();
            break;
          }
          case OP_default.OP_LSHIFT:
          case OP_default.OP_RSHIFT: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
              bn2 = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
              buf1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const shiftBits = bn2.toBigInt();
              if (shiftBits < 0n)
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires the top item on the stack not to be negative.`);
              if (buf1.length === 0) {
                __privateMethod(this, _Spend_instances, pushStack_fn).call(this, []);
                return;
              }
              if (shiftBits >= BigInt(buf1.length) * 8n) {
                __privateMethod(this, _Spend_instances, pushStack_fn).call(this, Array.from({ length: buf1.length }, () => 0));
                return;
              }
              bn1 = new BigNumber(buf1);
              let shiftedBn;
              if (currentOpcode === OP_default.OP_LSHIFT) {
                shiftedBn = bn1.ushln(shiftBits);
                const mask = new BigNumber(1).ushln(buf1.length * 8).isubn(1);
                shiftedBn = shiftedBn.iand(mask);
              } else {
                shiftedBn = bn1.ushrn(shiftBits);
              }
              const shiftedArr = shiftedBn.toArray("be", buf1.length);
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, shiftedArr);
            })();
            break;
          }
          case OP_default.OP_EQUAL:
          case OP_default.OP_EQUALVERIFY:
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
              buf2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              buf1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              fValue = compareNumberArrays(buf1, buf2);
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, fValue ? [1] : []);
              if (currentOpcode === OP_default.OP_EQUALVERIFY) {
                if (!fValue)
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_EQUALVERIFY requires the top two stack items to be equal.");
                __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              }
            })();
            break;
          case OP_default.OP_1ADD:
          case OP_default.OP_1SUB:
          case OP_default.OP_2MUL:
          case OP_default.OP_2DIV:
          case OP_default.OP_NEGATE:
          case OP_default.OP_ABS:
          case OP_default.OP_NOT:
          case OP_default.OP_0NOTEQUAL:
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, `${OP_default[currentOpcode]} requires at least one item to be on the stack.`);
              bn = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
              switch (currentOpcode) {
                case OP_default.OP_1ADD:
                  bn = bn.add(new BigNumber(1));
                  break;
                case OP_default.OP_1SUB:
                  bn = bn.sub(new BigNumber(1));
                  break;
                case OP_default.OP_2MUL:
                  bn = bn.mul(new BigNumber(2));
                  break;
                case OP_default.OP_2DIV:
                  bn = bn.div(new BigNumber(2));
                  break;
                case OP_default.OP_NEGATE:
                  bn = bn.neg();
                  break;
                case OP_default.OP_ABS:
                  if (bn.isNeg())
                    bn = bn.neg();
                  break;
                case OP_default.OP_NOT:
                  bn = new BigNumber(bn.cmpn(0) === 0 ? 1 : 0);
                  break;
                case OP_default.OP_0NOTEQUAL:
                  bn = new BigNumber(bn.cmpn(0) === 0 ? 0 : 1);
                  break;
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, bn.toScriptNum());
            })();
            break;
          case OP_default.OP_ADD:
          case OP_default.OP_SUB:
          case OP_default.OP_MUL:
          case OP_default.OP_DIV:
          case OP_default.OP_MOD:
          case OP_default.OP_BOOLAND:
          case OP_default.OP_BOOLOR:
          case OP_default.OP_NUMEQUAL:
          case OP_default.OP_NUMEQUALVERIFY:
          case OP_default.OP_NUMNOTEQUAL:
          case OP_default.OP_LESSTHAN:
          case OP_default.OP_GREATERTHAN:
          case OP_default.OP_LESSTHANOREQUAL:
          case OP_default.OP_GREATERTHANOREQUAL:
          case OP_default.OP_MIN:
          case OP_default.OP_MAX: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
              buf2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              buf1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              bn2 = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, buf2);
              bn1 = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, buf1);
              const predictedLen = (() => {
                switch (currentOpcode) {
                  case OP_default.OP_MUL:
                    return bn1.byteLength() + bn2.byteLength();
                  case OP_default.OP_ADD:
                  case OP_default.OP_SUB:
                    return Math.max(bn1.byteLength(), bn2.byteLength()) + 1;
                  default:
                    return Math.max(bn1.byteLength(), bn2.byteLength());
                }
              })();
              __privateMethod(this, _Spend_instances, ensureStackMem_fn).call(this, predictedLen);
              const resultBnArithmetic = (() => {
                switch (currentOpcode) {
                  case OP_default.OP_ADD:
                    return bn1.add(bn2);
                  case OP_default.OP_SUB:
                    return bn1.sub(bn2);
                  case OP_default.OP_MUL:
                    return bn1.mul(bn2);
                  case OP_default.OP_DIV:
                    if (bn2.cmpn(0) === 0)
                      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_DIV cannot divide by zero!");
                    return bn1.div(bn2);
                  case OP_default.OP_MOD:
                    if (bn2.cmpn(0) === 0)
                      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_MOD cannot divide by zero!");
                    return bn1.mod(bn2);
                  case OP_default.OP_BOOLAND:
                    return scriptBooleanAnd(bn1.cmpn(0) !== 0, bn2.cmpn(0) !== 0);
                  case OP_default.OP_BOOLOR:
                    return scriptBooleanOr(bn1.cmpn(0) !== 0, bn2.cmpn(0) !== 0);
                  case OP_default.OP_NUMEQUAL:
                  case OP_default.OP_NUMEQUALVERIFY:
                    return scriptBoolean(bn1.cmp(bn2) === 0);
                  case OP_default.OP_NUMNOTEQUAL:
                    return scriptBoolean(bn1.cmp(bn2) !== 0);
                  case OP_default.OP_LESSTHAN:
                    return scriptBoolean(bn1.cmp(bn2) < 0);
                  case OP_default.OP_GREATERTHAN:
                    return scriptBoolean(bn1.cmp(bn2) > 0);
                  case OP_default.OP_LESSTHANOREQUAL:
                    return scriptBoolean(bn1.cmp(bn2) <= 0);
                  case OP_default.OP_GREATERTHANOREQUAL:
                    return scriptBoolean(bn1.cmp(bn2) >= 0);
                  case OP_default.OP_MIN:
                    return smallerBigNumber(bn1, bn2);
                  case OP_default.OP_MAX:
                    return largerBigNumber(bn1, bn2);
                  default:
                    return new BigNumber(0);
                }
              })();
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, resultBnArithmetic.toScriptNum());
              if (currentOpcode === OP_default.OP_NUMEQUALVERIFY) {
                if (!__privateMethod(this, _Spend_instances, castToBool_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this)))
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_NUMEQUALVERIFY requires the top stack item to be truthy.");
                __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              }
            })();
            break;
          }
          case OP_default.OP_WITHIN:
            __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 3, "OP_WITHIN requires at least three items to be on the stack.");
            bn3 = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
            bn2 = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
            bn1 = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this));
            fValue = bn1.cmp(bn2) >= 0 && bn1.cmp(bn3) < 0;
            __privateMethod(this, _Spend_instances, pushStack_fn).call(this, fValue ? [1] : []);
            break;
          case OP_default.OP_RIPEMD160:
          case OP_default.OP_SHA1:
          case OP_default.OP_SHA256:
          case OP_default.OP_HASH160:
          case OP_default.OP_HASH256: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, `${OP_default[currentOpcode]} requires at least one item to be on the stack.`);
              buf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              let hashResult = [];
              if (currentOpcode === OP_default.OP_RIPEMD160)
                hashResult = ripemd160(buf);
              else if (currentOpcode === OP_default.OP_SHA1)
                hashResult = sha1(buf);
              else if (currentOpcode === OP_default.OP_SHA256)
                hashResult = sha256(buf);
              else if (currentOpcode === OP_default.OP_HASH160)
                hashResult = hash160(buf);
              else if (currentOpcode === OP_default.OP_HASH256)
                hashResult = hash256(buf);
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, hashResult);
            })();
            break;
          }
          case OP_default.OP_CODESEPARATOR:
            this.lastCodeSeparator = this.programCounter;
            break;
          case OP_default.OP_CHECKSIG:
          case OP_default.OP_CHECKSIGVERIFY: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
              bufPubkey = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              bufSig = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              if (!__privateMethod(this, _Spend_instances, checkSignatureEncoding_fn).call(this, bufSig) || !__privateMethod(this, _Spend_instances, checkPublicKeyEncoding_fn).call(this, bufPubkey)) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires correct encoding for the public key and signature.`);
              }
              fSuccess = (() => {
                if (bufSig.length === 0)
                  return false;
                try {
                  sig = __privateMethod(this, _Spend_instances, parseChecksigSignature_fn).call(this, bufSig);
                  const scriptForChecksig = this.context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
                  let scriptCodeChunks = scriptForChecksig.chunks.slice(this.lastCodeSeparator === null ? 0 : this.lastCodeSeparator + 1);
                  if (this.context === "UnlockingScript") {
                    scriptCodeChunks = scriptCodeChunks.concat(this.lockingScript.chunks);
                  }
                  subscript = new Script(scriptCodeChunks);
                  if ((sig.scope & TransactionSignature.SIGHASH_FORKID) === 0 || __privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGHASH_FORKID")) {
                    subscript.findAndDelete(new Script().writeBin(bufSig));
                  }
                  pubkey = PublicKey.fromDER(bufPubkey);
                  return __privateMethod(this, _Spend_instances, verifySignature_fn).call(this, sig, pubkey, subscript);
                } catch {
                  return false;
                }
              })();
              if (!fSuccess && __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "NULLFAIL") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this) && bufSig.length > 0) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires failing signatures to be empty.`);
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, fSuccess ? [1] : []);
              if (currentOpcode === OP_default.OP_CHECKSIGVERIFY) {
                if (!fSuccess)
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_CHECKSIGVERIFY requires that a valid signature is provided.");
                __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              }
            })();
            break;
          }
          case OP_default.OP_CHECKMULTISIG:
          case OP_default.OP_CHECKMULTISIGVERIFY: {
            ;
            (() => {
              i = 1;
              if (this.stack.length < i) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires at least 1 item for nKeys.`);
              }
              const nKeysCountBN = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -i));
              const nKeysCountBigInt = nKeysCountBN.toBigInt();
              const multisigKeyLimitBigInt = __privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) ? BigInt(maxMultisigKeyCountBeforeGenesis) : maxMultisigKeyCountBigInt;
              if (nKeysCountBigInt < 0n || nKeysCountBigInt > multisigKeyLimitBigInt) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires a key count between 0 and ${multisigKeyLimitBigInt.toString()}.`);
              }
              nKeysCount = Number(nKeysCountBigInt);
              const declaredKeyCount = nKeysCount;
              ikey = ++i;
              i += nKeysCount;
              if (this.stack.length < i) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} stack too small for nKeys and keys. Need ${i}, have ${this.stack.length}.`);
              }
              const nSigsCountBN = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -i));
              const nSigsCountBigInt = nSigsCountBN.toBigInt();
              if (nSigsCountBigInt < 0n || nSigsCountBigInt > BigInt(nKeysCount)) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires the number of signatures to be no greater than the number of keys.`);
              }
              nSigsCount = Number(nSigsCountBigInt);
              const declaredSigCount = nSigsCount;
              isig = ++i;
              i += nSigsCount;
              if (this.stack.length < i) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} stack too small for N, keys, M, sigs, and dummy. Need ${i}, have ${this.stack.length}.`);
              }
              const baseScriptCMS = this.context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
              const subscriptChunksCMS = baseScriptCMS.chunks.slice(this.lastCodeSeparator === null ? 0 : this.lastCodeSeparator + 1);
              subscript = new Script(subscriptChunksCMS);
              let hasNonEmptySignature = false;
              for (let k = 0; k < nSigsCount; k++) {
                bufSig = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -isig - k);
                if (bufSig.length > 0)
                  hasNonEmptySignature = true;
                if ((bufSig.at(-1) & TransactionSignature.SIGHASH_FORKID) === 0 || __privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGHASH_FORKID")) {
                  subscript.findAndDelete(new Script().writeBin(bufSig));
                }
              }
              ;
              (() => {
                fSuccess = true;
                while (fSuccess && nSigsCount > 0) {
                  if (nKeysCount === 0) {
                    fSuccess = false;
                    break;
                  }
                  bufSig = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -isig);
                  bufPubkey = __privateMethod(this, _Spend_instances, stackTop_fn).call(this, -ikey);
                  if (!__privateMethod(this, _Spend_instances, checkSignatureEncoding_fn).call(this, bufSig) || !__privateMethod(this, _Spend_instances, checkPublicKeyEncoding_fn).call(this, bufPubkey)) {
                    __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires correct encoding for the public key and signature.`);
                  }
                  fOk = false;
                  if (bufSig.length > 0) {
                    try {
                      sig = __privateMethod(this, _Spend_instances, parseChecksigSignature_fn).call(this, bufSig);
                      pubkey = PublicKey.fromDER(bufPubkey);
                      fOk = __privateMethod(this, _Spend_instances, verifySignature_fn).call(this, sig, pubkey, subscript);
                    } catch {
                      fOk = false;
                    }
                  }
                  if (fOk) {
                    isig++;
                    nSigsCount--;
                  }
                  ikey++;
                  nKeysCount--;
                  if (nSigsCount > nKeysCount) {
                    fSuccess = false;
                  }
                }
              })();
              (() => {
                if (!fSuccess && __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "NULLFAIL") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this) && hasNonEmptySignature) {
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires failing signatures to be empty.`);
                }
                const itemsConsumedByOp = 1 + // N_val
                declaredKeyCount + // keys
                1 + // M_val
                declaredSigCount + // sigs
                1;
                let popCount = itemsConsumedByOp - 1;
                while (popCount > 0) {
                  __privateMethod(this, _Spend_instances, popStack_fn).call(this);
                  popCount--;
                }
                __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, `${OP_default[currentOpcode]} requires an extra item (dummy) to be on the stack.`);
                const dummyBuf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
                if (__privateMethod(this, _Spend_instances, shouldEnforceNullDummy_fn).call(this) && dummyBuf.length > 0) {
                  __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} requires the extra stack item (dummy) to be empty.`);
                }
                __privateMethod(this, _Spend_instances, pushStack_fn).call(this, fSuccess ? [1] : []);
                if (currentOpcode === OP_default.OP_CHECKMULTISIGVERIFY) {
                  if (!fSuccess)
                    __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_CHECKMULTISIGVERIFY requires that a sufficient number of valid signatures are provided.");
                  __privateMethod(this, _Spend_instances, popStack_fn).call(this);
                }
              })();
            })();
            break;
          }
          case OP_default.OP_CAT: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_CAT requires at least two items to be on the stack.");
              buf2 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              buf1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const catResult = buf1.concat(buf2);
              if (catResult.length > __privateMethod(this, _Spend_instances, maxPushSize_fn).call(this))
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `It's not currently possible to push data larger than ${__privateMethod(this, _Spend_instances, maxPushSize_fn).call(this)} bytes.`);
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, catResult);
            })();
            break;
          }
          case OP_default.OP_SPLIT: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_SPLIT requires at least two items to be on the stack.");
              const posBuf = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const dataToSplit = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const splitIndexBigInt = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, posBuf).toBigInt();
              if (splitIndexBigInt < 0n || splitIndexBigInt > BigInt(dataToSplit.length)) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_SPLIT requires the first stack item to be a non-negative number less than or equal to the size of the second-from-top stack item.");
              }
              const splitIndex = Number(splitIndexBigInt);
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, dataToSplit.slice(0, splitIndex));
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, dataToSplit.slice(splitIndex));
            })();
            break;
          }
          case OP_default.OP_NUM2BIN: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 2, "OP_NUM2BIN requires at least two items to be on the stack.");
              const sizeBigInt = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, __privateMethod(this, _Spend_instances, popStack_fn).call(this)).toBigInt();
              const maxPushSize = __privateMethod(this, _Spend_instances, maxPushSize_fn).call(this);
              if (Number.isFinite(maxPushSize) && sizeBigInt > BigInt(maxPushSize) || sizeBigInt < 0n) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `It's not currently possible to push data larger than ${maxPushSize} bytes or negative size.`);
              }
              if (sizeBigInt > maxNodeNum2BinSize) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_NUM2BIN size exceeds the node int32 push limit.");
              }
              if (this.hasExplicitMemoryLimit && Number.isFinite(this.memoryLimit)) {
                const allocationLimit = Math.max(0, Math.floor(this.memoryLimit));
                if (sizeBigInt > BigInt(allocationLimit)) {
                  throw new ScriptResourceLimitError("element-size", allocationLimit, sizeBigInt);
                }
              }
              size = Number(sizeBigInt);
              let rawnum = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              rawnum = minimallyEncode(rawnum);
              if (rawnum.length > size) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_NUM2BIN requires that the size expressed in the top stack item is large enough to hold the value expressed in the second-from-top stack item.");
              }
              if (rawnum.length === size) {
                __privateMethod(this, _Spend_instances, pushStack_fn).call(this, rawnum);
                return;
              }
              const resultN2B = Array.from({ length: size }, () => 0);
              let signbit = 0;
              if (rawnum.length > 0) {
                signbit = rawnum.at(-1) & 128;
                rawnum[rawnum.length - 1] &= 127;
              }
              for (let k = 0; k < rawnum.length; k++) {
                resultN2B[k] = rawnum[k];
              }
              if (signbit !== 0) {
                resultN2B[size - 1] |= 128;
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, resultN2B);
            })();
            break;
          }
          case OP_default.OP_BIN2NUM: {
            ;
            (() => {
              __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_BIN2NUM requires at least one item to be on the stack.");
              buf1 = __privateMethod(this, _Spend_instances, popStack_fn).call(this);
              const b2nResult = minimallyEncode(buf1);
              if (!isMinimallyEncodedHelper(b2nResult)) {
                __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_BIN2NUM requires that the resulting number is valid.");
              }
              __privateMethod(this, _Spend_instances, pushStack_fn).call(this, b2nResult);
            })();
            break;
          }
          default:
            __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Invalid opcode ${currentOpcode} (pc=${this.programCounter}).`);
        }
      }
      __privateMethod(this, _Spend_instances, advanceAfterStep_fn).call(this, currentScript);
      return true;
    }
    /**
     * @method validate
     * Validates the spend action by interpreting the locking and unlocking scripts.
     * @param {SpendVerificationContext} context - Optional explicit consensus or
     *        policy context passed to a registered script backend.
     * @returns {boolean} Returns true when the spend is valid.
     * @throws {ScriptEvaluationError} If script validation fails.
     * @throws {ScriptResourceLimitError} If a local interpreter resource is
     *         exhausted before validity can be determined.
     * @example
     * spend.validate()
     * console.log("Spend is valid!")
     */
    validate(context) {
      const verifier = scriptVerificationBackend();
      const spend = __privateMethod(this, _Spend_instances, snapshotForVerifier_fn).call(this);
      const ownedContext = context === void 0 ? void 0 : snapshotSpendVerificationContext(context);
      if (verifier?.verifySpendSync !== void 0 && (verifier.isReady?.() ?? true) && (ownedContext === void 0 ? verifier.shouldVerifySpend?.(spend) : verifier.shouldVerifySpend?.(spend, ownedContext)) !== false) {
        const valid = ownedContext === void 0 ? verifier.verifySpendSync(spend) : verifier.verifySpendSync(spend, ownedContext);
        if (valid !== true) {
          __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The selected script-verification backend rejected the spend.");
        }
        return true;
      }
      return this.validateJavaScript();
    }
    /**
     * Runs the original TypeScript interpreter explicitly, bypassing any
     * registered optional backend.
     */
    validateJavaScript() {
      this.reset();
      if (__privateMethod(this, _Spend_instances, shouldEnforceSigPushOnly_fn).call(this) && !this.unlockingScript.isPushOnly()) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Unlocking scripts can only contain push operations, and no other opcodes.");
      }
      const originalLockingScript = this.lockingScript;
      const shouldEvaluateP2SH = __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "P2SH") && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && __privateMethod(this, _Spend_instances, isP2SHLockingScript_fn).call(this, this.lockingScript);
      if (shouldEvaluateP2SH && !this.unlockingScript.isPushOnly()) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "P2SH unlocking scripts can only contain push operations.");
      }
      __privateMethod(this, _Spend_instances, runScript_fn).call(this, "UnlockingScript");
      const stackAfterUnlockingScript = this.stack.map((item) => item.slice());
      __privateMethod(this, _Spend_instances, runScript_fn).call(this, "LockingScript");
      __privateMethod(this, _Spend_instances, requireTruthyTopStack_fn).call(this);
      try {
        if (shouldEvaluateP2SH) {
          if (stackAfterUnlockingScript.length === 0) {
            __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "P2SH evaluation requires a redeem script on the stack.");
          }
          const redeemScriptBytes = stackAfterUnlockingScript.pop();
          if (redeemScriptBytes === void 0) {
            __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "P2SH evaluation requires a redeem script on the stack.");
            return false;
          }
          __privateMethod(this, _Spend_instances, setStack_fn).call(this, stackAfterUnlockingScript);
          const redeemScript = Script.fromBinary(redeemScriptBytes);
          this.lockingScript = new LockingScript(redeemScript.chunks);
          __privateMethod(this, _Spend_instances, runScript_fn).call(this, "LockingScript");
        }
      } finally {
        this.lockingScript = originalLockingScript;
      }
      if (__privateMethod(this, _Spend_instances, shouldEnforceCleanStack_fn).call(this) && this.stack.length !== 1) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `The clean stack rule requires exactly one item to be on the stack after script execution, found ${this.stack.length}.`);
      }
      __privateMethod(this, _Spend_instances, requireTruthyTopStack_fn).call(this);
      return true;
    }
    /**
     * Validates this spend with an asynchronous pluggable backend. This is the
     * native/WASM counterpart to {@link validate}. An adaptive backend may decline
     * the Spend before execution, in which case the existing JavaScript validator
     * is used. Once selected, backend errors remain authoritative and propagate.
     * @param verifier - The backend used when it accepts this Spend.
     * @param context - Optional explicit consensus or policy context. Transaction
     * version is never used as a substitute for this context.
     */
    async validateWith(verifier, context) {
      const spend = __privateMethod(this, _Spend_instances, snapshotForVerifier_fn).call(this);
      const ownedContext = context === void 0 ? void 0 : snapshotSpendVerificationContext(context);
      const shouldVerify = ownedContext === void 0 ? verifier.shouldVerifySpend?.(spend) : verifier.shouldVerifySpend?.(spend, ownedContext);
      if (shouldVerify !== void 0 && typeof shouldVerify !== "boolean") {
        throw new TypeError("Spend verifier selection must be boolean");
      }
      if (shouldVerify === false) {
        return spend.validateJavaScript();
      }
      const verdict = ownedContext === void 0 ? await verifier.verifySpend(spend) : await verifier.verifySpend(spend, ownedContext);
      if (typeof verdict !== "boolean") {
        throw new TypeError("Spend verifier returned a non-boolean verdict");
      }
      return verdict;
    }
    /**
     * Serializes the ordinary transaction represented by this Spend. The source
     * output is intentionally excluded and is supplied separately to a Spend
     * verifier, avoiding an EF construction and parse for one-input validation.
     */
    toTransactionUint8Array() {
      const currentInput = {
        sourceTXID: this.sourceTXID,
        sourceOutputIndex: this.sourceOutputIndex,
        unlockingScript: this.unlockingScript,
        sequence: this.inputSequence
      };
      const inputs = this.allInputs ?? [
        ...this.otherInputs.slice(0, this.inputIndex),
        currentInput,
        ...this.otherInputs.slice(this.inputIndex)
      ];
      if (this.inputIndex < 0 || this.inputIndex >= inputs.length) {
        throw new RangeError("Spend input index is out of range");
      }
      const writer = new WriterUint8Array();
      writer.writeUInt32LE(this.transactionVersion);
      writer.writeVarIntNum(inputs.length);
      for (let index = 0; index < inputs.length; index++) {
        const input = index === this.inputIndex ? currentInput : inputs[index];
        const sourceTXID = input.sourceTXID ?? input.sourceTransaction?.id("hex");
        if (sourceTXID === void 0)
          throw new Error(`Input ${index} is missing its source transaction ID`);
        if (input.unlockingScript === void 0)
          throw new Error(`Input ${index} is missing its unlocking script`);
        writer.writeReverse(toArray2(sourceTXID, "hex"));
        writer.writeUInt32LE(input.sourceOutputIndex);
        const unlockingScript = input.unlockingScript.toUint8Array();
        writer.writeVarIntNum(unlockingScript.length);
        writer.write(unlockingScript);
        writer.writeUInt32LE(input.sequence ?? 4294967295);
      }
      writer.writeVarIntNum(this.outputs.length);
      for (const output of this.outputs) {
        writer.writeUInt64LE(output.satoshis ?? 0);
        const lockingScript = output.lockingScript.toUint8Array();
        writer.writeVarIntNum(lockingScript.length);
        writer.write(lockingScript);
      }
      writer.writeUInt32LE(this.lockTime);
      return writer.toUint8Array();
    }
  };
  _sigHashCache = new WeakMap();
  _ownsSigHashCache = new WeakMap();
  _Spend_instances = new WeakSet();
  isRelaxed_fn = function() {
    return this.isRelaxedOverride || this.transactionVersion > 1;
  };
  hasExplicitFlags_fn = function() {
    return this.verifyFlags !== void 0;
  };
  hasFlag_fn = function(flag) {
    return this.verifyFlags?.has(flag) === true;
  };
  isAfterGenesis_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this)) {
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "UTXO_AFTER_GENESIS") || __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "UTXO_AFTER_CHRONICLE");
    }
    return __privateMethod(this, _Spend_instances, isRelaxed_fn).call(this);
  };
  isAfterChronicle_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this))
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "UTXO_AFTER_CHRONICLE");
    return __privateMethod(this, _Spend_instances, isRelaxed_fn).call(this);
  };
  enforceNonMalleability_fn = function() {
    return !(__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "CHRONICLE") && this.transactionVersion > 1);
  };
  shouldEnforceMinimalData_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this))
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "MINIMALDATA") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this);
    return !__privateMethod(this, _Spend_instances, isRelaxed_fn).call(this);
  };
  shouldEnforceLowS_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this))
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "LOW_S") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this);
    return !__privateMethod(this, _Spend_instances, isRelaxed_fn).call(this);
  };
  shouldEnforceNullDummy_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this))
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "NULLDUMMY") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this);
    return !__privateMethod(this, _Spend_instances, isRelaxed_fn).call(this);
  };
  shouldEnforceSigPushOnly_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this))
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGPUSHONLY") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this);
    return !__privateMethod(this, _Spend_instances, isRelaxed_fn).call(this);
  };
  shouldEnforceCleanStack_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this))
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "CLEANSTACK") && __privateMethod(this, _Spend_instances, enforceNonMalleability_fn).call(this);
    return !__privateMethod(this, _Spend_instances, isRelaxed_fn).call(this);
  };
  shouldEnforceDerSignatures_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this)) {
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "DERSIG") || __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "STRICTENC") || __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "LOW_S") || __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGHASH_FORKID");
    }
    return true;
  };
  shouldEnforceStrictEncoding_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this)) {
      return __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "STRICTENC") || __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGHASH_FORKID");
    }
    return true;
  };
  scriptNumMaxSize_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this)) {
      if (!__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this))
        return 4;
      return __privateMethod(this, _Spend_instances, isAfterChronicle_fn).call(this) ? maxScriptNumLengthAfterChronicle : maxScriptNumLengthAfterGenesis;
    }
    return void 0;
  };
  maxPushSize_fn = function() {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this))
      return maxScriptElementSizeBeforeGenesis;
    return Number.POSITIVE_INFINITY;
  };
  ensureStackMem_fn = function(additional) {
    if (this.stackMem + additional > this.memoryLimit) {
      throw new ScriptResourceLimitError("stack", this.memoryLimit, this.stackMem + additional);
    }
  };
  ensureAltStackMem_fn = function(additional) {
    if (this.altStackMem + additional > this.memoryLimit) {
      throw new ScriptResourceLimitError("alt-stack", this.memoryLimit, this.altStackMem + additional);
    }
  };
  pushStack_fn = function(item) {
    __privateMethod(this, _Spend_instances, ensureStackMem_fn).call(this, item.length);
    this.stack.push(item);
    this.stackMem += item.length;
  };
  pushStackCopy_fn = function(item) {
    __privateMethod(this, _Spend_instances, ensureStackMem_fn).call(this, item.length);
    const copy = item.slice();
    this.stack.push(copy);
    this.stackMem += copy.length;
  };
  popStack_fn = function() {
    if (this.stack.length === 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Attempted to pop from an empty stack.");
    }
    const item = this.stack.pop();
    if (item === void 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Attempted to pop from an empty stack.");
      return [];
    }
    this.stackMem -= item.length;
    return item;
  };
  stackTop_fn = function(index = -1) {
    if (this.stack.length === 0 || this.stack.length < Math.abs(index) || index >= 0 && index >= this.stack.length) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Stack underflow accessing element at index ${index}. Stack length is ${this.stack.length}.`);
    }
    return this.stack[this.stack.length + index];
  };
  requireStackItems_fn = function(minimum, message) {
    if (this.stack.length < minimum)
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, message);
  };
  requireAltStackItems_fn = function(minimum, message) {
    if (this.altStack.length < minimum)
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, message);
  };
  setStack_fn = function(items) {
    this.stack = items.map((item) => item.slice());
    this.stackMem = this.stack.reduce((total, item) => total + item.length, 0);
  };
  clearAltStack_fn = function() {
    this.altStack = [];
    this.altStackMem = 0;
  };
  pushAltStack_fn = function(item) {
    __privateMethod(this, _Spend_instances, ensureAltStackMem_fn).call(this, item.length);
    this.altStack.push(item);
    this.altStackMem += item.length;
  };
  popAltStack_fn = function() {
    if (this.altStack.length === 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Attempted to pop from an empty alt stack.");
    }
    const item = this.altStack.pop();
    if (item === void 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Attempted to pop from an empty alt stack.");
      return [];
    }
    this.altStackMem -= item.length;
    return item;
  };
  readScriptNumber_fn = function(buf) {
    try {
      return BigNumber.fromScriptNum(buf, __privateMethod(this, _Spend_instances, shouldEnforceMinimalData_fn).call(this), __privateMethod(this, _Spend_instances, scriptNumMaxSize_fn).call(this));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, message);
    }
    return new BigNumber(0);
  };
  // The node uses the int64 CScriptNum constructor for these splice operands,
  // then clamps getint() to int32. Bytes after the eighth are ignored there.
  readSpliceOperand_fn = function(buf) {
    const maxSize = __privateMethod(this, _Spend_instances, scriptNumMaxSize_fn).call(this);
    if (maxSize !== void 0 && buf.length > maxSize) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "script number overflow");
    }
    if (__privateMethod(this, _Spend_instances, shouldEnforceMinimalData_fn).call(this) && !isMinimallyEncodedHelper(buf)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "non-minimally encoded script number");
    }
    let value;
    if (buf.length > 8) {
      value = 0n;
      for (let index = 0; index < 8; index++) {
        value |= BigInt(buf[index]) << BigInt(index * 8);
      }
      value = BigInt.asIntN(64, value);
    } else {
      value = __privateMethod(this, _Spend_instances, readScriptNumber_fn).call(this, buf).toBigInt();
    }
    if (value > 0x7fffffffn)
      return 2147483647;
    if (value < -0x80000000n)
      return -2147483648;
    return Number(value);
  };
  readLockTimeOperand_fn = function(buf) {
    try {
      return BigNumber.fromScriptNum(buf, __privateMethod(this, _Spend_instances, shouldEnforceMinimalData_fn).call(this), 5).toBigInt();
    } catch (error) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, error instanceof Error ? error.message : String(error));
    }
    return 0n;
  };
  isDefinedHashType_fn = function(scope) {
    const baseType = scope & 31;
    return baseType >= TransactionSignature.SIGHASH_ALL && baseType <= TransactionSignature.SIGHASH_SINGLE;
  };
  enforceSignatureHashType_fn = function(sig) {
    if (!__privateMethod(this, _Spend_instances, shouldEnforceStrictEncoding_fn).call(this))
      return;
    if (!__privateMethod(this, _Spend_instances, isDefinedHashType_fn).call(this, sig.scope)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The signature hash type is invalid.");
    }
    const usesChronicle = (sig.scope & TransactionSignature.SIGHASH_CHRONICLE) !== 0;
    const chronicleEnabled = __privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) ? __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "CHRONICLE") : __privateMethod(this, _Spend_instances, isAfterChronicle_fn).call(this);
    if (usesChronicle && !chronicleEnabled) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The signature hash type is invalid before Chronicle.");
    }
  };
  enforceSignatureForkId_fn = function(sig) {
    if (!__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) || !__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "STRICTENC"))
      return;
    const hasForkId = (sig.scope & TransactionSignature.SIGHASH_FORKID) !== 0;
    if (__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGHASH_FORKID") && !hasForkId) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The signature must use SIGHASH_FORKID.");
    }
    if (!__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGHASH_FORKID") && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && hasForkId) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The signature must not use SIGHASH_FORKID.");
    }
  };
  checkSignatureEncoding_fn = function(buf) {
    if (buf.length === 0)
      return true;
    const enforceDer = __privateMethod(this, _Spend_instances, shouldEnforceDerSignatures_fn).call(this);
    if (enforceDer && !isChecksigFormatHelper(buf)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The signature format is invalid.");
      return false;
    }
    try {
      const sig = TransactionSignature.fromChecksigFormat(buf);
      __privateMethod(this, _Spend_instances, enforceSignatureHashType_fn).call(this, sig);
      __privateMethod(this, _Spend_instances, enforceSignatureForkId_fn).call(this, sig);
      if (__privateMethod(this, _Spend_instances, shouldEnforceLowS_fn).call(this) && !sig.hasLowS()) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The signature must have a low S value.");
        return false;
      }
    } catch {
      if (enforceDer) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The signature format is invalid.");
        return false;
      }
    }
    return true;
  };
  parseChecksigSignature_fn = function(buf) {
    try {
      return TransactionSignature.fromChecksigFormat(buf);
    } catch (e) {
      if (__privateMethod(this, _Spend_instances, shouldEnforceDerSignatures_fn).call(this))
        throw e;
      return __privateMethod(this, _Spend_instances, parseLaxChecksigSignature_fn).call(this, buf);
    }
  };
  readLaxDERLength_fn = function(buf, position) {
    const first = buf[position.value++];
    if (first === void 0)
      throw new Error("Invalid DER length");
    if ((first & 128) === 0)
      return first;
    const lengthBytes = first & 127;
    if (lengthBytes === 0 || position.value + lengthBytes > buf.length) {
      throw new Error("Invalid DER length");
    }
    let length = 0;
    for (let i = 0; i < lengthBytes; i++) {
      length = length << 8 | (buf[position.value++] ?? 0);
    }
    return length;
  };
  parseLaxDERInteger_fn = function(buf, position, sequenceEnd) {
    if (position.value >= sequenceEnd || buf[position.value++] !== 2) {
      throw new Error("Invalid DER integer");
    }
    const length = __privateMethod(this, _Spend_instances, readLaxDERLength_fn).call(this, buf, position);
    if (position.value + length > sequenceEnd) {
      throw new Error("Invalid DER integer length");
    }
    let bytes3 = buf.slice(position.value, position.value + length);
    position.value += length;
    while (bytes3.length > 1 && bytes3[0] === 0)
      bytes3 = bytes3.slice(1);
    if (bytes3.length === 0)
      bytes3 = [0];
    return new BigNumber(bytes3);
  };
  parseLaxChecksigSignature_fn = function(buf) {
    if (buf.length === 0)
      return TransactionSignature.fromChecksigFormat(buf);
    const scope = buf.at(-1);
    const der = buf.slice(0, -1);
    const position = { value: 0 };
    if (der[position.value++] !== 48)
      throw new Error("Signature DER must start with 0x30");
    const sequenceLength = __privateMethod(this, _Spend_instances, readLaxDERLength_fn).call(this, der, position);
    const sequenceEnd = Math.min(position.value + sequenceLength, der.length);
    const r2 = __privateMethod(this, _Spend_instances, parseLaxDERInteger_fn).call(this, der, position, sequenceEnd);
    const s2 = __privateMethod(this, _Spend_instances, parseLaxDERInteger_fn).call(this, der, position, sequenceEnd);
    return new TransactionSignature(r2, s2, scope);
  };
  checkPublicKeyEncoding_fn = function(buf) {
    if (!__privateMethod(this, _Spend_instances, shouldEnforceStrictEncoding_fn).call(this))
      return true;
    if (buf.length === 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Public key is empty.");
      return false;
    }
    if (buf.length < 33) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The public key is too short, it must be at least 33 bytes.");
      return false;
    }
    if (buf[0] === 4) {
      if (buf.length !== 65) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The non-compressed public key must be 65 bytes.");
        return false;
      }
    } else if (buf[0] === 2 || buf[0] === 3) {
      if (buf.length !== 33) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The compressed public key must be 33 bytes.");
        return false;
      }
    } else {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The public key is in an unknown format.");
      return false;
    }
    try {
      PublicKey.fromDER(buf);
    } catch {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The public key is in an unknown format.");
      return false;
    }
    return true;
  };
  verifySignature_fn = function(sig, pubkey, subscript) {
    const params = {
      sourceTXID: this.sourceTXID,
      sourceOutputIndex: this.sourceOutputIndex,
      sourceSatoshis: this.sourceSatoshis,
      transactionVersion: this.transactionVersion,
      otherInputs: this.otherInputs,
      allInputs: this.allInputs,
      outputs: this.outputs,
      inputIndex: this.inputIndex,
      subscript,
      inputSequence: this.inputSequence,
      lockTime: this.lockTime,
      scope: sig.scope,
      sighashForkIdEnabled: !__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) || __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "SIGHASH_FORKID"),
      cache: __privateGet(this, _sigHashCache)
    };
    const hash = TransactionSignature.usesOtdaSingleBug(params) ? new BigNumber([1, ...Array.from({ length: 31 }, () => 0)]) : new BigNumber(hash256(TransactionSignature.formatBytes(params)));
    return verify(hash, sig, pubkey);
  };
  enforceStepResourceLimits_fn = function() {
    if (this.stackMem > this.memoryLimit) {
      throw new ScriptResourceLimitError("stack", this.memoryLimit, this.stackMem);
    }
    if (this.altStackMem > this.memoryLimit) {
      throw new ScriptResourceLimitError("alt-stack", this.memoryLimit, this.altStackMem);
    }
  };
  currentScriptForStep_fn = function() {
    if (this.context === "UnlockingScript" && this.programCounter >= this.unlockingScript.chunks.length) {
      if (this.ifStack.length > 0) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Every OP_IF, OP_NOTIF, or OP_ELSE must be terminated with OP_ENDIF prior to the end of the unlocking script.");
      }
      __privateMethod(this, _Spend_instances, clearAltStack_fn).call(this);
      this.ifStack = [];
      this.elseStack = [];
      this.returningFromConditional = false;
      this.lastCodeSeparator = null;
      this.context = "LockingScript";
      this.programCounter = 0;
    }
    return this.context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
  };
  opcodeForOperation_fn = function(operation) {
    const currentOpcode = operation.op;
    if (currentOpcode === void 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Missing opcode in ${this.context} at pc=${this.programCounter}.`);
      return 0;
    }
    if (operation.invalidLength === true) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Malformed push data in ${this.context} at pc=${this.programCounter}.`);
    }
    if (Array.isArray(operation.data) && operation.data.length > __privateMethod(this, _Spend_instances, maxPushSize_fn).call(this)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Data push > ${__privateMethod(this, _Spend_instances, maxPushSize_fn).call(this)} bytes (pc=${this.programCounter}).`);
    }
    return currentOpcode;
  };
  enforceChronicleOnlyOpcode_fn = function(currentOpcode) {
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterChronicle_fn).call(this) && (currentOpcode === OP_default.OP_2MUL || currentOpcode === OP_default.OP_2DIV || currentOpcode === OP_default.OP_VERIF || currentOpcode === OP_default.OP_VERNOTIF)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} is disabled until Chronicle.`);
    }
  };
  executeDataPush_fn = function(operation) {
    if (__privateMethod(this, _Spend_instances, shouldEnforceMinimalData_fn).call(this) && !isChunkMinimalPushHelper(operation)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `This data is not minimally-encoded. (PC: ${this.programCounter})`);
    }
    __privateMethod(this, _Spend_instances, pushStack_fn).call(this, Array.isArray(operation.data) ? operation.data : []);
  };
  countExecutedOpcode_fn = function(currentOpcode, isScriptExecuting) {
    if (!isScriptExecuting || currentOpcode <= OP_default.OP_16)
      return;
    this.executedOpCount++;
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && this.executedOpCount > maxOpsBeforeGenesis) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Script executed more than ${maxOpsBeforeGenesis} opcodes.`);
    }
  };
  skipUnavailablePreChronicleOpcode_fn = function(currentOpcode, isScriptExecuting) {
    if (!__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) || __privateMethod(this, _Spend_instances, isAfterChronicle_fn).call(this))
      return false;
    if (isScriptExecuting && (currentOpcode === OP_default.OP_SUBSTR || currentOpcode === OP_default.OP_LEFT || currentOpcode === OP_default.OP_RIGHT || currentOpcode === OP_default.OP_LSHIFTNUM || currentOpcode === OP_default.OP_RSHIFTNUM)) {
      if (__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "DISCOURAGE_UPGRADABLE_NOPS")) {
        __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} is discouraged by verification flags.`);
      }
      this.programCounter++;
      return true;
    }
    if ((isScriptExecuting || !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this)) && (currentOpcode === OP_default.OP_2MUL || currentOpcode === OP_default.OP_2DIV)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} is disabled until Chronicle.`);
    }
    if ((isScriptExecuting || !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this)) && (currentOpcode === OP_default.OP_VER || currentOpcode === OP_default.OP_VERIF || currentOpcode === OP_default.OP_VERNOTIF)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} is disabled until Chronicle.`);
    }
    if (!isScriptExecuting && __privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && (currentOpcode === OP_default.OP_VERIF || currentOpcode === OP_default.OP_VERNOTIF)) {
      this.programCounter++;
      return true;
    }
    return false;
  };
  enforceDiscouragedNop_fn = function(currentOpcode, isScriptExecuting) {
    const inactiveLocktime = currentOpcode === OP_default.OP_CHECKLOCKTIMEVERIFY && (!__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "CHECKLOCKTIMEVERIFY") || __privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this));
    const inactiveSequence = currentOpcode === OP_default.OP_CHECKSEQUENCEVERIFY && (!__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "CHECKSEQUENCEVERIFY") || __privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this));
    if (isScriptExecuting && __privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "DISCOURAGE_UPGRADABLE_NOPS") && (currentOpcode === OP_default.OP_NOP1 || inactiveLocktime || inactiveSequence || currentOpcode === OP_default.OP_NOP9 || currentOpcode === OP_default.OP_NOP10)) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `${OP_default[currentOpcode]} is discouraged by verification flags.`);
    }
  };
  verifyCheckLockTime_fn = function() {
    if (!__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "CHECKLOCKTIMEVERIFY") || __privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this))
      return;
    __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_CHECKLOCKTIMEVERIFY requires one stack item.");
    const required = __privateMethod(this, _Spend_instances, readLockTimeOperand_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this));
    if (required < 0n)
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Negative lock time.");
    const requiredIsHeight = required < BigInt(locktimeThreshold);
    const transactionIsHeight = this.lockTime < locktimeThreshold;
    if (requiredIsHeight !== transactionIsHeight || required > BigInt(this.lockTime) || this.inputSequence === 4294967295) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_CHECKLOCKTIMEVERIFY lock time is unsatisfied.");
    }
  };
  verifyCheckSequence_fn = function() {
    if (!__privateMethod(this, _Spend_instances, hasFlag_fn).call(this, "CHECKSEQUENCEVERIFY") || __privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this))
      return;
    __privateMethod(this, _Spend_instances, requireStackItems_fn).call(this, 1, "OP_CHECKSEQUENCEVERIFY requires at least one item to be on the stack.");
    const sequenceLock = __privateMethod(this, _Spend_instances, readLockTimeOperand_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this));
    if (sequenceLock < 0n) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_CHECKSEQUENCEVERIFY requires a non-negative lock time.");
    }
    if ((sequenceLock & BigInt(sequenceLocktimeDisableFlag)) !== 0n)
      return;
    const sequence = BigInt(this.inputSequence >>> 0);
    const mask = BigInt(sequenceLocktimeTypeFlag | sequenceLocktimeMask);
    const required = sequenceLock & mask;
    const actual = sequence & mask;
    if (this.transactionVersion >>> 0 < 2 || (sequence & BigInt(sequenceLocktimeDisableFlag)) !== 0n || (required & BigInt(sequenceLocktimeTypeFlag)) !== (actual & BigInt(sequenceLocktimeTypeFlag)) || required > actual) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "OP_CHECKSEQUENCEVERIFY lock time is unsatisfied.");
    }
  };
  advanceAfterStep_fn = function(currentScript) {
    if (this.returningFromConditional && this.ifStack.length === 0) {
      this.programCounter = currentScript.chunks.length;
    } else {
      this.programCounter++;
    }
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && this.stack.length + this.altStack.length > maxStackItemsBeforeGenesis) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Stack item count has exceeded ${maxStackItemsBeforeGenesis}.`);
    }
  };
  snapshotForVerifier_fn = function() {
    const cloneLockingScript = (script) => new LockingScript(script.chunks.map((chunk) => ({
      op: chunk.op,
      data: chunk.data === void 0 ? void 0 : Array.from(chunk.data),
      invalidLength: chunk.invalidLength
    })));
    const cloneUnlockingScript = (script) => new UnlockingScript(script.chunks.map((chunk) => ({
      op: chunk.op,
      data: chunk.data === void 0 ? void 0 : Array.from(chunk.data),
      invalidLength: chunk.invalidLength
    })));
    const cloneInput = (input) => ({
      sourceTXID: input.sourceTXID ?? input.sourceTransaction?.id("hex"),
      sourceOutputIndex: input.sourceOutputIndex,
      unlockingScript: input.unlockingScript === void 0 ? void 0 : cloneUnlockingScript(input.unlockingScript),
      sequence: input.sequence
    });
    return new _Spend({
      sourceTXID: this.sourceTXID,
      sourceOutputIndex: this.sourceOutputIndex,
      sourceSatoshis: this.sourceSatoshis,
      lockingScript: cloneLockingScript(this.lockingScript),
      transactionVersion: this.transactionVersion,
      otherInputs: this.otherInputs.map(cloneInput),
      allInputs: this.allInputs?.map(cloneInput),
      outputs: this.outputs.map((output) => ({
        satoshis: output.satoshis,
        lockingScript: cloneLockingScript(output.lockingScript),
        change: output.change
      })),
      inputIndex: this.inputIndex,
      unlockingScript: cloneUnlockingScript(this.unlockingScript),
      inputSequence: this.inputSequence,
      lockTime: this.lockTime,
      memoryLimit: this.hasExplicitMemoryLimit ? this.memoryLimit : void 0,
      isRelaxed: this.isRelaxedOverride,
      verifyFlags: this.verifyFlags === void 0 ? void 0 : Array.from(this.verifyFlags)
    });
  };
  runScript_fn = function(context) {
    this.context = context;
    this.programCounter = 0;
    this.ifStack = [];
    this.elseStack = [];
    this.returningFromConditional = false;
    __privateMethod(this, _Spend_instances, clearAltStack_fn).call(this);
    this.lastCodeSeparator = null;
    const script = context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
    if (__privateMethod(this, _Spend_instances, hasExplicitFlags_fn).call(this) && !__privateMethod(this, _Spend_instances, isAfterGenesis_fn).call(this) && script.toUint8Array().length > maxScriptSizeBeforeGenesis) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, `Script size exceeds ${maxScriptSizeBeforeGenesis} bytes.`);
    }
    while (this.programCounter < script.chunks.length) {
      this.step();
    }
    if (this.ifStack.length > 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "Every OP_IF, OP_NOTIF, or OP_ELSE must be terminated with OP_ENDIF prior to the end of the script.");
    }
    this.ifStack = [];
    this.elseStack = [];
    __privateMethod(this, _Spend_instances, clearAltStack_fn).call(this);
    this.lastCodeSeparator = null;
  };
  isP2SHLockingScript_fn = function(script) {
    const chunks = script.chunks;
    return chunks.length === 3 && chunks[0].op === OP_default.OP_HASH160 && chunks[1].op === 20 && Array.isArray(chunks[1].data) && chunks[1].data.length === 20 && chunks[2].op === OP_default.OP_EQUAL;
  };
  requireTruthyTopStack_fn = function() {
    if (this.stack.length === 0) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The top stack element must be truthy after script evaluation (stack is empty).");
    } else if (!__privateMethod(this, _Spend_instances, castToBool_fn).call(this, __privateMethod(this, _Spend_instances, stackTop_fn).call(this))) {
      __privateMethod(this, _Spend_instances, scriptEvaluationError_fn).call(this, "The top stack element must be truthy after script evaluation.");
    }
  };
  castToBool_fn = function(val) {
    if (val.length === 0)
      return false;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== 0) {
        return !(i === val.length - 1 && val[i] === 128);
      }
    }
    return false;
  };
  scriptEvaluationError_fn = function(str) {
    throw new ScriptEvaluationError({
      message: str,
      txid: this.sourceTXID,
      outputIndex: this.sourceOutputIndex,
      context: this.context,
      programCounter: this.programCounter,
      stackState: this.stack,
      altStackState: this.altStack,
      ifStackState: this.ifStack,
      stackMem: this.stackMem,
      altStackMem: this.altStackMem
    });
  };
  var Spend = _Spend;

  // node_modules/@bsv/sdk/dist/esm/src/script/templates/SignatureUtils.js
  var MAX_SATOSHIS = 21e14;
  var MAX_UINT32 = 4294967295;
  function requireUInt32(value, name) {
    if (!Number.isSafeInteger(value) || value < 0 || value > MAX_UINT32) {
      throw new Error(`${name} must be an unsigned 32-bit integer`);
    }
    return value;
  }
  function requireSatoshis(value, name) {
    if (!Number.isSafeInteger(value) || value < 0 || value > MAX_SATOSHIS) {
      throw new Error(`${name} must be a valid number of satoshis`);
    }
    return value;
  }
  function requireTxid(value, name) {
    if (typeof value !== "string" || !/^[0-9a-fA-F]{64}$/.test(value)) {
      throw new Error(`${name} must be a 32-byte hexadecimal transaction ID`);
    }
    return value.toLowerCase();
  }
  function requireScript(value, name) {
    if (value == null || typeof value !== "object" || typeof value.toHex !== "function") {
      throw new Error(`${name} must be a Script`);
    }
    const hex2 = value.toHex();
    if (typeof hex2 !== "string" || !/^(?:[0-9a-fA-F]{2})*$/.test(hex2)) {
      throw new Error(`${name} must serialize to a valid hexadecimal script`);
    }
    return value;
  }
  function computeSignatureScope(signOutputs, anyoneCanPay) {
    if (signOutputs !== "all" && signOutputs !== "none" && signOutputs !== "single") {
      throw new Error('signOutputs must be "all", "none", or "single"');
    }
    if (typeof anyoneCanPay !== "boolean") {
      throw new TypeError("anyoneCanPay must be a boolean");
    }
    let signatureScope = TransactionSignature.SIGHASH_FORKID;
    if (signOutputs === "all") {
      signatureScope |= TransactionSignature.SIGHASH_ALL;
    }
    if (signOutputs === "none") {
      signatureScope |= TransactionSignature.SIGHASH_NONE;
    }
    if (signOutputs === "single") {
      signatureScope |= TransactionSignature.SIGHASH_SINGLE;
    }
    if (anyoneCanPay) {
      signatureScope |= TransactionSignature.SIGHASH_ANYONECANPAY;
    }
    return signatureScope;
  }
  function resolveSourceDetails(tx, inputIndex, providedSourceSatoshis, providedLockingScript) {
    if (tx == null || !Array.isArray(tx.inputs)) {
      throw new Error("A transaction with inputs is required for transaction signing.");
    }
    if (!Number.isSafeInteger(inputIndex) || inputIndex < 0 || inputIndex >= tx.inputs.length) {
      throw new Error(`inputIndex ${inputIndex} is outside the transaction input range`);
    }
    const input = tx.inputs[inputIndex];
    const sourceOutputIndex = requireUInt32(input.sourceOutputIndex, "input.sourceOutputIndex");
    const providedSourceTXID = input.sourceTXID === void 0 ? void 0 : requireTxid(input.sourceTXID, "input.sourceTXID");
    const embeddedSourceTXID = input.sourceTransaction === void 0 ? void 0 : requireTxid(input.sourceTransaction.id("hex"), "input.sourceTransaction ID");
    if (providedSourceTXID !== void 0 && embeddedSourceTXID !== void 0 && providedSourceTXID !== embeddedSourceTXID) {
      throw new Error("The input sourceTXID does not match the input sourceTransaction.");
    }
    const sourceTXID = providedSourceTXID ?? embeddedSourceTXID;
    if (sourceTXID === void 0) {
      throw new Error("The input sourceTXID or sourceTransaction is required for transaction signing.");
    }
    const sourceOutput = input.sourceTransaction?.outputs[sourceOutputIndex];
    if (input.sourceTransaction !== void 0 && sourceOutput == null) {
      throw new Error(`The input sourceTransaction has no output at index ${sourceOutputIndex}.`);
    }
    const explicitSourceSatoshis = providedSourceSatoshis === void 0 ? void 0 : requireSatoshis(providedSourceSatoshis, "sourceSatoshis");
    const embeddedSourceSatoshis = sourceOutput?.satoshis === void 0 ? void 0 : requireSatoshis(sourceOutput.satoshis, "sourceTransaction output satoshis");
    if (explicitSourceSatoshis !== void 0 && embeddedSourceSatoshis !== void 0 && explicitSourceSatoshis !== embeddedSourceSatoshis) {
      throw new Error("The sourceSatoshis does not match the input sourceTransaction output.");
    }
    const sourceSatoshis = explicitSourceSatoshis ?? embeddedSourceSatoshis;
    if (sourceSatoshis === void 0) {
      throw new Error("The sourceSatoshis or input sourceTransaction is required for transaction signing.");
    }
    const explicitLockingScript = providedLockingScript === void 0 ? void 0 : requireScript(providedLockingScript, "lockingScript");
    const embeddedLockingScript = sourceOutput?.lockingScript === void 0 ? void 0 : requireScript(sourceOutput.lockingScript, "sourceTransaction output lockingScript");
    if (explicitLockingScript !== void 0 && embeddedLockingScript !== void 0 && explicitLockingScript.toHex().toLowerCase() !== embeddedLockingScript.toHex().toLowerCase()) {
      throw new Error("The lockingScript does not match the input sourceTransaction output.");
    }
    const lockingScript = explicitLockingScript ?? embeddedLockingScript;
    if (lockingScript === void 0) {
      throw new Error("The lockingScript or input sourceTransaction is required for transaction signing.");
    }
    return {
      sourceTXID,
      sourceSatoshis,
      lockingScript,
      allInputs: tx.inputs,
      // Preserve the public helper's legacy result without paying for it unless a
      // caller explicitly reads the property.
      get otherInputs() {
        return tx.inputs.filter((_, index) => index !== inputIndex);
      }
    };
  }
  function formatPreimage(params) {
    const { tx, inputIndex, signatureScope, sourceTXID, sourceSatoshis, lockingScript, otherInputs, allInputs, inputSequence } = params;
    const input = tx.inputs[inputIndex];
    requireUInt32(input.sourceOutputIndex, "input.sourceOutputIndex");
    requireSatoshis(sourceSatoshis, "sourceSatoshis");
    requireTxid(sourceTXID, "sourceTXID");
    requireScript(lockingScript, "lockingScript");
    requireUInt32(signatureScope, "signatureScope");
    const sequence = inputSequence ?? verifyNotNull(input.sequence, "input.sequence must have value");
    requireUInt32(sequence, "inputSequence");
    return TransactionSignature.format({
      sourceTXID,
      sourceOutputIndex: verifyNotNull(input.sourceOutputIndex, "input.sourceOutputIndex must have value"),
      sourceSatoshis,
      transactionVersion: tx.version,
      otherInputs: otherInputs ?? [],
      allInputs,
      inputIndex,
      outputs: tx.outputs,
      inputSequence: sequence,
      subscript: lockingScript,
      lockTime: tx.lockTime,
      scope: signatureScope,
      cache: tx.getSignatureHashCache()
    });
  }

  // node_modules/@bsv/sdk/dist/esm/src/script/templates/P2PKH.js
  var P2PKH = class {
    /**
     * Creates a P2PKH locking script for a given public key hash or address string
     *
     * @param {number[] | string} pubkeyhash or address - An array or address representing the public key hash.
     * @returns {LockingScript} - A P2PKH locking script.
     */
    lock(pubkeyhash) {
      let data;
      if (typeof pubkeyhash === "string") {
        const hash = fromBase58Check(pubkeyhash);
        if (hash.prefix.length !== 1 || hash.prefix[0] !== 0 && hash.prefix[0] !== 111) {
          throw new Error("only P2PKH is supported");
        }
        data = hash.data;
      } else {
        if (!Array.isArray(pubkeyhash)) {
          throw new Error("P2PKH hash must be a dense byte array");
        }
        for (let index = 0; index < pubkeyhash.length; index++) {
          const byte = pubkeyhash[index];
          if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
            throw new Error("P2PKH hash must be a dense byte array");
          }
        }
        data = pubkeyhash;
      }
      if (data.length !== 20) {
        throw new Error("P2PKH hash length must be 20 bytes");
      }
      return new LockingScript([
        { op: OP_default.OP_DUP },
        { op: OP_default.OP_HASH160 },
        { op: data.length, data },
        { op: OP_default.OP_EQUALVERIFY },
        { op: OP_default.OP_CHECKSIG }
      ]);
    }
    /**
     * Creates a function that generates a P2PKH unlocking script along with its signature and length estimation.
     *
     * The returned object contains:
     * 1. `sign` - A function that, when invoked with a transaction and an input index,
     *    produces an unlocking script suitable for a P2PKH locked output.
     * 2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.
     *
     * @param {PrivateKey} privateKey - The private key used for signing the transaction.
     * @param {'all'|'none'|'single'} signOutputs - The signature scope for outputs.
     * @param {boolean} anyoneCanPay - Flag indicating if the signature allows for other inputs to be added later.
     * @param {number} sourceSatoshis - Optional. The amount being unlocked. Otherwise the input.sourceTransaction is required.
     * @param {Script} lockingScript - Optional. The lockinScript. Otherwise the input.sourceTransaction is required.
     * @returns {Object} - An object containing the `sign` and `estimateLength` functions.
     */
    unlock(privateKey, signOutputs = "all", anyoneCanPay = false, sourceSatoshis, lockingScript) {
      return {
        sign: async (tx, inputIndex) => {
          const signatureScope = computeSignatureScope(signOutputs, anyoneCanPay);
          const resolved = resolveSourceDetails(tx, inputIndex, sourceSatoshis, lockingScript);
          const preimage = formatPreimage({
            tx,
            inputIndex,
            signatureScope,
            sourceTXID: resolved.sourceTXID,
            sourceSatoshis: resolved.sourceSatoshis,
            lockingScript: resolved.lockingScript,
            allInputs: resolved.allInputs
          });
          const preimageHash = sha256(preimage);
          const signingBackend = readyAsyncCryptoBackend("signDigest");
          const publicKeyBackend = readyAsyncCryptoBackend("publicKeyFromPrivate");
          const privateKeyBytes = signingBackend === void 0 && publicKeyBackend === void 0 ? void 0 : Uint8Array.from(privateKey.toArray("be", 32));
          const publicKeyBytes = publicKeyBackend === void 0 ? privateKey.toPublicKey().encode(true) : void 0;
          const rawSignature = signingBackend === void 0 ? privateKey.sign(preimageHash) : Signature.fromDER(Array.from(validateAsyncCryptoBytes("signDigest", await signingBackend.signDigest(
            privateKeyBytes,
            // PrivateKey.sign hashes its argument before ECDSA signing.
            // Preserve that historical double-SHA256 contract when passing a
            // digest to a backend that signs the supplied bytes directly.
            Uint8Array.from(sha256(preimageHash))
          ))));
          const sig = new TransactionSignature(rawSignature.r, rawSignature.s, signatureScope);
          const sigForScript = sig.toChecksigFormat();
          const pubkeyForScript = publicKeyBackend === void 0 ? publicKeyBytes : Array.from(validateCompressedPublicKey(await publicKeyBackend.publicKeyFromPrivate(privateKeyBytes)));
          return new UnlockingScript([
            { op: sigForScript.length, data: sigForScript },
            { op: pubkeyForScript.length, data: pubkeyForScript }
          ]);
        },
        estimateLength: async () => {
          return 108;
        }
      };
    }
  };
  function validateCompressedPublicKey(value) {
    const bytes3 = validateAsyncCryptoBytes("publicKeyFromPrivate", value, 33);
    if (bytes3[0] !== 2 && bytes3[0] !== 3) {
      throw new Error("publicKeyFromPrivate returned an invalid compressed public key");
    }
    return bytes3;
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/SatoshisPerKilobyte.js
  var SatoshisPerKilobyte = class {
    /**
     * Constructs an instance of the sat/kb fee model.
     *
     * @param {number} value - The number of satoshis per kilobyte to charge as a fee.
     */
    constructor(value) {
      /**
       * @property
       * Denotes the number of satoshis paid per kilobyte of transaction size.
       */
      __publicField(this, "value");
      validateRate(value);
      this.value = value;
    }
    /**
     * Computes the fee for a given transaction.
     *
     * @param tx The transaction for which a fee is to be computed.
     * @returns The fee in satoshis for the transaction, as a BigNumber.
     */
    async computeFee(tx) {
      const rate = this.value;
      validateRate(rate);
      const getVarIntSize = (i) => {
        if (i > 4294967295) {
          return 9;
        } else if (i > 65535) {
          return 5;
        } else if (i >= 253) {
          return 3;
        } else {
          return 1;
        }
      };
      let size = 4;
      size += getVarIntSize(tx.inputs.length);
      for (let i = 0; i < tx.inputs.length; i++) {
        const input = tx.inputs[i];
        size += 40;
        let scriptLength;
        if (typeof input.unlockingScript === "object") {
          scriptLength = input.unlockingScript.toBinary().length;
        } else if (typeof input.unlockingScriptTemplate === "object") {
          scriptLength = await input.unlockingScriptTemplate.estimateLength(tx, i);
        } else {
          throw new TypeError("All inputs must have an unlocking script or an unlocking script template for sat/kb fee computation.");
        }
        if (!Number.isSafeInteger(scriptLength) || scriptLength < 0) {
          throw new RangeError("Unlocking script length must be a non-negative safe integer.");
        }
        size += getVarIntSize(scriptLength);
        size += scriptLength;
      }
      size += getVarIntSize(tx.outputs.length);
      for (const out of tx.outputs) {
        size += 8;
        const length = out.lockingScript.toBinary().length;
        if (!Number.isSafeInteger(length) || length < 0) {
          throw new RangeError("Locking script length must be a non-negative safe integer.");
        }
        size += getVarIntSize(length);
        size += length;
      }
      size += 4;
      const fee = Math.ceil(size / 1e3 * rate);
      if (!Number.isSafeInteger(fee) || fee < 0 || fee > 21e14) {
        throw new RangeError("Computed transaction fee is outside the valid satoshi range.");
      }
      return fee;
    }
  };
  function validateRate(value) {
    if (!Number.isFinite(value) || value < 0 || value > 21e14) {
      throw new RangeError("Satoshis-per-kilobyte rate must be finite and non-negative.");
    }
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/HttpClientResponseUtils.js
  var DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
  var DEFAULT_HTTP_CLIENT_TIMEOUT_MS = 3e4;
  function normalizeHttpClientLimits(limits = {}) {
    const maxResponseBytes = limits.maxResponseBytes ?? DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES;
    const timeoutMs = limits.timeoutMs ?? DEFAULT_HTTP_CLIENT_TIMEOUT_MS;
    if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 1) {
      throw new RangeError("maxResponseBytes must be a positive safe integer");
    }
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10 * 6e4) {
      throw new RangeError("timeoutMs must be an integer from 1 through 600000");
    }
    return { maxResponseBytes, timeoutMs };
  }
  function timedRequestSignal(parent, timeoutMs) {
    const controller = new AbortController();
    const abort = () => controller.abort(parent?.reason);
    if (parent?.aborted === true)
      abort();
    else
      parent?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => controller.abort(new DOMException("HTTP request timed out", "TimeoutError")), timeoutMs);
    return {
      signal: controller.signal,
      dispose() {
        clearTimeout(timer);
        parent?.removeEventListener("abort", abort);
      }
    };
  }
  async function readFetchResponseText(response, maximumBytes) {
    const responseLike = response;
    const declared = response.headers?.get?.("content-length") ?? null;
    if (declared !== null) {
      if (!/^(0|[1-9]\d*)$/.test(declared) || Number(declared) > maximumBytes) {
        await response.body?.cancel().catch(() => {
        });
        throw new Error("HTTP response exceeds the configured size limit");
      }
    }
    if (!("body" in responseLike)) {
      const text = await responseLike.text?.() ?? "";
      if (utf8ByteLength(text) > maximumBytes) {
        throw new Error("HTTP response exceeds the configured size limit");
      }
      return text;
    }
    if (response.body == null)
      return "";
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        length += value.byteLength;
        if (!Number.isSafeInteger(length) || length > maximumBytes) {
          await reader.cancel();
          throw new Error("HTTP response exceeds the configured size limit");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes3 = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes3.set(chunk, offset);
      offset += chunk.byteLength;
    }
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes3);
    } catch (cause) {
      throw new Error("HTTP response is not valid UTF-8", { cause });
    }
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/NodejsHttpRequestUtils.js
  function executeNodejsRequest(https, url, requestOptions, serializeData) {
    return new Promise((resolve, reject) => {
      let serialized;
      try {
        serialized = requestOptions.data === null || requestOptions.data === void 0 ? void 0 : serializeData(requestOptions.data);
      } catch (error) {
        reject(error);
        return;
      }
      const { data: _data, ...nodeOptions } = requestOptions;
      let settled = false;
      let req;
      let deadline;
      const cleanup = () => {
        if (deadline !== void 0)
          clearTimeout(deadline);
        requestOptions.signal?.removeEventListener("abort", abort);
      };
      const rejectOnce = (error) => {
        if (settled)
          return;
        settled = true;
        cleanup();
        reject(error);
      };
      const resolveOnce = (response) => {
        if (settled)
          return;
        settled = true;
        cleanup();
        resolve(response);
      };
      const abort = () => {
        const reason = requestOptions.signal?.reason instanceof Error ? requestOptions.signal.reason : new DOMException("HTTP request aborted", "AbortError");
        req?.destroy?.(reason);
        rejectOnce(reason);
      };
      req = https.request(url, nodeOptions, (res) => {
        const declared = res.headers?.["content-length"];
        const declaredLength = typeof declared === "string" ? Number(declared) : void 0;
        if (typeof declared === "string" && !/^(0|[1-9]\d*)$/.test(declared) || declaredLength !== void 0 && (!Number.isSafeInteger(declaredLength) || declaredLength > DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES)) {
          res.destroy?.();
          rejectOnce(new Error("HTTP response exceeds the configured size limit"));
          return;
        }
        const chunks = [];
        let length = 0;
        res.on("data", (chunk) => {
          if (settled)
            return;
          const bytes3 = typeof chunk === "string" ? utf8Bytes(chunk) : new Uint8Array(chunk);
          length += bytes3.byteLength;
          if (!Number.isSafeInteger(length) || length > DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES) {
            res.destroy?.();
            req.destroy?.();
            rejectOnce(new Error("HTTP response exceeds the configured size limit"));
            return;
          }
          chunks.push(bytes3);
        });
        res.on("end", () => {
          if (settled)
            return;
          try {
            if (declaredLength !== void 0 && declaredLength !== length) {
              throw new Error("HTTP response differs from its declared length");
            }
            if (!Number.isInteger(res.statusCode) || res.statusCode < 100 || res.statusCode > 599) {
              throw new Error("HTTP response returned an invalid status code");
            }
            const bytes3 = new Uint8Array(length);
            let offset = 0;
            for (const chunk of chunks) {
              bytes3.set(chunk, offset);
              offset += chunk.byteLength;
            }
            const body = new TextDecoder("utf-8", { fatal: true }).decode(bytes3);
            const ok = res.statusCode >= 200 && res.statusCode <= 299;
            const mediaType = res.headers["content-type"];
            const responseData = body !== "" && typeof mediaType === "string" && mediaType.startsWith("application/json") ? JSON.parse(body) : body;
            resolveOnce({
              status: res.statusCode,
              statusText: res.statusMessage ?? "",
              ok,
              data: responseData
            });
          } catch (error) {
            rejectOnce(error);
          }
        });
        res.on("error", rejectOnce);
        res.on("aborted", () => rejectOnce(new Error("HTTP response was aborted")));
      });
      req.on("error", rejectOnce);
      if (!settled) {
        deadline = setTimeout(() => {
          const error = new Error("HTTP request timed out");
          req.destroy?.(error);
          rejectOnce(error);
        }, DEFAULT_HTTP_CLIENT_TIMEOUT_MS);
      }
      req.setTimeout?.(DEFAULT_HTTP_CLIENT_TIMEOUT_MS, () => {
        const error = new Error("HTTP request timed out");
        req.destroy?.(error);
        rejectOnce(error);
      });
      if (requestOptions.signal?.aborted === true)
        abort();
      else
        requestOptions.signal?.addEventListener("abort", abort, { once: true });
      if (settled)
        return;
      if (serialized !== void 0)
        req.write(serialized);
      req.end();
    });
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/NodejsHttpClient.js
  var NodejsHttpClient = class {
    constructor(https) {
      __publicField(this, "https");
      this.https = https;
    }
    async request(url, requestOptions) {
      return await executeNodejsRequest(this.https, url, requestOptions, (data) => JSON.stringify(data));
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/FetchHttpClient.js
  var FetchHttpClient = class {
    constructor(fetch, limits = {}) {
      __publicField(this, "fetch");
      __publicField(this, "limits");
      this.fetch = fetch;
      this.limits = normalizeHttpClientLimits(limits);
    }
    async request(url, options) {
      const timed = timedRequestSignal(options.signal, this.limits.timeoutMs);
      const fetchOptions = {
        method: options.method,
        headers: options.headers,
        body: options.data === void 0 ? null : JSON.stringify(options.data),
        redirect: "error",
        signal: timed.signal
      };
      try {
        const res = await this.fetch(url, fetchOptions);
        const legacyResponse = res;
        const mediaType = legacyResponse.headers?.get?.("Content-Type");
        let data;
        if (!("body" in legacyResponse) && typeof legacyResponse.json === "function" && (mediaType == null || mediaType.startsWith("application/json"))) {
          data = await legacyResponse.json();
          if (utf8ByteLength(JSON.stringify(data)) > this.limits.maxResponseBytes) {
            throw new Error("HTTP response exceeds the configured size limit");
          }
        } else {
          const text = await readFetchResponseText(res, this.limits.maxResponseBytes);
          data = text !== "" && (mediaType?.startsWith("application/json") ?? false) ? JSON.parse(text) : text;
        }
        return {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          data
        };
      } finally {
        timed.dispose();
      }
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/DefaultHttpClient.js
  function defaultHttpClient() {
    const noHttpClient = {
      async request(..._) {
        throw new Error("No method available to perform HTTP request");
      }
    };
    if (globalThis.window !== void 0 && typeof globalThis.window.fetch === "function") {
      return new FetchHttpClient(globalThis.window.fetch.bind(globalThis.window));
    } else if (typeof globalThis.fetch === "function") {
      return new FetchHttpClient(globalThis.fetch.bind(globalThis));
    }
    const nodeRequire = typeof __require === "function" ? __require : void 0;
    if (nodeRequire === void 0) {
      return noHttpClient;
    }
    try {
      const https = nodeRequire(["node", "https"].join(":"));
      return new NodejsHttpClient(https);
    } catch {
      return noHttpClient;
    }
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/LivePolicy.js
  var _LivePolicy = class _LivePolicy extends SatoshisPerKilobyte {
    /**
     * Constructs an instance of the live policy fee model.
     *
     * @param {number} cacheValidityMs - How long to cache the fee rate in milliseconds (default: 5 minutes)
     */
    constructor(cacheValidityMs = 5 * 60 * 1e3) {
      super(100);
      __publicField(this, "cachedRate", null);
      __publicField(this, "cacheTimestamp", 0);
      __publicField(this, "cacheValidityMs");
      if (!Number.isSafeInteger(cacheValidityMs) || cacheValidityMs < 0) {
        throw new RangeError("cacheValidityMs must be a non-negative safe integer");
      }
      this.cacheValidityMs = cacheValidityMs;
    }
    /**
     * Gets the singleton instance of LivePolicy to ensure cache sharing across the application.
     *
     * @param {number} cacheValidityMs - How long to cache the fee rate in milliseconds (default: 5 minutes)
     * @returns The singleton LivePolicy instance
     */
    static getInstance(cacheValidityMs = 5 * 60 * 1e3) {
      _LivePolicy.instance ?? (_LivePolicy.instance = new _LivePolicy(cacheValidityMs));
      return _LivePolicy.instance;
    }
    /**
     * Fetches the current fee rate from ARC GorillaPool API.
     *
     * @returns The current satoshis per kilobyte rate
     */
    async fetchFeeRate() {
      const now = Date.now();
      if (this.cachedRate !== null && now - this.cacheTimestamp < this.cacheValidityMs) {
        return this.cachedRate;
      }
      try {
        const response = await defaultHttpClient().request(_LivePolicy.ARC_POLICY_URL, {
          method: "GET",
          headers: { Accept: "application/json" }
        });
        if (!response.ok) {
          throw new Error("Fee-policy provider request failed");
        }
        const responseData = response.data;
        const satoshis2 = responseData?.policy?.miningFee?.satoshis;
        const bytes3 = responseData?.policy?.miningFee?.bytes;
        if (!Number.isSafeInteger(satoshis2) || satoshis2 < 1 || satoshis2 > 21e14 || !Number.isSafeInteger(bytes3) || bytes3 < 1 || bytes3 > 1e9) {
          throw new Error("Invalid policy response format");
        }
        const rate = satoshis2 / bytes3 * 1e3;
        if (!Number.isFinite(rate) || rate <= 0 || rate > 1e9) {
          throw new Error("Invalid policy fee rate");
        }
        this.cachedRate = rate;
        this.cacheTimestamp = now;
        return rate;
      } catch {
        if (this.cachedRate !== null) {
          console.warn("Failed to fetch live fee rate; using cached value.");
          return this.cachedRate;
        }
        console.warn("Failed to fetch live fee rate; using default 100 sat/kb.");
        return 100;
      }
    }
    /**
     * Computes the fee for a given transaction using the current live rate.
     * Overrides the parent method to use dynamic rate fetching.
     *
     * @param tx The transaction for which a fee is to be computed.
     * @returns The fee in satoshis for the transaction.
     */
    async computeFee(tx) {
      const rate = await this.fetchFeeRate();
      this.value = rate;
      return super.computeFee(tx);
    }
  };
  __publicField(_LivePolicy, "ARC_POLICY_URL", "https://arc.gorillapool.io/v1/policy");
  __publicField(_LivePolicy, "instance", null);
  var LivePolicy = _LivePolicy;

  // node_modules/@bsv/sdk/dist/esm/src/primitives/SafeRecord.js
  function isPlainRecord(value) {
    if (value == null || typeof value !== "object" || Array.isArray(value))
      return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/Broadcaster.js
  var TXID = /^[0-9a-f]{64}$/i;
  var MAX_BROADCAST_MESSAGE_BYTES = 8192;
  var MAX_BROADCAST_CODE_BYTES = 128;
  var MAX_COMPETING_TXS = 256;
  function ownDataProperty(value, key) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor == null)
      return { present: false };
    if (!Object.prototype.hasOwnProperty.call(descriptor, "value"))
      return { present: true };
    return { present: true, value: descriptor.value };
  }
  function boundedString(value, maximumBytes) {
    return typeof value === "string" && utf8ByteLength(value) <= maximumBytes;
  }
  function invalidBroadcastResult() {
    return {
      status: "error",
      code: "ERR_INVALID_RESPONSE",
      description: "Broadcaster returned a malformed or transaction-mismatched response."
    };
  }
  function validateBroadcastResult(result, expectedTxid) {
    if (!TXID.test(expectedTxid) || !isPlainRecord(result))
      return invalidBroadcastResult();
    const status = ownDataProperty(result, "status").value;
    if (status === "success") {
      const txid3 = ownDataProperty(result, "txid").value;
      const message = ownDataProperty(result, "message").value;
      const competing = ownDataProperty(result, "competingTxs");
      if (typeof txid3 !== "string" || !TXID.test(txid3) || txid3.toLowerCase() !== expectedTxid.toLowerCase() || !boundedString(message, MAX_BROADCAST_MESSAGE_BYTES))
        return invalidBroadcastResult();
      const normalized2 = {
        status: "success",
        txid: expectedTxid.toLowerCase(),
        message
      };
      if (competing.present) {
        if (!Array.isArray(competing.value) || competing.value.length > MAX_COMPETING_TXS) {
          return invalidBroadcastResult();
        }
        const competingTxs = [];
        const seen = /* @__PURE__ */ new Set();
        for (let i = 0; i < competing.value.length; i++) {
          const descriptor = Object.getOwnPropertyDescriptor(competing.value, i);
          const candidate = descriptor?.value;
          if (descriptor == null || !Object.prototype.hasOwnProperty.call(descriptor, "value") || typeof candidate !== "string" || !TXID.test(candidate))
            return invalidBroadcastResult();
          const canonical = candidate.toLowerCase();
          if (seen.has(canonical))
            return invalidBroadcastResult();
          seen.add(canonical);
          competingTxs.push(canonical);
        }
        normalized2.competingTxs = competingTxs;
      }
      return normalized2;
    }
    if (status !== "error")
      return invalidBroadcastResult();
    const code = ownDataProperty(result, "code").value;
    const description = ownDataProperty(result, "description").value;
    const txid2 = ownDataProperty(result, "txid");
    if (!boundedString(code, MAX_BROADCAST_CODE_BYTES) || !boundedString(description, MAX_BROADCAST_MESSAGE_BYTES) || txid2.present && (typeof txid2.value !== "string" || !TXID.test(txid2.value) || txid2.value.toLowerCase() !== expectedTxid.toLowerCase()))
      return invalidBroadcastResult();
    const normalized = { status: "error", code, description };
    if (txid2.present)
      normalized.txid = expectedTxid.toLowerCase();
    const more = ownDataProperty(result, "more");
    if (more.present && more.value != null && typeof more.value === "object") {
      normalized.more = more.value;
    }
    return normalized;
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/MerklePath.js
  function assertOffset(offset) {
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new Error("Invalid offset");
    }
  }
  var offsetAtHeight = (offset, height) => Math.floor(offset / 2 ** height);
  var siblingOf = (offset) => offset % 2 === 0 ? offset + 1 : offset - 1;
  var sameNodeAtHeight = (index, maxOffset, height) => offsetAtHeight(index, height) === offsetAtHeight(maxOffset, height);
  var offsetTreeHeight = (offset) => offset === 0 ? 0 : offset.toString(2).length;
  function hashPair(left, right) {
    return toHex(hash256(toArray2((left ?? "") + (right ?? ""), "hex").reverse()).reverse());
  }
  function cachedMerkleRoot(nodeKey, workingHash, treeHeight, nodeHashCache) {
    const cachedNodeHash = nodeHashCache.get(nodeKey);
    if (cachedNodeHash == null)
      return void 0;
    if (cachedNodeHash !== workingHash)
      throw new Error("Mismatched roots");
    const root = nodeHashCache.get(`${treeHeight}:0`);
    if (root == null)
      throw new Error("Mismatched roots");
    return root;
  }
  function nextCachedHash(workingHash, leaf, offset, index, height, isLastOddNode) {
    if (leaf == null) {
      if (isLastOddNode)
        return hashPair(workingHash, workingHash);
      throw new Error(`Missing hash for index ${index} at height ${height}`);
    }
    if (leaf.duplicate === true)
      return hashPair(workingHash, workingHash);
    if (offset % 2 === 1)
      return hashPair(leaf.hash, workingHash);
    return hashPair(workingHash, leaf.hash);
  }
  var MerklePath = class _MerklePath {
    constructor(blockHeight, path, legalOffsetsOnly = true, validateRoots = true) {
      __publicField(this, "blockHeight");
      __publicField(this, "path");
      if (!Array.isArray(path) || path.length === 0 || path.length > 54) {
        throw new Error("Merkle Path must contain between 1 and 54 levels");
      }
      this.blockHeight = blockHeight;
      this.path = path.map((level, height) => {
        if (!Array.isArray(level)) {
          throw new TypeError(`Merkle Path level ${height} must be an array`);
        }
        return level.map((leaf) => ({ ...leaf }));
      });
      const legalOffsets = Array.from({ length: this.path.length }).fill(0).map(() => /* @__PURE__ */ new Set());
      this.path.forEach((leaves, height) => {
        if (leaves.length === 0 && height === 0) {
          throw new Error(`Empty level at height: ${height}`);
        }
        const offsetsAtThisHeight = /* @__PURE__ */ new Set();
        leaves.forEach((leaf) => {
          assertOffset(leaf.offset);
          if (offsetsAtThisHeight.has(leaf.offset)) {
            throw new Error(`Duplicate offset: ${leaf.offset}, at height: ${height}`);
          }
          offsetsAtThisHeight.add(leaf.offset);
          if (height === 0) {
            if (leaf.duplicate !== true) {
              for (let h = 1; h < this.path.length; h++) {
                legalOffsets[h].add(siblingOf(offsetAtHeight(leaf.offset, h)));
              }
            }
          } else if (legalOffsetsOnly && !legalOffsets[height].has(leaf.offset)) {
            throw new Error(`Invalid offset: ${leaf.offset}, at height: ${height}, with legal offsets: ${Array.from(legalOffsets[height], (offset) => offset.toString()).join(", ")}`);
          }
        });
      });
      if (!validateRoots)
        return;
      const sourceIndex = this.path.map((level) => new Map(level.map((leaf) => [leaf.offset, leaf])));
      const hashCache = /* @__PURE__ */ new Map();
      const nodeHashCache = /* @__PURE__ */ new Map();
      const maxOffset = this.path[0].reduce((max, leaf) => Math.max(max, leaf.offset), 0);
      let root;
      this.path[0].forEach((leaf, idx) => {
        const computed = this.computeRootCached(leaf.hash, sourceIndex, hashCache, nodeHashCache, maxOffset);
        if (idx === 0)
          root = computed;
        if (root !== computed) {
          throw new Error("Mismatched roots");
        }
      });
    }
    /**
     * Creates a MerklePath instance from a hexadecimal string.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the Merkle Path.
     * @returns {MerklePath} - A new MerklePath instance.
     */
    static fromHex(hex2) {
      return _MerklePath.fromBinary(toArray2(hex2, "hex"));
    }
    static fromReader(reader, legalOffsetsOnly = true, validateRoots = true) {
      const blockHeight = reader.readVarIntNumStrict(false);
      const treeHeight = reader.readUInt8();
      const path = Array.from({ length: treeHeight }).fill(null).map(() => []);
      let flags, offset, nLeavesAtThisHeight;
      for (let level = 0; level < treeHeight; level++) {
        nLeavesAtThisHeight = reader.readVarIntNumStrict(false);
        while (nLeavesAtThisHeight > 0) {
          offset = reader.readVarIntNumStrict(false);
          flags = reader.readUInt8();
          const leaf = { offset };
          if ((flags & 1) === 1) {
            leaf.duplicate = true;
          } else {
            if ((flags & 2) !== 0) {
              leaf.txid = true;
            }
            leaf.hash = toHex(reader.read(32).reverse());
          }
          if (!Array.isArray(path[level]) || path[level].length === 0) {
            path[level] = [];
          }
          path[level].push(leaf);
          nLeavesAtThisHeight--;
        }
        path[level].sort((a, b) => a.offset - b.offset);
      }
      return new _MerklePath(blockHeight, path, legalOffsetsOnly, validateRoots);
    }
    /**
     * Creates a MerklePath instance from a binary array.
     *
     * @static
     * @param {number[]} bump - The binary array representation of the Merkle Path.
     * @returns {MerklePath} - A new MerklePath instance.
     */
    static fromBinary(bump, legalOffsetsOnly = true, validateRoots = true) {
      const reader = new ReaderUint8Array(bump);
      return _MerklePath.fromReader(reader, legalOffsetsOnly, validateRoots);
    }
    /**
     *
     * @static fromCoinbaseTxid
     *
     * Creates a MerklePath instance for a coinbase transaction in an empty block.
     * This edge case is difficult to retrieve from standard APIs.
     *
     * @param {string} txid - The coinbase txid.
     * @param {number} height - The height of the block.
     * @returns {MerklePath} - A new MerklePath instance which assumes the tx is in a block with no other transactions.
     */
    static fromCoinbaseTxidAndHeight(txid2, height) {
      return new _MerklePath(height, [[{ offset: 0, hash: txid2, txid: true }]]);
    }
    /**
     * Serializes the MerklePath to the writer provided.
     *
     * @param writer - The writer to which the Merkle Path will be serialized.
     */
    toWriter(writer) {
      writer.writeVarIntNum(this.blockHeight);
      const treeHeight = this.path.length;
      writer.writeUInt8(treeHeight);
      for (let level = 0; level < treeHeight; level++) {
        const nLeaves = Object.keys(this.path[level]).length;
        writer.writeVarIntNum(nLeaves);
        for (const leaf of this.path[level]) {
          writer.writeVarIntNum(leaf.offset);
          let flags = 0;
          if (leaf?.duplicate === true) {
            flags |= 1;
          }
          if (leaf?.txid !== void 0 && leaf.txid !== null) {
            flags |= 2;
          }
          writer.writeUInt8(flags);
          if ((flags & 1) === 0) {
            writer.write(toArray2(leaf.hash, "hex").reverse());
          }
        }
      }
    }
    /**
     * Converts the MerklePath to a binary array format.
     *
     * @returns {number[]} - The binary array representation of the Merkle Path.
     */
    toBinary() {
      const writer = new Writer();
      this.toWriter(writer);
      return writer.toArray();
    }
    /**
     * Converts the MerklePath to a binary array format.
     *
     * @returns {Uint8Array} - The binary array representation of the Merkle Path.
     */
    toBinaryUint8Array() {
      const writer = new WriterUint8Array();
      this.toWriter(writer);
      return writer.toUint8Array();
    }
    /**
     * Converts the MerklePath to a hexadecimal string format.
     *
     * @returns {string} - The hexadecimal string representation of the Merkle Path.
     */
    toHex() {
      return toHex(this.toBinaryUint8Array());
    }
    //
    indexOf(txid2) {
      const leaf = this.path[0].find((l) => l.hash === txid2);
      if (leaf === null || leaf === void 0) {
        throw new Error(`Transaction ID ${txid2} not found in the Merkle Path`);
      }
      return leaf.offset;
    }
    computeRootCached(txid2, sourceIndex, hashCache, nodeHashCache, maxOffset) {
      if (typeof txid2 !== "string")
        txid2 = this.path[0].find((leaf) => Boolean(leaf.hash))?.hash;
      if (typeof txid2 !== "string")
        throw new TypeError("Transaction ID is undefined");
      const index = this.indexOf(txid2);
      if (this.path.length === 1 && this.path[0].length === 1)
        return txid2;
      const treeHeight = Math.max(this.path.length, offsetTreeHeight(maxOffset));
      let workingHash = txid2;
      for (let height = 0; height < treeHeight; height++) {
        const nodeKey = `${height}:${offsetAtHeight(index, height)}`;
        const cachedRoot = cachedMerkleRoot(nodeKey, workingHash, treeHeight, nodeHashCache);
        if (cachedRoot != null)
          return cachedRoot;
        nodeHashCache.set(nodeKey, workingHash);
        const offset = siblingOf(offsetAtHeight(index, height));
        const leaf = this.cachedFindLeaf(height, offset, sourceIndex, hashCache, maxOffset);
        workingHash = nextCachedHash(workingHash, leaf, offset, index, height, this.path.length === 1 && sameNodeAtHeight(index, maxOffset, height));
      }
      nodeHashCache.set(`${treeHeight}:0`, workingHash);
      return workingHash;
    }
    /**
     * Computes the Merkle root from the provided transaction ID.
     *
     * @param {string} txid - The transaction ID to compute the Merkle root for. If not provided, the root will be computed from an unspecified branch, and not all branches will be validated!
     * @returns {string} - The computed Merkle root as a hexadecimal string.
     * @throws {Error} - If the transaction ID is not part of the Merkle Path.
     */
    computeRoot(txid2) {
      if (typeof txid2 !== "string") {
        const foundLeaf = this.path[0].find((leaf) => Boolean(leaf?.hash));
        if (foundLeaf == null) {
          throw new Error("No valid leaf found in the Merkle Path");
        }
        txid2 = foundLeaf.hash;
      }
      if (typeof txid2 !== "string") {
        throw new TypeError("Transaction ID is undefined");
      }
      const index = this.indexOf(txid2);
      let workingHash = txid2;
      if (this.path.length === 1 && this.path[0].length === 1)
        return workingHash;
      const maxOffset = this.path[0].reduce((max, l) => Math.max(max, l.offset), 0);
      const treeHeight = Math.max(this.path.length, offsetTreeHeight(maxOffset));
      for (let height = 0; height < treeHeight; height++) {
        const offset = siblingOf(offsetAtHeight(index, height));
        workingHash = nextCachedHash(workingHash, this.findOrComputeLeaf(height, offset), offset, index, height, this.path.length === 1 && sameNodeAtHeight(index, maxOffset, height));
      }
      return workingHash;
    }
    /**
     * Find leaf with `offset` at `height` or compute from level below, recursively.
     *
     * Does not add computed leaves to path.
     *
     * @param height
     * @param offset
     */
    findOrComputeLeaf(height, offset) {
      assertOffset(offset);
      let leaf = height < this.path.length ? this.path[height].find((l2) => l2.offset === offset) : void 0;
      if (leaf != null)
        return leaf;
      if (height === 0)
        return void 0;
      const h = height - 1;
      const l = offset * 2;
      if (!Number.isSafeInteger(l))
        return void 0;
      const leaf0 = this.findOrComputeLeaf(h, l);
      if (leaf0?.hash == null || leaf0.hash === "")
        return void 0;
      const leaf1 = this.findOrComputeLeaf(h, l + 1);
      if (leaf1?.hash == null) {
        if (leaf1?.duplicate === true) {
          return { offset, hash: hashPair(leaf0.hash, leaf0.hash) };
        }
        if (this.path.length === 1) {
          const maxOffset0 = this.path[0].reduce((max, lf) => Math.max(max, lf.offset), 0);
          if (l === offsetAtHeight(maxOffset0, h)) {
            return { offset, hash: hashPair(leaf0.hash, leaf0.hash) };
          }
        }
        return void 0;
      }
      let workinghash;
      if (leaf1.duplicate === true) {
        workinghash = hashPair(leaf0.hash, leaf0.hash);
      } else {
        workinghash = hashPair(leaf1.hash, leaf0.hash);
      }
      leaf = {
        offset,
        hash: workinghash
      };
      return leaf;
    }
    /**
     * Verifies if the given transaction ID is part of the Merkle tree at the specified block height.
     *
     * @param {string} txid - The transaction ID to verify.
     * @param {ChainTracker} chainTracker - The ChainTracker instance used to verify the Merkle root.
     * @returns {boolean} - True if the transaction ID is valid within the Merkle Path at the specified block height.
     */
    async verify(txid2, chainTracker) {
      const blockHeight = this.blockHeight;
      if (!Number.isSafeInteger(blockHeight) || blockHeight < 0) {
        throw new Error("Merkle Path block height must be a non-negative safe integer");
      }
      const currentHeight = chainTracker?.currentHeight;
      const isValidRootForHeight = chainTracker?.isValidRootForHeight;
      if (typeof currentHeight !== "function" || typeof isValidRootForHeight !== "function") {
        throw new TypeError("A valid ChainTracker is required");
      }
      const root = this.computeRoot(txid2);
      const index = this.indexOf(txid2);
      if (index === 0) {
        const height = await currentHeight.call(chainTracker);
        if (!Number.isSafeInteger(height) || height < 0) {
          throw new Error("ChainTracker current height must be a non-negative safe integer");
        }
        if (blockHeight + 100 > height) {
          return false;
        }
      }
      return await isValidRootForHeight.call(chainTracker, root, blockHeight) === true;
    }
    /**
     * Combines this MerklePath with another to create a compound proof.
     *
     * @param {MerklePath} other - Another MerklePath to combine with this path.
     * @throws {Error} - If the paths have different block heights or roots.
     */
    combine(other) {
      if (this.blockHeight !== other.blockHeight) {
        throw new Error("You cannot combine paths which do not have the same block height.");
      }
      const root1 = this.computeRoot();
      const root2 = other.computeRoot();
      if (root1 !== root2) {
        throw new Error("You cannot combine paths which do not have the same root.");
      }
      const combinedPath = [];
      for (let h = 0; h < this.path.length; h++) {
        combinedPath.push([]);
        for (const leaf of this.path[h]) {
          combinedPath[h].push({ ...leaf });
        }
        for (const otherLeaf of other.path[h]) {
          const existingLeaf = combinedPath[h].find((leaf) => leaf.offset === otherLeaf.offset);
          if (existingLeaf === void 0) {
            combinedPath[h].push({ ...otherLeaf });
          } else if (otherLeaf?.txid !== void 0 && otherLeaf?.txid !== null) {
            existingLeaf.txid = true;
          }
        }
      }
      this.path = combinedPath;
      this.trim();
    }
    /**
     * Remove all internal nodes that are not required by level zero txid nodes.
     * Assumes that at least all required nodes are present.
     * Leaves all levels sorted by increasing offset.
     */
    trim() {
      const pushIfNew = (v, a) => {
        if (a.length === 0 || a.at(-1) !== v) {
          a.push(v);
        }
      };
      const dropOffsetsFromLevel = (dropOffsets2, level) => {
        for (let i = dropOffsets2.length; i >= 0; i--) {
          const l = this.path[level].findIndex((n) => n.offset === dropOffsets2[i]);
          if (l >= 0) {
            this.path[level].splice(l, 1);
          }
        }
      };
      const nextComputedOffsets = (cos) => {
        const ncos = [];
        for (const o of cos) {
          pushIfNew(offsetAtHeight(o, 1), ncos);
        }
        return ncos;
      };
      let computedOffsets = [];
      let dropOffsets = [];
      for (const level of this.path) {
        level.sort((a, b) => a.offset - b.offset);
      }
      for (let l = 0; l < this.path[0].length; l++) {
        const n = this.path[0][l];
        if (n.txid === true) {
          pushIfNew(offsetAtHeight(n.offset, 1), computedOffsets);
        } else {
          const isOdd = n.offset % 2 === 1;
          const peer = this.path[0][l + (isOdd ? -1 : 1)];
          if (peer.txid === void 0 || peer.txid === null || !peer.txid) {
            pushIfNew(peer.offset, dropOffsets);
          }
        }
      }
      dropOffsetsFromLevel(dropOffsets, 0);
      for (let h = 1; h < this.path.length; h++) {
        dropOffsets = computedOffsets;
        computedOffsets = nextComputedOffsets(computedOffsets);
        dropOffsetsFromLevel(dropOffsets, h);
      }
    }
    /**
     * Cached leaf finder for extract(). Uses Map-based indexes for O(1) lookups
     * and caches computed intermediate hashes to avoid redundant work.
     */
    cachedFindLeaf(height, offset, sourceIndex, hashCache, maxOffset) {
      const key = `${height}:${offset}`;
      if (hashCache.has(key))
        return hashCache.get(key);
      let leaf = height < sourceIndex.length ? sourceIndex[height].get(offset) : void 0;
      if (leaf != null) {
        hashCache.set(key, leaf);
        return leaf;
      }
      if (height === 0) {
        hashCache.set(key, void 0);
        return void 0;
      }
      const h = height - 1;
      const l = offset * 2;
      if (!Number.isSafeInteger(l))
        return void 0;
      const leaf0 = this.cachedFindLeaf(h, l, sourceIndex, hashCache, maxOffset);
      if (leaf0?.hash == null || leaf0.hash === "") {
        hashCache.set(key, void 0);
        return void 0;
      }
      const leaf1 = this.cachedFindLeaf(h, l + 1, sourceIndex, hashCache, maxOffset);
      if (leaf1?.hash == null) {
        if (leaf1?.duplicate === true || this.path.length === 1 && l === offsetAtHeight(maxOffset, h)) {
          leaf = { offset, hash: hashPair(leaf0.hash, leaf0.hash) };
          hashCache.set(key, leaf);
          return leaf;
        }
        hashCache.set(key, void 0);
        return void 0;
      }
      const workinghash = leaf1.duplicate === true ? hashPair(leaf0.hash, leaf0.hash) : hashPair(leaf1.hash, leaf0.hash);
      leaf = { offset, hash: workinghash };
      hashCache.set(key, leaf);
      return leaf;
    }
    /**
     * Extracts a minimal compound MerklePath covering only the specified transaction IDs.
     *
     * Given a compound MerklePath (e.g. all block txids at level 0, or a trimmed
     * compound path), this method reconstructs the sibling hashes at each tree level
     * for every requested txid using cached Map-indexed lookups, then assembles them
     * into a single trimmed compound path.
     *
     * The extracted path is verified to compute the same Merkle root as the source.
     *
     * @param {string[]} txids - Transaction IDs to extract proofs for.
     * @returns {MerklePath} - A new trimmed compound MerklePath covering only the requested txids.
     * @throws {Error} - If no txids are provided, a txid is not found, or the roots do not match.
     *
     * @example
     * // Full block compound path (all txids at level 0)
     * const fullBlock = new MerklePath(height, [allTxidsAtLevel0])
     * // Extract a smaller compound proof covering just two transactions
     * const twoTxProof = fullBlock.extract([txid1, txid2])
     * twoTxProof.computeRoot(txid1) // === fullBlock.computeRoot()
     */
    extract(txids) {
      if (txids.length === 0) {
        throw new Error("At least one txid must be provided to extract");
      }
      const originalRoot = this.computeRoot();
      const maxOffset = this.path[0].reduce((max, l) => Math.max(max, l.offset), 0);
      const treeHeight = Math.max(this.path.length, offsetTreeHeight(maxOffset));
      const sourceIndex = this.createSourceLeafIndex();
      const hashCache = /* @__PURE__ */ new Map();
      const txidToOffset = this.createTxidToOffsetIndex();
      const neededPerLevel = this.createNeededLeafLevels(treeHeight);
      for (const txid2 of txids) {
        this.collectExtractedLeaves(txid2, txidToOffset, neededPerLevel, sourceIndex, hashCache, maxOffset, treeHeight);
      }
      const compound = new _MerklePath(this.blockHeight, this.buildExtractedPath(neededPerLevel));
      compound.trim();
      const extractedRoot = compound.computeRoot();
      if (extractedRoot !== originalRoot) {
        throw new Error(`Extracted path root ${extractedRoot} does not match original root ${originalRoot}`);
      }
      return compound;
    }
    createSourceLeafIndex() {
      const sourceIndex = Array.from({ length: this.path.length });
      for (let h = 0; h < this.path.length; h++) {
        const map = /* @__PURE__ */ new Map();
        for (const leaf of this.path[h])
          map.set(leaf.offset, leaf);
        sourceIndex[h] = map;
      }
      return sourceIndex;
    }
    createTxidToOffsetIndex() {
      const txidToOffset = /* @__PURE__ */ new Map();
      for (const leaf of this.path[0]) {
        if (leaf.hash != null)
          txidToOffset.set(leaf.hash, leaf.offset);
      }
      return txidToOffset;
    }
    createNeededLeafLevels(treeHeight) {
      const neededPerLevel = Array.from({ length: treeHeight });
      for (let h = 0; h < treeHeight; h++)
        neededPerLevel[h] = /* @__PURE__ */ new Map();
      return neededPerLevel;
    }
    collectExtractedLeaves(txid2, txidToOffset, neededPerLevel, sourceIndex, hashCache, maxOffset, treeHeight) {
      const txOffset = txidToOffset.get(txid2);
      if (txOffset === void 0) {
        throw new Error(`Transaction ID ${txid2} not found in the Merkle Path`);
      }
      neededPerLevel[0].set(txOffset, { offset: txOffset, txid: true, hash: txid2 });
      const levelZeroSiblingOffset = siblingOf(txOffset);
      if (!neededPerLevel[0].has(levelZeroSiblingOffset)) {
        const sibling = this.cachedFindLeaf(0, levelZeroSiblingOffset, sourceIndex, hashCache, maxOffset);
        if (sibling != null)
          neededPerLevel[0].set(levelZeroSiblingOffset, sibling);
      }
      for (let h = 1; h < treeHeight; h++) {
        const siblingOffset = siblingOf(offsetAtHeight(txOffset, h));
        if (neededPerLevel[h].has(siblingOffset))
          continue;
        const sibling = this.cachedFindLeaf(h, siblingOffset, sourceIndex, hashCache, maxOffset);
        if (sibling != null) {
          neededPerLevel[h].set(siblingOffset, sibling);
        } else if (sameNodeAtHeight(txOffset, maxOffset, h)) {
          neededPerLevel[h].set(siblingOffset, { offset: siblingOffset, duplicate: true });
        }
      }
    }
    buildExtractedPath(neededPerLevel) {
      return neededPerLevel.map((level) => {
        return Array.from(level.values()).sort((a, b) => a.offset - b.offset);
      });
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/ArcConfigValidation.js
  var MAX_CONFIGURATION_PROPERTIES = 32;
  var MAX_CUSTOM_HEADERS = 64;
  function plainOwnDataProperties(value, label, maximumProperties) {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    const prototype = Object.getPrototypeOf(value);
    const properties = Object.getOwnPropertyDescriptors(value);
    if (prototype !== Object.prototype && prototype !== null || Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length > maximumProperties || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    return properties;
  }
  function optionalHeaderText(value, label, maximumBytes) {
    if (value === void 0)
      return void 0;
    if (typeof value !== "string" || utf8ByteLength(value) > maximumBytes || hasControlCharacter(value)) {
      throw new TypeError(`${label} must be bounded text without control characters.`);
    }
    return value;
  }
  function snapshotHeaders(value) {
    if (value === void 0)
      return void 0;
    const properties = plainOwnDataProperties(value, "ARC headers", MAX_CUSTOM_HEADERS);
    const headers = /* @__PURE__ */ Object.create(null);
    for (const [name, property] of Object.entries(properties)) {
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]{1,128}$/.test(name)) {
        throw new TypeError(`ARC header name is invalid: ${name}`);
      }
      const headerValue = optionalHeaderText(property.value, `ARC header ${name}`, 8192);
      if (headerValue === void 0) {
        throw new TypeError(`ARC header ${name} must be a string.`);
      }
      headers[name] = headerValue;
    }
    return Object.freeze(headers);
  }
  function validateHttpClient(value) {
    const client = value ?? defaultHttpClient();
    if (client == null || typeof client !== "object" || typeof client.request !== "function") {
      throw new TypeError("ARC httpClient must provide request().");
    }
    return client;
  }
  function normalizeArcConfig(config, defaultDeploymentId2) {
    if (typeof config === "string") {
      return Object.freeze({
        apiKey: optionalHeaderText(config, "ARC API key", 16 * 1024),
        httpClient: defaultHttpClient(),
        deploymentId: defaultDeploymentId2()
      });
    }
    const properties = plainOwnDataProperties(config ?? {}, "ARC config", MAX_CONFIGURATION_PROPERTIES);
    const read = (name) => properties[name]?.value;
    return Object.freeze({
      apiKey: optionalHeaderText(read("apiKey"), "ARC API key", 16 * 1024),
      httpClient: validateHttpClient(read("httpClient")),
      deploymentId: optionalHeaderText(read("deploymentId"), "ARC deployment ID", 256) ?? defaultDeploymentId2(),
      callbackUrl: optionalHeaderText(read("callbackUrl"), "ARC callback URL", 2048),
      callbackToken: optionalHeaderText(read("callbackToken"), "ARC callback token", 16 * 1024),
      headers: snapshotHeaders(read("headers"))
    });
  }
  function normalizeArcUrl(value) {
    if (typeof value !== "string" || value.length === 0 || utf8ByteLength(value) > 2048 || hasControlCharacter(value)) {
      throw new TypeError("ARC URL must be nonempty bounded text without control characters.");
    }
    return value;
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/ConfigurationLock.js
  function lockConfiguration(target, names) {
    for (const name of names) {
      if (!Object.prototype.hasOwnProperty.call(target, name)) {
        throw new Error(`Cannot lock missing configuration property ${name}.`);
      }
      Object.defineProperty(target, name, {
        configurable: false,
        writable: false
      });
    }
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/ARC.js
  function defaultDeploymentId() {
    return `ts-sdk-${toHex(Random_default(16))}`;
  }
  var ARC_ERROR_STATUSES = /* @__PURE__ */ new Set([
    "DOUBLE_SPEND_ATTEMPTED",
    "REJECTED",
    "INVALID",
    "MALFORMED",
    "MINED_IN_STALE_BLOCK"
  ]);
  var TXID2 = /^[0-9a-f]{64}$/i;
  var MAX_ARC_STATUS_BYTES = 128;
  var MAX_ARC_INFO_BYTES = 8192;
  var MAX_COMPETING_TXS2 = 256;
  var MAX_ARC_RESPONSE_PROPERTIES = 32;
  var ARC_ACCEPTED_STATUSES = /* @__PURE__ */ new Set([
    "SUCCESS",
    "RECEIVED",
    "SENT_TO_NETWORK",
    "ANNOUNCED_TO_NETWORK",
    "ACCEPTED_BY_NETWORK",
    "SEEN_ON_NETWORK",
    "STORED",
    "MINED",
    "IMMUTABLE"
  ]);
  function boundedText(value, maximumBytes, allowEmpty = true) {
    return typeof value === "string" && (allowEmpty || value.length !== 0) && utf8ByteLength(value) <= maximumBytes && !hasControlCharacter(value);
  }
  function ownArcData(value) {
    if (value == null || typeof value !== "object" || Array.isArray(value))
      return void 0;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null)
      return void 0;
    const properties = Object.getOwnPropertyDescriptors(value);
    if (Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length > MAX_ARC_RESPONSE_PROPERTIES || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      return void 0;
    }
    return properties;
  }
  function snapshotCompetingTxs(value) {
    if (value === void 0)
      return void 0;
    if (!Array.isArray(value) || value.length > MAX_COMPETING_TXS2)
      return void 0;
    const properties = Object.getOwnPropertyDescriptors(value);
    const expectedKeys = /* @__PURE__ */ new Set([
      "length",
      ...Array.from({ length: value.length }, (_, index) => String(index))
    ]);
    if (Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length !== expectedKeys.size || Object.keys(properties).some((key) => !expectedKeys.has(key)) || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      return void 0;
    }
    const result = [];
    const seen = /* @__PURE__ */ new Set();
    for (let index = 0; index < value.length; index++) {
      const candidate = properties[index]?.value;
      if (typeof candidate !== "string" || !TXID2.test(candidate))
        return void 0;
      const normalized = candidate.toLowerCase();
      if (seen.has(normalized))
        return void 0;
      seen.add(normalized);
      result.push(normalized);
    }
    return result;
  }
  function transactionHex(tx) {
    try {
      return tx.toHexEF();
    } catch (error) {
      if (error.message === "All inputs must have source transactions when serializing to EF format")
        return tx.toHex();
      throw error;
    }
  }
  function invalidArcResponse(description) {
    return { status: "error", code: "ERR_INVALID_RESPONSE", description };
  }
  function successfulArcResponse(data, expectedTxid) {
    const properties = ownArcData(data);
    if (properties === void 0) {
      return invalidArcResponse("ARC returned a malformed response.");
    }
    const read = (name) => properties[name]?.value;
    const txid2 = read("txid");
    const extraInfo = read("extraInfo");
    const txStatus = read("txStatus");
    const competingValue = read("competingTxs");
    if (!boundedText(txStatus, MAX_ARC_STATUS_BYTES, false) || extraInfo !== void 0 && !boundedText(extraInfo, MAX_ARC_INFO_BYTES)) {
      return invalidArcResponse("ARC returned invalid transaction status metadata.");
    }
    const competingTxs = snapshotCompetingTxs(competingValue);
    if (competingValue !== void 0 && competingTxs === void 0) {
      return invalidArcResponse("ARC returned invalid competing transaction identifiers.");
    }
    const upperStatus = txStatus.toUpperCase();
    const isOrphan = extraInfo?.toUpperCase().includes("ORPHAN") || upperStatus.includes("ORPHAN");
    if (ARC_ERROR_STATUSES.has(upperStatus) || isOrphan) {
      if (typeof txid2 === "string" && TXID2.test(txid2) && txid2.toLowerCase() !== expectedTxid.toLowerCase()) {
        return {
          status: "error",
          code: "ERR_TXID_MISMATCH",
          description: "ARC returned a failure for another transaction."
        };
      }
      const failure = {
        status: "error",
        code: txStatus,
        description: `${txStatus} ${extraInfo ?? ""}`.trim()
      };
      if (typeof txid2 === "string" && TXID2.test(txid2))
        failure.txid = expectedTxid.toLowerCase();
      if (competingTxs != null)
        failure.more = { competingTxs };
      return failure;
    }
    if (!ARC_ACCEPTED_STATUSES.has(upperStatus)) {
      return invalidArcResponse("ARC returned an unknown transaction status.");
    }
    if (typeof txid2 !== "string" || !TXID2.test(txid2) || txid2.toLowerCase() !== expectedTxid.toLowerCase()) {
      return {
        status: "error",
        code: "ERR_TXID_MISMATCH",
        description: "ARC acknowledged a transaction other than the submitted transaction."
      };
    }
    const response = {
      status: "success",
      txid: expectedTxid,
      message: `${txStatus} ${extraInfo ?? ""}`.trim()
    };
    if (competingTxs != null)
      response.competingTxs = competingTxs;
    return response;
  }
  function parseArcFailureData(data) {
    if (typeof data !== "string")
      return data;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  function failedArcResponse(status, responseData, expectedTxid) {
    const code = typeof status === "number" && Number.isSafeInteger(status) || typeof status === "string" && boundedText(status, MAX_ARC_STATUS_BYTES, false) ? status.toString() : "ERR_UNKNOWN";
    const failure = {
      status: "error",
      code,
      description: "Unknown error"
    };
    const data = parseArcFailureData(responseData);
    const properties = ownArcData(data);
    if (properties === void 0)
      return failure;
    const detail = properties.detail?.value;
    const txid2 = properties.txid?.value;
    if (typeof txid2 === "string" && TXID2.test(txid2)) {
      if (expectedTxid !== void 0 && txid2.toLowerCase() !== expectedTxid.toLowerCase()) {
        return {
          status: "error",
          code: "ERR_TXID_MISMATCH",
          description: "ARC returned a failure for another transaction."
        };
      }
      failure.txid = txid2.toLowerCase();
    }
    const more = {};
    if (boundedText(detail, MAX_ARC_INFO_BYTES)) {
      failure.description = detail;
      more.detail = detail;
    }
    if (failure.txid !== void 0)
      more.txid = failure.txid;
    if (Object.keys(more).length !== 0)
      failure.more = more;
    return failure;
  }
  function caughtArcResponse() {
    return {
      status: "error",
      code: "500",
      description: "Internal Server Error"
    };
  }
  var _httpClient, _ARC_instances, requestHeaders_fn;
  var ARC = class {
    constructor(URL, config) {
      __privateAdd(this, _ARC_instances);
      __publicField(this, "URL");
      __publicField(this, "apiKey");
      __publicField(this, "deploymentId");
      __publicField(this, "callbackUrl");
      __publicField(this, "callbackToken");
      __publicField(this, "headers");
      __privateAdd(this, _httpClient);
      this.URL = normalizeArcUrl(URL);
      const normalized = normalizeArcConfig(config, defaultDeploymentId);
      this.apiKey = normalized.apiKey;
      __privateSet(this, _httpClient, normalized.httpClient);
      this.deploymentId = normalized.deploymentId;
      this.callbackToken = normalized.callbackToken;
      this.callbackUrl = normalized.callbackUrl;
      this.headers = normalized.headers;
      lockConfiguration(this, [
        "URL",
        "apiKey",
        "deploymentId",
        "callbackUrl",
        "callbackToken",
        "headers"
      ]);
    }
    /**
     * Broadcasts a transaction via ARC.
     *
     * @param {Transaction} tx - The transaction to be broadcasted.
     * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
     */
    async broadcast(tx) {
      const requestOptions = {
        method: "POST",
        headers: __privateMethod(this, _ARC_instances, requestHeaders_fn).call(this),
        data: { rawTx: transactionHex(tx) }
      };
      try {
        const response = await __privateGet(this, _httpClient).request(`${this.URL}/v1/tx`, requestOptions);
        return response.ok ? successfulArcResponse(response.data, tx.id("hex")) : failedArcResponse(response.status, response.data, tx.id("hex"));
      } catch {
        return caughtArcResponse();
      }
    }
    /**
     * Broadcasts multiple transactions via ARC.
     * Handles mixed responses where some transactions succeed and others fail.
     *
     * @param {Transaction[]} txs - Array of transactions to be broadcasted.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of objects.
     */
    async broadcastMany(txs) {
      const rawTxs = txs.map((tx) => ({ rawTx: transactionHex(tx) }));
      const requestOptions = {
        method: "POST",
        headers: __privateMethod(this, _ARC_instances, requestHeaders_fn).call(this),
        data: rawTxs
      };
      try {
        const response = await __privateGet(this, _httpClient).request(`${this.URL}/v1/txs`, requestOptions);
        if (!response.ok) {
          return txs.map((tx) => failedArcResponse(response.status, response.data, tx.id("hex")));
        }
        if (!Array.isArray(response.data) || response.data.length !== txs.length) {
          return txs.map(() => invalidArcResponse("ARC returned a malformed batch response."));
        }
        const responseProperties = Object.getOwnPropertyDescriptors(response.data);
        const expectedArrayKeys = /* @__PURE__ */ new Set([
          "length",
          ...Array.from({ length: response.data.length }, (_, index) => String(index))
        ]);
        if (Object.getOwnPropertySymbols(response.data).length !== 0 || Object.keys(responseProperties).length !== expectedArrayKeys.size || Object.keys(responseProperties).some((key) => !expectedArrayKeys.has(key)) || Object.values(responseProperties).some((property) => property.get != null || property.set != null)) {
          return txs.map(() => invalidArcResponse("ARC returned a malformed batch response."));
        }
        const remaining = /* @__PURE__ */ new Map();
        for (const tx of txs) {
          const txid2 = tx.id("hex").toLowerCase();
          remaining.set(txid2, (remaining.get(txid2) ?? 0) + 1);
        }
        return Array.from({ length: response.data.length }, (_, index) => {
          const result = responseProperties[index]?.value;
          const resultProperties = ownArcData(result);
          if (resultProperties === void 0) {
            return invalidArcResponse("ARC returned a malformed batch result.");
          }
          const txid2 = resultProperties.txid?.value;
          const normalized = typeof txid2 === "string" && TXID2.test(txid2) ? txid2.toLowerCase() : "";
          const available = remaining.get(normalized) ?? 0;
          if (available < 1) {
            return {
              status: "error",
              code: "ERR_TXID_MISMATCH",
              description: "ARC batch acknowledged a transaction that was not submitted."
            };
          }
          if (available === 1)
            remaining.delete(normalized);
          else
            remaining.set(normalized, available - 1);
          return successfulArcResponse(result, normalized);
        });
      } catch {
        const errorResponse = caughtArcResponse();
        return txs.map(() => errorResponse);
      }
    }
  };
  _httpClient = new WeakMap();
  _ARC_instances = new WeakSet();
  /**
   * Constructs a dictionary of the default & supplied request headers.
   */
  requestHeaders_fn = function() {
    const headers = {
      "Content-Type": "application/json",
      "XDeployment-ID": this.deploymentId
    };
    if (this.apiKey != null && this.apiKey !== "") {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    if (this.callbackUrl != null && this.callbackUrl !== "") {
      headers["X-CallbackUrl"] = this.callbackUrl;
    }
    if (this.callbackToken != null && this.callbackToken !== "") {
      headers["X-CallbackToken"] = this.callbackToken;
    }
    if (this.headers != null) {
      for (const [key, value] of Object.entries(this.headers)) {
        headers[key] = value;
      }
    }
    return headers;
  };

  // node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/DefaultBroadcaster.js
  function defaultBroadcaster(isTestnet = false, config = {}) {
    return new ARC(isTestnet ? "https://testnet.arc.gorillapool.io" : "https://arc.gorillapool.io", config);
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/WhatsOnChain.js
  var HASH = /^[0-9a-f]{64}$/i;
  var MAX_BLOCK_HEIGHT = 2147483647;
  var MAX_HEADER_RESULTS = 256;
  var MAX_HEADER_PROPERTIES = 64;
  function boundedText2(value, label, maximumBytes) {
    if (typeof value !== "string" || utf8ByteLength(value) > maximumBytes || hasControlCharacter(value)) {
      throw new TypeError(`${label} must be bounded text without control characters.`);
    }
    return value;
  }
  function ownDataProperties(value, label, maximumProperties) {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    const prototype = Object.getPrototypeOf(value);
    const properties = Object.getOwnPropertyDescriptors(value);
    if (prototype !== Object.prototype && prototype !== null || Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length > maximumProperties || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    return properties;
  }
  function normalizeNetwork(value) {
    if (value !== "main" && value !== "test" && value !== "stn") {
      throw new TypeError("What's On Chain network must be 'main', 'test', or 'stn'.");
    }
    return value;
  }
  function normalizeHttpClient(value) {
    const client = value ?? defaultHttpClient();
    if (client == null || typeof client !== "object" || typeof client.request !== "function") {
      throw new TypeError("What's On Chain httpClient must provide request().");
    }
    return client;
  }
  function normalizeConfig(config) {
    const properties = ownDataProperties(config, "What's On Chain config", 8);
    return {
      apiKey: properties.apiKey?.value === void 0 ? "" : boundedText2(properties.apiKey.value, "What's On Chain API key", 16 * 1024),
      httpClient: normalizeHttpClient(properties.httpClient?.value)
    };
  }
  function normalizeQuery(root, height) {
    if (typeof root !== "string" || !HASH.test(root)) {
      throw new TypeError("Merkle root must be a 64-character hexadecimal string.");
    }
    if (!Number.isSafeInteger(height) || height < 0 || height > MAX_BLOCK_HEIGHT) {
      throw new TypeError("Block height must be a nonnegative bounded integer.");
    }
    return { root: root.toLowerCase(), height };
  }
  function responseMerkleRoot(value) {
    try {
      const properties = ownDataProperties(value, "What's On Chain block header", MAX_HEADER_PROPERTIES);
      const root = properties.merkleroot?.value;
      return typeof root === "string" && HASH.test(root) ? root.toLowerCase() : void 0;
    } catch {
      return void 0;
    }
  }
  function responseCurrentHeight(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > MAX_HEADER_RESULTS)
      return void 0;
    const arrayProperties = Object.getOwnPropertyDescriptors(value);
    const expectedKeys = /* @__PURE__ */ new Set([
      "length",
      ...Array.from({ length: value.length }, (_, index) => String(index))
    ]);
    if (Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(arrayProperties).length !== expectedKeys.size || Object.keys(arrayProperties).some((key) => !expectedKeys.has(key)) || Object.values(arrayProperties).some((property) => property.get != null || property.set != null)) {
      return void 0;
    }
    try {
      const first = ownDataProperties(arrayProperties[0]?.value, "What's On Chain height response", MAX_HEADER_PROPERTIES);
      const height = first.height?.value;
      return Number.isSafeInteger(height) && height >= 0 && height <= MAX_BLOCK_HEIGHT ? height : void 0;
    } catch {
      return void 0;
    }
  }
  var WhatsOnChain = class {
    /**
     * Constructs an instance of the WhatsOnChain ChainTracker.
     *
     * @param {'main' | 'test' | 'stn'} network - The BSV network to use when calling the WhatsOnChain API.
     * @param {WhatsOnChainConfig} config - Configuration options for the WhatsOnChain ChainTracker.
     */
    constructor(network = "main", config = {}) {
      __publicField(this, "network");
      __publicField(this, "apiKey");
      __publicField(this, "URL");
      __publicField(this, "httpClient");
      this.network = normalizeNetwork(network);
      this.URL = `https://api.whatsonchain.com/v1/bsv/${this.network}`;
      const normalized = normalizeConfig(config);
      this.httpClient = normalized.httpClient;
      this.apiKey = normalized.apiKey;
      lockConfiguration(this, ["network", "URL", "httpClient", "apiKey"]);
    }
    async isValidRootForHeight(root, height) {
      const query = normalizeQuery(root, height);
      const requestOptions = {
        method: "GET",
        headers: this.getHttpHeaders()
      };
      try {
        const response = await this.httpClient.request(`${this.URL}/block/${query.height}/header`, requestOptions);
        if (response.ok) {
          return responseMerkleRoot(response.data) === query.root;
        } else if (response.status === 404) {
          return false;
        }
        throw new Error("provider request failed");
      } catch {
        throw new Error(`Failed to verify merkleroot for height ${query.height}.`);
      }
    }
    async currentHeight() {
      try {
        const requestOptions = {
          method: "GET",
          headers: this.getHttpHeaders()
        };
        const response = await this.httpClient.request(`${this.URL}/block/headers`, requestOptions);
        if (response.ok) {
          const height = responseCurrentHeight(response.data);
          if (height !== void 0)
            return height;
        }
        throw new Error("provider response was invalid");
      } catch {
        throw new Error("Failed to get current height from What's On Chain.");
      }
    }
    getHttpHeaders() {
      const headers = {
        Accept: "application/json"
      };
      if (typeof this.apiKey === "string" && this.apiKey.trim() !== "") {
        headers.Authorization = this.apiKey;
      }
      return headers;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/DefaultChainTracker.js
  function defaultChainTracker() {
    return new WhatsOnChain();
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/BeefConstants.js
  var BEEF_V1 = 4022206465;
  var BEEF_V2 = 4022206466;
  var ATOMIC_BEEF = 16843009;
  var TX_DATA_FORMAT;
  (function(TX_DATA_FORMAT2) {
    TX_DATA_FORMAT2[TX_DATA_FORMAT2["RAWTX"] = 0] = "RAWTX";
    TX_DATA_FORMAT2[TX_DATA_FORMAT2["RAWTX_AND_BUMP_INDEX"] = 1] = "RAWTX_AND_BUMP_INDEX";
    TX_DATA_FORMAT2[TX_DATA_FORMAT2["TXID_ONLY"] = 2] = "TXID_ONLY";
  })(TX_DATA_FORMAT || (TX_DATA_FORMAT = {}));

  // node_modules/@bsv/sdk/dist/esm/src/transaction/BeefTx.js
  function skipBytes(br, length) {
    if (!Number.isSafeInteger(length) || length < 0 || br.pos + length > br.bin.length) {
      throw new RangeError("Serialized transaction exceeds available BEEF data");
    }
    if (br instanceof ReaderUint8Array)
      br.skip(length);
    else
      br.read(length);
  }
  function scanRawTransaction(br) {
    const start = br.pos;
    skipBytes(br, 4);
    const inputCount = br.readVarIntNumStrict(false);
    const inputTxids = /* @__PURE__ */ new Set();
    for (let i = 0; i < inputCount; i++) {
      inputTxids.add(toHex(br.readReverse(32)));
      skipBytes(br, 4);
      const scriptLength = br.readVarIntNumStrict(false);
      skipBytes(br, scriptLength + 4);
    }
    const outputCount = br.readVarIntNumStrict(false);
    for (let i = 0; i < outputCount; i++) {
      skipBytes(br, 8);
      const scriptLength = br.readVarIntNumStrict(false);
      skipBytes(br, scriptLength);
    }
    skipBytes(br, 4);
    const rawTx = br instanceof ReaderUint8Array ? br.bin.subarray(start, br.pos) : Uint8Array.from(br.bin.slice(start, br.pos));
    return { rawTx, inputTxids: Array.from(inputTxids) };
  }
  function scanInputTxids(rawTx) {
    return scanRawTransaction(new ReaderUint8Array(rawTx)).inputTxids;
  }
  function sameTxids(a, b) {
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
        return false;
    }
    return true;
  }
  var BeefTx = class _BeefTx {
    /**
     * @param tx If string, must be a valid txid. If `number[]` must be a valid serialized transaction.
     * @param bumpIndex If transaction already has a proof in the beef to which it will be added.
     */
    constructor(tx, bumpIndex, inputTxids, retainRawView = false) {
      __publicField(this, "_bumpIndex");
      __publicField(this, "_tx");
      __publicField(this, "_rawTx");
      __publicField(this, "_txid");
      __publicField(this, "inputTxids", []);
      /**
       * true if `hasProof` or all inputs chain to `hasProof`.
       *
       * Typically set by sorting transactions by proven dependency chains.
       */
      __publicField(this, "isValid");
      if (typeof tx === "string") {
        this._txid = tx;
      } else if (tx instanceof Uint8Array) {
        this._rawTx = retainRawView ? tx : Uint8Array.from(tx);
      } else if (Array.isArray(tx)) {
        this._rawTx = new Uint8Array(tx);
      } else if (tx instanceof Transaction) {
        this._tx = tx;
      } else {
        throw new TypeError("Invalid transaction data type");
      }
      this._bumpIndex = bumpIndex;
      if (this.hasProof)
        this.inputTxids = [];
      else if (inputTxids != null)
        this.inputTxids = Array.from(inputTxids);
      else
        this.updateInputTxids();
    }
    get bumpIndex() {
      return this._bumpIndex;
    }
    set bumpIndex(v) {
      this._bumpIndex = v;
      this.updateInputTxids();
    }
    get hasProof() {
      return this._bumpIndex !== void 0;
    }
    get isTxidOnly() {
      return this._txid !== void 0 && this._txid !== null && this._rawTx == null && this._tx == null;
    }
    get txid() {
      if (this._txid !== void 0 && this._txid !== null && this._txid !== "")
        return this._txid;
      if (this._tx != null) {
        this._txid = this._tx.id("hex");
        return this._txid;
      }
      if (this._rawTx != null) {
        this._txid = toHex(hash256(this._rawTx).reverse());
        return this._txid;
      }
      throw new Error("Internal");
    }
    get tx() {
      if (this._tx != null)
        return this._tx;
      if (this._rawTx != null) {
        this._tx = Transaction.fromBinaryView(this._rawTx);
        if (this._txid != null)
          cacheKnownTransactionId(this._tx, this._txid);
        return this._tx;
      }
      return void 0;
    }
    /**
     * Raw transaction bytes, if available as number[]
     */
    get rawTx() {
      const bytes3 = this.rawTxUint8Array;
      return bytes3 == null ? void 0 : Array.from(bytes3);
    }
    /**
     * Raw transaction bytes, if available as Uint8Array
     */
    get rawTxUint8Array() {
      const bytes3 = this.getRawTxBytes();
      return bytes3 == null ? void 0 : Uint8Array.from(bytes3);
    }
    getRawTxBytes() {
      if (this._tx != null) {
        if (this._rawTx == null)
          this._rawTx = this._tx.toUint8Array();
        else
          this.syncRawTxFromTransaction();
        return this._rawTx;
      }
      return this._rawTx;
    }
    /**
     * Synchronizes a nested transaction after mutation through the normal
     * Transaction APIs. Returns true when its serialized identity or dependencies
     * changed.
     *
     * @internal
     */
    syncRawTxFromTransaction() {
      if (this._tx == null)
        return false;
      const bytes3 = transactionSerializationIdentity(this._tx);
      if (this._rawTx != null) {
        if (bytes3 === this._rawTx)
          return false;
        this._rawTx = bytes3;
        this._txid = this._tx.id("hex");
        this.updateInputTxids();
        return true;
      }
      const txid2 = this._tx.id("hex");
      const txidChanged = this._txid != null && this._txid !== txid2;
      const previousInputTxids = this.inputTxids;
      this._txid = txid2;
      this.updateInputTxids();
      return txidChanged || !sameTxids(previousInputTxids, this.inputTxids);
    }
    static fromTx(tx, bumpIndex) {
      return new _BeefTx(tx, bumpIndex);
    }
    static fromRawTx(rawTx, bumpIndex) {
      return new _BeefTx(rawTx, bumpIndex);
    }
    static fromTxid(txid2, bumpIndex) {
      return new _BeefTx(txid2, bumpIndex);
    }
    updateInputTxids() {
      if (this.hasProof) {
        this.inputTxids = [];
      } else if (this._tx != null) {
        const inputTxids = /* @__PURE__ */ new Set();
        for (const input of this._tx.inputs) {
          if (input.sourceTXID !== void 0 && input.sourceTXID !== null && input.sourceTXID !== "") {
            inputTxids.add(input.sourceTXID);
          }
        }
        this.inputTxids = Array.from(inputTxids);
      } else if (this._rawTx != null) {
        this.inputTxids = scanInputTxids(this._rawTx);
      } else {
        this.inputTxids = [];
      }
    }
    toWriter(writer, version) {
      const writeByte = (bb) => {
        writer.writeUInt8(bb);
      };
      const writeTxid = () => {
        if (this._txid == null) {
          throw new Error("Transaction ID (_txid) is undefined");
        }
        writer.writeReverse(toArray2(this._txid, "hex"));
      };
      const writeTx = () => {
        const bytes3 = this.getRawTxBytes();
        if (bytes3 == null) {
          throw new Error("a valid serialized Transaction is expected");
        }
        writer.write(bytes3);
      };
      const writeBumpIndex = () => {
        if (this.bumpIndex === void 0) {
          writeByte(TX_DATA_FORMAT.RAWTX);
        } else {
          writeByte(TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX);
          writer.writeVarIntNum(this.bumpIndex);
        }
      };
      if (version === BEEF_V2) {
        if (this.isTxidOnly) {
          writeByte(TX_DATA_FORMAT.TXID_ONLY);
          writeTxid();
        } else if (this.bumpIndex !== void 0) {
          writeByte(TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX);
          writer.writeVarIntNum(this.bumpIndex);
          writeTx();
        } else {
          writeByte(TX_DATA_FORMAT.RAWTX);
          writeTx();
        }
      } else {
        writeTx();
        writeBumpIndex();
      }
    }
    static fromReader(br, version) {
      let bumpIndex;
      let beefTx;
      if (version === BEEF_V2) {
        const format = br.readUInt8();
        if (format === TX_DATA_FORMAT.TXID_ONLY) {
          beefTx = _BeefTx.fromTxid(toHex(br.readReverse(32)));
        } else {
          if (format === TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX) {
            bumpIndex = br.readVarIntNumStrict(false);
          }
          const { rawTx, inputTxids } = scanRawTransaction(br);
          beefTx = new _BeefTx(rawTx, bumpIndex, inputTxids, true);
        }
      } else {
        const { rawTx, inputTxids } = scanRawTransaction(br);
        bumpIndex = br.readUInt8() === 0 ? void 0 : br.readVarIntNumStrict(false);
        beefTx = new _BeefTx(rawTx, bumpIndex, inputTxids, true);
      }
      return beefTx;
    }
  };

  // node_modules/@bsv/sdk/dist/esm/src/transaction/Beef.js
  function mergeCompatibleBumpLevels(levels, other, expectedLevels, validateCombined) {
    if (other.path.length !== expectedLevels)
      throw new Error("Mismatched roots");
    for (let height = 0; height < expectedLevels; height++) {
      mergeCompatibleBumpLevel(levels[height], other.path[height], validateCombined);
    }
  }
  function mergeCompatibleBumpLevel(level, otherLeaves, validateCombined) {
    for (const otherLeaf of otherLeaves) {
      const existing = level.get(otherLeaf.offset);
      if (existing == null) {
        level.set(otherLeaf.offset, otherLeaf);
        continue;
      }
      mergeCompatibleBumpLeaf(existing, otherLeaf, validateCombined);
    }
  }
  function mergeCompatibleBumpLeaf(existing, other, validateCombined) {
    if (validateCombined && (existing.hash !== other.hash || existing.duplicate !== other.duplicate)) {
      throw new Error("Mismatched roots");
    }
    if (other.txid != null)
      existing.txid = true;
  }
  function indexBumpTxids(bump, index, byTxid) {
    for (const leaf of bump.path[0]) {
      if (typeof leaf.hash === "string")
        byTxid.set(leaf.hash, index);
    }
  }
  var _txidIndex, _txPositionIndex, _bumpIndexesByHeight, _bumpIndexByTxid, _rawBytesCache2, _hexCache2, _atomicBytesCache, _atomicCacheTxs, _atomicCacheBumps, _atomicCacheVersion, _rawCacheVersion, _rawCacheTxs, _rawCacheBumps, _bumpState, _needsSort, _sortResultCache, _sortTxState, _Beef_instances, invalidateSerializationCaches_fn2, captureSerializationState_fn, captureTransactionState_fn, transactionStateMatches_fn, captureBumpState_fn, bumpLeafStateMatches_fn, bumpLevelStateMatches_fn, singleBumpStateMatches_fn, bumpStateMatches_fn, synchronizeNestedBumpMutations_fn, serializationCacheMatchesState_fn, markMutated_fn, ensureSerializableState_fn, ensureSortedForSerialization_fn, getSerializedBytes_fn2, getBeefForAtomic_fn, getAtomicSerializedBytes_fn, collectAtomicTransactions_fn, hasMatchingBump_fn, copySelectedTransactions_fn, findTxidIndexed_fn, ensureTxidIndex_fn, ensureTxPositionIndex_fn, rebuildTxIndexes_fn, addToIndex_fn, replaceOrAppendTx_fn, ensureBumpTxidIndex_fn, ensureBumpHeightIndex_fn, invalidateBumpIndexes_fn, addInputProof_fn, resolveInputSource_fn, combineCompatibleBumps_fn, mergeBumpEntry_fn, findOrInsertBump_fn, tryMarkTxProvenByBump_fn, mergeRawTxEntry_fn, mergeTransactionEntry_fn, queueSourceTransactions_fn, mergeTransactionGraph_fn, mergeBeefTxEntry_fn, hasDuplicateTxids_fn, collectTxidOnlyTxids_fn, collectBumpTxids_fn, verifyBumpIndexLeaves_fn, verifyInputDependencies_fn, confirmComputedRoot_fn, tryToValidateBumpIndex_fn, captureSortTxState_fn, sortTxStateMatches_fn, cloneSortResult_fn, separateMissingInputs_fn, topoSort_fn, buildTopoSortGraph_fn, processTopoSortQueue_fn, appendTopoSortResult_fn, removeKnownTxidOnlyTxs_fn, reindexBumps_fn, addComputedLeavesForRow_fn;
  var _Beef = class _Beef {
    constructor(version = BEEF_V2) {
      __privateAdd(this, _Beef_instances);
      __publicField(this, "bumps", []);
      __publicField(this, "txs", []);
      __publicField(this, "version", BEEF_V2);
      __publicField(this, "atomicTxid");
      __privateAdd(this, _txidIndex);
      __privateAdd(this, _txPositionIndex);
      __privateAdd(this, _bumpIndexesByHeight);
      __privateAdd(this, _bumpIndexByTxid);
      __privateAdd(this, _rawBytesCache2);
      __privateAdd(this, _hexCache2);
      __privateAdd(this, _atomicBytesCache, /* @__PURE__ */ new Map());
      __privateAdd(this, _atomicCacheTxs);
      __privateAdd(this, _atomicCacheBumps);
      __privateAdd(this, _atomicCacheVersion);
      __privateAdd(this, _rawCacheVersion);
      __privateAdd(this, _rawCacheTxs);
      __privateAdd(this, _rawCacheBumps);
      __privateAdd(this, _bumpState);
      __privateAdd(this, _needsSort, true);
      __privateAdd(this, _sortResultCache);
      __privateAdd(this, _sortTxState);
      this.version = version;
    }
    synchronizeNestedTransactionMutations() {
      let changed = false;
      for (const tx of this.txs)
        changed = tx.syncRawTxFromTransaction() || changed;
      if (changed) {
        __privateMethod(this, _Beef_instances, invalidateSerializationCaches_fn2).call(this);
        __privateSet(this, _sortResultCache, void 0);
        __privateSet(this, _sortTxState, void 0);
        __privateSet(this, _needsSort, true);
        __privateMethod(this, _Beef_instances, rebuildTxIndexes_fn).call(this);
      }
    }
    /**
     * Checks the BRC-95 transaction-inclusion rule without requiring header-root
     * validation: the subject must exist and every included transaction must be
     * in its recursive dependency graph.
     */
    isAtomic(txid2 = this.atomicTxid ?? "") {
      this.synchronizeNestedTransactionMutations();
      __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
      if (txid2.length === 0)
        return false;
      const txidToTx = __privateMethod(this, _Beef_instances, ensureTxidIndex_fn).call(this);
      if (txidToTx.size !== this.txs.length)
        return false;
      const subject = txidToTx.get(txid2);
      if (subject == null)
        return false;
      return __privateMethod(this, _Beef_instances, collectAtomicTransactions_fn).call(this, subject, txidToTx).size === this.txs.length;
    }
    /**
     * @param txid of `beefTx` to find
     * @returns `BeefTx` in `txs` with `txid`.
     */
    findTxid(txid2) {
      this.synchronizeNestedTransactionMutations();
      return __privateMethod(this, _Beef_instances, findTxidIndexed_fn).call(this, txid2);
    }
    /**
     * Replaces `BeefTx` for this txid with txidOnly.
     *
     * Replacement is done so that a `clone()` can be
     * updated by this method without affecting the
     * original.
     *
     * @param txid
     * @returns undefined if txid is unknown.
     */
    makeTxidOnly(txid2) {
      const i = __privateMethod(this, _Beef_instances, ensureTxPositionIndex_fn).call(this).get(txid2);
      if (i === void 0)
        return void 0;
      let btx = this.txs[i];
      if (btx.isTxidOnly) {
        return btx;
      }
      btx = BeefTx.fromTxid(txid2);
      this.txs[i] = btx;
      __privateMethod(this, _Beef_instances, addToIndex_fn).call(this, btx, i);
      __privateMethod(this, _Beef_instances, tryToValidateBumpIndex_fn).call(this, btx);
      __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      return btx;
    }
    /**
     * @returns `MerklePath` with level zero hash equal to txid or undefined.
     */
    findBump(txid2) {
      __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
      const index = __privateMethod(this, _Beef_instances, ensureBumpTxidIndex_fn).call(this).get(txid2);
      return index === void 0 ? void 0 : this.bumps[index];
    }
    /**
     * Finds a Transaction in this `Beef`
     * and adds any missing input SourceTransactions from this `Beef`.
     *
     * The result is suitable for signing.
     *
     * @param txid The id of the target transaction.
     * @returns Transaction with all available input `SourceTransaction`s from this Beef.
     */
    findTransactionForSigning(txid2) {
      const beefTx = this.findTxid(txid2);
      if (beefTx?.tx == null)
        return void 0;
      for (const i of beefTx.tx.inputs) {
        if (i.sourceTransaction == null) {
          const itx = __privateMethod(this, _Beef_instances, findTxidIndexed_fn).call(this, verifyNotNull(i.sourceTXID, "sourceTXID must be valid"));
          if (itx != null) {
            i.sourceTransaction = itx.tx;
          }
        }
      }
      return beefTx.tx;
    }
    /**
     * Builds the proof tree rooted at a specific `Transaction`.
     *
     * To succeed, the Beef must contain all the required transaction and merkle path data.
     *
     * @param txid The id of the target transaction.
     * @returns Transaction with input `SourceTransaction` and `MerklePath` populated from this Beef.
     */
    findAtomicTransaction(txid2) {
      const beefTx = this.findTxid(txid2);
      if (beefTx?.tx == null)
        return void 0;
      __privateMethod(this, _Beef_instances, addInputProof_fn).call(this, beefTx.tx);
      return beefTx.tx;
    }
    /**
     * Merge a MerklePath that is assumed to be fully valid.
     * @param bump
     * @returns index of merged bump
     */
    mergeBump(bump) {
      this.synchronizeNestedTransactionMutations();
      __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
      __privateMethod(this, _Beef_instances, markMutated_fn).call(this, false);
      return __privateMethod(this, _Beef_instances, mergeBumpEntry_fn).call(this, bump);
    }
    /**
     * Merge several independently proven transactions in one mutation pass.
     *
     * This is equivalent to calling `mergeRawTx` followed by `mergeBump` for
     * every entry, but synchronizes nested BEEF state only once. That distinction
     * matters for wallets assembling a BEEF from a fragmented UTXO set because
     * proof paths are otherwise re-scanned after every input.
     */
    mergeProvenTxs(entries) {
      if (entries.length === 0)
        return [];
      this.synchronizeNestedTransactionMutations();
      __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
      __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      const merged = [];
      for (const entry of entries) {
        merged.push(__privateMethod(this, _Beef_instances, mergeRawTxEntry_fn).call(this, entry.rawTx));
      }
      const heightCounts = /* @__PURE__ */ new Map();
      for (const entry of entries) {
        const height = entry.merklePath.blockHeight;
        heightCounts.set(height, (heightCounts.get(height) ?? 0) + 1);
      }
      const groups = /* @__PURE__ */ new Map();
      for (let index = 0; index < entries.length; index++) {
        const path = entries[index].merklePath;
        const rootHint = entries[index].merkleRoot;
        const key = heightCounts.get(path.blockHeight) === 1 ? `${path.blockHeight}:single:${index}` : `${path.blockHeight}:${rootHint ?? path.computeRoot()}`;
        const group = groups.get(key);
        if (group == null) {
          groups.set(key, { first: index, paths: [path], validateCombined: rootHint != null });
        } else {
          group.paths.push(path);
          group.validateCombined = group.validateCombined || rootHint != null;
        }
      }
      for (const group of [...groups.values()].sort((a, b) => a.first - b.first)) {
        __privateMethod(this, _Beef_instances, mergeBumpEntry_fn).call(this, __privateMethod(this, _Beef_instances, combineCompatibleBumps_fn).call(this, group.paths, group.validateCombined));
      }
      return merged;
    }
    /**
     * Merge a serialized transaction.
     *
     * Checks that a transaction with the same txid hasn't already been merged.
     *
     * Replaces existing transaction with same txid.
     *
     * @param rawTx
     * @param bumpIndex Optional. If a number, must be valid index into bumps array.
     * @returns txid of rawTx
     */
    mergeRawTx(rawTx, bumpIndex) {
      this.synchronizeNestedTransactionMutations();
      __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      return __privateMethod(this, _Beef_instances, mergeRawTxEntry_fn).call(this, rawTx, bumpIndex);
    }
    /**
     * Merge a `Transaction` and any referenced `merklePath` and `sourceTransaction`, recursifely.
     *
     * Replaces existing transaction with same txid.
     *
     * Attempts to match an existing bump to the new transaction.
     *
     * @param tx
     * @returns txid of tx
     */
    mergeTransaction(tx) {
      this.synchronizeNestedTransactionMutations();
      __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      return __privateMethod(this, _Beef_instances, mergeTransactionGraph_fn).call(this, tx);
    }
    /**
     * Removes an existing transaction from the BEEF, given its TXID
     * @param txid TXID of the transaction to remove
     */
    removeExistingTxid(txid2) {
      const existingTxIndex = __privateMethod(this, _Beef_instances, ensureTxPositionIndex_fn).call(this).get(txid2);
      if (existingTxIndex !== void 0) {
        this.txs.splice(existingTxIndex, 1);
        __privateMethod(this, _Beef_instances, rebuildTxIndexes_fn).call(this);
        __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      }
    }
    mergeTxidOnly(txid2) {
      let tx = this.findTxid(txid2);
      if (tx == null) {
        tx = new BeefTx(txid2);
        this.txs.push(tx);
        __privateMethod(this, _Beef_instances, addToIndex_fn).call(this, tx);
        __privateMethod(this, _Beef_instances, tryToValidateBumpIndex_fn).call(this, tx);
        __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      }
      return tx;
    }
    mergeBeefTx(btx) {
      let beefTx = this.findTxid(btx.txid);
      if (btx.isTxidOnly && beefTx == null) {
        beefTx = this.mergeTxidOnly(btx.txid);
      } else if (btx._tx != null && (beefTx == null || beefTx.isTxidOnly)) {
        beefTx = this.mergeTransaction(btx._tx);
      } else if (btx._rawTx != null && (beefTx == null || beefTx.isTxidOnly)) {
        beefTx = this.mergeRawTx(btx._rawTx);
      }
      if (beefTx == null) {
        throw new Error(`Failed to merge BeefTx for txid: ${btx.txid}`);
      }
      return beefTx;
    }
    mergeBeef(beef) {
      const b = _Beef.fromBinaryStrict(beef instanceof _Beef ? beef.toBinary() : beef);
      this.synchronizeNestedTransactionMutations();
      __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
      __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      for (const bump of b.bumps) {
        __privateMethod(this, _Beef_instances, mergeBumpEntry_fn).call(this, bump);
      }
      for (const tx of b.txs) {
        __privateMethod(this, _Beef_instances, mergeBeefTxEntry_fn).call(this, tx);
      }
    }
    /**
     * Sorts `txs` and checks structural validity of beef.
     *
     * Does NOT verify merkle roots.
     *
     * Validity requirements:
     * 1. No 'known' txids, unless `allowTxidOnly` is true.
     * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
     * 3. Order of transactions satisfies dependencies before dependents.
     * 4. No transactions with duplicate txids.
     *
     * @param allowTxidOnly optional. If true, transaction txid only is assumed valid
     */
    isValid(allowTxidOnly) {
      return this.verifyValid(allowTxidOnly).valid;
    }
    /**
     * Sorts `txs` and confirms validity of transaction data contained in beef
     * by validating structure of this beef and confirming computed merkle roots
     * using `chainTracker`.
     *
     * Validity requirements:
     * 1. No 'known' txids, unless `allowTxidOnly` is true.
     * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
     * 3. Order of transactions satisfies dependencies before dependents.
     * 4. No transactions with duplicate txids.
     *
     * @param chainTracker Used to verify computed merkle path roots for all bump txids.
     * @param allowTxidOnly optional. If true, transaction txid is assumed valid
     */
    async verify(chainTracker, allowTxidOnly) {
      const r2 = this.verifyValid(allowTxidOnly);
      if (!r2.valid)
        return false;
      for (const height of Object.keys(r2.roots)) {
        const isValid = await chainTracker.isValidRootForHeight(r2.roots[height], Number(height));
        if (isValid !== true) {
          return false;
        }
      }
      return true;
    }
    /**
     * Sorts `txs` and confirms validity of transaction data contained in beef
     * by validating structure of this beef.
     *
     * Returns block heights and merkle root values to be confirmed by a chaintracker.
     *
     * Validity requirements:
     * 1. No 'known' txids, unless `allowTxidOnly` is true.
     * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
     * 3. Order of transactions satisfies dependencies before dependents.
     * 4. No transactions with duplicate txids.
     *
     * @param allowTxidOnly optional. If true, transaction txid is assumed valid
     * @returns {{valid: boolean, roots: Record<number, string>}}
     * `valid` is true iff this Beef is structuraly valid.
     * `roots` is a record where keys are block heights and values are the corresponding merkle roots to be validated.
     */
    verifyValid(allowTxidOnly) {
      __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
      const r2 = {
        valid: false,
        roots: {}
      };
      if (this.atomicTxid != null && !this.isAtomic(this.atomicTxid))
        return r2;
      const sr = this.sortTxs();
      if (__privateMethod(this, _Beef_instances, hasDuplicateTxids_fn).call(this))
        return r2;
      if (sr.missingInputs.length > 0 || sr.notValid.length > 0 || sr.txidOnly.length > 0 && allowTxidOnly !== true || sr.withMissingInputs.length > 0) {
        return r2;
      }
      const txids = {};
      if (!__privateMethod(this, _Beef_instances, collectTxidOnlyTxids_fn).call(this, txids, allowTxidOnly))
        return r2;
      if (!__privateMethod(this, _Beef_instances, collectBumpTxids_fn).call(this, txids, r2))
        return r2;
      if (!__privateMethod(this, _Beef_instances, verifyBumpIndexLeaves_fn).call(this))
        return r2;
      if (!__privateMethod(this, _Beef_instances, verifyInputDependencies_fn).call(this, txids))
        return r2;
      r2.valid = true;
      return r2;
    }
    /**
     * Serializes this data to `writer`
     * @param writer
     */
    toWriter(writer) {
      writer.writeUInt32LE(this.version);
      writer.writeVarIntNum(this.bumps.length);
      for (const b of this.bumps) {
        writer.write(writer instanceof WriterUint8Array ? b.toBinaryUint8Array() : b.toBinary());
      }
      writer.writeVarIntNum(this.txs.length);
      for (const tx of this.txs) {
        tx.toWriter(writer, this.version);
      }
    }
    /**
     * Returns a binary array representing the serialized BEEF
     * @returns A binary array representing the BEEF
     * @returns An array of byte values containing binary serialization of the BEEF
     */
    toBinary() {
      return Array.from(__privateMethod(this, _Beef_instances, getSerializedBytes_fn2).call(this));
    }
    /**
     * Returns a binary array representing the serialized BEEF
     * @returns A Uint8Array containing binary serialization of the BEEF
     */
    toUint8Array() {
      return new Uint8Array(__privateMethod(this, _Beef_instances, getSerializedBytes_fn2).call(this));
    }
    /**
     * Serialize this Beef as AtomicBEEF.
     *
     * `txid` must exist
     *
     * includes exactly the subject transaction and its recursive dependencies
     *
     * @param txid
     * @returns serialized contents of this Beef with AtomicBEEF prefix.
     */
    toBinaryAtomic(txid2) {
      return Array.from(__privateMethod(this, _Beef_instances, getAtomicSerializedBytes_fn).call(this, txid2));
    }
    /**
     * Serialize this Beef as AtomicBEEF.
     *
     * `txid` must exist
     *
     * includes exactly the subject transaction and its recursive dependencies
     *
     * @param txid
     * @returns serialized contents of this Beef with AtomicBEEF prefix.
     */
    toUint8ArrayAtomic(txid2) {
      return new Uint8Array(__privateMethod(this, _Beef_instances, getAtomicSerializedBytes_fn).call(this, txid2));
    }
    /**
     * Returns a hex string representing the serialized BEEF
     * @returns A hex string representing the BEEF
     */
    toHex() {
      const bytes3 = __privateMethod(this, _Beef_instances, getSerializedBytes_fn2).call(this);
      if (__privateGet(this, _hexCache2) != null)
        return __privateGet(this, _hexCache2);
      const hex2 = toHex(bytes3);
      __privateSet(this, _hexCache2, hex2);
      return hex2;
    }
    static fromReader(br) {
      var _a;
      const serializedStart = br.pos;
      let version = br.readUInt32LE();
      let atomicTxid;
      let beefStart = serializedStart;
      if (version === ATOMIC_BEEF) {
        atomicTxid = toHex(br.readReverse(32));
        beefStart = br.pos;
        version = br.readUInt32LE();
      }
      if (version !== BEEF_V1 && version !== BEEF_V2) {
        throw new Error(`Serialized BEEF must start with ${BEEF_V1} or ${BEEF_V2} but starts with ${version}`);
      }
      const beef = new _Beef(version);
      const bumpsLength = br.readVarIntNumStrict(false);
      for (let i = 0; i < bumpsLength; i++) {
        const bump = MerklePath.fromReader(br, false);
        beef.bumps.push(bump);
      }
      const txsLength = br.readVarIntNumStrict(false);
      for (let i = 0; i < txsLength; i++) {
        const beefTx = BeefTx.fromReader(br, version);
        beef.txs.push(beefTx);
      }
      beef.atomicTxid = atomicTxid;
      if (br instanceof ReaderUint8Array) {
        __privateSet(beef, _rawBytesCache2, br.bin.subarray(beefStart, br.pos));
        __privateMethod(_a = beef, _Beef_instances, captureSerializationState_fn).call(_a);
      }
      return beef;
    }
    /**
     * Parses the first BEEF object in the provided binary array.
     *
     * This compatibility parser intentionally ignores any trailing bytes. It is
     * suitable only when the caller owns the framing or is deliberately reading
     * one object from a larger stream. Use {@link fromBinaryStrict} for untrusted
     * or independently framed input so an appended suffix is rejected.
     *
     * @param bin The binary array or Uint8Array from which to construct BEEF
     * @returns An instance of the Beef class constructed from the binary data
     */
    static fromBinary(bin) {
      return _Beef.fromReader(new ReaderUint8Array(Uint8Array.from(bin)));
    }
    /**
     * Parses one complete BEEF object from an isolated copy of `bin` and rejects
     * any trailing bytes. Use this for data received across a trust boundary.
     */
    static fromBinaryStrict(bin) {
      return _Beef.fromBinaryView(Uint8Array.from(bin));
    }
    /**
     * Parses BEEF while retaining zero-copy views over `bin`. The caller must not
     * mutate the buffer for the lifetime of the returned object.
     */
    static fromBinaryView(bin) {
      const br = new ReaderUint8Array(bin);
      const beef = _Beef.fromReader(br);
      if (!br.eof())
        throw new Error("Serialized BEEF contains trailing data");
      return beef;
    }
    /**
     * Constructs an instance of the Beef class based on the provided string
     * @param s The string value from which to construct BEEF
     * @param enc The encoding of the string value from which BEEF should be constructed
     * @returns An instance of the Beef class constructed from the string
     */
    static fromString(s2, enc = "hex") {
      const bin = toUint8Array(s2, enc);
      return _Beef.fromBinaryStrict(bin);
    }
    /**
     * Sort the `txs` by input txid dependency order:
     * - Oldest Tx Anchored by Path or txid only
     * - Newer Txs depending on Older parents
     * - Newest Tx
     *
     * with proof (MerklePath) last, longest chain of dependencies first
     *
     * @returns `{ missingInputs, notValid, valid, withMissingInputs }`
     */
    sortTxs() {
      this.synchronizeNestedTransactionMutations();
      __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
      if (__privateGet(this, _sortResultCache) != null && __privateMethod(this, _Beef_instances, sortTxStateMatches_fn).call(this)) {
        return __privateMethod(this, _Beef_instances, cloneSortResult_fn).call(this, __privateGet(this, _sortResultCache));
      }
      __privateSet(this, _sortResultCache, void 0);
      __privateSet(this, _sortTxState, void 0);
      const validTxids = {};
      const txidToTx = {};
      const result = [];
      const txidOnly = [];
      let queue = this.partitionTxs(txidToTx, validTxids, result, txidOnly);
      const { txsMissingInputs, missingInputs, remaining } = __privateMethod(this, _Beef_instances, separateMissingInputs_fn).call(this, queue, txidToTx);
      queue = remaining;
      const txsNotValid = __privateMethod(this, _Beef_instances, topoSort_fn).call(this, queue, validTxids, result);
      this.txs = txsMissingInputs.concat(txsNotValid).concat(txidOnly).concat(result);
      __privateSet(this, _needsSort, false);
      __privateMethod(this, _Beef_instances, invalidateSerializationCaches_fn2).call(this);
      __privateMethod(this, _Beef_instances, rebuildTxIndexes_fn).call(this);
      const sortResult = {
        missingInputs: Object.keys(missingInputs),
        notValid: txsNotValid.map((tx) => tx.txid),
        valid: Object.keys(validTxids),
        withMissingInputs: txsMissingInputs.map((tx) => tx.txid),
        txidOnly: txidOnly.map((tx) => tx.txid)
      };
      __privateSet(this, _sortResultCache, sortResult);
      __privateMethod(this, _Beef_instances, captureSortTxState_fn).call(this);
      return __privateMethod(this, _Beef_instances, cloneSortResult_fn).call(this, sortResult);
    }
    /**
     * Partition txs into proven (result), txidOnly, and a queue of the rest.
     * Populates txidToTx and validTxids as side-effects.
     */
    partitionTxs(txidToTx, validTxids, result, txidOnly) {
      const queue = [];
      for (const tx of this.txs) {
        txidToTx[tx.txid] = tx;
        tx.isValid = tx.hasProof;
        if (tx.isValid) {
          validTxids[tx.txid] = true;
          result.push(tx);
        } else if (tx.isTxidOnly && tx.inputTxids.length === 0) {
          validTxids[tx.txid] = true;
          txidOnly.push(tx);
        } else {
          queue.push(tx);
        }
      }
      return queue;
    }
    /**
     * @returns a shallow copy of this beef
     */
    clone() {
      var _a, _b;
      const c = new _Beef();
      c.version = this.version;
      c.bumps = Array.from(this.bumps);
      c.txs = Array.from(this.txs);
      __privateSet(c, _txidIndex, void 0);
      __privateSet(c, _txPositionIndex, void 0);
      __privateSet(c, _bumpIndexesByHeight, void 0);
      __privateSet(c, _bumpIndexByTxid, void 0);
      __privateSet(c, _needsSort, __privateGet(this, _needsSort));
      __privateSet(c, _sortResultCache, __privateGet(this, _sortResultCache) == null ? void 0 : __privateMethod(this, _Beef_instances, cloneSortResult_fn).call(this, __privateGet(this, _sortResultCache)));
      if (__privateGet(c, _sortResultCache) != null)
        __privateMethod(_a = c, _Beef_instances, captureSortTxState_fn).call(_a);
      __privateSet(c, _hexCache2, __privateGet(this, _hexCache2));
      __privateSet(c, _rawBytesCache2, __privateGet(this, _rawBytesCache2));
      if (__privateGet(c, _rawBytesCache2) != null)
        __privateMethod(_b = c, _Beef_instances, captureSerializationState_fn).call(_b);
      return c;
    }
    /**
     * Ensure that all the txids in `knownTxids` are txidOnly
     * @param knownTxids
     */
    trimKnownTxids(knownTxids) {
      let mutated = __privateMethod(this, _Beef_instances, removeKnownTxidOnlyTxs_fn).call(this, new Set(knownTxids));
      mutated = __privateMethod(this, _Beef_instances, reindexBumps_fn).call(this) || mutated;
      if (mutated) {
        __privateMethod(this, _Beef_instances, markMutated_fn).call(this, true);
      }
    }
    /**
     * @returns array of transaction txids that either have a proof or whose inputs chain back to a proven transaction.
     */
    getValidTxids() {
      const r2 = this.sortTxs();
      return r2.valid;
    }
    /**
     * @returns Summary of `Beef` contents as multi-line string.
     */
    toLogString() {
      let log = "";
      log += `BEEF with ${this.bumps.length} BUMPS and ${this.txs.length} Transactions, isValid ${this.isValid().toString()}
`;
      let i = -1;
      for (const b of this.bumps) {
        i++;
        log += `  BUMP ${i}
    block: ${b.blockHeight}
    txids: [
${b.path[0].filter((n) => n.txid === true).map((n) => `      '${n.hash ?? ""}'`).join(",\n")}
    ]
`;
      }
      i = -1;
      for (const t of this.txs) {
        i++;
        log += `  TX ${i}
    txid: ${t.txid}
`;
        if (t.bumpIndex !== void 0) {
          log += `    bumpIndex: ${t.bumpIndex}
`;
        }
        if (t.isTxidOnly) {
          log += "    txidOnly\n";
        } else {
          log += `    rawTx length=${t.rawTx?.length ?? 0}
`;
        }
        if (t.inputTxids.length > 0) {
          const inputLines = t.inputTxids.map((it) => `      '${it}'`).join(",\n");
          log += `    inputs: [
${inputLines}
    ]
`;
        }
      }
      return log;
    }
    /**
     * In some circumstances it may be helpful for the BUMP MerklePaths to include
     * leaves that can be computed from row zero.
     */
    addComputedLeaves() {
      for (const bump of this.bumps) {
        for (let row = 1; row < bump.path.length; row++) {
          __privateMethod(this, _Beef_instances, addComputedLeavesForRow_fn).call(this, bump, row);
        }
      }
    }
  };
  _txidIndex = new WeakMap();
  _txPositionIndex = new WeakMap();
  _bumpIndexesByHeight = new WeakMap();
  _bumpIndexByTxid = new WeakMap();
  _rawBytesCache2 = new WeakMap();
  _hexCache2 = new WeakMap();
  _atomicBytesCache = new WeakMap();
  _atomicCacheTxs = new WeakMap();
  _atomicCacheBumps = new WeakMap();
  _atomicCacheVersion = new WeakMap();
  _rawCacheVersion = new WeakMap();
  _rawCacheTxs = new WeakMap();
  _rawCacheBumps = new WeakMap();
  _bumpState = new WeakMap();
  _needsSort = new WeakMap();
  _sortResultCache = new WeakMap();
  _sortTxState = new WeakMap();
  _Beef_instances = new WeakSet();
  invalidateSerializationCaches_fn2 = function() {
    __privateSet(this, _rawBytesCache2, void 0);
    __privateSet(this, _hexCache2, void 0);
    __privateGet(this, _atomicBytesCache).clear();
    __privateSet(this, _atomicCacheTxs, void 0);
    __privateSet(this, _atomicCacheBumps, void 0);
    __privateSet(this, _atomicCacheVersion, void 0);
    __privateSet(this, _rawCacheVersion, void 0);
    __privateSet(this, _rawCacheTxs, void 0);
    __privateSet(this, _rawCacheBumps, void 0);
  };
  captureSerializationState_fn = function() {
    __privateSet(this, _rawCacheVersion, this.version);
    __privateSet(this, _rawCacheTxs, __privateMethod(this, _Beef_instances, captureTransactionState_fn).call(this));
    __privateSet(this, _rawCacheBumps, Array.from(this.bumps));
    __privateMethod(this, _Beef_instances, captureBumpState_fn).call(this);
  };
  captureTransactionState_fn = function() {
    return this.txs.map((ref) => ({
      ref,
      bumpIndex: ref._bumpIndex,
      rawTx: ref._rawTx,
      // Once raw bytes exist, lazily parsing or hashing them does not change
      // their serialized representation and must not evict the forwarding cache.
      tx: ref._rawTx == null ? ref._tx : void 0,
      txid: ref._rawTx == null && ref._tx == null ? ref._txid : void 0
    }));
  };
  transactionStateMatches_fn = function(cachedTxs) {
    if (cachedTxs?.length !== this.txs.length)
      return false;
    for (let i = 0; i < this.txs.length; i++) {
      const tx = this.txs[i];
      const cached = cachedTxs[i];
      if (cached.ref !== tx || cached.bumpIndex !== tx._bumpIndex || cached.rawTx !== tx._rawTx || cached.tx !== (tx._rawTx == null ? tx._tx : void 0) || cached.txid !== (tx._rawTx == null && tx._tx == null ? tx._txid : void 0))
        return false;
    }
    return true;
  };
  captureBumpState_fn = function() {
    __privateSet(this, _bumpState, this.bumps.map((ref) => ({
      ref,
      blockHeight: ref.blockHeight,
      levels: ref.path.map((level) => ({
        ref: level,
        leaves: level.map((leaf) => ({
          ref: leaf,
          offset: leaf.offset,
          hash: leaf.hash,
          txid: leaf.txid,
          duplicate: leaf.duplicate
        }))
      }))
    })));
  };
  bumpLeafStateMatches_fn = function(leaf, state) {
    return state.ref === leaf && state.offset === leaf.offset && state.hash === leaf.hash && state.txid === leaf.txid && state.duplicate === leaf.duplicate;
  };
  bumpLevelStateMatches_fn = function(level, state) {
    return state.ref === level && state.leaves.length === level.length && level.every((leaf, index) => __privateMethod(this, _Beef_instances, bumpLeafStateMatches_fn).call(this, leaf, state.leaves[index]));
  };
  singleBumpStateMatches_fn = function(bump, state) {
    return state.ref === bump && state.blockHeight === bump.blockHeight && state.levels.length === bump.path.length && bump.path.every((level, index) => __privateMethod(this, _Beef_instances, bumpLevelStateMatches_fn).call(this, level, state.levels[index]));
  };
  bumpStateMatches_fn = function() {
    if (__privateGet(this, _bumpState)?.length !== this.bumps.length)
      return false;
    return this.bumps.every((bump, index) => __privateMethod(this, _Beef_instances, singleBumpStateMatches_fn).call(this, bump, __privateGet(this, _bumpState)[index]));
  };
  synchronizeNestedBumpMutations_fn = function() {
    if (__privateGet(this, _bumpState) == null) {
      __privateMethod(this, _Beef_instances, captureBumpState_fn).call(this);
      return;
    }
    if (!__privateMethod(this, _Beef_instances, bumpStateMatches_fn).call(this)) {
      __privateMethod(this, _Beef_instances, invalidateSerializationCaches_fn2).call(this);
      __privateSet(this, _sortResultCache, void 0);
      __privateSet(this, _sortTxState, void 0);
      __privateSet(this, _needsSort, true);
      __privateMethod(this, _Beef_instances, invalidateBumpIndexes_fn).call(this);
      __privateMethod(this, _Beef_instances, captureBumpState_fn).call(this);
    }
  };
  serializationCacheMatchesState_fn = function() {
    if (__privateGet(this, _rawBytesCache2) == null || __privateGet(this, _rawCacheVersion) !== this.version || !__privateMethod(this, _Beef_instances, transactionStateMatches_fn).call(this, __privateGet(this, _rawCacheTxs)) || __privateGet(this, _rawCacheBumps)?.length !== this.bumps.length)
      return false;
    for (let i = 0; i < this.bumps.length; i++) {
      if (__privateGet(this, _rawCacheBumps)[i] !== this.bumps[i])
        return false;
    }
    return true;
  };
  markMutated_fn = function(requiresSort = true) {
    __privateMethod(this, _Beef_instances, invalidateSerializationCaches_fn2).call(this);
    __privateSet(this, _sortResultCache, void 0);
    __privateSet(this, _sortTxState, void 0);
    if (requiresSort) {
      __privateSet(this, _needsSort, true);
    }
  };
  ensureSerializableState_fn = function() {
    for (const tx of this.txs) {
      tx.txid;
    }
  };
  ensureSortedForSerialization_fn = function() {
    if (__privateGet(this, _needsSort)) {
      this.sortTxs();
    }
  };
  getSerializedBytes_fn2 = function() {
    this.synchronizeNestedTransactionMutations();
    __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
    if (__privateMethod(this, _Beef_instances, serializationCacheMatchesState_fn).call(this) && __privateGet(this, _rawBytesCache2) != null)
      return __privateGet(this, _rawBytesCache2);
    __privateMethod(this, _Beef_instances, invalidateSerializationCaches_fn2).call(this);
    __privateMethod(this, _Beef_instances, ensureSerializableState_fn).call(this);
    __privateMethod(this, _Beef_instances, ensureSortedForSerialization_fn).call(this);
    const writer = new WriterUint8Array();
    this.toWriter(writer);
    __privateSet(this, _rawBytesCache2, writer.toUint8Array());
    __privateMethod(this, _Beef_instances, captureSerializationState_fn).call(this);
    return __privateGet(this, _rawBytesCache2);
  };
  getBeefForAtomic_fn = function(txid2) {
    const txidToTx = __privateMethod(this, _Beef_instances, ensureTxidIndex_fn).call(this);
    const subject = txidToTx.get(txid2);
    if (subject == null) {
      throw new Error(`${txid2} does not exist in this Beef`);
    }
    const included = __privateMethod(this, _Beef_instances, collectAtomicTransactions_fn).call(this, subject, txidToTx);
    const beef = __privateMethod(this, _Beef_instances, copySelectedTransactions_fn).call(this, included);
    beef.sortTxs();
    return beef;
  };
  getAtomicSerializedBytes_fn = function(txid2) {
    var _a;
    this.synchronizeNestedTransactionMutations();
    __privateMethod(this, _Beef_instances, synchronizeNestedBumpMutations_fn).call(this);
    const cacheMatches = __privateGet(this, _atomicCacheVersion) === this.version && __privateMethod(this, _Beef_instances, transactionStateMatches_fn).call(this, __privateGet(this, _atomicCacheTxs)) && __privateGet(this, _atomicCacheBumps)?.length === this.bumps.length && this.bumps.every((bump, index) => __privateGet(this, _atomicCacheBumps)?.[index] === bump);
    if (!cacheMatches)
      __privateGet(this, _atomicBytesCache).clear();
    const cached = __privateGet(this, _atomicBytesCache).get(txid2);
    if (cached != null)
      return cached;
    const beefBytes = __privateMethod(_a = __privateMethod(this, _Beef_instances, getBeefForAtomic_fn).call(this, txid2), _Beef_instances, getSerializedBytes_fn2).call(_a);
    const txidBytes = toUint8Array(txid2, "hex");
    const atomic = new Uint8Array(4 + txidBytes.length + beefBytes.length);
    const view = new DataView(atomic.buffer);
    view.setUint32(0, ATOMIC_BEEF, true);
    for (let i = 0; i < txidBytes.length; i++) {
      atomic[4 + i] = txidBytes[txidBytes.length - 1 - i];
    }
    atomic.set(beefBytes, 4 + txidBytes.length);
    __privateGet(this, _atomicBytesCache).set(txid2, atomic);
    __privateSet(this, _atomicCacheTxs, __privateMethod(this, _Beef_instances, captureTransactionState_fn).call(this));
    __privateSet(this, _atomicCacheBumps, Array.from(this.bumps));
    __privateSet(this, _atomicCacheVersion, this.version);
    return atomic;
  };
  collectAtomicTransactions_fn = function(subject, txidToTx) {
    const included = /* @__PURE__ */ new Set();
    const stack = [subject];
    while (stack.length > 0) {
      const tx = stack.pop();
      if (tx == null || included.has(tx))
        continue;
      included.add(tx);
      if (__privateMethod(this, _Beef_instances, hasMatchingBump_fn).call(this, tx) || tx.isTxidOnly)
        continue;
      for (const inputTxid of tx.inputTxids) {
        const input = txidToTx.get(inputTxid);
        if (input != null)
          stack.push(input);
      }
    }
    return included;
  };
  hasMatchingBump_fn = function(tx) {
    const bumpIndex = tx.bumpIndex;
    if (bumpIndex == null || !Number.isSafeInteger(bumpIndex) || bumpIndex < 0 || bumpIndex >= this.bumps.length)
      return false;
    return this.bumps[bumpIndex]?.path[0]?.some((leaf) => leaf.hash === tx.txid) ?? false;
  };
  copySelectedTransactions_fn = function(included) {
    const beef = new _Beef(this.version);
    const bumpIndexMap = /* @__PURE__ */ new Map();
    for (const tx of this.txs) {
      if (!included.has(tx) || !__privateMethod(this, _Beef_instances, hasMatchingBump_fn).call(this, tx) || tx.bumpIndex == null)
        continue;
      if (!bumpIndexMap.has(tx.bumpIndex)) {
        bumpIndexMap.set(tx.bumpIndex, beef.bumps.length);
        beef.bumps.push(this.bumps[tx.bumpIndex]);
      }
    }
    for (const tx of this.txs) {
      if (!included.has(tx))
        continue;
      const bumpIndex = tx.bumpIndex == null ? void 0 : bumpIndexMap.get(tx.bumpIndex);
      let copy;
      if (tx._rawTx != null) {
        copy = new BeefTx(tx._rawTx, bumpIndex, Array.from(tx.inputTxids));
      } else if (tx._tx != null) {
        copy = BeefTx.fromTx(tx._tx, bumpIndex);
      } else {
        copy = BeefTx.fromTxid(tx.txid, bumpIndex);
      }
      beef.txs.push(copy);
    }
    return beef;
  };
  findTxidIndexed_fn = function(txid2) {
    return __privateMethod(this, _Beef_instances, ensureTxidIndex_fn).call(this).get(txid2);
  };
  ensureTxidIndex_fn = function() {
    if (__privateGet(this, _txidIndex) == null || __privateGet(this, _txPositionIndex) == null)
      __privateMethod(this, _Beef_instances, rebuildTxIndexes_fn).call(this);
    return __privateGet(this, _txidIndex);
  };
  ensureTxPositionIndex_fn = function() {
    if (__privateGet(this, _txPositionIndex) == null || __privateGet(this, _txidIndex) == null)
      __privateMethod(this, _Beef_instances, rebuildTxIndexes_fn).call(this);
    return __privateGet(this, _txPositionIndex);
  };
  rebuildTxIndexes_fn = function() {
    __privateSet(this, _txidIndex, /* @__PURE__ */ new Map());
    __privateSet(this, _txPositionIndex, /* @__PURE__ */ new Map());
    for (let i = 0; i < this.txs.length; i++) {
      const tx = this.txs[i];
      __privateGet(this, _txidIndex).set(tx.txid, tx);
      __privateGet(this, _txPositionIndex).set(tx.txid, i);
    }
  };
  addToIndex_fn = function(tx, position = this.txs.length - 1) {
    __privateGet(this, _txidIndex)?.set(tx.txid, tx);
    __privateGet(this, _txPositionIndex)?.set(tx.txid, position);
  };
  replaceOrAppendTx_fn = function(tx) {
    const position = __privateMethod(this, _Beef_instances, ensureTxPositionIndex_fn).call(this).get(tx.txid);
    if (position === void 0) {
      this.txs.push(tx);
      __privateMethod(this, _Beef_instances, addToIndex_fn).call(this, tx);
    } else {
      this.txs[position] = tx;
      __privateMethod(this, _Beef_instances, addToIndex_fn).call(this, tx, position);
    }
  };
  ensureBumpTxidIndex_fn = function() {
    if (__privateGet(this, _bumpIndexByTxid) == null) {
      __privateSet(this, _bumpIndexByTxid, /* @__PURE__ */ new Map());
      for (let i = 0; i < this.bumps.length; i++) {
        for (const leaf of this.bumps[i].path[0]) {
          if (typeof leaf.hash === "string")
            __privateGet(this, _bumpIndexByTxid).set(leaf.hash, i);
        }
      }
    }
    return __privateGet(this, _bumpIndexByTxid);
  };
  ensureBumpHeightIndex_fn = function() {
    if (__privateGet(this, _bumpIndexesByHeight) == null) {
      __privateSet(this, _bumpIndexesByHeight, /* @__PURE__ */ new Map());
      for (let i = 0; i < this.bumps.length; i++) {
        const bump = this.bumps[i];
        const indexes = __privateGet(this, _bumpIndexesByHeight).get(bump.blockHeight) ?? [];
        indexes.push(i);
        __privateGet(this, _bumpIndexesByHeight).set(bump.blockHeight, indexes);
      }
    }
    return __privateGet(this, _bumpIndexesByHeight);
  };
  invalidateBumpIndexes_fn = function() {
    __privateSet(this, _bumpIndexesByHeight, void 0);
    __privateSet(this, _bumpIndexByTxid, void 0);
  };
  /** Iteratively attach merkle paths and source transactions to all inputs. */
  addInputProof_fn = function(tx) {
    const visited = /* @__PURE__ */ new Set();
    const stack = [tx];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current == null)
        continue;
      const txid2 = current.id("hex");
      if (visited.has(txid2))
        continue;
      visited.add(txid2);
      const mp = this.findBump(txid2);
      if (mp != null) {
        current.merklePath = mp;
        continue;
      }
      for (const input of current.inputs) {
        __privateMethod(this, _Beef_instances, resolveInputSource_fn).call(this, input);
        if (input.sourceTransaction != null)
          stack.push(input.sourceTransaction);
      }
    }
  };
  resolveInputSource_fn = function(i) {
    if (i.sourceTransaction == null) {
      const itx = __privateMethod(this, _Beef_instances, findTxidIndexed_fn).call(this, verifyNotNull(i.sourceTXID, "sourceTXID must be valid"));
      if (itx != null) {
        i.sourceTransaction = itx.tx;
      }
    }
  };
  /** Combine already root-matched paths while preserving the first path reference. */
  combineCompatibleBumps_fn = function(paths, validateCombined = false) {
    const combined = paths[0];
    if (paths.length === 1 && !validateCombined)
      return combined;
    const levels = combined.path.map((level) => new Map(level.map((leaf) => [leaf.offset, leaf])));
    for (let pathIndex = 1; pathIndex < paths.length; pathIndex++) {
      mergeCompatibleBumpLevels(levels, paths[pathIndex], combined.path.length, validateCombined);
    }
    const combinedPath = levels.map((level) => [...level.values()]);
    if (validateCombined) {
      const validated = new MerklePath(combined.blockHeight, combinedPath);
      validated.trim();
      return validated;
    }
    combined.path = combinedPath;
    combined.trim();
    return combined;
  };
  /** Merge one bump after the caller has synchronized and marked the BEEF. */
  mergeBumpEntry_fn = function(bump) {
    const bumpIndex = __privateMethod(this, _Beef_instances, findOrInsertBump_fn).call(this, bump);
    const b = this.bumps[bumpIndex];
    const txIndex = __privateMethod(this, _Beef_instances, ensureTxidIndex_fn).call(this);
    for (const leaf of b.path[0]) {
      if (typeof leaf.hash !== "string")
        continue;
      const tx = txIndex.get(leaf.hash);
      if (tx != null && tx.bumpIndex == null)
        __privateMethod(this, _Beef_instances, tryMarkTxProvenByBump_fn).call(this, tx, b, bumpIndex);
    }
    return bumpIndex;
  };
  /**
   * Find an existing compatible bump or insert a new one; return its index.
   */
  findOrInsertBump_fn = function(bump) {
    const byHeight = __privateMethod(this, _Beef_instances, ensureBumpHeightIndex_fn).call(this);
    const byTxid = __privateMethod(this, _Beef_instances, ensureBumpTxidIndex_fn).call(this);
    const sameHeight = byHeight.get(bump.blockHeight) ?? [];
    if (sameHeight.length > 0) {
      const root = bump.computeRoot();
      for (const existing of sameHeight) {
        if (this.bumps[existing].computeRoot() !== root)
          continue;
        this.bumps[existing].combine(bump);
        indexBumpTxids(this.bumps[existing], existing, byTxid);
        return existing;
      }
    }
    this.bumps.push(bump);
    const index = this.bumps.length - 1;
    sameHeight.push(index);
    byHeight.set(bump.blockHeight, sameHeight);
    indexBumpTxids(bump, index, byTxid);
    return index;
  };
  /** If bump's level-0 path contains tx's txid, record the bumpIndex on tx. */
  tryMarkTxProvenByBump_fn = function(tx, b, bumpIndex) {
    const txid2 = tx.txid;
    for (const n of b.path[0]) {
      if (n.hash === txid2) {
        tx.bumpIndex = bumpIndex;
        n.txid = true;
        break;
      }
    }
  };
  /** Merge one raw transaction after the caller has synchronized and marked the BEEF. */
  mergeRawTxEntry_fn = function(rawTx, bumpIndex) {
    const newTx = new BeefTx(rawTx, bumpIndex);
    __privateMethod(this, _Beef_instances, replaceOrAppendTx_fn).call(this, newTx);
    __privateMethod(this, _Beef_instances, tryToValidateBumpIndex_fn).call(this, newTx);
    return newTx;
  };
  mergeTransactionEntry_fn = function(current) {
    const bumpIndex = current.merklePath == null ? void 0 : __privateMethod(this, _Beef_instances, mergeBumpEntry_fn).call(this, current.merklePath);
    const newTx = new BeefTx(current, bumpIndex);
    __privateMethod(this, _Beef_instances, replaceOrAppendTx_fn).call(this, newTx);
    __privateMethod(this, _Beef_instances, tryToValidateBumpIndex_fn).call(this, newTx);
    return newTx;
  };
  queueSourceTransactions_fn = function(current, stack) {
    for (let i = current.inputs.length - 1; i >= 0; i--) {
      const source = current.inputs[i].sourceTransaction;
      if (source != null)
        stack.push(source);
    }
  };
  /** Merge one transaction graph after the caller has synchronized and marked the BEEF. */
  mergeTransactionGraph_fn = function(tx) {
    tx.materializeSourceTXIDs();
    const rootTxid = tx.id("hex");
    const visited = /* @__PURE__ */ new Set();
    const stack = [tx];
    let root;
    while (stack.length > 0) {
      const current = stack.pop();
      if (current == null)
        continue;
      const txid2 = current.id("hex");
      if (visited.has(txid2))
        continue;
      visited.add(txid2);
      const newTx = __privateMethod(this, _Beef_instances, mergeTransactionEntry_fn).call(this, current);
      if (txid2 === rootTxid)
        root = newTx;
      if (newTx.bumpIndex === void 0)
        __privateMethod(this, _Beef_instances, queueSourceTransactions_fn).call(this, current, stack);
    }
    if (root == null)
      throw new Error("Failed to merge root transaction");
    return root;
  };
  /** Merge one BEEF transaction after the caller has synchronized and marked the BEEF. */
  mergeBeefTxEntry_fn = function(btx) {
    let beefTx = __privateMethod(this, _Beef_instances, findTxidIndexed_fn).call(this, btx.txid);
    if (btx.isTxidOnly && beefTx == null) {
      beefTx = BeefTx.fromTxid(btx.txid);
      this.txs.push(beefTx);
      __privateMethod(this, _Beef_instances, addToIndex_fn).call(this, beefTx);
      __privateMethod(this, _Beef_instances, tryToValidateBumpIndex_fn).call(this, beefTx);
    } else if (btx._tx != null && (beefTx == null || beefTx.isTxidOnly)) {
      beefTx = __privateMethod(this, _Beef_instances, mergeTransactionGraph_fn).call(this, btx._tx);
    } else if (btx._rawTx != null && (beefTx == null || beefTx.isTxidOnly)) {
      beefTx = __privateMethod(this, _Beef_instances, mergeRawTxEntry_fn).call(this, btx._rawTx);
    }
    if (beefTx == null) {
      throw new Error(`Failed to merge BeefTx for txid: ${btx.txid}`);
    }
    return beefTx;
  };
  hasDuplicateTxids_fn = function() {
    const seen = /* @__PURE__ */ new Set();
    for (const tx of this.txs) {
      if (seen.has(tx.txid))
        return true;
      seen.add(tx.txid);
    }
    return false;
  };
  /** Add txidOnly transaction txids; return false if not allowed. */
  collectTxidOnlyTxids_fn = function(txids, allowTxidOnly) {
    for (const tx of this.txs) {
      if (!tx.isTxidOnly)
        continue;
      if (allowTxidOnly !== true)
        return false;
      txids[tx.txid] = true;
    }
    return true;
  };
  /**
   * Record txids proven by bumps; validate all bump roots agree per block height.
   * Returns false if any root conflict is detected.
   */
  collectBumpTxids_fn = function(txids, r2) {
    for (const b of this.bumps) {
      for (const n of b.path[0]) {
        if (n.txid !== true || typeof n.hash !== "string" || n.hash.length === 0)
          continue;
        txids[n.hash] = true;
        if (!__privateMethod(this, _Beef_instances, confirmComputedRoot_fn).call(this, b, n.hash, r2))
          return false;
      }
    }
    return true;
  };
  /** Verify that every tx with a bumpIndex has a matching txid leaf in its bump. */
  verifyBumpIndexLeaves_fn = function() {
    for (const t of this.txs) {
      if (t.bumpIndex === void 0)
        continue;
      if (!Number.isSafeInteger(t.bumpIndex) || t.bumpIndex < 0 || t.bumpIndex >= this.bumps.length)
        return false;
      const leaf = this.bumps[t.bumpIndex]?.path[0]?.find((l) => l.hash === t.txid);
      if (leaf == null)
        return false;
    }
    return true;
  };
  /** Verify all input txids appear before the spending tx in sorted order. */
  verifyInputDependencies_fn = function(txids) {
    for (const t of this.txs) {
      for (const i of t.inputTxids) {
        if (!txids[i])
          return false;
      }
      txids[t.txid] = true;
    }
    return true;
  };
  /** Confirm the computed merkle root for txid in bump matches previously accepted root for that height. */
  confirmComputedRoot_fn = function(b, txid2, r2) {
    const root = b.computeRoot(txid2);
    if (r2.roots[b.blockHeight] === void 0 || r2.roots[b.blockHeight] === "") {
      r2.roots[b.blockHeight] = root;
    }
    return r2.roots[b.blockHeight] === root;
  };
  /**
   * Try to validate newTx.bumpIndex by looking for an existing bump
   * that proves newTx.txid
   *
   * @param newTx A new `BeefTx` that has been added to this.txs
   * @returns true if a bump was found, false otherwise
   */
  tryToValidateBumpIndex_fn = function(newTx) {
    if (newTx.bumpIndex !== void 0) {
      return true;
    }
    const txid2 = newTx.txid;
    const i = __privateMethod(this, _Beef_instances, ensureBumpTxidIndex_fn).call(this).get(txid2);
    if (i === void 0)
      return false;
    newTx.bumpIndex = i;
    const leaf = this.bumps[i].path[0].find((b) => b.hash === txid2);
    if (leaf != null)
      leaf.txid = true;
    return true;
  };
  captureSortTxState_fn = function() {
    __privateSet(this, _sortTxState, this.txs.map((tx) => ({
      ref: tx,
      txid: tx.txid,
      bumpIndex: tx.bumpIndex,
      isTxidOnly: tx.isTxidOnly,
      inputTxids: [...tx.inputTxids]
    })));
  };
  sortTxStateMatches_fn = function() {
    if (__privateGet(this, _sortTxState)?.length !== this.txs.length)
      return false;
    for (let index = 0; index < this.txs.length; index++) {
      const tx = this.txs[index];
      const state = __privateGet(this, _sortTxState)[index];
      if (state.ref !== tx || state.txid !== tx.txid || state.bumpIndex !== tx.bumpIndex || state.isTxidOnly !== tx.isTxidOnly || state.inputTxids.length !== tx.inputTxids.length)
        return false;
      for (let inputIndex = 0; inputIndex < tx.inputTxids.length; inputIndex++) {
        if (state.inputTxids[inputIndex] !== tx.inputTxids[inputIndex])
          return false;
      }
    }
    return true;
  };
  cloneSortResult_fn = function(result) {
    return {
      missingInputs: [...result.missingInputs],
      notValid: [...result.notValid],
      valid: [...result.valid],
      withMissingInputs: [...result.withMissingInputs],
      txidOnly: [...result.txidOnly]
    };
  };
  /**
   * Separate queue entries that have at least one input txid not present in txidToTx.
   */
  separateMissingInputs_fn = function(candidates, txidToTx) {
    const missingInputs = {};
    const txsMissingInputs = [];
    const remaining = [];
    for (const tx of candidates) {
      let hasMissingInput = false;
      for (const inputTxid of tx.inputTxids) {
        if (txidToTx[inputTxid] === void 0) {
          missingInputs[inputTxid] = true;
          hasMissingInput = true;
        }
      }
      if (hasMissingInput) {
        txsMissingInputs.push(tx);
      } else {
        remaining.push(tx);
      }
    }
    return { txsMissingInputs, missingInputs, remaining };
  };
  /**
   * Topologically sort queue into result; return anything that cannot be sorted.
   */
  topoSort_fn = function(queue, validTxids, result) {
    const { indegree, dependents, originalIndex, round } = __privateMethod(this, _Beef_instances, buildTopoSortGraph_fn).call(this, queue, validTxids);
    const processed = __privateMethod(this, _Beef_instances, processTopoSortQueue_fn).call(this, queue, indegree, dependents, originalIndex, round);
    __privateMethod(this, _Beef_instances, appendTopoSortResult_fn).call(this, queue, processed, round, validTxids, result);
    return queue.filter((tx) => !processed.has(tx.txid));
  };
  buildTopoSortGraph_fn = function(queue, validTxids) {
    const candidates = new Set(queue.map((tx) => tx.txid));
    const indegree = /* @__PURE__ */ new Map();
    const dependents = /* @__PURE__ */ new Map();
    const originalIndex = new Map(queue.map((tx, index) => [tx.txid, index]));
    const round = /* @__PURE__ */ new Map();
    for (const tx of queue) {
      let degree = 0;
      for (const inputTxid of tx.inputTxids) {
        if (validTxids[inputTxid])
          continue;
        degree++;
        if (candidates.has(inputTxid)) {
          const children = dependents.get(inputTxid) ?? [];
          children.push(tx);
          dependents.set(inputTxid, children);
        }
      }
      indegree.set(tx.txid, degree);
      round.set(tx.txid, 0);
    }
    return { indegree, dependents, originalIndex, round };
  };
  processTopoSortQueue_fn = function(queue, indegree, dependents, originalIndex, round) {
    const ready = queue.filter((tx) => indegree.get(tx.txid) === 0);
    const processed = /* @__PURE__ */ new Set();
    for (const tx of ready) {
      if (processed.has(tx.txid))
        continue;
      processed.add(tx.txid);
      for (const dependent of dependents.get(tx.txid) ?? []) {
        const nextRound = (round.get(tx.txid) ?? 0) + ((originalIndex.get(tx.txid) ?? 0) > (originalIndex.get(dependent.txid) ?? 0) ? 1 : 0);
        round.set(dependent.txid, Math.max(round.get(dependent.txid) ?? 0, nextRound));
        const next = (indegree.get(dependent.txid) ?? 0) - 1;
        indegree.set(dependent.txid, next);
        if (next === 0)
          ready.push(dependent);
      }
    }
    return processed;
  };
  appendTopoSortResult_fn = function(queue, processed, round, validTxids, result) {
    const byRound = [];
    for (const tx of queue) {
      if (!processed.has(tx.txid))
        continue;
      const txRound = round.get(tx.txid) ?? 0;
      const bucket = byRound[txRound] ?? [];
      bucket.push(tx);
      byRound[txRound] = bucket;
    }
    for (const bucket of byRound) {
      for (const tx of bucket ?? []) {
        validTxids[tx.txid] = true;
        result.push(tx);
      }
    }
  };
  /** Remove txidOnly entries that appear in knownTxids; return true if any were removed. */
  removeKnownTxidOnlyTxs_fn = function(knownTxids) {
    const originalLength = this.txs.length;
    this.txs = this.txs.filter((tx) => !(tx.isTxidOnly && knownTxids.has(tx.txid)));
    const mutated = this.txs.length !== originalLength;
    if (mutated)
      __privateMethod(this, _Beef_instances, rebuildTxIndexes_fn).call(this);
    return mutated;
  };
  /**
   * Remove bumps that are no longer referenced by any tx and update bumpIndex references.
   * Returns true if any bumps were removed.
   */
  reindexBumps_fn = function() {
    const referencedBumpIndices = /* @__PURE__ */ new Set();
    for (const tx of this.txs) {
      if (tx.bumpIndex !== void 0) {
        referencedBumpIndices.add(tx.bumpIndex);
      }
    }
    if (referencedBumpIndices.size >= this.bumps.length)
      return false;
    const indexMap = /* @__PURE__ */ new Map();
    let newIndex = 0;
    for (let i = 0; i < this.bumps.length; i++) {
      if (referencedBumpIndices.has(i)) {
        indexMap.set(i, newIndex);
        newIndex++;
      }
    }
    this.bumps = this.bumps.filter((_, i) => referencedBumpIndices.has(i));
    for (const tx of this.txs) {
      if (tx.bumpIndex === void 0)
        continue;
      const mapped = indexMap.get(tx.bumpIndex);
      if (mapped === void 0) {
        throw new Error(`Internal error: bumpIndex ${tx.bumpIndex} not found in indexMap`);
      }
      tx.bumpIndex = mapped;
    }
    __privateMethod(this, _Beef_instances, invalidateBumpIndexes_fn).call(this);
    return true;
  };
  /** Add any missing computable leaf at `row` derived from two known leaves at `row - 1`. */
  addComputedLeavesForRow_fn = function(bump, row) {
    const hashPair2 = (m) => toHex(hash256(toArray2(m, "hex").reverse()).reverse());
    for (const leafL of bump.path[row - 1]) {
      if (typeof leafL.hash !== "string" || (leafL.offset & 1) !== 0)
        continue;
      const leafR = bump.path[row - 1].find((l) => l.offset === leafL.offset + 1);
      if (leafR === void 0 || typeof leafR.hash !== "string")
        continue;
      const offsetOnRow = leafL.offset >> 1;
      if (bump.path[row].every((l) => l.offset !== offsetOnRow)) {
        bump.path[row].push({
          offset: offsetOnRow,
          // String concatenation puts the right leaf on the left of the left leaf hash
          hash: hashPair2(leafR.hash + leafL.hash)
        });
      }
    }
  };
  var Beef = _Beef;

  // node_modules/@bsv/sdk/dist/esm/src/wallet/completeBoundAction.js
  var MAX_ACTION_TRANSACTION_BYTES = 256 * 1024 * 1024;
  var MAX_SATOSHIS2 = 21e14;
  var MAX_ACTION_GRAPH_DEPTH = 64;
  var MAX_ACTION_GRAPH_NODES = 1e6;
  var arrayIsArray = Array.isArray;
  var ArrayConstructor = Array;
  var NumberConstructor = Number;
  var StringConstructor = String;
  var numberIsFinite = Number.isFinite;
  var numberIsInteger = Number.isInteger;
  var numberIsSafeInteger = Number.isSafeInteger;
  var objectIs = Object.is;
  var objectCreate = Object.create;
  var objectDefineProperty = Object.defineProperty;
  var objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var objectGetOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
  var objectGetPrototypeOf = Object.getPrototypeOf;
  var objectKeys = Object.keys;
  var reflectApply = Reflect.apply;
  var reflectOwnKeys = Reflect.ownKeys;
  var regexpExec = RegExp.prototype.exec;
  var regexpTest = RegExp.prototype.test;
  var stringToLowerCase = String.prototype.toLowerCase;
  var Uint8ArrayConstructor = Uint8Array;
  var Uint8ArrayPrototype = Uint8Array.prototype;
  var typedArrayPrototype = objectGetPrototypeOf(Uint8ArrayPrototype);
  var typedArrayBufferGetter = objectGetOwnPropertyDescriptor(typedArrayPrototype, "buffer")?.get;
  var typedArrayLengthGetter = objectGetOwnPropertyDescriptor(typedArrayPrototype, "length")?.get;
  var typedArrayTagGetter = objectGetOwnPropertyDescriptor(typedArrayPrototype, Symbol.toStringTag)?.get;
  var typedArraySet = Uint8ArrayPrototype.set;
  var sharedArrayBufferByteLengthGetter = typeof SharedArrayBuffer === "undefined" ? void 0 : objectGetOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength")?.get;
  var weakMapGet = WeakMap.prototype.get;
  var weakMapSet = WeakMap.prototype.set;
  var weakSetAdd = WeakSet.prototype.add;
  var weakSetDelete = WeakSet.prototype.delete;
  var weakSetHas = WeakSet.prototype.has;
  var ownedByteArrays = /* @__PURE__ */ new WeakSet();
  var scriptToHex = Script.prototype.toHex;
  var transactionFromAtomicBEEF;
  var transactionId;
  var transactionToAtomicBEEF;
  var canonicalArrayIndexPattern = /^(?:0|[1-9]\d*)$/;
  var canonicalOutpointPattern = /^([0-9a-f]{64})\.(0|[1-9]\d*)$/i;
  var canonicalBase64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  var evenHexPattern = /^(?:[0-9a-f]{2})*$/i;
  var txidPattern = /^[0-9a-f]{64}$/i;
  function captureSharedIntrinsicState() {
    const owners = [
      Array.prototype,
      Map.prototype,
      Set.prototype,
      WeakMap.prototype,
      WeakSet.prototype,
      Object,
      Object.prototype,
      Number,
      RegExp.prototype,
      String.prototype,
      Uint8ArrayPrototype,
      typedArrayPrototype
    ];
    const snapshots = new ArrayConstructor(owners.length);
    for (let ownerIndex = 0; ownerIndex < owners.length; ownerIndex++) {
      const owner = owners[ownerIndex];
      const keys = reflectOwnKeys(owner);
      const descriptors = new ArrayConstructor(keys.length);
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        descriptors[keyIndex] = objectGetOwnPropertyDescriptor(owner, keys[keyIndex]);
      }
      snapshots[ownerIndex] = { owner, keys, descriptors };
    }
    return snapshots;
  }
  function assertSharedIntrinsicsUnchanged(snapshots) {
    for (let ownerIndex = 0; ownerIndex < snapshots.length; ownerIndex++) {
      const snapshot = snapshots[ownerIndex];
      if (reflectOwnKeys(snapshot.owner).length !== snapshot.keys.length) {
        throw new Error("Wallet callback modified shared JavaScript intrinsics");
      }
      for (let keyIndex = 0; keyIndex < snapshot.keys.length; keyIndex++) {
        const expected = snapshot.descriptors[keyIndex];
        const actual = objectGetOwnPropertyDescriptor(snapshot.owner, snapshot.keys[keyIndex]);
        if (actual == null || actual.configurable !== expected.configurable || actual.enumerable !== expected.enumerable || actual.writable !== expected.writable || !objectIs(actual.value, expected.value) || actual.get !== expected.get || actual.set !== expected.set) {
          throw new Error(`Wallet callback modified shared JavaScript intrinsics (${ownerIndex}:${StringConstructor(snapshot.keys[keyIndex])})`);
        }
      }
    }
  }
  function hasOwn(value, key) {
    return objectGetOwnPropertyDescriptor(value, key) !== void 0;
  }
  function isSafeInteger(value) {
    return numberIsSafeInteger(value);
  }
  function matches(pattern, value) {
    return reflectApply(regexpTest, pattern, [value]);
  }
  function lower(value) {
    return reflectApply(stringToLowerCase, value, []);
  }
  function toHex2(script) {
    return reflectApply(scriptToHex, script, []);
  }
  function captureTransactionIntrinsics() {
    transactionFromAtomicBEEF ?? (transactionFromAtomicBEEF = Transaction.fromAtomicBEEF);
    transactionId ?? (transactionId = Transaction.prototype.id);
    transactionToAtomicBEEF ?? (transactionToAtomicBEEF = Transaction.prototype.toAtomicBEEF);
  }
  function parseAtomicBEEF(beef) {
    if (transactionFromAtomicBEEF == null)
      throw new Error("Transaction intrinsics are unavailable");
    return reflectApply(transactionFromAtomicBEEF, Transaction, [beef]);
  }
  function atomicBEEF(transaction) {
    if (transactionToAtomicBEEF == null)
      throw new Error("Transaction intrinsics are unavailable");
    return reflectApply(transactionToAtomicBEEF, transaction, [true]);
  }
  function transactionID(transaction) {
    if (transactionId == null)
      throw new Error("Transaction intrinsics are unavailable");
    return reflectApply(transactionId, transaction, ["hex"]);
  }
  function snapshotBudgetHas(budget, value) {
    return reflectApply(weakSetHas, budget.active, [value]);
  }
  function snapshotBudgetAdd(budget, value) {
    reflectApply(weakSetAdd, budget.active, [value]);
  }
  function snapshotBudgetDelete(budget, value) {
    reflectApply(weakSetDelete, budget.active, [value]);
  }
  function completedSnapshot(budget, value) {
    return reflectApply(weakMapGet, budget.completed, [value]);
  }
  function rememberSnapshot(budget, value, snapshot) {
    reflectApply(weakMapSet, budget.completed, [value, snapshot]);
  }
  function dataRecord(value, label, ignoreSymbolMetadata = false) {
    if (value == null || typeof value !== "object" || arrayIsArray(value)) {
      throw new Error(`${label} must be a plain data object`);
    }
    const prototype = objectGetPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error(`${label} must be a plain data object`);
    }
    const keys = reflectOwnKeys(value);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      const descriptor = objectGetOwnPropertyDescriptor(value, key);
      if (typeof key === "symbol" && ignoreSymbolMetadata) {
        if (descriptor == null || !("value" in descriptor)) {
          throw new Error(`${label} symbol metadata must be a data property`);
        }
        continue;
      }
      if (typeof key !== "string" || descriptor == null || !descriptor.enumerable || !("value" in descriptor)) {
        throw new Error(`${label} must contain only string-keyed data properties`);
      }
    }
    return value;
  }
  function snapshotDenseByteArray(value, label, remainingByteBudget = MAX_ACTION_TRANSACTION_BYTES) {
    if (objectGetPrototypeOf(value) !== Array.prototype) {
      throw new Error(`${label} must contain only dense data arrays`);
    }
    const lengthDescriptor = objectGetOwnPropertyDescriptor(value, "length");
    if (lengthDescriptor == null || !("value" in lengthDescriptor) || !isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
      throw new Error(`${label} must contain only dense data arrays`);
    }
    const length = lengthDescriptor.value;
    if (length > MAX_ACTION_TRANSACTION_BYTES) {
      throw new Error(`${label} exceeds the byte limit`);
    }
    const keys = reflectOwnKeys(value);
    if (keys.length !== length + 1) {
      throw new Error(`${label} must contain only dense data arrays`);
    }
    const exceedsAggregateBudget = length > remainingByteBudget;
    const snapshot = exceedsAggregateBudget ? void 0 : new ArrayConstructor(length);
    for (let index = 0; index < length; index++) {
      const descriptor = objectGetOwnPropertyDescriptor(value, StringConstructor(index));
      if (descriptor == null || !descriptor.enumerable || !("value" in descriptor)) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      if (!numberIsInteger(descriptor.value) || descriptor.value < 0 || descriptor.value > 255) {
        return void 0;
      }
      if (snapshot !== void 0)
        snapshot[index] = descriptor.value;
    }
    if (exceedsAggregateBudget)
      throw new Error(`${label} exceeds the aggregate byte limit`);
    return snapshot;
  }
  function snapshotUint8Array(value, label, remainingByteBudget = MAX_ACTION_TRANSACTION_BYTES) {
    if (typedArrayBufferGetter == null || typedArrayLengthGetter == null || typedArrayTagGetter == null) {
      return void 0;
    }
    let buffer;
    let length;
    let tag;
    try {
      buffer = reflectApply(typedArrayBufferGetter, value, []);
      length = reflectApply(typedArrayLengthGetter, value, []);
      tag = reflectApply(typedArrayTagGetter, value, []);
    } catch {
      return void 0;
    }
    if (tag !== "Uint8Array")
      return void 0;
    if (sharedArrayBufferByteLengthGetter != null) {
      let shared = false;
      try {
        reflectApply(sharedArrayBufferByteLengthGetter, buffer, []);
        shared = true;
      } catch {
      }
      if (shared)
        throw new Error(`${label} must not use shared byte storage`);
    }
    if (length > MAX_ACTION_TRANSACTION_BYTES) {
      throw new Error(`${label} exceeds the byte limit`);
    }
    if (length > remainingByteBudget) {
      throw new Error(`${label} exceeds the aggregate byte limit`);
    }
    const snapshot = new Uint8ArrayConstructor(length);
    try {
      reflectApply(typedArraySet, snapshot, [value]);
    } catch {
      throw new Error(`${label} must contain only intrinsic byte arrays`);
    }
    return snapshot;
  }
  function snapshotActionData(value, label, depth = 0, budget = {
    nodes: 0,
    active: /* @__PURE__ */ new WeakSet(),
    completed: /* @__PURE__ */ new WeakMap(),
    copiedBytes: 0
  }, ignoreSymbolMetadata = false) {
    if (depth > MAX_ACTION_GRAPH_DEPTH)
      throw new Error(`${label} exceeds the depth limit`);
    budget.nodes += 1;
    if (budget.nodes > MAX_ACTION_GRAPH_NODES)
      throw new Error(`${label} exceeds the node limit`);
    if (value === null || value === void 0 || typeof value === "string" || typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      if (!numberIsFinite(value) || objectIs(value, -0)) {
        throw new Error(`${label} contains an ambiguous number`);
      }
      return value;
    }
    if (typeof value !== "object")
      throw new Error(`${label} contains unsupported data`);
    if (snapshotBudgetHas(budget, value))
      throw new Error(`${label} contains a cycle`);
    const completed = completedSnapshot(budget, value);
    if (completed !== void 0)
      return completed;
    const byteView = snapshotUint8Array(value, label, MAX_ACTION_TRANSACTION_BYTES - budget.copiedBytes);
    if (byteView !== void 0) {
      budget.copiedBytes += byteView.length;
      reflectApply(weakSetAdd, ownedByteArrays, [byteView]);
      rememberSnapshot(budget, value, byteView);
      return byteView;
    }
    if (arrayIsArray(value)) {
      const byteSnapshot = snapshotDenseByteArray(value, label, MAX_ACTION_TRANSACTION_BYTES - budget.copiedBytes);
      if (byteSnapshot !== void 0) {
        budget.copiedBytes += byteSnapshot.length;
        reflectApply(weakSetAdd, ownedByteArrays, [byteSnapshot]);
        rememberSnapshot(budget, value, byteSnapshot);
        return byteSnapshot;
      }
      const lengthDescriptor = objectGetOwnPropertyDescriptor(value, "length");
      if (lengthDescriptor == null || !("value" in lengthDescriptor) || !isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      if (lengthDescriptor.value > MAX_ACTION_GRAPH_NODES) {
        throw new Error(`${label} exceeds the node limit`);
      }
    }
    snapshotBudgetAdd(budget, value);
    if (arrayIsArray(value)) {
      const descriptors2 = objectGetOwnPropertyDescriptors(value);
      const lengthDescriptor = descriptors2["length"];
      if (lengthDescriptor == null || !("value" in lengthDescriptor) || !isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0 || lengthDescriptor.value > MAX_ACTION_GRAPH_NODES) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      const length = lengthDescriptor.value;
      const descriptorKeys = reflectOwnKeys(descriptors2);
      if (descriptorKeys.length !== length + 1) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      for (let keyIndex = 0; keyIndex < descriptorKeys.length; keyIndex++) {
        const key = descriptorKeys[keyIndex];
        if (key === "length")
          continue;
        if (typeof key !== "string" || !matches(canonicalArrayIndexPattern, key) || NumberConstructor(key) >= length) {
          throw new Error(`${label} must contain only dense data arrays`);
        }
      }
      const out2 = new ArrayConstructor(length);
      for (let index = 0; index < length; index++) {
        const key = StringConstructor(index);
        const descriptor = descriptors2[key];
        if (descriptor == null || !descriptor.enumerable || !("value" in descriptor)) {
          throw new Error(`${label} must contain only dense data arrays`);
        }
        out2[index] = snapshotActionData(descriptor.value, `${label}[${index}]`, depth + 1, budget);
      }
      snapshotBudgetDelete(budget, value);
      rememberSnapshot(budget, value, out2);
      return out2;
    }
    const source = dataRecord(value, label, ignoreSymbolMetadata);
    if (snapshotBudgetHas(budget, source) && source !== value) {
      throw new Error(`${label} contains a cycle`);
    }
    const out = objectCreate(null);
    const descriptors = objectGetOwnPropertyDescriptors(source);
    const keys = objectKeys(descriptors);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      const descriptor = descriptors[key];
      if (!descriptor.enumerable || !("value" in descriptor)) {
        throw new Error(`${label} must contain only string-keyed data properties`);
      }
      objectDefineProperty(out, key, {
        value: snapshotActionData(descriptor.value, `${label}.${key}`, depth + 1, budget),
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    snapshotBudgetDelete(budget, value);
    rememberSnapshot(budget, value, out);
    return out;
  }
  function bytes2(value, label) {
    if (value != null && typeof value === "object") {
      const isOwned = reflectApply(weakSetHas, ownedByteArrays, [value]);
      if (isOwned && arrayIsArray(value)) {
        const length = objectGetOwnPropertyDescriptor(value, "length")?.value;
        if (typeof length !== "number" || length === 0) {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        return value;
      }
      if (isOwned && typedArrayLengthGetter != null) {
        let length;
        try {
          length = reflectApply(typedArrayLengthGetter, value, []);
        } catch {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        if (length === 0) {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        return value;
      }
      const byteView2 = snapshotUint8Array(value, label);
      if (byteView2 !== void 0) {
        if (byteView2.length === 0) {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        return byteView2;
      }
    }
    if (!arrayIsArray(value)) {
      throw new Error(`${label} must be a bounded non-empty byte array`);
    }
    const snapshot = snapshotDenseByteArray(value, label);
    if (snapshot == null || snapshot.length === 0) {
      throw new Error(`${label} must be a bounded non-empty byte array`);
    }
    const byteView = new Uint8ArrayConstructor(snapshot.length);
    for (let index = 0; index < snapshot.length; index++) {
      byteView[index] = snapshot[index];
    }
    return byteView;
  }
  function txid(value, label) {
    if (typeof value !== "string" || !matches(txidPattern, value)) {
      throw new Error(`${label} must be a 32-byte hexadecimal transaction ID`);
    }
    return lower(value);
  }
  function hex(value, label) {
    if (typeof value !== "string" || !matches(evenHexPattern, value)) {
      throw new Error(`${label} must be an even-length hexadecimal string`);
    }
    return lower(value);
  }
  function outpoint(value, label) {
    if (typeof value !== "string")
      throw new Error(`${label} must be a canonical outpoint`);
    const match = reflectApply(regexpExec, canonicalOutpointPattern, [
      value
    ]);
    if (match == null)
      throw new Error(`${label} must be a canonical outpoint`);
    const outputIndex = NumberConstructor(match[2]);
    if (!isSafeInteger(outputIndex) || outputIndex > 4294967295) {
      throw new Error(`${label} must be a canonical outpoint`);
    }
    return `${lower(match[1])}.${outputIndex}`;
  }
  function inputOutpoint(transaction, inputIndex) {
    const input = transaction.inputs[inputIndex];
    if (input == null || !isSafeInteger(input.sourceOutputIndex) || input.sourceOutputIndex < 0 || input.sourceOutputIndex > 4294967295) {
      throw new Error("Wallet transaction input is malformed");
    }
    const embeddedTxid = input.sourceTransaction == null ? void 0 : transactionID(input.sourceTransaction);
    if (input.sourceTXID !== void 0 && embeddedTxid !== void 0 && txid(input.sourceTXID, "Wallet input source TXID") !== txid(embeddedTxid, "Wallet input source transaction ID")) {
      throw new Error("Wallet transaction input source mismatch");
    }
    return `${txid(input.sourceTXID ?? embeddedTxid, "Wallet input source TXID")}.${input.sourceOutputIndex}`;
  }
  function satoshis(value, label) {
    if (typeof value !== "number" || !isSafeInteger(value) || value < 0 || value > MAX_SATOSHIS2) {
      throw new Error(`${label} must be a valid satoshi amount`);
    }
    return value;
  }
  function addSatoshis(total, value, label) {
    const next = total + value;
    if (!isSafeInteger(next) || next > MAX_SATOSHIS2) {
      throw new Error(`${label} exceeds the maximum transaction value`);
    }
    return next;
  }
  function inputSatoshis(transaction, inputIndex) {
    const input = transaction.inputs[inputIndex];
    const sourceOutput = input?.sourceTransaction?.outputs[input.sourceOutputIndex];
    if (sourceOutput == null) {
      throw new Error("Wallet signable transaction omitted an input source output");
    }
    return satoshis(sourceOutput.satoshis, `Wallet input ${inputIndex} source output`);
  }
  function bindRequestedAction(args, candidate, outputSatoshisRanges, trustedRequestedInputSatoshis) {
    if (candidate.version !== (args.version ?? 1)) {
      throw new Error("Wallet transaction substituted the requested version");
    }
    if (candidate.lockTime !== (args.lockTime ?? 0)) {
      throw new Error("Wallet transaction substituted the requested lock time");
    }
    const candidateOutpoints = new ArrayConstructor(candidate.inputs.length);
    const candidateOutpointSet = objectCreate(null);
    for (let index = 0; index < candidate.inputs.length; index++) {
      const candidateOutpoint = inputOutpoint(candidate, index);
      if (hasOwn(candidateOutpointSet, candidateOutpoint)) {
        throw new Error("Wallet transaction contains a duplicate input outpoint");
      }
      candidateOutpoints[index] = candidateOutpoint;
      candidateOutpointSet[candidateOutpoint] = true;
    }
    const indexes = [];
    const requestedOutpoints = objectCreate(null);
    for (let index = 0; index < (args.inputs?.length ?? 0); index++) {
      const requested = args.inputs[index];
      const requestedOutpoint = outpoint(requested.outpoint, `Requested input ${index} outpoint`);
      if (hasOwn(requestedOutpoints, requestedOutpoint)) {
        throw new Error("Action requests the same input outpoint more than once");
      }
      requestedOutpoints[requestedOutpoint] = true;
      let candidateIndex = -1;
      for (let index2 = 0; index2 < candidateOutpoints.length; index2++) {
        if (candidateOutpoints[index2] !== requestedOutpoint)
          continue;
        if (candidateIndex !== -1) {
          throw new Error("Wallet transaction does not contain each requested input exactly once");
        }
        candidateIndex = index2;
      }
      if (candidateIndex === -1) {
        throw new Error("Wallet transaction does not contain each requested input exactly once");
      }
      indexes[index] = candidateIndex;
      if ((candidate.inputs[candidateIndex].sequence ?? 4294967295) !== (requested.sequenceNumber ?? 4294967295)) {
        throw new Error("Wallet transaction substituted a requested input sequence");
      }
      const candidateUnlockingScript = candidate.inputs[candidateIndex].unlockingScript;
      if (requested.unlockingScript !== void 0 && (candidateUnlockingScript == null ? void 0 : lower(toHex2(candidateUnlockingScript))) !== hex(requested.unlockingScript, `Requested input ${index} unlocking script`)) {
        throw new Error("Wallet transaction substituted a requested unlocking script");
      }
    }
    const candidateOutputs = new ArrayConstructor(candidate.outputs.length);
    for (let index = 0; index < candidate.outputs.length; index++) {
      const output = candidate.outputs[index];
      candidateOutputs[index] = {
        satoshis: satoshis(output.satoshis, `Wallet output ${index}`),
        lockingScript: lower(toHex2(output.lockingScript))
      };
    }
    const matchedCandidateOutputs = new ArrayConstructor(candidateOutputs.length);
    const preserveOutputOrder = args.options?.randomizeOutputs === false;
    let requestedOutputValue = 0;
    const matchRequestedOutput = (index, range) => {
      const output = args.outputs[index];
      const lockingScript = hex(output.lockingScript, `Requested output ${index} locking script`);
      const requestedSatoshis = satoshis(output.satoshis, `Requested output ${index}`);
      if (preserveOutputOrder) {
        const candidateOutput = candidateOutputs[index];
        const amountMatches = candidateOutput != null && (range == null ? candidateOutput.satoshis === requestedSatoshis : candidateOutput.satoshis >= range.minimumSatoshis && candidateOutput.satoshis <= range.maximumSatoshis);
        if (candidateOutput == null || candidateOutput.lockingScript !== lockingScript || !amountMatches) {
          throw new Error("Wallet transaction substituted a requested output position");
        }
        matchedCandidateOutputs[index] = true;
        requestedOutputValue = addSatoshis(requestedOutputValue, candidateOutput.satoshis, "Requested output value");
        return;
      }
      let matchedIndex = -1;
      for (let candidateIndex = 0; candidateIndex < candidateOutputs.length; candidateIndex++) {
        const candidateOutput = candidateOutputs[candidateIndex];
        if (matchedCandidateOutputs[candidateIndex] === true || candidateOutput.lockingScript !== lockingScript)
          continue;
        const amountMatches = range == null ? candidateOutput.satoshis === requestedSatoshis : candidateOutput.satoshis >= range.minimumSatoshis && candidateOutput.satoshis <= range.maximumSatoshis;
        if (!amountMatches)
          continue;
        if (range == null) {
          matchedIndex = candidateIndex;
          break;
        }
        if (matchedIndex !== -1) {
          throw new Error("Wallet transaction omitted or substituted a requested output");
        }
        matchedIndex = candidateIndex;
      }
      if (matchedIndex === -1) {
        throw new Error("Wallet transaction omitted or substituted a requested output");
      }
      matchedCandidateOutputs[matchedIndex] = true;
      requestedOutputValue = addSatoshis(requestedOutputValue, candidateOutputs[matchedIndex].satoshis, "Requested output value");
    };
    for (let index = 0; index < (args.outputs?.length ?? 0); index++) {
      if (outputSatoshisRanges[index] === void 0)
        matchRequestedOutput(index);
    }
    for (let index = 0; index < (args.outputs?.length ?? 0); index++) {
      const range = outputSatoshisRanges[index];
      if (range != null)
        matchRequestedOutput(index, range);
    }
    let explicitInputValue = 0;
    const explicitInputIndexes = new ArrayConstructor(candidate.inputs.length);
    for (let requestedIndex = 0; requestedIndex < indexes.length; requestedIndex++) {
      const inputIndex = indexes[requestedIndex];
      explicitInputIndexes[inputIndex] = true;
      explicitInputValue = addSatoshis(explicitInputValue, trustedRequestedInputSatoshis?.[requestedIndex] ?? inputSatoshis(candidate, inputIndex), "Requested input value");
    }
    let walletInputValue = 0;
    for (let inputIndex = 0; inputIndex < candidate.inputs.length; inputIndex++) {
      if (explicitInputIndexes[inputIndex] === true)
        continue;
      walletInputValue = addSatoshis(walletInputValue, inputSatoshis(candidate, inputIndex), "Wallet-added input value");
    }
    let candidateOutputValue = 0;
    for (let index = 0; index < candidateOutputs.length; index++) {
      candidateOutputValue = addSatoshis(candidateOutputValue, candidateOutputs[index].satoshis, "Wallet output value");
    }
    const candidateInputValue = addSatoshis(explicitInputValue, walletInputValue, "Wallet input value");
    if (candidateOutputValue > candidateInputValue) {
      throw new Error("Wallet signable transaction spends more than its inputs");
    }
    const additionalOutputValue = candidateOutputValue - requestedOutputValue;
    if (additionalOutputValue > walletInputValue) {
      throw new Error("Wallet used a requested input to fund an unrequested output");
    }
    return indexes;
  }
  function assertSameTemplate(signable, signed) {
    if (signable.version !== signed.version || signable.lockTime !== signed.lockTime || signable.inputs.length !== signed.inputs.length || signable.outputs.length !== signed.outputs.length) {
      throw new Error("Wallet signed transaction substituted the authorized template");
    }
    for (let index = 0; index < signable.inputs.length; index++) {
      if (inputOutpoint(signable, index) !== inputOutpoint(signed, index) || (signable.inputs[index].sequence ?? 4294967295) !== (signed.inputs[index].sequence ?? 4294967295)) {
        throw new Error("Wallet signed transaction substituted an authorized input");
      }
    }
    for (let index = 0; index < signable.outputs.length; index++) {
      if (signable.outputs[index].satoshis !== signed.outputs[index].satoshis || toHex2(signable.outputs[index].lockingScript) !== toHex2(signed.outputs[index].lockingScript)) {
        throw new Error("Wallet signed transaction substituted an authorized output");
      }
    }
  }
  async function abortBestEffort(wallet, reference, originator) {
    try {
      await wallet.abortAction({ reference }, originator);
    } catch {
    }
  }
  async function completeBoundAction(wallet, createArgs, options = {}, originator, trustedRequestedInputSatoshis) {
    captureTransactionIntrinsics();
    const sharedIntrinsicState = captureSharedIntrinsicState();
    const authorizedArgs = snapshotActionData(createArgs, "Create action arguments");
    const walletArgs = snapshotActionData(authorizedArgs, "Create action arguments");
    const requestedInputs = authorizedArgs.inputs ?? [];
    let ownedTrustedRequestedInputSatoshis;
    if (trustedRequestedInputSatoshis !== void 0) {
      const snapshot = snapshotActionData(trustedRequestedInputSatoshis, "Trusted requested input satoshis");
      if (!arrayIsArray(snapshot) || snapshot.length !== requestedInputs.length) {
        throw new Error("Trusted requested input satoshis must match the requested inputs");
      }
      const amounts = new ArrayConstructor(snapshot.length);
      for (let index = 0; index < snapshot.length; index++) {
        amounts[index] = satoshis(snapshot[index], `Trusted requested input ${index}`);
      }
      ownedTrustedRequestedInputSatoshis = amounts;
    }
    const boundOptions = dataRecord(options, "Bound action options");
    const boundOptionKeys = objectKeys(boundOptions);
    for (let keyIndex = 0; keyIndex < boundOptionKeys.length; keyIndex++) {
      const key = boundOptionKeys[keyIndex];
      if (key !== "inputSigners" && key !== "outputSatoshisRanges") {
        throw new Error(`Unknown bound action option "${key}"`);
      }
    }
    const inputSignersValue = objectGetOwnPropertyDescriptor(boundOptions, "inputSigners")?.value;
    const inputSigners = dataRecord(inputSignersValue ?? {}, "Input signers");
    const normalizedSigners = objectCreate(null);
    let normalizedSignerCount = 0;
    const inputSignerKeys = objectKeys(inputSigners);
    for (let keyIndex = 0; keyIndex < inputSignerKeys.length; keyIndex++) {
      const key = inputSignerKeys[keyIndex];
      const signer = objectGetOwnPropertyDescriptor(inputSigners, key)?.value;
      const normalized = outpoint(key, "Input signer outpoint");
      if (hasOwn(normalizedSigners, normalized) || typeof signer !== "function") {
        throw new Error("Input signers must uniquely identify requested outpoints");
      }
      normalizedSigners[normalized] = signer;
      normalizedSignerCount++;
    }
    const rangeValue = objectGetOwnPropertyDescriptor(boundOptions, "outputSatoshisRanges")?.value;
    const ranges = dataRecord(rangeValue ?? {}, "Output satoshi ranges");
    const normalizedRanges = new ArrayConstructor(authorizedArgs.outputs?.length ?? 0);
    const rangeKeys = objectKeys(ranges);
    for (let keyIndex = 0; keyIndex < rangeKeys.length; keyIndex++) {
      const key = rangeKeys[keyIndex];
      const value = objectGetOwnPropertyDescriptor(ranges, key)?.value;
      if (!matches(canonicalArrayIndexPattern, key)) {
        throw new Error("Output satoshi ranges must identify requested output indexes");
      }
      const index = NumberConstructor(key);
      if (!isSafeInteger(index) || index >= (authorizedArgs.outputs?.length ?? 0)) {
        throw new Error("Output satoshi ranges must identify requested output indexes");
      }
      const range = dataRecord(value, `Output satoshi range ${index}`);
      const outputRangeKeys = objectKeys(range);
      for (let rangeKeyIndex = 0; rangeKeyIndex < outputRangeKeys.length; rangeKeyIndex++) {
        const rangeKey = outputRangeKeys[rangeKeyIndex];
        if (rangeKey !== "minimumSatoshis" && rangeKey !== "maximumSatoshis") {
          throw new Error(`Unknown output satoshi range option "${rangeKey}"`);
        }
      }
      const minimumSatoshis = satoshis(objectGetOwnPropertyDescriptor(range, "minimumSatoshis")?.value, `Output satoshi range ${index} minimum`);
      const maximumSatoshis = satoshis(objectGetOwnPropertyDescriptor(range, "maximumSatoshis")?.value, `Output satoshi range ${index} maximum`);
      if (minimumSatoshis > maximumSatoshis) {
        throw new Error(`Output satoshi range ${index} minimum exceeds its maximum`);
      }
      normalizedRanges[index] = { minimumSatoshis, maximumSatoshis };
    }
    const rawCreateResult = await wallet.createAction({
      ...walletArgs,
      options: {
        ...walletArgs.options,
        signAndProcess: false,
        returnTXIDOnly: false
      }
    }, originator);
    assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
    const createResult = dataRecord(snapshotActionData(rawCreateResult, "Wallet createAction result", 0, void 0, true), "Wallet createAction result", true);
    assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
    const signable = dataRecord(objectGetOwnPropertyDescriptor(createResult, "signableTransaction")?.value, "Wallet signable transaction");
    const reference = objectGetOwnPropertyDescriptor(signable, "reference")?.value;
    if (typeof reference !== "string" || reference.length === 0 || reference.length > 4096 || !matches(canonicalBase64Pattern, reference)) {
      throw new Error("Wallet signable transaction reference is invalid");
    }
    try {
      const partial = parseAtomicBEEF(bytes2(objectGetOwnPropertyDescriptor(signable, "tx")?.value, "Wallet signable transaction"));
      const boundInputIndexes = bindRequestedAction(authorizedArgs, partial, normalizedRanges, ownedTrustedRequestedInputSatoshis);
      const authorizedPartial = parseAtomicBEEF(atomicBEEF(partial));
      const spends = {};
      const expectedScripts = new ArrayConstructor(partial.inputs.length);
      const expectedScriptIndexes = new ArrayConstructor();
      const usedSigners = objectCreate(null);
      let usedSignerCount = 0;
      for (let index = 0; index < requestedInputs.length; index++) {
        const requested = requestedInputs[index];
        const requestedOutpoint = outpoint(requested.outpoint, `Requested input ${index} outpoint`);
        const inputIndex = boundInputIndexes[index];
        if (requested.unlockingScript !== void 0) {
          expectedScripts[inputIndex] = hex(requested.unlockingScript, `Requested input ${index} unlocking script`);
          expectedScriptIndexes[expectedScriptIndexes.length] = inputIndex;
          continue;
        }
        const signer = objectGetOwnPropertyDescriptor(normalizedSigners, requestedOutpoint)?.value;
        if (requested.unlockingScriptLength === void 0 || signer == null) {
          throw new Error(`Requested input ${index} has no authorized signer`);
        }
        const signed2 = await signer(partial, inputIndex);
        assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
        assertSameTemplate(authorizedPartial, partial);
        const unlockingScript = hex(typeof signed2 === "string" ? signed2 : toHex2(signed2), `Requested input ${index} signed unlocking script`);
        spends[inputIndex] = { unlockingScript };
        expectedScripts[inputIndex] = unlockingScript;
        expectedScriptIndexes[expectedScriptIndexes.length] = inputIndex;
        if (!hasOwn(usedSigners, requestedOutpoint)) {
          usedSigners[requestedOutpoint] = true;
          usedSignerCount++;
        }
      }
      if (usedSignerCount !== normalizedSignerCount) {
        throw new Error("An input signer does not match a requested signable input");
      }
      const signOptions = {
        acceptDelayedBroadcast: authorizedArgs.options?.acceptDelayedBroadcast,
        returnTXIDOnly: false,
        noSend: authorizedArgs.options?.noSend,
        sendWith: authorizedArgs.options?.sendWith
      };
      const rawSignResult = await wallet.signAction({ reference, spends, options: signOptions }, originator);
      assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
      const signResult = dataRecord(snapshotActionData(rawSignResult, "Wallet signAction result", 0, void 0, true), "Wallet signAction result", true);
      assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
      const signed = parseAtomicBEEF(bytes2(objectGetOwnPropertyDescriptor(signResult, "tx")?.value, "Wallet signed transaction"));
      assertSameTemplate(partial, signed);
      for (let index = 0; index < expectedScriptIndexes.length; index++) {
        const inputIndex = expectedScriptIndexes[index];
        const expected = expectedScripts[inputIndex];
        const unlockingScript = signed.inputs[inputIndex]?.unlockingScript;
        if (unlockingScript == null || lower(toHex2(unlockingScript)) !== expected) {
          throw new Error("Wallet signed transaction substituted an authorized unlocking script");
        }
      }
      const signedTxid = objectGetOwnPropertyDescriptor(signResult, "txid")?.value;
      if (signedTxid !== void 0 && txid(signedTxid, "Wallet signed transaction ID") !== lower(transactionID(signed))) {
        throw new Error("Wallet signed transaction ID does not match its transaction data");
      }
      return signed;
    } catch (error) {
      await abortBestEffort(wallet, reference, originator);
      throw error;
    }
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/TransactionEvidence.js
  var TransactionEvidenceError = class extends Error {
    constructor(code) {
      super(`Transaction evidence: ${code}`);
      __publicField(this, "code");
      this.code = code;
      this.name = "TransactionEvidenceError";
    }
  };
  var defaultTransactionEvidenceLimits = Object.freeze({
    candidateBytes: 1024 * 1024,
    retainedBytes: 16 * 1024 * 1024,
    transactions: 256,
    inputs: 4096,
    scriptBytes: 256 * 1024,
    scriptMemoryBytes: 16 * 1024 * 1024,
    candidatesPerTransaction: 8,
    pendingTransactions: 32,
    concurrentTransactions: 4,
    pendingChainCalls: 8,
    consumers: 128,
    cacheEntries: 128,
    cacheAgeMs: 6e4,
    attemptTimeoutMs: 5e3,
    requestTimeoutMs: 15e3
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/EvidenceScriptWork.js
  function binding(params) {
    const tx = params.tx;
    const sources = tx.inputs.map((input) => {
      const source = input.sourceTransaction;
      const output = source?.outputs[input.sourceOutputIndex];
      if (source === void 0 || output === void 0)
        throw new TransactionEvidenceError("invalid-evidence");
      return [
        source.id("hex"),
        input.sourceOutputIndex,
        output.satoshis,
        output.lockingScript.toHex()
      ];
    });
    return toHex(sha256(toArray2(JSON.stringify([
      tx.toHex(),
      sources,
      params.blockHeight,
      params.consensus,
      params.verifyFlags,
      params.memoryLimit
    ]), "utf8")));
  }
  var scopes = /* @__PURE__ */ new WeakMap();
  function evidenceScriptScope(tx) {
    return scopes.get(tx);
  }
  function scopedScriptBackend(scope, backend) {
    return {
      supportsMemoryLimit: backend.supportsMemoryLimit,
      shouldVerifyScripts: backend.shouldVerifyScripts === void 0 ? void 0 : (params) => {
        scope.check();
        const key = binding(params);
        const ready = backend.shouldVerifyScripts(params);
        scope.check();
        if (binding(params) !== key)
          throw new TransactionEvidenceError("invalid-evidence");
        return ready;
      },
      verifyScripts: async (params) => (await scope.work.batch(scope, [params], backend))[0],
      verifyScriptsBatch: async (params) => await scope.work.batch(scope, params, backend)
    };
  }

  // node_modules/@bsv/sdk/dist/esm/src/transaction/Transaction.js
  var serializedBytes2 = Symbol();
  var knownId = Symbol();
  function transactionSerializationIdentity(transaction) {
    return transaction[serializedBytes2]();
  }
  function cacheKnownTransactionId(transaction, txid2) {
    transaction[knownId](txid2);
  }
  var POST_CHRONICLE_HEIGHT_FALLBACK = 943816;
  var MAX_SATOSHIS3 = 21e14;
  var MAX_EF_SOURCE_OUTPUT_INDEX = 1e6;
  function requireSatoshiAmount(value, label) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > MAX_SATOSHIS3) {
      throw new RangeError(`${label} must be a non-negative safe integer no greater than 21e14.`);
    }
    return value;
  }
  function addSatoshiAmount(total, value, label) {
    const sum = total + value;
    if (!Number.isSafeInteger(sum) || sum > MAX_SATOSHIS3) {
      throw new RangeError(`${label} exceeds the maximum valid monetary range.`);
    }
    return sum;
  }
  function requireUInt322(value, label) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 4294967295) {
      throw new RangeError(`${label} must be an unsigned 32-bit integer.`);
    }
    return value;
  }
  function requireTXID(value, label) {
    if (typeof value !== "string" || !/^[0-9a-fA-F]{64}$/.test(value)) {
      throw new TypeError(`${label} must be a 32-byte hexadecimal transaction ID.`);
    }
    return value.toLowerCase();
  }
  function equalBytes(left, right) {
    if (left === void 0 || right === void 0)
      return left === right;
    if (left.length !== right.length)
      return false;
    for (let index = 0; index < left.length; index++) {
      if (left[index] !== right[index])
        return false;
    }
    return true;
  }
  var _cachedHash, _cachedIdHex, _rawBytesCache3, _efBytesCache, _hexCache3, _activeSignatureHashCache, _rawCacheState, _Transaction_instances, completeSourceTransaction_fn, scheduleSourceTransactions_fn, _Transaction_static, fromAnyBeef_fn, fromReaderInternal_fn, invalidateSerializationCaches_fn3, sourceTransactionId_fn, captureSerializationState_fn2, serializationCacheMatchesState_fn2, calculateChange_fn, distributeChange_fn, distributeRandomChange_fn, distributeEqualChange_fn, benfordNumber_fn, writeTransactionBody_fn, buildSerializedBytes_fn, getSerializedBytes_fn3, writeEF_fn, getEFBytes_fn, completeVerificationFromMerklePath_fn, validateUnminedTransactionStructure_fn, queueSourceTransactionForVerification_fn, verifyTransactionInputs_fn, totalVerifiedOutputs_fn, verifyQueuedScripts_fn, isTransactionAlreadyVerified_fn, snapshotTransactionGraph_fn, signingStateMatches_fn, verifyUnminedTransaction_fn, verifySnapshot_fn, collectBEEFTransactions_fn, appendBEEFTransaction_fn, scheduleBEEFTransaction_fn, getBEEFPathIndex_fn, reserveBEEFWriter_fn, buildWalletActionArgs_fn, buildWalletInputArg_fn;
  var _Transaction = class _Transaction {
    constructor(version = 1, inputs = [], outputs = [], lockTime = 0, metadata = /* @__PURE__ */ new Map(), merklePath) {
      __privateAdd(this, _Transaction_instances);
      __publicField(this, "version");
      __publicField(this, "inputs");
      __publicField(this, "outputs");
      __publicField(this, "lockTime");
      __publicField(this, "metadata");
      __publicField(this, "merklePath");
      __privateAdd(this, _cachedHash);
      __privateAdd(this, _cachedIdHex);
      __privateAdd(this, _rawBytesCache3);
      __privateAdd(this, _efBytesCache);
      __privateAdd(this, _hexCache3);
      __privateAdd(this, _activeSignatureHashCache);
      __privateAdd(this, _rawCacheState);
      this.version = version;
      this.inputs = inputs;
      this.outputs = outputs;
      this.lockTime = lockTime;
      this.metadata = metadata;
      this.merklePath = merklePath;
    }
    /**
     * Returns the transaction-wide signature hash cache active during signing.
     * Callers outside a signing operation receive an isolated cache.
     *
     * @internal
     */
    getSignatureHashCache() {
      return __privateGet(this, _activeSignatureHashCache) ?? { hashOutputsSingle: /* @__PURE__ */ new Map() };
    }
    /**
     * Iteratively materializes source transaction IDs so deep spend chains do not
     * recurse through `hash()` while serializing their parents.
     */
    materializeSourceTXIDs() {
      const complete = /* @__PURE__ */ new Set();
      const visiting = /* @__PURE__ */ new Set();
      const stack = [{ tx: this, expanded: false }];
      while (stack.length > 0) {
        const frame = stack.pop();
        if (frame == null)
          continue;
        if (complete.has(frame.tx))
          continue;
        if (frame.expanded) {
          __privateMethod(this, _Transaction_instances, completeSourceTransaction_fn).call(this, frame.tx, visiting, complete);
          continue;
        }
        __privateMethod(this, _Transaction_instances, scheduleSourceTransactions_fn).call(this, frame.tx, visiting, complete, stack);
      }
    }
    /**
     * Creates a new transaction, linked to its inputs and their associated merkle paths, from a BEEF V1, V2 or Atomic.
     * Optionally, you can provide a specific TXID to retrieve a particular transaction from the BEEF data.
     * If the TXID is provided but not found in the BEEF data, an error will be thrown.
     * If no TXID is provided, the last transaction in the BEEF data is returned, or the atomic txid.
     * @param beef A binary representation of transactions in BEEF format.
     * @param txid Optional TXID of the transaction to retrieve from the BEEF data.
     * @returns An anchored transaction, linked to its associated inputs populated with merkle paths.
     */
    static fromBEEF(beef, txid2) {
      var _a;
      const { tx } = __privateMethod(_a = _Transaction, _Transaction_static, fromAnyBeef_fn).call(_a, beef, txid2);
      return tx;
    }
    /**
     * Zero-copy variant of {@link fromBEEF}. The caller must not mutate `beef`.
     */
    static fromBEEFView(beef, txid2) {
      var _a;
      const { tx } = __privateMethod(_a = _Transaction, _Transaction_static, fromAnyBeef_fn).call(_a, beef, txid2, true);
      return tx;
    }
    /**
     * Creates a new transaction from an Atomic BEEF (BRC-95) structure.
     * Extracts the subject transaction and supporting merkle path and source transactions contained in the BEEF data
     *
     * @param beef A binary representation of an Atomic BEEF structure.
     * @returns The subject transaction, linked to its associated inputs populated with merkle paths.
     */
    static fromAtomicBEEF(beef) {
      var _a;
      const { tx, txid: txid2, beef: b } = __privateMethod(_a = _Transaction, _Transaction_static, fromAnyBeef_fn).call(_a, beef);
      if (txid2 !== b.atomicTxid) {
        if (b.atomicTxid == null) {
          throw new Error("beef must conform to BRC-95 and must contain the subject txid.");
        } else {
          throw new Error(`Transaction with TXID ${b.atomicTxid} not found in BEEF data.`);
        }
      }
      if (!b.isAtomic(txid2))
        throw new Error("Atomic BEEF contains unrelated transaction data.");
      return tx;
    }
    /**
     * Zero-copy variant of {@link fromAtomicBEEF}. The caller must not mutate
     * `beef` while any linked transaction remains in use.
     */
    static fromAtomicBEEFView(beef) {
      var _a;
      const { tx, txid: txid2, beef: b } = __privateMethod(_a = _Transaction, _Transaction_static, fromAnyBeef_fn).call(_a, beef, void 0, true);
      if (txid2 !== b.atomicTxid) {
        if (b.atomicTxid == null)
          throw new Error("beef must conform to BRC-95 and must contain the subject txid.");
        throw new Error(`Transaction with TXID ${b.atomicTxid} not found in BEEF data.`);
      }
      if (!b.isAtomic(txid2))
        throw new Error("Atomic BEEF contains unrelated transaction data.");
      return tx;
    }
    /**
     * Creates a new transaction, linked to its inputs and their associated merkle paths, from a EF (BRC-30) structure.
     *
     * EF source descriptors contain only a claimed source TXID, locking script,
     * and amount. They do not authenticate the complete source transaction or
     * prove that the described output exists or remains spendable. In an
     * adversarial environment the recipient must already be familiar with the
     * source information or independently verify it through trusted full
     * transaction and chain-state evidence before signing or authorizing value.
     * @param ef A binary representation of a transaction in EF format.
     * @returns An extended transaction, linked to its associated inputs by locking script and satoshis amounts only.
     */
    static fromEF(ef) {
      const br = ReaderUint8Array.makeReader(ef);
      const version = br.readUInt32LE();
      if (toHex(br.read(6)) !== "0000000000ef") {
        throw new Error("Invalid EF marker");
      }
      const inputsLength = br.readVarIntNumStrict(false);
      const inputs = [];
      for (let i = 0; i < inputsLength; i++) {
        const sourceTXID = toHex(br.readReverse(32));
        const sourceOutputIndex = br.readUInt32LE();
        if (sourceOutputIndex > MAX_EF_SOURCE_OUTPUT_INDEX) {
          throw new RangeError("EF source output index exceeds the allocation limit");
        }
        const scriptLength = br.readVarIntNumStrict(false);
        const scriptBin = br.read(scriptLength);
        const unlockingScript = UnlockingScript.fromBinary(scriptBin);
        const sequence = br.readUInt32LE();
        const satoshis2 = br.readUInt64LEBn().toNumber();
        const lockingScriptLength = br.readVarIntNumStrict(false);
        const lockingScriptBin = br.read(lockingScriptLength);
        const lockingScript = LockingScript.fromBinary(lockingScriptBin);
        const sourceTransaction = new _Transaction(void 0, [], [], void 0);
        sourceTransaction.outputs = Array.from({ length: sourceOutputIndex + 1 }).fill(null);
        sourceTransaction.outputs[sourceOutputIndex] = {
          satoshis: satoshis2,
          lockingScript
        };
        inputs.push({
          sourceTransaction,
          sourceTXID,
          sourceOutputIndex,
          unlockingScript,
          sequence
        });
      }
      const outputsLength = br.readVarIntNumStrict(false);
      const outputs = [];
      for (let i = 0; i < outputsLength; i++) {
        const satoshis2 = br.readUInt64LEBn().toNumber();
        const scriptLength = br.readVarIntNumStrict(false);
        const scriptBin = br.read(scriptLength);
        const lockingScript = LockingScript.fromBinary(scriptBin);
        outputs.push({
          satoshis: satoshis2,
          lockingScript
        });
      }
      const lockTime = br.readUInt32LE();
      if (!br.eof())
        throw new Error("Serialized EF transaction contains trailing data");
      return new _Transaction(version, inputs, outputs, lockTime);
    }
    /**
     * Since the validation of blockchain data is atomically transaction data validation,
     * any application seeking to validate data in output scripts must store the entire transaction as well.
     * Since the transaction data includes the output script data, saving a second copy of potentially
     * large scripts can bloat application storage requirements.
     *
     * This function efficiently parses binary transaction data to determine the offsets and lengths of each script.
     * This supports the efficient retreival of script data from transaction data.
     *
     * @param bin binary transaction data
     * @returns {
     *   inputs: { vin: number, offset: number, length: number }[]
     *   outputs: { vout: number, offset: number, length: number }[]
     * }
     */
    static parseScriptOffsets(bin) {
      const br = ReaderUint8Array.makeReader(bin);
      const inputs = [];
      const outputs = [];
      br.read(4);
      const inputsLength = br.readVarIntNumStrict(false);
      for (let i = 0; i < inputsLength; i++) {
        br.read(36);
        const scriptLength = br.readVarIntNumStrict(false);
        inputs.push({ vin: i, offset: br.pos, length: scriptLength });
        br.read(scriptLength + 4);
      }
      const outputsLength = br.readVarIntNumStrict(false);
      for (let i = 0; i < outputsLength; i++) {
        br.read(8);
        const scriptLength = br.readVarIntNumStrict(false);
        outputs.push({ vout: i, offset: br.pos, length: scriptLength });
        br.read(scriptLength);
      }
      br.read(4);
      if (!br.eof())
        throw new Error("Serialized transaction contains trailing data");
      return { inputs, outputs };
    }
    static fromReader(br) {
      var _a;
      return __privateMethod(_a = _Transaction, _Transaction_static, fromReaderInternal_fn).call(_a, br, false);
    }
    /**
     * Creates a Transaction instance from a binary array.
     *
     * @static
     * @param {number[]} bin - The binary array representation of the transaction.
     * @returns {Transaction} - A new Transaction instance.
     */
    static fromBinary(bin) {
      const rawBytes = Uint8Array.from(bin);
      return _Transaction.fromBinaryView(rawBytes);
    }
    /**
     * Parses a transaction while retaining zero-copy views over `bin` for the raw
     * transaction and its scripts. The caller must not mutate `bin`.
     */
    static fromBinaryView(bin) {
      var _a, _b;
      const br = new ReaderUint8Array(bin);
      const tx = __privateMethod(_a = _Transaction, _Transaction_static, fromReaderInternal_fn).call(_a, br, true);
      if (!br.eof())
        throw new Error("Serialized transaction contains trailing data");
      __privateSet(tx, _rawBytesCache3, bin);
      __privateMethod(_b = tx, _Transaction_instances, captureSerializationState_fn2).call(_b);
      return tx;
    }
    /**
     * Creates a Transaction instance from a hexadecimal string.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the transaction.
     * @returns {Transaction} - A new Transaction instance.
     */
    static fromHex(hex2) {
      const rawBytes = toUint8Array(hex2, "hex");
      const tx = _Transaction.fromBinaryView(rawBytes);
      __privateSet(tx, _hexCache3, toHex(rawBytes));
      return tx;
    }
    /**
     * Creates a Transaction instance from a hexadecimal string encoded EF.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the transaction EF.
     * @returns {Transaction} - A new Transaction instance.
     */
    static fromHexEF(hex2) {
      return _Transaction.fromEF(toUint8Array(hex2, "hex"));
    }
    /**
     * Creates a Transaction instance from a hexadecimal string encoded BEEF.
     * Optionally, you can provide a specific TXID to retrieve a particular transaction from the BEEF data.
     * If the TXID is provided but not found in the BEEF data, an error will be thrown.
     * If no TXID is provided, the last transaction in the BEEF data is returned.
     *
     * @static
     * @param {string} hex - The hexadecimal string representation of the transaction BEEF.
     * @param {string} [txid] - Optional TXID of the transaction to retrieve from the BEEF data.
     * @returns {Transaction} - A new Transaction instance.
     */
    static fromHexBEEF(hex2, txid2) {
      return _Transaction.fromBEEF(toArray2(hex2, "hex"), txid2);
    }
    /**
     * Adds a new input to the transaction.
     *
     * @param {TransactionInput} input - The TransactionInput object to add to the transaction.
     * @throws {Error} - If the input does not have a sourceTXID or sourceTransaction defined.
     */
    addInput(input) {
      if (input.sourceTXID === void 0 && input.sourceTransaction === void 0) {
        throw new TypeError("A reference to an an input transaction is required. If the input transaction itself cannot be referenced, its TXID must still be provided.");
      }
      requireUInt322(input.sourceOutputIndex, "sourceOutputIndex");
      if (input.sourceTXID !== void 0)
        input.sourceTXID = requireTXID(input.sourceTXID, "sourceTXID");
      if (input.sequence !== void 0)
        requireUInt322(input.sequence, "sequence");
      input.sequence ?? (input.sequence = 4294967295);
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
      this.inputs.push(input);
    }
    /**
     * Adds a new output to the transaction.
     *
     * @param {TransactionOutput} output - The TransactionOutput object to add to the transaction.
     */
    addOutput(output) {
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
      if (output.satoshis === void 0 && output.change !== true) {
        throw new TypeError("either satoshis must be defined or change must be set to true");
      }
      if (output.satoshis !== void 0)
        requireSatoshiAmount(output.satoshis, "satoshis");
      if (output.lockingScript == null)
        throw new Error("lockingScript must be defined");
      this.outputs.push(output);
    }
    /**
     * Adds a new P2PKH output to the transaction.
     *
     * @param {number[] | string} address - The P2PKH address of the output.
     * @param {number} [satoshis] - The number of satoshis to send to the address - if not provided, the output is considered a change output.
     *
     */
    addP2PKHOutput(address, satoshis2) {
      const lockingScript = new P2PKH().lock(address);
      if (satoshis2 === void 0) {
        return this.addOutput({ lockingScript, change: true });
      }
      this.addOutput({
        lockingScript,
        satoshis: satoshis2
      });
    }
    /**
     * Updates the transaction's metadata.
     *
     * @param {Record<string, any>} metadata - The metadata object to merge into the existing metadata.
     */
    updateMetadata(metadata) {
      this.metadata = {
        ...this.metadata,
        ...metadata
      };
    }
    /**
     * Computes fees prior to signing.
     * If no fee model is provided, uses a LivePolicy fee model that fetches current rates from ARC.
     * If fee is a number, the transaction uses that value as fee.
     *
     * @param modelOrFee - The initialized fee model to use or fixed fee for the transaction
     * @param changeDistribution - Specifies how the change should be distributed
     * amongst the change outputs
     *
     */
    async fee(modelOrFee = LivePolicy.getInstance(), changeDistribution = "equal") {
      var _a, _b, _c, _d, _e;
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
      if (changeDistribution !== "equal" && changeDistribution !== "random") {
        throw new TypeError('changeDistribution must be either "equal" or "random".');
      }
      if (typeof modelOrFee === "number") {
        const sats = modelOrFee;
        modelOrFee = {
          computeFee: async () => sats
        };
      }
      const baseline = __privateMethod(this, _Transaction_instances, snapshotTransactionGraph_fn).call(this, true);
      const result = __privateMethod(_a = baseline, _Transaction_instances, snapshotTransactionGraph_fn).call(_a, true);
      const modelTransaction = __privateMethod(_b = baseline, _Transaction_instances, snapshotTransactionGraph_fn).call(_b, true);
      const inputRefs = [...this.inputs];
      const sourceRefs = this.inputs.map((input) => input.sourceTransaction);
      const templateRefs = this.inputs.map((input) => input.unlockingScriptTemplate);
      const outputRefs = [...this.outputs];
      const modelInputRefs = [...modelTransaction.inputs];
      const modelSourceRefs = modelTransaction.inputs.map((input) => input.sourceTransaction);
      const modelTemplateRefs = modelTransaction.inputs.map((input) => input.unlockingScriptTemplate);
      const modelOutputRefs = [...modelTransaction.outputs];
      const fee = requireSatoshiAmount(await modelOrFee.computeFee(modelTransaction), "Computed transaction fee");
      if (!__privateMethod(_c = modelTransaction, _Transaction_instances, signingStateMatches_fn).call(_c, baseline, modelInputRefs, modelSourceRefs, modelTemplateRefs, modelOutputRefs)) {
        throw new Error("Fee model mutated its transaction snapshot");
      }
      const change = __privateMethod(_d = result, _Transaction_instances, calculateChange_fn).call(_d, fee);
      if (change < 0) {
        throw new RangeError("Transaction inputs are insufficient for the requested outputs and fee.");
      }
      if (!__privateMethod(this, _Transaction_instances, signingStateMatches_fn).call(this, baseline, inputRefs, sourceRefs, templateRefs, outputRefs)) {
        throw new Error("Transaction changed while computing its fee; no change was applied");
      }
      if (change === 0) {
        this.outputs = outputRefs.filter((output) => output.change !== true);
        __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
        return;
      }
      __privateMethod(_e = result, _Transaction_instances, distributeChange_fn).call(_e, change, changeDistribution);
      for (let index = 0; index < outputRefs.length; index++) {
        if (outputRefs[index].change === true) {
          outputRefs[index].satoshis = result.outputs[index].satoshis;
        }
      }
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
    }
    /**
     * Utility method that returns the current fee based on inputs and outputs
     *
     * @returns The current transaction fee
     */
    getFee() {
      let totalIn = 0;
      for (let index = 0; index < this.inputs.length; index++) {
        const input = this.inputs[index];
        if (typeof input.sourceTransaction !== "object") {
          throw new TypeError("Source transactions or sourceSatoshis are required for all inputs to calculate fee");
        }
        requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
        const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex];
        if (sourceOutput == null) {
          throw new RangeError(`Input ${index} references a source output that does not exist.`);
        }
        totalIn = addSatoshiAmount(totalIn, requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`), "Transaction input total");
      }
      let totalOut = 0;
      for (let index = 0; index < this.outputs.length; index++) {
        totalOut = addSatoshiAmount(totalOut, requireSatoshiAmount(this.outputs[index].satoshis, `Output ${index} amount`), "Transaction output total");
      }
      return totalIn - totalOut;
    }
    /**
     * Signs a transaction, hydrating all its unlocking scripts based on the provided script templates where they are available.
     * @param options - Signing behavior. Set `skipExistingSignatures` to preserve inputs that already have an unlocking script.
     */
    async sign(options = {}) {
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
      for (let index = 0; index < this.outputs.length; index++) {
        const out = this.outputs[index];
        if (out.satoshis === void 0) {
          if (out.change === true) {
            throw new Error("There are still change outputs with uncomputed amounts. Use the fee() method to compute the change amounts and transaction fees prior to signing.");
          } else {
            throw new Error("One or more transaction outputs is missing an amount. Ensure all output amounts are provided before signing.");
          }
        }
        requireSatoshiAmount(out.satoshis, `Output ${index} amount`);
      }
      __privateMethod(this, _Transaction_instances, totalVerifiedOutputs_fn).call(this, this);
      for (let index = 0; index < this.inputs.length; index++) {
        const input = this.inputs[index];
        requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
        requireUInt322(input.sequence ?? 4294967295, `Input ${index} sequence`);
        if (input.sourceTXID !== void 0) {
          requireTXID(input.sourceTXID, `Input ${index} sourceTXID`);
        }
        if (input.sourceTransaction !== void 0) {
          const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex];
          if (sourceOutput == null) {
            throw new RangeError(`Input ${index} references a source output that does not exist.`);
          }
          requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`);
          if (input.sourceTXID !== void 0 && (input.sourceTransaction.inputs.length > 0 || input.sourceTransaction.merklePath != null) && requireTXID(input.sourceTXID, `Input ${index} sourceTXID`) !== input.sourceTransaction.id("hex")) {
            throw new Error(`Input ${index} sourceTXID does not reference its supplied source transaction.`);
          }
        }
      }
      this.materializeSourceTXIDs();
      const signingSnapshot = __privateMethod(this, _Transaction_instances, snapshotTransactionGraph_fn).call(this, true);
      const inputRefs = [...this.inputs];
      const sourceRefs = this.inputs.map((input) => input.sourceTransaction);
      const templateRefs = this.inputs.map((input) => input.unlockingScriptTemplate);
      const outputRefs = [...this.outputs];
      const skipExistingSignatures = options.skipExistingSignatures === true;
      let unlockingScripts;
      unlockingScripts = await Promise.all(signingSnapshot.inputs.map(async (input, index) => {
        var _a;
        if (skipExistingSignatures && input.unlockingScript != null) {
          return new UnlockingScript([], Uint8Array.from(input.unlockingScript.toUint8Array()), void 0, false);
        }
        const template = templateRefs[index];
        if (template === void 0)
          return void 0;
        const templateTransaction = __privateMethod(_a = signingSnapshot, _Transaction_instances, snapshotTransactionGraph_fn).call(_a, true);
        for (let templateIndex = 0; templateIndex < templateRefs.length; templateIndex++) {
          templateTransaction.inputs[templateIndex].unlockingScriptTemplate = templateRefs[templateIndex];
        }
        __privateSet(templateTransaction, _activeSignatureHashCache, { hashOutputsSingle: /* @__PURE__ */ new Map() });
        const returned = await template.sign(templateTransaction, index);
        if (returned == null || typeof returned.toUint8Array !== "function") {
          throw new TypeError(`Input ${index} signing template returned an invalid unlocking script`);
        }
        const bytes3 = returned.toUint8Array();
        if (!(bytes3 instanceof Uint8Array)) {
          throw new TypeError(`Input ${index} signing template returned an invalid unlocking script`);
        }
        return new UnlockingScript([], Uint8Array.from(bytes3), void 0, false);
      }));
      if (!__privateMethod(this, _Transaction_instances, signingStateMatches_fn).call(this, signingSnapshot, inputRefs, sourceRefs, templateRefs, outputRefs)) {
        throw new Error("Transaction changed while signing; no unlocking scripts were applied");
      }
      for (let i = 0, l = this.inputs.length; i < l; i++) {
        if (templateRefs[i] !== void 0 && !(skipExistingSignatures && inputRefs[i].unlockingScript != null)) {
          this.inputs[i].unlockingScript = unlockingScripts[i];
        }
      }
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
    }
    /**
     * Broadcasts a transaction.
     *
     * @param broadcaster The Broadcaster instance wwhere the transaction will be sent
     * @returns A BroadcastResponse or BroadcastFailure from the Broadcaster
     */
    async broadcast(broadcaster = defaultBroadcaster()) {
      const snapshot = __privateMethod(this, _Transaction_instances, snapshotTransactionGraph_fn).call(this);
      const expectedTxid = snapshot.id("hex");
      return validateBroadcastResult(await broadcaster.broadcast(snapshot), expectedTxid);
    }
    [serializedBytes2]() {
      return __privateMethod(this, _Transaction_instances, getSerializedBytes_fn3).call(this);
    }
    [knownId](txid2) {
      __privateSet(this, _cachedIdHex, txid2);
    }
    /**
     * Converts the transaction to a binary array format.
     *
     * @returns {number[]} - The binary array representation of the transaction.
     */
    toBinary() {
      return Array.from(__privateMethod(this, _Transaction_instances, getSerializedBytes_fn3).call(this));
    }
    toUint8Array() {
      return Uint8Array.from(__privateMethod(this, _Transaction_instances, getSerializedBytes_fn3).call(this));
    }
    /**
     * Converts the transaction to a BRC-30 EF format.
     *
     * @returns {number[]} - The BRC-30 EF representation of the transaction.
     */
    toEF() {
      return Array.from(__privateMethod(this, _Transaction_instances, getEFBytes_fn).call(this));
    }
    /**
     * Converts the transaction to a BRC-30 EF format.
     *
     * @remarks This is an alias for {@link toEFBinary}. The returned view is
     * copied from the internal memoized representation for caller isolation.
     *
     * @returns {Uint8Array} - The BRC-30 EF representation of the transaction.
     */
    toEFUint8Array() {
      return this.toEFBinary();
    }
    /**
     * Converts the transaction to an independently owned BRC-30 EF byte array.
     *
     * @remarks Each call returns an independently mutable copy. Internal
     * serialization remains memoized until transaction state changes.
     *
     * @returns {Uint8Array} The cached BRC-30 EF representation.
     */
    toEFBinary() {
      return Uint8Array.from(__privateMethod(this, _Transaction_instances, getEFBytes_fn).call(this));
    }
    /**
     * Converts the transaction to a hexadecimal string EF.
     *
     * @returns {string} - The hexadecimal string representation of the transaction EF.
     */
    toHexEF() {
      return toHex(this.toEFBinary());
    }
    /**
     * Converts the transaction to a hexadecimal string format.
     *
     * @returns {string} - The hexadecimal string representation of the transaction.
     */
    toHex() {
      const bytes3 = __privateMethod(this, _Transaction_instances, getSerializedBytes_fn3).call(this);
      if (__privateGet(this, _hexCache3) != null)
        return __privateGet(this, _hexCache3);
      const hex2 = toHex(bytes3);
      __privateSet(this, _hexCache3, hex2);
      return hex2;
    }
    /**
     * Converts the transaction to a hexadecimal string BEEF.
     *
     * @returns {string} - The hexadecimal string representation of the transaction BEEF.
     */
    toHexBEEF() {
      return toHex(this.toBEEF());
    }
    /**
     * Converts the transaction to a hexadecimal string Atomic BEEF.
     *
     * @returns {string} - The hexadecimal string representation of the transaction Atomic BEEF.
     */
    toHexAtomicBEEF() {
      return toHex(this.toAtomicBEEF());
    }
    /**
     * Calculates the transaction's hash.
     *
     * @param {'hex' | undefined} enc - The encoding to use for the hash. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
     * @returns {string | number[]} - The hash of the transaction in the specified format.
     */
    hash(enc) {
      const bytes3 = __privateMethod(this, _Transaction_instances, getSerializedBytes_fn3).call(this);
      __privateGet(this, _cachedHash) ?? __privateSet(this, _cachedHash, hash256(bytes3));
      if (enc === "hex") {
        return toHex(__privateGet(this, _cachedHash));
      }
      return Array.from(__privateGet(this, _cachedHash));
    }
    /**
     * Calculates the transaction's ID.
     *
     * @param {'hex' | undefined} enc - The encoding to use for the ID. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
     * @returns {string | number[]} - The ID of the transaction in the specified format.
     */
    id(enc) {
      __privateMethod(this, _Transaction_instances, getSerializedBytes_fn3).call(this);
      if (enc === "hex" && __privateGet(this, _cachedIdHex) != null)
        return __privateGet(this, _cachedIdHex);
      const id = [...this.hash()];
      id.reverse();
      if (enc === "hex") {
        __privateSet(this, _cachedIdHex, toHex(id));
        return __privateGet(this, _cachedIdHex);
      }
      return id;
    }
    async verifyTransactionFee(tx, feeModel, getTxid) {
      if (feeModel === void 0)
        return;
      if (tx === void 0)
        throw new Error("Transaction is undefined");
      const copy = _Transaction.fromEF(tx.toEF());
      delete copy.outputs[0].satoshis;
      copy.outputs[0].change = true;
      await copy.fee(feeModel);
      if (tx.getFee() < copy.getFee()) {
        throw new Error(`Verification failed because the transaction ${getTxid()} has an insufficient fee and has not been mined.`);
      }
    }
    /**
     * Verifies the legitimacy of the Bitcoin transaction according to the rules of SPV by ensuring all the input transactions link back to valid block headers, the chain of spends for all inputs are valid, and the sum of inputs is not less than the sum of outputs.
     *
     * @param chainTracker - An instance of ChainTracker, a Bitcoin block header tracker. If the value is set to 'scripts only', headers will not be verified. If not provided then the default chain tracker will be used.
     * @param feeModel - An instance of FeeModel, a fee model to use for fee calculation. If not provided then the default fee model will be used.
     * @param memoryLimit - Optional caller-supplied local script-interpreter
     * memory budget. If omitted, post-Genesis validation does not impose an
     * arbitrary SDK memory cap.
     * @param verifier - An optional asynchronous script backend. Adaptive backends may decline before execution to preserve the JavaScript path.
     *
     * @returns Whether the transaction is valid according to the rules of SPV.
     *
     * @example tx.verify(new WhatsOnChain(), LivePolicy.getInstance())
     */
    async verify(chainTracker = defaultChainTracker(), feeModel, memoryLimit, verifier) {
      var _a;
      if (chainTracker !== "scripts only")
        this.materializeSourceTXIDs();
      const scriptWork = chainTracker === "scripts only" ? void 0 : evidenceScriptScope(this);
      return await __privateMethod(_a = __privateMethod(this, _Transaction_instances, snapshotTransactionGraph_fn).call(this), _Transaction_instances, verifySnapshot_fn).call(_a, chainTracker, feeModel, memoryLimit, verifier, scriptWork);
    }
    /**
     * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
     *
     * @param writer The writer to serialize to
     * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
     *
     * @returns The serialized BEEF structure
     * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
     */
    writeSerializedBEEF(writer, allowPartial) {
      this.materializeSourceTXIDs();
      writer.writeUInt32LE(BEEF_V1);
      const { bumps, txs } = __privateMethod(this, _Transaction_instances, collectBEEFTransactions_fn).call(this, allowPartial);
      writer.writeVarIntNum(bumps.length);
      const bumpBytes = __privateMethod(this, _Transaction_instances, reserveBEEFWriter_fn).call(this, writer, bumps, txs);
      for (let i = 0; i < bumps.length; i++) {
        writer.write(bumpBytes?.[i] ?? bumps[i].toBinary());
      }
      writer.writeVarIntNum(txs.length);
      for (const item of txs) {
        writer.write(item.tx.toUint8Array());
        if (typeof item.pathIndex === "number") {
          writer.writeUInt8(1);
          writer.writeVarIntNum(item.pathIndex);
        } else {
          writer.writeUInt8(0);
        }
      }
    }
    /**
     * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
     *
     * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
     *
     * @returns {number[]} The serialized BEEF structure
     * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
     */
    toBEEF(allowPartial) {
      const writer = new Writer();
      this.writeSerializedBEEF(writer, allowPartial);
      return writer.toArray();
    }
    /**
     * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
     *
     * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
     *
     * @returns {number[]} The serialized BEEF structure
     * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
     * @deprecated This historical method returns a legacy `number[]` at runtime
     * despite its declared type. Use {@link toBEEFBytes} for a real Uint8Array.
     */
    toBEEFUint8Array(allowPartial) {
      const writer = new WriterUint8Array();
      this.writeSerializedBEEF(writer, allowPartial);
      return writer.toArray();
    }
    /**
     * Serializes BEEF to a real typed byte array.
     *
     * @remarks This replaces the historical `toBEEFUint8Array` method, whose
     * runtime value is a legacy `number[]` despite its declared return type.
     */
    toBEEFBytes(allowPartial) {
      const writer = new WriterUint8Array();
      this.writeSerializedBEEF(writer, allowPartial);
      return writer.toUint8Array();
    }
    /**
     * Serializes this transaction and its inputs into the Atomic BEEF (BRC-95) format.
     * The Atomic BEEF format starts with a 4-byte prefix `0x01010101`, followed by the TXID of the subject transaction,
     * and then the BEEF data containing only the subject transaction and its dependencies.
     * This format ensures that the BEEF structure is atomic and contains no unrelated transactions.
     *
     * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
     *
     * @returns {number[]} - The serialized Atomic BEEF structure.
     * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
     */
    toAtomicBEEF(allowPartial) {
      this.materializeSourceTXIDs();
      const prefix = [1, 1, 1, 1];
      const txHash = this.hash();
      const beefData = this.toBEEF(allowPartial);
      return prefix.concat(txHash, beefData);
    }
    /**
     * Serializes this transaction and its inputs into the Atomic BEEF (BRC-95) format.
     * The Atomic BEEF format starts with a 4-byte prefix `0x01010101`, followed by the TXID of the subject transaction,
     * and then the BEEF data containing only the subject transaction and its dependencies.
     * This format ensures that the BEEF structure is atomic and contains no unrelated transactions.
     *
     * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
     *
     * @returns {number[]} - The serialized Atomic BEEF structure.
     * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
     */
    toAtomicBEEFUint8Array(allowPartial) {
      this.materializeSourceTXIDs();
      const writer = new WriterUint8Array();
      const prefix = [1, 1, 1, 1];
      writer.write(prefix);
      const txHash = this.hash();
      writer.write(txHash);
      this.writeSerializedBEEF(writer, allowPartial);
      return writer.toUint8Array();
    }
    /**
     * Completes the transaction using a wallet interface, which will handle
     * signing and transaction finalization. This method converts the current
     * transaction into a format that can be processed by the wallet, and then
     * updates this transaction object with the result from the wallet.
     *
     * @param {WalletInterface} wallet - The BRC-100 compliant wallet to use for completing the transaction
     * @param {string} [actionDescription] - Optional description for the action
     * @param {string} [originator] - Optional originator domain name
     * @param {CreateActionOptions} [options] - Optional settings for transaction creation (e.g., acceptDelayedBroadcast, trustSelf, noSend, etc.)
     * @returns {Promise<void>}
     */
    async completeWithWallet(wallet, actionDescription, originator, options) {
      const inputCount = this.inputs.length;
      const outputCount = this.outputs.length;
      const description = actionDescription ?? `Transaction with ${inputCount} input(s) and ${outputCount} output(s)`;
      const hasTemplates = this.inputs.some((input) => input.unlockingScriptTemplate != null);
      const actionArgs = await __privateMethod(this, _Transaction_instances, buildWalletActionArgs_fn).call(this, description, hasTemplates);
      actionArgs.options = options;
      const inputSigners = {};
      for (let index = 0; index < this.inputs.length; index++) {
        const template = this.inputs[index].unlockingScriptTemplate;
        if (template == null)
          continue;
        const outpoint2 = actionArgs.inputs[index].outpoint;
        inputSigners[outpoint2] = async (transaction, inputIndex) => await template.sign(transaction, inputIndex);
      }
      const newTransaction = await completeBoundAction(wallet, actionArgs, { inputSigners }, originator, this.inputs.map((input, index) => {
        const sourceOutput = input.sourceTransaction?.outputs[input.sourceOutputIndex];
        if (sourceOutput == null) {
          throw new Error(`Input ${index} references a source output that does not exist`);
        }
        return requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`);
      }));
      this.version = newTransaction.version;
      this.inputs = newTransaction.inputs;
      this.outputs = newTransaction.outputs;
      this.lockTime = newTransaction.lockTime;
      this.merklePath = newTransaction.merklePath;
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
      this.metadata = {
        ...this.metadata,
        ...newTransaction.metadata
      };
    }
    /**
     * Returns the formatted preimage of a transaction for the requested input index, signature scope (default SIGHASH_FORKID | SIGHASH_ALL), and optional subscript.
     * @param inputIndex - The index of the input to generate the preimage for
     * @param signatureScope - The signature scope to use for the preimage
     * @param subscript - The subscript to use for the preimage (optional)
     * @returns The formatted preimage
     */
    preimage(inputIndex, signatureScope, subscript) {
      inputIndex ?? (inputIndex = 0);
      signatureScope ?? (signatureScope = TransactionSignature.SIGHASH_FORKID | TransactionSignature.SIGHASH_ALL);
      if (!Number.isSafeInteger(inputIndex) || inputIndex < 0 || inputIndex >= this.inputs.length) {
        throw new Error("Invalid input index");
      }
      requireUInt322(signatureScope, "signatureScope");
      const flags = signatureScope & 240;
      if (flags !== 224 && flags !== 192 && flags !== 64) {
        throw new Error("FORKID must be set");
      }
      const coverage = signatureScope & 15;
      if (coverage < 1 || coverage > 3) {
        throw new Error("Invalid signature coverage, must be all, none or single");
      }
      const input = this.inputs[inputIndex];
      const sourceOutputIndex = requireUInt322(input.sourceOutputIndex, "sourceOutputIndex");
      if (input.sourceTransaction == null) {
        throw new Error("Source transaction is required");
      }
      const embeddedSourceTXID = requireTXID(input.sourceTransaction.id("hex"), "sourceTransaction ID");
      if (input.sourceTXID !== void 0 && requireTXID(input.sourceTXID, "sourceTXID") !== embeddedSourceTXID) {
        throw new Error("sourceTXID does not match sourceTransaction");
      }
      const output = input.sourceTransaction.outputs[sourceOutputIndex];
      if (output == null) {
        throw new Error(`Source transaction's output at index ${sourceOutputIndex} is required`);
      }
      const sourceSatoshis = requireSatoshiAmount(output.satoshis, "Source output amount");
      const inputSequence = requireUInt322(input.sequence ?? 4294967295, "inputSequence");
      const resolvedSubscript = subscript ?? output.lockingScript;
      if (resolvedSubscript == null || typeof resolvedSubscript.toUint8Array !== "function") {
        throw new Error("subscript must be a locking script");
      }
      return TransactionSignature.format({
        sourceTXID: embeddedSourceTXID,
        sourceOutputIndex,
        sourceSatoshis,
        transactionVersion: this.version,
        otherInputs: [],
        allInputs: this.inputs,
        inputIndex,
        outputs: this.outputs,
        inputSequence,
        subscript: resolvedSubscript,
        lockTime: this.lockTime,
        scope: signatureScope
      });
    }
  };
  _cachedHash = new WeakMap();
  _cachedIdHex = new WeakMap();
  _rawBytesCache3 = new WeakMap();
  _efBytesCache = new WeakMap();
  _hexCache3 = new WeakMap();
  _activeSignatureHashCache = new WeakMap();
  _rawCacheState = new WeakMap();
  _Transaction_instances = new WeakSet();
  completeSourceTransaction_fn = function(tx, visiting, complete) {
    for (const input of tx.inputs) {
      if (input.sourceTXID == null && input.sourceTransaction != null) {
        input.sourceTXID = input.sourceTransaction.id("hex");
      }
    }
    visiting.delete(tx);
    complete.add(tx);
  };
  scheduleSourceTransactions_fn = function(tx, visiting, complete, stack) {
    if (visiting.has(tx)) {
      throw new Error("Cyclic source transaction graph");
    }
    visiting.add(tx);
    stack.push({ tx, expanded: true });
    for (let i = tx.inputs.length - 1; i >= 0; i--) {
      const source = tx.inputs[i].sourceTransaction;
      if (tx.inputs[i].sourceTXID == null && source != null && !complete.has(source)) {
        stack.push({ tx: source, expanded: false });
      }
    }
  };
  _Transaction_static = new WeakSet();
  fromAnyBeef_fn = function(beef, txid2, zeroCopy = false) {
    const b = zeroCopy && beef instanceof Uint8Array ? Beef.fromBinaryView(beef) : Beef.fromBinaryStrict(beef);
    if (b.txs.length < 1) {
      throw new Error("beef must include at least one transaction.");
    }
    const lastTx = b.txs.at(-1);
    if (lastTx == null) {
      throw new Error("beef must include at least one transaction.");
    }
    const target = txid2 ?? b.atomicTxid ?? lastTx.txid;
    const tx = b.findAtomicTransaction(target);
    if (tx == null) {
      if (txid2 == null) {
        throw new Error("beef does not contain transaction for atomic txid.");
      } else {
        throw new Error(`Transaction with TXID ${String(target)} not found in BEEF data.`);
      }
    }
    return { tx, beef: b, txid: target };
  };
  fromReaderInternal_fn = function(br, zeroCopyScripts) {
    const version = br.readUInt32LE();
    const inputsLength = br.readVarIntNumStrict(false);
    const inputs = [];
    for (let i = 0; i < inputsLength; i++) {
      const sourceTXID = toHex(br.readReverse(32));
      const sourceOutputIndex = br.readUInt32LE();
      const scriptLength = br.readVarIntNumStrict(false);
      const scriptBin = zeroCopyScripts && br instanceof ReaderUint8Array ? br.readView(scriptLength) : br.read(scriptLength);
      const unlockingScript = zeroCopyScripts && scriptBin instanceof Uint8Array ? UnlockingScript.fromBinaryView(scriptBin) : UnlockingScript.fromBinary(scriptBin);
      const sequence = br.readUInt32LE();
      inputs.push({
        sourceTXID,
        sourceOutputIndex,
        unlockingScript,
        sequence
      });
    }
    const outputsLength = br.readVarIntNumStrict(false);
    const outputs = [];
    for (let i = 0; i < outputsLength; i++) {
      const satoshis2 = br.readUInt64LEBn().toNumber();
      const scriptLength = br.readVarIntNumStrict(false);
      const scriptBin = zeroCopyScripts && br instanceof ReaderUint8Array ? br.readView(scriptLength) : br.read(scriptLength);
      const lockingScript = zeroCopyScripts && scriptBin instanceof Uint8Array ? LockingScript.fromBinaryView(scriptBin) : LockingScript.fromBinary(scriptBin);
      outputs.push({
        satoshis: satoshis2,
        lockingScript
      });
    }
    const lockTime = br.readUInt32LE();
    return new _Transaction(version, inputs, outputs, lockTime);
  };
  invalidateSerializationCaches_fn3 = function() {
    __privateSet(this, _cachedHash, void 0);
    __privateSet(this, _cachedIdHex, void 0);
    __privateSet(this, _rawBytesCache3, void 0);
    __privateSet(this, _efBytesCache, void 0);
    __privateSet(this, _hexCache3, void 0);
    __privateSet(this, _rawCacheState, void 0);
  };
  sourceTransactionId_fn = function(input) {
    return input.sourceTXID == null ? input.sourceTransaction?.id("hex") : void 0;
  };
  captureSerializationState_fn2 = function() {
    __privateSet(this, _rawCacheState, {
      version: this.version,
      lockTime: this.lockTime,
      inputs: this.inputs.map((ref) => {
        const sourceOutput = ref.sourceTransaction?.outputs[ref.sourceOutputIndex];
        return {
          ref,
          sourceTXID: ref.sourceTXID,
          sourceTransactionId: __privateMethod(this, _Transaction_instances, sourceTransactionId_fn).call(this, ref),
          sourceOutputIndex: ref.sourceOutputIndex,
          sequence: ref.sequence,
          unlockingScript: ref.unlockingScript,
          unlockingScriptBytes: ref.unlockingScript == null ? void 0 : scriptSerializationIdentity(ref.unlockingScript),
          sourceOutput,
          sourceSatoshis: sourceOutput?.satoshis,
          sourceLockingScript: sourceOutput?.lockingScript,
          sourceLockingScriptBytes: sourceOutput == null ? void 0 : scriptSerializationIdentity(sourceOutput.lockingScript)
        };
      }),
      outputs: this.outputs.map((ref) => ({
        ref,
        satoshis: ref.satoshis,
        lockingScript: ref.lockingScript,
        lockingScriptBytes: scriptSerializationIdentity(ref.lockingScript)
      }))
    });
  };
  serializationCacheMatchesState_fn2 = function() {
    const cached = __privateGet(this, _rawCacheState);
    if (cached?.version !== this.version || cached.lockTime !== this.lockTime || cached.inputs.length !== this.inputs.length || cached.outputs.length !== this.outputs.length)
      return false;
    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];
      const state = cached.inputs[i];
      const sourceOutput = input.sourceTransaction?.outputs[input.sourceOutputIndex];
      if (state.ref !== input || state.sourceTXID !== input.sourceTXID || state.sourceTransactionId !== __privateMethod(this, _Transaction_instances, sourceTransactionId_fn).call(this, input) || state.sourceOutputIndex !== input.sourceOutputIndex || state.sequence !== input.sequence || state.unlockingScript !== input.unlockingScript || state.unlockingScriptBytes !== (input.unlockingScript == null ? void 0 : scriptSerializationIdentity(input.unlockingScript)) || state.sourceOutput !== sourceOutput || state.sourceSatoshis !== sourceOutput?.satoshis || state.sourceLockingScript !== sourceOutput?.lockingScript || state.sourceLockingScriptBytes !== (sourceOutput == null ? void 0 : scriptSerializationIdentity(sourceOutput.lockingScript)))
        return false;
    }
    for (let i = 0; i < this.outputs.length; i++) {
      const output = this.outputs[i];
      const state = cached.outputs[i];
      if (state.ref !== output || state.satoshis !== output.satoshis || state.lockingScript !== output.lockingScript || state.lockingScriptBytes !== scriptSerializationIdentity(output.lockingScript))
        return false;
    }
    return true;
  };
  calculateChange_fn = function(fee) {
    let totalInputs = 0;
    for (let index = 0; index < this.inputs.length; index++) {
      const input = this.inputs[index];
      if (typeof input.sourceTransaction !== "object") {
        throw new TypeError("Source transactions are required for all inputs during fee computation");
      }
      requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
      const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex];
      if (sourceOutput == null) {
        throw new RangeError(`Input ${index} references a source output that does not exist.`);
      }
      const amount = requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`);
      totalInputs = addSatoshiAmount(totalInputs, amount, "Transaction input total");
    }
    let totalOutputs = 0;
    for (let index = 0; index < this.outputs.length; index++) {
      const out = this.outputs[index];
      if (out.change !== true) {
        const amount = requireSatoshiAmount(out.satoshis, `Output ${index} amount`);
        totalOutputs = addSatoshiAmount(totalOutputs, amount, "Transaction output total");
      }
    }
    if (totalOutputs + fee > totalInputs) {
      throw new RangeError("Transaction inputs are insufficient for the requested outputs and fee.");
    }
    return totalInputs - totalOutputs - fee;
  };
  distributeChange_fn = function(change, changeDistribution) {
    const changeOutputs = this.outputs.filter((out) => out.change === true);
    if (changeOutputs.length === 0)
      return;
    if (changeDistribution === "random") {
      __privateMethod(this, _Transaction_instances, distributeRandomChange_fn).call(this, change, changeOutputs);
    } else {
      __privateMethod(this, _Transaction_instances, distributeEqualChange_fn).call(this, change, changeOutputs);
    }
  };
  distributeRandomChange_fn = function(change, changeOutputs) {
    let remaining = change;
    for (let i = 0; i < changeOutputs.length - 1; i++) {
      const portion = __privateMethod(this, _Transaction_instances, benfordNumber_fn).call(this, 0, remaining);
      changeOutputs[i].satoshis = portion;
      remaining -= portion;
    }
    changeOutputs.at(-1).satoshis = remaining;
  };
  distributeEqualChange_fn = function(change, changeOutputs) {
    const perOutput = Math.floor(change / changeOutputs.length);
    for (const out of changeOutputs) {
      out.satoshis = perOutput;
    }
    changeOutputs.at(-1).satoshis += change - perOutput * changeOutputs.length;
  };
  benfordNumber_fn = function(min, max) {
    const d = Random_default(1)[0] % 9 + 1;
    return Math.floor(min + (max - min) * Math.log10(1 + 1 / d) / Math.log10(10));
  };
  writeTransactionBody_fn = function(writer) {
    writer.writeUInt32LE(this.version);
    writer.writeVarIntNum(this.inputs.length);
    for (const i of this.inputs) {
      if (i.sourceTXID === void 0) {
        if (i.sourceTransaction == null) {
          throw new Error("sourceTransaction is undefined");
        } else {
          writer.write(i.sourceTransaction.hash());
        }
      } else {
        writer.writeReverse(toArray2(requireTXID(i.sourceTXID, "sourceTXID"), "hex"));
      }
      writer.writeUInt32LE(requireUInt322(i.sourceOutputIndex, "sourceOutputIndex"));
      if (i.unlockingScript == null) {
        throw new Error("unlockingScript is undefined");
      }
      const scriptBin = i.unlockingScript.toUint8Array();
      writer.writeVarIntNum(scriptBin.length);
      writer.write(scriptBin);
      writer.writeUInt32LE(requireUInt322(i.sequence ?? 4294967295, "sequence"));
    }
    writer.writeVarIntNum(this.outputs.length);
    for (const o of this.outputs) {
      writer.writeUInt64LE(o.satoshis ?? 0);
      const scriptBin = o.lockingScript.toUint8Array();
      writer.writeVarIntNum(scriptBin.length);
      writer.write(scriptBin);
    }
    writer.writeUInt32LE(this.lockTime);
  };
  buildSerializedBytes_fn = function() {
    const writer = new WriterUint8Array();
    __privateMethod(this, _Transaction_instances, writeTransactionBody_fn).call(this, writer);
    return writer.toUint8Array();
  };
  getSerializedBytes_fn3 = function() {
    if (__privateGet(this, _rawBytesCache3) == null || !__privateMethod(this, _Transaction_instances, serializationCacheMatchesState_fn2).call(this)) {
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
      __privateSet(this, _rawBytesCache3, __privateMethod(this, _Transaction_instances, buildSerializedBytes_fn).call(this));
      __privateMethod(this, _Transaction_instances, captureSerializationState_fn2).call(this);
    }
    return __privateGet(this, _rawBytesCache3);
  };
  writeEF_fn = function(writer) {
    writer.writeUInt32LE(this.version);
    writer.write([0, 0, 0, 0, 0, 239]);
    writer.writeVarIntNum(this.inputs.length);
    for (const i of this.inputs) {
      if (i.sourceTransaction === void 0) {
        throw new TypeError("All inputs must have source transactions when serializing to EF format");
      }
      if (i.sourceTXID === void 0) {
        writer.write(i.sourceTransaction.hash());
      } else {
        writer.write(toArray2(i.sourceTXID, "hex").reverse());
      }
      writer.writeUInt32LE(i.sourceOutputIndex);
      if (i.unlockingScript == null) {
        throw new Error("unlockingScript is undefined");
      }
      const scriptBin = i.unlockingScript.toUint8Array();
      writer.writeVarIntNum(scriptBin.length);
      writer.write(scriptBin);
      writer.writeUInt32LE(i.sequence ?? 4294967295);
      writer.writeUInt64LE(i.sourceTransaction.outputs[i.sourceOutputIndex].satoshis ?? 0);
      const lockingScriptBin = i.sourceTransaction.outputs[i.sourceOutputIndex].lockingScript.toUint8Array();
      writer.writeVarIntNum(lockingScriptBin.length);
      writer.write(lockingScriptBin);
    }
    writer.writeVarIntNum(this.outputs.length);
    for (const o of this.outputs) {
      writer.writeUInt64LE(o.satoshis ?? 0);
      const scriptBin = o.lockingScript.toUint8Array();
      writer.writeVarIntNum(scriptBin.length);
      writer.write(scriptBin);
    }
    writer.writeUInt32LE(this.lockTime);
  };
  getEFBytes_fn = function() {
    if (__privateGet(this, _efBytesCache) == null || !__privateMethod(this, _Transaction_instances, serializationCacheMatchesState_fn2).call(this)) {
      __privateMethod(this, _Transaction_instances, invalidateSerializationCaches_fn3).call(this);
      const writer = new WriterUint8Array();
      __privateMethod(this, _Transaction_instances, writeEF_fn).call(this, writer);
      __privateSet(this, _efBytesCache, writer.toUint8Array());
      __privateMethod(this, _Transaction_instances, captureSerializationState_fn2).call(this);
    }
    return __privateGet(this, _efBytesCache);
  };
  completeVerificationFromMerklePath_fn = async function(tx, scriptsOnly, chainTracker, getTxid, verifiedTransactions, verifiedTxids) {
    if (typeof tx.merklePath !== "object")
      return false;
    if (scriptsOnly) {
      verifiedTransactions.add(tx);
      return true;
    }
    if (await tx.merklePath.verify(getTxid(), chainTracker)) {
      verifiedTxids.add(getTxid());
      return true;
    }
    throw new Error(`Invalid merkle path for transaction ${getTxid()}`);
  };
  validateUnminedTransactionStructure_fn = function(tx, getTxid) {
    if (tx.inputs.length === 0) {
      throw new Error(`Verification failed because transaction ${getTxid()} has no inputs.`);
    }
    if (tx.outputs.length === 0) {
      throw new Error(`Verification failed because transaction ${getTxid()} has no outputs.`);
    }
    const spentOutpoints = /* @__PURE__ */ new Set();
    for (let index = 0; index < tx.inputs.length; index++) {
      const input = tx.inputs[index];
      const outputIndex = requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
      requireUInt322(input.sequence ?? 4294967295, `Input ${index} sequence`);
      const sourceTXID = requireTXID(input.sourceTXID ?? input.sourceTransaction?.id("hex"), `Input ${index} sourceTXID`);
      if (/^0{64}$/.test(sourceTXID) && outputIndex === 4294967295) {
        throw new Error(`Verification failed because unmined transaction ${getTxid()} contains a coinbase input.`);
      }
      const outpoint2 = `${sourceTXID}:${outputIndex}`;
      if (spentOutpoints.has(outpoint2)) {
        throw new Error(`Verification failed because transaction ${getTxid()} spends outpoint ${outpoint2} more than once.`);
      }
      spentOutpoints.add(outpoint2);
    }
    __privateMethod(this, _Transaction_instances, totalVerifiedOutputs_fn).call(this, tx);
  };
  queueSourceTransactionForVerification_fn = function(sourceTransaction, sourceTxid, state) {
    if (state.scriptsOnly) {
      if (!state.verifiedTransactions.has(sourceTransaction) && !state.queuedTransactions.has(sourceTransaction)) {
        state.txQueue.push(sourceTransaction);
        state.queuedTransactions.add(sourceTransaction);
      }
      return;
    }
    if (!state.verifiedTxids.has(sourceTxid) && !state.queuedTxids.has(sourceTxid)) {
      state.txQueue.push(sourceTransaction);
      state.queuedTxids.add(sourceTxid);
    }
  };
  verifyTransactionInputs_fn = function(tx, useVerifier, getTxid, state) {
    let inputTotal = 0;
    const sigHashCache = { hashOutputsSingle: /* @__PURE__ */ new Map() };
    for (let index = 0; index < tx.inputs.length; index++) {
      const input = tx.inputs[index];
      if (typeof input.sourceTransaction !== "object") {
        throw new TypeError(`Verification failed because the input at index ${index} of transaction ${getTxid()} is missing an associated source transaction. This source transaction is required for transaction verification because there is no merkle proof for the transaction spending a UTXO it contains.`);
      }
      if (typeof input.unlockingScript !== "object") {
        throw new TypeError(`Verification failed because the input at index ${index} of transaction ${getTxid()} is missing an associated unlocking script. This script is required for transaction verification because there is no merkle proof for the transaction spending the UTXO.`);
      }
      const sourceTransaction = input.sourceTransaction;
      const sourceOutput = sourceTransaction.outputs[input.sourceOutputIndex];
      if (sourceOutput == null) {
        throw new RangeError(`Verification failed because input ${index} of transaction ${getTxid()} references a source output that does not exist.`);
      }
      inputTotal = addSatoshiAmount(inputTotal, requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`), "Transaction input total");
      const computedSourceTxid = sourceTransaction.id("hex");
      if (!state.scriptsOnly && input.sourceTXID !== void 0 && requireTXID(input.sourceTXID, `Input ${index} sourceTXID`) !== computedSourceTxid) {
        throw new Error(`Verification failed because input ${index} of transaction ${getTxid()} does not reference its supplied source transaction.`);
      }
      const sourceTxid = state.scriptsOnly && input.sourceTXID !== void 0 ? input.sourceTXID : sourceTransaction.id("hex");
      __privateMethod(this, _Transaction_instances, queueSourceTransactionForVerification_fn).call(this, sourceTransaction, sourceTxid, state);
      input.sourceTXID ?? (input.sourceTXID = sourceTxid);
      if (!useVerifier && !new Spend({
        sourceTXID: input.sourceTXID,
        sourceOutputIndex: input.sourceOutputIndex,
        lockingScript: sourceOutput.lockingScript,
        sourceSatoshis: sourceOutput.satoshis ?? 0,
        transactionVersion: tx.version,
        otherInputs: [],
        allInputs: tx.inputs,
        unlockingScript: input.unlockingScript,
        inputSequence: input.sequence ?? 4294967295,
        inputIndex: index,
        outputs: tx.outputs,
        lockTime: tx.lockTime,
        memoryLimit: state.memoryLimit,
        sigHashCache
      }).validateJavaScript()) {
        return { valid: false, inputTotal };
      }
    }
    return { valid: true, inputTotal };
  };
  totalVerifiedOutputs_fn = function(tx) {
    let outputTotal = 0;
    for (let index = 0; index < tx.outputs.length; index++) {
      outputTotal = addSatoshiAmount(outputTotal, requireSatoshiAmount(tx.outputs[index].satoshis, `Output ${index} amount`), "Transaction output total");
    }
    return outputTotal;
  };
  verifyQueuedScripts_fn = async function(verifierQueue, selectedVerifier) {
    if (verifierQueue.length === 0 || selectedVerifier === void 0)
      return;
    const scriptVerdicts = selectedVerifier.verifyScriptsBatch === void 0 ? await Promise.all(verifierQueue.map(async (params) => await selectedVerifier.verifyScripts(params))) : await selectedVerifier.verifyScriptsBatch(verifierQueue);
    if (!Array.isArray(scriptVerdicts) || scriptVerdicts.length !== verifierQueue.length) {
      throw new Error("Script verifier returned an invalid batch result count");
    }
    const ownedVerdicts = [];
    for (let index = 0; index < scriptVerdicts.length; index++) {
      if (!Object.prototype.hasOwnProperty.call(scriptVerdicts, index) || typeof scriptVerdicts[index] !== "boolean") {
        throw new TypeError("Script verifier returned a non-boolean verdict");
      }
      ownedVerdicts.push(scriptVerdicts[index]);
    }
    const failedIndex = ownedVerdicts.findIndex((valid) => !valid);
    if (failedIndex >= 0) {
      throw new Error(`Script verification failed for transaction ${verifierQueue[failedIndex].tx.id("hex")}`);
    }
  };
  isTransactionAlreadyVerified_fn = function(tx, getTxid, state) {
    return state.scriptsOnly ? state.verifiedTransactions.has(tx) : state.verifiedTxids.has(getTxid());
  };
  snapshotTransactionGraph_fn = function(includeTemplates = false) {
    const snapshots = /* @__PURE__ */ new Map();
    const originals = [this];
    snapshots.set(this, new _Transaction(this.version, [], [], this.lockTime));
    for (let graphIndex = 0; graphIndex < originals.length; graphIndex++) {
      const original = originals[graphIndex];
      const snapshot2 = snapshots.get(original);
      if (snapshot2 === void 0)
        throw new Error("Transaction snapshot is incomplete");
      snapshot2.version = original.version;
      snapshot2.lockTime = original.lockTime;
      snapshot2.merklePath = original.merklePath === void 0 ? void 0 : new MerklePath(original.merklePath.blockHeight, original.merklePath.path.map((level) => level.map((leaf) => ({ ...leaf }))));
      snapshot2.outputs = Array.from(original.outputs, (output) => output == null ? output : {
        satoshis: output.satoshis,
        lockingScript: new LockingScript([], Uint8Array.from(output.lockingScript.toUint8Array()), void 0, false),
        change: output.change
      });
      snapshot2.inputs = Array.from(original.inputs, (input) => {
        let sourceSnapshot;
        if (input.sourceTransaction !== void 0) {
          sourceSnapshot = snapshots.get(input.sourceTransaction);
          if (sourceSnapshot === void 0) {
            sourceSnapshot = new _Transaction(input.sourceTransaction.version, [], [], input.sourceTransaction.lockTime);
            snapshots.set(input.sourceTransaction, sourceSnapshot);
            originals.push(input.sourceTransaction);
          }
        }
        return {
          sourceTransaction: sourceSnapshot,
          sourceTXID: input.sourceTXID,
          sourceOutputIndex: input.sourceOutputIndex,
          unlockingScript: input.unlockingScript === void 0 ? void 0 : new UnlockingScript([], Uint8Array.from(input.unlockingScript.toUint8Array()), void 0, false),
          unlockingScriptTemplate: includeTemplates ? input.unlockingScriptTemplate : void 0,
          sequence: input.sequence
        };
      });
    }
    const snapshot = snapshots.get(this);
    if (snapshot === void 0)
      throw new Error("Transaction snapshot is incomplete");
    return snapshot;
  };
  signingStateMatches_fn = function(snapshot, inputRefs, sourceRefs, templateRefs, outputRefs) {
    if (this.version !== snapshot.version || this.lockTime !== snapshot.lockTime || this.inputs.length !== snapshot.inputs.length || this.outputs.length !== snapshot.outputs.length) {
      return false;
    }
    for (let index = 0; index < this.inputs.length; index++) {
      const current = this.inputs[index];
      const owned = snapshot.inputs[index];
      if (current !== inputRefs[index] || current.sourceTransaction !== sourceRefs[index] || current.unlockingScriptTemplate !== templateRefs[index] || current.sourceTXID !== owned.sourceTXID || current.sourceOutputIndex !== owned.sourceOutputIndex || current.sequence !== owned.sequence || !equalBytes(current.unlockingScript?.toUint8Array(), owned.unlockingScript?.toUint8Array())) {
        return false;
      }
      const currentSource = current.sourceTransaction?.outputs[current.sourceOutputIndex];
      const ownedSource = owned.sourceTransaction?.outputs[owned.sourceOutputIndex];
      if (currentSource == null || ownedSource == null) {
        if (currentSource !== ownedSource)
          return false;
      } else if (!Object.is(currentSource.satoshis, ownedSource.satoshis) || !equalBytes(currentSource.lockingScript.toUint8Array(), ownedSource.lockingScript.toUint8Array())) {
        return false;
      }
    }
    for (let index = 0; index < this.outputs.length; index++) {
      const current = this.outputs[index];
      const owned = snapshot.outputs[index];
      if (current !== outputRefs[index] || !Object.is(current.satoshis, owned.satoshis) || current.change !== owned.change || !equalBytes(current.lockingScript.toUint8Array(), owned.lockingScript.toUint8Array())) {
        return false;
      }
    }
    return true;
  };
  verifyUnminedTransaction_fn = async function(tx, getTxid, context) {
    const { feeModel, memoryLimit, selectedVerifier, verifierQueue } = context;
    __privateMethod(this, _Transaction_instances, validateUnminedTransactionStructure_fn).call(this, tx, getTxid);
    await this.verifyTransactionFee(tx, feeModel, getTxid);
    const verifierParams = {
      tx,
      blockHeight: POST_CHRONICLE_HEIGHT_FALLBACK,
      consensus: true,
      ...memoryLimit === void 0 ? {} : { memoryLimit }
    };
    const useVerifier = selectedVerifier !== void 0 && (memoryLimit === void 0 || selectedVerifier.supportsMemoryLimit === true) && (selectedVerifier.shouldVerifyScripts?.(verifierParams) ?? true);
    const verifyInputs = (skipScripts) => __privateMethod(this, _Transaction_instances, verifyTransactionInputs_fn).call(this, tx, skipScripts, getTxid, context);
    const inputVerification = !useVerifier && context.scriptWork !== void 0 ? context.scriptWork.work.inputs(context.scriptWork, verifierParams, verifyInputs) : verifyInputs(useVerifier);
    if (!inputVerification.valid)
      return false;
    if (useVerifier)
      verifierQueue.push(verifierParams);
    if (__privateMethod(this, _Transaction_instances, totalVerifiedOutputs_fn).call(this, tx) > inputVerification.inputTotal)
      return false;
    if (context.scriptsOnly)
      context.verifiedTransactions.add(tx);
    else
      context.verifiedTxids.add(getTxid());
    return true;
  };
  verifySnapshot_fn = async function(chainTracker, feeModel, memoryLimit, verifier, scriptWork) {
    const scriptsOnly = chainTracker === "scripts only";
    const backend = verifier ?? scriptVerificationBackend();
    const selectedVerifier = scriptWork !== void 0 && backend !== void 0 ? scopedScriptBackend(scriptWork, backend) : backend;
    if (!scriptsOnly)
      this.materializeSourceTXIDs();
    const verifiedTxids = /* @__PURE__ */ new Set();
    const verifiedTransactions = /* @__PURE__ */ new Set();
    const txQueue = [this];
    const queuedTxids = /* @__PURE__ */ new Set();
    if (!scriptsOnly)
      queuedTxids.add(this.id("hex"));
    const queuedTransactions = new Set(txQueue);
    const verifierQueue = [];
    const verificationContext = {
      scriptsOnly,
      memoryLimit,
      txQueue,
      queuedTransactions,
      queuedTxids,
      verifiedTransactions,
      verifiedTxids,
      feeModel,
      selectedVerifier,
      verifierQueue,
      scriptWork
    };
    let queueIndex = 0;
    while (queueIndex < txQueue.length) {
      const tx = txQueue[queueIndex++];
      let txid2;
      const getTxid = () => {
        txid2 ?? (txid2 = tx.id("hex"));
        return txid2;
      };
      if (__privateMethod(this, _Transaction_instances, isTransactionAlreadyVerified_fn).call(this, tx, getTxid, verificationContext)) {
        continue;
      }
      if (await __privateMethod(this, _Transaction_instances, completeVerificationFromMerklePath_fn).call(this, tx, scriptsOnly, chainTracker, getTxid, verifiedTransactions, verifiedTxids)) {
        continue;
      }
      if (!await __privateMethod(this, _Transaction_instances, verifyUnminedTransaction_fn).call(this, tx, getTxid, verificationContext))
        return false;
    }
    await __privateMethod(this, _Transaction_instances, verifyQueuedScripts_fn).call(this, verifierQueue, selectedVerifier);
    return true;
  };
  collectBEEFTransactions_fn = function(allowPartial) {
    const bumps = [];
    const bumpIndexByInstance = /* @__PURE__ */ new Map();
    const bumpIndexByRoot = /* @__PURE__ */ new Map();
    const txs = [];
    const seenTxids = /* @__PURE__ */ new Set();
    const scheduledTxids = /* @__PURE__ */ new Set();
    const stack = [{ tx: this, expanded: false }];
    while (stack.length > 0) {
      const frame = stack.pop();
      if (frame == null)
        continue;
      if (frame.expanded) {
        __privateMethod(this, _Transaction_instances, appendBEEFTransaction_fn).call(this, frame.tx, seenTxids, txs, bumps, bumpIndexByInstance, bumpIndexByRoot);
        continue;
      }
      __privateMethod(this, _Transaction_instances, scheduleBEEFTransaction_fn).call(this, frame.tx, allowPartial, scheduledTxids, stack);
    }
    return { bumps, txs };
  };
  appendBEEFTransaction_fn = function(tx, seenTxids, txs, bumps, bumpIndexByInstance, bumpIndexByRoot) {
    const txid2 = tx.id("hex");
    if (seenTxids.has(txid2))
      return;
    const item = { tx };
    if (tx.merklePath != null) {
      item.pathIndex = __privateMethod(this, _Transaction_instances, getBEEFPathIndex_fn).call(this, tx.merklePath, bumps, bumpIndexByInstance, bumpIndexByRoot);
    }
    seenTxids.add(txid2);
    txs.push(item);
  };
  scheduleBEEFTransaction_fn = function(tx, allowPartial, scheduledTxids, stack) {
    const txid2 = tx.id("hex");
    if (scheduledTxids.has(txid2))
      return;
    scheduledTxids.add(txid2);
    stack.push({ tx, expanded: true });
    if (tx.merklePath != null)
      return;
    for (const input of tx.inputs) {
      const source = input.sourceTransaction;
      if (source != null)
        stack.push({ tx: source, expanded: false });
      else if (allowPartial === false)
        throw new Error("A required source transaction is missing!");
    }
  };
  getBEEFPathIndex_fn = function(merklePath, bumps, bumpIndexByInstance, bumpIndexByRoot) {
    const existingByInstance = bumpIndexByInstance.get(merklePath);
    if (existingByInstance !== void 0)
      return existingByInstance;
    const key = `${merklePath.blockHeight}:${merklePath.computeRoot()}`;
    const existingByRoot = bumpIndexByRoot.get(key);
    if (existingByRoot !== void 0) {
      bumps[existingByRoot].combine(merklePath);
      bumpIndexByInstance.set(merklePath, existingByRoot);
      return existingByRoot;
    }
    const newIndex = bumps.length;
    bumps.push(merklePath);
    bumpIndexByInstance.set(merklePath, newIndex);
    bumpIndexByRoot.set(key, newIndex);
    return newIndex;
  };
  reserveBEEFWriter_fn = function(writer, bumps, txs) {
    let bumpBytes;
    if (writer instanceof WriterUint8Array) {
      bumpBytes = bumps.map((bump) => bump.toBinaryUint8Array());
      let remainingBytes = 16;
      for (const bytes3 of bumpBytes)
        remainingBytes += bytes3.length;
      for (const item of txs)
        remainingBytes += item.tx.toUint8Array().length + 10;
      writer.reserve(remainingBytes);
    }
    return bumpBytes;
  };
  buildWalletActionArgs_fn = async function(description, hasTemplates) {
    const actionArgs = {
      description,
      inputs: [],
      outputs: [],
      lockTime: this.lockTime,
      version: this.version
    };
    this.materializeSourceTXIDs();
    const beefData = new Beef();
    for (let index = 0; index < this.inputs.length; index++) {
      const input = this.inputs[index];
      if (input.sourceTransaction == null) {
        throw new Error("All inputs must have a sourceTransaction when using completeWithWallet");
      }
      beefData.mergeTransaction(input.sourceTransaction);
      actionArgs.inputs.push(await __privateMethod(this, _Transaction_instances, buildWalletInputArg_fn).call(this, input, index, hasTemplates));
    }
    if (this.inputs.length > 0)
      actionArgs.inputBEEF = beefData.toUint8Array();
    actionArgs.outputs = this.outputs.map((output) => ({
      satoshis: output.satoshis,
      lockingScript: output.lockingScript.toHex(),
      outputDescription: "Output from source transaction"
    }));
    if (Array.isArray(this.metadata?.labels))
      actionArgs.labels = this.metadata.labels;
    return actionArgs;
  };
  buildWalletInputArg_fn = async function(input, index, hasTemplates) {
    const inputArg = {
      outpoint: `${input.sourceTransaction.id("hex")}.${input.sourceOutputIndex}`,
      inputDescription: "Input from source transaction",
      sequenceNumber: input.sequence
    };
    if (!hasTemplates) {
      if (input.unlockingScript == null) {
        throw new Error("All inputs must have an unlockingScript when using completeWithWallet");
      }
      inputArg.unlockingScript = input.unlockingScript.toHex();
      return inputArg;
    }
    if (input.unlockingScriptTemplate != null) {
      inputArg.unlockingScriptLength = await input.unlockingScriptTemplate.estimateLength(this, index);
    } else if (input.unlockingScript != null) {
      inputArg.unlockingScript = input.unlockingScript.toHex();
    } else {
      throw new Error(`Input ${index} must have either an unlockingScript or unlockingScriptTemplate`);
    }
    return inputArg;
  };
  __privateAdd(_Transaction, _Transaction_static);
  var Transaction = _Transaction;

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
    static fromSeed(bytes3) {
      return new this().fromSeed(bytes3);
    }
    /**
     * Initializes the HD wallet from a seed.
     * This method generates keys and other properties from a given seed, conforming to the BIP32 specification.
     * @param bytes - An array of bytes representing the seed.
     * @returns {HD} The current instance with properties set from the seed.
     */
    fromSeed(bytes3) {
      bytes3 = compatBytes(bytes3, "BIP32 seed", 16, 64);
      if (bytes3.length < 128 / 8) {
        throw new Error("Need more than 128 bits of entropy");
      }
      if (bytes3.length > 512 / 8) {
        throw new Error("More than 512 bits of entropy is nonstandard");
      }
      const hash = sha512hmac(toArray2("Bitcoin seed", "utf8"), bytes3);
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
      const pubKeyhash = hash160(this.pubKey.encode(true));
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
  function validateWordlist(wordlist) {
    if (wordlist == null || typeof wordlist !== "object") {
      throw new TypeError("Mnemonic wordlist must be an object");
    }
    const valueDescriptor = Object.getOwnPropertyDescriptor(wordlist, "value");
    const spaceDescriptor = Object.getOwnPropertyDescriptor(wordlist, "space");
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
    constructor(mnemonic, seed, wordlist = wordList) {
      __publicField(this, "mnemonic");
      __publicField(this, "seed");
      __publicField(this, "Wordlist");
      validateWordlist(wordlist);
      this.mnemonic = compatString(mnemonic ?? "", "Mnemonic", MAX_MNEMONIC_LENGTH);
      this.seed = compatBytes(seed ?? [], "Mnemonic seed", 0, 64);
      this.Wordlist = wordlist;
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
      const hash = sha256(buf);
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
      const hash = sha256(buf);
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
      const hash = sha256(buf.slice(0, nonhashBits.length / 8));
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
      this.seed = pbkdf2(mbuf, pbuf, 2048, 64, "sha512");
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

  // ../vendor/wallet-ui/app/packages/wallet-kit/js/nc-send.js
  var TEMPLATE_PATH = "/api/v1/nc/transaction/template/";
  var BROADCAST_PATH = "/api/v1/nc/transaction/broadcast/";
  function txFingerprint(inputs, outputs) {
    const canonical = JSON.stringify({
      inputs: inputs.map((i) => ({
        txid: i.txid,
        vout: Number(i.output_index),
        sats: Number(i.satoshis)
      })),
      outputs: outputs.map((o) => ({
        sats: Number(o.satoshis),
        lock: String(o.locking_script).toLowerCase()
      }))
    });
    return utils_exports.toHex(Hash_exports.sha256(canonical, "utf8"));
  }
  function rebuildUnsignedHex(template) {
    const tx = new Transaction();
    for (const input of template.inputs) {
      tx.addInput({
        sourceTXID: input.txid,
        sourceOutputIndex: Number(input.output_index),
        unlockingScript: new UnlockingScript(),
        // empty (unsigned)
        sequence: 4294967295
      });
    }
    for (const output of template.outputs) {
      tx.addOutput({
        satoshis: Number(output.satoshis),
        lockingScript: LockingScript.fromHex(output.locking_script)
      });
    }
    return tx.toHex();
  }
  function verifyTemplate(template) {
    const localFingerprint = txFingerprint(template.inputs, template.outputs);
    if (localFingerprint !== template.tx_fingerprint) {
      throw new Error("nc-send: tx_fingerprint mismatch \u2014 template rejected");
    }
    if (rebuildUnsignedHex(template) !== template.unsigned_transaction_hex) {
      throw new Error("nc-send: unsigned hex mismatch \u2014 template rejected");
    }
    return localFingerprint;
  }
  function deriveKey(masterHd, derivationPath) {
    if (!derivationPath) throw new Error("nc-send: input is missing derivation_path");
    return masterHd.derive(`m/${derivationPath.change}/${derivationPath.change_index}`).privKey;
  }
  async function signTemplate(template, mnemonic) {
    const seed = Mnemonic.fromString(mnemonic.trim()).toSeed();
    const master = HD.fromSeed(seed);
    const tx = Transaction.fromHex(template.unsigned_transaction_hex);
    for (const i of template.client_signs_input_indices) {
      const input = template.inputs[i];
      tx.inputs[i].unlockingScriptTemplate = new P2PKH().unlock(
        deriveKey(master, input.derivation_path),
        "all",
        // SIGHASH_ALL | FORKID
        false,
        Number(input.satoshis),
        LockingScript.fromHex(input.locking_script)
      );
    }
    await tx.sign();
    return tx.toHex();
  }
  function deriveChangeAddress(mnemonic) {
    const master = HD.fromSeed(Mnemonic.fromString(mnemonic.trim()).toSeed());
    return master.derive("m/1/0").privKey.toPublicKey().toAddress();
  }
  function unwrap(body) {
    if (body && body.status === "success") return body.data;
    const message = body && body.error ? `${body.error.code}: ${body.error.message}` : "unknown error";
    throw new Error(`nc-send: ${message}`);
  }
  async function sendBsv({ recipient, satoshis: satoshis2, getMnemonic, onPhase }) {
    if (!window.ncAuth) throw new Error("nc-send: ncAuth is not loaded");
    const phase = typeof onPhase === "function" ? onPhase : () => {
    };
    const t0 = Date.now();
    const marks = {};
    const mark = (name) => {
      marks[name] = Date.now() - t0;
    };
    phase("unlocking");
    const mnemonic = await getMnemonic();
    mark("unlock");
    const isPaymail = typeof recipient === "string" && recipient.includes("@");
    const recipientOutput = isPaymail ? { paymail: recipient, satoshis: Number(satoshis2) } : { address: recipient, satoshis: Number(satoshis2) };
    phase("template");
    const template = unwrap(await window.ncAuth.apiPost(TEMPLATE_PATH, {
      transaction_type: "send_money",
      outputs: [recipientOutput],
      change_address: deriveChangeAddress(mnemonic)
    }));
    console.log("[NC-CLIENT] template received template_id=" + template.template_id + " fingerprint=" + template.tx_fingerprint + " client_signs=" + JSON.stringify(template.client_signs_input_indices) + " unsigned_hex_len=" + String(template.unsigned_transaction_hex || "").length);
    mark("template");
    phase("verifying");
    const fingerprint = verifyTemplate(template);
    const recipientTotal = (template.outputs || []).filter((o) => !o.is_change).reduce((sum, o) => sum + Number(o.satoshis), 0);
    if (recipientTotal !== Number(satoshis2)) {
      throw new Error("nc-send: recipient amount mismatch \u2014 template rejected");
    }
    console.log("[NC-CLIENT] template verified fingerprint_match=1 unsigned_hex_match=1 recipient_amount_match=1 template_id=" + template.template_id);
    mark("verify");
    phase("signing");
    const signedHex = await signTemplate(template, mnemonic);
    console.log("[NC-CLIENT] signed locally inputs=" + JSON.stringify(template.client_signs_input_indices) + " signed_hex_len=" + signedHex.length + " template_id=" + template.template_id + " (private keys never left this device)");
    mark("sign");
    phase("broadcasting");
    const result = unwrap(await window.ncAuth.apiPost(BROADCAST_PATH, {
      template_id: template.template_id,
      signed_transaction_hex: signedHex
    }));
    if (result.tx_fingerprint && result.tx_fingerprint !== fingerprint) {
      throw new Error("nc-send: broadcast fingerprint mismatch \u2014 possible tampering");
    }
    console.log("[NC-CLIENT] broadcast verified txid=" + result.txid + " fingerprint_echo_match=1 template_id=" + result.template_id);
    mark("broadcast");
    console.log("[NC-CLIENT] timing_ms unlock=" + marks.unlock + " fetch_template=" + (marks.template - marks.unlock) + " verify=" + (marks.verify - marks.template) + " sign=" + (marks.sign - marks.verify) + " broadcast=" + (marks.broadcast - marks.sign) + " total=" + marks.broadcast);
    phase("done");
    return result;
  }
  if (typeof window !== "undefined") {
    window.NcSend = { sendBsv, signTemplate, verifyTemplate, txFingerprint, rebuildUnsignedHex, deriveChangeAddress };
  }
})();
