import React from 'react';
import { Authenticator } from '@tapis/tapis-typescript';

export type TapisContextType = {
  basePath: string,
}

export const authContext: TapisContextType = {
  basePath: '',
}

const TapisContext: React.Context<TapisContextType> = React.createContext<TapisContextType>(authContext);

export default TapisContext;