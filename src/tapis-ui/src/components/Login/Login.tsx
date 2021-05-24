import React, { useState, useCallback } from 'react';
import { Form, Label, Input, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useAuthenticator } from 'tapis-redux';
import { defaultConfig } from 'tapis-redux/types';
import { LoadingSpinner } from '../../_common';
import { ConfigPropType } from 'tapis-ui/proptypes';
import PropTypes from 'prop-types';

const Login = ({ config, onApi }) => {
  const dispatch = useDispatch();
  const { login, loading, error, token } = useAuthenticator(config, onApi);
  /* Replace with CEP _common FormField objects, formik and yup */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const onLogin = useCallback(() => {
    dispatch(login(username, password));
  }, [dispatch, login, username, password]);
  return (
    <Form>
      <h5>Login</h5>
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
        {loading && <>
          &nbsp;
          <LoadingSpinner placement="inline" />
        </>}
      </Button>
      {token && <div>Logged in</div>}
      {error && <>Login error</>}
    </Form>
  );
};

Login.propTypes = {
  config: ConfigPropType,
  onApi: PropTypes.func,
};

Login.defaultProps = {
  config: defaultConfig,
  onApi: null,
};

export default Login;
