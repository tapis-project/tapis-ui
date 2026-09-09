// The location-state contract for raising the app's login modal over a
// public pre-login page (deployments with an extension `prelogin` config).
//
// Producers:
//   - ProtectedRoute — bounces an unauthenticated visitor to the prelogin
//     landing with this state (from = the route they wanted).
//   - Extension pages — gate an in-page action (e.g. the ICICLE board's
//     upcoming previews) by history.replace-ing the current location with
//     loginPromptState({ message }).
// Consumer:
//   - The app layout watches location.state for `loginModal` and opens the
//     LoginDialog with `from`/`loginMessage`.
//
// Always build the state through loginPromptState() — the key names are the
// wire format between packages; hand-rolled literals break silently on a
// rename.

export type LoginPromptState = {
  loginModal: true;
  /** Custom context line for in-page action gates (wins over route copy). */
  loginMessage?: string;
  /** Where the user was headed when they got bounced. */
  from?: { pathname?: string };
};

export const loginPromptState = (opts?: {
  message?: string;
  from?: { pathname?: string };
}): LoginPromptState => ({
  loginModal: true,
  ...(opts?.message ? { loginMessage: opts.message } : {}),
  ...(opts?.from ? { from: opts.from } : {}),
});
