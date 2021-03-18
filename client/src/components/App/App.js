import React from 'react';
import { useAuthenticator } from 'tapis-redux';
import Login from '../Login';
import Systems from '../Systems';

const App = () => {
  const { token } = useAuthenticator();
  return (
    <div>
      <Login />
      {
        // Only show Systems component if logged in
        token && <Systems />
      }
    </div>
  );
};

export default App;
