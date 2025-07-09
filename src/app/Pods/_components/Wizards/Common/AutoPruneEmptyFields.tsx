import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import * as Yup from 'yup';

interface AutoPruneEmptyFieldsProps {
  validationSchema: Yup.ObjectSchema<any>;
  doNotPruneKeys?: Array<string>;
  deepCheck?: boolean; // Add deepCheck flag
}

const AutoPruneEmptyFields: React.FC<AutoPruneEmptyFieldsProps> = ({
  validationSchema,
  doNotPruneKeys, // Allow us to specify keys that should not be pruned and aren't w
  deepCheck = true, // Default to true
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

        if (doNotPruneKeys?.includes(key)) {
          return;
        }

        const value = obj[key];
        const path = parentKey ? `${parentKey}.${key}` : key;

        // Special handling for environment_variables: do not prune empty string values inside it
        if (
          key === 'environment_variables' &&
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Only prune if the whole object is empty, not its keys
          if (Object.keys(value).length === 0) {
            setFieldValue(path, undefined);
          }
          // Do not prune keys with empty string values inside environment_variables
          return;
        }

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
  }, [values, setFieldValue, requiredKeys, deepCheck]);

  return null; // This component does not render anything
};

export default AutoPruneEmptyFields;
