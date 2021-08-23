import React from 'react';
import { Input, Button } from 'reactstrap';
import { useLogin } from 'tapis-hooks/authenticator';
import { useTapisConfig } from 'tapis-hooks/context';
import { LoadingSpinner } from '../../_common';
import { useForm } from 'react-hook-form';
import { FieldWrapper, Message } from 'tapis-ui/_common';
import { Authenticator } from '@tapis/tapis-typescript';
import styles from './Login.module.scss';
import './Login.scss';

interface LoginProps {
  onAuth?: (token: Authenticator.RespCreateToken) => any;
  onError?: (error: any) => any;
}

const Login: React.FC<LoginProps> = ({
  onAuth = undefined,
  onError = undefined
}) => {
  const { login, isLoading, isError, error } = useLogin();
  const { accessToken } = useTapisConfig();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { username: null, password: null } });

  const { ref: usernameRef, ...usernameFieldProps } = register('username', {
    required: 'Username is a required field'
  });
  const { ref: passwordRef, ...passwordFieldProps } = register('password', {
    required: 'Password is a required field'
  });

  const onSubmit = ({
    username,
    password
  }: {
    username: string;
    password: string;
  }) => login({ username, password, onSuccess: onAuth, onError });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldWrapper
        label="Username"
        required={true}
        description="Your TAPIS username"
        error={errors['username']}
      >
        <Input bsSize="sm" {...usernameFieldProps} innerRef={usernameRef} />
      </FieldWrapper>
      <FieldWrapper
        label="Password"
        required={true}
        description="Your TAPIS password"
        error={errors['password']}
      >
        <Input
          bsSize="sm"
          {...passwordFieldProps}
          innerRef={passwordRef}
          type="password"
        />
      </FieldWrapper>
      <div className={styles.status}>
        <Button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || accessToken != null}
        >
          Log In
        </Button>
        {isLoading && (
          <LoadingSpinner
            className="login__loading-spinner"
            placement="inline"
          />
        )}
        {accessToken && (
          <div className={styles.message}>
            <Message canDismiss={false} type="success" scope="inline">
              Successfully logged in
            </Message>
          </div>
        )}
        {isError && (
          <div className={styles.message}>
            <Message canDismiss={false} type="error" scope="inline">
              {(error as any).message}
            </Message>
          </div>
        )}
      </div>
    </form>
  );
};

export default Login;
