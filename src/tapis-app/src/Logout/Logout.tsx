import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuthenticator } from 'tapis-redux/src';

const Logout: React.FC = () => {
  const dispatch = useDispatch();
  const { logout } = useAuthenticator();
  useEffect(
    () => {
      dispatch(logout());
    },
    [ logout, dispatch ]
  )
  return <Redirect to="/" />
}

export default Logout;