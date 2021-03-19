import React, { useState, useCallback } from 'react';
import Login from '../Login';
import Systems from '../Systems';

const App = () => {
  // Demonstration of using some type of external state
  // management that isn't tapis-redux
  const [token, setToken] = useState(null);
  const authCallback = useCallback(
    (result) => {
      // Handle errors during login
      if (result instanceof Error) {
        return;
      }
      // Set local view state
      setToken(token);
      // Can make also make an external call to propagate the login result
    },
    [setToken]
  );

  // Demonstration of config to use alternate URLs or provided tokens
  const config = {
    token: null,
    tenant: 'https://tacc.tapis.io/v3',
    authenticator: 'https://tacc.tapis.io/v3/oauth2',
  };

  return (
    <div>
      {token ? <Systems /> : <Login config={config} apiCallback={authCallback} />}
    </div>
  );
};

export default App;
