// FMTextField.tsx
import React from 'react';
import { TextField } from '@mui/material';
import { FormikProps } from 'formik';

interface FMTextFieldProps {
  formik: FormikProps<any>;
  name: string;
  label: string;
  description: string;
  multiline?: boolean;
  disabled?: boolean;
  rows?: number;
  type?: string;
  size?: 'small' | 'medium';
}

const FMTextField: React.FC<FMTextFieldProps> = ({
  formik,
  name,
  label,
  description,
  rows,
  disabled = false,
  multiline = false,
  type = 'text',
  size = 'small',
}) => {
  return (
    <TextField
      style={{ marginBottom: '.75rem' }}
      fullWidth
      id={name}
      name={name}
      label={label}
      type={type}
      disabled={disabled}
      multiline={multiline}
      rows={multiline && !rows ? 3 : rows}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={
        formik.touched[name] && formik.errors[name]
          ? String(formik.errors[name])
          : description
      }
      size={size}
    />
  );
};

export default FMTextField;
