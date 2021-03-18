import React, { useState, useCallback } from 'react';
import { Form, Label, Input, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useAuthenticator } from 'tapis-redux';
import { configPropType, defaultConfig } from 'tapis-redux/types';

const LoginForm = ({ config }) => {
  const dispatch = useDispatch();
  const { login } = useAuthenticator(config);
  /* Replace with CEP _common FormField objects, formik and yup */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const onLogin = useCallback(() => {
    dispatch(login(username, password));
  }, [dispatch, login, username, password]);
  return (
    <Form>
      <Label for="username">Username</Label>
      <Input
        type="text"
        id="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <Label for="password">Password</Label>
      <Input
        type="password"
        id="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={onLogin}>Login</Button>
    </Form>
  );
};

LoginForm.propTypes = {
  // TAPIS configuration, with optional authenticator url
  config: configPropType,
};

LoginForm.defaultProps = {
  config: defaultConfig,
};

const Login = ({ config }) => {
  const { token } = useAuthenticator(config);
  return (
    <div>{!token ? <LoginForm config={config} /> : <div>Logged in</div>}</div>
  );
};

Login.propTypes = {
  config: configPropType,
};

Login.defaultProps = {
  config: defaultConfig,
};

export default Login;
