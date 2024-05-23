import React, { useMemo } from 'react';
import { Apps } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from '../../../../ui';
import {
  FieldArray,
  useFormikContext,
  useField,
  FieldArrayRenderProps,
} from 'formik';
import { FormikInput } from '../../../../ui-formik/FieldWrapperFormik';

type EnvVariableFieldProps = {
  index: number;
  arrayHelpers: FieldArrayRenderProps;
};

const EnvVariableField: React.FC<EnvVariableFieldProps> = ({
  index,
  arrayHelpers,
}) => {
  const [field] = useField(
    `jobAttributes.parameterSet.envVariables.${index}.key`
  );
  const key = useMemo(() => field.value, [field]);
  return (
    <Collapse
      key={`envVariables.${index}`}
      title={!!key && key.length ? key : 'Environment Variable'}
      className={fieldArrayStyles.item}
    >
      <FormikInput
        name={`jobAttributes.parameterSet.envVariables.${index}.key`}
        required={true}
        label="Key"
        description="The key name for this environment variable"
      />
      <FormikInput
        name={`jobAttributes.parameterSet.envVariables.${index}.value`}
        required={true}
        label="Value"
        description="A value for this environment variable"
      />
      <Button size="sm" onClick={() => arrayHelpers.remove(index)}>
        Remove
      </Button>
    </Collapse>
  );
};

const EnvVariablesRender: React.FC = () => {
  const { values } = useFormikContext();
  const envVariables =
    (values as Partial<Apps.ReqPostApp>).jobAttributes?.parameterSet
      ?.envVariables ?? [];

  return (
    <FieldArray
      name={'jobAttributes.parameterSet.envVariables'}
      render={(arrayHelpers) => (
        <>
          <div className={fieldArrayStyles.array}>
            <h3>{`Environment Variables`}</h3>
            <div className={fieldArrayStyles['array-group']}>
              {envVariables.map((envVariable, index) => (
                <EnvVariableField index={index} arrayHelpers={arrayHelpers} />
              ))}
            </div>
            <Button
              onClick={() =>
                arrayHelpers.push({
                  key: '',
                  value: '',
                  description: '',
                  arg: '',
                })
              }
              size="sm"
            >
              + Add
            </Button>
          </div>
        </>
      )}
    />
  );
};

export const EnvVariables: React.FC = () => {
  return (
    <div>
      <EnvVariablesRender />
    </div>
  );
};

export default EnvVariables;
