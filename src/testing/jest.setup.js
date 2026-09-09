/**
 * jest-environment-jsdom wraps globals like Reflect in cross-realm proxies.
 * get-proto@1.0.1 (a transitive dep of reactstrap/deep-equal) calls
 * Reflect.getPrototypeOf(Reflect) which throws "called on non-object" when
 * the Reflect argument is such a proxy. Patch the method to fall back to
 * Object.getPrototypeOf for cross-realm values.
 */
if (typeof global.Reflect !== 'undefined' && global.Reflect.getPrototypeOf) {
  const _orig = global.Reflect.getPrototypeOf;
  global.Reflect.getPrototypeOf = function (target) {
    try {
      return _orig.call(global.Reflect, target);
    } catch (e) {
      return Object.getPrototypeOf(target);
    }
  };
}

/**
 * jsdom does not expose TextEncoder/TextDecoder, which are ordinary browser
 * globals — the file viewer reads a preview as bytes and decodes the ones
 * that turn out to be text. Node has both; this puts them where the code
 * running under jsdom expects to find them.
 */
// setupFiles runs as CommonJS before the module system is available, so an
// `import` here would not parse.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
