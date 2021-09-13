import React, { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input, Button, Collapse } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import styles from './DictFieldArray.module.scss';

type ReactHookFormProps = {
  refName: string,
  register: any,
  errors: any
}

export type FieldComponentProps = {
  item: {
    id: string,
    [name: string]: any
  }
} & ReactHookFormProps;


export type FieldSpec = {
  name: string,
  label: string,
  tapisFile?: boolean,
  defaultValue?: string,
  defaultChecked?: boolean,
  required?: string,
  description: string,
}


type DictFieldProps = {
  fieldSpecs: Array<FieldSpec>,
} & FieldComponentProps;

export const DictField: React.FC<DictFieldProps> = ({ item, refName, fieldSpecs, errors, register }) => {
  return (
    <div key={item.id}>
      {
        fieldSpecs.map(
          (spec) =>  {
            const { name, label, defaultValue, defaultChecked, required, description } = spec;
            const type = defaultChecked !== undefined ? 'checkbox' : 'text';

            const value = item[name];

            // Using dot notation allows react-hook-form to parse this into an object
            const fieldRef = `${refName}.${name}`;

            return (
              <FieldWrapper label={label} description={description} 
                error={errors[fieldRef]} required={!!required} key={fieldRef}
              >
                <Input 
                  bsSize="sm" defaultValue={defaultValue} defaultChecked={defaultChecked} type={type}
                  {...mapInnerRef(register(fieldRef, { required, value }))}
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


type FieldArrayProps = {
  // react-hook-form data ref
  refName: string,
  // Title for collapse panel
  title: string,
  // Custom component to render field
  component: React.FC<FieldComponentProps>,
  // Data template when appending new fields
  template: any,
  // react-hook-form control hook
  control: any
} & ReactHookFormProps;


export const DictFieldArray: React.FC<FieldArrayProps> = ({ refName, title, component, template, control, ...rest }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: refName
  });

  return <div className={styles.inputs}>
    <h3>{title}</h3>
    {
      fields.map(
        (item, index) => component({
          item,
          refName: `${refName}.${index}`,
          ...rest
        })
      )
    }
    <Button onClick={() => append(template)}>+</Button>
  </div>
}