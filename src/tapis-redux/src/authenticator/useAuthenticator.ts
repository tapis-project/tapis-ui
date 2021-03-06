import { useSelector } from 'react-redux';
import { authenticatorLoginRequest, authenticatorLogoutRequest } from './actions';
import { TapisState } from '../store/rootReducer';
import { LoginCallback } from './types';
import { Config } from '../types/config';
import { Apps } from '@tapis/tapis-typescript';

const useAuthenticator = (config?: Config) => {
  const { token, loading, error } = useSelector((state: TapisState) => state.authenticator);
  return {
    token,
    loading,
    error,
    login: (username, password, onAuth: LoginCallback = null) =>
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
