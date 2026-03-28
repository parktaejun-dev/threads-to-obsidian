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

// ../../node_modules/jszip/dist/jszip.min.js
var require_jszip_min = __commonJS({
  "../../node_modules/jszip/dist/jszip.min.js"(exports, module) {
    !(function(e) {
      if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
      else if ("function" == typeof define && define.amd) define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
      }
    })(function() {
      return (function s(a, o, h) {
        function u(r, e2) {
          if (!o[r]) {
            if (!a[r]) {
              var t2 = "function" == typeof __require && __require;
              if (!e2 && t2) return t2(r, true);
              if (l) return l(r, true);
              var n = new Error("Cannot find module '" + r + "'");
              throw n.code = "MODULE_NOT_FOUND", n;
            }
            var i = o[r] = { exports: {} };
            a[r][0].call(i.exports, function(e3) {
              var t3 = a[r][1][e3];
              return u(t3 || e3);
            }, i, i.exports, s, a, o, h);
          }
          return o[r].exports;
        }
        for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++) u(h[e]);
        return u;
      })({ 1: [function(e, t2, r) {
        "use strict";
        var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        r.encode = function(e2) {
          for (var t3, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t3 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t3 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t3 >> 2, s = (3 & t3) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
          return h.join("");
        }, r.decode = function(e2) {
          var t3, r2, n, i, s, a, o = 0, h = 0, u = "data:";
          if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
          var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t3 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t3, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
          return l;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(e, t2, r) {
        "use strict";
        var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
        function o(e2, t3, r2, n2, i2) {
          this.compressedSize = e2, this.uncompressedSize = t3, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
        }
        o.prototype = { getContentWorker: function() {
          var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t3 = this;
          return e2.on("end", function() {
            if (this.streamInfo.data_length !== t3.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), e2;
        }, getCompressedWorker: function() {
          return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, o.createWorkerFrom = function(e2, t3, r2) {
          return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t3.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t3);
        }, t2.exports = o;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t2, r) {
        "use strict";
        var n = e("./stream/GenericWorker");
        r.STORE = { magic: "\0\0", compressWorker: function() {
          return new n("STORE compression");
        }, uncompressWorker: function() {
          return new n("STORE decompression");
        } }, r.DEFLATE = e("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t2, r) {
        "use strict";
        var n = e("./utils");
        var o = (function() {
          for (var e2, t3 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t3[r2] = e2;
          }
          return t3;
        })();
        t2.exports = function(e2, t3) {
          return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? (function(e3, t4, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t4[a])];
            return -1 ^ e3;
          })(0 | t3, e2, e2.length, 0) : (function(e3, t4, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t4.charCodeAt(a))];
            return -1 ^ e3;
          })(0 | t3, e2, e2.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(e, t2, r) {
        "use strict";
        r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
      }, {}], 6: [function(e, t2, r) {
        "use strict";
        var n = null;
        n = "undefined" != typeof Promise ? Promise : e("lie"), t2.exports = { Promise: n };
      }, { lie: 37 }], 7: [function(e, t2, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
        function h(e2, t3) {
          a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t3, this.meta = {};
        }
        r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
          this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
        }, h.prototype.flush = function() {
          a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
        }, h.prototype.cleanUp = function() {
          a.prototype.cleanUp.call(this), this._pako = null;
        }, h.prototype._createPako = function() {
          this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
          var t3 = this;
          this._pako.onData = function(e2) {
            t3.push({ data: e2, meta: t3.meta });
          };
        }, r.compressWorker = function(e2) {
          return new h("Deflate", e2);
        }, r.uncompressWorker = function() {
          return new h("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t2, r) {
        "use strict";
        function A(e2, t3) {
          var r2, n2 = "";
          for (r2 = 0; r2 < t3; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
          return n2;
        }
        function n(e2, t3, r2, n2, i2, s2) {
          var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          t3 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
          var S = 0;
          t3 && (S |= 8), l || !_ && !g || (S |= 2048);
          var z = 0, C = 0;
          w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= (function(e3, t4) {
            var r3 = e3;
            return e3 || (r3 = t4 ? 16893 : 33204), (65535 & r3) << 16;
          })(h.unixPermissions, w)) : (C = 20, z |= (function(e3) {
            return 63 & (e3 || 0);
          })(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
          var E = "";
          return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
        }
        var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
        function s(e2, t3, r2, n2) {
          i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t3, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        I.inherits(s, i), s.prototype.push = function(e2) {
          var t3 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
          this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t3 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
        }, s.prototype.openedSource = function(e2) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
          var t3 = this.streamFiles && !e2.file.dir;
          if (t3) {
            var r2 = n(e2, t3, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: r2.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = true;
        }, s.prototype.closedSource = function(e2) {
          this.accumulate = false;
          var t3 = this.streamFiles && !e2.file.dir, r2 = n(e2, t3, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(r2.dirRecord), t3) this.push({ data: (function(e3) {
            return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
          })(e2), meta: { percent: 100 } });
          else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, s.prototype.flush = function() {
          for (var e2 = this.bytesWritten, t3 = 0; t3 < this.dirRecords.length; t3++) this.push({ data: this.dirRecords[t3], meta: { percent: 100 } });
          var r2 = this.bytesWritten - e2, n2 = (function(e3, t4, r3, n3, i2) {
            var s2 = I.transformTo("string", i2(n3));
            return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t4, 4) + A(r3, 4) + A(s2.length, 2) + s2;
          })(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
          this.push({ data: n2, meta: { percent: 100 } });
        }, s.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, s.prototype.registerPrevious = function(e2) {
          this._sources.push(e2);
          var t3 = this;
          return e2.on("data", function(e3) {
            t3.processChunk(e3);
          }), e2.on("end", function() {
            t3.closedSource(t3.previous.streamInfo), t3._sources.length ? t3.prepareNextSource() : t3.end();
          }), e2.on("error", function(e3) {
            t3.error(e3);
          }), this;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
        }, s.prototype.error = function(e2) {
          var t3 = this._sources;
          if (!i.prototype.error.call(this, e2)) return false;
          for (var r2 = 0; r2 < t3.length; r2++) try {
            t3[r2].error(e2);
          } catch (e3) {
          }
          return true;
        }, s.prototype.lock = function() {
          i.prototype.lock.call(this);
          for (var e2 = this._sources, t3 = 0; t3 < e2.length; t3++) e2[t3].lock();
        }, t2.exports = s;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t2, r) {
        "use strict";
        var u = e("../compressions"), n = e("./ZipFileWorker");
        r.generateWorker = function(e2, a, t3) {
          var o = new n(a.streamFiles, t3, a.platform, a.encodeFileName), h = 0;
          try {
            e2.forEach(function(e3, t4) {
              h++;
              var r2 = (function(e4, t5) {
                var r3 = e4 || t5, n3 = u[r3];
                if (!n3) throw new Error(r3 + " is not a valid compression method !");
                return n3;
              })(t4.options.compression, a.compression), n2 = t4.options.compressionOptions || a.compressionOptions || {}, i = t4.dir, s = t4.date;
              t4._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t4.comment || "", unixPermissions: t4.unixPermissions, dosPermissions: t4.dosPermissions }).pipe(o);
            }), o.entriesCount = h;
          } catch (e3) {
            o.error(e3);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t2, r) {
        "use strict";
        function n() {
          if (!(this instanceof n)) return new n();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var e2 = new n();
            for (var t3 in this) "function" != typeof this[t3] && (e2[t3] = this[t3]);
            return e2;
          };
        }
        (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t3) {
          return new n().loadAsync(e2, t3);
        }, n.external = e("./external"), t2.exports = n;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t2, r) {
        "use strict";
        var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
        function f(n2) {
          return new i.Promise(function(e2, t3) {
            var r2 = n2.decompressed.getContentWorker().pipe(new a());
            r2.on("error", function(e3) {
              t3(e3);
            }).on("end", function() {
              r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t3(new Error("Corrupted zip : CRC32 mismatch")) : e2();
            }).resume();
          });
        }
        t2.exports = function(e2, o) {
          var h = this;
          return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
            var t3 = new s(o);
            return t3.load(e3), t3;
          }).then(function(e3) {
            var t3 = [i.Promise.resolve(e3)], r2 = e3.files;
            if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t3.push(f(r2[n2]));
            return i.Promise.all(t3);
          }).then(function(e3) {
            for (var t3 = e3.shift(), r2 = t3.files, n2 = 0; n2 < r2.length; n2++) {
              var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
              h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
            }
            return t3.zipComment.length && (h.comment = t3.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t2, r) {
        "use strict";
        var n = e("../utils"), i = e("../stream/GenericWorker");
        function s(e2, t3) {
          i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t3);
        }
        n.inherits(s, i), s.prototype._bindStream = function(e2) {
          var t3 = this;
          (this._stream = e2).pause(), e2.on("data", function(e3) {
            t3.push({ data: e3, meta: { percent: 0 } });
          }).on("error", function(e3) {
            t3.isPaused ? this.generatedError = e3 : t3.error(e3);
          }).on("end", function() {
            t3.isPaused ? t3._upstreamEnded = true : t3.end();
          });
        }, s.prototype.pause = function() {
          return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
        }, t2.exports = s;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t2, r) {
        "use strict";
        var i = e("readable-stream").Readable;
        function n(e2, t3, r2) {
          i.call(this, t3), this._helper = e2;
          var n2 = this;
          e2.on("data", function(e3, t4) {
            n2.push(e3) || n2._helper.pause(), r2 && r2(t4);
          }).on("error", function(e3) {
            n2.emit("error", e3);
          }).on("end", function() {
            n2.push(null);
          });
        }
        e("../utils").inherits(n, i), n.prototype._read = function() {
          this._helper.resume();
        }, t2.exports = n;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t2, r) {
        "use strict";
        t2.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t3) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t3);
          if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
          return new Buffer(e2, t3);
        }, allocBuffer: function(e2) {
          if (Buffer.alloc) return Buffer.alloc(e2);
          var t3 = new Buffer(e2);
          return t3.fill(0), t3;
        }, isBuffer: function(e2) {
          return Buffer.isBuffer(e2);
        }, isStream: function(e2) {
          return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
        } };
      }, {}], 15: [function(e, t2, r) {
        "use strict";
        function s(e2, t3, r2) {
          var n2, i2 = u.getTypeOf(t3), s2 = u.extend(r2 || {}, f);
          s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
          var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
          r2 && void 0 !== r2.binary || (s2.binary = !a2), (t3 instanceof c && 0 === t3.uncompressedSize || s2.dir || !t3 || 0 === t3.length) && (s2.base64 = false, s2.binary = true, t3 = "", s2.compression = "STORE", i2 = "string");
          var o2 = null;
          o2 = t3 instanceof c || t3 instanceof l ? t3 : p.isNode && p.isStream(t3) ? new m(e2, t3) : u.prepareContent(e2, t3, s2.binary, s2.optimizedBinaryString, s2.base64);
          var h2 = new d(e2, o2, s2);
          this.files[e2] = h2;
        }
        var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
          "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
          var t3 = e2.lastIndexOf("/");
          return 0 < t3 ? e2.substring(0, t3) : "";
        }, g = function(e2) {
          return "/" !== e2.slice(-1) && (e2 += "/"), e2;
        }, b = function(e2, t3) {
          return t3 = void 0 !== t3 ? t3 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t3 }), this.files[e2];
        };
        function h(e2) {
          return "[object RegExp]" === Object.prototype.toString.call(e2);
        }
        var n = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(e2) {
          var t3, r2, n2;
          for (t3 in this.files) n2 = this.files[t3], (r2 = t3.slice(this.root.length, t3.length)) && t3.slice(0, this.root.length) === this.root && e2(r2, n2);
        }, filter: function(r2) {
          var n2 = [];
          return this.forEach(function(e2, t3) {
            r2(e2, t3) && n2.push(t3);
          }), n2;
        }, file: function(e2, t3, r2) {
          if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t3, r2), this;
          if (h(e2)) {
            var n2 = e2;
            return this.filter(function(e3, t4) {
              return !t4.dir && n2.test(e3);
            });
          }
          var i2 = this.files[this.root + e2];
          return i2 && !i2.dir ? i2 : null;
        }, folder: function(r2) {
          if (!r2) return this;
          if (h(r2)) return this.filter(function(e3, t4) {
            return t4.dir && r2.test(e3);
          });
          var e2 = this.root + r2, t3 = b.call(this, e2), n2 = this.clone();
          return n2.root = t3.name, n2;
        }, remove: function(r2) {
          r2 = this.root + r2;
          var e2 = this.files[r2];
          if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
          else for (var t3 = this.filter(function(e3, t4) {
            return t4.name.slice(0, r2.length) === r2;
          }), n2 = 0; n2 < t3.length; n2++) delete this.files[t3[n2].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(e2) {
          var t3, r2 = {};
          try {
            if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
            u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
            var n2 = r2.comment || this.comment || "";
            t3 = o.generateWorker(this, r2, n2);
          } catch (e3) {
            (t3 = new l("error")).error(e3);
          }
          return new a(t3, r2.type || "string", r2.mimeType);
        }, generateAsync: function(e2, t3) {
          return this.generateInternalStream(e2).accumulate(t3);
        }, generateNodeStream: function(e2, t3) {
          return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t3);
        } };
        t2.exports = n;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t2, r) {
        "use strict";
        t2.exports = e("stream");
      }, { stream: void 0 }], 17: [function(e, t2, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
          for (var t3 = 0; t3 < this.data.length; t3++) e2[t3] = 255 & e2[t3];
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data[this.zero + e2];
        }, i.prototype.lastIndexOfSignature = function(e2) {
          for (var t3 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t3 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
          return -1;
        }, i.prototype.readAndCheckSignature = function(e2) {
          var t3 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
          return t3 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
        }, i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return [];
          var t3 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t3;
        }, t2.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t2, r) {
        "use strict";
        var n = e("../utils");
        function i(e2) {
          this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
        }
        i.prototype = { checkOffset: function(e2) {
          this.checkIndex(this.index + e2);
        }, checkIndex: function(e2) {
          if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
        }, setIndex: function(e2) {
          this.checkIndex(e2), this.index = e2;
        }, skip: function(e2) {
          this.setIndex(this.index + e2);
        }, byteAt: function() {
        }, readInt: function(e2) {
          var t3, r2 = 0;
          for (this.checkOffset(e2), t3 = this.index + e2 - 1; t3 >= this.index; t3--) r2 = (r2 << 8) + this.byteAt(t3);
          return this.index += e2, r2;
        }, readString: function(e2) {
          return n.transformTo("string", this.readData(e2));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var e2 = this.readInt(4);
          return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
        } }, t2.exports = i;
      }, { "../utils": 32 }], 19: [function(e, t2, r) {
        "use strict";
        var n = e("./Uint8ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t3 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t3;
        }, t2.exports = i;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t2, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data.charCodeAt(this.zero + e2);
        }, i.prototype.lastIndexOfSignature = function(e2) {
          return this.data.lastIndexOf(e2) - this.zero;
        }, i.prototype.readAndCheckSignature = function(e2) {
          return e2 === this.readData(4);
        }, i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t3 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t3;
        }, t2.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t2, r) {
        "use strict";
        var n = e("./ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
          var t3 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t3;
        }, t2.exports = i;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t2, r) {
        "use strict";
        var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
        t2.exports = function(e2) {
          var t3 = n.getTypeOf(e2);
          return n.checkSupport(t3), "string" !== t3 || i.uint8array ? "nodebuffer" === t3 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t2, r) {
        "use strict";
        r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(e, t2, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../utils");
        function s(e2) {
          n.call(this, "ConvertWorker to " + e2), this.destType = e2;
        }
        i.inherits(s, n), s.prototype.processChunk = function(e2) {
          this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
        }, t2.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t2, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../crc32");
        function s() {
          n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
          this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
        }, t2.exports = s;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t2, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
        }
        n.inherits(s, i), s.prototype.processChunk = function(e2) {
          if (e2) {
            var t3 = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = t3 + e2.data.length;
          }
          i.prototype.processChunk.call(this, e2);
        }, t2.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t2, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataWorker");
          var t3 = this;
          this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
            t3.dataIsReady = true, t3.data = e3, t3.max = e3 && e3.length || 0, t3.type = n.getTypeOf(e3), t3.isPaused || t3._tickAndRepeat();
          }, function(e3) {
            t3.error(e3);
          });
        }
        n.inherits(s, i), s.prototype.cleanUp = function() {
          i.prototype.cleanUp.call(this), this.data = null;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
        }, s.prototype._tickAndRepeat = function() {
          this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
        }, s.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return false;
          var e2 = null, t3 = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              e2 = this.data.substring(this.index, t3);
              break;
            case "uint8array":
              e2 = this.data.subarray(this.index, t3);
              break;
            case "array":
            case "nodebuffer":
              e2 = this.data.slice(this.index, t3);
          }
          return this.index = t3, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, t2.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t2, r) {
        "use strict";
        function n(e2) {
          this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        n.prototype = { push: function(e2) {
          this.emit("data", e2);
        }, end: function() {
          if (this.isFinished) return false;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = true;
          } catch (e2) {
            this.emit("error", e2);
          }
          return true;
        }, error: function(e2) {
          return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
        }, on: function(e2, t3) {
          return this._listeners[e2].push(t3), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(e2, t3) {
          if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t3);
        }, pipe: function(e2) {
          return e2.registerPrevious(this);
        }, registerPrevious: function(e2) {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
          var t3 = this;
          return e2.on("data", function(e3) {
            t3.processChunk(e3);
          }), e2.on("end", function() {
            t3.end();
          }), e2.on("error", function(e3) {
            t3.error(e3);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
        }, resume: function() {
          if (!this.isPaused || this.isFinished) return false;
          var e2 = this.isPaused = false;
          return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
        }, flush: function() {
        }, processChunk: function(e2) {
          this.push(e2);
        }, withStreamInfo: function(e2, t3) {
          return this.extraStreamInfo[e2] = t3, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
        }, lock: function() {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = true, this.previous && this.previous.lock();
        }, toString: function() {
          var e2 = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + e2 : e2;
        } }, t2.exports = n;
      }, {}], 29: [function(e, t2, r) {
        "use strict";
        var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
        if (n.nodestream) try {
          o = e("../nodejs/NodejsStreamOutputAdapter");
        } catch (e2) {
        }
        function l(e2, o2) {
          return new a.Promise(function(t3, r2) {
            var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
            e2.on("data", function(e3, t4) {
              n2.push(e3), o2 && o2(t4);
            }).on("error", function(e3) {
              n2 = [], r2(e3);
            }).on("end", function() {
              try {
                var e3 = (function(e4, t4, r3) {
                  switch (e4) {
                    case "blob":
                      return h.newBlob(h.transformTo("arraybuffer", t4), r3);
                    case "base64":
                      return u.encode(t4);
                    default:
                      return h.transformTo(e4, t4);
                  }
                })(s2, (function(e4, t4) {
                  var r3, n3 = 0, i3 = null, s3 = 0;
                  for (r3 = 0; r3 < t4.length; r3++) s3 += t4[r3].length;
                  switch (e4) {
                    case "string":
                      return t4.join("");
                    case "array":
                      return Array.prototype.concat.apply([], t4);
                    case "uint8array":
                      for (i3 = new Uint8Array(s3), r3 = 0; r3 < t4.length; r3++) i3.set(t4[r3], n3), n3 += t4[r3].length;
                      return i3;
                    case "nodebuffer":
                      return Buffer.concat(t4);
                    default:
                      throw new Error("concat : unsupported type '" + e4 + "'");
                  }
                })(i2, n2), a2);
                t3(e3);
              } catch (e4) {
                r2(e4);
              }
              n2 = [];
            }).resume();
          });
        }
        function f(e2, t3, r2) {
          var n2 = t3;
          switch (t3) {
            case "blob":
            case "arraybuffer":
              n2 = "uint8array";
              break;
            case "base64":
              n2 = "string";
          }
          try {
            this._internalType = n2, this._outputType = t3, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
          } catch (e3) {
            this._worker = new s("error"), this._worker.error(e3);
          }
        }
        f.prototype = { accumulate: function(e2) {
          return l(this, e2);
        }, on: function(e2, t3) {
          var r2 = this;
          return "data" === e2 ? this._worker.on(e2, function(e3) {
            t3.call(r2, e3.data, e3.meta);
          }) : this._worker.on(e2, function() {
            h.delay(t3, arguments, r2);
          }), this;
        }, resume: function() {
          return h.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(e2) {
          if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
          return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
        } }, t2.exports = f;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t2, r) {
        "use strict";
        if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
        else {
          var n = new ArrayBuffer(0);
          try {
            r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
          } catch (e2) {
            try {
              var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
            } catch (e3) {
              r.blob = false;
            }
          }
        }
        try {
          r.nodestream = !!e("readable-stream").Readable;
        } catch (e2) {
          r.nodestream = false;
        }
      }, { "readable-stream": 16 }], 31: [function(e, t2, s) {
        "use strict";
        for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        u[254] = u[254] = 1;
        function a() {
          n.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function l() {
          n.call(this, "utf-8 encode");
        }
        s.utf8encode = function(e2) {
          return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : (function(e3) {
            var t3, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
            for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t3 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t3[s2++] = r2 : (r2 < 2048 ? t3[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t3[s2++] = 224 | r2 >>> 12 : (t3[s2++] = 240 | r2 >>> 18, t3[s2++] = 128 | r2 >>> 12 & 63), t3[s2++] = 128 | r2 >>> 6 & 63), t3[s2++] = 128 | 63 & r2);
            return t3;
          })(e2);
        }, s.utf8decode = function(e2) {
          return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : (function(e3) {
            var t3, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
            for (t3 = r2 = 0; t3 < s2; ) if ((n2 = e3[t3++]) < 128) a2[r2++] = n2;
            else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t3 += i2 - 1;
            else {
              for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t3 < s2; ) n2 = n2 << 6 | 63 & e3[t3++], i2--;
              1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
            }
            return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
          })(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
        }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
          var t3 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
          if (this.leftOver && this.leftOver.length) {
            if (h.uint8array) {
              var r2 = t3;
              (t3 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t3.set(r2, this.leftOver.length);
            } else t3 = this.leftOver.concat(t3);
            this.leftOver = null;
          }
          var n2 = (function(e3, t4) {
            var r3;
            for ((t4 = t4 || e3.length) > e3.length && (t4 = e3.length), r3 = t4 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
            return r3 < 0 ? t4 : 0 === r3 ? t4 : r3 + u[e3[r3]] > t4 ? r3 : t4;
          })(t3), i2 = t3;
          n2 !== t3.length && (h.uint8array ? (i2 = t3.subarray(0, n2), this.leftOver = t3.subarray(n2, t3.length)) : (i2 = t3.slice(0, n2), this.leftOver = t3.slice(n2, t3.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
        }, a.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
          this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
        }, s.Utf8EncodeWorker = l;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t2, a) {
        "use strict";
        var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
        function n(e2) {
          return e2;
        }
        function l(e2, t3) {
          for (var r2 = 0; r2 < e2.length; ++r2) t3[r2] = 255 & e2.charCodeAt(r2);
          return t3;
        }
        e("setimmediate"), a.newBlob = function(t3, r2) {
          a.checkSupport("blob");
          try {
            return new Blob([t3], { type: r2 });
          } catch (e2) {
            try {
              var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return n2.append(t3), n2.getBlob(r2);
            } catch (e3) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var i = { stringifyByChunk: function(e2, t3, r2) {
          var n2 = [], i2 = 0, s2 = e2.length;
          if (s2 <= r2) return String.fromCharCode.apply(null, e2);
          for (; i2 < s2; ) "array" === t3 || "nodebuffer" === t3 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
          return n2.join("");
        }, stringifyByChar: function(e2) {
          for (var t3 = "", r2 = 0; r2 < e2.length; r2++) t3 += String.fromCharCode(e2[r2]);
          return t3;
        }, applyCanBeUsed: { uint8array: (function() {
          try {
            return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
          } catch (e2) {
            return false;
          }
        })(), nodebuffer: (function() {
          try {
            return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
          } catch (e2) {
            return false;
          }
        })() } };
        function s(e2) {
          var t3 = 65536, r2 = a.getTypeOf(e2), n2 = true;
          if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t3; ) try {
            return i.stringifyByChunk(e2, r2, t3);
          } catch (e3) {
            t3 = Math.floor(t3 / 2);
          }
          return i.stringifyByChar(e2);
        }
        function f(e2, t3) {
          for (var r2 = 0; r2 < e2.length; r2++) t3[r2] = e2[r2];
          return t3;
        }
        a.applyFromCharCode = s;
        var c = {};
        c.string = { string: n, array: function(e2) {
          return l(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.string.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return l(e2, new Uint8Array(e2.length));
        }, nodebuffer: function(e2) {
          return l(e2, r.allocBuffer(e2.length));
        } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
          return new Uint8Array(e2).buffer;
        }, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.arraybuffer = { string: function(e2) {
          return s(new Uint8Array(e2));
        }, array: function(e2) {
          return f(new Uint8Array(e2), new Array(e2.byteLength));
        }, arraybuffer: n, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(new Uint8Array(e2));
        } }, c.uint8array = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return e2.buffer;
        }, uint8array: n, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.nodebuffer = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.nodebuffer.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return f(e2, new Uint8Array(e2.length));
        }, nodebuffer: n }, a.transformTo = function(e2, t3) {
          if (t3 = t3 || "", !e2) return t3;
          a.checkSupport(e2);
          var r2 = a.getTypeOf(t3);
          return c[r2][e2](t3);
        }, a.resolve = function(e2) {
          for (var t3 = e2.split("/"), r2 = [], n2 = 0; n2 < t3.length; n2++) {
            var i2 = t3[n2];
            "." === i2 || "" === i2 && 0 !== n2 && n2 !== t3.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
          }
          return r2.join("/");
        }, a.getTypeOf = function(e2) {
          return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, a.checkSupport = function(e2) {
          if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
          var t3, r2, n2 = "";
          for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t3 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t3.toString(16).toUpperCase();
          return n2;
        }, a.delay = function(e2, t3, r2) {
          setImmediate(function() {
            e2.apply(r2 || null, t3 || []);
          });
        }, a.inherits = function(e2, t3) {
          function r2() {
          }
          r2.prototype = t3.prototype, e2.prototype = new r2();
        }, a.extend = function() {
          var e2, t3, r2 = {};
          for (e2 = 0; e2 < arguments.length; e2++) for (t3 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t3) && void 0 === r2[t3] && (r2[t3] = arguments[e2][t3]);
          return r2;
        }, a.prepareContent = function(r2, e2, n2, i2, s2) {
          return u.Promise.resolve(e2).then(function(n3) {
            return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t3, r3) {
              var e3 = new FileReader();
              e3.onload = function(e4) {
                t3(e4.target.result);
              }, e3.onerror = function(e4) {
                r3(e4.target.error);
              }, e3.readAsArrayBuffer(n3);
            }) : n3;
          }).then(function(e3) {
            var t3 = a.getTypeOf(e3);
            return t3 ? ("arraybuffer" === t3 ? e3 = a.transformTo("uint8array", e3) : "string" === t3 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = (function(e4) {
              return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
            })(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t2, r) {
        "use strict";
        var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
        function h(e2) {
          this.files = [], this.loadOptions = e2;
        }
        h.prototype = { checkSignature: function(e2) {
          if (!this.reader.readAndCheckSignature(e2)) {
            this.reader.index -= 4;
            var t3 = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t3) + ", expected " + i.pretty(e2) + ")");
          }
        }, isSignature: function(e2, t3) {
          var r2 = this.reader.index;
          this.reader.setIndex(e2);
          var n2 = this.reader.readString(4) === t3;
          return this.reader.setIndex(r2), n2;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var e2 = this.reader.readData(this.zipCommentLength), t3 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t3, e2);
          this.zipComment = this.loadOptions.decodeFileName(r2);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var e2, t3, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t3 = this.reader.readInt(4), r2 = this.reader.readData(t3), this.zip64ExtensibleData[e2] = { id: e2, length: t3, value: r2 };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var e2, t3;
          for (e2 = 0; e2 < this.files.length; e2++) t3 = this.files[e2], this.reader.setIndex(t3.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t3.readLocalPart(this.reader), t3.handleUTF8(), t3.processAttributes();
        }, readCentralDir: function() {
          var e2;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
          if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
          if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
          this.reader.setIndex(e2);
          var t3 = e2;
          if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
            if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var r2 = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
          var n2 = t3 - r2;
          if (0 < n2) this.isSignature(t3, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
          else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
        }, prepareReader: function(e2) {
          this.reader = n(e2);
        }, load: function(e2) {
          this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, t2.exports = h;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t2, r) {
        "use strict";
        var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
        function l(e2, t3) {
          this.options = e2, this.loadOptions = t3;
        }
        l.prototype = { isEncrypted: function() {
          return 1 == (1 & this.bitFlag);
        }, useUTF8: function() {
          return 2048 == (2048 & this.bitFlag);
        }, readLocalPart: function(e2) {
          var t3, r2;
          if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if (null === (t3 = (function(e3) {
            for (var t4 in h) if (Object.prototype.hasOwnProperty.call(h, t4) && h[t4].magic === e3) return h[t4];
            return null;
          })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
          this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t3, e2.readData(this.compressedSize));
        }, readCentralPart: function(e2) {
          this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
          var t3 = e2.readInt(2);
          if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          e2.skip(t3), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var e2 = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var e2 = n(this.extraFields[1].value);
            this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
          }
        }, readExtraFields: function(e2) {
          var t3, r2, n2, i2 = e2.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t3 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t3] = { id: t3, length: r2, value: n2 };
          e2.setIndex(i2);
        }, handleUTF8: function() {
          var e2 = u.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
          else {
            var t3 = this.findExtraFieldUnicodePath();
            if (null !== t3) this.fileNameStr = t3;
            else {
              var r2 = s.transformTo(e2, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(r2);
            }
            var n2 = this.findExtraFieldUnicodeComment();
            if (null !== n2) this.fileCommentStr = n2;
            else {
              var i2 = s.transformTo(e2, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(i2);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var e2 = this.extraFields[28789];
          if (e2) {
            var t3 = n(e2.value);
            return 1 !== t3.readInt(1) ? null : a(this.fileName) !== t3.readInt(4) ? null : o.utf8decode(t3.readData(e2.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var e2 = this.extraFields[25461];
          if (e2) {
            var t3 = n(e2.value);
            return 1 !== t3.readInt(1) ? null : a(this.fileComment) !== t3.readInt(4) ? null : o.utf8decode(t3.readData(e2.length - 5));
          }
          return null;
        } }, t2.exports = l;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t2, r) {
        "use strict";
        function n(e2, t3, r2) {
          this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t3, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
        }
        var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
        n.prototype = { internalStream: function(e2) {
          var t3 = null, r2 = "string";
          try {
            if (!e2) throw new Error("No output type specified.");
            var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
            "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t3 = this._decompressWorker();
            var i2 = !this._dataBinary;
            i2 && !n2 && (t3 = t3.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t3 = t3.pipe(new a.Utf8DecodeWorker()));
          } catch (e3) {
            (t3 = new h("error")).error(e3);
          }
          return new s(t3, r2, "");
        }, async: function(e2, t3) {
          return this.internalStream(e2).accumulate(t3);
        }, nodeStream: function(e2, t3) {
          return this.internalStream(e2 || "nodebuffer").toNodejsStream(t3);
        }, _compressWorker: function(e2, t3) {
          if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
          var r2 = this._decompressWorker();
          return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t3);
        }, _decompressWorker: function() {
          return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
        } };
        for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
        t2.exports = n;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t2) {
        (function(t3) {
          "use strict";
          var r, n, e2 = t3.MutationObserver || t3.WebKitMutationObserver;
          if (e2) {
            var i = 0, s = new e2(u), a = t3.document.createTextNode("");
            s.observe(a, { characterData: true }), r = function() {
              a.data = i = ++i % 2;
            };
          } else if (t3.setImmediate || void 0 === t3.MessageChannel) r = "document" in t3 && "onreadystatechange" in t3.document.createElement("script") ? function() {
            var e3 = t3.document.createElement("script");
            e3.onreadystatechange = function() {
              u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
            }, t3.document.documentElement.appendChild(e3);
          } : function() {
            setTimeout(u, 0);
          };
          else {
            var o = new t3.MessageChannel();
            o.port1.onmessage = u, r = function() {
              o.port2.postMessage(0);
            };
          }
          var h = [];
          function u() {
            var e3, t4;
            n = true;
            for (var r2 = h.length; r2; ) {
              for (t4 = h, h = [], e3 = -1; ++e3 < r2; ) t4[e3]();
              r2 = h.length;
            }
            n = false;
          }
          l.exports = function(e3) {
            1 !== h.push(e3) || n || r();
          };
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 37: [function(e, t2, r) {
        "use strict";
        var i = e("immediate");
        function u() {
        }
        var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
        function o(e2) {
          if ("function" != typeof e2) throw new TypeError("resolver must be a function");
          this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
        }
        function h(e2, t3, r2) {
          this.promise = e2, "function" == typeof t3 && (this.onFulfilled = t3, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
        }
        function f(t3, r2, n2) {
          i(function() {
            var e2;
            try {
              e2 = r2(n2);
            } catch (e3) {
              return l.reject(t3, e3);
            }
            e2 === t3 ? l.reject(t3, new TypeError("Cannot resolve promise with itself")) : l.resolve(t3, e2);
          });
        }
        function c(e2) {
          var t3 = e2 && e2.then;
          if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t3) return function() {
            t3.apply(e2, arguments);
          };
        }
        function d(t3, e2) {
          var r2 = false;
          function n2(e3) {
            r2 || (r2 = true, l.reject(t3, e3));
          }
          function i2(e3) {
            r2 || (r2 = true, l.resolve(t3, e3));
          }
          var s2 = p(function() {
            e2(i2, n2);
          });
          "error" === s2.status && n2(s2.value);
        }
        function p(e2, t3) {
          var r2 = {};
          try {
            r2.value = e2(t3), r2.status = "success";
          } catch (e3) {
            r2.status = "error", r2.value = e3;
          }
          return r2;
        }
        (t2.exports = o).prototype.finally = function(t3) {
          if ("function" != typeof t3) return this;
          var r2 = this.constructor;
          return this.then(function(e2) {
            return r2.resolve(t3()).then(function() {
              return e2;
            });
          }, function(e2) {
            return r2.resolve(t3()).then(function() {
              throw e2;
            });
          });
        }, o.prototype.catch = function(e2) {
          return this.then(null, e2);
        }, o.prototype.then = function(e2, t3) {
          if ("function" != typeof e2 && this.state === a || "function" != typeof t3 && this.state === s) return this;
          var r2 = new this.constructor(u);
          this.state !== n ? f(r2, this.state === a ? e2 : t3, this.outcome) : this.queue.push(new h(r2, e2, t3));
          return r2;
        }, h.prototype.callFulfilled = function(e2) {
          l.resolve(this.promise, e2);
        }, h.prototype.otherCallFulfilled = function(e2) {
          f(this.promise, this.onFulfilled, e2);
        }, h.prototype.callRejected = function(e2) {
          l.reject(this.promise, e2);
        }, h.prototype.otherCallRejected = function(e2) {
          f(this.promise, this.onRejected, e2);
        }, l.resolve = function(e2, t3) {
          var r2 = p(c, t3);
          if ("error" === r2.status) return l.reject(e2, r2.value);
          var n2 = r2.value;
          if (n2) d(e2, n2);
          else {
            e2.state = a, e2.outcome = t3;
            for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t3);
          }
          return e2;
        }, l.reject = function(e2, t3) {
          e2.state = s, e2.outcome = t3;
          for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t3);
          return e2;
        }, o.resolve = function(e2) {
          if (e2 instanceof this) return e2;
          return l.resolve(new this(u), e2);
        }, o.reject = function(e2) {
          var t3 = new this(u);
          return l.reject(t3, e2);
        }, o.all = function(e2) {
          var r2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var n2 = e2.length, i2 = false;
          if (!n2) return this.resolve([]);
          var s2 = new Array(n2), a2 = 0, t3 = -1, o2 = new this(u);
          for (; ++t3 < n2; ) h2(e2[t3], t3);
          return o2;
          function h2(e3, t4) {
            r2.resolve(e3).then(function(e4) {
              s2[t4] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
            }, function(e4) {
              i2 || (i2 = true, l.reject(o2, e4));
            });
          }
        }, o.race = function(e2) {
          var t3 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var r2 = e2.length, n2 = false;
          if (!r2) return this.resolve([]);
          var i2 = -1, s2 = new this(u);
          for (; ++i2 < r2; ) a2 = e2[i2], t3.resolve(a2).then(function(e3) {
            n2 || (n2 = true, l.resolve(s2, e3));
          }, function(e3) {
            n2 || (n2 = true, l.reject(s2, e3));
          });
          var a2;
          return s2;
        };
      }, { immediate: 36 }], 38: [function(e, t2, r) {
        "use strict";
        var n = {};
        (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t2.exports = n;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t2, r) {
        "use strict";
        var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
        function p(e2) {
          if (!(this instanceof p)) return new p(e2);
          this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
          var t3 = this.options;
          t3.raw && 0 < t3.windowBits ? t3.windowBits = -t3.windowBits : t3.gzip && 0 < t3.windowBits && t3.windowBits < 16 && (t3.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
          var r2 = a.deflateInit2(this.strm, t3.level, t3.method, t3.windowBits, t3.memLevel, t3.strategy);
          if (r2 !== l) throw new Error(i[r2]);
          if (t3.header && a.deflateSetHeader(this.strm, t3.header), t3.dictionary) {
            var n2;
            if (n2 = "string" == typeof t3.dictionary ? h.string2buf(t3.dictionary) : "[object ArrayBuffer]" === u.call(t3.dictionary) ? new Uint8Array(t3.dictionary) : t3.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
            this._dict_set = true;
          }
        }
        function n(e2, t3) {
          var r2 = new p(t3);
          if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
          return r2.result;
        }
        p.prototype.push = function(e2, t3) {
          var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
          if (this.ended) return false;
          n2 = t3 === ~~t3 ? t3 : true === t3 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
          do {
            if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
            0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
          } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
          return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
        }, p.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, p.prototype.onEnd = function(e2) {
          e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t3) {
          return (t3 = t3 || {}).raw = true, n(e2, t3);
        }, r.gzip = function(e2, t3) {
          return (t3 = t3 || {}).gzip = true, n(e2, t3);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t2, r) {
        "use strict";
        var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
        function a(e2) {
          if (!(this instanceof a)) return new a(e2);
          this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
          var t3 = this.options;
          t3.raw && 0 <= t3.windowBits && t3.windowBits < 16 && (t3.windowBits = -t3.windowBits, 0 === t3.windowBits && (t3.windowBits = -15)), !(0 <= t3.windowBits && t3.windowBits < 16) || e2 && e2.windowBits || (t3.windowBits += 32), 15 < t3.windowBits && t3.windowBits < 48 && 0 == (15 & t3.windowBits) && (t3.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var r2 = c.inflateInit2(this.strm, t3.windowBits);
          if (r2 !== m.Z_OK) throw new Error(n[r2]);
          this.header = new s(), c.inflateGetHeader(this.strm, this.header);
        }
        function o(e2, t3) {
          var r2 = new a(t3);
          if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
          return r2.result;
        }
        a.prototype.push = function(e2, t3) {
          var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
          if (this.ended) return false;
          n2 = t3 === ~~t3 ? t3 : true === t3 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
          do {
            if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
            h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
          } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
          return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
        }, a.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, a.prototype.onEnd = function(e2) {
          e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t3) {
          return (t3 = t3 || {}).raw = true, o(e2, t3);
        }, r.ungzip = o;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t2, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
        r.assign = function(e2) {
          for (var t3 = Array.prototype.slice.call(arguments, 1); t3.length; ) {
            var r2 = t3.shift();
            if (r2) {
              if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
              for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
            }
          }
          return e2;
        }, r.shrinkBuf = function(e2, t3) {
          return e2.length === t3 ? e2 : e2.subarray ? e2.subarray(0, t3) : (e2.length = t3, e2);
        };
        var i = { arraySet: function(e2, t3, r2, n2, i2) {
          if (t3.subarray && e2.subarray) e2.set(t3.subarray(r2, r2 + n2), i2);
          else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t3[r2 + s2];
        }, flattenChunks: function(e2) {
          var t3, r2, n2, i2, s2, a;
          for (t3 = n2 = 0, r2 = e2.length; t3 < r2; t3++) n2 += e2[t3].length;
          for (a = new Uint8Array(n2), t3 = i2 = 0, r2 = e2.length; t3 < r2; t3++) s2 = e2[t3], a.set(s2, i2), i2 += s2.length;
          return a;
        } }, s = { arraySet: function(e2, t3, r2, n2, i2) {
          for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t3[r2 + s2];
        }, flattenChunks: function(e2) {
          return [].concat.apply([], e2);
        } };
        r.setTyped = function(e2) {
          e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
        }, r.setTyped(n);
      }, {}], 42: [function(e, t2, r) {
        "use strict";
        var h = e("./common"), i = true, s = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (e2) {
          i = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          s = false;
        }
        for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function l(e2, t3) {
          if (t3 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t3));
          for (var r2 = "", n2 = 0; n2 < t3; n2++) r2 += String.fromCharCode(e2[n2]);
          return r2;
        }
        u[254] = u[254] = 1, r.string2buf = function(e2) {
          var t3, r2, n2, i2, s2, a = e2.length, o = 0;
          for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t3 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t3[s2++] = r2 : (r2 < 2048 ? t3[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t3[s2++] = 224 | r2 >>> 12 : (t3[s2++] = 240 | r2 >>> 18, t3[s2++] = 128 | r2 >>> 12 & 63), t3[s2++] = 128 | r2 >>> 6 & 63), t3[s2++] = 128 | 63 & r2);
          return t3;
        }, r.buf2binstring = function(e2) {
          return l(e2, e2.length);
        }, r.binstring2buf = function(e2) {
          for (var t3 = new h.Buf8(e2.length), r2 = 0, n2 = t3.length; r2 < n2; r2++) t3[r2] = e2.charCodeAt(r2);
          return t3;
        }, r.buf2string = function(e2, t3) {
          var r2, n2, i2, s2, a = t3 || e2.length, o = new Array(2 * a);
          for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
          else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
          else {
            for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
            1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
          }
          return l(o, n2);
        }, r.utf8border = function(e2, t3) {
          var r2;
          for ((t3 = t3 || e2.length) > e2.length && (t3 = e2.length), r2 = t3 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
          return r2 < 0 ? t3 : 0 === r2 ? t3 : r2 + u[e2[r2]] > t3 ? r2 : t3;
        };
      }, { "./common": 41 }], 43: [function(e, t2, r) {
        "use strict";
        t2.exports = function(e2, t3, r2, n) {
          for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
            for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t3[n++] | 0) | 0, --a; ) ;
            i %= 65521, s %= 65521;
          }
          return i | s << 16 | 0;
        };
      }, {}], 44: [function(e, t2, r) {
        "use strict";
        t2.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(e, t2, r) {
        "use strict";
        var o = (function() {
          for (var e2, t3 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t3[r2] = e2;
          }
          return t3;
        })();
        t2.exports = function(e2, t3, r2, n) {
          var i = o, s = n + r2;
          e2 ^= -1;
          for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t3[a])];
          return -1 ^ e2;
        };
      }, {}], 46: [function(e, t2, r) {
        "use strict";
        var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
        function R(e2, t3) {
          return e2.msg = n[t3], t3;
        }
        function T(e2) {
          return (e2 << 1) - (4 < e2 ? 9 : 0);
        }
        function D(e2) {
          for (var t3 = e2.length; 0 <= --t3; ) e2[t3] = 0;
        }
        function F(e2) {
          var t3 = e2.state, r2 = t3.pending;
          r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t3.pending_buf, t3.pending_out, r2, e2.next_out), e2.next_out += r2, t3.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t3.pending -= r2, 0 === t3.pending && (t3.pending_out = 0));
        }
        function N(e2, t3) {
          u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t3), e2.block_start = e2.strstart, F(e2.strm);
        }
        function U(e2, t3) {
          e2.pending_buf[e2.pending++] = t3;
        }
        function P(e2, t3) {
          e2.pending_buf[e2.pending++] = t3 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t3;
        }
        function L(e2, t3) {
          var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
          do {
            if (u2[(r2 = t3) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
              s2 += 2, r2++;
              do {
              } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
              if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                if (e2.match_start = t3, o2 <= (a2 = n2)) break;
                d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              }
            }
          } while ((t3 = f2[t3 & l2]) > h2 && 0 != --i2);
          return a2 <= e2.lookahead ? a2 : e2.lookahead;
        }
        function j(e2) {
          var t3, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
          do {
            if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
              for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t3 = r2 = e2.hash_size; n2 = e2.head[--t3], e2.head[t3] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              for (t3 = r2 = f2; n2 = e2.prev[--t3], e2.prev[t3] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              i2 += f2;
            }
            if (0 === e2.strm.avail_in) break;
            if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
          } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
        }
        function Z(e2, t3) {
          for (var r2, n2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t3 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
              for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
              e2.strstart++;
            } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
            else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
            if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t3 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function W(e2, t3) {
          for (var r2, n2, i2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t3 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
              for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
              if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            } else if (e2.match_available) {
              if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
            } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
          }
          return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t3 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function M(e2, t3, r2, n2, i2) {
          this.good_length = e2, this.max_lazy = t3, this.nice_length = r2, this.max_chain = n2, this.func = i2;
        }
        function H() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function G(e2) {
          var t3;
          return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t3 = e2.state).pending = 0, t3.pending_out = 0, t3.wrap < 0 && (t3.wrap = -t3.wrap), t3.status = t3.wrap ? C : E, e2.adler = 2 === t3.wrap ? 0 : 1, t3.last_flush = l, u._tr_init(t3), m) : R(e2, _);
        }
        function K(e2) {
          var t3 = G(e2);
          return t3 === m && (function(e3) {
            e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
          })(e2.state), t3;
        }
        function Y(e2, t3, r2, n2, i2, s2) {
          if (!e2) return _;
          var a2 = 1;
          if (t3 === g && (t3 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t3 < 0 || 9 < t3 || s2 < 0 || b < s2) return R(e2, _);
          8 === n2 && (n2 = 9);
          var o2 = new H();
          return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t3, o2.strategy = s2, o2.method = r2, K(e2);
        }
        h = [new M(0, 0, 0, 0, function(e2, t3) {
          var r2 = 65535;
          for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
            if (e2.lookahead <= 1) {
              if (j(e2), 0 === e2.lookahead && t3 === l) return A;
              if (0 === e2.lookahead) break;
            }
            e2.strstart += e2.lookahead, e2.lookahead = 0;
            var n2 = e2.block_start + r2;
            if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
            if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = 0, t3 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
        }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t3) {
          return Y(e2, t3, v, 15, 8, 0);
        }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t3) {
          return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t3, m) : _;
        }, r.deflate = function(e2, t3) {
          var r2, n2, i2, s2;
          if (!e2 || !e2.state || 5 < t3 || t3 < 0) return e2 ? R(e2, _) : _;
          if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t3 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
          if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t3, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
          else {
            var a2 = v + (n2.w_bits - 8 << 4) << 8;
            a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
          }
          if (69 === n2.status) if (n2.gzhead.extra) {
            for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
          } else n2.status = 73;
          if (73 === n2.status) if (n2.gzhead.name) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
          } else n2.status = 91;
          if (91 === n2.status) if (n2.gzhead.comment) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
          } else n2.status = 103;
          if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
            if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
          } else if (0 === e2.avail_in && T(t3) <= T(r2) && t3 !== f) return R(e2, -5);
          if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
          if (0 !== e2.avail_in || 0 !== n2.lookahead || t3 !== l && 666 !== n2.status) {
            var o2 = 2 === n2.strategy ? (function(e3, t4) {
              for (var r3; ; ) {
                if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                  if (t4 === l) return A;
                  break;
                }
                if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t4 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t3) : 3 === n2.strategy ? (function(e3, t4) {
              for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                if (e3.lookahead <= S) {
                  if (j(e3), e3.lookahead <= S && t4 === l) return A;
                  if (0 === e3.lookahead) break;
                }
                if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                  s3 = e3.strstart + S;
                  do {
                  } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                  e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                }
                if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t4 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t3) : h[n2.level].func(n2, t3);
            if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
            if (o2 === I && (1 === t3 ? u._tr_align(n2) : 5 !== t3 && (u._tr_stored_block(n2, 0, 0, false), 3 === t3 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
          }
          return t3 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
        }, r.deflateEnd = function(e2) {
          var t3;
          return e2 && e2.state ? (t3 = e2.state.status) !== C && 69 !== t3 && 73 !== t3 && 91 !== t3 && 103 !== t3 && t3 !== E && 666 !== t3 ? R(e2, _) : (e2.state = null, t3 === E ? R(e2, -3) : m) : _;
        }, r.deflateSetDictionary = function(e2, t3) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t3.length;
          if (!e2 || !e2.state) return _;
          if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
          for (1 === s2 && (e2.adler = d(e2.adler, t3, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t3, l2 - r2.w_size, r2.w_size, 0), t3 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t3, j(r2); r2.lookahead >= x; ) {
            for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
            r2.strstart = n2, r2.lookahead = x - 1, j(r2);
          }
          return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
        }, r.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t2, r) {
        "use strict";
        t2.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
      }, {}], 48: [function(e, t2, r) {
        "use strict";
        t2.exports = function(e2, t3) {
          var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
          r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t3 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
          e: do {
            p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
            t: for (; ; ) {
              if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
              else {
                if (!(16 & y)) {
                  if (0 == (64 & y)) {
                    v = m[(65535 & v) + (d & (1 << y) - 1)];
                    continue t;
                  }
                  if (32 & y) {
                    r2.mode = 12;
                    break e;
                  }
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break e;
                }
                w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                r: for (; ; ) {
                  if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                    if (0 == (64 & y)) {
                      v = _[(65535 & v) + (d & (1 << y) - 1)];
                      continue r;
                    }
                    e2.msg = "invalid distance code", r2.mode = 30;
                    break e;
                  }
                  if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break e;
                  }
                  if (d >>>= y, p -= y, (y = s - a) < k) {
                    if (l < (y = k - y) && r2.sane) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (S = c, (x = 0) === f) {
                      if (x += u - y, y < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        x = s - k, S = C;
                      }
                    } else if (f < y) {
                      if (x += u + f - y, (y -= f) < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        if (x = 0, f < w) {
                          for (w -= y = f; C[s++] = c[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                      }
                    } else if (x += f - y, y < w) {
                      for (w -= y; C[s++] = c[x++], --y; ) ;
                      x = s - k, S = C;
                    }
                    for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                    w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                  } else {
                    for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                    w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (n < i && s < o);
          n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
        };
      }, {}], 49: [function(e, t2, r) {
        "use strict";
        var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
        function L(e2) {
          return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        }
        function s() {
          this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function a(e2) {
          var t3;
          return e2 && e2.state ? (t3 = e2.state, e2.total_in = e2.total_out = t3.total = 0, e2.msg = "", t3.wrap && (e2.adler = 1 & t3.wrap), t3.mode = P, t3.last = 0, t3.havedict = 0, t3.dmax = 32768, t3.head = null, t3.hold = 0, t3.bits = 0, t3.lencode = t3.lendyn = new I.Buf32(n), t3.distcode = t3.distdyn = new I.Buf32(i), t3.sane = 1, t3.back = -1, N) : U;
        }
        function o(e2) {
          var t3;
          return e2 && e2.state ? ((t3 = e2.state).wsize = 0, t3.whave = 0, t3.wnext = 0, a(e2)) : U;
        }
        function h(e2, t3) {
          var r2, n2;
          return e2 && e2.state ? (n2 = e2.state, t3 < 0 ? (r2 = 0, t3 = -t3) : (r2 = 1 + (t3 >> 4), t3 < 48 && (t3 &= 15)), t3 && (t3 < 8 || 15 < t3) ? U : (null !== n2.window && n2.wbits !== t3 && (n2.window = null), n2.wrap = r2, n2.wbits = t3, o(e2))) : U;
        }
        function u(e2, t3) {
          var r2, n2;
          return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t3)) !== N && (e2.state = null), r2) : U;
        }
        var l, f, c = true;
        function j(e2) {
          if (c) {
            var t3;
            for (l = new I.Buf32(512), f = new I.Buf32(32), t3 = 0; t3 < 144; ) e2.lens[t3++] = 8;
            for (; t3 < 256; ) e2.lens[t3++] = 9;
            for (; t3 < 280; ) e2.lens[t3++] = 7;
            for (; t3 < 288; ) e2.lens[t3++] = 8;
            for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t3 = 0; t3 < 32; ) e2.lens[t3++] = 5;
            T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
          }
          e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
        }
        function Z(e2, t3, r2, n2) {
          var i2, s2 = e2.state;
          return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t3, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t3, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t3, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
        }
        r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
          return u(e2, 15);
        }, r.inflateInit2 = u, r.inflate = function(e2, t3) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
          12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
          e: for (; ; ) switch (r2.mode) {
            case P:
              if (0 === r2.wrap) {
                r2.mode = 13;
                break;
              }
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (2 & r2.wrap && 35615 === u2) {
                E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                break;
              }
              if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                e2.msg = "incorrect header check", r2.mode = 30;
                break;
              }
              if (8 != (15 & u2)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
              else if (k > r2.wbits) {
                e2.msg = "invalid window size", r2.mode = 30;
                break;
              }
              r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
              break;
            case 2:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.flags = u2, 8 != (255 & r2.flags)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (57344 & r2.flags) {
                e2.msg = "unknown header flags set", r2.mode = 30;
                break;
              }
              r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
            case 3:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
            case 4:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
            case 5:
              if (1024 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
              } else r2.head && (r2.head.extra = null);
              r2.mode = 6;
            case 6:
              if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
              r2.length = 0, r2.mode = 7;
            case 7:
              if (2048 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.name = null);
              r2.length = 0, r2.mode = 8;
            case 8:
              if (4096 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.comment = null);
              r2.mode = 9;
            case 9:
              if (512 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (65535 & r2.check)) {
                  e2.msg = "header crc mismatch", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
              break;
            case 10:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
            case 11:
              if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
              e2.adler = r2.check = 1, r2.mode = 12;
            case 12:
              if (5 === t3 || 6 === t3) break e;
            case 13:
              if (r2.last) {
                u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                break;
              }
              for (; l2 < 3; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                case 0:
                  r2.mode = 14;
                  break;
                case 1:
                  if (j(r2), r2.mode = 20, 6 !== t3) break;
                  u2 >>>= 2, l2 -= 2;
                  break e;
                case 2:
                  r2.mode = 17;
                  break;
                case 3:
                  e2.msg = "invalid block type", r2.mode = 30;
              }
              u2 >>>= 2, l2 -= 2;
              break;
            case 14:
              for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                e2.msg = "invalid stored block lengths", r2.mode = 30;
                break;
              }
              if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t3) break e;
            case 15:
              r2.mode = 16;
            case 16:
              if (d = r2.length) {
                if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                break;
              }
              r2.mode = 12;
              break;
            case 17:
              for (; l2 < 14; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                e2.msg = "too many length or distance symbols", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 18;
            case 18:
              for (; r2.have < r2.ncode; ) {
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
              }
              for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
              if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid code lengths set", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 19;
            case 19:
              for (; r2.have < r2.nlen + r2.ndist; ) {
                for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                else {
                  if (16 === b) {
                    for (z = _ + 2; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                  } else if (17 === b) {
                    for (z = _ + 3; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                  } else {
                    for (z = _ + 7; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                  }
                  if (r2.have + d > r2.nlen + r2.ndist) {
                    e2.msg = "invalid bit length repeat", r2.mode = 30;
                    break;
                  }
                  for (; d--; ) r2.lens[r2.have++] = k;
                }
              }
              if (30 === r2.mode) break;
              if (0 === r2.lens[256]) {
                e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                break;
              }
              if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid literal/lengths set", r2.mode = 30;
                break;
              }
              if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                e2.msg = "invalid distances set", r2.mode = 30;
                break;
              }
              if (r2.mode = 20, 6 === t3) break e;
            case 20:
              r2.mode = 21;
            case 21:
              if (6 <= o2 && 258 <= h2) {
                e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                break;
              }
              for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (g && 0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                r2.mode = 26;
                break;
              }
              if (32 & g) {
                r2.back = -1, r2.mode = 12;
                break;
              }
              if (64 & g) {
                e2.msg = "invalid literal/length code", r2.mode = 30;
                break;
              }
              r2.extra = 15 & g, r2.mode = 22;
            case 22:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              r2.was = r2.length, r2.mode = 23;
            case 23:
              for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                e2.msg = "invalid distance code", r2.mode = 30;
                break;
              }
              r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
            case 24:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              if (r2.offset > r2.dmax) {
                e2.msg = "invalid distance too far back", r2.mode = 30;
                break;
              }
              r2.mode = 25;
            case 25:
              if (0 === h2) break e;
              if (d = c2 - h2, r2.offset > d) {
                if ((d = r2.offset - d) > r2.whave && r2.sane) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
              } else m = i2, p = a2 - r2.offset, d = r2.length;
              for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
              0 === r2.length && (r2.mode = 21);
              break;
            case 26:
              if (0 === h2) break e;
              i2[a2++] = r2.length, h2--, r2.mode = 21;
              break;
            case 27:
              if (r2.wrap) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 |= n2[s2++] << l2, l2 += 8;
                }
                if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                  e2.msg = "incorrect data check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 28;
            case 28:
              if (r2.wrap && r2.flags) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (4294967295 & r2.total)) {
                  e2.msg = "incorrect length check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 29;
            case 29:
              x = 1;
              break e;
            case 30:
              x = -3;
              break e;
            case 31:
              return -4;
            case 32:
            default:
              return U;
          }
          return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t3)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t3) && x === N && (x = -5), x);
        }, r.inflateEnd = function(e2) {
          if (!e2 || !e2.state) return U;
          var t3 = e2.state;
          return t3.window && (t3.window = null), e2.state = null, N;
        }, r.inflateGetHeader = function(e2, t3) {
          var r2;
          return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t3).done = false, N) : U;
        }, r.inflateSetDictionary = function(e2, t3) {
          var r2, n2 = t3.length;
          return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t3, n2, 0) !== r2.check ? -3 : Z(e2, t3, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
        }, r.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t2, r) {
        "use strict";
        var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        t2.exports = function(e2, t3, r2, n, i, s, a, o) {
          var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
          for (b = 0; b <= 15; b++) O[b] = 0;
          for (v = 0; v < n; v++) O[t3[r2 + v]]++;
          for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
          if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
          for (y = 1; y < w && 0 === O[y]; y++) ;
          for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
          if (0 < z && (0 === e2 || 1 !== w)) return -1;
          for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
          for (v = 0; v < n; v++) 0 !== t3[r2 + v] && (a[B[t3[r2 + v]]++] = v);
          if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
          for (; ; ) {
            for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
            for (h = 1 << b - 1; E & h; ) h >>= 1;
            if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
              if (b === w) break;
              b = t3[r2 + a[v]];
            }
            if (k < b && (E & f) !== l) {
              for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
              if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
              i[l = E & f] = k << 24 | x << 16 | c - s | 0;
            }
          }
          return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(e, t2, r) {
        "use strict";
        t2.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(e, t2, r) {
        "use strict";
        var i = e("../utils/common"), o = 0, h = 1;
        function n(e2) {
          for (var t3 = e2.length; 0 <= --t3; ) e2[t3] = 0;
        }
        var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
        n(z);
        var C = new Array(2 * f);
        n(C);
        var E = new Array(512);
        n(E);
        var A = new Array(256);
        n(A);
        var I = new Array(a);
        n(I);
        var O, B, R, T = new Array(f);
        function D(e2, t3, r2, n2, i2) {
          this.static_tree = e2, this.extra_bits = t3, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
        }
        function F(e2, t3) {
          this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t3;
        }
        function N(e2) {
          return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
        }
        function U(e2, t3) {
          e2.pending_buf[e2.pending++] = 255 & t3, e2.pending_buf[e2.pending++] = t3 >>> 8 & 255;
        }
        function P(e2, t3, r2) {
          e2.bi_valid > d - r2 ? (e2.bi_buf |= t3 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t3 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t3 << e2.bi_valid & 65535, e2.bi_valid += r2);
        }
        function L(e2, t3, r2) {
          P(e2, r2[2 * t3], r2[2 * t3 + 1]);
        }
        function j(e2, t3) {
          for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t3; ) ;
          return r2 >>> 1;
        }
        function Z(e2, t3, r2) {
          var n2, i2, s2 = new Array(g + 1), a2 = 0;
          for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
          for (i2 = 0; i2 <= t3; i2++) {
            var o2 = e2[2 * i2 + 1];
            0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
          }
        }
        function W(e2) {
          var t3;
          for (t3 = 0; t3 < l; t3++) e2.dyn_ltree[2 * t3] = 0;
          for (t3 = 0; t3 < f; t3++) e2.dyn_dtree[2 * t3] = 0;
          for (t3 = 0; t3 < c; t3++) e2.bl_tree[2 * t3] = 0;
          e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
        }
        function M(e2) {
          8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
        }
        function H(e2, t3, r2, n2) {
          var i2 = 2 * t3, s2 = 2 * r2;
          return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t3] <= n2[r2];
        }
        function G(e2, t3, r2) {
          for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t3, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t3, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
          e2.heap[r2] = n2;
        }
        function K(e2, t3, r2) {
          var n2, i2, s2, a2, o2 = 0;
          if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t3) : (L(e2, (s2 = A[i2]) + u + 1, t3), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
          L(e2, m, t3);
        }
        function Y(e2, t3) {
          var r2, n2, i2, s2 = t3.dyn_tree, a2 = t3.stat_desc.static_tree, o2 = t3.stat_desc.has_stree, h2 = t3.stat_desc.elems, u2 = -1;
          for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
          for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
          for (t3.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
          for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
          e2.heap[--e2.heap_max] = e2.heap[1], (function(e3, t4) {
            var r3, n3, i3, s3, a3, o3, h3 = t4.dyn_tree, u3 = t4.max_code, l2 = t4.stat_desc.static_tree, f2 = t4.stat_desc.has_stree, c2 = t4.stat_desc.extra_bits, d2 = t4.stat_desc.extra_base, p2 = t4.stat_desc.max_length, m2 = 0;
            for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
            for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
            if (0 !== m2) {
              do {
                for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
              } while (0 < m2);
              for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
            }
          })(e2, t3), Z(s2, u2, e2.bl_count);
        }
        function X(e2, t3, r2) {
          var n2, i2, s2 = -1, a2 = t3[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), t3[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t3[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
        }
        function V(e2, t3, r2) {
          var n2, i2, s2 = -1, a2 = t3[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t3[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
            if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
            else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
            s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
          }
        }
        n(T);
        var q = false;
        function J(e2, t3, r2, n2) {
          P(e2, (s << 1) + (n2 ? 1 : 0), 3), (function(e3, t4, r3, n3) {
            M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t4, r3, e3.pending), e3.pending += r3;
          })(e2, t3, r2, true);
        }
        r._tr_init = function(e2) {
          q || ((function() {
            var e3, t3, r2, n2, i2, s2 = new Array(g + 1);
            for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
            for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
            for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
            for (t3 = 0; t3 <= g; t3++) s2[t3] = 0;
            for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
            for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
            for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
            O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
          })(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
        }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t3, r2, n2) {
          var i2, s2, a2 = 0;
          0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = (function(e3) {
            var t4, r3 = 4093624447;
            for (t4 = 0; t4 <= 31; t4++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t4]) return o;
            if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
            for (t4 = 32; t4 < u; t4++) if (0 !== e3.dyn_ltree[2 * t4]) return h;
            return o;
          })(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = (function(e3) {
            var t4;
            for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t4 = c - 1; 3 <= t4 && 0 === e3.bl_tree[2 * S[t4] + 1]; t4--) ;
            return e3.opt_len += 3 * (t4 + 1) + 5 + 5 + 4, t4;
          })(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t3 ? J(e2, t3, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), (function(e3, t4, r3, n3) {
            var i3;
            for (P(e3, t4 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
            V(e3, e3.dyn_ltree, t4 - 1), V(e3, e3.dyn_dtree, r3 - 1);
          })(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
        }, r._tr_tally = function(e2, t3, r2) {
          return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t3 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t3, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t3 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t3--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t3)]++), e2.last_lit === e2.lit_bufsize - 1;
        }, r._tr_align = function(e2) {
          P(e2, 2, 3), L(e2, m, z), (function(e3) {
            16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
          })(e2);
        };
      }, { "../utils/common": 41 }], 53: [function(e, t2, r) {
        "use strict";
        t2.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(e, t2, r) {
        (function(e2) {
          !(function(r2, n) {
            "use strict";
            if (!r2.setImmediate) {
              var i, s, t3, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
              e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                process.nextTick(function() {
                  c(e4);
                });
              } : (function() {
                if (r2.postMessage && !r2.importScripts) {
                  var e4 = true, t4 = r2.onmessage;
                  return r2.onmessage = function() {
                    e4 = false;
                  }, r2.postMessage("", "*"), r2.onmessage = t4, e4;
                }
              })() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                r2.postMessage(a + e4, "*");
              }) : r2.MessageChannel ? ((t3 = new MessageChannel()).port1.onmessage = function(e4) {
                c(e4.data);
              }, function(e4) {
                t3.port2.postMessage(e4);
              }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                var t4 = l.createElement("script");
                t4.onreadystatechange = function() {
                  c(e4), t4.onreadystatechange = null, s.removeChild(t4), t4 = null;
                }, s.appendChild(t4);
              }) : function(e4) {
                setTimeout(c, 0, e4);
              }, e3.setImmediate = function(e4) {
                "function" != typeof e4 && (e4 = new Function("" + e4));
                for (var t4 = new Array(arguments.length - 1), r3 = 0; r3 < t4.length; r3++) t4[r3] = arguments[r3 + 1];
                var n2 = { callback: e4, args: t4 };
                return h[o] = n2, i(o), o++;
              }, e3.clearImmediate = f;
            }
            function f(e4) {
              delete h[e4];
            }
            function c(e4) {
              if (u) setTimeout(c, 0, e4);
              else {
                var t4 = h[e4];
                if (t4) {
                  u = true;
                  try {
                    !(function(e5) {
                      var t5 = e5.callback, r3 = e5.args;
                      switch (r3.length) {
                        case 0:
                          t5();
                          break;
                        case 1:
                          t5(r3[0]);
                          break;
                        case 2:
                          t5(r3[0], r3[1]);
                          break;
                        case 3:
                          t5(r3[0], r3[1], r3[2]);
                          break;
                        default:
                          t5.apply(n, r3);
                      }
                    })(t4);
                  } finally {
                    f(e4), u = false;
                  }
                }
              }
            }
            function d(e4) {
              e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
            }
          })("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}] }, {}, [10])(10);
    });
  }
});

// src/lib/config.ts
var DEFAULT_AI_ORGANIZATION_PROMPT = "Summarize the post in 1-3 sentences. Add up to 5 concise tags. Add only useful flat frontmatter fields when confident, such as topic, language, sentiment, or source_kind.";
var AI_PROVIDER_PRESETS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    apiKeyOptional: false,
    transport: "openai"
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.0-flash",
    apiKeyOptional: false,
    transport: "gemini"
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
    apiKeyOptional: true,
    transport: "openai"
  },
  custom: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKeyOptional: false,
    transport: "openai"
  }
};
function getAiProviderPreset(provider) {
  return AI_PROVIDER_PRESETS[provider];
}
var DEFAULT_AI_ORGANIZATION_SETTINGS = {
  provider: "openai",
  enabled: false,
  apiKey: "",
  baseUrl: AI_PROVIDER_PRESETS.openai.baseUrl,
  model: AI_PROVIDER_PRESETS.openai.model,
  prompt: DEFAULT_AI_ORGANIZATION_PROMPT
};
var DEFAULT_OPTIONS = {
  saveTarget: "obsidian",
  filenamePattern: "{author}_{first_sentence_20}",
  savePathPattern: "",
  includeImages: true,
  obsidianFolderLabel: null,
  notion: {
    token: "",
    parentType: "page",
    parentPageId: "",
    dataSourceId: "",
    uploadMedia: false,
    oauthConnected: false,
    workspaceId: "",
    workspaceName: "",
    workspaceIcon: "",
    selectedParentLabel: "",
    selectedParentUrl: ""
  },
  aiOrganization: DEFAULT_AI_ORGANIZATION_SETTINGS
};
var BUNDLED_EXTRACTOR_CONFIG = {
  version: "2026-03-08",
  noisePatterns: ["\uBC88\uC5ED\uD558\uAE30", "\uB354 \uBCF4\uAE30", "\uC88B\uC544\uC694", "\uB313\uAE00", "\uB9AC\uD3EC\uC2A4\uD2B8", "\uACF5\uC720\uD558\uAE30"],
  maxRecentSaves: 10
};

// ../shared/src/locale.ts
var SUPPORTED_LOCALES = ["ko", "en", "ja", "pt-BR", "es", "zh-TW", "vi"];
var SUPPORTED_LOCALE_SET = new Set(SUPPORTED_LOCALES);
function isSupportedLocale(value) {
  return typeof value === "string" && SUPPORTED_LOCALE_SET.has(value);
}
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

// src/lib/i18n.ts
var LOCALE_KEY = "app-locale";
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
  popupSubtitleCloud: "Threads Archive scrapbook \uD074\uB77C\uC6B0\uB4DC\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4. \uBA3C\uC800 \uC6F9\uC5D0\uC11C \uB85C\uADF8\uC778\uB418\uC5B4 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4.",
  popupRecentSaves: "\uCD5C\uADFC \uC800\uC7A5",
  popupClearAll: "\uC804\uCCB4 \uC0AD\uC81C",
  popupEmpty: "\uC544\uC9C1 \uC800\uC7A5\uD55C \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  popupResave: "\uB2E4\uC2DC \uC800\uC7A5",
  popupExpand: "\uD3BC\uCE58\uAE30",
  popupCollapse: "\uC811\uAE30",
  popupDelete: "\uC0AD\uC81C",
  popupOpenRemote: "\uC6D0\uACA9 \uC5F4\uAE30",
  popupCloudConnect: "Cloud \uC5F0\uACB0",
  popupCloudDisconnect: "Cloud \uC5F0\uACB0 \uD574\uC81C",
  statusReady: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uC5D0\uC11C \uC800\uC7A5\uD560 \uC900\uBE44\uAC00 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  statusReadyDirect: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uC5F0\uACB0\uB41C Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusReadyDownload: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD569\uB2C8\uB2E4.",
  statusReadyCloud: "\uC900\uBE44 \uC644\uB8CC. \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 Threads Archive scrapbook \uD074\uB77C\uC6B0\uB4DC\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4.",
  statusUnsupported: "\uAC1C\uBCC4 \uD3EC\uC2A4\uD2B8 \uD398\uC774\uC9C0\uB97C \uBA3C\uC800 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  statusNoTab: "\uD65C\uC131 \uD0ED\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusSaving: "\uC800\uC7A5\uD558\uB294 \uC911\u2026",
  statusSavedDirect: "Obsidian \uD3F4\uB354\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedZip: "\uC800\uC7A5 \uC644\uB8CC. \uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedNotion: "Notion\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusSavedCloud: "Threads Archive scrapbook\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicate: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusDuplicateWarning: "\uC774\uBBF8 \uC800\uC7A5\uD55C \uAE00\uC774\uC9C0\uB9CC \uCD5C\uC2E0 \uB0B4\uC6A9\uC73C\uB85C \uB36E\uC5B4\uC368 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: ",
  statusAlreadySaved: "\uC774\uBBF8 \uC800\uC7A5\uB41C \uAE00\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC800\uC7A5\uD558\uB824\uBA74 \uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C '\uB2E4\uC2DC \uC800\uC7A5'\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694.",
  statusNotionSetupRequired: "Notion \uC800\uC7A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uC124\uC815\uC5D0\uC11C \uD1A0\uD070\uACFC \uC800\uC7A5 \uB300\uC0C1\uC744 \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
  statusError: "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusResaving: "\uD30C\uC77C\uC744 \uB2E4\uC2DC \uB9CC\uB4DC\uB294 \uC911\u2026",
  statusResaved: "\uB2E4\uC6B4\uB85C\uB4DC\uB97C \uB2E4\uC2DC \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
  statusResavedNotion: "Notion\uC5D0 \uC0C8 \uD398\uC774\uC9C0\uB85C \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusResavedCloud: "Threads Archive scrapbook\uC5D0 \uB2E4\uC2DC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
  statusCloudLoginRequired: "Cloud \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 threads-archive.dahanda.dev/scrapbook \uC5D0 \uBA3C\uC800 \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.",
  statusCloudConnectRequired: "Cloud \uC800\uC7A5\uC744 \uC4F0\uB824\uBA74 extension\uC744 Threads Archive scrapbook\uC5D0 \uBA3C\uC800 \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  statusCloudSessionExpired: "Cloud \uC5F0\uACB0\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. extension\uC744 \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  statusCloudOffline: "Cloud \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB124\uD2B8\uC6CC\uD06C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  statusCloudConnected: "Threads Archive Cloud \uC5F0\uACB0\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  statusCloudDisconnected: "Threads Archive Cloud \uC5F0\uACB0\uC744 \uD574\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusCloudLinkStarting: "\uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C Threads Archive scrapbook \uC5F0\uACB0\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.",
  statusRecentNotFound: "\uCD5C\uADFC \uC800\uC7A5 \uAE30\uB85D\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusDeletedRecent: "\uCD5C\uADFC \uC800\uC7A5\uC5D0\uC11C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusClearedRecents: "\uCD5C\uADFC \uC800\uC7A5\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
  statusExtractFailed: "\uAE00 \uB0B4\uC6A9\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusTabError: "\uD604\uC7AC \uD0ED \uC815\uBCF4\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  statusRedownloadError: "\uB2E4\uC2DC \uB2E4\uC6B4\uB85C\uB4DC\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  statusRetry: "\uB2E4\uC2DC \uC2DC\uB3C4",
  statusResaveButton: "\uB2E4\uC2DC \uC800\uC7A5",
  optionsTitle: "Threads \uAE00\uC744 Obsidian, Threads Archive Cloud, Notion\uC5D0 \uC800\uC7A5\uD558\uACE0 \uADDC\uCE59\uACFC AI\uB85C \uC815\uB9AC\uD558\uC138\uC694.",
  optionsTitleObsidianOnly: "Threads \uAE00\uC744 Obsidian \uB610\uB294 Threads Archive Cloud\uC5D0 \uC800\uC7A5\uD558\uACE0 \uADDC\uCE59\uACFC AI\uB85C \uC815\uB9AC\uD558\uC138\uC694.",
  optionsSubtitle: "\uBB34\uB8CC \uC800\uC7A5, \uD544\uC694\uD560 \uB54C\uB9CC Pro.",
  optionsSubtitleObsidianOnly: "\uD604\uC7AC UI\uC5D0\uC11C\uB294 Obsidian\uACFC Cloud \uC800\uC7A5\uC744 \uBA3C\uC800 \uC81C\uACF5\uD558\uACE0, Notion\uC740 \uB0B4\uBD80 \uC900\uBE44 \uC911\uC774\uB77C \uC228\uACA8\uC838 \uC788\uC2B5\uB2C8\uB2E4.",
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
  optionsSaveTargetHint: "PC\uC5D0\uC11C\uB294 Obsidian, Threads Archive Cloud, Notion \uC911 \uD558\uB098\uB97C \uAE30\uBCF8 \uC800\uC7A5 \uB300\uC0C1\uC73C\uB85C \uC120\uD0DD\uD569\uB2C8\uB2E4.",
  optionsSaveTargetHintObsidianOnly: "\uD604\uC7AC UI\uC5D0\uC11C\uB294 Obsidian\uACFC Threads Archive Cloud\uB97C \uBA3C\uC800 \uC81C\uACF5\uD569\uB2C8\uB2E4. Notion\uC740 \uB0B4\uBD80 \uC900\uBE44 \uC911\uC774\uB77C \uC124\uC815 \uD654\uBA74\uC5D0\uC11C \uC228\uACA8\uC838 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetCloud: "Threads Archive Cloud",
  optionsSaveTargetNotion: "Notion",
  optionsSaveTargetNotionHidden: "Notion (\uC900\uBE44 \uC911)",
  optionsCloudRequiresPro: "Cloud \uC800\uC7A5\uC740 Pro\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsCloudSection: "Threads Archive Cloud \uC5F0\uACB0",
  optionsCloudStatusLabel: "Cloud \uC5F0\uACB0 \uC0C1\uD0DC",
  optionsCloudStatusUnlinked: "\uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  optionsCloudStatusLinked: "@{handle} \uACC4\uC815\uC73C\uB85C \uC5F0\uACB0\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
  optionsCloudStatusExpired: "\uC5F0\uACB0\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694.",
  optionsCloudStatusOffline: "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC5B4 \uB9C8\uC9C0\uB9C9 \uC5F0\uACB0 \uC0C1\uD0DC\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.",
  optionsCloudConnectButton: "Cloud \uC5F0\uACB0",
  optionsCloudDisconnectButton: "Cloud \uC5F0\uACB0 \uD574\uC81C",
  optionsCloudLinkHint: "\uC5F0\uACB0 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C scrapbook \uD398\uC774\uC9C0\uAC00 \uC5F4\uB9AC\uACE0, \uB85C\uADF8\uC778\uB41C \uACC4\uC815\uACFC extension\uC774 \uC5F0\uACB0\uB429\uB2C8\uB2E4.",
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
  optionsProLocalOnly: "Obsidian \uC800\uC7A5\uC740 \uAE30\uAE30 \uC548\uC5D0\uB9CC \uB0A8\uACE0, Cloud \uC800\uC7A5\uC740 \uC120\uD0DD\uD588\uC744 \uB54C\uB9CC \uB0B4 scrapbook \uACC4\uC815\uC73C\uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4.",
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
  popupSubtitleCloud: "Saving to your Threads Archive cloud scrapbook. Make sure you are signed in on the web first.",
  popupRecentSaves: "Recent Saves",
  popupClearAll: "Clear All",
  popupEmpty: "No saved posts yet.",
  popupResave: "Re-save",
  popupExpand: "Expand",
  popupCollapse: "Collapse",
  popupDelete: "Delete",
  popupOpenRemote: "Open remote",
  popupCloudConnect: "Connect Cloud",
  popupCloudDisconnect: "Disconnect Cloud",
  statusReady: "Ready to save from a post permalink page.",
  statusReadyDirect: "Ready. Press to save directly to your Obsidian folder.",
  statusReadyDownload: "Ready. Press to download the file.",
  statusReadyCloud: "Ready. Press to save into your Threads Archive cloud scrapbook.",
  statusUnsupported: "Please open an individual post page first.",
  statusNoTab: "Could not find an active tab.",
  statusSaving: "Saving\u2026",
  statusSavedDirect: "Saved directly to your Obsidian folder.",
  statusSavedZip: "Saved. Download started.",
  statusSavedNotion: "Saved to Notion.",
  statusSavedCloud: "Saved to Threads Archive scrapbook.",
  statusDuplicate: "Already saved \u2014 updated with the latest content.",
  statusDuplicateWarning: "Already saved, updated: ",
  statusAlreadySaved: "This post is already saved. Use 'Re-save' from recent saves to save again.",
  statusNotionSetupRequired: "To use Notion saving, enter your token and destination in settings first.",
  statusError: "An unknown error occurred.",
  statusResaving: "Preparing your file\u2026",
  statusResaved: "Download started.",
  statusResavedNotion: "Saved to Notion as a new page.",
  statusResavedCloud: "Saved again to Threads Archive scrapbook.",
  statusCloudLoginRequired: "To use cloud save, sign in first at threads-archive.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "Connect the extension to your Threads Archive scrapbook first.",
  statusCloudSessionExpired: "Your cloud connection expired. Reconnect the extension.",
  statusCloudOffline: "Could not verify the cloud connection. Check your network.",
  statusCloudConnected: "Threads Archive Cloud is now connected.",
  statusCloudDisconnected: "Threads Archive Cloud has been disconnected.",
  statusCloudLinkStarting: "Finish connecting Threads Archive scrapbook in your browser.",
  statusRecentNotFound: "Could not find the recent save record.",
  statusDeletedRecent: "Deleted from recent saves.",
  statusClearedRecents: "All recent saves cleared.",
  statusExtractFailed: "Could not read the post.",
  statusTabError: "Could not read active tab information.",
  statusRedownloadError: "Error during re-download.",
  statusRetry: "Retry",
  statusResaveButton: "Re-save",
  optionsTitle: "Save Threads posts to Obsidian, Threads Archive Cloud, or Notion, with auto-organize.",
  optionsTitleObsidianOnly: "Save Threads posts to Obsidian or Threads Archive Cloud, with auto-organize.",
  optionsSubtitle: "Free saving, Pro only when needed.",
  optionsSubtitleObsidianOnly: "The current UI exposes Obsidian and Cloud save first, while Notion stays hidden until the integration is ready.",
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
  optionsSaveTargetHint: "On PC, choose Obsidian, Threads Archive Cloud, or Notion as the default destination.",
  optionsSaveTargetHintObsidianOnly: "The current UI exposes Obsidian and Threads Archive Cloud first. Notion stays hidden in settings while the integration is being prepared internally.",
  optionsSaveTargetObsidian: "Obsidian",
  optionsSaveTargetCloud: "Threads Archive Cloud",
  optionsSaveTargetNotion: "Notion",
  optionsSaveTargetNotionHidden: "Notion (Hidden for now)",
  optionsCloudRequiresPro: "Cloud save is available in Pro only.",
  optionsCloudSection: "Threads Archive Cloud Connection",
  optionsCloudStatusLabel: "Cloud connection",
  optionsCloudStatusUnlinked: "Not connected yet.",
  optionsCloudStatusLinked: "Connected as @{handle}.",
  optionsCloudStatusExpired: "The connection expired. Reconnect the extension.",
  optionsCloudStatusOffline: "The server could not be reached, so only the last known state is shown.",
  optionsCloudConnectButton: "Connect Cloud",
  optionsCloudDisconnectButton: "Disconnect Cloud",
  optionsCloudLinkHint: "The connect button opens scrapbook in your browser and links the logged-in account to this extension.",
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
  optionsProLocalOnly: "Obsidian saves stay on your device, and Cloud save only sends a post to your scrapbook account when you choose it.",
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
var ja = {
  ...en,
  uiLanguageLabel: "\u8A00\u8A9E",
  popupTitle: "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58",
  popupSave: "\u73FE\u5728\u306E\u6295\u7A3F\u3092\u4FDD\u5B58",
  popupSettings: "\u8A2D\u5B9A",
  popupPromoTitle: "\u4E88\u7D04\u6E08\u307F\u30A8\u30EA\u30A2",
  popupPromoDescription: "\u4ECA\u5F8C\u306E\u6848\u5185\u3084\u304A\u3059\u3059\u3081\u3092\u8868\u793A\u3059\u308B\u305F\u3081\u306E\u9818\u57DF\u3067\u3059\u3002",
  popupSubtitleDirect: "\u63A5\u7D9A\u6E08\u307F\u306E Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  popupSubtitleDownload: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u30D5\u30A1\u30A4\u30EB\u3068\u3057\u3066\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002\u8A2D\u5B9A\u3067\u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  popupSubtitleConnected: "\u63A5\u7D9A\u6E08\u307F\u306E Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  popupSubtitlePermissionCheck: "\u30D5\u30A9\u30EB\u30C0\u306F\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u6A29\u9650\u306E\u518D\u78BA\u8A8D\u304C\u5FC5\u8981\u306A\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002",
  popupSubtitleNoFolder: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u308C\u3070\u76F4\u63A5\u4FDD\u5B58\u3057\u3001\u672A\u63A5\u7D9A\u306A\u3089\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
  popupSubtitleUnsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A1\u30A4\u30EB\u306E\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u306E\u307F\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
  popupSubtitleNotion: "\u8A2D\u5B9A\u6E08\u307F\u306E Notion \u4FDD\u5B58\u5148\u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  popupSubtitleNotionSetup: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B\u8A2D\u5B9A\u3067\u30C8\u30FC\u30AF\u30F3\u3068\u4FDD\u5B58\u5148\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  popupSubtitleCloud: "Threads Archive \u306E\u30AF\u30E9\u30A6\u30C9 scrapbook \u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002\u5148\u306B Web \u3067\u30B5\u30A4\u30F3\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  popupRecentSaves: "\u6700\u8FD1\u306E\u4FDD\u5B58",
  popupClearAll: "\u3059\u3079\u3066\u524A\u9664",
  popupEmpty: "\u307E\u3060\u4FDD\u5B58\u3057\u305F\u6295\u7A3F\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
  popupResave: "\u518D\u4FDD\u5B58",
  popupExpand: "\u5C55\u958B",
  popupCollapse: "\u6298\u308A\u305F\u305F\u3080",
  popupDelete: "\u524A\u9664",
  popupOpenRemote: "\u4FDD\u5B58\u5148\u3092\u958B\u304F",
  popupCloudConnect: "Cloud \u3092\u63A5\u7D9A",
  popupCloudDisconnect: "Cloud \u3092\u5207\u65AD",
  statusReady: "\u6295\u7A3F\u306E\u500B\u5225\u30DA\u30FC\u30B8\u304B\u3089\u4FDD\u5B58\u3059\u308B\u6E96\u5099\u304C\u3067\u304D\u307E\u3057\u305F\u3002",
  statusReadyDirect: "\u6E96\u5099\u5B8C\u4E86\u3002\u62BC\u3059\u3068 Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  statusReadyDownload: "\u6E96\u5099\u5B8C\u4E86\u3002\u62BC\u3059\u3068\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
  statusReadyCloud: "\u6E96\u5099\u5B8C\u4E86\u3002\u62BC\u3059\u3068 Threads Archive \u306E\u30AF\u30E9\u30A6\u30C9 scrapbook \u306B\u4FDD\u5B58\u3057\u307E\u3059\u3002",
  statusUnsupported: "\u5148\u306B\u6295\u7A3F\u306E\u500B\u5225\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
  statusNoTab: "\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30BF\u30D6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusSaving: "\u4FDD\u5B58\u4E2D\u2026",
  statusSavedDirect: "Obsidian \u30D5\u30A9\u30EB\u30C0\u306B\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusSavedZip: "\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3092\u958B\u59CB\u3057\u307E\u3057\u305F\u3002",
  statusSavedNotion: "Notion \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusSavedCloud: "Threads Archive scrapbook \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusDuplicate: "\u3059\u3067\u306B\u4FDD\u5B58\u6E08\u307F\u3067\u3057\u305F\u304C\u3001\u6700\u65B0\u5185\u5BB9\u3067\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002",
  statusDuplicateWarning: "\u3059\u3067\u306B\u4FDD\u5B58\u6E08\u307F\u3067\u3057\u305F\u304C\u66F4\u65B0\u3057\u307E\u3057\u305F: ",
  statusAlreadySaved: "\u3053\u306E\u6295\u7A3F\u306F\u3059\u3067\u306B\u4FDD\u5B58\u6E08\u307F\u3067\u3059\u3002\u3082\u3046\u4E00\u5EA6\u4FDD\u5B58\u3059\u308B\u306B\u306F\u6700\u8FD1\u306E\u4FDD\u5B58\u304B\u3089\u300C\u518D\u4FDD\u5B58\u300D\u3092\u4F7F\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
  statusNotionSetupRequired: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B\u8A2D\u5B9A\u3067\u30C8\u30FC\u30AF\u30F3\u3068\u4FDD\u5B58\u5148\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusError: "\u4E0D\u660E\u306A\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
  statusResaving: "\u30D5\u30A1\u30A4\u30EB\u3092\u6E96\u5099\u4E2D\u2026",
  statusResaved: "\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3092\u958B\u59CB\u3057\u307E\u3057\u305F\u3002",
  statusResavedNotion: "Notion \u306B\u65B0\u3057\u3044\u30DA\u30FC\u30B8\u3068\u3057\u3066\u518D\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusResavedCloud: "Threads Archive scrapbook \u306B\u518D\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  statusCloudLoginRequired: "Cloud \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B threads-archive.dahanda.dev/scrapbook \u3067\u30B5\u30A4\u30F3\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudConnectRequired: "Cloud \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u3001\u5148\u306B extension \u3092 Threads Archive scrapbook \u306B\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudSessionExpired: "Cloud \u63A5\u7D9A\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3057\u305F\u3002extension \u3092\u518D\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudOffline: "Cloud \u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusCloudConnected: "Threads Archive Cloud \u306E\u63A5\u7D9A\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002",
  statusCloudDisconnected: "Threads Archive Cloud \u306E\u63A5\u7D9A\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002",
  statusCloudLinkStarting: "\u30D6\u30E9\u30A6\u30B6\u3067 Threads Archive scrapbook \u3068\u306E\u63A5\u7D9A\u3092\u5B8C\u4E86\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  statusRecentNotFound: "\u6700\u8FD1\u306E\u4FDD\u5B58\u5C65\u6B74\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusDeletedRecent: "\u6700\u8FD1\u306E\u4FDD\u5B58\u304B\u3089\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
  statusClearedRecents: "\u6700\u8FD1\u306E\u4FDD\u5B58\u3092\u3059\u3079\u3066\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
  statusExtractFailed: "\u6295\u7A3F\u3092\u8AAD\u307F\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusTabError: "\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30BF\u30D6\u60C5\u5831\u3092\u8AAD\u307F\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  statusRedownloadError: "\u518D\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
  statusRetry: "\u518D\u8A66\u884C",
  statusResaveButton: "\u518D\u4FDD\u5B58",
  optionsTitle: "Threads \u306E\u6295\u7A3F\u3092 Obsidian\u3001Threads Archive Cloud\u3001Notion \u306B\u4FDD\u5B58\u3057\u3001\u81EA\u52D5\u6574\u7406\u3067\u304D\u307E\u3059\u3002",
  optionsTitleObsidianOnly: "Threads \u306E\u6295\u7A3F\u3092 Obsidian \u307E\u305F\u306F Threads Archive Cloud \u306B\u4FDD\u5B58\u3057\u3001\u81EA\u52D5\u6574\u7406\u3067\u304D\u307E\u3059\u3002",
  optionsSubtitle: "\u4FDD\u5B58\u306F\u7121\u6599\u3002\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051 Pro\u3002",
  optionsSubtitleObsidianOnly: "\u73FE\u5728\u306E UI \u3067\u306F Obsidian \u3068 Cloud \u4FDD\u5B58\u3092\u5148\u306B\u63D0\u4F9B\u3057\u3001Notion \u306F\u9023\u643A\u6E96\u5099\u304C\u6574\u3046\u307E\u3067\u975E\u8868\u793A\u3067\u3059\u3002",
  optionsPlanSpotlightFreeCopy: "\u57FA\u672C\u306E\u4FDD\u5B58\u6A5F\u80FD\u306F\u3059\u3050\u306B\u4F7F\u3048\u307E\u3059\u3002",
  optionsPlanSpotlightActiveTitle: "Pro \u6709\u52B9",
  optionsPlanSpotlightActiveCopy: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067 Pro \u6A5F\u80FD\u304C\u6709\u52B9\u3067\u3059\u3002",
  optionsPlanSpotlightNeedsActivationTitle: "Pro \u306E\u6709\u52B9\u5316\u304C\u5FC5\u8981\u3067\u3059",
  optionsPlanSpotlightNeedsActivationCopy: "\u30AD\u30FC\u306F\u6709\u52B9\u3067\u3059\u304C\u3001\u3053\u306E\u30C7\u30D0\u30A4\u30B9\u306E seat \u306F\u307E\u3060\u6709\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsAdSlotTitle: "\u5E83\u544A\u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u30FC",
  optionsAdSlotCopy: "\u4ECA\u5F8C\u306E\u30D0\u30CA\u30FC\u3084\u304A\u77E5\u3089\u305B\u7528\u306E\u9818\u57DF\u3067\u3059\u3002",
  optionsFolderSection: "Obsidian \u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A",
  optionsFolderStatus: "\u63A5\u7D9A\u6E08\u307F\u30D5\u30A9\u30EB\u30C0\u3092\u78BA\u8A8D\u4E2D\u2026",
  optionsFolderLabel: "\u73FE\u5728\u306E\u30D5\u30A9\u30EB\u30C0",
  optionsFolderNotConnected: "\u672A\u63A5\u7D9A",
  optionsFolderConnect: "\u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A",
  optionsFolderDisconnect: "\u5207\u65AD",
  optionsFolderUnsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u307E\u305B\u3093",
  optionsFolderUnsupportedStatus: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u30D5\u30A9\u30EB\u30C0\u3078\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002",
  optionsFolderNotConnectedStatus: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u4FDD\u5B58\u6642\u306F\u30D5\u30A1\u30A4\u30EB\u304C\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3059\u3002",
  optionsFolderReady: "\u30D5\u30A9\u30EB\u30C0\u304C\u63A5\u7D9A\u3055\u308C\u307E\u3057\u305F\u3002\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u307E\u3059\u3002",
  optionsFolderPermissionCheck: "\u30D5\u30A9\u30EB\u30C0\u306F\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u6B21\u56DE\u4FDD\u5B58\u6642\u306B\u6A29\u9650\u304C\u518D\u78BA\u8A8D\u3055\u308C\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002",
  optionsFolderPermissionLost: "\u30D5\u30A9\u30EB\u30C0\u6A29\u9650\u304C\u5931\u308F\u308C\u307E\u3057\u305F\u3002\u518D\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsFolderChecked: "\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u307E\u3057\u305F\u3002\u76F4\u63A5\u4FDD\u5B58\u3092\u8A66\u307F\u307E\u3059\u3002",
  optionsFolderCancelled: "\u30D5\u30A9\u30EB\u30C0\u9078\u629E\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F\u3002",
  optionsFolderError: "\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
  optionsFolderConnectedSuccess: '"{folder}" \u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A\u3057\u307E\u3057\u305F\u3002',
  optionsFolderPathLabel: "\u73FE\u5728\u306E\u4FDD\u5B58\u5148",
  optionsFolderPathHint: "\u30D6\u30E9\u30A6\u30B6\u306F OS \u306E\u7D76\u5BFE\u30D1\u30B9\u3092\u516C\u958B\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u63A5\u7D9A\u6E08\u307F\u30D5\u30A9\u30EB\u30C0\u304B\u3089\u306E\u76F8\u5BFE\u4F4D\u7F6E\u3067\u8868\u793A\u3057\u307E\u3059\u3002",
  optionsFolderPathUnavailable: "\u30D5\u30A9\u30EB\u30C0\u63A5\u7D9A\u5F8C\u306B\u8868\u793A\u3055\u308C\u307E\u3059",
  optionsSaveTarget: "\u4FDD\u5B58\u5148",
  optionsSaveTargetHint: "PC \u3067\u306F Obsidian\u3001Threads Archive Cloud\u3001Notion \u306E\u3044\u305A\u308C\u304B\u3092\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u306B\u9078\u3079\u307E\u3059\u3002",
  optionsSaveTargetHintObsidianOnly: "\u73FE\u5728\u306E UI \u3067\u306F Obsidian \u3068 Threads Archive Cloud \u3092\u5148\u306B\u63D0\u4F9B\u3057\u3066\u3044\u307E\u3059\u3002Notion \u306F\u5185\u90E8\u6E96\u5099\u4E2D\u306E\u305F\u3081\u8A2D\u5B9A\u3067\u306F\u975E\u8868\u793A\u3067\u3059\u3002",
  optionsSaveTargetNotionHidden: "Notion\uFF08\u4ECA\u306F\u975E\u8868\u793A\uFF09",
  optionsCloudRequiresPro: "Cloud \u4FDD\u5B58\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsCloudSection: "Threads Archive Cloud \u63A5\u7D9A",
  optionsCloudStatusLabel: "Cloud \u63A5\u7D9A\u72B6\u614B",
  optionsCloudStatusUnlinked: "\u307E\u3060\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsCloudStatusLinked: "@{handle} \u3068\u3057\u3066\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
  optionsCloudStatusExpired: "\u63A5\u7D9A\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3057\u305F\u3002\u518D\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsCloudStatusOffline: "\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u6700\u5F8C\u306B\u78BA\u8A8D\u3067\u304D\u305F\u72B6\u614B\u306E\u307F\u8868\u793A\u3057\u3066\u3044\u307E\u3059\u3002",
  optionsCloudConnectButton: "Cloud \u3092\u63A5\u7D9A",
  optionsCloudDisconnectButton: "Cloud \u3092\u5207\u65AD",
  optionsCloudLinkHint: "\u63A5\u7D9A\u30DC\u30BF\u30F3\u3092\u62BC\u3059\u3068\u30D6\u30E9\u30A6\u30B6\u3067 scrapbook \u304C\u958B\u304D\u3001\u30ED\u30B0\u30A4\u30F3\u6E08\u307F\u30A2\u30AB\u30A6\u30F3\u30C8\u3068 extension \u304C\u9023\u643A\u3055\u308C\u307E\u3059\u3002",
  optionsNotionSection: "Notion \u63A5\u7D9A",
  optionsNotionSubtitle: "Notion \u306F OAuth \u3067\u63A5\u7D9A\u3055\u308C\u308B\u305F\u3081\u3001\u30D6\u30E9\u30A6\u30B6\u304C\u5185\u90E8\u30C8\u30FC\u30AF\u30F3\u3092\u76F4\u63A5\u8981\u6C42\u3059\u308B\u3053\u3068\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u4E00\u5EA6\u63A5\u7D9A\u3057\u3066\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u3092\u9078\u3079\u3070\u3001\u305D\u306E\u5F8C\u306F\u4FDD\u5B58\u3059\u308B\u3060\u3051\u3067\u3059\u3002",
  optionsNotionConnectionLabel: "\u63A5\u7D9A\u72B6\u614B",
  optionsNotionDisconnectButton: "\u5207\u65AD",
  optionsNotionConnectHint: "Notion \u306E\u627F\u8A8D\u30BF\u30D6\u304C\u958B\u304D\u307E\u3059\u3002\u627F\u8A8D\u5F8C\u306B\u3053\u3053\u3078\u623B\u308B\u3068\u63A5\u7D9A\u72B6\u614B\u304C\u81EA\u52D5\u66F4\u65B0\u3055\u308C\u307E\u3059\u3002",
  optionsNotionConnected: "Notion \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
  optionsNotionDisconnected: "Notion \u306F\u307E\u3060\u63A5\u7D9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsNotionConnectStarted: "Notion \u63A5\u7D9A\u30BF\u30D6\u3092\u958B\u304D\u307E\u3057\u305F\u3002\u627F\u8A8D\u5F8C\u306B\u3053\u3053\u3078\u623B\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNotionConnectFailed: "Notion \u63A5\u7D9A\u30D5\u30ED\u30FC\u3092\u958B\u59CB\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionDisconnectedSaved: "Notion \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u63A5\u7D9A\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002",
  optionsNotionDisconnectFailed: "Notion \u306E\u5207\u65AD\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
  optionsNotionParentType: "\u4FDD\u5B58\u30E2\u30FC\u30C9",
  optionsNotionParentTypeHint: "\u63A5\u7D9A\u6E08\u307F\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u3001\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u3092\u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u304B\u3089\u9078\u3073\u307E\u3059\u3002",
  optionsNotionSelectedTarget: "\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148",
  optionsNotionSelectedTargetHint: "\u4FDD\u5B58\u30DC\u30BF\u30F3\u306F\u65B0\u3057\u3044 Threads \u6295\u7A3F\u3092\u65E2\u5B9A\u3067\u3053\u3053\u3078\u9001\u308A\u307E\u3059\u3002",
  optionsNotionTargetNotSelected: "\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u306F\u307E\u3060\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsNotionTargetRequired: "\u5148\u306B\u65E2\u5B9A\u306E Notion \u4FDD\u5B58\u5148\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002",
  optionsNotionTargetSaved: "\u65E2\u5B9A\u306E Notion \u4FDD\u5B58\u5148\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  optionsNotionTargetSaveFailed: "\u65E2\u5B9A\u306E Notion \u4FDD\u5B58\u5148\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionSearchLabel: "\u4FDD\u5B58\u5148\u3092\u63A2\u3059",
  optionsNotionSearchHint: "\u3053\u306E\u9023\u643A\u306B\u30A2\u30AF\u30BB\u30B9\u6A29\u3092\u4E0E\u3048\u305F\u30DA\u30FC\u30B8\u3084\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u3092\u691C\u7D22\u3057\u307E\u3059\u3002",
  optionsNotionSearchPlaceholderPage: "\u4F8B: Product Notes",
  optionsNotionSearchPlaceholderDataSource: "\u4F8B: Threads Inbox",
  optionsNotionSearchButton: "\u4FDD\u5B58\u5148\u3092\u691C\u7D22",
  optionsNotionResultsLabel: "\u691C\u7D22\u7D50\u679C",
  optionsNotionResultsHint: "\u7D50\u679C\u3092\u4E00\u3064\u9078\u3073\u3001\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u3068\u3057\u3066\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNotionUseLocationButton: "\u65E2\u5B9A\u306E\u4FDD\u5B58\u5148\u306B\u3059\u308B",
  optionsNotionSearchLoaded: "Notion \u306E\u4FDD\u5B58\u5148\u3092\u8AAD\u307F\u8FBC\u307F\u307E\u3057\u305F\u3002",
  optionsNotionSearchEmpty: "\u4E00\u81F4\u3059\u308B Notion \u306E\u4FDD\u5B58\u5148\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionSearchFailed: "Notion \u306E\u4FDD\u5B58\u5148\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsNotionOAuthRequiresPro: "Notion OAuth \u4FDD\u5B58\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsNotionConnectFirst: "\u5148\u306B Notion \u3092\u63A5\u7D9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNotionTokenHint: "Notion \u306E internal integration token \u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u30FC\u30D7\u30ED\u30D5\u30A1\u30A4\u30EB\u306B\u306E\u307F\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002",
  optionsNotionParentPageHint: "Notion \u30DA\u30FC\u30B8\u306E URL \u5168\u4F53\u3001\u307E\u305F\u306F\u30DA\u30FC\u30B8 ID \u3060\u3051\u3067\u3082\u8CBC\u308A\u4ED8\u3051\u3089\u308C\u307E\u3059\u3002",
  optionsNotionDataSourceHint: "Notion \u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u306E URL \u5168\u4F53\u307E\u305F\u306F ID \u3092\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002\u53EF\u80FD\u306A\u5834\u5408\u306F\u30BF\u30A4\u30C8\u30EB\u3001\u30BF\u30B0\u3001\u65E5\u4ED8\u306A\u3069\u306E\u30D7\u30ED\u30D1\u30C6\u30A3\u3092\u81EA\u52D5\u3067\u5BFE\u5FDC\u4ED8\u3051\u307E\u3059\u3002",
  optionsNotionDataSourceLocked: "\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u4FDD\u5B58\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsNotionUploadMedia: "\u30E1\u30C7\u30A3\u30A2\u3092 Notion \u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  optionsNotionUploadMediaHint: "\u753B\u50CF\u3068\u52D5\u753B\u3092\u30EA\u30E2\u30FC\u30C8\u30EA\u30F3\u30AF\u306E\u307E\u307E\u306B\u305B\u305A\u3001Notion \u7BA1\u7406\u30D5\u30A1\u30A4\u30EB\u3068\u3057\u3066\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u307E\u3059\u3002\u5931\u6557\u3057\u305F\u5834\u5408\u306F\u30EA\u30F3\u30AF\u4FDD\u5B58\u3078\u30D5\u30A9\u30FC\u30EB\u30D0\u30C3\u30AF\u3057\u307E\u3059\u3002",
  optionsNotionUploadMediaLocked: "Notion \u7BA1\u7406\u30E1\u30C7\u30A3\u30A2\u306E\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsNotionTokenRequired: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F integration token \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsNotionParentPageRequired: "Notion \u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u89AA\u30DA\u30FC\u30B8 ID \u307E\u305F\u306F URL \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsNotionInvalidPage: "Notion \u89AA\u30DA\u30FC\u30B8 ID \u307E\u305F\u306F URL \u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsNotionDataSourceRequired: "\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u4FDD\u5B58\u3092\u4F7F\u3046\u306B\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9 ID \u307E\u305F\u306F URL \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsNotionInvalidDataSource: "Notion \u30C7\u30FC\u30BF\u30BD\u30FC\u30B9 ID \u307E\u305F\u306F URL \u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsNotionPermissionDenied: "Notion API \u3078\u306E\u30A2\u30AF\u30BB\u30B9\u6A29\u304C\u62D2\u5426\u3055\u308C\u305F\u305F\u3081\u3001\u8A2D\u5B9A\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsBasicSection: "\u57FA\u672C\u4FDD\u5B58",
  optionsCompareSection: "Free \u3068 Pro",
  optionsProSection: "Pro \u8A2D\u5B9A",
  optionsProSubtitle: "\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002\u30EB\u30FC\u30EB\u6574\u7406\u3068 AI \u6574\u7406\u306F\u3053\u3053\u306B\u3042\u308A\u307E\u3059\u3002",
  optionsProAiNote: "AI \u306F\u81EA\u52D5\u3067\u306F\u4ED8\u5C5E\u3057\u307E\u305B\u3093\u3002\u81EA\u5206\u306E API \u30AD\u30FC\u3092\u8FFD\u52A0\u3057\u3066\u521D\u3081\u3066\u52D5\u4F5C\u3057\u307E\u3059\u3002",
  compareRowImages: "\u753B\u50CF",
  compareRowReplies: "\u9023\u7D9A\u8FD4\u4FE1",
  compareRowDuplicates: "\u91CD\u8907\u3092\u30B9\u30AD\u30C3\u30D7",
  compareRowFilename: "\u30D5\u30A1\u30A4\u30EB\u540D\u5F62\u5F0F",
  compareRowFolder: "\u4FDD\u5B58\u30D5\u30A9\u30EB\u30C0",
  compareRowNotionDataSource: "Notion \u30C7\u30FC\u30BF\u30BD\u30FC\u30B9",
  compareRowNotionMediaUpload: "Notion \u30E1\u30C7\u30A3\u30A2\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  optionsProStatusFree: "\u73FE\u5728\u306F Free \u3067\u3059\u3002\u4FDD\u5B58\u306F\u3059\u3067\u306B\u4F7F\u3048\u3001\u30EB\u30FC\u30EB\u3084 AI \u304C\u5FC5\u8981\u306A\u3068\u304D\u3060\u3051 Pro \u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsProStatusActive: "Pro \u6709\u52B9\u3002\u4E0B\u306E\u30EB\u30FC\u30EB\u6574\u7406\u3068 AI \u304C\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
  optionsProStatusExpired: "\u3053\u306E Pro \u30AD\u30FC\u306F\u671F\u9650\u5207\u308C\u3067\u3059\u3002Free \u306E\u4FDD\u5B58\u306F\u5F15\u304D\u7D9A\u304D\u4F7F\u3048\u307E\u3059\u3002",
  optionsProStatusInvalid: "\u3053\u306E Pro \u30AD\u30FC\u306F\u7121\u52B9\u3067\u3059\u3002Free \u306E\u4FDD\u5B58\u306F\u5F15\u304D\u7D9A\u304D\u4F7F\u3048\u307E\u3059\u3002",
  optionsProStatusSeatLimit: "\u3053\u306E Pro \u30AD\u30FC\u306F\u3059\u3067\u306B 3 \u53F0\u3067\u6709\u52B9\u3067\u3059\u3002\u5148\u306B\u5225\u306E\u30C7\u30D0\u30A4\u30B9\u3067\u89E3\u9664\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsProStatusNeedsActivation: "Pro \u30AD\u30FC\u306F\u6709\u52B9\u3067\u3059\u304C\u3001\u3053\u306E\u30C7\u30D0\u30A4\u30B9\u306E seat \u306F\u307E\u3060\u6709\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  optionsProStatusOffline: "\u30B5\u30FC\u30D0\u30FC\u3078\u63A5\u7D9A\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u76F4\u8FD1\u306E\u6709\u52B9\u5316\u72B6\u614B\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
  optionsProStatusRevoked: "\u3053\u306E Pro \u30AD\u30FC\u306F\u3082\u3046\u4F7F\u3048\u307E\u305B\u3093\u3002",
  optionsProHolderLabel: "\u4FDD\u6301\u8005",
  optionsProExpiresLabel: "\u6709\u52B9\u671F\u9650",
  optionsProUnlockHint: "\u8CFC\u5165\u30E1\u30FC\u30EB\u306E Pro \u30AD\u30FC\u3092\u8CBC\u308A\u4ED8\u3051\u308B\u3068\u3001\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u6709\u52B9\u5316\u3067\u304D\u307E\u3059\u3002",
  optionsProUnlockPlaceholder: "\u3053\u3053\u306B Pro \u30AD\u30FC\u3092\u8CBC\u308A\u4ED8\u3051",
  optionsProSalesLink: "Pro \u3092\u5165\u624B",
  optionsProActivate: "Pro \u3092\u6709\u52B9\u5316",
  optionsProClear: "\u524A\u9664",
  optionsProActivated: "Pro \u3092\u6709\u52B9\u5316\u3057\u307E\u3057\u305F\u3002",
  optionsProRemoved: "Pro \u30AD\u30FC\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002",
  optionsProEmptyKey: "\u5148\u306B Pro \u30AD\u30FC\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsProLocalOnly: "Obsidian \u4FDD\u5B58\u306F\u7AEF\u672B\u5185\u306B\u6B8B\u308A\u3001Cloud \u4FDD\u5B58\u3082\u9078\u3093\u3060\u3068\u304D\u3060\u3051\u6295\u7A3F\u304C\u3042\u306A\u305F\u306E scrapbook \u30A2\u30AB\u30A6\u30F3\u30C8\u3078\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002",
  optionsFileRules: "\u30D5\u30A1\u30A4\u30EB\u30EB\u30FC\u30EB",
  optionsFilenamePattern: "\u30D5\u30A1\u30A4\u30EB\u540D\u5F62\u5F0F",
  optionsFilenamePatternLocked: "Free \u306F\u65E2\u5B9A\u306E\u30D5\u30A1\u30A4\u30EB\u540D\u3092\u4F7F\u3044\u307E\u3059\u3002Pro \u3067\u306F\u81EA\u5206\u306E\u5F62\u5F0F\u3092\u8A2D\u5B9A\u3067\u304D\u307E\u3059\u3002",
  optionsSavePathPattern: "\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u30D1\u30B9",
  optionsSavePathTokens: "\u4F8B: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free \u306F\u63A5\u7D9A\u30D5\u30A9\u30EB\u30C0\u306E\u30EB\u30FC\u30C8\u3078\u4FDD\u5B58\u3057\u307E\u3059\u3002Pro \u3067\u306F\u65E5\u4ED8\u3001\u8457\u8005\u3001\u30C8\u30D4\u30C3\u30AF\u3067\u81EA\u52D5\u7684\u306B\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u5206\u3051\u3067\u304D\u307E\u3059\u3002",
  optionsFilenameTokens: "\u5229\u7528\u53EF\u80FD: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI \u6574\u7406",
  optionsAiSubtitle: "\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3092\u9078\u3076\u3068\u3001\u65E2\u5B9A\u306E Base URL \u3068\u30E2\u30C7\u30EB\u304C\u81EA\u52D5\u5165\u529B\u3055\u308C\u307E\u3059\u3002",
  optionsAiQuickstart: "\u591A\u304F\u306E\u30E6\u30FC\u30B6\u30FC\u306F\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3068 API \u30AD\u30FC\u3060\u3051\u3067\u5341\u5206\u3067\u3059\u3002\u5909\u66F4\u5F8C\u306F\u4E0B\u306E\u300C\u8A2D\u5B9A\u3092\u4FDD\u5B58\u300D\u3092\u62BC\u3057\u3066\u9069\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsAiAdvancedSummary: "\u8A73\u7D30\u8A2D\u5B9A\u3092\u8868\u793A",
  optionsAiEnable: "AI \u6574\u7406\u3092\u6709\u52B9\u5316",
  optionsAiProviderHint: "OpenAI\u3001OpenRouter\u3001DeepSeek\u3001Gemini\u3001Ollama \u306F\u30D7\u30EA\u30BB\u30C3\u30C8\u304B\u3089\u59CB\u3081\u3089\u308C\u307E\u3059\u3002Custom \u306F OpenAI \u4E92\u63DB\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u5411\u3051\u3067\u3059\u3002",
  optionsAiApiKeyHint: "Gemini \u306E\u30AD\u30FC\u306F\u901A\u5E38 AIza \u3067\u59CB\u307E\u308A\u3001OpenAI/OpenRouter/DeepSeek \u306E\u30AD\u30FC\u306F\u901A\u5E38 sk- \u3067\u59CB\u307E\u308A\u307E\u3059\u3002Ollama \u306E\u3088\u3046\u306A\u30ED\u30FC\u30AB\u30EB\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u3067\u306F\u30AD\u30FC\u4E0D\u8981\u306A\u3089\u7A7A\u6B04\u306E\u307E\u307E\u3067\u69CB\u3044\u307E\u305B\u3093\u3002",
  optionsAiApiKeyRequired: "\u9078\u629E\u3057\u305F\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306B\u306F API \u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002",
  optionsAiKeyMismatchGemini: "Gemini \u306B\u306F Google Gemini API \u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002\u73FE\u5728\u306E\u30AD\u30FC\u306F OpenAI \u4E92\u63DB\u30AD\u30FC\u306E\u3088\u3046\u306B\u898B\u3048\u307E\u3059\u3002",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek \u306B\u306F\u5404\u30B5\u30FC\u30D3\u30B9\u306E\u30AD\u30FC\u304C\u5FC5\u8981\u3067\u3001AIza \u3067\u59CB\u307E\u308B Gemini \u30AD\u30FC\u306F\u4F7F\u3048\u307E\u305B\u3093\u3002",
  optionsAiBaseUrlHint: "\u4F8B: https://api.openai.com/v1 \xB7 https://openrouter.ai/api/v1 \xB7 https://api.deepseek.com/v1 \xB7 http://localhost:11434/v1",
  optionsAiModel: "\u30E2\u30C7\u30EB\u540D",
  optionsAiModelHint: "\u4F8B: gpt-4.1-mini \xB7 openai/gpt-4.1-mini \xB7 llama3.2",
  optionsAiPrompt: "\u6574\u7406\u30D7\u30ED\u30F3\u30D7\u30C8",
  optionsAiPromptHint: "\u8981\u7D04\u306E\u9577\u3055\u3001\u30BF\u30B0\u306E\u30B9\u30BF\u30A4\u30EB\u3001\u5FC5\u8981\u306A frontmatter \u30D5\u30A3\u30FC\u30EB\u30C9\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsAiLocked: "AI \u6574\u7406\u306F Pro \u9650\u5B9A\u3067\u3059\u3002",
  optionsAiInvalidBaseUrl: "AI Base URL \u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsAiPermissionDenied: "\u9078\u629E\u3057\u305F AI \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306E\u6A29\u9650\u304C\u62D2\u5426\u3055\u308C\u305F\u305F\u3081\u3001\u8A2D\u5B9A\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  optionsAiSaved: "AI \u8A2D\u5B9A\u3068\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u6A29\u9650\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  optionsIncludeImages: "\u753B\u50CF\u3068\u52D5\u753B\u30D5\u30A1\u30A4\u30EB\u3082\u4FDD\u5B58",
  optionsSave: "\u8A2D\u5B9A\u3092\u4FDD\u5B58",
  optionsSaved: "\u8A2D\u5B9A\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  optionsPendingSave: "\u5909\u66F4\u304C\u3042\u308A\u307E\u3059\u3002\u9069\u7528\u3059\u308B\u306B\u306F\u4E0B\u306E\u300C\u8A2D\u5B9A\u3092\u4FDD\u5B58\u300D\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  optionsNoChanges: "\u307E\u3060\u5909\u66F4\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
  optionsStep1: "1. Obsidian \u30D5\u30A9\u30EB\u30C0\u3092\u63A5\u7D9A",
  optionsStep2: "2. \u307E\u305A\u7121\u6599\u3067\u4FDD\u5B58\u3092\u8A66\u3059",
  optionsStep3: "3. \u30EB\u30FC\u30EB\u3084 AI \u6574\u7406\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3089 Pro \u3092\u6709\u52B9\u5316",
  mdImageLabel: "\u753B\u50CF",
  mdVideoLabel: "\u52D5\u753B",
  mdVideoThumbnailLabel: "\u52D5\u753B\u30B5\u30E0\u30CD\u30A4\u30EB",
  mdVideoOnThreads: "Threads \u3067\u958B\u304F",
  mdSavedVideoFile: "\u4FDD\u5B58\u6E08\u307F\u52D5\u753B\u30D5\u30A1\u30A4\u30EB",
  mdReplySection: "\u8457\u8005\u306E\u9023\u7D9A\u8FD4\u4FE1",
  mdReplyLabel: "\u8FD4\u4FE1",
  mdReplyImageLabel: "\u8FD4\u4FE1\u753B\u50CF",
  mdUploadedMediaSection: "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u6E08\u307F\u30E1\u30C7\u30A3\u30A2",
  mdSource: "\u30BD\u30FC\u30B9",
  mdAuthor: "\u8457\u8005",
  mdPublishedAt: "\u6295\u7A3F\u65E5",
  mdExternalLink: "\u5916\u90E8\u30EA\u30F3\u30AF",
  mdWarning: "\u8B66\u544A",
  mdSummary: "AI \u8981\u7D04",
  warnImageAccessFailed: "\u4E00\u90E8\u306E\u753B\u50CF\u307E\u305F\u306F\u52D5\u753B\u3092\u4FDD\u5B58\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001\u5143\u30EA\u30F3\u30AF\u3092\u4FDD\u6301\u3057\u307E\u3057\u305F\u3002",
  warnImageDownloadOff: "\u753B\u50CF\u30FB\u52D5\u753B\u4FDD\u5B58\u304C\u30AA\u30D5\u306E\u305F\u3081\u3001\u5143\u30EA\u30F3\u30AF\u3092\u4FDD\u6301\u3057\u307E\u3057\u305F\u3002",
  warnAiFailed: "AI \u6574\u7406\u306B\u5931\u6557\u3057\u305F\u305F\u3081\u3001\u5143\u306E\u30CE\u30FC\u30C8\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F: {reason}",
  warnAiPermissionMissing: "AI \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306E\u6A29\u9650\u304C\u306A\u3044\u305F\u3081\u3001\u5143\u306E\u30CE\u30FC\u30C8\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002\u8A2D\u5B9A\u306E AI \u30BB\u30AF\u30B7\u30E7\u30F3\u3092\u4FDD\u5B58\u3057\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  warnAiMissingModel: "AI \u30E2\u30C7\u30EB\u540D\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u5143\u306E\u30CE\u30FC\u30C8\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  warnNotionMediaUploadFailed: "Notion \u3078\u306E\u30E1\u30C7\u30A3\u30A2\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u305F\u305F\u3081\u3001\u30EA\u30E2\u30FC\u30C8\u30EA\u30F3\u30AF\u3067\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
  errBrowserUnsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F Obsidian \u30D5\u30A9\u30EB\u30C0\u3078\u76F4\u63A5\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002",
  errFolderNameFailed: "\u4FDD\u5B58\u5148\u30D5\u30A9\u30EB\u30C0\u540D\u3092\u6C7A\u5B9A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  errInvalidPath: "\u7121\u52B9\u306A\u30D5\u30A1\u30A4\u30EB\u30D1\u30B9\u3067\u3059\u3002",
  errNotionTokenMissing: "Notion integration token \u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  errNotionPermissionMissing: "Notion API \u306E\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u5148\u306B\u8A2D\u5B9A\u3092\u4FDD\u5B58\u3057\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionUnauthorized: "Notion \u30C8\u30FC\u30AF\u30F3\u304C\u7121\u52B9\u304B\u671F\u9650\u5207\u308C\u3067\u3059\u3002",
  errNotionForbidden: "\u3053\u306E\u9023\u643A\u306F\u9078\u629E\u3057\u305F Notion \u4FDD\u5B58\u5148\u3078\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093\u3002\u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u304C\u5171\u6709\u3055\u308C\u3066\u3044\u308B\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionParentNotFound: "\u9078\u629E\u3057\u305F Notion \u30DA\u30FC\u30B8\u307E\u305F\u306F\u30C7\u30FC\u30BF\u30BD\u30FC\u30B9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002ID \u3068\u63A5\u7D9A\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionRateLimited: "Notion \u3078\u306E\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u591A\u3059\u304E\u307E\u3059\u3002{seconds} \u79D2\u5F8C\u306B\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNotionValidation: "Notion \u30EA\u30AF\u30A8\u30B9\u30C8\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002",
  errNotionRequestFailed: "Notion \u3078\u306E\u4FDD\u5B58\u30EA\u30AF\u30A8\u30B9\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
  fallbackNoFolder: "\u63A5\u7D9A\u3055\u308C\u305F\u30D5\u30A9\u30EB\u30C0\u304C\u306A\u3044\u305F\u3081\u3001",
  fallbackPermissionDenied: "\u30D5\u30A9\u30EB\u30C0\u6A29\u9650\u304C\u306A\u3044\u305F\u3081\u3001",
  fallbackDirectFailed: "\u30D5\u30A9\u30EB\u30C0\u3078\u4FDD\u5B58\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001",
  fallbackZipMessage: " \u4EE3\u308F\u308A\u306B\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u307E\u3057\u305F\u3002",
  errNotPermalink: "\u5148\u306B\u6295\u7A3F\u306E\u500B\u5225\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
  errPostContentNotFound: "\u6295\u7A3F\u5185\u5BB9\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30ED\u30B0\u30A4\u30F3\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
};
var ptBR = {
  ...en,
  uiLanguageLabel: "Idioma",
  popupTitle: "Salvar post atual",
  popupSave: "Salvar post atual",
  popupSettings: "Configura\xE7\xF5es",
  popupPromoTitle: "\xC1rea reservada",
  popupPromoDescription: "Este espa\xE7o est\xE1 reservado para futuras orienta\xE7\xF5es e recomenda\xE7\xF5es.",
  popupSubtitleDirect: "Salvando diretamente na pasta do Obsidian conectada.",
  popupSubtitleDownload: "Nenhuma pasta conectada. O conte\xFAdo ser\xE1 baixado como arquivo. Conecte uma pasta nas configura\xE7\xF5es.",
  popupSubtitleConnected: "Salvando diretamente na pasta do Obsidian conectada.",
  popupSubtitlePermissionCheck: "A pasta est\xE1 conectada, mas talvez seja necess\xE1rio confirmar a permiss\xE3o novamente.",
  popupSubtitleNoFolder: "Salva diretamente quando h\xE1 uma pasta conectada; caso contr\xE1rio, baixa um arquivo.",
  popupSubtitleUnsupported: "Este navegador s\xF3 oferece suporte a download de arquivos.",
  popupSubtitleNotion: "Salvando no destino do Notion configurado.",
  popupSubtitleNotionSetup: "Para usar o salvamento no Notion, informe primeiro o token e o destino nas configura\xE7\xF5es.",
  popupSubtitleCloud: "Salvando no seu scrapbook em nuvem do Threads Archive. Primeiro fa\xE7a login na web.",
  popupRecentSaves: "Salvos recentes",
  popupClearAll: "Limpar tudo",
  popupEmpty: "Ainda n\xE3o h\xE1 posts salvos.",
  popupResave: "Salvar novamente",
  popupExpand: "Expandir",
  popupCollapse: "Recolher",
  popupDelete: "Excluir",
  popupOpenRemote: "Abrir remoto",
  popupCloudConnect: "Conectar Cloud",
  popupCloudDisconnect: "Desconectar Cloud",
  statusReady: "Pronto para salvar a partir da p\xE1gina permanente do post.",
  statusReadyDirect: "Pronto. Toque para salvar diretamente na pasta do Obsidian.",
  statusReadyDownload: "Pronto. Toque para baixar o arquivo.",
  statusReadyCloud: "Pronto. Toque para salvar no scrapbook em nuvem do Threads Archive.",
  statusUnsupported: "Abra primeiro a p\xE1gina individual do post.",
  statusNoTab: "N\xE3o foi poss\xEDvel encontrar uma aba ativa.",
  statusSaving: "Salvando\u2026",
  statusSavedDirect: "Salvo diretamente na pasta do Obsidian.",
  statusSavedZip: "Salvo. O download come\xE7ou.",
  statusSavedNotion: "Salvo no Notion.",
  statusSavedCloud: "Salvo no scrapbook do Threads Archive.",
  statusDuplicate: "J\xE1 estava salvo, mas foi atualizado com o conte\xFAdo mais recente.",
  statusDuplicateWarning: "J\xE1 estava salvo, atualizado: ",
  statusAlreadySaved: "Este post j\xE1 est\xE1 salvo. Use \u201CSalvar novamente\u201D nos salvos recentes para salvar de novo.",
  statusNotionSetupRequired: "Para usar o salvamento no Notion, informe primeiro o token e o destino nas configura\xE7\xF5es.",
  statusError: "Ocorreu um erro desconhecido.",
  statusResaving: "Preparando seu arquivo\u2026",
  statusResaved: "Download iniciado.",
  statusResavedNotion: "Salvo no Notion como uma nova p\xE1gina.",
  statusResavedCloud: "Salvo novamente no scrapbook do Threads Archive.",
  statusCloudLoginRequired: "Para usar o salvamento em nuvem, fa\xE7a login antes em threads-archive.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "Conecte primeiro a extens\xE3o ao seu scrapbook do Threads Archive.",
  statusCloudSessionExpired: "A conex\xE3o com a nuvem expirou. Reconecte a extens\xE3o.",
  statusCloudOffline: "N\xE3o foi poss\xEDvel verificar a conex\xE3o com a nuvem. Confira a rede.",
  statusCloudConnected: "O Threads Archive Cloud foi conectado.",
  statusCloudDisconnected: "O Threads Archive Cloud foi desconectado.",
  statusCloudLinkStarting: "Conclua a conex\xE3o com o Threads Archive scrapbook no navegador.",
  statusRecentNotFound: "N\xE3o foi poss\xEDvel encontrar o registro do salvamento recente.",
  statusDeletedRecent: "Removido dos salvos recentes.",
  statusClearedRecents: "Todos os salvos recentes foram removidos.",
  statusExtractFailed: "N\xE3o foi poss\xEDvel ler o post.",
  statusTabError: "N\xE3o foi poss\xEDvel ler as informa\xE7\xF5es da aba ativa.",
  statusRedownloadError: "Erro ao baixar novamente.",
  statusRetry: "Tentar novamente",
  statusResaveButton: "Salvar novamente",
  optionsTitle: "Salve posts do Threads no Obsidian, Threads Archive Cloud ou Notion, com organiza\xE7\xE3o autom\xE1tica.",
  optionsTitleObsidianOnly: "Salve posts do Threads no Obsidian ou Threads Archive Cloud, com organiza\xE7\xE3o autom\xE1tica.",
  optionsSubtitle: "Salvar \xE9 gr\xE1tis. Pro s\xF3 quando precisar.",
  optionsSubtitleObsidianOnly: "A interface atual mostra primeiro Obsidian e Cloud save, enquanto o Notion permanece oculto at\xE9 a integra\xE7\xE3o ficar pronta.",
  optionsPlanSpotlightFreeCopy: "O salvamento b\xE1sico j\xE1 est\xE1 pronto para uso.",
  optionsPlanSpotlightActiveTitle: "Pro ativo",
  optionsPlanSpotlightActiveCopy: "Os recursos Pro est\xE3o ativados neste navegador.",
  optionsPlanSpotlightNeedsActivationTitle: "O Pro precisa ser ativado",
  optionsPlanSpotlightNeedsActivationCopy: "A chave \xE9 v\xE1lida, mas este dispositivo ainda n\xE3o tem um seat ativo.",
  optionsAdSlotTitle: "Espa\xE7o reservado para an\xFAncio",
  optionsAdSlotCopy: "Reservado para um banner ou aviso futuro.",
  optionsFolderSection: "Conectar pasta do Obsidian",
  optionsFolderStatus: "Verificando a pasta conectada\u2026",
  optionsFolderLabel: "Pasta atual",
  optionsFolderNotConnected: "N\xE3o conectada",
  optionsFolderConnect: "Conectar pasta",
  optionsFolderDisconnect: "Desconectar",
  optionsFolderUnsupported: "A conex\xE3o com pasta n\xE3o \xE9 compat\xEDvel neste navegador",
  optionsFolderUnsupportedStatus: "Este navegador n\xE3o consegue salvar diretamente em uma pasta. Os arquivos ser\xE3o baixados.",
  optionsFolderNotConnectedStatus: "Nenhuma pasta conectada. Os arquivos ser\xE3o baixados ao salvar.",
  optionsFolderReady: "Pasta conectada. Os arquivos ser\xE3o salvos diretamente.",
  optionsFolderPermissionCheck: "Pasta conectada. A permiss\xE3o pode ser confirmada novamente no pr\xF3ximo salvamento.",
  optionsFolderPermissionLost: "A permiss\xE3o da pasta foi perdida. Reconecte a pasta.",
  optionsFolderChecked: "Conex\xE3o da pasta verificada. O salvamento direto ser\xE1 tentado.",
  optionsFolderCancelled: "Sele\xE7\xE3o de pasta cancelada.",
  optionsFolderError: "Erro ao conectar a pasta.",
  optionsFolderConnectedSuccess: 'A pasta "{folder}" foi conectada.',
  optionsFolderPathLabel: "Local atual de salvamento",
  optionsFolderPathHint: "O navegador n\xE3o pode expor o caminho absoluto do sistema, ent\xE3o este valor permanece relativo \xE0 pasta conectada.",
  optionsFolderPathUnavailable: "Exibido depois que voc\xEA conectar uma pasta",
  optionsSaveTarget: "Destino de salvamento",
  optionsSaveTargetHint: "No PC, escolha Obsidian, Threads Archive Cloud ou Notion como destino padr\xE3o.",
  optionsSaveTargetHintObsidianOnly: "A interface atual mostra primeiro Obsidian e Threads Archive Cloud. O Notion permanece oculto nas configura\xE7\xF5es enquanto a integra\xE7\xE3o est\xE1 sendo preparada.",
  optionsSaveTargetNotionHidden: "Notion (oculto por enquanto)",
  optionsCloudRequiresPro: "O salvamento em nuvem est\xE1 dispon\xEDvel apenas no Pro.",
  optionsCloudSection: "Conex\xE3o com Threads Archive Cloud",
  optionsCloudStatusLabel: "Status da conex\xE3o Cloud",
  optionsCloudStatusUnlinked: "Ainda n\xE3o conectado.",
  optionsCloudStatusLinked: "Conectado como @{handle}.",
  optionsCloudStatusExpired: "A conex\xE3o expirou. Reconecte a extens\xE3o.",
  optionsCloudStatusOffline: "N\xE3o foi poss\xEDvel alcan\xE7ar o servidor, ent\xE3o apenas o \xFAltimo estado conhecido \xE9 mostrado.",
  optionsCloudConnectButton: "Conectar Cloud",
  optionsCloudDisconnectButton: "Desconectar Cloud",
  optionsCloudLinkHint: "O bot\xE3o de conex\xE3o abre o scrapbook no navegador e vincula a conta logada a esta extens\xE3o.",
  optionsNotionSection: "Conex\xE3o com o Notion",
  optionsNotionSubtitle: "O Notion \xE9 conectado via OAuth, ent\xE3o o navegador nunca pede um token interno. Conecte uma vez, escolha um destino padr\xE3o e depois basta salvar.",
  optionsNotionConnectionLabel: "Conex\xE3o",
  optionsNotionDisconnectButton: "Desconectar",
  optionsNotionConnectHint: "Uma aba de aprova\xE7\xE3o do Notion ser\xE1 aberta. Depois da aprova\xE7\xE3o, volte aqui e o estado da conex\xE3o ser\xE1 atualizado automaticamente.",
  optionsNotionConnected: "Um workspace do Notion est\xE1 conectado.",
  optionsNotionDisconnected: "O Notion ainda n\xE3o est\xE1 conectado.",
  optionsNotionConnectStarted: "A aba de conex\xE3o do Notion foi aberta. Volte aqui ap\xF3s a aprova\xE7\xE3o.",
  optionsNotionConnectFailed: "N\xE3o foi poss\xEDvel iniciar o fluxo de conex\xE3o do Notion.",
  optionsNotionDisconnectedSaved: "O workspace do Notion foi desconectado.",
  optionsNotionDisconnectFailed: "N\xE3o foi poss\xEDvel desconectar o Notion.",
  optionsNotionParentType: "Modo de salvamento",
  optionsNotionParentTypeHint: "Escolha se o destino padr\xE3o deve ser uma p\xE1gina ou uma base de dados no workspace conectado.",
  optionsNotionSelectedTarget: "Destino padr\xE3o",
  optionsNotionSelectedTargetHint: "\xC9 para onde o bot\xE3o de salvar enviar\xE1 novas capturas do Threads por padr\xE3o.",
  optionsNotionTargetNotSelected: "Nenhum destino padr\xE3o foi selecionado ainda.",
  optionsNotionTargetRequired: "Escolha primeiro um destino padr\xE3o no Notion.",
  optionsNotionTargetSaved: "O destino padr\xE3o do Notion foi salvo.",
  optionsNotionTargetSaveFailed: "N\xE3o foi poss\xEDvel salvar o destino padr\xE3o do Notion.",
  optionsNotionSearchLabel: "Encontrar um destino",
  optionsNotionSearchHint: "Pesquise p\xE1ginas ou bases de dados \xE0s quais voc\xEA concedeu acesso para esta integra\xE7\xE3o.",
  optionsNotionSearchButton: "Pesquisar destinos",
  optionsNotionResultsLabel: "Resultados",
  optionsNotionResultsHint: "Escolha um resultado e defina-o como destino padr\xE3o.",
  optionsNotionUseLocationButton: "Usar como destino padr\xE3o",
  optionsNotionSearchLoaded: "Destinos do Notion carregados.",
  optionsNotionSearchEmpty: "Nenhum destino correspondente do Notion foi encontrado.",
  optionsNotionSearchFailed: "N\xE3o foi poss\xEDvel carregar os destinos do Notion.",
  optionsNotionOAuthRequiresPro: "O salvamento no Notion via OAuth est\xE1 dispon\xEDvel apenas no Pro.",
  optionsNotionConnectFirst: "Conecte primeiro o Notion.",
  optionsNotionTokenHint: "Cole o token da integra\xE7\xE3o interna do Notion. Ele \xE9 salvo apenas neste perfil do navegador.",
  optionsNotionParentPageHint: "Voc\xEA pode colar a URL completa de uma p\xE1gina do Notion ou apenas o ID da p\xE1gina.",
  optionsNotionDataSourceHint: "Cole a URL completa de uma base de dados do Notion ou apenas o ID. T\xEDtulo, tags, datas e propriedades semelhantes ser\xE3o mapeados automaticamente quando poss\xEDvel.",
  optionsNotionDataSourceLocked: "O salvamento em base de dados est\xE1 dispon\xEDvel apenas no Pro.",
  optionsNotionUploadMedia: "Enviar m\xEDdia para o Notion",
  optionsNotionUploadMediaHint: "Envie imagens e v\xEDdeos como arquivos gerenciados pelo Notion em vez de mant\xEA-los como links remotos. Se o upload falhar, o salvamento volta para links.",
  optionsNotionUploadMediaLocked: "O upload de m\xEDdia gerenciado pelo Notion est\xE1 dispon\xEDvel apenas no Pro.",
  optionsNotionTokenRequired: "Um token de integra\xE7\xE3o do Notion \xE9 necess\xE1rio para usar o salvamento no Notion.",
  optionsNotionParentPageRequired: "Um ID ou URL de p\xE1gina m\xE3e do Notion \xE9 necess\xE1rio para usar o salvamento no Notion.",
  optionsNotionInvalidPage: "O formato do ID ou URL da p\xE1gina m\xE3e do Notion \xE9 inv\xE1lido.",
  optionsNotionDataSourceRequired: "Um ID ou URL da base de dados do Notion \xE9 necess\xE1rio para usar o salvamento em base de dados.",
  optionsNotionInvalidDataSource: "O formato do ID ou URL da base de dados do Notion \xE9 inv\xE1lido.",
  optionsNotionPermissionDenied: "A permiss\xE3o para acessar a API do Notion foi negada, ent\xE3o as configura\xE7\xF5es n\xE3o foram salvas.",
  optionsBasicSection: "Salvamento b\xE1sico",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Configura\xE7\xF5es Pro",
  optionsProSubtitle: "Abra apenas quando precisar. \xC9 aqui que ficam as regras e a organiza\xE7\xE3o por IA.",
  optionsProAiNote: "A IA n\xE3o est\xE1 inclu\xEDda automaticamente. Ela funciona somente depois que voc\xEA adiciona sua pr\xF3pria chave de API.",
  compareRowReplies: "Respostas em sequ\xEAncia",
  compareRowDuplicates: "Pular duplicados",
  compareRowFilename: "Formato do nome do arquivo",
  compareRowFolder: "Pasta de salvamento",
  compareRowNotionDataSource: "Base de dados do Notion",
  compareRowNotionMediaUpload: "Upload de m\xEDdia no Notion",
  optionsProStatusFree: "Voc\xEA est\xE1 no plano Free. O salvamento j\xE1 funciona, e o Pro s\xF3 \xE9 necess\xE1rio quando quiser regras ou IA.",
  optionsProStatusActive: "Pro ativo. A organiza\xE7\xE3o por regras e IA est\xE1 dispon\xEDvel abaixo.",
  optionsProStatusExpired: "Esta chave Pro expirou. O salvamento Free continua funcionando.",
  optionsProStatusInvalid: "Esta chave Pro n\xE3o \xE9 v\xE1lida. O salvamento Free continua funcionando.",
  optionsProStatusSeatLimit: "Esta chave Pro j\xE1 est\xE1 ativa em 3 dispositivos. Libere primeiro um deles em outro dispositivo.",
  optionsProStatusNeedsActivation: "A chave Pro \xE9 v\xE1lida, mas este dispositivo ainda n\xE3o tem um seat ativo.",
  optionsProStatusOffline: "N\xE3o foi poss\xEDvel alcan\xE7ar o servidor, ent\xE3o o estado de ativa\xE7\xE3o mais recente ser\xE1 usado.",
  optionsProStatusRevoked: "Esta chave Pro n\xE3o pode mais ser usada.",
  optionsProHolderLabel: "Titular",
  optionsProExpiresLabel: "Expira em",
  optionsProUnlockHint: "Cole a chave Pro enviada por e-mail para ativar neste navegador.",
  optionsProUnlockPlaceholder: "Cole sua chave Pro aqui",
  optionsProSalesLink: "Obter Pro",
  optionsProActivate: "Ativar Pro",
  optionsProClear: "Remover",
  optionsProActivated: "Pro ativado.",
  optionsProRemoved: "A chave Pro foi removida.",
  optionsProEmptyKey: "Digite primeiro uma chave Pro.",
  optionsProLocalOnly: "Os salvamentos no Obsidian ficam no seu dispositivo, e o Cloud save s\xF3 envia um post para sua conta do scrapbook quando voc\xEA escolhe essa op\xE7\xE3o.",
  optionsFileRules: "Regras de arquivo",
  optionsFilenamePattern: "Formato do nome do arquivo",
  optionsFilenamePatternLocked: "O plano Free usa um nome padr\xE3o. O Pro permite definir seu pr\xF3prio formato.",
  optionsSavePathPattern: "Caminho de subpasta",
  optionsSavePathTokens: "Exemplos: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "O plano Free salva na raiz da pasta conectada. O Pro permite classificar automaticamente em subpastas por data, autor ou t\xF3pico.",
  optionsFilenameTokens: "Dispon\xEDvel: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "Organiza\xE7\xE3o por IA",
  optionsAiSubtitle: "Escolha um provedor e a URL base padr\xE3o e o modelo ser\xE3o preenchidos para voc\xEA.",
  optionsAiQuickstart: "A maioria das pessoas s\xF3 precisa do provedor e da chave de API. Depois de alterar, pressione Salvar configura\xE7\xF5es abaixo para aplicar.",
  optionsAiAdvancedSummary: "Mostrar configura\xE7\xF5es avan\xE7adas",
  optionsAiEnable: "Ativar organiza\xE7\xE3o por IA",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini e Ollama podem come\xE7ar com presets. Custom \xE9 para qualquer endpoint compat\xEDvel com OpenAI.",
  optionsAiApiKeyHint: "As chaves do Gemini geralmente come\xE7am com AIza, enquanto as chaves do OpenAI/OpenRouter/DeepSeek geralmente come\xE7am com sk-. Deixe em branco apenas para endpoints locais como o Ollama quando nenhuma chave for necess\xE1ria.",
  optionsAiApiKeyRequired: "O provedor selecionado exige uma chave de API.",
  optionsAiKeyMismatchGemini: "O Gemini exige uma chave da API do Google Gemini. A chave atual parece ser compat\xEDvel com OpenAI.",
  optionsAiKeyMismatchOpenAi: "Os provedores OpenAI/OpenRouter/DeepSeek exigem a chave do pr\xF3prio servi\xE7o, n\xE3o uma chave Gemini que come\xE7a com AIza.",
  optionsAiModel: "Nome do modelo",
  optionsAiPrompt: "Prompt de organiza\xE7\xE3o",
  optionsAiPromptHint: "Descreva o tamanho do resumo, o estilo das tags e os campos de frontmatter desejados.",
  optionsAiLocked: "A organiza\xE7\xE3o por IA est\xE1 dispon\xEDvel apenas no Pro.",
  optionsAiInvalidBaseUrl: "A URL base da IA \xE9 inv\xE1lida.",
  optionsAiPermissionDenied: "A permiss\xE3o para o endpoint de IA selecionado foi negada, ent\xE3o as configura\xE7\xF5es n\xE3o foram salvas.",
  optionsAiSaved: "Configura\xE7\xF5es da IA e permiss\xE3o do endpoint salvas.",
  optionsIncludeImages: "Salvar imagens e v\xEDdeos",
  optionsSave: "Salvar configura\xE7\xF5es",
  optionsSaved: "Configura\xE7\xF5es salvas.",
  optionsPendingSave: "Alterado. Pressione Salvar configura\xE7\xF5es abaixo para aplicar.",
  optionsNoChanges: "Ainda n\xE3o h\xE1 altera\xE7\xF5es.",
  optionsStep1: "1. Conecte a pasta do Obsidian",
  optionsStep2: "2. Teste o salvamento gratuito primeiro",
  optionsStep3: "3. Ative o Pro quando quiser regras ou organiza\xE7\xE3o por IA",
  mdImageLabel: "Imagem",
  mdVideoLabel: "V\xEDdeo",
  mdVideoThumbnailLabel: "Miniatura do v\xEDdeo",
  mdVideoOnThreads: "Abrir no Threads",
  mdSavedVideoFile: "Arquivo de v\xEDdeo salvo",
  mdReplySection: "Respostas do autor",
  mdReplyLabel: "Resposta",
  mdReplyImageLabel: "Imagem da resposta",
  mdUploadedMediaSection: "M\xEDdia enviada",
  mdSource: "Origem",
  mdAuthor: "Autor",
  mdPublishedAt: "Publicado em",
  mdExternalLink: "Link externo",
  mdWarning: "Aviso",
  mdSummary: "Resumo da IA",
  warnImageAccessFailed: "N\xE3o foi poss\xEDvel salvar algumas imagens ou v\xEDdeos; os links originais foram mantidos.",
  warnImageDownloadOff: "O salvamento de imagem/v\xEDdeo est\xE1 desativado; os links originais foram mantidos.",
  warnAiFailed: "A organiza\xE7\xE3o por IA falhou, ent\xE3o a nota original foi salva: {reason}",
  warnAiPermissionMissing: "A permiss\xE3o para o endpoint de IA est\xE1 ausente, ent\xE3o a nota original foi salva. Salve novamente a se\xE7\xE3o de IA nas configura\xE7\xF5es.",
  warnAiMissingModel: "Nenhum nome de modelo de IA foi configurado, ent\xE3o a nota original foi salva.",
  warnNotionMediaUploadFailed: "O upload de m\xEDdia para o Notion falhou, ent\xE3o os links remotos foram salvos.",
  errBrowserUnsupported: "Este navegador n\xE3o consegue salvar diretamente em uma pasta do Obsidian.",
  errFolderNameFailed: "N\xE3o foi poss\xEDvel determinar um nome de pasta para salvar.",
  errInvalidPath: "Caminho de arquivo inv\xE1lido.",
  errNotionTokenMissing: "Nenhum token de integra\xE7\xE3o do Notion foi configurado.",
  errNotionPermissionMissing: "A permiss\xE3o para a API do Notion est\xE1 ausente. Salve novamente as configura\xE7\xF5es primeiro.",
  errNotionUnauthorized: "O token do Notion \xE9 inv\xE1lido ou expirou.",
  errNotionForbidden: "Esta integra\xE7\xE3o n\xE3o consegue acessar o destino do Notion selecionado. Verifique se a p\xE1gina ou base de dados foi compartilhada com a integra\xE7\xE3o.",
  errNotionParentNotFound: "A p\xE1gina ou base de dados do Notion selecionada n\xE3o foi encontrada. Verifique o ID e a conex\xE3o.",
  errNotionRateLimited: "H\xE1 solicita\xE7\xF5es demais ao Notion. Tente novamente em {seconds} segundos.",
  errNotionValidation: "A solicita\xE7\xE3o ao Notion n\xE3o \xE9 v\xE1lida.",
  errNotionRequestFailed: "A solicita\xE7\xE3o de salvamento no Notion falhou.",
  fallbackNoFolder: "Nenhuma pasta conectada,",
  fallbackPermissionDenied: "sem permiss\xE3o para a pasta,",
  fallbackDirectFailed: "n\xE3o foi poss\xEDvel salvar na pasta,",
  fallbackZipMessage: " ent\xE3o foi baixado como arquivo.",
  errNotPermalink: "Abra primeiro a p\xE1gina individual do post.",
  errPostContentNotFound: "N\xE3o foi poss\xEDvel carregar o conte\xFAdo do post. Verifique se voc\xEA est\xE1 conectado."
};
var es = {
  ...en,
  uiLanguageLabel: "Idioma",
  popupTitle: "Guardar publicaci\xF3n actual",
  popupSave: "Guardar publicaci\xF3n actual",
  popupSettings: "Configuraci\xF3n",
  popupPromoTitle: "\xC1rea reservada",
  popupPromoDescription: "Este espacio queda reservado para futuras gu\xEDas y recomendaciones.",
  popupSubtitleDirect: "Guardando directamente en tu carpeta conectada de Obsidian.",
  popupSubtitleDownload: "No hay carpeta conectada. Se descargar\xE1 como archivo. Conecta una carpeta en la configuraci\xF3n.",
  popupSubtitleConnected: "Guardando directamente en tu carpeta conectada de Obsidian.",
  popupSubtitlePermissionCheck: "La carpeta est\xE1 conectada, pero puede ser necesario volver a confirmar el permiso.",
  popupSubtitleNoFolder: "Guarda directamente cuando hay una carpeta conectada; en caso contrario, descarga un archivo.",
  popupSubtitleUnsupported: "Este navegador solo admite descargas de archivos.",
  popupSubtitleNotion: "Guardando en tu destino de Notion configurado.",
  popupSubtitleNotionSetup: "Para usar el guardado en Notion, primero configura el token y el destino.",
  popupSubtitleCloud: "Guardando en tu scrapbook en la nube de Threads Archive. Primero inicia sesi\xF3n en la web.",
  popupRecentSaves: "Guardados recientes",
  popupClearAll: "Borrar todo",
  popupEmpty: "Todav\xEDa no hay publicaciones guardadas.",
  popupResave: "Guardar de nuevo",
  popupExpand: "Expandir",
  popupCollapse: "Contraer",
  popupDelete: "Eliminar",
  popupOpenRemote: "Abrir remoto",
  popupCloudConnect: "Conectar Cloud",
  popupCloudDisconnect: "Desconectar Cloud",
  statusReady: "Listo para guardar desde la p\xE1gina individual de la publicaci\xF3n.",
  statusReadyDirect: "Listo. Pulsa para guardar directamente en tu carpeta de Obsidian.",
  statusReadyDownload: "Listo. Pulsa para descargar el archivo.",
  statusReadyCloud: "Listo. Pulsa para guardar en tu scrapbook en la nube de Threads Archive.",
  statusUnsupported: "Abre primero la p\xE1gina individual de la publicaci\xF3n.",
  statusNoTab: "No se pudo encontrar una pesta\xF1a activa.",
  statusSaving: "Guardando\u2026",
  statusSavedDirect: "Guardado directamente en tu carpeta de Obsidian.",
  statusSavedZip: "Guardado. La descarga ha comenzado.",
  statusSavedNotion: "Guardado en Notion.",
  statusSavedCloud: "Guardado en Threads Archive scrapbook.",
  statusDuplicate: "Ya estaba guardado, pero se actualiz\xF3 con el contenido m\xE1s reciente.",
  statusDuplicateWarning: "Ya estaba guardado, actualizado: ",
  statusAlreadySaved: "Esta publicaci\xF3n ya est\xE1 guardada. Usa \u201CGuardar de nuevo\u201D en guardados recientes para volver a guardarla.",
  statusNotionSetupRequired: "Para usar el guardado en Notion, primero configura el token y el destino.",
  statusError: "Ocurri\xF3 un error desconocido.",
  statusResaving: "Preparando tu archivo\u2026",
  statusResaved: "La descarga ha comenzado.",
  statusResavedNotion: "Guardado en Notion como una p\xE1gina nueva.",
  statusResavedCloud: "Guardado de nuevo en Threads Archive scrapbook.",
  statusCloudLoginRequired: "Para usar el guardado en la nube, inicia sesi\xF3n primero en threads-archive.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "Conecta primero la extensi\xF3n a tu Threads Archive scrapbook.",
  statusCloudSessionExpired: "La conexi\xF3n en la nube caduc\xF3. Vuelve a conectar la extensi\xF3n.",
  statusCloudOffline: "No se pudo verificar la conexi\xF3n en la nube. Revisa la red.",
  statusCloudConnected: "Threads Archive Cloud qued\xF3 conectado.",
  statusCloudDisconnected: "Threads Archive Cloud se desconect\xF3.",
  statusCloudLinkStarting: "Termina la conexi\xF3n con Threads Archive scrapbook en tu navegador.",
  statusRecentNotFound: "No se pudo encontrar el registro del guardado reciente.",
  statusDeletedRecent: "Eliminado de los guardados recientes.",
  statusClearedRecents: "Se borraron todos los guardados recientes.",
  statusExtractFailed: "No se pudo leer la publicaci\xF3n.",
  statusTabError: "No se pudo leer la informaci\xF3n de la pesta\xF1a activa.",
  statusRedownloadError: "Error durante la nueva descarga.",
  statusRetry: "Reintentar",
  statusResaveButton: "Guardar de nuevo",
  optionsTitle: "Guarda publicaciones de Threads en Obsidian, Threads Archive Cloud o Notion, con organizaci\xF3n autom\xE1tica.",
  optionsTitleObsidianOnly: "Guarda publicaciones de Threads en Obsidian o Threads Archive Cloud, con organizaci\xF3n autom\xE1tica.",
  optionsSubtitle: "Guardar es gratis. Pro solo cuando lo necesites.",
  optionsSubtitleObsidianOnly: "La interfaz actual muestra primero Obsidian y Cloud save, mientras Notion permanece oculto hasta que la integraci\xF3n est\xE9 lista.",
  optionsPlanSpotlightFreeCopy: "El guardado b\xE1sico ya est\xE1 listo para usarse.",
  optionsPlanSpotlightActiveTitle: "Pro activo",
  optionsPlanSpotlightActiveCopy: "Las funciones Pro est\xE1n habilitadas en este navegador.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro necesita activaci\xF3n",
  optionsPlanSpotlightNeedsActivationCopy: "La clave es v\xE1lida, pero este dispositivo a\xFAn no tiene un seat activo.",
  optionsAdSlotTitle: "Espacio reservado para anuncio",
  optionsAdSlotCopy: "Reservado para un futuro banner o aviso.",
  optionsFolderSection: "Conectar carpeta de Obsidian",
  optionsFolderStatus: "Comprobando la carpeta conectada\u2026",
  optionsFolderLabel: "Carpeta actual",
  optionsFolderNotConnected: "No conectada",
  optionsFolderConnect: "Conectar carpeta",
  optionsFolderDisconnect: "Desconectar",
  optionsFolderUnsupported: "La conexi\xF3n con carpetas no es compatible en este navegador",
  optionsFolderUnsupportedStatus: "Este navegador no puede guardar directamente en una carpeta. Los archivos se descargar\xE1n.",
  optionsFolderNotConnectedStatus: "No hay carpeta conectada. Los archivos se descargar\xE1n al guardar.",
  optionsFolderReady: "Carpeta conectada. Los archivos se guardar\xE1n directamente.",
  optionsFolderPermissionCheck: "Carpeta conectada. El permiso puede volver a confirmarse en el pr\xF3ximo guardado.",
  optionsFolderPermissionLost: "Se perdi\xF3 el permiso de la carpeta. Vuelve a conectar la carpeta.",
  optionsFolderChecked: "Se verific\xF3 la conexi\xF3n de la carpeta. Se intentar\xE1 el guardado directo.",
  optionsFolderCancelled: "Se cancel\xF3 la selecci\xF3n de carpeta.",
  optionsFolderError: "Error al conectar la carpeta.",
  optionsFolderConnectedSuccess: 'Se conect\xF3 la carpeta "{folder}".',
  optionsFolderPathLabel: "Ubicaci\xF3n actual de guardado",
  optionsFolderPathHint: "El navegador no puede exponer la ruta absoluta del sistema, por lo que este valor se mantiene relativo a la carpeta conectada.",
  optionsFolderPathUnavailable: "Se mostrar\xE1 despu\xE9s de conectar una carpeta",
  optionsSaveTarget: "Destino de guardado",
  optionsSaveTargetHint: "En PC puedes elegir Obsidian, Threads Archive Cloud o Notion como destino predeterminado.",
  optionsSaveTargetHintObsidianOnly: "La interfaz actual muestra primero Obsidian y Threads Archive Cloud. Notion permanece oculto en la configuraci\xF3n mientras se prepara internamente la integraci\xF3n.",
  optionsSaveTargetNotionHidden: "Notion (oculto por ahora)",
  optionsCloudRequiresPro: "El guardado en la nube est\xE1 disponible solo en Pro.",
  optionsCloudSection: "Conexi\xF3n con Threads Archive Cloud",
  optionsCloudStatusLabel: "Estado de la conexi\xF3n Cloud",
  optionsCloudStatusUnlinked: "Todav\xEDa no est\xE1 conectada.",
  optionsCloudStatusLinked: "Conectado como @{handle}.",
  optionsCloudStatusExpired: "La conexi\xF3n caduc\xF3. Vuelve a conectar la extensi\xF3n.",
  optionsCloudStatusOffline: "No se pudo alcanzar el servidor, as\xED que solo se muestra el \xFAltimo estado conocido.",
  optionsCloudConnectButton: "Conectar Cloud",
  optionsCloudDisconnectButton: "Desconectar Cloud",
  optionsCloudLinkHint: "El bot\xF3n de conexi\xF3n abre scrapbook en el navegador y vincula la cuenta iniciada con esta extensi\xF3n.",
  optionsNotionSection: "Conexi\xF3n con Notion",
  optionsNotionSubtitle: "Notion se conecta mediante OAuth, por lo que el navegador nunca pide un token interno. Con\xE9ctalo una vez, elige un destino predeterminado y despu\xE9s solo tendr\xE1s que guardar.",
  optionsNotionConnectionLabel: "Conexi\xF3n",
  optionsNotionDisconnectButton: "Desconectar",
  optionsNotionConnectHint: "Se abrir\xE1 una pesta\xF1a de aprobaci\xF3n de Notion. Despu\xE9s de aprobar, vuelve aqu\xED y el estado de conexi\xF3n se actualizar\xE1 autom\xE1ticamente.",
  optionsNotionConnected: "Hay un workspace de Notion conectado.",
  optionsNotionDisconnected: "Notion a\xFAn no est\xE1 conectado.",
  optionsNotionConnectStarted: "Se abri\xF3 la pesta\xF1a de conexi\xF3n de Notion. Vuelve aqu\xED despu\xE9s de aprobar.",
  optionsNotionConnectFailed: "No se pudo iniciar el flujo de conexi\xF3n de Notion.",
  optionsNotionDisconnectedSaved: "Se desconect\xF3 el workspace de Notion.",
  optionsNotionDisconnectFailed: "No se pudo desconectar Notion.",
  optionsNotionParentType: "Modo de guardado",
  optionsNotionParentTypeHint: "Elige si el destino predeterminado debe ser una p\xE1gina o una base de datos dentro del workspace conectado.",
  optionsNotionSelectedTarget: "Destino predeterminado",
  optionsNotionSelectedTargetHint: "Aqu\xED es donde el bot\xF3n Guardar enviar\xE1 por defecto las nuevas capturas de Threads.",
  optionsNotionTargetNotSelected: "Todav\xEDa no se ha seleccionado un destino predeterminado.",
  optionsNotionTargetRequired: "Primero elige un destino predeterminado de Notion.",
  optionsNotionTargetSaved: "Se guard\xF3 el destino predeterminado de Notion.",
  optionsNotionTargetSaveFailed: "No se pudo guardar el destino predeterminado de Notion.",
  optionsNotionSearchLabel: "Buscar un destino",
  optionsNotionSearchHint: "Busca p\xE1ginas o bases de datos a las que hayas dado acceso a esta integraci\xF3n.",
  optionsNotionSearchButton: "Buscar destinos",
  optionsNotionResultsLabel: "Resultados",
  optionsNotionResultsHint: "Elige un resultado y establ\xE9celo como destino predeterminado.",
  optionsNotionUseLocationButton: "Usar como destino predeterminado",
  optionsNotionSearchLoaded: "Se cargaron los destinos de Notion.",
  optionsNotionSearchEmpty: "No se encontraron destinos coincidentes de Notion.",
  optionsNotionSearchFailed: "No se pudieron cargar los destinos de Notion.",
  optionsNotionOAuthRequiresPro: "El guardado con OAuth de Notion est\xE1 disponible solo en Pro.",
  optionsNotionConnectFirst: "Conecta Notion primero.",
  optionsNotionTokenHint: "Pega tu token de integraci\xF3n interna de Notion. Solo se guarda en este perfil del navegador.",
  optionsNotionParentPageHint: "Puedes pegar una URL completa de p\xE1gina de Notion o solo el ID de la p\xE1gina.",
  optionsNotionDataSourceHint: "Pega una URL completa de una base de datos de Notion o solo su ID. El t\xEDtulo, las etiquetas, las fechas y propiedades similares se asignar\xE1n autom\xE1ticamente cuando sea posible.",
  optionsNotionDataSourceLocked: "El guardado en bases de datos est\xE1 disponible solo en Pro.",
  optionsNotionUploadMedia: "Subir archivos multimedia a Notion",
  optionsNotionUploadMediaHint: "Sube im\xE1genes y v\xEDdeos como archivos administrados por Notion en lugar de dejarlos como enlaces remotos. Si la subida falla, el guardado vuelve a enlaces.",
  optionsNotionUploadMediaLocked: "La subida de medios administrados por Notion est\xE1 disponible solo en Pro.",
  optionsNotionTokenRequired: "Se necesita un token de integraci\xF3n de Notion para usar el guardado en Notion.",
  optionsNotionParentPageRequired: "Se necesita un ID o URL de p\xE1gina principal de Notion para usar el guardado en Notion.",
  optionsNotionInvalidPage: "El formato del ID o URL de la p\xE1gina principal de Notion no es v\xE1lido.",
  optionsNotionDataSourceRequired: "Se necesita un ID o URL de base de datos de Notion para usar el guardado en base de datos.",
  optionsNotionInvalidDataSource: "El formato del ID o URL de la base de datos de Notion no es v\xE1lido.",
  optionsNotionPermissionDenied: "Se neg\xF3 el permiso para acceder a la API de Notion, por lo que la configuraci\xF3n no se guard\xF3.",
  optionsBasicSection: "Guardado b\xE1sico",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "Configuraci\xF3n Pro",
  optionsProSubtitle: "\xC1brelo solo cuando lo necesites. Aqu\xED viven las reglas y la organizaci\xF3n por IA.",
  optionsProAiNote: "La IA no est\xE1 incluida autom\xE1ticamente. Solo funciona despu\xE9s de agregar tu propia clave de API.",
  compareRowReplies: "Respuestas encadenadas",
  compareRowDuplicates: "Omitir duplicados",
  compareRowFilename: "Formato del nombre del archivo",
  compareRowFolder: "Carpeta de guardado",
  compareRowNotionDataSource: "Base de datos de Notion",
  compareRowNotionMediaUpload: "Subida de medios a Notion",
  optionsProStatusFree: "Est\xE1s en Free. El guardado ya funciona y Pro solo hace falta cuando quieres reglas o IA.",
  optionsProStatusActive: "Pro activo. La organizaci\xF3n por reglas e IA est\xE1 disponible a continuaci\xF3n.",
  optionsProStatusExpired: "Esta clave Pro ha caducado. El guardado Free sigue funcionando.",
  optionsProStatusInvalid: "Esta clave Pro no es v\xE1lida. El guardado Free sigue funcionando.",
  optionsProStatusSeatLimit: "Esta clave Pro ya est\xE1 activa en 3 dispositivos. Libera primero uno en otro dispositivo.",
  optionsProStatusNeedsActivation: "La clave Pro es v\xE1lida, pero este dispositivo a\xFAn no tiene un seat activo.",
  optionsProStatusOffline: "No se pudo llegar al servidor, as\xED que se usar\xE1 el estado de activaci\xF3n m\xE1s reciente.",
  optionsProStatusRevoked: "Esta clave Pro ya no se puede usar.",
  optionsProHolderLabel: "Titular",
  optionsProExpiresLabel: "Caduca",
  optionsProUnlockHint: "Pega la clave Pro recibida por correo para activarla en este navegador.",
  optionsProUnlockPlaceholder: "Pega aqu\xED tu clave Pro",
  optionsProSalesLink: "Obtener Pro",
  optionsProActivate: "Activar Pro",
  optionsProClear: "Quitar",
  optionsProActivated: "Pro activado.",
  optionsProRemoved: "La clave Pro se elimin\xF3.",
  optionsProEmptyKey: "Introduce primero una clave Pro.",
  optionsProLocalOnly: "Los guardados de Obsidian permanecen en tu dispositivo, y Cloud save solo env\xEDa una publicaci\xF3n a tu cuenta de scrapbook cuando t\xFA lo eliges.",
  optionsFileRules: "Reglas de archivo",
  optionsFilenamePattern: "Formato del nombre del archivo",
  optionsFilenamePatternLocked: "Free usa un nombre de archivo predeterminado. Pro te permite definir tu propio formato.",
  optionsSavePathPattern: "Ruta de subcarpeta",
  optionsSavePathTokens: "Ejemplos: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free guarda en la ra\xEDz de tu carpeta conectada. Pro te permite ordenar autom\xE1ticamente en subcarpetas por fecha, autor o tema.",
  optionsFilenameTokens: "Disponible: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "Organizaci\xF3n con IA",
  optionsAiSubtitle: "Elige un proveedor y se rellenar\xE1n por ti la URL base y el modelo predeterminados.",
  optionsAiQuickstart: "La mayor\xEDa de la gente solo necesita un proveedor y una clave de API. Despu\xE9s de cambiarlo, pulsa Guardar configuraci\xF3n abajo para aplicarlo.",
  optionsAiAdvancedSummary: "Mostrar configuraci\xF3n avanzada",
  optionsAiEnable: "Activar organizaci\xF3n con IA",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini y Ollama pueden empezar con presets. Custom es para cualquier endpoint compatible con OpenAI.",
  optionsAiApiKeyHint: "Las claves de Gemini suelen empezar por AIza, mientras que las claves de OpenAI/OpenRouter/DeepSeek suelen empezar por sk-. D\xE9jalo en blanco solo para endpoints locales como Ollama cuando no se requiera clave.",
  optionsAiApiKeyRequired: "El proveedor seleccionado requiere una clave de API.",
  optionsAiKeyMismatchGemini: "Gemini necesita una clave de la API de Google Gemini. La clave actual parece una clave compatible con OpenAI.",
  optionsAiKeyMismatchOpenAi: "Los proveedores OpenAI/OpenRouter/DeepSeek requieren su propia clave, no una clave de Gemini que empiece por AIza.",
  optionsAiModel: "Nombre del modelo",
  optionsAiPrompt: "Prompt de organizaci\xF3n",
  optionsAiPromptHint: "Describe la longitud del resumen, el estilo de las etiquetas y los campos de frontmatter que deseas.",
  optionsAiLocked: "La organizaci\xF3n con IA est\xE1 disponible solo en Pro.",
  optionsAiInvalidBaseUrl: "La URL base de IA no es v\xE1lida.",
  optionsAiPermissionDenied: "Se neg\xF3 el permiso para el endpoint de IA seleccionado, as\xED que la configuraci\xF3n no se guard\xF3.",
  optionsAiSaved: "Se guardaron la configuraci\xF3n de IA y el permiso del endpoint.",
  optionsIncludeImages: "Guardar im\xE1genes y archivos de v\xEDdeo",
  optionsSave: "Guardar configuraci\xF3n",
  optionsSaved: "Configuraci\xF3n guardada.",
  optionsPendingSave: "Hay cambios. Pulsa Guardar configuraci\xF3n abajo para aplicarlos.",
  optionsNoChanges: "Todav\xEDa no hay cambios.",
  optionsStep1: "1. Conecta la carpeta de Obsidian",
  optionsStep2: "2. Prueba primero el guardado gratuito",
  optionsStep3: "3. Activa Pro cuando quieras reglas u organizaci\xF3n con IA",
  mdImageLabel: "Imagen",
  mdVideoLabel: "V\xEDdeo",
  mdVideoThumbnailLabel: "Miniatura del v\xEDdeo",
  mdVideoOnThreads: "Abrir en Threads",
  mdSavedVideoFile: "Archivo de v\xEDdeo guardado",
  mdReplySection: "Respuestas del autor",
  mdReplyLabel: "Respuesta",
  mdReplyImageLabel: "Imagen de la respuesta",
  mdUploadedMediaSection: "Medios subidos",
  mdSource: "Fuente",
  mdAuthor: "Autor",
  mdPublishedAt: "Publicado el",
  mdExternalLink: "Enlace externo",
  mdWarning: "Advertencia",
  mdSummary: "Resumen de IA",
  warnImageAccessFailed: "No se pudieron guardar algunas im\xE1genes o v\xEDdeos; se conservaron los enlaces originales.",
  warnImageDownloadOff: "El guardado de im\xE1genes/v\xEDdeos est\xE1 desactivado; se conservaron los enlaces originales.",
  warnAiFailed: "La organizaci\xF3n con IA fall\xF3, as\xED que se guard\xF3 la nota original: {reason}",
  warnAiPermissionMissing: "Falta el permiso del endpoint de IA, as\xED que se guard\xF3 la nota original. Vuelve a guardar la secci\xF3n de IA en la configuraci\xF3n.",
  warnAiMissingModel: "No hay un nombre de modelo de IA configurado, as\xED que se guard\xF3 la nota original.",
  warnNotionMediaUploadFailed: "La subida de medios a Notion fall\xF3, as\xED que se guardaron los enlaces remotos.",
  errBrowserUnsupported: "Este navegador no puede guardar directamente en una carpeta de Obsidian.",
  errFolderNameFailed: "No se pudo determinar un nombre de carpeta para guardar.",
  errInvalidPath: "Ruta de archivo no v\xE1lida.",
  errNotionTokenMissing: "No hay configurado un token de integraci\xF3n de Notion.",
  errNotionPermissionMissing: "Falta el permiso para la API de Notion. Vuelve a guardar la configuraci\xF3n primero.",
  errNotionUnauthorized: "El token de Notion no es v\xE1lido o ha caducado.",
  errNotionForbidden: "Esta integraci\xF3n no puede acceder al destino de Notion seleccionado. Aseg\xFArate de que la p\xE1gina o la base de datos est\xE9 compartida con la integraci\xF3n.",
  errNotionParentNotFound: "No se encontr\xF3 la p\xE1gina o base de datos de Notion seleccionada. Comprueba el ID y la conexi\xF3n.",
  errNotionRateLimited: "Hay demasiadas solicitudes a Notion. Vuelve a intentarlo en {seconds} segundos.",
  errNotionValidation: "La solicitud a Notion no es v\xE1lida.",
  errNotionRequestFailed: "La solicitud de guardado en Notion fall\xF3.",
  fallbackNoFolder: "No hay carpeta conectada,",
  fallbackPermissionDenied: "no hay permiso para la carpeta,",
  fallbackDirectFailed: "no se pudo guardar en la carpeta,",
  fallbackZipMessage: " as\xED que se descarg\xF3 como archivo.",
  errNotPermalink: "Abre primero la p\xE1gina individual de la publicaci\xF3n.",
  errPostContentNotFound: "No se pudo cargar el contenido de la publicaci\xF3n. Aseg\xFArate de haber iniciado sesi\xF3n."
};
var zhTW = {
  ...en,
  uiLanguageLabel: "\u8A9E\u8A00",
  popupTitle: "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
  popupSave: "\u5132\u5B58\u76EE\u524D\u8CBC\u6587",
  popupSettings: "\u8A2D\u5B9A",
  popupPromoTitle: "\u4FDD\u7559\u5340\u57DF",
  popupPromoDescription: "\u9019\u500B\u5340\u57DF\u4FDD\u7559\u7D66\u4E4B\u5F8C\u7684\u8AAA\u660E\u8207\u63A8\u85A6\u5167\u5BB9\u3002",
  popupSubtitleDirect: "\u6B63\u5728\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u5DF2\u9023\u63A5\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  popupSubtitleDownload: "\u5C1A\u672A\u9023\u63A5\u8CC7\u6599\u593E\u3002\u5C07\u4EE5\u6A94\u6848\u5F62\u5F0F\u4E0B\u8F09\u3002\u8ACB\u5728\u8A2D\u5B9A\u4E2D\u9023\u63A5\u8CC7\u6599\u593E\u3002",
  popupSubtitleConnected: "\u6B63\u5728\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u5DF2\u9023\u63A5\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  popupSubtitlePermissionCheck: "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\uFF0C\u4F46\u53EF\u80FD\u9700\u8981\u91CD\u65B0\u78BA\u8A8D\u6B0A\u9650\u3002",
  popupSubtitleNoFolder: "\u82E5\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u5C31\u6703\u76F4\u63A5\u5132\u5B58\uFF0C\u5426\u5247\u6703\u4E0B\u8F09\u6A94\u6848\u3002",
  popupSubtitleUnsupported: "\u6B64\u700F\u89BD\u5668\u50C5\u652F\u63F4\u6A94\u6848\u4E0B\u8F09\u3002",
  popupSubtitleNotion: "\u6B63\u5728\u5132\u5B58\u5230\u4F60\u8A2D\u5B9A\u7684 Notion \u76EE\u7684\u5730\u3002",
  popupSubtitleNotionSetup: "\u82E5\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u8ACB\u5148\u5728\u8A2D\u5B9A\u4E2D\u586B\u5165 token \u8207\u76EE\u7684\u5730\u3002",
  popupSubtitleCloud: "\u6B63\u5728\u5132\u5B58\u5230\u4F60\u7684 Threads Archive \u96F2\u7AEF scrapbook\u3002\u8ACB\u5148\u5728\u7DB2\u9801\u4E0A\u767B\u5165\u3002",
  popupRecentSaves: "\u6700\u8FD1\u5132\u5B58",
  popupClearAll: "\u5168\u90E8\u6E05\u9664",
  popupEmpty: "\u76EE\u524D\u9084\u6C92\u6709\u5132\u5B58\u7684\u8CBC\u6587\u3002",
  popupResave: "\u91CD\u65B0\u5132\u5B58",
  popupExpand: "\u5C55\u958B",
  popupCollapse: "\u6536\u5408",
  popupDelete: "\u522A\u9664",
  popupOpenRemote: "\u958B\u555F\u9060\u7AEF\u9801\u9762",
  popupCloudConnect: "\u9023\u63A5 Cloud",
  popupCloudDisconnect: "\u4E2D\u65B7 Cloud \u9023\u63A5",
  statusReady: "\u5DF2\u53EF\u5F9E\u55AE\u7BC7\u8CBC\u6587\u9801\u9762\u9032\u884C\u5132\u5B58\u3002",
  statusReadyDirect: "\u5DF2\u6E96\u5099\u5B8C\u6210\u3002\u6309\u4E0B\u5373\u53EF\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  statusReadyDownload: "\u5DF2\u6E96\u5099\u5B8C\u6210\u3002\u6309\u4E0B\u5373\u53EF\u4E0B\u8F09\u6A94\u6848\u3002",
  statusReadyCloud: "\u5DF2\u6E96\u5099\u5B8C\u6210\u3002\u6309\u4E0B\u5373\u53EF\u5132\u5B58\u5230 Threads Archive \u96F2\u7AEF scrapbook\u3002",
  statusUnsupported: "\u8ACB\u5148\u6253\u958B\u55AE\u7BC7\u8CBC\u6587\u9801\u9762\u3002",
  statusNoTab: "\u627E\u4E0D\u5230\u4F5C\u7528\u4E2D\u7684\u5206\u9801\u3002",
  statusSaving: "\u5132\u5B58\u4E2D\u2026",
  statusSavedDirect: "\u5DF2\u76F4\u63A5\u5132\u5B58\u5230\u4F60\u7684 Obsidian \u8CC7\u6599\u593E\u3002",
  statusSavedZip: "\u5DF2\u5132\u5B58\uFF0C\u4E0B\u8F09\u5DF2\u958B\u59CB\u3002",
  statusSavedNotion: "\u5DF2\u5132\u5B58\u5230 Notion\u3002",
  statusSavedCloud: "\u5DF2\u5132\u5B58\u5230 Threads Archive scrapbook\u3002",
  statusDuplicate: "\u9019\u7BC7\u5167\u5BB9\u5DF2\u5132\u5B58\u904E\uFF0C\u4F46\u5DF2\u7528\u6700\u65B0\u5167\u5BB9\u66F4\u65B0\u3002",
  statusDuplicateWarning: "\u5DF2\u5132\u5B58\u904E\uFF0C\u5DF2\u66F4\u65B0\uFF1A",
  statusAlreadySaved: "\u9019\u7BC7\u8CBC\u6587\u5DF2\u7D93\u5132\u5B58\u904E\u3002\u82E5\u8981\u518D\u6B21\u5132\u5B58\uFF0C\u8ACB\u5F9E\u6700\u8FD1\u5132\u5B58\u4E2D\u4F7F\u7528\u300C\u91CD\u65B0\u5132\u5B58\u300D\u3002",
  statusNotionSetupRequired: "\u82E5\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u8ACB\u5148\u5728\u8A2D\u5B9A\u4E2D\u586B\u5165 token \u8207\u76EE\u7684\u5730\u3002",
  statusError: "\u767C\u751F\u672A\u77E5\u932F\u8AA4\u3002",
  statusResaving: "\u6B63\u5728\u6E96\u5099\u4F60\u7684\u6A94\u6848\u2026",
  statusResaved: "\u4E0B\u8F09\u5DF2\u958B\u59CB\u3002",
  statusResavedNotion: "\u5DF2\u4F5C\u70BA\u65B0\u9801\u9762\u91CD\u65B0\u5132\u5B58\u5230 Notion\u3002",
  statusResavedCloud: "\u5DF2\u518D\u6B21\u5132\u5B58\u5230 Threads Archive scrapbook\u3002",
  statusCloudLoginRequired: "\u82E5\u8981\u4F7F\u7528\u96F2\u7AEF\u5132\u5B58\uFF0C\u8ACB\u5148\u767B\u5165 threads-archive.dahanda.dev/scrapbook\u3002",
  statusCloudConnectRequired: "\u82E5\u8981\u4F7F\u7528\u96F2\u7AEF\u5132\u5B58\uFF0C\u8ACB\u5148\u5C07 extension \u9023\u63A5\u5230 Threads Archive scrapbook\u3002",
  statusCloudSessionExpired: "Cloud \u9023\u63A5\u5DF2\u904E\u671F\u3002\u8ACB\u91CD\u65B0\u9023\u63A5 extension\u3002",
  statusCloudOffline: "\u7121\u6CD5\u9A57\u8B49 Cloud \u9023\u63A5\u72C0\u614B\u3002\u8ACB\u6AA2\u67E5\u7DB2\u8DEF\u3002",
  statusCloudConnected: "\u5DF2\u5B8C\u6210 Threads Archive Cloud \u9023\u63A5\u3002",
  statusCloudDisconnected: "\u5DF2\u4E2D\u65B7 Threads Archive Cloud \u9023\u63A5\u3002",
  statusCloudLinkStarting: "\u8ACB\u5728\u700F\u89BD\u5668\u4E2D\u5B8C\u6210 Threads Archive scrapbook \u9023\u63A5\u3002",
  statusRecentNotFound: "\u627E\u4E0D\u5230\u6700\u8FD1\u5132\u5B58\u7684\u7D00\u9304\u3002",
  statusDeletedRecent: "\u5DF2\u5F9E\u6700\u8FD1\u5132\u5B58\u4E2D\u522A\u9664\u3002",
  statusClearedRecents: "\u6240\u6709\u6700\u8FD1\u5132\u5B58\u90FD\u5DF2\u6E05\u9664\u3002",
  statusExtractFailed: "\u7121\u6CD5\u8B80\u53D6\u8CBC\u6587\u5167\u5BB9\u3002",
  statusTabError: "\u7121\u6CD5\u8B80\u53D6\u76EE\u524D\u5206\u9801\u8CC7\u8A0A\u3002",
  statusRedownloadError: "\u91CD\u65B0\u4E0B\u8F09\u6642\u767C\u751F\u932F\u8AA4\u3002",
  statusRetry: "\u91CD\u8A66",
  statusResaveButton: "\u91CD\u65B0\u5132\u5B58",
  optionsTitle: "\u5C07 Threads \u8CBC\u6587\u5132\u5B58\u5230 Obsidian\u3001Threads Archive Cloud \u6216 Notion\uFF0C\u4E26\u81EA\u52D5\u6574\u7406\u3002",
  optionsTitleObsidianOnly: "\u5C07 Threads \u8CBC\u6587\u5132\u5B58\u5230 Obsidian \u6216 Threads Archive Cloud\uFF0C\u4E26\u81EA\u52D5\u6574\u7406\u3002",
  optionsSubtitle: "\u5132\u5B58\u514D\u8CBB\uFF0C\u9700\u8981\u6642\u518D\u5347\u7D1A Pro\u3002",
  optionsSubtitleObsidianOnly: "\u76EE\u524D\u4ECB\u9762\u6703\u5148\u63D0\u4F9B Obsidian \u8207 Cloud \u5132\u5B58\uFF0C\u800C Notion \u6703\u5728\u6574\u5408\u5B8C\u6210\u524D\u66AB\u6642\u96B1\u85CF\u3002",
  optionsPlanSpotlightFreeCopy: "\u57FA\u672C\u5132\u5B58\u529F\u80FD\u5DF2\u53EF\u7ACB\u5373\u4F7F\u7528\u3002",
  optionsPlanSpotlightActiveTitle: "Pro \u5DF2\u555F\u7528",
  optionsPlanSpotlightActiveCopy: "\u6B64\u700F\u89BD\u5668\u5DF2\u555F\u7528 Pro \u529F\u80FD\u3002",
  optionsPlanSpotlightNeedsActivationTitle: "Pro \u9700\u8981\u555F\u7528",
  optionsPlanSpotlightNeedsActivationCopy: "\u9019\u7D44\u91D1\u9470\u6709\u6548\uFF0C\u4F46\u6B64\u88DD\u7F6E\u5C1A\u672A\u555F\u7528 seat\u3002",
  optionsAdSlotTitle: "\u5EE3\u544A\u9810\u7559\u5340",
  optionsAdSlotCopy: "\u4FDD\u7559\u7D66\u672A\u4F86\u7684\u6A6B\u5E45\u6216\u516C\u544A\u3002",
  optionsFolderSection: "\u9023\u63A5 Obsidian \u8CC7\u6599\u593E",
  optionsFolderStatus: "\u6B63\u5728\u6AA2\u67E5\u5DF2\u9023\u63A5\u7684\u8CC7\u6599\u593E\u2026",
  optionsFolderLabel: "\u76EE\u524D\u8CC7\u6599\u593E",
  optionsFolderNotConnected: "\u5C1A\u672A\u9023\u63A5",
  optionsFolderConnect: "\u9023\u63A5\u8CC7\u6599\u593E",
  optionsFolderDisconnect: "\u4E2D\u65B7\u9023\u63A5",
  optionsFolderUnsupported: "\u6B64\u700F\u89BD\u5668\u4E0D\u652F\u63F4\u8CC7\u6599\u593E\u9023\u63A5",
  optionsFolderUnsupportedStatus: "\u6B64\u700F\u89BD\u5668\u7121\u6CD5\u76F4\u63A5\u5132\u5B58\u5230\u8CC7\u6599\u593E\uFF0C\u56E0\u6B64\u5C07\u6539\u70BA\u4E0B\u8F09\u6A94\u6848\u3002",
  optionsFolderNotConnectedStatus: "\u5C1A\u672A\u9023\u63A5\u8CC7\u6599\u593E\u3002\u5132\u5B58\u6642\u6703\u4E0B\u8F09\u6A94\u6848\u3002",
  optionsFolderReady: "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\u3002\u6A94\u6848\u5C07\u76F4\u63A5\u5132\u5B58\u3002",
  optionsFolderPermissionCheck: "\u8CC7\u6599\u593E\u5DF2\u9023\u63A5\u3002\u4E0B\u6B21\u5132\u5B58\u6642\u53EF\u80FD\u6703\u518D\u6B21\u78BA\u8A8D\u6B0A\u9650\u3002",
  optionsFolderPermissionLost: "\u8CC7\u6599\u593E\u6B0A\u9650\u5DF2\u907A\u5931\u3002\u8ACB\u91CD\u65B0\u9023\u63A5\u8CC7\u6599\u593E\u3002",
  optionsFolderChecked: "\u5DF2\u78BA\u8A8D\u8CC7\u6599\u593E\u9023\u63A5\u3002\u5C07\u5617\u8A66\u76F4\u63A5\u5132\u5B58\u3002",
  optionsFolderCancelled: "\u5DF2\u53D6\u6D88\u9078\u64C7\u8CC7\u6599\u593E\u3002",
  optionsFolderError: "\u9023\u63A5\u8CC7\u6599\u593E\u6642\u767C\u751F\u932F\u8AA4\u3002",
  optionsFolderConnectedSuccess: "\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u300C{folder}\u300D\u3002",
  optionsFolderPathLabel: "\u76EE\u524D\u5132\u5B58\u4F4D\u7F6E",
  optionsFolderPathHint: "\u700F\u89BD\u5668\u7121\u6CD5\u986F\u793A\u4F5C\u696D\u7CFB\u7D71\u7684\u7D55\u5C0D\u8DEF\u5F91\uFF0C\u56E0\u6B64\u9019\u88E1\u53EA\u6703\u986F\u793A\u76F8\u5C0D\u65BC\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u7684\u4F4D\u7F6E\u3002",
  optionsFolderPathUnavailable: "\u9023\u63A5\u8CC7\u6599\u593E\u5F8C\u986F\u793A",
  optionsSaveTarget: "\u5132\u5B58\u76EE\u6A19",
  optionsSaveTargetHint: "\u5728\u96FB\u8166\u4E0A\uFF0C\u4F60\u53EF\u4EE5\u5C07 Obsidian\u3001Threads Archive Cloud \u6216 Notion \u8A2D\u70BA\u9810\u8A2D\u5132\u5B58\u76EE\u6A19\u3002",
  optionsSaveTargetHintObsidianOnly: "\u76EE\u524D\u4ECB\u9762\u6703\u5148\u63D0\u4F9B Obsidian \u8207 Threads Archive Cloud\u3002Notion \u4ECD\u5728\u5167\u90E8\u6E96\u5099\u4E2D\uFF0C\u56E0\u6B64\u66AB\u6642\u96B1\u85CF\u3002",
  optionsSaveTargetNotionHidden: "Notion\uFF08\u66AB\u6642\u96B1\u85CF\uFF09",
  optionsCloudRequiresPro: "\u96F2\u7AEF\u5132\u5B58\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsCloudSection: "Threads Archive Cloud \u9023\u63A5",
  optionsCloudStatusLabel: "Cloud \u9023\u63A5\u72C0\u614B",
  optionsCloudStatusUnlinked: "\u5C1A\u672A\u9023\u63A5\u3002",
  optionsCloudStatusLinked: "\u5DF2\u9023\u63A5\u5230 @{handle}\u3002",
  optionsCloudStatusExpired: "\u9023\u63A5\u5DF2\u904E\u671F\u3002\u8ACB\u91CD\u65B0\u9023\u63A5 extension\u3002",
  optionsCloudStatusOffline: "\u76EE\u524D\u7121\u6CD5\u9023\u5230\u4F3A\u670D\u5668\uFF0C\u56E0\u6B64\u53EA\u986F\u793A\u6700\u5F8C\u4E00\u6B21\u5DF2\u77E5\u72C0\u614B\u3002",
  optionsCloudConnectButton: "\u9023\u63A5 Cloud",
  optionsCloudDisconnectButton: "\u4E2D\u65B7 Cloud \u9023\u63A5",
  optionsCloudLinkHint: "\u9023\u63A5\u6309\u9215\u6703\u5728\u700F\u89BD\u5668\u958B\u555F scrapbook\uFF0C\u4E26\u628A\u76EE\u524D\u767B\u5165\u7684\u5E33\u865F\u9023\u5230\u9019\u500B extension\u3002",
  optionsNotionSection: "Notion \u9023\u63A5",
  optionsNotionSubtitle: "Notion \u900F\u904E OAuth \u9023\u63A5\uFF0C\u56E0\u6B64\u700F\u89BD\u5668\u4E0D\u6703\u76F4\u63A5\u8981\u6C42 internal token\u3002\u9023\u63A5\u4E00\u6B21\u3001\u9078\u597D\u9810\u8A2D\u76EE\u7684\u5730\uFF0C\u4E4B\u5F8C\u5C31\u80FD\u76F4\u63A5\u5132\u5B58\u3002",
  optionsNotionConnectionLabel: "\u9023\u63A5\u72C0\u614B",
  optionsNotionDisconnectButton: "\u4E2D\u65B7\u9023\u63A5",
  optionsNotionConnectHint: "\u6703\u958B\u555F Notion \u6388\u6B0A\u5206\u9801\u3002\u6388\u6B0A\u5F8C\u56DE\u5230\u9019\u88E1\uFF0C\u9023\u63A5\u72C0\u614B\u6703\u81EA\u52D5\u66F4\u65B0\u3002",
  optionsNotionConnected: "\u5DF2\u9023\u63A5 Notion \u5DE5\u4F5C\u5340\u3002",
  optionsNotionDisconnected: "Notion \u5C1A\u672A\u9023\u63A5\u3002",
  optionsNotionConnectStarted: "\u5DF2\u958B\u555F Notion \u9023\u63A5\u5206\u9801\u3002\u6388\u6B0A\u5F8C\u8ACB\u56DE\u5230\u6B64\u9801\u3002",
  optionsNotionConnectFailed: "\u7121\u6CD5\u555F\u52D5 Notion \u9023\u63A5\u6D41\u7A0B\u3002",
  optionsNotionDisconnectedSaved: "\u5DF2\u4E2D\u65B7 Notion \u5DE5\u4F5C\u5340\u9023\u63A5\u3002",
  optionsNotionDisconnectFailed: "\u7121\u6CD5\u4E2D\u65B7 Notion \u9023\u63A5\u3002",
  optionsNotionParentType: "\u5132\u5B58\u6A21\u5F0F",
  optionsNotionParentTypeHint: "\u9078\u64C7\u9810\u8A2D\u76EE\u7684\u5730\u8981\u4F7F\u7528\u9801\u9762\u6216\u8CC7\u6599\u5EAB\u3002",
  optionsNotionSelectedTarget: "\u9810\u8A2D\u76EE\u7684\u5730",
  optionsNotionSelectedTargetHint: "\u5132\u5B58\u6309\u9215\u9810\u8A2D\u6703\u628A\u65B0\u7684 Threads \u64F7\u53D6\u5167\u5BB9\u9001\u5230\u9019\u88E1\u3002",
  optionsNotionTargetNotSelected: "\u5C1A\u672A\u9078\u64C7\u9810\u8A2D\u76EE\u7684\u5730\u3002",
  optionsNotionTargetRequired: "\u8ACB\u5148\u9078\u64C7\u9810\u8A2D\u7684 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionTargetSaved: "\u5DF2\u5132\u5B58\u9810\u8A2D Notion \u76EE\u7684\u5730\u3002",
  optionsNotionTargetSaveFailed: "\u7121\u6CD5\u5132\u5B58\u9810\u8A2D Notion \u76EE\u7684\u5730\u3002",
  optionsNotionSearchLabel: "\u5C0B\u627E\u76EE\u7684\u5730",
  optionsNotionSearchHint: "\u641C\u5C0B\u4F60\u5DF2\u6388\u6B0A\u6B64\u6574\u5408\u53EF\u5B58\u53D6\u7684\u9801\u9762\u6216\u8CC7\u6599\u5EAB\u3002",
  optionsNotionSearchButton: "\u641C\u5C0B\u76EE\u7684\u5730",
  optionsNotionResultsLabel: "\u7D50\u679C",
  optionsNotionResultsHint: "\u9078\u64C7\u5176\u4E2D\u4E00\u500B\u7D50\u679C\u4E26\u8A2D\u70BA\u9810\u8A2D\u5132\u5B58\u76EE\u7684\u5730\u3002",
  optionsNotionUseLocationButton: "\u8A2D\u70BA\u9810\u8A2D\u76EE\u7684\u5730",
  optionsNotionSearchLoaded: "\u5DF2\u8F09\u5165 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionSearchEmpty: "\u627E\u4E0D\u5230\u7B26\u5408\u7684 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionSearchFailed: "\u7121\u6CD5\u8F09\u5165 Notion \u76EE\u7684\u5730\u3002",
  optionsNotionOAuthRequiresPro: "Notion OAuth \u5132\u5B58\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsNotionConnectFirst: "\u8ACB\u5148\u9023\u63A5 Notion\u3002",
  optionsNotionTokenHint: "\u8CBC\u4E0A\u4F60\u7684 Notion internal integration token\u3002\u5B83\u53EA\u6703\u5132\u5B58\u5728\u6B64\u700F\u89BD\u5668\u8A2D\u5B9A\u6A94\u4E2D\u3002",
  optionsNotionParentPageHint: "\u4F60\u53EF\u4EE5\u8CBC\u4E0A\u5B8C\u6574\u7684 Notion \u9801\u9762\u7DB2\u5740\uFF0C\u6216\u53EA\u8CBC\u4E0A\u9801\u9762 ID\u3002",
  optionsNotionDataSourceHint: "\u8CBC\u4E0A\u5B8C\u6574\u7684 Notion \u8CC7\u6599\u5EAB\u7DB2\u5740\u6216\u5176 ID\u3002\u6A19\u984C\u3001\u6A19\u7C64\u3001\u65E5\u671F\u7B49\u5C6C\u6027\u6703\u5728\u53EF\u80FD\u6642\u81EA\u52D5\u5C0D\u61C9\u3002",
  optionsNotionDataSourceLocked: "\u8CC7\u6599\u5EAB\u5132\u5B58\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsNotionUploadMedia: "\u4E0A\u50B3\u5A92\u9AD4\u5230 Notion",
  optionsNotionUploadMediaHint: "\u5C07\u5716\u7247\u8207\u5F71\u7247\u4F5C\u70BA Notion \u7BA1\u7406\u7684\u6A94\u6848\u4E0A\u50B3\uFF0C\u800C\u4E0D\u662F\u50C5\u4FDD\u7559\u9060\u7AEF\u9023\u7D50\u3002\u82E5\u4E0A\u50B3\u5931\u6557\uFF0C\u6703\u9000\u56DE\u70BA\u9023\u7D50\u5132\u5B58\u3002",
  optionsNotionUploadMediaLocked: "Notion \u7BA1\u7406\u5A92\u9AD4\u4E0A\u50B3\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsNotionTokenRequired: "\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u5FC5\u9808\u63D0\u4F9B Notion integration token\u3002",
  optionsNotionParentPageRequired: "\u8981\u4F7F\u7528 Notion \u5132\u5B58\uFF0C\u5FC5\u9808\u63D0\u4F9B Notion \u7236\u9801\u9762 ID \u6216\u7DB2\u5740\u3002",
  optionsNotionInvalidPage: "Notion \u7236\u9801\u9762 ID \u6216\u7DB2\u5740\u683C\u5F0F\u7121\u6548\u3002",
  optionsNotionDataSourceRequired: "\u8981\u4F7F\u7528\u8CC7\u6599\u5EAB\u5132\u5B58\uFF0C\u5FC5\u9808\u63D0\u4F9B Notion \u8CC7\u6599\u5EAB ID \u6216\u7DB2\u5740\u3002",
  optionsNotionInvalidDataSource: "Notion \u8CC7\u6599\u5EAB ID \u6216\u7DB2\u5740\u683C\u5F0F\u7121\u6548\u3002",
  optionsNotionPermissionDenied: "Notion API \u6B0A\u9650\u906D\u62D2\uFF0C\u56E0\u6B64\u8A2D\u5B9A\u672A\u5132\u5B58\u3002",
  optionsBasicSection: "\u57FA\u672C\u5132\u5B58",
  optionsCompareSection: "Free \u8207 Pro",
  optionsProSection: "Pro \u8A2D\u5B9A",
  optionsProSubtitle: "\u9700\u8981\u6642\u518D\u6253\u958B\u3002\u898F\u5247\u8207 AI \u6574\u7406\u90FD\u5728\u9019\u88E1\u3002",
  optionsProAiNote: "AI \u4E0D\u6703\u81EA\u52D5\u9644\u5E36\u3002\u53EA\u6709\u52A0\u5165\u4F60\u81EA\u5DF1\u7684 API key \u5F8C\u624D\u6703\u904B\u4F5C\u3002",
  compareRowReplies: "\u4E32\u63A5\u56DE\u8986",
  compareRowDuplicates: "\u7565\u904E\u91CD\u8907",
  compareRowFilename: "\u6A94\u540D\u683C\u5F0F",
  compareRowFolder: "\u5132\u5B58\u8CC7\u6599\u593E",
  compareRowNotionDataSource: "Notion \u8CC7\u6599\u5EAB",
  compareRowNotionMediaUpload: "Notion \u5A92\u9AD4\u4E0A\u50B3",
  optionsProStatusFree: "\u4F60\u76EE\u524D\u4F7F\u7528 Free\u3002\u5132\u5B58\u529F\u80FD\u5DF2\u53EF\u4F7F\u7528\uFF0C\u53EA\u6709\u5728\u9700\u8981\u898F\u5247\u6216 AI \u6642\u624D\u9700\u8981 Pro\u3002",
  optionsProStatusActive: "Pro \u5DF2\u555F\u7528\u3002\u4E0B\u65B9\u53EF\u4F7F\u7528\u898F\u5247\u6574\u7406\u8207 AI\u3002",
  optionsProStatusExpired: "\u9019\u7D44 Pro \u91D1\u9470\u5DF2\u904E\u671F\u3002Free \u5132\u5B58\u4ECD\u53EF\u4F7F\u7528\u3002",
  optionsProStatusInvalid: "\u9019\u7D44 Pro \u91D1\u9470\u7121\u6548\u3002Free \u5132\u5B58\u4ECD\u53EF\u4F7F\u7528\u3002",
  optionsProStatusSeatLimit: "\u9019\u7D44 Pro \u91D1\u9470\u5DF2\u5728 3 \u53F0\u88DD\u7F6E\u555F\u7528\u3002\u8ACB\u5148\u5728\u5176\u4ED6\u88DD\u7F6E\u89E3\u9664\u5176\u4E2D\u4E00\u53F0\u3002",
  optionsProStatusNeedsActivation: "\u9019\u7D44 Pro \u91D1\u9470\u6709\u6548\uFF0C\u4F46\u6B64\u88DD\u7F6E\u5C1A\u672A\u555F\u7528 seat\u3002",
  optionsProStatusOffline: "\u7121\u6CD5\u9023\u63A5\u5230\u4F3A\u670D\u5668\uFF0C\u56E0\u6B64\u5C07\u6CBF\u7528\u6700\u8FD1\u4E00\u6B21\u7684\u555F\u7528\u72C0\u614B\u3002",
  optionsProStatusRevoked: "\u9019\u7D44 Pro \u91D1\u9470\u5DF2\u7121\u6CD5\u518D\u4F7F\u7528\u3002",
  optionsProHolderLabel: "\u6301\u6709\u4EBA",
  optionsProExpiresLabel: "\u5230\u671F\u65E5",
  optionsProUnlockHint: "\u8CBC\u4E0A\u8CFC\u8CB7\u90F5\u4EF6\u4E2D\u7684 Pro \u91D1\u9470\uFF0C\u5373\u53EF\u5728\u6B64\u700F\u89BD\u5668\u555F\u7528\u3002",
  optionsProUnlockPlaceholder: "\u5728\u9019\u88E1\u8CBC\u4E0A\u4F60\u7684 Pro \u91D1\u9470",
  optionsProSalesLink: "\u53D6\u5F97 Pro",
  optionsProActivate: "\u555F\u7528 Pro",
  optionsProClear: "\u79FB\u9664",
  optionsProActivated: "Pro \u5DF2\u555F\u7528\u3002",
  optionsProRemoved: "\u5DF2\u79FB\u9664 Pro \u91D1\u9470\u3002",
  optionsProEmptyKey: "\u8ACB\u5148\u8F38\u5165 Pro \u91D1\u9470\u3002",
  optionsProLocalOnly: "Obsidian \u5132\u5B58\u5167\u5BB9\u6703\u7559\u5728\u4F60\u7684\u88DD\u7F6E\u4E0A\uFF0C\u800C Cloud \u5132\u5B58\u4E5F\u53EA\u6703\u5728\u4F60\u9078\u64C7\u6642\uFF0C\u628A\u8CBC\u6587\u50B3\u9001\u5230\u4F60\u7684 scrapbook \u5E33\u865F\u3002",
  optionsFileRules: "\u6A94\u6848\u898F\u5247",
  optionsFilenamePattern: "\u6A94\u540D\u683C\u5F0F",
  optionsFilenamePatternLocked: "Free \u4F7F\u7528\u9810\u8A2D\u6A94\u540D\u3002Pro \u53EF\u8B93\u4F60\u81EA\u8A02\u683C\u5F0F\u3002",
  optionsSavePathPattern: "\u5B50\u8CC7\u6599\u593E\u8DEF\u5F91",
  optionsSavePathTokens: "\u7BC4\u4F8B\uFF1AInbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "Free \u6703\u5132\u5B58\u5230\u5DF2\u9023\u63A5\u8CC7\u6599\u593E\u7684\u6839\u76EE\u9304\u3002Pro \u53EF\u4F9D\u65E5\u671F\u3001\u4F5C\u8005\u6216\u4E3B\u984C\u81EA\u52D5\u6574\u7406\u5230\u5B50\u8CC7\u6599\u593E\u3002",
  optionsFilenameTokens: "\u53EF\u7528\uFF1A{date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "AI \u6574\u7406",
  optionsAiSubtitle: "\u9078\u64C7\u63D0\u4F9B\u8005\u5F8C\uFF0C\u9810\u8A2D\u7684 Base URL \u8207\u6A21\u578B\u6703\u81EA\u52D5\u5E36\u5165\u3002",
  optionsAiQuickstart: "\u5927\u591A\u6578\u4EBA\u53EA\u9700\u8981\u63D0\u4F9B\u8005\u8207 API key\u3002\u4FEE\u6539\u5F8C\u8ACB\u6309\u4E0B\u4E0B\u65B9\u7684\u300C\u5132\u5B58\u8A2D\u5B9A\u300D\u5957\u7528\u3002",
  optionsAiAdvancedSummary: "\u986F\u793A\u9032\u968E\u8A2D\u5B9A",
  optionsAiEnable: "\u555F\u7528 AI \u6574\u7406",
  optionsAiProviderHint: "OpenAI\u3001OpenRouter\u3001DeepSeek\u3001Gemini \u8207 Ollama \u90FD\u53EF\u4EE5\u5F9E\u9810\u8A2D\u503C\u958B\u59CB\u3002Custom \u7528\u65BC\u4EFB\u4F55 OpenAI \u76F8\u5BB9\u7AEF\u9EDE\u3002",
  optionsAiApiKeyHint: "Gemini \u91D1\u9470\u901A\u5E38\u4EE5 AIza \u958B\u982D\uFF0C\u800C OpenAI/OpenRouter/DeepSeek \u91D1\u9470\u901A\u5E38\u4EE5 sk- \u958B\u982D\u3002\u50CF Ollama \u9019\u985E\u672C\u5730\u7AEF\u9EDE\u82E5\u4E0D\u9700\u8981\u91D1\u9470\u53EF\u7559\u7A7A\u3002",
  optionsAiApiKeyRequired: "\u6240\u9078\u63D0\u4F9B\u8005\u9700\u8981 API key\u3002",
  optionsAiKeyMismatchGemini: "Gemini \u9700\u8981 Google Gemini API key\u3002\u4F60\u76EE\u524D\u7684\u91D1\u9470\u770B\u8D77\u4F86\u50CF\u662F OpenAI \u76F8\u5BB9\u91D1\u9470\u3002",
  optionsAiKeyMismatchOpenAi: "OpenAI/OpenRouter/DeepSeek \u9700\u8981\u5404\u81EA\u7684\u91D1\u9470\uFF0C\u800C\u4E0D\u662F\u4EE5 AIza \u958B\u982D\u7684 Gemini \u91D1\u9470\u3002",
  optionsAiModel: "\u6A21\u578B\u540D\u7A31",
  optionsAiPrompt: "\u6574\u7406\u63D0\u793A\u8A5E",
  optionsAiPromptHint: "\u8ACB\u63CF\u8FF0\u4F60\u5E0C\u671B\u7684\u6458\u8981\u9577\u5EA6\u3001\u6A19\u7C64\u98A8\u683C\u8207 frontmatter \u6B04\u4F4D\u3002",
  optionsAiLocked: "AI \u6574\u7406\u50C5\u5728 Pro \u63D0\u4F9B\u3002",
  optionsAiInvalidBaseUrl: "AI Base URL \u7121\u6548\u3002",
  optionsAiPermissionDenied: "\u6240\u9078 AI \u7AEF\u9EDE\u7684\u6B0A\u9650\u906D\u62D2\uFF0C\u56E0\u6B64\u8A2D\u5B9A\u672A\u5132\u5B58\u3002",
  optionsAiSaved: "\u5DF2\u5132\u5B58 AI \u8A2D\u5B9A\u8207\u7AEF\u9EDE\u6B0A\u9650\u3002",
  optionsIncludeImages: "\u5132\u5B58\u5716\u7247\u8207\u5F71\u7247\u6A94\u6848",
  optionsSave: "\u5132\u5B58\u8A2D\u5B9A",
  optionsSaved: "\u8A2D\u5B9A\u5DF2\u5132\u5B58\u3002",
  optionsPendingSave: "\u5DF2\u6709\u8B8A\u66F4\u3002\u8ACB\u6309\u4E0B\u65B9\u300C\u5132\u5B58\u8A2D\u5B9A\u300D\u5957\u7528\u3002",
  optionsNoChanges: "\u76EE\u524D\u6C92\u6709\u8B8A\u66F4\u3002",
  optionsStep1: "1. \u9023\u63A5 Obsidian \u8CC7\u6599\u593E",
  optionsStep2: "2. \u5148\u8A66\u7528\u514D\u8CBB\u5132\u5B58",
  optionsStep3: "3. \u9700\u8981\u898F\u5247\u6216 AI \u6574\u7406\u6642\u518D\u555F\u7528 Pro",
  mdImageLabel: "\u5716\u7247",
  mdVideoLabel: "\u5F71\u7247",
  mdVideoThumbnailLabel: "\u5F71\u7247\u7E2E\u5716",
  mdVideoOnThreads: "\u5728 Threads \u958B\u555F",
  mdSavedVideoFile: "\u5DF2\u5132\u5B58\u7684\u5F71\u7247\u6A94",
  mdReplySection: "\u4F5C\u8005\u56DE\u8986\u4E32",
  mdReplyLabel: "\u56DE\u8986",
  mdReplyImageLabel: "\u56DE\u8986\u5716\u7247",
  mdUploadedMediaSection: "\u5DF2\u4E0A\u50B3\u5A92\u9AD4",
  mdSource: "\u4F86\u6E90",
  mdAuthor: "\u4F5C\u8005",
  mdPublishedAt: "\u767C\u5E03\u6642\u9593",
  mdExternalLink: "\u5916\u90E8\u9023\u7D50",
  mdWarning: "\u8B66\u544A",
  mdSummary: "AI \u6458\u8981",
  warnImageAccessFailed: "\u90E8\u5206\u5716\u7247\u6216\u5F71\u7247\u7121\u6CD5\u5132\u5B58\uFF0C\u56E0\u6B64\u4FDD\u7559\u4E86\u539F\u59CB\u9023\u7D50\u3002",
  warnImageDownloadOff: "\u5716\u7247\uFF0F\u5F71\u7247\u5132\u5B58\u5DF2\u95DC\u9589\uFF0C\u56E0\u6B64\u4FDD\u7559\u4E86\u539F\u59CB\u9023\u7D50\u3002",
  warnAiFailed: "AI \u6574\u7406\u5931\u6557\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u539F\u59CB\u7B46\u8A18\uFF1A{reason}",
  warnAiPermissionMissing: "\u7F3A\u5C11 AI \u7AEF\u9EDE\u6B0A\u9650\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u539F\u59CB\u7B46\u8A18\u3002\u8ACB\u5728\u8A2D\u5B9A\u4E2D\u91CD\u65B0\u5132\u5B58 AI \u5340\u584A\u3002",
  warnAiMissingModel: "\u5C1A\u672A\u8A2D\u5B9A AI \u6A21\u578B\u540D\u7A31\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u539F\u59CB\u7B46\u8A18\u3002",
  warnNotionMediaUploadFailed: "\u4E0A\u50B3\u5A92\u9AD4\u5230 Notion \u5931\u6557\uFF0C\u56E0\u6B64\u6539\u70BA\u5132\u5B58\u9060\u7AEF\u9023\u7D50\u3002",
  errBrowserUnsupported: "\u6B64\u700F\u89BD\u5668\u7121\u6CD5\u76F4\u63A5\u5132\u5B58\u5230 Obsidian \u8CC7\u6599\u593E\u3002",
  errFolderNameFailed: "\u7121\u6CD5\u6C7A\u5B9A\u8981\u5132\u5B58\u7684\u8CC7\u6599\u593E\u540D\u7A31\u3002",
  errInvalidPath: "\u7121\u6548\u7684\u6A94\u6848\u8DEF\u5F91\u3002",
  errNotionTokenMissing: "\u5C1A\u672A\u8A2D\u5B9A Notion integration token\u3002",
  errNotionPermissionMissing: "\u7F3A\u5C11 Notion API \u6B0A\u9650\u3002\u8ACB\u5148\u91CD\u65B0\u5132\u5B58\u8A2D\u5B9A\u3002",
  errNotionUnauthorized: "Notion token \u7121\u6548\u6216\u5DF2\u904E\u671F\u3002",
  errNotionForbidden: "\u6B64\u6574\u5408\u7121\u6CD5\u5B58\u53D6\u6240\u9078\u7684 Notion \u76EE\u7684\u5730\u3002\u8ACB\u78BA\u8A8D\u8A72\u9801\u9762\u6216\u8CC7\u6599\u5EAB\u5DF2\u8207\u6574\u5408\u5206\u4EAB\u3002",
  errNotionParentNotFound: "\u627E\u4E0D\u5230\u6240\u9078\u7684 Notion \u9801\u9762\u6216\u8CC7\u6599\u5EAB\u3002\u8ACB\u6AA2\u67E5 ID \u8207\u9023\u63A5\u72C0\u614B\u3002",
  errNotionRateLimited: "Notion \u8ACB\u6C42\u904E\u591A\u3002\u8ACB\u5728 {seconds} \u79D2\u5F8C\u518D\u8A66\u4E00\u6B21\u3002",
  errNotionValidation: "Notion \u8ACB\u6C42\u7121\u6548\u3002",
  errNotionRequestFailed: "Notion \u5132\u5B58\u8ACB\u6C42\u5931\u6557\u3002",
  fallbackNoFolder: "\u5C1A\u672A\u9023\u63A5\u8CC7\u6599\u593E\uFF0C",
  fallbackPermissionDenied: "\u7F3A\u5C11\u8CC7\u6599\u593E\u6B0A\u9650\uFF0C",
  fallbackDirectFailed: "\u7121\u6CD5\u5132\u5B58\u5230\u8CC7\u6599\u593E\uFF0C",
  fallbackZipMessage: " \u56E0\u6B64\u6539\u70BA\u4E0B\u8F09\u6A94\u6848\u3002",
  errNotPermalink: "\u8ACB\u5148\u6253\u958B\u55AE\u7BC7\u8CBC\u6587\u9801\u9762\u3002",
  errPostContentNotFound: "\u7121\u6CD5\u8F09\u5165\u8CBC\u6587\u5167\u5BB9\u3002\u8ACB\u78BA\u8A8D\u4F60\u5DF2\u767B\u5165\u3002"
};
var vi = {
  ...en,
  uiLanguageLabel: "Ng\xF4n ng\u1EEF",
  popupTitle: "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
  popupSave: "L\u01B0u b\xE0i vi\u1EBFt hi\u1EC7n t\u1EA1i",
  popupSettings: "C\xE0i \u0111\u1EB7t",
  popupPromoTitle: "Khu v\u1EF1c d\u1EF1 tr\u1EEF",
  popupPromoDescription: "Khu v\u1EF1c n\xE0y \u0111\u01B0\u1EE3c d\xE0nh s\u1EB5n cho h\u01B0\u1EDBng d\u1EABn v\xE0 g\u1EE3i \xFD trong t\u01B0\u01A1ng lai.",
  popupSubtitleDirect: "\u0110ang l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian \u0111\xE3 k\u1EBFt n\u1ED1i.",
  popupSubtitleDownload: "Ch\u01B0a k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c. B\xE0i vi\u1EBFt s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng d\u01B0\u1EDBi d\u1EA1ng t\u1EC7p. H\xE3y k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c trong ph\u1EA7n c\xE0i \u0111\u1EB7t.",
  popupSubtitleConnected: "\u0110ang l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian \u0111\xE3 k\u1EBFt n\u1ED1i.",
  popupSubtitlePermissionCheck: "Th\u01B0 m\u1EE5c \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i, nh\u01B0ng c\xF3 th\u1EC3 c\u1EA7n x\xE1c nh\u1EADn l\u1EA1i quy\u1EC1n truy c\u1EADp.",
  popupSubtitleNoFolder: "N\u1EBFu c\xF3 th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i th\xEC s\u1EBD l\u01B0u tr\u1EF1c ti\u1EBFp, n\u1EBFu kh\xF4ng s\u1EBD t\u1EA3i xu\u1ED1ng t\u1EC7p.",
  popupSubtitleUnsupported: "Tr\xECnh duy\u1EC7t n\xE0y ch\u1EC9 h\u1ED7 tr\u1EE3 t\u1EA3i t\u1EC7p xu\u1ED1ng.",
  popupSubtitleNotion: "\u0110ang l\u01B0u v\xE0o \u0111\xEDch Notion \u0111\xE3 c\u1EA5u h\xECnh.",
  popupSubtitleNotionSetup: "\u0110\u1EC3 d\xF9ng l\u01B0u v\xE0o Notion, tr\u01B0\u1EDBc ti\xEAn h\xE3y nh\u1EADp token v\xE0 \u0111\xEDch l\u01B0u trong ph\u1EA7n c\xE0i \u0111\u1EB7t.",
  popupSubtitleCloud: "\u0110ang l\u01B0u v\xE0o scrapbook \u0111\xE1m m\xE2y c\u1EE7a Threads Archive. H\xE3y \u0111\u0103ng nh\u1EADp tr\xEAn web tr\u01B0\u1EDBc.",
  popupRecentSaves: "L\u1EA7n l\u01B0u g\u1EA7n \u0111\xE2y",
  popupClearAll: "X\xF3a t\u1EA5t c\u1EA3",
  popupEmpty: "Ch\u01B0a c\xF3 b\xE0i vi\u1EBFt n\xE0o \u0111\u01B0\u1EE3c l\u01B0u.",
  popupResave: "L\u01B0u l\u1EA1i",
  popupExpand: "M\u1EDF r\u1ED9ng",
  popupCollapse: "Thu g\u1ECDn",
  popupDelete: "X\xF3a",
  popupOpenRemote: "M\u1EDF t\u1EEB xa",
  popupCloudConnect: "K\u1EBFt n\u1ED1i Cloud",
  popupCloudDisconnect: "Ng\u1EAFt k\u1EBFt n\u1ED1i Cloud",
  statusReady: "\u0110\xE3 s\u1EB5n s\xE0ng \u0111\u1EC3 l\u01B0u t\u1EEB trang permalink c\u1EE7a b\xE0i vi\u1EBFt.",
  statusReadyDirect: "\u0110\xE3 s\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian.",
  statusReadyDownload: "\u0110\xE3 s\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 t\u1EA3i t\u1EC7p xu\u1ED1ng.",
  statusReadyCloud: "\u0110\xE3 s\u1EB5n s\xE0ng. Nh\u1EA5n \u0111\u1EC3 l\u01B0u v\xE0o scrapbook \u0111\xE1m m\xE2y c\u1EE7a Threads Archive.",
  statusUnsupported: "Vui l\xF2ng m\u1EDF trang b\xE0i vi\u1EBFt ri\xEAng l\u1EBB tr\u01B0\u1EDBc.",
  statusNoTab: "Kh\xF4ng t\xECm th\u1EA5y tab \u0111ang ho\u1EA1t \u0111\u1ED9ng.",
  statusSaving: "\u0110ang l\u01B0u\u2026",
  statusSavedDirect: "\u0110\xE3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian.",
  statusSavedZip: "\u0110\xE3 l\u01B0u. Qu\xE1 tr\xECnh t\u1EA3i xu\u1ED1ng \u0111\xE3 b\u1EAFt \u0111\u1EA7u.",
  statusSavedNotion: "\u0110\xE3 l\u01B0u v\xE0o Notion.",
  statusSavedCloud: "\u0110\xE3 l\u01B0u v\xE0o Threads Archive scrapbook.",
  statusDuplicate: "B\xE0i vi\u1EBFt n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u tr\u01B0\u1EDBc \u0111\xF3, nh\u01B0ng \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt b\u1EB1ng n\u1ED9i dung m\u1EDBi nh\u1EA5t.",
  statusDuplicateWarning: "\u0110\xE3 l\u01B0u tr\u01B0\u1EDBc \u0111\xF3, \u0111\xE3 c\u1EADp nh\u1EADt: ",
  statusAlreadySaved: "B\xE0i vi\u1EBFt n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u r\u1ED3i. H\xE3y d\xF9ng \u201CL\u01B0u l\u1EA1i\u201D trong m\u1EE5c l\u01B0u g\u1EA7n \u0111\xE2y \u0111\u1EC3 l\u01B0u th\xEAm l\u1EA7n n\u1EEFa.",
  statusNotionSetupRequired: "\u0110\u1EC3 d\xF9ng l\u01B0u v\xE0o Notion, tr\u01B0\u1EDBc ti\xEAn h\xE3y nh\u1EADp token v\xE0 \u0111\xEDch l\u01B0u trong ph\u1EA7n c\xE0i \u0111\u1EB7t.",
  statusError: "\u0110\xE3 x\u1EA3y ra l\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh.",
  statusResaving: "\u0110ang chu\u1EA9n b\u1ECB t\u1EC7p c\u1EE7a b\u1EA1n\u2026",
  statusResaved: "Qu\xE1 tr\xECnh t\u1EA3i xu\u1ED1ng \u0111\xE3 b\u1EAFt \u0111\u1EA7u.",
  statusResavedNotion: "\u0110\xE3 l\u01B0u l\u1EA1i v\xE0o Notion nh\u01B0 m\u1ED9t trang m\u1EDBi.",
  statusResavedCloud: "\u0110\xE3 l\u01B0u l\u1EA1i v\xE0o Threads Archive scrapbook.",
  statusCloudLoginRequired: "\u0110\u1EC3 d\xF9ng l\u01B0u \u0111\xE1m m\xE2y, tr\u01B0\u1EDBc ti\xEAn h\xE3y \u0111\u0103ng nh\u1EADp t\u1EA1i threads-archive.dahanda.dev/scrapbook.",
  statusCloudConnectRequired: "H\xE3y k\u1EBFt n\u1ED1i extension v\u1EDBi Threads Archive scrapbook tr\u01B0\u1EDBc khi d\xF9ng l\u01B0u \u0111\xE1m m\xE2y.",
  statusCloudSessionExpired: "K\u1EBFt n\u1ED1i \u0111\xE1m m\xE2y \u0111\xE3 h\u1EBFt h\u1EA1n. H\xE3y k\u1EBFt n\u1ED1i l\u1EA1i extension.",
  statusCloudOffline: "Kh\xF4ng th\u1EC3 x\xE1c minh k\u1EBFt n\u1ED1i \u0111\xE1m m\xE2y. H\xE3y ki\u1EC3m tra m\u1EA1ng.",
  statusCloudConnected: "Threads Archive Cloud \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  statusCloudDisconnected: "Threads Archive Cloud \u0111\xE3 b\u1ECB ng\u1EAFt k\u1EBFt n\u1ED1i.",
  statusCloudLinkStarting: "H\xE3y ho\xE0n t\u1EA5t vi\u1EC7c k\u1EBFt n\u1ED1i Threads Archive scrapbook trong tr\xECnh duy\u1EC7t.",
  statusRecentNotFound: "Kh\xF4ng t\xECm th\u1EA5y b\u1EA3n ghi l\u01B0u g\u1EA7n \u0111\xE2y.",
  statusDeletedRecent: "\u0110\xE3 x\xF3a kh\u1ECFi m\u1EE5c l\u01B0u g\u1EA7n \u0111\xE2y.",
  statusClearedRecents: "\u0110\xE3 x\xF3a to\xE0n b\u1ED9 m\u1EE5c l\u01B0u g\u1EA7n \u0111\xE2y.",
  statusExtractFailed: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc b\xE0i vi\u1EBFt.",
  statusTabError: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc th\xF4ng tin c\u1EE7a tab hi\u1EC7n t\u1EA1i.",
  statusRedownloadError: "\u0110\xE3 x\u1EA3y ra l\u1ED7i khi t\u1EA3i l\u1EA1i.",
  statusRetry: "Th\u1EED l\u1EA1i",
  statusResaveButton: "L\u01B0u l\u1EA1i",
  optionsTitle: "L\u01B0u b\xE0i vi\u1EBFt Threads v\xE0o Obsidian, Threads Archive Cloud ho\u1EB7c Notion, k\xE8m t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp.",
  optionsTitleObsidianOnly: "L\u01B0u b\xE0i vi\u1EBFt Threads v\xE0o Obsidian ho\u1EB7c Threads Archive Cloud, k\xE8m t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp.",
  optionsSubtitle: "L\u01B0u mi\u1EC5n ph\xED. Ch\u1EC9 c\u1EA7n Pro khi th\u1EADt s\u1EF1 c\u1EA7n.",
  optionsSubtitleObsidianOnly: "Giao di\u1EC7n hi\u1EC7n t\u1EA1i \u01B0u ti\xEAn Obsidian v\xE0 Cloud save tr\u01B0\u1EDBc, c\xF2n Notion s\u1EBD \u0111\u01B0\u1EE3c \u1EA9n cho \u0111\u1EBFn khi t\xEDch h\u1EE3p s\u1EB5n s\xE0ng.",
  optionsPlanSpotlightFreeCopy: "T\xEDnh n\u0103ng l\u01B0u c\u01A1 b\u1EA3n \u0111\xE3 s\u1EB5n s\xE0ng \u0111\u1EC3 d\xF9ng.",
  optionsPlanSpotlightActiveTitle: "Pro \u0111ang ho\u1EA1t \u0111\u1ED9ng",
  optionsPlanSpotlightActiveCopy: "C\xE1c t\xEDnh n\u0103ng Pro \u0111\xE3 \u0111\u01B0\u1EE3c b\u1EADt tr\xEAn tr\xECnh duy\u1EC7t n\xE0y.",
  optionsPlanSpotlightNeedsActivationTitle: "Pro c\u1EA7n \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t",
  optionsPlanSpotlightNeedsActivationCopy: "Kh\xF3a n\xE0y h\u1EE3p l\u1EC7, nh\u01B0ng thi\u1EBFt b\u1ECB n\xE0y v\u1EABn ch\u01B0a c\xF3 seat \u0111ang ho\u1EA1t \u0111\u1ED9ng.",
  optionsAdSlotTitle: "V\u1ECB tr\xED qu\u1EA3ng c\xE1o d\u1EF1 ph\xF2ng",
  optionsAdSlotCopy: "\u0110\u01B0\u1EE3c d\xE0nh s\u1EB5n cho banner ho\u1EB7c th\xF4ng b\xE1o trong t\u01B0\u01A1ng lai.",
  optionsFolderSection: "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian",
  optionsFolderStatus: "\u0110ang ki\u1EC3m tra th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i\u2026",
  optionsFolderLabel: "Th\u01B0 m\u1EE5c hi\u1EC7n t\u1EA1i",
  optionsFolderNotConnected: "Ch\u01B0a k\u1EBFt n\u1ED1i",
  optionsFolderConnect: "K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c",
  optionsFolderDisconnect: "Ng\u1EAFt k\u1EBFt n\u1ED1i",
  optionsFolderUnsupported: "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng h\u1ED7 tr\u1EE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c",
  optionsFolderUnsupportedStatus: "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng th\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c. T\u1EC7p s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng thay th\u1EBF.",
  optionsFolderNotConnectedStatus: "Ch\u01B0a c\xF3 th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. Khi l\u01B0u, t\u1EC7p s\u1EBD \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng.",
  optionsFolderReady: "Th\u01B0 m\u1EE5c \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. T\u1EC7p s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u tr\u1EF1c ti\u1EBFp.",
  optionsFolderPermissionCheck: "Th\u01B0 m\u1EE5c \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i. \u1EDE l\u1EA7n l\u01B0u ti\u1EBFp theo c\xF3 th\u1EC3 s\u1EBD c\u1EA7n x\xE1c nh\u1EADn l\u1EA1i quy\u1EC1n truy c\u1EADp.",
  optionsFolderPermissionLost: "Quy\u1EC1n truy c\u1EADp th\u01B0 m\u1EE5c \u0111\xE3 b\u1ECB m\u1EA5t. Vui l\xF2ng k\u1EBFt n\u1ED1i l\u1EA1i th\u01B0 m\u1EE5c.",
  optionsFolderChecked: "\u0110\xE3 x\xE1c nh\u1EADn k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c. H\u1EC7 th\u1ED1ng s\u1EBD th\u1EED l\u01B0u tr\u1EF1c ti\u1EBFp.",
  optionsFolderCancelled: "\u0110\xE3 h\u1EE7y ch\u1ECDn th\u01B0 m\u1EE5c.",
  optionsFolderError: "\u0110\xE3 x\u1EA3y ra l\u1ED7i khi k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c.",
  optionsFolderConnectedSuccess: '\u0110\xE3 k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c "{folder}".',
  optionsFolderPathLabel: "V\u1ECB tr\xED l\u01B0u hi\u1EC7n t\u1EA1i",
  optionsFolderPathHint: "Tr\xECnh duy\u1EC7t kh\xF4ng th\u1EC3 hi\u1EC3n th\u1ECB \u0111\u01B0\u1EDDng d\u1EABn tuy\u1EC7t \u0111\u1ED1i c\u1EE7a h\u1EC7 \u0111i\u1EC1u h\xE0nh, n\xEAn gi\xE1 tr\u1ECB n\xE0y s\u1EBD \u0111\u01B0\u1EE3c hi\u1EC3n th\u1ECB t\u01B0\u01A1ng \u0111\u1ED1i theo th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i.",
  optionsFolderPathUnavailable: "S\u1EBD hi\u1EC3n th\u1ECB sau khi b\u1EA1n k\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c",
  optionsSaveTarget: "\u0110\xEDch l\u01B0u",
  optionsSaveTargetHint: "Tr\xEAn m\xE1y t\xEDnh, b\u1EA1n c\xF3 th\u1EC3 ch\u1ECDn Obsidian, Threads Archive Cloud ho\u1EB7c Notion l\xE0m \u0111\xEDch m\u1EB7c \u0111\u1ECBnh.",
  optionsSaveTargetHintObsidianOnly: "Giao di\u1EC7n hi\u1EC7n t\u1EA1i \u01B0u ti\xEAn Obsidian v\xE0 Threads Archive Cloud. Notion v\u1EABn b\u1ECB \u1EA9n trong ph\u1EA7n c\xE0i \u0111\u1EB7t trong khi t\xEDch h\u1EE3p \u0111ang \u0111\u01B0\u1EE3c chu\u1EA9n b\u1ECB.",
  optionsSaveTargetNotionHidden: "Notion (t\u1EA1m th\u1EDDi \u1EA9n)",
  optionsCloudRequiresPro: "Cloud save ch\u1EC9 kh\u1EA3 d\u1EE5ng trong Pro.",
  optionsCloudSection: "K\u1EBFt n\u1ED1i Threads Archive Cloud",
  optionsCloudStatusLabel: "Tr\u1EA1ng th\xE1i k\u1EBFt n\u1ED1i Cloud",
  optionsCloudStatusUnlinked: "Ch\u01B0a \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  optionsCloudStatusLinked: "\u0110\xE3 k\u1EBFt n\u1ED1i v\u1EDBi @{handle}.",
  optionsCloudStatusExpired: "K\u1EBFt n\u1ED1i \u0111\xE3 h\u1EBFt h\u1EA1n. H\xE3y k\u1EBFt n\u1ED1i l\u1EA1i extension.",
  optionsCloudStatusOffline: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i t\u1EDBi m\xE1y ch\u1EE7 n\xEAn ch\u1EC9 hi\u1EC3n th\u1ECB tr\u1EA1ng th\xE1i \u0111\u01B0\u1EE3c bi\u1EBFt g\u1EA7n nh\u1EA5t.",
  optionsCloudConnectButton: "K\u1EBFt n\u1ED1i Cloud",
  optionsCloudDisconnectButton: "Ng\u1EAFt k\u1EBFt n\u1ED1i Cloud",
  optionsCloudLinkHint: "N\xFAt k\u1EBFt n\u1ED1i s\u1EBD m\u1EDF scrapbook trong tr\xECnh duy\u1EC7t v\xE0 li\xEAn k\u1EBFt t\xE0i kho\u1EA3n \u0111ang \u0111\u0103ng nh\u1EADp v\u1EDBi extension n\xE0y.",
  optionsNotionSection: "K\u1EBFt n\u1ED1i Notion",
  optionsNotionSubtitle: "Notion \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i qua OAuth n\xEAn tr\xECnh duy\u1EC7t s\u1EBD kh\xF4ng bao gi\u1EDD y\xEAu c\u1EA7u internal token tr\u1EF1c ti\u1EBFp. Ch\u1EC9 c\u1EA7n k\u1EBFt n\u1ED1i m\u1ED9t l\u1EA7n, ch\u1ECDn \u0111\xEDch m\u1EB7c \u0111\u1ECBnh, r\u1ED3i sau \u0111\xF3 b\u1EA1n ch\u1EC9 vi\u1EC7c l\u01B0u.",
  optionsNotionConnectionLabel: "K\u1EBFt n\u1ED1i",
  optionsNotionDisconnectButton: "Ng\u1EAFt k\u1EBFt n\u1ED1i",
  optionsNotionConnectHint: "M\u1ED9t tab ph\xEA duy\u1EC7t Notion s\u1EBD \u0111\u01B0\u1EE3c m\u1EDF. Sau khi ph\xEA duy\u1EC7t, quay l\u1EA1i \u0111\xE2y v\xE0 tr\u1EA1ng th\xE1i k\u1EBFt n\u1ED1i s\u1EBD t\u1EF1 \u0111\u1ED9ng \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt.",
  optionsNotionConnected: "M\u1ED9t workspace Notion \u0111\xE3 \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  optionsNotionDisconnected: "Notion v\u1EABn ch\u01B0a \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i.",
  optionsNotionConnectStarted: "\u0110\xE3 m\u1EDF tab k\u1EBFt n\u1ED1i Notion. H\xE3y quay l\u1EA1i \u0111\xE2y sau khi ph\xEA duy\u1EC7t.",
  optionsNotionConnectFailed: "Kh\xF4ng th\u1EC3 b\u1EAFt \u0111\u1EA7u quy tr\xECnh k\u1EBFt n\u1ED1i Notion.",
  optionsNotionDisconnectedSaved: "\u0110\xE3 ng\u1EAFt k\u1EBFt n\u1ED1i workspace Notion.",
  optionsNotionDisconnectFailed: "Kh\xF4ng th\u1EC3 ng\u1EAFt k\u1EBFt n\u1ED1i Notion.",
  optionsNotionParentType: "Ch\u1EBF \u0111\u1ED9 l\u01B0u",
  optionsNotionParentTypeHint: "Ch\u1ECDn xem \u0111\xEDch m\u1EB7c \u0111\u1ECBnh s\u1EBD l\xE0 trang hay c\u01A1 s\u1EDF d\u1EEF li\u1EC7u trong workspace \u0111\xE3 k\u1EBFt n\u1ED1i.",
  optionsNotionSelectedTarget: "\u0110\xEDch m\u1EB7c \u0111\u1ECBnh",
  optionsNotionSelectedTargetHint: "\u0110\xE2y l\xE0 n\u01A1i n\xFAt l\u01B0u s\u1EBD g\u1EEDi c\xE1c n\u1ED9i dung ch\u1EE5p t\u1EEB Threads theo m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionTargetNotSelected: "Ch\u01B0a ch\u1ECDn \u0111\xEDch m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionTargetRequired: "H\xE3y ch\u1ECDn \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh tr\u01B0\u1EDBc.",
  optionsNotionTargetSaved: "\u0110\xE3 l\u01B0u \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionTargetSaveFailed: "Kh\xF4ng th\u1EC3 l\u01B0u \u0111\xEDch Notion m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionSearchLabel: "T\xECm \u0111\xEDch l\u01B0u",
  optionsNotionSearchHint: "T\xECm c\xE1c trang ho\u1EB7c c\u01A1 s\u1EDF d\u1EEF li\u1EC7u m\xE0 b\u1EA1n \u0111\xE3 c\u1EA5p quy\u1EC1n cho t\xEDch h\u1EE3p n\xE0y truy c\u1EADp.",
  optionsNotionSearchButton: "T\xECm \u0111\xEDch l\u01B0u",
  optionsNotionResultsLabel: "K\u1EBFt qu\u1EA3",
  optionsNotionResultsHint: "Ch\u1ECDn m\u1ED9t k\u1EBFt qu\u1EA3 v\xE0 \u0111\u1EB7t n\xF3 l\xE0m \u0111\xEDch l\u01B0u m\u1EB7c \u0111\u1ECBnh.",
  optionsNotionUseLocationButton: "D\xF9ng l\xE0m \u0111\xEDch m\u1EB7c \u0111\u1ECBnh",
  optionsNotionSearchLoaded: "\u0110\xE3 t\u1EA3i c\xE1c \u0111\xEDch Notion.",
  optionsNotionSearchEmpty: "Kh\xF4ng t\xECm th\u1EA5y \u0111\xEDch Notion ph\xF9 h\u1EE3p.",
  optionsNotionSearchFailed: "Kh\xF4ng th\u1EC3 t\u1EA3i c\xE1c \u0111\xEDch Notion.",
  optionsNotionOAuthRequiresPro: "L\u01B0u v\xE0o Notion qua OAuth ch\u1EC9 c\xF3 trong Pro.",
  optionsNotionConnectFirst: "H\xE3y k\u1EBFt n\u1ED1i Notion tr\u01B0\u1EDBc.",
  optionsNotionTokenHint: "D\xE1n token internal integration c\u1EE7a Notion. N\xF3 ch\u1EC9 \u0111\u01B0\u1EE3c l\u01B0u trong h\u1ED3 s\u01A1 tr\xECnh duy\u1EC7t n\xE0y.",
  optionsNotionParentPageHint: "B\u1EA1n c\xF3 th\u1EC3 d\xE1n URL \u0111\u1EA7y \u0111\u1EE7 c\u1EE7a trang Notion ho\u1EB7c ch\u1EC9 d\xE1n ID c\u1EE7a trang.",
  optionsNotionDataSourceHint: "D\xE1n URL \u0111\u1EA7y \u0111\u1EE7 c\u1EE7a c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion ho\u1EB7c ch\u1EC9 d\xE1n ID c\u1EE7a n\xF3. Ti\xEAu \u0111\u1EC1, tag, ng\xE0y th\xE1ng v\xE0 c\xE1c thu\u1ED9c t\xEDnh t\u01B0\u01A1ng t\u1EF1 s\u1EBD \u0111\u01B0\u1EE3c \xE1nh x\u1EA1 t\u1EF1 \u0111\u1ED9ng khi c\xF3 th\u1EC3.",
  optionsNotionDataSourceLocked: "L\u01B0u v\xE0o c\u01A1 s\u1EDF d\u1EEF li\u1EC7u ch\u1EC9 c\xF3 trong Pro.",
  optionsNotionUploadMedia: "T\u1EA3i media l\xEAn Notion",
  optionsNotionUploadMediaHint: "T\u1EA3i h\xECnh \u1EA3nh v\xE0 video l\xEAn nh\u01B0 t\u1EC7p do Notion qu\u1EA3n l\xFD thay v\xEC ch\u1EC9 \u0111\u1EC3 l\u1EA1i li\xEAn k\u1EBFt t\u1EEB xa. N\u1EBFu t\u1EA3i l\xEAn th\u1EA5t b\u1EA1i, h\u1EC7 th\u1ED1ng s\u1EBD quay v\u1EC1 l\u01B0u b\u1EB1ng li\xEAn k\u1EBFt.",
  optionsNotionUploadMediaLocked: "T\u1EA3i media do Notion qu\u1EA3n l\xFD ch\u1EC9 c\xF3 trong Pro.",
  optionsNotionTokenRequired: "C\u1EA7n c\xF3 token t\xEDch h\u1EE3p Notion \u0111\u1EC3 s\u1EED d\u1EE5ng l\u01B0u v\xE0o Notion.",
  optionsNotionParentPageRequired: "C\u1EA7n c\xF3 ID ho\u1EB7c URL c\u1EE7a trang cha Notion \u0111\u1EC3 s\u1EED d\u1EE5ng l\u01B0u v\xE0o Notion.",
  optionsNotionInvalidPage: "\u0110\u1ECBnh d\u1EA1ng ID ho\u1EB7c URL trang cha Notion kh\xF4ng h\u1EE3p l\u1EC7.",
  optionsNotionDataSourceRequired: "C\u1EA7n c\xF3 ID ho\u1EB7c URL c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion \u0111\u1EC3 s\u1EED d\u1EE5ng l\u01B0u v\xE0o c\u01A1 s\u1EDF d\u1EEF li\u1EC7u.",
  optionsNotionInvalidDataSource: "\u0110\u1ECBnh d\u1EA1ng ID ho\u1EB7c URL c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion kh\xF4ng h\u1EE3p l\u1EC7.",
  optionsNotionPermissionDenied: "Quy\u1EC1n truy c\u1EADp API Notion \u0111\xE3 b\u1ECB t\u1EEB ch\u1ED1i n\xEAn c\xE0i \u0111\u1EB7t kh\xF4ng \u0111\u01B0\u1EE3c l\u01B0u.",
  optionsBasicSection: "L\u01B0u c\u01A1 b\u1EA3n",
  optionsCompareSection: "Free vs Pro",
  optionsProSection: "C\xE0i \u0111\u1EB7t Pro",
  optionsProSubtitle: "Ch\u1EC9 m\u1EDF khi c\u1EA7n. \u0110\xE2y l\xE0 n\u01A1i \u0111\u1EB7t c\xE1c quy t\u1EAFc v\xE0 ph\u1EA7n s\u1EAFp x\u1EBFp b\u1EB1ng AI.",
  optionsProAiNote: "AI kh\xF4ng \u0111\u01B0\u1EE3c \u0111i k\xE8m t\u1EF1 \u0111\u1ED9ng. N\xF3 ch\u1EC9 ho\u1EA1t \u0111\u1ED9ng sau khi b\u1EA1n th\xEAm kh\xF3a API c\u1EE7a ri\xEAng m\xECnh.",
  compareRowReplies: "Chu\u1ED7i tr\u1EA3 l\u1EDDi",
  compareRowDuplicates: "B\u1ECF qua tr\xF9ng l\u1EB7p",
  compareRowFilename: "\u0110\u1ECBnh d\u1EA1ng t\xEAn t\u1EC7p",
  compareRowFolder: "Th\u01B0 m\u1EE5c l\u01B0u",
  compareRowNotionDataSource: "C\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion",
  compareRowNotionMediaUpload: "T\u1EA3i media l\xEAn Notion",
  optionsProStatusFree: "B\u1EA1n \u0111ang \u1EDF g\xF3i Free. Vi\u1EC7c l\u01B0u \u0111\xE3 ho\u1EA1t \u0111\u1ED9ng s\u1EB5n v\xE0 ch\u1EC9 c\u1EA7n Pro khi b\u1EA1n mu\u1ED1n d\xF9ng quy t\u1EAFc ho\u1EB7c AI.",
  optionsProStatusActive: "Pro \u0111ang ho\u1EA1t \u0111\u1ED9ng. T\xEDnh n\u0103ng s\u1EAFp x\u1EBFp theo quy t\u1EAFc v\xE0 AI \u0111\xE3 c\xF3 \u1EDF b\xEAn d\u01B0\u1EDBi.",
  optionsProStatusExpired: "Kh\xF3a Pro n\xE0y \u0111\xE3 h\u1EBFt h\u1EA1n. Vi\u1EC7c l\u01B0u \u1EDF g\xF3i Free v\u1EABn ho\u1EA1t \u0111\u1ED9ng.",
  optionsProStatusInvalid: "Kh\xF3a Pro n\xE0y kh\xF4ng h\u1EE3p l\u1EC7. Vi\u1EC7c l\u01B0u \u1EDF g\xF3i Free v\u1EABn ho\u1EA1t \u0111\u1ED9ng.",
  optionsProStatusSeatLimit: "Kh\xF3a Pro n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t tr\xEAn 3 thi\u1EBFt b\u1ECB. H\xE3y gi\u1EA3i ph\xF3ng m\u1ED9t thi\u1EBFt b\u1ECB kh\xE1c tr\u01B0\u1EDBc.",
  optionsProStatusNeedsActivation: "Kh\xF3a Pro h\u1EE3p l\u1EC7, nh\u01B0ng thi\u1EBFt b\u1ECB n\xE0y v\u1EABn ch\u01B0a c\xF3 seat \u0111ang ho\u1EA1t \u0111\u1ED9ng.",
  optionsProStatusOffline: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i \u0111\u1EBFn m\xE1y ch\u1EE7, v\xEC v\u1EADy tr\u1EA1ng th\xE1i k\xEDch ho\u1EA1t g\u1EA7n nh\u1EA5t s\u1EBD \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng.",
  optionsProStatusRevoked: "Kh\xF3a Pro n\xE0y kh\xF4ng c\xF2n d\xF9ng \u0111\u01B0\u1EE3c n\u1EEFa.",
  optionsProHolderLabel: "Ch\u1EE7 s\u1EDF h\u1EEFu",
  optionsProExpiresLabel: "H\u1EBFt h\u1EA1n",
  optionsProUnlockHint: "D\xE1n kh\xF3a Pro \u0111\u01B0\u1EE3c g\u1EEDi trong email mua h\xE0ng \u0111\u1EC3 k\xEDch ho\u1EA1t tr\xEAn tr\xECnh duy\u1EC7t n\xE0y.",
  optionsProUnlockPlaceholder: "D\xE1n kh\xF3a Pro c\u1EE7a b\u1EA1n v\xE0o \u0111\xE2y",
  optionsProSalesLink: "Nh\u1EADn Pro",
  optionsProActivate: "K\xEDch ho\u1EA1t Pro",
  optionsProClear: "G\u1EE1 b\u1ECF",
  optionsProActivated: "\u0110\xE3 k\xEDch ho\u1EA1t Pro.",
  optionsProRemoved: "Kh\xF3a Pro \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EE1 b\u1ECF.",
  optionsProEmptyKey: "H\xE3y nh\u1EADp kh\xF3a Pro tr\u01B0\u1EDBc.",
  optionsProLocalOnly: "C\xE1c b\u1EA3n l\u01B0u v\xE0o Obsidian s\u1EBD \u1EDF l\u1EA1i tr\xEAn thi\u1EBFt b\u1ECB c\u1EE7a b\u1EA1n, c\xF2n Cloud save ch\u1EC9 g\u1EEDi m\u1ED9t b\xE0i vi\u1EBFt \u0111\u1EBFn t\xE0i kho\u1EA3n scrapbook c\u1EE7a b\u1EA1n khi b\u1EA1n ch\u1ECDn n\xF3.",
  optionsFileRules: "Quy t\u1EAFc t\u1EC7p",
  optionsFilenamePattern: "\u0110\u1ECBnh d\u1EA1ng t\xEAn t\u1EC7p",
  optionsFilenamePatternLocked: "G\xF3i Free d\xF9ng t\xEAn t\u1EC7p m\u1EB7c \u0111\u1ECBnh. Pro cho ph\xE9p b\u1EA1n t\u1EF1 \u0111\u1EB7t \u0111\u1ECBnh d\u1EA1ng.",
  optionsSavePathPattern: "\u0110\u01B0\u1EDDng d\u1EABn th\u01B0 m\u1EE5c con",
  optionsSavePathTokens: "V\xED d\u1EE5: Inbox/{date} \xB7 Threads/{author}",
  optionsSavePathLocked: "G\xF3i Free l\u01B0u v\xE0o th\u01B0 m\u1EE5c g\u1ED1c c\u1EE7a th\u01B0 m\u1EE5c \u0111\xE3 k\u1EBFt n\u1ED1i. Pro cho ph\xE9p t\u1EF1 \u0111\u1ED9ng s\u1EAFp x\u1EBFp v\xE0o th\u01B0 m\u1EE5c con theo ng\xE0y, t\xE1c gi\u1EA3 ho\u1EB7c ch\u1EE7 \u0111\u1EC1.",
  optionsFilenameTokens: "C\xF3 s\u1EB5n: {date}, {author}, {first_sentence}, {first_sentence_20}, {shortcode}",
  optionsAiSection: "S\u1EAFp x\u1EBFp b\u1EB1ng AI",
  optionsAiSubtitle: "Ch\u1ECDn nh\xE0 cung c\u1EA5p v\xE0 URL g\u1ED1c m\u1EB7c \u0111\u1ECBnh c\xF9ng m\xF4 h\xECnh s\u1EBD \u0111\u01B0\u1EE3c \u0111i\u1EC1n s\u1EB5n cho b\u1EA1n.",
  optionsAiQuickstart: "H\u1EA7u h\u1EBFt m\u1ECDi ng\u01B0\u1EDDi ch\u1EC9 c\u1EA7n nh\xE0 cung c\u1EA5p v\xE0 kh\xF3a API. Sau khi thay \u0111\u1ED5i, h\xE3y nh\u1EA5n L\u01B0u c\xE0i \u0111\u1EB7t b\xEAn d\u01B0\u1EDBi \u0111\u1EC3 \xE1p d\u1EE5ng.",
  optionsAiAdvancedSummary: "Hi\u1EC7n c\xE0i \u0111\u1EB7t n\xE2ng cao",
  optionsAiEnable: "B\u1EADt s\u1EAFp x\u1EBFp b\u1EB1ng AI",
  optionsAiProviderHint: "OpenAI, OpenRouter, DeepSeek, Gemini v\xE0 Ollama \u0111\u1EC1u c\xF3 th\u1EC3 b\u1EAFt \u0111\u1EA7u t\u1EEB preset. Custom d\xE0nh cho m\u1ECDi endpoint t\u01B0\u01A1ng th\xEDch v\u1EDBi OpenAI.",
  optionsAiApiKeyHint: "Kh\xF3a Gemini th\u01B0\u1EDDng b\u1EAFt \u0111\u1EA7u b\u1EB1ng AIza, c\xF2n kh\xF3a OpenAI/OpenRouter/DeepSeek th\u01B0\u1EDDng b\u1EAFt \u0111\u1EA7u b\u1EB1ng sk-. Ch\u1EC9 \u0111\u1EC3 tr\u1ED1ng khi d\xF9ng endpoint c\u1EE5c b\u1ED9 nh\u01B0 Ollama m\xE0 kh\xF4ng c\u1EA7n kh\xF3a.",
  optionsAiApiKeyRequired: "Nh\xE0 cung c\u1EA5p \u0111\xE3 ch\u1ECDn y\xEAu c\u1EA7u kh\xF3a API.",
  optionsAiKeyMismatchGemini: "Gemini c\u1EA7n kh\xF3a API Google Gemini. Kh\xF3a hi\u1EC7n t\u1EA1i tr\xF4ng gi\u1ED1ng kh\xF3a t\u01B0\u01A1ng th\xEDch OpenAI.",
  optionsAiKeyMismatchOpenAi: "C\xE1c nh\xE0 cung c\u1EA5p OpenAI/OpenRouter/DeepSeek c\u1EA7n kh\xF3a ri\xEAng c\u1EE7a h\u1ECD, kh\xF4ng ph\u1EA3i kh\xF3a Gemini b\u1EAFt \u0111\u1EA7u b\u1EB1ng AIza.",
  optionsAiModel: "T\xEAn m\xF4 h\xECnh",
  optionsAiPrompt: "Prompt s\u1EAFp x\u1EBFp",
  optionsAiPromptHint: "H\xE3y m\xF4 t\u1EA3 \u0111\u1ED9 d\xE0i ph\u1EA7n t\xF3m t\u1EAFt, phong c\xE1ch tag v\xE0 c\xE1c tr\u01B0\u1EDDng frontmatter b\u1EA1n mu\u1ED1n.",
  optionsAiLocked: "S\u1EAFp x\u1EBFp b\u1EB1ng AI ch\u1EC9 c\xF3 trong Pro.",
  optionsAiInvalidBaseUrl: "AI Base URL kh\xF4ng h\u1EE3p l\u1EC7.",
  optionsAiPermissionDenied: "Quy\u1EC1n truy c\u1EADp \u0111\u1EBFn endpoint AI \u0111\xE3 ch\u1ECDn b\u1ECB t\u1EEB ch\u1ED1i n\xEAn c\xE0i \u0111\u1EB7t kh\xF4ng \u0111\u01B0\u1EE3c l\u01B0u.",
  optionsAiSaved: "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t AI v\xE0 quy\u1EC1n truy c\u1EADp endpoint.",
  optionsIncludeImages: "L\u01B0u h\xECnh \u1EA3nh v\xE0 t\u1EC7p video",
  optionsSave: "L\u01B0u c\xE0i \u0111\u1EB7t",
  optionsSaved: "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t.",
  optionsPendingSave: "C\xF3 thay \u0111\u1ED5i. H\xE3y nh\u1EA5n L\u01B0u c\xE0i \u0111\u1EB7t \u1EDF d\u01B0\u1EDBi \u0111\u1EC3 \xE1p d\u1EE5ng.",
  optionsNoChanges: "Ch\u01B0a c\xF3 thay \u0111\u1ED5i n\xE0o.",
  optionsStep1: "1. K\u1EBFt n\u1ED1i th\u01B0 m\u1EE5c Obsidian",
  optionsStep2: "2. Th\u1EED l\u01B0u mi\u1EC5n ph\xED tr\u01B0\u1EDBc",
  optionsStep3: "3. K\xEDch ho\u1EA1t Pro khi b\u1EA1n mu\u1ED1n d\xF9ng quy t\u1EAFc ho\u1EB7c AI",
  mdImageLabel: "H\xECnh \u1EA3nh",
  mdVideoLabel: "Video",
  mdVideoThumbnailLabel: "\u1EA2nh thu nh\u1ECF video",
  mdVideoOnThreads: "M\u1EDF tr\xEAn Threads",
  mdSavedVideoFile: "T\u1EC7p video \u0111\xE3 l\u01B0u",
  mdReplySection: "Chu\u1ED7i tr\u1EA3 l\u1EDDi c\u1EE7a t\xE1c gi\u1EA3",
  mdReplyLabel: "Tr\u1EA3 l\u1EDDi",
  mdReplyImageLabel: "H\xECnh \u1EA3nh tr\u1EA3 l\u1EDDi",
  mdUploadedMediaSection: "Media \u0111\xE3 t\u1EA3i l\xEAn",
  mdSource: "Ngu\u1ED3n",
  mdAuthor: "T\xE1c gi\u1EA3",
  mdPublishedAt: "Th\u1EDDi \u0111i\u1EC3m \u0111\u0103ng",
  mdExternalLink: "Li\xEAn k\u1EBFt ngo\xE0i",
  mdWarning: "C\u1EA3nh b\xE1o",
  mdSummary: "T\xF3m t\u1EAFt AI",
  warnImageAccessFailed: "Kh\xF4ng th\u1EC3 l\u01B0u m\u1ED9t s\u1ED1 h\xECnh \u1EA3nh ho\u1EB7c video; c\xE1c li\xEAn k\u1EBFt g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i.",
  warnImageDownloadOff: "T\xEDnh n\u0103ng l\u01B0u h\xECnh \u1EA3nh/video \u0111ang t\u1EAFt; c\xE1c li\xEAn k\u1EBFt g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i.",
  warnAiFailed: "S\u1EAFp x\u1EBFp b\u1EB1ng AI th\u1EA5t b\u1EA1i n\xEAn ghi ch\xFA g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u: {reason}",
  warnAiPermissionMissing: "Thi\u1EBFu quy\u1EC1n cho endpoint AI n\xEAn ghi ch\xFA g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u. H\xE3y l\u01B0u l\u1EA1i ph\u1EA7n AI trong c\xE0i \u0111\u1EB7t.",
  warnAiMissingModel: "Ch\u01B0a c\u1EA5u h\xECnh t\xEAn m\xF4 h\xECnh AI n\xEAn ghi ch\xFA g\u1ED1c \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u.",
  warnNotionMediaUploadFailed: "T\u1EA3i media l\xEAn Notion th\u1EA5t b\u1EA1i n\xEAn c\xE1c li\xEAn k\u1EBFt t\u1EEB xa \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u thay th\u1EBF.",
  errBrowserUnsupported: "Tr\xECnh duy\u1EC7t n\xE0y kh\xF4ng th\u1EC3 l\u01B0u tr\u1EF1c ti\u1EBFp v\xE0o th\u01B0 m\u1EE5c Obsidian.",
  errFolderNameFailed: "Kh\xF4ng th\u1EC3 x\xE1c \u0111\u1ECBnh t\xEAn th\u01B0 m\u1EE5c \u0111\u1EC3 l\u01B0u.",
  errInvalidPath: "\u0110\u01B0\u1EDDng d\u1EABn t\u1EC7p kh\xF4ng h\u1EE3p l\u1EC7.",
  errNotionTokenMissing: "Ch\u01B0a c\u1EA5u h\xECnh token t\xEDch h\u1EE3p Notion.",
  errNotionPermissionMissing: "Thi\u1EBFu quy\u1EC1n truy c\u1EADp API Notion. H\xE3y l\u01B0u l\u1EA1i c\xE0i \u0111\u1EB7t tr\u01B0\u1EDBc.",
  errNotionUnauthorized: "Token Notion kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n.",
  errNotionForbidden: "T\xEDch h\u1EE3p n\xE0y kh\xF4ng th\u1EC3 truy c\u1EADp \u0111\xEDch Notion \u0111\xE3 ch\u1ECDn. H\xE3y \u0111\u1EA3m b\u1EA3o trang ho\u1EB7c c\u01A1 s\u1EDF d\u1EEF li\u1EC7u \u0111\xE3 \u0111\u01B0\u1EE3c chia s\u1EBB v\u1EDBi t\xEDch h\u1EE3p.",
  errNotionParentNotFound: "Kh\xF4ng t\xECm th\u1EA5y trang ho\u1EB7c c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Notion \u0111\xE3 ch\u1ECDn. H\xE3y ki\u1EC3m tra ID v\xE0 k\u1EBFt n\u1ED1i.",
  errNotionRateLimited: "C\xF3 qu\xE1 nhi\u1EC1u y\xEAu c\u1EA7u \u0111\u1EBFn Notion. H\xE3y th\u1EED l\u1EA1i sau {seconds} gi\xE2y.",
  errNotionValidation: "Y\xEAu c\u1EA7u g\u1EEDi \u0111\u1EBFn Notion kh\xF4ng h\u1EE3p l\u1EC7.",
  errNotionRequestFailed: "Y\xEAu c\u1EA7u l\u01B0u v\xE0o Notion th\u1EA5t b\u1EA1i.",
  fallbackNoFolder: "Kh\xF4ng c\xF3 th\u01B0 m\u1EE5c \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i,",
  fallbackPermissionDenied: "kh\xF4ng c\xF3 quy\u1EC1n v\u1EDBi th\u01B0 m\u1EE5c,",
  fallbackDirectFailed: "kh\xF4ng th\u1EC3 l\u01B0u v\xE0o th\u01B0 m\u1EE5c,",
  fallbackZipMessage: " n\xEAn \u0111\xE3 \u0111\u01B0\u1EE3c t\u1EA3i xu\u1ED1ng d\u01B0\u1EDBi d\u1EA1ng t\u1EC7p.",
  errNotPermalink: "H\xE3y m\u1EDF trang b\xE0i vi\u1EBFt ri\xEAng l\u1EBB tr\u01B0\u1EDBc.",
  errPostContentNotFound: "Kh\xF4ng th\u1EC3 t\u1EA3i n\u1ED9i dung b\xE0i vi\u1EBFt. H\xE3y \u0111\u1EA3m b\u1EA3o b\u1EA1n \u0111\xE3 \u0111\u0103ng nh\u1EADp."
};
var dictionaries = {
  ko,
  en,
  ja,
  "pt-BR": ptBR,
  es,
  "zh-TW": zhTW,
  vi
};
var currentLocale = null;
function detectDefaultLocale() {
  return detectLocaleFromNavigator(typeof navigator !== "undefined" ? navigator.language : null, "en");
}
async function getLocale() {
  if (currentLocale) {
    return currentLocale;
  }
  try {
    const stored = await chrome.storage.local.get(LOCALE_KEY);
    const value = stored[LOCALE_KEY];
    if (isSupportedLocale(value)) {
      currentLocale = value;
      return value;
    }
  } catch {
  }
  currentLocale = detectDefaultLocale();
  return currentLocale;
}
async function t() {
  const locale = await getLocale();
  return dictionaries[locale];
}
function tSync(locale) {
  return dictionaries[locale];
}

// src/lib/pro-activation.ts
var PRIMARY_BACKEND_ORIGIN = "https://threads-archive.dahanda.dev";
var BACKEND_ORIGINS = [PRIMARY_BACKEND_ORIGIN];
var PRO_ACTIVATION_PATH = "/api/public/licenses";
function shouldTryNextOrigin(response) {
  return response.status === 404 || response.status >= 500;
}
async function postActivation(path, payload) {
  let fallbackError = null;
  for (const origin of BACKEND_ORIGINS) {
    try {
      const response = await fetch(`${origin}${PRO_ACTIVATION_PATH}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const json = await response.json().catch(() => null);
      if (!response.ok && json && typeof json === "object" && "ok" in json) {
        return json;
      }
      if (!response.ok) {
        const errorMessage = json && typeof json === "object" && "error" in json && json.error || `Activation request failed (${response.status})`;
        if (shouldTryNextOrigin(response)) {
          fallbackError = new Error(`${origin}: ${errorMessage}`);
          continue;
        }
        throw new Error(errorMessage);
      }
      return json;
    } catch (error) {
      fallbackError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw fallbackError ?? new Error(`Activation backend is not reachable at ${BACKEND_ORIGINS.join(" or ")}.`);
}
async function getServerLicenseStatus(token, deviceId, deviceLabel) {
  return await postActivation("/status", { token, deviceId, deviceLabel });
}
function mapServerFailureToActivationState(reason) {
  if (reason === "seat_limit") {
    return "seat_limit";
  }
  if (reason === "revoked") {
    return "revoked";
  }
  return "required";
}

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

// src/lib/pro-device.ts
var PRO_DEVICE_KEY = "pro-device";
function inferBrowserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) {
    return "Edge";
  }
  if (/Chrome\//.test(ua)) {
    return "Chrome";
  }
  if (/Firefox\//.test(ua)) {
    return "Firefox";
  }
  if (/Safari\//.test(ua)) {
    return "Safari";
  }
  return "Browser";
}
function inferPlatformLabel() {
  const value = (
    // userAgentData isn't always available in extension pages.
    (navigator.userAgentData?.platform ?? navigator.platform ?? "").trim()
  );
  if (!value) {
    return "device";
  }
  return value.replace(/^Mac/i, "macOS").replace(/^Win/i, "Windows");
}
function buildDeviceLabel() {
  return `${inferBrowserName()} on ${inferPlatformLabel()}`;
}
async function getOrCreateProDevice() {
  const stored = await chrome.storage.local.get(PRO_DEVICE_KEY);
  const existing = stored[PRO_DEVICE_KEY];
  if (existing?.id && existing.label) {
    return existing;
  }
  const created = {
    id: crypto.randomUUID(),
    label: buildDeviceLabel(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await chrome.storage.local.set({ [PRO_DEVICE_KEY]: created });
  return created;
}

// ../shared/src/utils.ts
var THREADS_PERMALINK_RE = /^https:\/\/www\.threads\.(?:com|net)\/@[^/]+\/post\/[^/?#]+/i;
function isSupportedPermalink(url) {
  return THREADS_PERMALINK_RE.test(url);
}
function sanitizeFilenamePart(value) {
  return value.replace(/[\\/:*?"<>|]+/g, "").replace(/[.!?。！？]+$/g, "").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
}
function truncateFilenamePart(value, maxLength) {
  return value.slice(0, maxLength).replace(/_+$/g, "");
}
function extractFirstSentence(text) {
  const normalized = decodeEscapedJsonString(text).trim();
  if (!normalized) {
    return "";
  }
  const firstBlock = normalized.split(/\n+/).map((line) => line.trim()).find(Boolean);
  if (!firstBlock) {
    return "";
  }
  const sentenceMatch = firstBlock.match(/^(.+?[.!?。！？])(?:\s|$)/u);
  return (sentenceMatch?.[1] ?? firstBlock).trim();
}
function resolvePatternTokens(pattern, post) {
  const date = (post.publishedAt ?? post.capturedAt).slice(0, 10);
  const firstSentence = extractFirstSentence(post.text) || post.title || post.shortcode;
  const sanitizedFirstSentence = sanitizeFilenamePart(firstSentence);
  return pattern.replaceAll("{date}", sanitizeFilenamePart(date)).replaceAll("{author}", sanitizeFilenamePart(post.author)).replaceAll("{first_sentence_20}", truncateFilenamePart(sanitizedFirstSentence, 20)).replaceAll("{first_sentence}", sanitizedFirstSentence).replaceAll("{shortcode}", sanitizeFilenamePart(post.shortcode));
}
function buildArchiveBaseName(pattern, post) {
  const resolved = resolvePatternTokens(pattern, post);
  const firstSentence = extractFirstSentence(post.text) || post.title || post.shortcode;
  return resolved || `${sanitizeFilenamePart(post.author)}_${sanitizeFilenamePart(firstSentence)}`;
}
function buildPathPatternParts(pattern, post) {
  if (!pattern.trim()) {
    return [];
  }
  return resolvePatternTokens(pattern, post).replace(/\\/g, "/").split("/").map((part) => sanitizeFilenamePart(part.trim())).filter(Boolean);
}
function buildZipFilename(pattern, post) {
  return `${buildArchiveBaseName(pattern, post)}.zip`;
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

// src/lib/storage.ts
var OPTIONS_KEY = "options";
var RECENT_SAVES_KEY = "recent-saves";
var LICENSE_KEY = "pro-license";
var CLOUD_LINK_KEY = "cloud-link";
var PENDING_CLOUD_LINK_KEY = "cloud-link-pending";
var LEGACY_DEFAULT_FILENAME_PATTERN = "{date}__{author}__{shortcode}";
var PREVIOUS_DEFAULT_FILENAME_PATTERN = "{date}_{author}_{shortcode}";
var OLD_FIRST_SENTENCE_DEFAULT_FILENAME_PATTERN = "{author}_{first_sentence}";
var PREVIOUS_SHORTCODE_DEFAULT_FILENAME_PATTERN = "{author}_{shortcode}";
var MAX_RECENT_SAVES = 10;
var PLAN_STATUS_TTL_MS = 5 * 6e4;
function mergeOptionsWithDefaults(options) {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    notion: {
      ...DEFAULT_OPTIONS.notion,
      ...options?.notion ?? {}
    },
    aiOrganization: {
      ...DEFAULT_OPTIONS.aiOrganization,
      ...options?.aiOrganization ?? {}
    }
  };
}
function normalizeRecentSave(item) {
  const archiveName = item.archiveName ?? item.zipFilename?.replace(/\.zip$/i, "") ?? "";
  const saveTarget = item.saveTarget ?? (item.savedVia === "notion" ? "notion" : item.savedVia === "cloud" ? "cloud" : "obsidian");
  const post = {
    ...item.post,
    videoUrl: item.post.videoUrl ?? null,
    title: decodeEscapedJsonString(item.post.title),
    text: decodeEscapedJsonString(item.post.text),
    authorReplies: item.post.authorReplies.map((reply) => ({
      ...reply,
      videoUrl: reply.videoUrl ?? null,
      text: decodeEscapedJsonString(reply.text)
    }))
  };
  return {
    ...item,
    archiveName,
    saveTarget,
    savedVia: item.savedVia ?? "zip",
    savedRelativePath: item.savedRelativePath ?? null,
    remotePageId: item.remotePageId ?? null,
    remotePageUrl: item.remotePageUrl ?? null,
    warning: item.warning ?? null,
    post,
    title: decodeEscapedJsonString(item.title)
  };
}
async function getOptions() {
  const stored = await chrome.storage.local.get(OPTIONS_KEY);
  const storedOptions = stored[OPTIONS_KEY];
  const merged = mergeOptionsWithDefaults(storedOptions);
  let shouldPersist = false;
  if (!merged.filenamePattern || merged.filenamePattern === LEGACY_DEFAULT_FILENAME_PATTERN || merged.filenamePattern === PREVIOUS_DEFAULT_FILENAME_PATTERN || merged.filenamePattern === OLD_FIRST_SENTENCE_DEFAULT_FILENAME_PATTERN || merged.filenamePattern === PREVIOUS_SHORTCODE_DEFAULT_FILENAME_PATTERN) {
    merged.filenamePattern = DEFAULT_OPTIONS.filenamePattern;
    shouldPersist = true;
  }
  if (merged.obsidianFolderLabel === void 0) {
    merged.obsidianFolderLabel = DEFAULT_OPTIONS.obsidianFolderLabel;
    shouldPersist = true;
  }
  if (merged.saveTarget === void 0) {
    merged.saveTarget = DEFAULT_OPTIONS.saveTarget;
    shouldPersist = true;
  }
  if (merged.savePathPattern === void 0) {
    merged.savePathPattern = DEFAULT_OPTIONS.savePathPattern;
    shouldPersist = true;
  }
  if (!storedOptions?.notion) {
    shouldPersist = true;
  } else {
    const expectedNotionKeys = Object.keys(DEFAULT_OPTIONS.notion);
    for (const key of expectedNotionKeys) {
      if (storedOptions.notion[key] === void 0) {
        shouldPersist = true;
        break;
      }
    }
  }
  if (!storedOptions?.aiOrganization) {
    shouldPersist = true;
  } else {
    const expectedAiKeys = Object.keys(DEFAULT_OPTIONS.aiOrganization);
    for (const key of expectedAiKeys) {
      if (storedOptions.aiOrganization[key] === void 0) {
        shouldPersist = true;
        break;
      }
    }
  }
  if (shouldPersist) {
    await chrome.storage.local.set({ [OPTIONS_KEY]: merged });
  }
  return merged;
}
async function setOptions(options) {
  await chrome.storage.local.set({ [OPTIONS_KEY]: mergeOptionsWithDefaults(options) });
}
function buildPlanStatus(licenseState, payload, overrides = {}) {
  return {
    tier: licenseState === "valid" && payload && overrides.activationState === "active" ? "pro" : "free",
    licenseState,
    holder: payload?.holder ?? null,
    expiresAt: payload?.expiresAt ?? null,
    activationState: overrides.activationState ?? "none",
    seatLimit: overrides.seatLimit ?? null,
    seatsUsed: overrides.seatsUsed ?? null,
    deviceLabel: overrides.deviceLabel ?? null,
    activatedAt: overrides.activatedAt ?? null
  };
}
function isActivationFresh(record) {
  if (!record?.validatedAt) {
    return false;
  }
  return Date.now() - Date.parse(record.validatedAt) < PLAN_STATUS_TTL_MS;
}
async function readStoredLicenseRecord() {
  const stored = await chrome.storage.local.get(LICENSE_KEY);
  return stored[LICENSE_KEY] ?? null;
}
async function writeStoredLicenseRecord(record) {
  await chrome.storage.local.set({ [LICENSE_KEY]: record });
}
async function getCloudLinkRecord() {
  const stored = await chrome.storage.local.get(CLOUD_LINK_KEY);
  return stored[CLOUD_LINK_KEY] ?? null;
}
async function setCloudLinkRecord(record) {
  await chrome.storage.local.set({ [CLOUD_LINK_KEY]: record });
}
async function clearCloudLinkRecord() {
  await setCloudLinkRecord(null);
}
async function getPendingCloudLinkRecord() {
  const stored = await chrome.storage.local.get(PENDING_CLOUD_LINK_KEY);
  return stored[PENDING_CLOUD_LINK_KEY] ?? null;
}
async function setPendingCloudLinkRecord(record) {
  await chrome.storage.local.set({ [PENDING_CLOUD_LINK_KEY]: record });
}
async function getStoredCloudConnectionStatus() {
  const record = await getCloudLinkRecord();
  if (!record?.token) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }
  if (Date.parse(record.expiresAt) <= Date.now()) {
    return {
      state: "expired",
      userHandle: record.userHandle,
      expiresAt: record.expiresAt,
      linkedAt: record.linkedAt
    };
  }
  return {
    state: "linked",
    userHandle: record.userHandle,
    expiresAt: record.expiresAt,
    linkedAt: record.linkedAt
  };
}
async function getPlanStatus() {
  const record = await readStoredLicenseRecord();
  if (!record?.key) {
    return buildPlanStatus("none", null);
  }
  const validation = await validateProLicenseToken(record.key);
  if (validation.state !== "valid" || !validation.payload) {
    return buildPlanStatus(validation.state, validation.payload);
  }
  if (isActivationFresh(record.activation)) {
    const activation = record.activation;
    return buildPlanStatus("valid", validation.payload, {
      activationState: "active",
      seatLimit: activation?.seatLimit ?? null,
      seatsUsed: activation?.seatsUsed ?? null,
      deviceLabel: activation?.deviceLabel ?? null,
      activatedAt: activation?.activatedAt ?? null
    });
  }
  const device = await getOrCreateProDevice();
  try {
    const server = await getServerLicenseStatus(record.key, device.id, device.label);
    if (server.ok) {
      const nextRecord2 = {
        ...record,
        payload: validation.payload,
        activation: {
          state: "active",
          deviceId: server.deviceId,
          deviceLabel: server.deviceLabel,
          seatLimit: server.seatLimit,
          seatsUsed: server.seatsUsed,
          activatedAt: server.activatedAt,
          validatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      await writeStoredLicenseRecord(nextRecord2);
      return buildPlanStatus("valid", validation.payload, {
        activationState: "active",
        seatLimit: server.seatLimit,
        seatsUsed: server.seatsUsed,
        deviceLabel: server.deviceLabel,
        activatedAt: server.activatedAt
      });
    }
    const nextRecord = {
      ...record,
      payload: validation.payload,
      activation: null
    };
    await writeStoredLicenseRecord(nextRecord);
    return buildPlanStatus("valid", validation.payload, {
      activationState: mapServerFailureToActivationState(server.reason),
      seatLimit: server.seatLimit,
      seatsUsed: server.seatsUsed
    });
  } catch {
    if (record.activation) {
      return buildPlanStatus("valid", validation.payload, {
        activationState: "active",
        seatLimit: record.activation.seatLimit,
        seatsUsed: record.activation.seatsUsed,
        deviceLabel: record.activation.deviceLabel,
        activatedAt: record.activation.activatedAt
      });
    }
    return buildPlanStatus("valid", validation.payload, {
      activationState: "offline"
    });
  }
}
async function getServerAuthContext() {
  const record = await readStoredLicenseRecord();
  if (!record?.key) {
    return null;
  }
  const device = await getOrCreateProDevice();
  return {
    token: record.key,
    deviceId: record.activation?.deviceId ?? device.id,
    deviceLabel: record.activation?.deviceLabel ?? device.label
  };
}
async function getEffectiveOptions() {
  const [options, planStatus] = await Promise.all([getOptions(), getPlanStatus()]);
  if (planStatus.tier === "pro") {
    return options;
  }
  return {
    ...options,
    saveTarget: options.saveTarget === "obsidian" ? "obsidian" : DEFAULT_OPTIONS.saveTarget,
    filenamePattern: DEFAULT_OPTIONS.filenamePattern,
    savePathPattern: DEFAULT_OPTIONS.savePathPattern,
    notion: {
      ...options.notion,
      parentType: DEFAULT_OPTIONS.notion.parentType,
      dataSourceId: DEFAULT_OPTIONS.notion.dataSourceId,
      uploadMedia: DEFAULT_OPTIONS.notion.uploadMedia
    },
    aiOrganization: {
      ...options.aiOrganization,
      enabled: false
    }
  };
}
async function getRecentSaves() {
  const stored = await chrome.storage.local.get(RECENT_SAVES_KEY);
  const recent = (stored[RECENT_SAVES_KEY] ?? []).map(normalizeRecentSave);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: recent });
  return recent;
}
async function upsertRecentSave(save) {
  const recent = await getRecentSaves();
  const filtered = recent.filter(
    (item) => item.id !== save.id && !(item.canonicalUrl === save.canonicalUrl && item.saveTarget === save.saveTarget)
  );
  filtered.unshift(save);
  const next = filtered.slice(0, MAX_RECENT_SAVES);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: next });
  return next;
}
async function findRecentSaveById(id) {
  const recent = await getRecentSaves();
  return recent.find((item) => item.id === id) ?? null;
}
async function removeRecentSaveById(id) {
  const recent = await getRecentSaves();
  const next = recent.filter((item) => item.id !== id);
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: next });
  return next;
}
async function clearRecentSaves() {
  await chrome.storage.local.set({ [RECENT_SAVES_KEY]: [] });
}
async function findDuplicateSave(canonicalUrl, contentHash, saveTarget) {
  const recent = await getRecentSaves();
  return recent.find((item) => item.canonicalUrl === canonicalUrl && item.contentHash === contentHash && item.saveTarget === saveTarget) ?? null;
}

// src/lib/cloud-server.ts
var PUBLIC_BOT_PATH = "/api/public/bot";
var EXTENSION_API_PATH = "/api/extension";
async function requireCloudAuthPayload() {
  const auth = await getServerAuthContext();
  if (auth) {
    return auth;
  }
  const msg = await t();
  throw new Error(msg.optionsCloudRequiresPro);
}
async function requireCloudLinkRecord() {
  const record = await getCloudLinkRecord();
  if (record?.token) {
    return record;
  }
  const msg = await t();
  throw new Error(msg.statusCloudConnectRequired);
}
async function requestJsonFromOrigins(apiPath, init, options = {}) {
  let fallbackError = null;
  const msg = await t();
  for (const origin of BACKEND_ORIGINS) {
    try {
      const headers = new Headers(init.headers ?? {});
      if (!headers.has("content-type") && init.body) {
        headers.set("content-type", "application/json");
      }
      if (options.authToken) {
        headers.set("authorization", `Bearer ${options.authToken}`);
      }
      const response = await fetch(`${origin}${apiPath}`, {
        ...init,
        headers
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
          fallbackError = new Error(`${origin}${apiPath}: ${body?.error?.trim() || `HTTP ${response.status}`}`);
          continue;
        }
        if (response.status === 401) {
          throw new Error(options.treatUnauthorizedAsExpired ? msg.statusCloudSessionExpired : msg.statusCloudConnectRequired);
        }
        throw new Error(body?.error?.trim() || `Cloud request failed (${response.status})`);
      }
      return body ?? {};
    } catch (error) {
      fallbackError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw fallbackError ?? new Error(`Cloud save backend is not reachable at ${PRIMARY_BACKEND_ORIGIN}.`);
}
function buildCloudLinkRecord(result) {
  return {
    token: result.token,
    expiresAt: result.expiresAt,
    linkedAt: result.linkedAt,
    userHandle: result.userHandle
  };
}
function buildCloudLinkStartUrl(state) {
  const url = new URL(`${PRIMARY_BACKEND_ORIGIN}${PUBLIC_BOT_PATH}/extension/link/start`);
  url.searchParams.set("state", state);
  return url.toString();
}
async function completeCloudLink(code, state) {
  const result = await requestJsonFromOrigins(
    `${EXTENSION_API_PATH}/link/complete`,
    {
      method: "POST",
      body: JSON.stringify({ code, state })
    }
  );
  const record = buildCloudLinkRecord(result);
  await setCloudLinkRecord(record);
  return {
    state: "linked",
    userHandle: record.userHandle,
    expiresAt: record.expiresAt,
    linkedAt: record.linkedAt
  };
}
async function fetchCloudConnectionStatus() {
  const localStatus = await getStoredCloudConnectionStatus();
  if (localStatus.state === "unlinked") {
    return localStatus;
  }
  const record = await getCloudLinkRecord();
  if (!record?.token) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }
  try {
    const status = await requestJsonFromOrigins(
      `${EXTENSION_API_PATH}/cloud/status`,
      {
        method: "GET"
      },
      {
        authToken: record.token,
        treatUnauthorizedAsExpired: true
      }
    );
    if (status.state === "linked") {
      await setCloudLinkRecord({
        token: record.token,
        expiresAt: status.expiresAt ?? record.expiresAt,
        linkedAt: status.linkedAt ?? record.linkedAt,
        userHandle: status.userHandle ?? record.userHandle
      });
      return status;
    }
    await clearCloudLinkRecord();
    return status;
  } catch {
    return {
      ...localStatus,
      state: "offline"
    };
  }
}
async function disconnectCloudConnection() {
  const record = await getCloudLinkRecord();
  if (!record?.token) {
    return {
      state: "unlinked",
      userHandle: null,
      expiresAt: null,
      linkedAt: null
    };
  }
  try {
    const status = await requestJsonFromOrigins(
      `${EXTENSION_API_PATH}/cloud/link`,
      {
        method: "DELETE"
      },
      {
        authToken: record.token,
        treatUnauthorizedAsExpired: true
      }
    );
    await clearCloudLinkRecord();
    return status;
  } catch {
    await clearCloudLinkRecord();
    return {
      state: "revoked",
      userHandle: record.userHandle,
      expiresAt: record.expiresAt,
      linkedAt: record.linkedAt
    };
  }
}
async function savePostToCloudWithServer(post, aiResult, aiWarning) {
  const [auth, locale, cloudLink] = await Promise.all([
    requireCloudAuthPayload(),
    getLocale(),
    requireCloudLinkRecord()
  ]);
  return await requestJsonFromOrigins(
    `${EXTENSION_API_PATH}/cloud/save`,
    {
      method: "POST",
      body: JSON.stringify({
        ...auth,
        locale,
        post,
        aiResult,
        aiWarning
      })
    },
    {
      authToken: cloudLink.token,
      treatUnauthorizedAsExpired: true
    }
  );
}

// src/lib/llm.ts
var RESERVED_FRONTMATTER_KEYS = /* @__PURE__ */ new Set([
  "title",
  "author",
  "tags",
  "summary",
  "canonical_url",
  "shortcode",
  "published_at",
  "captured_at",
  "source_type",
  "has_images",
  "has_external_url",
  "quoted_post_url",
  "replied_to_url",
  "author_reply_count"
]);
function normalizeBaseUrl(baseUrl) {
  const normalized = baseUrl.trim();
  if (!normalized) {
    throw new Error("Missing AI base URL.");
  }
  const parsed = new URL(normalized);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Unsupported AI base URL protocol.");
  }
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}
function getAiPermissionPattern(baseUrl) {
  const parsed = new URL(normalizeBaseUrl(baseUrl));
  return `${parsed.protocol}//${parsed.hostname}/*`;
}
async function hasAiHostPermission(baseUrl) {
  if (!chrome.permissions?.contains) {
    return false;
  }
  try {
    return await chrome.permissions.contains({
      origins: [getAiPermissionPattern(baseUrl)]
    });
  } catch {
    return false;
  }
}
function isFlatPrimitiveArray(value) {
  return Array.isArray(value) && value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item));
}
function sanitizeFrontmatterKey(key) {
  return key.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
}
function sanitizeFrontmatterValue(value) {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, 500) : null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (isFlatPrimitiveArray(value)) {
    const items = value.map((item) => sanitizeFrontmatterValue(item)).filter((item) => item !== null).slice(0, 12);
    return items.length > 0 ? items : null;
  }
  return null;
}
function extractTextContent(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((item) => item.text ?? "").join("\n").trim();
  }
  return "";
}
function extractGeminiTextContent(parts) {
  if (!Array.isArray(parts)) {
    return "";
  }
  return parts.map((part) => part.text ?? "").join("\n").trim();
}
function extractJsonCandidate(raw) {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  const start = raw.indexOf("{");
  if (start < 0) {
    return raw.trim();
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(start, index + 1).trim();
      }
    }
  }
  return raw.trim();
}
function buildPrompt(post, settings) {
  const replyBlock = post.authorReplies.length > 0 ? post.authorReplies.map(
    (reply, index) => `Reply ${index + 1}
Author: @${reply.author}
Published: ${reply.publishedAt ?? "unknown"}
Text:
${reply.text}`
  ).join("\n\n") : "None";
  return [
    "Return JSON only.",
    "",
    "Schema:",
    "{",
    '  "summary": "string | null",',
    '  "tags": ["string"],',
    '  "frontmatter": { "flat_key": "string | number | boolean | null | array" }',
    "}",
    "",
    "Rules:",
    "- Keep summary concise and factual.",
    "- tags should be short, lowercase, and reusable in Obsidian.",
    "- frontmatter must be flat. No nested objects.",
    "- Do not repeat default fields like title, author, canonical_url, shortcode, tags, or summary inside frontmatter.",
    "- If unsure, return null or an empty array/object.",
    "",
    `User rules:
${settings.prompt.trim() || "No extra rules."}`,
    "",
    "Post:",
    `Author: @${post.author}`,
    `Canonical URL: ${post.canonicalUrl}`,
    `Published: ${post.publishedAt ?? "unknown"}`,
    `Source type: ${post.sourceType}`,
    `External URL: ${post.externalUrl ?? "none"}`,
    "",
    "Main text:",
    post.text,
    "",
    "Author replies:",
    replyBlock
  ].join("\n");
}
function sanitizeTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const tags = [];
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const normalized = item.trim().toLowerCase().replace(/^#+/, "").replace(/\s+/g, "-").replace(/[^a-z0-9_\-가-힣]+/g, "").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    tags.push(normalized);
    if (tags.length >= 8) {
      break;
    }
  }
  return tags;
}
function sanitizeResult(raw) {
  const parsed = typeof raw === "object" && raw ? raw : {};
  const summary = typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim().slice(0, 600) : null;
  const tags = sanitizeTags(parsed.tags);
  const frontmatterInput = typeof parsed.frontmatter === "object" && parsed.frontmatter && !Array.isArray(parsed.frontmatter) ? parsed.frontmatter : {};
  const frontmatter = {};
  for (const [rawKey, rawValue] of Object.entries(frontmatterInput)) {
    const key = sanitizeFrontmatterKey(rawKey);
    if (!key || RESERVED_FRONTMATTER_KEYS.has(key)) {
      continue;
    }
    const value = sanitizeFrontmatterValue(rawValue);
    if (value === null) {
      continue;
    }
    frontmatter[key] = value;
  }
  return { summary, tags, frontmatter };
}
function summarizeAiError(error, settings, normalizedBaseUrl) {
  if (!(error instanceof Error)) {
    return "Unknown error";
  }
  const baseMessage = error.message.trim().slice(0, 120) || "Unknown error";
  if (!settings || !normalizedBaseUrl) {
    return baseMessage;
  }
  return `${settings.provider} @ ${normalizedBaseUrl}: ${baseMessage}`.slice(0, 180);
}
function normalizeGeminiModel(model) {
  return model.trim().replace(/^models\//, "");
}
async function requestOpenAiCompatibleCompletion(normalizedBaseUrl, model, prompt, apiKey, signal) {
  const headers = {
    "content-type": "application/json"
  };
  if (apiKey.trim()) {
    headers.authorization = `Bearer ${apiKey.trim()}`;
  }
  const response = await fetch(`${normalizedBaseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: "You convert Threads posts into clean Obsidian metadata. Output JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    }),
    signal
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = payload?.error?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(reason);
  }
  const rawContent = extractTextContent(payload?.choices?.[0]?.message?.content);
  if (!rawContent) {
    throw new Error("Empty AI response");
  }
  return rawContent;
}
async function requestGeminiCompletion(normalizedBaseUrl, model, prompt, apiKey, signal) {
  const normalizedModel = normalizeGeminiModel(model);
  const requestUrl = new URL(`${normalizedBaseUrl}/models/${encodeURIComponent(normalizedModel)}:generateContent`);
  if (apiKey.trim()) {
    requestUrl.searchParams.set("key", apiKey.trim());
  }
  const response = await fetch(requestUrl.toString(), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: "You convert Threads posts into clean Obsidian metadata. Output JSON only."
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    }),
    signal
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = payload?.error?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(reason);
  }
  const rawContent = extractGeminiTextContent(payload?.candidates?.[0]?.content?.parts);
  if (!rawContent) {
    throw new Error("Empty AI response");
  }
  return rawContent;
}
async function organizePostWithAi(post, settings) {
  if (!settings.enabled) {
    return { result: null, warning: null };
  }
  let normalizedBaseUrl = "";
  try {
    normalizedBaseUrl = normalizeBaseUrl(settings.baseUrl);
    const model = settings.model.trim();
    if (!model) {
      return { result: null, warning: (await t()).warnAiMissingModel };
    }
    if (!await hasAiHostPermission(normalizedBaseUrl)) {
      return { result: null, warning: (await t()).warnAiPermissionMissing };
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2e4);
    const prompt = buildPrompt(post, settings);
    const transport = getAiProviderPreset(settings.provider).transport;
    try {
      const rawContent = transport === "gemini" ? await requestGeminiCompletion(normalizedBaseUrl, model, prompt, settings.apiKey, controller.signal) : await requestOpenAiCompatibleCompletion(normalizedBaseUrl, model, prompt, settings.apiKey, controller.signal);
      const candidate = extractJsonCandidate(rawContent);
      const parsed = JSON.parse(candidate);
      const result = sanitizeResult(parsed);
      if (!result.summary && result.tags.length === 0 && Object.keys(result.frontmatter).length === 0) {
        return { result: null, warning: null };
      }
      return { result, warning: null };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return {
      result: null,
      warning: (await t()).warnAiFailed.replace("{reason}", summarizeAiError(error, settings, normalizedBaseUrl))
    };
  }
}

// src/lib/media-permissions.ts
var OPTIONAL_MEDIA_ORIGINS = ["https://*.cdninstagram.com/*", "https://*.fbcdn.net/*"];
var MEDIA_DISABLED_WARNING = "\uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1 \uC800\uC7A5\uC774 \uAEBC\uC838 \uC788\uC5B4 \uC6D0\uACA9 URL\uC744 \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.";
var MEDIA_PERMISSION_WARNING = "\uCD94\uAC00 \uBBF8\uB514\uC5B4 \uAD8C\uD55C\uC774 \uC5C6\uC5B4 \uC6D0\uACA9 URL\uC744 \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.";
function hasAnyMedia(post) {
  return post.imageUrls.length > 0 || Boolean(post.videoUrl) || post.sourceType === "video" && Boolean(post.thumbnailUrl) || post.authorReplies.some((reply) => reply.imageUrls.length > 0 || Boolean(reply.videoUrl) || reply.sourceType === "video" && Boolean(reply.thumbnailUrl));
}
function requiresOptionalMediaPermission(post) {
  const urls = [
    ...post.imageUrls,
    ...post.sourceType === "video" ? [post.thumbnailUrl] : [],
    post.videoUrl,
    ...post.authorReplies.flatMap((reply) => [
      ...reply.imageUrls,
      ...reply.sourceType === "video" ? [reply.thumbnailUrl] : [],
      reply.videoUrl
    ])
  ].filter(Boolean);
  return urls.some((url) => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.endsWith("cdninstagram.com") || hostname.endsWith("fbcdn.net");
    } catch {
      return false;
    }
  });
}
async function hasOptionalMediaPermission() {
  if (!chrome.permissions?.contains) {
    return false;
  }
  try {
    return await chrome.permissions.contains({ origins: OPTIONAL_MEDIA_ORIGINS });
  } catch {
    return false;
  }
}
async function requestOptionalMediaPermission() {
  if (!chrome.permissions?.request) {
    return false;
  }
  try {
    return await chrome.permissions.request({ origins: OPTIONAL_MEDIA_ORIGINS });
  } catch {
    return false;
  }
}
async function resolveImageDownloadPolicy(post, includeImages, requestPermission) {
  if (!includeImages || !hasAnyMedia(post)) {
    return {
      allowImageDownloads: false,
      fallbackWarning: MEDIA_DISABLED_WARNING
    };
  }
  if (!requiresOptionalMediaPermission(post)) {
    return {
      allowImageDownloads: true,
      fallbackWarning: MEDIA_DISABLED_WARNING
    };
  }
  if (await hasOptionalMediaPermission()) {
    return {
      allowImageDownloads: true,
      fallbackWarning: MEDIA_DISABLED_WARNING
    };
  }
  if (!requestPermission) {
    return {
      allowImageDownloads: false,
      fallbackWarning: MEDIA_PERMISSION_WARNING
    };
  }
  const granted = await requestOptionalMediaPermission();
  return {
    allowImageDownloads: granted,
    fallbackWarning: granted ? MEDIA_DISABLED_WARNING : MEDIA_PERMISSION_WARNING
  };
}

// src/lib/notion-server.ts
var NOTION_SERVER_PATH = "/api/public/notion";
async function requireServerAuthPayload() {
  const auth = await getServerAuthContext();
  if (auth) {
    return auth;
  }
  const msg = await t();
  throw new Error(msg.optionsNotionOAuthRequiresPro);
}
async function postServerJson(path, payload) {
  let fallbackError = null;
  for (const origin of BACKEND_ORIGINS) {
    try {
      const response = await fetch(`${origin}${NOTION_SERVER_PATH}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
          fallbackError = new Error(`${origin}${NOTION_SERVER_PATH}: ${body?.error?.trim() || `HTTP ${response.status}`}`);
          continue;
        }
        throw new Error(body?.error?.trim() || `Notion server request failed (${response.status})`);
      }
      return body ?? {};
    } catch (error) {
      fallbackError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw fallbackError ?? new Error(`Notion OAuth backend is not reachable at ${PRIMARY_BACKEND_ORIGIN}.`);
}
async function savePostToNotionWithServer(post, notion, includeImages, aiResult, aiWarning) {
  const auth = await requireServerAuthPayload();
  const locale = await getLocale();
  return await postServerJson("/save", {
    ...auth,
    locale,
    post,
    notion: {
      parentType: notion.parentType,
      uploadMedia: notion.uploadMedia
    },
    includeImages,
    aiResult,
    aiWarning
  });
}

// src/lib/package.ts
var import_jszip = __toESM(require_jszip_min(), 1);

// src/lib/markdown.ts
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

// src/lib/package.ts
function prefixAssetBasePath(orderPrefix, basename) {
  return `${orderPrefix}. ${basename}`;
}
function buildArchiveNoteFilename(archiveName) {
  return `01. ${archiveName}.md`;
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
  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() ?? "jpg";
}
function hasAnyMedia2(post) {
  return post.imageUrls.length > 0 || Boolean(post.videoUrl) || post.sourceType === "video" && Boolean(post.thumbnailUrl) || post.authorReplies.some((reply) => reply.imageUrls.length > 0 || Boolean(reply.videoUrl) || reply.sourceType === "video" && Boolean(reply.thumbnailUrl));
}
async function collectRemoteAsset(url, assetBasePath, includeImages, fallbackWarning) {
  if (!url) {
    return { ref: null, assetFiles: [], warning: null };
  }
  if (!includeImages) {
    return {
      ref: url,
      assetFiles: [],
      warning: fallbackWarning
    };
  }
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("asset fetch failed");
    }
    const contentType = response.headers.get("content-type");
    const blob = await response.blob();
    const extension = guessExtension(url, contentType);
    const relativePath = `${assetBasePath}.${extension}`;
    return {
      ref: relativePath,
      assetFiles: [{ relativePath, blob }],
      warning: null
    };
  } catch {
    return {
      ref: url,
      assetFiles: [],
      warning: (await t()).warnImageAccessFailed
    };
  }
}
async function collectImageAssets(imageUrls, assetBasename, includeImages, fallbackWarning) {
  const refs = [];
  const assetFiles = [];
  let warning = null;
  for (const [index, imageUrl] of imageUrls.entries()) {
    const result = await collectRemoteAsset(imageUrl, `${assetBasename}-${String(index + 1).padStart(2, "0")}`, includeImages, fallbackWarning);
    if (result.ref) {
      refs.push(result.ref);
    }
    assetFiles.push(...result.assetFiles);
    warning = warning ?? result.warning;
  }
  return { refs, assetFiles, warning };
}
async function collectVideoAssets(videoUrl, thumbnailUrl, assetBasePath, includeImages, fallbackWarning) {
  const [videoResult, thumbnailResult] = await Promise.all([
    collectRemoteAsset(videoUrl, assetBasePath, includeImages, fallbackWarning),
    collectRemoteAsset(thumbnailUrl, `${assetBasePath}-thumb`, includeImages, fallbackWarning)
  ]);
  return {
    file: videoResult.ref,
    thumbnail: thumbnailResult.ref,
    assetFiles: [...videoResult.assetFiles, ...thumbnailResult.assetFiles],
    warning: videoResult.warning ?? thumbnailResult.warning
  };
}
async function buildArchiveBundle(post, filenamePattern, includeImages, fallbackWarning, aiOrganization) {
  const resolvedFallbackWarning = fallbackWarning ?? (await t()).warnImageDownloadOff;
  const archiveName = buildArchiveBaseName(filenamePattern, post);
  const ai = aiOrganization ? await organizePostWithAi(post, aiOrganization) : { result: null, warning: null };
  const postImages = await collectImageAssets(
    post.imageUrls,
    prefixAssetBasePath("02", "image"),
    includeImages,
    resolvedFallbackWarning
  );
  const postVideo = post.sourceType === "video" ? await collectVideoAssets(
    post.videoUrl,
    post.thumbnailUrl,
    prefixAssetBasePath("02", "video"),
    includeImages,
    resolvedFallbackWarning
  ) : null;
  const replyImages = await Promise.all(
    post.authorReplies.map(
      (reply, index) => collectImageAssets(
        reply.imageUrls,
        prefixAssetBasePath("03", `reply-${String(index + 1).padStart(2, "0")}-image`),
        includeImages,
        resolvedFallbackWarning
      )
    )
  );
  const replyVideos = await Promise.all(
    post.authorReplies.map(
      (reply, index) => reply.sourceType === "video" ? collectVideoAssets(
        reply.videoUrl,
        reply.thumbnailUrl,
        prefixAssetBasePath("03", `reply-${String(index + 1).padStart(2, "0")}-video`),
        includeImages,
        resolvedFallbackWarning
      ) : Promise.resolve(null)
    )
  );
  let warning = null;
  if (!includeImages && hasAnyMedia2(post)) {
    warning = resolvedFallbackWarning;
  }
  const noteWarning = warning ?? postImages.warning ?? postVideo?.warning ?? replyImages.find((result) => result.warning)?.warning ?? replyVideos.find((result) => result?.warning)?.warning ?? null;
  const userWarnings = [noteWarning, ai.warning].filter(Boolean);
  warning = userWarnings.length > 0 ? userWarnings.join(" | ") : null;
  const markdownContent = await renderMarkdown(
    post,
    {
      postImages: postImages.refs,
      postVideo: postVideo ? { thumbnail: postVideo.thumbnail, file: postVideo.file } : null,
      replyImages: replyImages.map((result) => result.refs),
      replyVideos: replyVideos.map((result) => result ? { thumbnail: result.thumbnail, file: result.file } : null)
    },
    noteWarning,
    ai.result
  );
  return {
    archiveName,
    markdownContent,
    assetFiles: [
      ...postImages.assetFiles,
      ...postVideo?.assetFiles ?? [],
      ...replyImages.flatMap((result) => result.assetFiles),
      ...replyVideos.flatMap((result) => result?.assetFiles ?? [])
    ],
    warning,
    noteWarning
  };
}
async function buildZipPackage(post, filenamePattern, includeImages, fallbackWarning = "\uC774\uBBF8\uC9C0/\uB3D9\uC601\uC0C1 \uC800\uC7A5\uC774 \uAEBC\uC838 \uC788\uC5B4 \uC6D0\uACA9 URL\uC744 \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.", savePathPattern = "", aiOrganization) {
  const bundle = await buildArchiveBundle(post, filenamePattern, includeImages, fallbackWarning, aiOrganization);
  const zip = new import_jszip.default();
  const archiveRoot = [...buildPathPatternParts(savePathPattern, post), bundle.archiveName].join("/");
  zip.file(`${archiveRoot}/${buildArchiveNoteFilename(bundle.archiveName)}`, bundle.markdownContent);
  for (const file of bundle.assetFiles) {
    zip.file(`${archiveRoot}/${file.relativePath}`, await file.blob.arrayBuffer());
  }
  return {
    blob: await zip.generateAsync({ type: "blob" }),
    zipFilename: buildZipFilename(filenamePattern, post),
    archiveName: bundle.archiveName,
    warning: bundle.warning
  };
}

// src/background.ts
var currentStatus = {
  kind: "idle",
  message: ""
};
async function startCloudLinkFlow() {
  const state = crypto.randomUUID();
  const createdTab = await chrome.tabs.create({
    url: buildCloudLinkStartUrl(state)
  });
  await setPendingCloudLinkRecord({
    state,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    tabId: createdTab.id ?? null
  });
}
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const currentUrl = changeInfo.url ?? tab.url;
  if (!currentUrl) {
    return;
  }
  void (async () => {
    const pending = await getPendingCloudLinkRecord();
    if (!pending?.state) {
      return;
    }
    const parsed = new URL(currentUrl);
    if (parsed.origin !== PRIMARY_BACKEND_ORIGIN) {
      return;
    }
    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const code = hashParams.get("code");
    const state = hashParams.get("state");
    const authError = parsed.searchParams.get("authError");
    if (authError) {
      await setPendingCloudLinkRecord(null);
      broadcastStatus({
        kind: "error",
        message: authError,
        canRetry: false
      });
      return;
    }
    if (!code || state !== pending.state) {
      return;
    }
    try {
      await completeCloudLink(code, state);
      await setPendingCloudLinkRecord(null);
      await chrome.tabs.remove(tabId).catch(() => void 0);
      broadcastStatus({
        kind: "success",
        message: (await t()).statusCloudConnected,
        canRetry: false
      });
    } catch (error) {
      await setPendingCloudLinkRecord(null);
      broadcastStatus({
        kind: "error",
        message: error instanceof Error ? error.message : (await t()).statusCloudSessionExpired,
        canRetry: false
      });
    }
  })();
});
function broadcastStatus(status) {
  currentStatus = status;
  void chrome.runtime.sendMessage({ type: "save-status", status }).catch(() => void 0);
}
async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tabs[0] ?? null;
}
async function createUnsupportedState(url) {
  const msg = await t();
  return {
    kind: "unsupported",
    message: url ? msg.statusUnsupported : msg.statusNoTab
  };
}
async function createZipRecentSave(post, archiveName, warning) {
  return {
    id: crypto.randomUUID(),
    saveTarget: "obsidian",
    canonicalUrl: post.canonicalUrl,
    shortcode: post.shortcode,
    author: post.author,
    title: post.title,
    downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
    archiveName,
    contentHash: post.contentHash,
    status: "complete",
    savedVia: "zip",
    savedRelativePath: null,
    remotePageId: null,
    remotePageUrl: null,
    warning,
    post
  };
}
async function createNotionRecentSave(post, pageId, pageUrl, warning) {
  return {
    id: crypto.randomUUID(),
    saveTarget: "notion",
    canonicalUrl: post.canonicalUrl,
    shortcode: post.shortcode,
    author: post.author,
    title: post.title,
    downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
    archiveName: post.title,
    contentHash: post.contentHash,
    status: "complete",
    savedVia: "notion",
    savedRelativePath: null,
    remotePageId: pageId,
    remotePageUrl: pageUrl,
    warning,
    post
  };
}
async function createCloudRecentSave(post, archiveId, archiveUrl, archiveTitle, warning) {
  return {
    id: crypto.randomUUID(),
    saveTarget: "cloud",
    canonicalUrl: post.canonicalUrl,
    shortcode: post.shortcode,
    author: post.author,
    title: post.title,
    downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
    archiveName: archiveTitle,
    contentHash: post.contentHash,
    status: "complete",
    savedVia: "cloud",
    savedRelativePath: null,
    remotePageId: archiveId,
    remotePageUrl: archiveUrl,
    warning,
    post
  };
}
function isMissingReceiverError(error) {
  return error instanceof Error && error.message.includes("Receiving end does not exist");
}
async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "ping-content-script" });
    return;
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      throw error;
    }
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
}
async function requestExtraction(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      throw error;
    }
    await ensureContentScript(tabId);
    return await chrome.tabs.sendMessage(tabId, message);
  }
}
async function extractPostFromTab(tab) {
  if (!tab.id || !tab.url) {
    const msg = await t();
    throw new Error(msg.statusTabError);
  }
  const message = { type: "extract-post", config: BUNDLED_EXTRACTOR_CONFIG };
  const response = await requestExtraction(tab.id, message);
  if ("__error" in response) {
    throw new Error(response.__error);
  }
  return response;
}
function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 32768;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
async function blobToDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const mimeType = blob.type || "application/octet-stream";
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}
async function downloadBlob(blob, filename) {
  const dataUrl = await blobToDataUrl(blob);
  await chrome.downloads.download({
    url: dataUrl,
    filename,
    saveAs: false
  });
}
async function saveCurrentPost(tab, allowDuplicate = false, imageOverride) {
  if (!tab.url || !isSupportedPermalink(tab.url)) {
    const unsupported = await createUnsupportedState(tab.url ?? null);
    broadcastStatus(unsupported);
    return unsupported;
  }
  const msg = await t();
  broadcastStatus({ kind: "saving", message: msg.statusSaving });
  try {
    const post = await extractPostFromTab(tab);
    const options = await getEffectiveOptions();
    if (options.saveTarget === "cloud") {
      const ai = await organizePostWithAi(post, options.aiOrganization);
      const cloudResult = await savePostToCloudWithServer(post, ai.result, ai.warning);
      const duplicate2 = await findDuplicateSave(post.canonicalUrl, post.contentHash, "cloud");
      const recent2 = duplicate2 && allowDuplicate ? {
        ...duplicate2,
        saveTarget: "cloud",
        canonicalUrl: post.canonicalUrl,
        shortcode: post.shortcode,
        author: post.author,
        title: post.title,
        downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        archiveName: cloudResult.title,
        contentHash: post.contentHash,
        status: "complete",
        savedVia: "cloud",
        savedRelativePath: null,
        remotePageId: cloudResult.archiveId,
        remotePageUrl: cloudResult.archiveUrl,
        warning: cloudResult.warning,
        post
      } : await createCloudRecentSave(
        post,
        cloudResult.archiveId,
        cloudResult.archiveUrl,
        cloudResult.title,
        cloudResult.warning
      );
      await upsertRecentSave(recent2);
      const success2 = {
        kind: "success",
        message: cloudResult.warning ? `${msg.statusSavedCloud}: ${cloudResult.warning}` : msg.statusSavedCloud,
        saveId: recent2.id,
        canRetry: true
      };
      broadcastStatus(success2);
      return success2;
    }
    if (options.saveTarget === "notion") {
      const duplicate2 = await findDuplicateSave(post.canonicalUrl, post.contentHash, "notion");
      if (duplicate2 && !allowDuplicate) {
        const alreadySaved = {
          kind: "success",
          message: msg.statusAlreadySaved,
          saveId: duplicate2.id,
          canRetry: true
        };
        broadcastStatus(alreadySaved);
        return alreadySaved;
      }
      const ai = await organizePostWithAi(post, options.aiOrganization);
      const notionResult = await savePostToNotionWithServer(post, options.notion, options.includeImages, ai.result, ai.warning);
      const recent2 = duplicate2 && allowDuplicate ? {
        ...duplicate2,
        saveTarget: "notion",
        canonicalUrl: post.canonicalUrl,
        shortcode: post.shortcode,
        author: post.author,
        title: post.title,
        downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        archiveName: notionResult.title,
        contentHash: post.contentHash,
        status: "complete",
        savedVia: "notion",
        savedRelativePath: null,
        remotePageId: notionResult.pageId,
        remotePageUrl: notionResult.pageUrl,
        warning: notionResult.warning,
        post
      } : await createNotionRecentSave(post, notionResult.pageId, notionResult.pageUrl, notionResult.warning);
      await upsertRecentSave(recent2);
      const success2 = {
        kind: "success",
        message: notionResult.warning ? `${msg.statusSavedNotion}: ${notionResult.warning}` : msg.statusSavedNotion,
        saveId: recent2.id,
        canRetry: true
      };
      broadcastStatus(success2);
      return success2;
    }
    const duplicate = await findDuplicateSave(post.canonicalUrl, post.contentHash, "obsidian");
    const imagePolicy = imageOverride && typeof imageOverride.allowImageDownloads === "boolean" && imageOverride.imageFallbackWarning ? {
      allowImageDownloads: imageOverride.allowImageDownloads,
      fallbackWarning: imageOverride.imageFallbackWarning
    } : await resolveImageDownloadPolicy(post, options.includeImages, true);
    const packaged = await buildZipPackage(
      post,
      options.filenamePattern,
      imagePolicy.allowImageDownloads,
      imagePolicy.fallbackWarning,
      options.savePathPattern,
      options.aiOrganization
    );
    await downloadBlob(packaged.blob, packaged.zipFilename);
    const recent = duplicate && !allowDuplicate ? {
      ...duplicate,
      saveTarget: "obsidian",
      canonicalUrl: post.canonicalUrl,
      shortcode: post.shortcode,
      author: post.author,
      title: post.title,
      downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      archiveName: packaged.archiveName,
      contentHash: post.contentHash,
      status: "complete",
      savedVia: "zip",
      savedRelativePath: null,
      remotePageId: null,
      remotePageUrl: null,
      warning: packaged.warning,
      post
    } : await createZipRecentSave(post, packaged.archiveName, packaged.warning);
    await upsertRecentSave(recent);
    const success = {
      kind: "success",
      message: duplicate && !allowDuplicate ? packaged.warning ? `${msg.statusDuplicateWarning}${packaged.warning}` : msg.statusDuplicate : packaged.warning ? `${msg.statusSavedZip}: ${packaged.warning}` : msg.statusSavedZip,
      saveId: recent.id,
      canRetry: true
    };
    broadcastStatus(success);
    return success;
  } catch (error) {
    const message = error instanceof Error ? error.message : msg.statusError;
    const failed = { kind: "error", message, canRetry: true };
    broadcastStatus(failed);
    return failed;
  }
}
async function redownloadSave(saveId, successMessage, imageOverride) {
  const msg = await t();
  const resolvedSuccessMessage = successMessage ?? msg.statusResaved;
  const recentSave = await findRecentSaveById(saveId);
  if (!recentSave) {
    const failed = { kind: "error", message: msg.statusRecentNotFound, canRetry: false };
    broadcastStatus(failed);
    return failed;
  }
  broadcastStatus({ kind: "saving", message: msg.statusResaving });
  try {
    const options = await getEffectiveOptions();
    if (recentSave.saveTarget === "cloud") {
      const ai = await organizePostWithAi(recentSave.post, options.aiOrganization);
      const cloudResult = await savePostToCloudWithServer(
        recentSave.post,
        ai.result,
        ai.warning
      );
      const updatedSave2 = {
        ...recentSave,
        saveTarget: "cloud",
        downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        archiveName: cloudResult.title,
        savedVia: "cloud",
        savedRelativePath: null,
        remotePageId: cloudResult.archiveId,
        remotePageUrl: cloudResult.archiveUrl,
        warning: cloudResult.warning
      };
      await upsertRecentSave(updatedSave2);
      const success2 = {
        kind: "success",
        message: cloudResult.warning ? `${msg.statusResavedCloud}: ${cloudResult.warning}` : msg.statusResavedCloud,
        saveId: updatedSave2.id,
        canRetry: true
      };
      broadcastStatus(success2);
      return success2;
    }
    if (recentSave.saveTarget === "notion") {
      const ai = await organizePostWithAi(recentSave.post, options.aiOrganization);
      const notionResult = await savePostToNotionWithServer(
        recentSave.post,
        options.notion,
        options.includeImages,
        ai.result,
        ai.warning
      );
      const updatedSave2 = {
        ...recentSave,
        saveTarget: "notion",
        downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        archiveName: notionResult.title,
        savedVia: "notion",
        savedRelativePath: null,
        remotePageId: notionResult.pageId,
        remotePageUrl: notionResult.pageUrl,
        warning: notionResult.warning
      };
      await upsertRecentSave(updatedSave2);
      const success2 = {
        kind: "success",
        message: notionResult.warning ? `${msg.statusResavedNotion}: ${notionResult.warning}` : msg.statusResavedNotion,
        saveId: updatedSave2.id,
        canRetry: true
      };
      broadcastStatus(success2);
      return success2;
    }
    const imagePolicy = imageOverride && typeof imageOverride.allowImageDownloads === "boolean" && imageOverride.imageFallbackWarning ? {
      allowImageDownloads: imageOverride.allowImageDownloads,
      fallbackWarning: imageOverride.imageFallbackWarning
    } : await resolveImageDownloadPolicy(recentSave.post, options.includeImages, true);
    const packaged = await buildZipPackage(
      recentSave.post,
      options.filenamePattern,
      imagePolicy.allowImageDownloads,
      imagePolicy.fallbackWarning,
      options.savePathPattern,
      options.aiOrganization
    );
    await downloadBlob(packaged.blob, packaged.zipFilename);
    const updatedSave = {
      ...recentSave,
      saveTarget: "obsidian",
      downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      archiveName: packaged.archiveName,
      savedVia: "zip",
      savedRelativePath: null,
      remotePageId: null,
      remotePageUrl: null,
      warning: packaged.warning
    };
    await upsertRecentSave(updatedSave);
    const success = {
      kind: "success",
      message: resolvedSuccessMessage,
      saveId: updatedSave.id,
      canRetry: true
    };
    broadcastStatus(success);
    return success;
  } catch (error) {
    const failed = {
      kind: "error",
      message: error instanceof Error ? error.message : msg.statusRedownloadError,
      canRetry: true
    };
    broadcastStatus(failed);
    return failed;
  }
}
chrome.runtime.onInstalled.addListener(async () => {
  const options = await getOptions();
  await setOptions({ ...DEFAULT_OPTIONS, ...options });
});
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "save-current-post") {
    return;
  }
  const tab = await getActiveTab();
  if (!tab) {
    broadcastStatus(await createUnsupportedState(null));
    return;
  }
  await saveCurrentPost(tab);
});
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  void (async () => {
    switch (request.type) {
      case "get-popup-state": {
        const tab = await getActiveTab();
        const recentSaves = await getRecentSaves();
        const supported = Boolean(tab?.url && isSupportedPermalink(tab.url));
        const cloudConnection = await fetchCloudConnectionStatus();
        const response = {
          supported,
          currentUrl: tab?.url ?? null,
          status: supported ? currentStatus : await createUnsupportedState(tab?.url ?? null),
          recentSaves,
          cloudConnection
        };
        sendResponse(response);
        break;
      }
      case "save-current-post": {
        const tab = await getActiveTab();
        if (!tab) {
          sendResponse(createUnsupportedState(null));
          return;
        }
        sendResponse(
          await saveCurrentPost(tab, request.allowDuplicate, {
            allowImageDownloads: request.allowImageDownloads,
            imageFallbackWarning: request.imageFallbackWarning
          })
        );
        break;
      }
      case "extract-current-post": {
        const tab = await getActiveTab();
        const msg = await t();
        if (!tab) {
          sendResponse({ __error: msg.statusNoTab });
          return;
        }
        if (!tab.url || !isSupportedPermalink(tab.url)) {
          sendResponse({ __error: msg.statusUnsupported });
          return;
        }
        try {
          sendResponse(await extractPostFromTab(tab));
        } catch (error) {
          sendResponse({ __error: error instanceof Error ? error.message : msg.statusExtractFailed });
        }
        break;
      }
      case "redownload-save": {
        sendResponse(
          await redownloadSave(request.saveId, void 0, {
            allowImageDownloads: request.allowImageDownloads,
            imageFallbackWarning: request.imageFallbackWarning
          })
        );
        break;
      }
      case "delete-recent-save": {
        const recentSaves = await removeRecentSaveById(request.saveId);
        const tab = await getActiveTab();
        const msg = await t();
        const cloudConnection = await fetchCloudConnectionStatus();
        const response = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusDeletedRecent,
            canRetry: false
          },
          recentSaves,
          cloudConnection
        };
        broadcastStatus(response.status);
        sendResponse(response);
        break;
      }
      case "clear-recent-saves": {
        await clearRecentSaves();
        const tab = await getActiveTab();
        const msg = await t();
        const cloudConnection = await fetchCloudConnectionStatus();
        const response = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusClearedRecents,
            canRetry: false
          },
          recentSaves: [],
          cloudConnection
        };
        broadcastStatus(response.status);
        sendResponse(response);
        break;
      }
      case "start-cloud-link": {
        await startCloudLinkFlow();
        sendResponse({ ok: true });
        break;
      }
      case "disconnect-cloud-link": {
        const cloudConnection = await disconnectCloudConnection();
        const tab = await getActiveTab();
        const msg = await t();
        const response = {
          supported: Boolean(tab?.url && isSupportedPermalink(tab.url)),
          currentUrl: tab?.url ?? null,
          status: {
            kind: "success",
            message: msg.statusCloudDisconnected,
            canRetry: false
          },
          recentSaves: await getRecentSaves(),
          cloudConnection
        };
        broadcastStatus(response.status);
        sendResponse(response);
        break;
      }
      case "get-options": {
        sendResponse(await getOptions());
        break;
      }
      case "update-options": {
        await setOptions(request.options);
        sendResponse({ ok: true });
        break;
      }
      default: {
        sendResponse({ ok: false });
      }
    }
  })();
  return true;
});
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
