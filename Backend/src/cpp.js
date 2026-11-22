// native.js
import * as napi from '../dist/node/napi.mjs';

const mod = await napi.initNative();

// Things that must NOT be wrapped: classes, async init, and low-level
// pointer/memory helpers that take arrays/buffers for their own purposes.
const SKIP = new Set([
  'initNative', 'AllSymbols', 'NativePointer',
  'allocBuffer', 'allocPointer', 'allocString', 'cstring',
  'readBuffer', 'readBytes', 'readCString', 'readNumberAt',
  'readPointerAt', 'readString', 'releaseCallback',
  'writeBuffer', 'writeBytes', 'writeNumberAt', 'writePointerAt',
]);

const vectorTypes = Object.keys(mod)
  .filter((k) => k.startsWith('Vector'))
  .map((k) => mod[k]);
const isVector = (v) => v != null && vectorTypes.some((T) => v instanceof T);

function vectorTypeFor(arr) {
  if (arr.length === 0) return mod.VectorString;
  if (arr.every((x) => typeof x === 'string')) return mod.VectorString;
  if (arr.every((x) => typeof x === 'bigint')) return mod.VectorInt64;
  if (arr.every((x) => typeof x === 'number')) {
    return arr.every(Number.isInteger) ? mod.VectorInt : mod.VectorDouble;
  }
  throw new TypeError('Mixed-type array cannot be converted to a native vector');
}

function wrap(fn) {
  return (...args) => {
    const temps = [];
    try {
      const converted = args.map((a) => {
        if (!Array.isArray(a)) return a;
        const v = mod.toVector(vectorTypeFor(a), a);
        temps.push(v);
        return v;
      });

      const result = fn(...converted);

      if (isVector(result)) {
        try {
          return mod.toArray(result);
        } finally {
          result.delete();
        }
      }
      return result;
    } finally {
      temps.forEach((v) => v.delete());
    }
  };
}

export const native = Object.fromEntries(
  Object.entries(napi)
    .filter(([name, v]) => typeof v === 'function' && !SKIP.has(name))
    .map(([name, fn]) => [name, wrap(fn)])
);

// Re-export the untouched low-level stuff so you only import from one place
export const { NativePointer, allocBuffer, readCString /* , ... */ } = napi;
export { mod };