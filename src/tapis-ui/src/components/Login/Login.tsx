import React, { useContext } from 'react';
import { Label, Input, Button } from 'reactstrap';
import { useLogin } from 'tapis-hooks/authenticator';
import TapisContext from 'tapis-hooks/context';
import { LoadingSpinner } from '../../_common';
import { Formik, Form,} from 'formik';
import { FieldWrapper, Icon, Message } from 'tapis-ui/_common';
import { Authenticator } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import './Login.module.scss';
import './Login.scss';
interface LoginProps  {
  onAuth?: (token: Authenticator.RespCreateToken) => any,
  onError?: (error: any) => any
}

const Login: React.FC<LoginProps> = ({ onAuth, onError }) => {
  const { login, isLoading, isError, error } = useLogin();
  const { accessToken } = useContext(TapisContext);

  const validationSchema = (props) => {
    return Yup.lazy(values => {
      const schema = Yup.object({
        username: Yup.string().required().min(1),
        password: Yup.string().required().min(1)
      });
      return schema;
    })
  }

  const formSubmit = (values, { setSubmitting }) => {
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
          <div styleName="status">
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
              <div styleName="message">
                <Message canDismiss={false} type="success" scope="inline">Successfully logged in</Message>
              </div>
            )}
            {isError && (
              <div styleName="message">
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
  onAuth: null,
  onError: null
}


export default Login;
