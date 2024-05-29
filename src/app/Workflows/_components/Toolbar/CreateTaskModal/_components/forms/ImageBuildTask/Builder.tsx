import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { FormikSelect } from '@tapis/tapisui-common';
import styles from './Builder.module.scss';
import { Field, useFormikContext } from 'formik';

const Builder: React.FC = () => {
  const [type, setType] = useState<string | null>(null);
  const [cacheChecked, setCacheChecked] = useState<boolean>(false);
  const { setFieldValue } = useFormikContext();

  return (
    <div className={styles['grid-2']}>
      <FormikSelect
        name={`builder`}
        label={'image builder'}
        required={true}
        description={
          'Select "kaniko" for Docker images and "singularity" for Singularity images'
        }
        onChange={(e) => {
          setType(e.target.value);
          setFieldValue('builder', e.target.value);
          if (e.target.value === Workflows.EnumBuilder.Singularity) {
            setCacheChecked(false);
            setFieldValue('cache', false);
          }
        }}
      >
        <option disabled selected={type === null} value={''}>
          -- select an option --
        </option>
        {Object.values(Workflows.EnumBuilder).map((builder) => {
          return (
            <option value={builder} selected={type === builder}>
              {builder}
            </option>
          );
        })}
      </FormikSelect>
      <label>
        <Field
          type="checkbox"
          name={`cache`}
          disabled={type === Workflows.EnumBuilder.Singularity}
          onClick={() => setCacheChecked(!cacheChecked)}
          checked={cacheChecked}
        />{' '}
        enable layer caching
      </label>
    </div>
  );
};

export default Builder;
