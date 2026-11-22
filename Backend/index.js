import { initNative, helloFromCpp } from './dist/node/napi.mjs';

await initNative();
console.log(helloFromCpp());

