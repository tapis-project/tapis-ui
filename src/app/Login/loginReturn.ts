// Where to send the user after signing in. One owner for the sessionStorage
// keys: a Login control records the page it was pressed on, the sign-in start
// stages the target for the OAuth2 callback, and the callback takes it.

const RETURN_KEY = 'tapis-login-return';
const FROM_KEY = 'tapis-login-from';

type Wanted = { pathname?: string; search?: string };

/** Record the page a Login control was pressed on. */
export const rememberLoginReturn = (path: string): void =>
  sessionStorage.setItem(RETURN_KEY, path);

/** The target for a sign-in now: `wanted` (ProtectedRoute), else the page a
 *  Login control was pressed on. The home page is not a target. */
export const readLoginReturn = (wanted?: Wanted): string | undefined => {
  const from = wanted?.pathname
    ? `${wanted.pathname}${wanted.search ?? ''}`
    : sessionStorage.getItem(RETURN_KEY);
  return from && from !== '/' ? from : undefined;
};

/** Forget every recorded target, so none outlives the sign-in it was for. */
export const clearLoginReturn = (): void => {
  sessionStorage.removeItem(RETURN_KEY);
  sessionStorage.removeItem(FROM_KEY);
};

/** Stage the target for the OAuth2 callback before leaving for the IdP. */
export const stageLoginReturn = (wanted?: Wanted): void => {
  const from = readLoginReturn(wanted);
  clearLoginReturn();
  if (from) sessionStorage.setItem(FROM_KEY, from);
};

/** Consume the staged target in the OAuth2 callback. */
export const takeLoginReturn = (): string | undefined => {
  const from = sessionStorage.getItem(FROM_KEY) ?? undefined;
  clearLoginReturn();
  return from;
};
