import { FieldInputProps, Field } from 'formik';
import { FormikInputProps } from '.';
import { Input, FormText, FormGroup, Label } from 'reactstrap';
import styles from './FormikCheck.module.scss';

const FormikCheck: React.FC<FormikInputProps> = ({
  name,
  label,
  required,
  description,
  ...props
}: FormikInputProps) => {
  return (
    <FormGroup check>
      <Label check className={`form-field__label ${styles.nospace}`} size="sm">
        <Field
          name={name}
          as={(formikProps: FieldInputProps<any>) => (
            <Input
              bsSize={props['bsSize'] ?? 'sm'}
              type="checkbox"
              {...props}
              {...formikProps}
              checked={formikProps.value}
            />
          )}
        />
        {label}
      </Label>
      <FormText className={`form-field__help ${styles.nospace}`} color="muted">
        {description}
      </FormText>
    </FormGroup>
  );
};

export default FormikCheck;
