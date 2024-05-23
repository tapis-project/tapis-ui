import React from 'react';
import { FormikInput } from '@tapis/tapisui-common';
import styles from './Credentials.module.scss';

type GithubCredentialsProps = {
  scope: 'context' | 'destination';
};

const GithubCredentials: React.FC<GithubCredentialsProps> = ({ scope }) => {
  return (
    <div id={`${scope}-credentials-details`} className={styles['grid-2']}>
      <FormikInput
        name={`${scope}.credentials.username`}
        label="username"
        required={true}
        description={`Github username`}
        aria-label="Input"
      />
      <FormikInput
        name={`${scope}.credentials.personal_access_token`}
        label="personal access token"
        required={true}
        description={`Personal access token`}
        aria-label="Input"
      />
    </div>
  );
};

export default GithubCredentials;
