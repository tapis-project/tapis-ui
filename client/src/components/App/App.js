import React, { useState, useCallback } from 'react';
import Login from '../Login';
import Systems from '../Systems';
import UIPatterns from '../UIPatterns';

const App = () => {
  // Demonstration of using some type of external state
  // management that isn't tapis-redux
  const [token, setToken] = useState(null);
  const authCallback = useCallback(
    (result) => {
      /* eslint-disable */
      console.log("Authentication api result", result);
      // Handle errors during login
      if (result instanceof Error) {
        return;
      }
      // Set local view state
      setToken(result);
      // Can make also make an external call to propagate the login result
    },
    [setToken]
  );

  const systemsListCallback = useCallback(
    (result) => {
      /* eslint-disable */
      console.log("Systems listing api result", result);
    },
  )

  // Demonstration of config to use alternate URLs or provided tokens
  const config = {
    token: token,
    tenant: 'https://tacc.tapis.io/v3',
    authenticator: 'https://tacc.tapis.io/v3/oauth2',
  };

  return (
    <div>
      {
        token 
          ? <Systems config={config} onApi={systemsListCallback} />
          : <Login config={config} onApi={authCallback} />
      }
      {/* <UIPatterns display={false}/> */}
    </div>
  );
}

export default App;
