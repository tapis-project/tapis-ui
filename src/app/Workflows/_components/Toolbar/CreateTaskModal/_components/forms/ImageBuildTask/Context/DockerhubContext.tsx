import { Workflows } from '@tapis/tapis-typescript';
import React from 'react';
import { FormikInput } from '@tapis/tapisui-common';
import styles from './Context.module.scss';
import { VisibilitySelect } from './VisibilitySelect';

const DockerhubContext: React.FC = () => {
  return (
    <div id="context-details">
      <div className={styles['grid-2']}>
        <FormikInput
          name={`context.url`}
          label="url"
          required={true}
          description={`URL of the image registry. Follows the format "<user>/<registry_name>"`}
          aria-label="Input"
        />
        <FormikInput
          name={`context.tag`}
          label="image tag"
          required={true}
          description={`The version of the image to be pulled`}
          aria-label="Input"
        />
      </div>
      <VisibilitySelect type={Workflows.EnumContextType.Dockerhub} />
    </div>
  );
};

export default DockerhubContext;
