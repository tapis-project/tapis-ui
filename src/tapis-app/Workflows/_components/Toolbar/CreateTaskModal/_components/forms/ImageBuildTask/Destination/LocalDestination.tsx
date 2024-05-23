import React from 'react';
import { FormikInput } from '@tapis/tapisui-common';
import styles from './Destination.module.scss';

const LocalDestination: React.FC = () => {
  return (
    <div id="Destination-details">
      <div className={styles['grid-2']}>
        <FormikInput
          name={`destination.filename`}
          placeholder={`"my_image.tar.gz" or "my_mage.SIF"`}
          label="filename"
          required={false}
          description={`Name for the image file produced by this task. Will default to the name provided by the image builder if none provided.`}
          aria-label="Input"
        />
      </div>
    </div>
  );
};

export default LocalDestination;
