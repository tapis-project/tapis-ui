import React, { useState, useCallback } from 'react';
import { Form, Label, Input, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useAuthenticator } from 'tapis-redux';
import { LoadingSpinner } from '../../_common';
import { Config } from 'tapis-redux/types';
import { LoginCallback } from 'tapis-redux/authenticator/types';

interface LoginProps  {
  config?: Config,
  onAuth?: LoginCallback
}

const Login: React.FC<LoginProps> = ({ config, onAuth }) => {
  const dispatch = useDispatch();
  const { login, loading, error, token } = useAuthenticator(config);
  /* Replace with CEP _common FormField objects, formik and yup */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const onLogin = useCallback(() => {
    dispatch(login(username, password, onAuth));
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

Login.defaultProps = {
  config: null,
  onAuth: null
}


export default Login;
