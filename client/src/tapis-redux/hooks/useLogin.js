import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { login } from '../actions/auth';

const useLogin = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  return {
    user,
    loading,
    error,
    login
  };
};

export default useLogin;