import React, { useState, useCallback } from 'react';
import { Redirect } from 'react-router-dom';
import { Login as TapisLogin } from 'tapis-ui/components';
import { SectionHeader } from 'tapis-ui/_common';
import { Authenticator } from '@tapis/tapis-typescript';

const Login: React.FC = () => {
  const [redirect, setRedirect] = useState<boolean>(false);
  
  const authCallback = useCallback<(token: Authenticator.RespCreateToken) => any>(
    (response) => {
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
        <TapisLogin onAuth={authCallback}/>
      </div>
    </>
  )
}

export default Login;