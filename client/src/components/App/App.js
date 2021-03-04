import React, { useState, useCallback, useEffect } from 'react';
import { Form, Label, Input, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useLogin } from 'tapis-redux';
import './App.css';

const Login = () => {
  const dispatch = useDispatch();
  const { login } = useLogin();
  /* Replace with CEP _common FormField objects, formik and yup */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const onLogin = useCallback(
    () => {
      dispatch(login(username, password));
    },
    [ dispatch, login, username, password ]
  )
  return (
    <Form>
      <Label for="username">Username</Label>
      <Input type="text" id="username" onChange={(e) => setUsername(e.target.value)} />
      <Label for="password">Password</Label>
      <Input type="password" id="password" onChange={(e) => setPassword(e.target.value)}/>
      <Button onClick={onLogin}>Login</Button>
    </Form>
  )
}

const App = () => {
  const { user } = useLogin(); 
  console.log(user);
  return (
    <div className="App">
      {!user 
        ? <Login />
        : <div>Logged in as {user.username}</div>
      }      
    </div>
  );
};

export default App;
