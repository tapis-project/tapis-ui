import { FormikContextType, getIn, isObject, isInteger } from 'formik';
import _ from 'lodash';

/**
 * Adaptation of setFieldValue wrapper from https://github.com/jaredpalmer/formik/issues/2332#issuecomment-819571154
 *
 * There is a bug in the setIn function of Formik that deletes form keys that have undefined values rather than
 * setting the field value to undefined. This is inconsistent with other types of Formik behavior, such as
 * empty text Inputs resulting in form keys with undefined values
 *
 * @param formikContext
 * @param field
 * @param value
 * @param shouldValidate
 */
export function setFieldValue(
  formikContext: FormikContextType<unknown>,
  field: string,
  value: any,
  shouldValidate?: boolean
): void {
  const { setValues, validateForm, validateOnChange, setFieldValue, values } =
    formikContext;
  // Override default behavior by forcing undefined to be set on the state
  if (value === undefined) {
    const setInValues = setIn(values, field, undefined);
    setValues(setInValues);

    const willValidate =
      shouldValidate === undefined ? validateOnChange : shouldValidate;
    if (willValidate) {
      validateForm(setInValues);
    }
  } else {
    // Use default behavior for normal values
    setFieldValue(field, value, shouldValidate);
  }
}

/**
 * A copy of Formik's setIn function, except it assigns undefined instead of deleting the property if the value
 * being set is undefined.
 * https://github.com/jaredpalmer/formik/issues/2332
 */
function setIn(obj: any, path: string, value: any): any {
  const res: any = _.clone(obj); // This keeps inheritance when obj is a class
  let resVal: any = res;
  let i = 0;
  const pathArray = _.toPath(path);

  for (; i < pathArray.length - 1; i++) {
    const currentPath: string = pathArray[i];
    const currentObj: any = getIn(obj, pathArray.slice(0, i + 1));

    if (currentObj && (isObject(currentObj) || Array.isArray(currentObj))) {
      resVal = resVal[currentPath] = _.clone(currentObj);
    } else {
      const nextPath: string = pathArray[i + 1];
      resVal = resVal[currentPath] =
        isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
    }
  }

  // Return original object if new value is the same as current
  if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
    return obj;
  }

  if (value === undefined) {
    resVal[pathArray[i]] = undefined;
  } else {
    resVal[pathArray[i]] = value;
  }

  // If the path array has a single element, the loop did not run.
  // Deleting on `resVal` had no effect in this scenario, so we delete on the result instead.
  if (i === 0 && value === undefined) {
    res[pathArray[i]] = undefined;
  }

  return res;
}
