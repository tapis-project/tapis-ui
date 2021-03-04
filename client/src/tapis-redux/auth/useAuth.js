import { useSelector } from 'react-redux';
import { login } from './auth.actions';

const useAuth = () => {
  const { user, loading, error, failed } = useSelector((state) => state.auth);
  return {
    user,
    loading,
    error,
    failed,
    login,
  };
};

export default useAuth;
