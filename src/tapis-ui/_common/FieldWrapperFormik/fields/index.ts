import { InputProps } from 'reactstrap';

export type FormikInputProps = {
  name: string;
  label: string;
  required: boolean;
  description: string;
} & InputProps;

export { default as FormikInput } from './FormikInput';
export { default as FormikSelect } from './FormikSelect';
export { default as FormikCheck } from './FormikCheck';
export { default as FormikTapisFile } from './FormikTapisFile';
export { FormikTapisFileInput } from './FormikTapisFile';
