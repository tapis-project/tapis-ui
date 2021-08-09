import React from 'react';
import { Authenticator } from '@tapis/tapis-typescript';

export type TapisContextType = {
  accessToken: Authenticator.NewAccessTokenResponse,
  tenantUrl: string,
  setAccessToken: (token: Authenticator.NewAccessTokenResponse) => any
}

export const authContext: TapisContextType = {
  accessToken: null,
  tenantUrl: null,
  setAccessToken: null
}

const TapisContext: React.Context<TapisContextType> = React.createContext<TapisContextType>(authContext);

export default TapisContext;