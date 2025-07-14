import React, { useState, useEffect } from 'react';
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
  const { accessToken, basePath, pathTenantId } = useTapisConfig();
  const { extension } = useExtension();
  const [activeAuthMethod, setActiveAuthMethod] = useState<
    undefined | 'implicit' | 'password'
  >(undefined);
  const [authError, setAuthError] = useState<string | undefined>(undefined);
  const [iframeError, setIframeError] = useState<string | undefined>(undefined);
  const [iframeReady, setIframeReady] = useState<boolean>(false);
  const [cookieString, setCookieString] = useState(document.cookie);

  // Auth order
  // 1. extension.implicit
  // 2. extension.password
  // 3. default implicit client or error message
  // 4. default password client or error message

  let implicitAuthURL: string | undefined = undefined;
  let passwordAuth = undefined;
  if (extension) {
    let implicitAuth = extension.getAuthByType('implicit') as Implicit;
    implicitAuthURL =
      implicitAuth.authorizationPath +
      `?client_id=${implicitAuth.clientId}&response_type=${
        implicitAuth.responseType
      }&redirect_uri=${encodeURIComponent(implicitAuth.redirectURI)}`;
    // TODO Remove below. Testing localhost
    // implicitAuthURL =
    //   implicitAuth.authorizationPath +
    //   `?client_id=${implicitAuth.clientId}&response_type=${
    //     implicitAuth.responseType
    //   }&redirect_uri=${encodeURIComponent('http://localhost:3000/#/oauth2')}`;
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
      )}`;
    console.debug(
      `Implicit auth not-extension. implicitAuthURL: ${implicitAuthURL}`
    );

    passwordAuth = location.href.startsWith('http://localhost:3000')
      ? true
      : false;
  }

  // implicitAuthURL = `https://dev.develop.tapis.io/v3/oauth2/authorize?client_id=tapisui-implicit-client-cgarcia&response_type=token&redirect_uri=${encodeURIComponent(
  //   'http://localhost:3000'
  // )}`;

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
    if (activeAuthMethod === 'implicit' && implicitAuthURL) {
      setIframeError(undefined);
      setIframeReady(false);
      fetch(implicitAuthURL, { method: 'GET', redirect: 'manual' })
        .then((response) => {
          if (response.status === 400) {
            setIframeError('There was an error getting auth context (400)');
          } else {
            setIframeReady(true);
          }
        })
        .catch(() => {
          setIframeError(
            'There was an error connecting to the authentication service.'
          );
        });
    }
  }, [activeAuthMethod, implicitAuthURL]);

  useEffect(() => {
    // Listen for postMessage from iframe (OAuth2 redirect page)
    function handleMessage(event: MessageEvent) {
      // You may want to check event.origin for security
      if (event.data === 'tapis-auth-success') {
        // Reload or update state to reflect successful auth
        window.location.reload();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCookieString(document.cookie);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {`cookies enabled: ${navigator.cookieEnabled}`}
      <br />
      {`cookies: ${JSON.stringify(cookieString)}`}
      <br />
      {`basePath: ${basePath}`}
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
      {activeAuthMethod === undefined && (
        <div className={styles['buttons']}>
          {passwordAuth && (
            <Button
              onClick={() => {
                setActiveAuthMethod('password');
              }}
            >
              Log with username and password
            </Button>
          )}
          {implicitAuthURL !== undefined && (
            <Button
              disabled={false}
              onClick={() => {
                setActiveAuthMethod('implicit');
              }}
            >
              Log in with your institution
            </Button>
          )}
        </div>
      )}
      {activeAuthMethod === 'implicit' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'scroll',
            marginTop: '2rem',
          }}
        >
          {iframeError && (
            <div style={{ color: 'red', marginTop: '1rem' }}>{iframeError}</div>
          )}
          {iframeReady && !iframeError && (
            <iframe
              style={{ flexGrow: 1, border: 'none', minHeight: '600px' }}
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
