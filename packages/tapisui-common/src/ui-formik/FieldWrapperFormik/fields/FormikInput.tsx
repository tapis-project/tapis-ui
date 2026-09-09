import React, { useMemo, useRef } from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { Input } from 'reactstrap';
import { FieldInputProps } from 'formik';
import { FormikInputProps } from '.';

const FormikInput: React.FC<FormikInputProps> = ({
  name,
  label,
  required,
  description,
  errorsAfterTouch,
  ...props
}: FormikInputProps) => {
  // The input component keeps ONE identity for the life of the field. A new
  // one per render (an inline arrow) made React unmount and remount the
  // <input> whenever the form's parent re-rendered: focus and the caret were
  // lost, and an autoFocus field took focus back. It reads the latest props
  // from a ref, so changed props (a type toggled to text) still apply.
  const propsRef = useRef(props);
  propsRef.current = props;
  const FieldInput = useMemo(
    () =>
      function FieldInput(formikProps: FieldInputProps<any>) {
        return <Input bsSize="sm" {...propsRef.current} {...formikProps} />;
      },
    []
  );
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
      errorsAfterTouch={errorsAfterTouch}
      isHidden={props.type && props.type === 'hidden'}
      as={FieldInput}
    />
  );
};

export default React.memo(FormikInput);
