import React from 'react';
import { FormikInput } from '@tapis/tapisui-common';
import styles from './Credentials.module.scss';

type DockerhubCredentialsProps = {
  scope: 'context' | 'destination';
};

const DockerhubCredentials: React.FC<DockerhubCredentialsProps> = ({
  scope,
}) => {
  return (
    <div id={`${scope}-credentials-details`} className={styles['grid-2']}>
      <FormikInput
        name={`${scope}.credentials.username`}
        label="username"
        required={true}
        description={`Dockerhub username`}
        aria-label="Input"
      />
      <FormikInput
        name={`${scope}.credentials.token`}
        label="access token"
        required={true}
        description={`Access token`}
        aria-label="Input"
      />
    </div>
  );
};

export default DockerhubCredentials;
