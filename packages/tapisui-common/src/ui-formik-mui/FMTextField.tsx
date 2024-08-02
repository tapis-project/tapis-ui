// FMTextField.tsx
import React from 'react';
import { TextField } from '@mui/material';
import { FormikProps } from 'formik';

interface FMTextFieldProps {
  formik: FormikProps<any>;
  name: string;
  label: string;
  description: string;
  type?: string;
  size?: 'small' | 'medium';
}

const FMTextField: React.FC<FMTextFieldProps> = ({
  formik,
  name,
  label,
  description,
  type = 'text',
  size = 'small',
}) => {
  return (
    <TextField
      fullWidth
      id={name}
      name={name}
      label={label}
      type={type}
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
