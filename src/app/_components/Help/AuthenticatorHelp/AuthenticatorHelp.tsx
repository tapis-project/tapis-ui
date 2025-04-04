import React from 'react';
import { Help } from '@tapis/tapisui-common';

const AuthenticatorHelp: React.FC = () => {
  return (
    <Help
      title="Authenticator Help"
      iframeUrl="https://tapis.readthedocs.io/en/latest/technical/authentication.html#oauth-clients"
    />
  );
};

export default AuthenticatorHelp;
