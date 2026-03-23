import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Authenticator } from '@tapis/tapis-typescript';
import Cookies from 'js-cookie';
import TapisContext, { TapisContextType } from '../context/TapisContext';

interface TapisProviderProps {
  token?: Authenticator.NewAccessTokenResponse;
  basePath: string;
  mlHubBasePath: string;
}

/**
 * Check if an error looks like a 401 Unauthorized response.
 * Tapis API errors often include the status code in the message.
 */
const is401 = (error: unknown): boolean => {
  if (!error) return false;
  const msg = String((error as any)?.message ?? error).toLowerCase();
  return (
    msg.includes('401') ||
    msg.includes('unauthorized') ||
    msg.includes('unauthenticated') ||
    msg.includes('invalid_credentials') ||
    msg.includes('token')
  );
};

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

  // react-query client — stable across renders via useMemo
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            onError: (error: unknown) => {
              if (is401(error)) {
                console.warn(
                  'TapisProvider: 401-like error detected, clearing token cookie.',
                  error
                );
                Cookies.remove('tapis-token');
                Cookies.remove('X-Tapis-Token', {
                  domain: basePath
                    .replace('https://', '.')
                    .replace('http://', '.'),
                });
                // Invalidate the token query so useTapisConfig picks up the removal
                queryClient.invalidateQueries('tapis-token');
              }
            },
          },
        },
      }),
    [basePath]
  );

  return (
    <TapisContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient} contextSharing={true}>
        {children}
      </QueryClientProvider>
    </TapisContext.Provider>
  );
};

export default TapisProvider;
