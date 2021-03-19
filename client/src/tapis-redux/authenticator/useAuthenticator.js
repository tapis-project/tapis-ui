import { useSelector } from 'react-redux';
import { login as loginAction } from './authenticator.actions';

const useAuthenticator = (config, apiCallback) => {
  const { token, loading, error } = useSelector((state) => state.authenticator);
  return {
    token,
    loading,
    error,
    login: (username, password) =>
      loginAction(username, password, config.authenticator, apiCallback),
  };
};

export default useAuthenticator;
