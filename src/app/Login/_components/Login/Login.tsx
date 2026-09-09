import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from 'reactstrap';
import {
  Authenticator as AuthenticatorHooks,
  useTapisConfig,
} from '@tapis/tapisui-hooks';
import { FormikInput, SubmitWrapper } from '@tapis/tapisui-common';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useExtension } from 'extensions';
import { Implicit } from '@tapis/tapisui-extensions-core/dist/oauth2';
import { isLocalhost } from 'utils/resolveBasePath';
import { VisibilityOffRounded, VisibilityRounded } from '@mui/icons-material';
import { clearLoginReturn, stageLoginReturn } from '../../loginReturn';
import styles from './Login.module.scss';

// One screen, every available method inline. The old three-state chooser
// (choice → implicit | password) is gone: when both methods are available the
// password form and the SSO button render together, so there is no
// intermediate "pick a login type" click.
//
// Nothing here redirects on its own. Every deployment — including SSO-only
// tenants — renders this page and waits for a click. A silent hand-off to the
// IdP is invisible when it fails: a callback token rejected client-side
// (expired, tenant mismatch — see the auto-logout effect in useTapisConfig)
// would bounce login → IdP → callback → cleared → login with nothing for the
// user to act on.
//
// The `use_iframe_redirect=false` query param is kept verbatim: the
// authenticator expects it, even though the UI's iframe mode is long gone.
//
// /logout still lands on #/login?stay=1; nothing here reads it any more,
// because this page never redirects on its own. A token the IdP hands back
// that this deployment cannot use is refused at the OAuth2 callback, which
// says why on its own screen, so this page carries no after-the-fact notice.

/** The implicit URL whose OAuth2 client answered, for this browser session. */
const SSO_CLIENT_OK_KEY = 'tapis-sso-client-ok';

const buildDefaultImplicitURL = (
  basePath: string | undefined,
  pathTenantId: string | undefined
): string | undefined => {
  if (!basePath || !pathTenantId) return undefined;
  const redirectURI = basePath + '/#/oauth2';
  return (
    basePath +
    '/v3/oauth2/authorize' +
    `?client_id=tapisui-implicit-client-${pathTenantId}&response_type=token&redirect_uri=${encodeURIComponent(
      redirectURI
    )}&use_iframe_redirect=false`
  );
};

/**
 * The eye inside the password field's right edge. It appears once there is
 * something to show, sits on the input itself (measured, so it follows the
 * label and input heights), and is a real button in the Tab order with a
 * spoken name; Enter in the password still submits.
 */
const PasswordReveal: React.FC<{ revealed: boolean; onToggle: () => void }> = ({
  revealed,
  onToggle,
}) => {
  const { values } = useFormikContext<{ password: string }>();
  const ref = useRef<HTMLButtonElement>(null);
  const [top, setTop] = useState<number | undefined>(undefined);
  const hasText = !!values.password;
  useLayoutEffect(() => {
    const input = ref.current?.parentElement?.querySelector('input');
    if (input) setTop(input.offsetTop + input.offsetHeight / 2);
  }, [hasText]);
  if (!hasText) return null;
  return (
    <button
      ref={ref}
      type="button"
      className={styles['revealToggle']}
      style={top === undefined ? undefined : { top }}
      aria-controls="password"
      aria-pressed={revealed}
      aria-label={revealed ? 'Hide password' : 'Show password'}
      title={revealed ? 'Hide password' : 'Show password'}
      onClick={onToggle}
    >
      {revealed ? (
        <VisibilityOffRounded fontSize="inherit" />
      ) : (
        <VisibilityRounded fontSize="inherit" />
      )}
    </button>
  );
};

