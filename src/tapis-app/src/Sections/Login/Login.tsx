import React, { useState, useCallback } from 'react';
import { Redirect } from 'react-router-dom';
import { Login as TapisLogin } from 'tapis-ui/components';
import { SectionHeader } from 'tapis-ui/_common';
import { LoginCallback } from 'tapis-redux/authenticator/types';

const Login: React.FC = () => {
  const [redirect, setRedirect] = useState<boolean>(false);
  
  const authCallback = useCallback<LoginCallback>(
    (result) => {
      /* eslint-disable */
      console.log("Authentication api result", result);
      // Handle errors during login
      if (result instanceof Error) {
        return;
      }
      setRedirect(true);
    },
    [setRedirect]
  );

  if (redirect) {
    return <Redirect to="/" />
  }

  return (
    <>
      <SectionHeader>Login</SectionHeader>
      <div className="container">
        <TapisLogin onAuth={authCallback} />
      </div>
    </>
  )
}

export default Login;