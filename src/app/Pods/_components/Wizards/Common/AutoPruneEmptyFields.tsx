import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import * as Yup from 'yup';

interface AutoPruneEmptyFieldsProps {
  validationSchema: Yup.ObjectSchema<any>;
}

const AutoPruneEmptyFields: React.FC<AutoPruneEmptyFieldsProps> = ({
  validationSchema,
}) => {
  const { values, setFieldValue } = useFormikContext<any>();

  const getRequiredKeys = (schema: Yup.ObjectSchema<any>) => {
    const requiredKeys: string[] = [];
    schema.fields &&
      Object.keys(schema.fields).forEach((key) => {
        const field = schema.fields[key];
        if (field.tests.some((test: any) => test.OPTIONS.name === 'required')) {
          requiredKeys.push(key);
        }
      });
    return requiredKeys;
  };

  const requiredKeys = getRequiredKeys(validationSchema);

  useEffect(() => {
    const pruneEmptyFields = (obj: { [key: string]: any }, parentKey = '') => {
      Object.keys(obj).forEach((key) => {
        // Skip pruning for required fields
        if (requiredKeys.includes(key)) {
          return;
        }

        const value = obj[key];
        const path = parentKey ? `${parentKey}.${key}` : key;
        const isEmptyString = value === '';
        const isEmptyArray = Array.isArray(value) && value.length === 0;
        const isEmptyObject =
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value) &&
          Object.keys(value).length === 0;

        if (isEmptyString || isEmptyArray || isEmptyObject) {
          setFieldValue(path, undefined);
        } else if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          pruneEmptyFields(value, path);
        }
      });
    };

    pruneEmptyFields(values);
  }, [values, setFieldValue, requiredKeys]);

  return null; // This component does not render anything
};

export default AutoPruneEmptyFields;
