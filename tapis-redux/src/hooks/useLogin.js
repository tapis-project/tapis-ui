import { useCallback } from '../../../tapis-ui/node_modules/react';
import { useSelector } from '../../../tapis-ui/node_modules/react-redux';
// import { useCallback } from 'react';
// import { useSelector } from 'react-redux';
import { login } from '../actions/auth';

const useLogin = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  return {
    user,
    loading,
    error,
    login: useCallback(
      (username, password) => login(username, password),
      [login]
    ),
  };
};

export default useLogin;
