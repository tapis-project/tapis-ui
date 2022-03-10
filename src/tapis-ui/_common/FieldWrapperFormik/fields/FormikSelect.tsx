import FieldWrapper from '../FieldWrapperFormik';
import { Input } from 'reactstrap';
import { FieldInputProps } from 'formik';
import { FormikInputProps } from '.';

const FormikSelect: React.FC<React.PropsWithChildren<FormikInputProps>> = ({
  name,
  label,
  required,
  description,
  children,
  ...props
}: FormikInputProps) => (
  <FieldWrapper
    name={name}
    label={label}
    required={required}
    description={description}
    as={(formikProps: FieldInputProps<any>) => (
      <Input bsSize="sm" {...props} {...formikProps}>
        {children}
      </Input>
    )}
  />
);

export default FormikSelect;
