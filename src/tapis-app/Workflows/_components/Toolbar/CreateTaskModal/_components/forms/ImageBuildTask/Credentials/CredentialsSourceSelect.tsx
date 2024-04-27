import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Credentials } from '.';

type CredentialsSourceSelectProps = {
  type: Workflows.EnumContextType | Workflows.EnumDestinationType;
  scope: 'context' | 'destination';
};

const CredentialsSourceSelect: React.FC<CredentialsSourceSelectProps> = ({
  type,
  scope,
}) => {
  return (
    <div id="credentials-source-select">
      <h2>Credential Source</h2>
      <Credentials scope={scope} type={type} />
    </div>
  );
};

export default CredentialsSourceSelect;
