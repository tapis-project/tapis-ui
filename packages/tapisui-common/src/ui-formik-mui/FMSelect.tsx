// FMSelect.tsx
import React from 'react';
import {
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  MenuItem,
} from '@mui/material';
import { FormikProps } from 'formik';

interface FMSelectProps {
  formik: FormikProps<any>;
  name: string;
  label: string;
  description?: string;
  type?: string;
  size?: 'small' | 'medium';
  labelId: string;
  children: React.ReactNode;
  value?: any; // Optional value override
  style?: React.CSSProperties; // Add style prop
  onChange?: any; // Optional custom onChange
  SelectProps?: any; // New prop for Select component
}

const FMSelect: React.FC<FMSelectProps> = ({
  formik,
  name,
  label,
  description = '',
  type = 'text',
  size = 'small',
  labelId,
  children,
  value,
  style = {}, // Default to empty object
  onChange,
  SelectProps, // Destructure new prop
}) => {
  return (
    <FormControl
      fullWidth
      // margin="dense"
      // style={{ marginBottom: '-16px' }}
      error={formik.touched[name] && Boolean(formik.errors[name])}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        fullWidth
        id={name}
        name={name}
        labelId={labelId}
        label={label}
        type={type}
        style={{ ...style }}
        value={value !== undefined ? value : formik.values[name]}
        onChange={onChange ? onChange : formik.handleChange}
        onBlur={formik.handleBlur}
        size={size}
        {...SelectProps} // Pass SelectProps to Select
      >
        {children}
      </Select>
      <FormHelperText>
        {formik.touched[name] && formik.errors[name]
          ? String(formik.errors[name])
          : description}
      </FormHelperText>
    </FormControl>
  );
};

export default FMSelect;
