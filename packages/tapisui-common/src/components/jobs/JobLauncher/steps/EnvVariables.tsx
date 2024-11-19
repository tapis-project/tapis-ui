import React, { useMemo } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from '../../../../ui';
import {
  FieldArray,
  useFormikContext,
  useField,
  FieldArrayRenderProps,
} from 'formik';
import { FormikInput } from '../../../../ui-formik/FieldWrapperFormik';
import { JobStep } from '..';
import * as Yup from 'yup';

type EnvVariableFieldProps = {
  index: number;
  arrayHelpers: FieldArrayRenderProps;
};

const EnvVariableField: React.FC<EnvVariableFieldProps> = ({
  index,
  arrayHelpers,
}) => {
  const [field] = useField(`parameterSet.envVariables.${index}.key`);
  const key = useMemo(() => field.value, [field]);
  return (
    <Collapse
      key={`envVariables.${index}`}
      title={!!key && key.length ? key : 'Environment Variable'}
      className={fieldArrayStyles.item}
    >
      <FormikInput
        name={`parameterSet.envVariables.${index}.key`}
        required={true}
        label="Key"
        description="The key name for this environment variable"
      />
      <FormikInput
        name={`parameterSet.envVariables.${index}.value`}
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
    (values as Partial<Jobs.ReqSubmitJob>).parameterSet?.envVariables ?? [];
  return (
    <FieldArray
      name={'parameterSet.envVariables'}
      render={(arrayHelpers) => (
        <div>
          <div className={fieldArrayStyles['array-group']}>
            {envVariables.map((envVariable, index) => (
              <EnvVariableField index={index} arrayHelpers={arrayHelpers} />
            ))}
          </div>
          <Button
            onClick={() => arrayHelpers.push({ key: '', value: '' })}
            size="sm"
          >
            + Add
          </Button>
        </div>
      )}
    />
  );
};

export const EnvVariables: React.FC = () => {
  return (
    <div>
      <h2>Environment Variables</h2>
      <EnvVariablesRender />
    </div>
  );
};

export const EnvVariablesSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const envVariables = job.parameterSet?.envVariables ?? [];
  return (
    <div>
      {envVariables.map((envVariable) => (
        <StepSummaryField
          field={`${envVariable.key} : ${envVariable.value}`}
          key={`env-variables-summary-${envVariable.key}`}
        />
      ))}
    </div>
  );
};

const validationSchema = Yup.object().shape({
  parameterSet: Yup.object({
    envVariables: Yup.array(
      Yup.object({
        key: Yup.string()
          .min(1)
          .required('A key name is required for this environment variable'),
        value: Yup.string().required(
          'A value is required for this environment variable'
        ),
      })
    ),
  }),
});

const step: JobStep = {
  id: 'envVariables',
  name: 'Environment Variables',
  render: <EnvVariables />,
  summary: <EnvVariablesSummary />,
  validationSchema,
  generateInitialValues: ({ job }) => ({
    parameterSet: {
      envVariables: job.parameterSet?.envVariables,
    },
  }),
};

export default step;
