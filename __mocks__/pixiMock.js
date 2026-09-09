// Universal permissive stub for ESM-only libraries jest can't parse (pixi.js,
// d3-force) that enter suites only through import chains (Sidebar → ChatPanel
// → GraphEmbed → GraphViz). Every property is a callable/constructible proxy
// that yields more of the same, so named imports, `new X()`, and d3-style
// chained calls (`forceSimulation().force(...).on(...)`) all resolve. The
// components that actually use these libs are never rendered under jsdom.
function make() {
  const fn = function () {};
  return new Proxy(fn, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      if (prop === Symbol.toPrimitive) return () => '';
      if (prop === 'prototype') return target.prototype;
      return make();
    },
    apply: () => make(),
    construct: () => make(),
  });
}
module.exports = make();
