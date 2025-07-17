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
    // Wait for setAccessToken before the push. Otherwise user might get placed back to / without set token
    const doAuth = async () => {
      await setAccessToken({ access_token, expires_at, expires_in });
      navigate.push(`/`);
    };
    doAuth();
  }, []);

  return <></>;
};

export default OAuth2;
