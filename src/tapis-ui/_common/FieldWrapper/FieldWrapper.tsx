import React from 'react';
import {
  FormGroup,
  Label,
  FormText,
  Badge,
} from 'reactstrap';

import { useField, FieldHookConfig } from 'formik';
import './FieldWrapper.scss';

type FieldWrapperCustomProps = {
  label: string;
  required?: boolean;
  description: string;
  children?:
    | React.ReactChild
    | React.ReactChild[];
  key?: string
}

export type FieldWrapperProps = {
  props: FieldHookConfig<string>
} & FieldWrapperCustomProps;

const FieldWrapper: React.FC<FieldWrapperProps> = ({ props, label, required, description, children }) => {
  const [ field, meta ] = useField(props);
  return (
    <FormGroup>
      <Label
        className="form-field__label"
        size="sm"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {label}{' '}
        {required ? (
          <Badge color="danger" style={{ marginLeft: '10px' }}>
            Required
          </Badge>
        ) : null}
      </Label>
      {
        React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {...field, ...props, key: props.name });
          }
          return child;
        })
      }
      {meta.touched && meta.error ? (
        <div className="form-field__validation-error">{meta.error}</div>
      ) : (
        description && (
          <FormText className="form-field__help" color="muted">
            {description}
          </FormText>
        )
      )}
    </FormGroup>
  )
}


export default FieldWrapper;