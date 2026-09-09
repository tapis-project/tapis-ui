import React from 'react';
import { FormGroup, Label, FormText, Badge } from 'reactstrap';
import styles from './FieldWrapperFormik.module.css';
import { Field, useField } from 'formik';
export type FieldWrapperProps = {
  name: string;
  label: string;
  required: boolean;
  description: React.ReactNode;
  isHidden?: boolean;
  /** Hold a field's error until it has been visited or the form submitted.
   *  Off by default: Formik validates every field on each change, so with it
   *  off, typing in one field shows the errors of fields not reached yet. */
  errorsAfterTouch?: boolean;
  as: React.ComponentType<any>;
};
export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  name,
  label,
  required,
  description,
  isHidden = false,
  errorsAfterTouch = false,
  as: Component,
}) => {
  const [, meta] = useField(name);
  const error = !errorsAfterTouch || meta.touched ? meta.error : undefined;
  return (
    <FormGroup>
      <span className={isHidden ? styles['hidden'] : ''}>
        <Label
          className="form-field__label"
          size="sm"
          style={{ display: 'flex', alignItems: 'center' }}
          htmlFor={name}
        >
          {label}
          {required && !isHidden ? (
            <Badge color="danger" style={{ marginLeft: '10px' }}>
              Required
            </Badge>
          ) : null}
        </Label>
        <Field name={name} as={Component} id={name} />
        {error && (
          <FormText className={styles['form-field__help']} color="danger">
            {error}
          </FormText>
        )}
        {description && !error && (
          <FormText className={styles['form-field__help']} color="muted">
            {description}
          </FormText>
        )}
      </span>
    </FormGroup>
  );
};

export default FieldWrapper;
