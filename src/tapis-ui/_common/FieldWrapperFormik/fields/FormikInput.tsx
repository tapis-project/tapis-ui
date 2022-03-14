import FieldWrapper from '../FieldWrapperFormik';
import { Input } from 'reactstrap';
import { FieldInputProps } from 'formik';
import { FormikInputProps } from '.';

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
    as={(formikProps: FieldInputProps<any>) => {
      console.log("props", props);
      console.log("formik props", formikProps);
      return (
        <Input bsSize="sm" {...props} {...formikProps} />
      )
    }}
  />
);

export default FormikInput;
