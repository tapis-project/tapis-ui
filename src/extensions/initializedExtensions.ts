import {
  Extension,
  registeredExtensions,
} from '@tapis/tapisui-extensions-core';
import { extension as icicleExtension } from '@icicle/tapisui-extension';
import { extension as scopedExtension } from '@scoped/tapisui-extension';
import { extension as demoExtension } from '@tapis/tapisui-extension-demo';
import { resolveBasePath } from 'utils/resolveBasePath';

/** Every extension bundled with this build, keyed by package name. The map
 *  lives here (not index.tsx) so non-React modules can resolve the active
 *  extension imperatively. */
export const initializedExtensions: { [key: string]: Extension } = {
  '@icicle/tapisui-extension': icicleExtension,
  '@scoped/tapisui-extension': scopedExtension,
  '@demo/tapisui-extension': demoExtension,
};

/**
 * Imperative twin of `useExtension()` — same basePath match against
 * `registeredExtensions`, callable outside React (registry resolvers,
 * services, module helpers).
 */
export const getActiveExtension = (): Extension | undefined => {
  const basePath = resolveBasePath();
  for (const name in registeredExtensions) {
    if (registeredExtensions[name].baseUrls.includes(basePath)) {
      return initializedExtensions[name];
    }
  }
  return undefined;
};
