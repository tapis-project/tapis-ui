import { useSelector } from 'react-redux';
import { login } from './authenticator.actions';

const useAuthenticator = () => {
  const { token, loading, error } = useSelector((state) => state.authenticator);
  return {
    token,
    loading,
    error,
    login,
  };
};

export default useAuthenticator;
