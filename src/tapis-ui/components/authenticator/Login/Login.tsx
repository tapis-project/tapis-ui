import React from 'react';
import { Input } from 'reactstrap';
import { useLogin } from 'tapis-hooks/authenticator';
import { useTapisConfig } from 'tapis-hooks/context';
import { Formik, Form,} from 'formik';
import { FieldWrapper } from 'tapis-ui/_common';
import * as Yup from 'yup';
import { TapisError } from 'tapis-api/types';
import { TapisUISubmit } from 'tapis-ui/components';
import './Login.scss';

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
          <TapisUISubmit
              isLoading={isLoading}
              error={error as TapisError}
              disabled={isSubmitting}
              success={accessToken && "Sucessfully logged in"}
          >
            Log In
          </TapisUISubmit>
          
        </Form>
      )}
    </Formik>
  );
};

export default Login;
