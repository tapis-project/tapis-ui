import { useSelector } from 'react-redux';
import { authenticatorLoginRequest } from './actions';

const useAuthenticator = (config, onApi) => {
  const { token, loading, error } = useSelector((state) => state.authenticator);
  return {
    token,
    loading,
    error,
    login: (username, password) =>
      authenticatorLoginRequest({
        username,
        password,
        authenticator: config.authenticator,
        onApi
      })
  };
};

export default useAuthenticator;
