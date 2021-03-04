import React from 'react';
import { useLogin } from 'tapis-redux';
import Login from '../Login';
import Systems from '../Systems';
import './App.css';

const App = () => {
  const { user } = useLogin();
  return (
    <div>
      <Login />
      {
        // Only show Systems component if logged in
        user && <Systems />
      }
    </div>
  );
};

export default App;
