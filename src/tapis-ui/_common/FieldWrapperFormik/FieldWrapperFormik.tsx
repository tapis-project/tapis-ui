import React from 'react';
import { FormGroup, Label, FormText, Badge } from 'reactstrap';
import styles from './FieldWrapperFormik.module.css';
import { Field, useField } from 'formik';
export type FieldWrapperProps = {
  name: string;
  label: string;
  required: boolean;
  description: string;
  as: React.ComponentType<any>;
};
const FieldWrapper: React.FC<FieldWrapperProps> = ({
  name,
  label,
  required,
  description,
  as: Component,
}) => {
  const [, meta] = useField(name);
  return (
    <FormGroup>
      <Label
        className="form-field__label"
        size="sm"
        style={{ display: 'flex', alignItems: 'center' }}
        htmlFor={name}
      >
        {label}
        {required ? (
          <Badge color="danger" style={{ marginLeft: '10px' }}>
            Required
          </Badge>
        ) : null}
      </Label>
      <Field name={name} as={Component} id={name} />
      {meta.error && (
        <FormText className={styles['form-field__help']} color="dark">
          {meta.error}
        </FormText>
      )}
      {description && !meta.error && (
        <FormText className={styles['form-field__help']} color="muted">
          {description}
        </FormText>
      )}
    </FormGroup>
  );
};

export default FieldWrapper;
