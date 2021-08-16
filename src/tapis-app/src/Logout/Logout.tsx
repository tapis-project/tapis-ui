import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useLogin } from 'tapis-hooks/src/authenticator';

const Logout: React.FC = () => {
  const { logout } = useLogin();
  useEffect(
    () => {
      logout();
    },
    [ logout ]
  )
  return <Redirect to="/" />
}

export default Logout;