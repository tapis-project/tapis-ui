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
 * Does this error mean THE SESSION is dead — the service refusing this
 * request's own JWT? Ordinary expiry is already handled client-side
 * (useTapisConfig checks the exp claim), so this is only the backstop for
 * a token the server rejects while the client still believes in it.
 *
 * It must never match a remote host's refusal. A Files listing of an SSH
 * system with no registered credential comes back
 * "FILES_REMOTE_LIST_ERROR ...: 401" — that 401 belongs to the remote
 * machine, and logging out for it turns one system's missing credential
 * into a session death. So: known remote/credential error families bail
 * first, then only explicitly JWT-shaped messages count.
 */
const REMOTE_FAULT =
  /FILES_REMOTE_|SSH_POOL_|FILES_CLIENT_SSH|SYSLIB_|CRED_NOT_FOUND/i;
const JWT_FAULT =
  /TAPIS_SECURITY_JWT|\bjwt\b|token (?:is |has |was )?(?:expired|invalid|revoked)|(?:expired|invalid|bad|revoked) (?:tapis |access )?token|invalid_credentials/i;

export const is401 = (error: unknown): boolean => {
  if (!error) return false;
  const msg = String((error as any)?.message ?? error);
  if (REMOTE_FAULT.test(msg)) return false;
  return JWT_FAULT.test(msg);
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
