import * as Yup from 'yup';
import { useFormik } from 'formik';

export const useCustomFormik = (
  initialValues: any,
  validationSchema: any,
  onSubmit: any
) => {
  return useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });
};
