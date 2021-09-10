import React from 'react';
import { UseFormRegister, FieldValues, FieldError, DeepMap } from 'react-hook-form';
import { Input } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';


export type Spec = {
  name: string,
  label: string,
  tapisFile?: boolean,
  defaultValue?: string,
  checked?: boolean,
  required?: string,
  description: string,
  type?: 'text' | 'checkbox'
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
            const { name, label, defaultValue, required, description, type, checked } = spec;

            // Using dot notation allows react-hook-form to parse this into an object
            const fieldRef = `${refName}.${name}`;

            return (
              <FieldWrapper label={label} description={description} 
                error={errors[fieldRef]} required={!!required} key={fieldRef}>
                <Input 
                  bsSize="sm" defaultValue={defaultValue} type={type}
                  {...mapInnerRef(register(fieldRef, { required }))}
                  checked={type === 'checkbox' && checked}
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