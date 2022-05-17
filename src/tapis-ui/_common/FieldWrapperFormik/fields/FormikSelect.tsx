import { ChangeEvent } from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { Input } from 'reactstrap';
import { FieldInputProps, useField, useFormikContext } from 'formik';
import { FormikInputProps } from '.';
import { setFieldValue } from './formikPatch';

const FormikSelect: React.FC<React.PropsWithChildren<FormikInputProps>> = ({
  name,
  label,
  required,
  description,
  children,
  ...props
}: FormikInputProps) => {
  const formikContext  = useFormikContext();
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
      as={(formikProps: FieldInputProps<any>) => {
        const { onChange: formikOnChange, ...otherFormikProps } = formikProps;
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // Use patched formik setFieldValue
          setFieldValue(formikContext, name, event.target.value === '' ? undefined : event.target.value);
        };
        return (
          <Input
            bsSize="sm"
            type="select"
            onChange={onChange}
            {...props}
            {...otherFormikProps}
          >
            {children}
          </Input>
        );
      }}
    />
  )
}

export default FormikSelect;
