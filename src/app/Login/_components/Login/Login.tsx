import React, { useState } from 'react';
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
  const { accessToken } = useTapisConfig();
  const { extension } = useExtension();
  const [activeAuthMethod, setActiveAuthMethod] = useState<
    undefined | 'implicit' | 'password'
  >(undefined);

  let implicitAuthURL: string | undefined = undefined;
  let passwordAuth = extension === undefined;
  if (extension) {
    let implicitAuth = extension.getAuthByType('implicit') as Implicit;
    implicitAuthURL =
      implicitAuth.authorizationPath +
      `?client_id=${implicitAuth.clientId}&response_type=${
        implicitAuth.responseType
      }&redirect_uri=${encodeURIComponent(implicitAuth.redirectURI)}`;
    // TODO Remove below. Testing only
    // implicitAuthURL =
    //   implicitAuth.authorizationPath +
    //   `?client_id=${implicitAuth.clientId}&response_type=${
    //     implicitAuth.responseType
    //   }&redirect_uri=${encodeURIComponent('http://localhost:3000/#/oauth2')}`;

    passwordAuth =
      (extension.getAuthByType('password') as boolean | undefined) || false;
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
                window.location.replace(implicitAuthURL as string);
              }}
            >
              Log in with your institution
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
