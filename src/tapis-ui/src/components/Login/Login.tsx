import React, { useContext } from 'react';
import { Label, Input, Button } from 'reactstrap';
import { useLogin } from 'tapis-hooks/src/authenticator';
import { useTapisConfig } from 'tapis-hooks/src/context';
import { LoadingSpinner } from '../../_common';
import { Formik, Form,} from 'formik';
import { FieldWrapper, Icon, Message } from 'tapis-ui/src/_common';
import { Authenticator } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import styles from './Login.module.scss';
import './Login.scss';
interface LoginProps  {
  onAuth?: (token: Authenticator.RespCreateToken) => any,
  onError?: (error: any) => any
}

const Login: React.FC<LoginProps> = ({ onAuth, onError }) => {
  const { login, isLoading, isError, error } = useLogin();
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
    login({ username, password, onSuccess: onAuth, onError });
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
          <div className={styles.status}>
            <Button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoading || accessToken != null}>
              Log In
            </Button>
            {
              isLoading && <LoadingSpinner className="login__loading-spinner" placement="inline"/>
            }
            {accessToken && (
              <div className={styles.message}>
                <Message canDismiss={false} type="success" scope="inline">Successfully logged in</Message>
              </div>
            )}
            {isError && (
              <div className={styles.message}>
                <Message canDismiss={false} type="error" scope="inline">{(error as any).message}</Message>
              </div>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

Login.defaultProps = {
  onAuth: undefined,
  onError: undefined
}


export default Login;
