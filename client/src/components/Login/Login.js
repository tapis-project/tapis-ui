import React, { useState, useCallback } from 'react';
import { Form, Label, Input, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useAuthenticator } from 'tapis-redux';
import { configPropType, defaultConfig } from 'tapis-redux/types';
import PropTypes from 'prop-types';

const Login = ({ config, apiCallback }) => {
  const dispatch = useDispatch();
  const { login, loading, error } = useAuthenticator(config, apiCallback);
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
      <Button onClick={onLogin} disabled={loading}>
        Login
      </Button>
      {error && <>Login error</>}
    </Form>
  );
};

Login.propTypes = {
  config: configPropType,
  apiCallback: PropTypes.func,
};

Login.defaultProps = {
  config: defaultConfig,
  callback: null,
};

export default Login;
