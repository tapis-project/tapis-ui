import { Workflows } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { FormikSelect } from '@tapis/tapisui-common';
import { CredentialsSourceSelect } from '../../Credentials';

type VisibilitySelectProps = {
  type: Workflows.EnumContextType;
};

const VisibilitySelect: React.FC<VisibilitySelectProps> = ({ type }) => {
  const [visibility, setVisibility] = useState<string>('');
  const { setFieldValue } = useFormikContext();

  return (
    <div id="context-visibility">
      <h2>Visibility & Credentials</h2>
      <FormikSelect
        name={`context.visibility`}
        label={'visibility'}
        required={true}
        description={'Note: Private sources require credentials to access'}
        onChange={(e) => {
          setVisibility(e.target.value);
          setFieldValue('context.visibility', e.target.value);
        }}
      >
        <option disabled selected={true} value={''}>
          -- select an option --
        </option>
        {Object.values(Workflows.EnumContextVisibility).map((vis) => {
          return (
            <option
              key={`context-visiblity-${vis}`}
              selected={visibility === vis}
              value={vis}
            >
              {vis}
            </option>
          );
        })}
      </FormikSelect>
      {visibility === 'private' && (
        <CredentialsSourceSelect scope={'context'} type={type} />
      )}
    </div>
  );
};

export default VisibilitySelect;
