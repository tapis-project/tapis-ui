// FMTextField.tsx
import React from 'react';
import { TextField } from '@mui/material';
import { FormikProps } from 'formik';

interface FMTextFieldProps {
  formik: FormikProps<any>;
  name: string;
  label: string;
  description?: string;
  multiline?: boolean;
  disabled?: boolean;
  rows?: number;
  type?: string;
  size?: 'small' | 'medium';
  style?: React.CSSProperties;
  InputProps?: any;
  value?: any; // Optional value override
  onChange?: (e: React.ChangeEvent<any>) => void; // Optional custom onChange
  variant?: 'outlined' | 'filled' | 'standard';
}

const FMTextField: React.FC<FMTextFieldProps> = ({
  formik,
  name,
  label,
  description = '',
  rows,
  disabled = false,
  multiline = false,
  type = 'text',
  size = 'small',
  style = {},
  InputProps = {},
  value,
  onChange,
  variant = 'outlined',
}) => {
  return (
    <TextField
      style={{ marginBottom: '.75rem', ...style }}
      fullWidth
      id={name}
      name={name}
      label={label}
      type={type}
      disabled={disabled}
      multiline={multiline}
      rows={multiline && !rows ? 3 : rows}
      value={value !== undefined ? value : formik.values[name]}
      onChange={onChange ? onChange : formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={
        formik.touched[name] && formik.errors[name]
          ? String(formik.errors[name])
          : description
      }
      size={size}
      InputProps={InputProps}
      variant={variant}
    />
  );
};

export default FMTextField;
