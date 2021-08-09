import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { Authenticator } from '@tapis/tapis-typescript';
import TapisContext, { TapisContextType } from '../context/TapisContext';

interface TapisProviderProps {
  children: React.ReactNode[] | React.ReactNode,
  token?: Authenticator.NewAccessTokenResponse,
  tenantUrl: string
}

const TapisProvider: React.FC<TapisProviderProps> = ({ token, tenantUrl, children }) => {
  const [ accessToken, setAccessToken ] = useState<Authenticator.NewAccessTokenResponse>(token);
  const contextValue: TapisContextType  = {
    accessToken,
    setAccessToken,
    tenantUrl
  }

  const queryClient = new QueryClient();

  return (
    <TapisContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TapisContext.Provider>
  )
}

export default TapisProvider;