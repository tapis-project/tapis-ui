import { useSelector } from 'react-redux';
import { login } from './auth.actions';

const useLogin = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  return {
    user,
    loading,
    error,
    login,
  };
};

export default useLogin;
