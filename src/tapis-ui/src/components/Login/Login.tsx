import React from 'react';
import { Label, Input, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useAuthenticator } from 'tapis-redux';
import { LoadingSpinner } from '../../_common';
import { Config } from 'tapis-redux/types';
import { LoginCallback } from 'tapis-redux/authenticator/types';
import { Formik, Form,} from 'formik';
import { FieldWrapper, Icon, Message } from 'tapis-ui/_common';
import * as Yup from 'yup';
import './Login.module.scss';
import './Login.scss';
interface LoginProps  {
  config?: Config,
  onAuth?: LoginCallback
}

const Login: React.FC<LoginProps> = ({ config, onAuth }) => {
  const dispatch = useDispatch();
  const { login, loading, error, token } = useAuthenticator(config);

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
    dispatch(login(username, password, onAuth));
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
              disabled={isSubmitting || loading || token != null}>
              Log In
            </Button>
            {
              loading && <LoadingSpinner className="login__loading-spinner" placement="inline"/>
            }
            {token && (
              <div styleName="message">
                <Message canDismiss={false} type="success" scope="inline">Successfully logged in</Message>
              </div>
            )}
            {error && (
              <div styleName="message">
                <Message canDismiss={false} type="error" scope="inline">Login error</Message>
              </div>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

Login.defaultProps = {
  config: null,
  onAuth: null
}


export default Login;
