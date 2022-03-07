import React from 'react';
import { Button } from 'reactstrap';
import { useLogin } from 'tapis-hooks/authenticator';
import { useTapisConfig } from 'tapis-hooks/context';
import { FormikInput } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const Login: React.FC = () => {
  const { login, isLoading, error } = useLogin();
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
