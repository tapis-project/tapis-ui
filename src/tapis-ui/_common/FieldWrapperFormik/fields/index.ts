import { Input, InputProps } from 'reactstrap';

export type FormikInputProps = {
  name: string;
  label: string;
  required: boolean;
  description: string;
} & InputProps;


export { default as FormikInput } from './FormikInput';
export { default as FormikSelect } from './FormikSelect';