const Login: React.FC = () => {
  const { login, isLoading, error } = AuthenticatorHooks.useLogin();
  const { accessToken, basePath, pathTenantId } = useTapisConfig();
  const { extension } = useExtension();
  const location = useLocation<{
    from?: { pathname?: string; search?: string };
  }>();
  const [implicitError, setImplicitError] = useState<string | undefined>(
    undefined
  );
  const [implicitReady, setImplicitReady] = useState<boolean>(false);

  // A password login resolves in place and never reads the recorded target;
  // drop it so it cannot send a later sign-in somewhere stale.
  useEffect(() => {
    if (accessToken) clearLoginReturn();
  }, [accessToken]);

  // ── Which methods does this deployment offer? ────────────────────────────
  let implicitAuthURL: string | undefined = undefined;
  let passwordAuth: boolean = false;
  // True when the implicit config came from an extension's explicit fields —
  // in that case we trust it and skip the reachability gate on the button.
  let implicitFromExtension = false;
  // Set on localhost, where the password form stands in for Tapis Auth (the
  // OAuth2 implicit flow)
  // (an IdP redirect cannot come back to a dev machine): the form then says
  // it is a development affordance. 'sso-only' when the deployment offers no
  // password at all in production.
  let devPassword: 'sso-only' | 'stand-in' | undefined = undefined;

  if (extension) {
    // getAuthByType returns undefined when 'implicit' isn't in authMethods —
    // guard it (an extension listing only password used to crash here).
    const implicitAuth = extension.getAuthByType('implicit') as
      | Implicit
      | undefined;
    if (implicitAuth) {
      const usesDefaults =
        implicitAuth.authorizationPath === 'default' ||
        implicitAuth.clientId === 'default' ||
        implicitAuth.redirectURI === 'default';
      if (usesDefaults) {
        implicitAuthURL = buildDefaultImplicitURL(basePath, pathTenantId);
      } else {
        implicitAuthURL =
          implicitAuth.authorizationPath +
          `?client_id=${implicitAuth.clientId}&response_type=${
            implicitAuth.responseType
          }&redirect_uri=${encodeURIComponent(
            implicitAuth.redirectURI
          )}&use_iframe_redirect=false`;
        implicitFromExtension = true;
      }
    }
    passwordAuth = !!extension.getAuthByType('password');

    // Extension OIDC redirect URIs point at the production hostname and can
    // never complete on localhost, so a dev machine gets the password form
    // regardless of what the extension offers in production. Without the
    // `passwordAuth = true` here, an SSO-only tenant (e.g. icicleai, which
    // forces SSO so every user goes through the IdP's MFA) would leave
    // localhost with no usable method at all — implicit bounces to the
    // production host and never comes back.
    if (isLocalhost()) {
      implicitAuthURL = undefined;
      // Marked when the deployment itself does NOT offer password — the form
      // below is then a localhost-only affordance and says so.
      devPassword = passwordAuth ? 'stand-in' : 'sso-only';
      passwordAuth = true;
    }
  } else {
    // No extension: default implicit client for the tenant, plus password.
    implicitAuthURL = buildDefaultImplicitURL(basePath, pathTenantId);
    passwordAuth = true;
    // Same localhost constraint: redirect_uri is built from the remote
    // tenant's basePath and cannot return to localhost.
    if (isLocalhost()) {
      implicitAuthURL = undefined;
      devPassword = 'stand-in';
    }
  }

  const goToProvider = () => {
    if (!implicitAuthURL) return;
    // Return target for the OAuth2 callback: location.state.from (set by
    // ProtectedRoute), else the page where a Login control was pressed.
    stageLoginReturn(location.state?.from);
    window.location.replace(implicitAuthURL);
  };

  // No automatic hand-off to the IdP: SSO starts only from the button, so a
  // rejected callback token cannot loop login -> IdP -> callback -> login.
  useEffect(() => {
    if (!implicitAuthURL && !passwordAuth) {
      setImplicitError(
        'No authentication methods available. Please contact Tapis admins for TapisUI tenant support.'
      );
    }
    // goToProvider is recreated per render but only reads render-scope values
    // already covered by these deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [implicitAuthURL, passwordAuth]);

  // Reachability probe for default-built clients (the tenant might not have
  // one). redirect:'manual' stops at the 302 — an opaqueredirect is proof
  // enough the OAuth2 client exists; following the chain trips CORS on
  // Chromium. Extension-configured URLs are assumed correct.
  //
  // A client that answered once this browser session makes the button ready
  // at once on the next visit (logout, an expired token, the login modal):
  // nobody waits on the probe twice. It is still re-checked in the
  // background every time, because a client can break mid-session, and a
  // stale "it answered" must not keep the password form hidden while SSO is
  // failing. A failed re-check forgets the client and brings the form back.
  const ssoClientKnownOk =
    !!implicitAuthURL &&
    sessionStorage.getItem(SSO_CLIENT_OK_KEY) === implicitAuthURL;
  useEffect(() => {
    if (!implicitAuthURL || implicitFromExtension) return;
    setImplicitError(undefined);
    setImplicitReady(false);
    const failed = (message: string) => {
      sessionStorage.removeItem(SSO_CLIENT_OK_KEY);
      setImplicitError(message);
    };
    fetch(implicitAuthURL, { method: 'GET', redirect: 'manual' })
      .then((response) => {
        if (response.type === 'opaqueredirect' || response.status === 200) {
          sessionStorage.setItem(SSO_CLIENT_OK_KEY, implicitAuthURL);
          setImplicitReady(true);
        } else if (response.status === 400) {
          failed('Tapis Auth unavailable: bad request (400)');
        } else {
          // almost always a tenant nobody has made the client for yet
          failed('Tapis Auth unavailable: missing client');
        }
      })
      .catch(() => {
        failed('Tapis Auth unreachable');
      });
  }, [implicitAuthURL, implicitFromExtension]);

  // Show-password, as NIST SP 800-63B recommends: hidden by default, and
  // hidden again once the form is sent.
  const [revealPassword, setRevealPassword] = useState(false);

  const onSubmit = ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    setRevealPassword(false);
    return login(username, password);
  };

  const loginSchema = Yup.object({
    username: Yup.string().required('Enter your username'),
    password: Yup.string().required('Enter your password'),
  });

  // The reachability probe is still running (default-built clients only).
  // Rendered as an in-button animation — the box itself must not change.
  const probing =
    !!implicitAuthURL &&
    !implicitFromExtension &&
    !ssoClientKnownOk &&
    !implicitReady &&
    !implicitError;

  // Password is the way in only where OAuth2 is not: no implicit
  // client configured, the probe found none (a new tenant nobody has set one
  // up for), or localhost, where implicit is suppressed above. A tenant whose
  // client answers gets no password offer at all, rather than a second door
  // on every login page. Nobody is locked out, because a missing or broken
  // client is exactly the case that brings the form back, and it costs no
  // extra request: it rides on the probe the button already makes.
  // Extensions where password is first-class set loginPage.passwordProminent.
  // The password form is the only way in: start the cursor in it, so a
  // keyboard user can type and tab straight through.
  const passwordOnly = !implicitAuthURL || !!implicitError;
  const showPassword =
    passwordAuth &&
    (!implicitAuthURL ||
      !!implicitError ||
      !!extension?.loginPage?.passwordProminent);

  return (
    <div>
      {implicitAuthURL && (
        <div className={styles['buttons']}>
          <Button
            className={[
              styles['podButton'],
              probing ? styles['loadingBtn'] : '',
            ].join(' ')}
            data-testid="tapis-auth-login"
            onClick={goToProvider}
            disabled={!!implicitError || probing}
          >
            {probing ? (
              <>
                Checking sign-in service
                <span className={styles['spinner']} />
              </>
            ) : (
              'Log in'
            )}
          </Button>
        </div>
      )}
      {implicitError && (
        <div className={styles['adminNotice']}>
          <span className={styles['amberDot']} />
          <span>{implicitError}</span>
        </div>
      )}
      {showPassword && (
        <div className={styles['passwordForm']}>
          {implicitAuthURL && <div className={styles['divider']}>or</div>}
          {devPassword && (
            <div className={styles['devNotice']}>
              <span className={styles['devTag']}>local dev</span>
              {devPassword === 'sso-only'
                ? 'Tapis Auth only in production'
                : 'Tapis Auth is off on localhost'}
            </div>
          )}
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={onSubmit}
          >
            <Form>
              <FormikInput
                name="username"
                autoComplete="username"
                autoFocus={passwordOnly}
                errorsAfterTouch
                label="Username"
                // both fields are plainly needed on a sign-in form; an empty
                // one says so when you submit, not with a chip beforehand
                required={false}
                description={
                  <>
                    Your <span className={styles['tapisMark']}>Tapis</span>{' '}
                    username
                  </>
                }
              />
              <div className={styles['passwordField']}>
                <FormikInput
                  name="password"
                  errorsAfterTouch
                  label="Password"
                  required={false}
                  description={
                    <>
                      Your <span className={styles['tapisMark']}>Tapis</span>{' '}
                      password
                    </>
                  }
                  type={revealPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                />
                <PasswordReveal
                  revealed={revealPassword}
                  onToggle={() => setRevealPassword((r) => !r)}
                />
              </div>
              {/* isLoading stays false here on purpose: SubmitWrapper's
                  spinner renders beside the button and shifts the card.
                  The loading state lives on the button itself instead. */}
              <SubmitWrapper
                isLoading={false}
                error={error}
                success={undefined}
                className={styles['submitRow']}
              >
                <Button
                  type="submit"
                  className={[
                    styles['podButton'],
                    isLoading ? styles['loadingBtn'] : '',
                  ].join(' ')}
                  disabled={isLoading || accessToken != null}
                >
                  {isLoading ? (
                    <>
                      Logging in
                      <span className={styles['spinner']} />
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </SubmitWrapper>
            </Form>
          </Formik>
        </div>
      )}
    </div>
  );
};

export default Login;
