import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Authenticator } from '@tapis/tapis-typescript';
import TapisContext, { TapisContextType } from '../context/TapisContext';

interface TapisProviderProps {
  token?: Authenticator.NewAccessTokenResponse;
  basePath: string;
  mlHubBasePath: string;
}

const TapisProvider: React.FC<React.PropsWithChildren<TapisProviderProps>> = ({
  token,
  basePath,
  mlHubBasePath,
  children,
}) => {
  // Provide a context state for the rest of the application, including
  // a way of modifying the state
  const contextValue: TapisContextType = {
    basePath,
    mlHubBasePath,
  };

  // react-query client
  const queryClient = new QueryClient();

  return (
    <TapisContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient} contextSharing={true}>
        {children}
      </QueryClientProvider>
    </TapisContext.Provider>
  );
};

export default TapisProvider;
