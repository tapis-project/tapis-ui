import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { loginPromptState } from './loginPromptState';

/**
 * Raise the app's login dialog over the current page.
 *
 * The state rides INSIDE the location object, because that is the only form
 * the router this app actually runs honours. The app mounts react-router-dom
 * 5's HashRouter, which runs on history 4, and history 4's hash history
 * throws a second `state` argument away: its replace() calls
 * createLocation(path, undefined, ...). No error, one dev-only console
 * warning, and a Sign in press that does nothing at all.
 *
 * Nothing static catches it. @types/history 4 gives all three histories one
 * interface, and the memory and browser histories DO honour the second
 * argument, so tsc accepts it and a MemoryRouter test passes. The root
 * package.json lists history 5 as well; HashRouter does not use it.
 *
 * replace, not push, so Back does not reopen the dialog; pathname and search
 * are kept, so the page underneath is the one the press was made on.
 */
export const useLoginPrompt = () => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  return useCallback(
    (opts?: Parameters<typeof loginPromptState>[0]) =>
      history.replace({ pathname, search, state: loginPromptState(opts) }),
    [history, pathname, search]
  );
};
