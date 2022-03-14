import { ChangeEvent } from 'react';
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
    as={(formikProps: FieldInputProps<any>) => {
      const { onChange: formikOnChange, ...otherFormikProps } = formikProps;
      const { onChange: passedOnChange, ...otherProps } = props;
      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        passedOnChange && passedOnChange(event);
        formikOnChange && formikOnChange(event);
      };
      return (
        <Input
          bsSize="sm"
          type="select"
          onChange={onChange}
          {...otherProps}
          {...otherFormikProps}
        >
          {children}
        </Input>
      );
    }}
  />
);

export default FormikSelect;
