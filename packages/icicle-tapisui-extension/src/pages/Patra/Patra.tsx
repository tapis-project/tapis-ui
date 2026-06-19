import * as React from 'react';
import { Component } from '@tapis/tapisui-extensions-core';

const PATRA_ORIGIN = 'https://patra.pods.icicleai.tapis.io';
const AUTH_REQUEST_TYPE = 'patra:portal-auth:request';
const AUTH_RESPONSE_TYPE = 'patra:portal-auth:response';
const AUTH_PROTOCOL_VERSION = 1;

type PortalAuthRequest = {
  type: typeof AUTH_REQUEST_TYPE;
  version: typeof AUTH_PROTOCOL_VERSION;
  requestId: string;
};

const isPortalAuthRequest = (value: unknown): value is PortalAuthRequest => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const request = value as Partial<PortalAuthRequest>;
  return (
    request.type === AUTH_REQUEST_TYPE &&
    request.version === AUTH_PROTOCOL_VERSION &&
    typeof request.requestId === 'string' &&
    request.requestId.length >= 16 &&
    request.requestId.length <= 256
  );
};

export const Patra: Component = ({ accessToken }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (!accessToken) {
      return;
    }

    const handlePortalAuthRequest = (event: MessageEvent) => {
      const patraWindow = iframeRef.current?.contentWindow;
      if (
        event.origin !== PATRA_ORIGIN ||
        !patraWindow ||
        event.source !== patraWindow ||
        !isPortalAuthRequest(event.data)
      ) {
        return;
      }

      const response = {
        type: AUTH_RESPONSE_TYPE,
        version: AUTH_PROTOCOL_VERSION,
        requestId: event.data.requestId,
        accessToken,
        tokenType: 'Bearer',
      };

      (event.source as Window).postMessage(response, event.origin);
    };

    window.addEventListener('message', handlePortalAuthRequest);
    return () => {
      window.removeEventListener('message', handlePortalAuthRequest);
    };
  }, [accessToken]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {accessToken ? (
        <iframe
          ref={iframeRef}
          style={{ flexGrow: 1, border: 'none' }}
          src={PATRA_ORIGIN}
          title="Patra"
        />
      ) : (
        <>Invalid JWT. Log out of TapisUI then log back in</>
      )}
    </div>
  );
};

export default Patra;
