import type React from 'react';
import { InputProps } from 'reactstrap';

export type FormikInputProps = {
  name: string;
  label: string;
  required: boolean;
  description: React.ReactNode;
  errorsAfterTouch?: boolean;
} & InputProps;

export { default as FormikInput } from './FormikInput';
export { default as FormikSelect } from './FormikSelect';
export { default as FormikCheck } from './FormikCheck';
export { default as FormikTapisFile } from './FormikTapisFile';
export { FormikTapisFileInput } from './FormikTapisFile';
