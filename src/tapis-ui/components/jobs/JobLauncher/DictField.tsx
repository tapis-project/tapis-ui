import React from 'react';
import { Input } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import styles from './DictField.module.scss';

export type Spec = {
  name: string,
  label: string,
  tapisFile?: boolean,
  defaultValue?: string,
  defaultChecked?: boolean,
  required?: string,
  description: string,
}

export type DictFieldProps = {
  specs: Array<Spec>,
  refName: string,
  register: any,
  errors: any,
}

const DictField: React.FC<DictFieldProps> = ({ refName, specs, errors, register }) => {
  return (
    <div>
      {
        specs.map(
          (spec) =>  {
            const { name, label, defaultValue, defaultChecked, required, description } = spec;
            const type = defaultChecked !== undefined ? 'checkbox' : 'text';

            // Using dot notation allows react-hook-form to parse this into an object
            const fieldRef = `${refName}.${name}`;

            return (
              <FieldWrapper label={label} description={description} 
                error={errors[fieldRef]} required={!!required} key={fieldRef}
              >
                <Input 
                  bsSize="sm" defaultValue={defaultValue} defaultChecked={defaultChecked} type={type}
                  {...mapInnerRef(register(fieldRef, { required }))}
                  className={styles['form-input-override']}
                />
              </FieldWrapper>
            )
          }
        )
      }
    </div>
  )
}

export default DictField;