import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'reactstrap';
import {
  Authenticator as AuthenticatorHooks,
  useTapisConfig,
} from '@tapis/tapisui-hooks';
import { FormikInput, SubmitWrapper } from '@tapis/tapisui-common';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useExtension } from 'extensions';
import { Implicit } from '@tapis/tapisui-extensions-core/dist/oauth2';
import styles from './Login.module.scss';

const Login: React.FC = () => {
  const { login, isLoading, error } = AuthenticatorHooks.useLogin();
  const { accessToken, basePath, pathTenantId, setAccessToken } =
    useTapisConfig();
  const navigate = useHistory();
  const { extension } = useExtension();
  const [activeAuthMethod, setActiveAuthMethod] = useState<
    undefined | 'implicit' | 'password'
  >(undefined);
  const [implicitError, setImplicitError] = useState<string | undefined>(
    undefined
  );
  const [implicitReady, setImplicitReady] = useState<boolean>(false);

  // If there's only one, we don't prompt users to choose auth to use.
  // Auth order
  // 1. extension.implicit
  // 1a. default - redirect
  // 1b. nondefault - iframe - federated auth breaks due to iframe permissions on external sites
  // 2. extension.password
  // 3. default implicit client or error message
  // 4. default password client or error message
  let implicitAuthURL: string | undefined = undefined;
  let implicitIframe: boolean = false;
  let passwordAuth = undefined;
  if (extension) {
    let implicitAuth = extension.getAuthByType('implicit') as Implicit;
    implicitAuthURL =
      implicitAuth.authorizationPath +
      `?client_id=${implicitAuth.clientId}&response_type=${
        implicitAuth.responseType
      }&redirect_uri=${encodeURIComponent(
        implicitAuth.redirectURI
      )}&use_iframe_redirect=${String(implicitIframe)}`;
    // TODO - Get localhost working with http://localhost:3000/#/oauth2
    passwordAuth =
      (extension.getAuthByType('password') as boolean | undefined) || false;
  } else {
    // If no extension, use default implicit and password auth
    const defaultAuthURL = basePath
      ? basePath + '/v3/oauth2/authorize'
      : undefined;
    const defaultRedirectURI = basePath ? basePath + '/#/oauth2' : '';
    const defaultResponeType = 'token';
    const defaultClientId = pathTenantId
      ? `tapisui-implicit-client-${pathTenantId}`
      : undefined;
    implicitAuthURL =
      defaultAuthURL +
      `?client_id=${defaultClientId}&response_type=${defaultResponeType}&redirect_uri=${encodeURIComponent(
        defaultRedirectURI
      )}&use_iframe_redirect=${String(implicitIframe)}`;
    console.debug(
      `Implicit auth not-extension. implicitAuthURL: ${implicitAuthURL}`
    );

    // For development add password Auth as implicit hasn't been implemented for localhost yet.
    // TODO: remove implicitAuth check. Shouldn't show password auth ever, but clients not bootstrapped yet.
    passwordAuth =
      location.href.startsWith('http://localhost:3000') || !implicitAuthURL
        ? true
        : true; // always password auth for now
  }

  const onSubmit = ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => login(username, password);

  const loginSchema = Yup.object({
    username: Yup.string().required(),
    password: Yup.string().required(),
  });

  const initialValues = {
    username: '',
    password: '',
  };

  useEffect(() => {
    if (implicitAuthURL && passwordAuth) {
      // Both auth methods available, show buttons
      setActiveAuthMethod(undefined);
    } else if (implicitAuthURL) {
      // Only implicit auth available
      setActiveAuthMethod('implicit');
    } else if (passwordAuth) {
      // Only password auth available
      setActiveAuthMethod('password');
    } else {
      // No auth methods available, show error
      setImplicitError(
        'No authentication methods available. Please contact Tapis admins for TapisUI tenant support.'
      );
    }
  }, [implicitAuthURL, passwordAuth]);

  // Combine the two useEffects for checking implicit auth URL validity and readiness
  useEffect(() => {
    // Only check if we're on the login selection screen or about to use implicit auth
    if (
      (activeAuthMethod === 'implicit' || activeAuthMethod === undefined) &&
      implicitAuthURL
    ) {
      setImplicitError(undefined);
      setImplicitReady(false);
      fetch(implicitAuthURL, { method: 'GET' })
        .then((response) => {
          if (activeAuthMethod === 'implicit' && implicitIframe) {
            // Special case for iframe: 400 means error
            if (response.status === 400) {
              setImplicitError('There was an error getting auth context (400)');
              setImplicitReady(false);
              return;
            }
          }
          if (response.status === 200) {
            setImplicitReady(true);
          } else {
            console.debug(
              `Login: implicitAuthURL: ${implicitAuthURL}. Tenant probably doesn't have default client created? Talk to admin.`
            );
            setImplicitError(
              `Authentication service not available. Contact Tapis admins for federated auth support on this tenant.`
            );
            setImplicitReady(false);
          }
        })
        .catch(() => {
          setImplicitError(
            'There was an error connecting to the authentication service.'
          );
          setImplicitReady(false);
        });
    }
  }, [activeAuthMethod, implicitAuthURL, implicitIframe]);

  // Handle implicit auth via iframe or redirect
  useEffect(() => {
    if (activeAuthMethod === 'implicit' && implicitAuthURL) {
      setImplicitError(undefined);
      setImplicitReady(false);
      if (implicitIframe) {
        // Attempt to fetch the implicit auth URL to check if it's valid
        // Possible client might not exist for tenant.
        fetch(implicitAuthURL, { method: 'GET' })
          .then((response) => {
            if (response.status === 400) {
              setImplicitError('There was an error getting auth context (400)');
            } else {
              setImplicitReady(true);
            }
          })
          .catch(() => {
            setImplicitError(
              'There was an error connecting to the authentication service.'
            );
          });

        // Listen for postMessage from iframe (OAuth2 redirect page)
        function handleMessage(event: MessageEvent) {
          console.log(
            `Login: handleMessage: event.data: ${JSON.stringify(event.data)}`
          );
          console.log('typeof event.data:', typeof event.data, event.data);
          // You may want to check event.origin for security
          if (event.data && event.data.type === 'tapis-auth-success') {
            if (event.data.access_token && event.data.access_token !== 'None') {
              setAccessToken({
                access_token: event.data.access_token,
                expires_at: event.data.expires_at || 't',
                expires_in: event.data.expires_in || 14400,
              });
              // Redirect to home page or wherever appropriate
              navigate.push(`/`);
            } else {
              setImplicitError(
                'Auth service return token not formed as expected.'
              );
            }
          }
        }
        window.addEventListener('message', handleMessage);
        return () => {
          window.removeEventListener('message', handleMessage);
        };
      } else if (implicitAuthURL) {
        window.location.replace(implicitAuthURL);
      }
    }
  }, [activeAuthMethod, implicitIframe, implicitAuthURL]);

  return (
    <div>
      {passwordAuth && activeAuthMethod === 'password' && (
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={onSubmit}
        >
          <Form>
            <FormikInput
              name="username"
              label="Username"
              required={true}
              description="Your TAPIS username"
            />
            <FormikInput
              name="password"
              label="Password"
              required={true}
              description="Your TAPIS password"
              type="password"
            />
            <SubmitWrapper
              isLoading={isLoading}
              error={error}
              success={accessToken && 'Successfully logged in'}
            >
              <Button
                type="submit"
                style={{ width: '5.5em' }} //explicitly set width otherwise button forces text overflow on press.
                disabled={isLoading || accessToken != null}
              >
                Log In
              </Button>
            </SubmitWrapper>
          </Form>
        </Formik>
      )}
      {(activeAuthMethod === undefined || activeAuthMethod === 'implicit') && (
        <div className={styles['buttons']}>
          {passwordAuth && (
            <Button
              onClick={() => {
                setActiveAuthMethod('password');
              }}
            >
              Log in with username and password
            </Button>
          )}
          {implicitAuthURL !== undefined && (
            <>
              <Button
                // Only disable when using default implicit auth as client for tenant might not exist.
                // if extension.getAuthByType('implicit') then we assume the config is correct.
                disabled={extension ? false : !!implicitError || !implicitReady}
                onClick={() => {
                  setActiveAuthMethod('implicit');
                }}
                //change to loading until implicitReady is true
                isLoading={!implicitReady}
              >
                Log in with your institution
              </Button>
              {/* {implicitError && (
                <div style={{ color: 'red', marginTop: '0.5em' }}>
                  {implicitError}
                </div>
              )} */}
            </>
          )}
        </div>
      )}
      {activeAuthMethod === 'implicit' && implicitIframe && (
        <div
          style={{
            width: '100%',
            height: 'calc(100vh - 7rem)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'scroll',
            marginTop: '1rem',
          }}
        >
          {implicitError && <div style={{ color: 'red' }}>{implicitError}</div>}
          {implicitReady && !implicitError && (
            <iframe
              style={{
                flexGrow: 1,
                border: 'none',
              }}
              id="LoginIframe"
              title="Tapis Login"
              src={implicitAuthURL}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
