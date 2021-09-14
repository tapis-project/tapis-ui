import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import styles from './DictField.module.scss';

export type FieldSpec = {
  name: string;
  label: string;
  tapisFile?: boolean;
  defaultValue?: string;
  defaultChecked?: boolean;
  required?: string;
  description: string;
};

type DictFieldProps = {
  refName: string;
  fieldSpecs: Array<FieldSpec>;
};

export const DictField: React.FC<DictFieldProps> = ({
  refName,
  fieldSpecs,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      {fieldSpecs.map((spec) => {
        const {
          name,
          label,
          defaultValue,
          defaultChecked,
          required,
          description,
        } = spec;
        const type = defaultChecked !== undefined ? 'checkbox' : 'text';

        // Using dot notation allows react-hook-form to parse this into an object
        const fieldRef = `${refName}.${name}`;

        return (
          <FieldWrapper
            label={label}
            description={description}
            error={errors[fieldRef]}
            required={!!required}
            key={fieldRef}
          >
            <Input
              bsSize="sm"
              defaultValue={defaultValue}
              defaultChecked={defaultChecked}
              type={type}
              {...mapInnerRef(register(fieldRef, { required }))}
              className={styles['form-input-override']}
            />
          </FieldWrapper>
        );
      })}
    </div>
  );
};
