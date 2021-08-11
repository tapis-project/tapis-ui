import React from 'react';
import { Authenticator } from '@tapis/tapis-typescript';

export type TapisContextType = {
  accessToken: Authenticator.NewAccessTokenResponse,
  basePath: string,
  setAccessToken: (token: Authenticator.NewAccessTokenResponse) => any
}

export const authContext: TapisContextType = {
  accessToken: null,
  basePath: null,
  setAccessToken: null
}

const TapisContext: React.Context<TapisContextType> = React.createContext<TapisContextType>(authContext);

export default TapisContext;