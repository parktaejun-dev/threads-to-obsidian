var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS({
  "../../node_modules/process-nextick-args/index.js"(exports, module) {
    "use strict";
    if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
      module.exports = { nextTick };
    } else {
      module.exports = process;
    }
    function nextTick(fn, arg1, arg2, arg3) {
      if (typeof fn !== "function") {
        throw new TypeError('"callback" argument must be a function');
      }
      var len = arguments.length;
      var args, i;
      switch (len) {
        case 0:
        case 1:
          return process.nextTick(fn);
        case 2:
          return process.nextTick(function afterTickOne() {
            fn.call(null, arg1);
          });
        case 3:
          return process.nextTick(function afterTickTwo() {
            fn.call(null, arg1, arg2);
          });
        case 4:
          return process.nextTick(function afterTickThree() {
            fn.call(null, arg1, arg2, arg3);
          });
        default:
          args = new Array(len - 1);
          i = 0;
          while (i < args.length) {
            args[i++] = arguments[i];
          }
          return process.nextTick(function afterTick() {
            fn.apply(null, args);
          });
      }
    }
  }
});

// ../../node_modules/isarray/index.js
var require_isarray = __commonJS({
  "../../node_modules/isarray/index.js"(exports, module) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return toString.call(arr) == "[object Array]";
    };
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/stream.js"(exports, module) {
    module.exports = __require("stream");
  }
});

// ../../node_modules/readable-stream/node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "../../node_modules/readable-stream/node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = __require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// ../../node_modules/core-util-is/lib/util.js
var require_util = __commonJS({
  "../../node_modules/core-util-is/lib/util.js"(exports) {
    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg);
      }
      return objectToString(arg) === "[object Array]";
    }
    exports.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isRegExp(re) {
      return objectToString(re) === "[object RegExp]";
    }
    exports.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports.isObject = isObject;
    function isDate(d) {
      return objectToString(d) === "[object Date]";
    }
    exports.isDate = isDate;
    function isError(e) {
      return objectToString(e) === "[object Error]" || e instanceof Error;
    }
    exports.isError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
      return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
      typeof arg === "undefined";
    }
    exports.isPrimitive = isPrimitive;
    exports.isBuffer = __require("buffer").Buffer.isBuffer;
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
  }
});

// ../../node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "../../node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// ../../node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "../../node_modules/inherits/inherits.js"(exports, module) {
    try {
      util = __require("util");
      if (typeof util.inherits !== "function") throw "";
      module.exports = util.inherits;
    } catch (e) {
      module.exports = require_inherits_browser();
    }
    var util;
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/BufferList.js
var require_BufferList = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/BufferList.js"(exports, module) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = require_safe_buffer().Buffer;
    var util = __require("util");
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module.exports = (function() {
      function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList.prototype.shift = function shift() {
        if (this.length === 0) return;
        var ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList.prototype.join = function join(s) {
        if (this.length === 0) return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList.prototype.concat = function concat(n) {
        if (this.length === 0) return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList;
    })();
    if (util && util.inspect && util.inspect.custom) {
      module.exports.prototype[util.inspect.custom] = function() {
        var obj = util.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    function destroy(err, cb) {
      var _this = this;
      var readableDestroyed = this._readableState && this._readableState.destroyed;
      var writableDestroyed = this._writableState && this._writableState.destroyed;
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err);
        } else if (err) {
          if (!this._writableState) {
            pna.nextTick(emitErrorNT, this, err);
          } else if (!this._writableState.errorEmitted) {
            this._writableState.errorEmitted = true;
            pna.nextTick(emitErrorNT, this, err);
          }
        }
        return this;
      }
      if (this._readableState) {
        this._readableState.destroyed = true;
      }
      if (this._writableState) {
        this._writableState.destroyed = true;
      }
      this._destroy(err || null, function(err2) {
        if (!cb && err2) {
          if (!_this._writableState) {
            pna.nextTick(emitErrorNT, _this, err2);
          } else if (!_this._writableState.errorEmitted) {
            _this._writableState.errorEmitted = true;
            pna.nextTick(emitErrorNT, _this, err2);
          }
        } else if (cb) {
          cb(err2);
        }
      });
      return this;
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
      }
      if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finalCalled = false;
        this._writableState.prefinished = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
      }
    }
    function emitErrorNT(self2, err) {
      self2.emit("error", err);
    }
    module.exports = {
      destroy,
      undestroy
    };
  }
});

// ../../node_modules/util-deprecate/node.js
var require_node = __commonJS({
  "../../node_modules/util-deprecate/node.js"(exports, module) {
    module.exports = __require("util").deprecate;
  }
});

// ../../node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_writable.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    module.exports = Writable;
    function CorkedRequest(state) {
      var _this = this;
      this.next = null;
      this.entry = null;
      this.finish = function() {
        onCorkedFinish(_this, state);
      };
    }
    var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
    var Duplex;
    Writable.WritableState = WritableState;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var internalUtil = {
      deprecate: require_node()
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var destroyImpl = require_destroy();
    util.inherits(Writable, Stream);
    function nop() {
    }
    function WritableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
      var hwm = options.highWaterMark;
      var writableHwm = options.writableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0) this.highWaterMark = hwm;
      else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;
      else this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.bufferedRequest = null;
      this.lastBufferedRequest = null;
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
      this.bufferedRequestCount = 0;
      this.corkedRequestsFree = new CorkedRequest(this);
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest;
      var out = [];
      while (current) {
        out.push(current);
        current = current.next;
      }
      return out;
    };
    (function() {
      try {
        Object.defineProperty(WritableState.prototype, "buffer", {
          get: internalUtil.deprecate(function() {
            return this.getBuffer();
          }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
      } catch (_) {
      }
    })();
    var realHasInstance;
    if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
      realHasInstance = Function.prototype[Symbol.hasInstance];
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function(object) {
          if (realHasInstance.call(this, object)) return true;
          if (this !== Writable) return false;
          return object && object._writableState instanceof WritableState;
        }
      });
    } else {
      realHasInstance = function(object) {
        return object instanceof this;
      };
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
        return new Writable(options);
      }
      this._writableState = new WritableState(options, this);
      this.writable = true;
      if (options) {
        if (typeof options.write === "function") this._write = options.write;
        if (typeof options.writev === "function") this._writev = options.writev;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.final === "function") this._final = options.final;
      }
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      this.emit("error", new Error("Cannot pipe, not readable"));
    };
    function writeAfterEnd(stream, cb) {
      var er = new Error("write after end");
      stream.emit("error", er);
      pna.nextTick(cb, er);
    }
    function validChunk(stream, state, chunk, cb) {
      var valid = true;
      var er = false;
      if (chunk === null) {
        er = new TypeError("May not write null values to stream");
      } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      if (er) {
        stream.emit("error", er);
        pna.nextTick(cb, er);
        valid = false;
      }
      return valid;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      var isBuf = !state.objectMode && _isUint8Array(chunk);
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (isBuf) encoding = "buffer";
      else if (!encoding) encoding = state.defaultEncoding;
      if (typeof cb !== "function") cb = nop;
      if (state.ended) writeAfterEnd(this, cb);
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      var state = this._writableState;
      state.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string") encoding = encoding.toLowerCase();
      if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer2.from(chunk, encoding);
      }
      return chunk;
    }
    Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding);
        if (chunk !== newChunk) {
          isBuf = true;
          encoding = "buffer";
          chunk = newChunk;
        }
      }
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest;
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null
        };
        if (last) {
          last.next = state.lastBufferedRequest;
        } else {
          state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
      } else {
        doWrite(stream, state, false, len, chunk, encoding, cb);
      }
      return ret;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, sync, er, cb) {
      --state.pendingcb;
      if (sync) {
        pna.nextTick(cb, er);
        pna.nextTick(finishMaybe, stream, state);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
      } else {
        cb(er);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
        finishMaybe(stream, state);
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream, er) {
      var state = stream._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      onwriteStateUpdate(state);
      if (er) onwriteError(stream, state, sync, er, cb);
      else {
        var finished = needFinish(state);
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream, state);
        }
        if (sync) {
          asyncWrite(afterWrite, stream, state, finished, cb);
        } else {
          afterWrite(stream, state, finished, cb);
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished) onwriteDrain(stream, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream, state);
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true;
      var entry = state.bufferedRequest;
      if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
          buffer[count] = entry;
          if (!entry.isBuf) allBuffers = false;
          entry = entry.next;
          count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state, true, state.length, buffer, "", holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
      } else {
        while (entry) {
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, cb);
          entry = entry.next;
          state.bufferedRequestCount--;
          if (state.writing) {
            break;
          }
        }
        if (entry === null) state.lastBufferedRequest = null;
      }
      state.bufferedRequest = entry;
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new Error("_write() is not implemented"));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending) endWritable(this, state, cb);
    };
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
    }
    function callFinal(stream, state) {
      stream._final(function(err) {
        state.pendingcb--;
        if (err) {
          stream.emit("error", err);
        }
        state.prefinished = true;
        stream.emit("prefinish");
        finishMaybe(stream, state);
      });
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function") {
          state.pendingcb++;
          state.finalCalled = true;
          pna.nextTick(callFinal, stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(state);
      if (need) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          state.finished = true;
          stream.emit("finish");
        }
      }
      return need;
    }
    function endWritable(stream, state, cb) {
      state.ending = true;
      finishMaybe(stream, state);
      if (cb) {
        if (state.finished) pna.nextTick(cb);
        else stream.once("finish", cb);
      }
      state.ended = true;
      stream.writable = false;
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry;
      corkReq.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      state.corkedRequestsFree.next = corkReq;
    }
    Object.defineProperty(Writable.prototype, "destroyed", {
      get: function() {
        if (this._writableState === void 0) {
          return false;
        }
        return this._writableState.destroyed;
      },
      set: function(value) {
        if (!this._writableState) {
          return;
        }
        this._writableState.destroyed = value;
      }
    });
    Writable.prototype.destroy = destroyImpl.destroy;
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      this.end();
      cb(err);
    };
  }
});

// ../../node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_duplex.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    var objectKeys = Object.keys || function(obj) {
      var keys2 = [];
      for (var key in obj) {
        keys2.push(key);
      }
      return keys2;
    };
    module.exports = Duplex;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var Readable = require_stream_readable();
    var Writable = require_stream_writable();
    util.inherits(Duplex, Readable);
    {
      keys = objectKeys(Writable.prototype);
      for (v = 0; v < keys.length; v++) {
        method = keys[v];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    var keys;
    var method;
    var v;
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options && options.readable === false) this.readable = false;
      if (options && options.writable === false) this.writable = false;
      this.allowHalfOpen = true;
      if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
      this.once("end", onend);
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function onend() {
      if (this.allowHalfOpen || this._writableState.ended) return;
      pna.nextTick(onEndNT, this);
    }
    function onEndNT(self2) {
      self2.end();
    }
    Object.defineProperty(Duplex.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set: function(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    });
    Duplex.prototype._destroy = function(err, cb) {
      this.push(null);
      this.end();
      pna.nextTick(cb, err);
    };
  }
});

// ../../node_modules/string_decoder/node_modules/safe-buffer/index.js
var require_safe_buffer2 = __commonJS({
  "../../node_modules/string_decoder/node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = __require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// ../../node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "../../node_modules/string_decoder/lib/string_decoder.js"(exports) {
    "use strict";
    var Buffer2 = require_safe_buffer2().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc) return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried) return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0) return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0) return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127) return 0;
      else if (byte >> 5 === 6) return 2;
      else if (byte >> 4 === 14) return 3;
      else if (byte >> 3 === 30) return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self2, buf, i) {
      var j = buf.length - 1;
      if (j < i) return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2) nb = 0;
          else self2.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self2, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self2.lastNeed = 0;
        return "\uFFFD";
      }
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self2.lastNeed = 1;
          return "\uFFFD";
        }
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self2.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0) return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed) return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0) return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// ../../node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_readable.js"(exports, module) {
    "use strict";
    var pna = require_process_nextick_args();
    module.exports = Readable;
    var isArray = require_isarray();
    var Duplex;
    Readable.ReadableState = ReadableState;
    var EE = __require("events").EventEmitter;
    var EElistenerCount = function(emitter, type) {
      return emitter.listeners(type).length;
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var debugUtil = __require("util");
    var debug = void 0;
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog("stream");
    } else {
      debug = function() {
      };
    }
    var BufferList = require_BufferList();
    var destroyImpl = require_destroy();
    var StringDecoder;
    util.inherits(Readable, Stream);
    var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    function ReadableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
      var hwm = options.highWaterMark;
      var readableHwm = options.readableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0) this.highWaterMark = hwm;
      else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;
      else this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this.destroyed = false;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!(this instanceof Readable)) return new Readable(options);
      this._readableState = new ReadableState(options, this);
      this.readable = true;
      if (options) {
        if (typeof options.read === "function") this._read = options.read;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
      }
      Stream.call(this);
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0) {
          return false;
        }
        return this._readableState.destroyed;
      },
      set: function(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    });
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      this.push(null);
      cb(err);
    };
    Readable.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      var skipChunkCheck;
      if (!state.objectMode) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
          skipChunkCheck = true;
        }
      } else {
        skipChunkCheck = true;
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
    };
    Readable.prototype.unshift = function(chunk) {
      return readableAddChunk(this, chunk, null, true, false);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
      var state = stream._readableState;
      if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else {
        var er;
        if (!skipChunkCheck) er = chunkInvalid(state, chunk);
        if (er) {
          stream.emit("error", er);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk);
          }
          if (addToFront) {
            if (state.endEmitted) stream.emit("error", new Error("stream.unshift() after end event"));
            else addChunk(stream, state, chunk, true);
          } else if (state.ended) {
            stream.emit("error", new Error("stream.push() after EOF"));
          } else {
            state.reading = false;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
              else maybeReadMore(stream, state);
            } else {
              addChunk(stream, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.reading = false;
        }
      }
      return needMoreData(state);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit("data", chunk);
        stream.read(0);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if (state.needReadable) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    function chunkInvalid(state, chunk) {
      var er;
      if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      return er;
    }
    function needMoreData(state) {
      return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
    }
    Readable.prototype.isPaused = function() {
      return this._readableState.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
      this._readableState.decoder = new StringDecoder(enc);
      this._readableState.encoding = enc;
      return this;
    };
    var MAX_HWM = 8388608;
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended) return 0;
      if (state.objectMode) return 1;
      if (n !== n) {
        if (state.flowing && state.length) return state.buffer.head.data.length;
        else return state.length;
      }
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
      if (n <= state.length) return n;
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      }
      return state.length;
    }
    Readable.prototype.read = function(n) {
      debug("read", n);
      n = parseInt(n, 10);
      var state = this._readableState;
      var nOrig = n;
      if (n !== 0) state.emittedReadable = false;
      if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug("reading or ended", doRead);
      } else if (doRead) {
        debug("do read");
        state.reading = true;
        state.sync = true;
        if (state.length === 0) state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading) n = howMuchToRead(nOrig, state);
      }
      var ret;
      if (n > 0) ret = fromList(n, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = true;
        n = 0;
      } else {
        state.length -= n;
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n && state.ended) endReadable(this);
      }
      if (ret !== null) this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream, state) {
      if (state.ended) return;
      if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      emitReadable(stream);
    }
    function emitReadable(stream) {
      var state = stream._readableState;
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        if (state.sync) pna.nextTick(emitReadable_, stream);
        else emitReadable_(stream);
      }
    }
    function emitReadable_(stream) {
      debug("emit readable");
      stream.emit("readable");
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        pna.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      var len = state.length;
      while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
        else len = state.length;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      this.emit("error", new Error("_read() is not implemented"));
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) pna.nextTick(endFn);
      else src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on("drain", ondrain);
      var cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      var increasedAwaitDrain = false;
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        increasedAwaitDrain = false;
        var ret = dest.write(chunk);
        if (false === ret && !increasedAwaitDrain) {
          if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
            debug("false write response, pause", state.awaitDrain);
            state.awaitDrain++;
            increasedAwaitDrain = true;
          }
          src.pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0) dest.emit("error", er);
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function() {
        var state = src._readableState;
        debug("pipeOnDrain", state.awaitDrain);
        if (state.awaitDrain) state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      var state = this._readableState;
      var unpipeInfo = { hasUnpiped: false };
      if (state.pipesCount === 0) return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes) return this;
        if (!dest) dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest) dest.emit("unpipe", this, unpipeInfo);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) {
          dests[i].emit("unpipe", this, { hasUnpiped: false });
        }
        return this;
      }
      var index = indexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1) state.pipes = state.pipes[0];
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      if (ev === "data") {
        if (this._readableState.flowing !== false) this.resume();
      } else if (ev === "readable") {
        var state = this._readableState;
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.emittedReadable = false;
          if (!state.reading) {
            pna.nextTick(nReadingNextTick, this);
          } else if (state.length) {
            emitReadable(this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    function nReadingNextTick(self2) {
      debug("readable nexttick read 0");
      self2.read(0);
    }
    Readable.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = true;
        resume(this, state);
      }
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        pna.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      if (!state.reading) {
        debug("resume read 0");
        stream.read(0);
      }
      state.resumeScheduled = false;
      state.awaitDrain = 0;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (false !== this._readableState.flowing) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      return this;
    };
    function flow(stream) {
      var state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) {
      }
    }
    Readable.prototype.wrap = function(stream) {
      var _this = this;
      var state = this._readableState;
      var paused = false;
      stream.on("end", function() {
        debug("wrapped end");
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) _this.push(chunk);
        }
        _this.push(null);
      });
      stream.on("data", function(chunk) {
        debug("wrapped data");
        if (state.decoder) chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === void 0)) return;
        else if (!state.objectMode && (!chunk || !chunk.length)) return;
        var ret = _this.push(chunk);
        if (!ret) {
          paused = true;
          stream.pause();
        }
      });
      for (var i in stream) {
        if (this[i] === void 0 && typeof stream[i] === "function") {
          this[i] = /* @__PURE__ */ (function(method) {
            return function() {
              return stream[method].apply(stream, arguments);
            };
          })(i);
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
      }
      this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
          paused = false;
          stream.resume();
        }
      };
      return this;
    };
    Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._readableState.highWaterMark;
      }
    });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0) return null;
      var ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join("");
        else if (state.buffer.length === 1) ret = state.buffer.head.data;
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = fromListPartial(n, state.buffer, state.decoder);
      }
      return ret;
    }
    function fromListPartial(n, list, hasStrings) {
      var ret;
      if (n < list.head.data.length) {
        ret = list.head.data.slice(0, n);
        list.head.data = list.head.data.slice(n);
      } else if (n === list.head.data.length) {
        ret = list.shift();
      } else {
        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
      }
      return ret;
    }
    function copyFromBufferString(n, list) {
      var p = list.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;
        else ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) list.head = p.next;
            else list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function copyFromBuffer(n, list) {
      var ret = Buffer2.allocUnsafe(n);
      var p = list.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) list.head = p.next;
            else list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function endReadable(stream) {
      var state = stream._readableState;
      if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
      if (!state.endEmitted) {
        state.ended = true;
        pna.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit("end");
      }
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) return i;
      }
      return -1;
    }
  }
});

// ../../node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_transform.js"(exports, module) {
    "use strict";
    module.exports = Transform;
    var Duplex = require_stream_duplex();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(Transform, Duplex);
    function afterTransform(er, data) {
      var ts = this._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (!cb) {
        return this.emit("error", new Error("write callback called multiple times"));
      }
      ts.writechunk = null;
      ts.writecb = null;
      if (data != null)
        this.push(data);
      cb(er);
      var rs = this._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform)) return new Transform(options);
      Duplex.call(this, options);
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
      };
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      if (options) {
        if (typeof options.transform === "function") this._transform = options.transform;
        if (typeof options.flush === "function") this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function prefinish() {
      var _this = this;
      if (typeof this._flush === "function") {
        this._flush(function(er, data) {
          done(_this, er, data);
        });
      } else {
        done(this, null, null);
      }
    }
    Transform.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform.prototype._transform = function(chunk, encoding, cb) {
      throw new Error("_transform() is not implemented");
    };
    Transform.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
      }
    };
    Transform.prototype._read = function(n) {
      var ts = this._transformState;
      if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    Transform.prototype._destroy = function(err, cb) {
      var _this2 = this;
      Duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
        _this2.emit("close");
      });
    };
    function done(stream, er, data) {
      if (er) return stream.emit("error", er);
      if (data != null)
        stream.push(data);
      if (stream._writableState.length) throw new Error("Calling transform done when ws.length != 0");
      if (stream._transformState.transforming) throw new Error("Calling transform done when still transforming");
      return stream.push(null);
    }
  }
});

// ../../node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_passthrough.js"(exports, module) {
    "use strict";
    module.exports = PassThrough;
    var Transform = require_stream_transform();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// ../../node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  "../../node_modules/readable-stream/readable.js"(exports, module) {
    var Stream = __require("stream");
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module.exports = Stream;
      exports = module.exports = Stream.Readable;
      exports.Readable = Stream.Readable;
      exports.Writable = Stream.Writable;
      exports.Duplex = Stream.Duplex;
      exports.Transform = Stream.Transform;
      exports.PassThrough = Stream.PassThrough;
      exports.Stream = Stream;
    } else {
      exports = module.exports = require_stream_readable();
      exports.Stream = Stream || exports;
      exports.Readable = exports;
      exports.Writable = require_stream_writable();
      exports.Duplex = require_stream_duplex();
      exports.Transform = require_stream_transform();
      exports.PassThrough = require_stream_passthrough();
    }
  }
});

// ../../node_modules/jszip/lib/support.js
var require_support = __commonJS({
  "../../node_modules/jszip/lib/support.js"(exports) {
    "use strict";
    exports.base64 = true;
    exports.array = true;
    exports.string = true;
    exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
    exports.nodebuffer = typeof Buffer !== "undefined";
    exports.uint8array = typeof Uint8Array !== "undefined";
    if (typeof ArrayBuffer === "undefined") {
      exports.blob = false;
    } else {
      buffer = new ArrayBuffer(0);
      try {
        exports.blob = new Blob([buffer], {
          type: "application/zip"
        }).size === 0;
      } catch (e) {
        try {
          Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
          builder = new Builder();
          builder.append(buffer);
          exports.blob = builder.getBlob("application/zip").size === 0;
        } catch (e2) {
          exports.blob = false;
        }
      }
    }
    var buffer;
    var Builder;
    var builder;
    try {
      exports.nodestream = !!require_readable().Readable;
    } catch (e) {
      exports.nodestream = false;
    }
  }
});

// ../../node_modules/jszip/lib/base64.js
var require_base64 = __commonJS({
  "../../node_modules/jszip/lib/base64.js"(exports) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    exports.encode = function(input) {
      var output = [];
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0, len = input.length, remainingBytes = len;
      var isArray = utils.getTypeOf(input) !== "string";
      while (i < input.length) {
        remainingBytes = len - i;
        if (!isArray) {
          chr1 = input.charCodeAt(i++);
          chr2 = i < len ? input.charCodeAt(i++) : 0;
          chr3 = i < len ? input.charCodeAt(i++) : 0;
        } else {
          chr1 = input[i++];
          chr2 = i < len ? input[i++] : 0;
          chr3 = i < len ? input[i++] : 0;
        }
        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = remainingBytes > 1 ? (chr2 & 15) << 2 | chr3 >> 6 : 64;
        enc4 = remainingBytes > 2 ? chr3 & 63 : 64;
        output.push(_keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4));
      }
      return output.join("");
    };
    exports.decode = function(input) {
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0, resultIndex = 0;
      var dataUrlPrefix = "data:";
      if (input.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
        throw new Error("Invalid base64 input, it looks like a data url.");
      }
      input = input.replace(/[^A-Za-z0-9+/=]/g, "");
      var totalLength = input.length * 3 / 4;
      if (input.charAt(input.length - 1) === _keyStr.charAt(64)) {
        totalLength--;
      }
      if (input.charAt(input.length - 2) === _keyStr.charAt(64)) {
        totalLength--;
      }
      if (totalLength % 1 !== 0) {
        throw new Error("Invalid base64 input, bad content length.");
      }
      var output;
      if (support.uint8array) {
        output = new Uint8Array(totalLength | 0);
      } else {
        output = new Array(totalLength | 0);
      }
      while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        output[resultIndex++] = chr1;
        if (enc3 !== 64) {
          output[resultIndex++] = chr2;
        }
        if (enc4 !== 64) {
          output[resultIndex++] = chr3;
        }
      }
      return output;
    };
  }
});

// ../../node_modules/jszip/lib/nodejsUtils.js
var require_nodejsUtils = __commonJS({
  "../../node_modules/jszip/lib/nodejsUtils.js"(exports, module) {
    "use strict";
    module.exports = {
      /**
       * True if this is running in Nodejs, will be undefined in a browser.
       * In a browser, browserify won't include this file and the whole module
       * will be resolved an empty object.
       */
      isNode: typeof Buffer !== "undefined",
      /**
       * Create a new nodejs Buffer from an existing content.
       * @param {Object} data the data to pass to the constructor.
       * @param {String} encoding the encoding to use.
       * @return {Buffer} a new Buffer.
       */
      newBufferFrom: function(data, encoding) {
        if (Buffer.from && Buffer.from !== Uint8Array.from) {
          return Buffer.from(data, encoding);
        } else {
          if (typeof data === "number") {
            throw new Error('The "data" argument must not be a number');
          }
          return new Buffer(data, encoding);
        }
      },
      /**
       * Create a new nodejs Buffer with the specified size.
       * @param {Integer} size the size of the buffer.
       * @return {Buffer} a new Buffer.
       */
      allocBuffer: function(size) {
        if (Buffer.alloc) {
          return Buffer.alloc(size);
        } else {
          var buf = new Buffer(size);
          buf.fill(0);
          return buf;
        }
      },
      /**
       * Find out if an object is a Buffer.
       * @param {Object} b the object to test.
       * @return {Boolean} true if the object is a Buffer, false otherwise.
       */
      isBuffer: function(b) {
        return Buffer.isBuffer(b);
      },
      isStream: function(obj) {
        return obj && typeof obj.on === "function" && typeof obj.pause === "function" && typeof obj.resume === "function";
      }
    };
  }
});

// ../../node_modules/immediate/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/immediate/lib/index.js"(exports, module) {
    "use strict";
    var Mutation = global.MutationObserver || global.WebKitMutationObserver;
    var scheduleDrain;
    if (process.browser) {
      if (Mutation) {
        called = 0;
        observer = new Mutation(nextTick);
        element = global.document.createTextNode("");
        observer.observe(element, {
          characterData: true
        });
        scheduleDrain = function() {
          element.data = called = ++called % 2;
        };
      } else if (!global.setImmediate && typeof global.MessageChannel !== "undefined") {
        channel = new global.MessageChannel();
        channel.port1.onmessage = nextTick;
        scheduleDrain = function() {
          channel.port2.postMessage(0);
        };
      } else if ("document" in global && "onreadystatechange" in global.document.createElement("script")) {
        scheduleDrain = function() {
          var scriptEl = global.document.createElement("script");
          scriptEl.onreadystatechange = function() {
            nextTick();
            scriptEl.onreadystatechange = null;
            scriptEl.parentNode.removeChild(scriptEl);
            scriptEl = null;
          };
          global.document.documentElement.appendChild(scriptEl);
        };
      } else {
        scheduleDrain = function() {
          setTimeout(nextTick, 0);
        };
      }
    } else {
      scheduleDrain = function() {
        process.nextTick(nextTick);
      };
    }
    var called;
    var observer;
    var element;
    var channel;
    var draining;
    var queue = [];
    function nextTick() {
      draining = true;
      var i, oldQueue;
      var len = queue.length;
      while (len) {
        oldQueue = queue;
        queue = [];
        i = -1;
        while (++i < len) {
          oldQueue[i]();
        }
        len = queue.length;
      }
      draining = false;
    }
    module.exports = immediate;
    function immediate(task) {
      if (queue.push(task) === 1 && !draining) {
        scheduleDrain();
      }
    }
  }
});

// ../../node_modules/lie/lib/index.js
var require_lib2 = __commonJS({
  "../../node_modules/lie/lib/index.js"(exports, module) {
    "use strict";
    var immediate = require_lib();
    function INTERNAL() {
    }
    var handlers = {};
    var REJECTED = ["REJECTED"];
    var FULFILLED = ["FULFILLED"];
    var PENDING = ["PENDING"];
    if (!process.browser) {
      UNHANDLED = ["UNHANDLED"];
    }
    var UNHANDLED;
    module.exports = Promise2;
    function Promise2(resolver) {
      if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function");
      }
      this.state = PENDING;
      this.queue = [];
      this.outcome = void 0;
      if (!process.browser) {
        this.handled = UNHANDLED;
      }
      if (resolver !== INTERNAL) {
        safelyResolveThenable(this, resolver);
      }
    }
    Promise2.prototype.finally = function(callback) {
      if (typeof callback !== "function") {
        return this;
      }
      var p = this.constructor;
      return this.then(resolve2, reject2);
      function resolve2(value) {
        function yes() {
          return value;
        }
        return p.resolve(callback()).then(yes);
      }
      function reject2(reason) {
        function no() {
          throw reason;
        }
        return p.resolve(callback()).then(no);
      }
    };
    Promise2.prototype.catch = function(onRejected) {
      return this.then(null, onRejected);
    };
    Promise2.prototype.then = function(onFulfilled, onRejected) {
      if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
        return this;
      }
      var promise = new this.constructor(INTERNAL);
      if (!process.browser) {
        if (this.handled === UNHANDLED) {
          this.handled = null;
        }
      }
      if (this.state !== PENDING) {
        var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
        unwrap(promise, resolver, this.outcome);
      } else {
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
      }
      return promise;
    };
    function QueueItem(promise, onFulfilled, onRejected) {
      this.promise = promise;
      if (typeof onFulfilled === "function") {
        this.onFulfilled = onFulfilled;
        this.callFulfilled = this.otherCallFulfilled;
      }
      if (typeof onRejected === "function") {
        this.onRejected = onRejected;
        this.callRejected = this.otherCallRejected;
      }
    }
    QueueItem.prototype.callFulfilled = function(value) {
      handlers.resolve(this.promise, value);
    };
    QueueItem.prototype.otherCallFulfilled = function(value) {
      unwrap(this.promise, this.onFulfilled, value);
    };
    QueueItem.prototype.callRejected = function(value) {
      handlers.reject(this.promise, value);
    };
    QueueItem.prototype.otherCallRejected = function(value) {
      unwrap(this.promise, this.onRejected, value);
    };
    function unwrap(promise, func, value) {
      immediate(function() {
        var returnValue;
        try {
          returnValue = func(value);
        } catch (e) {
          return handlers.reject(promise, e);
        }
        if (returnValue === promise) {
          handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
        } else {
          handlers.resolve(promise, returnValue);
        }
      });
    }
    handlers.resolve = function(self2, value) {
      var result = tryCatch(getThen, value);
      if (result.status === "error") {
        return handlers.reject(self2, result.value);
      }
      var thenable = result.value;
      if (thenable) {
        safelyResolveThenable(self2, thenable);
      } else {
        self2.state = FULFILLED;
        self2.outcome = value;
        var i = -1;
        var len = self2.queue.length;
        while (++i < len) {
          self2.queue[i].callFulfilled(value);
        }
      }
      return self2;
    };
    handlers.reject = function(self2, error) {
      self2.state = REJECTED;
      self2.outcome = error;
      if (!process.browser) {
        if (self2.handled === UNHANDLED) {
          immediate(function() {
            if (self2.handled === UNHANDLED) {
              process.emit("unhandledRejection", error, self2);
            }
          });
        }
      }
      var i = -1;
      var len = self2.queue.length;
      while (++i < len) {
        self2.queue[i].callRejected(error);
      }
      return self2;
    };
    function getThen(obj) {
      var then = obj && obj.then;
      if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
        return function appyThen() {
          then.apply(obj, arguments);
        };
      }
    }
    function safelyResolveThenable(self2, thenable) {
      var called = false;
      function onError(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.reject(self2, value);
      }
      function onSuccess(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.resolve(self2, value);
      }
      function tryToUnwrap() {
        thenable(onSuccess, onError);
      }
      var result = tryCatch(tryToUnwrap);
      if (result.status === "error") {
        onError(result.value);
      }
    }
    function tryCatch(func, value) {
      var out = {};
      try {
        out.value = func(value);
        out.status = "success";
      } catch (e) {
        out.status = "error";
        out.value = e;
      }
      return out;
    }
    Promise2.resolve = resolve;
    function resolve(value) {
      if (value instanceof this) {
        return value;
      }
      return handlers.resolve(new this(INTERNAL), value);
    }
    Promise2.reject = reject;
    function reject(reason) {
      var promise = new this(INTERNAL);
      return handlers.reject(promise, reason);
    }
    Promise2.all = all;
    function all(iterable) {
      var self2 = this;
      if (Object.prototype.toString.call(iterable) !== "[object Array]") {
        return this.reject(new TypeError("must be an array"));
      }
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
      var values = new Array(len);
      var resolved = 0;
      var i = -1;
      var promise = new this(INTERNAL);
      while (++i < len) {
        allResolver(iterable[i], i);
      }
      return promise;
      function allResolver(value, i2) {
        self2.resolve(value).then(resolveFromAll, function(error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
        function resolveFromAll(outValue) {
          values[i2] = outValue;
          if (++resolved === len && !called) {
            called = true;
            handlers.resolve(promise, values);
          }
        }
      }
    }
    Promise2.race = race;
    function race(iterable) {
      var self2 = this;
      if (Object.prototype.toString.call(iterable) !== "[object Array]") {
        return this.reject(new TypeError("must be an array"));
      }
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
      var i = -1;
      var promise = new this(INTERNAL);
      while (++i < len) {
        resolver(iterable[i]);
      }
      return promise;
      function resolver(value) {
        self2.resolve(value).then(function(response) {
          if (!called) {
            called = true;
            handlers.resolve(promise, response);
          }
        }, function(error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
      }
    }
  }
});

// ../../node_modules/jszip/lib/external.js
var require_external = __commonJS({
  "../../node_modules/jszip/lib/external.js"(exports, module) {
    "use strict";
    var ES6Promise = null;
    if (typeof Promise !== "undefined") {
      ES6Promise = Promise;
    } else {
      ES6Promise = require_lib2();
    }
    module.exports = {
      Promise: ES6Promise
    };
  }
});

// ../../node_modules/setimmediate/setImmediate.js
var require_setImmediate = __commonJS({
  "../../node_modules/setimmediate/setImmediate.js"(exports) {
    (function(global2, undefined2) {
      "use strict";
      if (global2.setImmediate) {
        return;
      }
      var nextHandle = 1;
      var tasksByHandle = {};
      var currentlyRunningATask = false;
      var doc = global2.document;
      var registerImmediate;
      function setImmediate2(callback) {
        if (typeof callback !== "function") {
          callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
        }
        var task = { callback, args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
      }
      function clearImmediate(handle) {
        delete tasksByHandle[handle];
      }
      function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
          case 0:
            callback();
            break;
          case 1:
            callback(args[0]);
            break;
          case 2:
            callback(args[0], args[1]);
            break;
          case 3:
            callback(args[0], args[1], args[2]);
            break;
          default:
            callback.apply(undefined2, args);
            break;
        }
      }
      function runIfPresent(handle) {
        if (currentlyRunningATask) {
          setTimeout(runIfPresent, 0, handle);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunningATask = true;
            try {
              run(task);
            } finally {
              clearImmediate(handle);
              currentlyRunningATask = false;
            }
          }
        }
      }
      function installNextTickImplementation() {
        registerImmediate = function(handle) {
          process.nextTick(function() {
            runIfPresent(handle);
          });
        };
      }
      function canUsePostMessage() {
        if (global2.postMessage && !global2.importScripts) {
          var postMessageIsAsynchronous = true;
          var oldOnMessage = global2.onmessage;
          global2.onmessage = function() {
            postMessageIsAsynchronous = false;
          };
          global2.postMessage("", "*");
          global2.onmessage = oldOnMessage;
          return postMessageIsAsynchronous;
        }
      }
      function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
          if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
            runIfPresent(+event.data.slice(messagePrefix.length));
          }
        };
        if (global2.addEventListener) {
          global2.addEventListener("message", onGlobalMessage, false);
        } else {
          global2.attachEvent("onmessage", onGlobalMessage);
        }
        registerImmediate = function(handle) {
          global2.postMessage(messagePrefix + handle, "*");
        };
      }
      function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
          var handle = event.data;
          runIfPresent(handle);
        };
        registerImmediate = function(handle) {
          channel.port2.postMessage(handle);
        };
      }
      function installReadyStateChangeImplementation() {
        var html2 = doc.documentElement;
        registerImmediate = function(handle) {
          var script = doc.createElement("script");
          script.onreadystatechange = function() {
            runIfPresent(handle);
            script.onreadystatechange = null;
            html2.removeChild(script);
            script = null;
          };
          html2.appendChild(script);
        };
      }
      function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
          setTimeout(runIfPresent, 0, handle);
        };
      }
      var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
      attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
      if ({}.toString.call(global2.process) === "[object process]") {
        installNextTickImplementation();
      } else if (canUsePostMessage()) {
        installPostMessageImplementation();
      } else if (global2.MessageChannel) {
        installMessageChannelImplementation();
      } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
      } else {
        installSetTimeoutImplementation();
      }
      attachTo.setImmediate = setImmediate2;
      attachTo.clearImmediate = clearImmediate;
    })(typeof self === "undefined" ? typeof global === "undefined" ? exports : global : self);
  }
});

// ../../node_modules/jszip/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/jszip/lib/utils.js"(exports) {
    "use strict";
    var support = require_support();
    var base64 = require_base64();
    var nodejsUtils = require_nodejsUtils();
    var external = require_external();
    require_setImmediate();
    function string2binary(str) {
      var result = null;
      if (support.uint8array) {
        result = new Uint8Array(str.length);
      } else {
        result = new Array(str.length);
      }
      return stringToArrayLike(str, result);
    }
    exports.newBlob = function(part, type) {
      exports.checkSupport("blob");
      try {
        return new Blob([part], {
          type
        });
      } catch (e) {
        try {
          var Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
          var builder = new Builder();
          builder.append(part);
          return builder.getBlob(type);
        } catch (e2) {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    function identity(input) {
      return input;
    }
    function stringToArrayLike(str, array) {
      for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 255;
      }
      return array;
    }
    var arrayToStringHelper = {
      /**
       * Transform an array of int into a string, chunk by chunk.
       * See the performances notes on arrayLikeToString.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @param {String} type the type of the array.
       * @param {Integer} chunk the chunk size.
       * @return {String} the resulting string.
       * @throws Error if the chunk is too big for the stack.
       */
      stringifyByChunk: function(array, type, chunk) {
        var result = [], k = 0, len = array.length;
        if (len <= chunk) {
          return String.fromCharCode.apply(null, array);
        }
        while (k < len) {
          if (type === "array" || type === "nodebuffer") {
            result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
          } else {
            result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
          }
          k += chunk;
        }
        return result.join("");
      },
      /**
       * Call String.fromCharCode on every item in the array.
       * This is the naive implementation, which generate A LOT of intermediate string.
       * This should be used when everything else fail.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @return {String} the result.
       */
      stringifyByChar: function(array) {
        var resultStr = "";
        for (var i = 0; i < array.length; i++) {
          resultStr += String.fromCharCode(array[i]);
        }
        return resultStr;
      },
      applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: (function() {
          try {
            return support.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch (e) {
            return false;
          }
        })(),
        /**
         * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
         */
        nodebuffer: (function() {
          try {
            return support.nodebuffer && String.fromCharCode.apply(null, nodejsUtils.allocBuffer(1)).length === 1;
          } catch (e) {
            return false;
          }
        })()
      }
    };
    function arrayLikeToString(array) {
      var chunk = 65536, type = exports.getTypeOf(array), canUseApply = true;
      if (type === "uint8array") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
      } else if (type === "nodebuffer") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.nodebuffer;
      }
      if (canUseApply) {
        while (chunk > 1) {
          try {
            return arrayToStringHelper.stringifyByChunk(array, type, chunk);
          } catch (e) {
            chunk = Math.floor(chunk / 2);
          }
        }
      }
      return arrayToStringHelper.stringifyByChar(array);
    }
    exports.applyFromCharCode = arrayLikeToString;
    function arrayLikeToArrayLike(arrayFrom, arrayTo) {
      for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
      }
      return arrayTo;
    }
    var transform = {};
    transform["string"] = {
      "string": identity,
      "array": function(input) {
        return stringToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["string"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": function(input) {
        return stringToArrayLike(input, nodejsUtils.allocBuffer(input.length));
      }
    };
    transform["array"] = {
      "string": arrayLikeToString,
      "array": identity,
      "arraybuffer": function(input) {
        return new Uint8Array(input).buffer;
      },
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(input);
      }
    };
    transform["arraybuffer"] = {
      "string": function(input) {
        return arrayLikeToString(new Uint8Array(input));
      },
      "array": function(input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
      },
      "arraybuffer": identity,
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(new Uint8Array(input));
      }
    };
    transform["uint8array"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return input.buffer;
      },
      "uint8array": identity,
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(input);
      }
    };
    transform["nodebuffer"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["nodebuffer"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return arrayLikeToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": identity
    };
    exports.transformTo = function(outputType, input) {
      if (!input) {
        input = "";
      }
      if (!outputType) {
        return input;
      }
      exports.checkSupport(outputType);
      var inputType = exports.getTypeOf(input);
      var result = transform[inputType][outputType](input);
      return result;
    };
    exports.resolve = function(path4) {
      var parts = path4.split("/");
      var result = [];
      for (var index = 0; index < parts.length; index++) {
        var part = parts[index];
        if (part === "." || part === "" && index !== 0 && index !== parts.length - 1) {
          continue;
        } else if (part === "..") {
          result.pop();
        } else {
          result.push(part);
        }
      }
      return result.join("/");
    };
    exports.getTypeOf = function(input) {
      if (typeof input === "string") {
        return "string";
      }
      if (Object.prototype.toString.call(input) === "[object Array]") {
        return "array";
      }
      if (support.nodebuffer && nodejsUtils.isBuffer(input)) {
        return "nodebuffer";
      }
      if (support.uint8array && input instanceof Uint8Array) {
        return "uint8array";
      }
      if (support.arraybuffer && input instanceof ArrayBuffer) {
        return "arraybuffer";
      }
    };
    exports.checkSupport = function(type) {
      var supported = support[type.toLowerCase()];
      if (!supported) {
        throw new Error(type + " is not supported by this platform");
      }
    };
    exports.MAX_VALUE_16BITS = 65535;
    exports.MAX_VALUE_32BITS = -1;
    exports.pretty = function(str) {
      var res = "", code, i;
      for (i = 0; i < (str || "").length; i++) {
        code = str.charCodeAt(i);
        res += "\\x" + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
      }
      return res;
    };
    exports.delay = function(callback, args, self2) {
      setImmediate(function() {
        callback.apply(self2 || null, args || []);
      });
    };
    exports.inherits = function(ctor, superCtor) {
      var Obj = function() {
      };
      Obj.prototype = superCtor.prototype;
      ctor.prototype = new Obj();
    };
    exports.extend = function() {
      var result = {}, i, attr;
      for (i = 0; i < arguments.length; i++) {
        for (attr in arguments[i]) {
          if (Object.prototype.hasOwnProperty.call(arguments[i], attr) && typeof result[attr] === "undefined") {
            result[attr] = arguments[i][attr];
          }
        }
      }
      return result;
    };
    exports.prepareContent = function(name, inputData, isBinary, isOptimizedBinaryString, isBase64) {
      var promise = external.Promise.resolve(inputData).then(function(data) {
        var isBlob = support.blob && (data instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(data)) !== -1);
        if (isBlob && typeof FileReader !== "undefined") {
          return new external.Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
              resolve(e.target.result);
            };
            reader.onerror = function(e) {
              reject(e.target.error);
            };
            reader.readAsArrayBuffer(data);
          });
        } else {
          return data;
        }
      });
      return promise.then(function(data) {
        var dataType = exports.getTypeOf(data);
        if (!dataType) {
          return external.Promise.reject(
            new Error("Can't read the data of '" + name + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")
          );
        }
        if (dataType === "arraybuffer") {
          data = exports.transformTo("uint8array", data);
        } else if (dataType === "string") {
          if (isBase64) {
            data = base64.decode(data);
          } else if (isBinary) {
            if (isOptimizedBinaryString !== true) {
              data = string2binary(data);
            }
          }
        }
        return data;
      });
    };
  }
});

// ../../node_modules/jszip/lib/stream/GenericWorker.js
var require_GenericWorker = __commonJS({
  "../../node_modules/jszip/lib/stream/GenericWorker.js"(exports, module) {
    "use strict";
    function GenericWorker(name) {
      this.name = name || "default";
      this.streamInfo = {};
      this.generatedError = null;
      this.extraStreamInfo = {};
      this.isPaused = true;
      this.isFinished = false;
      this.isLocked = false;
      this._listeners = {
        "data": [],
        "end": [],
        "error": []
      };
      this.previous = null;
    }
    GenericWorker.prototype = {
      /**
       * Push a chunk to the next workers.
       * @param {Object} chunk the chunk to push
       */
      push: function(chunk) {
        this.emit("data", chunk);
      },
      /**
       * End the stream.
       * @return {Boolean} true if this call ended the worker, false otherwise.
       */
      end: function() {
        if (this.isFinished) {
          return false;
        }
        this.flush();
        try {
          this.emit("end");
          this.cleanUp();
          this.isFinished = true;
        } catch (e) {
          this.emit("error", e);
        }
        return true;
      },
      /**
       * End the stream with an error.
       * @param {Error} e the error which caused the premature end.
       * @return {Boolean} true if this call ended the worker with an error, false otherwise.
       */
      error: function(e) {
        if (this.isFinished) {
          return false;
        }
        if (this.isPaused) {
          this.generatedError = e;
        } else {
          this.isFinished = true;
          this.emit("error", e);
          if (this.previous) {
            this.previous.error(e);
          }
          this.cleanUp();
        }
        return true;
      },
      /**
       * Add a callback on an event.
       * @param {String} name the name of the event (data, end, error)
       * @param {Function} listener the function to call when the event is triggered
       * @return {GenericWorker} the current object for chainability
       */
      on: function(name, listener) {
        this._listeners[name].push(listener);
        return this;
      },
      /**
       * Clean any references when a worker is ending.
       */
      cleanUp: function() {
        this.streamInfo = this.generatedError = this.extraStreamInfo = null;
        this._listeners = [];
      },
      /**
       * Trigger an event. This will call registered callback with the provided arg.
       * @param {String} name the name of the event (data, end, error)
       * @param {Object} arg the argument to call the callback with.
       */
      emit: function(name, arg) {
        if (this._listeners[name]) {
          for (var i = 0; i < this._listeners[name].length; i++) {
            this._listeners[name][i].call(this, arg);
          }
        }
      },
      /**
       * Chain a worker with an other.
       * @param {Worker} next the worker receiving events from the current one.
       * @return {worker} the next worker for chainability
       */
      pipe: function(next) {
        return next.registerPrevious(this);
      },
      /**
       * Same as `pipe` in the other direction.
       * Using an API with `pipe(next)` is very easy.
       * Implementing the API with the point of view of the next one registering
       * a source is easier, see the ZipFileWorker.
       * @param {Worker} previous the previous worker, sending events to this one
       * @return {Worker} the current worker for chainability
       */
      registerPrevious: function(previous) {
        if (this.isLocked) {
          throw new Error("The stream '" + this + "' has already been used.");
        }
        this.streamInfo = previous.streamInfo;
        this.mergeStreamInfo();
        this.previous = previous;
        var self2 = this;
        previous.on("data", function(chunk) {
          self2.processChunk(chunk);
        });
        previous.on("end", function() {
          self2.end();
        });
        previous.on("error", function(e) {
          self2.error(e);
        });
        return this;
      },
      /**
       * Pause the stream so it doesn't send events anymore.
       * @return {Boolean} true if this call paused the worker, false otherwise.
       */
      pause: function() {
        if (this.isPaused || this.isFinished) {
          return false;
        }
        this.isPaused = true;
        if (this.previous) {
          this.previous.pause();
        }
        return true;
      },
      /**
       * Resume a paused stream.
       * @return {Boolean} true if this call resumed the worker, false otherwise.
       */
      resume: function() {
        if (!this.isPaused || this.isFinished) {
          return false;
        }
        this.isPaused = false;
        var withError = false;
        if (this.generatedError) {
          this.error(this.generatedError);
          withError = true;
        }
        if (this.previous) {
          this.previous.resume();
        }
        return !withError;
      },
      /**
       * Flush any remaining bytes as the stream is ending.
       */
      flush: function() {
      },
      /**
       * Process a chunk. This is usually the method overridden.
       * @param {Object} chunk the chunk to process.
       */
      processChunk: function(chunk) {
        this.push(chunk);
      },
      /**
       * Add a key/value to be added in the workers chain streamInfo once activated.
       * @param {String} key the key to use
       * @param {Object} value the associated value
       * @return {Worker} the current worker for chainability
       */
      withStreamInfo: function(key, value) {
        this.extraStreamInfo[key] = value;
        this.mergeStreamInfo();
        return this;
      },
      /**
       * Merge this worker's streamInfo into the chain's streamInfo.
       */
      mergeStreamInfo: function() {
        for (var key in this.extraStreamInfo) {
          if (!Object.prototype.hasOwnProperty.call(this.extraStreamInfo, key)) {
            continue;
          }
          this.streamInfo[key] = this.extraStreamInfo[key];
        }
      },
      /**
       * Lock the stream to prevent further updates on the workers chain.
       * After calling this method, all calls to pipe will fail.
       */
      lock: function() {
        if (this.isLocked) {
          throw new Error("The stream '" + this + "' has already been used.");
        }
        this.isLocked = true;
        if (this.previous) {
          this.previous.lock();
        }
      },
      /**
       *
       * Pretty print the workers chain.
       */
      toString: function() {
        var me = "Worker " + this.name;
        if (this.previous) {
          return this.previous + " -> " + me;
        } else {
          return me;
        }
      }
    };
    module.exports = GenericWorker;
  }
});

// ../../node_modules/jszip/lib/utf8.js
var require_utf8 = __commonJS({
  "../../node_modules/jszip/lib/utf8.js"(exports) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var nodejsUtils = require_nodejsUtils();
    var GenericWorker = require_GenericWorker();
    var _utf8len = new Array(256);
    for (i = 0; i < 256; i++) {
      _utf8len[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;
    }
    var i;
    _utf8len[254] = _utf8len[254] = 1;
    var string2buf = function(str) {
      var buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      if (support.uint8array) {
        buf = new Uint8Array(buf_len);
      } else {
        buf = new Array(buf_len);
      }
      for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i2++] = c;
        } else if (c < 2048) {
          buf[i2++] = 192 | c >>> 6;
          buf[i2++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i2++] = 224 | c >>> 12;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        } else {
          buf[i2++] = 240 | c >>> 18;
          buf[i2++] = 128 | c >>> 12 & 63;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        }
      }
      return buf;
    };
    var utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
    var buf2string = function(buf) {
      var i2, out, c, c_len;
      var len = buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i2 = 0; i2 < len; ) {
        c = buf[i2++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i2 += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i2 < len) {
          c = c << 6 | buf[i2++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      if (utf16buf.length !== out) {
        if (utf16buf.subarray) {
          utf16buf = utf16buf.subarray(0, out);
        } else {
          utf16buf.length = out;
        }
      }
      return utils.applyFromCharCode(utf16buf);
    };
    exports.utf8encode = function utf8encode(str) {
      if (support.nodebuffer) {
        return nodejsUtils.newBufferFrom(str, "utf-8");
      }
      return string2buf(str);
    };
    exports.utf8decode = function utf8decode(buf) {
      if (support.nodebuffer) {
        return utils.transformTo("nodebuffer", buf).toString("utf-8");
      }
      buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);
      return buf2string(buf);
    };
    function Utf8DecodeWorker() {
      GenericWorker.call(this, "utf-8 decode");
      this.leftOver = null;
    }
    utils.inherits(Utf8DecodeWorker, GenericWorker);
    Utf8DecodeWorker.prototype.processChunk = function(chunk) {
      var data = utils.transformTo(support.uint8array ? "uint8array" : "array", chunk.data);
      if (this.leftOver && this.leftOver.length) {
        if (support.uint8array) {
          var previousData = data;
          data = new Uint8Array(previousData.length + this.leftOver.length);
          data.set(this.leftOver, 0);
          data.set(previousData, this.leftOver.length);
        } else {
          data = this.leftOver.concat(data);
        }
        this.leftOver = null;
      }
      var nextBoundary = utf8border(data);
      var usableData = data;
      if (nextBoundary !== data.length) {
        if (support.uint8array) {
          usableData = data.subarray(0, nextBoundary);
          this.leftOver = data.subarray(nextBoundary, data.length);
        } else {
          usableData = data.slice(0, nextBoundary);
          this.leftOver = data.slice(nextBoundary, data.length);
        }
      }
      this.push({
        data: exports.utf8decode(usableData),
        meta: chunk.meta
      });
    };
    Utf8DecodeWorker.prototype.flush = function() {
      if (this.leftOver && this.leftOver.length) {
        this.push({
          data: exports.utf8decode(this.leftOver),
          meta: {}
        });
        this.leftOver = null;
      }
    };
    exports.Utf8DecodeWorker = Utf8DecodeWorker;
    function Utf8EncodeWorker() {
      GenericWorker.call(this, "utf-8 encode");
    }
    utils.inherits(Utf8EncodeWorker, GenericWorker);
    Utf8EncodeWorker.prototype.processChunk = function(chunk) {
      this.push({
        data: exports.utf8encode(chunk.data),
        meta: chunk.meta
      });
    };
    exports.Utf8EncodeWorker = Utf8EncodeWorker;
  }
});

// ../../node_modules/jszip/lib/stream/ConvertWorker.js
var require_ConvertWorker = __commonJS({
  "../../node_modules/jszip/lib/stream/ConvertWorker.js"(exports, module) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    var utils = require_utils();
    function ConvertWorker(destType) {
      GenericWorker.call(this, "ConvertWorker to " + destType);
      this.destType = destType;
    }
    utils.inherits(ConvertWorker, GenericWorker);
    ConvertWorker.prototype.processChunk = function(chunk) {
      this.push({
        data: utils.transformTo(this.destType, chunk.data),
        meta: chunk.meta
      });
    };
    module.exports = ConvertWorker;
  }
});

// ../../node_modules/jszip/lib/nodejs/NodejsStreamOutputAdapter.js
var require_NodejsStreamOutputAdapter = __commonJS({
  "../../node_modules/jszip/lib/nodejs/NodejsStreamOutputAdapter.js"(exports, module) {
    "use strict";
    var Readable = require_readable().Readable;
    var utils = require_utils();
    utils.inherits(NodejsStreamOutputAdapter, Readable);
    function NodejsStreamOutputAdapter(helper, options, updateCb) {
      Readable.call(this, options);
      this._helper = helper;
      var self2 = this;
      helper.on("data", function(data, meta) {
        if (!self2.push(data)) {
          self2._helper.pause();
        }
        if (updateCb) {
          updateCb(meta);
        }
      }).on("error", function(e) {
        self2.emit("error", e);
      }).on("end", function() {
        self2.push(null);
      });
    }
    NodejsStreamOutputAdapter.prototype._read = function() {
      this._helper.resume();
    };
    module.exports = NodejsStreamOutputAdapter;
  }
});

// ../../node_modules/jszip/lib/stream/StreamHelper.js
var require_StreamHelper = __commonJS({
  "../../node_modules/jszip/lib/stream/StreamHelper.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var ConvertWorker = require_ConvertWorker();
    var GenericWorker = require_GenericWorker();
    var base64 = require_base64();
    var support = require_support();
    var external = require_external();
    var NodejsStreamOutputAdapter = null;
    if (support.nodestream) {
      try {
        NodejsStreamOutputAdapter = require_NodejsStreamOutputAdapter();
      } catch (e) {
      }
    }
    function transformZipOutput(type, content, mimeType) {
      switch (type) {
        case "blob":
          return utils.newBlob(utils.transformTo("arraybuffer", content), mimeType);
        case "base64":
          return base64.encode(content);
        default:
          return utils.transformTo(type, content);
      }
    }
    function concat(type, dataArray) {
      var i, index = 0, res = null, totalLength = 0;
      for (i = 0; i < dataArray.length; i++) {
        totalLength += dataArray[i].length;
      }
      switch (type) {
        case "string":
          return dataArray.join("");
        case "array":
          return Array.prototype.concat.apply([], dataArray);
        case "uint8array":
          res = new Uint8Array(totalLength);
          for (i = 0; i < dataArray.length; i++) {
            res.set(dataArray[i], index);
            index += dataArray[i].length;
          }
          return res;
        case "nodebuffer":
          return Buffer.concat(dataArray);
        default:
          throw new Error("concat : unsupported type '" + type + "'");
      }
    }
    function accumulate(helper, updateCallback) {
      return new external.Promise(function(resolve, reject) {
        var dataArray = [];
        var chunkType = helper._internalType, resultType = helper._outputType, mimeType = helper._mimeType;
        helper.on("data", function(data, meta) {
          dataArray.push(data);
          if (updateCallback) {
            updateCallback(meta);
          }
        }).on("error", function(err) {
          dataArray = [];
          reject(err);
        }).on("end", function() {
          try {
            var result = transformZipOutput(resultType, concat(chunkType, dataArray), mimeType);
            resolve(result);
          } catch (e) {
            reject(e);
          }
          dataArray = [];
        }).resume();
      });
    }
    function StreamHelper(worker, outputType, mimeType) {
      var internalType = outputType;
      switch (outputType) {
        case "blob":
        case "arraybuffer":
          internalType = "uint8array";
          break;
        case "base64":
          internalType = "string";
          break;
      }
      try {
        this._internalType = internalType;
        this._outputType = outputType;
        this._mimeType = mimeType;
        utils.checkSupport(internalType);
        this._worker = worker.pipe(new ConvertWorker(internalType));
        worker.lock();
      } catch (e) {
        this._worker = new GenericWorker("error");
        this._worker.error(e);
      }
    }
    StreamHelper.prototype = {
      /**
       * Listen a StreamHelper, accumulate its content and concatenate it into a
       * complete block.
       * @param {Function} updateCb the update callback.
       * @return Promise the promise for the accumulation.
       */
      accumulate: function(updateCb) {
        return accumulate(this, updateCb);
      },
      /**
       * Add a listener on an event triggered on a stream.
       * @param {String} evt the name of the event
       * @param {Function} fn the listener
       * @return {StreamHelper} the current helper.
       */
      on: function(evt, fn) {
        var self2 = this;
        if (evt === "data") {
          this._worker.on(evt, function(chunk) {
            fn.call(self2, chunk.data, chunk.meta);
          });
        } else {
          this._worker.on(evt, function() {
            utils.delay(fn, arguments, self2);
          });
        }
        return this;
      },
      /**
       * Resume the flow of chunks.
       * @return {StreamHelper} the current helper.
       */
      resume: function() {
        utils.delay(this._worker.resume, [], this._worker);
        return this;
      },
      /**
       * Pause the flow of chunks.
       * @return {StreamHelper} the current helper.
       */
      pause: function() {
        this._worker.pause();
        return this;
      },
      /**
       * Return a nodejs stream for this helper.
       * @param {Function} updateCb the update callback.
       * @return {NodejsStreamOutputAdapter} the nodejs stream.
       */
      toNodejsStream: function(updateCb) {
        utils.checkSupport("nodestream");
        if (this._outputType !== "nodebuffer") {
          throw new Error(this._outputType + " is not supported by this method");
        }
        return new NodejsStreamOutputAdapter(this, {
          objectMode: this._outputType !== "nodebuffer"
        }, updateCb);
      }
    };
    module.exports = StreamHelper;
  }
});

// ../../node_modules/jszip/lib/defaults.js
var require_defaults = __commonJS({
  "../../node_modules/jszip/lib/defaults.js"(exports) {
    "use strict";
    exports.base64 = false;
    exports.binary = false;
    exports.dir = false;
    exports.createFolders = true;
    exports.date = null;
    exports.compression = null;
    exports.compressionOptions = null;
    exports.comment = null;
    exports.unixPermissions = null;
    exports.dosPermissions = null;
  }
});

// ../../node_modules/jszip/lib/stream/DataWorker.js
var require_DataWorker = __commonJS({
  "../../node_modules/jszip/lib/stream/DataWorker.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var DEFAULT_BLOCK_SIZE = 16 * 1024;
    function DataWorker(dataP) {
      GenericWorker.call(this, "DataWorker");
      var self2 = this;
      this.dataIsReady = false;
      this.index = 0;
      this.max = 0;
      this.data = null;
      this.type = "";
      this._tickScheduled = false;
      dataP.then(function(data) {
        self2.dataIsReady = true;
        self2.data = data;
        self2.max = data && data.length || 0;
        self2.type = utils.getTypeOf(data);
        if (!self2.isPaused) {
          self2._tickAndRepeat();
        }
      }, function(e) {
        self2.error(e);
      });
    }
    utils.inherits(DataWorker, GenericWorker);
    DataWorker.prototype.cleanUp = function() {
      GenericWorker.prototype.cleanUp.call(this);
      this.data = null;
    };
    DataWorker.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (!this._tickScheduled && this.dataIsReady) {
        this._tickScheduled = true;
        utils.delay(this._tickAndRepeat, [], this);
      }
      return true;
    };
    DataWorker.prototype._tickAndRepeat = function() {
      this._tickScheduled = false;
      if (this.isPaused || this.isFinished) {
        return;
      }
      this._tick();
      if (!this.isFinished) {
        utils.delay(this._tickAndRepeat, [], this);
        this._tickScheduled = true;
      }
    };
    DataWorker.prototype._tick = function() {
      if (this.isPaused || this.isFinished) {
        return false;
      }
      var size = DEFAULT_BLOCK_SIZE;
      var data = null, nextIndex = Math.min(this.max, this.index + size);
      if (this.index >= this.max) {
        return this.end();
      } else {
        switch (this.type) {
          case "string":
            data = this.data.substring(this.index, nextIndex);
            break;
          case "uint8array":
            data = this.data.subarray(this.index, nextIndex);
            break;
          case "array":
          case "nodebuffer":
            data = this.data.slice(this.index, nextIndex);
            break;
        }
        this.index = nextIndex;
        return this.push({
          data,
          meta: {
            percent: this.max ? this.index / this.max * 100 : 0
          }
        });
      }
    };
    module.exports = DataWorker;
  }
});

// ../../node_modules/jszip/lib/crc32.js
var require_crc32 = __commonJS({
  "../../node_modules/jszip/lib/crc32.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t2 = crcTable, end = pos + len;
      crc = crc ^ -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t2[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    function crc32str(crc, str, len, pos) {
      var t2 = crcTable, end = pos + len;
      crc = crc ^ -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t2[(crc ^ str.charCodeAt(i)) & 255];
      }
      return crc ^ -1;
    }
    module.exports = function crc32wrapper(input, crc) {
      if (typeof input === "undefined" || !input.length) {
        return 0;
      }
      var isArray = utils.getTypeOf(input) !== "string";
      if (isArray) {
        return crc32(crc | 0, input, input.length, 0);
      } else {
        return crc32str(crc | 0, input, input.length, 0);
      }
    };
  }
});

// ../../node_modules/jszip/lib/stream/Crc32Probe.js
var require_Crc32Probe = __commonJS({
  "../../node_modules/jszip/lib/stream/Crc32Probe.js"(exports, module) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    var crc32 = require_crc32();
    var utils = require_utils();
    function Crc32Probe() {
      GenericWorker.call(this, "Crc32Probe");
      this.withStreamInfo("crc32", 0);
    }
    utils.inherits(Crc32Probe, GenericWorker);
    Crc32Probe.prototype.processChunk = function(chunk) {
      this.streamInfo.crc32 = crc32(chunk.data, this.streamInfo.crc32 || 0);
      this.push(chunk);
    };
    module.exports = Crc32Probe;
  }
});

// ../../node_modules/jszip/lib/stream/DataLengthProbe.js
var require_DataLengthProbe = __commonJS({
  "../../node_modules/jszip/lib/stream/DataLengthProbe.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    function DataLengthProbe(propName) {
      GenericWorker.call(this, "DataLengthProbe for " + propName);
      this.propName = propName;
      this.withStreamInfo(propName, 0);
    }
    utils.inherits(DataLengthProbe, GenericWorker);
    DataLengthProbe.prototype.processChunk = function(chunk) {
      if (chunk) {
        var length = this.streamInfo[this.propName] || 0;
        this.streamInfo[this.propName] = length + chunk.data.length;
      }
      GenericWorker.prototype.processChunk.call(this, chunk);
    };
    module.exports = DataLengthProbe;
  }
});

// ../../node_modules/jszip/lib/compressedObject.js
var require_compressedObject = __commonJS({
  "../../node_modules/jszip/lib/compressedObject.js"(exports, module) {
    "use strict";
    var external = require_external();
    var DataWorker = require_DataWorker();
    var Crc32Probe = require_Crc32Probe();
    var DataLengthProbe = require_DataLengthProbe();
    function CompressedObject(compressedSize, uncompressedSize, crc32, compression, data) {
      this.compressedSize = compressedSize;
      this.uncompressedSize = uncompressedSize;
      this.crc32 = crc32;
      this.compression = compression;
      this.compressedContent = data;
    }
    CompressedObject.prototype = {
      /**
       * Create a worker to get the uncompressed content.
       * @return {GenericWorker} the worker.
       */
      getContentWorker: function() {
        var worker = new DataWorker(external.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new DataLengthProbe("data_length"));
        var that = this;
        worker.on("end", function() {
          if (this.streamInfo["data_length"] !== that.uncompressedSize) {
            throw new Error("Bug : uncompressed data size mismatch");
          }
        });
        return worker;
      },
      /**
       * Create a worker to get the compressed content.
       * @return {GenericWorker} the worker.
       */
      getCompressedWorker: function() {
        return new DataWorker(external.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
      }
    };
    CompressedObject.createWorkerFrom = function(uncompressedWorker, compression, compressionOptions) {
      return uncompressedWorker.pipe(new Crc32Probe()).pipe(new DataLengthProbe("uncompressedSize")).pipe(compression.compressWorker(compressionOptions)).pipe(new DataLengthProbe("compressedSize")).withStreamInfo("compression", compression);
    };
    module.exports = CompressedObject;
  }
});

// ../../node_modules/jszip/lib/zipObject.js
var require_zipObject = __commonJS({
  "../../node_modules/jszip/lib/zipObject.js"(exports, module) {
    "use strict";
    var StreamHelper = require_StreamHelper();
    var DataWorker = require_DataWorker();
    var utf8 = require_utf8();
    var CompressedObject = require_compressedObject();
    var GenericWorker = require_GenericWorker();
    var ZipObject = function(name, data, options) {
      this.name = name;
      this.dir = options.dir;
      this.date = options.date;
      this.comment = options.comment;
      this.unixPermissions = options.unixPermissions;
      this.dosPermissions = options.dosPermissions;
      this._data = data;
      this._dataBinary = options.binary;
      this.options = {
        compression: options.compression,
        compressionOptions: options.compressionOptions
      };
    };
    ZipObject.prototype = {
      /**
       * Create an internal stream for the content of this object.
       * @param {String} type the type of each chunk.
       * @return StreamHelper the stream.
       */
      internalStream: function(type) {
        var result = null, outputType = "string";
        try {
          if (!type) {
            throw new Error("No output type specified.");
          }
          outputType = type.toLowerCase();
          var askUnicodeString = outputType === "string" || outputType === "text";
          if (outputType === "binarystring" || outputType === "text") {
            outputType = "string";
          }
          result = this._decompressWorker();
          var isUnicodeString = !this._dataBinary;
          if (isUnicodeString && !askUnicodeString) {
            result = result.pipe(new utf8.Utf8EncodeWorker());
          }
          if (!isUnicodeString && askUnicodeString) {
            result = result.pipe(new utf8.Utf8DecodeWorker());
          }
        } catch (e) {
          result = new GenericWorker("error");
          result.error(e);
        }
        return new StreamHelper(result, outputType, "");
      },
      /**
       * Prepare the content in the asked type.
       * @param {String} type the type of the result.
       * @param {Function} onUpdate a function to call on each internal update.
       * @return Promise the promise of the result.
       */
      async: function(type, onUpdate) {
        return this.internalStream(type).accumulate(onUpdate);
      },
      /**
       * Prepare the content as a nodejs stream.
       * @param {String} type the type of each chunk.
       * @param {Function} onUpdate a function to call on each internal update.
       * @return Stream the stream.
       */
      nodeStream: function(type, onUpdate) {
        return this.internalStream(type || "nodebuffer").toNodejsStream(onUpdate);
      },
      /**
       * Return a worker for the compressed content.
       * @private
       * @param {Object} compression the compression object to use.
       * @param {Object} compressionOptions the options to use when compressing.
       * @return Worker the worker.
       */
      _compressWorker: function(compression, compressionOptions) {
        if (this._data instanceof CompressedObject && this._data.compression.magic === compression.magic) {
          return this._data.getCompressedWorker();
        } else {
          var result = this._decompressWorker();
          if (!this._dataBinary) {
            result = result.pipe(new utf8.Utf8EncodeWorker());
          }
          return CompressedObject.createWorkerFrom(result, compression, compressionOptions);
        }
      },
      /**
       * Return a worker for the decompressed content.
       * @private
       * @return Worker the worker.
       */
      _decompressWorker: function() {
        if (this._data instanceof CompressedObject) {
          return this._data.getContentWorker();
        } else if (this._data instanceof GenericWorker) {
          return this._data;
        } else {
          return new DataWorker(this._data);
        }
      }
    };
    var removedMethods = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"];
    var removedFn = function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    };
    for (i = 0; i < removedMethods.length; i++) {
      ZipObject.prototype[removedMethods[i]] = removedFn;
    }
    var i;
    module.exports = ZipObject;
  }
});

// ../../node_modules/pako/lib/utils/common.js
var require_common = __commonJS({
  "../../node_modules/pako/lib/utils/common.js"(exports) {
    "use strict";
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    exports.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        var i, l, len, pos, chunk, result;
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }
    };
    var fnUntyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        return [].concat.apply([], chunks);
      }
    };
    exports.setTyped = function(on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };
    exports.setTyped(TYPED_OK);
  }
});

// ../../node_modules/pako/lib/zlib/trees.js
var require_trees = __commonJS({
  "../../node_modules/pako/lib/zlib/trees.js"(exports) {
    "use strict";
    var utils = require_common();
    var Z_FIXED = 4;
    var Z_BINARY = 0;
    var Z_TEXT = 1;
    var Z_UNKNOWN = 2;
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    var STORED_BLOCK = 0;
    var STATIC_TREES = 1;
    var DYN_TREES = 2;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var Buf_size = 16;
    var MAX_BL_BITS = 7;
    var END_BLOCK = 256;
    var REP_3_6 = 16;
    var REPZ_3_10 = 17;
    var REPZ_11_138 = 18;
    var extra_lbits = (
      /* extra bits for each length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
    );
    var extra_dbits = (
      /* extra bits for each distance code */
      [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
    );
    var extra_blbits = (
      /* extra bits for each bit length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
    );
    var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var DIST_CODE_LEN = 512;
    var static_ltree = new Array((L_CODES + 2) * 2);
    zero(static_ltree);
    var static_dtree = new Array(D_CODES * 2);
    zero(static_dtree);
    var _dist_code = new Array(DIST_CODE_LEN);
    zero(_dist_code);
    var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
    zero(_length_code);
    var base_length = new Array(LENGTH_CODES);
    zero(base_length);
    var base_dist = new Array(D_CODES);
    zero(base_dist);
    function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
      this.has_stree = static_tree && static_tree.length;
    }
    var static_l_desc;
    var static_d_desc;
    var static_bl_desc;
    function TreeDesc(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      this.max_code = 0;
      this.stat_desc = stat_desc;
    }
    function d_code(dist) {
      return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
    }
    function put_short(s, w) {
      s.pending_buf[s.pending++] = w & 255;
      s.pending_buf[s.pending++] = w >>> 8 & 255;
    }
    function send_bits(s, value, length) {
      if (s.bi_valid > Buf_size - length) {
        s.bi_buf |= value << s.bi_valid & 65535;
        put_short(s, s.bi_buf);
        s.bi_buf = value >> Buf_size - s.bi_valid;
        s.bi_valid += length - Buf_size;
      } else {
        s.bi_buf |= value << s.bi_valid & 65535;
        s.bi_valid += length;
      }
    }
    function send_code(s, c, tree) {
      send_bits(
        s,
        tree[c * 2],
        tree[c * 2 + 1]
        /*.Len*/
      );
    }
    function bi_reverse(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }
    function bi_flush(s) {
      if (s.bi_valid === 16) {
        put_short(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;
      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 255;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    }
    function gen_bitlen(s, desc) {
      var tree = desc.dyn_tree;
      var max_code = desc.max_code;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var extra = desc.stat_desc.extra_bits;
      var base = desc.stat_desc.extra_base;
      var max_length = desc.stat_desc.max_length;
      var h;
      var n, m;
      var bits;
      var xbits;
      var f;
      var overflow = 0;
      for (bits = 0; bits <= MAX_BITS; bits++) {
        s.bl_count[bits] = 0;
      }
      tree[s.heap[s.heap_max] * 2 + 1] = 0;
      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = bits;
        if (n > max_code) {
          continue;
        }
        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1] + xbits);
        }
      }
      if (overflow === 0) {
        return;
      }
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) {
          bits--;
        }
        s.bl_count[bits]--;
        s.bl_count[bits + 1] += 2;
        s.bl_count[max_length]--;
        overflow -= 2;
      } while (overflow > 0);
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1] !== bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = bits;
          }
          n--;
        }
      }
    }
    function gen_codes(tree, max_code, bl_count) {
      var next_code = new Array(MAX_BITS + 1);
      var code = 0;
      var bits;
      var n;
      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = code + bl_count[bits - 1] << 1;
      }
      for (n = 0; n <= max_code; n++) {
        var len = tree[n * 2 + 1];
        if (len === 0) {
          continue;
        }
        tree[n * 2] = bi_reverse(next_code[len]++, len);
      }
    }
    function tr_static_init() {
      var n;
      var bits;
      var length;
      var code;
      var dist;
      var bl_count = new Array(MAX_BITS + 1);
      length = 0;
      for (code = 0; code < LENGTH_CODES - 1; code++) {
        base_length[code] = length;
        for (n = 0; n < 1 << extra_lbits[code]; n++) {
          _length_code[length++] = code;
        }
      }
      _length_code[length - 1] = code;
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist[code] = dist;
        for (n = 0; n < 1 << extra_dbits[code]; n++) {
          _dist_code[dist++] = code;
        }
      }
      dist >>= 7;
      for (; code < D_CODES; code++) {
        base_dist[code] = dist << 7;
        for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
          _dist_code[256 + dist++] = code;
        }
      }
      for (bits = 0; bits <= MAX_BITS; bits++) {
        bl_count[bits] = 0;
      }
      n = 0;
      while (n <= 143) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree[n * 2 + 1] = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree[n * 2 + 1] = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      gen_codes(static_ltree, L_CODES + 1, bl_count);
      for (n = 0; n < D_CODES; n++) {
        static_dtree[n * 2 + 1] = 5;
        static_dtree[n * 2] = bi_reverse(n, 5);
      }
      static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
      static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
      static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
    }
    function init_block(s) {
      var n;
      for (n = 0; n < L_CODES; n++) {
        s.dyn_ltree[n * 2] = 0;
      }
      for (n = 0; n < D_CODES; n++) {
        s.dyn_dtree[n * 2] = 0;
      }
      for (n = 0; n < BL_CODES; n++) {
        s.bl_tree[n * 2] = 0;
      }
      s.dyn_ltree[END_BLOCK * 2] = 1;
      s.opt_len = s.static_len = 0;
      s.last_lit = s.matches = 0;
    }
    function bi_windup(s) {
      if (s.bi_valid > 8) {
        put_short(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    }
    function copy_block(s, buf, len, header) {
      bi_windup(s);
      if (header) {
        put_short(s, len);
        put_short(s, ~len);
      }
      utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
      s.pending += len;
    }
    function smaller(tree, n, m, depth) {
      var _n2 = n * 2;
      var _m2 = m * 2;
      return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
    }
    function pqdownheap(s, tree, k) {
      var v = s.heap[k];
      var j = k << 1;
      while (j <= s.heap_len) {
        if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
        }
        if (smaller(tree, v, s.heap[j], s.depth)) {
          break;
        }
        s.heap[k] = s.heap[j];
        k = j;
        j <<= 1;
      }
      s.heap[k] = v;
    }
    function compress_block(s, ltree, dtree) {
      var dist;
      var lc;
      var lx = 0;
      var code;
      var extra;
      if (s.last_lit !== 0) {
        do {
          dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
          lc = s.pending_buf[s.l_buf + lx];
          lx++;
          if (dist === 0) {
            send_code(s, lc, ltree);
          } else {
            code = _length_code[lc];
            send_code(s, code + LITERALS + 1, ltree);
            extra = extra_lbits[code];
            if (extra !== 0) {
              lc -= base_length[code];
              send_bits(s, lc, extra);
            }
            dist--;
            code = d_code(dist);
            send_code(s, code, dtree);
            extra = extra_dbits[code];
            if (extra !== 0) {
              dist -= base_dist[code];
              send_bits(s, dist, extra);
            }
          }
        } while (lx < s.last_lit);
      }
      send_code(s, END_BLOCK, ltree);
    }
    function build_tree(s, desc) {
      var tree = desc.dyn_tree;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var elems = desc.stat_desc.elems;
      var n, m;
      var max_code = -1;
      var node;
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;
      for (n = 0; n < elems; n++) {
        if (tree[n * 2] !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (has_stree) {
          s.static_len -= stree[node * 2 + 1];
        }
      }
      desc.max_code = max_code;
      for (n = s.heap_len >> 1; n >= 1; n--) {
        pqdownheap(s, tree, n);
      }
      node = elems;
      do {
        n = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[
          1
          /*SMALLEST*/
        ] = s.heap[s.heap_len--];
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
        m = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[--s.heap_max] = n;
        s.heap[--s.heap_max] = m;
        tree[node * 2] = tree[n * 2] + tree[m * 2];
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1] = tree[m * 2 + 1] = node;
        s.heap[
          1
          /*SMALLEST*/
        ] = node++;
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
      } while (s.heap_len >= 2);
      s.heap[--s.heap_max] = s.heap[
        1
        /*SMALLEST*/
      ];
      gen_bitlen(s, desc);
      gen_codes(tree, max_code, s.bl_count);
    }
    function scan_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1] = 65535;
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          s.bl_tree[curlen * 2] += count;
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            s.bl_tree[curlen * 2]++;
          }
          s.bl_tree[REP_3_6 * 2]++;
        } else if (count <= 10) {
          s.bl_tree[REPZ_3_10 * 2]++;
        } else {
          s.bl_tree[REPZ_11_138 * 2]++;
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function send_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          do {
            send_code(s, curlen, s.bl_tree);
          } while (--count !== 0);
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code(s, curlen, s.bl_tree);
            count--;
          }
          send_code(s, REP_3_6, s.bl_tree);
          send_bits(s, count - 3, 2);
        } else if (count <= 10) {
          send_code(s, REPZ_3_10, s.bl_tree);
          send_bits(s, count - 3, 3);
        } else {
          send_code(s, REPZ_11_138, s.bl_tree);
          send_bits(s, count - 11, 7);
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function build_bl_tree(s) {
      var max_blindex;
      scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
      build_tree(s, s.bl_desc);
      for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
          break;
        }
      }
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      return max_blindex;
    }
    function send_all_trees(s, lcodes, dcodes, blcodes) {
      var rank;
      send_bits(s, lcodes - 257, 5);
      send_bits(s, dcodes - 1, 5);
      send_bits(s, blcodes - 4, 4);
      for (rank = 0; rank < blcodes; rank++) {
        send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
      }
      send_tree(s, s.dyn_ltree, lcodes - 1);
      send_tree(s, s.dyn_dtree, dcodes - 1);
    }
    function detect_data_type(s) {
      var black_mask = 4093624447;
      var n;
      for (n = 0; n <= 31; n++, black_mask >>>= 1) {
        if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
          return Z_BINARY;
        }
      }
      if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
        return Z_TEXT;
      }
      for (n = 32; n < LITERALS; n++) {
        if (s.dyn_ltree[n * 2] !== 0) {
          return Z_TEXT;
        }
      }
      return Z_BINARY;
    }
    var static_init_done = false;
    function _tr_init(s) {
      if (!static_init_done) {
        tr_static_init();
        static_init_done = true;
      }
      s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
      s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
      s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
      s.bi_buf = 0;
      s.bi_valid = 0;
      init_block(s);
    }
    function _tr_stored_block(s, buf, stored_len, last) {
      send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
      copy_block(s, buf, stored_len, true);
    }
    function _tr_align(s) {
      send_bits(s, STATIC_TREES << 1, 3);
      send_code(s, END_BLOCK, static_ltree);
      bi_flush(s);
    }
    function _tr_flush_block(s, buf, stored_len, last) {
      var opt_lenb, static_lenb;
      var max_blindex = 0;
      if (s.level > 0) {
        if (s.strm.data_type === Z_UNKNOWN) {
          s.strm.data_type = detect_data_type(s);
        }
        build_tree(s, s.l_desc);
        build_tree(s, s.d_desc);
        max_blindex = build_bl_tree(s);
        opt_lenb = s.opt_len + 3 + 7 >>> 3;
        static_lenb = s.static_len + 3 + 7 >>> 3;
        if (static_lenb <= opt_lenb) {
          opt_lenb = static_lenb;
        }
      } else {
        opt_lenb = static_lenb = stored_len + 5;
      }
      if (stored_len + 4 <= opt_lenb && buf !== -1) {
        _tr_stored_block(s, buf, stored_len, last);
      } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
        send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
        compress_block(s, static_ltree, static_dtree);
      } else {
        send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
        send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block(s, s.dyn_ltree, s.dyn_dtree);
      }
      init_block(s);
      if (last) {
        bi_windup(s);
      }
    }
    function _tr_tally(s, dist, lc) {
      s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
      s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
      s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
      s.last_lit++;
      if (dist === 0) {
        s.dyn_ltree[lc * 2]++;
      } else {
        s.matches++;
        dist--;
        s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
        s.dyn_dtree[d_code(dist) * 2]++;
      }
      return s.last_lit === s.lit_bufsize - 1;
    }
    exports._tr_init = _tr_init;
    exports._tr_stored_block = _tr_stored_block;
    exports._tr_flush_block = _tr_flush_block;
    exports._tr_tally = _tr_tally;
    exports._tr_align = _tr_align;
  }
});

// ../../node_modules/pako/lib/zlib/adler32.js
var require_adler32 = __commonJS({
  "../../node_modules/pako/lib/zlib/adler32.js"(exports, module) {
    "use strict";
    function adler32(adler, buf, len, pos) {
      var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
      while (len !== 0) {
        n = len > 2e3 ? 2e3 : len;
        len -= n;
        do {
          s1 = s1 + buf[pos++] | 0;
          s2 = s2 + s1 | 0;
        } while (--n);
        s1 %= 65521;
        s2 %= 65521;
      }
      return s1 | s2 << 16 | 0;
    }
    module.exports = adler32;
  }
});

// ../../node_modules/pako/lib/zlib/crc32.js
var require_crc322 = __commonJS({
  "../../node_modules/pako/lib/zlib/crc32.js"(exports, module) {
    "use strict";
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t2 = crcTable, end = pos + len;
      crc ^= -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t2[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    module.exports = crc32;
  }
});

// ../../node_modules/pako/lib/zlib/messages.js
var require_messages = __commonJS({
  "../../node_modules/pako/lib/zlib/messages.js"(exports, module) {
    "use strict";
    module.exports = {
      2: "need dictionary",
      /* Z_NEED_DICT       2  */
      1: "stream end",
      /* Z_STREAM_END      1  */
      0: "",
      /* Z_OK              0  */
      "-1": "file error",
      /* Z_ERRNO         (-1) */
      "-2": "stream error",
      /* Z_STREAM_ERROR  (-2) */
      "-3": "data error",
      /* Z_DATA_ERROR    (-3) */
      "-4": "insufficient memory",
      /* Z_MEM_ERROR     (-4) */
      "-5": "buffer error",
      /* Z_BUF_ERROR     (-5) */
      "-6": "incompatible version"
      /* Z_VERSION_ERROR (-6) */
    };
  }
});

// ../../node_modules/pako/lib/zlib/deflate.js
var require_deflate = __commonJS({
  "../../node_modules/pako/lib/zlib/deflate.js"(exports) {
    "use strict";
    var utils = require_common();
    var trees = require_trees();
    var adler32 = require_adler32();
    var crc32 = require_crc322();
    var msg = require_messages();
    var Z_NO_FLUSH = 0;
    var Z_PARTIAL_FLUSH = 1;
    var Z_FULL_FLUSH = 3;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_BUF_ERROR = -5;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_FILTERED = 1;
    var Z_HUFFMAN_ONLY = 2;
    var Z_RLE = 3;
    var Z_FIXED = 4;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_UNKNOWN = 2;
    var Z_DEFLATED = 8;
    var MAX_MEM_LEVEL = 9;
    var MAX_WBITS = 15;
    var DEF_MEM_LEVEL = 8;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
    var PRESET_DICT = 32;
    var INIT_STATE = 42;
    var EXTRA_STATE = 69;
    var NAME_STATE = 73;
    var COMMENT_STATE = 91;
    var HCRC_STATE = 103;
    var BUSY_STATE = 113;
    var FINISH_STATE = 666;
    var BS_NEED_MORE = 1;
    var BS_BLOCK_DONE = 2;
    var BS_FINISH_STARTED = 3;
    var BS_FINISH_DONE = 4;
    var OS_CODE = 3;
    function err(strm, errorCode) {
      strm.msg = msg[errorCode];
      return errorCode;
    }
    function rank(f) {
      return (f << 1) - (f > 4 ? 9 : 0);
    }
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    function flush_pending(strm) {
      var s = strm.state;
      var len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) {
        return;
      }
      utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
      strm.next_out += len;
      s.pending_out += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    }
    function flush_block_only(s, last) {
      trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending(s.strm);
    }
    function put_byte(s, b) {
      s.pending_buf[s.pending++] = b;
    }
    function putShortMSB(s, b) {
      s.pending_buf[s.pending++] = b >>> 8 & 255;
      s.pending_buf[s.pending++] = b & 255;
    }
    function read_buf(strm, buf, start, size) {
      var len = strm.avail_in;
      if (len > size) {
        len = size;
      }
      if (len === 0) {
        return 0;
      }
      strm.avail_in -= len;
      utils.arraySet(buf, strm.input, strm.next_in, len, start);
      if (strm.state.wrap === 1) {
        strm.adler = adler32(strm.adler, buf, len, start);
      } else if (strm.state.wrap === 2) {
        strm.adler = crc32(strm.adler, buf, len, start);
      }
      strm.next_in += len;
      strm.total_in += len;
      return len;
    }
    function longest_match(s, cur_match) {
      var chain_length = s.max_chain_length;
      var scan = s.strstart;
      var match;
      var len;
      var best_len = s.prev_length;
      var nice_match = s.nice_match;
      var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
      var _win = s.window;
      var wmask = s.w_mask;
      var prev = s.prev;
      var strend = s.strstart + MAX_MATCH;
      var scan_end1 = _win[scan + best_len - 1];
      var scan_end = _win[scan + best_len];
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      if (nice_match > s.lookahead) {
        nice_match = s.lookahead;
      }
      do {
        match = cur_match;
        if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
          continue;
        }
        scan += 2;
        match++;
        do {
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;
        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
          }
          scan_end1 = _win[scan + best_len - 1];
          scan_end = _win[scan + best_len];
        }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    }
    function fill_window(s) {
      var _w_size = s.w_size;
      var p, n, m, more, str;
      do {
        more = s.window_size - s.lookahead - s.strstart;
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          s.block_start -= _w_size;
          n = s.hash_size;
          p = n;
          do {
            m = s.head[--p];
            s.head[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          n = _w_size;
          p = n;
          do {
            m = s.prev[--p];
            s.prev[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }
        n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;
        if (s.lookahead + s.insert >= MIN_MATCH) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
          while (s.insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH) {
              break;
            }
          }
        }
      } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
    }
    function deflate_stored(s, flush) {
      var max_block_size = 65535;
      if (max_block_size > s.pending_buf_size - 5) {
        max_block_size = s.pending_buf_size - 5;
      }
      for (; ; ) {
        if (s.lookahead <= 1) {
          fill_window(s);
          if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.strstart += s.lookahead;
        s.lookahead = 0;
        var max_start = s.block_start + max_block_size;
        if (s.strstart === 0 || s.strstart >= max_start) {
          s.lookahead = s.strstart - max_start;
          s.strstart = max_start;
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.strstart > s.block_start) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_NEED_MORE;
    }
    function deflate_fast(s, flush) {
      var hash_head;
      var bflush;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
            s.match_length--;
            do {
              s.strstart++;
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            } while (--s.match_length !== 0);
            s.strstart++;
          } else {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
          }
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_slow(s, flush) {
      var hash_head;
      var bflush;
      var max_insert;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH - 1;
        if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
          if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
            s.match_length = MIN_MATCH - 1;
          }
        }
        if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH;
          bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
          } while (--s.prev_length !== 0);
          s.match_available = 0;
          s.match_length = MIN_MATCH - 1;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        } else if (s.match_available) {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
          if (bflush) {
            flush_block_only(s, false);
          }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        } else {
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      if (s.match_available) {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_rle(s, flush) {
      var bflush;
      var prev;
      var scan, strend;
      var _win = s.window;
      for (; ; ) {
        if (s.lookahead <= MAX_MATCH) {
          fill_window(s);
          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH;
            do {
            } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
            s.match_length = MAX_MATCH - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
            }
          }
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_huff(s, flush) {
      var bflush;
      for (; ; ) {
        if (s.lookahead === 0) {
          fill_window(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            break;
          }
        }
        s.match_length = 0;
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function Config(good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
    var configuration_table;
    configuration_table = [
      /*      good lazy nice chain */
      new Config(0, 0, 0, 0, deflate_stored),
      /* 0 store only */
      new Config(4, 4, 8, 4, deflate_fast),
      /* 1 max speed, no lazy matches */
      new Config(4, 5, 16, 8, deflate_fast),
      /* 2 */
      new Config(4, 6, 32, 32, deflate_fast),
      /* 3 */
      new Config(4, 4, 16, 16, deflate_slow),
      /* 4 lazy matches */
      new Config(8, 16, 32, 32, deflate_slow),
      /* 5 */
      new Config(8, 16, 128, 128, deflate_slow),
      /* 6 */
      new Config(8, 32, 128, 256, deflate_slow),
      /* 7 */
      new Config(32, 128, 258, 1024, deflate_slow),
      /* 8 */
      new Config(32, 258, 258, 4096, deflate_slow)
      /* 9 max compression */
    ];
    function lm_init(s) {
      s.window_size = 2 * s.w_size;
      zero(s.head);
      s.max_lazy_match = configuration_table[s.level].max_lazy;
      s.good_match = configuration_table[s.level].good_length;
      s.nice_match = configuration_table[s.level].nice_length;
      s.max_chain_length = configuration_table[s.level].max_chain;
      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      s.ins_h = 0;
    }
    function DeflateState() {
      this.strm = null;
      this.status = 0;
      this.pending_buf = null;
      this.pending_buf_size = 0;
      this.pending_out = 0;
      this.pending = 0;
      this.wrap = 0;
      this.gzhead = null;
      this.gzindex = 0;
      this.method = Z_DEFLATED;
      this.last_flush = -1;
      this.w_size = 0;
      this.w_bits = 0;
      this.w_mask = 0;
      this.window = null;
      this.window_size = 0;
      this.prev = null;
      this.head = null;
      this.ins_h = 0;
      this.hash_size = 0;
      this.hash_bits = 0;
      this.hash_mask = 0;
      this.hash_shift = 0;
      this.block_start = 0;
      this.match_length = 0;
      this.prev_match = 0;
      this.match_available = 0;
      this.strstart = 0;
      this.match_start = 0;
      this.lookahead = 0;
      this.prev_length = 0;
      this.max_chain_length = 0;
      this.max_lazy_match = 0;
      this.level = 0;
      this.strategy = 0;
      this.good_match = 0;
      this.nice_match = 0;
      this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
      this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
      this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);
      this.l_desc = null;
      this.d_desc = null;
      this.bl_desc = null;
      this.bl_count = new utils.Buf16(MAX_BITS + 1);
      this.heap = new utils.Buf16(2 * L_CODES + 1);
      zero(this.heap);
      this.heap_len = 0;
      this.heap_max = 0;
      this.depth = new utils.Buf16(2 * L_CODES + 1);
      zero(this.depth);
      this.l_buf = 0;
      this.lit_bufsize = 0;
      this.last_lit = 0;
      this.d_buf = 0;
      this.opt_len = 0;
      this.static_len = 0;
      this.matches = 0;
      this.insert = 0;
      this.bi_buf = 0;
      this.bi_valid = 0;
    }
    function deflateResetKeep(strm) {
      var s;
      if (!strm || !strm.state) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN;
      s = strm.state;
      s.pending = 0;
      s.pending_out = 0;
      if (s.wrap < 0) {
        s.wrap = -s.wrap;
      }
      s.status = s.wrap ? INIT_STATE : BUSY_STATE;
      strm.adler = s.wrap === 2 ? 0 : 1;
      s.last_flush = Z_NO_FLUSH;
      trees._tr_init(s);
      return Z_OK;
    }
    function deflateReset(strm) {
      var ret = deflateResetKeep(strm);
      if (ret === Z_OK) {
        lm_init(strm.state);
      }
      return ret;
    }
    function deflateSetHeader(strm, head) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      if (strm.state.wrap !== 2) {
        return Z_STREAM_ERROR;
      }
      strm.state.gzhead = head;
      return Z_OK;
    }
    function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      var wrap = 1;
      if (level === Z_DEFAULT_COMPRESSION) {
        level = 6;
      }
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else if (windowBits > 15) {
        wrap = 2;
        windowBits -= 16;
      }
      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
        return err(strm, Z_STREAM_ERROR);
      }
      if (windowBits === 8) {
        windowBits = 9;
      }
      var s = new DeflateState();
      strm.state = s;
      s.strm = strm;
      s.wrap = wrap;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;
      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
      s.window = new utils.Buf8(s.w_size * 2);
      s.head = new utils.Buf16(s.hash_size);
      s.prev = new utils.Buf16(s.w_size);
      s.lit_bufsize = 1 << memLevel + 6;
      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new utils.Buf8(s.pending_buf_size);
      s.d_buf = 1 * s.lit_bufsize;
      s.l_buf = (1 + 2) * s.lit_bufsize;
      s.level = level;
      s.strategy = strategy;
      s.method = method;
      return deflateReset(strm);
    }
    function deflateInit(strm, level) {
      return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
    }
    function deflate(strm, flush) {
      var old_flush, s;
      var beg, val;
      if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
        return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
      }
      s = strm.state;
      if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
        return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
      }
      s.strm = strm;
      old_flush = s.last_flush;
      s.last_flush = flush;
      if (s.status === INIT_STATE) {
        if (s.wrap === 2) {
          strm.adler = 0;
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) {
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
          } else {
            put_byte(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 255);
            put_byte(s, s.gzhead.time >> 8 & 255);
            put_byte(s, s.gzhead.time >> 16 & 255);
            put_byte(s, s.gzhead.time >> 24 & 255);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 255);
              put_byte(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
          }
        } else {
          var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
          var level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - header % 31;
          s.status = BUSY_STATE;
          putShortMSB(s, header);
          if (s.strstart !== 0) {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          strm.adler = 1;
        }
      }
      if (s.status === EXTRA_STATE) {
        if (s.gzhead.extra) {
          beg = s.pending;
          while (s.gzindex < (s.gzhead.extra.length & 65535)) {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                break;
              }
            }
            put_byte(s, s.gzhead.extra[s.gzindex] & 255);
            s.gzindex++;
          }
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (s.gzindex === s.gzhead.extra.length) {
            s.gzindex = 0;
            s.status = NAME_STATE;
          }
        } else {
          s.status = NAME_STATE;
        }
      }
      if (s.status === NAME_STATE) {
        if (s.gzhead.name) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.gzindex = 0;
            s.status = COMMENT_STATE;
          }
        } else {
          s.status = COMMENT_STATE;
        }
      }
      if (s.status === COMMENT_STATE) {
        if (s.gzhead.comment) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.status = HCRC_STATE;
          }
        } else {
          s.status = HCRC_STATE;
        }
      }
      if (s.status === HCRC_STATE) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
            flush_pending(strm);
          }
          if (s.pending + 2 <= s.pending_buf_size) {
            put_byte(s, strm.adler & 255);
            put_byte(s, strm.adler >> 8 & 255);
            strm.adler = 0;
            s.status = BUSY_STATE;
          }
        } else {
          s.status = BUSY_STATE;
        }
      }
      if (s.pending !== 0) {
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK;
        }
      } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
        return err(strm, Z_BUF_ERROR);
      }
      if (s.status === FINISH_STATE && strm.avail_in !== 0) {
        return err(strm, Z_BUF_ERROR);
      }
      if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
        var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
        if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
          s.status = FINISH_STATE;
        }
        if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
          }
          return Z_OK;
        }
        if (bstate === BS_BLOCK_DONE) {
          if (flush === Z_PARTIAL_FLUSH) {
            trees._tr_align(s);
          } else if (flush !== Z_BLOCK) {
            trees._tr_stored_block(s, 0, 0, false);
            if (flush === Z_FULL_FLUSH) {
              zero(s.head);
              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
      }
      if (flush !== Z_FINISH) {
        return Z_OK;
      }
      if (s.wrap <= 0) {
        return Z_STREAM_END;
      }
      if (s.wrap === 2) {
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        put_byte(s, strm.adler >> 16 & 255);
        put_byte(s, strm.adler >> 24 & 255);
        put_byte(s, strm.total_in & 255);
        put_byte(s, strm.total_in >> 8 & 255);
        put_byte(s, strm.total_in >> 16 & 255);
        put_byte(s, strm.total_in >> 24 & 255);
      } else {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      flush_pending(strm);
      if (s.wrap > 0) {
        s.wrap = -s.wrap;
      }
      return s.pending !== 0 ? Z_OK : Z_STREAM_END;
    }
    function deflateEnd(strm) {
      var status;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      status = strm.state.status;
      if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.state = null;
      return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
    }
    function deflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var s;
      var str, n;
      var wrap;
      var avail;
      var next;
      var input;
      var tmpDict;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      s = strm.state;
      wrap = s.wrap;
      if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
        return Z_STREAM_ERROR;
      }
      if (wrap === 1) {
        strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
      }
      s.wrap = 0;
      if (dictLength >= s.w_size) {
        if (wrap === 0) {
          zero(s.head);
          s.strstart = 0;
          s.block_start = 0;
          s.insert = 0;
        }
        tmpDict = new utils.Buf8(s.w_size);
        utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
        dictionary = tmpDict;
        dictLength = s.w_size;
      }
      avail = strm.avail_in;
      next = strm.next_in;
      input = strm.input;
      strm.avail_in = dictLength;
      strm.next_in = 0;
      strm.input = dictionary;
      fill_window(s);
      while (s.lookahead >= MIN_MATCH) {
        str = s.strstart;
        n = s.lookahead - (MIN_MATCH - 1);
        do {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
        } while (--n);
        s.strstart = str;
        s.lookahead = MIN_MATCH - 1;
        fill_window(s);
      }
      s.strstart += s.lookahead;
      s.block_start = s.strstart;
      s.insert = s.lookahead;
      s.lookahead = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      strm.next_in = next;
      strm.input = input;
      strm.avail_in = avail;
      s.wrap = wrap;
      return Z_OK;
    }
    exports.deflateInit = deflateInit;
    exports.deflateInit2 = deflateInit2;
    exports.deflateReset = deflateReset;
    exports.deflateResetKeep = deflateResetKeep;
    exports.deflateSetHeader = deflateSetHeader;
    exports.deflate = deflate;
    exports.deflateEnd = deflateEnd;
    exports.deflateSetDictionary = deflateSetDictionary;
    exports.deflateInfo = "pako deflate (from Nodeca project)";
  }
});

// ../../node_modules/pako/lib/utils/strings.js
var require_strings = __commonJS({
  "../../node_modules/pako/lib/utils/strings.js"(exports) {
    "use strict";
    var utils = require_common();
    var STR_APPLY_OK = true;
    var STR_APPLY_UIA_OK = true;
    try {
      String.fromCharCode.apply(null, [0]);
    } catch (__) {
      STR_APPLY_OK = false;
    }
    try {
      String.fromCharCode.apply(null, new Uint8Array(1));
    } catch (__) {
      STR_APPLY_UIA_OK = false;
    }
    var _utf8len = new utils.Buf8(256);
    for (q = 0; q < 256; q++) {
      _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
    }
    var q;
    _utf8len[254] = _utf8len[254] = 1;
    exports.string2buf = function(str) {
      var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      buf = new utils.Buf8(buf_len);
      for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i++] = c;
        } else if (c < 2048) {
          buf[i++] = 192 | c >>> 6;
          buf[i++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i++] = 224 | c >>> 12;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        } else {
          buf[i++] = 240 | c >>> 18;
          buf[i++] = 128 | c >>> 12 & 63;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        }
      }
      return buf;
    };
    function buf2binstring(buf, len) {
      if (len < 65534) {
        if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
          return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
        }
      }
      var result = "";
      for (var i = 0; i < len; i++) {
        result += String.fromCharCode(buf[i]);
      }
      return result;
    }
    exports.buf2binstring = function(buf) {
      return buf2binstring(buf, buf.length);
    };
    exports.binstring2buf = function(str) {
      var buf = new utils.Buf8(str.length);
      for (var i = 0, len = buf.length; i < len; i++) {
        buf[i] = str.charCodeAt(i);
      }
      return buf;
    };
    exports.buf2string = function(buf, max) {
      var i, out, c, c_len;
      var len = max || buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i = 0; i < len; ) {
        c = buf[i++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i < len) {
          c = c << 6 | buf[i++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      return buf2binstring(utf16buf, out);
    };
    exports.utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
  }
});

// ../../node_modules/pako/lib/zlib/zstream.js
var require_zstream = __commonJS({
  "../../node_modules/pako/lib/zlib/zstream.js"(exports, module) {
    "use strict";
    function ZStream() {
      this.input = null;
      this.next_in = 0;
      this.avail_in = 0;
      this.total_in = 0;
      this.output = null;
      this.next_out = 0;
      this.avail_out = 0;
      this.total_out = 0;
      this.msg = "";
      this.state = null;
      this.data_type = 2;
      this.adler = 0;
    }
    module.exports = ZStream;
  }
});

// ../../node_modules/pako/lib/deflate.js
var require_deflate2 = __commonJS({
  "../../node_modules/pako/lib/deflate.js"(exports) {
    "use strict";
    var zlib_deflate = require_deflate();
    var utils = require_common();
    var strings = require_strings();
    var msg = require_messages();
    var ZStream = require_zstream();
    var toString = Object.prototype.toString;
    var Z_NO_FLUSH = 0;
    var Z_FINISH = 4;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_SYNC_FLUSH = 2;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_DEFLATED = 8;
    function Deflate(options) {
      if (!(this instanceof Deflate)) return new Deflate(options);
      this.options = utils.assign({
        level: Z_DEFAULT_COMPRESSION,
        method: Z_DEFLATED,
        chunkSize: 16384,
        windowBits: 15,
        memLevel: 8,
        strategy: Z_DEFAULT_STRATEGY,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits > 0) {
        opt.windowBits = -opt.windowBits;
      } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
        opt.windowBits += 16;
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_deflate.deflateInit2(
        this.strm,
        opt.level,
        opt.method,
        opt.windowBits,
        opt.memLevel,
        opt.strategy
      );
      if (status !== Z_OK) {
        throw new Error(msg[status]);
      }
      if (opt.header) {
        zlib_deflate.deflateSetHeader(this.strm, opt.header);
      }
      if (opt.dictionary) {
        var dict;
        if (typeof opt.dictionary === "string") {
          dict = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          dict = new Uint8Array(opt.dictionary);
        } else {
          dict = opt.dictionary;
        }
        status = zlib_deflate.deflateSetDictionary(this.strm, dict);
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        this._dict_set = true;
      }
    }
    Deflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var status, _mode;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.string2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_deflate.deflate(strm, _mode);
        if (status !== Z_STREAM_END && status !== Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
          if (this.options.to === "string") {
            this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
          } else {
            this.onData(utils.shrinkBuf(strm.output, strm.next_out));
          }
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
      if (_mode === Z_FINISH) {
        status = zlib_deflate.deflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === Z_OK;
      }
      if (_mode === Z_SYNC_FLUSH) {
        this.onEnd(Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Deflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Deflate.prototype.onEnd = function(status) {
      if (status === Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function deflate(input, options) {
      var deflator = new Deflate(options);
      deflator.push(input, true);
      if (deflator.err) {
        throw deflator.msg || msg[deflator.err];
      }
      return deflator.result;
    }
    function deflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return deflate(input, options);
    }
    function gzip(input, options) {
      options = options || {};
      options.gzip = true;
      return deflate(input, options);
    }
    exports.Deflate = Deflate;
    exports.deflate = deflate;
    exports.deflateRaw = deflateRaw;
    exports.gzip = gzip;
  }
});

// ../../node_modules/pako/lib/zlib/inffast.js
var require_inffast = __commonJS({
  "../../node_modules/pako/lib/zlib/inffast.js"(exports, module) {
    "use strict";
    var BAD = 30;
    var TYPE = 12;
    module.exports = function inflate_fast(strm, start) {
      var state;
      var _in;
      var last;
      var _out;
      var beg;
      var end;
      var dmax;
      var wsize;
      var whave;
      var wnext;
      var s_window;
      var hold;
      var bits;
      var lcode;
      var dcode;
      var lmask;
      var dmask;
      var here;
      var op;
      var len;
      var dist;
      var from;
      var from_source;
      var input, output;
      state = strm.state;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
      dmax = state.dmax;
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;
      top:
        do {
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = lcode[hold & lmask];
          dolen:
            for (; ; ) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = here >>> 16 & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & (1 << op) - 1;
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist:
                  for (; ; ) {
                    op = here >>> 24;
                    hold >>>= op;
                    bits -= op;
                    op = here >>> 16 & 255;
                    if (op & 16) {
                      dist = here & 65535;
                      op &= 15;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                        }
                      }
                      dist += hold & (1 << op) - 1;
                      if (dist > dmax) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD;
                        break top;
                      }
                      hold >>>= op;
                      bits -= op;
                      op = _out - beg;
                      if (dist > op) {
                        op = dist - op;
                        if (op > whave) {
                          if (state.sane) {
                            strm.msg = "invalid distance too far back";
                            state.mode = BAD;
                            break top;
                          }
                        }
                        from = 0;
                        from_source = s_window;
                        if (wnext === 0) {
                          from += wsize - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        } else if (wnext < op) {
                          from += wsize + wnext - op;
                          op -= wnext;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = 0;
                            if (wnext < len) {
                              op = wnext;
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                        } else {
                          from += wnext - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                        while (len > 2) {
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          len -= 3;
                        }
                        if (len) {
                          output[_out++] = from_source[from++];
                          if (len > 1) {
                            output[_out++] = from_source[from++];
                          }
                        }
                      } else {
                        from = _out - dist;
                        do {
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          len -= 3;
                        } while (len > 2);
                        if (len) {
                          output[_out++] = output[from++];
                          if (len > 1) {
                            output[_out++] = output[from++];
                          }
                        }
                      }
                    } else if ((op & 64) === 0) {
                      here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                      continue dodist;
                    } else {
                      strm.msg = "invalid distance code";
                      state.mode = BAD;
                      break top;
                    }
                    break;
                  }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
        } while (_in < last && _out < end);
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
      strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
      state.hold = hold;
      state.bits = bits;
      return;
    };
  }
});

// ../../node_modules/pako/lib/zlib/inftrees.js
var require_inftrees = __commonJS({
  "../../node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
    "use strict";
    var utils = require_common();
    var MAXBITS = 15;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var lbase = [
      /* Length codes 257..285 base */
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      13,
      15,
      17,
      19,
      23,
      27,
      31,
      35,
      43,
      51,
      59,
      67,
      83,
      99,
      115,
      131,
      163,
      195,
      227,
      258,
      0,
      0
    ];
    var lext = [
      /* Length codes 257..285 extra */
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      17,
      17,
      17,
      17,
      18,
      18,
      18,
      18,
      19,
      19,
      19,
      19,
      20,
      20,
      20,
      20,
      21,
      21,
      21,
      21,
      16,
      72,
      78
    ];
    var dbase = [
      /* Distance codes 0..29 base */
      1,
      2,
      3,
      4,
      5,
      7,
      9,
      13,
      17,
      25,
      33,
      49,
      65,
      97,
      129,
      193,
      257,
      385,
      513,
      769,
      1025,
      1537,
      2049,
      3073,
      4097,
      6145,
      8193,
      12289,
      16385,
      24577,
      0,
      0
    ];
    var dext = [
      /* Distance codes 0..29 extra */
      16,
      16,
      16,
      16,
      17,
      17,
      18,
      18,
      19,
      19,
      20,
      20,
      21,
      21,
      22,
      22,
      23,
      23,
      24,
      24,
      25,
      25,
      26,
      26,
      27,
      27,
      28,
      28,
      29,
      29,
      64,
      64
    ];
    module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
      var bits = opts.bits;
      var len = 0;
      var sym = 0;
      var min = 0, max = 0;
      var root = 0;
      var curr = 0;
      var drop = 0;
      var left = 0;
      var used = 0;
      var huff = 0;
      var incr;
      var fill;
      var low;
      var mask;
      var next;
      var base = null;
      var base_index = 0;
      var end;
      var count = new utils.Buf16(MAXBITS + 1);
      var offs = new utils.Buf16(MAXBITS + 1);
      var extra = null;
      var extra_index = 0;
      var here_bits, here_op, here_val;
      for (len = 0; len <= MAXBITS; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }
      root = bits;
      for (max = MAXBITS; max >= 1; max--) {
        if (count[max] !== 0) {
          break;
        }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        opts.bits = 1;
        return 0;
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) {
          break;
        }
      }
      if (root < min) {
        root = min;
      }
      left = 1;
      for (len = 1; len <= MAXBITS; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }
      }
      if (left > 0 && (type === CODES || max !== 1)) {
        return -1;
      }
      offs[1] = 0;
      for (len = 1; len < MAXBITS; len++) {
        offs[len + 1] = offs[len] + count[len];
      }
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }
      if (type === CODES) {
        base = extra = work;
        end = 19;
      } else if (type === LENS) {
        base = lbase;
        base_index -= 257;
        extra = lext;
        extra_index -= 257;
        end = 256;
      } else {
        base = dbase;
        extra = dext;
        end = -1;
      }
      huff = 0;
      sym = 0;
      len = min;
      next = table_index;
      curr = root;
      drop = 0;
      low = -1;
      used = 1 << root;
      mask = used - 1;
      if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
        return 1;
      }
      for (; ; ) {
        here_bits = len - drop;
        if (work[sym] < end) {
          here_op = 0;
          here_val = work[sym];
        } else if (work[sym] > end) {
          here_op = extra[extra_index + work[sym]];
          here_val = base[base_index + work[sym]];
        } else {
          here_op = 32 + 64;
          here_val = 0;
        }
        incr = 1 << len - drop;
        fill = 1 << curr;
        min = fill;
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
        } while (fill !== 0);
        incr = 1 << len - 1;
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
          huff = 0;
        }
        sym++;
        if (--count[len] === 0) {
          if (len === max) {
            break;
          }
          len = lens[lens_index + work[sym]];
        }
        if (len > root && (huff & mask) !== low) {
          if (drop === 0) {
            drop = root;
          }
          next += min;
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) {
              break;
            }
            curr++;
            left <<= 1;
          }
          used += 1 << curr;
          if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
            return 1;
          }
          low = huff & mask;
          table[low] = root << 24 | curr << 16 | next - table_index | 0;
        }
      }
      if (huff !== 0) {
        table[next + huff] = len - drop << 24 | 64 << 16 | 0;
      }
      opts.bits = root;
      return 0;
    };
  }
});

// ../../node_modules/pako/lib/zlib/inflate.js
var require_inflate = __commonJS({
  "../../node_modules/pako/lib/zlib/inflate.js"(exports) {
    "use strict";
    var utils = require_common();
    var adler32 = require_adler32();
    var crc32 = require_crc322();
    var inflate_fast = require_inffast();
    var inflate_table = require_inftrees();
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_TREES = 6;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_NEED_DICT = 2;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_MEM_ERROR = -4;
    var Z_BUF_ERROR = -5;
    var Z_DEFLATED = 8;
    var HEAD = 1;
    var FLAGS = 2;
    var TIME = 3;
    var OS = 4;
    var EXLEN = 5;
    var EXTRA = 6;
    var NAME = 7;
    var COMMENT = 8;
    var HCRC = 9;
    var DICTID = 10;
    var DICT = 11;
    var TYPE = 12;
    var TYPEDO = 13;
    var STORED = 14;
    var COPY_ = 15;
    var COPY = 16;
    var TABLE = 17;
    var LENLENS = 18;
    var CODELENS = 19;
    var LEN_ = 20;
    var LEN = 21;
    var LENEXT = 22;
    var DIST = 23;
    var DISTEXT = 24;
    var MATCH = 25;
    var LIT = 26;
    var CHECK = 27;
    var LENGTH = 28;
    var DONE = 29;
    var BAD = 30;
    var MEM = 31;
    var SYNC = 32;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var MAX_WBITS = 15;
    var DEF_WBITS = MAX_WBITS;
    function zswap32(q) {
      return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
    }
    function InflateState() {
      this.mode = 0;
      this.last = false;
      this.wrap = 0;
      this.havedict = false;
      this.flags = 0;
      this.dmax = 0;
      this.check = 0;
      this.total = 0;
      this.head = null;
      this.wbits = 0;
      this.wsize = 0;
      this.whave = 0;
      this.wnext = 0;
      this.window = null;
      this.hold = 0;
      this.bits = 0;
      this.length = 0;
      this.offset = 0;
      this.extra = 0;
      this.lencode = null;
      this.distcode = null;
      this.lenbits = 0;
      this.distbits = 0;
      this.ncode = 0;
      this.nlen = 0;
      this.ndist = 0;
      this.have = 0;
      this.next = null;
      this.lens = new utils.Buf16(320);
      this.work = new utils.Buf16(288);
      this.lendyn = null;
      this.distdyn = null;
      this.sane = 0;
      this.back = 0;
      this.was = 0;
    }
    function inflateResetKeep(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = "";
      if (state.wrap) {
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD;
      state.last = 0;
      state.havedict = 0;
      state.dmax = 32768;
      state.head = null;
      state.hold = 0;
      state.bits = 0;
      state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
      state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
      state.sane = 1;
      state.back = -1;
      return Z_OK;
    }
    function inflateReset(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep(strm);
    }
    function inflateReset2(strm, windowBits) {
      var wrap;
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else {
        wrap = (windowBits >> 4) + 1;
        if (windowBits < 48) {
          windowBits &= 15;
        }
      }
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }
      state.wrap = wrap;
      state.wbits = windowBits;
      return inflateReset(strm);
    }
    function inflateInit2(strm, windowBits) {
      var ret;
      var state;
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      state = new InflateState();
      strm.state = state;
      state.window = null;
      ret = inflateReset2(strm, windowBits);
      if (ret !== Z_OK) {
        strm.state = null;
      }
      return ret;
    }
    function inflateInit(strm) {
      return inflateInit2(strm, DEF_WBITS);
    }
    var virgin = true;
    var lenfix;
    var distfix;
    function fixedtables(state) {
      if (virgin) {
        var sym;
        lenfix = new utils.Buf32(512);
        distfix = new utils.Buf32(32);
        sym = 0;
        while (sym < 144) {
          state.lens[sym++] = 8;
        }
        while (sym < 256) {
          state.lens[sym++] = 9;
        }
        while (sym < 280) {
          state.lens[sym++] = 7;
        }
        while (sym < 288) {
          state.lens[sym++] = 8;
        }
        inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
        sym = 0;
        while (sym < 32) {
          state.lens[sym++] = 5;
        }
        inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
        virgin = false;
      }
      state.lencode = lenfix;
      state.lenbits = 9;
      state.distcode = distfix;
      state.distbits = 5;
    }
    function updatewindow(strm, src, end, copy) {
      var dist;
      var state = strm.state;
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;
        state.window = new utils.Buf8(state.wsize);
      }
      if (copy >= state.wsize) {
        utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
        state.wnext = 0;
        state.whave = state.wsize;
      } else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
        }
        utils.arraySet(state.window, src, end - copy, dist, state.wnext);
        copy -= dist;
        if (copy) {
          utils.arraySet(state.window, src, end - copy, copy, 0);
          state.wnext = copy;
          state.whave = state.wsize;
        } else {
          state.wnext += dist;
          if (state.wnext === state.wsize) {
            state.wnext = 0;
          }
          if (state.whave < state.wsize) {
            state.whave += dist;
          }
        }
      }
      return 0;
    }
    function inflate(strm, flush) {
      var state;
      var input, output;
      var next;
      var put;
      var have, left;
      var hold;
      var bits;
      var _in, _out;
      var copy;
      var from;
      var from_source;
      var here = 0;
      var here_bits, here_op, here_val;
      var last_bits, last_op, last_val;
      var len;
      var ret;
      var hbuf = new utils.Buf8(4);
      var opts;
      var n;
      var order = (
        /* permutation of code lengths */
        [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
      );
      if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.mode === TYPE) {
        state.mode = TYPEDO;
      }
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      _in = have;
      _out = left;
      ret = Z_OK;
      inf_leave:
        for (; ; ) {
          switch (state.mode) {
            case HEAD:
              if (state.wrap === 0) {
                state.mode = TYPEDO;
                break;
              }
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 2 && hold === 35615) {
                state.check = 0;
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
                hold = 0;
                bits = 0;
                state.mode = FLAGS;
                break;
              }
              state.flags = 0;
              if (state.head) {
                state.head.done = false;
              }
              if (!(state.wrap & 1) || /* check if zlib header allowed */
              (((hold & 255) << 8) + (hold >> 8)) % 31) {
                strm.msg = "incorrect header check";
                state.mode = BAD;
                break;
              }
              if ((hold & 15) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              hold >>>= 4;
              bits -= 4;
              len = (hold & 15) + 8;
              if (state.wbits === 0) {
                state.wbits = len;
              } else if (len > state.wbits) {
                strm.msg = "invalid window size";
                state.mode = BAD;
                break;
              }
              state.dmax = 1 << len;
              strm.adler = state.check = 1;
              state.mode = hold & 512 ? DICTID : TYPE;
              hold = 0;
              bits = 0;
              break;
            case FLAGS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.flags = hold;
              if ((state.flags & 255) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              if (state.flags & 57344) {
                strm.msg = "unknown header flags set";
                state.mode = BAD;
                break;
              }
              if (state.head) {
                state.head.text = hold >> 8 & 1;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = TIME;
            /* falls through */
            case TIME:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.time = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                hbuf[2] = hold >>> 16 & 255;
                hbuf[3] = hold >>> 24 & 255;
                state.check = crc32(state.check, hbuf, 4, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = OS;
            /* falls through */
            case OS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.xflags = hold & 255;
                state.head.os = hold >> 8;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = EXLEN;
            /* falls through */
            case EXLEN:
              if (state.flags & 1024) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length = hold;
                if (state.head) {
                  state.head.extra_len = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
              } else if (state.head) {
                state.head.extra = null;
              }
              state.mode = EXTRA;
            /* falls through */
            case EXTRA:
              if (state.flags & 1024) {
                copy = state.length;
                if (copy > have) {
                  copy = have;
                }
                if (copy) {
                  if (state.head) {
                    len = state.head.extra_len - state.length;
                    if (!state.head.extra) {
                      state.head.extra = new Array(state.head.extra_len);
                    }
                    utils.arraySet(
                      state.head.extra,
                      input,
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      copy,
                      /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                      len
                    );
                  }
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  state.length -= copy;
                }
                if (state.length) {
                  break inf_leave;
                }
              }
              state.length = 0;
              state.mode = NAME;
            /* falls through */
            case NAME:
              if (state.flags & 2048) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.name += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.name = null;
              }
              state.length = 0;
              state.mode = COMMENT;
            /* falls through */
            case COMMENT:
              if (state.flags & 4096) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.comment += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.comment = null;
              }
              state.mode = HCRC;
            /* falls through */
            case HCRC:
              if (state.flags & 512) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.check & 65535)) {
                  strm.msg = "header crc mismatch";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              if (state.head) {
                state.head.hcrc = state.flags >> 9 & 1;
                state.head.done = true;
              }
              strm.adler = state.check = 0;
              state.mode = TYPE;
              break;
            case DICTID:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              strm.adler = state.check = zswap32(hold);
              hold = 0;
              bits = 0;
              state.mode = DICT;
            /* falls through */
            case DICT:
              if (state.havedict === 0) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                return Z_NEED_DICT;
              }
              strm.adler = state.check = 1;
              state.mode = TYPE;
            /* falls through */
            case TYPE:
              if (flush === Z_BLOCK || flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case TYPEDO:
              if (state.last) {
                hold >>>= bits & 7;
                bits -= bits & 7;
                state.mode = CHECK;
                break;
              }
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.last = hold & 1;
              hold >>>= 1;
              bits -= 1;
              switch (hold & 3) {
                case 0:
                  state.mode = STORED;
                  break;
                case 1:
                  fixedtables(state);
                  state.mode = LEN_;
                  if (flush === Z_TREES) {
                    hold >>>= 2;
                    bits -= 2;
                    break inf_leave;
                  }
                  break;
                case 2:
                  state.mode = TABLE;
                  break;
                case 3:
                  strm.msg = "invalid block type";
                  state.mode = BAD;
              }
              hold >>>= 2;
              bits -= 2;
              break;
            case STORED:
              hold >>>= bits & 7;
              bits -= bits & 7;
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                strm.msg = "invalid stored block lengths";
                state.mode = BAD;
                break;
              }
              state.length = hold & 65535;
              hold = 0;
              bits = 0;
              state.mode = COPY_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case COPY_:
              state.mode = COPY;
            /* falls through */
            case COPY:
              copy = state.length;
              if (copy) {
                if (copy > have) {
                  copy = have;
                }
                if (copy > left) {
                  copy = left;
                }
                if (copy === 0) {
                  break inf_leave;
                }
                utils.arraySet(output, input, next, copy, put);
                have -= copy;
                next += copy;
                left -= copy;
                put += copy;
                state.length -= copy;
                break;
              }
              state.mode = TYPE;
              break;
            case TABLE:
              while (bits < 14) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.nlen = (hold & 31) + 257;
              hold >>>= 5;
              bits -= 5;
              state.ndist = (hold & 31) + 1;
              hold >>>= 5;
              bits -= 5;
              state.ncode = (hold & 15) + 4;
              hold >>>= 4;
              bits -= 4;
              if (state.nlen > 286 || state.ndist > 30) {
                strm.msg = "too many length or distance symbols";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = LENLENS;
            /* falls through */
            case LENLENS:
              while (state.have < state.ncode) {
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.lens[order[state.have++]] = hold & 7;
                hold >>>= 3;
                bits -= 3;
              }
              while (state.have < 19) {
                state.lens[order[state.have++]] = 0;
              }
              state.lencode = state.lendyn;
              state.lenbits = 7;
              opts = { bits: state.lenbits };
              ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid code lengths set";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = CODELENS;
            /* falls through */
            case CODELENS:
              while (state.have < state.nlen + state.ndist) {
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_val < 16) {
                  hold >>>= here_bits;
                  bits -= here_bits;
                  state.lens[state.have++] = here_val;
                } else {
                  if (here_val === 16) {
                    n = here_bits + 2;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    if (state.have === 0) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    len = state.lens[state.have - 1];
                    copy = 3 + (hold & 3);
                    hold >>>= 2;
                    bits -= 2;
                  } else if (here_val === 17) {
                    n = here_bits + 3;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 3 + (hold & 7);
                    hold >>>= 3;
                    bits -= 3;
                  } else {
                    n = here_bits + 7;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 11 + (hold & 127);
                    hold >>>= 7;
                    bits -= 7;
                  }
                  if (state.have + copy > state.nlen + state.ndist) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD;
                    break;
                  }
                  while (copy--) {
                    state.lens[state.have++] = len;
                  }
                }
              }
              if (state.mode === BAD) {
                break;
              }
              if (state.lens[256] === 0) {
                strm.msg = "invalid code -- missing end-of-block";
                state.mode = BAD;
                break;
              }
              state.lenbits = 9;
              opts = { bits: state.lenbits };
              ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid literal/lengths set";
                state.mode = BAD;
                break;
              }
              state.distbits = 6;
              state.distcode = state.distdyn;
              opts = { bits: state.distbits };
              ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
              state.distbits = opts.bits;
              if (ret) {
                strm.msg = "invalid distances set";
                state.mode = BAD;
                break;
              }
              state.mode = LEN_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case LEN_:
              state.mode = LEN;
            /* falls through */
            case LEN:
              if (have >= 6 && left >= 258) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                inflate_fast(strm, _out);
                put = strm.next_out;
                output = strm.output;
                left = strm.avail_out;
                next = strm.next_in;
                input = strm.input;
                have = strm.avail_in;
                hold = state.hold;
                bits = state.bits;
                if (state.mode === TYPE) {
                  state.back = -1;
                }
                break;
              }
              state.back = 0;
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_op && (here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              state.length = here_val;
              if (here_op === 0) {
                state.mode = LIT;
                break;
              }
              if (here_op & 32) {
                state.back = -1;
                state.mode = TYPE;
                break;
              }
              if (here_op & 64) {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break;
              }
              state.extra = here_op & 15;
              state.mode = LENEXT;
            /* falls through */
            case LENEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              state.was = state.length;
              state.mode = DIST;
            /* falls through */
            case DIST:
              for (; ; ) {
                here = state.distcode[hold & (1 << state.distbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              if (here_op & 64) {
                strm.msg = "invalid distance code";
                state.mode = BAD;
                break;
              }
              state.offset = here_val;
              state.extra = here_op & 15;
              state.mode = DISTEXT;
            /* falls through */
            case DISTEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.offset += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              if (state.offset > state.dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break;
              }
              state.mode = MATCH;
            /* falls through */
            case MATCH:
              if (left === 0) {
                break inf_leave;
              }
              copy = _out - left;
              if (state.offset > copy) {
                copy = state.offset - copy;
                if (copy > state.whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD;
                    break;
                  }
                }
                if (copy > state.wnext) {
                  copy -= state.wnext;
                  from = state.wsize - copy;
                } else {
                  from = state.wnext - copy;
                }
                if (copy > state.length) {
                  copy = state.length;
                }
                from_source = state.window;
              } else {
                from_source = output;
                from = put - state.offset;
                copy = state.length;
              }
              if (copy > left) {
                copy = left;
              }
              left -= copy;
              state.length -= copy;
              do {
                output[put++] = from_source[from++];
              } while (--copy);
              if (state.length === 0) {
                state.mode = LEN;
              }
              break;
            case LIT:
              if (left === 0) {
                break inf_leave;
              }
              output[put++] = state.length;
              left--;
              state.mode = LEN;
              break;
            case CHECK:
              if (state.wrap) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold |= input[next++] << bits;
                  bits += 8;
                }
                _out -= left;
                strm.total_out += _out;
                state.total += _out;
                if (_out) {
                  strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                  state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                }
                _out = left;
                if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                  strm.msg = "incorrect data check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = LENGTH;
            /* falls through */
            case LENGTH:
              if (state.wrap && state.flags) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.total & 4294967295)) {
                  strm.msg = "incorrect length check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = DONE;
            /* falls through */
            case DONE:
              ret = Z_STREAM_END;
              break inf_leave;
            case BAD:
              ret = Z_DATA_ERROR;
              break inf_leave;
            case MEM:
              return Z_MEM_ERROR;
            case SYNC:
            /* falls through */
            default:
              return Z_STREAM_ERROR;
          }
        }
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
        if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if (state.wrap && _out) {
        strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
        state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
      if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
        ret = Z_BUF_ERROR;
      }
      return ret;
    }
    function inflateEnd(strm) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      var state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK;
    }
    function inflateGetHeader(strm, head) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if ((state.wrap & 2) === 0) {
        return Z_STREAM_ERROR;
      }
      state.head = head;
      head.done = false;
      return Z_OK;
    }
    function inflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var state;
      var dictid;
      var ret;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.wrap !== 0 && state.mode !== DICT) {
        return Z_STREAM_ERROR;
      }
      if (state.mode === DICT) {
        dictid = 1;
        dictid = adler32(dictid, dictionary, dictLength, 0);
        if (dictid !== state.check) {
          return Z_DATA_ERROR;
        }
      }
      ret = updatewindow(strm, dictionary, dictLength, dictLength);
      if (ret) {
        state.mode = MEM;
        return Z_MEM_ERROR;
      }
      state.havedict = 1;
      return Z_OK;
    }
    exports.inflateReset = inflateReset;
    exports.inflateReset2 = inflateReset2;
    exports.inflateResetKeep = inflateResetKeep;
    exports.inflateInit = inflateInit;
    exports.inflateInit2 = inflateInit2;
    exports.inflate = inflate;
    exports.inflateEnd = inflateEnd;
    exports.inflateGetHeader = inflateGetHeader;
    exports.inflateSetDictionary = inflateSetDictionary;
    exports.inflateInfo = "pako inflate (from Nodeca project)";
  }
});

// ../../node_modules/pako/lib/zlib/constants.js
var require_constants = __commonJS({
  "../../node_modules/pako/lib/zlib/constants.js"(exports, module) {
    "use strict";
    module.exports = {
      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH: 0,
      Z_PARTIAL_FLUSH: 1,
      Z_SYNC_FLUSH: 2,
      Z_FULL_FLUSH: 3,
      Z_FINISH: 4,
      Z_BLOCK: 5,
      Z_TREES: 6,
      /* Return codes for the compression/decompression functions. Negative values
      * are errors, positive values are used for special but normal events.
      */
      Z_OK: 0,
      Z_STREAM_END: 1,
      Z_NEED_DICT: 2,
      Z_ERRNO: -1,
      Z_STREAM_ERROR: -2,
      Z_DATA_ERROR: -3,
      //Z_MEM_ERROR:     -4,
      Z_BUF_ERROR: -5,
      //Z_VERSION_ERROR: -6,
      /* compression levels */
      Z_NO_COMPRESSION: 0,
      Z_BEST_SPEED: 1,
      Z_BEST_COMPRESSION: 9,
      Z_DEFAULT_COMPRESSION: -1,
      Z_FILTERED: 1,
      Z_HUFFMAN_ONLY: 2,
      Z_RLE: 3,
      Z_FIXED: 4,
      Z_DEFAULT_STRATEGY: 0,
      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY: 0,
      Z_TEXT: 1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN: 2,
      /* The deflate compression method */
      Z_DEFLATED: 8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };
  }
});

// ../../node_modules/pako/lib/zlib/gzheader.js
var require_gzheader = __commonJS({
  "../../node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
    "use strict";
    function GZheader() {
      this.text = 0;
      this.time = 0;
      this.xflags = 0;
      this.os = 0;
      this.extra = null;
      this.extra_len = 0;
      this.name = "";
      this.comment = "";
      this.hcrc = 0;
      this.done = false;
    }
    module.exports = GZheader;
  }
});

// ../../node_modules/pako/lib/inflate.js
var require_inflate2 = __commonJS({
  "../../node_modules/pako/lib/inflate.js"(exports) {
    "use strict";
    var zlib_inflate = require_inflate();
    var utils = require_common();
    var strings = require_strings();
    var c = require_constants();
    var msg = require_messages();
    var ZStream = require_zstream();
    var GZheader = require_gzheader();
    var toString = Object.prototype.toString;
    function Inflate(options) {
      if (!(this instanceof Inflate)) return new Inflate(options);
      this.options = utils.assign({
        chunkSize: 16384,
        windowBits: 0,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) {
          opt.windowBits = -15;
        }
      }
      if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
        opt.windowBits += 32;
      }
      if (opt.windowBits > 15 && opt.windowBits < 48) {
        if ((opt.windowBits & 15) === 0) {
          opt.windowBits |= 15;
        }
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_inflate.inflateInit2(
        this.strm,
        opt.windowBits
      );
      if (status !== c.Z_OK) {
        throw new Error(msg[status]);
      }
      this.header = new GZheader();
      zlib_inflate.inflateGetHeader(this.strm, this.header);
      if (opt.dictionary) {
        if (typeof opt.dictionary === "string") {
          opt.dictionary = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          opt.dictionary = new Uint8Array(opt.dictionary);
        }
        if (opt.raw) {
          status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
          if (status !== c.Z_OK) {
            throw new Error(msg[status]);
          }
        }
      }
    }
    Inflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var dictionary = this.options.dictionary;
      var status, _mode;
      var next_out_utf8, tail, utf8str;
      var allowBufError = false;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.binstring2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
        if (status === c.Z_NEED_DICT && dictionary) {
          status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
        }
        if (status === c.Z_BUF_ERROR && allowBufError === true) {
          status = c.Z_OK;
          allowBufError = false;
        }
        if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.next_out) {
          if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
              tail = strm.next_out - next_out_utf8;
              utf8str = strings.buf2string(strm.output, next_out_utf8);
              strm.next_out = tail;
              strm.avail_out = chunkSize - tail;
              if (tail) {
                utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
              }
              this.onData(utf8str);
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        }
        if (strm.avail_in === 0 && strm.avail_out === 0) {
          allowBufError = true;
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
      if (status === c.Z_STREAM_END) {
        _mode = c.Z_FINISH;
      }
      if (_mode === c.Z_FINISH) {
        status = zlib_inflate.inflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === c.Z_OK;
      }
      if (_mode === c.Z_SYNC_FLUSH) {
        this.onEnd(c.Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Inflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Inflate.prototype.onEnd = function(status) {
      if (status === c.Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function inflate(input, options) {
      var inflator = new Inflate(options);
      inflator.push(input, true);
      if (inflator.err) {
        throw inflator.msg || msg[inflator.err];
      }
      return inflator.result;
    }
    function inflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return inflate(input, options);
    }
    exports.Inflate = Inflate;
    exports.inflate = inflate;
    exports.inflateRaw = inflateRaw;
    exports.ungzip = inflate;
  }
});

// ../../node_modules/pako/index.js
var require_pako = __commonJS({
  "../../node_modules/pako/index.js"(exports, module) {
    "use strict";
    var assign = require_common().assign;
    var deflate = require_deflate2();
    var inflate = require_inflate2();
    var constants = require_constants();
    var pako = {};
    assign(pako, deflate, inflate, constants);
    module.exports = pako;
  }
});

// ../../node_modules/jszip/lib/flate.js
var require_flate = __commonJS({
  "../../node_modules/jszip/lib/flate.js"(exports) {
    "use strict";
    var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined";
    var pako = require_pako();
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var ARRAY_TYPE = USE_TYPEDARRAY ? "uint8array" : "array";
    exports.magic = "\b\0";
    function FlateWorker(action, options) {
      GenericWorker.call(this, "FlateWorker/" + action);
      this._pako = null;
      this._pakoAction = action;
      this._pakoOptions = options;
      this.meta = {};
    }
    utils.inherits(FlateWorker, GenericWorker);
    FlateWorker.prototype.processChunk = function(chunk) {
      this.meta = chunk.meta;
      if (this._pako === null) {
        this._createPako();
      }
      this._pako.push(utils.transformTo(ARRAY_TYPE, chunk.data), false);
    };
    FlateWorker.prototype.flush = function() {
      GenericWorker.prototype.flush.call(this);
      if (this._pako === null) {
        this._createPako();
      }
      this._pako.push([], true);
    };
    FlateWorker.prototype.cleanUp = function() {
      GenericWorker.prototype.cleanUp.call(this);
      this._pako = null;
    };
    FlateWorker.prototype._createPako = function() {
      this._pako = new pako[this._pakoAction]({
        raw: true,
        level: this._pakoOptions.level || -1
        // default compression
      });
      var self2 = this;
      this._pako.onData = function(data) {
        self2.push({
          data,
          meta: self2.meta
        });
      };
    };
    exports.compressWorker = function(compressionOptions) {
      return new FlateWorker("Deflate", compressionOptions);
    };
    exports.uncompressWorker = function() {
      return new FlateWorker("Inflate", {});
    };
  }
});

// ../../node_modules/jszip/lib/compressions.js
var require_compressions = __commonJS({
  "../../node_modules/jszip/lib/compressions.js"(exports) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    exports.STORE = {
      magic: "\0\0",
      compressWorker: function() {
        return new GenericWorker("STORE compression");
      },
      uncompressWorker: function() {
        return new GenericWorker("STORE decompression");
      }
    };
    exports.DEFLATE = require_flate();
  }
});

// ../../node_modules/jszip/lib/signature.js
var require_signature = __commonJS({
  "../../node_modules/jszip/lib/signature.js"(exports) {
    "use strict";
    exports.LOCAL_FILE_HEADER = "PK";
    exports.CENTRAL_FILE_HEADER = "PK";
    exports.CENTRAL_DIRECTORY_END = "PK";
    exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07";
    exports.ZIP64_CENTRAL_DIRECTORY_END = "PK";
    exports.DATA_DESCRIPTOR = "PK\x07\b";
  }
});

// ../../node_modules/jszip/lib/generate/ZipFileWorker.js
var require_ZipFileWorker = __commonJS({
  "../../node_modules/jszip/lib/generate/ZipFileWorker.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var utf8 = require_utf8();
    var crc32 = require_crc32();
    var signature = require_signature();
    var decToHex = function(dec, bytes) {
      var hex = "", i;
      for (i = 0; i < bytes; i++) {
        hex += String.fromCharCode(dec & 255);
        dec = dec >>> 8;
      }
      return hex;
    };
    var generateUnixExternalFileAttr = function(unixPermissions, isDir) {
      var result = unixPermissions;
      if (!unixPermissions) {
        result = isDir ? 16893 : 33204;
      }
      return (result & 65535) << 16;
    };
    var generateDosExternalFileAttr = function(dosPermissions) {
      return (dosPermissions || 0) & 63;
    };
    var generateZipParts = function(streamInfo, streamedContent, streamingEnded, offset, platform, encodeFileName) {
      var file = streamInfo["file"], compression = streamInfo["compression"], useCustomEncoding = encodeFileName !== utf8.utf8encode, encodedFileName = utils.transformTo("string", encodeFileName(file.name)), utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)), comment = file.comment, encodedComment = utils.transformTo("string", encodeFileName(comment)), utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)), useUTF8ForFileName = utfEncodedFileName.length !== file.name.length, useUTF8ForComment = utfEncodedComment.length !== comment.length, dosTime, dosDate, extraFields = "", unicodePathExtraField = "", unicodeCommentExtraField = "", dir = file.dir, date = file.date;
      var dataInfo = {
        crc32: 0,
        compressedSize: 0,
        uncompressedSize: 0
      };
      if (!streamedContent || streamingEnded) {
        dataInfo.crc32 = streamInfo["crc32"];
        dataInfo.compressedSize = streamInfo["compressedSize"];
        dataInfo.uncompressedSize = streamInfo["uncompressedSize"];
      }
      var bitflag = 0;
      if (streamedContent) {
        bitflag |= 8;
      }
      if (!useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment)) {
        bitflag |= 2048;
      }
      var extFileAttr = 0;
      var versionMadeBy = 0;
      if (dir) {
        extFileAttr |= 16;
      }
      if (platform === "UNIX") {
        versionMadeBy = 798;
        extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
      } else {
        versionMadeBy = 20;
        extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);
      }
      dosTime = date.getUTCHours();
      dosTime = dosTime << 6;
      dosTime = dosTime | date.getUTCMinutes();
      dosTime = dosTime << 5;
      dosTime = dosTime | date.getUTCSeconds() / 2;
      dosDate = date.getUTCFullYear() - 1980;
      dosDate = dosDate << 4;
      dosDate = dosDate | date.getUTCMonth() + 1;
      dosDate = dosDate << 5;
      dosDate = dosDate | date.getUTCDate();
      if (useUTF8ForFileName) {
        unicodePathExtraField = // Version
        decToHex(1, 1) + // NameCRC32
        decToHex(crc32(encodedFileName), 4) + // UnicodeName
        utfEncodedFileName;
        extraFields += // Info-ZIP Unicode Path Extra Field
        "up" + // size
        decToHex(unicodePathExtraField.length, 2) + // content
        unicodePathExtraField;
      }
      if (useUTF8ForComment) {
        unicodeCommentExtraField = // Version
        decToHex(1, 1) + // CommentCRC32
        decToHex(crc32(encodedComment), 4) + // UnicodeName
        utfEncodedComment;
        extraFields += // Info-ZIP Unicode Path Extra Field
        "uc" + // size
        decToHex(unicodeCommentExtraField.length, 2) + // content
        unicodeCommentExtraField;
      }
      var header = "";
      header += "\n\0";
      header += decToHex(bitflag, 2);
      header += compression.magic;
      header += decToHex(dosTime, 2);
      header += decToHex(dosDate, 2);
      header += decToHex(dataInfo.crc32, 4);
      header += decToHex(dataInfo.compressedSize, 4);
      header += decToHex(dataInfo.uncompressedSize, 4);
      header += decToHex(encodedFileName.length, 2);
      header += decToHex(extraFields.length, 2);
      var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;
      var dirRecord = signature.CENTRAL_FILE_HEADER + // version made by (00: DOS)
      decToHex(versionMadeBy, 2) + // file header (common to file and central directory)
      header + // file comment length
      decToHex(encodedComment.length, 2) + // disk number start
      "\0\0\0\0" + // external file attributes
      decToHex(extFileAttr, 4) + // relative offset of local header
      decToHex(offset, 4) + // file name
      encodedFileName + // extra field
      extraFields + // file comment
      encodedComment;
      return {
        fileRecord,
        dirRecord
      };
    };
    var generateCentralDirectoryEnd = function(entriesCount, centralDirLength, localDirLength, comment, encodeFileName) {
      var dirEnd = "";
      var encodedComment = utils.transformTo("string", encodeFileName(comment));
      dirEnd = signature.CENTRAL_DIRECTORY_END + // number of this disk
      "\0\0\0\0" + // total number of entries in the central directory on this disk
      decToHex(entriesCount, 2) + // total number of entries in the central directory
      decToHex(entriesCount, 2) + // size of the central directory   4 bytes
      decToHex(centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number
      decToHex(localDirLength, 4) + // .ZIP file comment length
      decToHex(encodedComment.length, 2) + // .ZIP file comment
      encodedComment;
      return dirEnd;
    };
    var generateDataDescriptors = function(streamInfo) {
      var descriptor = "";
      descriptor = signature.DATA_DESCRIPTOR + // crc-32                          4 bytes
      decToHex(streamInfo["crc32"], 4) + // compressed size                 4 bytes
      decToHex(streamInfo["compressedSize"], 4) + // uncompressed size               4 bytes
      decToHex(streamInfo["uncompressedSize"], 4);
      return descriptor;
    };
    function ZipFileWorker(streamFiles, comment, platform, encodeFileName) {
      GenericWorker.call(this, "ZipFileWorker");
      this.bytesWritten = 0;
      this.zipComment = comment;
      this.zipPlatform = platform;
      this.encodeFileName = encodeFileName;
      this.streamFiles = streamFiles;
      this.accumulate = false;
      this.contentBuffer = [];
      this.dirRecords = [];
      this.currentSourceOffset = 0;
      this.entriesCount = 0;
      this.currentFile = null;
      this._sources = [];
    }
    utils.inherits(ZipFileWorker, GenericWorker);
    ZipFileWorker.prototype.push = function(chunk) {
      var currentFilePercent = chunk.meta.percent || 0;
      var entriesCount = this.entriesCount;
      var remainingFiles = this._sources.length;
      if (this.accumulate) {
        this.contentBuffer.push(chunk);
      } else {
        this.bytesWritten += chunk.data.length;
        GenericWorker.prototype.push.call(this, {
          data: chunk.data,
          meta: {
            currentFile: this.currentFile,
            percent: entriesCount ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) / entriesCount : 100
          }
        });
      }
    };
    ZipFileWorker.prototype.openedSource = function(streamInfo) {
      this.currentSourceOffset = this.bytesWritten;
      this.currentFile = streamInfo["file"].name;
      var streamedContent = this.streamFiles && !streamInfo["file"].dir;
      if (streamedContent) {
        var record = generateZipParts(streamInfo, streamedContent, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
        this.push({
          data: record.fileRecord,
          meta: { percent: 0 }
        });
      } else {
        this.accumulate = true;
      }
    };
    ZipFileWorker.prototype.closedSource = function(streamInfo) {
      this.accumulate = false;
      var streamedContent = this.streamFiles && !streamInfo["file"].dir;
      var record = generateZipParts(streamInfo, streamedContent, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
      this.dirRecords.push(record.dirRecord);
      if (streamedContent) {
        this.push({
          data: generateDataDescriptors(streamInfo),
          meta: { percent: 100 }
        });
      } else {
        this.push({
          data: record.fileRecord,
          meta: { percent: 0 }
        });
        while (this.contentBuffer.length) {
          this.push(this.contentBuffer.shift());
        }
      }
      this.currentFile = null;
    };
    ZipFileWorker.prototype.flush = function() {
      var localDirLength = this.bytesWritten;
      for (var i = 0; i < this.dirRecords.length; i++) {
        this.push({
          data: this.dirRecords[i],
          meta: { percent: 100 }
        });
      }
      var centralDirLength = this.bytesWritten - localDirLength;
      var dirEnd = generateCentralDirectoryEnd(this.dirRecords.length, centralDirLength, localDirLength, this.zipComment, this.encodeFileName);
      this.push({
        data: dirEnd,
        meta: { percent: 100 }
      });
    };
    ZipFileWorker.prototype.prepareNextSource = function() {
      this.previous = this._sources.shift();
      this.openedSource(this.previous.streamInfo);
      if (this.isPaused) {
        this.previous.pause();
      } else {
        this.previous.resume();
      }
    };
    ZipFileWorker.prototype.registerPrevious = function(previous) {
      this._sources.push(previous);
      var self2 = this;
      previous.on("data", function(chunk) {
        self2.processChunk(chunk);
      });
      previous.on("end", function() {
        self2.closedSource(self2.previous.streamInfo);
        if (self2._sources.length) {
          self2.prepareNextSource();
        } else {
          self2.end();
        }
      });
      previous.on("error", function(e) {
        self2.error(e);
      });
      return this;
    };
    ZipFileWorker.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (!this.previous && this._sources.length) {
        this.prepareNextSource();
        return true;
      }
      if (!this.previous && !this._sources.length && !this.generatedError) {
        this.end();
        return true;
      }
    };
    ZipFileWorker.prototype.error = function(e) {
      var sources = this._sources;
      if (!GenericWorker.prototype.error.call(this, e)) {
        return false;
      }
      for (var i = 0; i < sources.length; i++) {
        try {
          sources[i].error(e);
        } catch (e2) {
        }
      }
      return true;
    };
    ZipFileWorker.prototype.lock = function() {
      GenericWorker.prototype.lock.call(this);
      var sources = this._sources;
      for (var i = 0; i < sources.length; i++) {
        sources[i].lock();
      }
    };
    module.exports = ZipFileWorker;
  }
});

// ../../node_modules/jszip/lib/generate/index.js
var require_generate = __commonJS({
  "../../node_modules/jszip/lib/generate/index.js"(exports) {
    "use strict";
    var compressions = require_compressions();
    var ZipFileWorker = require_ZipFileWorker();
    var getCompression = function(fileCompression, zipCompression) {
      var compressionName = fileCompression || zipCompression;
      var compression = compressions[compressionName];
      if (!compression) {
        throw new Error(compressionName + " is not a valid compression method !");
      }
      return compression;
    };
    exports.generateWorker = function(zip, options, comment) {
      var zipFileWorker = new ZipFileWorker(options.streamFiles, comment, options.platform, options.encodeFileName);
      var entriesCount = 0;
      try {
        zip.forEach(function(relativePath, file) {
          entriesCount++;
          var compression = getCompression(file.options.compression, options.compression);
          var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
          var dir = file.dir, date = file.date;
          file._compressWorker(compression, compressionOptions).withStreamInfo("file", {
            name: relativePath,
            dir,
            date,
            comment: file.comment || "",
            unixPermissions: file.unixPermissions,
            dosPermissions: file.dosPermissions
          }).pipe(zipFileWorker);
        });
        zipFileWorker.entriesCount = entriesCount;
      } catch (e) {
        zipFileWorker.error(e);
      }
      return zipFileWorker;
    };
  }
});

// ../../node_modules/jszip/lib/nodejs/NodejsStreamInputAdapter.js
var require_NodejsStreamInputAdapter = __commonJS({
  "../../node_modules/jszip/lib/nodejs/NodejsStreamInputAdapter.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    function NodejsStreamInputAdapter(filename, stream) {
      GenericWorker.call(this, "Nodejs stream input adapter for " + filename);
      this._upstreamEnded = false;
      this._bindStream(stream);
    }
    utils.inherits(NodejsStreamInputAdapter, GenericWorker);
    NodejsStreamInputAdapter.prototype._bindStream = function(stream) {
      var self2 = this;
      this._stream = stream;
      stream.pause();
      stream.on("data", function(chunk) {
        self2.push({
          data: chunk,
          meta: {
            percent: 0
          }
        });
      }).on("error", function(e) {
        if (self2.isPaused) {
          this.generatedError = e;
        } else {
          self2.error(e);
        }
      }).on("end", function() {
        if (self2.isPaused) {
          self2._upstreamEnded = true;
        } else {
          self2.end();
        }
      });
    };
    NodejsStreamInputAdapter.prototype.pause = function() {
      if (!GenericWorker.prototype.pause.call(this)) {
        return false;
      }
      this._stream.pause();
      return true;
    };
    NodejsStreamInputAdapter.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (this._upstreamEnded) {
        this.end();
      } else {
        this._stream.resume();
      }
      return true;
    };
    module.exports = NodejsStreamInputAdapter;
  }
});

// ../../node_modules/jszip/lib/object.js
var require_object = __commonJS({
  "../../node_modules/jszip/lib/object.js"(exports, module) {
    "use strict";
    var utf8 = require_utf8();
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var StreamHelper = require_StreamHelper();
    var defaults = require_defaults();
    var CompressedObject = require_compressedObject();
    var ZipObject = require_zipObject();
    var generate = require_generate();
    var nodejsUtils = require_nodejsUtils();
    var NodejsStreamInputAdapter = require_NodejsStreamInputAdapter();
    var fileAdd = function(name, data, originalOptions) {
      var dataType = utils.getTypeOf(data), parent;
      var o = utils.extend(originalOptions || {}, defaults);
      o.date = o.date || /* @__PURE__ */ new Date();
      if (o.compression !== null) {
        o.compression = o.compression.toUpperCase();
      }
      if (typeof o.unixPermissions === "string") {
        o.unixPermissions = parseInt(o.unixPermissions, 8);
      }
      if (o.unixPermissions && o.unixPermissions & 16384) {
        o.dir = true;
      }
      if (o.dosPermissions && o.dosPermissions & 16) {
        o.dir = true;
      }
      if (o.dir) {
        name = forceTrailingSlash(name);
      }
      if (o.createFolders && (parent = parentFolder(name))) {
        folderAdd.call(this, parent, true);
      }
      var isUnicodeString = dataType === "string" && o.binary === false && o.base64 === false;
      if (!originalOptions || typeof originalOptions.binary === "undefined") {
        o.binary = !isUnicodeString;
      }
      var isCompressedEmpty = data instanceof CompressedObject && data.uncompressedSize === 0;
      if (isCompressedEmpty || o.dir || !data || data.length === 0) {
        o.base64 = false;
        o.binary = true;
        data = "";
        o.compression = "STORE";
        dataType = "string";
      }
      var zipObjectContent = null;
      if (data instanceof CompressedObject || data instanceof GenericWorker) {
        zipObjectContent = data;
      } else if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        zipObjectContent = new NodejsStreamInputAdapter(name, data);
      } else {
        zipObjectContent = utils.prepareContent(name, data, o.binary, o.optimizedBinaryString, o.base64);
      }
      var object = new ZipObject(name, zipObjectContent, o);
      this.files[name] = object;
    };
    var parentFolder = function(path4) {
      if (path4.slice(-1) === "/") {
        path4 = path4.substring(0, path4.length - 1);
      }
      var lastSlash = path4.lastIndexOf("/");
      return lastSlash > 0 ? path4.substring(0, lastSlash) : "";
    };
    var forceTrailingSlash = function(path4) {
      if (path4.slice(-1) !== "/") {
        path4 += "/";
      }
      return path4;
    };
    var folderAdd = function(name, createFolders) {
      createFolders = typeof createFolders !== "undefined" ? createFolders : defaults.createFolders;
      name = forceTrailingSlash(name);
      if (!this.files[name]) {
        fileAdd.call(this, name, null, {
          dir: true,
          createFolders
        });
      }
      return this.files[name];
    };
    function isRegExp(object) {
      return Object.prototype.toString.call(object) === "[object RegExp]";
    }
    var out = {
      /**
       * @see loadAsync
       */
      load: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      },
      /**
       * Call a callback function for each entry at this folder level.
       * @param {Function} cb the callback function:
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       */
      forEach: function(cb) {
        var filename, relativePath, file;
        for (filename in this.files) {
          file = this.files[filename];
          relativePath = filename.slice(this.root.length, filename.length);
          if (relativePath && filename.slice(0, this.root.length) === this.root) {
            cb(relativePath, file);
          }
        }
      },
      /**
       * Filter nested files/folders with the specified function.
       * @param {Function} search the predicate to use :
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       * @return {Array} An array of matching elements.
       */
      filter: function(search) {
        var result = [];
        this.forEach(function(relativePath, entry) {
          if (search(relativePath, entry)) {
            result.push(entry);
          }
        });
        return result;
      },
      /**
       * Add a file to the zip file, or search a file.
       * @param   {string|RegExp} name The name of the file to add (if data is defined),
       * the name of the file to find (if no data) or a regex to match files.
       * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
       * @param   {Object} o     File options
       * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
       * a file (when searching by string) or an array of files (when searching by regex).
       */
      file: function(name, data, o) {
        if (arguments.length === 1) {
          if (isRegExp(name)) {
            var regexp = name;
            return this.filter(function(relativePath, file) {
              return !file.dir && regexp.test(relativePath);
            });
          } else {
            var obj = this.files[this.root + name];
            if (obj && !obj.dir) {
              return obj;
            } else {
              return null;
            }
          }
        } else {
          name = this.root + name;
          fileAdd.call(this, name, data, o);
        }
        return this;
      },
      /**
       * Add a directory to the zip file, or search.
       * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
       * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
       */
      folder: function(arg) {
        if (!arg) {
          return this;
        }
        if (isRegExp(arg)) {
          return this.filter(function(relativePath, file) {
            return file.dir && arg.test(relativePath);
          });
        }
        var name = this.root + arg;
        var newFolder = folderAdd.call(this, name);
        var ret = this.clone();
        ret.root = newFolder.name;
        return ret;
      },
      /**
       * Delete a file, or a directory and all sub-files, from the zip
       * @param {string} name the name of the file to delete
       * @return {JSZip} this JSZip object
       */
      remove: function(name) {
        name = this.root + name;
        var file = this.files[name];
        if (!file) {
          if (name.slice(-1) !== "/") {
            name += "/";
          }
          file = this.files[name];
        }
        if (file && !file.dir) {
          delete this.files[name];
        } else {
          var kids = this.filter(function(relativePath, file2) {
            return file2.name.slice(0, name.length) === name;
          });
          for (var i = 0; i < kids.length; i++) {
            delete this.files[kids[i].name];
          }
        }
        return this;
      },
      /**
       * @deprecated This method has been removed in JSZip 3.0, please check the upgrade guide.
       */
      generate: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      },
      /**
       * Generate the complete zip file as an internal stream.
       * @param {Object} options the options to generate the zip file :
       * - compression, "STORE" by default.
       * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
       * @return {StreamHelper} the streamed zip file.
       */
      generateInternalStream: function(options) {
        var worker, opts = {};
        try {
          opts = utils.extend(options || {}, {
            streamFiles: false,
            compression: "STORE",
            compressionOptions: null,
            type: "",
            platform: "DOS",
            comment: null,
            mimeType: "application/zip",
            encodeFileName: utf8.utf8encode
          });
          opts.type = opts.type.toLowerCase();
          opts.compression = opts.compression.toUpperCase();
          if (opts.type === "binarystring") {
            opts.type = "string";
          }
          if (!opts.type) {
            throw new Error("No output type specified.");
          }
          utils.checkSupport(opts.type);
          if (opts.platform === "darwin" || opts.platform === "freebsd" || opts.platform === "linux" || opts.platform === "sunos") {
            opts.platform = "UNIX";
          }
          if (opts.platform === "win32") {
            opts.platform = "DOS";
          }
          var comment = opts.comment || this.comment || "";
          worker = generate.generateWorker(this, opts, comment);
        } catch (e) {
          worker = new GenericWorker("error");
          worker.error(e);
        }
        return new StreamHelper(worker, opts.type || "string", opts.mimeType);
      },
      /**
       * Generate the complete zip file asynchronously.
       * @see generateInternalStream
       */
      generateAsync: function(options, onUpdate) {
        return this.generateInternalStream(options).accumulate(onUpdate);
      },
      /**
       * Generate the complete zip file asynchronously.
       * @see generateInternalStream
       */
      generateNodeStream: function(options, onUpdate) {
        options = options || {};
        if (!options.type) {
          options.type = "nodebuffer";
        }
        return this.generateInternalStream(options).toNodejsStream(onUpdate);
      }
    };
    module.exports = out;
  }
});

// ../../node_modules/jszip/lib/reader/DataReader.js
var require_DataReader = __commonJS({
  "../../node_modules/jszip/lib/reader/DataReader.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    function DataReader(data) {
      this.data = data;
      this.length = data.length;
      this.index = 0;
      this.zero = 0;
    }
    DataReader.prototype = {
      /**
       * Check that the offset will not go too far.
       * @param {string} offset the additional offset to check.
       * @throws {Error} an Error if the offset is out of bounds.
       */
      checkOffset: function(offset) {
        this.checkIndex(this.index + offset);
      },
      /**
       * Check that the specified index will not be too far.
       * @param {string} newIndex the index to check.
       * @throws {Error} an Error if the index is out of bounds.
       */
      checkIndex: function(newIndex) {
        if (this.length < this.zero + newIndex || newIndex < 0) {
          throw new Error("End of data reached (data length = " + this.length + ", asked index = " + newIndex + "). Corrupted zip ?");
        }
      },
      /**
       * Change the index.
       * @param {number} newIndex The new index.
       * @throws {Error} if the new index is out of the data.
       */
      setIndex: function(newIndex) {
        this.checkIndex(newIndex);
        this.index = newIndex;
      },
      /**
       * Skip the next n bytes.
       * @param {number} n the number of bytes to skip.
       * @throws {Error} if the new index is out of the data.
       */
      skip: function(n) {
        this.setIndex(this.index + n);
      },
      /**
       * Get the byte at the specified index.
       * @param {number} i the index to use.
       * @return {number} a byte.
       */
      byteAt: function() {
      },
      /**
       * Get the next number with a given byte size.
       * @param {number} size the number of bytes to read.
       * @return {number} the corresponding number.
       */
      readInt: function(size) {
        var result = 0, i;
        this.checkOffset(size);
        for (i = this.index + size - 1; i >= this.index; i--) {
          result = (result << 8) + this.byteAt(i);
        }
        this.index += size;
        return result;
      },
      /**
       * Get the next string with a given byte size.
       * @param {number} size the number of bytes to read.
       * @return {string} the corresponding string.
       */
      readString: function(size) {
        return utils.transformTo("string", this.readData(size));
      },
      /**
       * Get raw data without conversion, <size> bytes.
       * @param {number} size the number of bytes to read.
       * @return {Object} the raw data, implementation specific.
       */
      readData: function() {
      },
      /**
       * Find the last occurrence of a zip signature (4 bytes).
       * @param {string} sig the signature to find.
       * @return {number} the index of the last occurrence, -1 if not found.
       */
      lastIndexOfSignature: function() {
      },
      /**
       * Read the signature (4 bytes) at the current position and compare it with sig.
       * @param {string} sig the expected signature
       * @return {boolean} true if the signature matches, false otherwise.
       */
      readAndCheckSignature: function() {
      },
      /**
       * Get the next date.
       * @return {Date} the date.
       */
      readDate: function() {
        var dostime = this.readInt(4);
        return new Date(Date.UTC(
          (dostime >> 25 & 127) + 1980,
          // year
          (dostime >> 21 & 15) - 1,
          // month
          dostime >> 16 & 31,
          // day
          dostime >> 11 & 31,
          // hour
          dostime >> 5 & 63,
          // minute
          (dostime & 31) << 1
        ));
      }
    };
    module.exports = DataReader;
  }
});

// ../../node_modules/jszip/lib/reader/ArrayReader.js
var require_ArrayReader = __commonJS({
  "../../node_modules/jszip/lib/reader/ArrayReader.js"(exports, module) {
    "use strict";
    var DataReader = require_DataReader();
    var utils = require_utils();
    function ArrayReader(data) {
      DataReader.call(this, data);
      for (var i = 0; i < this.data.length; i++) {
        data[i] = data[i] & 255;
      }
    }
    utils.inherits(ArrayReader, DataReader);
    ArrayReader.prototype.byteAt = function(i) {
      return this.data[this.zero + i];
    };
    ArrayReader.prototype.lastIndexOfSignature = function(sig) {
      var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3);
      for (var i = this.length - 4; i >= 0; --i) {
        if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
          return i - this.zero;
        }
      }
      return -1;
    };
    ArrayReader.prototype.readAndCheckSignature = function(sig) {
      var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3), data = this.readData(4);
      return sig0 === data[0] && sig1 === data[1] && sig2 === data[2] && sig3 === data[3];
    };
    ArrayReader.prototype.readData = function(size) {
      this.checkOffset(size);
      if (size === 0) {
        return [];
      }
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = ArrayReader;
  }
});

// ../../node_modules/jszip/lib/reader/StringReader.js
var require_StringReader = __commonJS({
  "../../node_modules/jszip/lib/reader/StringReader.js"(exports, module) {
    "use strict";
    var DataReader = require_DataReader();
    var utils = require_utils();
    function StringReader(data) {
      DataReader.call(this, data);
    }
    utils.inherits(StringReader, DataReader);
    StringReader.prototype.byteAt = function(i) {
      return this.data.charCodeAt(this.zero + i);
    };
    StringReader.prototype.lastIndexOfSignature = function(sig) {
      return this.data.lastIndexOf(sig) - this.zero;
    };
    StringReader.prototype.readAndCheckSignature = function(sig) {
      var data = this.readData(4);
      return sig === data;
    };
    StringReader.prototype.readData = function(size) {
      this.checkOffset(size);
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = StringReader;
  }
});

// ../../node_modules/jszip/lib/reader/Uint8ArrayReader.js
var require_Uint8ArrayReader = __commonJS({
  "../../node_modules/jszip/lib/reader/Uint8ArrayReader.js"(exports, module) {
    "use strict";
    var ArrayReader = require_ArrayReader();
    var utils = require_utils();
    function Uint8ArrayReader(data) {
      ArrayReader.call(this, data);
    }
    utils.inherits(Uint8ArrayReader, ArrayReader);
    Uint8ArrayReader.prototype.readData = function(size) {
      this.checkOffset(size);
      if (size === 0) {
        return new Uint8Array(0);
      }
      var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = Uint8ArrayReader;
  }
});

// ../../node_modules/jszip/lib/reader/NodeBufferReader.js
var require_NodeBufferReader = __commonJS({
  "../../node_modules/jszip/lib/reader/NodeBufferReader.js"(exports, module) {
    "use strict";
    var Uint8ArrayReader = require_Uint8ArrayReader();
    var utils = require_utils();
    function NodeBufferReader(data) {
      Uint8ArrayReader.call(this, data);
    }
    utils.inherits(NodeBufferReader, Uint8ArrayReader);
    NodeBufferReader.prototype.readData = function(size) {
      this.checkOffset(size);
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module.exports = NodeBufferReader;
  }
});

// ../../node_modules/jszip/lib/reader/readerFor.js
var require_readerFor = __commonJS({
  "../../node_modules/jszip/lib/reader/readerFor.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var ArrayReader = require_ArrayReader();
    var StringReader = require_StringReader();
    var NodeBufferReader = require_NodeBufferReader();
    var Uint8ArrayReader = require_Uint8ArrayReader();
    module.exports = function(data) {
      var type = utils.getTypeOf(data);
      utils.checkSupport(type);
      if (type === "string" && !support.uint8array) {
        return new StringReader(data);
      }
      if (type === "nodebuffer") {
        return new NodeBufferReader(data);
      }
      if (support.uint8array) {
        return new Uint8ArrayReader(utils.transformTo("uint8array", data));
      }
      return new ArrayReader(utils.transformTo("array", data));
    };
  }
});

// ../../node_modules/jszip/lib/zipEntry.js
var require_zipEntry = __commonJS({
  "../../node_modules/jszip/lib/zipEntry.js"(exports, module) {
    "use strict";
    var readerFor = require_readerFor();
    var utils = require_utils();
    var CompressedObject = require_compressedObject();
    var crc32fn = require_crc32();
    var utf8 = require_utf8();
    var compressions = require_compressions();
    var support = require_support();
    var MADE_BY_DOS = 0;
    var MADE_BY_UNIX = 3;
    var findCompression = function(compressionMethod) {
      for (var method in compressions) {
        if (!Object.prototype.hasOwnProperty.call(compressions, method)) {
          continue;
        }
        if (compressions[method].magic === compressionMethod) {
          return compressions[method];
        }
      }
      return null;
    };
    function ZipEntry(options, loadOptions) {
      this.options = options;
      this.loadOptions = loadOptions;
    }
    ZipEntry.prototype = {
      /**
       * say if the file is encrypted.
       * @return {boolean} true if the file is encrypted, false otherwise.
       */
      isEncrypted: function() {
        return (this.bitFlag & 1) === 1;
      },
      /**
       * say if the file has utf-8 filename/comment.
       * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
       */
      useUTF8: function() {
        return (this.bitFlag & 2048) === 2048;
      },
      /**
       * Read the local part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readLocalPart: function(reader) {
        var compression, localExtraFieldsLength;
        reader.skip(22);
        this.fileNameLength = reader.readInt(2);
        localExtraFieldsLength = reader.readInt(2);
        this.fileName = reader.readData(this.fileNameLength);
        reader.skip(localExtraFieldsLength);
        if (this.compressedSize === -1 || this.uncompressedSize === -1) {
          throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
        }
        compression = findCompression(this.compressionMethod);
        if (compression === null) {
          throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + utils.transformTo("string", this.fileName) + ")");
        }
        this.decompressed = new CompressedObject(this.compressedSize, this.uncompressedSize, this.crc32, compression, reader.readData(this.compressedSize));
      },
      /**
       * Read the central part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readCentralPart: function(reader) {
        this.versionMadeBy = reader.readInt(2);
        reader.skip(2);
        this.bitFlag = reader.readInt(2);
        this.compressionMethod = reader.readString(2);
        this.date = reader.readDate();
        this.crc32 = reader.readInt(4);
        this.compressedSize = reader.readInt(4);
        this.uncompressedSize = reader.readInt(4);
        var fileNameLength = reader.readInt(2);
        this.extraFieldsLength = reader.readInt(2);
        this.fileCommentLength = reader.readInt(2);
        this.diskNumberStart = reader.readInt(2);
        this.internalFileAttributes = reader.readInt(2);
        this.externalFileAttributes = reader.readInt(4);
        this.localHeaderOffset = reader.readInt(4);
        if (this.isEncrypted()) {
          throw new Error("Encrypted zip are not supported");
        }
        reader.skip(fileNameLength);
        this.readExtraFields(reader);
        this.parseZIP64ExtraField(reader);
        this.fileComment = reader.readData(this.fileCommentLength);
      },
      /**
       * Parse the external file attributes and get the unix/dos permissions.
       */
      processAttributes: function() {
        this.unixPermissions = null;
        this.dosPermissions = null;
        var madeBy = this.versionMadeBy >> 8;
        this.dir = this.externalFileAttributes & 16 ? true : false;
        if (madeBy === MADE_BY_DOS) {
          this.dosPermissions = this.externalFileAttributes & 63;
        }
        if (madeBy === MADE_BY_UNIX) {
          this.unixPermissions = this.externalFileAttributes >> 16 & 65535;
        }
        if (!this.dir && this.fileNameStr.slice(-1) === "/") {
          this.dir = true;
        }
      },
      /**
       * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
       * @param {DataReader} reader the reader to use.
       */
      parseZIP64ExtraField: function() {
        if (!this.extraFields[1]) {
          return;
        }
        var extraReader = readerFor(this.extraFields[1].value);
        if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
          this.uncompressedSize = extraReader.readInt(8);
        }
        if (this.compressedSize === utils.MAX_VALUE_32BITS) {
          this.compressedSize = extraReader.readInt(8);
        }
        if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
          this.localHeaderOffset = extraReader.readInt(8);
        }
        if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
          this.diskNumberStart = extraReader.readInt(4);
        }
      },
      /**
       * Read the central part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readExtraFields: function(reader) {
        var end = reader.index + this.extraFieldsLength, extraFieldId, extraFieldLength, extraFieldValue;
        if (!this.extraFields) {
          this.extraFields = {};
        }
        while (reader.index + 4 < end) {
          extraFieldId = reader.readInt(2);
          extraFieldLength = reader.readInt(2);
          extraFieldValue = reader.readData(extraFieldLength);
          this.extraFields[extraFieldId] = {
            id: extraFieldId,
            length: extraFieldLength,
            value: extraFieldValue
          };
        }
        reader.setIndex(end);
      },
      /**
       * Apply an UTF8 transformation if needed.
       */
      handleUTF8: function() {
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        if (this.useUTF8()) {
          this.fileNameStr = utf8.utf8decode(this.fileName);
          this.fileCommentStr = utf8.utf8decode(this.fileComment);
        } else {
          var upath = this.findExtraFieldUnicodePath();
          if (upath !== null) {
            this.fileNameStr = upath;
          } else {
            var fileNameByteArray = utils.transformTo(decodeParamType, this.fileName);
            this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
          }
          var ucomment = this.findExtraFieldUnicodeComment();
          if (ucomment !== null) {
            this.fileCommentStr = ucomment;
          } else {
            var commentByteArray = utils.transformTo(decodeParamType, this.fileComment);
            this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
          }
        }
      },
      /**
       * Find the unicode path declared in the extra field, if any.
       * @return {String} the unicode path, null otherwise.
       */
      findExtraFieldUnicodePath: function() {
        var upathField = this.extraFields[28789];
        if (upathField) {
          var extraReader = readerFor(upathField.value);
          if (extraReader.readInt(1) !== 1) {
            return null;
          }
          if (crc32fn(this.fileName) !== extraReader.readInt(4)) {
            return null;
          }
          return utf8.utf8decode(extraReader.readData(upathField.length - 5));
        }
        return null;
      },
      /**
       * Find the unicode comment declared in the extra field, if any.
       * @return {String} the unicode comment, null otherwise.
       */
      findExtraFieldUnicodeComment: function() {
        var ucommentField = this.extraFields[25461];
        if (ucommentField) {
          var extraReader = readerFor(ucommentField.value);
          if (extraReader.readInt(1) !== 1) {
            return null;
          }
          if (crc32fn(this.fileComment) !== extraReader.readInt(4)) {
            return null;
          }
          return utf8.utf8decode(extraReader.readData(ucommentField.length - 5));
        }
        return null;
      }
    };
    module.exports = ZipEntry;
  }
});

// ../../node_modules/jszip/lib/zipEntries.js
var require_zipEntries = __commonJS({
  "../../node_modules/jszip/lib/zipEntries.js"(exports, module) {
    "use strict";
    var readerFor = require_readerFor();
    var utils = require_utils();
    var sig = require_signature();
    var ZipEntry = require_zipEntry();
    var support = require_support();
    function ZipEntries(loadOptions) {
      this.files = [];
      this.loadOptions = loadOptions;
    }
    ZipEntries.prototype = {
      /**
       * Check that the reader is on the specified signature.
       * @param {string} expectedSignature the expected signature.
       * @throws {Error} if it is an other signature.
       */
      checkSignature: function(expectedSignature) {
        if (!this.reader.readAndCheckSignature(expectedSignature)) {
          this.reader.index -= 4;
          var signature = this.reader.readString(4);
          throw new Error("Corrupted zip or bug: unexpected signature (" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
        }
      },
      /**
       * Check if the given signature is at the given index.
       * @param {number} askedIndex the index to check.
       * @param {string} expectedSignature the signature to expect.
       * @return {boolean} true if the signature is here, false otherwise.
       */
      isSignature: function(askedIndex, expectedSignature) {
        var currentIndex = this.reader.index;
        this.reader.setIndex(askedIndex);
        var signature = this.reader.readString(4);
        var result = signature === expectedSignature;
        this.reader.setIndex(currentIndex);
        return result;
      },
      /**
       * Read the end of the central directory.
       */
      readBlockEndOfCentral: function() {
        this.diskNumber = this.reader.readInt(2);
        this.diskWithCentralDirStart = this.reader.readInt(2);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
        this.centralDirRecords = this.reader.readInt(2);
        this.centralDirSize = this.reader.readInt(4);
        this.centralDirOffset = this.reader.readInt(4);
        this.zipCommentLength = this.reader.readInt(2);
        var zipComment = this.reader.readData(this.zipCommentLength);
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        var decodeContent = utils.transformTo(decodeParamType, zipComment);
        this.zipComment = this.loadOptions.decodeFileName(decodeContent);
      },
      /**
       * Read the end of the Zip 64 central directory.
       * Not merged with the method readEndOfCentral :
       * The end of central can coexist with its Zip64 brother,
       * I don't want to read the wrong number of bytes !
       */
      readBlockZip64EndOfCentral: function() {
        this.zip64EndOfCentralSize = this.reader.readInt(8);
        this.reader.skip(4);
        this.diskNumber = this.reader.readInt(4);
        this.diskWithCentralDirStart = this.reader.readInt(4);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
        this.centralDirRecords = this.reader.readInt(8);
        this.centralDirSize = this.reader.readInt(8);
        this.centralDirOffset = this.reader.readInt(8);
        this.zip64ExtensibleData = {};
        var extraDataSize = this.zip64EndOfCentralSize - 44, index = 0, extraFieldId, extraFieldLength, extraFieldValue;
        while (index < extraDataSize) {
          extraFieldId = this.reader.readInt(2);
          extraFieldLength = this.reader.readInt(4);
          extraFieldValue = this.reader.readData(extraFieldLength);
          this.zip64ExtensibleData[extraFieldId] = {
            id: extraFieldId,
            length: extraFieldLength,
            value: extraFieldValue
          };
        }
      },
      /**
       * Read the end of the Zip 64 central directory locator.
       */
      readBlockZip64EndOfCentralLocator: function() {
        this.diskWithZip64CentralDirStart = this.reader.readInt(4);
        this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
        this.disksCount = this.reader.readInt(4);
        if (this.disksCount > 1) {
          throw new Error("Multi-volumes zip are not supported");
        }
      },
      /**
       * Read the local files, based on the offset read in the central part.
       */
      readLocalFiles: function() {
        var i, file;
        for (i = 0; i < this.files.length; i++) {
          file = this.files[i];
          this.reader.setIndex(file.localHeaderOffset);
          this.checkSignature(sig.LOCAL_FILE_HEADER);
          file.readLocalPart(this.reader);
          file.handleUTF8();
          file.processAttributes();
        }
      },
      /**
       * Read the central directory.
       */
      readCentralDir: function() {
        var file;
        this.reader.setIndex(this.centralDirOffset);
        while (this.reader.readAndCheckSignature(sig.CENTRAL_FILE_HEADER)) {
          file = new ZipEntry({
            zip64: this.zip64
          }, this.loadOptions);
          file.readCentralPart(this.reader);
          this.files.push(file);
        }
        if (this.centralDirRecords !== this.files.length) {
          if (this.centralDirRecords !== 0 && this.files.length === 0) {
            throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
          } else {
          }
        }
      },
      /**
       * Read the end of central directory.
       */
      readEndOfCentral: function() {
        var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
        if (offset < 0) {
          var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);
          if (isGarbage) {
            throw new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
          } else {
            throw new Error("Corrupted zip: can't find end of central directory");
          }
        }
        this.reader.setIndex(offset);
        var endOfCentralDirOffset = offset;
        this.checkSignature(sig.CENTRAL_DIRECTORY_END);
        this.readBlockEndOfCentral();
        if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
          this.zip64 = true;
          offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
          if (offset < 0) {
            throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
          }
          this.reader.setIndex(offset);
          this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
          this.readBlockZip64EndOfCentralLocator();
          if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
            this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
            if (this.relativeOffsetEndOfZip64CentralDir < 0) {
              throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            }
          }
          this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
          this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
          this.readBlockZip64EndOfCentral();
        }
        var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
        if (this.zip64) {
          expectedEndOfCentralDirOffset += 20;
          expectedEndOfCentralDirOffset += 12 + this.zip64EndOfCentralSize;
        }
        var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;
        if (extraBytes > 0) {
          if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {
          } else {
            this.reader.zero = extraBytes;
          }
        } else if (extraBytes < 0) {
          throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
        }
      },
      prepareReader: function(data) {
        this.reader = readerFor(data);
      },
      /**
       * Read a zip file and create ZipEntries.
       * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
       */
      load: function(data) {
        this.prepareReader(data);
        this.readEndOfCentral();
        this.readCentralDir();
        this.readLocalFiles();
      }
    };
    module.exports = ZipEntries;
  }
});

// ../../node_modules/jszip/lib/load.js
var require_load = __commonJS({
  "../../node_modules/jszip/lib/load.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var external = require_external();
    var utf8 = require_utf8();
    var ZipEntries = require_zipEntries();
    var Crc32Probe = require_Crc32Probe();
    var nodejsUtils = require_nodejsUtils();
    function checkEntryCRC32(zipEntry) {
      return new external.Promise(function(resolve, reject) {
        var worker = zipEntry.decompressed.getContentWorker().pipe(new Crc32Probe());
        worker.on("error", function(e) {
          reject(e);
        }).on("end", function() {
          if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
            reject(new Error("Corrupted zip : CRC32 mismatch"));
          } else {
            resolve();
          }
        }).resume();
      });
    }
    module.exports = function(data, options) {
      var zip = this;
      options = utils.extend(options || {}, {
        base64: false,
        checkCRC32: false,
        optimizedBinaryString: false,
        createFolders: false,
        decodeFileName: utf8.utf8decode
      });
      if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        return external.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
      }
      return utils.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64).then(function(data2) {
        var zipEntries = new ZipEntries(options);
        zipEntries.load(data2);
        return zipEntries;
      }).then(function checkCRC32(zipEntries) {
        var promises = [external.Promise.resolve(zipEntries)];
        var files = zipEntries.files;
        if (options.checkCRC32) {
          for (var i = 0; i < files.length; i++) {
            promises.push(checkEntryCRC32(files[i]));
          }
        }
        return external.Promise.all(promises);
      }).then(function addFiles(results) {
        var zipEntries = results.shift();
        var files = zipEntries.files;
        for (var i = 0; i < files.length; i++) {
          var input = files[i];
          var unsafeName = input.fileNameStr;
          var safeName = utils.resolve(input.fileNameStr);
          zip.file(safeName, input.decompressed, {
            binary: true,
            optimizedBinaryString: true,
            date: input.date,
            dir: input.dir,
            comment: input.fileCommentStr.length ? input.fileCommentStr : null,
            unixPermissions: input.unixPermissions,
            dosPermissions: input.dosPermissions,
            createFolders: options.createFolders
          });
          if (!input.dir) {
            zip.file(safeName).unsafeOriginalName = unsafeName;
          }
        }
        if (zipEntries.zipComment.length) {
          zip.comment = zipEntries.zipComment;
        }
        return zip;
      });
    };
  }
});

// ../../node_modules/jszip/lib/index.js
var require_lib3 = __commonJS({
  "../../node_modules/jszip/lib/index.js"(exports, module) {
    "use strict";
    function JSZip2() {
      if (!(this instanceof JSZip2)) {
        return new JSZip2();
      }
      if (arguments.length) {
        throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
      }
      this.files = /* @__PURE__ */ Object.create(null);
      this.comment = null;
      this.root = "";
      this.clone = function() {
        var newObj = new JSZip2();
        for (var i in this) {
          if (typeof this[i] !== "function") {
            newObj[i] = this[i];
          }
        }
        return newObj;
      };
    }
    JSZip2.prototype = require_object();
    JSZip2.prototype.loadAsync = require_load();
    JSZip2.support = require_support();
    JSZip2.defaults = require_defaults();
    JSZip2.version = "3.10.1";
    JSZip2.loadAsync = function(content, options) {
      return new JSZip2().loadAsync(content, options);
    };
    JSZip2.external = require_external();
    module.exports = JSZip2;
  }
});

// src/server.ts
import { createServer } from "node:http";
import { createHash as createHash5, createHmac, timingSafeEqual } from "node:crypto";
import { readFile as readFile3 } from "node:fs/promises";
import path3 from "node:path";
import { fileURLToPath } from "node:url";

// ../shared/src/locale.ts
var SUPPORTED_LOCALES = ["ko", "en", "ja", "pt-BR", "es", "zh-TW", "vi"];
var SUPPORTED_LOCALE_SET = new Set(SUPPORTED_LOCALES);
function parseSupportedLocale(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith("ko")) {
    return "ko";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  if (normalized.startsWith("ja")) {
    return "ja";
  }
  if (normalized === "pt" || normalized.startsWith("pt-")) {
    return "pt-BR";
  }
  if (normalized === "es" || normalized.startsWith("es-")) {
    return "es";
  }
  if (normalized === "vi" || normalized.startsWith("vi-")) {
    return "vi";
  }
  if (normalized === "zh" || normalized.startsWith("zh-")) {
    if (normalized.includes("hans") || normalized === "zh-cn" || normalized === "zh-sg") {
      return null;
    }
    return "zh-TW";
  }
  return null;
}
function normalizeLocale(value, fallback = "en") {
  return parseSupportedLocale(value) ?? fallback;
}
function detectLocaleFromNavigator(language, fallback = "en") {
  return normalizeLocale(language, fallback);
}

// src/server/license-service.ts
import { readFile } from "node:fs/promises";
function toBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function parseJsonWebKey(raw, source) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON web key data in ${source}.`);
  }
}
async function readPrivateKeyJwk() {
  const inline = process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK?.trim();
  if (inline) {
    return parseJsonWebKey(inline, "THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK");
  }
  const explicitFile = process.env.THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE?.trim();
  if (!explicitFile) {
    throw new Error(
      "Missing license private key. Set THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK or THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE."
    );
  }
  const fileContents = await readFile(explicitFile, "utf8");
  return parseJsonWebKey(fileContents, explicitFile);
}
async function signProLicenseToken(holder, expiresAt) {
  const payload = {
    plan: "pro",
    holder,
    issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt
  };
  const payloadSegment = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const privateKey = await readPrivateKeyJwk();
  const signingKey = await crypto.subtle.importKey(
    "jwk",
    privateKey,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256"
    },
    signingKey,
    new TextEncoder().encode(payloadSegment)
  );
  return `${payloadSegment}.${toBase64Url(new Uint8Array(signature))}`;
}
function buildTokenPreview(token) {
  if (token.length <= 20) {
    return token;
  }
  return `${token.slice(0, 12)}...${token.slice(-8)}`;
}
function buildDeliveryDraft(order, license) {
  const subject = "Your Threads to Obsidian Pro key";
  const body = [
    `Hi ${order.buyerName || "there"},`,
    "",
    "Thanks for purchasing Threads to Obsidian Pro.",
    "",
    "Your Pro key:",
    license.token,
    "",
    "Activation steps:",
    "1. Open the extension settings page.",
    "2. Go to the Pro section.",
    "3. Paste the key and activate organization rules.",
    "",
    "Notes:",
    "- The key is meant for your use and should not be shared.",
    "- You can activate it on up to 3 devices. Remove it from an old device to free a seat.",
    "- Free saving still works without this key.",
    license.expiresAt ? `- This key expires on ${license.expiresAt}.` : "- This key currently has no expiration date.",
    "",
    "If you need help, reply to this email with the address you used for purchase.",
    "",
    "OX Corp"
  ].join("\n");
  return {
    to: order.buyerEmail,
    subject,
    body
  };
}

// src/server/activation-service.ts
import { createHash } from "node:crypto";

// ../shared/src/license.ts
var PRO_LICENSE_PUBLIC_KEY = {
  kty: "EC",
  x: "sACfUItyPveEEvzTzJRpeoBqpsg7DBTcmidebSuJ29U",
  y: "lv68pNMuUrDUT0SgjTTmWigwcItjIBtRqE3pRxdSKLM",
  crv: "P-256"
};
var cachedPublicKey = null;
function toBase64UrlBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
function decodePayloadSegment(segment) {
  try {
    const bytes = toBase64UrlBytes(segment);
    const raw = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(raw);
    if (parsed.plan !== "pro" || typeof parsed.issuedAt !== "string") {
      return null;
    }
    if (parsed.expiresAt !== null && parsed.expiresAt !== void 0 && typeof parsed.expiresAt !== "string") {
      return null;
    }
    if (parsed.holder !== null && parsed.holder !== void 0 && typeof parsed.holder !== "string") {
      return null;
    }
    return {
      plan: "pro",
      holder: parsed.holder ?? null,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt ?? null
    };
  } catch {
    return null;
  }
}
function hasExpired(payload) {
  if (!payload.expiresAt) {
    return false;
  }
  const expiresAt = Date.parse(payload.expiresAt);
  if (!Number.isFinite(expiresAt)) {
    return true;
  }
  return expiresAt < Date.now();
}
async function importPublicKey(publicKey) {
  return await crypto.subtle.importKey(
    "jwk",
    publicKey,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["verify"]
  );
}
async function getPublicKey(publicKey = PRO_LICENSE_PUBLIC_KEY) {
  if (publicKey !== PRO_LICENSE_PUBLIC_KEY) {
    return await importPublicKey(publicKey);
  }
  cachedPublicKey ??= importPublicKey(publicKey);
  return await cachedPublicKey;
}
async function validateProLicenseToken(token, publicKey = PRO_LICENSE_PUBLIC_KEY) {
  const normalized = token.trim();
  if (!normalized) {
    return { state: "none", payload: null };
  }
  const [payloadSegment, signatureSegment, ...rest] = normalized.split(".");
  if (!payloadSegment || !signatureSegment || rest.length > 0) {
    return { state: "invalid", payload: null };
  }
  const payload = decodePayloadSegment(payloadSegment);
  if (!payload) {
    return { state: "invalid", payload: null };
  }
  try {
    const key = await getPublicKey(publicKey);
    const signatureBytes = toBase64UrlBytes(signatureSegment);
    const signature = new Uint8Array(signatureBytes.length);
    signature.set(signatureBytes);
    const data = new TextEncoder().encode(payloadSegment);
    const verified = await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: "SHA-256"
      },
      key,
      signature,
      data
    );
    if (!verified) {
      return { state: "invalid", payload: null };
    }
  } catch {
    return { state: "invalid", payload: null };
  }
  if (hasExpired(payload)) {
    return { state: "expired", payload };
  }
  return { state: "valid", payload };
}

// src/server/store.ts
import { mkdir as mkdir2, readFile as readFile2, rename as rename2, writeFile as writeFile2 } from "node:fs/promises";
import path2 from "node:path";
import { Pool } from "pg";

// ../web-schema/src/index.ts
var DEFAULT_SETTINGS = {
  productName: "Threads Saver",
  headline: "Threads \uC800\uC7A5\uC744 \uD55C \uACF3\uC5D0\uC11C.",
  subheadline: "29\uB2EC\uB7EC 1\uD68C \uACB0\uC81C\uB85C Chrome extension Pro\uC640 scrapbook core\uB97C \uD568\uAED8 \uC501\uB2C8\uB2E4. Discovery, Search, Insights\uB294 cloud add-on\uC73C\uB85C \uD655\uC7A5\uD569\uB2C8\uB2E4.",
  priceLabel: "Threads Saver Pro",
  priceValue: "$29",
  supportEmail: "hello@oxcorp.ninja",
  includedUpdates: "1\uD68C \uACB0\uC81C \xB7 7\uC77C \uD658\uBD88 \xB7 extension Pro + scrapbook core",
  heroNotes: [
    "Free: \uD604\uC7AC \uAE00 \uC800\uC7A5 \xB7 \uC774\uBBF8\uC9C0 \uD3EC\uD568 \xB7 \uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00",
    "Pro: \uD30C\uC77C\uBA85 \uD328\uD134 \xB7 \uC800\uC7A5 \uACBD\uB85C \xB7 AI \uC694\uC57D \xB7 AI \uD0DC\uADF8 \xB7 scrapbook core",
    "Cloud add-on: Watchlists \xB7 Keyword search \xB7 Insights"
  ],
  faqs: [
    {
      id: "faq-1",
      question: "\uC800\uC7A5\uD558\uB824\uBA74 Pro\uAC00 \uD544\uC694\uD55C\uAC00\uC694?",
      answer: "\uC544\uB2C8\uC694. \uC800\uC7A5, \uC774\uBBF8\uC9C0 \uD3EC\uD568, \uC5F0\uC18D \uB2F5\uAE00, \uC911\uBCF5 \uAC74\uB108\uB700 \uBAA8\uB450 Free\uC5D0\uC11C \uAC00\uB2A5\uD569\uB2C8\uB2E4."
    },
    {
      id: "faq-2",
      question: "\uB204\uAC00 Pro\uB97C \uC0AC\uBA74 \uC88B\uB098\uC694?",
      answer: "\uC800\uC7A5\uD560 \uB54C \uD30C\uC77C\uBA85\xB7\uACBD\uB85C \uADDC\uCE59\uC744 \uC9C1\uC811 \uC81C\uC5B4\uD558\uACE0, \uC790\uC2E0\uC758 LLM \uD0A4\uB85C \uC694\uC57D\xB7\uD0DC\uADF8\xB7frontmatter\uB97C \uBD99\uC774\uACE0 \uC2F6\uC740 \uBD84\uAED8 \uB9DE\uC2B5\uB2C8\uB2E4."
    },
    {
      id: "faq-3",
      question: "\uC694\uC57D\uC774\uB098 \uD0DC\uADF8 \uAC19\uC740 AI \uC815\uB9AC\uB294 \uB418\uB098\uC694?",
      answer: "\uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C OpenAI \uD638\uD658 \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uC640 \uC790\uC2E0\uC758 \uD0A4\uB97C \uB123\uC73C\uBA74 \uC694\uC57D, \uD0DC\uADF8, \uCD94\uAC00 frontmatter\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4."
    },
    {
      id: "faq-4",
      question: "Pro \uD0A4\uB294 \uC5B4\uB5BB\uAC8C \uC804\uB2EC\uB418\uB098\uC694?",
      answer: "\uACB0\uC81C\uAC00 \uD655\uC778\uB418\uBA74 Pro \uD0A4\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4."
    },
    {
      id: "faq-5",
      question: "\uD658\uBD88 \uC815\uCC45\uC740 \uC788\uB098\uC694?",
      answer: "\uAD6C\uB9E4 \uD6C4 7\uC77C \uB0B4\uC5D0 \uD658\uBD88 \uC694\uCCAD\uC744 \uBCF4\uB0B4\uBA74 \uD655\uC778 \uD6C4 \uCC98\uB9AC\uD569\uB2C8\uB2E4."
    }
  ]
};
function buildDefaultDatabase(now = (/* @__PURE__ */ new Date()).toISOString()) {
  return {
    settings: DEFAULT_SETTINGS,
    paymentMethods: [
      {
        id: "pm-stableorder",
        name: "Stableorder",
        summary: "KRW-friendly checkout with card and transfer options",
        instructions: "Open the Stableorder checkout page, pay using the order email, and return with the paid confirmation.",
        actionLabel: "Pay with Stableorder",
        actionUrl: "https://stableorder.com/",
        enabled: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-stripe",
        name: "Stripe Checkout",
        summary: "Global card checkout",
        instructions: "Open Stripe checkout, complete payment, and make sure the paid email matches your order email.",
        actionLabel: "Pay with Stripe",
        actionUrl: "https://checkout.stripe.com/",
        enabled: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "pm-paypal",
        name: "PayPal",
        summary: "PayPal checkout for international buyers",
        instructions: "Use the PayPal checkout link, complete payment, and reply with the order email used in the request.",
        actionLabel: "Pay with PayPal",
        actionUrl: "https://www.paypal.com/checkout/home",
        enabled: true,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now
      }
    ],
    orders: [],
    licenses: [],
    activations: [],
    notionConnections: [],
    notionAuthSessions: [],
    botUsers: [],
    botLoginTokens: [],
    botOauthSessions: [],
    botSessions: [],
    botExtensionLinkSessions: [],
    botExtensionAccessTokens: [],
    botArchives: [],
    cloudArchives: [],
    watchlists: [],
    searchMonitors: [],
    searchResults: [],
    trackedPosts: [],
    insightsSnapshots: [],
    savedViews: [],
    history: [],
    monitorRuns: [],
    monitorIncidents: []
  };
}

// src/server/runtime-config.ts
import { readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
var DEFAULT_RUNTIME_CONFIG_FILE = path.resolve(process.cwd(), "output", "web-runtime-config.json");
var DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");
var DEFAULT_POSTGRES_TABLE = "threads_web_store";
var DEFAULT_POSTGRES_STORE_KEY = "default";
var DEFAULT_PUBLIC_ORIGIN = "https://ss-threads.dahanda.dev";
var DEFAULT_SMTP_PORT = 587;
var DEFAULT_COLLECTOR_INTERVAL_MS = 6e4;
var DEFAULT_COLLECTOR_FETCH_LIMIT = 25;
var DEFAULT_COLLECTOR_MAX_PAGES = 5;
var MAX_COLLECTOR_FETCH_LIMIT = 100;
var BOT_HANDLE_PATTERN = /^[a-z0-9._]+$/;
function trimEnv(name) {
  return process.env[name]?.trim() ?? "";
}
function parsePositiveInteger(raw, fallback, minimum, maximum) {
  const text = typeof raw === "number" ? String(raw) : `${raw ?? ""}`.trim();
  if (!text) {
    return fallback;
  }
  const parsed = Number.parseInt(text, 10);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    return fallback;
  }
  return parsed;
}
function normalizeOrigin(raw, fallback) {
  const text = `${raw ?? ""}`.trim();
  if (!text) {
    return fallback;
  }
  try {
    return new URL(text).origin;
  } catch {
    return fallback;
  }
}
function normalizeBotHandle(raw) {
  const normalized = `${raw ?? ""}`.trim().replace(/^@+/, "").toLowerCase();
  if (!normalized || !BOT_HANDLE_PATTERN.test(normalized)) {
    return "";
  }
  return normalized;
}
function getRuntimeConfigFilePath() {
  return trimEnv("THREADS_WEB_RUNTIME_CONFIG_FILE") || DEFAULT_RUNTIME_CONFIG_FILE;
}
function readEnvDatabaseBackendPreference() {
  const normalized = trimEnv("THREADS_WEB_STORE_BACKEND").toLowerCase();
  if (normalized === "file" || normalized === "postgres") {
    return normalized;
  }
  return null;
}
function readEnvDatabaseConnectionString() {
  return trimEnv("THREADS_WEB_POSTGRES_URL") || trimEnv("THREADS_WEB_DATABASE_URL");
}
function buildFallbackRuntimeConfig() {
  return {
    publicOrigin: DEFAULT_PUBLIC_ORIGIN,
    database: {
      backend: "file",
      filePath: DEFAULT_DB_FILE,
      postgresUrl: "",
      tableName: DEFAULT_POSTGRES_TABLE,
      storeKey: DEFAULT_POSTGRES_STORE_KEY
    },
    smtp: {
      host: "",
      port: DEFAULT_SMTP_PORT,
      secure: false,
      user: "",
      pass: "",
      from: ""
    },
    collector: {
      botHandle: "",
      accessTokenOverride: "",
      graphApiVersion: "",
      intervalMs: DEFAULT_COLLECTOR_INTERVAL_MS,
      fetchLimit: DEFAULT_COLLECTOR_FETCH_LIMIT,
      maxPages: DEFAULT_COLLECTOR_MAX_PAGES
    }
  };
}
function buildRuntimeConfigFromEnv() {
  const databaseBackend = readEnvDatabaseBackendPreference() ?? "file";
  return normalizeRuntimeConfig({
    publicOrigin: trimEnv("THREADS_WEB_PUBLIC_ORIGIN") || DEFAULT_PUBLIC_ORIGIN,
    database: {
      backend: databaseBackend,
      filePath: trimEnv("THREADS_WEB_DB_FILE") || DEFAULT_DB_FILE,
      postgresUrl: readEnvDatabaseConnectionString(),
      tableName: trimEnv("THREADS_WEB_POSTGRES_TABLE") || DEFAULT_POSTGRES_TABLE,
      storeKey: trimEnv("THREADS_WEB_POSTGRES_STORE_KEY") || DEFAULT_POSTGRES_STORE_KEY
    },
    smtp: {
      host: trimEnv("THREADS_SMTP_HOST"),
      port: parsePositiveInteger(trimEnv("THREADS_SMTP_PORT"), DEFAULT_SMTP_PORT, 1, 65535),
      secure: trimEnv("THREADS_SMTP_SECURE").toLowerCase() === "true",
      user: trimEnv("THREADS_SMTP_USER"),
      pass: trimEnv("THREADS_SMTP_PASS"),
      from: trimEnv("THREADS_SMTP_FROM")
    },
    collector: {
      botHandle: trimEnv("THREADS_BOT_HANDLE"),
      accessTokenOverride: trimEnv("THREADS_BOT_MENTION_ACCESS_TOKEN"),
      graphApiVersion: trimEnv("THREADS_BOT_GRAPH_API_VERSION"),
      intervalMs: parsePositiveInteger(trimEnv("THREADS_BOT_MENTION_POLL_INTERVAL_MS"), DEFAULT_COLLECTOR_INTERVAL_MS, 5e3, 864e5),
      fetchLimit: parsePositiveInteger(trimEnv("THREADS_BOT_MENTION_FETCH_LIMIT"), DEFAULT_COLLECTOR_FETCH_LIMIT, 1, MAX_COLLECTOR_FETCH_LIMIT),
      maxPages: parsePositiveInteger(trimEnv("THREADS_BOT_MENTION_MAX_PAGES"), DEFAULT_COLLECTOR_MAX_PAGES, 1, 20)
    }
  }, buildFallbackRuntimeConfig());
}
function normalizeDatabaseConfig(parsed, fallback) {
  const backend = parsed?.backend === "postgres" ? "postgres" : parsed?.backend === "file" ? "file" : fallback.backend;
  return {
    backend,
    filePath: `${parsed?.filePath ?? fallback.filePath ?? ""}`.trim() || fallback.filePath,
    postgresUrl: `${parsed?.postgresUrl ?? fallback.postgresUrl ?? ""}`.trim(),
    tableName: `${parsed?.tableName ?? fallback.tableName ?? ""}`.trim() || fallback.tableName,
    storeKey: `${parsed?.storeKey ?? fallback.storeKey ?? ""}`.trim() || fallback.storeKey
  };
}
function normalizeSmtpConfig(parsed, fallback) {
  return {
    host: `${parsed?.host ?? fallback.host ?? ""}`.trim(),
    port: parsePositiveInteger(parsed?.port, fallback.port, 1, 65535),
    secure: typeof parsed?.secure === "boolean" ? parsed.secure : fallback.secure,
    user: `${parsed?.user ?? fallback.user ?? ""}`.trim(),
    pass: `${parsed?.pass ?? fallback.pass ?? ""}`.trim(),
    from: `${parsed?.from ?? fallback.from ?? ""}`.trim()
  };
}
function normalizeCollectorConfig(parsed, fallback) {
  const fallbackBotHandle = normalizeBotHandle(fallback.botHandle ?? "");
  const nextBotHandle = normalizeBotHandle(parsed?.botHandle ?? fallbackBotHandle);
  return {
    botHandle: nextBotHandle || fallbackBotHandle,
    accessTokenOverride: `${parsed?.accessTokenOverride ?? fallback.accessTokenOverride ?? ""}`.trim(),
    graphApiVersion: `${parsed?.graphApiVersion ?? fallback.graphApiVersion ?? ""}`.trim(),
    intervalMs: parsePositiveInteger(parsed?.intervalMs, fallback.intervalMs, 5e3, 864e5),
    fetchLimit: parsePositiveInteger(parsed?.fetchLimit, fallback.fetchLimit, 1, MAX_COLLECTOR_FETCH_LIMIT),
    maxPages: parsePositiveInteger(parsed?.maxPages, fallback.maxPages, 1, 20)
  };
}
function normalizeRuntimeConfig(parsed, fallback = buildRuntimeConfigFromEnv()) {
  return {
    publicOrigin: normalizeOrigin(parsed?.publicOrigin, fallback.publicOrigin),
    database: normalizeDatabaseConfig(parsed?.database, fallback.database),
    smtp: normalizeSmtpConfig(parsed?.smtp, fallback.smtp),
    collector: normalizeCollectorConfig(parsed?.collector, fallback.collector)
  };
}
function cloneRuntimeConfig(config) {
  return {
    publicOrigin: config.publicOrigin,
    database: { ...config.database },
    smtp: { ...config.smtp },
    collector: { ...config.collector }
  };
}
var runtimeConfigOverride = null;
var activeRuntimeConfig = null;
var activeRuntimeConfigFilePath = null;
function loadRuntimeConfigFromDisk() {
  const fallback = buildRuntimeConfigFromEnv();
  const filePath = getRuntimeConfigFilePath();
  try {
    const raw = readFileSync(filePath, "utf8");
    return normalizeRuntimeConfig(JSON.parse(raw), fallback);
  } catch (error) {
    const fileError = error;
    if (fileError.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}
function getRuntimeConfigSnapshot() {
  if (runtimeConfigOverride) {
    return cloneRuntimeConfig(runtimeConfigOverride);
  }
  const filePath = getRuntimeConfigFilePath();
  if (!activeRuntimeConfig || activeRuntimeConfigFilePath !== filePath) {
    activeRuntimeConfig = loadRuntimeConfigFromDisk();
    activeRuntimeConfigFilePath = filePath;
  }
  return cloneRuntimeConfig(activeRuntimeConfig);
}
function getPersistedRuntimeConfigSnapshot() {
  if (runtimeConfigOverride) {
    return cloneRuntimeConfig(runtimeConfigOverride);
  }
  return cloneRuntimeConfig(loadRuntimeConfigFromDisk());
}
function activateRuntimeConfig(nextConfig) {
  const normalized = normalizeRuntimeConfig(nextConfig, getPersistedRuntimeConfigSnapshot());
  activeRuntimeConfig = normalized;
  activeRuntimeConfigFilePath = getRuntimeConfigFilePath();
  return cloneRuntimeConfig(normalized);
}
async function saveRuntimeConfig(nextConfig, options = {}) {
  const normalized = normalizeRuntimeConfig(nextConfig, getPersistedRuntimeConfigSnapshot());
  const filePath = getRuntimeConfigFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  await writeFile(tempPath, JSON.stringify(normalized, null, 2), "utf8");
  await rename(tempPath, filePath);
  if (runtimeConfigOverride) {
    runtimeConfigOverride = normalized;
  }
  if (options.activate !== false) {
    activeRuntimeConfig = normalized;
    activeRuntimeConfigFilePath = filePath;
  }
  return cloneRuntimeConfig(normalized);
}

// src/server/store.ts
var DEFAULT_DB_FILE2 = path2.resolve(process.cwd(), "output", "web-admin-data.json");
var DEFAULT_POSTGRES_TABLE2 = "threads_web_store";
var DEFAULT_POSTGRES_STORE_KEY2 = "default";
function getDatabaseFilePath() {
  return getRuntimeConfigSnapshot().database.filePath || DEFAULT_DB_FILE2;
}
var databaseOperationChain = Promise.resolve();
var postgresPool = null;
var postgresPoolConnectionString = null;
var ensuredPostgresStores = /* @__PURE__ */ new Set();
var activeDatabaseAccessCount = 0;
var databaseReconfigurationBarrier = null;
var releaseDatabaseReconfigurationBarrier = null;
var databaseReconfigurationChain = Promise.resolve();
var databaseIdleWaiters = /* @__PURE__ */ new Set();
async function withDatabaseLock(operation) {
  let operationResult;
  operationResult = databaseOperationChain.then(() => operation());
  databaseOperationChain = operationResult.then(() => void 0, () => void 0);
  return operationResult;
}
function notifyDatabaseIdleWaiters() {
  if (activeDatabaseAccessCount > 0 || databaseIdleWaiters.size === 0) {
    return;
  }
  for (const waiter of databaseIdleWaiters) {
    waiter();
  }
  databaseIdleWaiters.clear();
}
async function waitForDatabaseBarrier() {
  while (databaseReconfigurationBarrier) {
    await databaseReconfigurationBarrier;
  }
}
async function withDatabaseAccess(operation) {
  await waitForDatabaseBarrier();
  activeDatabaseAccessCount += 1;
  try {
    return await operation();
  } finally {
    activeDatabaseAccessCount = Math.max(0, activeDatabaseAccessCount - 1);
    notifyDatabaseIdleWaiters();
  }
}
async function withExclusiveDatabaseReconfiguration(operation) {
  const queuedOperation = databaseReconfigurationChain.then(async () => {
    const barrier = new Promise((resolve) => {
      releaseDatabaseReconfigurationBarrier = resolve;
    });
    databaseReconfigurationBarrier = barrier;
    if (activeDatabaseAccessCount > 0) {
      await new Promise((resolve) => {
        databaseIdleWaiters.add(resolve);
      });
    }
    try {
      return await operation();
    } finally {
      databaseReconfigurationBarrier = null;
      const release = releaseDatabaseReconfigurationBarrier;
      releaseDatabaseReconfigurationBarrier = null;
      release?.();
    }
  });
  databaseReconfigurationChain = queuedOperation.then(() => void 0, () => void 0);
  return queuedOperation;
}
function resolveDatabaseBackendFromConfig(config) {
  if (config.backend === "postgres") {
    const connectionString = config.postgresUrl.trim();
    if (!connectionString) {
      throw new Error("THREADS_WEB_STORE_BACKEND=postgres requires THREADS_WEB_POSTGRES_URL or THREADS_WEB_DATABASE_URL.");
    }
    return {
      kind: "postgres",
      connectionString,
      tableName: config.tableName.trim() || DEFAULT_POSTGRES_TABLE2,
      storeKey: config.storeKey.trim() || DEFAULT_POSTGRES_STORE_KEY2
    };
  }
  return {
    kind: "file",
    filePath: config.filePath.trim() || DEFAULT_DB_FILE2
  };
}
function resolveDatabaseBackend(filePath) {
  if (filePath) {
    return {
      kind: "file",
      filePath
    };
  }
  return resolveDatabaseBackendFromConfig(getRuntimeConfigSnapshot().database);
}
function escapeQualifiedIdentifier(identifier) {
  return identifier.split(".").map((chunk) => `"${chunk.replaceAll('"', '""')}"`).join(".");
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeDatabasePayload(raw) {
  const parsed = isRecord(raw) ? raw : {};
  const fallback = buildDefaultDatabase();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const parsedBotUsers = Array.isArray(parsed.botUsers) ? parsed.botUsers : [];
  const botUsers = parsedBotUsers.map((candidate) => ({
    id: typeof candidate?.id === "string" ? candidate.id : crypto.randomUUID(),
    threadsUserId: typeof candidate?.threadsUserId === "string" ? candidate.threadsUserId : null,
    threadsHandle: typeof candidate?.threadsHandle === "string" ? candidate.threadsHandle : "",
    displayName: typeof candidate?.displayName === "string" ? candidate.displayName : null,
    profilePictureUrl: typeof candidate?.profilePictureUrl === "string" ? candidate.profilePictureUrl : null,
    biography: typeof candidate?.biography === "string" ? candidate.biography : null,
    isVerified: candidate?.isVerified === true,
    accessTokenCiphertext: typeof candidate?.accessTokenCiphertext === "string" ? candidate.accessTokenCiphertext : null,
    tokenExpiresAt: typeof candidate?.tokenExpiresAt === "string" ? candidate.tokenExpiresAt : null,
    email: typeof candidate?.email === "string" ? candidate.email : null,
    grantedScopes: Array.isArray(candidate?.grantedScopes) ? candidate.grantedScopes.filter((scope) => typeof scope === "string" && scope.trim().length > 0) : [],
    scopeVersion: typeof candidate?.scopeVersion === "number" && Number.isFinite(candidate.scopeVersion) ? candidate.scopeVersion : 0,
    lastScopeUpgradeAt: typeof candidate?.lastScopeUpgradeAt === "string" ? candidate.lastScopeUpgradeAt : null,
    createdAt: typeof candidate?.createdAt === "string" ? candidate.createdAt : now,
    updatedAt: typeof candidate?.updatedAt === "string" ? candidate.updatedAt : now,
    lastLoginAt: typeof candidate?.lastLoginAt === "string" ? candidate.lastLoginAt : null,
    status: candidate?.status === "disabled" ? "disabled" : "active"
  }));
  const parsedBotOauthSessions = Array.isArray(parsed.botOauthSessions) ? parsed.botOauthSessions : [];
  const botOauthSessions = parsedBotOauthSessions.map((candidate) => ({
    id: typeof candidate?.id === "string" ? candidate.id : crypto.randomUUID(),
    stateHash: typeof candidate?.stateHash === "string" ? candidate.stateHash : "",
    pollTokenHash: typeof candidate?.pollTokenHash === "string" ? candidate.pollTokenHash : "",
    createdAt: typeof candidate?.createdAt === "string" ? candidate.createdAt : now,
    expiresAt: typeof candidate?.expiresAt === "string" ? candidate.expiresAt : now,
    completedAt: typeof candidate?.completedAt === "string" ? candidate.completedAt : null,
    activationCode: typeof candidate?.activationCode === "string" ? candidate.activationCode : null,
    activationExpiresAt: typeof candidate?.activationExpiresAt === "string" ? candidate.activationExpiresAt : null,
    linkedSessionToken: typeof candidate?.linkedSessionToken === "string" ? candidate.linkedSessionToken : null,
    status: candidate?.status === "completed" ? "completed" : candidate?.status === "expired" ? "expired" : candidate?.status === "failed" ? "failed" : "pending"
  }));
  const settings = normalizeStorefrontSettings(parsed.settings, fallback.settings);
  const monitorRuns = Array.isArray(parsed.monitorRuns) ? parsed.monitorRuns : [];
  const monitorIncidents = Array.isArray(parsed.monitorIncidents) ? parsed.monitorIncidents : [];
  return {
    settings,
    paymentMethods: Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : fallback.paymentMethods,
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    licenses: Array.isArray(parsed.licenses) ? parsed.licenses : [],
    activations: Array.isArray(parsed.activations) ? parsed.activations : [],
    notionConnections: Array.isArray(parsed.notionConnections) ? parsed.notionConnections : [],
    notionAuthSessions: Array.isArray(parsed.notionAuthSessions) ? parsed.notionAuthSessions : [],
    botUsers,
    botLoginTokens: Array.isArray(parsed.botLoginTokens) ? parsed.botLoginTokens : [],
    botOauthSessions,
    botSessions: Array.isArray(parsed.botSessions) ? parsed.botSessions : [],
    botExtensionLinkSessions: Array.isArray(parsed.botExtensionLinkSessions) ? parsed.botExtensionLinkSessions : [],
    botExtensionAccessTokens: Array.isArray(parsed.botExtensionAccessTokens) ? parsed.botExtensionAccessTokens : [],
    botArchives: Array.isArray(parsed.botArchives) ? parsed.botArchives : [],
    cloudArchives: Array.isArray(parsed.cloudArchives) ? parsed.cloudArchives : [],
    watchlists: Array.isArray(parsed.watchlists) ? parsed.watchlists : [],
    searchMonitors: Array.isArray(parsed.searchMonitors) ? parsed.searchMonitors : [],
    searchResults: Array.isArray(parsed.searchResults) ? parsed.searchResults : [],
    trackedPosts: Array.isArray(parsed.trackedPosts) ? parsed.trackedPosts : [],
    insightsSnapshots: Array.isArray(parsed.insightsSnapshots) ? parsed.insightsSnapshots : [],
    savedViews: Array.isArray(parsed.savedViews) ? parsed.savedViews : [],
    history: Array.isArray(parsed.history) ? parsed.history : [],
    monitorRuns,
    monitorIncidents
  };
}
async function getPostgresPool(connectionString) {
  if (postgresPool && postgresPoolConnectionString === connectionString) {
    return postgresPool;
  }
  if (postgresPool) {
    await postgresPool.end().catch(() => void 0);
  }
  postgresPool = new Pool({
    connectionString
  });
  postgresPoolConnectionString = connectionString;
  return postgresPool;
}
async function ensurePostgresStore(client, tableName) {
  const cacheKey = `${postgresPoolConnectionString ?? "unknown"}::${tableName}`;
  if (ensuredPostgresStores.has(cacheKey)) {
    return;
  }
  const escapedTableName = escapeQualifiedIdentifier(tableName);
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
      store_key TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );
  ensuredPostgresStores.add(cacheKey);
}
async function ensureParentDirectory(filePath) {
  await mkdir2(path2.dirname(filePath), { recursive: true });
}
async function loadDatabaseUnsafe(filePath = getDatabaseFilePath()) {
  try {
    const raw = await readFile2(filePath, "utf8");
    return normalizeDatabasePayload(JSON.parse(raw));
  } catch (error) {
    const fileError = error;
    if (fileError.code !== "ENOENT") {
      throw error;
    }
    const initial = buildDefaultDatabase();
    await saveFileDatabase(initial, filePath);
    return initial;
  }
}
function normalizeStorefrontSettings(parsed, fallback) {
  const merged = {
    ...fallback,
    ...parsed ?? {}
  };
  if (!parsed || parsed.productName === "Threads to Obsidian") {
    merged.productName = fallback.productName;
  }
  if (!parsed || parsed.headline === "Threads\uB97C Obsidian\uC5D0 \uC800\uC7A5.") {
    merged.headline = fallback.headline;
  }
  if (!parsed || parsed.subheadline === "Free\uB294 \uC800\uC7A5. Pro\uB294 \uADDC\uCE59 + \uB0B4 LLM \uD0A4\uB85C \uC694\uC57D, \uD0DC\uADF8, frontmatter.") {
    merged.subheadline = fallback.subheadline;
  }
  if (!parsed || parsed.priceLabel === "Pro \uC5C5\uADF8\uB808\uC774\uB4DC") {
    merged.priceLabel = fallback.priceLabel;
  }
  if (!parsed || parsed.priceValue === "$19") {
    merged.priceValue = fallback.priceValue;
  }
  if (!parsed || parsed.includedUpdates === "1\uD68C \uACB0\uC81C \xB7 7\uC77C \uD658\uBD88 \xB7 \uC5C5\uB370\uC774\uD2B8 1\uB144") {
    merged.includedUpdates = fallback.includedUpdates;
  }
  if (!Array.isArray(parsed?.heroNotes) || parsed.heroNotes.length === 0) {
    merged.heroNotes = fallback.heroNotes;
  }
  if (!Array.isArray(parsed?.faqs) || parsed.faqs.length === 0) {
    merged.faqs = fallback.faqs;
  }
  return merged;
}
async function saveFileDatabase(data, filePath) {
  await ensureParentDirectory(filePath);
  const tmpFilePath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  const payload = JSON.stringify(data, null, 2);
  await writeFile2(tmpFilePath, payload, "utf8");
  await rename2(tmpFilePath, filePath);
}
async function savePostgresDatabase(data, backend) {
  const pool = await getPostgresPool(backend.connectionString);
  await ensurePostgresStore(pool, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  await pool.query(
    `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (store_key)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [backend.storeKey, JSON.stringify(data)]
  );
}
async function loadDatabaseFromPostgres(backend) {
  const pool = await getPostgresPool(backend.connectionString);
  await ensurePostgresStore(pool, backend.tableName);
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  const selected = await pool.query(
    `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 LIMIT 1`,
    [backend.storeKey]
  );
  if (selected.rows[0]) {
    return normalizeDatabasePayload(selected.rows[0].payload);
  }
  const initial = buildDefaultDatabase();
  const inserted = await pool.query(
    `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (store_key) DO NOTHING
     RETURNING payload`,
    [backend.storeKey, JSON.stringify(initial)]
  );
  if (inserted.rows[0]) {
    return normalizeDatabasePayload(inserted.rows[0].payload);
  }
  const reloaded = await pool.query(
    `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 LIMIT 1`,
    [backend.storeKey]
  );
  return reloaded.rows[0] ? normalizeDatabasePayload(reloaded.rows[0].payload) : initial;
}
async function withPostgresDatabaseTransaction(handler, backend) {
  const pool = await getPostgresPool(backend.connectionString);
  const client = await pool.connect();
  const escapedTableName = escapeQualifiedIdentifier(backend.tableName);
  try {
    await client.query("BEGIN");
    await ensurePostgresStore(client, backend.tableName);
    await client.query(
      `INSERT INTO ${escapedTableName} (store_key, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (store_key) DO NOTHING`,
      [backend.storeKey, JSON.stringify(buildDefaultDatabase())]
    );
    const selected = await client.query(
      `SELECT payload FROM ${escapedTableName} WHERE store_key = $1 FOR UPDATE`,
      [backend.storeKey]
    );
    const database = selected.rows[0] ? normalizeDatabasePayload(selected.rows[0].payload) : buildDefaultDatabase();
    const output = await handler(database);
    await client.query(
      `UPDATE ${escapedTableName}
       SET payload = $2::jsonb,
           updated_at = NOW()
       WHERE store_key = $1`,
      [backend.storeKey, JSON.stringify(database)]
    );
    await client.query("COMMIT");
    return output;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => void 0);
    throw error;
  } finally {
    client.release();
  }
}
async function loadDatabase(filePath) {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      return loadDatabaseFromPostgres(backend);
    }
    return loadDatabaseUnsafe(backend.filePath);
  });
}
async function withDatabaseTransaction(handler, filePath) {
  return withDatabaseAccess(async () => {
    const backend = resolveDatabaseBackend(filePath);
    if (backend.kind === "postgres") {
      return withPostgresDatabaseTransaction(handler, backend);
    }
    return withDatabaseLock(async () => {
      const database = await loadDatabaseUnsafe(backend.filePath);
      const output = await handler(database);
      await saveFileDatabase(database, backend.filePath);
      return output;
    });
  });
}
async function loadDatabaseForConfig(config) {
  const backend = resolveDatabaseBackendFromConfig(config);
  return backend.kind === "postgres" ? loadDatabaseFromPostgres(backend) : loadDatabaseUnsafe(backend.filePath);
}
async function saveDatabaseForConfig(data, config) {
  const backend = resolveDatabaseBackendFromConfig(config);
  if (backend.kind === "postgres") {
    await savePostgresDatabase(data, backend);
    return;
  }
  await saveFileDatabase(data, backend.filePath);
}
async function testDatabaseConfig(config) {
  const backend = resolveDatabaseBackendFromConfig(config);
  if (backend.kind === "postgres") {
    const pool = await getPostgresPool(backend.connectionString);
    await ensurePostgresStore(pool, backend.tableName);
    await pool.query("SELECT 1");
    return;
  }
  await ensureParentDirectory(backend.filePath);
}
function buildDashboardSummary(data) {
  const webhookIgnored = data.history.filter((event) => event.kind === "webhook_ignored");
  const webhookRejected = data.history.filter((event) => event.kind === "webhook_rejected");
  return {
    pendingOrders: data.orders.filter((order) => order.status === "pending").length,
    paidOrders: data.orders.filter((order) => order.status === "payment_confirmed").length,
    issuedKeys: data.licenses.filter((license) => license.status === "active").length,
    activePaymentMethods: data.paymentMethods.filter((method) => method.enabled).length,
    webhookProcessed: data.history.filter((event) => event.kind === "webhook_processed").length,
    webhookIgnored: webhookIgnored.length,
    webhookRejected: webhookRejected.length,
    webhookDuplicates: webhookIgnored.filter((event) => event.webhookReason === "already_processed").length,
    deliveryReadyToSend: data.orders.filter((order) => order.deliveryStatus === "ready_to_send").length,
    deliverySent: data.orders.filter((order) => order.deliveryStatus === "sent").length
  };
}
function buildRevenueReport(data) {
  const priceUsd = Number.parseFloat(process.env.THREADS_PRICE_USD?.trim() ?? "29") || 29;
  const paidOrders = data.orders.filter(
    (order) => order.status === "payment_confirmed" || order.status === "key_issued"
  );
  const byMethodMap = /* @__PURE__ */ new Map();
  for (const order of data.orders) {
    const method = data.paymentMethods.find((candidate) => candidate.id === order.paymentMethodId);
    const entry = byMethodMap.get(order.paymentMethodId) ?? {
      methodId: order.paymentMethodId,
      methodName: method?.name ?? order.paymentMethodId,
      orders: 0,
      paid: 0
    };
    entry.orders += 1;
    if (order.status === "payment_confirmed" || order.status === "key_issued") {
      entry.paid += 1;
    }
    byMethodMap.set(order.paymentMethodId, entry);
  }
  const byMonthMap = /* @__PURE__ */ new Map();
  for (const order of data.orders) {
    const month = order.createdAt.slice(0, 7);
    const entry = byMonthMap.get(month) ?? { month, orders: 0, issued: 0 };
    entry.orders += 1;
    if (order.status === "key_issued") {
      entry.issued += 1;
    }
    byMonthMap.set(month, entry);
  }
  return {
    totalOrders: data.orders.length,
    paidOrders: paidOrders.length,
    cancelledOrders: data.orders.filter((order) => order.status === "cancelled").length,
    issuedKeys: data.licenses.filter((license) => license.status === "active").length,
    revokedKeys: data.licenses.filter((license) => license.status === "revoked").length,
    deliveryReadyToSend: data.orders.filter((order) => order.deliveryStatus === "ready_to_send").length,
    deliverySent: data.orders.filter((order) => order.deliveryStatus === "sent").length,
    estimatedRevenueUsd: paidOrders.length * priceUsd,
    priceUsd,
    byPaymentMethod: [...byMethodMap.values()].sort((a, b) => b.paid - a.paid),
    byMonth: [...byMonthMap.values()].sort((a, b) => a.month.localeCompare(b.month))
  };
}
function buildPublicStorefront(data) {
  return {
    settings: data.settings,
    paymentMethods: [...data.paymentMethods].filter((method) => method.enabled).sort((left, right) => left.sortOrder - right.sortOrder)
  };
}
function appendHistory(data, event) {
  const historyEvent = {
    id: crypto.randomUUID(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ...event
  };
  data.history.unshift(historyEvent);
  data.history = data.history.slice(0, 200);
  return historyEvent;
}
function upsertPaymentMethod(data, method) {
  const index = data.paymentMethods.findIndex((candidate) => candidate.id === method.id);
  if (index >= 0) {
    data.paymentMethods[index] = method;
    return;
  }
  data.paymentMethods.push(method);
}
function upsertOrder(data, order) {
  const index = data.orders.findIndex((candidate) => candidate.id === order.id);
  if (index >= 0) {
    data.orders[index] = order;
    return;
  }
  data.orders.unshift(order);
}
function upsertLicense(data, license) {
  const index = data.licenses.findIndex((candidate) => candidate.id === license.id);
  if (index >= 0) {
    data.licenses[index] = license;
    return;
  }
  data.licenses.unshift(license);
}
function upsertActivation(data, activation) {
  const index = data.activations.findIndex((candidate) => candidate.id === activation.id);
  if (index >= 0) {
    data.activations[index] = activation;
    return;
  }
  data.activations.unshift(activation);
}
function upsertNotionConnection(data, connection) {
  const index = data.notionConnections.findIndex((candidate) => candidate.id === connection.id);
  if (index >= 0) {
    data.notionConnections[index] = connection;
    return;
  }
  data.notionConnections.unshift(connection);
}
function upsertNotionAuthSession(data, session) {
  const index = data.notionAuthSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.notionAuthSessions[index] = session;
    return;
  }
  data.notionAuthSessions.unshift(session);
}
function upsertBotUser(data, user) {
  const index = data.botUsers.findIndex((candidate) => candidate.id === user.id);
  if (index >= 0) {
    data.botUsers[index] = user;
    return;
  }
  data.botUsers.unshift(user);
}
function upsertBotOauthSession(data, session) {
  const index = data.botOauthSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.botOauthSessions[index] = session;
    return;
  }
  data.botOauthSessions.unshift(session);
}
function upsertBotSession(data, session) {
  const index = data.botSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.botSessions[index] = session;
    return;
  }
  data.botSessions.unshift(session);
}
function upsertBotExtensionLinkSession(data, session) {
  const index = data.botExtensionLinkSessions.findIndex((candidate) => candidate.id === session.id);
  if (index >= 0) {
    data.botExtensionLinkSessions[index] = session;
    return;
  }
  data.botExtensionLinkSessions.unshift(session);
}
function upsertBotExtensionAccessToken(data, token) {
  const index = data.botExtensionAccessTokens.findIndex((candidate) => candidate.id === token.id);
  if (index >= 0) {
    data.botExtensionAccessTokens[index] = token;
    return;
  }
  data.botExtensionAccessTokens.unshift(token);
}
function upsertBotArchive(data, archive) {
  const index = data.botArchives.findIndex((candidate) => candidate.id === archive.id);
  if (index >= 0) {
    data.botArchives[index] = archive;
    return;
  }
  data.botArchives.unshift(archive);
}
function upsertCloudArchive(data, archive) {
  const index = data.cloudArchives.findIndex((candidate) => candidate.id === archive.id);
  if (index >= 0) {
    data.cloudArchives[index] = archive;
    return;
  }
  data.cloudArchives.unshift(archive);
}
function upsertWatchlist(data, watchlist) {
  const index = data.watchlists.findIndex((candidate) => candidate.id === watchlist.id);
  if (index >= 0) {
    data.watchlists[index] = watchlist;
    return;
  }
  data.watchlists.unshift(watchlist);
}
function upsertSearchMonitor(data, monitor) {
  const index = data.searchMonitors.findIndex((candidate) => candidate.id === monitor.id);
  if (index >= 0) {
    data.searchMonitors[index] = monitor;
    return;
  }
  data.searchMonitors.unshift(monitor);
}
function upsertSearchResult(data, result) {
  const index = data.searchResults.findIndex((candidate) => candidate.id === result.id);
  if (index >= 0) {
    data.searchResults[index] = result;
    return;
  }
  data.searchResults.unshift(result);
}
function upsertTrackedPost(data, post) {
  const index = data.trackedPosts.findIndex((candidate) => candidate.id === post.id);
  if (index >= 0) {
    data.trackedPosts[index] = post;
    return;
  }
  data.trackedPosts.unshift(post);
}
function upsertInsightsSnapshot(data, snapshot) {
  const index = data.insightsSnapshots.findIndex((candidate) => candidate.id === snapshot.id);
  if (index >= 0) {
    data.insightsSnapshots[index] = snapshot;
    return;
  }
  data.insightsSnapshots.unshift(snapshot);
}

// src/server/activation-service.ts
var LICENSE_SEAT_LIMIT = 3;
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function getMatchingLicense(data, token) {
  return data.licenses.find((candidate) => candidate.token === token) ?? null;
}
function getActiveActivations(data, tokenHash) {
  return data.activations.filter((candidate) => candidate.tokenHash === tokenHash && candidate.status === "active");
}
function buildFailure(reason, holder, expiresAt, issuedAt, seatsUsed) {
  return {
    ok: false,
    reason,
    holder,
    expiresAt,
    issuedAt,
    seatLimit: LICENSE_SEAT_LIMIT,
    seatsUsed
  };
}
async function validateTokenAgainstServerState(data, token) {
  const validation = await validateProLicenseToken(token);
  if (validation.state === "invalid" || validation.state === "none") {
    return buildFailure("invalid", null, null, null, 0);
  }
  if (validation.state === "expired" || !validation.payload) {
    return buildFailure("expired", validation.payload?.holder ?? null, validation.payload?.expiresAt ?? null, validation.payload?.issuedAt ?? null, 0);
  }
  const license = getMatchingLicense(data, token);
  if (license?.status === "revoked") {
    return buildFailure("revoked", validation.payload.holder, validation.payload.expiresAt, validation.payload.issuedAt, 0);
  }
  return {
    tokenHash: hashToken(token),
    holder: validation.payload.holder,
    expiresAt: validation.payload.expiresAt,
    issuedAt: validation.payload.issuedAt,
    license
  };
}
async function activateLicenseSeat(data, token, deviceId, deviceLabel) {
  const validated = await validateTokenAgainstServerState(data, token);
  if ("reason" in validated) {
    return validated;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const activeActivations = getActiveActivations(data, validated.tokenHash);
  const existing = activeActivations.find((candidate) => candidate.deviceId === deviceId);
  if (existing) {
    existing.deviceLabel = deviceLabel;
    existing.lastValidatedAt = now;
    existing.releasedAt = null;
    existing.status = "active";
    upsertActivation(data, existing);
    return {
      ok: true,
      holder: validated.holder,
      expiresAt: validated.expiresAt,
      issuedAt: validated.issuedAt,
      seatLimit: LICENSE_SEAT_LIMIT,
      seatsUsed: activeActivations.length,
      activatedAt: existing.activatedAt,
      deviceId,
      deviceLabel
    };
  }
  if (activeActivations.length >= LICENSE_SEAT_LIMIT) {
    return buildFailure("seat_limit", validated.holder, validated.expiresAt, validated.issuedAt, activeActivations.length);
  }
  const activation = {
    id: crypto.randomUUID(),
    licenseId: validated.license?.id ?? null,
    tokenHash: validated.tokenHash,
    tokenPreview: buildTokenPreview(token),
    holder: validated.holder,
    deviceId,
    deviceLabel,
    activatedAt: now,
    lastValidatedAt: now,
    releasedAt: null,
    status: "active"
  };
  upsertActivation(data, activation);
  return {
    ok: true,
    holder: validated.holder,
    expiresAt: validated.expiresAt,
    issuedAt: validated.issuedAt,
    seatLimit: LICENSE_SEAT_LIMIT,
    seatsUsed: activeActivations.length + 1,
    activatedAt: activation.activatedAt,
    deviceId,
    deviceLabel
  };
}
async function getLicenseSeatStatus(data, token, deviceId, deviceLabel) {
  const validated = await validateTokenAgainstServerState(data, token);
  if ("reason" in validated) {
    return validated;
  }
  const activeActivations = getActiveActivations(data, validated.tokenHash);
  const existing = activeActivations.find((candidate) => candidate.deviceId === deviceId);
  if (!existing) {
    return buildFailure("activation_required", validated.holder, validated.expiresAt, validated.issuedAt, activeActivations.length);
  }
  existing.lastValidatedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (deviceLabel) {
    existing.deviceLabel = deviceLabel;
  }
  upsertActivation(data, existing);
  return {
    ok: true,
    holder: validated.holder,
    expiresAt: validated.expiresAt,
    issuedAt: validated.issuedAt,
    seatLimit: LICENSE_SEAT_LIMIT,
    seatsUsed: activeActivations.length,
    activatedAt: existing.activatedAt,
    deviceId: existing.deviceId,
    deviceLabel: existing.deviceLabel
  };
}
async function releaseLicenseSeat(data, token, deviceId) {
  const validation = await validateProLicenseToken(token);
  if (validation.state === "invalid" || validation.state === "none") {
    return { released: false };
  }
  const tokenHash = hashToken(token);
  const existing = getActiveActivations(data, tokenHash).find((candidate) => candidate.deviceId === deviceId);
  if (!existing) {
    return { released: false };
  }
  existing.status = "released";
  existing.releasedAt = (/* @__PURE__ */ new Date()).toISOString();
  existing.lastValidatedAt = existing.releasedAt;
  upsertActivation(data, existing);
  return { released: true };
}

// src/server/mailer.ts
import nodemailer from "nodemailer";
function normalizeSmtpConfig2(raw) {
  const host = raw.host.trim();
  const user = raw.user.trim();
  const pass = raw.pass.trim();
  const from = raw.from.trim();
  if (!host || !user || !pass || !from) {
    return null;
  }
  const port = Number.isInteger(raw.port) && raw.port > 0 ? raw.port : 587;
  const secure = raw.secure === true;
  return { host, port, secure, user, pass, from };
}
function readSmtpConfig() {
  return normalizeSmtpConfig2(getRuntimeConfigSnapshot().smtp);
}
function isMailerConfigured() {
  return readSmtpConfig() !== null;
}
async function sendDeliveryEmail(draft) {
  const config = readSmtpConfig();
  if (!config) {
    throw new Error(
      "SMTP is not configured. Set THREADS_SMTP_HOST, THREADS_SMTP_USER, THREADS_SMTP_PASS, THREADS_SMTP_FROM."
    );
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass }
  });
  await transporter.sendMail({
    from: config.from,
    to: draft.to,
    subject: draft.subject,
    text: draft.body
  });
}
async function testDeliveryEmailConfig(rawConfig) {
  const config = normalizeSmtpConfig2(rawConfig);
  if (!config) {
    throw new Error(
      "SMTP is not configured. Set host, user, pass, and from before testing the connection."
    );
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass }
  });
  await transporter.verify();
}

// src/server/notion-service.ts
import { createCipheriv, createDecipheriv, createHash as createHash2, randomBytes } from "node:crypto";

// ../shared/src/i18n-locales.ts
var localizedMessages = {
  "ja": {
    "uiLanguageLabel": "\u8A00\u8A9E",
    "uiLanguageKo": "\uD55C\uAD6D\uC5B4",
    "uiLanguageEn": "\u82F1\u8A9E",
    "popupTitle": "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58",
    "popupSave": "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58",
    "popupSettings": "\u8A2D\u5B9A",
    "popupPromoTitle": "\u4E88\u7D04\u9818\u57DF",
    "popupPromoDescription": "\u3053\u306E\u30B9\u30DA\u30FC\u30B9\u306F\u3001\u5C06\u6765\u306E\u30AC\u30A4\u30C0\u30F3\u30B9\u3068\u63A8\u5968\u4E8B\u9805\u306E\u305F\u3081\u306B\u4E88\u7D04\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    "popupSubtitleDirect": "\u63A5\u7D9A\u3055\u308C\u3066\u3044\u308B Obsidian \u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "popupSubtitleDownload": "\u30D5\u30A9\u30EB\u30C0\u30FC\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3068\u3057\u3066\u4FDD\u5B58\u3057\u307E\u3059\u3002\u8A2D\u5B9A\u3067\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u63A5\u7D9A\u3057\u307E\u3059\u3002",
    "popupSubtitleConnected": "\u63A5\u7D9A\u3055\u308C\u3066\u3044\u308B Obsidian \u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "popupSubtitlePermissionCheck": "\u30D5\u30A9\u30EB\u30C0\u30FC\u306F\u63A5\u7D9A\u3055\u308C\u307E\u3057\u305F\u304C\u3001\u6A29\u9650\u306E\u518D\u78BA\u8A8D\u304C\u5FC5\u8981\u306A\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002",
    "popupSubtitleNoFolder": "\u30D5\u30A9\u30EB\u30C0\u30FC\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u306F\u76F4\u63A5\u4FDD\u5B58\u3057\u3001\u63A5\u7D9A\u3055\u308C\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
    "popupSubtitleUnsupported": "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u306F\u30D5\u30A1\u30A4\u30EB\u306E\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u306E\u307F\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u307E\u3059\u3002",
    "popupSubtitleNotion": "\u69CB\u6210\u3055\u308C\u305F Notion \u4FDD\u5B58\u5148\u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "popupSubtitleNotionSetup": "Notion \u4FDD\u5B58\u3092\u4F7F\u7528\u3059\u308B\u306B\u306F\u3001\u307E\u305A\u8A2D\u5B9A\u3067\u30C8\u30FC\u30AF\u30F3\u3068\u5B9B\u5148\u3092\u5165\u529B\u3057\u307E\u3059\u3002",
    "popupRecentSaves": "\u6700\u8FD1\u306E\u4FDD\u5B58",
    "popupClearAll": "\u3059\u3079\u3066\u30AF\u30EA\u30A2",
    "popupEmpty": "\u4FDD\u5B58\u3055\u308C\u305F\u6295\u7A3F\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002",
    "popupResave": "\u518D\u4FDD\u5B58",
    "popupExpand": "\u62E1\u5927\u3059\u308B",
    "popupCollapse": "\u5D29\u58CA\u3059\u308B",
    "popupDelete": "\u524A\u9664",
    "statusReady": "\u6295\u7A3F\u30D1\u30FC\u30DE\u30EA\u30F3\u30AF \u30DA\u30FC\u30B8\u304B\u3089\u4FDD\u5B58\u3059\u308B\u6E96\u5099\u304C\u3067\u304D\u307E\u3057\u305F\u3002",
    "statusReadyDirect": "\u6E96\u5099\u5B8C\u4E86\u3002\u3092\u62BC\u3057\u3066\u3001Obsidian \u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "statusReadyDownload": "\u6E96\u5099\u5B8C\u4E86\u3002\u3092\u62BC\u3057\u3066\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
    "statusUnsupported": "\u307E\u305A\u306F\u500B\u5225\u6295\u7A3F\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
    "statusNoTab": "\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30BF\u30D6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "statusSaving": "\u4FDD\u5B58\u4E2D\u2026",
    "statusSavedDirect": "Obsidian \u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u76F4\u63A5\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
    "statusSavedZip": "\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u304C\u958B\u59CB\u3055\u308C\u307E\u3057\u305F\u3002",
    "statusSavedNotion": "Notion \u306B\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002",
    "statusDuplicate": "\u3059\u3067\u306B\u4FDD\u5B58\u3055\u308C\u3066\u3044\u307E\u3059 - \u6700\u65B0\u306E\u30B3\u30F3\u30C6\u30F3\u30C4\u3067\u66F4\u65B0\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    "statusDuplicateWarning": "\u3059\u3067\u306B\u4FDD\u5B58\u3001\u66F4\u65B0\u3055\u308C\u3066\u3044\u307E\u3059:",
    "statusAlreadySaved": "\u3053\u306E\u6295\u7A3F\u306F\u3059\u3067\u306B\u4FDD\u5B58\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u518D\u5EA6\u4FDD\u5B58\u3059\u308B\u306B\u306F\u3001\u6700\u8FD1\u306E\u4FDD\u5B58\u304B\u3089\u300C\u518D\u4FDD\u5B58\u300D\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
    "statusNotionSetupRequired": "Notion \u4FDD\u5B58\u3092\u4F7F\u7528\u3059\u308B\u306B\u306F\u3001\u307E\u305A\u8A2D\u5B9A\u3067\u30C8\u30FC\u30AF\u30F3\u3068\u5B9B\u5148\u3092\u5165\u529B\u3057\u307E\u3059\u3002",
    "statusError": "\u4E0D\u660E\u306A\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
    "statusResaving": "\u30D5\u30A1\u30A4\u30EB\u3092\u6E96\u5099\u3057\u3066\u3044\u307E\u3059\u2026",
    "statusResaved": "\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u304C\u958B\u59CB\u3055\u308C\u307E\u3057\u305F\u3002",
    "statusResavedNotion": "\u65B0\u3057\u3044\u30DA\u30FC\u30B8\u3068\u3057\u3066 Notion \u306B\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002",
    "statusRecentNotFound": "\u6700\u8FD1\u306E\u4FDD\u5B58\u30EC\u30B3\u30FC\u30C9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "statusDeletedRecent": "\u6700\u8FD1\u306E\u4FDD\u5B58\u304B\u3089\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002",
    "statusClearedRecents": "\u6700\u8FD1\u306E\u4FDD\u5B58\u306F\u3059\u3079\u3066\u30AF\u30EA\u30A2\u3055\u308C\u307E\u3057\u305F\u3002",
    "statusExtractFailed": "\u6295\u7A3F\u3092\u8AAD\u3080\u3053\u3068\u304C\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "statusTabError": "\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30BF\u30D6\u306E\u60C5\u5831\u3092\u8AAD\u307F\u53D6\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "statusRedownloadError": "\u518D\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
    "statusRetry": "\u518D\u8A66\u884C",
    "statusResaveButton": "\u518D\u4FDD\u5B58",
    "optionsTitle": "\u81EA\u52D5\u6574\u7406\u3092\u4F7F\u7528\u3057\u3066\u3001Threads \u306E\u6295\u7A3F\u3092 Obsidian \u307E\u305F\u306F Notion \u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "optionsTitleObsidianOnly": "\u81EA\u52D5\u6574\u7406\u3092\u4F7F\u7528\u3057\u3066\u3001Threads \u306E\u6295\u7A3F\u3092 Obsidian \u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "optionsSubtitle": "Free \u3092\u4FDD\u5B58\u3057\u3001\u5FC5\u8981\u306A\u5834\u5408\u306E\u307F Pro \u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
    "optionsSubtitleObsidianOnly": "\u30EA\u30EA\u30FC\u30B9\u5411\u3051\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3067\u306F\u307E\u3060\u767A\u58F2\u88FD\u54C1\u306B\u3064\u3044\u3066\u8AAC\u660E\u3057\u3066\u3044\u307E\u3059\u304C\u3001\u73FE\u5728\u306E UI \u3067\u306F Obsidian \u306E\u307F\u304C\u516C\u958B\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    "optionsPlanSpotlightFreeTitle": "Free",
    "optionsPlanSpotlightFreeCopy": "\u57FA\u672C\u7684\u306A\u4FDD\u5B58\u306F\u3059\u3050\u306B\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002",
    "optionsPlanSpotlightActiveTitle": "Pro \u30A2\u30AF\u30C6\u30A3\u30D6",
    "optionsPlanSpotlightActiveCopy": "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F Pro \u6A5F\u80FD\u304C\u6709\u52B9\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002",
    "optionsPlanSpotlightNeedsActivationTitle": "Pro \u306F\u30A2\u30AF\u30C6\u30A3\u30D9\u30FC\u30B7\u30E7\u30F3\u304C\u5FC5\u8981\u3067\u3059",
    "optionsPlanSpotlightNeedsActivationCopy": "\u30AD\u30FC\u306F\u6709\u52B9\u3067\u3059\u304C\u3001\u3053\u306E\u30C7\u30D0\u30A4\u30B9\u306B\u306F\u307E\u3060\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30B7\u30FC\u30C8\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
    "optionsPlanSpotlightSeatMeta": "\u5EA7\u5E2D {used}/{limit}\u30FB{device}",
    "optionsAdSlotLabel": "\u5E83\u544A",
    "optionsAdSlotTitle": "\u5E83\u544A\u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u30FC",
    "optionsAdSlotCopy": "\u5C06\u6765\u306E\u30D0\u30CA\u30FC\u307E\u305F\u306F\u30A2\u30CA\u30A6\u30F3\u30B9\u306E\u305F\u3081\u306B\u4E88\u7D04\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    "optionsFolderSection": "Obsidian\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u63A5\u7D9A\u3057\u307E\u3059",
    "optionsFolderStatus": "\u63A5\u7D9A\u3055\u308C\u3066\u3044\u308B\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u78BA\u8A8D\u3057\u3066\u3044\u307E\u3059\u2026",
    "optionsFolderLabel": "\u73FE\u5728\u306E\u30D5\u30A9\u30EB\u30C0\u30FC",
    "optionsFolderNotConnected": "\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
    "optionsFolderConnect": "\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u63A5\u7D9A\u3059\u308B",
    "optionsFolderDisconnect": "\u5207\u65AD\u3059\u308B",
    "optionsFolderUnsupported": "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A9\u30EB\u30C0\u30FC\u63A5\u7D9A\u304C\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
    "optionsFolderUnsupportedStatus": "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002\u4EE3\u308F\u308A\u306B\u30D5\u30A1\u30A4\u30EB\u304C\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3059\u3002",
    "optionsFolderNotConnectedStatus": "\u30D5\u30A9\u30EB\u30C0\u30FC\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u4FDD\u5B58\u3059\u308B\u3068\u30D5\u30A1\u30A4\u30EB\u304C\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3059\u3002",
    "optionsFolderReady": "\u30D5\u30A9\u30EB\u30C0\u30FC\u304C\u63A5\u7D9A\u3055\u308C\u307E\u3057\u305F\u3002\u30D5\u30A1\u30A4\u30EB\u306F\u76F4\u63A5\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
    "optionsFolderPermissionCheck": "\u30D5\u30A9\u30EB\u30C0\u30FC\u304C\u63A5\u7D9A\u3055\u308C\u307E\u3057\u305F\u3002\u6B21\u56DE\u306E\u4FDD\u5B58\u6642\u306B\u8A31\u53EF\u304C\u518D\u78BA\u8A8D\u3055\u308C\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002",
    "optionsFolderPermissionLost": "\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u30A2\u30AF\u30BB\u30B9\u8A31\u53EF\u304C\u5931\u308F\u308C\u3066\u3044\u307E\u3059\u3002\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u518D\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    "optionsFolderChecked": "\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u63A5\u7D9A\u304C\u78BA\u8A8D\u3055\u308C\u307E\u3057\u305F\u3002\u76F4\u63A5\u4FDD\u5B58\u304C\u8A66\u884C\u3055\u308C\u307E\u3059\u3002",
    "optionsFolderCancelled": "\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u9078\u629E\u304C\u30AD\u30E3\u30F3\u30BB\u30EB\u3055\u308C\u307E\u3057\u305F\u3002",
    "optionsFolderError": "\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u63A5\u7D9A\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
    "optionsFolderConnectedSuccess": "\u300C{folder}\u300D\u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A\u3057\u307E\u3057\u305F\u3002",
    "optionsFolderPathLabel": "\u73FE\u5728\u306E\u4FDD\u5B58\u5834\u6240",
    "optionsFolderPathHint": "\u30D6\u30E9\u30A6\u30B6\u30FC\u306F OS \u306E\u7D76\u5BFE\u30D1\u30B9\u3092\u516C\u958B\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u3053\u308C\u306F\u63A5\u7D9A\u3055\u308C\u305F\u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u5BFE\u3059\u308B\u76F8\u5BFE\u30D1\u30B9\u306E\u307E\u307E\u306B\u306A\u308A\u307E\u3059\u3002",
    "optionsFolderPathUnavailable": "\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u63A5\u7D9A\u3059\u308B\u3068\u8868\u793A\u3055\u308C\u307E\u3059",
    "optionsSaveTarget": "\u4FDD\u5B58\u5BFE\u8C61",
    "optionsSaveTargetHint": "PC \u3067\u306F\u3001\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u5B9B\u5148\u3068\u3057\u3066 Obsidian \u307E\u305F\u306F Notion \u306E\u3044\u305A\u308C\u304B\u3092\u9078\u629E\u3057\u307E\u3059\u3002",
    "optionsSaveTargetHintObsidianOnly": "\u73FE\u5728\u306E UI \u306F Obsidian \u306E\u307F\u3092\u516C\u958B\u3057\u307E\u3059\u3002 Notion \u306F\u3001\u7D71\u5408\u304C\u5185\u90E8\u3067\u6E96\u5099\u3055\u308C\u3066\u3044\u308B\u9593\u3001\u8A2D\u5B9A\u3067\u975E\u8868\u793A\u306E\u307E\u307E\u306B\u306A\u308A\u307E\u3059\u3002",
    "optionsSaveTargetObsidian": "Obsidian",
    "optionsSaveTargetNotion": "Notion",
    "optionsSaveTargetNotionHidden": "Notion (\u4ECA\u306E\u3068\u3053\u308D\u975E\u8868\u793A)",
    "optionsNotionSection": "Notion \u63A5\u7D9A",
    "optionsNotionSubtitle": "Notion \u306F OAuth \u3092\u901A\u3058\u3066\u63A5\u7D9A\u3055\u308C\u308B\u305F\u3081\u3001\u30D6\u30E9\u30A6\u30B6\u30FC\u306F\u5185\u90E8\u30C8\u30FC\u30AF\u30F3\u3092\u8981\u6C42\u3057\u307E\u305B\u3093\u3002\u4E00\u5EA6\u63A5\u7D9A\u3057\u3001\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u5B9B\u5148\u3092\u9078\u629E\u3057\u3001\u305D\u306E\u5F8C\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "optionsNotionConnectionLabel": "\u63A5\u7D9A",
    "optionsNotionConnectButton": "Notion\u3092\u63A5\u7D9A\u3057\u307E\u3059",
    "optionsNotionDisconnectButton": "\u5207\u65AD\u3059\u308B",
    "optionsNotionConnectHint": "Notion \u627F\u8A8D\u30BF\u30D6\u304C\u958B\u304D\u307E\u3059\u3002\u627F\u8A8D\u5F8C\u3001\u3053\u3053\u306B\u623B\u308B\u3068\u3001\u63A5\u7D9A\u72B6\u614B\u304C\u81EA\u52D5\u7684\u306B\u66F4\u65B0\u3055\u308C\u307E\u3059\u3002",
    "optionsNotionConnected": "Notion \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    "optionsNotionDisconnected": "Notion \u306F\u307E\u3060\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
    "optionsNotionConnectStarted": "Notion\u63A5\u7D9A\u30BF\u30D6\u3092\u958B\u304D\u307E\u3057\u305F\u3002\u627F\u8A8D\u5F8C\u3001\u3053\u3053\u306B\u623B\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
    "optionsNotionConnectFailed": "Notion \u63A5\u7D9A\u30D5\u30ED\u30FC\u3092\u958B\u59CB\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "optionsNotionDisconnectedSaved": "Notion \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u5207\u65AD\u3057\u307E\u3057\u305F\u3002",
    "optionsNotionDisconnectFailed": "Notion \u3092\u5207\u65AD\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "optionsNotionParentType": "\u30BB\u30FC\u30D6\u30E2\u30FC\u30C9",
    "optionsNotionParentTypeHint": "\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u5B9B\u5148\u3092\u3001\u63A5\u7D9A\u3055\u308C\u305F\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u5185\u306E\u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF \u30BD\u30FC\u30B9\u306E\u3069\u3061\u3089\u306B\u3059\u308B\u304B\u3092\u9078\u629E\u3057\u307E\u3059\u3002",
    "optionsNotionParentTypePage": "\u89AA\u30DA\u30FC\u30B8",
    "optionsNotionParentTypeDataSource": "\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9",
    "optionsNotionSelectedTarget": "\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u5B9B\u5148",
    "optionsNotionSelectedTargetHint": "\u30C7\u30D5\u30A9\u30EB\u30C8\u3067\u306F\u3001\u4FDD\u5B58\u30DC\u30BF\u30F3\u306B\u3088\u308A\u65B0\u3057\u3044 Threads \u30AD\u30E3\u30D7\u30C1\u30E3\u304C\u9001\u4FE1\u3055\u308C\u308B\u5834\u6240\u3067\u3059\u3002",
    "optionsNotionTargetNotSelected": "\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u5B9B\u5148\u306F\u307E\u3060\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
    "optionsNotionTargetRequired": "\u6700\u521D\u306B\u30C7\u30D5\u30A9\u30EB\u30C8\u306E Notion \u5B9B\u5148\u3092\u9078\u629E\u3057\u307E\u3059\u3002",
    "optionsNotionTargetSaved": "\u30C7\u30D5\u30A9\u30EB\u30C8\u306E Notion \u5B9B\u5148\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
    "optionsNotionTargetSaveFailed": "\u30C7\u30D5\u30A9\u30EB\u30C8\u306E Notion \u5B9B\u5148\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "optionsNotionSearchLabel": "\u76EE\u7684\u5730\u3092\u63A2\u3059",
    "optionsNotionSearchHint": "\u3053\u306E\u7D71\u5408\u30A2\u30AF\u30BB\u30B9\u3092\u8A31\u53EF\u3057\u305F\u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF \u30BD\u30FC\u30B9\u3092\u691C\u7D22\u3057\u307E\u3059\u3002",
    "optionsNotionSearchPlaceholderPage": "\u4F8B: Product \u6CE8\u610F\u4E8B\u9805",
    "optionsNotionSearchPlaceholderDataSource": "\u4F8B: Threads \u53D7\u4FE1\u7BB1",
    "optionsNotionSearchButton": "\u76EE\u7684\u5730\u3092\u691C\u7D22\u3059\u308B",
    "optionsNotionResultsLabel": "\u7D50\u679C",
    "optionsNotionResultsHint": "\u7D50\u679C\u3092 1 \u3064\u9078\u629E\u3057\u3001\u305D\u308C\u3092\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u4FDD\u5B58\u5148\u3068\u3057\u3066\u8A2D\u5B9A\u3057\u307E\u3059\u3002",
    "optionsNotionUseLocationButton": "\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u5B9B\u5148\u3068\u3057\u3066\u4F7F\u7528\u3059\u308B",
    "optionsNotionSearchLoaded": "Notion \u5B9B\u5148\u304C\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3057\u305F\u3002",
    "optionsNotionSearchEmpty": "\u4E00\u81F4\u3059\u308B Notion \u5B9B\u5148\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "optionsNotionSearchFailed": "Notion \u5B9B\u5148\u3092\u30ED\u30FC\u30C9\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "optionsNotionOAuthRequiresPro": "Notion OAuth \u4FDD\u5B58\u306F\u3001Pro \u3067\u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002",
    "optionsNotionConnectFirst": "\u6700\u521D\u306B Notion \u3092\u63A5\u7D9A\u3057\u307E\u3059\u3002",
    "optionsNotionToken": "\u7D71\u5408\u30C8\u30FC\u30AF\u30F3",
    "optionsNotionTokenHint": "Notion \u5185\u90E8\u7D71\u5408\u30C8\u30FC\u30AF\u30F3\u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002\u3053\u306E\u30D6\u30E9\u30A6\u30B6 \u30D7\u30ED\u30D5\u30A1\u30A4\u30EB\u306B\u306E\u307F\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
    "optionsNotionParentPage": "\u89AA\u30DA\u30FC\u30B8 ID \u307E\u305F\u306F URL",
    "optionsNotionParentPageHint": "Notion \u30DA\u30FC\u30B8 URL \u5168\u4F53\u3092\u8CBC\u308A\u4ED8\u3051\u308B\u3053\u3068\u3082\u3001\u30DA\u30FC\u30B8 ID \u306E\u307F\u3092\u8CBC\u308A\u4ED8\u3051\u308B\u3053\u3068\u3082\u3067\u304D\u307E\u3059\u3002",
    "optionsNotionDataSource": "\u30C7\u30FC\u30BF \u30BD\u30FC\u30B9 ID \u307E\u305F\u306F URL",
    "optionsNotionDataSourceHint": "\u5B8C\u5168\u306A Notion \u30C7\u30FC\u30BF \u30BD\u30FC\u30B9 URL \u307E\u305F\u306F\u305D\u306E ID \u306E\u307F\u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002\u30BF\u30A4\u30C8\u30EB\u3001\u30BF\u30B0\u3001\u65E5\u4ED8\u3001\u304A\u3088\u3073\u540C\u69D8\u306E\u30D7\u30ED\u30D1\u30C6\u30A3\u306F\u3001\u53EF\u80FD\u306A\u5834\u5408\u306B\u306F\u81EA\u52D5\u7684\u306B\u30DE\u30C3\u30D4\u30F3\u30B0\u3055\u308C\u307E\u3059\u3002",
    "optionsNotionDataSourceLocked": "\u30C7\u30FC\u30BF \u30BD\u30FC\u30B9\u306E\u4FDD\u5B58\u306F\u3001Pro \u3067\u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002",
    "optionsNotionUploadMedia": "\u30E1\u30C7\u30A3\u30A2\u3092 Notion \u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3059",
    "optionsNotionUploadMediaHint": "\u753B\u50CF\u3068\u30D3\u30C7\u30AA\u3092\u30EA\u30E2\u30FC\u30C8 \u30EA\u30F3\u30AF\u3068\u3057\u3066\u6B8B\u3059\u306E\u3067\u306F\u306A\u304F\u3001Notion \u304C\u7BA1\u7406\u3059\u308B\u30D5\u30A1\u30A4\u30EB\u3068\u3057\u3066\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u304C\u5931\u6557\u3057\u305F\u5834\u5408\u3001\u4FDD\u5B58\u306F\u30EA\u30F3\u30AF\u306B\u623B\u308A\u307E\u3059\u3002",
    "optionsNotionUploadMediaLocked": "Notion \u304C\u7BA1\u7406\u3059\u308B\u30E1\u30C7\u30A3\u30A2\u306E\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306F\u3001Pro \u3067\u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002",
    "optionsNotionTokenRequired": "Notion \u4FDD\u5B58\u3092\u4F7F\u7528\u3059\u308B\u306B\u306F\u3001Notion \u7D71\u5408\u30C8\u30FC\u30AF\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002",
    "optionsNotionParentPageRequired": "Notion \u4FDD\u5B58\u3092\u4F7F\u7528\u3059\u308B\u306B\u306F\u3001Notion \u89AA\u30DA\u30FC\u30B8 ID \u307E\u305F\u306F URL \u304C\u5FC5\u8981\u3067\u3059\u3002",
    "optionsNotionInvalidPage": "Notion \u89AA\u30DA\u30FC\u30B8 ID \u307E\u305F\u306F URL \u5F62\u5F0F\u304C\u7121\u52B9\u3067\u3059\u3002",
    "optionsNotionDataSourceRequired": "\u30C7\u30FC\u30BF \u30BD\u30FC\u30B9\u306E\u4FDD\u5B58\u3092\u4F7F\u7528\u3059\u308B\u306B\u306F\u3001Notion \u30C7\u30FC\u30BF \u30BD\u30FC\u30B9 ID \u307E\u305F\u306F URL \u304C\u5FC5\u8981\u3067\u3059\u3002",
    "optionsNotionInvalidDataSource": "Notion \u30C7\u30FC\u30BF \u30BD\u30FC\u30B9 ID \u307E\u305F\u306F URL \u5F62\u5F0F\u304C\u7121\u52B9\u3067\u3059\u3002",
    "optionsNotionPermissionDenied": "Notion API \u3078\u306E\u30A2\u30AF\u30BB\u30B9\u8A31\u53EF\u304C\u62D2\u5426\u3055\u308C\u305F\u305F\u3081\u3001\u8A2D\u5B9A\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "optionsBasicSection": "\u57FA\u672C\u7684\u306A\u7BC0\u7D04",
    "optionsBasicSubtitle": "",
    "optionsCompareSection": "Free vs Pro",
    "optionsProSection": "Pro\u306E\u8A2D\u5B9A",
    "optionsProSubtitle": "\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051\u958B\u304D\u307E\u3059\u3002\u3053\u3053\u306B\u30EB\u30FC\u30EB\u3068 AI \u7D44\u7E54\u304C\u5B58\u5728\u3057\u307E\u3059\u3002",
    "optionsProAiNote": "AI\u306F\u81EA\u52D5\u7684\u306B\u306F\u7D44\u307F\u8FBC\u307E\u308C\u307E\u305B\u3093\u3002\u3053\u308C\u306F\u3001\u72EC\u81EA\u306E API \u30AD\u30FC\u3092\u8FFD\u52A0\u3057\u305F\u5F8C\u306B\u306E\u307F\u5B9F\u884C\u3055\u308C\u307E\u3059\u3002",
    "optionsProCompareFree": "Free",
    "optionsProComparePro": "Pro",
    "compareRowSave": "\u4FDD\u5B58",
    "compareRowImages": "\u753B\u50CF",
    "compareRowReplies": "\u30B9\u30EC\u30C3\u30C9\u306E\u8FD4\u4FE1",
    "compareRowDuplicates": "\u91CD\u8907\u3092\u30B9\u30AD\u30C3\u30D7\u3059\u308B",
    "compareRowFilename": "\u30D5\u30A1\u30A4\u30EB\u540D\u306E\u5F62\u5F0F",
    "compareRowFolder": "\u4FDD\u5B58\u30D5\u30A9\u30EB\u30C0\u30FC",
    "compareRowNotionDataSource": "Notion \u30C7\u30FC\u30BF \u30BD\u30FC\u30B9",
    "compareRowNotionMediaUpload": "Notion \u30E1\u30C7\u30A3\u30A2\u306E\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
    "compareRowAiSummary": "AI\u306E\u6982\u8981",
    "compareRowAiTags": "AI\u30BF\u30B0",
    "compareRowAiFrontmatter": "AI \u306E\u6700\u524D\u7DDA",
    "optionsProBadgeFree": "Free",
    "optionsProBadgeActive": "Pro",
    "optionsProStatusFree": "\u3042\u306A\u305F\u306FFree\u306B\u3044\u307E\u3059\u3002\u4FDD\u5B58\u306F\u3059\u3067\u306B\u6A5F\u80FD\u3057\u3066\u304A\u308A\u3001Pro \u306F\u30EB\u30FC\u30EB\u307E\u305F\u306F AI \u304C\u5FC5\u8981\u306A\u5834\u5408\u306B\u306E\u307F\u5FC5\u8981\u3067\u3059\u3002",
    "optionsProStatusActive": "Pro \u304C\u30A2\u30AF\u30C6\u30A3\u30D6\u3067\u3059\u3002\u30EB\u30FC\u30EB\u30D9\u30FC\u30B9\u306E\u7D44\u7E54\u3068AI\u306F\u4EE5\u4E0B\u304B\u3089\u5165\u624B\u53EF\u80FD\u3067\u3059\u3002",
    "optionsProStatusExpired": "\u3053\u306E Pro \u30AD\u30FC\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u3066\u3044\u307E\u3059\u3002 Free \u306E\u4FDD\u5B58\u306F\u5F15\u304D\u7D9A\u304D\u6A5F\u80FD\u3057\u307E\u3059\u3002",
    "optionsProStatusInvalid": "\u3053\u306E Pro \u30AD\u30FC\u306F\u7121\u52B9\u3067\u3059\u3002 Free \u306E\u4FDD\u5B58\u306F\u5F15\u304D\u7D9A\u304D\u6A5F\u80FD\u3057\u307E\u3059\u3002",
    "optionsProStatusSeatLimit": "\u3053\u306E Pro \u30AD\u30FC\u306F\u3059\u3067\u306B 3 \u3064\u306E\u30C7\u30D0\u30A4\u30B9\u3067\u30A2\u30AF\u30C6\u30A3\u30D6\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002\u307E\u305A\u5225\u306E\u30C7\u30D0\u30A4\u30B9\u3067 1 \u3064\u3092\u89E3\u653E\u3057\u307E\u3059\u3002",
    "optionsProStatusNeedsActivation": "Pro \u30AD\u30FC\u306F\u6709\u52B9\u3067\u3059\u304C\u3001\u3053\u306E\u30C7\u30D0\u30A4\u30B9\u306B\u306F\u307E\u3060\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30B7\u30FC\u30C8\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
    "optionsProStatusOffline": "\u30B5\u30FC\u30D0\u30FC\u306B\u5230\u9054\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001\u6700\u65B0\u306E\u30A2\u30AF\u30C6\u30A3\u30D9\u30FC\u30B7\u30E7\u30F3\u72B6\u614B\u304C\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    "optionsProStatusRevoked": "\u3053\u306E Pro \u30AD\u30FC\u306F\u4F7F\u7528\u3067\u304D\u306A\u304F\u306A\u308A\u307E\u3057\u305F\u3002",
    "optionsProHolderLabel": "\u30DB\u30EB\u30C0\u30FC",
    "optionsProExpiresLabel": "\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3059",
    "optionsProUnlockLabel": "Pro \u30AD\u30FC",
    "optionsProUnlockHint": "\u8CFC\u5165\u30E1\u30FC\u30EB\u306B\u3042\u308B Pro \u30AD\u30FC\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u3001\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u30A2\u30AF\u30C6\u30A3\u30D6\u5316\u3057\u307E\u3059\u3002",
    "optionsProUnlockPlaceholder": "Pro \u30AD\u30FC\u3092\u3053\u3053\u306B\u8CBC\u308A\u4ED8\u3051\u307E\u3059",
    "optionsProSalesLink": "Pro \u3092\u53D6\u5F97\u3059\u308B",
    "optionsProActivate": "Pro\u3092\u30A2\u30AF\u30C6\u30A3\u30D6\u5316\u3059\u308B",
    "optionsProClear": "\u524A\u9664",
    "optionsProActivated": "Pro \u304C\u30A2\u30AF\u30C6\u30A3\u30D6\u306B\u306A\u308A\u307E\u3057\u305F\u3002",
    "optionsProRemoved": "Pro \u30AD\u30FC\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002",
    "optionsProEmptyKey": "\u6700\u521D\u306B Pro \u30AD\u30FC\u3092\u5165\u529B\u3057\u307E\u3059\u3002",
    "optionsProLocalOnly": "\u6295\u7A3F\u306F\u30C7\u30D0\u30A4\u30B9\u306B\u6B8B\u308A\u307E\u3059\u3002\u30B5\u30A4\u30F3\u30A4\u30F3\u306F\u5FC5\u8981\u3042\u308A\u307E\u305B\u3093\u3002",
    "optionsFileRules": "\u30D5\u30A1\u30A4\u30EB\u30EB\u30FC\u30EB",
    "optionsFilenamePattern": "\u30D5\u30A1\u30A4\u30EB\u540D\u306E\u5F62\u5F0F",
    "optionsFilenamePatternLocked": "Free \u306F\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u30D5\u30A1\u30A4\u30EB\u540D\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002 Pro \u3092\u4F7F\u7528\u3059\u308B\u3068\u3001\u72EC\u81EA\u306E\u5F62\u5F0F\u3092\u8A2D\u5B9A\u3067\u304D\u307E\u3059\u3002",
    "optionsSavePathPattern": "\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u30D1\u30B9",
    "optionsSavePathTokens": "\u4F8B: \u53D7\u4FE1\u30C8\u30EC\u30A4/{date} \xB7 Threads/{author}",
    "optionsSavePathLocked": "Free \u306F\u3001\u63A5\u7D9A\u3055\u308C\u305F\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u30EB\u30FC\u30C8\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002 Pro \u3092\u4F7F\u7528\u3059\u308B\u3068\u3001\u65E5\u4ED8\u3001\u4F5C\u6210\u8005\u3001\u307E\u305F\u306F\u30C8\u30D4\u30C3\u30AF\u5225\u306B\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u81EA\u52D5\u7684\u306B\u5206\u985E\u3067\u304D\u307E\u3059\u3002",
    "optionsFilenameTokens": "\u5229\u7528\u53EF\u80FD: {date}\u3001{author}\u3001{first_sentence}\u3001{first_sentence_20}\u3001{shortcode}",
    "optionsAiSection": "AI\u7D44\u7E54",
    "optionsAiSubtitle": "\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3092\u9078\u629E\u3059\u308B\u3068\u3001\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u30D9\u30FC\u30B9 URL \u3068\u30E2\u30C7\u30EB\u304C\u81EA\u52D5\u7684\u306B\u5165\u529B\u3055\u308C\u307E\u3059\u3002",
    "optionsAiQuickstart": "\u307B\u3068\u3093\u3069\u306E\u30E6\u30FC\u30B6\u30FC\u306B\u306F\u3001\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3068 API \u30AD\u30FC\u306E\u307F\u304C\u5FC5\u8981\u3067\u3059\u3002\u5909\u66F4\u5F8C\u3001\u4E0B\u306E\u300C\u8A2D\u5B9A\u3092\u4FDD\u5B58\u300D\u3092\u62BC\u3057\u3066\u9069\u7528\u3057\u307E\u3059\u3002",
    "optionsAiAdvancedSummary": "\u8A73\u7D30\u8A2D\u5B9A\u3092\u8868\u793A",
    "optionsAiEnable": "AI \u7D44\u7E54\u3092\u6709\u52B9\u306B\u3059\u308B",
    "optionsAiProvider": "Provider",
    "optionsAiProviderHint": "OpenAI\u3001OpenRouter\u3001DeepSeek\u3001Gemini\u3001Ollama \u306F\u30D7\u30EA\u30BB\u30C3\u30C8\u304B\u3089\u8D77\u52D5\u3067\u304D\u307E\u3059\u3002 Custom \u306F\u3001OpenAI \u3068\u4E92\u63DB\u6027\u306E\u3042\u308B\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u7528\u3067\u3059\u3002",
    "optionsAiProviderOpenAi": "OpenAI",
    "optionsAiProviderOpenRouter": "\u30AA\u30FC\u30D7\u30F3\u30EB\u30FC\u30BF\u30FC",
    "optionsAiProviderDeepSeek": "DeepSeek",
    "optionsAiProviderGemini": "Gemini",
    "optionsAiProviderOllama": "\u30AA\u30E9\u30DE",
    "optionsAiProviderCustom": "\u30AB\u30B9\u30BF\u30E0",
    "optionsAiApiKey": "API \u30AD\u30FC",
    "optionsAiApiKeyHint": "Gemini \u30AD\u30FC\u306F\u901A\u5E38 AIza \u3067\u59CB\u307E\u308A\u3001OpenAI/OpenRouter/DeepSeek \u30AD\u30FC\u306F\u901A\u5E38 sk- \u3067\u59CB\u307E\u308A\u307E\u3059\u3002 Ollama \u306A\u3069\u306E\u30ED\u30FC\u30AB\u30EB \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u3067\u30AD\u30FC\u304C\u5FC5\u8981\u306A\u3044\u5834\u5408\u306B\u306E\u307F\u3001\u3053\u308C\u3092\u7A7A\u767D\u306E\u307E\u307E\u306B\u3057\u3066\u304A\u304D\u307E\u3059\u3002",
    "optionsAiApiKeyRequired": "\u9078\u629E\u3057\u305F\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306B\u306F API \u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002",
    "optionsAiKeyMismatchGemini": "Gemini \u306B\u306F Google Gemini API \u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002\u73FE\u5728\u306E\u30AD\u30FC\u306F OpenAI \u4E92\u63DB\u30AD\u30FC\u306E\u3088\u3046\u3067\u3059\u3002",
    "optionsAiKeyMismatchOpenAi": "OpenAI/OpenRouter/DeepSeek \u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306B\u306F\u3001AIza \u3067\u59CB\u307E\u308B Gemini \u30AD\u30FC\u3067\u306F\u306A\u304F\u3001\u72EC\u81EA\u306E\u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002",
    "optionsAiBaseUrl": "\u30D9\u30FC\u30B9URL",
    "optionsAiBaseUrlHint": "\u4F8B: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
    "optionsAiModel": "\u6A5F\u7A2E\u540D",
    "optionsAiModelHint": "\u4F8B: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
    "optionsAiPrompt": "\u7D44\u7E54\u306E\u30D7\u30ED\u30F3\u30D7\u30C8",
    "optionsAiPromptHint": "\u6982\u8981\u306E\u9577\u3055\u3001\u30BF\u30B0\u306E\u30B9\u30BF\u30A4\u30EB\u3001\u304A\u3088\u3073\u5FC5\u8981\u306A\u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC \u30D5\u30A3\u30FC\u30EB\u30C9\u306B\u3064\u3044\u3066\u8AAC\u660E\u3057\u307E\u3059\u3002",
    "optionsAiLocked": "AI \u7D44\u7E54\u306F Pro \u3067\u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002",
    "optionsAiInvalidBaseUrl": "AI \u30D9\u30FC\u30B9 URL \u304C\u7121\u52B9\u3067\u3059\u3002",
    "optionsAiPermissionDenied": "\u9078\u629E\u3057\u305F AI \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306E\u30A2\u30AF\u30BB\u30B9\u8A31\u53EF\u304C\u62D2\u5426\u3055\u308C\u305F\u305F\u3081\u3001\u8A2D\u5B9A\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "optionsAiSaved": "AI \u8A2D\u5B9A\u3068\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u6A29\u9650\u304C\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002",
    "optionsIncludeImages": "\u753B\u50CF\u3084\u52D5\u753B\u30D5\u30A1\u30A4\u30EB\u3092\u4FDD\u5B58\u3059\u308B",
    "optionsSave": "\u8A2D\u5B9A\u306E\u4FDD\u5B58",
    "optionsSaved": "\u8A2D\u5B9A\u304C\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002",
    "optionsPendingSave": "\u5909\u66F4\u3055\u308C\u307E\u3057\u305F\u3002\u4E0B\u306E [\u8A2D\u5B9A\u3092\u4FDD\u5B58] \u3092\u62BC\u3057\u3066\u9069\u7528\u3057\u307E\u3059\u3002",
    "optionsNoChanges": "\u307E\u3060\u5909\u66F4\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    "optionsStep1": "1.Obsidian\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u63A5\u7D9A\u3057\u307E\u3059",
    "optionsStep2": "2. \u307E\u305A\u306F\u7121\u6599\u3067\u4FDD\u5B58\u3057\u3066\u307F\u3066\u304F\u3060\u3055\u3044",
    "optionsStep3": "3. \u30EB\u30FC\u30EB\u307E\u305F\u306F AI \u7D44\u7E54\u304C\u5FC5\u8981\u306A\u5834\u5408\u306F\u3001Pro \u3092\u30A2\u30AF\u30C6\u30A3\u30D6\u5316\u3057\u307E\u3059",
    "mdImageLabel": "\u753B\u50CF",
    "mdVideoLabel": "\u30D3\u30C7\u30AA",
    "mdVideoThumbnailLabel": "\u30D3\u30C7\u30AA\u306E\u30B5\u30E0\u30CD\u30A4\u30EB",
    "mdVideoOnThreads": "Threads \u3067\u958B\u304F",
    "mdSavedVideoFile": "\u4FDD\u5B58\u3055\u308C\u305F\u30D3\u30C7\u30AA\u30D5\u30A1\u30A4\u30EB",
    "mdReplySection": "\u8457\u8005\u306E\u8FD4\u4FE1",
    "mdReplyLabel": "\u8FD4\u4FE1",
    "mdReplyImageLabel": "\u8FD4\u4FE1\u753B\u50CF",
    "mdUploadedMediaSection": "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3055\u308C\u305F\u30E1\u30C7\u30A3\u30A2",
    "mdSource": "\u30BD\u30FC\u30B9",
    "mdAuthor": "\u8457\u8005",
    "mdPublishedAt": "\u3067\u516C\u958B\u3055\u308C\u307E\u3057\u305F",
    "mdExternalLink": "\u5916\u90E8\u30EA\u30F3\u30AF",
    "mdWarning": "\u8B66\u544A",
    "mdSummary": "AI\u306E\u6982\u8981",
    "warnImageAccessFailed": "\u4E00\u90E8\u306E\u753B\u50CF\u307E\u305F\u306F\u30D3\u30C7\u30AA\u306F\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u5143\u306E\u30EA\u30F3\u30AF\u306F\u7DAD\u6301\u3055\u308C\u307E\u3057\u305F\u3002",
    "warnImageDownloadOff": "\u753B\u50CF/\u30D3\u30C7\u30AA\u306E\u4FDD\u5B58\u306F\u30AA\u30D5\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002\u5143\u306E\u30EA\u30F3\u30AF\u306F\u7DAD\u6301\u3055\u308C\u307E\u3057\u305F\u3002",
    "warnAiFailed": "AI \u306E\u6574\u7406\u306B\u5931\u6557\u3057\u305F\u305F\u3081\u3001\u4EE3\u308F\u308A\u306B\u5143\u306E\u30E1\u30E2\u304C\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F: {reason}",
    "warnAiPermissionMissing": "AI \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306E\u6A29\u9650\u304C\u306A\u3044\u305F\u3081\u3001\u5143\u306E\u30E1\u30E2\u306F\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002\u8A2D\u5B9A\u3067 AI \u30BB\u30AF\u30B7\u30E7\u30F3\u3092\u518D\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    "warnAiMissingModel": "AI \u30E2\u30C7\u30EB\u540D\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u5143\u306E\u30E1\u30E2\u304C\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002",
    "warnNotionMediaUploadFailed": "Notion \u30E1\u30C7\u30A3\u30A2\u306E\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u305F\u305F\u3081\u3001\u4EE3\u308F\u308A\u306B\u30EA\u30E2\u30FC\u30C8 \u30EA\u30F3\u30AF\u304C\u4FDD\u5B58\u3055\u308C\u307E\u3057\u305F\u3002",
    "errBrowserUnsupported": "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u3001Obsidian \u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002",
    "errFolderNameFailed": "\u4FDD\u5B58\u5148\u306E\u30D5\u30A9\u30EB\u30C0\u30FC\u540D\u3092\u6C7A\u5B9A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    "errInvalidPath": "\u7121\u52B9\u306A\u30D5\u30A1\u30A4\u30EB\u30D1\u30B9\u3067\u3059\u3002",
    "errNotionTokenMissing": "Notion \u7D71\u5408\u30C8\u30FC\u30AF\u30F3\u304C\u69CB\u6210\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
    "errNotionPermissionMissing": "Notion API \u306E\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u307E\u305A\u8A2D\u5B9A\u3092\u518D\u4FDD\u5B58\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    "errNotionUnauthorized": "Notion \u30C8\u30FC\u30AF\u30F3\u304C\u7121\u52B9\u3067\u3042\u308B\u304B\u3001\u671F\u9650\u5207\u308C\u3067\u3059\u3002",
    "errNotionForbidden": "\u3053\u306E\u7D71\u5408\u306F\u3001\u9078\u629E\u3055\u308C\u305F Notion \u5B9B\u5148\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093\u3002\u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF \u30BD\u30FC\u30B9\u304C\u7D71\u5408\u3068\u5171\u6709\u3055\u308C\u3066\u3044\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    "errNotionParentNotFound": "\u9078\u629E\u3055\u308C\u305F Notion \u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF \u30BD\u30FC\u30B9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002 ID\u3068\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    "errNotionRateLimited": "Notion \u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u591A\u3059\u304E\u307E\u3059\u3002 {seconds} \u79D2\u5F8C\u306B\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002",
    "errNotionValidation": "Notion \u8981\u6C42\u306F\u7121\u52B9\u3067\u3059\u3002",
    "errNotionRequestFailed": "Notion \u4FDD\u5B58\u8981\u6C42\u306F\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
    "fallbackNoFolder": "\u30D5\u30A9\u30EB\u30C0\u30FC\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
    "fallbackPermissionDenied": "\u30D5\u30A9\u30EB\u30C0\u30FC\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
    "fallbackDirectFailed": "\u30D5\u30A9\u30EB\u30C0\u30FC\u306B\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3001",
    "fallbackZipMessage": "\u4EE3\u308F\u308A\u306B\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3068\u3057\u3066\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
    "errNotPermalink": "\u307E\u305A\u306F\u500B\u5225\u6295\u7A3F\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
    "errPostContentNotFound": "\u6295\u7A3F\u30B3\u30F3\u30C6\u30F3\u30C4\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u3044\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  "pt-BR": {
    "uiLanguageLabel": "Idioma",
    "uiLanguageKo": "\uD55C\uAD6D\uC5B4",
    "uiLanguageEn": "Ingl\xEAs",
    "popupTitle": "Salvar postagem atual",
    "popupSave": "Salvar postagem atual",
    "popupSettings": "Configura\xE7\xF5es",
    "popupPromoTitle": "\xC1rea Reservada",
    "popupPromoDescription": "Este espa\xE7o \xE9 reservado para futuras orienta\xE7\xF5es e recomenda\xE7\xF5es.",
    "popupSubtitleDirect": "Salvando diretamente na pasta Obsidian conectada.",
    "popupSubtitleDownload": "Nenhuma pasta conectada. Salvando como download. Conecte uma pasta nas configura\xE7\xF5es.",
    "popupSubtitleConnected": "Salvando diretamente na pasta Obsidian conectada.",
    "popupSubtitlePermissionCheck": "Pasta conectada, mas a permiss\xE3o pode precisar de reconfirma\xE7\xE3o.",
    "popupSubtitleNoFolder": "Salva diretamente quando uma pasta est\xE1 conectada, caso contr\xE1rio, baixa um arquivo.",
    "popupSubtitleUnsupported": "Este navegador suporta apenas downloads de arquivos.",
    "popupSubtitleNotion": "Salvando em seu destino Notion configurado.",
    "popupSubtitleNotionSetup": "Para usar o salvamento Notion, insira primeiro seu token e destino nas configura\xE7\xF5es.",
    "popupRecentSaves": "Salvamentos recentes",
    "popupClearAll": "Limpar tudo",
    "popupEmpty": "Nenhuma postagem salva ainda.",
    "popupResave": "Salvar novamente",
    "popupExpand": "Expandir",
    "popupCollapse": "Recolher",
    "popupDelete": "Excluir",
    "statusReady": "Pronto para salvar em uma p\xE1gina de link permanente de postagem.",
    "statusReadyDirect": "Pronto. Pressione para salvar diretamente na pasta Obsidian.",
    "statusReadyDownload": "Pronto. Pressione para baixar o arquivo.",
    "statusUnsupported": "Por favor, abra uma p\xE1gina de postagem individual primeiro.",
    "statusNoTab": "N\xE3o foi poss\xEDvel encontrar uma guia ativa.",
    "statusSaving": "Salvando\u2026",
    "statusSavedDirect": "Salvo diretamente na sua pasta Obsidian.",
    "statusSavedZip": "Salvo. Download iniciado.",
    "statusSavedNotion": "Salvo em Notion.",
    "statusDuplicate": "J\xE1 salvo \u2014 atualizado com o conte\xFAdo mais recente.",
    "statusDuplicateWarning": "J\xE1 salvo, atualizado:",
    "statusAlreadySaved": "Esta postagem j\xE1 est\xE1 salva. Use 'Salvar novamente' dos salvamentos recentes para salvar novamente.",
    "statusNotionSetupRequired": "Para usar o salvamento Notion, insira primeiro seu token e destino nas configura\xE7\xF5es.",
    "statusError": "Ocorreu um erro desconhecido.",
    "statusResaving": "Preparando seu arquivo\u2026",
    "statusResaved": "Download iniciado.",
    "statusResavedNotion": "Salvo em Notion como uma nova p\xE1gina.",
    "statusRecentNotFound": "N\xE3o foi poss\xEDvel encontrar o registro salvo recente.",
    "statusDeletedRecent": "Exclu\xEDdo dos salvamentos recentes.",
    "statusClearedRecents": "Todos os salvamentos recentes foram apagados.",
    "statusExtractFailed": "N\xE3o foi poss\xEDvel ler a postagem.",
    "statusTabError": "N\xE3o foi poss\xEDvel ler as informa\xE7\xF5es da guia ativa.",
    "statusRedownloadError": "Erro durante o novo download.",
    "statusRetry": "Tentar novamente",
    "statusResaveButton": "Salvar novamente",
    "optionsTitle": "Salve postagens Threads em Obsidian ou Notion, com organiza\xE7\xE3o autom\xE1tica.",
    "optionsTitleObsidianOnly": "Salve postagens Threads em Obsidian, com organiza\xE7\xE3o autom\xE1tica.",
    "optionsSubtitle": "Free salvando, Pro somente quando necess\xE1rio.",
    "optionsSubtitleObsidianOnly": "Os documentos voltados para o lan\xE7amento ainda descrevem o produto de lan\xE7amento, mas a IU atual exp\xF5e apenas Obsidian.",
    "optionsPlanSpotlightFreeTitle": "Free",
    "optionsPlanSpotlightFreeCopy": "A economia b\xE1sica est\xE1 pronta para uso.",
    "optionsPlanSpotlightActiveTitle": "Pro ativo",
    "optionsPlanSpotlightActiveCopy": "Os recursos Pro est\xE3o habilitados neste navegador.",
    "optionsPlanSpotlightNeedsActivationTitle": "Pro precisa de ativa\xE7\xE3o",
    "optionsPlanSpotlightNeedsActivationCopy": "A chave \xE9 v\xE1lida, mas este dispositivo ainda n\xE3o possui assento ativo.",
    "optionsPlanSpotlightSeatMeta": "Assento {used}/{limit} \xB7 {device}",
    "optionsAdSlotLabel": "An\xFAncio",
    "optionsAdSlotTitle": "Espa\xE7o reservado para an\xFAncio",
    "optionsAdSlotCopy": "Reservado para um banner ou an\xFAncio futuro.",
    "optionsFolderSection": "Conecte a pasta Obsidian",
    "optionsFolderStatus": "Verificando a pasta conectada\u2026",
    "optionsFolderLabel": "Pasta Atual",
    "optionsFolderNotConnected": "N\xE3o conectado",
    "optionsFolderConnect": "Conectar pasta",
    "optionsFolderDisconnect": "Desconectar",
    "optionsFolderUnsupported": "Conex\xE3o de pasta n\xE3o suportada neste navegador",
    "optionsFolderUnsupportedStatus": "Este navegador n\xE3o pode salvar diretamente em uma pasta. Os arquivos ser\xE3o baixados.",
    "optionsFolderNotConnectedStatus": "Nenhuma pasta conectada. Os arquivos ser\xE3o baixados quando voc\xEA salvar.",
    "optionsFolderReady": "Pasta conectada. Os arquivos ser\xE3o salvos diretamente.",
    "optionsFolderPermissionCheck": "Pasta conectada. A permiss\xE3o pode ser reconfirmada no pr\xF3ximo salvamento.",
    "optionsFolderPermissionLost": "Permiss\xE3o de pasta perdida. Reconecte sua pasta.",
    "optionsFolderChecked": "Conex\xE3o de pasta verificada. O salvamento direto ser\xE1 tentado.",
    "optionsFolderCancelled": "Sele\xE7\xE3o de pasta cancelada.",
    "optionsFolderError": "Erro ao conectar a pasta.",
    "optionsFolderConnectedSuccess": 'Conectei a pasta "{folder}".',
    "optionsFolderPathLabel": "Local de salvamento atual",
    "optionsFolderPathHint": "O navegador n\xE3o pode expor o caminho absoluto do sistema operacional, portanto, ele permanece relativo \xE0 pasta conectada.",
    "optionsFolderPathUnavailable": "Mostrado depois de conectar uma pasta",
    "optionsSaveTarget": "Salvar meta",
    "optionsSaveTargetHint": "No PC, escolha Obsidian ou Notion como destino padr\xE3o.",
    "optionsSaveTargetHintObsidianOnly": "A UI atual exp\xF5e apenas Obsidian. Notion fica oculto nas configura\xE7\xF5es enquanto a integra\xE7\xE3o \xE9 preparada internamente.",
    "optionsSaveTargetObsidian": "Obsidian",
    "optionsSaveTargetNotion": "Notion",
    "optionsSaveTargetNotionHidden": "Notion (oculto por enquanto)",
    "optionsNotionSection": "Conex\xE3o Notion",
    "optionsNotionSubtitle": "Notion est\xE1 conectado atrav\xE9s de OAuth para que o navegador nunca solicite um token interno. Conecte-se uma vez, escolha um destino padr\xE3o e salve depois disso.",
    "optionsNotionConnectionLabel": "Conex\xE3o",
    "optionsNotionConnectButton": "Conecte Notion",
    "optionsNotionDisconnectButton": "Desconectar",
    "optionsNotionConnectHint": "Uma guia de aprova\xE7\xE3o Notion ser\xE1 aberta. Ap\xF3s a aprova\xE7\xE3o, retorne aqui e o estado da conex\xE3o ser\xE1 atualizado automaticamente.",
    "optionsNotionConnected": "Uma \xE1rea de trabalho Notion est\xE1 conectada.",
    "optionsNotionDisconnected": "Notion ainda n\xE3o est\xE1 conectado.",
    "optionsNotionConnectStarted": "Abriu a guia de conex\xE3o Notion. Retorne aqui ap\xF3s aprova\xE7\xE3o.",
    "optionsNotionConnectFailed": "N\xE3o foi poss\xEDvel iniciar o fluxo de conex\xE3o Notion.",
    "optionsNotionDisconnectedSaved": "Desconectou a \xE1rea de trabalho Notion.",
    "optionsNotionDisconnectFailed": "N\xE3o foi poss\xEDvel desconectar Notion.",
    "optionsNotionParentType": "Modo salvar",
    "optionsNotionParentTypeHint": "Escolha se o destino padr\xE3o deve ser uma p\xE1gina ou uma fonte de dados no espa\xE7o de trabalho conectado.",
    "optionsNotionParentTypePage": "P\xE1gina pai",
    "optionsNotionParentTypeDataSource": "Fonte de dados",
    "optionsNotionSelectedTarget": "Destino padr\xE3o",
    "optionsNotionSelectedTargetHint": "\xC9 aqui que o bot\xE3o salvar enviar\xE1 novas capturas Threads por padr\xE3o.",
    "optionsNotionTargetNotSelected": "Nenhum destino padr\xE3o foi selecionado ainda.",
    "optionsNotionTargetRequired": "Escolha primeiro um destino Notion padr\xE3o.",
    "optionsNotionTargetSaved": "Salvou o destino Notion padr\xE3o.",
    "optionsNotionTargetSaveFailed": "N\xE3o foi poss\xEDvel salvar o destino Notion padr\xE3o.",
    "optionsNotionSearchLabel": "Encontre um destino",
    "optionsNotionSearchHint": "Pesquise p\xE1ginas ou fontes de dados \xE0s quais voc\xEA concedeu acesso a essa integra\xE7\xE3o.",
    "optionsNotionSearchPlaceholderPage": "Por exemplo: ProNotas do duto",
    "optionsNotionSearchPlaceholderDataSource": "Por exemplo: Caixa de entrada Threads",
    "optionsNotionSearchButton": "Pesquisar destinos",
    "optionsNotionResultsLabel": "Resultados",
    "optionsNotionResultsHint": "Escolha um resultado e defina-o como destino padr\xE3o para salvar.",
    "optionsNotionUseLocationButton": "Usar como destino padr\xE3o",
    "optionsNotionSearchLoaded": "Destinos Notion carregados.",
    "optionsNotionSearchEmpty": "Nenhum destino Notion correspondente foi encontrado.",
    "optionsNotionSearchFailed": "N\xE3o foi poss\xEDvel carregar destinos Notion.",
    "optionsNotionOAuthRequiresPro": "Notion O salvamento de OAuth est\xE1 dispon\xEDvel apenas em Pro.",
    "optionsNotionConnectFirst": "Conecte Notion primeiro.",
    "optionsNotionToken": "Token de integra\xE7\xE3o",
    "optionsNotionTokenHint": "Cole seu token de integra\xE7\xE3o interna Notion. Ele \xE9 armazenado apenas neste perfil de navegador.",
    "optionsNotionParentPage": "ID da p\xE1gina pai ou URL",
    "optionsNotionParentPageHint": "Voc\xEA pode colar uma p\xE1gina Notion completa URL ou apenas o ID da p\xE1gina.",
    "optionsNotionDataSource": "ID da fonte de dados ou URL",
    "optionsNotionDataSourceHint": "Cole uma origem de dados Notion completa URL ou apenas seu ID. T\xEDtulo, tags, datas e propriedades semelhantes s\xE3o mapeados automaticamente quando poss\xEDvel.",
    "optionsNotionDataSourceLocked": "O salvamento da fonte de dados est\xE1 dispon\xEDvel apenas em Pro.",
    "optionsNotionUploadMedia": "Carregar m\xEDdia em Notion",
    "optionsNotionUploadMediaHint": "Fa\xE7a upload de imagens e v\xEDdeos como arquivos gerenciados pelo Notion em vez de deix\xE1-los como links remotos. Se o upload falhar, o salvamento retornar\xE1 aos links.",
    "optionsNotionUploadMediaLocked": "O upload de m\xEDdia gerenciado por Notion est\xE1 dispon\xEDvel apenas em Pro.",
    "optionsNotionTokenRequired": "Um token de integra\xE7\xE3o Notion \xE9 necess\xE1rio para usar o salvamento Notion.",
    "optionsNotionParentPageRequired": "Um ID de p\xE1gina pai Notion ou URL \xE9 necess\xE1rio para usar o salvamento de Notion.",
    "optionsNotionInvalidPage": "O ID da p\xE1gina pai Notion ou o formato URL n\xE3o \xE9 v\xE1lido.",
    "optionsNotionDataSourceRequired": "Um ID de origem de dados Notion ou URL \xE9 necess\xE1rio para usar o salvamento de origem de dados.",
    "optionsNotionInvalidDataSource": "O ID da origem de dados Notion ou o formato URL n\xE3o \xE9 v\xE1lido.",
    "optionsNotionPermissionDenied": "A permiss\xE3o de acesso ao Notion API foi negada, portanto as configura\xE7\xF5es n\xE3o foram salvas.",
    "optionsBasicSection": "Economia B\xE1sica",
    "optionsBasicSubtitle": "",
    "optionsCompareSection": "Free vs Pro",
    "optionsProSection": "Configura\xE7\xF5es Pro",
    "optionsProSubtitle": "Abra apenas quando necess\xE1rio. \xC9 aqui que vivem as regras e a organiza\xE7\xE3o da IA.",
    "optionsProAiNote": "AI n\xE3o \xE9 inclu\xEDda automaticamente. Ele \xE9 executado somente depois que voc\xEA adiciona sua pr\xF3pria chave API.",
    "optionsProCompareFree": "Free",
    "optionsProComparePro": "Pro",
    "compareRowSave": "Salvar",
    "compareRowImages": "Imagens",
    "compareRowReplies": "Respostas do t\xF3pico",
    "compareRowDuplicates": "Ignorar duplicatas",
    "compareRowFilename": "Formato do nome do arquivo",
    "compareRowFolder": "Salvar pasta",
    "compareRowNotionDataSource": "Fonte de dados Notion",
    "compareRowNotionMediaUpload": "Carregamento de m\xEDdia Notion",
    "compareRowAiSummary": "Resumo de IA",
    "compareRowAiTags": "Tags de IA",
    "compareRowAiFrontmatter": "Frontmatter de IA",
    "optionsProBadgeFree": "Free",
    "optionsProBadgeActive": "Pro",
    "optionsProStatusFree": "Voc\xEA est\xE1 em Free. Salvar j\xE1 funciona, e Pro s\xF3 \xE9 necess\xE1rio quando voc\xEA deseja regras ou IA.",
    "optionsProStatusActive": "Pro ativo. Organiza\xE7\xE3o baseada em regras e IA est\xE3o dispon\xEDveis abaixo.",
    "optionsProStatusExpired": "Esta chave Pro expirou. O salvamento de Free ainda funciona.",
    "optionsProStatusInvalid": "Esta chave Pro n\xE3o \xE9 v\xE1lida. O salvamento de Free ainda funciona.",
    "optionsProStatusSeatLimit": "Esta chave Pro j\xE1 est\xE1 ativa em 3 dispositivos. Solte um em outro dispositivo primeiro.",
    "optionsProStatusNeedsActivation": "A chave Pro \xE9 v\xE1lida, mas este dispositivo ainda n\xE3o possui assento ativo.",
    "optionsProStatusOffline": "N\xE3o foi poss\xEDvel acessar o servidor, portanto o estado de ativa\xE7\xE3o mais recente est\xE1 sendo usado.",
    "optionsProStatusRevoked": "Esta chave Pro n\xE3o pode mais ser usada.",
    "optionsProHolderLabel": "Suporte",
    "optionsProExpiresLabel": "Expira",
    "optionsProUnlockLabel": "Chave Pro",
    "optionsProUnlockHint": "Cole a chave Pro do seu e-mail de compra para ativar neste navegador.",
    "optionsProUnlockPlaceholder": "Cole sua chave Pro aqui",
    "optionsProSalesLink": "Obtenha Pro",
    "optionsProActivate": "Ativar Pro",
    "optionsProClear": "Remover",
    "optionsProActivated": "Pro ativado.",
    "optionsProRemoved": "A chave Pro foi removida.",
    "optionsProEmptyKey": "Insira uma chave Pro primeiro.",
    "optionsProLocalOnly": "Suas postagens permanecem no seu dispositivo. N\xE3o \xE9 necess\xE1rio fazer login.",
    "optionsFileRules": "Regras de arquivo",
    "optionsFilenamePattern": "Formato do nome do arquivo",
    "optionsFilenamePatternLocked": "Free usa um nome de arquivo padr\xE3o. Pro permite definir seu pr\xF3prio formato.",
    "optionsSavePathPattern": "Caminho da subpasta",
    "optionsSavePathTokens": "Exemplos: Caixa de entrada/{date} \xB7 Threads/{author}",
    "optionsSavePathLocked": "Free salva na raiz da sua pasta conectada. Pro permite classificar automaticamente em subpastas por data, autor ou t\xF3pico.",
    "optionsFilenameTokens": "Dispon\xEDvel: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
    "optionsAiSection": "Organiza\xE7\xE3o de IA",
    "optionsAiSubtitle": "Escolha um provedor e a base padr\xE3o URL e o modelo ser\xE3o preenchidos para voc\xEA.",
    "optionsAiQuickstart": "A maioria dos usu\xE1rios precisa apenas de um provedor e da chave API. Ap\xF3s alter\xE1-los, pressione Salvar configura\xE7\xF5es abaixo para aplic\xE1-los.",
    "optionsAiAdvancedSummary": "Mostrar configura\xE7\xF5es avan\xE7adas",
    "optionsAiEnable": "Habilitar organiza\xE7\xE3o de IA",
    "optionsAiProvider": "Provider",
    "optionsAiProviderHint": "OpenAI, OpenRouter, DeepSeek, Gemini e Ollama podem iniciar a partir de predefini\xE7\xF5es. Custom \xE9 para qualquer endpoint compat\xEDvel com OpenAI.",
    "optionsAiProviderOpenAi": "OpenAI",
    "optionsAiProviderOpenRouter": "OpenRouter",
    "optionsAiProviderDeepSeek": "DeepSeek",
    "optionsAiProviderGemini": "Gemini",
    "optionsAiProviderOllama": "Ollama",
    "optionsAiProviderCustom": "Personalizado",
    "optionsAiApiKey": "Chave API",
    "optionsAiApiKeyHint": "As chaves Gemini geralmente come\xE7am com AIza, enquanto as chaves OpenAI/OpenRouter/DeepSeek geralmente come\xE7am com sk-. Deixe em branco apenas para endpoints locais como Ollama quando nenhuma chave for necess\xE1ria.",
    "optionsAiApiKeyRequired": "O provedor selecionado requer uma chave API.",
    "optionsAiKeyMismatchGemini": "Gemini precisa de uma chave Google Gemini API. A chave atual se parece com uma chave compat\xEDvel com OpenAI.",
    "optionsAiKeyMismatchOpenAi": "Os provedores OpenAI/OpenRouter/DeepSeek exigem sua pr\xF3pria chave, n\xE3o uma chave Gemini que come\xE7a com AIza.",
    "optionsAiBaseUrl": "Base URL",
    "optionsAiBaseUrlHint": "Exemplos: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
    "optionsAiModel": "Nome do modelo",
    "optionsAiModelHint": "Exemplos: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 lhama3.2",
    "optionsAiPrompt": "Solicita\xE7\xE3o da organiza\xE7\xE3o",
    "optionsAiPromptHint": "Descreva o comprimento do resumo, o estilo da tag e os campos de frontmatter desejados.",
    "optionsAiLocked": "A organiza\xE7\xE3o de IA est\xE1 dispon\xEDvel apenas em Pro.",
    "optionsAiInvalidBaseUrl": "A base AI URL n\xE3o \xE9 v\xE1lida.",
    "optionsAiPermissionDenied": "A permiss\xE3o para o endpoint de IA selecionado foi negada, portanto as configura\xE7\xF5es n\xE3o foram salvas.",
    "optionsAiSaved": "Configura\xE7\xF5es de IA e permiss\xE3o de endpoint salvas.",
    "optionsIncludeImages": "Salve imagens e arquivos de v\xEDdeo",
    "optionsSave": "Salvar configura\xE7\xF5es",
    "optionsSaved": "Configura\xE7\xF5es salvas.",
    "optionsPendingSave": "Alterado. Pressione Salvar configura\xE7\xF5es abaixo para aplic\xE1-lo.",
    "optionsNoChanges": "Nenhuma mudan\xE7a ainda.",
    "optionsStep1": "1. Conecte a pasta Obsidian",
    "optionsStep2": "2. Experimente primeiro economizar gratuitamente",
    "optionsStep3": "3. Ative Pro quando desejar regras ou organiza\xE7\xE3o de IA",
    "mdImageLabel": "Imagem",
    "mdVideoLabel": "V\xEDdeo",
    "mdVideoThumbnailLabel": "Miniatura do v\xEDdeo",
    "mdVideoOnThreads": "Abrir em Threads",
    "mdSavedVideoFile": "Arquivo de v\xEDdeo salvo",
    "mdReplySection": "Respostas do autor",
    "mdReplyLabel": "Responder",
    "mdReplyImageLabel": "Imagem de resposta",
    "mdUploadedMediaSection": "M\xEDdia enviada",
    "mdSource": "Fonte",
    "mdAuthor": "Autor",
    "mdPublishedAt": "Publicado em",
    "mdExternalLink": "Link externo",
    "mdWarning": "Aviso",
    "mdSummary": "Resumo de IA",
    "warnImageAccessFailed": "Algumas imagens ou v\xEDdeos n\xE3o puderam ser salvos; links originais foram mantidos.",
    "warnImageDownloadOff": "O salvamento de imagem/v\xEDdeo est\xE1 desativado; links originais foram mantidos.",
    "warnAiFailed": "A organiza\xE7\xE3o da IA falhou, ent\xE3o a nota original foi salva: {reason}",
    "warnAiPermissionMissing": "A permiss\xE3o do endpoint AI est\xE1 faltando, ent\xE3o a nota original foi salva. Salve novamente a se\xE7\xE3o AI nas configura\xE7\xF5es.",
    "warnAiMissingModel": "Nenhum nome de modelo de IA est\xE1 configurado, ent\xE3o a nota original foi salva.",
    "warnNotionMediaUploadFailed": "O upload de m\xEDdia Notion falhou, portanto, os links remotos foram salvos.",
    "errBrowserUnsupported": "Este navegador n\xE3o pode salvar diretamente em uma pasta Obsidian.",
    "errFolderNameFailed": "N\xE3o foi poss\xEDvel determinar um nome de pasta para salvar.",
    "errInvalidPath": "Caminho de arquivo inv\xE1lido.",
    "errNotionTokenMissing": "Nenhum token de integra\xE7\xE3o Notion est\xE1 configurado.",
    "errNotionPermissionMissing": "A permiss\xE3o para Notion API est\xE1 faltando. Salve novamente as configura\xE7\xF5es primeiro.",
    "errNotionUnauthorized": "O token Notion \xE9 inv\xE1lido ou expirou.",
    "errNotionForbidden": "Esta integra\xE7\xE3o n\xE3o pode acessar o destino Notion selecionado. Certifique-se de que a p\xE1gina ou fonte de dados seja compartilhada com a integra\xE7\xE3o.",
    "errNotionParentNotFound": "A p\xE1gina ou fonte de dados Notion selecionada n\xE3o foi encontrada. Verifique o ID e a conex\xE3o.",
    "errNotionRateLimited": "Muitas solicita\xE7\xF5es Notion. Tente novamente em {seconds} segundos.",
    "errNotionValidation": "A solicita\xE7\xE3o Notion n\xE3o \xE9 v\xE1lida.",
    "errNotionRequestFailed": "A solicita\xE7\xE3o de salvamento de Notion falhou.",
    "fallbackNoFolder": "Nenhuma pasta conectada,",
    "fallbackPermissionDenied": "Sem permiss\xE3o de pasta,",
    "fallbackDirectFailed": "N\xE3o foi poss\xEDvel salvar na pasta,",
    "fallbackZipMessage": "salvo como download.",
    "errNotPermalink": "Por favor, abra uma p\xE1gina de postagem individual primeiro.",
    "errPostContentNotFound": "N\xE3o foi poss\xEDvel carregar o conte\xFAdo da postagem. Por favor, certifique-se de estar logado."
  },
  "es": {
    "uiLanguageLabel": "Idioma",
    "uiLanguageKo": "\uD55C\uAD6D\uC5B4",
    "uiLanguageEn": "ingles",
    "popupTitle": "Guardar publicaci\xF3n actual",
    "popupSave": "Guardar publicaci\xF3n actual",
    "popupSettings": "Configuraci\xF3n",
    "popupPromoTitle": "\xC1rea reservada",
    "popupPromoDescription": "Este espacio est\xE1 reservado para futuras orientaciones y recomendaciones.",
    "popupSubtitleDirect": "Guardando directamente en su carpeta Obsidian conectada.",
    "popupSubtitleDownload": "No hay ninguna carpeta conectada. Guardar como descarga. Conecte una carpeta en la configuraci\xF3n.",
    "popupSubtitleConnected": "Guardando directamente en su carpeta Obsidian conectada.",
    "popupSubtitlePermissionCheck": "Carpeta conectada, pero es posible que sea necesario volver a confirmar el permiso.",
    "popupSubtitleNoFolder": "Guarda directamente cuando se conecta una carpeta; de lo contrario, descarga un archivo.",
    "popupSubtitleUnsupported": "Este navegador s\xF3lo admite descargas de archivos.",
    "popupSubtitleNotion": "Guardando en su destino Notion configurado.",
    "popupSubtitleNotionSetup": "Para usar el ahorro Notion, primero ingrese su token y destino en la configuraci\xF3n.",
    "popupRecentSaves": "Guardados recientes",
    "popupClearAll": "Borrar todo",
    "popupEmpty": "A\xFAn no hay publicaciones guardadas.",
    "popupResave": "Volver a guardar",
    "popupExpand": "Expandir",
    "popupCollapse": "Colapso",
    "popupDelete": "Eliminar",
    "statusReady": "Listo para guardar desde una p\xE1gina de enlace permanente de publicaci\xF3n.",
    "statusReadyDirect": "Listo. Presione para guardar directamente en su carpeta Obsidian.",
    "statusReadyDownload": "Listo. Presione para descargar el archivo.",
    "statusUnsupported": "Primero abra una p\xE1gina de publicaci\xF3n individual.",
    "statusNoTab": "No se pudo encontrar una pesta\xF1a activa.",
    "statusSaving": "Guardando\u2026",
    "statusSavedDirect": "Guardado directamente en su carpeta Obsidian.",
    "statusSavedZip": "Guardado. Descarga iniciada.",
    "statusSavedNotion": "Guardado en Notion.",
    "statusDuplicate": "Ya guardado: actualizado con el contenido m\xE1s reciente.",
    "statusDuplicateWarning": "Ya guardado, actualizado:",
    "statusAlreadySaved": "Esta publicaci\xF3n ya est\xE1 guardada. Utilice 'Volver a guardar' de los guardados recientes para guardar nuevamente.",
    "statusNotionSetupRequired": "Para usar el ahorro Notion, primero ingrese su token y destino en la configuraci\xF3n.",
    "statusError": "Se produjo un error desconocido.",
    "statusResaving": "Preparando su expediente\u2026",
    "statusResaved": "Descarga iniciada.",
    "statusResavedNotion": "Guardado en Notion como una p\xE1gina nueva.",
    "statusRecentNotFound": "No se pudo encontrar el registro guardado reciente.",
    "statusDeletedRecent": "Eliminado de guardados recientes.",
    "statusClearedRecents": "Todos los guardados recientes borrados.",
    "statusExtractFailed": "No se pudo leer la publicaci\xF3n.",
    "statusTabError": "No se pudo leer la informaci\xF3n de la pesta\xF1a activa.",
    "statusRedownloadError": "Error al volver a descargar.",
    "statusRetry": "Reintentar",
    "statusResaveButton": "Volver a guardar",
    "optionsTitle": "Guarde las publicaciones de Threads en Obsidian o Notion, con organizaci\xF3n autom\xE1tica.",
    "optionsTitleObsidianOnly": "Guarde las publicaciones de Threads en Obsidian, con organizaci\xF3n autom\xE1tica.",
    "optionsSubtitle": "Free guarda, Pro solo cuando es necesario.",
    "optionsSubtitleObsidianOnly": "Los documentos de lanzamiento a\xFAn describen el producto de lanzamiento, pero la interfaz de usuario actual solo expone Obsidian.",
    "optionsPlanSpotlightFreeTitle": "Free",
    "optionsPlanSpotlightFreeCopy": "El ahorro b\xE1sico est\xE1 listo para usar.",
    "optionsPlanSpotlightActiveTitle": "Pro activo",
    "optionsPlanSpotlightActiveCopy": "Las funciones Pro est\xE1n habilitadas en este navegador.",
    "optionsPlanSpotlightNeedsActivationTitle": "Pro necesita activaci\xF3n",
    "optionsPlanSpotlightNeedsActivationCopy": "La clave es v\xE1lida, pero este dispositivo a\xFAn no tiene un asiento activo.",
    "optionsPlanSpotlightSeatMeta": "Asiento {used}/{limit} \xB7 {device}",
    "optionsAdSlotLabel": "Anuncio",
    "optionsAdSlotTitle": "Marcador de posici\xF3n del anuncio",
    "optionsAdSlotCopy": "Reservado para un futuro banner o anuncio.",
    "optionsFolderSection": "Conectar la carpeta Obsidian",
    "optionsFolderStatus": "Comprobando la carpeta conectada...",
    "optionsFolderLabel": "Carpeta actual",
    "optionsFolderNotConnected": "No conectado",
    "optionsFolderConnect": "Conectar carpeta",
    "optionsFolderDisconnect": "Desconectar",
    "optionsFolderUnsupported": "La conexi\xF3n a carpetas no es compatible con este navegador",
    "optionsFolderUnsupportedStatus": "Este navegador no puede guardar directamente en una carpeta. En su lugar, se descargar\xE1n los archivos.",
    "optionsFolderNotConnectedStatus": "No hay ninguna carpeta conectada. Los archivos se descargar\xE1n cuando los guarde.",
    "optionsFolderReady": "Carpeta conectada. Los archivos se guardar\xE1n directamente.",
    "optionsFolderPermissionCheck": "Carpeta conectada. Es posible que el permiso se vuelva a confirmar en el pr\xF3ximo guardado.",
    "optionsFolderPermissionLost": "Permiso de carpeta perdido. Vuelva a conectar su carpeta.",
    "optionsFolderChecked": "Conexi\xF3n de carpeta verificada. Se intentar\xE1 guardar directamente.",
    "optionsFolderCancelled": "Selecci\xF3n de carpeta cancelada.",
    "optionsFolderError": "Error al conectar la carpeta.",
    "optionsFolderConnectedSuccess": 'Conect\xF3 la carpeta "{folder}".',
    "optionsFolderPathLabel": "Ubicaci\xF3n de guardado actual",
    "optionsFolderPathHint": "El navegador no puede exponer la ruta absoluta del sistema operativo, por lo que permanece relativa a la carpeta conectada.",
    "optionsFolderPathUnavailable": "Se muestra despu\xE9s de conectar una carpeta",
    "optionsSaveTarget": "Guardar objetivo",
    "optionsSaveTargetHint": "En PC, elija Obsidian o Notion como destino predeterminado.",
    "optionsSaveTargetHintObsidianOnly": "La interfaz de usuario actual solo expone Obsidian. Notion permanece oculto en la configuraci\xF3n mientras se prepara la integraci\xF3n internamente.",
    "optionsSaveTargetObsidian": "Obsidian",
    "optionsSaveTargetNotion": "Notion",
    "optionsSaveTargetNotionHidden": "Notion (Oculto por ahora)",
    "optionsNotionSection": "Conexi\xF3n Notion",
    "optionsNotionSubtitle": "Notion se conecta a trav\xE9s de OAuth por lo que el navegador nunca solicita un token interno. Con\xE9ctese una vez, elija un destino predeterminado y guarde despu\xE9s de eso.",
    "optionsNotionConnectionLabel": "Conexi\xF3n",
    "optionsNotionConnectButton": "Conectar Notion",
    "optionsNotionDisconnectButton": "Desconectar",
    "optionsNotionConnectHint": "Se abrir\xE1 una pesta\xF1a de aprobaci\xF3n Notion. Despu\xE9s de la aprobaci\xF3n, regrese aqu\xED y el estado de la conexi\xF3n se actualizar\xE1 autom\xE1ticamente.",
    "optionsNotionConnected": "Hay un espacio de trabajo Notion conectado.",
    "optionsNotionDisconnected": "Notion a\xFAn no est\xE1 conectado.",
    "optionsNotionConnectStarted": "Abri\xF3 la pesta\xF1a de conexi\xF3n Notion. Regrese aqu\xED despu\xE9s de la aprobaci\xF3n.",
    "optionsNotionConnectFailed": "No se pudo iniciar el flujo de conexi\xF3n Notion.",
    "optionsNotionDisconnectedSaved": "Desconectado el espacio de trabajo Notion.",
    "optionsNotionDisconnectFailed": "No se pudo desconectar Notion.",
    "optionsNotionParentType": "Modo guardar",
    "optionsNotionParentTypeHint": "Elija si el destino predeterminado debe ser una p\xE1gina o una fuente de datos en el espacio de trabajo conectado.",
    "optionsNotionParentTypePage": "p\xE1gina principal",
    "optionsNotionParentTypeDataSource": "fuente de datos",
    "optionsNotionSelectedTarget": "Destino predeterminado",
    "optionsNotionSelectedTargetHint": "Aqu\xED es donde el bot\xF3n Guardar enviar\xE1 nuevas capturas de Threads de forma predeterminada.",
    "optionsNotionTargetNotSelected": "A\xFAn no se ha seleccionado ning\xFAn destino predeterminado.",
    "optionsNotionTargetRequired": "Elija primero un destino predeterminado Notion.",
    "optionsNotionTargetSaved": "Se guard\xF3 el destino predeterminado Notion.",
    "optionsNotionTargetSaveFailed": "No se pudo guardar el destino predeterminado Notion.",
    "optionsNotionSearchLabel": "encontrar un destino",
    "optionsNotionSearchHint": "Busque p\xE1ginas o fuentes de datos a las que haya otorgado acceso a esta integraci\xF3n.",
    "optionsNotionSearchPlaceholderPage": "Por ejemplo: ProNotas del conducto",
    "optionsNotionSearchPlaceholderDataSource": "Por ejemplo: Threads Bandeja de entrada",
    "optionsNotionSearchButton": "Buscar destinos",
    "optionsNotionResultsLabel": "Resultados",
    "optionsNotionResultsHint": "Elija un resultado y config\xFArelo como destino predeterminado para guardar.",
    "optionsNotionUseLocationButton": "Usar como destino predeterminado",
    "optionsNotionSearchLoaded": "Destinos Notion cargados.",
    "optionsNotionSearchEmpty": "No se encontraron destinos Notion coincidentes.",
    "optionsNotionSearchFailed": "No se pudieron cargar los destinos Notion.",
    "optionsNotionOAuthRequiresPro": "El ahorro de Notion OAuth est\xE1 disponible \xFAnicamente en Pro.",
    "optionsNotionConnectFirst": "Conecte Notion primero.",
    "optionsNotionToken": "Token de integraci\xF3n",
    "optionsNotionTokenHint": "Pegue su token de integraci\xF3n interna Notion. Se almacena \xFAnicamente en este perfil del navegador.",
    "optionsNotionParentPage": "ID de p\xE1gina principal o URL",
    "optionsNotionParentPageHint": "Puede pegar una p\xE1gina Notion completa URL o solo el ID de la p\xE1gina.",
    "optionsNotionDataSource": "ID de fuente de datos o URL",
    "optionsNotionDataSourceHint": "Pegue una fuente de datos Notion completa URL o solo su ID. El t\xEDtulo, las etiquetas, las fechas y propiedades similares se asignan autom\xE1ticamente cuando es posible.",
    "optionsNotionDataSourceLocked": "El guardado de fuentes de datos solo est\xE1 disponible en Pro.",
    "optionsNotionUploadMedia": "Cargar medios en Notion",
    "optionsNotionUploadMediaHint": "Cargue im\xE1genes y v\xEDdeos como archivos administrados por Notion en lugar de dejarlos como enlaces remotos. Si la carga falla, el guardado vuelve a los enlaces.",
    "optionsNotionUploadMediaLocked": "La carga de medios administrada por Notion solo est\xE1 disponible en Pro.",
    "optionsNotionTokenRequired": "Se requiere un token de integraci\xF3n Notion para utilizar el guardado de Notion.",
    "optionsNotionParentPageRequired": "Se requiere un ID de p\xE1gina principal Notion o URL para utilizar el guardado Notion.",
    "optionsNotionInvalidPage": "El ID de la p\xE1gina principal Notion o el formato URL no son v\xE1lidos.",
    "optionsNotionDataSourceRequired": "Se requiere un ID de fuente de datos Notion o URL para poder guardar la fuente de datos.",
    "optionsNotionInvalidDataSource": "El ID de fuente de datos Notion o el formato URL no son v\xE1lidos.",
    "optionsNotionPermissionDenied": "Se deneg\xF3 el permiso para acceder a Notion API, por lo que no se guardaron las configuraciones.",
    "optionsBasicSection": "Ahorro B\xE1sico",
    "optionsBasicSubtitle": "",
    "optionsCompareSection": "Free y Pro",
    "optionsProSection": "Configuraci\xF3n de Pro",
    "optionsProSubtitle": "Abrir s\xF3lo cuando sea necesario. Aqu\xED es donde viven las reglas y la organizaci\xF3n de la IA.",
    "optionsProAiNote": "La IA no se incluye autom\xE1ticamente. Se ejecuta solo despu\xE9s de agregar su propia clave API.",
    "optionsProCompareFree": "Free",
    "optionsProComparePro": "Pro",
    "compareRowSave": "Guardar",
    "compareRowImages": "Im\xE1genes",
    "compareRowReplies": "Respuestas del hilo",
    "compareRowDuplicates": "Saltar duplicados",
    "compareRowFilename": "Formato de nombre de archivo",
    "compareRowFolder": "Guardar carpeta",
    "compareRowNotionDataSource": "fuente de datos Notion",
    "compareRowNotionMediaUpload": "Carga de medios Notion",
    "compareRowAiSummary": "Resumen de IA",
    "compareRowAiTags": "Etiquetas de IA",
    "compareRowAiFrontmatter": "Frontasunto de la IA",
    "optionsProBadgeFree": "Free",
    "optionsProBadgeActive": "Pro",
    "optionsProStatusFree": "Est\xE1s en Free. Guardar ya funciona y Pro solo es necesario cuando quieres reglas o IA.",
    "optionsProStatusActive": "Pro activo. La organizaci\xF3n basada en reglas y la IA est\xE1n disponibles a continuaci\xF3n.",
    "optionsProStatusExpired": "Esta clave Pro ha caducado. El guardado de Free todav\xEDa funciona.",
    "optionsProStatusInvalid": "Esta clave Pro no es v\xE1lida. El guardado de Free todav\xEDa funciona.",
    "optionsProStatusSeatLimit": "Esta clave Pro ya est\xE1 activa en 3 dispositivos. Primero suelte uno en otro dispositivo.",
    "optionsProStatusNeedsActivation": "La clave Pro es v\xE1lida, pero este dispositivo a\xFAn no tiene un asiento activo.",
    "optionsProStatusOffline": "No se pudo conectar con el servidor, por lo que se est\xE1 utilizando el estado de activaci\xF3n m\xE1s reciente.",
    "optionsProStatusRevoked": "Esta clave Pro ya no se puede utilizar.",
    "optionsProHolderLabel": "Titular",
    "optionsProExpiresLabel": "Vence",
    "optionsProUnlockLabel": "Tecla Pro",
    "optionsProUnlockHint": "Pegue la clave Pro de su correo electr\xF3nico de compra para activar en este navegador.",
    "optionsProUnlockPlaceholder": "Pega tu clave Pro aqu\xED",
    "optionsProSalesLink": "Obtener Pro",
    "optionsProActivate": "Activar Pro",
    "optionsProClear": "Quitar",
    "optionsProActivated": "Pro activado.",
    "optionsProRemoved": "Se ha eliminado la clave Pro.",
    "optionsProEmptyKey": "Primero ingrese una clave Pro.",
    "optionsProLocalOnly": "Tus publicaciones permanecen en tu dispositivo. No es necesario iniciar sesi\xF3n.",
    "optionsFileRules": "Reglas de archivo",
    "optionsFilenamePattern": "Formato de nombre de archivo",
    "optionsFilenamePatternLocked": "Free utiliza un nombre de archivo predeterminado. Pro te permite configurar tu propio formato.",
    "optionsSavePathPattern": "Ruta de subcarpeta",
    "optionsSavePathTokens": "Ejemplos: Bandeja de entrada/{date} \xB7 Threads/{author}",
    "optionsSavePathLocked": "Free guarda en la ra\xEDz de su carpeta conectada. Pro le permite ordenar autom\xE1ticamente en subcarpetas por fecha, autor o tema.",
    "optionsFilenameTokens": "Disponibles: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
    "optionsAiSection": "Organizaci\xF3n de IA",
    "optionsAiSubtitle": "Elija un proveedor y la base predeterminada URL y el modelo se completar\xE1n autom\xE1ticamente.",
    "optionsAiQuickstart": "La mayor\xEDa de los usuarios s\xF3lo necesitan un proveedor y una clave API. Despu\xE9s de cambiarlos, presione Guardar configuraci\xF3n a continuaci\xF3n para aplicarlos.",
    "optionsAiAdvancedSummary": "Mostrar configuraci\xF3n avanzada",
    "optionsAiEnable": "Habilitar la organizaci\xF3n de IA",
    "optionsAiProvider": "Provider",
    "optionsAiProviderHint": "OpenAI, OpenRouter, DeepSeek, Gemini y Ollama pueden comenzar desde ajustes preestablecidos. Personalizado es para cualquier punto final compatible con OpenAI.",
    "optionsAiProviderOpenAi": "OpenAI",
    "optionsAiProviderOpenRouter": "enrutador abierto",
    "optionsAiProviderDeepSeek": "DeepSeek",
    "optionsAiProviderGemini": "Gemini",
    "optionsAiProviderOllama": "Ollama",
    "optionsAiProviderCustom": "personalizado",
    "optionsAiApiKey": "Tecla API",
    "optionsAiApiKeyHint": "Las claves Gemini generalmente comienzan con AIza, mientras que las teclas OpenAI/OpenRouter/DeepSeek generalmente comienzan con sk-. Deje este espacio en blanco solo para puntos finales locales como Ollama cuando no se requiere ninguna clave.",
    "optionsAiApiKeyRequired": "El proveedor seleccionado requiere una clave API.",
    "optionsAiKeyMismatchGemini": "Gemini necesita una clave de Google Gemini API. La clave actual parece una clave compatible con OpenAI.",
    "optionsAiKeyMismatchOpenAi": "Los proveedores OpenAI/OpenRouter/DeepSeek requieren su propia clave, no una clave Gemini que comience con AIza.",
    "optionsAiBaseUrl": "Base URL",
    "optionsAiBaseUrlHint": "Ejemplos: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
    "optionsAiModel": "Nombre del modelo",
    "optionsAiModelHint": "Ejemplos: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
    "optionsAiPrompt": "Aviso de organizaci\xF3n",
    "optionsAiPromptHint": "Describe la longitud de tu resumen, el estilo de la etiqueta y los campos iniciales deseados.",
    "optionsAiLocked": "La organizaci\xF3n de IA solo est\xE1 disponible en Pro.",
    "optionsAiInvalidBaseUrl": "La base AI URL no es v\xE1lida.",
    "optionsAiPermissionDenied": "Se deneg\xF3 el permiso para el punto final de IA seleccionado, por lo que no se guardaron las configuraciones.",
    "optionsAiSaved": "Se guardaron la configuraci\xF3n de IA y el permiso del punto final.",
    "optionsIncludeImages": "Guardar im\xE1genes y archivos de v\xEDdeo",
    "optionsSave": "Guardar configuraci\xF3n",
    "optionsSaved": "Configuraci\xF3n guardada.",
    "optionsPendingSave": "Cambiado. Presione Guardar configuraci\xF3n a continuaci\xF3n para aplicarlo.",
    "optionsNoChanges": "A\xFAn no hay cambios.",
    "optionsStep1": "1. Conecte la carpeta Obsidian",
    "optionsStep2": "2. Primero intenta ahorrar gratis",
    "optionsStep3": "3. Activa Pro cuando quieras reglas u organizaci\xF3n de IA.",
    "mdImageLabel": "Imagen",
    "mdVideoLabel": "V\xEDdeo",
    "mdVideoThumbnailLabel": "Miniatura de v\xEDdeo",
    "mdVideoOnThreads": "Abierto el Threads",
    "mdSavedVideoFile": "Archivo de v\xEDdeo guardado",
    "mdReplySection": "Respuestas del autor",
    "mdReplyLabel": "Responder",
    "mdReplyImageLabel": "Imagen de respuesta",
    "mdUploadedMediaSection": "Medios cargados",
    "mdSource": "Fuente",
    "mdAuthor": "Autor",
    "mdPublishedAt": "Publicado en",
    "mdExternalLink": "Enlace externo",
    "mdWarning": "Advertencia",
    "mdSummary": "Resumen de IA",
    "warnImageAccessFailed": "Algunas im\xE1genes o videos no se pudieron guardar; Se mantuvieron los enlaces originales.",
    "warnImageDownloadOff": "El guardado de im\xE1genes/v\xEDdeo est\xE1 desactivado; Se mantuvieron los enlaces originales.",
    "warnAiFailed": "La organizaci\xF3n de la IA fall\xF3, por lo que se guard\xF3 la nota original: {reason}",
    "warnAiPermissionMissing": "Falta el permiso del punto final de AI, por lo que se guard\xF3 la nota original. Vuelva a guardar la secci\xF3n AI en la configuraci\xF3n.",
    "warnAiMissingModel": "No se configur\xF3 ning\xFAn nombre de modelo de IA, por lo que se guard\xF3 la nota original.",
    "warnNotionMediaUploadFailed": "La carga de medios Notion fall\xF3, por lo que se guardaron enlaces remotos.",
    "errBrowserUnsupported": "Este navegador no puede guardar directamente en una carpeta Obsidian.",
    "errFolderNameFailed": "No se pudo determinar el nombre de una carpeta para guardar.",
    "errInvalidPath": "Ruta de archivo no v\xE1lida.",
    "errNotionTokenMissing": "No hay ning\xFAn token de integraci\xF3n Notion configurado.",
    "errNotionPermissionMissing": "Falta el permiso para Notion API. Vuelva a guardar la configuraci\xF3n primero.",
    "errNotionUnauthorized": "El token Notion no es v\xE1lido o ha caducado.",
    "errNotionForbidden": "Esta integraci\xF3n no puede acceder al destino Notion seleccionado. Aseg\xFArese de que la p\xE1gina o fuente de datos se comparta con la integraci\xF3n.",
    "errNotionParentNotFound": "No se pudo encontrar la p\xE1gina Notion o la fuente de datos seleccionada. Verifique el ID y la conexi\xF3n.",
    "errNotionRateLimited": "Demasiadas solicitudes Notion. Int\xE9ntalo de nuevo en {seconds} segundos.",
    "errNotionValidation": "La solicitud Notion no es v\xE1lida.",
    "errNotionRequestFailed": "La solicitud de guardar Notion fall\xF3.",
    "fallbackNoFolder": "Ninguna carpeta conectada,",
    "fallbackPermissionDenied": "Sin permiso de carpeta,",
    "fallbackDirectFailed": "No se pudo guardar en la carpeta,",
    "fallbackZipMessage": "guardado como descarga en su lugar.",
    "errNotPermalink": "Primero abra una p\xE1gina de publicaci\xF3n individual.",
    "errPostContentNotFound": "No se pudo cargar el contenido de la publicaci\xF3n. Por favor aseg\xFArese de haber iniciado sesi\xF3n."
  },
  "zh-TW": {
    "uiLanguageLabel": "\u8A9E\u8A00",
    "uiLanguageKo": "\uD55C\uAD6D\uC5B4",
    "uiLanguageEn": "\u82F1\u8A9E",
    "popupTitle": "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
    "popupSave": "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
    "popupSettings": "\u8A2D\u5B9A",
    "popupPromoTitle": "\u4FDD\u7559\u5340",
    "popupPromoDescription": "\u8A72\u7A7A\u9593\u662F\u70BA\u672A\u4F86\u7684\u6307\u5C0E\u548C\u5EFA\u8B70\u4FDD\u7559\u7684\u3002",
    "popupSubtitleDirect": "\u76F4\u63A5\u5132\u5B58\u5230\u9023\u63A5\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
    "popupSubtitleDownload": "\u672A\u9023\u63A5\u8CC7\u6599\u593E\u3002\u53E6\u5B58\u70BA\u4E0B\u8F09\u3002\u5728\u8A2D\u5B9A\u4E2D\u9023\u63A5\u8CC7\u6599\u593E\u3002",
    "popupSubtitleConnected": "\u76F4\u63A5\u5132\u5B58\u5230\u9023\u63A5\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
    "popupSubtitlePermissionCheck": "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\uFF0C\u4F46\u53EF\u80FD\u9700\u8981\u91CD\u65B0\u78BA\u8A8D\u6B0A\u9650\u3002",
    "popupSubtitleNoFolder": "\u9023\u63A5\u8CC7\u6599\u593E\u6642\u76F4\u63A5\u5132\u5B58\uFF0C\u5426\u5247\u4E0B\u8F09\u6A94\u6848\u3002",
    "popupSubtitleUnsupported": "\u8A72\u700F\u89BD\u5668\u50C5\u652F\u63F4\u6587\u4EF6\u4E0B\u8F09\u3002",
    "popupSubtitleNotion": "\u5132\u5B58\u5230\u60A8\u914D\u7F6E\u7684 Notion \u76EE\u6A19\u3002",
    "popupSubtitleNotionSetup": "\u82E5\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u8ACB\u5148\u5728\u8A2D\u5B9A\u4E2D\u8F38\u5165\u60A8\u7684\u4EE4\u724C\u548C\u76EE\u7684\u5730\u3002",
    "popupRecentSaves": "\u6700\u8FD1\u4FDD\u5B58",
    "popupClearAll": "\u5168\u90E8\u6E05\u9664",
    "popupEmpty": "\u9084\u6C92\u6709\u5132\u5B58\u7684\u8CBC\u6587\u3002",
    "popupResave": "\u91CD\u65B0\u5132\u5B58",
    "popupExpand": "\u5C55\u958B",
    "popupCollapse": "\u5D29\u6F70",
    "popupDelete": "\u522A\u9664",
    "statusReady": "\u6E96\u5099\u5F9E\u5E16\u5B50\u6C38\u4E45\u9023\u7D50\u9801\u9762\u4E2D\u4FDD\u5B58\u3002",
    "statusReadyDirect": "\u6E96\u5099\u597D\u4E86\u3002\u6309 \u76F4\u63A5\u5132\u5B58\u5230\u60A8\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
    "statusReadyDownload": "\u6E96\u5099\u597D\u4E86\u3002\u6309 \u4E0B\u8F09\u6A94\u6848\u3002",
    "statusUnsupported": "\u8ACB\u5148\u958B\u555F\u500B\u4EBA\u8CBC\u6587\u9801\u9762\u3002",
    "statusNoTab": "\u627E\u4E0D\u5230\u6D3B\u52D5\u9078\u9805\u5361\u3002",
    "statusSaving": "\u6B63\u5728\u5132\u5B58...",
    "statusSavedDirect": "\u76F4\u63A5\u5132\u5B58\u5230\u60A8\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
    "statusSavedZip": "\u5DF2\u5132\u5B58\u3002\u4E0B\u8F09\u958B\u59CB\u3002",
    "statusSavedNotion": "\u5132\u5B58\u5230 Notion\u3002",
    "statusDuplicate": "\u5DF2\u5132\u5B58 \u2014 \u5DF2\u66F4\u65B0\u70BA\u6700\u65B0\u5167\u5BB9\u3002",
    "statusDuplicateWarning": "\u5DF2\u5132\u5B58\uFF0C\u5DF2\u66F4\u65B0\uFF1A",
    "statusAlreadySaved": "\u9019\u7BC7\u6587\u7AE0\u5DF2\u7D93\u5132\u5B58\u4E86\u3002\u4F7F\u7528\u6700\u8FD1\u5132\u5B58\u7684\u300C\u91CD\u65B0\u5132\u5B58\u300D\u518D\u6B21\u5132\u5B58\u3002",
    "statusNotionSetupRequired": "\u82E5\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u8ACB\u5148\u5728\u8A2D\u5B9A\u4E2D\u8F38\u5165\u60A8\u7684\u4EE4\u724C\u548C\u76EE\u7684\u5730\u3002",
    "statusError": "\u767C\u751F\u672A\u77E5\u932F\u8AA4\u3002",
    "statusResaving": "\u6B63\u5728\u6E96\u5099\u60A8\u7684\u6587\u4EF6...",
    "statusResaved": "\u4E0B\u8F09\u958B\u59CB\u3002",
    "statusResavedNotion": "\u4F5C\u70BA\u65B0\u9801\u9762\u5132\u5B58\u5230 Notion\u3002",
    "statusRecentNotFound": "\u627E\u4E0D\u5230\u6700\u8FD1\u7684\u4FDD\u5B58\u8A18\u9304\u3002",
    "statusDeletedRecent": "\u5F9E\u6700\u8FD1\u7684\u4FDD\u5B58\u4E2D\u522A\u9664\u3002",
    "statusClearedRecents": "\u6240\u6709\u6700\u8FD1\u7684\u4FDD\u5B58\u90FD\u88AB\u6E05\u9664\u3002",
    "statusExtractFailed": "\u7121\u6CD5\u95B1\u8B80\u8A72\u8CBC\u6587\u3002",
    "statusTabError": "\u7121\u6CD5\u8B80\u53D6\u6D3B\u52D5\u9078\u9805\u5361\u8CC7\u8A0A\u3002",
    "statusRedownloadError": "\u91CD\u65B0\u4E0B\u8F09\u6642\u767C\u751F\u932F\u8AA4\u3002",
    "statusRetry": "\u91CD\u8A66",
    "statusResaveButton": "\u91CD\u65B0\u5132\u5B58",
    "optionsTitle": "\u5C07 Threads \u8CBC\u6587\u5132\u5B58\u5230 Obsidian \u6216 Notion\uFF0C\u4E26\u81EA\u52D5\u6574\u7406\u3002",
    "optionsTitleObsidianOnly": "\u5C07 Threads \u8CBC\u6587\u5132\u5B58\u5230 Obsidian\uFF0C\u4E26\u81EA\u52D5\u7D44\u7E54\u3002",
    "optionsSubtitle": "Free \u5132\u5B58\uFF0CPro \u50C5\u5728\u9700\u8981\u6642\u5132\u5B58\u3002",
    "optionsSubtitleObsidianOnly": "\u9762\u5411\u767C\u5E03\u7684\u6587\u4EF6\u4ECD\u7136\u63CF\u8FF0\u767C\u5E03\u7522\u54C1\uFF0C\u4F46\u76EE\u524D\u7684 UI \u50C5\u516C\u958B Obsidian\u3002",
    "optionsPlanSpotlightFreeTitle": "ZZ\u8853\u8A9E0ZZ",
    "optionsPlanSpotlightFreeCopy": "\u57FA\u672C\u4FDD\u5B58\u5373\u53EF\u4F7F\u7528\u3002",
    "optionsPlanSpotlightActiveTitle": "Pro \u6D3B\u8E8D",
    "optionsPlanSpotlightActiveCopy": "\u6B64\u700F\u89BD\u5668\u555F\u7528\u4E86 Pro \u529F\u80FD\u3002",
    "optionsPlanSpotlightNeedsActivationTitle": "Pro \u9700\u8981\u6FC0\u6D3B",
    "optionsPlanSpotlightNeedsActivationCopy": "\u5BC6\u9470\u6709\u6548\uFF0C\u4F46\u8A72\u8A2D\u5099\u5C1A\u7121\u6D3B\u52D5\u5E2D\u4F4D\u3002",
    "optionsPlanSpotlightSeatMeta": "\u5E2D\u6B21 {used}/{limit} \xB7 {device}",
    "optionsAdSlotLabel": "\u5EE3\u544A",
    "optionsAdSlotTitle": "\u5EE3\u544A\u4F54\u4F4D\u7B26",
    "optionsAdSlotCopy": "\u4FDD\u7559\u7528\u65BC\u672A\u4F86\u7684\u6A6B\u5E45\u6216\u516C\u544A\u3002",
    "optionsFolderSection": "\u9023\u63A5 Obsidian \u8CC7\u6599\u593E",
    "optionsFolderStatus": "\u6B63\u5728\u6AA2\u67E5\u9023\u63A5\u7684\u8CC7\u6599\u593E...",
    "optionsFolderLabel": "\u76EE\u524D\u8CC7\u6599\u593E",
    "optionsFolderNotConnected": "\u672A\u9023\u63A5",
    "optionsFolderConnect": "\u9023\u63A5\u8CC7\u6599\u593E",
    "optionsFolderDisconnect": "\u65B7\u958B\u9023\u63A5",
    "optionsFolderUnsupported": "\u8A72\u700F\u89BD\u5668\u4E0D\u652F\u63F4\u8CC7\u6599\u593E\u9023\u63A5",
    "optionsFolderUnsupportedStatus": "\u6B64\u700F\u89BD\u5668\u7121\u6CD5\u76F4\u63A5\u5132\u5B58\u5230\u8CC7\u6599\u593E\u3002\u5C07\u6539\u70BA\u4E0B\u8F09\u6A94\u6848\u3002",
    "optionsFolderNotConnectedStatus": "\u672A\u9023\u63A5\u8CC7\u6599\u593E\u3002\u5132\u5B58\u6642\u5C07\u4E0B\u8F09\u6A94\u6848\u3002",
    "optionsFolderReady": "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\u3002\u6587\u4EF6\u5C07\u76F4\u63A5\u4FDD\u5B58\u3002",
    "optionsFolderPermissionCheck": "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\u3002\u53EF\u4EE5\u5728\u4E0B\u6B21\u5132\u5B58\u6642\u91CD\u65B0\u78BA\u8A8D\u6B0A\u9650\u3002",
    "optionsFolderPermissionLost": "\u8CC7\u6599\u593E\u6B0A\u9650\u907A\u5931\u3002\u8ACB\u91CD\u65B0\u9023\u63A5\u60A8\u7684\u8CC7\u6599\u593E\u3002",
    "optionsFolderChecked": "\u8CC7\u6599\u593E\u9023\u63A5\u5DF2\u9A57\u8B49\u3002\u5C07\u5617\u8A66\u76F4\u63A5\u5132\u5B58\u3002",
    "optionsFolderCancelled": "\u8CC7\u6599\u593E\u9078\u64C7\u5DF2\u53D6\u6D88\u3002",
    "optionsFolderError": "\u9023\u63A5\u8CC7\u6599\u593E\u6642\u767C\u751F\u932F\u8AA4\u3002",
    "optionsFolderConnectedSuccess": "\u9023\u63A5\u201C{folder}\u201D\u8CC7\u6599\u593E\u3002",
    "optionsFolderPathLabel": "\u76EE\u524D\u5132\u5B58\u4F4D\u7F6E",
    "optionsFolderPathHint": "\u700F\u89BD\u5668\u7121\u6CD5\u516C\u958B\u4F5C\u696D\u7CFB\u7D71\u7D55\u5C0D\u8DEF\u5F91\uFF0C\u56E0\u6B64\u8A72\u8DEF\u5F91\u4FDD\u6301\u76F8\u5C0D\u65BC\u9023\u7DDA\u7684\u8CC7\u6599\u593E\u3002",
    "optionsFolderPathUnavailable": "\u9023\u63A5\u8CC7\u6599\u593E\u5F8C\u986F\u793A",
    "optionsSaveTarget": "\u4FDD\u5B58\u76EE\u6A19",
    "optionsSaveTargetHint": "\u5728 PC \u4E0A\uFF0C\u9078\u64C7 Obsidian \u6216 Notion \u4F5C\u70BA\u9810\u8A2D\u76EE\u6A19\u3002",
    "optionsSaveTargetHintObsidianOnly": "\u76EE\u524D UI \u50C5\u516C\u958B Obsidian\u3002\u5728\u5167\u90E8\u6E96\u5099\u6574\u5408\u6642\uFF0CNotion \u5728\u8A2D\u5B9A\u4E2D\u4FDD\u6301\u96B1\u85CF\u72C0\u614B\u3002",
    "optionsSaveTargetObsidian": "ZZ\u8853\u8A9E0ZZ",
    "optionsSaveTargetNotion": "ZZ\u8853\u8A9E0ZZ",
    "optionsSaveTargetNotionHidden": "Notion\uFF08\u66AB\u6642\u96B1\u85CF\uFF09",
    "optionsNotionSection": "Notion \u9023\u63A5",
    "optionsNotionSubtitle": "Notion \u900F\u904E OAuth \u9023\u63A5\uFF0C\u56E0\u6B64\u700F\u89BD\u5668\u5F9E\u4E0D\u8981\u6C42\u5167\u90E8\u4EE4\u724C\u3002\u9023\u63A5\u4E00\u6B21\uFF0C\u9078\u64C7\u9810\u8A2D\u76EE\u7684\u5730\uFF0C\u7136\u5F8C\u5132\u5B58\u3002",
    "optionsNotionConnectionLabel": "\u9023\u63A5\u65B9\u5F0F",
    "optionsNotionConnectButton": "\u9023\u63A5 Notion",
    "optionsNotionDisconnectButton": "\u65B7\u958B\u9023\u63A5",
    "optionsNotionConnectHint": "\u5C07\u958B\u555F Notion \u6279\u51C6\u9078\u9805\u5361\u3002\u5BE9\u6838\u901A\u904E\u5F8C\uFF0C\u8FD4\u56DE\u6B64\u8655\uFF0C\u9023\u7DDA\u72C0\u614B\u6703\u81EA\u52D5\u5237\u65B0\u3002",
    "optionsNotionConnected": "Notion \u5DE5\u4F5C\u5340\u5DF2\u9023\u7DDA\u3002",
    "optionsNotionDisconnected": "Notion \u5C1A\u672A\u9023\u7DDA\u3002",
    "optionsNotionConnectStarted": "\u958B\u555F Notion \u9023\u7DDA\u6A19\u7C64\u3002\u6279\u51C6\u5F8C\u8FD4\u56DE\u6B64\u8655\u3002",
    "optionsNotionConnectFailed": "\u7121\u6CD5\u555F\u52D5 Notion \u9023\u7DDA\u6D41\u3002",
    "optionsNotionDisconnectedSaved": "\u5DF2\u4E2D\u65B7 Notion \u5DE5\u4F5C\u5340\u7684\u9023\u7DDA\u3002",
    "optionsNotionDisconnectFailed": "\u7121\u6CD5\u65B7\u958B Notion \u7684\u9023\u7DDA\u3002",
    "optionsNotionParentType": "\u5132\u5B58\u6A21\u5F0F",
    "optionsNotionParentTypeHint": "\u9078\u64C7\u9810\u8A2D\u76EE\u6A19\u662F\u9023\u7DDA\u7684\u5DE5\u4F5C\u5340\u4E2D\u7684\u9801\u9762\u9084\u662F\u8CC7\u6599\u4F86\u6E90\u3002",
    "optionsNotionParentTypePage": "\u7236\u9801\u9762",
    "optionsNotionParentTypeDataSource": "\u6578\u64DA\u4F86\u6E90",
    "optionsNotionSelectedTarget": "\u9810\u8A2D\u76EE\u7684\u5730",
    "optionsNotionSelectedTargetHint": "\u9810\u8A2D\u60C5\u6CC1\u4E0B\uFF0C\u5132\u5B58\u6309\u9215\u5C07\u5728\u6B64\u8655\u767C\u9001\u65B0\u7684 Threads \u64F7\u53D6\u3002",
    "optionsNotionTargetNotSelected": "\u5C1A\u672A\u9078\u64C7\u9810\u8A2D\u76EE\u7684\u5730\u3002",
    "optionsNotionTargetRequired": "\u9996\u5148\u9078\u64C7\u9810\u8A2D\u7684 Notion \u76EE\u7684\u5730\u3002",
    "optionsNotionTargetSaved": "\u5DF2\u5132\u5B58\u9810\u8A2D Notion \u76EE\u7684\u5730\u3002",
    "optionsNotionTargetSaveFailed": "\u7121\u6CD5\u5132\u5B58\u9810\u8A2D Notion \u76EE\u7684\u5730\u3002",
    "optionsNotionSearchLabel": "\u5C0B\u627E\u76EE\u7684\u5730",
    "optionsNotionSearchHint": "\u641C\u5C0B\u60A8\u5DF2\u6388\u4E88\u6B64\u6574\u5408\u5B58\u53D6\u6B0A\u9650\u7684\u9801\u9762\u6216\u8CC7\u6599\u4F86\u6E90\u3002",
    "optionsNotionSearchPlaceholderPage": "\u4F8B\u5982\uFF1AProduct \u8A3B\u91CB",
    "optionsNotionSearchPlaceholderDataSource": "\u4F8B\u5982\uFF1AThreads \u6536\u4EF6\u5323",
    "optionsNotionSearchButton": "\u641C\u5C0B\u76EE\u7684\u5730",
    "optionsNotionResultsLabel": "\u7D50\u679C",
    "optionsNotionResultsHint": "\u9078\u64C7\u4E00\u500B\u7D50\u679C\u4E26\u5C07\u5176\u8A2D\u5B9A\u70BA\u9810\u8A2D\u5132\u5B58\u76EE\u7684\u5730\u3002",
    "optionsNotionUseLocationButton": "\u7528\u4F5C\u9810\u8A2D\u76EE\u7684\u5730",
    "optionsNotionSearchLoaded": "\u5DF2\u8F09\u5165 Notion \u76EE\u7684\u5730\u3002",
    "optionsNotionSearchEmpty": "\u672A\u627E\u5230\u76F8\u7B26\u7684 Notion \u76EE\u7684\u5730\u3002",
    "optionsNotionSearchFailed": "\u7121\u6CD5\u8F09\u5165 Notion \u76EE\u7684\u5730\u3002",
    "optionsNotionOAuthRequiresPro": "Notion OAuth \u4FDD\u5B58\u50C5\u5728 Pro \u4E2D\u53EF\u7528\u3002",
    "optionsNotionConnectFirst": "\u9996\u5148\u9023\u63A5 Notion\u3002",
    "optionsNotionToken": "\u7A4D\u5206\u4EE3\u5E63",
    "optionsNotionTokenHint": "\u8CBC\u4E0A\u60A8\u7684 Notion \u5167\u90E8\u6574\u5408\u4EE4\u724C\u3002\u5B83\u50C5\u5132\u5B58\u5728\u6B64\u700F\u89BD\u5668\u8A2D\u5B9A\u6A94\u4E2D\u3002",
    "optionsNotionParentPage": "\u7236\u9801\u9762 ID \u6216 URL",
    "optionsNotionParentPageHint": "\u60A8\u53EF\u4EE5\u8CBC\u4E0A\u5B8C\u6574\u7684 Notion \u9801\u9762 URL \u6216\u50C5\u8CBC\u4E0A\u9801\u9762 ID\u3002",
    "optionsNotionDataSource": "\u8CC7\u6599\u4F86\u6E90 ID \u6216 URL",
    "optionsNotionDataSourceHint": "\u8CBC\u4E0A\u5B8C\u6574\u7684 Notion \u8CC7\u6599\u4F86\u6E90 URL \u6216\u50C5\u8CBC\u4E0A\u5176 ID\u3002\u5982\u679C\u53EF\u80FD\uFF0C\u6A19\u984C\u3001\u6A19\u7C64\u3001\u65E5\u671F\u548C\u985E\u4F3C\u5C6C\u6027\u6703\u81EA\u52D5\u5C0D\u61C9\u3002",
    "optionsNotionDataSourceLocked": "\u8CC7\u6599\u4F86\u6E90\u4FDD\u5B58\u50C5\u5728 Pro \u4E2D\u53EF\u7528\u3002",
    "optionsNotionUploadMedia": "\u5C07\u5A92\u9AD4\u4E0A\u50B3\u5230 Notion",
    "optionsNotionUploadMediaHint": "\u5C07\u5716\u50CF\u548C\u5F71\u7247\u4E0A\u50B3\u70BA Notion \u7BA1\u7406\u7684\u6587\u4EF6\uFF0C\u800C\u4E0D\u662F\u5C07\u5176\u4FDD\u7559\u70BA\u9060\u7AEF\u9023\u7D50\u3002\u5982\u679C\u4E0A\u50B3\u5931\u6557\uFF0C\u5132\u5B58\u5C07\u56DE\u9000\u5230\u9023\u7D50\u3002",
    "optionsNotionUploadMediaLocked": "Notion \u7BA1\u7406\u7684\u5A92\u9AD4\u4E0A\u50B3\u50C5\u5728 Pro \u4E2D\u53EF\u7528\u3002",
    "optionsNotionTokenRequired": "\u9700\u8981 Notion \u6574\u5408\u4EE4\u724C\u624D\u80FD\u4F7F\u7528 Notion \u5132\u5B58\u3002",
    "optionsNotionParentPageRequired": "\u82E5\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u9700\u8981 Notion \u7236\u9801\u9762 ID \u6216 URL\u3002",
    "optionsNotionInvalidPage": "Notion \u7236\u9801 ID \u6216 URL \u683C\u5F0F\u7121\u6548\u3002",
    "optionsNotionDataSourceRequired": "\u82E5\u8981\u4F7F\u7528\u8CC7\u6599\u4F86\u6E90\u5132\u5B58\uFF0C\u9700\u8981 Notion \u8CC7\u6599\u4F86\u6E90 ID \u6216 URL\u3002",
    "optionsNotionInvalidDataSource": "Notion \u8CC7\u6599\u4F86\u6E90 ID \u6216 URL \u683C\u5F0F\u7121\u6548\u3002",
    "optionsNotionPermissionDenied": "\u5B58\u53D6 Notion API \u7684\u6B0A\u9650\u88AB\u62D2\u7D55\uFF0C\u56E0\u6B64\u672A\u5132\u5B58\u8A2D\u5B9A\u3002",
    "optionsBasicSection": "\u57FA\u672C\u5132\u84C4",
    "optionsBasicSubtitle": "",
    "optionsCompareSection": "Free \u8207 Pro",
    "optionsProSection": "Pro \u8A2D\u5B9A",
    "optionsProSubtitle": "\u50C5\u5728\u9700\u8981\u6642\u958B\u555F\u3002\u9019\u5C31\u662F\u898F\u5247\u548C\u4EBA\u5DE5\u667A\u6167\u7D44\u7E54\u5B58\u5728\u7684\u5730\u65B9\u3002",
    "optionsProAiNote": "AI \u4E0D\u6703\u81EA\u52D5\u5305\u542B\u5728\u5167\u3002\u5B83\u50C5\u5728\u60A8\u65B0\u589E\u81EA\u5DF1\u7684 API \u91D1\u9470\u5F8C\u904B\u884C\u3002",
    "optionsProCompareFree": "ZZ\u8853\u8A9E0ZZ",
    "optionsProComparePro": "ZZ\u8853\u8A9E0ZZ",
    "compareRowSave": "\u5132\u5B58",
    "compareRowImages": "\u5716\u7247",
    "compareRowReplies": "\u8A71\u984C\u56DE\u8986",
    "compareRowDuplicates": "\u8DF3\u904E\u91CD\u8907\u9805",
    "compareRowFilename": "\u6A94\u6848\u540D\u7A31\u683C\u5F0F",
    "compareRowFolder": "\u5132\u5B58\u8CC7\u6599\u593E",
    "compareRowNotionDataSource": "Notion \u8CC7\u6599\u4F86\u6E90",
    "compareRowNotionMediaUpload": "Notion \u5A92\u9AD4\u4E0A\u50B3",
    "compareRowAiSummary": "AI\u7E3D\u7D50",
    "compareRowAiTags": "\u4EBA\u5DE5\u667A\u6167\u6A19\u7C64",
    "compareRowAiFrontmatter": "\u4EBA\u5DE5\u667A\u6167\u524D\u6CBF\u554F\u984C",
    "optionsProBadgeFree": "ZZ\u8853\u8A9E0ZZ",
    "optionsProBadgeActive": "ZZ\u8853\u8A9E0ZZ",
    "optionsProStatusFree": "\u60A8\u6B63\u5728\u4F7F\u7528 Free\u3002\u4FDD\u5B58\u5DF2\u7D93\u53EF\u4EE5\u4E86\uFF0C\u53EA\u6709\u7576\u4F60\u9700\u8981\u898F\u5247\u6216AI\u6642\u624D\u9700\u8981Pro\u3002",
    "optionsProStatusActive": "Pro \u5DF2\u555F\u52D5\u3002\u4E0B\u9762\u63D0\u4F9B\u4E86\u57FA\u65BC\u898F\u5247\u7684\u7D44\u7E54\u548C\u4EBA\u5DE5\u667A\u6167\u3002",
    "optionsProStatusExpired": "\u6B64 Pro \u5BC6\u9470\u5DF2\u904E\u671F\u3002 Free \u4FDD\u5B58\u4ECD\u7136\u6709\u6548\u3002",
    "optionsProStatusInvalid": "\u6B64 Pro \u5BC6\u9470\u7121\u6548\u3002 Free \u4FDD\u5B58\u4ECD\u7136\u6709\u6548\u3002",
    "optionsProStatusSeatLimit": "\u6B64 Pro \u5BC6\u9470\u5DF2\u5728 3 \u500B\u88DD\u7F6E\u4E0A\u8655\u65BC\u6D3B\u52D5\u72C0\u614B\u3002\u9996\u5148\u5728\u53E6\u4E00\u53F0\u8A2D\u5099\u4E0A\u91CB\u653E\u4E00\u500B\u3002",
    "optionsProStatusNeedsActivation": "Pro \u5BC6\u9470\u6709\u6548\uFF0C\u4F46\u8A72\u8A2D\u5099\u5C1A\u7121\u6D3B\u52D5\u5E2D\u4F4D\u3002",
    "optionsProStatusOffline": "\u7121\u6CD5\u5230\u9054\u4F3A\u670D\u5668\uFF0C\u56E0\u6B64\u6B63\u5728\u4F7F\u7528\u6700\u65B0\u7684\u555F\u52D5\u72C0\u614B\u3002",
    "optionsProStatusRevoked": "\u6B64 Pro \u5BC6\u9470\u7121\u6CD5\u518D\u4F7F\u7528\u3002",
    "optionsProHolderLabel": "\u652F\u67B6",
    "optionsProExpiresLabel": "\u904E\u671F",
    "optionsProUnlockLabel": "Pro \u9375",
    "optionsProUnlockHint": "\u8CBC\u4E0A\u8CFC\u8CB7\u96FB\u5B50\u90F5\u4EF6\u4E2D\u7684 Pro \u91D1\u9470\u4EE5\u5728\u6B64\u700F\u89BD\u5668\u4E0A\u555F\u52D5\u3002",
    "optionsProUnlockPlaceholder": "\u5C07\u60A8\u7684 Pro \u91D1\u9470\u8CBC\u5230\u6B64\u8655",
    "optionsProSalesLink": "\u53D6\u5F97 Pro",
    "optionsProActivate": "\u555F\u52D5 Pro",
    "optionsProClear": "\u522A\u9664",
    "optionsProActivated": "Pro \u5DF2\u555F\u52D5\u3002",
    "optionsProRemoved": "Pro \u91D1\u9470\u5DF2\u88AB\u522A\u9664\u3002",
    "optionsProEmptyKey": "\u9996\u5148\u8F38\u5165 Pro \u9375\u3002",
    "optionsProLocalOnly": "\u60A8\u7684\u8CBC\u6587\u6703\u4FDD\u7559\u5728\u60A8\u7684\u88DD\u7F6E\u4E0A\u3002\u7121\u9700\u767B\u5165\u3002",
    "optionsFileRules": "\u6587\u4EF6\u898F\u5247",
    "optionsFilenamePattern": "\u6A94\u6848\u540D\u7A31\u683C\u5F0F",
    "optionsFilenamePatternLocked": "Free \u4F7F\u7528\u9810\u8A2D\u6A94\u540D\u3002 Pro \u5141\u8A31\u60A8\u8A2D\u5B9A\u81EA\u5DF1\u7684\u683C\u5F0F\u3002",
    "optionsSavePathPattern": "\u5B50\u8CC7\u6599\u593E\u8DEF\u5F91",
    "optionsSavePathTokens": "\u7BC4\u4F8B\uFF1A\u6536\u4EF6\u5323/{date} \xB7 Threads/{author}",
    "optionsSavePathLocked": "Free \u5132\u5B58\u5230\u9023\u63A5\u8CC7\u6599\u593E\u7684\u6839\u76EE\u9304\u3002 Pro \u53EF\u8B93\u60A8\u6309\u65E5\u671F\u3001\u4F5C\u8005\u6216\u4E3B\u984C\u81EA\u52D5\u5206\u985E\u5230\u5B50\u8CC7\u6599\u593E\u3002",
    "optionsFilenameTokens": "\u53EF\u7528\uFF1A{date}\u3001{author}\u3001{first_sentence}\u3001{first_sentence_20}\u3001{shortcode}",
    "optionsAiSection": "\u4EBA\u5DE5\u667A\u6167\u7D44\u7E54",
    "optionsAiSubtitle": "\u9078\u64C7\u4E00\u500B\u4F9B\u61C9\u5546\uFF0C\u9810\u8A2D\u57FA\u790E URL \u548C\u578B\u865F\u5C07\u70BA\u60A8\u586B\u5BEB\u3002",
    "optionsAiQuickstart": "\u5927\u591A\u6578\u7528\u6236\u53EA\u9700\u8981\u63D0\u4F9B\u8005\u548C API \u91D1\u9470\u3002\u66F4\u6539\u5F8C\uFF0C\u6309\u4E0B\u9762\u7684\u201C\u5132\u5B58\u8A2D\u5B9A\u201D\u4EE5\u5957\u7528\u5B83\u5011\u3002",
    "optionsAiAdvancedSummary": "\u986F\u793A\u9032\u968E\u8A2D\u5B9A",
    "optionsAiEnable": "\u555F\u7528\u4EBA\u5DE5\u667A\u6167\u7D44\u7E54",
    "optionsAiProvider": "Provider",
    "optionsAiProviderHint": "OpenAI\u3001OpenRouter\u3001DeepSeek\u3001Gemini \u548C Ollama \u53EF\u4EE5\u5F9E\u9810\u8A2D\u555F\u52D5\u3002\u81EA\u8A02\u9069\u7528\u65BC\u4EFB\u4F55 OpenAI \u76F8\u5BB9\u7AEF\u9EDE\u3002",
    "optionsAiProviderOpenAi": "ZZ\u8853\u8A9E0ZZ",
    "optionsAiProviderOpenRouter": "\u958B\u653E\u8DEF\u7531\u5668",
    "optionsAiProviderDeepSeek": "ZZ\u8853\u8A9E0ZZ",
    "optionsAiProviderGemini": "ZZ\u8853\u8A9E0ZZ",
    "optionsAiProviderOllama": "\u5967\u62C9\u99AC",
    "optionsAiProviderCustom": "\u5BA2\u88FD\u5316",
    "optionsAiApiKey": "API \u9375",
    "optionsAiApiKeyHint": "Gemini \u9375\u901A\u5E38\u4EE5 AIza \u958B\u982D\uFF0C\u800C OpenAI/OpenRouter/DeepSeek \u9375\u901A\u5E38\u4EE5 sk- \u958B\u982D\u3002\u50C5\u7576\u4E0D\u9700\u8981\u91D1\u9470\u6642\uFF0C\u5C0D\u65BC Ollama \u7B49\u672C\u5730\u7AEF\u9EDE\uFF0C\u8ACB\u5C07\u6B64\u6B04\u4F4D\u7559\u7A7A\u3002",
    "optionsAiApiKeyRequired": "\u6240\u9078\u63D0\u4F9B\u8005\u9700\u8981 API \u91D1\u9470\u3002",
    "optionsAiKeyMismatchGemini": "Gemini \u9700\u8981 Google Gemini API \u91D1\u9470\u3002\u76EE\u524D\u5BC6\u9470\u770B\u8D77\u4F86\u50CF OpenAI \u76F8\u5BB9\u5BC6\u9470\u3002",
    "optionsAiKeyMismatchOpenAi": "OpenAI/OpenRouter/DeepSeek \u4F9B\u61C9\u5546\u9700\u8981\u81EA\u5DF1\u7684\u91D1\u9470\uFF0C\u800C\u4E0D\u662F\u4EE5 AIza \u958B\u982D\u7684 Gemini \u91D1\u9470\u3002",
    "optionsAiBaseUrl": "\u57FA\u790E URL",
    "optionsAiBaseUrlHint": "\u7BC4\u4F8B\uFF1A https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
    "optionsAiModel": "\u578B\u865F\u540D\u7A31",
    "optionsAiModelHint": "\u4F8B\uFF1Agpt-4.1-mini\xB7openai/gpt-4.1-mini\xB7llama3.2",
    "optionsAiPrompt": "\u7D44\u7E54\u63D0\u793A",
    "optionsAiPromptHint": "\u63CF\u8FF0\u60A8\u7684\u6458\u8981\u9577\u5EA6\u3001\u6A19\u7C64\u6A23\u5F0F\u548C\u6240\u9700\u7684 frontmatter \u6B04\u4F4D\u3002",
    "optionsAiLocked": "AI\u7D44\u7E54\u50C5\u5728Pro\u4E2D\u53EF\u7528\u3002",
    "optionsAiInvalidBaseUrl": "AI \u57FA\u790E URL \u7121\u6548\u3002",
    "optionsAiPermissionDenied": "\u6240\u9078 AI \u7AEF\u9EDE\u7684\u6B0A\u9650\u88AB\u62D2\u7D55\uFF0C\u56E0\u6B64\u672A\u5132\u5B58\u8A2D\u5B9A\u3002",
    "optionsAiSaved": "\u5DF2\u5132\u5B58 AI \u8A2D\u5B9A\u548C\u7AEF\u9EDE\u6B0A\u9650\u3002",
    "optionsIncludeImages": "\u4FDD\u5B58\u5716\u50CF\u548C\u8996\u8A0A\u6587\u4EF6",
    "optionsSave": "\u5132\u5B58\u8A2D\u5B9A",
    "optionsSaved": "\u8A2D\u5B9A\u5DF2\u5132\u5B58\u3002",
    "optionsPendingSave": "\u6539\u8B8A\u4E86\u3002\u6309\u4E0B\u9762\u7684\u201C\u5132\u5B58\u8A2D\u5B9A\u201D\u4EE5\u61C9\u7528\u5B83\u3002",
    "optionsNoChanges": "\u9084\u6C92\u6709\u4EFB\u4F55\u8B8A\u5316\u3002",
    "optionsStep1": "1.\u9023\u63A5Obsidian\u8CC7\u6599\u593E",
    "optionsStep2": "2.\u5148\u5617\u8A66\u514D\u8CBB\u5132\u5B58",
    "optionsStep3": "3. \u7576\u60A8\u9700\u8981\u898F\u5247\u6216AI\u7D44\u7E54\u6642\u555F\u52D5Pro",
    "mdImageLabel": "\u5716\u7247",
    "mdVideoLabel": "\u5F71\u7247",
    "mdVideoThumbnailLabel": "\u5F71\u7247\u7E2E\u5716",
    "mdVideoOnThreads": "\u65BC Threads \u958B\u653E",
    "mdSavedVideoFile": "\u5132\u5B58\u7684\u5F71\u7247\u6A94\u6848",
    "mdReplySection": "\u4F5C\u8005\u56DE\u590D",
    "mdReplyLabel": "\u56DE\u8986",
    "mdReplyImageLabel": "\u56DE\u8986\u5716\u7247",
    "mdUploadedMediaSection": "\u4E0A\u50B3\u7684\u5A92\u9AD4",
    "mdSource": "\u4F86\u6E90",
    "mdAuthor": "\u4F5C\u8005",
    "mdPublishedAt": "\u767C\u8868\u65BC",
    "mdExternalLink": "\u5916\u90E8\u9023\u7D50",
    "mdWarning": "\u8B66\u544A",
    "mdSummary": "\u4EBA\u5DE5\u667A\u6167\u7E3D\u7D50",
    "warnImageAccessFailed": "\u90E8\u5206\u5716\u7247\u6216\u5F71\u7247\u7121\u6CD5\u5132\u5B58\uFF1B\u4FDD\u7559\u539F\u59CB\u9023\u7D50\u3002",
    "warnImageDownloadOff": "\u5716\u50CF/\u8996\u8A0A\u4FDD\u5B58\u5DF2\u95DC\u9589\uFF1B\u4FDD\u7559\u539F\u59CB\u9023\u7D50\u3002",
    "warnAiFailed": "AI\u7D44\u7E54\u5931\u6557\uFF0C\u6240\u4EE5\u4FDD\u5B58\u4E86\u539F\u4F86\u7684\u7B46\u8A18\uFF1A{reason}",
    "warnAiPermissionMissing": "AI\u7AEF\u9EDE\u6B0A\u9650\u7F3A\u5931\uFF0C\u56E0\u6B64\u4FDD\u5B58\u4E86\u539F\u59CB\u7B46\u8A18\u3002\u91CD\u65B0\u5132\u5B58\u8A2D\u5B9A\u4E2D\u7684AI\u90E8\u5206\u3002",
    "warnAiMissingModel": "\u6C92\u6709\u914D\u7F6EAI\u6A21\u578B\u540D\u7A31\uFF0C\u56E0\u6B64\u5132\u5B58\u4E86\u539F\u59CB\u8A3B\u89E3\u3002",
    "warnNotionMediaUploadFailed": "Notion \u5A92\u9AD4\u4E0A\u50B3\u5931\u6557\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u9060\u7AEF\u9023\u7D50\u3002",
    "errBrowserUnsupported": "\u6B64\u700F\u89BD\u5668\u7121\u6CD5\u76F4\u63A5\u5132\u5B58\u5230 Obsidian \u8CC7\u6599\u593E\u3002",
    "errFolderNameFailed": "\u7121\u6CD5\u78BA\u5B9A\u5DF2\u5132\u5B58\u7684\u8CC7\u6599\u593E\u540D\u7A31\u3002",
    "errInvalidPath": "\u6587\u4EF6\u8DEF\u5F91\u7121\u6548\u3002",
    "errNotionTokenMissing": "\u672A\u914D\u7F6E Notion \u6574\u5408\u4EE4\u724C\u3002",
    "errNotionPermissionMissing": "\u7F3A\u5C11 Notion API \u7684\u6B0A\u9650\u3002\u9996\u5148\u91CD\u65B0\u5132\u5B58\u8A2D\u5B9A\u3002",
    "errNotionUnauthorized": "Notion \u4EE4\u724C\u7121\u6548\u6216\u5DF2\u904E\u671F\u3002",
    "errNotionForbidden": "\u6B64\u6574\u5408\u7121\u6CD5\u5B58\u53D6\u9078\u5B9A\u7684 Notion \u76EE\u6A19\u3002\u78BA\u4FDD\u9801\u9762\u6216\u8CC7\u6599\u4F86\u6E90\u8207\u6574\u5408\u5171\u7528\u3002",
    "errNotionParentNotFound": "\u627E\u4E0D\u5230\u6240\u9078\u7684 Notion \u9801\u9762\u6216\u8CC7\u6599\u4F86\u6E90\u3002\u6AA2\u67E5 ID \u548C\u9023\u7DDA\u3002",
    "errNotionRateLimited": "Notion \u8ACB\u6C42\u592A\u591A\u3002 {seconds} \u79D2\u5F8C\u518D\u8A66\u4E00\u6B21\u3002",
    "errNotionValidation": "Notion \u8ACB\u6C42\u7121\u6548\u3002",
    "errNotionRequestFailed": "Notion \u5132\u5B58\u8ACB\u6C42\u5931\u6557\u3002",
    "fallbackNoFolder": "\u6C92\u6709\u9023\u63A5\u8CC7\u6599\u593E\uFF0C",
    "fallbackPermissionDenied": "\u6C92\u6709\u8CC7\u6599\u593E\u6B0A\u9650\uFF0C",
    "fallbackDirectFailed": "\u7121\u6CD5\u5132\u5B58\u5230\u8CC7\u6599\u593E\uFF0C",
    "fallbackZipMessage": "\u53E6\u5B58\u70BA\u4E0B\u8F09\u3002",
    "errNotPermalink": "\u8ACB\u5148\u958B\u555F\u500B\u4EBA\u8CBC\u6587\u9801\u9762\u3002",
    "errPostContentNotFound": "\u7121\u6CD5\u8F09\u5165\u8CBC\u6587\u5167\u5BB9\u3002\u8ACB\u78BA\u4FDD\u60A8\u5DF2\u767B\u5165\u3002"
  },
  "vi": {
    "uiLanguageLabel": "Ng\xF4n ng\u1EEF",
    "uiLanguageKo": "\uD55C\uAD6D\uC5B4",
    "uiLanguageEn": "Ti\u1EBFng Anh",
    "popupTitle": "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
    "popupSave": "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
    "popupSettings": "C\xE0i \u0111\u1EB7t",
    "popupPromoTitle": "Khu v\u1EF1c d\xE0nh ri\xEAng",
    "popupPromoDescription": "Kh\xF4ng gian n\xE0y \u0111\u01B0\u1EE3c d\xE0nh ri\xEAng cho h\u01B0\u1EDBng d\u1EABn v\xE0 \u0111\u1EC1 xu\u1EA5t trong t\u01B0\u01A1ng lai.",
    "popupSubtitleDirect": "L\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i c\u1EE7a b\u1EA1n.",
    "popupSubtitleDownload": "Kh\xF4ng c\xF3 th\u01B0 m\u1EE5c n\xE0o \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. L\u01B0u d\u01B0\u1EDBi d\u1EA1ng t\u1EA3i xu\u1ED1ng. K\u1EBFt n\u1ED1i m\u1ED9t th\u01B0 m\u1EE5c trong c\xE0i \u0111\u1EB7t.",
    "popupSubtitleConnected": "L\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i c\u1EE7a b\u1EA1n.",
    "popupSubtitlePermissionCheck": "\u0110\xE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c nh\u01B0ng c\xF3 th\u1EC3 c\u1EA7n x\xE1c nh\u1EADn l\u1EA1i quy\u1EC1n.",
    "popupSubtitleNoFolder": "L\u01B0u tr\u1EF1c ti\u1EBFp khi th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i, n\u1EBFu kh\xF4ng th\xEC t\u1EA3i xu\u1ED1ng t\u1EC7p.",
    "popupSubtitleUnsupported": "Tr\xECnh duy\u1EC7t n\xE0y ch\u1EC9 h\u1ED7 tr\u1EE3 t\u1EA3i t\u1EADp tin.",
    "popupSubtitleNotion": "L\u01B0u v\xE0o \u0111\xEDch Notion \u0111\xE3 \u0111\u1ECBnh c\u1EA5u h\xECnh c\u1EE7a b\u1EA1n.",
    "popupSubtitleNotionSetup": "\u0110\u1EC3 s\u1EED d\u1EE5ng t\xEDnh n\u0103ng l\u01B0u Notion, tr\u01B0\u1EDBc ti\xEAn h\xE3y nh\u1EADp m\xE3 th\xF4ng b\xE1o v\xE0 \u0111\xEDch \u0111\u1EBFn c\u1EE7a b\u1EA1n v\xE0o c\xE0i \u0111\u1EB7t.",
    "popupRecentSaves": "L\u01B0u g\u1EA7n \u0111\xE2y",
    "popupClearAll": "X\xF3a t\u1EA5t c\u1EA3",
    "popupEmpty": "Ch\u01B0a c\xF3 b\xE0i vi\u1EBFt n\xE0o \u0111\u01B0\u1EE3c l\u01B0u.",
    "popupResave": "L\u01B0u l\u1EA1i",
    "popupExpand": "M\u1EDF r\u1ED9ng",
    "popupCollapse": "Thu g\u1ECDn",
    "popupDelete": "X\xF3a",
    "statusReady": "S\u1EB5n s\xE0ng l\u01B0u t\u1EEB m\u1ED9t trang li\xEAn k\u1EBFt c\u1ED1 \u0111\u1ECBnh.",
    "statusReadyDirect": "S\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian c\u1EE7a b\u1EA1n.",
    "statusReadyDownload": "S\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 t\u1EA3i t\u1EADp tin.",
    "statusUnsupported": "Vui l\xF2ng m\u1EDF m\u1ED9t trang b\xE0i vi\u1EBFt c\xE1 nh\xE2n tr\u01B0\u1EDBc.",
    "statusNoTab": "Kh\xF4ng th\u1EC3 t\xECm th\u1EA5y tab \u0111ang ho\u1EA1t \u0111\u1ED9ng.",
    "statusSaving": "\u0110ang l\u01B0u\u2026",
    "statusSavedDirect": "\u0110\u01B0\u1EE3c l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian c\u1EE7a b\u1EA1n.",
    "statusSavedZip": "\u0110\xE3 l\u01B0u. \u0110\xE3 b\u1EAFt \u0111\u1EA7u t\u1EA3i xu\u1ED1ng.",
    "statusSavedNotion": "\u0110\xE3 l\u01B0u v\xE0o Notion.",
    "statusDuplicate": "\u0110\xE3 l\u01B0u - \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt v\u1EDBi n\u1ED9i dung m\u1EDBi nh\u1EA5t.",
    "statusDuplicateWarning": "\u0110\xE3 l\u01B0u, c\u1EADp nh\u1EADt:",
    "statusAlreadySaved": "B\xE0i \u0111\u0103ng n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u. S\u1EED d\u1EE5ng 'L\u01B0u l\u1EA1i' t\u1EEB c\xE1c l\u1EA7n l\u01B0u g\u1EA7n \u0111\xE2y \u0111\u1EC3 l\u01B0u l\u1EA1i.",
    "statusNotionSetupRequired": "\u0110\u1EC3 s\u1EED d\u1EE5ng t\xEDnh n\u0103ng l\u01B0u Notion, tr\u01B0\u1EDBc ti\xEAn h\xE3y nh\u1EADp m\xE3 th\xF4ng b\xE1o v\xE0 \u0111\xEDch \u0111\u1EBFn c\u1EE7a b\u1EA1n v\xE0o c\xE0i \u0111\u1EB7t.",
    "statusError": "\u0110\xE3 x\u1EA3y ra l\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh.",
    "statusResaving": "\u0110ang chu\u1EA9n b\u1ECB t\u1EC7p c\u1EE7a b\u1EA1n\u2026",
    "statusResaved": "\u0110\xE3 b\u1EAFt \u0111\u1EA7u t\u1EA3i xu\u1ED1ng.",
    "statusResavedNotion": "\u0110\xE3 l\u01B0u v\xE0o Notion d\u01B0\u1EDBi d\u1EA1ng trang m\u1EDBi.",
    "statusRecentNotFound": "Kh\xF4ng th\u1EC3 t\xECm th\u1EA5y b\u1EA3n ghi l\u01B0u g\u1EA7n \u0111\xE2y.",
    "statusDeletedRecent": "\u0110\xE3 x\xF3a kh\u1ECFi c\xE1c l\u1EA7n l\u01B0u g\u1EA7n \u0111\xE2y.",
    "statusClearedRecents": "T\u1EA5t c\u1EA3 c\xE1c l\u1EA7n l\u01B0u g\u1EA7n \u0111\xE2y \u0111\xE3 b\u1ECB x\xF3a.",
    "statusExtractFailed": "Kh\xF4ng th\u1EC3 \u0111\u1ECDc b\xE0i vi\u1EBFt.",
    "statusTabError": "Kh\xF4ng th\u1EC3 \u0111\u1ECDc th\xF4ng tin tab ho\u1EA1t \u0111\u1ED9ng.",
    "statusRedownloadError": "L\u1ED7i khi t\u1EA3i l\u1EA1i.",
    "statusRetry": "Th\u1EED l\u1EA1i",
    "statusResaveButton": "L\u01B0u l\u1EA1i",
    "optionsTitle": "L\u01B0u c\xE1c b\xE0i \u0111\u0103ng Threads v\xE0o Obsidian ho\u1EB7c Notion v\u1EDBi t\xEDnh n\u0103ng t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp.",
    "optionsTitleObsidianOnly": "L\u01B0u b\xE0i \u0111\u0103ng Threads v\xE0o Obsidian v\u1EDBi t\xEDnh n\u0103ng t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp.",
    "optionsSubtitle": "L\u01B0u Free, ch\u1EC9 l\u01B0u Pro khi c\u1EA7n.",
    "optionsSubtitleObsidianOnly": "C\xE1c t\xE0i li\u1EC7u h\u01B0\u1EDBng t\u1EDBi b\u1EA3n ph\xE1t h\xE0nh v\u1EABn m\xF4 t\u1EA3 s\u1EA3n ph\u1EA9m ra m\u1EAFt nh\u01B0ng giao di\u1EC7n ng\u01B0\u1EDDi d\xF9ng hi\u1EC7n t\u1EA1i ch\u1EC9 hi\u1EC3n th\u1ECB Obsidian.",
    "optionsPlanSpotlightFreeTitle": "Free",
    "optionsPlanSpotlightFreeCopy": "Ti\u1EBFt ki\u1EC7m c\u01A1 b\u1EA3n \u0111\xE3 s\u1EB5n s\xE0ng \u0111\u1EC3 s\u1EED d\u1EE5ng.",
    "optionsPlanSpotlightActiveTitle": "Pro \u0111ang ho\u1EA1t \u0111\u1ED9ng",
    "optionsPlanSpotlightActiveCopy": "C\xE1c t\xEDnh n\u0103ng Pro \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t tr\xEAn tr\xECnh duy\u1EC7t n\xE0y.",
    "optionsPlanSpotlightNeedsActivationTitle": "Pro c\u1EA7n k\xEDch ho\u1EA1t",
    "optionsPlanSpotlightNeedsActivationCopy": "Ch\xECa kh\xF3a h\u1EE3p l\u1EC7 nh\u01B0ng thi\u1EBFt b\u1ECB n\xE0y ch\u01B0a c\xF3 ch\u1ED7 ho\u1EA1t \u0111\u1ED9ng.",
    "optionsPlanSpotlightSeatMeta": "Ch\u1ED7 ng\u1ED3i {used}/{limit} \xB7 {device}",
    "optionsAdSlotLabel": "Qu\u1EA3ng c\xE1o",
    "optionsAdSlotTitle": "Tr\xECnh gi\u1EEF ch\u1ED7 qu\u1EA3ng c\xE1o",
    "optionsAdSlotCopy": "D\xE0nh ri\xEAng cho bi\u1EC3u ng\u1EEF ho\u1EB7c th\xF4ng b\xE1o trong t\u01B0\u01A1ng lai.",
    "optionsFolderSection": "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian",
    "optionsFolderStatus": "\u0110ang ki\u1EC3m tra th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i\u2026",
    "optionsFolderLabel": "Th\u01B0 m\u1EE5c hi\u1EC7n t\u1EA1i",
    "optionsFolderNotConnected": "Kh\xF4ng \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i",
    "optionsFolderConnect": "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c",
    "optionsFolderDisconnect": "Ng\u1EAFt k\u1EBFt n\u1ED1i",
    "optionsFolderUnsupported": "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c kh\xF4ng \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3 trong tr\xECnh duy\u1EC7t n\xE0y",
    "optionsFolderUnsupportedStatus": "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng th\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o m\u1ED9t th\u01B0 m\u1EE5c. Thay v\xE0o \u0111\xF3, c\xE1c t\u1EADp tin s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng.",
    "optionsFolderNotConnectedStatus": "Kh\xF4ng c\xF3 th\u01B0 m\u1EE5c n\xE0o \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. C\xE1c t\u1EADp tin s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng khi b\u1EA1n l\u01B0u.",
    "optionsFolderReady": "\u0110\xE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c. C\xE1c t\u1EADp tin s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u tr\u1EF1c ti\u1EBFp.",
    "optionsFolderPermissionCheck": "\u0110\xE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c. Quy\u1EC1n c\xF3 th\u1EC3 \u0111\u01B0\u1EE3c x\xE1c nh\u1EADn l\u1EA1i v\xE0o l\u1EA7n l\u01B0u ti\u1EBFp theo.",
    "optionsFolderPermissionLost": "Quy\u1EC1n truy c\u1EADp th\u01B0 m\u1EE5c b\u1ECB m\u1EA5t. Vui l\xF2ng k\u1EBFt n\u1ED1i l\u1EA1i th\u01B0 m\u1EE5c c\u1EE7a b\u1EA1n.",
    "optionsFolderChecked": "\u0110\xE3 x\xE1c minh k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c. L\u01B0u tr\u1EF1c ti\u1EBFp s\u1EBD \u0111\u01B0\u1EE3c th\u1EED.",
    "optionsFolderCancelled": "L\u1EF1a ch\u1ECDn th\u01B0 m\u1EE5c \u0111\xE3 b\u1ECB h\u1EE7y.",
    "optionsFolderError": "L\u1ED7i k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c.",
    "optionsFolderConnectedSuccess": '\u0110\xE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c "{folder}".',
    "optionsFolderPathLabel": "V\u1ECB tr\xED l\u01B0u hi\u1EC7n t\u1EA1i",
    "optionsFolderPathHint": "Tr\xECnh duy\u1EC7t kh\xF4ng th\u1EC3 hi\u1EC3n th\u1ECB \u0111\u01B0\u1EDDng d\u1EABn tuy\u1EC7t \u0111\u1ED1i c\u1EE7a h\u1EC7 \u0111i\u1EC1u h\xE0nh, v\xEC v\u1EADy \u0111\u01B0\u1EDDng d\u1EABn n\xE0y v\u1EABn li\xEAn quan \u0111\u1EBFn th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
    "optionsFolderPathUnavailable": "Hi\u1EC3n th\u1ECB sau khi b\u1EA1n k\u1EBFt n\u1ED1i m\u1ED9t th\u01B0 m\u1EE5c",
    "optionsSaveTarget": "L\u01B0u m\u1EE5c ti\xEAu",
    "optionsSaveTargetHint": "Tr\xEAn PC, ch\u1ECDn Obsidian ho\u1EB7c Notion l\xE0m \u0111\xEDch m\u1EB7c \u0111\u1ECBnh.",
    "optionsSaveTargetHintObsidianOnly": "Giao di\u1EC7n ng\u01B0\u1EDDi d\xF9ng hi\u1EC7n t\u1EA1i ch\u1EC9 hi\u1EC3n th\u1ECB Obsidian. Notion v\u1EABn \u1EA9n trong c\xE0i \u0111\u1EB7t trong khi qu\xE1 tr\xECnh t\xEDch h\u1EE3p \u0111ang \u0111\u01B0\u1EE3c chu\u1EA9n b\u1ECB n\u1ED9i b\u1ED9.",
    "optionsSaveTargetObsidian": "Obsidian",
    "optionsSaveTargetNotion": "Notion",
    "optionsSaveTargetNotionHidden": "Notion (Hi\u1EC7n \u0111ang \u1EA9n)",
    "optionsNotionSection": "K\u1EBFt n\u1ED1i Notion",
    "optionsNotionSubtitle": "Notion \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i th\xF4ng qua OAuth n\xEAn tr\xECnh duy\u1EC7t kh\xF4ng bao gi\u1EDD y\xEAu c\u1EA7u m\xE3 th\xF4ng b\xE1o n\u1ED9i b\u1ED9. K\u1EBFt n\u1ED1i m\u1ED9t l\u1EA7n, ch\u1ECDn \u0111\xEDch m\u1EB7c \u0111\u1ECBnh v\xE0 l\u01B0u sau \u0111\xF3.",
    "optionsNotionConnectionLabel": "K\u1EBFt n\u1ED1i",
    "optionsNotionConnectButton": "K\u1EBFt n\u1ED1i Notion",
    "optionsNotionDisconnectButton": "Ng\u1EAFt k\u1EBFt n\u1ED1i",
    "optionsNotionConnectHint": "Tab ph\xEA duy\u1EC7t Notion s\u1EBD m\u1EDF ra. Sau khi \u0111\u01B0\u1EE3c ph\xEA duy\u1EC7t, h\xE3y quay l\u1EA1i \u0111\xE2y v\xE0 tr\u1EA1ng th\xE1i k\u1EBFt n\u1ED1i s\u1EBD t\u1EF1 \u0111\u1ED9ng l\xE0m m\u1EDBi.",
    "optionsNotionConnected": "Kh\xF4ng gian l\xE0m vi\u1EC7c Notion \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
    "optionsNotionDisconnected": "Notion ch\u01B0a \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
    "optionsNotionConnectStarted": "\u0110\xE3 m\u1EDF tab k\u1EBFt n\u1ED1i Notion. Tr\u1EDF l\u1EA1i \u0111\xE2y sau khi \u0111\u01B0\u1EE3c ph\xEA duy\u1EC7t.",
    "optionsNotionConnectFailed": "Kh\xF4ng th\u1EC3 b\u1EAFt \u0111\u1EA7u lu\u1ED3ng k\u1EBFt n\u1ED1i Notion.",
    "optionsNotionDisconnectedSaved": "\u0110\xE3 ng\u1EAFt k\u1EBFt n\u1ED1i kh\xF4ng gian l\xE0m vi\u1EC7c Notion.",
    "optionsNotionDisconnectFailed": "Kh\xF4ng th\u1EC3 ng\u1EAFt k\u1EBFt n\u1ED1i Notion.",
    "optionsNotionParentType": "Ch\u1EBF \u0111\u1ED9 l\u01B0u",
    "optionsNotionParentTypeHint": "Ch\u1ECDn xem \u0111\xEDch m\u1EB7c \u0111\u1ECBnh l\xE0 m\u1ED9t trang hay ngu\u1ED3n d\u1EEF li\u1EC7u trong kh\xF4ng gian l\xE0m vi\u1EC7c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
    "optionsNotionParentTypePage": "Trang m\u1EB9",
    "optionsNotionParentTypeDataSource": "Ngu\u1ED3n d\u1EEF li\u1EC7u",
    "optionsNotionSelectedTarget": "\u0110i\u1EC3m \u0111\u1EBFn m\u1EB7c \u0111\u1ECBnh",
    "optionsNotionSelectedTargetHint": "\u0110\xE2y l\xE0 n\u01A1i n\xFAt l\u01B0u s\u1EBD g\u1EEDi c\xE1c \u1EA3nh ch\u1EE5p Threads m\u1EDBi theo m\u1EB7c \u0111\u1ECBnh.",
    "optionsNotionTargetNotSelected": "Ch\u01B0a c\xF3 \u0111\xEDch \u0111\u1EBFn m\u1EB7c \u0111\u1ECBnh n\xE0o \u0111\u01B0\u1EE3c ch\u1ECDn.",
    "optionsNotionTargetRequired": "Tr\u01B0\u1EDBc ti\xEAn h\xE3y ch\u1ECDn \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh.",
    "optionsNotionTargetSaved": "\u0110\xE3 l\u01B0u \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh.",
    "optionsNotionTargetSaveFailed": "Kh\xF4ng th\u1EC3 l\u01B0u \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh.",
    "optionsNotionSearchLabel": "T\xECm m\u1ED9t \u0111i\u1EC3m \u0111\u1EBFn",
    "optionsNotionSearchHint": "C\xE1c trang t\xECm ki\u1EBFm ho\u1EB7c ngu\u1ED3n d\u1EEF li\u1EC7u m\xE0 b\u1EA1n \u0111\xE3 c\u1EA5p quy\u1EC1n truy c\u1EADp t\xEDch h\u1EE3p n\xE0y.",
    "optionsNotionSearchPlaceholderPage": "V\xED d\u1EE5: Product Ghi ch\xFA",
    "optionsNotionSearchPlaceholderDataSource": "V\xED d\u1EE5: H\u1ED9p th\u01B0 \u0111\u1EBFn Threads",
    "optionsNotionSearchButton": "T\xECm ki\u1EBFm \u0111i\u1EC3m \u0111\u1EBFn",
    "optionsNotionResultsLabel": "K\u1EBFt qu\u1EA3",
    "optionsNotionResultsHint": "Ch\u1ECDn m\u1ED9t k\u1EBFt qu\u1EA3 v\xE0 \u0111\u1EB7t n\xF3 l\xE0m \u0111\xEDch l\u01B0u m\u1EB7c \u0111\u1ECBnh.",
    "optionsNotionUseLocationButton": "S\u1EED d\u1EE5ng l\xE0m \u0111i\u1EC3m \u0111\u1EBFn m\u1EB7c \u0111\u1ECBnh",
    "optionsNotionSearchLoaded": "\u0110\xE3 t\u1EA3i \u0111\xEDch Notion.",
    "optionsNotionSearchEmpty": "Kh\xF4ng t\xECm th\u1EA5y \u0111i\u1EC3m \u0111\u1EBFn Notion ph\xF9 h\u1EE3p.",
    "optionsNotionSearchFailed": "Kh\xF4ng th\u1EC3 t\u1EA3i \u0111\xEDch Notion.",
    "optionsNotionOAuthRequiresPro": "T\xEDnh n\u0103ng l\u01B0u Notion OAuth ch\u1EC9 c\xF3 s\u1EB5n trong Pro.",
    "optionsNotionConnectFirst": "Tr\u01B0\u1EDBc ti\xEAn h\xE3y k\u1EBFt n\u1ED1i Notion.",
    "optionsNotionToken": "M\xE3 th\xF4ng b\xE1o t\xEDch h\u1EE3p",
    "optionsNotionTokenHint": "D\xE1n m\xE3 th\xF4ng b\xE1o t\xEDch h\u1EE3p n\u1ED9i b\u1ED9 Notion c\u1EE7a b\u1EA1n. N\xF3 ch\u1EC9 \u0111\u01B0\u1EE3c l\u01B0u tr\u1EEF trong h\u1ED3 s\u01A1 tr\xECnh duy\u1EC7t n\xE0y.",
    "optionsNotionParentPage": "ID trang g\u1ED1c ho\u1EB7c URL",
    "optionsNotionParentPageHint": "B\u1EA1n c\xF3 th\u1EC3 d\xE1n to\xE0n b\u1ED9 trang Notion URL ho\u1EB7c ch\u1EC9 ID trang.",
    "optionsNotionDataSource": "ID ngu\u1ED3n d\u1EEF li\u1EC7u ho\u1EB7c URL",
    "optionsNotionDataSourceHint": "D\xE1n ngu\u1ED3n d\u1EEF li\u1EC7u Notion \u0111\u1EA7y \u0111\u1EE7 URL ho\u1EB7c ch\u1EC9 ID c\u1EE7a n\xF3. Ti\xEAu \u0111\u1EC1, th\u1EBB, ng\xE0y th\xE1ng v\xE0 c\xE1c thu\u1ED9c t\xEDnh t\u01B0\u01A1ng t\u1EF1 \u0111\u01B0\u1EE3c \xE1nh x\u1EA1 t\u1EF1 \u0111\u1ED9ng khi c\xF3 th\u1EC3.",
    "optionsNotionDataSourceLocked": "T\xEDnh n\u0103ng l\u01B0u ngu\u1ED3n d\u1EEF li\u1EC7u ch\u1EC9 kh\u1EA3 d\u1EE5ng trong Pro.",
    "optionsNotionUploadMedia": "T\u1EA3i ph\u01B0\u01A1ng ti\u1EC7n l\xEAn Notion",
    "optionsNotionUploadMediaHint": "T\u1EA3i h\xECnh \u1EA3nh v\xE0 video l\xEAn d\u01B0\u1EDBi d\u1EA1ng t\u1EC7p do Notion qu\u1EA3n l\xFD thay v\xEC \u0111\u1EC3 ch\xFAng d\u01B0\u1EDBi d\u1EA1ng li\xEAn k\u1EBFt t\u1EEB xa. N\u1EBFu t\u1EA3i l\xEAn kh\xF4ng th\xE0nh c\xF4ng, qu\xE1 tr\xECnh l\u01B0u s\u1EBD quay tr\u1EDF l\u1EA1i c\xE1c li\xEAn k\u1EBFt.",
    "optionsNotionUploadMediaLocked": "T\u1EA3i l\xEAn ph\u01B0\u01A1ng ti\u1EC7n do Notion qu\u1EA3n l\xFD ch\u1EC9 kh\u1EA3 d\u1EE5ng trong Pro.",
    "optionsNotionTokenRequired": "C\u1EA7n c\xF3 m\xE3 th\xF4ng b\xE1o t\xEDch h\u1EE3p Notion \u0111\u1EC3 s\u1EED d\u1EE5ng t\xEDnh n\u0103ng l\u01B0u Notion.",
    "optionsNotionParentPageRequired": "C\u1EA7n c\xF3 ID trang m\u1EB9 Notion ho\u1EB7c URL \u0111\u1EC3 s\u1EED d\u1EE5ng t\xEDnh n\u0103ng l\u01B0u Notion.",
    "optionsNotionInvalidPage": "ID trang m\u1EB9 Notion ho\u1EB7c \u0111\u1ECBnh d\u1EA1ng URL kh\xF4ng h\u1EE3p l\u1EC7.",
    "optionsNotionDataSourceRequired": "C\u1EA7n c\xF3 ID ngu\u1ED3n d\u1EEF li\u1EC7u Notion ho\u1EB7c URL \u0111\u1EC3 s\u1EED d\u1EE5ng t\xEDnh n\u0103ng l\u01B0u ngu\u1ED3n d\u1EEF li\u1EC7u.",
    "optionsNotionInvalidDataSource": "ID ngu\u1ED3n d\u1EEF li\u1EC7u Notion ho\u1EB7c \u0111\u1ECBnh d\u1EA1ng URL kh\xF4ng h\u1EE3p l\u1EC7.",
    "optionsNotionPermissionDenied": "Quy\u1EC1n truy c\u1EADp Notion API \u0111\xE3 b\u1ECB t\u1EEB ch\u1ED1i n\xEAn c\xE0i \u0111\u1EB7t kh\xF4ng \u0111\u01B0\u1EE3c l\u01B0u.",
    "optionsBasicSection": "Ti\u1EBFt ki\u1EC7m c\u01A1 b\u1EA3n",
    "optionsBasicSubtitle": "",
    "optionsCompareSection": "Free so v\u1EDBi Pro",
    "optionsProSection": "C\xE0i \u0111\u1EB7t Pro",
    "optionsProSubtitle": "Ch\u1EC9 m\u1EDF khi c\u1EA7n thi\u1EBFt. \u0110\xE2y l\xE0 n\u01A1i t\u1ED3n t\u1EA1i c\xE1c quy t\u1EAFc v\xE0 t\u1ED5 ch\u1EE9c AI.",
    "optionsProAiNote": "AI kh\xF4ng \u0111\u01B0\u1EE3c t\u1EF1 \u0111\u1ED9ng \u0111\u01B0a v\xE0o. N\xF3 ch\u1EC9 ch\u1EA1y sau khi b\u1EA1n th\xEAm kh\xF3a API c\u1EE7a ri\xEAng m\xECnh.",
    "optionsProCompareFree": "Free",
    "optionsProComparePro": "Pro",
    "compareRowSave": "L\u01B0u",
    "compareRowImages": "H\xECnh \u1EA3nh",
    "compareRowReplies": "Ch\u1EE7 \u0111\u1EC1 tr\u1EA3 l\u1EDDi",
    "compareRowDuplicates": "B\u1ECF qua tr\xF9ng l\u1EB7p",
    "compareRowFilename": "\u0110\u1ECBnh d\u1EA1ng t\xEAn t\u1EC7p",
    "compareRowFolder": "L\u01B0u th\u01B0 m\u1EE5c",
    "compareRowNotionDataSource": "Ngu\u1ED3n d\u1EEF li\u1EC7u Notion",
    "compareRowNotionMediaUpload": "T\u1EA3i l\xEAn ph\u01B0\u01A1ng ti\u1EC7n Notion",
    "compareRowAiSummary": "T\xF3m t\u1EAFt AI",
    "compareRowAiTags": "Th\u1EBB AI",
    "compareRowAiFrontmatter": "ti\u1EC1n \u0111\u1EC1 AI",
    "optionsProBadgeFree": "Free",
    "optionsProBadgeActive": "Pro",
    "optionsProStatusFree": "B\u1EA1n \u0111ang \u1EDF tr\xEAn Free. Qu\xE1 tr\xECnh l\u01B0u \u0111\xE3 ho\u1EA1t \u0111\u1ED9ng v\xE0 Pro ch\u1EC9 c\u1EA7n thi\u1EBFt khi b\u1EA1n mu\u1ED1n c\xF3 quy t\u1EAFc ho\u1EB7c AI.",
    "optionsProStatusActive": "Pro \u0111ang ho\u1EA1t \u0111\u1ED9ng. T\u1ED5 ch\u1EE9c d\u1EF1a tr\xEAn quy t\u1EAFc v\xE0 AI c\xF3 s\u1EB5n b\xEAn d\u01B0\u1EDBi.",
    "optionsProStatusExpired": "Kh\xF3a Pro n\xE0y \u0111\xE3 h\u1EBFt h\u1EA1n. Vi\u1EC7c l\u01B0u Free v\u1EABn ho\u1EA1t \u0111\u1ED9ng.",
    "optionsProStatusInvalid": "Kh\xF3a Pro n\xE0y kh\xF4ng h\u1EE3p l\u1EC7. Vi\u1EC7c l\u01B0u Free v\u1EABn ho\u1EA1t \u0111\u1ED9ng.",
    "optionsProStatusSeatLimit": "Kh\xF3a Pro n\xE0y \u0111\xE3 ho\u1EA1t \u0111\u1ED9ng tr\xEAn 3 thi\u1EBFt b\u1ECB. Tr\u01B0\u1EDBc ti\xEAn h\xE3y ph\xE1t h\xE0nh c\xE1i n\xE0y tr\xEAn thi\u1EBFt b\u1ECB kh\xE1c.",
    "optionsProStatusNeedsActivation": "Kh\xF3a Pro h\u1EE3p l\u1EC7 nh\u01B0ng thi\u1EBFt b\u1ECB n\xE0y ch\u01B0a c\xF3 ch\u1ED7 ho\u1EA1t \u0111\u1ED9ng.",
    "optionsProStatusOffline": "Kh\xF4ng th\u1EC3 truy c\u1EADp m\xE1y ch\u1EE7 n\xEAn tr\u1EA1ng th\xE1i k\xEDch ho\u1EA1t g\u1EA7n \u0111\xE2y nh\u1EA5t \u0111ang \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng.",
    "optionsProStatusRevoked": "Kh\xF3a Pro n\xE0y kh\xF4ng th\u1EC3 s\u1EED d\u1EE5ng \u0111\u01B0\u1EE3c n\u1EEFa.",
    "optionsProHolderLabel": "Ng\u01B0\u1EDDi gi\u1EEF",
    "optionsProExpiresLabel": "H\u1EBFt h\u1EA1n",
    "optionsProUnlockLabel": "Ph\xEDm Pro",
    "optionsProUnlockHint": "D\xE1n kh\xF3a Pro t\u1EEB email mua h\xE0ng c\u1EE7a b\u1EA1n \u0111\u1EC3 k\xEDch ho\u1EA1t tr\xEAn tr\xECnh duy\u1EC7t n\xE0y.",
    "optionsProUnlockPlaceholder": "D\xE1n kh\xF3a Pro c\u1EE7a b\u1EA1n v\xE0o \u0111\xE2y",
    "optionsProSalesLink": "Nh\u1EADn Pro",
    "optionsProActivate": "K\xEDch ho\u1EA1t Pro",
    "optionsProClear": "X\xF3a",
    "optionsProActivated": "Pro \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t.",
    "optionsProRemoved": "Kh\xF3a Pro \u0111\xE3 b\u1ECB x\xF3a.",
    "optionsProEmptyKey": "Tr\u01B0\u1EDBc ti\xEAn h\xE3y nh\u1EADp kh\xF3a Pro.",
    "optionsProLocalOnly": "B\xE0i vi\u1EBFt c\u1EE7a b\u1EA1n v\u1EABn c\xF2n tr\xEAn thi\u1EBFt b\u1ECB c\u1EE7a b\u1EA1n. Kh\xF4ng c\u1EA7n \u0111\u0103ng nh\u1EADp.",
    "optionsFileRules": "Quy t\u1EAFc t\u1EC7p",
    "optionsFilenamePattern": "\u0110\u1ECBnh d\u1EA1ng t\xEAn t\u1EC7p",
    "optionsFilenamePatternLocked": "Free s\u1EED d\u1EE5ng t\xEAn t\u1EC7p m\u1EB7c \u0111\u1ECBnh. Pro cho ph\xE9p b\u1EA1n \u0111\u1EB7t \u0111\u1ECBnh d\u1EA1ng c\u1EE7a ri\xEAng m\xECnh.",
    "optionsSavePathPattern": "\u0110\u01B0\u1EDDng d\u1EABn th\u01B0 m\u1EE5c con",
    "optionsSavePathTokens": "V\xED d\u1EE5: H\u1ED9p th\u01B0 \u0111\u1EBFn/{date} \xB7 Threads/{author}",
    "optionsSavePathLocked": "Free l\u01B0u v\xE0o th\u01B0 m\u1EE5c g\u1ED1c c\u1EE7a th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i c\u1EE7a b\u1EA1n. Pro cho ph\xE9p b\u1EA1n t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp th\xE0nh c\xE1c th\u01B0 m\u1EE5c con theo ng\xE0y, t\xE1c gi\u1EA3 ho\u1EB7c ch\u1EE7 \u0111\u1EC1.",
    "optionsFilenameTokens": "C\xF3 s\u1EB5n: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
    "optionsAiSection": "T\u1ED5 ch\u1EE9c AI",
    "optionsAiSubtitle": "Ch\u1ECDn m\u1ED9t nh\xE0 cung c\u1EA5p v\xE0 m\xF4 h\xECnh v\xE0 URL c\u01A1 s\u1EDF m\u1EB7c \u0111\u1ECBnh s\u1EBD \u0111\u01B0\u1EE3c \u0111i\u1EC1n v\xE0o cho b\u1EA1n.",
    "optionsAiQuickstart": "H\u1EA7u h\u1EBFt ng\u01B0\u1EDDi d\xF9ng ch\u1EC9 c\u1EA7n nh\xE0 cung c\u1EA5p v\xE0 kh\xF3a API. Sau khi thay \u0111\u1ED5i xong nh\u1EA5n Save Setting b\xEAn d\u01B0\u1EDBi \u0111\u1EC3 \xE1p d\u1EE5ng.",
    "optionsAiAdvancedSummary": "Hi\u1EC3n th\u1ECB c\xE0i \u0111\u1EB7t n\xE2ng cao",
    "optionsAiEnable": "K\xEDch ho\u1EA1t t\u1ED5 ch\u1EE9c AI",
    "optionsAiProvider": "Provider",
    "optionsAiProviderHint": "OpenAI, OpenRouter, DeepSeek, Gemini v\xE0 Ollama c\xF3 th\u1EC3 b\u1EAFt \u0111\u1EA7u t\u1EEB c\xE1c c\xE0i \u0111\u1EB7t tr\u01B0\u1EDBc. T\xF9y ch\u1EC9nh d\xE0nh cho m\u1ECDi \u0111i\u1EC3m cu\u1ED1i t\u01B0\u01A1ng th\xEDch v\u1EDBi OpenAI.",
    "optionsAiProviderOpenAi": "OpenAI",
    "optionsAiProviderOpenRouter": "B\u1ED9 \u0111\u1ECBnh tuy\u1EBFn m\u1EDF",
    "optionsAiProviderDeepSeek": "DeepSeek",
    "optionsAiProviderGemini": "Gemini",
    "optionsAiProviderOllama": "Ollama",
    "optionsAiProviderCustom": "t\xF9y ch\u1EC9nh",
    "optionsAiApiKey": "Ph\xEDm API",
    "optionsAiApiKeyHint": "C\xE1c kh\xF3a Gemini th\u01B0\u1EDDng b\u1EAFt \u0111\u1EA7u b\u1EB1ng AIza, trong khi c\xE1c kh\xF3a OpenAI/OpenRouter/DeepSeek th\u01B0\u1EDDng b\u1EAFt \u0111\u1EA7u b\u1EB1ng sk-. Ch\u1EC9 \u0111\u1EC3 tr\u1ED1ng ph\u1EA7n n\xE0y cho c\xE1c \u0111i\u1EC3m cu\u1ED1i c\u1EE5c b\u1ED9 nh\u01B0 Ollama khi kh\xF4ng c\u1EA7n kh\xF3a.",
    "optionsAiApiKeyRequired": "Nh\xE0 cung c\u1EA5p \u0111\u01B0\u1EE3c ch\u1ECDn y\xEAu c\u1EA7u kh\xF3a API.",
    "optionsAiKeyMismatchGemini": "Gemini c\u1EA7n kh\xF3a Google Gemini API. Kh\xF3a hi\u1EC7n t\u1EA1i tr\xF4ng gi\u1ED1ng nh\u01B0 kh\xF3a t\u01B0\u01A1ng th\xEDch v\u1EDBi OpenAI.",
    "optionsAiKeyMismatchOpenAi": "C\xE1c nh\xE0 cung c\u1EA5p OpenAI/OpenRouter/DeepSeek y\xEAu c\u1EA7u kh\xF3a ri\xEAng c\u1EE7a h\u1ECD, kh\xF4ng ph\u1EA3i kh\xF3a Gemini b\u1EAFt \u0111\u1EA7u b\u1EB1ng AIza.",
    "optionsAiBaseUrl": "C\u01A1 s\u1EDF URL",
    "optionsAiBaseUrlHint": "V\xED d\u1EE5: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
    "optionsAiModel": "T\xEAn m\u1EABu",
    "optionsAiModelHint": "V\xED d\u1EE5: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
    "optionsAiPrompt": "L\u1EDDi nh\u1EAFc t\u1ED5 ch\u1EE9c",
    "optionsAiPromptHint": "M\xF4 t\u1EA3 \u0111\u1ED9 d\xE0i t\xF3m t\u1EAFt, ki\u1EC3u th\u1EBB v\xE0 c\xE1c tr\u01B0\u1EDDng n\u1ED9i dung ch\xEDnh mong mu\u1ED1n c\u1EE7a b\u1EA1n.",
    "optionsAiLocked": "T\u1ED5 ch\u1EE9c AI ch\u1EC9 c\xF3 s\u1EB5n trong Pro.",
    "optionsAiInvalidBaseUrl": "C\u01A1 s\u1EDF AI URL kh\xF4ng h\u1EE3p l\u1EC7.",
    "optionsAiPermissionDenied": "Quy\u1EC1n \u0111\u1ED1i v\u1EDBi \u0111i\u1EC3m cu\u1ED1i AI \u0111\xE3 ch\u1ECDn \u0111\xE3 b\u1ECB t\u1EEB ch\u1ED1i n\xEAn c\xE0i \u0111\u1EB7t kh\xF4ng \u0111\u01B0\u1EE3c l\u01B0u.",
    "optionsAiSaved": "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t AI v\xE0 quy\u1EC1n \u0111i\u1EC3m cu\u1ED1i.",
    "optionsIncludeImages": "L\u01B0u t\u1EADp tin h\xECnh \u1EA3nh v\xE0 video",
    "optionsSave": "L\u01B0u c\xE0i \u0111\u1EB7t",
    "optionsSaved": "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t.",
    "optionsPendingSave": "\u0110\xE3 thay \u0111\u1ED5i. Nh\u1EA5n L\u01B0u c\xE0i \u0111\u1EB7t b\xEAn d\u01B0\u1EDBi \u0111\u1EC3 \xE1p d\u1EE5ng.",
    "optionsNoChanges": "Ch\u01B0a c\xF3 thay \u0111\u1ED5i n\xE0o.",
    "optionsStep1": "1. K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian",
    "optionsStep2": "2. H\xE3y th\u1EED l\u01B0u mi\u1EC5n ph\xED tr\u01B0\u1EDBc",
    "optionsStep3": "3. K\xEDch ho\u1EA1t Pro khi b\u1EA1n mu\u1ED1n c\xF3 quy t\u1EAFc ho\u1EB7c t\u1ED5 ch\u1EE9c AI",
    "mdImageLabel": "H\xECnh \u1EA3nh",
    "mdVideoLabel": "Video",
    "mdVideoThumbnailLabel": "H\xECnh thu nh\u1ECF c\u1EE7a video",
    "mdVideoOnThreads": "M\u1EDF tr\xEAn Threads",
    "mdSavedVideoFile": "T\u1EC7p video \u0111\xE3 l\u01B0u",
    "mdReplySection": "T\xE1c gi\u1EA3 tr\u1EA3 l\u1EDDi",
    "mdReplyLabel": "tr\u1EA3 l\u1EDDi",
    "mdReplyImageLabel": "Tr\u1EA3 l\u1EDDi h\xECnh \u1EA3nh",
    "mdUploadedMediaSection": "Ph\u01B0\u01A1ng ti\u1EC7n \u0111\xE3 t\u1EA3i l\xEAn",
    "mdSource": "Ngu\u1ED3n",
    "mdAuthor": "t\xE1c gi\u1EA3",
    "mdPublishedAt": "Xu\u1EA5t b\u1EA3n l\xFAc",
    "mdExternalLink": "Li\xEAn k\u1EBFt ngo\xE0i",
    "mdWarning": "C\u1EA3nh b\xE1o",
    "mdSummary": "T\xF3m t\u1EAFt AI",
    "warnImageAccessFailed": "Kh\xF4ng th\u1EC3 l\u01B0u m\u1ED9t s\u1ED1 h\xECnh \u1EA3nh ho\u1EB7c video; li\xEAn k\u1EBFt ban \u0111\u1EA7u \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i.",
    "warnImageDownloadOff": "T\xEDnh n\u0103ng l\u01B0u h\xECnh \u1EA3nh/video b\u1ECB t\u1EAFt; li\xEAn k\u1EBFt ban \u0111\u1EA7u \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i.",
    "warnAiFailed": "T\u1ED5 ch\u1EE9c AI kh\xF4ng th\xE0nh c\xF4ng n\xEAn ghi ch\xFA ban \u0111\u1EA7u \u0111\u01B0\u1EE3c l\u01B0u thay th\u1EBF: {reason}",
    "warnAiPermissionMissing": "Thi\u1EBFu quy\u1EC1n c\u1EE7a \u0111i\u1EC3m cu\u1ED1i AI n\xEAn ghi ch\xFA ban \u0111\u1EA7u \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u. L\u01B0u l\u1EA1i ph\u1EA7n AI trong c\xE0i \u0111\u1EB7t.",
    "warnAiMissingModel": "Kh\xF4ng c\xF3 t\xEAn m\u1EABu AI n\xE0o \u0111\u01B0\u1EE3c \u0111\u1ECBnh c\u1EA5u h\xECnh n\xEAn ghi ch\xFA ban \u0111\u1EA7u \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u.",
    "warnNotionMediaUploadFailed": "T\u1EA3i l\xEAn ph\u01B0\u01A1ng ti\u1EC7n Notion kh\xF4ng th\xE0nh c\xF4ng n\xEAn thay v\xE0o \u0111\xF3, c\xE1c li\xEAn k\u1EBFt t\u1EEB xa \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u.",
    "errBrowserUnsupported": "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng th\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian.",
    "errFolderNameFailed": "Kh\xF4ng th\u1EC3 x\xE1c \u0111\u1ECBnh t\xEAn th\u01B0 m\u1EE5c \u0111\u1EC3 l\u01B0u.",
    "errInvalidPath": "\u0110\u01B0\u1EDDng d\u1EABn t\u1EADp tin kh\xF4ng h\u1EE3p l\u1EC7.",
    "errNotionTokenMissing": "Kh\xF4ng c\xF3 m\xE3 th\xF4ng b\xE1o t\xEDch h\u1EE3p Notion n\xE0o \u0111\u01B0\u1EE3c \u0111\u1ECBnh c\u1EA5u h\xECnh.",
    "errNotionPermissionMissing": "Thi\u1EBFu quy\u1EC1n cho Notion API. L\u01B0u l\u1EA1i c\xE0i \u0111\u1EB7t tr\u01B0\u1EDBc.",
    "errNotionUnauthorized": "M\xE3 th\xF4ng b\xE1o Notion kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n.",
    "errNotionForbidden": "S\u1EF1 t\xEDch h\u1EE3p n\xE0y kh\xF4ng th\u1EC3 truy c\u1EADp v\xE0o \u0111\xEDch Notion \u0111\xE3 ch\u1ECDn. \u0110\u1EA3m b\u1EA3o trang ho\u1EB7c ngu\u1ED3n d\u1EEF li\u1EC7u \u0111\u01B0\u1EE3c chia s\u1EBB v\u1EDBi ti\u1EC7n \xEDch t\xEDch h\u1EE3p.",
    "errNotionParentNotFound": "Kh\xF4ng th\u1EC3 t\xECm th\u1EA5y trang Notion ho\u1EB7c ngu\u1ED3n d\u1EEF li\u1EC7u \u0111\xE3 ch\u1ECDn. Ki\u1EC3m tra ID v\xE0 k\u1EBFt n\u1ED1i.",
    "errNotionRateLimited": "Qu\xE1 nhi\u1EC1u y\xEAu c\u1EA7u Notion. H\xE3y th\u1EED l\u1EA1i sau {seconds} gi\xE2y.",
    "errNotionValidation": "Y\xEAu c\u1EA7u Notion kh\xF4ng h\u1EE3p l\u1EC7.",
    "errNotionRequestFailed": "Y\xEAu c\u1EA7u l\u01B0u Notion kh\xF4ng th\xE0nh c\xF4ng.",
    "fallbackNoFolder": "Kh\xF4ng c\xF3 th\u01B0 m\u1EE5c n\xE0o \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i,",
    "fallbackPermissionDenied": "Kh\xF4ng c\xF3 quy\u1EC1n truy c\u1EADp th\u01B0 m\u1EE5c,",
    "fallbackDirectFailed": "Kh\xF4ng th\u1EC3 l\u01B0u v\xE0o th\u01B0 m\u1EE5c,",
    "fallbackZipMessage": "thay v\xE0o \u0111\xF3 \u0111\u01B0\u1EE3c l\u01B0u d\u01B0\u1EDBi d\u1EA1ng t\u1EA3i xu\u1ED1ng.",
    "errNotPermalink": "Vui l\xF2ng m\u1EDF m\u1ED9t trang b\xE0i vi\u1EBFt c\xE1 nh\xE2n tr\u01B0\u1EDBc.",
    "errPostContentNotFound": "Kh\xF4ng th\u1EC3 t\u1EA3i n\u1ED9i dung b\xE0i vi\u1EBFt. H\xE3y ch\u1EAFc ch\u1EAFn r\u1EB1ng b\u1EA1n \u0111\xE3 \u0111\u0103ng nh\u1EADp."
  }
};

// ../shared/src/i18n.ts
var ko = {
  uiLanguageLabel: "\uC5B8\uC5B4",
  uiLanguageKo: "\uD55C\uAD6D\uC5B4",
  uiLanguageEn: "English",
  popupTitle: "\uD604\uC7AC \uAE00 \uC800\uC7A5",
  popupSave: "\uD604\uC7AC \uAE00 \uC800\uC7A5",
  popupSettings: "\uC124\uC815",
  popupPromoTitle: "\uD5A5\uD6C4 \uD655\uC7A5 \uC601\uC5ED",
  popupPromoDescription: "\uCD94\uD6C4 \uC548\uB0B4\uC640 \uCD94\uCC9C\uC774 \uB4E4\uC5B4\uAC08 \uC790\uB9AC\uB97C \uBBF8\uB9AC \uD655\uBCF4\uD574 \uB450\uC5C8\uC2B5\uB2C8\uB2E4.",
  popupSubtitleDirect: "\uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitleDownload: "\uC800\uC7A5 \uD3F4\uB354\uAC00 \uC5C6\uC5B4 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uD3F4\uB354\uB97C \uC5F0\uACB0\uD558\uC138\uC694.",
  popupSubtitleConnected: "\uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitlePermissionCheck: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC788\uC9C0\uB9CC \uAD8C\uD55C\uC744 \uB2E4\uC2DC \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  popupSubtitleNoFolder: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC788\uC73C\uBA74 \uBC14\uB85C \uC800\uC7A5\uD558\uACE0, \uC5C6\uC73C\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  popupSubtitleUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  popupSubtitleNotion: "\uC124\uC815\uD55C Notion \uB300\uC0C1\uC5D0 \uC0C8 \uD398\uC774\uC9C0\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  popupSubtitleNotionSetup: "Notion \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 \uC124\uC815\uC5D0\uC11C \uD1A0\uD070\uACFC \uC800\uC7A5 \uB300\uC0C1\uC744 \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
  popupRecentSaves: "\uCD5C\uADFC \uC800\uC7A5",
  popupClearAll: "\uC804\uCCB4 \uC0AD\uC81C",
  popupEmpty: "\uC544\uC9C1 \uC800\uC7A5\uD55C \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  popupResave: "\uB2E4\uC2DC \uC800\uC7A5",
  popupExpand: "\uD3BC\uCE58\uAE30",
  popupCollapse: "\uC811\uAE30",
  popupDelete: "\uC0AD\uC81C",
  statusReady: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uC5D0\uC11C \uC800\uC7A5\uD560 \uC900\uBE44\uAC00 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  statusReadyDirect: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusReadyDownload: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  statusUnsupported: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  statusNoTab: "\uD65C\uC131 \uD0ED\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusSaving: "\uC800\uC7A5\uD558\uB294 \uC911\u2026",
  statusSavedDirect: "Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedZip: "\uC800\uC7A5 \uC644\uB8CC. \uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedNotion: "Notion\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicate: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicateWarning: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: ",
  statusAlreadySaved: "\uC774\uBBF8 \uC800\uC7A5\uB41C \uAE00\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC800\uC7A5\uD558\uB824\uBA74 \uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C '\uB2E4\uC2DC \uC800\uC7A5'\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694.",
  statusNotionSetupRequired: "Notion \uC800\uC7A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uC124\uC815\uC5D0\uC11C \uD1A0\uD070\uACFC \uC800\uC7A5 \uB300\uC0C1\uC744 \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
  statusError: "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusResaving: "\uD30C\uC77C\uC744 \uB2E4\uC2DC \uB9CC\uB4DC\uB294 \uC911\u2026",
  statusResaved: "\uB2E4\uC6B4\uB85C\uB4DC\uB97C \uB2E4\uC2DC \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusResavedNotion: "Notion\uC5D0 \uC0C8 \uD398\uC774\uC9C0\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusRecentNotFound: "\uCD5C\uADFC \uC800\uC7A5 \uAE30\uB85D\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusDeletedRecent: "\uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusClearedRecents: "\uCD5C\uADFC \uC800\uC7A5\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusExtractFailed: "\uAE00 \uB0B4\uC6A9\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusTabError: "\uD604\uC7AC \uD0ED \uC815\uBCF4\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusRedownloadError: "\uB2E4\uC2DC \uB2E4\uC6B4\uB85C\uB4DC\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusRetry: "\uB2E4\uC2DC \uC2DC\uB3C4",
  statusResaveButton: "\uB2E4\uC2DC \uC800\uC7A5",
  optionsTitle: "Threads \uAE00\uC744 Obsidian \uB610\uB294 Notion\uC5D0 \uC800\uC7A5\uD558\uACE0 \uADDC\uCE59\uACFC AI\uB85C \uC815\uB9AC\uD558\uC138\uC694.",
  optionsTitleObsidianOnly: "Threads \uAE00\uC744 Obsidian\uC5D0 \uC800\uC7A5\uD558\uACE0 \uADDC\uCE59\uACFC AI\uB85C \uC815\uB9AC\uD558\uC138\uC694.",
  optionsSubtitle: "\uBB34\uB8CC \uC800\uC7A5, \uD544\uC694\uD560 \uB54C\uB9CC Pro.",
  optionsSubtitleObsidianOnly: "\uCD9C\uC2DC \uBC84\uC804 \uAE30\uC900 \uC124\uBA85\uC740 \uBB38\uC11C\uC5D0 \uC720\uC9C0\uD558\uACE0, \uD604\uC7AC UI\uC5D0\uC11C\uB294 Obsidian\uB9CC \uB178\uCD9C\uD569\uB2C8\uB2E4.",
  optionsPlanSpotlightFreeTitle: "Free",
  optionsPlanSpotlightFreeCopy: "\uAE30\uBCF8 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBC14\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsPlanSpotlightActiveTitle: "Pro \uD65C\uC131\uD654\uB428",
  optionsPlanSpotlightActiveCopy: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C Pro \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro \uD65C\uC131\uD654 \uD544\uC694",
  optionsPlanSpotlightNeedsActivationCopy: "\uD0A4\uB294 \uC720\uD6A8\uD558\uC9C0\uB9CC \uC544\uC9C1 \uC774 \uAE30\uAE30 seat\uAC00 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsPlanSpotlightSeatMeta: "Seat {used}/{limit} \xB7 {device}",
  optionsAdSlotLabel: "Ad",
  optionsAdSlotTitle: "\uAD11\uACE0 \uC790\uB9AC",
  optionsAdSlotCopy: "\uCD94\uD6C4 \uBC30\uB108 \uB610\uB294 \uC548\uB0B4\uAC00 \uB4E4\uC5B4\uAC08 \uC790\uB9AC\uC785\uB2C8\uB2E4.",
  optionsFolderSection: "Obsidian \uD3F4\uB354 \uC5F0\uACB0",
  optionsFolderStatus: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uB97C \uD655\uC778\uD558\uB294 \uC911\uC785\uB2C8\uB2E4\u2026",
  optionsFolderLabel: "\uD604\uC7AC \uD3F4\uB354",
  optionsFolderNotConnected: "\uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC74C",
  optionsFolderConnect: "\uD3F4\uB354 \uC5F0\uACB0",
  optionsFolderDisconnect: "\uC5F0\uACB0 \uD574\uC81C",
  optionsFolderUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD3F4\uB354 \uC5F0\uACB0\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC74C",
  optionsFolderUnsupportedStatus: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uD3F4\uB354\uC5D0 \uC9C1\uC811 \uC800\uC7A5\uD560 \uC218 \uC5C6\uC5B4 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  optionsFolderNotConnectedStatus: "\uC800\uC7A5 \uD3F4\uB354\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC800\uC7A5\uD558\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uB429\uB2C8\uB2E4.",
  optionsFolderReady: "\uD3F4\uB354\uAC00 \uC5F0\uACB0\uB410\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uBC14\uB85C \uAE30\uB85D\uB429\uB2C8\uB2E4.",
  optionsFolderPermissionCheck: "\uD3F4\uB354\uAC00 \uC5F0\uACB0\uB410\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uC800\uC7A5 \uC2DC \uD3F4\uB354 \uC811\uADFC \uAD8C\uD55C\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsFolderPermissionLost: "\uD3F4\uB354 \uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uD3F4\uB354\uB97C \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  optionsFolderChecked: "\uD3F4\uB354 \uC5F0\uACB0\uC744 \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uBC14\uB85C \uAE30\uB85D\uB429\uB2C8\uB2E4.",
  optionsFolderCancelled: "\uD3F4\uB354 \uC120\uD0DD\uC744 \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4.",
  optionsFolderError: "\uD3F4\uB354 \uC5F0\uACB0 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  optionsFolderConnectedSuccess: '"{folder}" \uD3F4\uB354\uB97C \uC5F0\uACB0\uD588\uC2B5\uB2C8\uB2E4.',
  optionsFolderPathLabel: "\uD604\uC7AC \uC800\uC7A5 \uC704\uCE58",
  optionsFolderPathHint: "\uC808\uB300\uACBD\uB85C\uB294 \uC77D\uC744 \uC218 \uC5C6\uC5B4 \uC5F0\uACB0\uB41C \uD3F4\uB354 \uAE30\uC900\uC73C\uB85C\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.",
  optionsFolderPathUnavailable: "\uD3F4\uB354 \uC5F0\uACB0 \uD6C4 \uD45C\uC2DC",
  optionsSaveTarget: "\uC800\uC7A5 \uB300\uC0C1",
  optionsSaveTargetHint: "PC\uC5D0\uC11C\uB294 Obsidian \uB610\uB294 Notion \uC911 \uD558\uB098\uB97C \uAE30\uBCF8 \uC800\uC7A5 \uB300\uC0C1\uC73C\uB85C \uC120\uD0DD\uD569\uB2C8\uB2E4.",
  optionsSaveTargetHintObsidianOnly: "\uD604\uC7AC UI\uC5D0\uC11C\uB294 Obsidian\uB9CC \uB178\uCD9C\uD569\uB2C8\uB2E4. Notion\uC740 \uB0B4\uBD80 \uC900\uBE44 \uC911\uC774\uB77C \uC124\uC815 \uD654\uBA74\uC5D0\uC11C \uC228\uACA8\uC838 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetNotion: "Notion",
  optionsSaveTargetNotionHidden: "Notion (\uC900\uBE44 \uC911)",
  optionsNotionSection: "Notion \uC5F0\uACB0",
  optionsNotionSubtitle: "Notion\uC740 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uD1A0\uD070\uC744 \uC9C1\uC811 \uB2E4\uB8E8\uC9C0 \uC54A\uACE0 OAuth\uB85C \uC5F0\uACB0\uD569\uB2C8\uB2E4. \uD55C \uBC88 \uC5F0\uACB0\uD558\uACE0 \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uACE0\uB974\uBA74 \uC774\uD6C4\uC5D0\uB294 \uC800\uC7A5\uB9CC \uB204\uB974\uBA74 \uB429\uB2C8\uB2E4.",
  optionsNotionConnectionLabel: "\uC5F0\uACB0 \uC0C1\uD0DC",
  optionsNotionConnectButton: "Connect Notion",
  optionsNotionDisconnectButton: "\uC5F0\uACB0 \uD574\uC81C",
  optionsNotionConnectHint: "Notion \uC2B9\uC778 \uD654\uBA74\uC774 \uC0C8 \uD0ED\uC5D0\uC11C \uC5F4\uB9BD\uB2C8\uB2E4. \uC2B9\uC778 \uD6C4 \uC774 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uC624\uBA74 \uC790\uB3D9\uC73C\uB85C \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uAC31\uC2E0\uD569\uB2C8\uB2E4.",
  optionsNotionConnected: "Notion \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uAC00 \uC5F0\uACB0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  optionsNotionDisconnected: "\uC544\uC9C1 Notion\uC774 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsNotionConnectStarted: "Notion \uC5F0\uACB0 \uD0ED\uC744 \uC5F4\uC5C8\uC2B5\uB2C8\uB2E4. \uC2B9\uC778 \uD6C4 \uC774 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uC624\uC138\uC694.",
  optionsNotionConnectFailed: "Notion \uC5F0\uACB0\uC744 \uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionDisconnectedSaved: "Notion \uC5F0\uACB0\uC744 \uD574\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionDisconnectFailed: "Notion \uC5F0\uACB0 \uD574\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionParentType: "\uC800\uC7A5 \uBC29\uC2DD",
  optionsNotionParentTypeHint: "\uC5F0\uACB0\uB41C \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0\uC11C \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C Page \uB610\uB294 data source \uC911 \uD558\uB098\uB85C \uACE0\uB985\uB2C8\uB2E4.",
  optionsNotionParentTypePage: "Parent page",
  optionsNotionParentTypeDataSource: "Data source",
  optionsNotionSelectedTarget: "\uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58",
  optionsNotionSelectedTargetHint: "\uD604\uC7AC \uC800\uC7A5 \uBC84\uD2BC\uC774 \uAE30\uBCF8\uC73C\uB85C \uBCF4\uB0BC Notion \uC704\uCE58\uC785\uB2C8\uB2E4.",
  optionsNotionTargetNotSelected: "\uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uAC00 \uC544\uC9C1 \uC120\uD0DD\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsNotionTargetRequired: "\uBA3C\uC800 Notion \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
  optionsNotionTargetSaved: "Notion \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionTargetSaveFailed: "Notion \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB97C \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionSearchLabel: "\uC800\uC7A5 \uC704\uCE58 \uCC3E\uAE30",
  optionsNotionSearchHint: "\uD398\uC774\uC9C0\uB098 data source \uC774\uB984 \uC77C\uBD80\uB97C \uC785\uB825\uD558\uBA74 \uC811\uADFC \uAC00\uB2A5\uD55C \uB300\uC0C1\uB9CC \uAC80\uC0C9\uD569\uB2C8\uB2E4.",
  optionsNotionSearchPlaceholderPage: "\uC608: Product Notes",
  optionsNotionSearchPlaceholderDataSource: "\uC608: Threads Inbox",
  optionsNotionSearchButton: "\uC704\uCE58 \uAC80\uC0C9",
  optionsNotionResultsLabel: "\uAC80\uC0C9 \uACB0\uACFC",
  optionsNotionResultsHint: "\uBAA9\uB85D\uC5D0\uC11C \uD558\uB098\uB97C \uC120\uD0DD\uD55C \uB4A4 \uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB85C \uC9C0\uC815\uD569\uB2C8\uB2E4.",
  optionsNotionUseLocationButton: "\uAE30\uBCF8 \uC800\uC7A5 \uC704\uCE58\uB85C \uC0AC\uC6A9",
  optionsNotionSearchLoaded: "\uAC80\uC0C9 \uACB0\uACFC\uB97C \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.",
  optionsNotionSearchEmpty: "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  optionsNotionSearchFailed: "Notion \uC704\uCE58\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  optionsNotionOAuthRequiresPro: "Notion OAuth \uC800\uC7A5\uC740 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsNotionConnectFirst: "\uBA3C\uC800 Notion\uC744 \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  optionsNotionToken: "Integration token",
  optionsNotionTokenHint: "Notion internal integration \uD1A0\uD070\uC744 \uB123\uC2B5\uB2C8\uB2E4. \uC774 \uAC12\uC740 \uD604\uC7AC \uBE0C\uB77C\uC6B0\uC800 \uD504\uB85C\uD544\uC5D0\uB9CC \uC800\uC7A5\uB429\uB2C8\uB2E4.",
  optionsNotionParentPage: "Parent page ID \uB610\uB294 URL",
  optionsNotionParentPageHint: "Notion \uD398\uC774\uC9C0 URL \uC804\uCCB4\uB97C \uBD99\uC5EC\uB123\uC5B4\uB3C4 \uB418\uACE0, page ID\uB9CC \uB123\uC5B4\uB3C4 \uB429\uB2C8\uB2E4.",
  optionsNotionDataSource: "Data source ID \uB610\uB294 URL",
  optionsNotionDataSourceHint: "Notion data source URL \uC804\uCCB4 \uB610\uB294 data source ID\uB97C \uB123\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uC2DC \uC81C\uBAA9/\uD0DC\uADF8/\uB0A0\uC9DC \uAC19\uC740 \uC18D\uC131\uC744 \uC790\uB3D9 \uB9E4\uD551\uD569\uB2C8\uB2E4.",
  optionsNotionDataSourceLocked: "Data source \uC800\uC7A5\uC740 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsNotionUploadMedia: "Notion \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC",
  optionsNotionUploadMediaHint: "\uC774\uBBF8\uC9C0\uC640 \uB3D9\uC601\uC0C1\uC744 \uC6D0\uACA9 \uB9C1\uD06C \uB300\uC2E0 Notion \uD30C\uC77C\uB85C \uC5C5\uB85C\uB4DC\uD569\uB2C8\uB2E4. \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD558\uBA74 \uB9C1\uD06C \uBC29\uC2DD\uC73C\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  optionsNotionUploadMediaLocked: "Notion \uB0B4\uBD80 \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC\uB294 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsNotionTokenRequired: "Notion \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 integration token\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsNotionParentPageRequired: "Notion \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 parent page ID \uB610\uB294 URL\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsNotionInvalidPage: "Notion parent page ID \uB610\uB294 URL \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  optionsNotionDataSourceRequired: "Notion data source \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 data source ID \uB610\uB294 URL\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsNotionInvalidDataSource: "Notion data source ID \uB610\uB294 URL \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  optionsNotionPermissionDenied: "Notion API \uC811\uADFC \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC544 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsBasicSection: "\uAE30\uBCF8 \uC800\uC7A5",
  optionsBasicSubtitle: "",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Pro \uC124\uC815",
  optionsProSubtitle: "\uD544\uC694\uD560 \uB54C\uB9CC \uC5F4\uC5B4 \uC124\uC815\uD558\uC138\uC694. \uADDC\uCE59\uACFC AI \uC815\uB9AC\uB97C \uC5EC\uAE30\uC11C \uCF2D\uB2C8\uB2E4.",
  optionsProAiNote: "AI\uB294 \uC790\uB3D9\uC73C\uB85C \uC81C\uACF5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC790\uC2E0\uC758 API \uD0A4\uB97C \uB123\uC5B4\uC57C \uB3D9\uC791\uD569\uB2C8\uB2E4.",
  optionsProCompareFree: "Free",
  optionsProComparePro: "Pro",
  compareRowSave: "\uC800\uC7A5",
  compareRowImages: "\uC774\uBBF8\uC9C0 \uD3EC\uD568",
  compareRowReplies: "\uC5F0\uC18D \uB2F5\uAE00",
  compareRowDuplicates: "\uC911\uBCF5 \uAC74\uB108\uB700",
  compareRowFilename: "\uD30C\uC77C \uC774\uB984 \uADDC\uCE59",
  compareRowFolder: "\uC800\uC7A5 \uD3F4\uB354 \uC9C0\uC815",
  compareRowNotionDataSource: "Notion data source \uC800\uC7A5",
  compareRowNotionMediaUpload: "Notion \uB0B4\uBD80 \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC",
  compareRowAiSummary: "AI \uC694\uC57D",
  compareRowAiTags: "AI \uD0DC\uADF8",
  compareRowAiFrontmatter: "AI frontmatter",
  optionsProBadgeFree: "Free",
  optionsProBadgeActive: "Pro",
  optionsProStatusFree: "\uC9C0\uAE08\uC740 Free \uC0C1\uD0DC\uC785\uB2C8\uB2E4. \uC800\uC7A5\uC740 \uADF8\uB300\uB85C \uB418\uACE0, \uD544\uC694\uD560 \uB54C\uB9CC Pro\uB97C \uCF1C\uBA74 \uB429\uB2C8\uB2E4.",
  optionsProStatusActive: "Pro \uD65C\uC131\uD654\uB428. \uC544\uB798 \uADDC\uCE59\uACFC AI \uC124\uC815\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsProStatusExpired: "\uC774 Pro \uD0A4\uB294 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. Free \uC800\uC7A5\uC740 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsProStatusInvalid: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 Pro \uD0A4\uC785\uB2C8\uB2E4. Free \uC800\uC7A5\uC740 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsProStatusSeatLimit: "\uC774 Pro \uD0A4\uB294 \uC774\uBBF8 3\uB300\uC5D0\uC11C \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uAE30\uAE30\uC5D0\uC11C \uBA3C\uC800 \uD574\uC81C\uD574 \uC8FC\uC138\uC694.",
  optionsProStatusNeedsActivation: "\uC720\uD6A8\uD55C Pro \uD0A4\uC774\uC9C0\uB9CC \uC544\uC9C1 \uC774 \uAE30\uAE30 seat\uAC00 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsProStatusOffline: "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC9C0\uB9CC, \uCD5C\uADFC \uD65C\uC131\uD654 \uC0C1\uD0DC\uB97C \uAE30\uC900\uC73C\uB85C \uACC4\uC18D \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
  optionsProStatusRevoked: "\uC774 Pro \uD0A4\uB294 \uB354 \uC774\uC0C1 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  optionsProHolderLabel: "\uB300\uC0C1",
  optionsProExpiresLabel: "\uB9CC\uB8CC",
  optionsProUnlockLabel: "Pro \uD0A4 \uC785\uB825",
  optionsProUnlockHint: "\uAD6C\uB9E4 \uD6C4 \uBC1B\uC740 Pro \uD0A4\uB97C \uBD99\uC5EC\uB123\uC73C\uBA74 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBC14\uB85C \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  optionsProUnlockPlaceholder: "Pro \uD0A4\uB97C \uBD99\uC5EC\uB123\uC73C\uC138\uC694",
  optionsProSalesLink: "Pro \uAD6C\uB9E4\uD558\uAE30",
  optionsProActivate: "Pro \uD65C\uC131\uD654",
  optionsProClear: "\uC81C\uAC70",
  optionsProActivated: "Pro\uAC00 \uD65C\uC131\uD654\uB410\uC2B5\uB2C8\uB2E4.",
  optionsProRemoved: "Pro \uD0A4\uB97C \uC81C\uAC70\uD588\uC2B5\uB2C8\uB2E4.",
  optionsProEmptyKey: "\uBA3C\uC800 Pro \uD0A4\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  optionsProLocalOnly: "\uC800\uC7A5\uD55C \uAE00\uC740 \uB0B4 \uAE30\uAE30\uC5D0\uB9CC \uBCF4\uAD00\uB418\uBA70, \uB85C\uADF8\uC778 \uC5C6\uC774 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsFileRules: "\uD30C\uC77C \uADDC\uCE59",
  optionsFilenamePattern: "\uD30C\uC77C \uC774\uB984 \uADDC\uCE59",
  optionsFilenamePatternLocked: "Free\uB294 \uAE30\uBCF8 \uD30C\uC77C \uC774\uB984\uC73C\uB85C \uC800\uC7A5\uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C \uC6D0\uD558\uB294 \uADDC\uCE59\uC73C\uB85C \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsSavePathPattern: "\uC800\uC7A5 \uD3F4\uB354 \uACBD\uB85C",
  optionsSavePathTokens: "\uC608\uC2DC: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free\uB294 \uC5F0\uACB0\uD55C \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uB429\uB2C8\uB2E4. Pro\uC5D0\uC11C \uB0A0\uC9DC\xB7\uC791\uC131\uC790 \uAE30\uC900\uC73C\uB85C \uD558\uC704 \uD3F4\uB354\uB97C \uC790\uB3D9 \uC9C0\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsFilenameTokens: "\uC0AC\uC6A9 \uAC00\uB2A5: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI \uC815\uB9AC",
  optionsAiSubtitle: "Provider\uB97C \uACE0\uB974\uBA74 \uAE30\uBCF8 Base URL\uACFC \uBAA8\uB378\uC774 \uC790\uB3D9\uC73C\uB85C \uB4E4\uC5B4\uAC11\uB2C8\uB2E4.",
  optionsAiQuickstart: "\uB300\uBD80\uBD84\uC740 Provider\uC640 API \uD0A4\uB9CC \uC120\uD0DD\uD558\uBA74 \uB429\uB2C8\uB2E4. \uBC14\uAFBC \uB4A4\uC5D0\uB294 \uC544\uB798\uC5D0\uC11C \uC124\uC815 \uC800\uC7A5\uC744 \uB20C\uB7EC\uC57C \uBC18\uC601\uB429\uB2C8\uB2E4.",
  optionsAiAdvancedSummary: "\uACE0\uAE09 \uC124\uC815 \uC5F4\uAE30",
  optionsAiEnable: "AI \uC815\uB9AC \uC0AC\uC6A9",
  optionsAiProvider: "Provider",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini, Ollama\uB294 preset\uC73C\uB85C \uBC14\uB85C \uC2DC\uC791\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. Custom\uC740 OpenAI \uD638\uD658 \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uC6A9\uC785\uB2C8\uB2E4.",
  optionsAiProviderOpenAi: "OpenAI",
  optionsAiProviderOpenRouter: "OpenRouter",
  optionsAiProviderDeepSeek: "DeepSeek",
  optionsAiProviderGemini: "Gemini",
  optionsAiProviderOllama: "Ollama",
  optionsAiProviderCustom: "Custom",
  optionsAiApiKey: "API \uD0A4",
  optionsAiApiKeyHint: "Gemini \uD0A4\uB294 \uBCF4\uD1B5 AIza..., OpenAI/OpenRouter/DeepSeek \uD0A4\uB294 \uBCF4\uD1B5 sk-... \uD615\uD0DC\uC785\uB2C8\uB2E4. Ollama \uAC19\uC740 \uB85C\uCEEC \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uB294 \uBE44\uC6CC\uB458 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsAiApiKeyRequired: "\uC120\uD0DD\uD55C provider\uB294 API \uD0A4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
  optionsAiKeyMismatchGemini: "Gemini provider\uC5D0\uB294 Google Gemini API \uD0A4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uC9C0\uAE08 \uD0A4\uB294 OpenAI-compatible \uACC4\uC5F4\uCC98\uB7FC \uBCF4\uC785\uB2C8\uB2E4.",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek provider\uC5D0\uB294 Gemini \uD0A4(AIza...)\uAC00 \uC544\uB2C8\uB77C \uD574\uB2F9 provider \uD0A4\uB97C \uB123\uC5B4\uC57C \uD569\uB2C8\uB2E4.",
  optionsAiBaseUrl: "Base URL",
  optionsAiBaseUrlHint: "\uC608\uC2DC: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
  optionsAiModel: "\uBAA8\uB378 \uC774\uB984",
  optionsAiModelHint: "\uC608\uC2DC: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
  optionsAiPrompt: "\uC815\uB9AC \uADDC\uCE59 \uD504\uB86C\uD504\uD2B8",
  optionsAiPromptHint: "\uC694\uC57D \uAE38\uC774, \uD0DC\uADF8 \uC2A4\uD0C0\uC77C, \uC6D0\uD558\uB294 frontmatter \uD544\uB4DC\uB97C \uC790\uC720\uB86D\uAC8C \uC801\uC5B4\uC8FC\uC138\uC694.",
  optionsAiLocked: "AI \uC815\uB9AC\uB294 Pro\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsAiInvalidBaseUrl: "AI Base URL \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  optionsAiPermissionDenied: "\uC120\uD0DD\uD55C AI \uC5D4\uB4DC\uD3EC\uC778\uD2B8 \uAD8C\uD55C\uC774 \uC5C6\uC5B4 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsAiSaved: "AI \uC124\uC815\uACFC \uAD8C\uD55C\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  optionsIncludeImages: "\uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1\uC744 \uAC19\uC774 \uC800\uC7A5",
  optionsSave: "\uC124\uC815 \uC800\uC7A5",
  optionsSaved: "\uC124\uC815\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  optionsPendingSave: "\uBCC0\uACBD\uB428. \uC544\uB798 \uC124\uC815 \uC800\uC7A5\uC744 \uB20C\uB7EC\uC57C \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  optionsNoChanges: "\uC544\uC9C1 \uBCC0\uACBD \uC0AC\uD56D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  optionsStep1: "1. Obsidian \uD3F4\uB354 \uC5F0\uACB0",
  optionsStep2: "2. \uBA3C\uC800 \uBB34\uB8CC\uB85C \uC800\uC7A5\uD574\uBCF4\uAE30",
  optionsStep3: "3. \uADDC\uCE59 \uB610\uB294 AI \uC815\uB9AC\uAC00 \uD544\uC694\uD558\uBA74 Pro \uD65C\uC131\uD654",
  mdImageLabel: "\uC774\uBBF8\uC9C0",
  mdVideoLabel: "\uB3D9\uC601\uC0C1",
  mdVideoThumbnailLabel: "\uB3D9\uC601\uC0C1 \uC378\uB124\uC77C",
  mdVideoOnThreads: "Threads\uC5D0\uC11C \uBCF4\uAE30",
  mdSavedVideoFile: "\uC800\uC7A5\uD55C \uC601\uC0C1 \uD30C\uC77C",
  mdReplySection: "\uC791\uC131\uC790 \uC5F0\uC18D \uB2F5\uAE00",
  mdReplyLabel: "\uB2F5\uAE00",
  mdReplyImageLabel: "\uB2F5\uAE00 \uC774\uBBF8\uC9C0",
  mdUploadedMediaSection: "\uC5C5\uB85C\uB4DC\uD55C \uBBF8\uB514\uC5B4",
  mdSource: "\uC6D0\uBB38",
  mdAuthor: "\uC791\uC131\uC790",
  mdPublishedAt: "\uAC8C\uC2DC \uC2DC\uAC01",
  mdExternalLink: "\uC678\uBD80 \uB9C1\uD06C",
  mdWarning: "\uACBD\uACE0",
  mdSummary: "AI \uC694\uC57D",
  warnImageAccessFailed: "\uC77C\uBD80 \uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1\uC744 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD574 \uC6D0\uBCF8 \uB9C1\uD06C\uB97C \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
  warnImageDownloadOff: "\uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1 \uC800\uC7A5\uC774 \uAEBC\uC838 \uC788\uC5B4 \uC6D0\uBCF8 \uB9C1\uD06C\uB97C \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
  warnAiFailed: "AI \uC815\uB9AC\uC5D0 \uC2E4\uD328\uD574 \uC6D0\uBB38\uB9CC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: {reason}",
  warnAiPermissionMissing: "AI \uC5D4\uB4DC\uD3EC\uC778\uD2B8 \uAD8C\uD55C\uC774 \uC5C6\uC5B4 \uC6D0\uBB38\uB9CC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C AI \uC139\uC158\uC744 \uB2E4\uC2DC \uC800\uC7A5\uD574 \uC8FC\uC138\uC694.",
  warnAiMissingModel: "AI \uBAA8\uB378 \uC774\uB984\uC774 \uC5C6\uC5B4 \uC6D0\uBB38\uB9CC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  warnNotionMediaUploadFailed: "Notion \uBBF8\uB514\uC5B4 \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD574 \uC6D0\uBCF8 \uB9C1\uD06C\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  errBrowserUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  errFolderNameFailed: "\uC800\uC7A5\uD560 \uD3F4\uB354 \uC774\uB984\uC744 \uACB0\uC815\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  errInvalidPath: "\uC798\uBABB\uB41C \uD30C\uC77C \uACBD\uB85C\uC785\uB2C8\uB2E4.",
  errNotionTokenMissing: "Notion integration token\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  errNotionPermissionMissing: "Notion API \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uB2E4\uC2DC \uC800\uC7A5\uD574 \uC8FC\uC138\uC694.",
  errNotionUnauthorized: "Notion \uD1A0\uD070\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uAC70\uB098 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  errNotionForbidden: "\uC120\uD0DD\uD55C Notion \uB300\uC0C1\uC5D0 \uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. page \uB610\uB294 data source\uB97C integration\uC5D0 \uC5F0\uACB0\uD588\uB294\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  errNotionParentNotFound: "\uC120\uD0DD\uD55C Notion page \uB610\uB294 data source\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. ID\uC640 \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  errNotionRateLimited: "Notion \uC694\uCCAD\uC774 \uB108\uBB34 \uB9CE\uC2B5\uB2C8\uB2E4. {seconds}\uCD08 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
  errNotionValidation: "Notion \uC694\uCCAD \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  errNotionRequestFailed: "Notion \uC800\uC7A5 \uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  fallbackNoFolder: "\uC5F0\uACB0\uB41C \uD3F4\uB354\uAC00 \uC5C6\uC5B4",
  fallbackPermissionDenied: "\uD3F4\uB354 \uAD8C\uD55C\uC774 \uC5C6\uC5B4",
  fallbackDirectFailed: "\uD3F4\uB354\uC5D0 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD574",
  fallbackZipMessage: " \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD588\uC2B5\uB2C8\uB2E4.",
  errNotPermalink: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  errPostContentNotFound: "\uAC8C\uC2DC\uBB3C \uB0B4\uC6A9\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB85C\uADF8\uC778 \uC0C1\uD0DC\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694."
};
var en = {
  uiLanguageLabel: "Language",
  uiLanguageKo: "\uD55C\uAD6D\uC5B4",
  uiLanguageEn: "English",
  popupTitle: "Save Current Post",
  popupSave: "Save Current Post",
  popupSettings: "Settings",
  popupPromoTitle: "Reserved Area",
  popupPromoDescription: "This space is reserved for future guidance and recommendations.",
  popupSubtitleDirect: "Saving directly to your connected Obsidian folder.",
  popupSubtitleDownload: "No folder connected. Saving as a download. Connect a folder in settings.",
  popupSubtitleConnected: "Saving directly to your connected Obsidian folder.",
  popupSubtitlePermissionCheck: "Folder connected, but permission may need re-confirmation.",
  popupSubtitleNoFolder: "Saves directly when a folder is connected, otherwise downloads a file.",
  popupSubtitleUnsupported: "This browser only supports file downloads.",
  popupSubtitleNotion: "Saving to your configured Notion destination.",
  popupSubtitleNotionSetup: "To use Notion saving, enter your token and destination in settings first.",
  popupRecentSaves: "Recent Saves",
  popupClearAll: "Clear All",
  popupEmpty: "No saved posts yet.",
  popupResave: "Re-save",
  popupExpand: "Expand",
  popupCollapse: "Collapse",
  popupDelete: "Delete",
  statusReady: "Ready to save from a post permalink page.",
  statusReadyDirect: "Ready. Press to save directly to your Obsidian folder.",
  statusReadyDownload: "Ready. Press to download the file.",
  statusUnsupported: "Please open an individual post page first.",
  statusNoTab: "Could not find an active tab.",
  statusSaving: "Saving\u2026",
  statusSavedDirect: "Saved directly to your Obsidian folder.",
  statusSavedZip: "Saved. Download started.",
  statusSavedNotion: "Saved to Notion.",
  statusDuplicate: "Already saved \u2014 updated with the latest content.",
  statusDuplicateWarning: "Already saved, updated: ",
  statusAlreadySaved: "This post is already saved. Use 'Re-save' from recent saves to save again.",
  statusNotionSetupRequired: "To use Notion saving, enter your token and destination in settings first.",
  statusError: "An unknown error occurred.",
  statusResaving: "Preparing your file\u2026",
  statusResaved: "Download started.",
  statusResavedNotion: "Saved to Notion as a new page.",
  statusRecentNotFound: "Could not find the recent save record.",
  statusDeletedRecent: "Deleted from recent saves.",
  statusClearedRecents: "All recent saves cleared.",
  statusExtractFailed: "Could not read the post.",
  statusTabError: "Could not read active tab information.",
  statusRedownloadError: "Error during re-download.",
  statusRetry: "Retry",
  statusResaveButton: "Re-save",
  optionsTitle: "Save Threads posts to Obsidian or Notion, with auto-organize.",
  optionsTitleObsidianOnly: "Save Threads posts to Obsidian, with auto-organize.",
  optionsSubtitle: "Free saving, Pro only when needed.",
  optionsSubtitleObsidianOnly: "Release-facing docs still describe the launch product, but the current UI only exposes Obsidian.",
  optionsPlanSpotlightFreeTitle: "Free",
  optionsPlanSpotlightFreeCopy: "Basic saving is ready to use.",
  optionsPlanSpotlightActiveTitle: "Pro active",
  optionsPlanSpotlightActiveCopy: "Pro features are enabled on this browser.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro needs activation",
  optionsPlanSpotlightNeedsActivationCopy: "The key is valid, but this device does not have an active seat yet.",
  optionsPlanSpotlightSeatMeta: "Seat {used}/{limit} \xB7 {device}",
  optionsAdSlotLabel: "Ad",
  optionsAdSlotTitle: "Ad placeholder",
  optionsAdSlotCopy: "Reserved for a future banner or announcement.",
  optionsFolderSection: "Connect Obsidian Folder",
  optionsFolderStatus: "Checking connected folder\u2026",
  optionsFolderLabel: "Current Folder",
  optionsFolderNotConnected: "Not connected",
  optionsFolderConnect: "Connect Folder",
  optionsFolderDisconnect: "Disconnect",
  optionsFolderUnsupported: "Folder connection not supported in this browser",
  optionsFolderUnsupportedStatus: "This browser cannot save directly to a folder. Files will be downloaded instead.",
  optionsFolderNotConnectedStatus: "No folder connected. Files will be downloaded when you save.",
  optionsFolderReady: "Folder connected. Files will be saved directly.",
  optionsFolderPermissionCheck: "Folder connected. Permission may be re-confirmed on next save.",
  optionsFolderPermissionLost: "Folder permission lost. Please reconnect your folder.",
  optionsFolderChecked: "Folder connection verified. Direct save will be attempted.",
  optionsFolderCancelled: "Folder selection cancelled.",
  optionsFolderError: "Error connecting folder.",
  optionsFolderConnectedSuccess: 'Connected the "{folder}" folder.',
  optionsFolderPathLabel: "Current Save Location",
  optionsFolderPathHint: "The browser cannot expose the OS absolute path, so this stays relative to the connected folder.",
  optionsFolderPathUnavailable: "Shown after you connect a folder",
  optionsSaveTarget: "Save target",
  optionsSaveTargetHint: "On PC, choose either Obsidian or Notion as the default destination.",
  optionsSaveTargetHintObsidianOnly: "The current UI only exposes Obsidian. Notion stays hidden in settings while the integration is being prepared internally.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetNotion: "Notion",
  optionsSaveTargetNotionHidden: "Notion (Hidden for now)",
  optionsNotionSection: "Notion Connection",
  optionsNotionSubtitle: "Notion is connected through OAuth so the browser never asks for an internal token. Connect once, choose a default destination, and save after that.",
  optionsNotionConnectionLabel: "Connection",
  optionsNotionConnectButton: "Connect Notion",
  optionsNotionDisconnectButton: "Disconnect",
  optionsNotionConnectHint: "A Notion approval tab will open. After approval, return here and the connection state will refresh automatically.",
  optionsNotionConnected: "A Notion workspace is connected.",
  optionsNotionDisconnected: "Notion is not connected yet.",
  optionsNotionConnectStarted: "Opened the Notion connection tab. Return here after approval.",
  optionsNotionConnectFailed: "Could not start the Notion connection flow.",
  optionsNotionDisconnectedSaved: "Disconnected the Notion workspace.",
  optionsNotionDisconnectFailed: "Could not disconnect Notion.",
  optionsNotionParentType: "Save mode",
  optionsNotionParentTypeHint: "Choose whether the default destination should be a page or a data source in the connected workspace.",
  optionsNotionParentTypePage: "Parent page",
  optionsNotionParentTypeDataSource: "Data source",
  optionsNotionSelectedTarget: "Default destination",
  optionsNotionSelectedTargetHint: "This is where the save button will send new Threads captures by default.",
  optionsNotionTargetNotSelected: "No default destination has been selected yet.",
  optionsNotionTargetRequired: "Choose a default Notion destination first.",
  optionsNotionTargetSaved: "Saved the default Notion destination.",
  optionsNotionTargetSaveFailed: "Could not save the default Notion destination.",
  optionsNotionSearchLabel: "Find a destination",
  optionsNotionSearchHint: "Search pages or data sources you have granted this integration access to.",
  optionsNotionSearchPlaceholderPage: "For example: Product Notes",
  optionsNotionSearchPlaceholderDataSource: "For example: Threads Inbox",
  optionsNotionSearchButton: "Search destinations",
  optionsNotionResultsLabel: "Results",
  optionsNotionResultsHint: "Choose one result and set it as the default save destination.",
  optionsNotionUseLocationButton: "Use as default destination",
  optionsNotionSearchLoaded: "Loaded Notion destinations.",
  optionsNotionSearchEmpty: "No matching Notion destinations were found.",
  optionsNotionSearchFailed: "Could not load Notion destinations.",
  optionsNotionOAuthRequiresPro: "Notion OAuth saving is available in Pro only.",
  optionsNotionConnectFirst: "Connect Notion first.",
  optionsNotionToken: "Integration token",
  optionsNotionTokenHint: "Paste your Notion internal integration token. It is stored only in this browser profile.",
  optionsNotionParentPage: "Parent page ID or URL",
  optionsNotionParentPageHint: "You can paste a full Notion page URL or just the page ID.",
  optionsNotionDataSource: "Data source ID or URL",
  optionsNotionDataSourceHint: "Paste a full Notion data source URL or just its ID. Title, tags, dates, and similar properties are mapped automatically when possible.",
  optionsNotionDataSourceLocked: "Data source saving is available in Pro only.",
  optionsNotionUploadMedia: "Upload media into Notion",
  optionsNotionUploadMediaHint: "Upload images and videos as Notion-managed files instead of leaving them as remote links. If upload fails, the save falls back to links.",
  optionsNotionUploadMediaLocked: "Notion-managed media upload is available in Pro only.",
  optionsNotionTokenRequired: "A Notion integration token is required to use Notion saving.",
  optionsNotionParentPageRequired: "A Notion parent page ID or URL is required to use Notion saving.",
  optionsNotionInvalidPage: "The Notion parent page ID or URL format is not valid.",
  optionsNotionDataSourceRequired: "A Notion data source ID or URL is required to use data source saving.",
  optionsNotionInvalidDataSource: "The Notion data source ID or URL format is not valid.",
  optionsNotionPermissionDenied: "Permission to access the Notion API was denied, so settings were not saved.",
  optionsBasicSection: "Basic Saving",
  optionsBasicSubtitle: "",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Pro Settings",
  optionsProSubtitle: "Open only when needed. This is where rules and AI organization live.",
  optionsProAiNote: "AI is not included automatically. It runs only after you add your own API key.",
  optionsProCompareFree: "Free",
  optionsProComparePro: "Pro",
  compareRowSave: "Save",
  compareRowImages: "Images",
  compareRowReplies: "Thread replies",
  compareRowDuplicates: "Skip duplicates",
  compareRowFilename: "File name format",
  compareRowFolder: "Save folder",
  compareRowNotionDataSource: "Notion data source",
  compareRowNotionMediaUpload: "Notion media upload",
  compareRowAiSummary: "AI summary",
  compareRowAiTags: "AI tags",
  compareRowAiFrontmatter: "AI frontmatter",
  optionsProBadgeFree: "Free",
  optionsProBadgeActive: "Pro",
  optionsProStatusFree: "You are on Free. Saving already works, and Pro is only needed when you want rules or AI.",
  optionsProStatusActive: "Pro active. Rule-based organization and AI are available below.",
  optionsProStatusExpired: "This Pro key has expired. Free saving still works.",
  optionsProStatusInvalid: "This Pro key is not valid. Free saving still works.",
  optionsProStatusSeatLimit: "This Pro key is already active on 3 devices. Release one on another device first.",
  optionsProStatusNeedsActivation: "The Pro key is valid, but this device does not have an active seat yet.",
  optionsProStatusOffline: "Could not reach the server, so the most recent activation state is being used.",
  optionsProStatusRevoked: "This Pro key can no longer be used.",
  optionsProHolderLabel: "Holder",
  optionsProExpiresLabel: "Expires",
  optionsProUnlockLabel: "Pro key",
  optionsProUnlockHint: "Paste the Pro key from your purchase email to activate on this browser.",
  optionsProUnlockPlaceholder: "Paste your Pro key here",
  optionsProSalesLink: "Get Pro",
  optionsProActivate: "Activate Pro",
  optionsProClear: "Remove",
  optionsProActivated: "Pro activated.",
  optionsProRemoved: "The Pro key has been removed.",
  optionsProEmptyKey: "Enter a Pro key first.",
  optionsProLocalOnly: "Your posts stay on your device. No sign-in required.",
  optionsFileRules: "File Rules",
  optionsFilenamePattern: "File Name Format",
  optionsFilenamePatternLocked: "Free uses a default file name. Pro lets you set your own format.",
  optionsSavePathPattern: "Subfolder Path",
  optionsSavePathTokens: "Examples: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free saves to the root of your connected folder. Pro lets you automatically sort into subfolders by date, author, or topic.",
  optionsFilenameTokens: "Available: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI Organization",
  optionsAiSubtitle: "Choose a provider and the default base URL and model are filled in for you.",
  optionsAiQuickstart: "Most users only need a provider and API key. After changing them, press Save Settings below to apply them.",
  optionsAiAdvancedSummary: "Show advanced settings",
  optionsAiEnable: "Enable AI organization",
  optionsAiProvider: "Provider",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini, and Ollama can start from presets. Custom is for any OpenAI-compatible endpoint.",
  optionsAiProviderOpenAi: "OpenAI",
  optionsAiProviderOpenRouter: "OpenRouter",
  optionsAiProviderDeepSeek: "DeepSeek",
  optionsAiProviderGemini: "Gemini",
  optionsAiProviderOllama: "Ollama",
  optionsAiProviderCustom: "Custom",
  optionsAiApiKey: "API key",
  optionsAiApiKeyHint: "Gemini keys usually start with AIza, while OpenAI/OpenRouter/DeepSeek keys usually start with sk-. Leave this blank only for local endpoints like Ollama when no key is required.",
  optionsAiApiKeyRequired: "The selected provider requires an API key.",
  optionsAiKeyMismatchGemini: "Gemini needs a Google Gemini API key. The current key looks like an OpenAI-compatible key.",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek providers require their own key, not a Gemini key that starts with AIza.",
  optionsAiBaseUrl: "Base URL",
  optionsAiBaseUrlHint: "Examples: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
  optionsAiModel: "Model name",
  optionsAiModelHint: "Examples: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
  optionsAiPrompt: "Organization prompt",
  optionsAiPromptHint: "Describe your summary length, tag style, and desired frontmatter fields.",
  optionsAiLocked: "AI organization is available in Pro only.",
  optionsAiInvalidBaseUrl: "The AI base URL is not valid.",
  optionsAiPermissionDenied: "Permission for the selected AI endpoint was denied, so settings were not saved.",
  optionsAiSaved: "AI settings and endpoint permission saved.",
  optionsIncludeImages: "Save images and video files",
  optionsSave: "Save Settings",
  optionsSaved: "Settings saved.",
  optionsPendingSave: "Changed. Press Save Settings below to apply it.",
  optionsNoChanges: "No changes yet.",
  optionsStep1: "1. Connect Obsidian folder",
  optionsStep2: "2. Try saving for free first",
  optionsStep3: "3. Activate Pro when you want rules or AI organization",
  mdImageLabel: "Image",
  mdVideoLabel: "Video",
  mdVideoThumbnailLabel: "Video thumbnail",
  mdVideoOnThreads: "Open on Threads",
  mdSavedVideoFile: "Saved video file",
  mdReplySection: "Author Replies",
  mdReplyLabel: "Reply",
  mdReplyImageLabel: "Reply image",
  mdUploadedMediaSection: "Uploaded media",
  mdSource: "Source",
  mdAuthor: "Author",
  mdPublishedAt: "Published at",
  mdExternalLink: "External link",
  mdWarning: "Warning",
  mdSummary: "AI Summary",
  warnImageAccessFailed: "Some images or videos couldn't be saved; original links were kept.",
  warnImageDownloadOff: "Image/video saving is off; original links were kept.",
  warnAiFailed: "AI organization failed, so the original note was saved instead: {reason}",
  warnAiPermissionMissing: "AI endpoint permission is missing, so the original note was saved. Re-save the AI section in settings.",
  warnAiMissingModel: "No AI model name is configured, so the original note was saved.",
  warnNotionMediaUploadFailed: "Notion media upload failed, so remote links were saved instead.",
  errBrowserUnsupported: "This browser cannot save directly to an Obsidian folder.",
  errFolderNameFailed: "Could not determine a folder name for saving.",
  errInvalidPath: "Invalid file path.",
  errNotionTokenMissing: "No Notion integration token is configured.",
  errNotionPermissionMissing: "Permission for the Notion API is missing. Re-save settings first.",
  errNotionUnauthorized: "The Notion token is invalid or expired.",
  errNotionForbidden: "This integration cannot access the selected Notion destination. Make sure the page or data source is shared with the integration.",
  errNotionParentNotFound: "The selected Notion page or data source could not be found. Check the ID and connection.",
  errNotionRateLimited: "Too many Notion requests. Try again in {seconds} seconds.",
  errNotionValidation: "The Notion request is not valid.",
  errNotionRequestFailed: "The Notion save request failed.",
  fallbackNoFolder: "No folder connected,",
  fallbackPermissionDenied: "No folder permission,",
  fallbackDirectFailed: "Could not save to folder,",
  fallbackZipMessage: " saved as download instead.",
  errNotPermalink: "Please open an individual post page first.",
  errPostContentNotFound: "Could not load post content. Please make sure you are logged in."
};
var dictionaries = {
  ko,
  en,
  ...localizedMessages
};
function detectDefaultLocale() {
  return detectLocaleFromNavigator(typeof navigator !== "undefined" ? navigator.language : null, "en");
}
function resolveMessages(locale) {
  return dictionaries[locale ?? detectDefaultLocale()];
}
async function t(locale) {
  return resolveMessages(locale);
}
function tSync(locale) {
  return dictionaries[locale];
}

// ../shared/src/markdown.ts
function formatYamlStringValue(value) {
  if (!value) {
    return "null";
  }
  return JSON.stringify(value);
}
function formatYamlDateValue(value) {
  if (!value) {
    return "null";
  }
  return value;
}
function formatYamlString(value) {
  return JSON.stringify(value);
}
function formatFrontmatterPrimitive(value) {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return formatYamlString(value);
  }
  return String(value);
}
function renderFrontmatterField(key, value) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [`${key}: []`];
    }
    return [`${key}:`, ...value.map((item) => `  - ${formatFrontmatterPrimitive(item)}`)];
  }
  return [`${key}: ${formatFrontmatterPrimitive(value)}`];
}
function renderImageBlock(refs, labelPrefix) {
  const lines = [];
  for (const [index, ref] of refs.entries()) {
    lines.push(`![${labelPrefix} ${index + 1}](${ref})`, "");
  }
  return lines;
}
function renderVideoBlock(videoRef, canonicalUrl, msg) {
  if (!videoRef) {
    return [];
  }
  const lines = [`## ${msg.mdVideoLabel}`, "", `${msg.mdVideoOnThreads}: ${canonicalUrl}`];
  if (videoRef.file && !/^https?:\/\//i.test(videoRef.file)) {
    lines.push(`${msg.mdSavedVideoFile}: ${videoRef.file}`);
  }
  lines.push("");
  if (videoRef.thumbnail) {
    lines.push(`![${msg.mdVideoThumbnailLabel}](${videoRef.thumbnail})`, "");
  }
  return lines;
}
async function renderReplySectionWithMessages(post, mediaRefs, msg) {
  if (post.authorReplies.length === 0) {
    return [];
  }
  const section = [`## ${msg.mdReplySection}`, ""];
  post.authorReplies.forEach((reply, index) => {
    section.push(`### ${msg.mdReplyLabel} ${index + 1}`, "", `${msg.mdSource}: ${reply.canonicalUrl}`);
    section.push(`${msg.mdAuthor}: @${reply.author}`);
    if (reply.publishedAt) {
      section.push(`${msg.mdPublishedAt}: ${reply.publishedAt}`);
    }
    if (reply.externalUrl) {
      section.push(`${msg.mdExternalLink}: ${reply.externalUrl}`);
    }
    section.push("", reply.text.trim(), "");
    const replyVideoRef = mediaRefs.replyVideos[index] ?? null;
    if (reply.sourceType === "video") {
      section.push(`${msg.mdVideoOnThreads}: ${reply.canonicalUrl}`);
      if (replyVideoRef?.file && !/^https?:\/\//i.test(replyVideoRef.file)) {
        section.push(`${msg.mdSavedVideoFile}: ${replyVideoRef.file}`);
      }
      section.push("");
      if (replyVideoRef?.thumbnail) {
        section.push(`![${msg.mdVideoThumbnailLabel}](${replyVideoRef.thumbnail})`, "");
      }
    }
    section.push(...renderImageBlock(mediaRefs.replyImages[index] ?? [], `${msg.mdReplyImageLabel} ${index + 1}`));
  });
  return section;
}
async function buildMarkdownBodyWithMessages(post, mediaRefs, warning, aiResult, msg) {
  const body = [`# ${post.title}`, "", `${msg.mdSource}: ${post.canonicalUrl}`, `${msg.mdAuthor}: @${post.author}`];
  if (post.publishedAt) {
    body.push(`${msg.mdPublishedAt}: ${post.publishedAt}`);
  }
  if (post.externalUrl) {
    body.push(`${msg.mdExternalLink}: ${post.externalUrl}`);
  }
  if (warning) {
    body.push(`${msg.mdWarning}: ${warning}`);
  }
  if (aiResult?.summary) {
    body.push("", `## ${msg.mdSummary}`, "", aiResult.summary, "");
  } else {
    body.push("");
  }
  body.push(post.text.trim(), "");
  if (post.sourceType === "video") {
    body.push(...renderVideoBlock(mediaRefs.postVideo, post.canonicalUrl, msg));
  }
  if (mediaRefs.postImages.length > 0) {
    body.push(`## ${msg.mdImageLabel}`, "");
    body.push(...renderImageBlock(mediaRefs.postImages, msg.mdImageLabel));
  }
  body.push(...await renderReplySectionWithMessages(post, mediaRefs, msg));
  return body;
}
async function renderMarkdown(post, mediaRefs, warning, aiResult = null, locale) {
  const msg = locale ? tSync(locale) : await t();
  const hasImages = post.imageUrls.length > 0 || post.authorReplies.some((reply) => reply.imageUrls.length > 0);
  const hasExternalUrl = Boolean(post.externalUrl || post.authorReplies.some((reply) => reply.externalUrl));
  const tags = Array.from(/* @__PURE__ */ new Set(["threads", ...aiResult?.tags ?? []]));
  const frontmatter = [
    "---",
    `title: ${formatYamlStringValue(post.title)}`,
    `author: ${formatYamlStringValue(post.author)}`,
    ...renderFrontmatterField("tags", tags),
    ...aiResult?.summary ? renderFrontmatterField("summary", aiResult.summary) : [],
    `canonical_url: ${formatYamlStringValue(post.canonicalUrl)}`,
    `shortcode: ${formatYamlStringValue(post.shortcode)}`,
    `published_at: ${formatYamlDateValue(post.publishedAt)}`,
    `captured_at: ${formatYamlDateValue(post.capturedAt)}`,
    `source_type: ${formatYamlStringValue(post.sourceType)}`,
    ...post.sourceType === "video" && post.thumbnailUrl ? renderFrontmatterField("thumbnail_url", post.thumbnailUrl) : [],
    ...post.sourceType === "video" && post.videoUrl ? renderFrontmatterField("video_url", post.videoUrl) : [],
    `has_images: ${hasImages}`,
    `has_external_url: ${hasExternalUrl}`,
    `quoted_post_url: ${formatYamlStringValue(post.quotedPostUrl)}`,
    `replied_to_url: ${formatYamlStringValue(post.repliedToUrl)}`,
    `author_reply_count: ${post.authorReplies.length}`,
    ...Object.entries(aiResult?.frontmatter ?? {}).flatMap(([key, value]) => renderFrontmatterField(key, value)),
    "---",
    ""
  ];
  const body = await buildMarkdownBodyWithMessages(post, mediaRefs, warning, aiResult, msg);
  return [...frontmatter, ...body].join("\n").trimEnd() + "\n";
}
async function renderNotionMarkdown(post, mediaRefs, warning, aiResult = null, locale) {
  const msg = locale ? tSync(locale) : await t();
  const body = await buildMarkdownBodyWithMessages(post, mediaRefs, warning, aiResult, msg);
  return body.join("\n").trimEnd() + "\n";
}

// ../shared/src/notion.ts
var NOTION_API_URL = "https://api.notion.com/v1/pages";
var NOTION_BLOCKS_API_URL = "https://api.notion.com/v1/blocks";
var NOTION_DATA_SOURCE_API_URL = "https://api.notion.com/v1/data_sources";
var NOTION_FILE_UPLOAD_API_URL = "https://api.notion.com/v1/file_uploads";
var NOTION_VERSION = "2026-03-11";
var RICH_TEXT_CHUNK_LENGTH = 2e3;
var SINGLE_PART_UPLOAD_LIMIT_BYTES = 20 * 1024 * 1024;
var MULTI_PART_CHUNK_BYTES = 10 * 1024 * 1024;
function normalizeUuid(value) {
  const compact = value.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(compact)) {
    throw new Error("invalid_notion_page_id");
  }
  return [
    compact.slice(0, 8),
    compact.slice(8, 12),
    compact.slice(12, 16),
    compact.slice(16, 20),
    compact.slice(20, 32)
  ].join("-");
}
function normalizeNotionPageIdInput(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("missing_notion_page_id");
  }
  const match = trimmed.match(/[0-9a-f]{32}|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/i);
  if (!match?.[0]) {
    throw new Error("invalid_notion_page_id");
  }
  return normalizeUuid(match[0]);
}
function resolveMessages2(locale) {
  return locale ? tSync(locale) : t();
}
function mapNotionError(status, body, retryAfter, msg) {
  const apiMessage = body?.message?.trim();
  if (status === 401) {
    return msg.errNotionUnauthorized;
  }
  if (status === 403) {
    return msg.errNotionForbidden;
  }
  if (status === 404) {
    return msg.errNotionParentNotFound;
  }
  if (status === 429) {
    const seconds = retryAfter?.trim() || "60";
    return msg.errNotionRateLimited.replace("{seconds}", seconds);
  }
  if (status === 400) {
    return apiMessage ? `${msg.errNotionValidation}: ${apiMessage}` : msg.errNotionValidation;
  }
  return apiMessage ? `${msg.errNotionRequestFailed}: ${apiMessage}` : msg.errNotionRequestFailed;
}
function normalizePropertyName(value) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "");
}
function chunkRichText(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  const chunks = [];
  for (let index = 0; index < trimmed.length; index += RICH_TEXT_CHUNK_LENGTH) {
    chunks.push({
      type: "text",
      text: {
        content: trimmed.slice(index, index + RICH_TEXT_CHUNK_LENGTH)
      }
    });
  }
  return chunks;
}
function buildNotionMediaRefs(post, includeImages) {
  return {
    postImages: includeImages ? [...post.imageUrls] : [],
    postVideo: includeImages && post.sourceType === "video" ? {
      file: post.videoUrl,
      thumbnail: post.thumbnailUrl
    } : null,
    replyImages: post.authorReplies.map((reply) => includeImages ? [...reply.imageUrls] : []),
    replyVideos: post.authorReplies.map(
      (reply) => includeImages && reply.sourceType === "video" ? {
        file: reply.videoUrl,
        thumbnail: reply.thumbnailUrl
      } : null
    )
  };
}
function hasAnyMedia(post) {
  return post.imageUrls.length > 0 || Boolean(post.videoUrl) || post.sourceType === "video" && Boolean(post.thumbnailUrl) || post.authorReplies.some((reply) => reply.imageUrls.length > 0 || Boolean(reply.videoUrl) || reply.sourceType === "video" && Boolean(reply.thumbnailUrl));
}
function combineWarnings(...values) {
  const unique = Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean)));
  return unique.length > 0 ? unique.join(" | ") : null;
}
async function notionRequest(url, token, msg, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "notion-version": NOTION_VERSION,
      ...init?.headers ?? {}
    }
  });
  const retryAfter = response.headers.get("retry-after");
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(mapNotionError(response.status, responseBody, retryAfter, msg));
  }
  return responseBody ?? {};
}
async function notionUploadRequest(url, token, msg, formData) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "notion-version": NOTION_VERSION
    },
    body: formData
  });
  const retryAfter = response.headers.get("retry-after");
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(mapNotionError(response.status, responseBody, retryAfter, msg));
  }
  return responseBody ?? {};
}
async function retrieveDataSource(token, dataSourceId, msg) {
  return await notionRequest(`${NOTION_DATA_SOURCE_API_URL}/${dataSourceId}`, token, msg, {
    method: "GET"
  });
}
function matchAny(value, patterns) {
  return patterns.some((pattern) => value.includes(pattern));
}
function resolveNamedOption(options, preferred) {
  if (!preferred.trim()) {
    return null;
  }
  const normalizedPreferred = normalizePropertyName(preferred);
  const matched = (options ?? []).find((option) => normalizePropertyName(option.name ?? "") === normalizedPreferred);
  return matched?.name ?? preferred;
}
function buildAutoPropertyValue(propertyName, schema, post, aiResult) {
  const normalizedName = normalizePropertyName(propertyName);
  const propertyType = schema.type ?? "";
  const tags = Array.from(/* @__PURE__ */ new Set(["threads", ...aiResult?.tags ?? []]));
  const hasImages = post.imageUrls.length > 0 || post.authorReplies.some((reply) => reply.imageUrls.length > 0);
  const hasExternalUrl = Boolean(post.externalUrl || post.authorReplies.some((reply) => reply.externalUrl));
  if (propertyType === "title") {
    return {
      title: chunkRichText(post.title)
    };
  }
  if (propertyType === "url") {
    if (matchAny(normalizedName, ["canonicalurl", "sourceurl", "source", "threadurl", "threadsurl", "url", "link"])) {
      return { url: post.canonicalUrl };
    }
    if (matchAny(normalizedName, ["externalurl", "externallink", "articleurl"])) {
      return post.externalUrl ? { url: post.externalUrl } : null;
    }
    return null;
  }
  if (propertyType === "rich_text") {
    if (matchAny(normalizedName, ["author", "username", "handle", "creator"])) {
      return { rich_text: chunkRichText(`@${post.author}`) };
    }
    if (matchAny(normalizedName, ["canonicalurl", "sourceurl", "threadurl", "threadsurl", "source", "url", "link"])) {
      return { rich_text: chunkRichText(post.canonicalUrl) };
    }
    if (matchAny(normalizedName, ["summary", "aisummary"])) {
      return aiResult?.summary ? { rich_text: chunkRichText(aiResult.summary) } : null;
    }
    if (matchAny(normalizedName, ["shortcode", "postid"])) {
      return { rich_text: chunkRichText(post.shortcode) };
    }
    if (matchAny(normalizedName, ["sourcetype", "contenttype", "type"])) {
      return { rich_text: chunkRichText(post.sourceType) };
    }
    if (matchAny(normalizedName, ["externalurl", "externallink", "articleurl"])) {
      return post.externalUrl ? { rich_text: chunkRichText(post.externalUrl) } : null;
    }
    return null;
  }
  if (propertyType === "date") {
    if (matchAny(normalizedName, ["capturedat", "savedat", "archivedat", "importedat", "clippedat"])) {
      return { date: { start: post.capturedAt } };
    }
    if (matchAny(normalizedName, ["publishedat", "publisheddate", "published", "date"])) {
      return { date: { start: post.publishedAt ?? post.capturedAt } };
    }
    return null;
  }
  if (propertyType === "number") {
    if (matchAny(normalizedName, ["authorreplycount", "replycount", "replies"])) {
      return { number: post.authorReplies.length };
    }
    return null;
  }
  if (propertyType === "checkbox") {
    if (matchAny(normalizedName, ["hasimages", "hasmedia", "images"])) {
      return { checkbox: hasImages };
    }
    if (matchAny(normalizedName, ["hasexternalurl", "haslink", "hasexternallink"])) {
      return { checkbox: hasExternalUrl };
    }
    return null;
  }
  if (propertyType === "multi_select") {
    if (matchAny(normalizedName, ["tags", "tag", "topics", "labels"])) {
      return {
        multi_select: tags.map((tag) => {
          const optionName = resolveNamedOption(schema.multi_select?.options, tag) ?? tag;
          return { name: optionName };
        })
      };
    }
    return null;
  }
  if (propertyType === "select") {
    if (matchAny(normalizedName, ["sourcetype", "contenttype", "type"])) {
      const optionName = resolveNamedOption(schema.select?.options, post.sourceType);
      return optionName ? { select: { name: optionName } } : null;
    }
    return null;
  }
  if (propertyType === "status") {
    if (matchAny(normalizedName, ["status", "contentstatus"])) {
      const optionName = resolveNamedOption(schema.status?.options, "captured");
      return optionName ? { status: { name: optionName } } : null;
    }
    return null;
  }
  return null;
}
function buildDataSourceProperties(schema, post, aiResult) {
  const properties = {};
  for (const [propertyName, propertySchema] of Object.entries(schema)) {
    const propertyKey = propertySchema.id ?? propertyName;
    const value = buildAutoPropertyValue(propertyName, propertySchema, post, aiResult);
    if (value) {
      properties[propertyKey] = value;
    }
  }
  return properties;
}
async function renderBundleFromAi(post, includeImages, inlineMedia, aiResult, aiWarning, locale) {
  const mediaRefs = buildNotionMediaRefs(post, includeImages && inlineMedia);
  const markdownContent = await renderNotionMarkdown(post, mediaRefs, aiWarning, aiResult, locale);
  return {
    title: post.title,
    markdownContent,
    aiResult,
    warning: aiWarning
  };
}
function guessExtension(url, contentType) {
  if (contentType?.includes("png")) {
    return "png";
  }
  if (contentType?.includes("webp")) {
    return "webp";
  }
  if (contentType?.includes("gif")) {
    return "gif";
  }
  if (contentType?.includes("mp4")) {
    return "mp4";
  }
  if (contentType?.includes("quicktime")) {
    return "mov";
  }
  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() ?? "bin";
}
function sanitizeUploadFilename(label, url, contentType) {
  const extension = guessExtension(url, contentType);
  const baseName = label.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "threads-media";
  return baseName.includes(".") ? baseName : `${baseName}.${extension}`;
}
async function fetchMediaBlob(url, label) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`media_fetch_failed:${label}`);
  }
  const blob = await response.blob();
  const filename = sanitizeUploadFilename(label, url, response.headers.get("content-type"));
  return { blob, filename };
}
async function createFileUpload(token, filename, contentType, blobSize, msg, numberOfParts) {
  return await notionRequest(NOTION_FILE_UPLOAD_API_URL, token, msg, {
    method: "POST",
    body: JSON.stringify({
      mode: numberOfParts && numberOfParts > 1 ? "multi_part" : "single_part",
      filename,
      content_type: contentType,
      ...numberOfParts && numberOfParts > 1 ? { number_of_parts: numberOfParts } : { content_length: blobSize }
    })
  });
}
async function completeFileUpload(token, fileUploadId, msg) {
  await notionRequest(`${NOTION_FILE_UPLOAD_API_URL}/${fileUploadId}/complete`, token, msg, {
    method: "POST",
    body: JSON.stringify({})
  });
}
async function uploadBlobToNotion(token, blob, filename, msg) {
  const contentType = blob.type || "application/octet-stream";
  const numberOfParts = blob.size > SINGLE_PART_UPLOAD_LIMIT_BYTES ? Math.ceil(blob.size / MULTI_PART_CHUNK_BYTES) : 1;
  const fileUpload = await createFileUpload(token, filename, contentType, blob.size, msg, numberOfParts);
  if (!fileUpload.id) {
    throw new Error("missing_file_upload_id");
  }
  const uploadUrl = fileUpload.upload_url || `${NOTION_FILE_UPLOAD_API_URL}/${fileUpload.id}/send`;
  if (numberOfParts === 1) {
    const formData = new FormData();
    formData.append("file", blob, filename);
    await notionUploadRequest(uploadUrl, token, msg, formData);
    return fileUpload.id;
  }
  let offset = 0;
  let partNumber = 1;
  while (offset < blob.size) {
    const nextChunk = blob.slice(offset, Math.min(offset + MULTI_PART_CHUNK_BYTES, blob.size), contentType);
    const formData = new FormData();
    formData.append("part_number", String(partNumber));
    formData.append("file", nextChunk, filename);
    await notionUploadRequest(uploadUrl, token, msg, formData);
    offset += MULTI_PART_CHUNK_BYTES;
    partNumber += 1;
  }
  await completeFileUpload(token, fileUpload.id, msg);
  return fileUpload.id;
}
async function uploadRemoteMediaFile(token, url, label, kind, msg) {
  const { blob, filename } = await fetchMediaBlob(url, label);
  const fileUploadId = await uploadBlobToNotion(token, blob, filename, msg);
  return { fileUploadId, kind, label };
}
async function buildUploadedMediaGroups(token, post, replyLabel, msg) {
  const groups = [];
  const postFiles = [];
  for (const [index, imageUrl] of post.imageUrls.entries()) {
    postFiles.push(await uploadRemoteMediaFile(token, imageUrl, `post-image-${index + 1}`, "image", msg));
  }
  if (post.sourceType === "video" && post.videoUrl) {
    postFiles.push(await uploadRemoteMediaFile(token, post.videoUrl, "post-video", "video", msg));
    if (post.thumbnailUrl) {
      postFiles.push(await uploadRemoteMediaFile(token, post.thumbnailUrl, "post-video-thumbnail", "image", msg));
    }
  }
  if (postFiles.length > 0) {
    groups.push({
      heading: post.title,
      files: postFiles
    });
  }
  for (const [index, reply] of post.authorReplies.entries()) {
    const replyFiles = await uploadReplyMediaFiles(token, reply, index, msg);
    if (replyFiles.length > 0) {
      groups.push({
        heading: `${replyLabel} ${index + 1}`,
        files: replyFiles
      });
    }
  }
  return groups;
}
async function uploadReplyMediaFiles(token, reply, replyIndex, msg) {
  const files = [];
  for (const [index, imageUrl] of reply.imageUrls.entries()) {
    files.push(await uploadRemoteMediaFile(token, imageUrl, `reply-${replyIndex + 1}-image-${index + 1}`, "image", msg));
  }
  if (reply.sourceType === "video" && reply.videoUrl) {
    files.push(await uploadRemoteMediaFile(token, reply.videoUrl, `reply-${replyIndex + 1}-video`, "video", msg));
    if (reply.thumbnailUrl) {
      files.push(await uploadRemoteMediaFile(token, reply.thumbnailUrl, `reply-${replyIndex + 1}-video-thumbnail`, "image", msg));
    }
  }
  return files;
}
function buildHeadingBlock(level, text) {
  const type = level === 2 ? "heading_2" : "heading_3";
  return {
    object: "block",
    type,
    [type]: {
      rich_text: chunkRichText(text)
    }
  };
}
function buildFileBlock(file) {
  return {
    object: "block",
    type: file.kind,
    [file.kind]: {
      type: "file_upload",
      file_upload: {
        id: file.fileUploadId
      },
      caption: chunkRichText(file.label)
    }
  };
}
function buildUploadedMediaBlocks(groups, sectionTitle) {
  const blocks = [];
  if (groups.length === 0) {
    return blocks;
  }
  blocks.push(buildHeadingBlock(2, sectionTitle));
  for (const group of groups) {
    blocks.push(buildHeadingBlock(3, group.heading));
    blocks.push(...group.files.map((file) => buildFileBlock(file)));
  }
  return blocks;
}
async function appendBlockChildren(token, blockId, children, msg) {
  if (children.length === 0) {
    return;
  }
  await notionRequest(`${NOTION_BLOCKS_API_URL}/${blockId}/children`, token, msg, {
    method: "PATCH",
    body: JSON.stringify({
      children
    })
  });
}
async function savePostToNotionCore(post, options) {
  const msg = await resolveMessages2(options.locale);
  const token = options.token.trim();
  if (!token) {
    throw new Error(msg.errNotionTokenMissing);
  }
  const targetId = normalizeNotionPageIdInput(options.targetId);
  let uploadedMediaBlocks = [];
  let mediaWarning = null;
  let inlineMedia = options.includeImages;
  if (options.includeImages && options.uploadMedia && hasAnyMedia(post)) {
    if (options.mediaPolicy && !options.mediaPolicy.allowMediaDownloads) {
      mediaWarning = options.mediaPolicy.fallbackWarning;
    } else {
      try {
        const uploadedMediaGroups = await buildUploadedMediaGroups(token, post, msg.mdReplyLabel, msg);
        uploadedMediaBlocks = buildUploadedMediaBlocks(uploadedMediaGroups, msg.mdUploadedMediaSection);
        inlineMedia = false;
      } catch {
        mediaWarning = combineWarnings(options.mediaPolicy?.fallbackWarning, msg.warnNotionMediaUploadFailed);
      }
    }
  }
  const bundle = await renderBundleFromAi(
    post,
    options.includeImages,
    inlineMedia,
    options.aiResult ?? null,
    options.aiWarning ?? null,
    options.locale
  );
  let properties;
  let parent;
  if (options.parentType === "data_source") {
    const dataSource = await retrieveDataSource(token, targetId, msg);
    properties = buildDataSourceProperties(dataSource.properties ?? {}, post, bundle.aiResult);
    parent = {
      data_source_id: targetId
    };
  } else {
    parent = {
      page_id: targetId
    };
  }
  const responseBody = await notionRequest(NOTION_API_URL, token, msg, {
    method: "POST",
    body: JSON.stringify({
      parent,
      ...properties ? { properties } : {},
      markdown: bundle.markdownContent
    })
  });
  if (!responseBody?.id || !responseBody.url) {
    throw new Error(msg.errNotionRequestFailed);
  }
  if (uploadedMediaBlocks.length > 0) {
    try {
      await appendBlockChildren(token, responseBody.id, uploadedMediaBlocks, msg);
    } catch {
      mediaWarning = combineWarnings(mediaWarning, msg.warnNotionMediaUploadFailed);
    }
  }
  return {
    pageId: responseBody.id,
    pageUrl: responseBody.url,
    title: bundle.title,
    warning: combineWarnings(bundle.warning, mediaWarning)
  };
}

// src/server/notion-service.ts
var NOTION_AUTHORIZE_URL = "https://api.notion.com/v1/oauth/authorize";
var NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";
var NOTION_API_URL2 = "https://api.notion.com/v1";
var NOTION_VERSION2 = "2026-03-11";
var OAUTH_SESSION_TTL_MS = 10 * 6e4;
function hashToken2(token) {
  return createHash2("sha256").update(token).digest("hex");
}
function readOauthConfig() {
  const clientId = process.env.THREADS_NOTION_CLIENT_ID?.trim();
  const clientSecret = process.env.THREADS_NOTION_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Notion OAuth is not configured on the web server. Set THREADS_NOTION_CLIENT_ID and THREADS_NOTION_CLIENT_SECRET."
    );
  }
  return { clientId, clientSecret };
}
function getEncryptionKey() {
  const secret = process.env.THREADS_NOTION_ENCRYPTION_SECRET?.trim() || process.env.THREADS_WEB_ADMIN_TOKEN?.trim();
  if (!secret) {
    throw new Error(
      "Notion encryption secret is not configured. Set THREADS_NOTION_ENCRYPTION_SECRET or THREADS_WEB_ADMIN_TOKEN."
    );
  }
  return createHash2("sha256").update(secret).digest();
}
function encryptSecret(value) {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}
function decryptSecret(value) {
  const [ivRaw, tagRaw, bodyRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !bodyRaw) {
    throw new Error("Invalid encrypted secret payload.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(bodyRaw, "base64url")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}
function getMatchingLicenseId(data, token) {
  return data.licenses.find((candidate) => candidate.token === token)?.id ?? null;
}
async function validateNotionClient(data, token, deviceId, deviceLabel) {
  const status = await getLicenseSeatStatus(data, token, deviceId, deviceLabel);
  if (!status.ok) {
    throw new Error(
      status.reason === "activation_required" ? "Pro activation is required." : status.reason === "seat_limit" ? "This Pro key has reached the device limit." : status.reason === "revoked" ? "This Pro key has been revoked." : status.reason === "expired" ? "This Pro key has expired." : "This Pro key is not valid."
    );
  }
  return {
    tokenHash: hashToken2(token),
    licenseId: getMatchingLicenseId(data, token),
    holder: status.holder,
    deviceId: status.deviceId,
    deviceLabel: status.deviceLabel
  };
}
function getActiveConnection(data, tokenHash, deviceId) {
  return data.notionConnections.find(
    (candidate) => candidate.tokenHash === tokenHash && candidate.deviceId === deviceId && candidate.status === "active"
  ) ?? null;
}
function getPendingSession(data, sessionId) {
  return data.notionAuthSessions.find((candidate) => candidate.id === sessionId && candidate.status === "pending") ?? null;
}
function buildConnectionSummary(connection) {
  return {
    connected: Boolean(connection && connection.status === "active"),
    workspaceId: connection?.workspaceId ?? null,
    workspaceName: connection?.workspaceName ?? null,
    workspaceIcon: connection?.workspaceIcon ?? null,
    selectedParentType: connection?.selectedParentType ?? null,
    selectedParentId: connection?.selectedParentId ?? null,
    selectedParentLabel: connection?.selectedParentLabel ?? null,
    selectedParentUrl: connection?.selectedParentUrl ?? null
  };
}
function buildRedirectUri(publicOrigin) {
  return `${publicOrigin.replace(/\/+$/, "")}/api/public/notion/oauth/callback`;
}
function buildNotionAuthorizeUrl(redirectUri, state) {
  const { clientId } = readOauthConfig();
  const url = new URL(NOTION_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("owner", "user");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}
async function notionTokenRequest(payload, config) {
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(NOTION_TOKEN_URL, {
    method: "POST",
    headers: {
      authorization: `Basic ${basic}`,
      "content-type": "application/json",
      "notion-version": NOTION_VERSION2
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message?.trim() || "Notion OAuth token exchange failed.");
  }
  return body ?? {};
}
async function exchangeOAuthCode(code, redirectUri) {
  return await notionTokenRequest(
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    },
    readOauthConfig()
  );
}
async function refreshOAuthToken(refreshToken) {
  return await notionTokenRequest(
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken
    },
    readOauthConfig()
  );
}
async function notionApiRequest(accessToken, path4, init) {
  const response = await fetch(`${NOTION_API_URL2}${path4}`, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      "notion-version": NOTION_VERSION2,
      ...init?.headers ?? {}
    }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message?.trim() || `Notion request failed (${response.status})`;
    throw new Error(message);
  }
  return body ?? {};
}
async function withConnectionAccessToken(data, connection, operation) {
  try {
    return await operation(decryptSecret(connection.accessTokenCiphertext));
  } catch (error) {
    if (!(error instanceof Error) || !/unauthorized|expired|401/i.test(error.message) || !connection.refreshTokenCiphertext) {
      throw error;
    }
    const refreshed = await refreshOAuthToken(decryptSecret(connection.refreshTokenCiphertext));
    if (!refreshed.access_token) {
      throw new Error("Notion token refresh failed.");
    }
    connection.accessTokenCiphertext = encryptSecret(refreshed.access_token);
    if (typeof refreshed.refresh_token === "string" && refreshed.refresh_token.trim()) {
      connection.refreshTokenCiphertext = encryptSecret(refreshed.refresh_token);
    }
    connection.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertNotionConnection(data, connection);
    return await operation(refreshed.access_token);
  }
}
function readText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function readTitleArray(value) {
  if (!Array.isArray(value)) {
    return null;
  }
  const parts = value.map((item) => {
    if (!item || typeof item !== "object") {
      return "";
    }
    const record = item;
    return readText(record.plain_text) || readText(record.text?.content) || "";
  }).filter(Boolean);
  return parts.length > 0 ? parts.join("") : null;
}
function deriveTitleFromUrl(url) {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    const slug = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "");
    const normalized = slug.replace(/-[0-9a-f]{32}$/i, "").replace(/[-_]+/g, " ").trim();
    return normalized || null;
  } catch {
    return null;
  }
}
function extractPageTitle(record) {
  const title = readTitleArray(record.title);
  if (title) {
    return title;
  }
  const properties = record.properties;
  if (properties && typeof properties === "object" && !Array.isArray(properties)) {
    for (const candidate of Object.values(properties)) {
      if (!candidate || typeof candidate !== "object") {
        continue;
      }
      const typed = candidate;
      if (typed.type === "title") {
        const propertyTitle = readTitleArray(typed.title);
        if (propertyTitle) {
          return propertyTitle;
        }
      }
    }
  }
  return deriveTitleFromUrl(readText(record.url)) || "Untitled";
}
function mapSearchResultToLocation(result) {
  if (!result || typeof result !== "object") {
    return null;
  }
  const record = result;
  const objectType = readText(record.object);
  const id = readText(record.id);
  const url = readText(record.url);
  if (!id || !url || objectType !== "page" && objectType !== "data_source") {
    return null;
  }
  return {
    id,
    type: objectType,
    label: extractPageTitle(record),
    url,
    subtitle: objectType === "data_source" ? "Data source" : "Page"
  };
}
async function searchLocationsWithToken(accessToken, parentType, query) {
  const payload = {
    page_size: 30
  };
  if (query.trim()) {
    payload.query = query.trim();
  }
  const response = await notionApiRequest(accessToken, "/search", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return (response.results ?? []).map((item) => mapSearchResultToLocation(item)).filter((item) => Boolean(item)).filter((item) => item.type === parentType).slice(0, 20);
}
async function chooseDefaultLocation(accessToken) {
  const pages = await searchLocationsWithToken(accessToken, "page", "");
  if (pages.length > 0) {
    return pages[0];
  }
  const dataSources = await searchLocationsWithToken(accessToken, "data_source", "");
  return dataSources[0] ?? null;
}
async function createNotionAuthStart(data, token, deviceId, deviceLabel, publicOrigin) {
  const validated = await validateNotionClient(data, token, deviceId, deviceLabel);
  const now = Date.now();
  const session = {
    id: crypto.randomUUID(),
    tokenHash: validated.tokenHash,
    licenseId: validated.licenseId,
    holder: validated.holder,
    deviceId: validated.deviceId,
    deviceLabel: validated.deviceLabel,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OAUTH_SESSION_TTL_MS).toISOString(),
    completedAt: null,
    status: "pending"
  };
  upsertNotionAuthSession(data, session);
  return {
    authorizeUrl: buildNotionAuthorizeUrl(buildRedirectUri(publicOrigin), session.id)
  };
}
async function completeNotionAuth(data, state, code, publicOrigin) {
  const session = getPendingSession(data, state);
  if (!session) {
    throw new Error("This Notion connection session is no longer valid.");
  }
  if (Date.parse(session.expiresAt) < Date.now()) {
    session.status = "expired";
    upsertNotionAuthSession(data, session);
    throw new Error("This Notion connection session has expired.");
  }
  const tokenResponse = await exchangeOAuthCode(code, buildRedirectUri(publicOrigin));
  if (!tokenResponse.access_token || !tokenResponse.workspace_id || !tokenResponse.bot_id) {
    throw new Error("Notion OAuth completed without a usable access token.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = data.notionConnections.find(
    (candidate) => candidate.tokenHash === session.tokenHash && candidate.deviceId === session.deviceId && candidate.status === "active"
  ) ?? null;
  const connection = {
    id: existing?.id ?? crypto.randomUUID(),
    tokenHash: session.tokenHash,
    licenseId: session.licenseId,
    holder: session.holder,
    deviceId: session.deviceId,
    deviceLabel: session.deviceLabel,
    workspaceId: tokenResponse.workspace_id,
    workspaceName: tokenResponse.workspace_name ?? null,
    workspaceIcon: tokenResponse.workspace_icon ?? null,
    botId: tokenResponse.bot_id,
    ownerUserId: tokenResponse.owner?.type === "user" ? tokenResponse.owner.user?.id ?? null : null,
    ownerUserName: tokenResponse.owner?.type === "user" ? tokenResponse.owner.user?.name ?? null : null,
    ownerUserEmail: tokenResponse.owner?.type === "user" ? tokenResponse.owner.user?.person?.email ?? null : null,
    accessTokenCiphertext: encryptSecret(tokenResponse.access_token),
    refreshTokenCiphertext: typeof tokenResponse.refresh_token === "string" && tokenResponse.refresh_token.trim() ? encryptSecret(tokenResponse.refresh_token) : null,
    selectedParentType: existing?.selectedParentType ?? null,
    selectedParentId: existing?.selectedParentId ?? null,
    selectedParentLabel: existing?.selectedParentLabel ?? null,
    selectedParentUrl: existing?.selectedParentUrl ?? null,
    connectedAt: existing?.connectedAt ?? now,
    updatedAt: now,
    revokedAt: null,
    status: "active"
  };
  if (!connection.selectedParentId) {
    const defaultLocation = await chooseDefaultLocation(tokenResponse.access_token);
    if (defaultLocation) {
      connection.selectedParentType = defaultLocation.type;
      connection.selectedParentId = defaultLocation.id;
      connection.selectedParentLabel = defaultLocation.label;
      connection.selectedParentUrl = defaultLocation.url;
    }
  }
  upsertNotionConnection(data, connection);
  session.completedAt = now;
  session.status = "completed";
  upsertNotionAuthSession(data, session);
  return connection;
}
function getNotionConnectionSummary(data, tokenHash, deviceId) {
  return buildConnectionSummary(getActiveConnection(data, tokenHash, deviceId));
}
function disconnectNotionConnection(data, tokenHash, deviceId) {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection) {
    return buildConnectionSummary(null);
  }
  connection.status = "revoked";
  connection.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
  connection.updatedAt = connection.revokedAt;
  upsertNotionConnection(data, connection);
  return buildConnectionSummary(null);
}
async function searchNotionLocations(data, tokenHash, deviceId, parentType, query) {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection) {
    throw new Error("Notion is not connected.");
  }
  return await withConnectionAccessToken(data, connection, async (accessToken) => await searchLocationsWithToken(accessToken, parentType, query));
}
async function selectNotionLocation(data, tokenHash, deviceId, parentType, targetId, targetLabel, targetUrl) {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection) {
    throw new Error("Notion is not connected.");
  }
  connection.selectedParentType = parentType;
  connection.selectedParentId = targetId;
  connection.selectedParentLabel = targetLabel.trim() || "Untitled";
  connection.selectedParentUrl = targetUrl.trim();
  connection.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  upsertNotionConnection(data, connection);
  return buildConnectionSummary(connection);
}
async function savePostThroughNotionConnection(data, tokenHash, deviceId, payload) {
  const connection = getActiveConnection(data, tokenHash, deviceId);
  if (!connection || !connection.selectedParentType || !connection.selectedParentId) {
    throw new Error("Notion is connected, but no default save location is selected.");
  }
  return await withConnectionAccessToken(data, connection, async (accessToken) => {
    return await savePostToNotionCore(payload.post, {
      token: accessToken,
      parentType: connection.selectedParentType,
      targetId: connection.selectedParentId,
      includeImages: payload.includeImages,
      uploadMedia: payload.uploadMedia,
      aiResult: payload.aiResult,
      aiWarning: payload.aiWarning,
      locale: payload.locale
    });
  });
}

// src/server/bot-service.ts
var import_jszip = __toESM(require_lib3(), 1);
import { createCipheriv as createCipheriv2, createDecipheriv as createDecipheriv2, createHash as createHash3, randomBytes as randomBytes2 } from "node:crypto";
import { lookup } from "node:dns/promises";
import net from "node:net";

// ../shared/src/config.ts
var BUNDLED_EXTRACTOR_CONFIG = {
  version: "2026-03-08",
  noisePatterns: ["\uBC88\uC5ED\uD558\uAE30", "\uB354 \uBCF4\uAE30", "\uC88B\uC544\uC694", "\uB313\uAE00", "\uB9AC\uD3EC\uC2A4\uD2B8", "\uACF5\uC720\uD558\uAE30"],
  maxRecentSaves: 10
};

// ../shared/src/utils.ts
var THREADS_PERMALINK_RE = /^https:\/\/www\.threads\.(?:com|net)\/@[^/]+\/post\/[^/?#]+/i;
function isSupportedPermalink(url) {
  return THREADS_PERMALINK_RE.test(url);
}
function normalizeThreadsUrl(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.search = "";
  parsed.hostname = "www.threads.com";
  parsed.pathname = parsed.pathname.replace(/(\/@[^/]+\/post\/[^/]+)\/media(?:\/.*)?$/i, "$1");
  return parsed.toString().replace(/\/$/, "");
}
function extractShortcode(url) {
  const match = normalizeThreadsUrl(url).match(/\/post\/([^/?#]+)/i);
  return match?.[1] ?? "";
}
function extractAuthorFromUrl(url) {
  const match = normalizeThreadsUrl(url).match(/\/@([^/]+)/i);
  return match?.[1] ?? "unknown";
}
function unwrapExternalUrl(url) {
  const parsed = new URL(url, "https://www.threads.com");
  const target = parsed.searchParams.get("u");
  if (target) {
    try {
      return decodeURIComponent(target);
    } catch {
      return target;
    }
  }
  if (parsed.hostname.endsWith("threads.com") || parsed.hostname.endsWith("threads.net")) {
    return null;
  }
  parsed.hash = "";
  return parsed.toString();
}
function dedupeStrings(values) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const value of values) {
    if (!value) {
      continue;
    }
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}
function decodeEscapedJsonString(value) {
  let current = value;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!/\\u[0-9a-fA-F]{4}|\\[nrt"\\/]/.test(current)) {
      return current;
    }
    try {
      const parsed = JSON.parse(`"${current}"`);
      if (parsed === current) {
        return current;
      }
      current = parsed;
      continue;
    } catch {
      current = current.replaceAll("\\n", "\n").replaceAll("\\r", "\r").replaceAll("\\t", "	").replaceAll('\\"', '"').replaceAll("\\\\", "\\");
    }
  }
  return current;
}
function cleanTextLines(text, author, config = BUNDLED_EXTRACTOR_CONFIG) {
  const lines = dedupeStrings(
    text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  );
  const filtered = [];
  for (const line of lines) {
    if (line === author || line === `@${author}`) {
      continue;
    }
    if (line === "\uC2A4\uB808\uB4DC" || line === "\uC778\uAE30\uC21C" || line === "\uD65C\uB3D9 \uBCF4\uAE30" || /^조회\s+[\d.,]+(?:천|만)?회$/u.test(line) || /^Threads에 가입하여 .*$/u.test(line) || /^Threads에 가입해 .*$/u.test(line) || /^Threads에 로그인 또는 가입하기$/u.test(line) || /^사람들의 이야기를 확인하고 대화에 참여해보세요\.$/u.test(line)) {
      continue;
    }
    if (config.noisePatterns.some((pattern) => line === pattern || line.startsWith(`${pattern} `))) {
      break;
    }
    if (/^\d+\s*(초|분|시간|일|주|개월|년)$/.test(line)) {
      continue;
    }
    if (/^[\d.,]+(?:천|만)?$/u.test(line) || /^\d+\s*\/\s*\d+$/u.test(line) || line === "/") {
      continue;
    }
    filtered.push(line);
  }
  return filtered.join("\n\n").trim();
}
async function hashPost(post) {
  const payload = JSON.stringify({
    canonicalUrl: post.canonicalUrl,
    text: post.text,
    imageUrls: post.imageUrls,
    externalUrl: post.externalUrl,
    quotedPostUrl: post.quotedPostUrl,
    repliedToUrl: post.repliedToUrl,
    authorReplies: post.authorReplies
  });
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

// src/server/bot-service.ts
var BOT_OAUTH_TTL_MS = 10 * 6e4;
var BOT_OAUTH_ACTIVATION_TTL_MS = 5 * 6e4;
var BOT_SESSION_TTL_MS = 30 * 24 * 60 * 6e4;
var BOT_EXTENSION_LINK_TTL_MS = 10 * 6e4;
var BOT_EXTENSION_TOKEN_TTL_MS = 30 * 24 * 60 * 6e4;
var THREADS_LONG_LIVED_TOKEN_TTL_MS = 60 * 24 * 60 * 6e4;
var BOT_TOKEN_REFRESH_WINDOW_MS = 24 * 60 * 6e4;
var THREADS_AUTHORIZE_BASE_URL = "https://www.threads.com";
var THREADS_GRAPH_BASE_URL = "https://graph.threads.net";
var BOT_SCOPE_VERSION = 2;
var THREADS_OAUTH_SCOPES = [
  "threads_basic",
  "threads_manage_mentions",
  "threads_read_replies",
  "threads_profile_discovery",
  "threads_keyword_search",
  "threads_manage_insights"
];
var MAX_ARCHIVE_TAGS = 3;
var DEFAULT_MEDIA_HOST_ALLOWLIST = [
  "threads.com",
  "threads.net",
  "cdninstagram.com",
  "fbcdn.net"
];
function hashSecret(value) {
  return createHash3("sha256").update(value).digest("hex");
}
function readAllowedMediaHostSuffixes() {
  const envValue = process.env.THREADS_ARCHIVE_MEDIA_HOST_ALLOWLIST?.trim() || process.env.THREADS_MEDIA_ALLOWED_HOSTS?.trim();
  const configured = envValue ? envValue.split(",").map((entry) => entry.trim().toLowerCase().replace(/^\.+/, "")).filter(Boolean) : [];
  return [.../* @__PURE__ */ new Set([...DEFAULT_MEDIA_HOST_ALLOWLIST, ...configured])];
}
function hasAllowedMediaHost(hostname) {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
  return readAllowedMediaHostSuffixes().some((suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`));
}
function isPrivateIpv4(address) {
  const parts = address.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [first, second] = parts;
  if (first === 0 || first === 10 || first === 127) {
    return true;
  }
  if (first === 100 && second >= 64 && second <= 127) {
    return true;
  }
  if (first === 169 && second === 254) {
    return true;
  }
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }
  if (first === 192 && second === 168) {
    return true;
  }
  return false;
}
function isPrivateIpv6(address) {
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:") || normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.") || /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./.test(normalized);
}
async function assertSafeArchiveMediaUrl(mediaUrl) {
  const parsed = new URL(mediaUrl);
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS media URLs are allowed.");
  }
  const hostname = parsed.hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!hostname || net.isIP(hostname) !== 0 || !hasAllowedMediaHost(hostname)) {
    throw new Error("Media host is not allowed.");
  }
  const resolved = await lookup(hostname, { all: true, verbatim: true });
  if (resolved.length === 0) {
    throw new Error("Media host did not resolve.");
  }
  for (const entry of resolved) {
    if (entry.family === 4 && isPrivateIpv4(entry.address) || entry.family === 6 && isPrivateIpv6(entry.address)) {
      throw new Error("Media host resolved to a private address.");
    }
  }
  return parsed;
}
async function fetchArchiveAsset(mediaUrl) {
  const safeUrl = await assertSafeArchiveMediaUrl(mediaUrl);
  const response = await fetch(safeUrl, {
    cache: "no-store",
    redirect: "manual"
  });
  if (response.status >= 300 && response.status < 400) {
    throw new Error("Media redirects are not allowed.");
  }
  if (!response.ok) {
    throw new Error("Media fetch failed.");
  }
  return response;
}
function normalizeThreadsHandle(value) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}
function safeText(value) {
  return (value ?? "").trim();
}
function toRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value;
}
function readString(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized ? normalized : null;
}
function readStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => readString(entry)).filter((entry) => Boolean(entry));
}
function isSourceType(value) {
  return value === "text" || value === "image" || value === "video";
}
function isCloudArchiveRecord(archive) {
  return "canonicalUrl" in archive;
}
function parseFrontmatterPrimitive(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
}
function parseAiOrganizationResult(value) {
  const record = toRecord(value);
  if (!record) {
    return null;
  }
  const frontmatterRecord = toRecord(record.frontmatter);
  const frontmatter = {};
  for (const [key, entryValue] of Object.entries(frontmatterRecord ?? {})) {
    const primitive = parseFrontmatterPrimitive(entryValue);
    if (primitive !== null) {
      frontmatter[key] = primitive;
      continue;
    }
    if (!Array.isArray(entryValue)) {
      continue;
    }
    const parsedArray = entryValue.map((item) => parseFrontmatterPrimitive(item)).filter((item) => item !== null);
    if (parsedArray.length > 0) {
      frontmatter[key] = parsedArray;
    }
  }
  const summary = readString(record.summary);
  const tags = dedupeStrings(readStringArray(record.tags));
  if (!summary && tags.length === 0 && Object.keys(frontmatter).length === 0) {
    return null;
  }
  return {
    summary,
    tags,
    frontmatter
  };
}
function parseAuthorReply(value) {
  const record = toRecord(value);
  if (!record) {
    return null;
  }
  const author = readString(record.author);
  const canonicalUrl = readString(record.canonicalUrl);
  const shortcode = readString(record.shortcode);
  const text = readString(record.text);
  const sourceType = record.sourceType;
  if (!author || !canonicalUrl || !shortcode || !text || !isSourceType(sourceType)) {
    return null;
  }
  return {
    author,
    canonicalUrl,
    shortcode,
    text,
    publishedAt: readString(record.publishedAt),
    sourceType,
    imageUrls: readStringArray(record.imageUrls),
    videoUrl: readString(record.videoUrl),
    externalUrl: readString(record.externalUrl),
    thumbnailUrl: readString(record.thumbnailUrl)
  };
}
function parseExtractedPost(value) {
  const record = toRecord(value);
  if (!record) {
    return null;
  }
  const canonicalUrl = readString(record.canonicalUrl);
  const shortcode = readString(record.shortcode);
  const author = readString(record.author);
  const title = readString(record.title);
  const text = readString(record.text);
  const capturedAt = readString(record.capturedAt);
  const sourceType = record.sourceType;
  const extractorVersion = readString(record.extractorVersion);
  const contentHash = readString(record.contentHash);
  if (!canonicalUrl || !shortcode || !author || !title || !text || !capturedAt || !extractorVersion || !contentHash || !isSourceType(sourceType)) {
    return null;
  }
  const authorReplies = Array.isArray(record.authorReplies) ? record.authorReplies.map((entry) => parseAuthorReply(entry)).filter((entry) => Boolean(entry)) : [];
  return {
    canonicalUrl,
    shortcode,
    author,
    title,
    text,
    publishedAt: readString(record.publishedAt),
    capturedAt,
    sourceType,
    imageUrls: readStringArray(record.imageUrls),
    videoUrl: readString(record.videoUrl),
    externalUrl: readString(record.externalUrl),
    quotedPostUrl: readString(record.quotedPostUrl),
    repliedToUrl: readString(record.repliedToUrl),
    thumbnailUrl: readString(record.thumbnailUrl),
    authorReplies,
    extractorVersion,
    contentHash
  };
}
function readArchiveExtractedPost(rawPayloadJson) {
  if (!rawPayloadJson) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawPayloadJson);
    const record = toRecord(parsed);
    if (record?.extractedPost) {
      return parseExtractedPost(record.extractedPost);
    }
    return parseExtractedPost(parsed);
  } catch {
    return null;
  }
}
function readCloudArchivePayload(rawPayloadJson) {
  if (!rawPayloadJson) {
    return {
      extractedPost: null,
      aiResult: null,
      aiWarning: null,
      locale: "ko"
    };
  }
  try {
    const parsed = JSON.parse(rawPayloadJson);
    const record = toRecord(parsed);
    return {
      extractedPost: record?.extractedPost ? parseExtractedPost(record.extractedPost) : parseExtractedPost(parsed),
      aiResult: parseAiOrganizationResult(record?.aiResult),
      aiWarning: readString(record?.aiWarning),
      locale: normalizeLocale(record?.locale, "ko")
    };
  } catch {
    return {
      extractedPost: null,
      aiResult: null,
      aiWarning: null,
      locale: "ko"
    };
  }
}
function summarizeReplyMediaUrls(reply) {
  return dedupeStrings([
    ...reply.imageUrls,
    reply.sourceType === "video" ? reply.thumbnailUrl ?? reply.videoUrl : null
  ]);
}
function buildArchiveReplyView(reply) {
  return {
    canonicalUrl: reply.canonicalUrl,
    author: reply.author,
    text: reply.text,
    publishedAt: reply.publishedAt,
    mediaUrls: summarizeReplyMediaUrls(reply)
  };
}
function summarizeExtractedPostPreviewMediaUrls(post) {
  return dedupeStrings([
    ...post.imageUrls,
    post.sourceType === "video" ? post.thumbnailUrl ?? post.videoUrl : null
  ]);
}
function buildRemoteMarkdownMediaRefs(post) {
  return {
    postImages: [...post.imageUrls],
    postVideo: post.sourceType === "video" ? {
      file: post.videoUrl,
      thumbnail: post.thumbnailUrl
    } : null,
    replyImages: post.authorReplies.map((reply) => [...reply.imageUrls]),
    replyVideos: post.authorReplies.map(
      (reply) => reply.sourceType === "video" ? {
        file: reply.videoUrl,
        thumbnail: reply.thumbnailUrl
      } : null
    )
  };
}
function buildCloudArchiveTags(payload) {
  return dedupeStrings(payload.aiResult?.tags ?? []).slice(0, MAX_ARCHIVE_TAGS);
}
function extractArchiveTags(noteText) {
  const normalized = safeText(noteText);
  if (!normalized) {
    return [];
  }
  const tags = [];
  const seen = /* @__PURE__ */ new Set();
  const matches = normalized.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  for (const match of matches) {
    const normalizedTag = match.slice(1).trim().toLowerCase();
    if (!normalizedTag || seen.has(normalizedTag)) {
      continue;
    }
    seen.add(normalizedTag);
    tags.push(normalizedTag);
    if (tags.length >= MAX_ARCHIVE_TAGS) {
      break;
    }
  }
  return tags;
}
function createOpaqueToken() {
  return randomBytes2(32).toString("base64url");
}
function readBotHandle() {
  return normalizeThreadsHandle(
    getRuntimeConfigSnapshot().collector.botHandle || process.env.THREADS_BOT_HANDLE?.trim() || ""
  );
}
function requireBotIngestToken() {
  const token = process.env.THREADS_BOT_INGEST_TOKEN?.trim();
  if (!token) {
    throw new Error("THREADS_BOT_INGEST_TOKEN is not configured.");
  }
  return token;
}
function readThreadsOauthConfig() {
  const appId = process.env.THREADS_BOT_APP_ID?.trim();
  const appSecret = process.env.THREADS_BOT_APP_SECRET?.trim();
  const graphApiVersion = process.env.THREADS_BOT_GRAPH_API_VERSION?.trim() || null;
  if (!appId || !appSecret) {
    throw new Error(
      "Threads OAuth is not configured. Set THREADS_BOT_APP_ID and THREADS_BOT_APP_SECRET on the web server."
    );
  }
  return { appId, appSecret, graphApiVersion };
}
function isThreadsOauthConfigured() {
  return Boolean(process.env.THREADS_BOT_APP_ID?.trim() && process.env.THREADS_BOT_APP_SECRET?.trim());
}
function getEncryptionKey2() {
  const secret = process.env.THREADS_BOT_ENCRYPTION_SECRET?.trim() || process.env.THREADS_WEB_ADMIN_TOKEN?.trim();
  if (!secret) {
    throw new Error(
      "Threads bot encryption secret is not configured. Set THREADS_BOT_ENCRYPTION_SECRET or THREADS_WEB_ADMIN_TOKEN."
    );
  }
  return createHash3("sha256").update(secret).digest();
}
function encryptSecret2(value) {
  const key = getEncryptionKey2();
  const iv = randomBytes2(12);
  const cipher = createCipheriv2("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}
function decryptSecret2(value) {
  const [ivRaw, tagRaw, bodyRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !bodyRaw) {
    throw new Error("Invalid encrypted secret payload.");
  }
  const decipher = createDecipheriv2("aes-256-gcm", getEncryptionKey2(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(bodyRaw, "base64url")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}
function isExpired(iso, now = Date.now()) {
  return Date.parse(iso) <= now;
}
function buildThreadsApiBaseUrl() {
  const { graphApiVersion } = readThreadsOauthConfig();
  return `${THREADS_GRAPH_BASE_URL}/${graphApiVersion ? `${graphApiVersion}/` : ""}`;
}
function buildRedirectUri2(publicOrigin) {
  return `${publicOrigin.replace(/\/+$/, "")}/api/public/bot/oauth/callback`;
}
function buildThreadsAuthorizeUrl(publicOrigin, rawState) {
  const { appId } = readThreadsOauthConfig();
  const url = new URL("/oauth/authorize/", THREADS_AUTHORIZE_BASE_URL);
  url.searchParams.set("scope", THREADS_OAUTH_SCOPES.join(","));
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", buildRedirectUri2(publicOrigin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", rawState);
  url.hash = "weblink";
  return url.toString();
}
function extractArchiveTitleExcerpt(text, maxChars = 20) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  const firstSentence = normalized.split(/(?<=[.!?。！？])\s+|\n+/u, 1)[0]?.trim() ?? normalized;
  return Array.from(firstSentence).slice(0, maxChars).join("").trim();
}
function buildArchiveTitle(targetAuthorHandle, targetText) {
  const excerpt = extractArchiveTitleExcerpt(targetText, 20);
  if (excerpt) {
    return excerpt;
  }
  if (targetAuthorHandle) {
    return `Threads post by @${targetAuthorHandle}`;
  }
  return "Saved Threads mention";
}
function renderMarkdownImageBlocks(refs, labelPrefix) {
  const lines = [];
  for (const [index, ref] of refs.entries()) {
    lines.push(`![${labelPrefix} ${index + 1}](${ref})`, "");
  }
  return lines;
}
function renderMarkdownVideoBlock(videoRef, canonicalUrl) {
  if (!videoRef) {
    return [];
  }
  const lines = ["Video on Threads: " + canonicalUrl];
  if (videoRef.file && !isRemoteRef(videoRef.file)) {
    lines.push(`Saved video file: ${videoRef.file}`);
  }
  lines.push("");
  if (videoRef.thumbnail) {
    lines.push(`![Video thumbnail](${videoRef.thumbnail})`, "");
  }
  return lines;
}
function buildArchiveMarkdownFromExtractedPost(post, archivedAt, tags, mediaRefs) {
  const lines = [
    `# ${buildArchiveTitle(post.author, post.text)}`,
    "",
    `Saved: ${archivedAt}`,
    `Source: ${post.canonicalUrl}`,
    `Author: @${post.author}`
  ];
  if (post.publishedAt) {
    lines.push(`Published: ${post.publishedAt}`);
  }
  if (post.externalUrl) {
    lines.push(`External link: ${post.externalUrl}`);
  }
  if (post.quotedPostUrl) {
    lines.push(`Quoted post: ${post.quotedPostUrl}`);
  }
  if (post.repliedToUrl) {
    lines.push(`Replied to: ${post.repliedToUrl}`);
  }
  if (tags.length > 0) {
    lines.push(`Tags: ${tags.map((tag) => `#${tag}`).join(" ")}`);
  }
  lines.push("", "## Post", "", post.text.trim(), "");
  if (post.sourceType === "video") {
    lines.push(...renderMarkdownVideoBlock(mediaRefs.postVideo, post.canonicalUrl));
  }
  if (mediaRefs.postImages.length > 0) {
    lines.push("## Images", "");
    lines.push(...renderMarkdownImageBlocks(mediaRefs.postImages, "Image"));
  }
  if (post.authorReplies.length > 0) {
    lines.push("## Author Replies", "");
    post.authorReplies.forEach((reply, index) => {
      lines.push(`### Reply ${index + 1}`, "", `Source: ${reply.canonicalUrl}`, `Author: @${reply.author}`);
      if (reply.publishedAt) {
        lines.push(`Published: ${reply.publishedAt}`);
      }
      if (reply.externalUrl) {
        lines.push(`External link: ${reply.externalUrl}`);
      }
      lines.push("", reply.text.trim(), "");
      if (reply.sourceType === "video") {
        lines.push(...renderMarkdownVideoBlock(mediaRefs.replyVideos[index] ?? null, reply.canonicalUrl));
      }
      lines.push(...renderMarkdownImageBlocks(mediaRefs.replyImages[index] ?? [], `Reply ${index + 1} image`));
    });
  }
  return lines.join("\n").trim();
}
function isRemoteRef(ref) {
  return /^https?:\/\//i.test(ref);
}
function isImageRef(ref) {
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(?:[?#]|$)/i.test(ref);
}
function shortenUrlLabel(url, fallback) {
  try {
    const parsed = new URL(url);
    const lastSegment = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    return safeText(lastSegment).slice(0, 40) || fallback;
  } catch {
    return fallback;
  }
}
function buildArchiveMarkdown(payload) {
  const title = buildArchiveTitle(payload.targetAuthorHandle, payload.targetText);
  const lines = [
    `# ${title}`,
    "",
    `Saved: ${payload.archivedAt}`,
    `Source: ${payload.targetAuthorHandle ? `@${payload.targetAuthorHandle}` : "unknown"}`,
    `URL: ${payload.targetUrl}`
  ];
  if (payload.targetPublishedAt) {
    lines.push(`Published: ${payload.targetPublishedAt}`);
  }
  if (payload.tags.length > 0) {
    lines.push(`Tags: ${payload.tags.map((tag) => `#${tag}`).join(" ")}`);
  }
  lines.push("", "## Post", "", payload.targetText);
  if (payload.mediaUrls.length > 0) {
    lines.push("", "## Media", "");
    for (const [index, mediaRef] of payload.mediaUrls.entries()) {
      if (isRemoteRef(mediaRef)) {
        const fallbackLabel = isImageRef(mediaRef) ? `image-${String(index + 1).padStart(2, "0")}` : `media-${String(index + 1).padStart(2, "0")}`;
        lines.push(`- [${shortenUrlLabel(mediaRef, fallbackLabel)}](${mediaRef})`);
        continue;
      }
      if (isImageRef(mediaRef)) {
        lines.push(`![${mediaRef}](${mediaRef})`);
      } else {
        lines.push(`- [${mediaRef}](${mediaRef})`);
      }
    }
  }
  return lines.join("\n").trim();
}
function buildArchiveMarkdownPayload(archive, mediaUrls) {
  return {
    mentionUrl: archive.mentionUrl,
    mentionAuthorHandle: archive.mentionAuthorHandle,
    mentionAuthorDisplayName: archive.mentionAuthorDisplayName,
    noteText: archive.noteText,
    tags: extractArchiveTags(archive.noteText),
    targetUrl: archive.targetUrl,
    targetAuthorHandle: archive.targetAuthorHandle,
    targetAuthorDisplayName: archive.targetAuthorDisplayName,
    targetText: archive.targetText,
    targetPublishedAt: archive.targetPublishedAt,
    mediaUrls,
    archivedAt: archive.archivedAt
  };
}
function buildArchiveMarkdownFromRecord(archive, mediaUrls) {
  const extractedPost = readArchiveExtractedPost(archive.rawPayloadJson);
  if (!extractedPost) {
    return buildArchiveMarkdown(buildArchiveMarkdownPayload(archive, mediaUrls));
  }
  return buildArchiveMarkdownFromExtractedPost(
    extractedPost,
    archive.archivedAt,
    extractArchiveTags(archive.noteText),
    buildRemoteMarkdownMediaRefs(extractedPost)
  );
}
function buildArchiveSlug(targetAuthorHandle, targetText, fallback = "threads-archive") {
  const base = buildArchiveTitle(targetAuthorHandle, targetText).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return base || fallback;
}
function buildArchiveNoteFilename(archiveName) {
  return `${archiveName}.md`;
}
function guessAssetExtension(url, contentType) {
  if (contentType?.includes("png")) {
    return "png";
  }
  if (contentType?.includes("webp")) {
    return "webp";
  }
  if (contentType?.includes("gif")) {
    return "gif";
  }
  if (contentType?.includes("mp4")) {
    return "mp4";
  }
  if (contentType?.includes("webm")) {
    return "webm";
  }
  if (contentType?.includes("quicktime")) {
    return "mov";
  }
  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() ?? "jpg";
}
async function collectArchiveAssetFiles(mediaUrls) {
  const refs = [];
  const files = [];
  for (const [index, mediaUrl] of mediaUrls.entries()) {
    try {
      const response = await fetchArchiveAsset(mediaUrl);
      const extension = guessAssetExtension(mediaUrl, response.headers.get("content-type"));
      const assetPrefix = /^(mp4|mov|webm)$/i.test(extension) ? "video" : "image";
      const relativePath = `${assetPrefix}-${String(index + 1).padStart(2, "0")}.${extension}`;
      refs.push(relativePath);
      files.push({
        path: relativePath,
        data: await response.arrayBuffer()
      });
    } catch {
      refs.push(mediaUrl);
    }
  }
  return { refs, files };
}
async function collectSingleArchiveAsset(url, relativeBasePath) {
  const normalizedUrl = safeText(url);
  if (!normalizedUrl) {
    return { ref: null, files: [] };
  }
  try {
    const response = await fetchArchiveAsset(normalizedUrl);
    const extension = guessAssetExtension(normalizedUrl, response.headers.get("content-type"));
    const relativePath = `${relativeBasePath}.${extension}`;
    return {
      ref: relativePath,
      files: [
        {
          path: relativePath,
          data: await response.arrayBuffer()
        }
      ]
    };
  } catch {
    return { ref: normalizedUrl, files: [] };
  }
}
async function collectExtractedPostAssetFiles(post) {
  const files = [];
  const postImages = [];
  for (const [index, imageUrl] of post.imageUrls.entries()) {
    const result = await collectSingleArchiveAsset(imageUrl, `image-${String(index + 1).padStart(2, "0")}`);
    if (result.ref) {
      postImages.push(result.ref);
    }
    files.push(...result.files);
  }
  let postVideo = null;
  if (post.sourceType === "video") {
    const videoFile = await collectSingleArchiveAsset(post.videoUrl, "video-01");
    const videoThumb = await collectSingleArchiveAsset(post.thumbnailUrl, "video-01-thumb");
    postVideo = {
      file: videoFile.ref,
      thumbnail: videoThumb.ref
    };
    files.push(...videoFile.files, ...videoThumb.files);
  }
  const replyImages = [];
  const replyVideos = [];
  for (const [replyIndex, reply] of post.authorReplies.entries()) {
    const imageRefs = [];
    for (const [imageIndex, imageUrl] of reply.imageUrls.entries()) {
      const result = await collectSingleArchiveAsset(
        imageUrl,
        `reply-${String(replyIndex + 1).padStart(2, "0")}-image-${String(imageIndex + 1).padStart(2, "0")}`
      );
      if (result.ref) {
        imageRefs.push(result.ref);
      }
      files.push(...result.files);
    }
    replyImages.push(imageRefs);
    if (reply.sourceType === "video") {
      const videoFile = await collectSingleArchiveAsset(
        reply.videoUrl,
        `reply-${String(replyIndex + 1).padStart(2, "0")}-video`
      );
      const videoThumb = await collectSingleArchiveAsset(
        reply.thumbnailUrl,
        `reply-${String(replyIndex + 1).padStart(2, "0")}-video-thumb`
      );
      replyVideos.push({
        file: videoFile.ref,
        thumbnail: videoThumb.ref
      });
      files.push(...videoFile.files, ...videoThumb.files);
    } else {
      replyVideos.push(null);
    }
  }
  return {
    mediaRefs: {
      postImages,
      postVideo,
      replyImages,
      replyVideos
    },
    files
  };
}
function buildArchiveFilenameBase(targetAuthorHandle, targetText, fallback = "threads-archive") {
  return buildArchiveTitle(targetAuthorHandle, targetText).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || fallback;
}
function buildCloudArchiveRawPayload(input) {
  return JSON.stringify({
    extractedPost: input.post,
    aiResult: input.aiResult,
    aiWarning: input.aiWarning,
    locale: normalizeLocale(input.locale, "ko")
  });
}
function buildCloudArchiveUrl(publicOrigin, archiveId) {
  const url = new URL("/scrapbook", publicOrigin);
  url.searchParams.set("archive", archiveId);
  return url.toString();
}
async function buildArchiveZipBundle(archives) {
  const zip = new import_jszip.default();
  const now = /* @__PURE__ */ new Date();
  const zipStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  let singleArchiveName = "threads-archive";
  for (const [index, archive] of archives.entries()) {
    const archivePayload = isCloudArchiveRecord(archive) ? readCloudArchivePayload(archive.rawPayloadJson) : null;
    const extractedPost = archivePayload?.extractedPost ?? readArchiveExtractedPost(archive.rawPayloadJson);
    const targetAuthorHandle = (isCloudArchiveRecord(archive) ? archive.targetAuthorHandle : archive.targetAuthorHandle) ?? extractedPost?.author ?? null;
    const targetText = extractedPost?.text ?? archive.targetText;
    const archiveName = buildArchiveSlug(targetAuthorHandle, targetText, `threads-archive-${index + 1}`);
    if (archives.length === 1) {
      singleArchiveName = archiveName;
    }
    const fallbackMedia = extractedPost ? null : await collectArchiveAssetFiles(archive.mediaUrls);
    const extractedMedia = extractedPost ? await collectExtractedPostAssetFiles(extractedPost) : null;
    const markdown = extractedPost ? isCloudArchiveRecord(archive) ? await renderMarkdown(
      extractedPost,
      extractedMedia.mediaRefs,
      archivePayload?.aiWarning ?? null,
      archivePayload?.aiResult ?? null,
      archivePayload?.locale
    ) : buildArchiveMarkdownFromExtractedPost(
      extractedPost,
      archive.archivedAt,
      extractArchiveTags(archive.noteText),
      extractedMedia.mediaRefs
    ) : isCloudArchiveRecord(archive) ? archive.markdownContent : buildArchiveMarkdown(buildArchiveMarkdownPayload(archive, fallbackMedia.refs));
    const targetFolder = archives.length === 1 ? zip : zip.folder(archiveName);
    if (!targetFolder) {
      continue;
    }
    targetFolder.file(buildArchiveNoteFilename(archiveName), markdown);
    for (const file of extractedPost ? extractedMedia.files : fallbackMedia.files) {
      targetFolder.file(file.path, file.data);
    }
  }
  return {
    filename: archives.length === 1 ? `${singleArchiveName}.zip` : `threads-scrapbook-${zipStamp}.zip`,
    content: await zip.generateAsync({ type: "nodebuffer" })
  };
}
function toBotUserView(user) {
  return {
    id: user.id,
    threadsUserId: user.threadsUserId,
    threadsHandle: user.threadsHandle,
    displayName: user.displayName,
    profilePictureUrl: user.profilePictureUrl,
    biography: user.biography,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt,
    grantedScopes: [...user.grantedScopes],
    scopeVersion: user.scopeVersion,
    lastScopeUpgradeAt: user.lastScopeUpgradeAt
  };
}
function toBotArchiveView(item) {
  const extractedPost = readArchiveExtractedPost(item.rawPayloadJson);
  const mediaUrls = extractedPost ? summarizeExtractedPostPreviewMediaUrls(extractedPost) : [...item.mediaUrls];
  return {
    id: item.id,
    origin: "mention",
    originLabel: "\uBA58\uC158 inbox",
    mentionUrl: item.mentionUrl,
    mentionAuthorHandle: item.mentionAuthorHandle,
    mentionAuthorDisplayName: item.mentionAuthorDisplayName,
    noteText: item.noteText,
    tags: extractArchiveTags(item.noteText),
    targetUrl: item.targetUrl,
    targetAuthorHandle: item.targetAuthorHandle ?? extractedPost?.author ?? null,
    targetAuthorDisplayName: item.targetAuthorDisplayName,
    targetText: extractedPost?.text ?? item.targetText,
    targetPublishedAt: extractedPost?.publishedAt ?? item.targetPublishedAt,
    mediaUrls,
    authorReplies: extractedPost?.authorReplies.map((reply) => buildArchiveReplyView(reply)) ?? [],
    markdownContent: buildArchiveMarkdownFromRecord(item, mediaUrls),
    archivedAt: item.archivedAt,
    updatedAt: item.updatedAt
  };
}
function toCloudArchiveView(item) {
  const payload = readCloudArchivePayload(item.rawPayloadJson);
  const mediaUrls = payload.extractedPost ? summarizeExtractedPostPreviewMediaUrls(payload.extractedPost) : [...item.mediaUrls];
  return {
    id: item.id,
    origin: "cloud",
    originLabel: "\uD074\uB77C\uC6B0\uB4DC \uC800\uC7A5",
    mentionUrl: null,
    mentionAuthorHandle: null,
    mentionAuthorDisplayName: null,
    noteText: payload.aiResult?.summary ?? null,
    tags: buildCloudArchiveTags(payload),
    targetUrl: item.canonicalUrl,
    targetAuthorHandle: item.targetAuthorHandle ?? payload.extractedPost?.author ?? null,
    targetAuthorDisplayName: item.targetAuthorDisplayName,
    targetText: payload.extractedPost?.text ?? item.targetText,
    targetPublishedAt: payload.extractedPost?.publishedAt ?? item.targetPublishedAt,
    mediaUrls,
    authorReplies: payload.extractedPost?.authorReplies.map((reply) => buildArchiveReplyView(reply)) ?? [],
    markdownContent: safeText(item.markdownContent) || "",
    archivedAt: item.savedAt,
    updatedAt: item.updatedAt
  };
}
function getBotUserByThreadsUserId(data, threadsUserId) {
  return data.botUsers.find(
    (candidate) => candidate.threadsUserId === threadsUserId && candidate.status === "active"
  ) ?? null;
}
function getBotUserByHandle(data, threadsHandle) {
  return data.botUsers.find(
    (candidate) => candidate.threadsHandle === threadsHandle && candidate.status === "active"
  ) ?? null;
}
function touchExpiredOauthSessions(data) {
  const now = Date.now();
  for (const session of data.botOauthSessions) {
    if (session.status === "pending" && isExpired(session.expiresAt, now)) {
      session.status = "expired";
      upsertBotOauthSession(data, session);
    }
  }
}
function touchExpiredSessions(data) {
  const now = Date.now();
  for (const session of data.botSessions) {
    if (session.status === "active" && isExpired(session.expiresAt, now)) {
      session.status = "expired";
      upsertBotSession(data, session);
    }
  }
}
function touchExpiredExtensionLinkSessions(data) {
  const now = Date.now();
  for (const session of data.botExtensionLinkSessions) {
    if (session.status === "pending" && isExpired(session.expiresAt, now)) {
      session.status = "expired";
      upsertBotExtensionLinkSession(data, session);
    }
  }
}
function touchExpiredExtensionAccessTokens(data) {
  const now = Date.now();
  for (const token of data.botExtensionAccessTokens) {
    if (token.status === "active" && isExpired(token.expiresAt, now)) {
      token.status = "expired";
      upsertBotExtensionAccessToken(data, token);
    }
  }
}
function revokeActiveBotSessionsForUser(data, userId, now) {
  for (const session of data.botSessions) {
    if (session.userId !== userId || session.status !== "active") {
      continue;
    }
    session.status = "revoked";
    session.revokedAt = now;
    upsertBotSession(data, session);
  }
}
function revokeActiveExtensionTokensForUser(data, userId, now) {
  for (const token of data.botExtensionAccessTokens) {
    if (token.userId !== userId || token.status !== "active") {
      continue;
    }
    token.status = "revoked";
    token.revokedAt = now;
    upsertBotExtensionAccessToken(data, token);
  }
}
function createBotSession(data, user) {
  const rawSession = createOpaqueToken();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  revokeActiveBotSessionsForUser(data, user.id, now);
  const session = {
    id: crypto.randomUUID(),
    userId: user.id,
    sessionHash: hashSecret(rawSession),
    createdAt: now,
    expiresAt: new Date(Date.now() + BOT_SESSION_TTL_MS).toISOString(),
    lastSeenAt: now,
    revokedAt: null,
    status: "active"
  };
  upsertBotSession(data, session);
  user.lastLoginAt = now;
  user.updatedAt = now;
  upsertBotUser(data, user);
  return {
    sessionToken: rawSession,
    user: toBotUserView(user)
  };
}
function getBotSessionRecord(data, rawSession) {
  touchExpiredSessions(data);
  const normalized = safeText(rawSession);
  if (!normalized) {
    return null;
  }
  const hash = hashSecret(normalized);
  return data.botSessions.find((candidate) => candidate.sessionHash === hash && candidate.status === "active") ?? null;
}
function findBotExtensionAccessTokenRecord(data, rawToken) {
  touchExpiredExtensionAccessTokens(data);
  const normalized = safeText(rawToken);
  if (!normalized) {
    return null;
  }
  const hash = hashSecret(normalized);
  return data.botExtensionAccessTokens.find((candidate) => candidate.tokenHash === hash) ?? null;
}
async function exchangeAuthorizationCode(code, publicOrigin) {
  const { appId, appSecret } = readThreadsOauthConfig();
  const response = await fetch(`${buildThreadsApiBaseUrl()}oauth/access_token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: buildRedirectUri2(publicOrigin),
      code
    }).toString()
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads OAuth token exchange failed.");
  }
  return body ?? {};
}
async function exchangeLongLivedToken(accessToken) {
  const { appSecret } = readThreadsOauthConfig();
  const url = new URL("access_token", buildThreadsApiBaseUrl());
  url.searchParams.set("grant_type", "th_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads long-lived token exchange failed.");
  }
  return body ?? {};
}
async function fetchThreadsProfile(accessToken) {
  const url = new URL("me", buildThreadsApiBaseUrl());
  url.searchParams.set(
    "fields",
    ["id", "username", "name", "threads_profile_picture_url", "threads_biography", "is_verified"].join(",")
  );
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads profile lookup failed.");
  }
  return body ?? {};
}
async function refreshThreadsAccessToken(accessToken) {
  const url = new URL("refresh_access_token", buildThreadsApiBaseUrl());
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error_message?.trim() || "Threads access token refresh failed.");
  }
  return {
    access_token: safeText(body?.access_token) || accessToken,
    expires_in: typeof body?.expires_in === "number" && Number.isFinite(body.expires_in) ? body.expires_in : THREADS_LONG_LIVED_TOKEN_TTL_MS / 1e3
  };
}
function upsertBotUserFromThreadsProfile(data, profile, accessToken, expiresAt) {
  const threadsUserId = safeText(profile.id);
  const threadsHandle = normalizeThreadsHandle(safeText(profile.username));
  if (!threadsUserId || !threadsHandle) {
    throw new Error("Threads OAuth did not return a valid user profile.");
  }
  const byUserId = getBotUserByThreadsUserId(data, threadsUserId);
  const byHandle = getBotUserByHandle(data, threadsHandle);
  if (byUserId && byHandle && byUserId.id !== byHandle.id) {
    throw new Error("This Threads account conflicts with an existing scrapbook record.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const user = byUserId ?? byHandle ?? {
    id: crypto.randomUUID(),
    threadsUserId: null,
    threadsHandle,
    displayName: null,
    profilePictureUrl: null,
    biography: null,
    isVerified: false,
    accessTokenCiphertext: null,
    tokenExpiresAt: null,
    email: null,
    grantedScopes: [],
    scopeVersion: 0,
    lastScopeUpgradeAt: null,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    status: "active"
  };
  user.threadsUserId = threadsUserId;
  user.threadsHandle = threadsHandle;
  user.displayName = safeText(profile.name) || threadsHandle;
  user.profilePictureUrl = safeText(profile.threads_profile_picture_url) || null;
  user.biography = safeText(profile.threads_biography) || null;
  user.isVerified = profile.is_verified === true;
  user.accessTokenCiphertext = encryptSecret2(accessToken);
  user.tokenExpiresAt = expiresAt;
  user.grantedScopes = [...THREADS_OAUTH_SCOPES];
  user.scopeVersion = BOT_SCOPE_VERSION;
  user.lastScopeUpgradeAt = now;
  user.updatedAt = now;
  user.status = "active";
  upsertBotUser(data, user);
  return user;
}
function buildBotAccessTokenExpiry(expiresIn) {
  if (!Number.isFinite(expiresIn) || typeof expiresIn !== "number" || expiresIn <= 0) {
    return null;
  }
  return new Date(Date.now() + expiresIn * 1e3).toISOString();
}
function getBotPublicConfig() {
  return {
    botHandle: readBotHandle(),
    oauthConfigured: isThreadsOauthConfigured()
  };
}
function getConfiguredBotHandle() {
  return readBotHandle();
}
function startBotOauth(data, publicOrigin) {
  if (!isThreadsOauthConfigured()) {
    throw new Error("Threads OAuth is not configured on the server yet.");
  }
  touchExpiredOauthSessions(data);
  const rawState = createOpaqueToken();
  const rawPollToken = createOpaqueToken();
  const session = {
    id: crypto.randomUUID(),
    stateHash: hashSecret(rawState),
    pollTokenHash: hashSecret(rawPollToken),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: new Date(Date.now() + BOT_OAUTH_TTL_MS).toISOString(),
    completedAt: null,
    activationCode: null,
    activationExpiresAt: null,
    linkedSessionToken: null,
    status: "pending"
  };
  upsertBotOauthSession(data, session);
  return {
    authorizeUrl: buildThreadsAuthorizeUrl(publicOrigin, rawState),
    botHandle: readBotHandle(),
    pollToken: rawPollToken
  };
}
async function completeBotOauth(data, rawState, code, publicOrigin) {
  if (!isThreadsOauthConfigured()) {
    throw new Error("Threads OAuth is not configured on the server yet.");
  }
  touchExpiredOauthSessions(data);
  touchExpiredSessions(data);
  const normalizedState = safeText(rawState);
  const oauthSession = data.botOauthSessions.find(
    (candidate) => candidate.stateHash === hashSecret(normalizedState) && candidate.status === "pending"
  ) ?? null;
  if (!oauthSession || isExpired(oauthSession.expiresAt)) {
    throw new Error("This Threads sign-in session is invalid or expired.");
  }
  const tokenResponse = await exchangeAuthorizationCode(safeText(code), publicOrigin);
  const shortLivedAccessToken = safeText(tokenResponse.access_token);
  if (!shortLivedAccessToken) {
    throw new Error("Threads OAuth did not return an access token.");
  }
  let activeAccessToken = shortLivedAccessToken;
  let tokenExpiresAt = buildBotAccessTokenExpiry(tokenResponse.expires_in);
  try {
    const longLived = await exchangeLongLivedToken(shortLivedAccessToken);
    if (safeText(longLived.access_token)) {
      activeAccessToken = safeText(longLived.access_token);
      tokenExpiresAt = buildBotAccessTokenExpiry(longLived.expires_in);
    }
  } catch {
  }
  const profile = await fetchThreadsProfile(activeAccessToken);
  const user = upsertBotUserFromThreadsProfile(data, profile, activeAccessToken, tokenExpiresAt);
  const rawActivationCode = createOpaqueToken();
  const sessionResult = createBotSession(data, user);
  oauthSession.status = "completed";
  oauthSession.completedAt = (/* @__PURE__ */ new Date()).toISOString();
  oauthSession.activationCode = rawActivationCode;
  oauthSession.activationExpiresAt = new Date(Date.now() + BOT_OAUTH_ACTIVATION_TTL_MS).toISOString();
  oauthSession.linkedSessionToken = sessionResult.sessionToken;
  upsertBotOauthSession(data, oauthSession);
  return { ...sessionResult, activationCode: rawActivationCode };
}
function failBotOauthSession(data, rawState) {
  const normalizedState = safeText(rawState);
  const oauthSession = data.botOauthSessions.find(
    (s) => s.stateHash === hashSecret(normalizedState) && s.status === "pending"
  ) ?? null;
  if (oauthSession) {
    oauthSession.status = "failed";
    upsertBotOauthSession(data, oauthSession);
  }
}
function pollBotOauthSession(data, rawPollToken) {
  touchExpiredOauthSessions(data);
  const pollTokenHash = hashSecret(safeText(rawPollToken));
  const oauthSession = data.botOauthSessions.find((s) => s.pollTokenHash === pollTokenHash) ?? null;
  if (!oauthSession || isExpired(oauthSession.expiresAt)) {
    return { status: "expired" };
  }
  if (oauthSession.status === "expired" || oauthSession.status === "failed") {
    return { status: "expired" };
  }
  if (oauthSession.status === "completed") {
    if (oauthSession.activationCode && oauthSession.activationExpiresAt && !isExpired(oauthSession.activationExpiresAt)) {
      return { status: "authorized", activationCode: oauthSession.activationCode };
    }
    return { status: "expired" };
  }
  return { status: "pending" };
}
function activateBotOauthSession(data, rawActivationCode) {
  const code = safeText(rawActivationCode);
  const oauthSession = data.botOauthSessions.find((s) => s.activationCode === code) ?? null;
  if (!oauthSession || !oauthSession.activationExpiresAt || isExpired(oauthSession.activationExpiresAt) || !oauthSession.linkedSessionToken) {
    return null;
  }
  const sessionToken = oauthSession.linkedSessionToken;
  oauthSession.activationCode = null;
  oauthSession.activationExpiresAt = null;
  oauthSession.linkedSessionToken = null;
  upsertBotOauthSession(data, oauthSession);
  return { sessionToken };
}
function createExtensionLinkCode(data, rawSession, state) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("Sign in to Threads Archive scrapbook first.");
  }
  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user) {
    session.status = "revoked";
    session.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertBotSession(data, session);
    throw new Error("Your Threads Archive scrapbook session expired. Sign in again.");
  }
  const normalizedState = safeText(state);
  if (!normalizedState) {
    throw new Error("A valid extension link state is required.");
  }
  touchExpiredExtensionLinkSessions(data);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const rawCode = createOpaqueToken();
  const linkSession = {
    id: crypto.randomUUID(),
    userId: user.id,
    state: normalizedState,
    codeHash: hashSecret(rawCode),
    createdAt: now,
    expiresAt: new Date(Date.now() + BOT_EXTENSION_LINK_TTL_MS).toISOString(),
    consumedAt: null,
    revokedAt: null,
    status: "pending"
  };
  upsertBotExtensionLinkSession(data, linkSession);
  return {
    code: rawCode,
    expiresAt: linkSession.expiresAt,
    userHandle: user.threadsHandle
  };
}
function completeExtensionLinkCode(data, rawCode, state) {
  touchExpiredExtensionLinkSessions(data);
  touchExpiredExtensionAccessTokens(data);
  const normalizedCode = safeText(rawCode);
  const normalizedState = safeText(state);
  if (!normalizedCode || !normalizedState) {
    throw new Error("A valid extension link code is required.");
  }
  const linkSession = data.botExtensionLinkSessions.find(
    (candidate) => candidate.codeHash === hashSecret(normalizedCode) && candidate.state === normalizedState && candidate.status === "pending"
  ) ?? null;
  if (!linkSession || isExpired(linkSession.expiresAt)) {
    throw new Error("This extension link request is invalid or expired.");
  }
  const user = data.botUsers.find((candidate) => candidate.id === linkSession.userId && candidate.status === "active");
  if (!user) {
    linkSession.status = "revoked";
    linkSession.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertBotExtensionLinkSession(data, linkSession);
    throw new Error("This scrapbook account is no longer available.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  linkSession.status = "consumed";
  linkSession.consumedAt = now;
  upsertBotExtensionLinkSession(data, linkSession);
  revokeActiveExtensionTokensForUser(data, user.id, now);
  const rawToken = createOpaqueToken();
  const tokenRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: hashSecret(rawToken),
    createdAt: now,
    expiresAt: new Date(Date.now() + BOT_EXTENSION_TOKEN_TTL_MS).toISOString(),
    linkedAt: now,
    lastUsedAt: null,
    revokedAt: null,
    status: "active"
  };
  upsertBotExtensionAccessToken(data, tokenRecord);
  return {
    token: rawToken,
    expiresAt: tokenRecord.expiresAt,
    linkedAt: tokenRecord.linkedAt,
    userHandle: user.threadsHandle
  };
}
function buildCloudConnectionStatusFromTokenRecord(data, tokenRecord) {
  if (!tokenRecord) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }
  const user = data.botUsers.find((candidate) => candidate.id === tokenRecord.userId && candidate.status === "active");
  if (!user) {
    tokenRecord.status = "revoked";
    tokenRecord.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertBotExtensionAccessToken(data, tokenRecord);
    return {
      state: "revoked",
      userHandle: null,
      expiresAt: tokenRecord.expiresAt,
      linkedAt: tokenRecord.linkedAt
    };
  }
  const state = tokenRecord.status === "active" ? "linked" : tokenRecord.status === "expired" ? "expired" : "revoked";
  return {
    state,
    userHandle: user.threadsHandle,
    expiresAt: tokenRecord.expiresAt,
    linkedAt: tokenRecord.linkedAt
  };
}
function getExtensionCloudConnectionStatus(data, rawToken) {
  return buildCloudConnectionStatusFromTokenRecord(data, findBotExtensionAccessTokenRecord(data, rawToken));
}
function requireExtensionLinkUser(data, rawToken) {
  const tokenRecord = findBotExtensionAccessTokenRecord(data, rawToken);
  if (!tokenRecord || tokenRecord.status !== "active") {
    throw new Error("Your cloud connection expired. Reconnect the extension.");
  }
  const user = data.botUsers.find((candidate) => candidate.id === tokenRecord.userId && candidate.status === "active");
  if (!user) {
    tokenRecord.status = "revoked";
    tokenRecord.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertBotExtensionAccessToken(data, tokenRecord);
    throw new Error("Your cloud connection expired. Reconnect the extension.");
  }
  tokenRecord.lastUsedAt = (/* @__PURE__ */ new Date()).toISOString();
  upsertBotExtensionAccessToken(data, tokenRecord);
  return { user, tokenRecord };
}
function revokeExtensionCloudConnection(data, rawToken) {
  const tokenRecord = findBotExtensionAccessTokenRecord(data, rawToken);
  if (!tokenRecord) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }
  if (tokenRecord.status === "active") {
    tokenRecord.status = "revoked";
    tokenRecord.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertBotExtensionAccessToken(data, tokenRecord);
  }
  return buildCloudConnectionStatusFromTokenRecord(data, tokenRecord);
}
function getBotSessionState(data, rawSession) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    return {
      authenticated: false,
      botHandle: readBotHandle(),
      oauthConfigured: isThreadsOauthConfigured(),
      user: null,
      archives: []
    };
  }
  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user) {
    session.status = "revoked";
    session.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertBotSession(data, session);
    return {
      authenticated: false,
      botHandle: readBotHandle(),
      oauthConfigured: isThreadsOauthConfigured(),
      user: null,
      archives: []
    };
  }
  const archives = [
    ...data.botArchives.filter((candidate) => candidate.userId === user.id).map(toBotArchiveView),
    ...data.cloudArchives.filter((candidate) => candidate.userId === user.id).map(toCloudArchiveView)
  ].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  return {
    authenticated: true,
    botHandle: readBotHandle(),
    oauthConfigured: isThreadsOauthConfigured(),
    user: toBotUserView(user),
    archives
  };
}
function revokeBotSession(data, rawSession) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    return;
  }
  session.status = "revoked";
  session.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
  upsertBotSession(data, session);
}
function readBotArchiveMarkdown(data, rawSession, archiveId) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }
  const mentionArchive = data.botArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ?? null;
  if (mentionArchive) {
    const extractedPost = readArchiveExtractedPost(mentionArchive.rawPayloadJson);
    const titleText2 = extractedPost?.text ?? mentionArchive.targetText;
    const titleAuthor2 = mentionArchive.targetAuthorHandle ?? extractedPost?.author ?? null;
    return {
      filename: `${buildArchiveFilenameBase(titleAuthor2, titleText2)}.md`,
      markdownContent: buildArchiveMarkdownFromRecord(mentionArchive, mentionArchive.mediaUrls)
    };
  }
  const cloudArchive = data.cloudArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ?? null;
  if (!cloudArchive) {
    throw new Error("The requested archive could not be found.");
  }
  const payload = readCloudArchivePayload(cloudArchive.rawPayloadJson);
  const titleText = payload.extractedPost?.text ?? cloudArchive.targetText;
  const titleAuthor = cloudArchive.targetAuthorHandle ?? payload.extractedPost?.author ?? null;
  return {
    filename: `${buildArchiveFilenameBase(titleAuthor, titleText)}.md`,
    markdownContent: safeText(cloudArchive.markdownContent) || `# ${buildArchiveTitle(titleAuthor, titleText)}
`
  };
}
async function readBotArchiveZip(data, rawSession, archiveIds) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }
  const requestedIds = [...new Set(archiveIds.map((value) => safeText(value)).filter(Boolean))];
  if (requestedIds.length === 0) {
    throw new Error("Select at least one archive to export.");
  }
  const archives = requestedIds.map(
    (archiveId) => data.botArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ?? data.cloudArchives.find((candidate) => candidate.id === archiveId && candidate.userId === session.userId) ?? null
  ).filter((candidate) => Boolean(candidate));
  if (archives.length === 0) {
    throw new Error("The requested archives could not be found.");
  }
  return buildArchiveZipBundle(archives);
}
function buildArchiveRawPayload(payload) {
  if (payload.rawPayload === void 0 && !payload.extractedPost) {
    return null;
  }
  const baseRecord = toRecord(payload.rawPayload);
  const value = payload.extractedPost ? {
    ...baseRecord ?? {},
    extractedPost: payload.extractedPost
  } : payload.rawPayload;
  return JSON.stringify(value);
}
function validateBotIngestRequest(authHeader) {
  const expected = requireBotIngestToken();
  if (safeText(authHeader) !== `Bearer ${expected}`) {
    throw new Error("Unauthorized bot ingest request.");
  }
}
function ingestBotMention(data, payload) {
  const mentionUrl = safeText(payload.mentionUrl);
  const mentionAuthorUserId = safeText(payload.mentionAuthorUserId) || null;
  const mentionAuthorHandle = normalizeThreadsHandle(payload.mentionAuthorHandle ?? "");
  const extractedPost = payload.extractedPost ?? null;
  const targetUrl = safeText(extractedPost?.canonicalUrl ?? payload.targetUrl);
  const targetText = safeText(extractedPost?.text ?? payload.targetText);
  if (!mentionUrl || !mentionAuthorUserId && !mentionAuthorHandle || !targetUrl) {
    throw new Error("mentionUrl, mentionAuthor identity, and targetUrl are required.");
  }
  const user = (mentionAuthorUserId ? getBotUserByThreadsUserId(data, mentionAuthorUserId) : null) ?? (mentionAuthorHandle ? getBotUserByHandle(data, mentionAuthorHandle) : null);
  if (!user) {
    return {
      ok: true,
      matched: false,
      created: false,
      archiveId: null,
      reason: "user_not_found"
    };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const mediaUrls = extractedPost ? summarizeExtractedPostPreviewMediaUrls(extractedPost) : Array.isArray(payload.mediaUrls) ? payload.mediaUrls.map((value) => safeText(value)).filter(Boolean) : [];
  const noteText = safeText(payload.noteText) || null;
  const rawPayloadJson = buildArchiveRawPayload(payload);
  const archiveDraft = {
    mentionUrl,
    mentionAuthorHandle: mentionAuthorHandle || user.threadsHandle,
    mentionAuthorDisplayName: safeText(payload.mentionAuthorDisplayName) || user.displayName,
    noteText,
    targetUrl,
    targetAuthorHandle: safeText(payload.targetAuthorHandle) || extractedPost?.author || null,
    targetAuthorDisplayName: safeText(payload.targetAuthorDisplayName) || null,
    targetText,
    targetPublishedAt: safeText(extractedPost?.publishedAt ?? payload.targetPublishedAt) || null,
    rawPayloadJson,
    archivedAt: now
  };
  const markdownContent = buildArchiveMarkdownFromRecord(archiveDraft, mediaUrls);
  const existing = data.botArchives.find((candidate) => {
    if (candidate.userId !== user.id) {
      return false;
    }
    if (payload.mentionId && candidate.mentionId) {
      return candidate.mentionId === safeText(payload.mentionId);
    }
    return candidate.mentionUrl === mentionUrl;
  });
  if (existing) {
    existing.mentionAuthorHandle = mentionAuthorHandle || existing.mentionAuthorHandle;
    existing.mentionAuthorDisplayName = safeText(payload.mentionAuthorDisplayName) || existing.mentionAuthorDisplayName;
    existing.noteText = noteText ?? existing.noteText;
    existing.targetUrl = targetUrl;
    existing.targetAuthorHandle = safeText(payload.targetAuthorHandle) || extractedPost?.author || null;
    existing.targetAuthorDisplayName = safeText(payload.targetAuthorDisplayName) || null;
    existing.targetText = targetText;
    existing.targetPublishedAt = safeText(extractedPost?.publishedAt ?? payload.targetPublishedAt) || null;
    existing.mediaUrls = mediaUrls;
    existing.markdownContent = markdownContent;
    existing.rawPayloadJson = rawPayloadJson ?? existing.rawPayloadJson;
    existing.updatedAt = now;
    upsertBotArchive(data, existing);
    return {
      ok: true,
      matched: true,
      created: false,
      archiveId: existing.id,
      reason: null
    };
  }
  const archive = {
    id: crypto.randomUUID(),
    userId: user.id,
    mentionId: safeText(payload.mentionId) || null,
    mentionUrl,
    mentionAuthorHandle: mentionAuthorHandle || user.threadsHandle,
    mentionAuthorDisplayName: safeText(payload.mentionAuthorDisplayName) || user.displayName,
    noteText,
    targetUrl,
    targetAuthorHandle: safeText(payload.targetAuthorHandle) || null,
    targetAuthorDisplayName: safeText(payload.targetAuthorDisplayName) || null,
    targetText,
    targetPublishedAt: safeText(extractedPost?.publishedAt ?? payload.targetPublishedAt) || null,
    mediaUrls,
    markdownContent,
    rawPayloadJson,
    archivedAt: now,
    updatedAt: now,
    status: "saved"
  };
  upsertBotArchive(data, archive);
  return {
    ok: true,
    matched: true,
    created: true,
    archiveId: archive.id,
    reason: null
  };
}
async function saveCloudArchiveForUser(data, user, input, publicOrigin) {
  const post = input.post;
  const canonicalUrl = safeText(post.canonicalUrl);
  const shortcode = safeText(post.shortcode);
  const contentHash = safeText(post.contentHash);
  if (!canonicalUrl || !shortcode || !contentHash) {
    throw new Error("A valid Threads post is required for cloud save.");
  }
  const locale = normalizeLocale(input.locale, "ko");
  const mediaUrls = summarizeExtractedPostPreviewMediaUrls(post);
  const markdownContent = await renderMarkdown(
    post,
    buildRemoteMarkdownMediaRefs(post),
    input.aiWarning ?? null,
    input.aiResult ?? null,
    locale
  );
  const rawPayloadJson = buildCloudArchiveRawPayload({
    ...input,
    locale
  });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const title = buildArchiveTitle(post.author, post.text);
  const existing = data.cloudArchives.find(
    (candidate) => candidate.userId === user.id && (candidate.contentHash === contentHash || candidate.canonicalUrl === canonicalUrl)
  ) ?? null;
  if (existing) {
    existing.canonicalUrl = canonicalUrl;
    existing.shortcode = shortcode;
    existing.targetAuthorHandle = safeText(post.author) || existing.targetAuthorHandle;
    existing.targetAuthorDisplayName = existing.targetAuthorDisplayName;
    existing.targetTitle = safeText(post.title) || title;
    existing.targetText = safeText(post.text) || existing.targetText;
    existing.targetPublishedAt = safeText(post.publishedAt) || null;
    existing.mediaUrls = mediaUrls;
    existing.markdownContent = markdownContent;
    existing.rawPayloadJson = rawPayloadJson;
    existing.contentHash = contentHash;
    existing.updatedAt = now;
    upsertCloudArchive(data, existing);
    return {
      archiveId: existing.id,
      archiveUrl: buildCloudArchiveUrl(publicOrigin, existing.id),
      title: existing.targetTitle,
      warning: input.aiWarning ?? null,
      created: false
    };
  }
  const archive = {
    id: crypto.randomUUID(),
    userId: user.id,
    canonicalUrl,
    shortcode,
    targetAuthorHandle: safeText(post.author) || null,
    targetAuthorDisplayName: null,
    targetTitle: safeText(post.title) || title,
    targetText: safeText(post.text),
    targetPublishedAt: safeText(post.publishedAt) || null,
    mediaUrls,
    markdownContent,
    rawPayloadJson,
    contentHash,
    savedAt: now,
    updatedAt: now,
    status: "saved"
  };
  upsertCloudArchive(data, archive);
  return {
    archiveId: archive.id,
    archiveUrl: buildCloudArchiveUrl(publicOrigin, archive.id),
    title: archive.targetTitle,
    warning: input.aiWarning ?? null,
    created: true
  };
}
async function saveCloudArchiveWithExtensionToken(data, rawToken, input, publicOrigin) {
  const { user } = requireExtensionLinkUser(data, rawToken);
  return saveCloudArchiveForUser(data, user, input, publicOrigin);
}
function clearArchiveReferences(data, userId, archiveId) {
  for (const result of data.searchResults) {
    if (result.userId !== userId || result.archiveId !== archiveId) {
      continue;
    }
    result.archiveId = null;
    result.archivedAt = null;
    if (result.status === "archived") {
      result.status = "new";
    }
  }
  for (const tracked of data.trackedPosts) {
    if (tracked.userId !== userId || tracked.archiveId !== archiveId) {
      continue;
    }
    tracked.archiveId = null;
    tracked.archivedAt = null;
  }
}
function deleteArchive(data, rawSession, archiveId) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }
  const normalizedId = safeText(archiveId);
  if (!normalizedId) {
    throw new Error("Select an archive to delete.");
  }
  const mentionIndex = data.botArchives.findIndex(
    (candidate) => candidate.id === normalizedId && candidate.userId === session.userId
  );
  if (mentionIndex >= 0) {
    data.botArchives.splice(mentionIndex, 1);
    clearArchiveReferences(data, session.userId, normalizedId);
    return getBotSessionState(data, rawSession);
  }
  const cloudIndex = data.cloudArchives.findIndex(
    (candidate) => candidate.id === normalizedId && candidate.userId === session.userId
  );
  if (cloudIndex >= 0) {
    data.cloudArchives.splice(cloudIndex, 1);
    clearArchiveReferences(data, session.userId, normalizedId);
    return getBotSessionState(data, rawSession);
  }
  throw new Error("The requested archive could not be found.");
}
function getBotSessionUserRecord(data, rawSession) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    return null;
  }
  return data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active") ?? null;
}
function getBotRequiredScopes() {
  return [...THREADS_OAUTH_SCOPES];
}
function getBotScopeVersion() {
  return BOT_SCOPE_VERSION;
}
async function getFreshAccessTokenForUser(data, user) {
  if (!user.accessTokenCiphertext) {
    return null;
  }
  const decrypted = decryptSecret2(user.accessTokenCiphertext);
  const expiry = user.tokenExpiresAt ? Date.parse(user.tokenExpiresAt) : Number.NaN;
  if (!Number.isFinite(expiry) || expiry > Date.now() + BOT_TOKEN_REFRESH_WINDOW_MS) {
    return decrypted;
  }
  try {
    const refreshed = await refreshThreadsAccessToken(decrypted);
    const nextToken = safeText(refreshed.access_token) || decrypted;
    user.accessTokenCiphertext = encryptSecret2(nextToken);
    user.tokenExpiresAt = buildBotAccessTokenExpiry(refreshed.expires_in);
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertBotUser(data, user);
    return nextToken;
  } catch {
    if (expiry > Date.now()) {
      return decrypted;
    }
    throw new Error("The stored Threads access token expired. Sign in with Threads again.");
  }
}
async function getBotAccessTokenForHandle(data, rawHandle) {
  const handle = normalizeThreadsHandle(rawHandle ?? "");
  if (!handle) {
    return null;
  }
  const user = getBotUserByHandle(data, handle);
  if (!user) {
    return null;
  }
  return getFreshAccessTokenForUser(data, user);
}
async function getBotSessionAuthContext(data, rawSession) {
  const session = getBotSessionRecord(data, rawSession);
  if (!session) {
    throw new Error("You need to sign in first.");
  }
  const user = data.botUsers.find((candidate) => candidate.id === session.userId && candidate.status === "active");
  if (!user) {
    throw new Error("This scrapbook session is no longer active.");
  }
  const accessToken = await getFreshAccessTokenForUser(data, user);
  if (!accessToken) {
    throw new Error("Reconnect with Threads to use advanced scrapbook features.");
  }
  return { user, accessToken };
}
async function getBotAccessTokenForThreadsUserId(data, rawThreadsUserId) {
  const threadsUserId = safeText(rawThreadsUserId);
  if (!threadsUserId) {
    return null;
  }
  const user = getBotUserByThreadsUserId(data, threadsUserId);
  if (!user) {
    return null;
  }
  return getFreshAccessTokenForUser(data, user);
}

// src/server/scrapbook-plus-service.ts
import { createHash as createHash4 } from "node:crypto";

// src/server/threads-client.ts
var THREADS_GRAPH_BASE_URL2 = "https://graph.threads.net";
function safeText2(value) {
  return typeof value === "string" ? value.trim() : "";
}
function readGraphApiVersion() {
  return process.env.THREADS_GRAPH_API_VERSION?.trim() || "v1.0";
}
function buildGraphApiUrl(pathname) {
  return new URL(pathname.replace(/^\//, ""), `${THREADS_GRAPH_BASE_URL2}/${readGraphApiVersion()}/`);
}
function parseThreadsApiError(payload, fallback) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const record = payload;
  const nested = record.error;
  if (nested && typeof nested === "object") {
    const nestedRecord = nested;
    const message = safeText2(nestedRecord.message);
    if (message) {
      return message;
    }
  }
  const directMessage = safeText2(record.error_message) || safeText2(record.message);
  return directMessage || fallback;
}
async function requestThreadsJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(parseThreadsApiError(body, `Threads API request failed (${response.status}).`));
  }
  return body ?? {};
}
function buildPostFields() {
  return [
    "id",
    "text",
    "permalink",
    "username",
    "timestamp",
    "media_type",
    "media_product_type",
    "media_url",
    "thumbnail_url",
    "short_code",
    "link_attachment_url",
    "children{media_type,media_url,thumbnail_url}"
  ].join(",");
}
function normalizePost(value, profileFallback) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value;
  const id = safeText2(record.id);
  const permalink = safeText2(record.permalink);
  if (!id || !permalink) {
    return null;
  }
  const childItems = Array.isArray(record.children) ? record.children : Array.isArray(record.children?.data) ? record.children.data ?? [] : [];
  return {
    id,
    text: safeText2(record.text),
    permalink,
    username: safeText2(record.username) || profileFallback?.username || "",
    timestamp: safeText2(record.timestamp) || null,
    media_type: safeText2(record.media_type) || null,
    media_product_type: safeText2(record.media_product_type) || null,
    media_url: safeText2(record.media_url) || null,
    thumbnail_url: safeText2(record.thumbnail_url) || null,
    short_code: safeText2(record.short_code) || null,
    link_attachment_url: safeText2(record.link_attachment_url) || null,
    children: childItems.map((child) => {
      if (!child || typeof child !== "object" || Array.isArray(child)) {
        return null;
      }
      const childRecord = child;
      return {
        media_type: safeText2(childRecord.media_type) || null,
        media_url: safeText2(childRecord.media_url) || null,
        thumbnail_url: safeText2(childRecord.thumbnail_url) || null
      };
    }).filter((child) => Boolean(child)),
    raw: record
  };
}
function extractMetricValue(item) {
  const total = item?.total_value?.value;
  if (typeof total === "number" && Number.isFinite(total)) {
    return total;
  }
  const lastValue = item?.values?.find((candidate) => typeof candidate?.value === "number");
  if (typeof lastValue?.value === "number" && Number.isFinite(lastValue.value)) {
    return lastValue.value;
  }
  return null;
}
async function requestInsightMetric(accessToken, pathname, metric) {
  const url = buildGraphApiUrl(pathname);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("metric", metric);
  try {
    const payload = await requestThreadsJson(url);
    const items = Array.isArray(payload.data) ? payload.data : [];
    const first = items[0] ?? null;
    return {
      name: safeText2(first?.name) || metric,
      value: extractMetricValue(first),
      raw: items.filter((item) => Boolean(item && typeof item === "object"))
    };
  } catch {
    return { name: metric, value: null, raw: [] };
  }
}
async function lookupPublicProfile(accessToken, username) {
  const url = buildGraphApiUrl("profile_lookup");
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("username", username.replace(/^@+/, "").trim().toLowerCase());
  url.searchParams.set(
    "fields",
    ["id", "username", "name", "threads_profile_picture_url", "threads_biography", "is_verified"].join(",")
  );
  const payload = await requestThreadsJson(url);
  const profile = {
    id: safeText2(payload.id),
    username: safeText2(payload.username),
    name: safeText2(payload.name) || null,
    threads_profile_picture_url: safeText2(payload.threads_profile_picture_url) || null,
    threads_biography: safeText2(payload.threads_biography) || null,
    is_verified: payload.is_verified === true
  };
  if (!profile.id || !profile.username) {
    throw new Error("Threads profile discovery returned an invalid profile.");
  }
  return profile;
}
async function listPublicProfilePosts(accessToken, threadsUserId, limit = 12, profileFallback) {
  const url = buildGraphApiUrl(`${threadsUserId}/threads`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", buildPostFields());
  url.searchParams.set("limit", String(limit));
  const payload = await requestThreadsJson(url);
  const items = Array.isArray(payload.data) ? payload.data : [];
  return items.map((item) => normalizePost(item, profileFallback)).filter((item) => Boolean(item));
}
async function searchKeywordPosts(accessToken, query, limit = 12, searchType = "TOP") {
  const candidates = [];
  for (const paramName of ["query", "q"]) {
    const url = buildGraphApiUrl("keyword_search");
    url.searchParams.set("access_token", accessToken);
    url.searchParams.set(paramName, query);
    url.searchParams.set("fields", buildPostFields());
    url.searchParams.set("search_type", searchType);
    url.searchParams.set("limit", String(limit));
    candidates.push(url);
  }
  let lastError = null;
  for (const url of candidates) {
    try {
      const payload = await requestThreadsJson(url);
      const items = Array.isArray(payload.data) ? payload.data : [];
      return items.map((item) => normalizePost(item)).filter((item) => Boolean(item));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Threads keyword search failed.");
    }
  }
  throw lastError ?? new Error("Threads keyword search failed.");
}
async function listOwnPosts(accessToken, limit = 8) {
  const url = buildGraphApiUrl("me/threads");
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", buildPostFields());
  url.searchParams.set("limit", String(limit));
  const payload = await requestThreadsJson(url);
  const items = Array.isArray(payload.data) ? payload.data : [];
  return items.map((item) => normalizePost(item)).filter((item) => Boolean(item));
}
async function getProfileInsights(accessToken) {
  const metrics = ["views", "likes", "replies", "reposts", "quotes", "followers_count", "profile_views"];
  const results = await Promise.all(metrics.map((metric) => requestInsightMetric(accessToken, "me/threads_insights", metric)));
  const raw = results.flatMap((result) => result.raw);
  return {
    likes: results.find((result) => result.name === "likes")?.value ?? null,
    replies: results.find((result) => result.name === "replies")?.value ?? null,
    reposts: results.find((result) => result.name === "reposts")?.value ?? null,
    quotes: results.find((result) => result.name === "quotes")?.value ?? null,
    views: results.find((result) => result.name === "views")?.value ?? null,
    followers: results.find((result) => result.name === "followers_count")?.value ?? null,
    profileViews: results.find((result) => result.name === "profile_views")?.value ?? null,
    raw
  };
}
async function getPostInsights(accessToken, postId) {
  const metrics = ["views", "likes", "replies", "reposts", "quotes"];
  const results = await Promise.all(
    metrics.map((metric) => requestInsightMetric(accessToken, `${postId}/insights`, metric))
  );
  const raw = results.flatMap((result) => result.raw);
  return {
    likes: results.find((result) => result.name === "likes")?.value ?? null,
    replies: results.find((result) => result.name === "replies")?.value ?? null,
    reposts: results.find((result) => result.name === "reposts")?.value ?? null,
    quotes: results.find((result) => result.name === "quotes")?.value ?? null,
    views: results.find((result) => result.name === "views")?.value ?? null,
    followers: null,
    profileViews: null,
    raw
  };
}
function collectPostMediaUrls(post) {
  const urls = [post.media_url, post.thumbnail_url, post.link_attachment_url];
  for (const child of post.children) {
    urls.push(child.media_url, child.thumbnail_url);
  }
  return [...new Set(urls.map((value) => safeText2(value)).filter(Boolean))];
}

// src/server/scrapbook-plus-service.ts
function toOperationalStatusError(error, fallback) {
  if (error instanceof Error) {
    if (/unauthorized|forbidden|expired|401|403/i.test(error.message)) {
      return "Reconnect Threads to restore this feature.";
    }
    if (/rate.?limit|429/i.test(error.message)) {
      return "Threads API rate limit reached. Try again later.";
    }
    if (/network|fetch|timeout|econn|socket/i.test(error.message)) {
      return "Threads API is temporarily unavailable.";
    }
  }
  return fallback;
}
function safeText3(value) {
  return typeof value === "string" ? value.trim() : "";
}
function normalizeHandle(value) {
  return safeText3(value).replace(/^@+/, "").toLowerCase();
}
function titleFromText(text, fallback) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return fallback;
  }
  const excerpt = Array.from(normalized).slice(0, 80).join("").trim();
  return excerpt || fallback;
}
function normalizeMediaType(post) {
  const mediaType = safeText3(post.media_type).toUpperCase();
  if (mediaType.includes("VIDEO")) {
    return "VIDEO";
  }
  if (mediaType.includes("IMAGE")) {
    return "IMAGE";
  }
  if (mediaType.includes("CAROUSEL")) {
    return "CAROUSEL";
  }
  return "TEXT";
}
function createScopeState(user) {
  const requiredScopes = getBotRequiredScopes();
  const grantedScopes = user ? [...user.grantedScopes] : [];
  const missingScopes = requiredScopes.filter((scope) => !grantedScopes.includes(scope));
  const requiredScopeVersion = getBotScopeVersion();
  const scopeVersion = user?.scopeVersion ?? 0;
  return {
    requiredScopes,
    grantedScopes,
    missingScopes,
    scopeVersion,
    requiredScopeVersion,
    needsReconnect: !user || missingScopes.length > 0 || scopeVersion < requiredScopeVersion
  };
}
async function requireAdvancedContext(data, rawSession) {
  const context = await getBotSessionAuthContext(data, rawSession);
  const scopes = createScopeState(context.user);
  if (scopes.needsReconnect) {
    throw new Error("Reconnect with Threads to grant profile discovery, keyword search, and insights permissions.");
  }
  return context;
}
function getLatestWatchlistResults(data, userId, watchlistId) {
  return data.trackedPosts.filter((candidate) => candidate.userId === userId && candidate.origin === "watchlist" && candidate.sourceId === watchlistId).sort((left, right) => Date.parse(right.discoveredAt) - Date.parse(left.discoveredAt));
}
function getLatestSearchResults(data, userId, monitorId) {
  return data.searchResults.filter((candidate) => candidate.userId === userId && candidate.monitorId === monitorId).sort((left, right) => Date.parse(right.discoveredAt) - Date.parse(left.discoveredAt));
}
function toTrackedPostView(record) {
  return {
    id: record.id,
    externalPostId: record.externalPostId,
    canonicalUrl: record.canonicalUrl,
    authorHandle: record.authorHandle,
    authorDisplayName: record.authorDisplayName,
    text: record.text,
    publishedAt: record.publishedAt,
    mediaType: record.mediaType,
    mediaUrls: [...record.mediaUrls],
    matchedTerms: [...record.matchedTerms],
    relevanceScore: record.relevanceScore,
    archived: Boolean(record.archiveId),
    archiveId: record.archiveId,
    discoveredAt: record.discoveredAt
  };
}
function toSearchResultView(record) {
  return {
    id: record.id,
    externalPostId: record.externalPostId,
    canonicalUrl: record.canonicalUrl,
    authorHandle: record.authorHandle,
    authorDisplayName: record.authorDisplayName,
    text: record.text,
    publishedAt: record.publishedAt,
    mediaType: record.mediaType,
    mediaUrls: [...record.mediaUrls],
    matchedTerms: [...record.matchedTerms],
    relevanceScore: record.relevanceScore,
    archiveId: record.archiveId,
    discoveredAt: record.discoveredAt,
    status: record.status
  };
}
function metricValue(current, previous) {
  return {
    value: current,
    delta: typeof current === "number" && typeof previous === "number" && Number.isFinite(current) && Number.isFinite(previous) ? current - previous : null
  };
}
function getInsightMetricSnapshotMap(data, userId) {
  const profileSnapshots = data.insightsSnapshots.filter((candidate) => candidate.userId === userId && candidate.kind === "profile").sort((left, right) => Date.parse(right.capturedAt) - Date.parse(left.capturedAt));
  const latestProfile = profileSnapshots[0] ?? null;
  const previousProfile = profileSnapshots[1] ?? null;
  const postSnapshotGroups = /* @__PURE__ */ new Map();
  for (const snapshot of data.insightsSnapshots.filter((candidate) => candidate.userId === userId && candidate.kind === "post" && candidate.externalPostId).sort((left, right) => Date.parse(right.capturedAt) - Date.parse(left.capturedAt))) {
    const key = snapshot.externalPostId;
    const group = postSnapshotGroups.get(key) ?? [];
    group.push(snapshot);
    postSnapshotGroups.set(key, group);
  }
  return {
    latestProfile,
    previousProfile,
    postSnapshotGroups
  };
}
function findExistingWatchlistPost(data, userId, watchlistId, externalPostId) {
  return data.trackedPosts.find(
    (candidate) => candidate.userId === userId && candidate.origin === "watchlist" && candidate.sourceId === watchlistId && candidate.externalPostId === externalPostId
  ) ?? null;
}
function findExistingInsightPost(data, userId, externalPostId) {
  return data.trackedPosts.find(
    (candidate) => candidate.userId === userId && candidate.origin === "insight" && candidate.externalPostId === externalPostId
  ) ?? null;
}
function ensureTrackedPostBelongsToUser(data, userId, trackedPostId) {
  const tracked = data.trackedPosts.find((candidate) => candidate.id === trackedPostId && candidate.userId === userId);
  if (!tracked) {
    throw new Error("The requested tracked post could not be found.");
  }
  return tracked;
}
function matchesWatchlist(post, watchlist) {
  const haystack = `${post.text}
${post.permalink}`.toLowerCase();
  const includeTokens = safeText3(watchlist.includeText).toLowerCase().split(/\s+/).filter(Boolean);
  const excludeTokens = safeText3(watchlist.excludeText).toLowerCase().split(/\s+/).filter(Boolean);
  if (includeTokens.length > 0 && !includeTokens.every((token) => haystack.includes(token))) {
    return false;
  }
  if (excludeTokens.some((token) => haystack.includes(token))) {
    return false;
  }
  if (watchlist.mediaTypes.length > 0 && !watchlist.mediaTypes.includes(normalizeMediaType(post))) {
    return false;
  }
  return true;
}
function buildMatchedTerms(query, text) {
  const haystack = text.toLowerCase();
  return [...new Set(query.toLowerCase().split(/\s+/).filter((token) => token.length > 1 && haystack.includes(token)))];
}
function buildRelevanceScore(query, text) {
  const matched = buildMatchedTerms(query, text);
  return matched.length;
}
function buildExtractedPost(post) {
  const normalizedMediaType = safeText3(post.mediaType).toUpperCase();
  const sourceType = normalizedMediaType === "VIDEO" ? "video" : normalizedMediaType === "IMAGE" || normalizedMediaType === "CAROUSEL" ? "image" : "text";
  const imageUrls = sourceType === "image" ? [...post.mediaUrls] : [];
  const videoUrl = sourceType === "video" ? post.mediaUrls[0] ?? null : null;
  const thumbnailUrl = sourceType === "video" ? post.mediaUrls[1] ?? null : null;
  const shortcodeMatch = post.canonicalUrl.match(/\/post\/([^/?#]+)/i);
  return {
    canonicalUrl: post.canonicalUrl,
    shortcode: shortcodeMatch?.[1] ?? createHash4("sha1").update(post.canonicalUrl).digest("hex").slice(0, 12),
    author: post.authorHandle,
    title: titleFromText(post.text, `@${post.authorHandle}`),
    text: post.text,
    publishedAt: post.publishedAt,
    capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
    sourceType,
    imageUrls,
    videoUrl,
    externalUrl: null,
    quotedPostUrl: null,
    repliedToUrl: null,
    thumbnailUrl,
    authorReplies: [],
    extractorVersion: "threads-api-v1",
    contentHash: createHash4("sha1").update(`${post.canonicalUrl}
${post.text}
${post.mediaUrls.join("\n")}`).digest("hex")
  };
}
function archiveLabel(sourceKind, label) {
  if (sourceKind === "watchlist") {
    return `watchlist:${label}`;
  }
  if (sourceKind === "search") {
    return `search:${label}`;
  }
  return `insight:${label}`;
}
function upsertArchiveFromPost(data, user, sourceKind, sourceLabel, item) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = data.botArchives.find(
    (candidate) => candidate.userId === user.id && candidate.targetUrl === item.canonicalUrl
  );
  const rawPayloadJson = JSON.stringify({
    sourceKind,
    sourceLabel,
    ...item.metadata,
    extractedPost: buildExtractedPost(item)
  });
  if (existing) {
    existing.noteText = archiveLabel(sourceKind, sourceLabel);
    existing.targetUrl = item.canonicalUrl;
    existing.targetAuthorHandle = item.authorHandle;
    existing.targetAuthorDisplayName = item.authorDisplayName;
    existing.targetText = item.text;
    existing.targetPublishedAt = item.publishedAt;
    existing.mediaUrls = [...item.mediaUrls];
    existing.rawPayloadJson = rawPayloadJson;
    existing.updatedAt = now;
    upsertBotArchive(data, existing);
    return existing;
  }
  const archive = {
    id: crypto.randomUUID(),
    userId: user.id,
    mentionId: null,
    mentionUrl: item.canonicalUrl,
    mentionAuthorHandle: item.authorHandle,
    mentionAuthorDisplayName: sourceLabel,
    noteText: archiveLabel(sourceKind, sourceLabel),
    targetUrl: item.canonicalUrl,
    targetAuthorHandle: item.authorHandle,
    targetAuthorDisplayName: item.authorDisplayName,
    targetText: item.text,
    targetPublishedAt: item.publishedAt,
    mediaUrls: [...item.mediaUrls],
    markdownContent: item.text,
    rawPayloadJson,
    archivedAt: now,
    updatedAt: now,
    status: "saved"
  };
  upsertBotArchive(data, archive);
  return archive;
}
function ensureWatchlistBelongsToUser(data, userId, watchlistId) {
  const watchlist = data.watchlists.find((candidate) => candidate.id === watchlistId && candidate.userId === userId);
  if (!watchlist) {
    throw new Error("The requested watchlist could not be found.");
  }
  return watchlist;
}
function ensureSearchMonitorBelongsToUser(data, userId, monitorId) {
  const monitor = data.searchMonitors.find((candidate) => candidate.id === monitorId && candidate.userId === userId);
  if (!monitor) {
    throw new Error("The requested search monitor could not be found.");
  }
  return monitor;
}
function ensureSearchResultBelongsToUser(data, userId, resultId) {
  const result = data.searchResults.find((candidate) => candidate.id === resultId && candidate.userId === userId);
  if (!result) {
    throw new Error("The requested search result could not be found.");
  }
  return result;
}
function buildWatchlistView(data, watchlist) {
  const results = getLatestWatchlistResults(data, watchlist.userId, watchlist.id);
  return {
    id: watchlist.id,
    targetHandle: watchlist.targetHandle,
    targetDisplayName: watchlist.targetDisplayName,
    targetProfilePictureUrl: watchlist.targetProfilePictureUrl,
    includeText: watchlist.includeText,
    excludeText: watchlist.excludeText,
    mediaTypes: [...watchlist.mediaTypes],
    autoArchive: watchlist.autoArchive,
    digestCadence: watchlist.digestCadence,
    lastSyncedAt: watchlist.lastSyncedAt,
    lastError: watchlist.lastError,
    status: watchlist.status,
    resultCount: results.length,
    results: results.slice(0, 12).map(toTrackedPostView)
  };
}
function buildSearchMonitorView(data, monitor) {
  const results = getLatestSearchResults(data, monitor.userId, monitor.id);
  return {
    id: monitor.id,
    query: monitor.query,
    authorHandle: monitor.authorHandle,
    excludeHandles: [...monitor.excludeHandles],
    autoArchive: monitor.autoArchive,
    searchType: monitor.searchType,
    lastRunAt: monitor.lastRunAt,
    lastError: monitor.lastError,
    status: monitor.status,
    resultCount: results.length,
    results: results.slice(0, 16).map(toSearchResultView)
  };
}
function readScrapbookPlusState(data, rawSession, userId = null) {
  const user = userId ? data.botUsers.find((candidate) => candidate.id === userId && candidate.status === "active") ?? null : getBotSessionUserRecord(data, rawSession);
  const scopes = createScopeState(user);
  if (!user) {
    return {
      authenticated: false,
      scopes,
      watchlists: [],
      searches: [],
      insights: {
        ready: false,
        refreshedAt: null,
        overview: {
          followers: metricValue(null, null),
          profileViews: metricValue(null, null),
          views: metricValue(null, null),
          likes: metricValue(null, null),
          replies: metricValue(null, null),
          reposts: metricValue(null, null),
          quotes: metricValue(null, null)
        },
        posts: []
      }
    };
  }
  void rawSession;
  const watchlists = data.watchlists.filter((candidate) => candidate.userId === user.id).sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)).map((watchlist) => buildWatchlistView(data, watchlist));
  const searches = data.searchMonitors.filter((candidate) => candidate.userId === user.id).sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)).map((monitor) => buildSearchMonitorView(data, monitor));
  const { latestProfile, previousProfile, postSnapshotGroups } = getInsightMetricSnapshotMap(data, user.id);
  const insightPosts = data.trackedPosts.filter((candidate) => candidate.userId === user.id && candidate.origin === "insight").sort((left, right) => Date.parse(right.discoveredAt) - Date.parse(left.discoveredAt)).slice(0, 8).map((post) => {
    const snapshots = postSnapshotGroups.get(post.externalPostId) ?? [];
    const latest = snapshots[0] ?? null;
    const previous = snapshots[1] ?? null;
    return {
      externalPostId: post.externalPostId,
      canonicalUrl: post.canonicalUrl,
      title: titleFromText(post.text, `@${post.authorHandle}`),
      text: post.text,
      publishedAt: post.publishedAt,
      metrics: {
        views: metricValue(latest?.views ?? null, previous?.views ?? null),
        likes: metricValue(latest?.likes ?? null, previous?.likes ?? null),
        replies: metricValue(latest?.replies ?? null, previous?.replies ?? null),
        reposts: metricValue(latest?.reposts ?? null, previous?.reposts ?? null),
        quotes: metricValue(latest?.quotes ?? null, previous?.quotes ?? null)
      },
      archived: Boolean(post.archiveId),
      archiveId: post.archiveId,
      capturedAt: latest?.capturedAt ?? null
    };
  });
  return {
    authenticated: true,
    scopes,
    watchlists,
    searches,
    insights: {
      ready: Boolean(latestProfile),
      refreshedAt: latestProfile?.capturedAt ?? null,
      overview: {
        followers: metricValue(latestProfile?.followers ?? null, previousProfile?.followers ?? null),
        profileViews: metricValue(latestProfile?.profileViews ?? null, previousProfile?.profileViews ?? null),
        views: metricValue(latestProfile?.views ?? null, previousProfile?.views ?? null),
        likes: metricValue(latestProfile?.likes ?? null, previousProfile?.likes ?? null),
        replies: metricValue(latestProfile?.replies ?? null, previousProfile?.replies ?? null),
        reposts: metricValue(latestProfile?.reposts ?? null, previousProfile?.reposts ?? null),
        quotes: metricValue(latestProfile?.quotes ?? null, previousProfile?.quotes ?? null)
      },
      posts: insightPosts
    }
  };
}
async function resolveStateForCurrentUser(data, rawSession) {
  return readScrapbookPlusState(data, rawSession);
}
async function createWatchlist(data, rawSession, input) {
  const { user } = await requireAdvancedContext(data, rawSession);
  const targetHandle = normalizeHandle(input.targetHandle);
  if (!targetHandle) {
    throw new Error("Enter a Threads handle to watch.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = data.watchlists.find(
    (candidate) => candidate.userId === user.id && candidate.targetHandle === targetHandle
  );
  const watchlist = existing ?? {
    id: crypto.randomUUID(),
    userId: user.id,
    targetHandle,
    targetThreadsUserId: null,
    targetDisplayName: null,
    targetProfilePictureUrl: null,
    includeText: "",
    excludeText: "",
    mediaTypes: [],
    autoArchive: false,
    digestCadence: "off",
    lastCursor: null,
    lastSyncedAt: null,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    status: "active"
  };
  watchlist.includeText = safeText3(input.includeText);
  watchlist.excludeText = safeText3(input.excludeText);
  watchlist.mediaTypes = [...new Set((input.mediaTypes ?? []).map((value) => safeText3(value).toUpperCase()).filter(Boolean))];
  watchlist.autoArchive = input.autoArchive === true;
  watchlist.digestCadence = input.digestCadence ?? "off";
  watchlist.updatedAt = now;
  watchlist.status = "active";
  upsertWatchlist(data, watchlist);
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function deleteWatchlist(data, rawSession, watchlistId) {
  const { user } = await requireAdvancedContext(data, rawSession);
  ensureWatchlistBelongsToUser(data, user.id, watchlistId);
  data.watchlists = data.watchlists.filter((candidate) => !(candidate.userId === user.id && candidate.id === watchlistId));
  data.trackedPosts = data.trackedPosts.filter(
    (candidate) => !(candidate.userId === user.id && candidate.origin === "watchlist" && candidate.sourceId === watchlistId)
  );
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function syncWatchlist(data, rawSession, watchlistId) {
  const { user, accessToken } = await requireAdvancedContext(data, rawSession);
  const watchlist = ensureWatchlistBelongsToUser(data, user.id, watchlistId);
  try {
    const profile = await lookupPublicProfile(accessToken, watchlist.targetHandle);
    const posts = await listPublicProfilePosts(accessToken, profile.id, 12, profile);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    watchlist.targetThreadsUserId = profile.id;
    watchlist.targetDisplayName = profile.name;
    watchlist.targetProfilePictureUrl = profile.threads_profile_picture_url;
    watchlist.lastError = null;
    watchlist.lastSyncedAt = now;
    watchlist.updatedAt = now;
    upsertWatchlist(data, watchlist);
    for (const post of posts.filter((candidate) => matchesWatchlist(candidate, watchlist))) {
      const existing = findExistingWatchlistPost(data, user.id, watchlist.id, post.id);
      const mediaUrls = collectPostMediaUrls(post);
      const tracked = existing ?? {
        id: crypto.randomUUID(),
        userId: user.id,
        origin: "watchlist",
        sourceId: watchlist.id,
        externalPostId: post.id,
        canonicalUrl: post.permalink,
        authorHandle: normalizeHandle(post.username),
        authorDisplayName: profile.name,
        text: post.text,
        publishedAt: post.timestamp,
        mediaType: normalizeMediaType(post),
        mediaUrls,
        matchedTerms: buildMatchedTerms(watchlist.includeText, post.text),
        relevanceScore: watchlist.includeText ? buildRelevanceScore(watchlist.includeText, post.text) : null,
        archiveId: null,
        archivedAt: null,
        discoveredAt: now,
        updatedAt: now,
        rawPayloadJson: JSON.stringify(post.raw)
      };
      tracked.canonicalUrl = post.permalink;
      tracked.authorHandle = normalizeHandle(post.username);
      tracked.authorDisplayName = profile.name;
      tracked.text = post.text;
      tracked.publishedAt = post.timestamp;
      tracked.mediaType = normalizeMediaType(post);
      tracked.mediaUrls = mediaUrls;
      tracked.matchedTerms = buildMatchedTerms(watchlist.includeText, post.text);
      tracked.relevanceScore = watchlist.includeText ? buildRelevanceScore(watchlist.includeText, post.text) : null;
      tracked.updatedAt = now;
      tracked.rawPayloadJson = JSON.stringify(post.raw);
      if (watchlist.autoArchive) {
        const archive = upsertArchiveFromPost(data, user, "watchlist", `@${watchlist.targetHandle}`, {
          canonicalUrl: tracked.canonicalUrl,
          authorHandle: tracked.authorHandle,
          authorDisplayName: tracked.authorDisplayName,
          text: tracked.text,
          publishedAt: tracked.publishedAt,
          mediaType: tracked.mediaType,
          mediaUrls: tracked.mediaUrls,
          metadata: {
            watchlistId: watchlist.id
          }
        });
        tracked.archiveId = archive.id;
        tracked.archivedAt = archive.archivedAt;
      }
      upsertTrackedPost(data, tracked);
    }
  } catch (error) {
    watchlist.lastError = toOperationalStatusError(error, "Watchlist sync failed.");
    watchlist.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    upsertWatchlist(data, watchlist);
    throw error;
  }
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function createSearchMonitor(data, rawSession, input) {
  const { user } = await requireAdvancedContext(data, rawSession);
  const query = safeText3(input.query);
  if (!query) {
    throw new Error("Enter a keyword query to monitor.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const monitor = {
    id: crypto.randomUUID(),
    userId: user.id,
    query,
    authorHandle: normalizeHandle(input.authorHandle) || null,
    excludeHandles: [...new Set((input.excludeHandles ?? []).map((value) => normalizeHandle(value)).filter(Boolean))],
    autoArchive: input.autoArchive === true,
    searchType: input.searchType === "recent" ? "recent" : "top",
    lastCursor: null,
    lastRunAt: null,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    status: "active"
  };
  upsertSearchMonitor(data, monitor);
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function deleteSearchMonitor(data, rawSession, monitorId) {
  const { user } = await requireAdvancedContext(data, rawSession);
  ensureSearchMonitorBelongsToUser(data, user.id, monitorId);
  data.searchMonitors = data.searchMonitors.filter((candidate) => !(candidate.userId === user.id && candidate.id === monitorId));
  data.searchResults = data.searchResults.filter((candidate) => !(candidate.userId === user.id && candidate.monitorId === monitorId));
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function runSearchMonitor(data, rawSession, monitorId) {
  const { user, accessToken } = await requireAdvancedContext(data, rawSession);
  const monitor = ensureSearchMonitorBelongsToUser(data, user.id, monitorId);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const posts = await searchKeywordPosts(
      accessToken,
      monitor.query,
      12,
      monitor.searchType === "recent" ? "RECENT" : "TOP"
    );
    for (const post of posts) {
      const authorHandle = normalizeHandle(post.username);
      if (monitor.authorHandle && authorHandle !== monitor.authorHandle) {
        continue;
      }
      if (monitor.excludeHandles.includes(authorHandle)) {
        continue;
      }
      const existing = data.searchResults.find(
        (candidate) => candidate.userId === user.id && candidate.monitorId === monitor.id && candidate.externalPostId === post.id
      );
      const mediaUrls = collectPostMediaUrls(post);
      const result = existing ?? {
        id: crypto.randomUUID(),
        userId: user.id,
        monitorId: monitor.id,
        externalPostId: post.id,
        canonicalUrl: post.permalink,
        authorHandle,
        authorDisplayName: null,
        text: post.text,
        publishedAt: post.timestamp,
        mediaType: normalizeMediaType(post),
        mediaUrls,
        matchedTerms: buildMatchedTerms(monitor.query, post.text),
        relevanceScore: buildRelevanceScore(monitor.query, post.text),
        archiveId: null,
        archivedAt: null,
        dismissedAt: null,
        discoveredAt: now,
        updatedAt: now,
        rawPayloadJson: JSON.stringify(post.raw),
        status: "new"
      };
      result.canonicalUrl = post.permalink;
      result.authorHandle = authorHandle;
      result.authorDisplayName = null;
      result.text = post.text;
      result.publishedAt = post.timestamp;
      result.mediaType = normalizeMediaType(post);
      result.mediaUrls = mediaUrls;
      result.matchedTerms = buildMatchedTerms(monitor.query, post.text);
      result.relevanceScore = buildRelevanceScore(monitor.query, post.text);
      result.updatedAt = now;
      result.rawPayloadJson = JSON.stringify(post.raw);
      if (monitor.autoArchive && !result.archiveId) {
        const archive = upsertArchiveFromPost(data, user, "search", monitor.query, {
          canonicalUrl: result.canonicalUrl,
          authorHandle: result.authorHandle,
          authorDisplayName: result.authorDisplayName,
          text: result.text,
          publishedAt: result.publishedAt,
          mediaType: result.mediaType,
          mediaUrls: result.mediaUrls,
          metadata: {
            monitorId: monitor.id,
            matchedTerms: result.matchedTerms
          }
        });
        result.archiveId = archive.id;
        result.archivedAt = archive.archivedAt;
        result.status = "archived";
      }
      upsertSearchResult(data, result);
    }
    monitor.lastError = null;
    monitor.lastRunAt = now;
    monitor.updatedAt = now;
    upsertSearchMonitor(data, monitor);
  } catch (error) {
    monitor.lastError = toOperationalStatusError(error, "Keyword search failed.");
    monitor.lastRunAt = now;
    monitor.updatedAt = now;
    upsertSearchMonitor(data, monitor);
    throw error;
  }
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function archiveSearchResult(data, rawSession, resultId) {
  const { user } = await requireAdvancedContext(data, rawSession);
  const result = ensureSearchResultBelongsToUser(data, user.id, resultId);
  const archive = upsertArchiveFromPost(data, user, "search", result.matchedTerms.join(", ") || result.authorHandle, {
    canonicalUrl: result.canonicalUrl,
    authorHandle: result.authorHandle,
    authorDisplayName: result.authorDisplayName,
    text: result.text,
    publishedAt: result.publishedAt,
    mediaType: result.mediaType,
    mediaUrls: result.mediaUrls,
    metadata: {
      monitorId: result.monitorId,
      resultId: result.id
    }
  });
  result.archiveId = archive.id;
  result.archivedAt = archive.archivedAt;
  result.status = "archived";
  result.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  upsertSearchResult(data, result);
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function dismissSearchResult(data, rawSession, resultId) {
  const { user } = await requireAdvancedContext(data, rawSession);
  const result = ensureSearchResultBelongsToUser(data, user.id, resultId);
  result.dismissedAt = (/* @__PURE__ */ new Date()).toISOString();
  result.status = "dismissed";
  result.updatedAt = result.dismissedAt;
  upsertSearchResult(data, result);
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function refreshInsights(data, rawSession) {
  const { user, accessToken } = await requireAdvancedContext(data, rawSession);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const profileInsights = await getProfileInsights(accessToken);
  upsertInsightsSnapshot(data, {
    id: crypto.randomUUID(),
    userId: user.id,
    kind: "profile",
    externalPostId: null,
    canonicalUrl: null,
    title: null,
    likes: profileInsights.likes,
    replies: profileInsights.replies,
    reposts: profileInsights.reposts,
    quotes: profileInsights.quotes,
    views: profileInsights.views,
    followers: profileInsights.followers,
    profileViews: profileInsights.profileViews,
    capturedAt: now,
    rawPayloadJson: JSON.stringify(profileInsights.raw)
  });
  const posts = await listOwnPosts(accessToken, 6);
  for (const post of posts) {
    const existing = findExistingInsightPost(data, user.id, post.id);
    const mediaUrls = collectPostMediaUrls(post);
    const tracked = existing ?? {
      id: crypto.randomUUID(),
      userId: user.id,
      origin: "insight",
      sourceId: null,
      externalPostId: post.id,
      canonicalUrl: post.permalink,
      authorHandle: normalizeHandle(post.username) || user.threadsHandle,
      authorDisplayName: user.displayName,
      text: post.text,
      publishedAt: post.timestamp,
      mediaType: normalizeMediaType(post),
      mediaUrls,
      matchedTerms: [],
      relevanceScore: null,
      archiveId: null,
      archivedAt: null,
      discoveredAt: now,
      updatedAt: now,
      rawPayloadJson: JSON.stringify(post.raw)
    };
    tracked.canonicalUrl = post.permalink;
    tracked.authorHandle = normalizeHandle(post.username) || user.threadsHandle;
    tracked.authorDisplayName = user.displayName;
    tracked.text = post.text;
    tracked.publishedAt = post.timestamp;
    tracked.mediaType = normalizeMediaType(post);
    tracked.mediaUrls = mediaUrls;
    tracked.updatedAt = now;
    tracked.rawPayloadJson = JSON.stringify(post.raw);
    upsertTrackedPost(data, tracked);
    const insights = await getPostInsights(accessToken, post.id);
    upsertInsightsSnapshot(data, {
      id: crypto.randomUUID(),
      userId: user.id,
      kind: "post",
      externalPostId: post.id,
      canonicalUrl: post.permalink,
      title: titleFromText(post.text, `@${tracked.authorHandle}`),
      likes: insights.likes,
      replies: insights.replies,
      reposts: insights.reposts,
      quotes: insights.quotes,
      views: insights.views,
      followers: null,
      profileViews: null,
      capturedAt: now,
      rawPayloadJson: JSON.stringify(insights.raw)
    });
  }
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function archiveTrackedInsightPost(data, rawSession, externalPostId) {
  const { user } = await requireAdvancedContext(data, rawSession);
  const tracked = findExistingInsightPost(data, user.id, externalPostId);
  if (!tracked) {
    throw new Error("The requested insight post could not be found.");
  }
  const archive = upsertArchiveFromPost(data, user, "insight", "own-post", {
    canonicalUrl: tracked.canonicalUrl,
    authorHandle: tracked.authorHandle,
    authorDisplayName: tracked.authorDisplayName,
    text: tracked.text,
    publishedAt: tracked.publishedAt,
    mediaType: tracked.mediaType,
    mediaUrls: tracked.mediaUrls,
    metadata: {
      externalPostId
    }
  });
  tracked.archiveId = archive.id;
  tracked.archivedAt = archive.archivedAt;
  tracked.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  upsertTrackedPost(data, tracked);
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function archiveTrackedPost(data, rawSession, trackedPostId) {
  const { user } = await requireAdvancedContext(data, rawSession);
  const tracked = ensureTrackedPostBelongsToUser(data, user.id, trackedPostId);
  const sourceLabel = tracked.origin === "watchlist" ? data.watchlists.find((candidate) => candidate.id === tracked.sourceId)?.targetHandle ?? tracked.authorHandle : "own-post";
  const archive = upsertArchiveFromPost(data, user, tracked.origin, sourceLabel, {
    canonicalUrl: tracked.canonicalUrl,
    authorHandle: tracked.authorHandle,
    authorDisplayName: tracked.authorDisplayName,
    text: tracked.text,
    publishedAt: tracked.publishedAt,
    mediaType: tracked.mediaType,
    mediaUrls: tracked.mediaUrls,
    metadata: {
      trackedPostId: tracked.id,
      origin: tracked.origin
    }
  });
  tracked.archiveId = archive.id;
  tracked.archivedAt = archive.archivedAt;
  tracked.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  upsertTrackedPost(data, tracked);
  return readScrapbookPlusState(data, rawSession, user.id);
}
async function readAuthenticatedScrapbookPlusState(data, rawSession) {
  return resolveStateForCurrentUser(data, rawSession);
}

// src/server/bot-mention-service.ts
import { JSDOM } from "jsdom";

// ../shared/src/extractor.ts
function getMeta(document, selector) {
  return document.querySelector(selector)?.content?.trim() ?? null;
}
function getCanonicalUrl(document, pageUrl) {
  const pageShortcode = extractShortcode(pageUrl);
  if (pageShortcode && isSupportedPermalink(pageUrl)) {
    try {
      return normalizeThreadsUrl(pageUrl);
    } catch {
    }
  }
  const candidates = [
    document.querySelector('link[rel="canonical"]')?.href ?? null,
    getMeta(document, 'meta[property="og:url"]'),
    pageUrl
  ];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      const normalized = normalizeThreadsUrl(candidate);
      if (!isSupportedPermalink(normalized)) {
        continue;
      }
      if (pageShortcode && extractShortcode(normalized) !== pageShortcode) {
        continue;
      }
      return normalized;
    } catch {
      continue;
    }
  }
  return normalizeThreadsUrl(pageUrl);
}
function getStructuredText(document, shortcode) {
  const candidates = [];
  for (const script of document.scripts) {
    const content = script.textContent;
    if (!content || !content.includes(shortcode) || !content.includes('"text"')) {
      continue;
    }
    const shortcodeIndexes = Array.from(content.matchAll(new RegExp(shortcode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).map(
      (match) => match.index ?? 0
    );
    const matches = content.matchAll(/"text":"((?:[^"\\]|\\.)+)"/g);
    for (const match of matches) {
      const raw = match[1];
      const decoded = decodeEscapedJsonString(raw);
      if (decoded.length > 12) {
        const matchIndex = match.index ?? 0;
        const distance = shortcodeIndexes.length > 0 ? Math.min(...shortcodeIndexes.map((index) => Math.abs(index - matchIndex))) : Number.MAX_SAFE_INTEGER;
        candidates.push({
          text: decoded,
          distance,
          length: decoded.length
        });
      }
    }
  }
  return candidates.sort((a, b) => {
    if (Math.abs(a.length - b.length) > 20) {
      return b.length - a.length;
    }
    return a.distance - b.distance;
  })[0]?.text ?? null;
}
function countActionButtons(root) {
  return Array.from(root.querySelectorAll("button")).filter(
    (button) => /(좋아요|댓글|리포스트|공유하기)/u.test((button.getAttribute("aria-label") ?? button.textContent ?? "").trim())
  ).length;
}
function countPermalinkLinks(root) {
  return dedupeStrings(
    Array.from(root.querySelectorAll('a[href*="/post/"]')).map((anchor) => {
      try {
        return normalizeThreadsUrl(anchor.href);
      } catch {
        return null;
      }
    })
  ).length;
}
function scorePostBlockCandidate(root) {
  const textLength = Math.min((root.innerText || root.textContent || "").trim().length, 320);
  const timeCount = root.querySelectorAll("time").length;
  const permalinkCount = countPermalinkLinks(root);
  const buttonCount = countActionButtons(root);
  const mediaCount = root.querySelectorAll("img, video").length;
  const hasAuthorBadge = (root.innerText || root.textContent || "").includes("\uC791\uC131\uC790");
  let score = textLength;
  if (timeCount === 1) {
    score += 120;
  } else if (timeCount > 1) {
    score -= Math.min((timeCount - 1) * 80, 240);
  }
  if (permalinkCount === 1) {
    score += 120;
  } else if (permalinkCount > 1) {
    score -= Math.min((permalinkCount - 1) * 80, 240);
  }
  if (buttonCount >= 2) {
    score += 60;
  } else if (buttonCount === 1) {
    score += 20;
  }
  if (mediaCount > 0) {
    score += 10;
  }
  if (hasAuthorBadge) {
    score += 20;
  }
  return score;
}
function findPostBlockFromAnchor(anchor) {
  let current = anchor;
  let bestCandidate = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  while (current && current !== anchor.ownerDocument.body) {
    const textLength = (current.innerText || current.textContent || "").trim().length;
    const permalinkCount = countPermalinkLinks(current);
    const timeCount = current.querySelectorAll("time").length;
    if (timeCount >= 1 && textLength > 12 && permalinkCount >= 1) {
      const score = scorePostBlockCandidate(current);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = current;
      }
    }
    current = current.parentElement;
  }
  return bestCandidate;
}
function findPostRoot(document, canonicalUrl, shortcode) {
  if (!shortcode) {
    return null;
  }
  const anchors = Array.from(document.querySelectorAll(`a[href*="/post/${shortcode}"]`)).sort((left, right) => {
    const leftHasTime = Number(Boolean(left.querySelector("time")));
    const rightHasTime = Number(Boolean(right.querySelector("time")));
    return rightHasTime - leftHasTime;
  });
  const normalizedTarget = normalizeThreadsUrl(canonicalUrl);
  for (const anchor of anchors) {
    const href = anchor.href ? normalizeThreadsUrl(anchor.href) : "";
    if (href && href !== normalizedTarget) {
      continue;
    }
    const postBlock = findPostBlockFromAnchor(anchor);
    if (postBlock) {
      return postBlock;
    }
  }
  return null;
}
function getVisibleImages(root, author) {
  if (!root) {
    return [];
  }
  const urls = Array.from(root.querySelectorAll("img")).filter((img) => {
    const src = img.currentSrc || img.src;
    if (!src || !src.startsWith("http")) {
      return false;
    }
    const alt = img.alt.trim();
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (alt.includes("\uD504\uB85C\uD544 \uC0AC\uC9C4") || alt.includes(author)) {
      return false;
    }
    return width >= 140 || height >= 140;
  }).map((img) => img.currentSrc || img.src);
  if (urls.length > 0) {
    return dedupeStrings(urls);
  }
  return [];
}
function getVideoUrl(root) {
  if (!root) {
    return null;
  }
  const videos = Array.from(root.querySelectorAll("video"));
  for (const video of videos) {
    const candidates = [
      video.currentSrc,
      video.src,
      ...Array.from(video.querySelectorAll("source")).map((source) => source.src)
    ];
    for (const candidate of candidates) {
      const value = candidate?.trim();
      if (value && /^https?:\/\//i.test(value)) {
        return value;
      }
    }
  }
  return null;
}
function getVideoPosterUrl(root) {
  if (!root) {
    return null;
  }
  const poster = root.querySelector("video")?.getAttribute("poster")?.trim();
  return poster && /^https?:\/\//i.test(poster) ? poster : null;
}
function getExternalUrl(root) {
  if (!root) {
    return null;
  }
  const anchors = Array.from(root.querySelectorAll("a[href]"));
  const external = anchors.find((anchor) => {
    try {
      return Boolean(unwrapExternalUrl(anchor.href));
    } catch {
      return false;
    }
  });
  return external ? unwrapExternalUrl(external.href) : null;
}
function getRelatedPostUrls(root, canonicalUrl) {
  if (!root) {
    return { quotedPostUrl: null, repliedToUrl: null };
  }
  const links = dedupeStrings(
    Array.from(root.querySelectorAll('a[href*="/post/"]')).map((anchor) => {
      try {
        const normalized = normalizeThreadsUrl(anchor.href);
        return normalized === canonicalUrl ? null : normalized;
      } catch {
        return null;
      }
    })
  );
  return {
    quotedPostUrl: links[0] ?? null,
    repliedToUrl: links[1] ?? null
  };
}
function getPublishedAt(root, document, shortcode) {
  const rootTime = root?.querySelector("time")?.getAttribute("datetime");
  if (rootTime) {
    return rootTime;
  }
  if (!shortcode) {
    return null;
  }
  const permalinkTime = document.querySelector(`a[href*="/post/${shortcode}"] time`);
  return permalinkTime?.getAttribute("datetime") ?? null;
}
function detectSourceType(imageUrls, scope, videoUrl, videoPosterUrl) {
  if (scope?.querySelector("video") && (videoUrl || videoPosterUrl)) {
    return "video";
  }
  if (imageUrls.length > 0) {
    return "image";
  }
  return "text";
}
function trimKeyword(keyword, maxLength = 38) {
  if (keyword.length <= maxLength) {
    return keyword;
  }
  const sliced = keyword.slice(0, maxLength);
  const boundary = Math.max(sliced.lastIndexOf(" "), sliced.lastIndexOf(","), sliced.lastIndexOf("\xB7"));
  return (boundary >= 16 ? sliced.slice(0, boundary) : sliced).trim();
}
function getPostTitle(_document, author, text, _externalUrl) {
  const firstLine = text.replace(/\s+/g, " ").trim().split(/[.!?\n]/)[0]?.trim();
  if (firstLine && firstLine.length > 2) {
    return trimKeyword(firstLine);
  }
  return author;
}
function extractDomText(root, author, config) {
  if (!root) {
    return "";
  }
  const nodeFilter = root.ownerDocument.defaultView?.NodeFilter;
  const walker = root.ownerDocument.createTreeWalker(root, nodeFilter?.SHOW_TEXT ?? 4);
  const lines = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode.textContent?.trim();
    const parent = currentNode.parentElement;
    if (text && parent && !parent.closest("button, time, a, script, style, svg, video, picture, figure, img")) {
      lines.push(text);
    }
    currentNode = walker.nextNode();
  }
  return cleanTextLines(lines.join("\n\n"), author, config);
}
function isNodeAfter(referenceNode, targetNode) {
  const nodeCtor = referenceNode.ownerDocument?.defaultView?.Node;
  if (!nodeCtor) {
    return false;
  }
  return Boolean(referenceNode.compareDocumentPosition(targetNode) & nodeCtor.DOCUMENT_POSITION_FOLLOWING);
}
function extractAuthorReplies(document, root, author, canonicalUrl, config) {
  if (!root) {
    return [];
  }
  const anchors = Array.from(document.querySelectorAll('a[href*="/post/"]'));
  const seenBlocks = /* @__PURE__ */ new Set();
  const orderedBlocks = [];
  for (const anchor of anchors) {
    if (!isNodeAfter(root, anchor)) {
      continue;
    }
    let normalizedUrl;
    try {
      normalizedUrl = normalizeThreadsUrl(anchor.href);
    } catch {
      continue;
    }
    if (normalizedUrl === canonicalUrl) {
      continue;
    }
    const block = findPostBlockFromAnchor(anchor);
    if (!block || root.contains(block) || seenBlocks.has(block)) {
      continue;
    }
    seenBlocks.add(block);
    orderedBlocks.push({
      block,
      url: normalizedUrl,
      blockAuthor: extractAuthorFromUrl(normalizedUrl)
    });
  }
  const replies = [];
  let startedChain = false;
  for (const candidate of orderedBlocks) {
    if (candidate.blockAuthor !== author) {
      if (startedChain) {
        break;
      }
      continue;
    }
    startedChain = true;
    const text = extractDomText(candidate.block, author, config);
    if (!text || text.startsWith("\uC774\uC804 \uAE00")) {
      continue;
    }
    const imageUrls = getVisibleImages(candidate.block, author);
    const videoUrl = getVideoUrl(candidate.block);
    const videoPosterUrl = getVideoPosterUrl(candidate.block);
    const sourceType = detectSourceType(imageUrls, candidate.block, videoUrl, videoPosterUrl);
    replies.push({
      author: candidate.blockAuthor,
      canonicalUrl: candidate.url,
      shortcode: extractShortcode(candidate.url),
      text,
      publishedAt: getPublishedAt(candidate.block, document, extractShortcode(candidate.url)),
      sourceType,
      imageUrls,
      videoUrl,
      externalUrl: getExternalUrl(candidate.block),
      thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? imageUrls[0] ?? null : imageUrls[0] ?? null
    });
  }
  return replies;
}
async function extractPostFromDocument(document, pageUrl, config = BUNDLED_EXTRACTOR_CONFIG) {
  if (!isSupportedPermalink(pageUrl)) {
    throw new Error((await t()).errNotPermalink);
  }
  const canonicalUrl = getCanonicalUrl(document, pageUrl);
  const shortcode = extractShortcode(canonicalUrl);
  const author = extractAuthorFromUrl(canonicalUrl);
  const root = findPostRoot(document, canonicalUrl, shortcode);
  const structuredText = getStructuredText(document, shortcode);
  const ogDescription = getMeta(document, 'meta[property="og:description"]');
  const domText = extractDomText(root, author, config);
  const rawText = domText || structuredText || ogDescription || "";
  const text = cleanTextLines(rawText, author, config) || ogDescription || "";
  if (!text) {
    throw new Error((await t()).errPostContentNotFound);
  }
  const ogThumbnailUrl = getMeta(document, 'meta[property="og:image"]');
  const imageUrls = getVisibleImages(root, author);
  const videoUrl = getVideoUrl(root);
  const videoPosterUrl = getVideoPosterUrl(root);
  const externalUrl = getExternalUrl(root);
  const related = getRelatedPostUrls(root, canonicalUrl);
  const title = getPostTitle(document, author, text, externalUrl);
  const capturedAt = (/* @__PURE__ */ new Date()).toISOString();
  const sourceType = detectSourceType(imageUrls, root, videoUrl, videoPosterUrl);
  const authorReplies = extractAuthorReplies(document, root, author, canonicalUrl, config);
  const partial = {
    canonicalUrl,
    shortcode,
    author,
    title,
    text,
    publishedAt: getPublishedAt(root, document, shortcode),
    capturedAt,
    sourceType,
    imageUrls,
    videoUrl,
    externalUrl,
    quotedPostUrl: related.quotedPostUrl,
    repliedToUrl: related.repliedToUrl,
    thumbnailUrl: sourceType === "video" ? videoPosterUrl ?? ogThumbnailUrl ?? imageUrls[0] ?? null : ogThumbnailUrl,
    authorReplies,
    extractorVersion: config.version
  };
  return {
    ...partial,
    contentHash: await hashPost(partial)
  };
}

// src/server/bot-mention-service.ts
var THREADS_GRAPH_BASE_URL3 = "https://graph.threads.net";
var DEFAULT_POLL_INTERVAL_MS = 6e4;
var DEFAULT_FETCH_LIMIT = 25;
var DEFAULT_MAX_PAGES = 5;
var MAX_FETCH_LIMIT = 100;
var THREAD_FIELDS = [
  "id",
  "text",
  "timestamp",
  "permalink",
  "shortcode",
  "username",
  "media_type",
  "media_url",
  "thumbnail_url"
];
var THREAD_RELATION_FIELDS = [
  "replied_to{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url}",
  "root_post{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url}",
  "quoted_post{id,text,timestamp,permalink,shortcode,username,media_type,media_url,thumbnail_url}"
];
var THREAD_DETAIL_FIELDS = [...THREAD_FIELDS, ...THREAD_RELATION_FIELDS];
function parsePositiveInt(raw, fallback, minimum = 1, maximum = Number.MAX_SAFE_INTEGER) {
  const text = `${raw ?? ""}`.trim();
  if (!text) {
    return fallback;
  }
  const parsed = Number.parseInt(text, 10);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    return fallback;
  }
  return parsed;
}
function normalizeHandle2(value) {
  return (value ?? "").trim().replace(/^@+/, "").toLowerCase();
}
function safeText4(value) {
  return (value ?? "").trim();
}
function toCollectorStatusError(error) {
  if (error instanceof Error) {
    if (/unauthorized|forbidden|expired|401|403/i.test(error.message)) {
      return "Collector access token is invalid or expired.";
    }
    if (/rate.?limit|429/i.test(error.message)) {
      return "Threads API rate limit reached. Try again later.";
    }
    if (/network|fetch|timeout|econn|socket/i.test(error.message)) {
      return "Collector could not reach Threads API.";
    }
  }
  return "Unexpected collector error.";
}
function summarizeExtractedPostPreviewMediaUrls2(post) {
  const urls = [...post.imageUrls];
  if (post.sourceType === "video") {
    if (post.thumbnailUrl) {
      urls.push(post.thumbnailUrl);
    } else if (post.videoUrl) {
      urls.push(post.videoUrl);
    }
  }
  return Array.from(new Set(urls.map((value) => safeText4(value)).filter(Boolean)));
}
function toRecord2(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value;
}
function readString2(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized ? normalized : null;
}
function readNestedString(node, ...paths) {
  if (!node) {
    return null;
  }
  for (const path4 of paths) {
    let current = node;
    for (const segment of path4) {
      if (!current || typeof current !== "object" || Array.isArray(current)) {
        current = null;
        break;
      }
      current = current[segment];
    }
    const value = readString2(current);
    if (value) {
      return value;
    }
  }
  return null;
}
function readNestedNode(node, ...paths) {
  if (!node) {
    return null;
  }
  for (const path4 of paths) {
    let current = node;
    for (const segment of path4) {
      if (!current || typeof current !== "object" || Array.isArray(current)) {
        current = null;
        break;
      }
      current = current[segment];
    }
    const record = toRecord2(current);
    if (record) {
      return record;
    }
  }
  return null;
}
async function extractTargetPostFromPermalink(permalinkUrl) {
  const normalizedUrl = safeText4(permalinkUrl);
  if (!normalizedUrl) {
    return null;
  }
  try {
    const response = await fetch(normalizedUrl, {
      cache: "no-store",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "ko,en;q=0.8",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Threads HTML fetch failed (${response.status}).`);
    }
    const html2 = await response.text();
    const dom = new JSDOM(html2, { url: response.url || normalizedUrl });
    return await extractPostFromDocument(
      dom.window.document,
      dom.window.location.href,
      BUNDLED_EXTRACTOR_CONFIG
    );
  } catch {
    return null;
  }
}
function buildThreadsApiBaseUrl2(config) {
  return `${THREADS_GRAPH_BASE_URL3}/${config.graphApiVersion.trim() ? `${config.graphApiVersion.trim()}/` : ""}`;
}
function readCollectorConfig() {
  const runtime = getRuntimeConfigSnapshot().collector;
  return {
    botHandle: getConfiguredBotHandle() || runtime.botHandle || "",
    accessTokenOverride: runtime.accessTokenOverride.trim(),
    graphApiVersion: runtime.graphApiVersion.trim(),
    intervalMs: parsePositiveInt(runtime.intervalMs, DEFAULT_POLL_INTERVAL_MS, 5e3),
    fetchLimit: parsePositiveInt(runtime.fetchLimit, DEFAULT_FETCH_LIMIT, 1, MAX_FETCH_LIMIT),
    maxPages: parsePositiveInt(runtime.maxPages, DEFAULT_MAX_PAGES, 1, 20)
  };
}
function createInitialStatus(config) {
  return {
    enabled: Boolean(config.botHandle) && config.intervalMs > 0,
    running: false,
    botHandle: config.botHandle,
    pollIntervalMs: config.intervalMs,
    fetchLimit: config.fetchLimit,
    maxPages: config.maxPages,
    lastStartedAt: null,
    lastCompletedAt: null,
    lastSucceededAt: null,
    lastError: null,
    lastSummary: null
  };
}
async function fetchThreadsJson(url, accessToken) {
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url, {
    headers: {
      accept: "application/json"
    }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const record = toRecord2(body);
    const message = readNestedString(record, ["error", "message"]) || readString2(record?.error_message) || `Threads API request failed (${response.status}).`;
    throw new Error(message);
  }
  return toRecord2(body) ?? {};
}
async function fetchMentionPage(config, accessToken, afterCursor) {
  const url = new URL("me/mentions", buildThreadsApiBaseUrl2(config));
  url.searchParams.set("fields", THREAD_FIELDS.join(","));
  url.searchParams.set("limit", String(config.fetchLimit));
  if (afterCursor) {
    url.searchParams.set("after", afterCursor);
  }
  const body = await fetchThreadsJson(url, accessToken);
  const items = Array.isArray(body.data) ? body.data.map(toRecord2).filter((value) => Boolean(value)) : [];
  const nextCursor = readNestedString(toRecord2(body.paging), ["cursors", "after"]);
  return { items, nextCursor };
}
async function fetchRepliesPage(config, accessToken, afterCursor) {
  const url = new URL("me/replies", buildThreadsApiBaseUrl2(config));
  url.searchParams.set("fields", [...THREAD_FIELDS, ...THREAD_RELATION_FIELDS].join(","));
  url.searchParams.set("limit", String(config.fetchLimit));
  if (afterCursor) {
    url.searchParams.set("after", afterCursor);
  }
  const body = await fetchThreadsJson(url, accessToken);
  const items = Array.isArray(body.data) ? body.data.map(toRecord2).filter((value) => Boolean(value)) : [];
  const nextCursor = readNestedString(toRecord2(body.paging), ["cursors", "after"]);
  return { items, nextCursor };
}
async function fetchThreadNode(config, accessToken, threadId, includeRelations) {
  const url = new URL(encodeURIComponent(threadId), buildThreadsApiBaseUrl2(config));
  url.searchParams.set("fields", (includeRelations ? THREAD_DETAIL_FIELDS : THREAD_FIELDS).join(","));
  try {
    return await fetchThreadsJson(url, accessToken);
  } catch (error) {
    if (!includeRelations) {
      throw error;
    }
    const fallbackUrl = new URL(encodeURIComponent(threadId), buildThreadsApiBaseUrl2(config));
    fallbackUrl.searchParams.set("fields", THREAD_FIELDS.join(","));
    return fetchThreadsJson(fallbackUrl, accessToken);
  }
}
function buildThreadPermalink(node) {
  const permalink = readNestedString(node, ["permalink"]);
  if (permalink) {
    return permalink;
  }
  const username = normalizeHandle2(readNestedString(node, ["username"], ["owner", "username"]));
  const shortcode = readNestedString(node, ["shortcode"]);
  if (!username || !shortcode) {
    return null;
  }
  return `https://www.threads.com/@${encodeURIComponent(username)}/post/${encodeURIComponent(shortcode)}`;
}
function extractThreadHandle(node) {
  return normalizeHandle2(readNestedString(node, ["username"], ["owner", "username"])) || null;
}
function extractThreadUserId(node) {
  return readNestedString(node, ["owner", "id"], ["user", "id"]);
}
function extractThreadDisplayName(node) {
  return readNestedString(node, ["name"], ["owner", "name"], ["owner", "username"]);
}
function extractThreadText(node) {
  return readNestedString(node, ["text"], ["caption"], ["content"]);
}
function extractThreadTimestamp(node) {
  return readNestedString(node, ["timestamp"]);
}
function extractMediaUrls(node) {
  const values = [
    readNestedString(node, ["media_url"]),
    readNestedString(node, ["thumbnail_url"])
  ];
  const unique = /* @__PURE__ */ new Set();
  for (const value of values) {
    if (value) {
      unique.add(value);
    }
  }
  return [...unique];
}
function extractRelatedThreadId(node) {
  if (!node) {
    return null;
  }
  const direct = [
    readNestedString(node, ["root_post_id"]),
    readNestedString(node, ["reply_to_id"])
  ].find(Boolean);
  if (direct) {
    return direct ?? null;
  }
  const relationCandidates = [
    node.root_post,
    node.replied_to,
    node.reply_to
  ];
  for (const candidate of relationCandidates) {
    const raw = readString2(candidate);
    if (raw) {
      return raw;
    }
    const record = toRecord2(candidate);
    const nestedId = readNestedString(record, ["id"]);
    if (nestedId) {
      return nestedId;
    }
  }
  return null;
}
function extractRelatedThreadNode(node) {
  return readNestedNode(node, ["root_post"]) ?? readNestedNode(node, ["replied_to"]) ?? readNestedNode(node, ["quoted_post"]) ?? readNestedNode(node, ["reply_to"]);
}
async function hydrateRelatedThreadNode(config, accessToken, node) {
  if (!node) {
    return null;
  }
  const hasPermalink = Boolean(buildThreadPermalink(node));
  const hasText = Boolean(safeText4(extractThreadText(node) || ""));
  if (hasPermalink || hasText) {
    return node;
  }
  const relationId = readNestedString(node, ["id"]);
  if (!relationId) {
    return node;
  }
  return await fetchThreadNode(config, accessToken, relationId, false) ?? node;
}
function isSameThread(left, rightId, rightPermalink) {
  if (!left) {
    return false;
  }
  const leftId = readNestedString(left, ["id"]);
  if (leftId && rightId && leftId === rightId) {
    return true;
  }
  const leftPermalink = buildThreadPermalink(left);
  return Boolean(leftPermalink && rightPermalink && leftPermalink === rightPermalink);
}
async function resolveTargetFromRepliesFeed(data, config, mentionId, mentionUrl, mentionAuthorUserId, mentionAuthorHandle) {
  const ownerAccessToken = (mentionAuthorUserId ? await getBotAccessTokenForThreadsUserId(data, mentionAuthorUserId) : null) ?? (mentionAuthorHandle ? await getBotAccessTokenForHandle(data, mentionAuthorHandle) : null);
  if (!ownerAccessToken) {
    return null;
  }
  let afterCursor = null;
  for (let page = 0; page < config.maxPages; page += 1) {
    let replyPage;
    try {
      replyPage = await fetchRepliesPage(config, ownerAccessToken, afterCursor);
    } catch {
      return null;
    }
    for (const reply of replyPage.items) {
      if (!isSameThread(reply, mentionId, mentionUrl)) {
        continue;
      }
      return extractRelatedThreadNode(reply);
    }
    afterCursor = replyPage.nextCursor;
    if (!afterCursor || replyPage.items.length === 0) {
      break;
    }
  }
  return null;
}
function buildFallbackTargetText(node) {
  const handle = extractThreadHandle(node);
  return handle ? `Threads post by @${handle} (no text returned by the API).` : "Threads post (no text returned by the API).";
}
async function buildIngestPayload(data, config, accessToken, mentionSummary) {
  const mentionId = readNestedString(mentionSummary, ["id"]);
  if (!mentionId) {
    return null;
  }
  const mentionDetail = await fetchThreadNode(config, accessToken, mentionId, true);
  const mentionUrl = buildThreadPermalink(mentionDetail) || buildThreadPermalink(mentionSummary);
  const mentionAuthorHandle = extractThreadHandle(mentionDetail) || extractThreadHandle(mentionSummary);
  const mentionAuthorUserId = extractThreadUserId(mentionDetail) || extractThreadUserId(mentionSummary);
  if (!mentionUrl || !mentionAuthorHandle) {
    return null;
  }
  const relatedThreadId = extractRelatedThreadId(mentionDetail);
  const relatedThreadNode = await hydrateRelatedThreadNode(
    config,
    accessToken,
    extractRelatedThreadNode(mentionDetail)
  );
  const replyResolvedTarget = relatedThreadNode ?? (relatedThreadId ? await fetchThreadNode(config, accessToken, relatedThreadId, false) : null) ?? await resolveTargetFromRepliesFeed(
    data,
    config,
    mentionId,
    mentionUrl,
    mentionAuthorUserId,
    mentionAuthorHandle
  );
  const targetNode = replyResolvedTarget ?? mentionDetail ?? mentionSummary;
  const unresolvedTargetUrl = buildThreadPermalink(targetNode) || mentionUrl;
  const mentionText = safeText4(extractThreadText(mentionDetail) || extractThreadText(mentionSummary) || "");
  const extractedTargetPost = await extractTargetPostFromPermalink(unresolvedTargetUrl);
  const targetUrl = safeText4(extractedTargetPost?.canonicalUrl) || unresolvedTargetUrl;
  const targetText = safeText4(extractedTargetPost?.text) || safeText4(extractThreadText(targetNode) || "") || buildFallbackTargetText(targetNode);
  const targetIsSeparate = targetUrl !== mentionUrl || targetText !== mentionText;
  return {
    mentionId,
    mentionUrl,
    mentionAuthorUserId,
    mentionAuthorHandle,
    mentionAuthorDisplayName: extractThreadDisplayName(mentionDetail) || extractThreadDisplayName(mentionSummary),
    noteText: targetIsSeparate ? mentionText || null : null,
    targetUrl,
    targetAuthorHandle: safeText4(extractedTargetPost?.author) || extractThreadHandle(targetNode),
    targetAuthorDisplayName: extractThreadDisplayName(targetNode),
    targetText,
    targetPublishedAt: safeText4(extractedTargetPost?.publishedAt) || extractThreadTimestamp(targetNode),
    mediaUrls: extractedTargetPost ? summarizeExtractedPostPreviewMediaUrls2(extractedTargetPost) : extractMediaUrls(targetNode),
    extractedPost: extractedTargetPost,
    rawPayload: {
      mention: mentionDetail ?? mentionSummary,
      target: targetNode,
      extractedPost: extractedTargetPost
    }
  };
}
async function resolveCollectorAccessToken(config, data) {
  if (config.accessTokenOverride.trim()) {
    return config.accessTokenOverride;
  }
  return getBotAccessTokenForHandle(data, config.botHandle);
}
async function syncMentions(data, config, mode) {
  if (!config.botHandle) {
    return {
      ok: false,
      reason: "bot_handle_missing",
      mode,
      fetchedPages: 0,
      fetchedMentions: 0,
      processedMentions: 0,
      createdArchives: 0,
      updatedArchives: 0,
      unmatchedMentions: 0,
      skippedExisting: 0,
      skippedInvalid: 0
    };
  }
  const accessToken = await resolveCollectorAccessToken(config, data);
  if (!accessToken) {
    return {
      ok: false,
      reason: "access_token_missing",
      mode,
      fetchedPages: 0,
      fetchedMentions: 0,
      processedMentions: 0,
      createdArchives: 0,
      updatedArchives: 0,
      unmatchedMentions: 0,
      skippedExisting: 0,
      skippedInvalid: 0
    };
  }
  const knownMentionIds = new Set(
    data.botArchives.map((candidate) => safeText4(candidate.mentionId)).filter(Boolean)
  );
  let fetchedPages = 0;
  let fetchedMentions = 0;
  let processedMentions = 0;
  let createdArchives = 0;
  let updatedArchives = 0;
  let unmatchedMentions = 0;
  let skippedExisting = 0;
  let skippedInvalid = 0;
  let afterCursor = null;
  for (let page = 0; page < config.maxPages; page += 1) {
    const pageResult = await fetchMentionPage(config, accessToken, afterCursor);
    fetchedPages += 1;
    fetchedMentions += pageResult.items.length;
    let sawOnlyExisting = true;
    for (const mentionSummary of pageResult.items) {
      const mentionId = safeText4(readNestedString(mentionSummary, ["id"]) || "");
      if (mode === "interval" && mentionId && knownMentionIds.has(mentionId)) {
        skippedExisting += 1;
        continue;
      }
      sawOnlyExisting = false;
      const payload = await buildIngestPayload(data, config, accessToken, mentionSummary);
      if (!payload) {
        skippedInvalid += 1;
        continue;
      }
      processedMentions += 1;
      const ingest = ingestBotMention(data, payload);
      if (payload.mentionId) {
        knownMentionIds.add(payload.mentionId);
      }
      if (!ingest.matched) {
        unmatchedMentions += 1;
        continue;
      }
      if (ingest.created) {
        createdArchives += 1;
      } else {
        updatedArchives += 1;
      }
    }
    afterCursor = pageResult.nextCursor;
    if (!afterCursor || pageResult.items.length === 0 || sawOnlyExisting) {
      break;
    }
  }
  return {
    ok: true,
    reason: null,
    mode,
    fetchedPages,
    fetchedMentions,
    processedMentions,
    createdArchives,
    updatedArchives,
    unmatchedMentions,
    skippedExisting,
    skippedInvalid
  };
}
function createBotMentionCollector(deps) {
  let config = readCollectorConfig();
  const logger = deps.logger ?? console;
  const status = createInitialStatus(config);
  let timer = null;
  let inFlight = null;
  let started = false;
  const applyStatusConfig = () => {
    status.enabled = Boolean(config.botHandle) && config.intervalMs > 0;
    status.botHandle = config.botHandle;
    status.pollIntervalMs = config.intervalMs;
    status.fetchLimit = config.fetchLimit;
    status.maxPages = config.maxPages;
  };
  const scheduleTimer = () => {
    if (!started || !status.enabled || timer) {
      return;
    }
    timer = setInterval(() => {
      void runSync("interval").catch((error) => {
        logger.error("[threads-bot] mention sync failed:", error);
      });
    }, config.intervalMs);
  };
  const restartTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    scheduleTimer();
  };
  const runSync = async (mode = "manual") => {
    if (inFlight) {
      return inFlight;
    }
    status.running = true;
    status.lastStartedAt = (/* @__PURE__ */ new Date()).toISOString();
    status.lastError = null;
    inFlight = deps.runTransaction((data) => syncMentions(data, config, mode)).then((summary) => {
      status.lastSummary = summary;
      status.lastCompletedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (summary.ok) {
        status.lastSucceededAt = status.lastCompletedAt;
      } else {
        status.lastError = summary.reason;
      }
      return summary;
    }).catch((error) => {
      status.lastCompletedAt = (/* @__PURE__ */ new Date()).toISOString();
      status.lastError = toCollectorStatusError(error);
      throw error;
    }).finally(() => {
      status.running = false;
      inFlight = null;
    });
    return inFlight;
  };
  return {
    start() {
      started = true;
      applyStatusConfig();
      if (!status.enabled || timer) {
        return;
      }
      void runSync("startup").catch((error) => {
        logger.error("[threads-bot] initial mention sync failed:", error);
      });
      scheduleTimer();
    },
    stop() {
      started = false;
      if (!timer) {
        return;
      }
      clearInterval(timer);
      timer = null;
    },
    syncNow(mode = "manual") {
      return runSync(mode);
    },
    getStatus() {
      return {
        ...status
      };
    },
    reloadConfig() {
      config = readCollectorConfig();
      applyStatusConfig();
      restartTimer();
      if (started && status.enabled) {
        void runSync("config_reload").catch((error) => {
          logger.error("[threads-bot] collector reload sync failed:", error);
        });
      }
      return {
        ...status
      };
    }
  };
}

// src/server/monitoring-service.ts
var AUTO_RUN_INTERVAL_MS = 10 * 6e4;
var MAX_MONITOR_RUNS = 30;
var MAX_MONITOR_INCIDENTS = 100;
var collectorStatusReader = null;
var autoRunTimer = null;
function byNewest(left, right) {
  const leftValue = left.lastSeenAt ?? left.createdAt ?? "";
  const rightValue = right.lastSeenAt ?? right.createdAt ?? "";
  return rightValue.localeCompare(leftValue);
}
function readCollectorStatus() {
  try {
    return collectorStatusReader?.() ?? null;
  } catch {
    return null;
  }
}
function rankStatus(status) {
  switch (status) {
    case "critical":
      return 3;
    case "degraded":
      return 2;
    case "healthy":
      return 1;
    default:
      return 0;
  }
}
function maxStatus(left, right) {
  return rankStatus(left) >= rankStatus(right) ? left : right;
}
function statusToSeverity(status) {
  if (status === "critical") {
    return "critical";
  }
  if (status === "degraded") {
    return "warning";
  }
  return "info";
}
function isIssueStatus(status) {
  return status === "critical" || status === "degraded";
}
function buildCheck(id, channel, label, status, summary, checkedAt) {
  return {
    id,
    channel,
    label,
    status,
    severity: statusToSeverity(status),
    summary,
    checkedAt
  };
}
function formatAgeSummary(timestamp) {
  if (!timestamp) {
    return "No successful sync recorded yet.";
  }
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageMinutes = Math.max(1, Math.round(ageMs / 6e4));
  if (ageMinutes < 60) {
    return `Last successful sync ${ageMinutes} minute${ageMinutes === 1 ? "" : "s"} ago.`;
  }
  const ageHours = Math.max(1, Math.round(ageMinutes / 60));
  return `Last successful sync ${ageHours} hour${ageHours === 1 ? "" : "s"} ago.`;
}
function evaluateChecks(data, collectorStatus) {
  const checkedAt = (/* @__PURE__ */ new Date()).toISOString();
  const runtimeConfig = getRuntimeConfigSnapshot();
  const checks = [];
  const enabledPaymentMethods = data.paymentMethods.filter((method) => method.enabled).length;
  checks.push(
    buildCheck(
      "public-storefront",
      "public_api",
      "Public storefront",
      enabledPaymentMethods > 0 ? "healthy" : "critical",
      enabledPaymentMethods > 0 ? `${enabledPaymentMethods} payment method${enabledPaymentMethods === 1 ? " is" : "s are"} available publicly.` : "No payment methods are enabled for the public storefront.",
      checkedAt
    )
  );
  checks.push(
    buildCheck(
      "admin-dashboard",
      "admin_api",
      "Admin dashboard data",
      "healthy",
      `Dashboard data loaded with ${data.orders.length} order${data.orders.length === 1 ? "" : "s"} and ${data.licenses.length} license${data.licenses.length === 1 ? "" : "s"}.`,
      checkedAt
    )
  );
  const configuredBotHandle = runtimeConfig.collector.botHandle.trim();
  const collectorBotHandle = collectorStatus?.botHandle?.trim() ?? "";
  let botAccountStatus = "healthy";
  let botAccountSummary = configuredBotHandle ? `Public bot handle is @${configuredBotHandle}.` : "Collector bot handle is not configured.";
  if (!configuredBotHandle) {
    botAccountStatus = "critical";
  } else if (collectorBotHandle && collectorBotHandle !== configuredBotHandle) {
    botAccountStatus = "degraded";
    botAccountSummary = `Runtime config uses @${configuredBotHandle}, but collector status reports @${collectorBotHandle}.`;
  }
  checks.push(buildCheck("bot-account-config", "bot_account", "Bot account", botAccountStatus, botAccountSummary, checkedAt));
  let collectorHealthStatus = "unknown";
  let collectorHealthSummary = "Collector status is unavailable.";
  if (collectorStatus) {
    const staleThresholdMs = Math.max(collectorStatus.pollIntervalMs * 3, 30 * 6e4);
    collectorHealthStatus = "healthy";
    collectorHealthSummary = formatAgeSummary(collectorStatus.lastSucceededAt);
    if (!collectorStatus.enabled) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = collectorStatus.lastError ? `Collector is disabled: ${collectorStatus.lastError}.` : "Collector is disabled or missing credentials.";
    } else if (collectorStatus.lastError && !collectorStatus.lastSucceededAt) {
      collectorHealthStatus = "critical";
      collectorHealthSummary = `Collector has not succeeded yet: ${collectorStatus.lastError}.`;
    } else if (collectorStatus.lastError) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = `Collector reported an error: ${collectorStatus.lastError}.`;
    } else if (!collectorStatus.lastSucceededAt) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = "Collector is enabled but has not completed a successful sync yet.";
    } else if (Date.now() - new Date(collectorStatus.lastSucceededAt).getTime() > staleThresholdMs) {
      collectorHealthStatus = "degraded";
      collectorHealthSummary = `${formatAgeSummary(collectorStatus.lastSucceededAt)} Collector freshness exceeded the expected window.`;
    }
  }
  checks.push(
    buildCheck(
      "collector-health",
      "collector",
      "Mention collector",
      collectorHealthStatus,
      collectorHealthSummary,
      checkedAt
    )
  );
  return checks;
}
function buildRun(checks) {
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const overallStatus = checks.reduce((current, check) => maxStatus(current, check.status), "unknown");
  const failingChecks = checks.filter((check) => isIssueStatus(check.status));
  const summary = failingChecks.length > 0 ? failingChecks.map((check) => check.summary).join(" | ") : "All internal monitoring checks passed.";
  return {
    id: crypto.randomUUID(),
    source: "internal",
    overallStatus,
    createdAt,
    summary,
    checks
  };
}
function syncIncidentsForRun(data, run) {
  const now = run.createdAt;
  const activeKeys = /* @__PURE__ */ new Set();
  for (const check of run.checks) {
    if (!isIssueStatus(check.status)) {
      continue;
    }
    activeKeys.add(check.id);
    const existing = data.monitorIncidents.find((incident) => incident.dedupeKey === check.id);
    if (!existing) {
      data.monitorIncidents.push({
        id: crypto.randomUUID(),
        dedupeKey: check.id,
        channel: check.channel,
        severity: check.severity,
        status: "new",
        summary: check.summary,
        firstSeenAt: now,
        lastSeenAt: now,
        lastRunId: run.id,
        mutedUntil: null,
        note: null
      });
      continue;
    }
    const wasMuted = existing.status === "muted" && existing.mutedUntil && new Date(existing.mutedUntil).getTime() > Date.now();
    const reopen = existing.status === "resolved" || existing.status === "muted" && !wasMuted;
    existing.channel = check.channel;
    existing.severity = check.severity;
    existing.summary = check.summary;
    existing.lastSeenAt = now;
    existing.lastRunId = run.id;
    if (reopen) {
      existing.status = "new";
      existing.firstSeenAt = now;
      existing.mutedUntil = null;
    }
  }
  for (const incident of data.monitorIncidents) {
    if (!activeKeys.has(incident.dedupeKey) && incident.status !== "resolved") {
      incident.status = "resolved";
      incident.lastSeenAt = now;
      incident.mutedUntil = null;
    }
  }
  data.monitorIncidents = [...data.monitorIncidents].sort(byNewest).slice(0, MAX_MONITOR_INCIDENTS);
}
function buildOverviewFromData(data, checks = evaluateChecks(data, readCollectorStatus())) {
  const overallStatus = checks.reduce((current, check) => maxStatus(current, check.status), "unknown");
  const recentRuns = [...data.monitorRuns].sort(byNewest).slice(0, 5);
  const lastRun = recentRuns[0] ?? null;
  const lastHealthyRun = [...data.monitorRuns].sort(byNewest).find((run) => run.overallStatus === "healthy") ?? null;
  const openIncidents = data.monitorIncidents.filter((incident) => incident.status !== "resolved");
  const channels = checks.map((check) => ({
    id: check.channel,
    label: check.label,
    status: check.status,
    summary: check.summary,
    checkedAt: check.checkedAt
  }));
  const currentBotHandle = getRuntimeConfigSnapshot().collector.botHandle || readCollectorStatus()?.botHandle || "";
  return {
    overallStatus,
    openIncidents: openIncidents.length,
    criticalIncidents: openIncidents.filter((incident) => incident.severity === "critical").length,
    lastRunAt: lastRun?.createdAt ?? null,
    lastHealthyRunAt: lastHealthyRun?.createdAt ?? null,
    fallbackRatio: 0,
    policyReviewPending: 0,
    currentBotHandle,
    channels,
    recentRuns
  };
}
function configureMonitoringService(options) {
  collectorStatusReader = options.getCollectorStatus;
  if (autoRunTimer) {
    return;
  }
  autoRunTimer = setInterval(() => {
    void runMonitoringNow().catch(() => void 0);
  }, AUTO_RUN_INTERVAL_MS);
  autoRunTimer.unref?.();
}
async function getMonitoringOverview() {
  const data = await loadDatabase();
  return buildOverviewFromData(data);
}
async function listMonitoringIncidents() {
  const data = await loadDatabase();
  return [...data.monitorIncidents].sort(byNewest);
}
async function runMonitoringNow() {
  return withDatabaseTransaction(async (data) => {
    const checks = evaluateChecks(data, readCollectorStatus());
    const run = buildRun(checks);
    data.monitorRuns = [run, ...data.monitorRuns].sort(byNewest).slice(0, MAX_MONITOR_RUNS);
    syncIncidentsForRun(data, run);
    return buildOverviewFromData(data, checks);
  });
}
async function updateIncidentStatus(id, status) {
  return withDatabaseTransaction(async (data) => {
    const incident = data.monitorIncidents.find((candidate) => candidate.id === id);
    if (!incident) {
      throw new Error("Monitoring incident was not found.");
    }
    incident.status = status;
    incident.lastSeenAt = (/* @__PURE__ */ new Date()).toISOString();
    if (status === "resolved") {
      incident.mutedUntil = null;
    }
    return { ...incident };
  });
}
async function acknowledgeMonitoringIncident(id) {
  return updateIncidentStatus(id, "acknowledged");
}
async function resolveMonitoringIncident(id) {
  return updateIncidentStatus(id, "resolved");
}

// src/server.ts
var __dirname = path3.dirname(fileURLToPath(import.meta.url));
var DEFAULT_PORT = 4173;
var DEFAULT_MAX_BODY_BYTES = 1e6;
var MAX_ALLOWED_BODY_BYTES = 2e6;
var BOT_SESSION_COOKIE = "threads_bot_session";
var BOT_SESSION_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
var ADMIN_SESSION_COOKIE = "threads_admin_session";
var ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60;
var ADMIN_SESSION_VERSION = "v1";
var DEFAULT_ADMIN_ALLOWLIST = /* @__PURE__ */ new Set(["127.0.0.1", "::1"]);
var RATE_LIMIT_BUCKET_GC_INTERVAL_MS = 5 * 6e4;
var RequestError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};
var MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};
var PROVIDER_METHOD_DEFAULT_IDS = {
  stableorder: "pm-stableorder",
  stripe: "pm-stripe",
  paypal: "pm-paypal"
};
var PROVIDER_WEBHOOK_SECRETS = {
  stableorder: "THREADS_WEBHOOK_SECRET_STABLEORDER",
  stripe: "THREADS_WEBHOOK_SECRET_STRIPE",
  paypal: "THREADS_WEBHOOK_SECRET_PAYPAL"
};
var PROVIDER_WEBHOOK_HEADERS = {
  stableorder: "x-stableorder-signature",
  stripe: "stripe-signature",
  paypal: "paypal-transmission-sig"
};
var PROVIDER_ACTION_URL_PATTERNS = {
  stableorder: /stableorder\.com/i,
  stripe: /stripe\.com/i,
  paypal: /paypal\.com/i
};
var DEFAULT_PUBLIC_ORIGIN2 = "https://ss-threads.dahanda.dev";
var LEGACY_PUBLIC_HOSTS = /* @__PURE__ */ new Set(["threads-obsidian.dahanda.dev"]);
var LEGACY_PUBLIC_PAGE_PATHS = /* @__PURE__ */ new Set(["/", "/landing", "/landing/", "/scrapbook", "/scrapbook/", "/checkout", "/checkout/"]);
function trimEnv2(name) {
  return process.env[name]?.trim();
}
function parsePort(raw, fallback) {
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new RequestError(500, `Invalid port in THREADS_WEB_PORT: ${raw}`);
  }
  return parsed;
}
function parsePortFromArg(port, envPort) {
  if (typeof port === "undefined") {
    return parsePort(envPort, DEFAULT_PORT);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RequestError(400, `Invalid server port argument: ${port}`);
  }
  return port;
}
function parseMaxBodyBytes(raw) {
  if (!raw) {
    return DEFAULT_MAX_BODY_BYTES;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1024 || parsed > MAX_ALLOWED_BODY_BYTES) {
    throw new RequestError(
      500,
      `Invalid THREADS_WEB_MAX_BODY_BYTES value: ${raw} (expected ${1024}-${MAX_ALLOWED_BODY_BYTES})`
    );
  }
  return parsed;
}
function resolveConfig(portOverride) {
  const adminToken = trimEnv2("THREADS_WEB_ADMIN_TOKEN");
  if (!adminToken) {
    throw new RequestError(500, "THREADS_WEB_ADMIN_TOKEN is required for web server startup.");
  }
  return {
    adminToken,
    maxBodyBytes: parseMaxBodyBytes(trimEnv2("THREADS_WEB_MAX_BODY_BYTES")),
    port: parsePortFromArg(portOverride, trimEnv2("THREADS_WEB_PORT"))
  };
}
function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
function html(response, statusCode, markup) {
  response.writeHead(statusCode, { "content-type": "text/html; charset=utf-8" });
  response.end(markup);
}
function notFound(response) {
  json(response, 404, { error: "Not found" });
}
function unauthorized(response) {
  json(response, 401, { error: "Unauthorized" });
}
function badRequest(response, message) {
  json(response, 400, { error: message });
}
function methodNotAllowed(response) {
  json(response, 405, { error: "Method not allowed" });
}
function isAdminBearerAuthorized(request, adminToken) {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return false;
  }
  const candidate = safeText5(auth.slice("Bearer ".length));
  return Boolean(candidate) && fixedLengthSecretsMatch(candidate, adminToken);
}
function isAdminAuthorized(request, adminToken) {
  return isAdminBearerAuthorized(request, adminToken) || Boolean(readAdminSession(request, adminToken));
}
async function parseJsonBody(request, maxBytes) {
  const contentType = readHeader(request.headers, "content-type");
  const mediaType = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mediaType !== "application/json" && !mediaType.endsWith("+json")) {
    throw new RequestError(415, "Content-Type must be application/json.");
  }
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const binary = typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    totalBytes += binary.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestError(413, `Request body exceeds ${maxBytes} bytes.`);
    }
    chunks.push(binary);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new RequestError(400, "Invalid JSON payload.");
  }
}
async function parseFormBody(request, maxBytes) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const binary = typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    totalBytes += binary.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestError(413, `Request body exceeds ${maxBytes} bytes.`);
    }
    chunks.push(binary);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function safeText5(value) {
  return (value ?? "").trim();
}
function readHeader(headers, name) {
  const value = headers[name.toLowerCase()];
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return value[0]?.trim() ?? null;
}
function readRequestSourceOrigin(request) {
  const origin = readHeader(request.headers, "origin");
  if (origin) {
    return origin;
  }
  const referer = readHeader(request.headers, "referer");
  if (!referer) {
    return null;
  }
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}
function isBrowserExtensionOrigin(origin) {
  const normalized = origin.toLowerCase();
  return normalized.startsWith("chrome-extension://") || normalized.startsWith("moz-extension://");
}
function readForwardedValue(headers, name) {
  const value = readHeader(headers, name);
  if (!value) {
    return null;
  }
  return value.split(",")[0]?.trim() ?? null;
}
function readCookie(headers, name) {
  const rawCookie = readHeader(headers, "cookie");
  if (!rawCookie) {
    return null;
  }
  for (const chunk of rawCookie.split(";")) {
    const [rawName, ...rawValue] = chunk.trim().split("=");
    if (rawName !== name) {
      continue;
    }
    try {
      return decodeURIComponent(rawValue.join("="));
    } catch {
      return rawValue.join("=");
    }
  }
  return null;
}
function appendSetCookie(response, cookie) {
  const existing = response.getHeader("set-cookie");
  if (!existing) {
    response.setHeader("set-cookie", cookie);
    return;
  }
  const next = Array.isArray(existing) ? [...existing, cookie] : [String(existing), cookie];
  response.setHeader("set-cookie", next);
}
function getSessionCookieSameSite(secure) {
  void secure;
  return "Lax";
}
function buildCookie(options) {
  return [
    `${options.name}=${encodeURIComponent(options.value)}`,
    `Path=${options.path ?? "/"}`,
    options.httpOnly === false ? "" : "HttpOnly",
    `SameSite=${options.sameSite}`,
    `Max-Age=${options.maxAge}`,
    options.secure ? "Secure" : ""
  ].filter(Boolean).join("; ");
}
function buildSessionCookie(value, secure) {
  return buildCookie({
    name: BOT_SESSION_COOKIE,
    value,
    secure,
    sameSite: getSessionCookieSameSite(secure),
    maxAge: BOT_SESSION_COOKIE_MAX_AGE_SECONDS
  });
}
function buildClearedSessionCookie(secure) {
  return buildCookie({
    name: BOT_SESSION_COOKIE,
    value: "",
    secure,
    sameSite: getSessionCookieSameSite(secure),
    maxAge: 0
  });
}
function buildAdminSessionCookie(value, secure) {
  return buildCookie({
    name: ADMIN_SESSION_COOKIE,
    value,
    secure,
    sameSite: "Strict",
    path: "/api/admin",
    maxAge: ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS
  });
}
function buildClearedAdminSessionCookie(secure) {
  return buildCookie({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    secure,
    sameSite: "Strict",
    path: "/api/admin",
    maxAge: 0
  });
}
function createFixedLengthHash(value) {
  return createHash5("sha256").update(value).digest();
}
function fixedLengthSecretsMatch(left, right) {
  return timingSafeEqual(createFixedLengthHash(left), createFixedLengthHash(right));
}
function createAdminSessionSignature(adminToken, payload) {
  return createHmac("sha256", adminToken).update(payload).digest("base64url");
}
function createAdminSessionToken(adminToken, now = Date.now()) {
  const expiresAt = now + ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS * 1e3;
  const sessionId = crypto.randomUUID();
  const payload = `${ADMIN_SESSION_VERSION}.${expiresAt}.${sessionId}`;
  const signature = createAdminSessionSignature(adminToken, payload);
  return `${payload}.${signature}`;
}
function readAdminSession(request, adminToken) {
  const raw = readCookie(request.headers, ADMIN_SESSION_COOKIE);
  if (!raw) {
    return null;
  }
  const [version, rawExpiresAt, sessionId, signature] = raw.split(".");
  if (!version || !rawExpiresAt || !sessionId || !signature || version !== ADMIN_SESSION_VERSION) {
    return null;
  }
  const expiresAt = Number.parseInt(rawExpiresAt, 10);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }
  const payload = `${version}.${rawExpiresAt}.${sessionId}`;
  const expectedSignature = createAdminSessionSignature(adminToken, payload);
  if (!fixedLengthSecretsMatch(signature, expectedSignature)) {
    return null;
  }
  return {
    expiresAt,
    sessionId
  };
}
function describeProActivationFailure(reason) {
  if (reason === "activation_required") {
    return "Pro activation is required.";
  }
  if (reason === "seat_limit") {
    return "This Pro key has reached the device limit.";
  }
  if (reason === "revoked") {
    return "This Pro key has been revoked.";
  }
  if (reason === "expired") {
    return "This Pro key has expired.";
  }
  return "This Pro key is not valid.";
}
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function resolveRequestLocale(request, requestUrl, fallback = "en") {
  const queryLocale = requestUrl.searchParams.get("locale") || requestUrl.searchParams.get("lang");
  if (queryLocale) {
    return normalizeLocale(queryLocale, fallback);
  }
  const acceptLanguageHeader = Array.isArray(request.headers["accept-language"]) ? request.headers["accept-language"][0] : request.headers["accept-language"];
  return normalizeLocale(acceptLanguageHeader, fallback);
}
var COUNTRY_TO_LOCALE = {
  KR: "ko",
  JP: "ja",
  BR: "pt-BR",
  PT: "pt-BR",
  ES: "es",
  MX: "es",
  AR: "es",
  CL: "es",
  CO: "es",
  PE: "es",
  TW: "zh-TW",
  HK: "zh-TW",
  MO: "zh-TW",
  VN: "vi"
};
function readSingleHeader(request, name) {
  const raw = request.headers[name];
  if (Array.isArray(raw)) {
    return raw[0]?.trim() || null;
  }
  return typeof raw === "string" ? raw.trim() || null : null;
}
function readCookieValue(request, name) {
  const rawCookie = readSingleHeader(request, "cookie");
  if (!rawCookie) {
    return null;
  }
  for (const pair of rawCookie.split(";")) {
    const [rawKey, ...rawValue] = pair.split("=");
    if (rawKey?.trim() !== name) {
      continue;
    }
    try {
      return decodeURIComponent(rawValue.join("=")).trim() || null;
    } catch {
      return null;
    }
  }
  return null;
}
function resolveGeoCountryLocale(request) {
  const candidates = [
    readSingleHeader(request, "cf-ipcountry"),
    readSingleHeader(request, "x-vercel-ip-country"),
    readSingleHeader(request, "cloudfront-viewer-country"),
    readSingleHeader(request, "x-country-code"),
    readSingleHeader(request, "x-appengine-country")
  ];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const locale = COUNTRY_TO_LOCALE[candidate.toUpperCase()];
    if (locale) {
      return locale;
    }
  }
  return null;
}
function resolveInitialLandingLocale(request, requestUrl) {
  const queryLocale = requestUrl.searchParams.get("locale") || requestUrl.searchParams.get("lang");
  if (queryLocale) {
    return normalizeLocale(queryLocale, "en");
  }
  const cookieLocale = parseSupportedLocale(readCookieValue(request, "threads-web-locale"));
  if (cookieLocale) {
    return cookieLocale;
  }
  const acceptLanguageHeader = Array.isArray(request.headers["accept-language"]) ? request.headers["accept-language"][0] : request.headers["accept-language"];
  const detected = parseSupportedLocale(acceptLanguageHeader);
  if (detected) {
    return detected;
  }
  return resolveGeoCountryLocale(request) ?? "en";
}
var serverPageCopy = {
  ko: {
    oauthTitle: "Threads \uB85C\uADF8\uC778",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Threads \uC571\uC73C\uB85C \uB85C\uADF8\uC778",
    oauthLead: "{handle} scrapbook \uC5F0\uACB0\uC744 \uC704\uD574 Threads \uACC4\uC815\uC744 \uC5F0\uACB0\uD558\uC138\uC694. \uC571\uC774 \uC124\uCE58\uB418\uC5B4 \uC788\uC73C\uBA74 \uBE44\uBC00\uBC88\uD638 \uC785\uB825 \uC5C6\uC774 \uBC14\uB85C \uC778\uC99D\uB429\uB2C8\uB2E4.",
    oauthAuthorizeButton: "Threads\uB85C \uB85C\uADF8\uC778",
    oauthWaitingStatus: "Threads \uC571\uC5D0\uC11C \uC778\uC99D\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694...",
    oauthAuthorizedStatus: "\uC778\uC99D \uC644\uB8CC! \uC7A0\uC2DC \uD6C4 \uC774\uB3D9\uD569\uB2C8\uB2E4...",
    oauthExpiredStatus: "\uB85C\uADF8\uC778 \uC138\uC158\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD574 \uC8FC\uC138\uC694.",
    oauthTimeoutStatus: "\uC751\uB2F5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC778\uC99D\uC744 \uCDE8\uC18C\uD588\uAC70\uB098 \uC2DC\uAC04\uC774 \uCD08\uACFC\uB410\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    oauthFallbackHint: "Threads \uC571\uC774 \uC5C6\uB2E4\uBA74 \uBC84\uD2BC\uC744 \uB20C\uB7EC \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uB85C\uADF8\uC778\uD558\uC138\uC694.",
    privacyTitle: "Threads Archive \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68",
    privacyDescription: "Threads Archive OAuth \uBC0F scrapbook \uC800\uC7A5\uC18C\uC5D0 \uB300\uD55C \uAC1C\uC778\uC815\uBCF4 \uC548\uB0B4\uC785\uB2C8\uB2E4.",
    privacyHeading: "Threads Archive \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68",
    termsTitle: "Threads Archive \uC774\uC6A9\uC57D\uAD00",
    termsDescription: "Threads Archive scrapbook \uC11C\uBE44\uC2A4\uC758 \uAE30\uBCF8 \uC774\uC6A9\uC57D\uAD00\uC785\uB2C8\uB2E4.",
    termsHeading: "Threads Archive \uC774\uC6A9\uC57D\uAD00",
    legalLastUpdated: "\uCD5C\uC885 \uC5C5\uB370\uC774\uD2B8",
    legalServiceUrl: "\uC11C\uBE44\uC2A4 URL",
    privacyBody1: "Threads Archive\uB294 \uB85C\uADF8\uC778\uD55C Threads \uC0AC\uC6A9\uC790\uAC00 \uBE44\uACF5\uAC1C scrapbook\uC5D0 \uC800\uC7A5\uD55C \uBA58\uC158\uC744 \uBCF4\uAD00\uD560 \uC218 \uC788\uB3C4\uB85D \uD544\uC694\uD55C \uCD5C\uC18C \uC815\uBCF4\uB9CC \uC800\uC7A5\uD569\uB2C8\uB2E4.",
    privacyBody2: "\uC11C\uBE44\uC2A4\uB294 \uC5F0\uACB0\uB41C scrapbook \uACC4\uC815\uC744 \uC720\uC9C0\uD558\uACE0 \uD5C8\uC6A9\uB41C API \uC694\uCCAD\uC744 \uCC98\uB9AC\uD558\uAE30 \uC704\uD574 Threads \uACC4\uC815 \uC2DD\uBCC4\uC790, \uC0AC\uC6A9\uC790\uBA85, \uACF5\uAC1C \uD504\uB85C\uD544 \uBA54\uD0C0\uB370\uC774\uD130 \uC77C\uBD80, \uC554\uD638\uD654\uB41C OAuth \uD1A0\uD070\uC744 \uC800\uC7A5\uD569\uB2C8\uB2E4.",
    privacyBody3: "\uC800\uC7A5\uB41C scrapbook \uD56D\uBAA9\uC5D0\uB294 \uBA58\uC158\uB41C \uAC8C\uC2DC\uBB3C URL, \uC6D0\uBB38 \uD14D\uC2A4\uD2B8, \uAD00\uB828 \uBA54\uD0C0\uB370\uC774\uD130, \uB0B4\uBCF4\uB0BC \uC218 \uC788\uB294 Markdown \uCF58\uD150\uCE20\uAC00 \uD3EC\uD568\uB429\uB2C8\uB2E4. \uC774 \uB370\uC774\uD130\uB294 \uD310\uB9E4\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
    privacyBody4: "scrapbook \uD398\uC774\uC9C0\uC5D0\uC11C \uC5B8\uC81C\uB4E0 \uACC4\uC815 \uC5F0\uACB0\uC744 \uD574\uC81C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uB370\uC774\uD130 \uC0AD\uC81C \uC694\uCCAD\uC740 Meta\uB97C \uD1B5\uD574 \uC9C4\uD589\uD558\uAC70\uB098 \uC774 \uC571\uC5D0 \uD45C\uC2DC\uB41C \uC6B4\uC601\uC790\uC5D0\uAC8C \uBB38\uC758\uD574 \uC811\uC218\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    termsBody1: "Threads Archive\uB294 \uC0AC\uC6A9\uC790\uAC00 Threads \uBA58\uC158\uC744 \uC218\uC9D1\uD558\uACE0 Markdown\uC73C\uB85C \uB0B4\uBCF4\uB0BC \uC218 \uC788\uB3C4\uB85D \uB3D5\uB294 \uBE44\uACF5\uAC1C scrapbook \uC11C\uBE44\uC2A4\uC785\uB2C8\uB2E4.",
    termsBody2: "\uC800\uC7A5\uD558\uB294 \uCF58\uD150\uCE20, Threads \uD50C\uB7AB\uD3FC \uADDC\uCE59 \uC900\uC218, \uC0AC\uC6A9\uD560 \uAD8C\uD55C\uC774 \uC5C6\uB294 \uCF58\uD150\uCE20\uB97C \uC800\uC7A5\uD558\uC9C0 \uC54A\uC744 \uCC45\uC784\uC740 \uC0AC\uC6A9\uC790\uC5D0\uAC8C \uC788\uC2B5\uB2C8\uB2E4.",
    termsBody3: "\uC11C\uBE44\uC2A4\uB294 \uC5B8\uC81C\uB4E0 \uBCC0\uACBD\uB418\uAC70\uB098 \uC911\uB2E8\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC6B4\uC601\uC790\uB294 \uC548\uC804 \uB610\uB294 \uBC95\uC801 \uC900\uC218\uB97C \uC704\uD574 \uC545\uC758\uC801 \uC811\uADFC\uC744 \uCC28\uB2E8\uD558\uAC70\uB098 \uC800\uC7A5\uB41C \uB370\uC774\uD130\uB97C \uC81C\uAC70\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    termsBody4: "\uC11C\uBE44\uC2A4\uB97C \uC0AC\uC6A9\uD558\uBA74 \uACF5\uAC1C Threads \uC0C1\uD638\uC791\uC6A9\uC774 scrapbook \uC6CC\uD06C\uD50C\uB85C \uC81C\uACF5\uC744 \uC704\uD574 \uCC98\uB9AC\uB41C\uB2E4\uB294 \uC810\uC5D0 \uB3D9\uC758\uD55C \uAC83\uC73C\uB85C \uBD05\uB2C8\uB2E4.",
    deletionTitle: "\uB370\uC774\uD130 \uC0AD\uC81C \uC694\uCCAD \uC811\uC218\uB428",
    deletionDescription: "Threads Archive \uB370\uC774\uD130 \uC0AD\uC81C \uCF5C\uBC31 \uC0C1\uD0DC \uD398\uC774\uC9C0\uC785\uB2C8\uB2E4.",
    deletionHeading: "\uB370\uC774\uD130 \uC0AD\uC81C \uC694\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
    deletionBody1: "\uC694\uCCAD\uC774 \uD655\uC778 \uCF54\uB4DC {code}\uB85C \uAE30\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    deletionBody2: "\uC5F0\uACB0\uB41C \uACC4\uC815\uC5D0 scrapbook \uB370\uC774\uD130\uAC00 \uC788\uB2E4\uBA74 \uC0AD\uC81C \uC808\uCC28\uC5D0 \uB530\uB77C \uD568\uAED8 \uC81C\uAC70\uB429\uB2C8\uB2E4.",
    notionFailedHeading: "Notion \uC5F0\uACB0 \uC2E4\uD328",
    notionCloseHint: "\uC774 \uD0ED\uC744 \uB2EB\uACE0 \uD655\uC7A5 \uD504\uB85C\uADF8\uB7A8\uC73C\uB85C \uB3CC\uC544\uAC00\uC138\uC694.",
    notionMissingParams: "OAuth \uCF5C\uBC31 \uD30C\uB77C\uBBF8\uD130\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    notionConnectedHeading: "Notion \uC5F0\uACB0 \uC644\uB8CC",
    notionConnectedBody: "\uC774\uC81C \uC774 \uD0ED\uC744 \uB2EB\uACE0 \uD655\uC7A5 \uD504\uB85C\uADF8\uB7A8\uC73C\uB85C \uB3CC\uC544\uAC00\uBA74 \uB429\uB2C8\uB2E4.",
    notionUnexpected: "\uC608\uC0C1\uD558\uC9C0 \uBABB\uD55C Notion OAuth \uC624\uB958\uC785\uB2C8\uB2E4.",
    threadsSigninStartError: "Threads \uB85C\uADF8\uC778\uC744 \uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    threadsSigninCodeError: "Threads \uB85C\uADF8\uC778\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uB294 \uC778\uC99D \uCF54\uB4DC\uB97C \uBC1B\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    threadsSigninUnexpected: "\uC608\uC0C1\uD558\uC9C0 \uBABB\uD55C Threads \uB85C\uADF8\uC778 \uC624\uB958\uC785\uB2C8\uB2E4."
  },
  en: {
    oauthTitle: "Sign In with Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Sign in with Threads",
    oauthLead: "Connect your Threads account to the {handle} scrapbook. If you have the Threads app installed, you can authorize without entering your password.",
    oauthAuthorizeButton: "Sign in with Threads",
    oauthWaitingStatus: "Complete authorization in the Threads app...",
    oauthAuthorizedStatus: "Authorized! Redirecting...",
    oauthExpiredStatus: "Sign-in session expired. Please refresh the page.",
    oauthTimeoutStatus: "No response. You may have cancelled, or the request timed out.",
    oauthFallbackHint: "If you don't have the Threads app, tap the button to sign in through your browser.",
    privacyTitle: "Threads Archive Privacy Policy",
    privacyDescription: "Privacy details for Threads Archive OAuth and scrapbook storage.",
    privacyHeading: "Threads Archive Privacy Policy",
    termsTitle: "Threads Archive Terms",
    termsDescription: "Basic service terms for the Threads Archive scrapbook service.",
    termsHeading: "Threads Archive Terms",
    legalLastUpdated: "Last updated",
    legalServiceUrl: "Service URL",
    privacyBody1: "Threads Archive stores only the minimum information needed to let a signed-in Threads user keep a private scrapbook of saved mentions.",
    privacyBody2: "We store your Threads account identifier, username, optional public profile metadata, and encrypted OAuth tokens so the service can keep your scrapbook account linked and process permitted API requests.",
    privacyBody3: "Saved scrapbook entries include the mentioned post URL, source text, related metadata, and exportable Markdown content. We do not sell this data.",
    privacyBody4: "You can disconnect your account at any time from the scrapbook page. Data deletion requests can be initiated through Meta or by contacting the operator shown on this app.",
    termsBody1: "Threads Archive is a private scrapbook service that helps users capture Threads mentions and export them as Markdown.",
    termsBody2: "You are responsible for the content you save, for complying with the Threads platform rules, and for not storing content you do not have permission to use.",
    termsBody3: "The service may change or be suspended at any time. The operator may revoke abusive access or remove stored data when required for safety or legal compliance.",
    termsBody4: "By using the service, you agree that public Threads interactions are processed to provide the scrapbook workflow.",
    deletionTitle: "Data Deletion Request Received",
    deletionDescription: "Threads Archive data deletion callback status page.",
    deletionHeading: "Data deletion request received",
    deletionBody1: "Your request has been recorded under confirmation code {code}.",
    deletionBody2: "If any scrapbook data exists for the linked account, it will be removed as part of the deletion workflow.",
    notionFailedHeading: "Notion connection failed",
    notionCloseHint: "You can close this tab and return to the extension.",
    notionMissingParams: "Missing OAuth callback parameters.",
    notionConnectedHeading: "Notion is connected",
    notionConnectedBody: "You can close this tab and return to the extension.",
    notionUnexpected: "Unexpected Notion OAuth error.",
    threadsSigninStartError: "Could not start Threads sign-in.",
    threadsSigninCodeError: "Threads sign-in did not return a usable authorization code.",
    threadsSigninUnexpected: "Unexpected Threads sign-in error."
  },
  ja: {
    oauthTitle: "Threads \u30ED\u30B0\u30A4\u30F3\u3092\u7D9A\u3051\u308B",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "\u30D6\u30E9\u30A6\u30B6\u3067\u30ED\u30B0\u30A4\u30F3\u3092\u7D9A\u3051\u308B",
    oauthLead: "\u30E2\u30D0\u30A4\u30EB\u3067\u306F\u76F4\u63A5\u958B\u304F\u3088\u308A\u3001\u30ED\u30B0\u30A4\u30F3\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC\u3059\u308B\u65B9\u304C\u5B89\u5B9A\u3057\u3066\u3044\u307E\u3059\u3002\u4EE5\u4E0B\u306E\u624B\u9806\u3067 {handle} scrapbook \u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    oauthStep1: "\u300C\u30ED\u30B0\u30A4\u30F3\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC\u300D\u3092\u62BC\u3057\u307E\u3059\u3002",
    oauthStep2: "\u30D6\u30E9\u30A6\u30B6\u3067\u65B0\u3057\u3044\u30BF\u30D6\u3092\u958B\u304D\u3001\u30A2\u30C9\u30EC\u30B9\u30D0\u30FC\u306B\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002",
    oauthStep3: "\u8CBC\u308A\u4ED8\u3051\u305F URL \u3092\u958B\u3044\u3066 Threads \u306E\u30ED\u30B0\u30A4\u30F3\u3092\u5B8C\u4E86\u3057\u307E\u3059\u3002",
    oauthCopyButton: "\u30ED\u30B0\u30A4\u30F3\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC",
    oauthCopiedButton: "\u30B3\u30D4\u30FC\u5B8C\u4E86",
    oauthCopiedStatus: "\u30ED\u30B0\u30A4\u30F3\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\u3002\u65B0\u3057\u3044\u30D6\u30E9\u30A6\u30B6\u30BF\u30D6\u306B\u8CBC\u308A\u4ED8\u3051\u3066\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
    oauthCopyFailedStatus: "\u81EA\u52D5\u30B3\u30D4\u30FC\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u4E0B\u306E\u30EA\u30F3\u30AF\u3092\u9078\u629E\u3057\u305F\u72B6\u614B\u306A\u306E\u3067\u624B\u52D5\u3067\u30B3\u30D4\u30FC\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    oauthHint: "\u540C\u3058\u30EA\u30F3\u30AF\u304C\u4E0B\u306E\u30DC\u30C3\u30AF\u30B9\u306B\u3082\u8868\u793A\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u81EA\u52D5\u30B3\u30D4\u30FC\u304C\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u305F\u5834\u5408\u306F\u9577\u62BC\u3057\u3057\u3066\u624B\u52D5\u3067\u30B3\u30D4\u30FC\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    privacyTitle: "Threads Archive \u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u30DD\u30EA\u30B7\u30FC",
    privacyDescription: "Threads Archive \u306E OAuth \u3068 scrapbook \u4FDD\u5B58\u306B\u95A2\u3059\u308B\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u60C5\u5831\u3067\u3059\u3002",
    privacyHeading: "Threads Archive \u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u30DD\u30EA\u30B7\u30FC",
    termsTitle: "Threads Archive \u5229\u7528\u898F\u7D04",
    termsDescription: "Threads Archive scrapbook \u30B5\u30FC\u30D3\u30B9\u306E\u57FA\u672C\u5229\u7528\u898F\u7D04\u3067\u3059\u3002",
    termsHeading: "Threads Archive \u5229\u7528\u898F\u7D04",
    legalLastUpdated: "\u6700\u7D42\u66F4\u65B0\u65E5",
    legalServiceUrl: "\u30B5\u30FC\u30D3\u30B9 URL",
    privacyBody1: "Threads Archive \u306F\u3001\u30ED\u30B0\u30A4\u30F3\u3057\u305F Threads \u30E6\u30FC\u30B6\u30FC\u304C\u4FDD\u5B58\u3057\u305F\u30E1\u30F3\u30B7\u30E7\u30F3\u3092\u975E\u516C\u958B scrapbook \u306B\u4FDD\u6301\u3059\u308B\u305F\u3081\u306B\u5FC5\u8981\u306A\u6700\u5C0F\u9650\u306E\u60C5\u5831\u306E\u307F\u3092\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    privacyBody2: "\u30B5\u30FC\u30D3\u30B9\u306F scrapbook \u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u63A5\u7D9A\u7DAD\u6301\u3068\u8A31\u53EF\u3055\u308C\u305F API \u30EA\u30AF\u30A8\u30B9\u30C8\u51E6\u7406\u306E\u305F\u3081\u3001Threads \u30A2\u30AB\u30A6\u30F3\u30C8\u8B58\u5225\u5B50\u3001\u30E6\u30FC\u30B6\u30FC\u540D\u3001\u516C\u958B\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u306E\u4E00\u90E8\u30E1\u30BF\u30C7\u30FC\u30BF\u3001\u6697\u53F7\u5316\u3055\u308C\u305F OAuth \u30C8\u30FC\u30AF\u30F3\u3092\u4FDD\u5B58\u3057\u307E\u3059\u3002",
    privacyBody3: "\u4FDD\u5B58\u3055\u308C\u305F scrapbook \u9805\u76EE\u306B\u306F\u3001\u30E1\u30F3\u30B7\u30E7\u30F3\u3055\u308C\u305F\u6295\u7A3F URL\u3001\u5143\u30C6\u30AD\u30B9\u30C8\u3001\u95A2\u9023\u30E1\u30BF\u30C7\u30FC\u30BF\u3001\u66F8\u304D\u51FA\u3057\u53EF\u80FD\u306A Markdown \u30B3\u30F3\u30C6\u30F3\u30C4\u304C\u542B\u307E\u308C\u307E\u3059\u3002\u3053\u308C\u3089\u306E\u30C7\u30FC\u30BF\u3092\u8CA9\u58F2\u3059\u308B\u3053\u3068\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    privacyBody4: "scrapbook \u30DA\u30FC\u30B8\u304B\u3089\u3044\u3064\u3067\u3082\u30A2\u30AB\u30A6\u30F3\u30C8\u9023\u643A\u3092\u89E3\u9664\u3067\u304D\u307E\u3059\u3002\u30C7\u30FC\u30BF\u524A\u9664\u30EA\u30AF\u30A8\u30B9\u30C8\u306F Meta \u7D4C\u7531\u3001\u307E\u305F\u306F\u3053\u306E\u30A2\u30D7\u30EA\u306B\u8868\u793A\u3055\u308C\u308B\u904B\u55B6\u8005\u3078\u306E\u9023\u7D61\u3067\u958B\u59CB\u3067\u304D\u307E\u3059\u3002",
    termsBody1: "Threads Archive \u306F\u3001Threads \u306E\u30E1\u30F3\u30B7\u30E7\u30F3\u3092\u53CE\u96C6\u3057 Markdown \u3068\u3057\u3066\u66F8\u304D\u51FA\u305B\u308B\u3088\u3046\u306B\u3059\u308B\u975E\u516C\u958B scrapbook \u30B5\u30FC\u30D3\u30B9\u3067\u3059\u3002",
    termsBody2: "\u4FDD\u5B58\u3059\u308B\u30B3\u30F3\u30C6\u30F3\u30C4\u3001Threads \u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0\u898F\u5247\u306E\u9075\u5B88\u3001\u5229\u7528\u8A31\u53EF\u306E\u306A\u3044\u30B3\u30F3\u30C6\u30F3\u30C4\u3092\u4FDD\u5B58\u3057\u306A\u3044\u8CAC\u4EFB\u306F\u30E6\u30FC\u30B6\u30FC\u306B\u3042\u308A\u307E\u3059\u3002",
    termsBody3: "\u30B5\u30FC\u30D3\u30B9\u306F\u3044\u3064\u3067\u3082\u5909\u66F4\u307E\u305F\u306F\u505C\u6B62\u3055\u308C\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002\u904B\u55B6\u8005\u306F\u5B89\u5168\u4E0A\u307E\u305F\u306F\u6CD5\u4EE4\u9075\u5B88\u306E\u305F\u3081\u3001\u4E0D\u6B63\u30A2\u30AF\u30BB\u30B9\u3092\u53D6\u308A\u6D88\u3057\u305F\u308A\u4FDD\u5B58\u30C7\u30FC\u30BF\u3092\u524A\u9664\u3057\u305F\u308A\u3067\u304D\u307E\u3059\u3002",
    termsBody4: "\u672C\u30B5\u30FC\u30D3\u30B9\u3092\u5229\u7528\u3059\u308B\u3053\u3068\u3067\u3001\u516C\u958B\u3055\u308C\u305F Threads \u4E0A\u306E\u3084\u308A\u53D6\u308A\u304C scrapbook \u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u63D0\u4F9B\u306E\u305F\u3081\u306B\u51E6\u7406\u3055\u308C\u308B\u3053\u3068\u306B\u540C\u610F\u3057\u305F\u3082\u306E\u3068\u307F\u306A\u3055\u308C\u307E\u3059\u3002",
    deletionTitle: "\u30C7\u30FC\u30BF\u524A\u9664\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u53D7\u3051\u4ED8\u3051\u307E\u3057\u305F",
    deletionDescription: "Threads Archive \u306E\u30C7\u30FC\u30BF\u524A\u9664\u30B3\u30FC\u30EB\u30D0\u30C3\u30AF\u72B6\u6CC1\u30DA\u30FC\u30B8\u3067\u3059\u3002",
    deletionHeading: "\u30C7\u30FC\u30BF\u524A\u9664\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u53D7\u3051\u4ED8\u3051\u307E\u3057\u305F",
    deletionBody1: "\u30EA\u30AF\u30A8\u30B9\u30C8\u306F\u78BA\u8A8D\u30B3\u30FC\u30C9 {code} \u3067\u8A18\u9332\u3055\u308C\u307E\u3057\u305F\u3002",
    deletionBody2: "\u9023\u643A\u6E08\u307F\u30A2\u30AB\u30A6\u30F3\u30C8\u306B scrapbook \u30C7\u30FC\u30BF\u304C\u3042\u308B\u5834\u5408\u306F\u3001\u524A\u9664\u30D5\u30ED\u30FC\u306E\u4E00\u90E8\u3068\u3057\u3066\u524A\u9664\u3055\u308C\u307E\u3059\u3002",
    notionFailedHeading: "Notion \u9023\u643A\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    notionCloseHint: "\u3053\u306E\u30BF\u30D6\u3092\u9589\u3058\u3066\u62E1\u5F35\u6A5F\u80FD\u306B\u623B\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
    notionMissingParams: "OAuth \u30B3\u30FC\u30EB\u30D0\u30C3\u30AF\u306E\u30D1\u30E9\u30E1\u30FC\u30BF\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002",
    notionConnectedHeading: "Notion \u306E\u63A5\u7D9A\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F",
    notionConnectedBody: "\u3053\u306E\u30BF\u30D6\u3092\u9589\u3058\u3066\u62E1\u5F35\u6A5F\u80FD\u306B\u623B\u308C\u307E\u3059\u3002",
    notionUnexpected: "\u4E88\u671F\u3057\u306A\u3044 Notion OAuth \u30A8\u30E9\u30FC\u3067\u3059\u3002",
    threadsSigninStartError: "Threads \u30ED\u30B0\u30A4\u30F3\u3092\u958B\u59CB\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    threadsSigninCodeError: "Threads \u30ED\u30B0\u30A4\u30F3\u304B\u3089\u5229\u7528\u53EF\u80FD\u306A\u8A8D\u8A3C\u30B3\u30FC\u30C9\u304C\u8FD4\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    threadsSigninUnexpected: "\u4E88\u671F\u3057\u306A\u3044 Threads \u30ED\u30B0\u30A4\u30F3\u30A8\u30E9\u30FC\u3067\u3059\u3002"
  },
  "pt-BR": {
    oauthTitle: "Continuar login do Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Continue o login no navegador",
    oauthLead: "No celular, copiar o link de login costuma ser mais est\xE1vel do que abri-lo diretamente. Siga os passos abaixo para conectar o scrapbook {handle}.",
    oauthStep1: "Toque em Copiar link de login.",
    oauthStep2: "Abra uma nova guia no navegador e cole o link na barra de endere\xE7o.",
    oauthStep3: "Abra a URL colada e conclua o login no Threads.",
    oauthCopyButton: "Copiar link de login",
    oauthCopiedButton: "Copiado",
    oauthCopiedStatus: "O link de login foi copiado. Cole-o em uma nova guia do navegador e abra-o.",
    oauthCopyFailedStatus: "A c\xF3pia autom\xE1tica falhou. O link abaixo est\xE1 selecionado para voc\xEA copiar manualmente.",
    oauthHint: "O mesmo link tamb\xE9m aparece abaixo. Se a c\xF3pia autom\xE1tica for bloqueada, pressione e segure para copiar manualmente.",
    privacyTitle: "Pol\xEDtica de Privacidade do Threads Archive",
    privacyDescription: "Detalhes de privacidade do OAuth e do armazenamento do scrapbook no Threads Archive.",
    privacyHeading: "Pol\xEDtica de Privacidade do Threads Archive",
    termsTitle: "Termos do Threads Archive",
    termsDescription: "Termos b\xE1sicos do servi\xE7o de scrapbook do Threads Archive.",
    termsHeading: "Termos do Threads Archive",
    legalLastUpdated: "\xDAltima atualiza\xE7\xE3o",
    legalServiceUrl: "URL do servi\xE7o",
    privacyBody1: "O Threads Archive armazena apenas o m\xEDnimo de informa\xE7\xF5es necess\xE1rio para que um usu\xE1rio autenticado do Threads mantenha um scrapbook privado de men\xE7\xF5es salvas.",
    privacyBody2: "Armazenamos o identificador da sua conta Threads, nome de usu\xE1rio, metadados p\xFAblicos opcionais do perfil e tokens OAuth criptografados para manter sua conta de scrapbook conectada e processar solicita\xE7\xF5es de API permitidas.",
    privacyBody3: "As entradas salvas no scrapbook incluem a URL da publica\xE7\xE3o mencionada, texto de origem, metadados relacionados e conte\xFAdo Markdown export\xE1vel. N\xE3o vendemos esses dados.",
    privacyBody4: "Voc\xEA pode desconectar sua conta a qualquer momento na p\xE1gina do scrapbook. Solicita\xE7\xF5es de exclus\xE3o de dados podem ser iniciadas via Meta ou entrando em contato com o operador exibido neste app.",
    termsBody1: "O Threads Archive \xE9 um servi\xE7o privado de scrapbook que ajuda usu\xE1rios a capturar men\xE7\xF5es no Threads e export\xE1-las como Markdown.",
    termsBody2: "Voc\xEA \xE9 respons\xE1vel pelo conte\xFAdo que salva, por cumprir as regras da plataforma Threads e por n\xE3o armazenar conte\xFAdo sem permiss\xE3o de uso.",
    termsBody3: "O servi\xE7o pode mudar ou ser suspenso a qualquer momento. O operador pode revogar acessos abusivos ou remover dados armazenados quando necess\xE1rio por seguran\xE7a ou conformidade legal.",
    termsBody4: "Ao usar o servi\xE7o, voc\xEA concorda que intera\xE7\xF5es p\xFAblicas no Threads sejam processadas para fornecer o fluxo do scrapbook.",
    deletionTitle: "Solicita\xE7\xE3o de exclus\xE3o de dados recebida",
    deletionDescription: "P\xE1gina de status do retorno de exclus\xE3o de dados do Threads Archive.",
    deletionHeading: "Solicita\xE7\xE3o de exclus\xE3o de dados recebida",
    deletionBody1: "Sua solicita\xE7\xE3o foi registrada com o c\xF3digo de confirma\xE7\xE3o {code}.",
    deletionBody2: "Se existirem dados de scrapbook para a conta vinculada, eles ser\xE3o removidos como parte do fluxo de exclus\xE3o.",
    notionFailedHeading: "Falha na conex\xE3o com o Notion",
    notionCloseHint: "Voc\xEA pode fechar esta guia e voltar para a extens\xE3o.",
    notionMissingParams: "Par\xE2metros do callback OAuth ausentes.",
    notionConnectedHeading: "Notion conectado",
    notionConnectedBody: "Voc\xEA pode fechar esta guia e voltar para a extens\xE3o.",
    notionUnexpected: "Erro inesperado de OAuth do Notion.",
    threadsSigninStartError: "N\xE3o foi poss\xEDvel iniciar o login do Threads.",
    threadsSigninCodeError: "O login do Threads n\xE3o retornou um c\xF3digo de autoriza\xE7\xE3o utiliz\xE1vel.",
    threadsSigninUnexpected: "Erro inesperado no login do Threads."
  },
  es: {
    oauthTitle: "Continuar inicio de sesi\xF3n de Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Contin\xFAa el inicio de sesi\xF3n en tu navegador",
    oauthLead: "En m\xF3vil suele ser m\xE1s fiable copiar el enlace de inicio de sesi\xF3n que abrirlo directamente. Sigue estos pasos para conectar el scrapbook de {handle}.",
    oauthStep1: "Pulsa Copiar enlace de inicio de sesi\xF3n.",
    oauthStep2: "Abre una pesta\xF1a nueva del navegador y pega el enlace en la barra de direcciones.",
    oauthStep3: "Abre la URL pegada y completa el inicio de sesi\xF3n en Threads.",
    oauthCopyButton: "Copiar enlace de inicio de sesi\xF3n",
    oauthCopiedButton: "Copiado",
    oauthCopiedStatus: "Se copi\xF3 el enlace de inicio de sesi\xF3n. P\xE9galo en una nueva pesta\xF1a del navegador y \xE1brelo.",
    oauthCopyFailedStatus: "La copia autom\xE1tica fall\xF3. El enlace de abajo est\xE1 seleccionado para que puedas copiarlo manualmente.",
    oauthHint: "El mismo enlace tambi\xE9n aparece abajo. Si la copia autom\xE1tica se bloquea, mant\xE9n pulsado para copiarlo manualmente.",
    privacyTitle: "Pol\xEDtica de privacidad de Threads Archive",
    privacyDescription: "Detalles de privacidad sobre OAuth y el almacenamiento del scrapbook en Threads Archive.",
    privacyHeading: "Pol\xEDtica de privacidad de Threads Archive",
    termsTitle: "T\xE9rminos de Threads Archive",
    termsDescription: "T\xE9rminos b\xE1sicos del servicio de scrapbook de Threads Archive.",
    termsHeading: "T\xE9rminos de Threads Archive",
    legalLastUpdated: "\xDAltima actualizaci\xF3n",
    legalServiceUrl: "URL del servicio",
    privacyBody1: "Threads Archive almacena solo la informaci\xF3n m\xEDnima necesaria para que un usuario autenticado de Threads mantenga un scrapbook privado con menciones guardadas.",
    privacyBody2: "Guardamos el identificador de tu cuenta de Threads, nombre de usuario, metadatos p\xFAblicos opcionales del perfil y tokens OAuth cifrados para mantener vinculada tu cuenta de scrapbook y procesar solicitudes de API permitidas.",
    privacyBody3: "Las entradas guardadas del scrapbook incluyen la URL de la publicaci\xF3n mencionada, el texto de origen, metadatos relacionados y contenido Markdown exportable. No vendemos estos datos.",
    privacyBody4: "Puedes desconectar tu cuenta en cualquier momento desde la p\xE1gina del scrapbook. Las solicitudes de eliminaci\xF3n de datos pueden iniciarse a trav\xE9s de Meta o contactando al operador indicado en esta app.",
    termsBody1: "Threads Archive es un servicio privado de scrapbook que ayuda a los usuarios a capturar menciones de Threads y exportarlas como Markdown.",
    termsBody2: "Eres responsable del contenido que guardas, de cumplir las reglas de la plataforma Threads y de no almacenar contenido para el que no tengas permiso de uso.",
    termsBody3: "El servicio puede cambiar o suspenderse en cualquier momento. El operador puede revocar accesos abusivos o eliminar datos guardados cuando sea necesario por seguridad o cumplimiento legal.",
    termsBody4: "Al usar el servicio, aceptas que las interacciones p\xFAblicas en Threads se procesen para proporcionar el flujo de trabajo del scrapbook.",
    deletionTitle: "Solicitud de eliminaci\xF3n de datos recibida",
    deletionDescription: "P\xE1gina de estado del callback de eliminaci\xF3n de datos de Threads Archive.",
    deletionHeading: "Solicitud de eliminaci\xF3n de datos recibida",
    deletionBody1: "Tu solicitud se registr\xF3 con el c\xF3digo de confirmaci\xF3n {code}.",
    deletionBody2: "Si existe alg\xFAn dato de scrapbook para la cuenta vinculada, se eliminar\xE1 como parte del flujo de eliminaci\xF3n.",
    notionFailedHeading: "Fall\xF3 la conexi\xF3n con Notion",
    notionCloseHint: "Puedes cerrar esta pesta\xF1a y volver a la extensi\xF3n.",
    notionMissingParams: "Faltan par\xE1metros del callback de OAuth.",
    notionConnectedHeading: "Notion est\xE1 conectado",
    notionConnectedBody: "Puedes cerrar esta pesta\xF1a y volver a la extensi\xF3n.",
    notionUnexpected: "Error inesperado de OAuth de Notion.",
    threadsSigninStartError: "No se pudo iniciar el inicio de sesi\xF3n de Threads.",
    threadsSigninCodeError: "El inicio de sesi\xF3n de Threads no devolvi\xF3 un c\xF3digo de autorizaci\xF3n utilizable.",
    threadsSigninUnexpected: "Error inesperado en el inicio de sesi\xF3n de Threads."
  },
  "zh-TW": {
    oauthTitle: "\u7E7C\u7E8C Threads \u767B\u5165",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "\u5728\u700F\u89BD\u5668\u4E2D\u7E7C\u7E8C\u767B\u5165",
    oauthLead: "\u5728\u884C\u52D5\u88DD\u7F6E\u4E0A\uFF0C\u8907\u88FD\u767B\u5165\u9023\u7D50\u901A\u5E38\u6BD4\u76F4\u63A5\u958B\u555F\u66F4\u7A69\u5B9A\u3002\u8ACB\u4F9D\u7167\u4E0B\u5217\u6B65\u9A5F\u9023\u63A5 {handle} scrapbook\u3002",
    oauthStep1: "\u9EDE\u9078\u300C\u8907\u88FD\u767B\u5165\u9023\u7D50\u300D\u3002",
    oauthStep2: "\u5728\u700F\u89BD\u5668\u958B\u555F\u65B0\u5206\u9801\uFF0C\u5C07\u9023\u7D50\u8CBC\u5230\u7DB2\u5740\u5217\u3002",
    oauthStep3: "\u958B\u555F\u8CBC\u4E0A\u7684\u7DB2\u5740\u4E26\u5B8C\u6210 Threads \u767B\u5165\u3002",
    oauthCopyButton: "\u8907\u88FD\u767B\u5165\u9023\u7D50",
    oauthCopiedButton: "\u5DF2\u8907\u88FD",
    oauthCopiedStatus: "\u767B\u5165\u9023\u7D50\u5DF2\u8907\u88FD\u3002\u8ACB\u8CBC\u5230\u65B0\u7684\u700F\u89BD\u5668\u5206\u9801\u4E26\u958B\u555F\u3002",
    oauthCopyFailedStatus: "\u81EA\u52D5\u8907\u88FD\u5931\u6557\u3002\u4E0B\u65B9\u9023\u7D50\u5DF2\u88AB\u9078\u53D6\uFF0C\u8ACB\u624B\u52D5\u8907\u88FD\u3002",
    oauthHint: "\u76F8\u540C\u9023\u7D50\u4E5F\u986F\u793A\u5728\u4E0B\u65B9\u3002\u82E5\u81EA\u52D5\u8907\u88FD\u88AB\u963B\u64CB\uFF0C\u8ACB\u9577\u6309\u5F8C\u624B\u52D5\u8907\u88FD\u3002",
    privacyTitle: "Threads Archive \u96B1\u79C1\u6B0A\u653F\u7B56",
    privacyDescription: "Threads Archive OAuth \u8207 scrapbook \u5132\u5B58\u7684\u96B1\u79C1\u6B0A\u8AAA\u660E\u3002",
    privacyHeading: "Threads Archive \u96B1\u79C1\u6B0A\u653F\u7B56",
    termsTitle: "Threads Archive \u670D\u52D9\u689D\u6B3E",
    termsDescription: "Threads Archive scrapbook \u670D\u52D9\u7684\u57FA\u672C\u689D\u6B3E\u3002",
    termsHeading: "Threads Archive \u670D\u52D9\u689D\u6B3E",
    legalLastUpdated: "\u6700\u5F8C\u66F4\u65B0",
    legalServiceUrl: "\u670D\u52D9\u7DB2\u5740",
    privacyBody1: "Threads Archive \u53EA\u6703\u5132\u5B58\u8B93\u5DF2\u767B\u5165 Threads \u4F7F\u7528\u8005\u7DAD\u6301\u79C1\u4EBA scrapbook \u6240\u9700\u7684\u6700\u5C11\u8CC7\u8A0A\u3002",
    privacyBody2: "\u6211\u5011\u6703\u5132\u5B58\u4F60\u7684 Threads \u5E33\u865F\u8B58\u5225\u8CC7\u8A0A\u3001\u4F7F\u7528\u8005\u540D\u7A31\u3001\u53EF\u9078\u7684\u516C\u958B\u500B\u4EBA\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599\uFF0C\u4EE5\u53CA\u52A0\u5BC6\u5F8C\u7684 OAuth \u6B0A\u6756\uFF0C\u4EE5\u7DAD\u6301 scrapbook \u5E33\u865F\u9023\u7DDA\u4E26\u8655\u7406\u5DF2\u6388\u6B0A\u7684 API \u8ACB\u6C42\u3002",
    privacyBody3: "\u5DF2\u5132\u5B58\u7684 scrapbook \u9805\u76EE\u5305\u542B\u88AB\u63D0\u53CA\u8CBC\u6587\u7684 URL\u3001\u539F\u59CB\u6587\u5B57\u3001\u76F8\u95DC\u4E2D\u7E7C\u8CC7\u6599\u8207\u53EF\u532F\u51FA\u7684 Markdown \u5167\u5BB9\u3002\u6211\u5011\u4E0D\u6703\u8CA9\u552E\u9019\u4E9B\u8CC7\u6599\u3002",
    privacyBody4: "\u4F60\u53EF\u4EE5\u96A8\u6642\u5728 scrapbook \u9801\u9762\u89E3\u9664\u5E33\u865F\u9023\u7DDA\u3002\u8CC7\u6599\u522A\u9664\u8ACB\u6C42\u53EF\u900F\u904E Meta \u767C\u8D77\uFF0C\u6216\u806F\u7D61\u6B64\u61C9\u7528\u7A0B\u5F0F\u4E0A\u986F\u793A\u7684\u71DF\u904B\u8005\u3002",
    termsBody1: "Threads Archive \u662F\u4E00\u9805\u79C1\u4EBA scrapbook \u670D\u52D9\uFF0C\u5354\u52A9\u4F7F\u7528\u8005\u6536\u96C6 Threads \u63D0\u53CA\u5167\u5BB9\u4E26\u532F\u51FA\u70BA Markdown\u3002",
    termsBody2: "\u4F60\u9700\u5C0D\u81EA\u5DF1\u5132\u5B58\u7684\u5167\u5BB9\u3001\u9075\u5B88 Threads \u5E73\u53F0\u898F\u5247\uFF0C\u4EE5\u53CA\u4E0D\u5132\u5B58\u672A\u7372\u6388\u6B0A\u4F7F\u7528\u7684\u5167\u5BB9\u8CA0\u8CAC\u3002",
    termsBody3: "\u670D\u52D9\u53EF\u80FD\u96A8\u6642\u8B8A\u66F4\u6216\u66AB\u505C\u3002\u71DF\u904B\u8005\u53EF\u56E0\u5B89\u5168\u6216\u6CD5\u5F8B\u9075\u5FAA\u9700\u6C42\u64A4\u92B7\u6FEB\u7528\u5B58\u53D6\u6B0A\u6216\u79FB\u9664\u5DF2\u5132\u5B58\u8CC7\u6599\u3002",
    termsBody4: "\u4F7F\u7528\u672C\u670D\u52D9\u5373\u8868\u793A\u4F60\u540C\u610F\u7CFB\u7D71\u6703\u8655\u7406\u516C\u958B\u7684 Threads \u4E92\u52D5\uFF0C\u4EE5\u63D0\u4F9B scrapbook \u5DE5\u4F5C\u6D41\u7A0B\u3002",
    deletionTitle: "\u5DF2\u6536\u5230\u8CC7\u6599\u522A\u9664\u8ACB\u6C42",
    deletionDescription: "Threads Archive \u8CC7\u6599\u522A\u9664\u56DE\u547C\u72C0\u614B\u9801\u9762\u3002",
    deletionHeading: "\u5DF2\u6536\u5230\u8CC7\u6599\u522A\u9664\u8ACB\u6C42",
    deletionBody1: "\u4F60\u7684\u8ACB\u6C42\u5DF2\u4EE5\u78BA\u8A8D\u78BC {code} \u8A18\u9304\u3002",
    deletionBody2: "\u82E5\u9023\u7D50\u5E33\u865F\u5B58\u5728 scrapbook \u8CC7\u6599\uFF0C\u7CFB\u7D71\u5C07\u5728\u522A\u9664\u6D41\u7A0B\u4E2D\u4E00\u4F75\u79FB\u9664\u3002",
    notionFailedHeading: "Notion \u9023\u7DDA\u5931\u6557",
    notionCloseHint: "\u4F60\u53EF\u4EE5\u95DC\u9589\u6B64\u5206\u9801\u4E26\u8FD4\u56DE\u64F4\u5145\u529F\u80FD\u3002",
    notionMissingParams: "\u7F3A\u5C11 OAuth \u56DE\u547C\u53C3\u6578\u3002",
    notionConnectedHeading: "Notion \u5DF2\u9023\u7DDA",
    notionConnectedBody: "\u4F60\u53EF\u4EE5\u95DC\u9589\u6B64\u5206\u9801\u4E26\u8FD4\u56DE\u64F4\u5145\u529F\u80FD\u3002",
    notionUnexpected: "\u767C\u751F\u672A\u9810\u671F\u7684 Notion OAuth \u932F\u8AA4\u3002",
    threadsSigninStartError: "\u7121\u6CD5\u958B\u59CB Threads \u767B\u5165\u3002",
    threadsSigninCodeError: "Threads \u767B\u5165\u672A\u56DE\u50B3\u53EF\u7528\u7684\u6388\u6B0A\u78BC\u3002",
    threadsSigninUnexpected: "\u767C\u751F\u672A\u9810\u671F\u7684 Threads \u767B\u5165\u932F\u8AA4\u3002"
  },
  vi: {
    oauthTitle: "Ti\u1EBFp t\u1EE5c \u0111\u0103ng nh\u1EADp Threads",
    oauthEyebrow: "Threads OAuth",
    oauthHeading: "Ti\u1EBFp t\u1EE5c \u0111\u0103ng nh\u1EADp trong tr\xECnh duy\u1EC7t",
    oauthLead: "Tr\xEAn thi\u1EBFt b\u1ECB di \u0111\u1ED9ng, vi\u1EC7c sao ch\xE9p li\xEAn k\u1EBFt \u0111\u0103ng nh\u1EADp th\u01B0\u1EDDng \u1ED5n \u0111\u1ECBnh h\u01A1n m\u1EDF tr\u1EF1c ti\u1EBFp. H\xE3y l\xE0m theo c\xE1c b\u01B0\u1EDBc d\u01B0\u1EDBi \u0111\xE2y \u0111\u1EC3 k\u1EBFt n\u1ED1i scrapbook {handle}.",
    oauthStep1: "Nh\u1EA5n Sao ch\xE9p li\xEAn k\u1EBFt \u0111\u0103ng nh\u1EADp.",
    oauthStep2: "M\u1EDF m\u1ED9t tab tr\xECnh duy\u1EC7t m\u1EDBi v\xE0 d\xE1n li\xEAn k\u1EBFt v\xE0o thanh \u0111\u1ECBa ch\u1EC9.",
    oauthStep3: "M\u1EDF URL \u0111\xE3 d\xE1n v\xE0 ho\xE0n t\u1EA5t \u0111\u0103ng nh\u1EADp Threads.",
    oauthCopyButton: "Sao ch\xE9p li\xEAn k\u1EBFt \u0111\u0103ng nh\u1EADp",
    oauthCopiedButton: "\u0110\xE3 sao ch\xE9p",
    oauthCopiedStatus: "\u0110\xE3 sao ch\xE9p li\xEAn k\u1EBFt \u0111\u0103ng nh\u1EADp. H\xE3y d\xE1n n\xF3 v\xE0o m\u1ED9t tab tr\xECnh duy\u1EC7t m\u1EDBi r\u1ED3i m\u1EDF.",
    oauthCopyFailedStatus: "Sao ch\xE9p t\u1EF1 \u0111\u1ED9ng th\u1EA5t b\u1EA1i. Li\xEAn k\u1EBFt b\xEAn d\u01B0\u1EDBi \u0111\xE3 \u0111\u01B0\u1EE3c ch\u1ECDn \u0111\u1EC3 b\u1EA1n sao ch\xE9p th\u1EE7 c\xF4ng.",
    oauthHint: "Li\xEAn k\u1EBFt t\u01B0\u01A1ng t\u1EF1 c\u0169ng hi\u1EC3n th\u1ECB b\xEAn d\u01B0\u1EDBi. N\u1EBFu sao ch\xE9p t\u1EF1 \u0111\u1ED9ng b\u1ECB ch\u1EB7n, h\xE3y nh\u1EA5n gi\u1EEF \u0111\u1EC3 sao ch\xE9p th\u1EE7 c\xF4ng.",
    privacyTitle: "Ch\xEDnh s\xE1ch quy\u1EC1n ri\xEAng t\u01B0 c\u1EE7a Threads Archive",
    privacyDescription: "Th\xF4ng tin quy\u1EC1n ri\xEAng t\u01B0 cho OAuth v\xE0 l\u01B0u tr\u1EEF scrapbook c\u1EE7a Threads Archive.",
    privacyHeading: "Ch\xEDnh s\xE1ch quy\u1EC1n ri\xEAng t\u01B0 c\u1EE7a Threads Archive",
    termsTitle: "\u0110i\u1EC1u kho\u1EA3n Threads Archive",
    termsDescription: "C\xE1c \u0111i\u1EC1u kho\u1EA3n c\u01A1 b\u1EA3n cho d\u1ECBch v\u1EE5 scrapbook c\u1EE7a Threads Archive.",
    termsHeading: "\u0110i\u1EC1u kho\u1EA3n Threads Archive",
    legalLastUpdated: "C\u1EADp nh\u1EADt l\u1EA7n cu\u1ED1i",
    legalServiceUrl: "URL d\u1ECBch v\u1EE5",
    privacyBody1: "Threads Archive ch\u1EC9 l\u01B0u tr\u1EEF l\u01B0\u1EE3ng th\xF4ng tin t\u1ED1i thi\u1EC3u c\u1EA7n thi\u1EBFt \u0111\u1EC3 ng\u01B0\u1EDDi d\xF9ng Threads \u0111\xE3 \u0111\u0103ng nh\u1EADp c\xF3 th\u1EC3 duy tr\xEC scrapbook ri\xEAng t\u01B0 c\u1EE7a c\xE1c l\u01B0\u1EE3t nh\u1EAFc \u0111\xE3 l\u01B0u.",
    privacyBody2: "Ch\xFAng t\xF4i l\u01B0u m\xE3 \u0111\u1ECBnh danh t\xE0i kho\u1EA3n Threads, t\xEAn ng\u01B0\u1EDDi d\xF9ng, si\xEAu d\u1EEF li\u1EC7u h\u1ED3 s\u01A1 c\xF4ng khai t\xF9y ch\u1ECDn v\xE0 token OAuth \u0111\xE3 m\xE3 h\xF3a \u0111\u1EC3 gi\u1EEF li\xEAn k\u1EBFt v\u1EDBi t\xE0i kho\u1EA3n scrapbook c\u1EE7a b\u1EA1n v\xE0 x\u1EED l\xFD c\xE1c y\xEAu c\u1EA7u API \u0111\u01B0\u1EE3c cho ph\xE9p.",
    privacyBody3: "C\xE1c m\u1EE5c scrapbook \u0111\xE3 l\u01B0u bao g\u1ED3m URL b\xE0i vi\u1EBFt \u0111\u01B0\u1EE3c nh\u1EAFc \u0111\u1EBFn, v\u0103n b\u1EA3n ngu\u1ED3n, si\xEAu d\u1EEF li\u1EC7u li\xEAn quan v\xE0 n\u1ED9i dung Markdown c\xF3 th\u1EC3 xu\u1EA5t ra. Ch\xFAng t\xF4i kh\xF4ng b\xE1n d\u1EEF li\u1EC7u n\xE0y.",
    privacyBody4: "B\u1EA1n c\xF3 th\u1EC3 ng\u1EAFt k\u1EBFt n\u1ED1i t\xE0i kho\u1EA3n b\u1EA5t c\u1EE9 l\xFAc n\xE0o t\u1EEB trang scrapbook. Y\xEAu c\u1EA7u x\xF3a d\u1EEF li\u1EC7u c\xF3 th\u1EC3 \u0111\u01B0\u1EE3c kh\u1EDFi t\u1EA1o qua Meta ho\u1EB7c b\u1EB1ng c\xE1ch li\xEAn h\u1EC7 v\u1EDBi \u0111\u01A1n v\u1ECB v\u1EADn h\xE0nh hi\u1EC3n th\u1ECB trong \u1EE9ng d\u1EE5ng n\xE0y.",
    termsBody1: "Threads Archive l\xE0 d\u1ECBch v\u1EE5 scrapbook ri\xEAng t\u01B0 gi\xFAp ng\u01B0\u1EDDi d\xF9ng thu th\u1EADp c\xE1c l\u01B0\u1EE3t nh\u1EAFc tr\xEAn Threads v\xE0 xu\u1EA5t ch\xFAng sang Markdown.",
    termsBody2: "B\u1EA1n ch\u1ECBu tr\xE1ch nhi\u1EC7m v\u1EC1 n\u1ED9i dung m\xECnh l\u01B0u, vi\u1EC7c tu\xE2n th\u1EE7 quy t\u1EAFc c\u1EE7a n\u1EC1n t\u1EA3ng Threads v\xE0 kh\xF4ng l\u01B0u n\u1ED9i dung m\xE0 b\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n s\u1EED d\u1EE5ng.",
    termsBody3: "D\u1ECBch v\u1EE5 c\xF3 th\u1EC3 thay \u0111\u1ED5i ho\u1EB7c b\u1ECB t\u1EA1m ng\u01B0ng b\u1EA5t c\u1EE9 l\xFAc n\xE0o. \u0110\u01A1n v\u1ECB v\u1EADn h\xE0nh c\xF3 th\u1EC3 thu h\u1ED3i quy\u1EC1n truy c\u1EADp l\u1EA1m d\u1EE5ng ho\u1EB7c x\xF3a d\u1EEF li\u1EC7u \u0111\xE3 l\u01B0u khi c\u1EA7n thi\u1EBFt v\xEC l\xFD do an to\xE0n ho\u1EB7c tu\xE2n th\u1EE7 ph\xE1p l\xFD.",
    termsBody4: "Khi s\u1EED d\u1EE5ng d\u1ECBch v\u1EE5, b\u1EA1n \u0111\u1ED3ng \xFD r\u1EB1ng c\xE1c t\u01B0\u01A1ng t\xE1c c\xF4ng khai tr\xEAn Threads s\u1EBD \u0111\u01B0\u1EE3c x\u1EED l\xFD \u0111\u1EC3 cung c\u1EA5p quy tr\xECnh scrapbook.",
    deletionTitle: "\u0110\xE3 nh\u1EADn y\xEAu c\u1EA7u x\xF3a d\u1EEF li\u1EC7u",
    deletionDescription: "Trang tr\u1EA1ng th\xE1i callback x\xF3a d\u1EEF li\u1EC7u c\u1EE7a Threads Archive.",
    deletionHeading: "\u0110\xE3 nh\u1EADn y\xEAu c\u1EA7u x\xF3a d\u1EEF li\u1EC7u",
    deletionBody1: "Y\xEAu c\u1EA7u c\u1EE7a b\u1EA1n \u0111\xE3 \u0111\u01B0\u1EE3c ghi nh\u1EADn v\u1EDBi m\xE3 x\xE1c nh\u1EADn {code}.",
    deletionBody2: "N\u1EBFu c\xF3 d\u1EEF li\u1EC7u scrapbook cho t\xE0i kho\u1EA3n \u0111\xE3 li\xEAn k\u1EBFt, d\u1EEF li\u1EC7u \u0111\xF3 s\u1EBD b\u1ECB x\xF3a trong quy tr\xECnh x\xF3a.",
    notionFailedHeading: "K\u1EBFt n\u1ED1i Notion th\u1EA5t b\u1EA1i",
    notionCloseHint: "B\u1EA1n c\xF3 th\u1EC3 \u0111\xF3ng tab n\xE0y v\xE0 quay l\u1EA1i ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng.",
    notionMissingParams: "Thi\u1EBFu tham s\u1ED1 callback OAuth.",
    notionConnectedHeading: "Notion \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i",
    notionConnectedBody: "B\u1EA1n c\xF3 th\u1EC3 \u0111\xF3ng tab n\xE0y v\xE0 quay l\u1EA1i ti\u1EC7n \xEDch m\u1EDF r\u1ED9ng.",
    notionUnexpected: "L\u1ED7i OAuth Notion kh\xF4ng mong mu\u1ED1n.",
    threadsSigninStartError: "Kh\xF4ng th\u1EC3 b\u1EAFt \u0111\u1EA7u \u0111\u0103ng nh\u1EADp Threads.",
    threadsSigninCodeError: "\u0110\u0103ng nh\u1EADp Threads kh\xF4ng tr\u1EA3 v\u1EC1 m\xE3 \u1EE7y quy\u1EC1n h\u1EE3p l\u1EC7.",
    threadsSigninUnexpected: "\u0110\xE3 x\u1EA3y ra l\u1ED7i \u0111\u0103ng nh\u1EADp Threads kh\xF4ng mong mu\u1ED1n."
  }
};
function tServer(locale) {
  return serverPageCopy[locale];
}
function interpolateServerText(template, values) {
  let output = template;
  for (const [key, value] of Object.entries(values)) {
    output = output.replaceAll(`{${key}}`, value);
  }
  return output;
}
function renderLegalPage(title, description, body) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <style>
      :root {
        color-scheme: light;
        font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      }
      body {
        margin: 0;
        background: #ffffff;
        color: #0f172a;
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 48px 20px 72px;
        line-height: 1.7;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 2rem;
        line-height: 1.1;
        letter-spacing: -0.04em;
      }
      p {
        margin: 0 0 14px;
        color: #475569;
      }
      .muted {
        color: #64748b;
        font-size: 0.95rem;
      }
      .card {
        margin-top: 24px;
        padding: 20px;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        background: #f8fafc;
      }
      a {
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>`;
}
function renderOauthBridgePage(authorizeUrl, botHandle, pollToken, publicOrigin, locale) {
  const msg = tServer(locale);
  const safeAuthorizeUrlJson = JSON.stringify(authorizeUrl).replace(/</g, "\\u003c");
  const safePollUrlJson = JSON.stringify(`${publicOrigin}/api/public/bot/oauth/poll`).replace(/</g, "\\u003c");
  const safeActivateUrlJson = JSON.stringify(`${publicOrigin}/api/public/bot/oauth/activate`).replace(/</g, "\\u003c");
  const safePollTokenJson = JSON.stringify(pollToken).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="${escapeHtml(locale)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(msg.oauthTitle)}</title>
    <meta name="robots" content="noindex,nofollow" />
    <style>
      :root {
        color-scheme: light;
        font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
        --bg: #f8fafc;
        --surface: #ffffff;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #e2e8f0;
        --accent: #111827;
        --success: #16a34a;
      }
      * { box-sizing: border-box; }
      html {
        min-height: 100%;
        background: radial-gradient(circle at top, #ffffff 0%, var(--bg) 70%);
      }
      body {
        margin: 0;
        min-height: 100%;
        color: var(--ink);
        padding: calc(24px + env(safe-area-inset-top)) 24px calc(32px + env(safe-area-inset-bottom));
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .card {
        width: min(100%, 420px);
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
      }
      @supports (min-height: 100dvh) {
        body { min-height: 100dvh; }
      }
      .eyebrow {
        margin: 0 0 12px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      h1 {
        margin: 0;
        font-size: 1.8rem;
        line-height: 1.1;
        letter-spacing: -0.04em;
      }
      p {
        margin: 14px 0 0;
        color: var(--muted);
        line-height: 1.6;
      }
      .actions {
        display: grid;
        gap: 10px;
        margin-top: 24px;
      }
      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 52px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        background: var(--accent);
        color: #fff;
        border: none;
        cursor: pointer;
        width: 100%;
        transition: opacity 0.15s;
      }
      .cta:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        margin-right: 8px;
        flex-shrink: 0;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .status {
        min-height: 20px;
        margin-top: 16px;
        font-size: 13px;
        color: var(--muted);
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .status.success { color: var(--success); font-weight: 600; }
      .status.error { color: #dc2626; }
      .hint {
        margin-top: 18px;
        font-size: 12px;
        color: var(--muted);
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <p class="eyebrow">${escapeHtml(msg.oauthEyebrow)}</p>
      <h1>${escapeHtml(msg.oauthHeading)}</h1>
      <p>${escapeHtml(interpolateServerText(msg.oauthLead, { handle: `@${escapeHtml(botHandle)}` }))}</p>
      <div class="actions">
        <a id="auth-button" class="cta" href="${escapeHtml(authorizeUrl)}" target="_blank" rel="noopener">
          ${escapeHtml(String(msg.oauthAuthorizeButton ?? "Sign in with Threads"))}
        </a>
      </div>
      <p id="auth-status" class="status" aria-live="polite" aria-atomic="true"></p>
      <p class="hint">${escapeHtml(String(msg.oauthFallbackHint ?? "Open the sign-in flow in your browser if the Threads app is unavailable."))}</p>
    </main>
    <script>
      (() => {
        const pollUrl = ${safePollUrlJson};
        const activateUrl = ${safeActivateUrlJson};
        const pollToken = ${safePollTokenJson};
        const authorizeUrl = ${safeAuthorizeUrlJson};
        const waitingText = ${JSON.stringify(msg.oauthWaitingStatus ?? "Complete authorization in the Threads app...").replace(/</g, "\\u003c")};
        const authorizedText = ${JSON.stringify(msg.oauthAuthorizedStatus ?? "Authorized! Redirecting...").replace(/</g, "\\u003c")};
        const expiredText = ${JSON.stringify(msg.oauthExpiredStatus ?? "Sign-in session expired. Please refresh the page.").replace(/</g, "\\u003c")};
        const timeoutText = ${JSON.stringify(msg.oauthTimeoutStatus ?? "No response. You may have cancelled, or the request timed out.").replace(/</g, "\\u003c")};
        const POLL_TIMEOUT_MS = 3 * 60 * 1000;

        const authButton = document.getElementById("auth-button");
        const statusEl = document.getElementById("auth-status");

        let polling = false;
        let everPolled = false;
        let pollInterval = null;
        let pollTimeoutId = null;

        function setStatus(text, cls) {
          if (statusEl) {
            statusEl.textContent = text;
            statusEl.className = "status" + (cls ? " " + cls : "");
          }
        }

        function setButtonEnabled(enabled) {
          if (authButton instanceof HTMLElement) {
            authButton.style.opacity = enabled ? "" : "0.5";
            authButton.style.pointerEvents = enabled ? "" : "none";
            authButton.setAttribute("aria-disabled", enabled ? "false" : "true");
          }
        }

        function stopPolling(statusText, cls) {
          clearInterval(pollInterval);
          clearTimeout(pollTimeoutId);
          polling = false;
          setStatus(statusText, cls);
          setButtonEnabled(true);
        }

        function startPolling() {
          if (polling) return;
          polling = true;
          everPolled = true;
          setButtonEnabled(false);
          setStatus(waitingText);
          pollTimeoutId = setTimeout(() => stopPolling(timeoutText, "error"), POLL_TIMEOUT_MS);
          pollInterval = setInterval(async () => {
            try {
              const res = await fetch(pollUrl + "?token=" + encodeURIComponent(pollToken), { credentials: "omit", cache: "no-store" });
              if (!res.ok) return;
              const data = await res.json();
              if (data.status === "authorized" && data.activationCode) {
                clearTimeout(pollTimeoutId);
                clearInterval(pollInterval);
                polling = false;
                setStatus(authorizedText, "success");
                window.location.href = activateUrl + "?code=" + encodeURIComponent(data.activationCode);
              } else if (data.status === "expired") {
                stopPolling(expiredText, "error");
              }
            } catch (_) {}
          }, 2000);
        }

        if (authButton) {
          authButton.addEventListener("click", (e) => {
            if (polling) {
              e.preventDefault();
              return;
            }
            if (everPolled) {
              // \uC774\uC804 \uC2DC\uB3C4\uAC00 \uB9CC\uB8CC/\uD0C0\uC784\uC544\uC6C3\uC73C\uB85C \uC885\uB8CC \u2192 \uC0C8 \uC138\uC158\uC774 \uD544\uC694\uD558\uBBC0\uB85C \uD398\uC774\uC9C0 \uB9AC\uB85C\uB4DC
              e.preventDefault();
              window.location.reload();
              return;
            }
            // \uCCAB \uD074\uB9AD: \uB9C1\uD06C\uAC00 Threads \uC571\uC744 \uC5F4\uACE0, polling \uC2DC\uC791
            setTimeout(startPolling, 500);
          });
        }
      })();
    </script>
  </body>
</html>`;
}
function renderPrivacyPage(publicOrigin, locale) {
  const msg = tServer(locale);
  return renderLegalPage(
    msg.privacyTitle,
    msg.privacyDescription,
    `
      <h1>${escapeHtml(msg.privacyHeading)}</h1>
      <p class="muted">${escapeHtml(msg.legalLastUpdated)}: ${escapeHtml((/* @__PURE__ */ new Date()).toISOString().slice(0, 10))}</p>
      <div class="card">
        <p>${escapeHtml(msg.privacyBody1)}</p>
        <p>${escapeHtml(msg.privacyBody2)}</p>
        <p>${escapeHtml(msg.privacyBody3)}</p>
        <p>${escapeHtml(msg.privacyBody4)}</p>
        <p>${escapeHtml(msg.legalServiceUrl)}: <a href="${escapeHtml(publicOrigin)}">${escapeHtml(publicOrigin)}</a></p>
      </div>
    `
  );
}
function renderTermsPage(publicOrigin, locale) {
  const msg = tServer(locale);
  return renderLegalPage(
    msg.termsTitle,
    msg.termsDescription,
    `
      <h1>${escapeHtml(msg.termsHeading)}</h1>
      <p class="muted">${escapeHtml(msg.legalLastUpdated)}: ${escapeHtml((/* @__PURE__ */ new Date()).toISOString().slice(0, 10))}</p>
      <div class="card">
        <p>${escapeHtml(msg.termsBody1)}</p>
        <p>${escapeHtml(msg.termsBody2)}</p>
        <p>${escapeHtml(msg.termsBody3)}</p>
        <p>${escapeHtml(msg.termsBody4)}</p>
        <p>${escapeHtml(msg.legalServiceUrl)}: <a href="${escapeHtml(publicOrigin)}">${escapeHtml(publicOrigin)}</a></p>
      </div>
    `
  );
}
function renderNotionCallbackPage(locale, heading, body, autoClose = false) {
  return `<!doctype html><html lang="${escapeHtml(locale)}"><body><main style="font-family: sans-serif; max-width: 520px; margin: 48px auto; line-height: 1.6;"><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(body)}</p>${autoClose ? "<script>window.close()</script>" : ""}</main></body></html>`;
}
function decodeBase64UrlJson(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - normalized.length % 4);
  try {
    return JSON.parse(Buffer.from(`${normalized}${padding}`, "base64").toString("utf8"));
  } catch {
    return null;
  }
}
function buildThreadsMetaDeletionResponse(publicOrigin, signedRequest) {
  const [, payloadPart] = safeText5(signedRequest).split(".", 2);
  const payload = payloadPart ? decodeBase64UrlJson(payloadPart) : null;
  const confirmationCode = createHash5("sha256").update(`${payload?.user_id ?? "anonymous"}:${Date.now()}:${publicOrigin}`).digest("hex").slice(0, 16);
  return {
    confirmationCode,
    statusUrl: `${publicOrigin.replace(/\/+$/, "")}/legal/data-deletion-status?code=${encodeURIComponent(confirmationCode)}`
  };
}
async function handleMetaThreadsUtilityRoutes(request, response, pathname, config) {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const method = request.method ?? "GET";
  const locale = resolveRequestLocale(request, requestUrl);
  const msg = tServer(locale);
  if (pathname === "/privacy") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    html(response, 200, renderPrivacyPage(publicOrigin, locale));
    return;
  }
  if (pathname === "/terms") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    html(response, 200, renderTermsPage(publicOrigin, locale));
    return;
  }
  if (pathname === "/legal/data-deletion-status") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const code = safeText5(requestUrl.searchParams.get("code")) || "pending";
    html(
      response,
      200,
      renderLegalPage(
        "Data Deletion Request Received",
        msg.deletionDescription,
        `
          <h1>${escapeHtml(msg.deletionHeading)}</h1>
          <div class="card">
            <p>${escapeHtml(interpolateServerText(msg.deletionBody1, { code }))}</p>
            <p>${escapeHtml(msg.deletionBody2)}</p>
          </div>
        `
      )
    );
    return;
  }
  if (pathname === "/api/public/threads/deauthorize") {
    if (method !== "POST" && method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    json(response, 200, { ok: true, status: "received" });
    return;
  }
  if (pathname === "/api/public/threads/delete") {
    if (method !== "POST" && method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    let signedRequest = safeText5(requestUrl.searchParams.get("signed_request")) || null;
    if (method === "POST") {
      const form = await parseFormBody(request, config.maxBodyBytes);
      signedRequest = safeText5(form.get("signed_request")) || signedRequest;
    }
    const deletion = buildThreadsMetaDeletionResponse(publicOrigin, signedRequest);
    json(response, 200, {
      url: deletion.statusUrl,
      confirmation_code: deletion.confirmationCode
    });
    return;
  }
}
function resolveRequestOrigin(request, requestUrl) {
  const forwardedProto = readForwardedValue(request.headers, "x-forwarded-proto");
  const forwardedHost = readForwardedValue(request.headers, "x-forwarded-host");
  const protocol = forwardedProto === "https" || forwardedProto === "http" ? forwardedProto : requestUrl.protocol.replace(/:$/, "");
  const host = forwardedHost || request.headers.host || requestUrl.host;
  return `${protocol}://${host}`;
}
function readConfiguredPublicOrigin() {
  const configuredOrigin = getRuntimeConfigSnapshot().publicOrigin || trimEnv2("THREADS_WEB_PUBLIC_ORIGIN");
  if (!configuredOrigin) {
    return null;
  }
  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return null;
  }
}
function isSecureRequest(request, requestUrl) {
  if (resolveRequestOrigin(request, requestUrl).startsWith("https://")) {
    return true;
  }
  const configuredAdminOrigin = readConfiguredAdminOrigin();
  if (configuredAdminOrigin?.startsWith("https://")) {
    return true;
  }
  return resolvePublicOrigin(request, requestUrl).startsWith("https://");
}
function resolvePreferredPublicOrigin() {
  return readConfiguredPublicOrigin() ?? DEFAULT_PUBLIC_ORIGIN2;
}
function resolvePublicOrigin(request, requestUrl) {
  const requestOrigin = resolveRequestOrigin(request, requestUrl);
  const configuredOrigin = readConfiguredPublicOrigin();
  if (configuredOrigin) {
    try {
      const configured = new URL(configuredOrigin);
      const derived = new URL(requestOrigin);
      if (configured.host === derived.host) {
        return configured.origin;
      }
    } catch {
    }
  }
  return requestOrigin;
}
function assertTrustedMutationOrigin(request, requestUrl, options = {}) {
  const sourceOrigin = readRequestSourceOrigin(request);
  if (!sourceOrigin) {
    throw new RequestError(403, "Origin header is required.");
  }
  if (options.allowExtensionOrigin && isBrowserExtensionOrigin(sourceOrigin)) {
    return;
  }
  const allowedOrigins = /* @__PURE__ */ new Set([
    resolveRequestOrigin(request, requestUrl),
    resolvePublicOrigin(request, requestUrl),
    resolvePreferredPublicOrigin()
  ]);
  const configuredOrigin = readConfiguredPublicOrigin();
  if (configuredOrigin) {
    allowedOrigins.add(configuredOrigin);
  }
  if (!allowedOrigins.has(sourceOrigin)) {
    throw new RequestError(403, "Origin is not allowed.");
  }
}
function getMutationOriginPolicy(pathname, method) {
  const normalizedMethod = method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)) {
    return { enforce: false, allowExtensionOrigin: false };
  }
  if (pathname === "/api/public/orders") {
    return { enforce: true, allowExtensionOrigin: false };
  }
  if (pathname.startsWith("/api/public/licenses/")) {
    return { enforce: true, allowExtensionOrigin: true };
  }
  if (pathname.startsWith("/api/public/notion/") && pathname !== "/api/public/notion/oauth/callback") {
    return { enforce: true, allowExtensionOrigin: true };
  }
  if (pathname === "/api/public/bot/ingest" || pathname.startsWith("/api/public/webhooks/")) {
    return { enforce: false, allowExtensionOrigin: false };
  }
  if (pathname.startsWith("/api/public/bot/")) {
    return { enforce: true, allowExtensionOrigin: false };
  }
  if (pathname.startsWith("/api/admin/")) {
    return { enforce: true, allowExtensionOrigin: false };
  }
  if (pathname.startsWith("/api/extension/")) {
    return { enforce: true, allowExtensionOrigin: true };
  }
  return { enforce: false, allowExtensionOrigin: false };
}
function readBearerToken(request) {
  const authorization = readHeader(request.headers, "authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  return safeText5(authorization.slice("Bearer ".length));
}
function normalizeIpAddress(value) {
  const normalized = safeText5(value);
  if (!normalized) {
    return "";
  }
  return normalized.startsWith("::ffff:") ? normalized.slice("::ffff:".length) : normalized;
}
function readTrustedProxyAllowlist() {
  const raw = trimEnv2("THREADS_WEB_TRUST_PROXY_ALLOWLIST");
  if (!raw) {
    return /* @__PURE__ */ new Set();
  }
  return new Set(
    raw.split(",").map((entry) => normalizeIpAddress(entry)).filter(Boolean)
  );
}
function readPeerIp(request) {
  return normalizeIpAddress(request.socket.remoteAddress) || "unknown";
}
function readClientIp(request) {
  const peerIp = readPeerIp(request);
  if (!readTrustedProxyAllowlist().has(peerIp)) {
    return peerIp;
  }
  const forwarded = readForwardedValue(request.headers, "x-forwarded-for");
  if (forwarded) {
    return normalizeIpAddress(forwarded);
  }
  return peerIp;
}
function readAdminAllowlist() {
  const raw = trimEnv2("THREADS_WEB_ADMIN_ALLOWLIST");
  if (!raw) {
    return new Set(DEFAULT_ADMIN_ALLOWLIST);
  }
  const values = raw.split(",").map((entry) => normalizeIpAddress(entry)).filter(Boolean);
  return values.length > 0 ? new Set(values) : null;
}
function assertAdminIpAllowed(request) {
  const allowlist = readAdminAllowlist();
  if (!allowlist) {
    return;
  }
  const clientIp = readClientIp(request);
  if (!allowlist.has(clientIp)) {
    throw new RequestError(403, "Admin access is not allowed from this IP.");
  }
}
function readConfiguredAdminOrigin() {
  const raw = trimEnv2("THREADS_WEB_ADMIN_ORIGIN");
  if (!raw) {
    return null;
  }
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}
function assertAdminOriginAllowed(request, requestUrl) {
  const configuredAdminOrigin = readConfiguredAdminOrigin();
  if (!configuredAdminOrigin) {
    return;
  }
  const requestOrigin = resolveRequestOrigin(request, requestUrl);
  if (new URL(configuredAdminOrigin).host.toLowerCase() !== new URL(requestOrigin).host.toLowerCase()) {
    throw new RequestError(404, "Not found");
  }
}
var rateLimitBuckets = /* @__PURE__ */ new Map();
function cleanupRateLimitBuckets(now = Date.now()) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}
var rateLimitBucketGcTimer = setInterval(() => {
  cleanupRateLimitBuckets();
}, RATE_LIMIT_BUCKET_GC_INTERVAL_MS);
rateLimitBucketGcTimer.unref?.();
function getRateLimitRule(pathname, method) {
  const normalizedMethod = method.toUpperCase();
  if (pathname.startsWith("/api/admin/")) {
    return { name: "admin-api", windowMs: 10 * 6e4, maxRequests: 240, keyScope: "auth" };
  }
  if (pathname === "/api/extension/cloud/save" && normalizedMethod === "POST") {
    return { name: "extension-cloud-save", windowMs: 6e4, maxRequests: 20, keyScope: "auth" };
  }
  if (pathname === "/api/public/bot/archives.zip" && normalizedMethod === "POST") {
    return { name: "scrapbook-archive-export", windowMs: 60 * 6e4, maxRequests: 12, keyScope: "session" };
  }
  if (normalizedMethod === "POST" && (pathname === "/api/public/bot/sync" || pathname === "/api/public/bot/insights/refresh" || /^\/api\/public\/bot\/watchlists\/[^/]+\/sync$/.test(pathname) || /^\/api\/public\/bot\/searches\/[^/]+\/run$/.test(pathname))) {
    return { name: "scrapbook-sync", windowMs: 10 * 6e4, maxRequests: 15, keyScope: "session" };
  }
  if (pathname === "/api/public/bot/extension/link/start" && normalizedMethod === "GET") {
    return { name: "extension-link-start", windowMs: 10 * 6e4, maxRequests: 10, keyScope: "session" };
  }
  if (pathname === "/api/extension/link/complete" && normalizedMethod === "POST") {
    return { name: "extension-link-complete", windowMs: 10 * 6e4, maxRequests: 10, keyScope: "ip" };
  }
  return null;
}
function buildRateLimitKey(request, rule) {
  if (rule.keyScope === "auth") {
    const bearerToken = readBearerToken(request);
    if (bearerToken) {
      return `${rule.name}:auth:${createHash5("sha256").update(bearerToken).digest("hex")}`;
    }
    const adminSession = readCookie(request.headers, ADMIN_SESSION_COOKIE);
    if (adminSession) {
      return `${rule.name}:admin:${createHash5("sha256").update(adminSession).digest("hex")}`;
    }
  }
  if (rule.keyScope === "session" || rule.keyScope === "auth") {
    const sessionToken = readCookie(request.headers, BOT_SESSION_COOKIE);
    if (sessionToken) {
      return `${rule.name}:session:${createHash5("sha256").update(sessionToken).digest("hex")}`;
    }
  }
  return `${rule.name}:ip:${readClientIp(request)}`;
}
function assertRateLimit(request, pathname, method) {
  const rule = getRateLimitRule(pathname, method);
  if (!rule) {
    return;
  }
  const now = Date.now();
  const key = buildRateLimitKey(request, rule);
  const existing = rateLimitBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + rule.windowMs
    });
    return;
  }
  if (existing.count >= rule.maxRequests) {
    throw new RequestError(429, "Too many requests. Try again soon.");
  }
  existing.count += 1;
  rateLimitBuckets.set(key, existing);
}
function shouldRedirectLegacyPublicPage(request, requestUrl) {
  const method = request.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") {
    return null;
  }
  const requestOrigin = resolveRequestOrigin(request, requestUrl);
  let requestHost;
  try {
    requestHost = new URL(requestOrigin).host.toLowerCase();
  } catch {
    return null;
  }
  if (!LEGACY_PUBLIC_HOSTS.has(requestHost) || !LEGACY_PUBLIC_PAGE_PATHS.has(requestUrl.pathname)) {
    return null;
  }
  const preferredOrigin = resolvePreferredPublicOrigin();
  if (new URL(preferredOrigin).host.toLowerCase() === requestHost) {
    return null;
  }
  return new URL(`${requestUrl.pathname}${requestUrl.search}`, preferredOrigin);
}
function resolveLandingMeta(_siteHost) {
  const botHandle = getBotPublicConfig().botHandle;
  const publicHost = resolvePreferredPublicOrigin().replace(/^https?:\/\//, "");
  return {
    title: "Threads Saver",
    description: `Threads \uC800\uC7A5\uC6A9 Chrome extension\uACFC @${botHandle} mention scrapbook\uC744 ${publicHost}\uC5D0\uC11C \uD568\uAED8 \uC81C\uACF5\uD569\uB2C8\uB2E4.`
  };
}
function parsePaymentProvider(raw) {
  if (!raw) {
    return null;
  }
  if (raw === "stableorder" || raw === "stripe" || raw === "paypal") {
    return raw;
  }
  return null;
}
function toRecord3(value) {
  if (value === null || typeof value !== "object") {
    return null;
  }
  return value;
}
function readString3(value) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
function readNestedValue(root, path4) {
  let current = root;
  for (const segment of path4) {
    if (current === null || typeof current !== "object") {
      return void 0;
    }
    if (Array.isArray(current)) {
      const index = Number.parseInt(segment, 10);
      if (Number.isNaN(index)) {
        return void 0;
      }
      return current[index];
    }
    const record = current;
    current = record[segment];
  }
  return current;
}
function pickFirst(...values) {
  for (const value of values) {
    const normalized = readString3(value);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
}
function isCompletedStatus(status) {
  if (!status) {
    return false;
  }
  const normalized = status.trim().toLowerCase();
  return normalized === "paid" || normalized === "payment_succeeded" || normalized === "succeeded" || normalized === "completed" || normalized === "complete" || normalized === "captured" || normalized === "approved";
}
function secretsMatch(signature, secret) {
  const signatureBytes = Buffer.from(signature);
  const secretBytes = Buffer.from(secret);
  return signatureBytes.length === secretBytes.length && timingSafeEqual(signatureBytes, secretBytes);
}
function verifyWebhookAuth(provider, headers) {
  const secret = trimEnv2(PROVIDER_WEBHOOK_SECRETS[provider]);
  if (!secret) {
    throw new RequestError(503, `Webhook secret is not configured for provider "${provider}".`);
  }
  const headerName = PROVIDER_WEBHOOK_HEADERS[provider];
  const signature = readHeader(headers, headerName);
  if (!signature) {
    throw new RequestError(401, "Webhook request missing signature header.");
  }
  if (!secretsMatch(signature, secret)) {
    throw new RequestError(401, "Invalid webhook signature.");
  }
}
function buildWebhookHints(provider, rawPayload) {
  const payload = toRecord3(rawPayload);
  if (!payload) {
    return {
      orderId: null,
      orderReference: null,
      email: null,
      eventId: null,
      paid: false
    };
  }
  if (provider === "stableorder") {
    const resultPayload = toRecord3(payload.result);
    const paymentStatus2 = pickFirst(
      readString3(payload.status),
      readString3(payload.payment_status),
      readString3(payload.state),
      readString3(resultPayload?.status)
    );
    const email = pickFirst(
      readString3(payload.buyer_email),
      readString3(payload.buyerEmail),
      readString3(payload.customer_email),
      readString3(payload.customerEmail),
      readString3(payload.email),
      readString3(payload.payer_email),
      readString3(payload.payerEmail)
    );
    return {
      orderId: pickFirst(
        readString3(payload.order_id),
        readString3(payload.orderId),
        readString3(payload.orderIdStr),
        readString3(payload.id)
      ),
      orderReference: pickFirst(
        readString3(payload.reference),
        readString3(payload.order_reference),
        readString3(payload.orderReference)
      ),
      email,
      eventId: pickFirst(readString3(payload.eventId), readString3(payload.event_id), readString3(payload.id)),
      paid: isCompletedStatus(paymentStatus2)
    };
  }
  const type = pickFirst(readString3(payload.type), readString3(payload.event_type));
  if (provider === "stripe") {
    const stripePayload = toRecord3(readNestedValue(payload, ["data", "object"])) ?? payload;
    const email = pickFirst(
      readString3(readNestedValue(stripePayload, ["customer_details", "email"])),
      readString3(stripePayload.customer_email),
      readString3(stripePayload.customerEmail),
      readString3(stripePayload.email),
      readString3(stripePayload.customer),
      readString3(readNestedValue(stripePayload, ["metadata", "buyer_email"])),
      readString3(readNestedValue(stripePayload, ["metadata", "email"]))
    );
    const orderId2 = pickFirst(
      readString3(readNestedValue(stripePayload, ["metadata", "threads_order_id"])),
      readString3(readNestedValue(stripePayload, ["metadata", "order_id"])),
      readString3(readNestedValue(stripePayload, ["metadata", "orderId"])),
      readString3(readNestedValue(stripePayload, ["client_reference_id"])),
      readString3(stripePayload.id)
    );
    const orderReference2 = pickFirst(readString3(readNestedValue(stripePayload, ["metadata", "order_reference"])));
    const paymentStatus2 = pickFirst(
      type,
      readString3(stripePayload.status),
      readString3(stripePayload.payment_status)
    );
    return {
      orderId: orderId2,
      orderReference: orderReference2,
      email,
      eventId: pickFirst(readString3(payload.id), readString3(readNestedValue(payload, ["data", "id"]))),
      paid: isCompletedStatus(paymentStatus2) || type !== null && type.includes("succeeded") || type !== null && type.includes("completed")
    };
  }
  const paypalPayload = toRecord3(readNestedValue(payload, ["resource"])) ?? payload;
  const paypalEmail = pickFirst(
    readString3(readNestedValue(paypalPayload, ["payer", "email_address"])),
    readString3(readNestedValue(paypalPayload, ["payer", "email"])),
    readString3(paypalPayload.payer_email),
    readString3(readNestedValue(paypalPayload, ["custom", "buyer_email"])),
    readString3(readNestedValue(payload, ["resource", "payer", "email_address"]))
  );
  const orderId = pickFirst(
    readString3(readNestedValue(payload, ["resource", "invoice_id"])),
    readString3(readNestedValue(payload, ["resource", "custom_id"])),
    readString3(readNestedValue(payload, ["resource", "id"])),
    readString3(payload.id),
    readString3(payload.invoice_id),
    readString3(payload.custom_id)
  );
  const orderReference = pickFirst(
    readString3(readNestedValue(payload, ["resource", "invoice_number"])),
    readString3(readNestedValue(payload, ["invoice_id"]))
  );
  const paymentStatus = pickFirst(
    type,
    readString3(paypalPayload.status),
    readString3(paypalPayload.state),
    readString3(readNestedValue(payload, ["resource", "status"]))
  );
  return {
    orderId,
    orderReference,
    email: paypalEmail,
    eventId: pickFirst(
      readString3(readNestedValue(payload, ["id"])),
      readString3(readNestedValue(payload, ["resource", "id"]))
    ),
    paid: isCompletedStatus(paymentStatus) || type !== null && type.includes("COMPLETED") || type !== null && type.includes("completed")
  };
}
function getProviderMethodIds(data, provider) {
  const matcher = PROVIDER_ACTION_URL_PATTERNS[provider];
  const byUrl = data.paymentMethods.filter((method) => matcher.test(method.actionUrl)).map((method) => method.id);
  if (byUrl.length > 0) {
    return byUrl;
  }
  const fallback = data.paymentMethods.find((method) => method.id === PROVIDER_METHOD_DEFAULT_IDS[provider]);
  return fallback ? [fallback.id] : [];
}
function resolveOrderForWebhook(data, provider, hints) {
  const candidateMethods = getProviderMethodIds(data, provider);
  const orderIdCandidates = [hints.orderId, hints.orderReference].map((candidate) => candidate).filter((candidate) => candidate !== null);
  const statusAllowed = /* @__PURE__ */ new Set(["pending", "payment_confirmed", "key_issued"]);
  const candidates = data.orders.filter(
    (order) => statusAllowed.has(order.status) && (candidateMethods.length === 0 || candidateMethods.includes(order.paymentMethodId))
  ).sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  if (orderIdCandidates.length > 0) {
    const exactMatch = candidates.find((order) => order.id === orderIdCandidates[0] || order.paymentReference === orderIdCandidates[0]);
    if (exactMatch) {
      return exactMatch;
    }
    if (orderIdCandidates.length > 1) {
      const exactMatch2 = candidates.find((order) => order.id === orderIdCandidates[1] || order.paymentReference === orderIdCandidates[1]);
      if (exactMatch2) {
        return exactMatch2;
      }
    }
  }
  if (!hints.email) {
    return null;
  }
  const emailMatch = candidates.filter((order) => order.buyerEmail === normalizeEmail(hints.email));
  if (emailMatch.length === 1) {
    return emailMatch[0];
  }
  if (emailMatch.length > 1) {
    return emailMatch[0];
  }
  return null;
}
function getStaticCandidates(urlPath) {
  const normalizedPath = path3.posix.normalize(decodeURIComponent(urlPath));
  if (normalizedPath.includes("..")) {
    return [];
  }
  if (normalizedPath === "/" || normalizedPath === "") {
    return ["landing/index.html", "index.html"];
  }
  if (normalizedPath === "/landing" || normalizedPath === "/landing/") {
    return ["landing/index.html"];
  }
  if (normalizedPath === "/admin" || normalizedPath === "/admin/") {
    return ["admin/index.html"];
  }
  if (normalizedPath === "/scrapbook" || normalizedPath === "/scrapbook/") {
    return ["scrapbook/index.html"];
  }
  if (normalizedPath === "/checkout" || normalizedPath === "/checkout/") {
    return ["checkout/index.html"];
  }
  const relativePath = normalizedPath.replace(/^\/+/, "");
  if (!relativePath) {
    return [];
  }
  return [relativePath];
}
function resolveStaticPath(candidate) {
  const normalized = path3.normalize(candidate);
  if (normalized.includes("..")) {
    return null;
  }
  const absolutePath = path3.resolve(__dirname, normalized);
  const basePath = path3.resolve(__dirname);
  if (!absolutePath.startsWith(`${basePath}${path3.sep}`) && absolutePath !== basePath) {
    return null;
  }
  return absolutePath;
}
async function serveStatic(request, response, pathname) {
  for (const relativePath of getStaticCandidates(pathname)) {
    const absolutePath = resolveStaticPath(relativePath);
    if (!absolutePath) {
      continue;
    }
    try {
      const extension = path3.extname(absolutePath);
      if (relativePath === "landing/index.html") {
        const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
        const siteUrl = resolvePublicOrigin(request, requestUrl);
        const siteHost = new URL(siteUrl).host;
        const landingMeta = resolveLandingMeta(siteHost);
        const initialLocale = resolveInitialLandingLocale(request, requestUrl);
        const contents2 = (await readFile3(absolutePath, "utf8")).replaceAll("__SITE_TITLE__", escapeHtml(landingMeta.title)).replaceAll("__SITE_DESCRIPTION__", escapeHtml(landingMeta.description)).replaceAll("__SITE_URL__", escapeHtml(siteUrl)).replaceAll("__SITE_HOST__", escapeHtml(siteHost)).replaceAll("__INITIAL_LOCALE__", escapeHtml(initialLocale));
        response.writeHead(200, {
          "content-type": MIME_TYPES[extension] ?? "application/octet-stream"
        });
        response.end(contents2);
        return true;
      }
      if (relativePath === "checkout/index.html") {
        const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
        const siteUrl = resolvePublicOrigin(request, requestUrl);
        const siteHost = new URL(siteUrl).host;
        const landingMeta = resolveLandingMeta(siteHost);
        const contents2 = (await readFile3(absolutePath, "utf8")).replaceAll("__SITE_TITLE__", escapeHtml(landingMeta.title)).replaceAll("__SITE_DESCRIPTION__", escapeHtml(landingMeta.description)).replaceAll("__SITE_URL__", escapeHtml(siteUrl)).replaceAll("__SITE_HOST__", escapeHtml(siteHost));
        response.writeHead(200, {
          "content-type": MIME_TYPES[extension] ?? "application/octet-stream"
        });
        response.end(contents2);
        return true;
      }
      if (relativePath === "admin/index.html") {
        const contents2 = await readFile3(absolutePath);
        response.writeHead(200, {
          "cache-control": "no-store",
          "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
          "content-type": MIME_TYPES[extension] ?? "application/octet-stream",
          "referrer-policy": "no-referrer",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY"
        });
        response.end(contents2);
        return true;
      }
      const contents = await readFile3(absolutePath);
      response.writeHead(200, {
        "content-type": MIME_TYPES[extension] ?? "application/octet-stream"
      });
      response.end(contents);
      return true;
    } catch {
    }
  }
  return false;
}
function mapPaymentMethodInput(input, existing) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name: safeText5(input.name) || existing?.name || "Unnamed method",
    summary: safeText5(input.summary) || existing?.summary || "",
    instructions: safeText5(input.instructions) || existing?.instructions || "",
    actionLabel: safeText5(input.actionLabel) || existing?.actionLabel || "Continue",
    actionUrl: safeText5(input.actionUrl) || existing?.actionUrl || "",
    enabled: typeof input.enabled === "boolean" ? input.enabled : existing?.enabled ?? true,
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : existing?.sortOrder ?? 999,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}
function buildRuntimeConfigSecretState(config) {
  return {
    databasePostgresUrlConfigured: safeText5(config.database.postgresUrl).length > 0,
    smtpPassConfigured: safeText5(config.smtp.pass).length > 0
  };
}
function redactRuntimeConfigForAdmin(config) {
  return {
    ...config,
    database: {
      ...config.database,
      postgresUrl: ""
    },
    smtp: {
      ...config.smtp,
      pass: ""
    }
  };
}
function getComparableDatabaseConfig(config) {
  if (config.backend === "postgres") {
    return {
      backend: "postgres",
      postgresUrl: config.postgresUrl.trim(),
      tableName: config.tableName.trim(),
      storeKey: config.storeKey.trim()
    };
  }
  return {
    backend: "file",
    filePath: config.filePath.trim()
  };
}
function databaseConfigRequiresRestart(savedConfig, activeConfig) {
  return JSON.stringify(getComparableDatabaseConfig(savedConfig)) !== JSON.stringify(getComparableDatabaseConfig(activeConfig));
}
function buildAdminRuntimeConfigResponse(savedConfig, activeConfig = getRuntimeConfigSnapshot()) {
  const secretState = buildRuntimeConfigSecretState(savedConfig);
  const redactedConfig = redactRuntimeConfigForAdmin(savedConfig);
  const redactedActiveConfig = redactRuntimeConfigForAdmin(activeConfig);
  return {
    config: redactedConfig,
    activeDatabase: {
      ...redactedActiveConfig.database
    },
    databaseRestartRequired: databaseConfigRequiresRestart(savedConfig.database, activeConfig.database),
    secretState
  };
}
function mergeRuntimeConfig(current, patch) {
  const nextDatabase = {
    ...current.database,
    ...patch.database ?? {}
  };
  const databaseSecretAction = patch.secretActions?.databasePostgresUrl ?? "replace";
  if (patch.database && safeText5(patch.database.postgresUrl) === "" && safeText5(current.database.postgresUrl) && databaseSecretAction !== "clear") {
    nextDatabase.postgresUrl = current.database.postgresUrl;
  }
  if (databaseSecretAction === "clear") {
    nextDatabase.postgresUrl = "";
  }
  const nextSmtp = {
    ...current.smtp,
    ...patch.smtp ?? {}
  };
  const smtpSecretAction = patch.secretActions?.smtpPass ?? "replace";
  if (patch.smtp && safeText5(patch.smtp.pass) === "" && safeText5(current.smtp.pass) && smtpSecretAction !== "clear") {
    nextSmtp.pass = current.smtp.pass;
  }
  if (smtpSecretAction === "clear") {
    nextSmtp.pass = "";
  }
  return normalizeRuntimeConfig({
    ...current,
    ...patch,
    database: nextDatabase,
    smtp: nextSmtp,
    collector: {
      ...current.collector,
      ...patch.collector ?? {}
    }
  });
}
function toPublicErrorMessage(error, fallback) {
  if (error instanceof RequestError) {
    return error.statusCode >= 500 ? fallback : error.message;
  }
  return fallback;
}
function logUnexpectedError(context, error) {
  console.error(`[threads-web] ${context}:`, error);
}
function mapStorefrontSettingsInput(input, existing) {
  const heroNotes = Array.isArray(input.heroNotes) ? input.heroNotes.map((note) => safeText5(note)).filter(Boolean) : existing.heroNotes;
  const faqs = Array.isArray(input.faqs) ? input.faqs.map((candidate, index) => ({
    id: safeText5(candidate?.id) || existing.faqs[index]?.id || crypto.randomUUID(),
    question: safeText5(candidate?.question),
    answer: safeText5(candidate?.answer)
  })).filter((candidate) => candidate.question && candidate.answer) : existing.faqs;
  return {
    productName: safeText5(input.productName) || existing.productName,
    headline: safeText5(input.headline) || existing.headline,
    subheadline: safeText5(input.subheadline) || existing.subheadline,
    priceLabel: safeText5(input.priceLabel) || existing.priceLabel,
    priceValue: safeText5(input.priceValue) || existing.priceValue,
    supportEmail: safeText5(input.supportEmail) || existing.supportEmail,
    includedUpdates: safeText5(input.includedUpdates) || existing.includedUpdates,
    heroNotes: heroNotes.length > 0 ? heroNotes : existing.heroNotes,
    faqs: faqs.length > 0 ? faqs : existing.faqs
  };
}
function appendWebhookHistory(data, provider, kind, reason, orderId, message, paymentMethodId, licenseId, eventId = null) {
  appendHistory(data, {
    kind,
    message,
    orderId,
    paymentMethodId,
    licenseId,
    webhookProvider: provider,
    webhookEventId: eventId,
    webhookReason: reason
  });
}
function parseOptionalDate(raw) {
  const text = safeText5(raw ?? "").trim();
  if (!text) {
    return null;
  }
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) {
    throw new RequestError(400, "Invalid expiry date format.");
  }
  return new Date(parsed).toISOString();
}
async function issueLicenseForOrder(data, order, provider, expiresAt) {
  if (order.status === "key_issued" && order.issuedLicenseId) {
    const existing = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
    if (!existing) {
      throw new RequestError(409, "Issued license record was not found.");
    }
    return { license: existing, emailDraft: buildDeliveryDraft(order, existing), order, issued: false };
  }
  if (order.status !== "payment_confirmed" && order.status !== "pending") {
    throw new RequestError(409, "Order must be payment_confirmed before issuing a key.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (order.status === "pending") {
    order.status = "payment_confirmed";
    order.paidAt = now;
  }
  const token = await signProLicenseToken(order.buyerEmail, expiresAt);
  const license = {
    id: crypto.randomUUID(),
    orderId: order.id,
    holderName: order.buyerName,
    holderEmail: order.buyerEmail,
    token,
    tokenPreview: buildTokenPreview(token),
    issuedAt: now,
    expiresAt,
    revokedAt: null,
    status: "active"
  };
  order.status = "key_issued";
  order.updatedAt = now;
  order.paidAt ??= now;
  order.issuedLicenseId = license.id;
  order.deliveryStatus = "ready_to_send";
  if (provider) {
    order.paymentProvider = provider;
  }
  upsertLicense(data, license);
  appendHistory(data, {
    kind: "license_issued",
    message: `Issued Pro key for ${order.buyerEmail}`,
    orderId: order.id,
    paymentMethodId: order.paymentMethodId,
    licenseId: license.id
  });
  return { license, emailDraft: buildDeliveryDraft(order, license), order, issued: true };
}
async function tryAutoSendEmail(order, license) {
  if (!isMailerConfigured()) {
    return { sent: false, error: null };
  }
  try {
    const draft = buildDeliveryDraft(order, license);
    await sendDeliveryEmail(draft);
    return { sent: true, error: null };
  } catch (error) {
    logUnexpectedError("auto email delivery failed", error);
    return { sent: false, error: "Email delivery failed." };
  }
}
async function handleCreateOrder(request, response, config) {
  const body = await parseJsonBody(request, config.maxBodyBytes);
  const buyerName = safeText5(body.buyerName);
  const buyerEmail = normalizeEmail(safeText5(body.buyerEmail));
  const paymentMethodId = safeText5(body.paymentMethodId);
  const note = safeText5(body.note);
  if (!buyerName || !buyerEmail || !paymentMethodId) {
    badRequest(response, "Name, email, and payment method are required.");
    return;
  }
  if (!isValidEmail(buyerEmail)) {
    badRequest(response, "A valid email address is required.");
    return;
  }
  const { order, paymentMethod } = await withDatabaseTransaction(async (data) => {
    const paymentMethod2 = data.paymentMethods.find((method) => method.id === paymentMethodId && method.enabled);
    if (!paymentMethod2) {
      throw new RequestError(400, "The selected payment method is not available.");
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const order2 = {
      id: crypto.randomUUID(),
      buyerName,
      buyerEmail,
      paymentMethodId,
      paymentReference: crypto.randomUUID(),
      status: "pending",
      note,
      createdAt: timestamp,
      updatedAt: timestamp,
      paidAt: null,
      issuedLicenseId: null,
      deliveryStatus: "not_sent"
    };
    upsertOrder(data, order2);
    appendHistory(data, {
      kind: "order_created",
      message: `New order request from ${buyerEmail}`,
      orderId: order2.id,
      paymentMethodId,
      licenseId: null
    });
    return { order: order2, paymentMethod: paymentMethod2 };
  });
  json(response, 201, {
    order,
    paymentMethod
  });
}
async function handlePublicLicenseRoute(request, response, pathname, config) {
  if (request.method !== "POST") {
    methodNotAllowed(response);
    return;
  }
  const body = await parseJsonBody(request, config.maxBodyBytes);
  const token = safeText5(body.token);
  const deviceId = safeText5(body.deviceId);
  const deviceLabel = safeText5(body.deviceLabel) || "Unknown device";
  if (!token || !deviceId) {
    badRequest(response, "token and deviceId are required.");
    return;
  }
  if (pathname === "/api/public/licenses/activate") {
    const result = await withDatabaseTransaction(async (data) => await activateLicenseSeat(data, token, deviceId, deviceLabel));
    json(response, result.ok ? 200 : result.reason === "seat_limit" ? 409 : 403, result);
    return;
  }
  if (pathname === "/api/public/licenses/status") {
    const result = await withDatabaseTransaction(async (data) => await getLicenseSeatStatus(data, token, deviceId, deviceLabel));
    json(response, result.ok ? 200 : result.reason === "activation_required" ? 409 : 403, result);
    return;
  }
  if (pathname === "/api/public/licenses/release") {
    const result = await withDatabaseTransaction(async (data) => await releaseLicenseSeat(data, token, deviceId));
    json(response, 200, result);
    return;
  }
  notFound(response);
}
async function handlePublicNotionRoute(request, response, pathname, config) {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const locale = resolveRequestLocale(request, requestUrl);
  const msg = tServer(locale);
  if (pathname === "/api/public/notion/oauth/callback") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const code = safeText5(requestUrl.searchParams.get("code"));
    const state = safeText5(requestUrl.searchParams.get("state"));
    const error = safeText5(requestUrl.searchParams.get("error"));
    if (error) {
      html(response, 400, renderNotionCallbackPage(locale, msg.notionFailedHeading, `${error} ${msg.notionCloseHint}`));
      return;
    }
    if (!code || !state) {
      html(response, 400, renderNotionCallbackPage(locale, msg.notionFailedHeading, `${msg.notionMissingParams} ${msg.notionCloseHint}`));
      return;
    }
    try {
      await withDatabaseTransaction(async (data) => {
        await completeNotionAuth(data, state, code, publicOrigin);
      });
      html(response, 200, renderNotionCallbackPage(locale, msg.notionConnectedHeading, msg.notionConnectedBody, true));
    } catch (oauthError) {
      html(
        response,
        400,
        renderNotionCallbackPage(
          locale,
          msg.notionFailedHeading,
          `${oauthError instanceof Error ? oauthError.message : msg.notionUnexpected} ${msg.notionCloseHint}`
        )
      );
    }
    return;
  }
  if (request.method !== "POST") {
    methodNotAllowed(response);
    return;
  }
  const body = await parseJsonBody(request, config.maxBodyBytes);
  const token = safeText5(body.token);
  const deviceId = safeText5(body.deviceId);
  const deviceLabel = safeText5(body.deviceLabel) || "Unknown device";
  if (!token || !deviceId) {
    badRequest(response, "token and deviceId are required.");
    return;
  }
  try {
    if (pathname === "/api/public/notion/oauth/start") {
      const result = await withDatabaseTransaction(async (data) => {
        await validateNotionClient(data, token, deviceId, deviceLabel);
        return await createNotionAuthStart(data, token, deviceId, deviceLabel, publicOrigin);
      });
      json(response, 200, result);
      return;
    }
    const notionContext = await withDatabaseTransaction(async (data) => {
      return await validateNotionClient(data, token, deviceId, deviceLabel);
    });
    if (pathname === "/api/public/notion/connection") {
      const result = await withDatabaseTransaction(async (data) => {
        return getNotionConnectionSummary(data, notionContext.tokenHash, notionContext.deviceId);
      });
      json(response, 200, result);
      return;
    }
    if (pathname === "/api/public/notion/disconnect") {
      const result = await withDatabaseTransaction(async (data) => {
        return disconnectNotionConnection(data, notionContext.tokenHash, notionContext.deviceId);
      });
      json(response, 200, result);
      return;
    }
    if (pathname === "/api/public/notion/locations/search") {
      const parentType = body.parentType === "data_source" ? "data_source" : "page";
      const result = await withDatabaseTransaction(async (data) => {
        return await searchNotionLocations(data, notionContext.tokenHash, notionContext.deviceId, parentType, safeText5(body.query) || "");
      });
      json(response, 200, { results: result });
      return;
    }
    if (pathname === "/api/public/notion/locations/select") {
      const parentType = body.parentType === "data_source" ? "data_source" : "page";
      const targetId = safeText5(body.targetId);
      const targetLabel = safeText5(body.targetLabel);
      const targetUrl = safeText5(body.targetUrl);
      if (!targetId || !targetLabel || !targetUrl) {
        badRequest(response, "targetId, targetLabel, and targetUrl are required.");
        return;
      }
      const result = await withDatabaseTransaction(async (data) => {
        return await selectNotionLocation(data, notionContext.tokenHash, notionContext.deviceId, parentType, targetId, targetLabel, targetUrl);
      });
      json(response, 200, result);
      return;
    }
    if (pathname === "/api/public/notion/save") {
      const locale2 = normalizeLocale(body.locale, "ko");
      const post = body.post;
      if (!post || typeof post !== "object") {
        badRequest(response, "post is required.");
        return;
      }
      const result = await withDatabaseTransaction(async (data) => {
        return await savePostThroughNotionConnection(data, notionContext.tokenHash, notionContext.deviceId, {
          locale: locale2,
          post,
          includeImages: Boolean(body.includeImages),
          uploadMedia: Boolean(body.notion?.uploadMedia),
          aiResult: body.aiResult ?? null,
          aiWarning: typeof body.aiWarning === "string" ? body.aiWarning : null
        });
      });
      json(response, 200, result);
      return;
    }
  } catch (routeError) {
    json(response, 400, {
      error: toPublicErrorMessage(routeError, "Unexpected Notion error.")
    });
    return;
  }
  notFound(response);
}
async function handlePublicBotRoute(request, response, pathname, config, collector) {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const secureCookie = publicOrigin.startsWith("https://");
  const locale = resolveRequestLocale(request, requestUrl);
  const msg = tServer(locale);
  if (pathname === "/api/public/bot/config") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    json(response, 200, getBotPublicConfig());
    return;
  }
  if (pathname === "/api/public/bot/oauth/start") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    try {
      const result = await withDatabaseTransaction((data) => startBotOauth(data, publicOrigin));
      if (requestUrl.searchParams.get("redirect") === "1") {
        response.writeHead(302, {
          location: result.authorizeUrl,
          "cache-control": "no-store"
        });
        response.end();
        return;
      }
      json(response, 200, result);
    } catch (error) {
      badRequest(response, toPublicErrorMessage(error, msg.threadsSigninStartError));
    }
    return;
  }
  if (pathname === "/api/public/bot/oauth/bridge") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    try {
      const result = await withDatabaseTransaction((data) => startBotOauth(data, publicOrigin));
      const bridgeMarkup = renderOauthBridgePage(result.authorizeUrl, result.botHandle, result.pollToken, publicOrigin, locale);
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(bridgeMarkup);
    } catch (error) {
      badRequest(response, toPublicErrorMessage(error, msg.threadsSigninStartError));
    }
    return;
  }
  if (pathname === "/api/public/bot/oauth/poll") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const rawPollToken = safeText5(requestUrl.searchParams.get("token"));
    if (!rawPollToken) {
      json(response, 400, { status: "expired" });
      return;
    }
    const pollResult = await withDatabaseTransaction((data) => pollBotOauthSession(data, rawPollToken));
    response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify(pollResult));
    return;
  }
  if (pathname === "/api/public/bot/oauth/activate") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const rawCode = safeText5(requestUrl.searchParams.get("code"));
    const redirectUrl = new URL("/scrapbook", publicOrigin);
    if (!rawCode) {
      redirectUrl.searchParams.set("authError", msg.threadsSigninCodeError);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
    const activationResult = await withDatabaseTransaction((data) => activateBotOauthSession(data, rawCode));
    if (!activationResult) {
      redirectUrl.searchParams.set("authError", msg.threadsSigninUnexpected);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
    appendSetCookie(response, buildSessionCookie(activationResult.sessionToken, secureCookie));
    redirectUrl.searchParams.set("connected", "1");
    response.writeHead(302, { location: redirectUrl.toString() });
    response.end();
    return;
  }
  if (pathname === "/api/public/bot/oauth/callback") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const providerError = safeText5(requestUrl.searchParams.get("error"));
    const providerErrorDescription = safeText5(requestUrl.searchParams.get("error_description"));
    const rawState = safeText5(requestUrl.searchParams.get("state"));
    const code = safeText5(requestUrl.searchParams.get("code"));
    const redirectUrl = new URL("/scrapbook", publicOrigin);
    if (providerError) {
      if (rawState) {
        await withDatabaseTransaction((data) => failBotOauthSession(data, rawState));
      }
      redirectUrl.searchParams.set("authError", providerErrorDescription || providerError);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
    if (!rawState || !code) {
      redirectUrl.searchParams.set("authError", msg.threadsSigninCodeError);
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
    try {
      const session = await withDatabaseTransaction((data) => completeBotOauth(data, rawState, code, publicOrigin));
      appendSetCookie(response, buildSessionCookie(session.sessionToken, secureCookie));
      redirectUrl.searchParams.set("connected", "1");
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    } catch (error) {
      await withDatabaseTransaction((data) => failBotOauthSession(data, rawState));
      redirectUrl.searchParams.set(
        "authError",
        toPublicErrorMessage(error, msg.threadsSigninUnexpected)
      );
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
  }
  if (pathname === "/api/public/bot/extension/link/start") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const linkState = safeText5(requestUrl.searchParams.get("state"));
    const redirectUrl = new URL("/scrapbook", publicOrigin);
    if (!rawSession) {
      redirectUrl.searchParams.set("authError", "Sign in to Threads Archive scrapbook first.");
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
    try {
      const link = await withDatabaseTransaction((data) => createExtensionLinkCode(data, rawSession, linkState));
      redirectUrl.searchParams.set("extensionLinked", "1");
      redirectUrl.hash = new URLSearchParams({
        state: linkState,
        code: link.code
      }).toString();
      response.writeHead(302, {
        location: redirectUrl.toString(),
        "cache-control": "no-store"
      });
      response.end();
      return;
    } catch (error) {
      redirectUrl.searchParams.set(
        "authError",
        toPublicErrorMessage(error, "Could not link the extension.")
      );
      response.writeHead(302, { location: redirectUrl.toString() });
      response.end();
      return;
    }
  }
  const archiveMatch = pathname.match(/^\/api\/public\/bot\/archive\/([^/]+)\.md$/);
  if (archiveMatch) {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    try {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      const { filename, markdownContent } = await withDatabaseTransaction(
        (data) => readBotArchiveMarkdown(data, rawSession, archiveMatch[1] ?? "")
      );
      response.writeHead(200, {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`
      });
      response.end(markdownContent);
      return;
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Unexpected archive export error.")
      });
      return;
    }
  }
  const archiveZipMatch = pathname.match(/^\/api\/public\/bot\/archive\/([^/]+)\.zip$/);
  if (archiveZipMatch) {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    try {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      const { filename, content } = await withDatabaseTransaction(
        (data) => readBotArchiveZip(data, rawSession, [archiveZipMatch[1] ?? ""])
      );
      response.writeHead(200, {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "content-length": String(content.byteLength)
      });
      response.end(content);
      return;
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Unexpected archive ZIP export error.")
      });
      return;
    }
  }
  if (pathname === "/api/public/bot/session") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const state = getBotSessionState(await loadDatabase(), rawSession);
    json(response, 200, state);
    return;
  }
  if (pathname === "/api/public/bot/cloud/save") {
    json(response, 410, {
      error: "Legacy cloud save is no longer supported. Reconnect the extension and use the current cloud save flow."
    });
    return;
  }
  if (pathname === "/api/public/bot/plus") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await readAuthenticatedScrapbookPlusState(await loadDatabase(), rawSession);
      json(response, 200, state);
    } catch {
      const state = readScrapbookPlusState(await loadDatabase(), rawSession);
      json(response, 200, state);
    }
    return;
  }
  if ((request.method ?? "GET") !== "POST") {
    const archiveDeleteMatch = pathname.match(/^\/api\/public\/bot\/archive\/([^/]+)$/);
    if ((request.method ?? "GET") === "DELETE" && archiveDeleteMatch) {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      try {
        const state = await withDatabaseTransaction(
          (data) => deleteArchive(data, rawSession, decodeURIComponent(archiveDeleteMatch[1] ?? ""))
        );
        json(response, 200, state);
      } catch (error) {
        json(response, 400, {
          error: toPublicErrorMessage(error, "Could not delete the archive.")
        });
      }
      return;
    }
    const watchlistDeleteMatch = pathname.match(/^\/api\/public\/bot\/watchlists\/([^/]+)$/);
    if ((request.method ?? "GET") === "DELETE" && watchlistDeleteMatch) {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      try {
        const state = await withDatabaseTransaction(
          (data) => deleteWatchlist(data, rawSession, decodeURIComponent(watchlistDeleteMatch[1] ?? ""))
        );
        json(response, 200, state);
      } catch (error) {
        json(response, 400, {
          error: toPublicErrorMessage(error, "Could not delete the watchlist.")
        });
      }
      return;
    }
    const searchDeleteMatch = pathname.match(/^\/api\/public\/bot\/searches\/([^/]+)$/);
    if ((request.method ?? "GET") === "DELETE" && searchDeleteMatch) {
      const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
      try {
        const state = await withDatabaseTransaction(
          (data) => deleteSearchMonitor(data, rawSession, decodeURIComponent(searchDeleteMatch[1] ?? ""))
        );
        json(response, 200, state);
      } catch (error) {
        json(response, 400, {
          error: toPublicErrorMessage(error, "Could not delete the search monitor.")
        });
      }
      return;
    }
    methodNotAllowed(response);
    return;
  }
  if (pathname === "/api/public/bot/sync") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const state = getBotSessionState(await loadDatabase(), rawSession);
    if (!state.authenticated || !state.user) {
      unauthorized(response);
      return;
    }
    try {
      await collector.syncNow("user_sync");
      const nextState = getBotSessionState(await loadDatabase(), rawSession);
      json(response, 200, nextState);
    } catch (error) {
      json(response, 502, {
        error: toPublicErrorMessage(error, "Could not sync the latest mentions.")
      });
    }
    return;
  }
  if (pathname === "/api/public/bot/logout") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    await withDatabaseTransaction((data) => {
      revokeBotSession(data, rawSession);
    });
    appendSetCookie(response, buildClearedSessionCookie(secureCookie));
    json(response, 200, { ok: true });
    return;
  }
  if (pathname === "/api/public/bot/watchlists") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody(request, config.maxBodyBytes);
    try {
      const state = await withDatabaseTransaction(
        (data) => createWatchlist(data, rawSession, {
          targetHandle: body.targetHandle ?? "",
          includeText: body.includeText ?? null,
          excludeText: body.excludeText ?? null,
          mediaTypes: body.mediaTypes ?? [],
          autoArchive: body.autoArchive ?? false,
          digestCadence: body.digestCadence ?? "off"
        })
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not save the watchlist.")
      });
    }
    return;
  }
  const watchlistSyncMatch = pathname.match(/^\/api\/public\/bot\/watchlists\/([^/]+)\/sync$/);
  if (watchlistSyncMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await withDatabaseTransaction(
        (data) => syncWatchlist(data, rawSession, decodeURIComponent(watchlistSyncMatch[1] ?? ""))
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not sync the watchlist.")
      });
    }
    return;
  }
  if (pathname === "/api/public/bot/searches") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const excludeHandles = Array.isArray(body.excludeHandles) ? body.excludeHandles : typeof body.excludeHandles === "string" ? body.excludeHandles.split(",") : [];
    try {
      const state = await withDatabaseTransaction(
        (data) => createSearchMonitor(data, rawSession, {
          query: body.query ?? "",
          authorHandle: body.authorHandle ?? null,
          excludeHandles,
          autoArchive: body.autoArchive ?? false,
          searchType: body.searchType ?? "top"
        })
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not save the keyword search.")
      });
    }
    return;
  }
  const searchRunMatch = pathname.match(/^\/api\/public\/bot\/searches\/([^/]+)\/run$/);
  if (searchRunMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await withDatabaseTransaction(
        (data) => runSearchMonitor(data, rawSession, decodeURIComponent(searchRunMatch[1] ?? ""))
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not run the keyword search.")
      });
    }
    return;
  }
  const searchArchiveMatch = pathname.match(/^\/api\/public\/bot\/search-results\/([^/]+)\/archive$/);
  if (searchArchiveMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await withDatabaseTransaction(
        (data) => archiveSearchResult(data, rawSession, decodeURIComponent(searchArchiveMatch[1] ?? ""))
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not archive the keyword search result.")
      });
    }
    return;
  }
  const searchDismissMatch = pathname.match(/^\/api\/public\/bot\/search-results\/([^/]+)\/dismiss$/);
  if (searchDismissMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await withDatabaseTransaction(
        (data) => dismissSearchResult(data, rawSession, decodeURIComponent(searchDismissMatch[1] ?? ""))
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not dismiss the keyword search result.")
      });
    }
    return;
  }
  const trackedArchiveMatch = pathname.match(/^\/api\/public\/bot\/tracked-posts\/([^/]+)\/archive$/);
  if (trackedArchiveMatch) {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await withDatabaseTransaction(
        (data) => archiveTrackedPost(data, rawSession, decodeURIComponent(trackedArchiveMatch[1] ?? ""))
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not archive the tracked post.")
      });
    }
    return;
  }
  if (pathname === "/api/public/bot/insights/refresh") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    try {
      const state = await withDatabaseTransaction((data) => refreshInsights(data, rawSession));
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not refresh insights.")
      });
    }
    return;
  }
  if (pathname === "/api/public/bot/insights/archive") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody(request, config.maxBodyBytes);
    try {
      const state = await withDatabaseTransaction(
        (data) => archiveTrackedInsightPost(data, rawSession, safeText5(body.postId))
      );
      json(response, 200, state);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not archive the insight post.")
      });
    }
    return;
  }
  if (pathname === "/api/public/bot/archives.zip") {
    const rawSession = readCookie(request.headers, BOT_SESSION_COOKIE);
    const body = await parseJsonBody(request, config.maxBodyBytes);
    try {
      const { filename, content } = await withDatabaseTransaction(
        (data) => readBotArchiveZip(data, rawSession, Array.isArray(body?.ids) ? body.ids : [])
      );
      response.writeHead(200, {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "content-length": String(content.byteLength)
      });
      response.end(content);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not build scrapbook ZIP export.")
      });
    }
    return;
  }
  if (pathname === "/api/public/bot/ingest") {
    try {
      validateBotIngestRequest(readHeader(request.headers, "authorization"));
    } catch (error) {
      json(response, 401, {
        error: toPublicErrorMessage(error, "Unauthorized bot ingest request.")
      });
      return;
    }
    const body = await parseJsonBody(request, config.maxBodyBytes);
    try {
      const result = await withDatabaseTransaction((data) => ingestBotMention(data, body));
      json(response, result.matched ? 200 : 202, result);
    } catch (error) {
      badRequest(response, toPublicErrorMessage(error, "Could not archive mention payload."));
    }
    return;
  }
  notFound(response);
}
async function handlePublicWebhook(request, response, pathname, config) {
  const providerMatch = pathname.match(/^\/api\/public\/webhooks\/([^/]+)$/);
  if (!providerMatch) {
    methodNotAllowed(response);
    return;
  }
  const provider = parsePaymentProvider(providerMatch[1]);
  if (!provider) {
    notFound(response);
    return;
  }
  if (request.method !== "POST") {
    methodNotAllowed(response);
    return;
  }
  const rawPayload = await parseJsonBody(request, config.maxBodyBytes);
  const webhookHints = buildWebhookHints(provider, rawPayload);
  try {
    verifyWebhookAuth(provider, request.headers);
  } catch (error) {
    if (error instanceof RequestError) {
      await withDatabaseTransaction(async (data) => {
        appendWebhookHistory(
          data,
          provider,
          "webhook_rejected",
          "signature_rejected",
          null,
          `Webhook signature rejected.`,
          null,
          null,
          webhookHints.eventId
        );
      });
    }
    throw error;
  }
  const result = await withDatabaseTransaction(async (data) => {
    const hints = webhookHints;
    const order = resolveOrderForWebhook(data, provider, hints);
    if (!order) {
      appendWebhookHistory(
        data,
        provider,
        "webhook_ignored",
        "order_not_found",
        null,
        `Webhook received but no matching pending/paid order found.`,
        null,
        null,
        hints.eventId
      );
      return {
        ok: false,
        status: 404,
        provider,
        paid: hints.paid,
        reason: "order_not_found",
        webhookProvider: provider,
        webhookReason: "order_not_found"
      };
    }
    if (!hints.paid) {
      appendWebhookHistory(
        data,
        provider,
        "webhook_ignored",
        "payment_not_completed",
        order.id,
        "Webhook received but payment status was not complete.",
        order.paymentMethodId,
        null,
        hints.eventId
      );
      return {
        ok: false,
        status: 200,
        provider,
        paid: false,
        reason: "payment_not_completed",
        webhookProvider: provider,
        webhookReason: "payment_not_completed",
        webhookEventId: hints.eventId
      };
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (hints.eventId && order.paymentProviderEventId === hints.eventId && order.status === "key_issued") {
      appendWebhookHistory(
        data,
        provider,
        "webhook_ignored",
        "already_processed",
        order.id,
        `Webhook duplicate ignored.`,
        order.paymentMethodId,
        order.issuedLicenseId,
        hints.eventId
      );
      return {
        ok: true,
        status: 200,
        reason: "already_processed",
        provider,
        paid: true,
        webhookReason: "already_processed",
        webhookProvider: provider,
        order: { id: order.id, status: order.status },
        license: data.licenses.find((candidate) => candidate.id === order.issuedLicenseId) ?? null
      };
    }
    order.paymentProvider = provider;
    if (hints.eventId) {
      order.paymentProviderEventId = hints.eventId;
    }
    order.updatedAt = now;
    if (order.status === "pending") {
      order.status = "payment_confirmed";
      order.paidAt = order.paidAt ?? now;
      appendHistory(data, {
        kind: "order_paid",
        message: `Payment confirmed for order ${order.id} via ${provider} webhook`,
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        licenseId: null
      });
    }
    const issued = await issueLicenseForOrder(data, order, provider, null);
    appendWebhookHistory(
      data,
      provider,
      "webhook_processed",
      issued.issued ? "issued" : "no_change",
      order.id,
      `Webhook processed, key ${issued.issued ? "issued" : "already issued"} for order.`,
      order.paymentMethodId,
      issued.license.id,
      hints.eventId
    );
    void tryAutoSendEmail(issued.order, issued.license).then(({ sent }) => {
      if (!sent) return;
      void withDatabaseTransaction(async (database) => {
        const orderToUpdate = database.orders.find((candidate) => candidate.id === order.id);
        if (orderToUpdate) {
          orderToUpdate.deliveryStatus = "sent";
        }
      });
    });
    return {
      ok: true,
      status: 200,
      reason: issued.issued ? "issued" : "already_issued",
      provider,
      paid: true,
      order: {
        id: order.id,
        status: order.status,
        paymentProviderEventId: order.paymentProviderEventId
      },
      license: issued.license
    };
  });
  if (!result.ok && result.status === 404) {
    json(response, 200, { ...result, status: "received" });
    return;
  }
  if (!result.ok && result.paid) {
    json(response, 200, { ...result, status: "received" });
    return;
  }
  json(response, result.status, { ...result, status: "ok" });
}
async function handleExtensionRoutes(request, response, pathname, config) {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const publicOrigin = resolvePublicOrigin(request, requestUrl);
  const bearerToken = readBearerToken(request);
  if (pathname === "/api/extension/link/complete") {
    if ((request.method ?? "GET") !== "POST") {
      methodNotAllowed(response);
      return;
    }
    const body = await parseJsonBody(request, config.maxBodyBytes);
    try {
      const result = await withDatabaseTransaction(
        (data) => Promise.resolve(completeExtensionLinkCode(data, safeText5(body.code), safeText5(body.state)))
      );
      json(response, 200, result);
    } catch (error) {
      json(response, 400, {
        error: toPublicErrorMessage(error, "Could not complete the cloud connection.")
      });
    }
    return;
  }
  if (pathname === "/api/extension/cloud/status") {
    if ((request.method ?? "GET") !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const status = getExtensionCloudConnectionStatus(await loadDatabase(), bearerToken);
    json(response, 200, status);
    return;
  }
  if (pathname === "/api/extension/cloud/link") {
    if ((request.method ?? "GET") !== "DELETE") {
      methodNotAllowed(response);
      return;
    }
    const status = await withDatabaseTransaction(
      (data) => Promise.resolve(revokeExtensionCloudConnection(data, bearerToken))
    );
    json(response, 200, status);
    return;
  }
  if (pathname === "/api/extension/cloud/save") {
    if ((request.method ?? "GET") !== "POST") {
      methodNotAllowed(response);
      return;
    }
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const token = safeText5(body.token);
    const deviceId = safeText5(body.deviceId);
    const deviceLabel = safeText5(body.deviceLabel);
    const post = body.post;
    if (!bearerToken) {
      json(response, 401, {
        error: "Connect the extension to Threads Archive scrapbook first."
      });
      return;
    }
    if (!token || !deviceId || !deviceLabel) {
      json(response, 403, {
        error: "A valid Pro activation is required for cloud save."
      });
      return;
    }
    if (!post || typeof post !== "object") {
      badRequest(response, "post is required.");
      return;
    }
    try {
      const result = await withDatabaseTransaction(async (data) => {
        const activation = await getLicenseSeatStatus(data, token, deviceId, deviceLabel);
        if (!activation.ok) {
          throw new RequestError(403, describeProActivationFailure(activation.reason));
        }
        return await saveCloudArchiveWithExtensionToken(
          data,
          bearerToken,
          {
            post,
            aiResult: body.aiResult ?? null,
            aiWarning: typeof body.aiWarning === "string" ? body.aiWarning : null,
            locale: normalizeLocale(body.locale, "ko")
          },
          publicOrigin
        );
      });
      json(response, 200, result);
    } catch (error) {
      const message = toPublicErrorMessage(error, "Could not save this post to cloud scrapbook.");
      const statusCode = error instanceof RequestError ? error.statusCode : /connect|expired/i.test(message) ? 401 : 400;
      json(response, statusCode, {
        error: message
      });
    }
    return;
  }
  notFound(response);
}
async function handleAdminRoutes(request, response, pathname, config, collector) {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const secureCookie = isSecureRequest(request, requestUrl);
  const method = request.method ?? "GET";
  response.setHeader("cache-control", "no-store");
  if (pathname === "/api/admin/session") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const session = readAdminSession(request, config.adminToken);
    json(response, 200, {
      authenticated: Boolean(session),
      expiresAt: session ? new Date(session.expiresAt).toISOString() : null
    });
    return;
  }
  if (pathname === "/api/admin/session/login") {
    if (method !== "POST") {
      methodNotAllowed(response);
      return;
    }
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const token = safeText5(body.token);
    if (!token || !fixedLengthSecretsMatch(token, config.adminToken)) {
      unauthorized(response);
      return;
    }
    const nextSession = createAdminSessionToken(config.adminToken);
    appendSetCookie(response, buildAdminSessionCookie(nextSession, secureCookie));
    json(response, 200, {
      authenticated: true
    });
    return;
  }
  if (pathname === "/api/admin/session/logout") {
    if (method !== "POST") {
      methodNotAllowed(response);
      return;
    }
    appendSetCookie(response, buildClearedAdminSessionCookie(secureCookie));
    json(response, 200, {
      authenticated: false
    });
    return;
  }
  if (!isAdminAuthorized(request, config.adminToken)) {
    unauthorized(response);
    return;
  }
  if (pathname === "/api/admin/bot-collector") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    json(response, 200, collector.getStatus());
    return;
  }
  if (pathname === "/api/admin/bot-collector/sync") {
    if (method !== "POST") {
      methodNotAllowed(response);
      return;
    }
    try {
      const summary = await collector.syncNow("admin");
      json(response, 200, {
        status: collector.getStatus(),
        summary
      });
    } catch (error) {
      logUnexpectedError("admin collector sync failed", error);
      json(response, 502, {
        error: toPublicErrorMessage(error, "Could not sync mentions."),
        status: collector.getStatus()
      });
    }
    return;
  }
  if (pathname === "/api/admin/runtime-config") {
    if (method === "GET") {
      const savedConfig = getPersistedRuntimeConfigSnapshot();
      const activeConfig = getRuntimeConfigSnapshot();
      json(response, 200, buildAdminRuntimeConfigResponse(savedConfig, activeConfig));
      return;
    }
    if (method === "PUT") {
      const body = await parseJsonBody(request, config.maxBodyBytes);
      const { savedConfig, activeConfig, databaseChanged } = await withExclusiveDatabaseReconfiguration(async () => {
        const currentActiveConfig = getRuntimeConfigSnapshot();
        const currentSavedConfig = getPersistedRuntimeConfigSnapshot();
        const nextSavedConfig = mergeRuntimeConfig(currentSavedConfig, body);
        const didDatabaseSettingsChange = databaseConfigRequiresRestart(nextSavedConfig.database, currentSavedConfig.database);
        const restartRequired = databaseConfigRequiresRestart(nextSavedConfig.database, currentActiveConfig.database);
        if (didDatabaseSettingsChange) {
          await testDatabaseConfig(nextSavedConfig.database);
          if (restartRequired) {
            const existingData = await loadDatabaseForConfig(currentActiveConfig.database);
            await saveDatabaseForConfig(existingData, nextSavedConfig.database);
          }
        }
        const persistedConfig = await saveRuntimeConfig(nextSavedConfig, {
          activate: !restartRequired
        });
        const nextActiveConfig = restartRequired ? activateRuntimeConfig({
          ...persistedConfig,
          database: currentActiveConfig.database
        }) : persistedConfig;
        return {
          savedConfig: persistedConfig,
          activeConfig: nextActiveConfig,
          databaseChanged: didDatabaseSettingsChange
        };
      });
      const collectorStatus = collector.reloadConfig();
      json(response, 200, {
        ...buildAdminRuntimeConfigResponse(savedConfig, activeConfig),
        migrated: databaseChanged,
        collectorStatus
      });
      return;
    }
  }
  if (pathname === "/api/admin/runtime-config/database/test" && method === "POST") {
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const candidate = mergeRuntimeConfig(getPersistedRuntimeConfigSnapshot(), {
      database: body.database ?? {}
    });
    await testDatabaseConfig(candidate.database);
    const payload = {
      ok: true,
      message: candidate.database.backend === "postgres" ? `Connected to ${candidate.database.tableName} (${candidate.database.storeKey}).` : `File backend directory is ready for ${candidate.database.filePath}.`
    };
    json(response, 200, payload);
    return;
  }
  if (pathname === "/api/admin/runtime-config/smtp/test" && method === "POST") {
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const candidate = mergeRuntimeConfig(getPersistedRuntimeConfigSnapshot(), {
      smtp: body.smtp ?? {}
    });
    await testDeliveryEmailConfig(candidate.smtp);
    const payload = {
      ok: true,
      message: `SMTP connection verified for ${candidate.smtp.host}:${candidate.smtp.port}.`
    };
    json(response, 200, payload);
    return;
  }
  if (pathname === "/api/admin/dashboard") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    const data = await loadDatabase();
    json(response, 200, {
      settings: data.settings,
      paymentMethods: [...data.paymentMethods].sort((left, right) => left.sortOrder - right.sortOrder),
      orders: data.orders,
      licenses: data.licenses,
      history: data.history,
      summary: buildDashboardSummary(data),
      revenueReport: buildRevenueReport(data),
      mailerConfigured: isMailerConfigured(),
      collectorStatus: collector.getStatus()
    });
    return;
  }
  if (pathname === "/api/admin/monitoring/overview") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    json(response, 200, await getMonitoringOverview());
    return;
  }
  if (pathname === "/api/admin/monitoring/incidents") {
    if (method !== "GET") {
      methodNotAllowed(response);
      return;
    }
    json(response, 200, await listMonitoringIncidents());
    return;
  }
  if (pathname === "/api/admin/monitoring/run-now" && method === "POST") {
    json(response, 200, await runMonitoringNow());
    return;
  }
  const acknowledgeMonitoringMatch = pathname.match(/^\/api\/admin\/monitoring\/incidents\/([^/]+)\/ack$/);
  if (acknowledgeMonitoringMatch && method === "POST") {
    json(response, 200, await acknowledgeMonitoringIncident(acknowledgeMonitoringMatch[1]));
    return;
  }
  const resolveMonitoringMatch = pathname.match(/^\/api\/admin\/monitoring\/incidents\/([^/]+)\/resolve$/);
  if (resolveMonitoringMatch && method === "POST") {
    json(response, 200, await resolveMonitoringIncident(resolveMonitoringMatch[1]));
    return;
  }
  if (pathname === "/api/admin/payment-methods" && method === "POST") {
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const paymentMethod = mapPaymentMethodInput(body);
    const created = await withDatabaseTransaction(async (data) => {
      upsertPaymentMethod(data, paymentMethod);
      appendHistory(data, {
        kind: "payment_method_created",
        message: `Created payment method ${paymentMethod.name}`,
        orderId: null,
        paymentMethodId: paymentMethod.id,
        licenseId: null
      });
      return paymentMethod;
    });
    json(response, 201, created);
    return;
  }
  if (pathname === "/api/admin/storefront-settings" && method === "PUT") {
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const updatedSettings = await withDatabaseTransaction(async (data) => {
      const nextSettings = mapStorefrontSettingsInput(body, data.settings);
      data.settings = nextSettings;
      return nextSettings;
    });
    json(response, 200, updatedSettings);
    return;
  }
  if (method !== "GET" && method !== "POST" && method !== "PUT") {
    methodNotAllowed(response);
    return;
  }
  const paymentMethodMatch = pathname.match(/^\/api\/admin\/payment-methods\/([^/]+)$/);
  if (paymentMethodMatch && method === "PUT") {
    const paymentMethodId = paymentMethodMatch[1];
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const updated = await withDatabaseTransaction(async (data) => {
      const existing = data.paymentMethods.find((candidate) => candidate.id === paymentMethodId);
      if (!existing) {
        throw new RequestError(404, "Payment method not found.");
      }
      const updatedMethod = mapPaymentMethodInput(body, existing);
      upsertPaymentMethod(data, updatedMethod);
      appendHistory(data, {
        kind: "payment_method_updated",
        message: `Updated payment method ${updatedMethod.name}`,
        orderId: null,
        paymentMethodId: updatedMethod.id,
        licenseId: null
      });
      return updatedMethod;
    });
    json(response, 200, updated);
    return;
  }
  const markPaidMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/mark-paid$/);
  if (markPaidMatch && method === "POST") {
    const orderId = markPaidMatch[1];
    const updatedOrder = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }
      if (order.status !== "pending") {
        throw new RequestError(409, "Only pending orders can be marked as paid.");
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      order.status = "payment_confirmed";
      order.paidAt = now;
      order.updatedAt = now;
      appendHistory(data, {
        kind: "order_paid",
        message: `Marked order ${order.id} as paid`,
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        licenseId: null
      });
      return order;
    });
    json(response, 200, updatedOrder);
    return;
  }
  const issueLicenseMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/issue-license$/);
  if (issueLicenseMatch && method === "POST") {
    const orderId = issueLicenseMatch[1];
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const expiresAt = parseOptionalDate(body.expiresAt);
    const result = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }
      return issueLicenseForOrder(data, order, null, expiresAt);
    });
    const { sent, error: sendError } = await tryAutoSendEmail(result.order, result.license);
    if (sent || sendError === null) {
      await withDatabaseTransaction(async (data) => {
        const order = data.orders.find((candidate) => candidate.id === orderId);
        if (order && sent) {
          order.deliveryStatus = "sent";
        }
      });
    }
    json(response, 201, { ...result, autoSent: sent, mailerError: sendError });
    return;
  }
  const reissueMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/reissue$/);
  if (reissueMatch && method === "POST") {
    const orderId = reissueMatch[1];
    const body = await parseJsonBody(request, config.maxBodyBytes);
    const expiresAt = parseOptionalDate(body.expiresAt);
    const result = await withDatabaseTransaction(async (data) => {
      const order = data.orders.find((candidate) => candidate.id === orderId);
      if (!order) {
        throw new RequestError(404, "Order not found.");
      }
      if (order.status !== "key_issued" && order.status !== "payment_confirmed") {
        throw new RequestError(409, "Order must have an existing key or confirmed payment to reissue.");
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      if (order.issuedLicenseId) {
        const existing = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
        if (existing && existing.status !== "revoked") {
          existing.status = "revoked";
          existing.revokedAt = now;
          appendHistory(data, {
            kind: "license_revoked",
            message: `Revoked Pro key for ${existing.holderEmail} (reissue)`,
            orderId: order.id,
            paymentMethodId: null,
            licenseId: existing.id
          });
        }
      }
      order.status = "payment_confirmed";
      order.issuedLicenseId = null;
      order.deliveryStatus = "not_sent";
      order.updatedAt = now;
      const token = await signProLicenseToken(order.buyerEmail, expiresAt);
      const license = {
        id: crypto.randomUUID(),
        orderId: order.id,
        holderName: order.buyerName,
        holderEmail: order.buyerEmail,
        token,
        tokenPreview: buildTokenPreview(token),
        issuedAt: now,
        expiresAt,
        revokedAt: null,
        status: "active"
      };
      order.status = "key_issued";
      order.updatedAt = now;
      order.issuedLicenseId = license.id;
      order.deliveryStatus = "ready_to_send";
      upsertLicense(data, license);
      appendHistory(data, {
        kind: "license_issued",
        message: `Reissued Pro key for ${order.buyerEmail}`,
        orderId: order.id,
        paymentMethodId: order.paymentMethodId,
        licenseId: license.id
      });
      return { license, emailDraft: buildDeliveryDraft(order, license), order };
    });
    const { sent, error: sendError } = await tryAutoSendEmail(result.order, result.license);
    if (sent) {
      await withDatabaseTransaction(async (data) => {
        const order = data.orders.find((candidate) => candidate.id === orderId);
        if (order) {
          order.deliveryStatus = "sent";
        }
      });
    }
    json(response, 200, { ...result, autoSent: sent, mailerError: sendError });
    return;
  }
  const sendEmailMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/send-email$/);
  if (sendEmailMatch && method === "POST") {
    const orderId = sendEmailMatch[1];
    const data = await loadDatabase();
    const order = data.orders.find((candidate) => candidate.id === orderId);
    if (!order || !order.issuedLicenseId) {
      notFound(response);
      return;
    }
    const license = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
    if (!license) {
      notFound(response);
      return;
    }
    const draft = buildDeliveryDraft(order, license);
    await sendDeliveryEmail(draft);
    await withDatabaseTransaction(async (database) => {
      const orderToUpdate = database.orders.find((candidate) => candidate.id === orderId);
      if (orderToUpdate) {
        orderToUpdate.deliveryStatus = "sent";
      }
    });
    json(response, 200, { sent: true, to: draft.to });
    return;
  }
  const emailPreviewMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/email-preview$/);
  if (emailPreviewMatch && method === "GET") {
    const orderId = emailPreviewMatch[1];
    const data = await loadDatabase();
    const order = data.orders.find((candidate) => candidate.id === orderId);
    if (!order || !order.issuedLicenseId) {
      notFound(response);
      return;
    }
    const license = data.licenses.find((candidate) => candidate.id === order.issuedLicenseId);
    if (!license) {
      notFound(response);
      return;
    }
    json(response, 200, buildDeliveryDraft(order, license));
    return;
  }
  const revokeLicenseMatch = pathname.match(/^\/api\/admin\/licenses\/([^/]+)\/revoke$/);
  if (revokeLicenseMatch && method === "POST") {
    const licenseId = revokeLicenseMatch[1];
    const revoked = await withDatabaseTransaction(async (data) => {
      const license = data.licenses.find((candidate) => candidate.id === licenseId);
      if (!license) {
        throw new RequestError(404, "License not found.");
      }
      if (license.status !== "revoked") {
        license.status = "revoked";
        license.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
        appendHistory(data, {
          kind: "license_revoked",
          message: `Revoked Pro key for ${license.holderEmail}`,
          orderId: license.orderId,
          paymentMethodId: null,
          licenseId: license.id
        });
      }
      return license;
    });
    json(response, 200, revoked);
    return;
  }
  notFound(response);
}
function toInternalError(error) {
  return error instanceof RequestError && error.statusCode < 500 ? error.message : "Unexpected server error";
}
function toRequestMethod(request) {
  return request.method ?? "GET";
}
async function handleRequest(request, response, config, collector) {
  let requestUrl;
  try {
    requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `127.0.0.1:${config.port}`}`);
  } catch {
    badRequest(response, "Invalid request URL.");
    return;
  }
  const pathname = requestUrl.pathname;
  const method = toRequestMethod(request);
  const legacyRedirectUrl = shouldRedirectLegacyPublicPage(request, requestUrl);
  if (legacyRedirectUrl) {
    response.writeHead(308, { location: legacyRedirectUrl.toString() });
    response.end();
    return;
  }
  try {
    const mutationOriginPolicy = getMutationOriginPolicy(pathname, method);
    if (mutationOriginPolicy.enforce) {
      assertTrustedMutationOrigin(request, requestUrl, {
        allowExtensionOrigin: mutationOriginPolicy.allowExtensionOrigin
      });
    }
    if (pathname.startsWith("/api/admin/") || pathname === "/admin" || pathname === "/admin/" || pathname.startsWith("/admin/")) {
      assertAdminOriginAllowed(request, requestUrl);
    }
    assertRateLimit(request, pathname, method);
    if (pathname.startsWith("/api/admin/")) {
      assertAdminIpAllowed(request);
    }
    if (pathname === "/health" && method === "GET") {
      json(response, 200, { status: "ok", service: "threads-to-obsidian-web" });
      return;
    }
    if (pathname === "/ready") {
      if (method !== "GET") {
        methodNotAllowed(response);
        return;
      }
      const data = await loadDatabase();
      json(response, 200, {
        status: "ready",
        service: "threads-to-obsidian-web",
        databaseLoaded: Array.isArray(data.orders) && Array.isArray(data.paymentMethods)
      });
      return;
    }
    if (pathname === "/api/public/storefront") {
      if (method !== "GET") {
        methodNotAllowed(response);
        return;
      }
      const data = await loadDatabase();
      json(response, 200, buildPublicStorefront(data));
      return;
    }
    if (pathname === "/api/public/orders") {
      if (method !== "POST") {
        methodNotAllowed(response);
        return;
      }
      await handleCreateOrder(request, response, config);
      return;
    }
    if (pathname === "/privacy" || pathname === "/terms" || pathname === "/legal/data-deletion-status" || pathname === "/api/public/threads/deauthorize" || pathname === "/api/public/threads/delete") {
      await handleMetaThreadsUtilityRoutes(request, response, pathname, config);
      return;
    }
    if (pathname.startsWith("/api/public/licenses/")) {
      await handlePublicLicenseRoute(request, response, pathname, config);
      return;
    }
    if (pathname.startsWith("/api/public/bot/")) {
      await handlePublicBotRoute(request, response, pathname, config, collector);
      return;
    }
    if (pathname.startsWith("/api/public/notion/")) {
      await handlePublicNotionRoute(request, response, pathname, config);
      return;
    }
    if (pathname.startsWith("/api/public/webhooks/")) {
      await handlePublicWebhook(request, response, pathname, config);
      return;
    }
    if (pathname.startsWith("/api/extension/")) {
      await handleExtensionRoutes(request, response, pathname, config);
      return;
    }
    if (pathname.startsWith("/api/admin/")) {
      await handleAdminRoutes(request, response, pathname, config, collector);
      return;
    }
    if (await serveStatic(request, response, pathname)) {
      return;
    }
    notFound(response);
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.statusCode >= 500) {
        logUnexpectedError("request failed", error);
      }
      json(response, error.statusCode, {
        error: error.statusCode >= 500 ? "Unexpected server error" : error.message
      });
      return;
    }
    logUnexpectedError("request failed", error);
    json(response, 500, { error: toInternalError(error) });
  }
}
function createWebRuntime(port) {
  const config = resolveConfig(port);
  const collector = createBotMentionCollector({
    runTransaction: withDatabaseTransaction
  });
  configureMonitoringService({
    getCollectorStatus: () => collector.getStatus()
  });
  return {
    config,
    collector,
    requestHandler: async (request, response) => {
      await handleRequest(request, response, config, collector);
    }
  };
}
function createWebRequestHandler(port) {
  return createWebRuntime(port).requestHandler;
}
function startWebServer(port) {
  const { config, collector, requestHandler } = createWebRuntime(port);
  const server = createServer((request, response) => {
    void requestHandler(request, response);
  });
  server.listen(config.port, () => {
    console.log(`Threads Pro web app running at http://127.0.0.1:${config.port}`);
  });
  collector.start();
  server.on("close", () => {
    collector.stop();
  });
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startWebServer();
}
export {
  createWebRequestHandler,
  startWebServer
};
