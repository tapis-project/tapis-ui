import React from 'react';

export type TapisContextType = {
  basePath: string;
  mlHubBasePath: string;
};

export const authContext: TapisContextType = {
  basePath: '',
  mlHubBasePath: '',
};

const TapisContext: React.Context<TapisContextType> =
  React.createContext<TapisContextType>(authContext);

export default TapisContext;
