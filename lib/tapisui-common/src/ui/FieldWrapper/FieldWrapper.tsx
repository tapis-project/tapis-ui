import React from 'react';
import { FormGroup, Label, FormText, Badge } from 'reactstrap';
import './FieldWrapper.scss';

export type FieldWrapperProps = {
  label: string;
  required: boolean;
  description: string;
  error?: string;
  children?: React.ReactNode;
};
const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  required,
  description,
  children,
  error,
}) => (
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
    {children}
    {error ? (
      <div className="form-field__validation-error">{error}</div>
    ) : (
      description && (
        <FormText className="form-field__help" color="muted">
          {description}
        </FormText>
      )
    )}
  </FormGroup>
);

export default FieldWrapper;
