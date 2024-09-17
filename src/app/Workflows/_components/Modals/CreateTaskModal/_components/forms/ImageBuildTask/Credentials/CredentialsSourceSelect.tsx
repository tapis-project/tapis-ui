import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Credentials, IdentitySelect } from '.';
import styles from './CredentialsSourceSelect.module.scss';

type CredentialsSourceSelectProps = {
  type: Workflows.EnumContextType | Workflows.EnumDestinationType;
  scope: 'context' | 'destination';
};

const CredentialsSourceSelect: React.FC<CredentialsSourceSelectProps> = ({
  type,
  scope,
}) => {
  const [identityAsCreds, setIdentityAsCreds] = useState<boolean | undefined>(
    undefined
  );
  return (
    <div id="credentials-source-select">
      <h2>Credential Source</h2>
      <div className={styles['radio-button-container']}>
        <label>
          <input
            type="radio"
            checked={identityAsCreds === false}
            defaultChecked={false}
            onClick={() => {
              setIdentityAsCreds(false);
            }}
          />{' '}
          Provide credentials
        </label>
      </div>
      <div className={styles['radio-button-container']}>
        <label>
          <input
            type="radio"
            checked={identityAsCreds === true}
            defaultChecked={false}
            onClick={() => {
              setIdentityAsCreds(true);
            }}
          />{' '}
          Use an external identity
        </label>
      </div>
      {identityAsCreds !== undefined &&
        (identityAsCreds ? (
          <IdentitySelect scope={scope} type={type} />
        ) : (
          <Credentials scope={scope} type={type} />
        ))}
    </div>
  );
};

export default CredentialsSourceSelect;
