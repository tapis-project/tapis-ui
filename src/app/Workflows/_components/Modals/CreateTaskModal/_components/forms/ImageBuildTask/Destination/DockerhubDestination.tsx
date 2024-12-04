import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { FormikInput } from '@tapis/tapisui-common';
import { CredentialsSourceSelect } from '../Credentials';
import styles from './Destination.module.scss';

const DockerhubDestination: React.FC = () => {
  return (
    <div id="destination-details">
      <div className={styles['grid-2']}>
        <FormikInput
          name={`destination.url`}
          label="url"
          required={true}
          description={`URL of the image registry. Follows the format "<user>/<registry_name>"`}
          aria-label="Input"
        />
        <FormikInput
          name={`destination.tag`}
          label="image tag"
          required={true}
          description={`Image tag`}
          aria-label="Input"
        />
      </div>
      <div id="destination-credentials">
        <CredentialsSourceSelect
          scope={'destination'}
          type={Workflows.EnumDestinationType.Dockerhub}
        />
      </div>
    </div>
  );
};

export default DockerhubDestination;
