import React from 'react';
import { useAuth } from 'tapis-redux';
import Login from '../Login';
import Systems from '../Systems';

const App = () => {
  const { user } = useAuth();
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
