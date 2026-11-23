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

const EXPECTED_VECTOR_RE = /as a (Vector\w+)\b/;

function wrap(fn) {
  return (...args) => {
    const temps = [];
    const current = args.slice();
    try {
      while (true) {
        try {
          const result = fn(...current);

          if (isVector(result)) {
            try {
              return mod.toArray(result);
            } finally {
              result.delete();
            }
          }
          return result;
        } catch (rawError) {
          const match = EXPECTED_VECTOR_RE.exec(String(rawError?.message || rawError));
          const index = current.findIndex((a) => Array.isArray(a));
          if (!match || index < 0 || typeof mod[match[1]] !== 'function') {
            throw rawError;
          }
          const vector = mod.toVector(mod[match[1]], current[index]);
          temps.push(vector);
          current[index] = vector;
        }
      }
    } finally {
      temps.forEach((v) => {
        try {
          v.delete();
        } catch (e) { /* ignored */ }
      });
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
