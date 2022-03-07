import FieldWrapper from '../FieldWrapperFormik';
import { Input, InputProps } from 'reactstrap';

export type FormikInputProps = {
  name: string;
  label: string;
  required: boolean;
  description: string;
} & InputProps;

const FormikInput: React.FC<FormikInputProps> = ({
  name,
  label,
  required,
  description,
  ...props
}: FormikInputProps) => (
  <FieldWrapper
    name={name}
    label={label}
    required={required}
    description={description}
    as={(formikProps: InputProps) => (
      <Input bsSize="sm" {...props} {...formikProps} />
    )}
  />
);

export default FormikInput;
