import React from 'react';
import { Button } from 'reactstrap';
import { Authenticator as AuthenticatorHooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { FormikInput } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const Login: React.FC = () => {
  const { login, isLoading, error } = AuthenticatorHooks.useLogin();
  const { accessToken } = useTapisConfig();

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
            className="btn btn-primary"
            style={{ width: '5.5em' }} //explicitly set width otherwise button forces text overflow on press.
            disabled={isLoading || accessToken != null}
          >
            Log In
          </Button>
        </SubmitWrapper>
      </Form>
    </Formik>
  );
};

export default Login;