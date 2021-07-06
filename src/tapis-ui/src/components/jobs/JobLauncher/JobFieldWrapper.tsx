import React, { useState } from 'react';
import {
  Button,
  FormGroup,
  Label,
  Input,
  FormText,
  Badge,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';

import { useField, FieldHookConfig } from 'formik';
import PropTypes from 'prop-types';
import './JobFieldWrapper.scss';

type JobFieldWrapperCustomProps = {
  label: string;
  required?: boolean;
  description: string;
  children?:
    | React.ReactChild
    | React.ReactChild[];
  key?: string
}

export type JobFieldWrapperProps = {
  props: FieldHookConfig<string>
} & JobFieldWrapperCustomProps;

const JobFieldWrapper: React.FC<JobFieldWrapperProps> = ({ props, label, required, description, children }) => {
  const [ field, meta, helpers ] = useField(props);
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


export default JobFieldWrapper;