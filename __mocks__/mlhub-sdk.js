// Stub for the @mlhub/* SDKs under Jest.
//
// Those packages ship ESM-only dist with an `exports` map that has no `require`
// condition, so Jest (CJS) cannot resolve or parse them. Nothing in src/ tests
// exercises ML Hub — the packages are only pulled in transitively by
// `@tapis/tapisui-api`'s barrel export, which every pods component imports. A
// stub keeps that import chain resolvable so src/ test suites can run at all.
//
// The Proxy answers any named import with an inert function, so adding a new
// ML Hub API never requires touching this file.
module.exports = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      return function mlHubSdkStub() {
        throw new Error(
          `@mlhub SDK member "${String(prop)}" was called in a test. ` +
            'ML Hub is stubbed under Jest — mock it explicitly in the test that needs it.'
        );
      };
    },
  }
);
