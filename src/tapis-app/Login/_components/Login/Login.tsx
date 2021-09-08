import React from 'react';
import { Input, Button } from 'reactstrap';
import { useLogin } from 'tapis-hooks/authenticator';
import { useTapisConfig } from 'tapis-hooks/context';
import { useForm } from 'react-hook-form';
import { FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';

const Login: React.FC = () => {
  const { login, isLoading, error } = useLogin();
  const { accessToken } = useTapisConfig();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: null, password: null } });

  const { ref: usernameRef, ...usernameFieldProps } = register('username', {
    required: 'Username is a required field',
  });
  const { ref: passwordRef, ...passwordFieldProps } = register('password', {
    required: 'Password is a required field',
  });

  const onSubmit = ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => login(username, password);

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
    </form>
  );
};

export default Login;
