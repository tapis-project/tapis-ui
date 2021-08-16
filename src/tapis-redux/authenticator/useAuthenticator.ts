import { useSelector } from 'react-redux';
import { authenticatorLoginRequest, authenticatorLogoutRequest } from './actions';
import { TapisState } from '../store/rootReducer';
import { LoginCallback } from './types';
import { Config } from '../types/config';

const useAuthenticator = (config?: Config) => {
  const { token, loading, error } = useSelector((state: TapisState) => state.authenticator);
  return {
    token,
    loading,
    error,
    login: (username: string, password: string, onAuth: LoginCallback = () => {}) =>
      authenticatorLoginRequest({
        username,
        password,
        config,
        onAuth
      }),
    logout: () => authenticatorLogoutRequest()
  };
};

export default useAuthenticator;
