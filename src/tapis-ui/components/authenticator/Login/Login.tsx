import React from 'react';
import { Input, Button } from 'reactstrap';
import { useLogin } from 'tapis-hooks/authenticator';
import { useTapisConfig } from 'tapis-hooks/context';
import { Formik, Form,} from 'formik';
import { FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import * as Yup from 'yup';

const Login: React.FC = () => {
  const { login, isLoading, error } = useLogin();
  const { accessToken } = useTapisConfig();

  const validationSchema = (props: any) => {
    return Yup.lazy((values: any) => {
      const schema = Yup.object({
        username: Yup.string().required().min(1),
        password: Yup.string().required().min(1)
      });
      return schema;
    })
  }

  const formSubmit = (values: any, { setSubmitting }: {setSubmitting: any}) => {
    const { username, password } = values;
    login(username, password);
    setSubmitting(false);
  }

  const initialValues = {
    username: '',
    password: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={formSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <FieldWrapper
            label="Username"
            required={true}
            description="Your TAPIS username"
            props={{name: 'username', type: 'string'}}
          >
            <Input bsSize="sm" />
          </FieldWrapper>
          <FieldWrapper
            label="Password"
            required={true}
            description="Your TAPIS password"
            props={{name: 'password', type: 'password'}}
          >
            <Input bsSize="sm" />
          </FieldWrapper>
          <SubmitWrapper
            isLoading={isLoading}
            error={error}
            success={accessToken && "Successfully logged in"}
          >
            <Button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoading || accessToken != null}>
              Log In
            </Button>
          </SubmitWrapper>
        </Form>
      )}
    </Formik>
  );
};

export default Login;
