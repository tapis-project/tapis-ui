import React from 'react';
import { useAuthenticator } from 'tapis-redux';
import Login from '../Login';
import Systems from '../Systems';

const App = () => {
  const { token } = useAuthenticator();

  // Demonstration of config to use alternate URLs or provided tokens
  const config = {
    token: null,
    tenant: 'https://tacc.tapis.io/v3',
    authenticator: 'https://tacc.tapis.io/v3/oauth2',
  };
  return (
    <div>
      <Login config={config} />
      {
        // Only show Systems component if logged in
        token && <Systems />
      }
    </div>
  );
};

export default App;
