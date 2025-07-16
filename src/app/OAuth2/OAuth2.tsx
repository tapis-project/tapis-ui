import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTapisConfig } from '@tapis/tapisui-hooks';

const OAuth2: React.FC = () => {
  const { setAccessToken } = useTapisConfig();
  const navigate = useHistory();

  const queryString = window.location.href;
  const access_token = queryString.substring(
    queryString.indexOf('access_token=') + 13,
    queryString.lastIndexOf('&state')
  );
  const expires_at = 't';
  const expires_in = 14400;

  useEffect(() => {
    setAccessToken({ access_token, expires_at, expires_in });
    // Notify parent window (if in iframe) of successful auth
    //if (window.parent !== window) {
    //window.parent.postMessage('tapis-auth-success', window.location.origin);
    //}
    navigate.push(`/`);
    // eslint-disable-next-line
  }, []);

  return <></>;
};

export default OAuth2;
