import React, { useEffect } from 'react';
import { useTapisConfig } from 'tapis-hooks/context';

const OAuthLogin: React.FC = () => {
  const { setAccessToken } = useTapisConfig();

  const queryString = window.location.href;
  const access_token = queryString.substring(
    queryString.indexOf('access_token=') + 13,
    queryString.lastIndexOf('&state')
  );
  const expires_at = 't';
  const expires_in = 14400;

  useEffect(() => {
    console.log(access_token);
    setAccessToken({ access_token, expires_at, expires_in });
    window.location.replace('/tapis-ui/#/');
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      {queryString.substring(
        queryString.indexOf('access_token=') + 13,
        queryString.lastIndexOf('&state')
      )}
    </div>
  );
};

export default OAuthLogin;
