import { useSelector } from 'react-redux';
import { authenticatorLoginRequest } from './actions';
import { TapisState } from '../store/rootReducer';
import { LoginCallback } from './types';
import { Config } from '../types/config';

const useAuthenticator = (config: Config, onApi: LoginCallback) => {
  const { token, loading, error } = useSelector((state: TapisState) => state.authenticator);
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
