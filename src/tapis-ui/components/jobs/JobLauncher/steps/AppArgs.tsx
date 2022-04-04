import React, { useMemo } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from 'tapis-ui/_common';
import {
  FieldArray,
  useFormikContext,
  useField,
  FieldArrayRenderProps,
} from 'formik';
import { FormikJobStepWrapper } from '../components';
import { FormikInput } from 'tapis-ui/_common';
import { FormikCheck } from 'tapis-ui/_common/FieldWrapperFormik';
import * as Yup from 'yup';

type AppArgFieldProps = {
  index: number;
  arrayHelpers: FieldArrayRenderProps;
};

const AppArgField: React.FC<AppArgFieldProps> = ({
  index,
  arrayHelpers,
}) => {
  const [field] = useField(`parameterSet.appArgs.${index}.name`);
  const name = useMemo(() => field.value, [field]);
  return (
    <Collapse
      key={`appArgs.${index}`}
      title={!!name && name.length ? name : 'App Argument'}
      className={fieldArrayStyles.item}
    >
      <FormikInput
        name={`parameterSet.appArgs.${index}.name`}
        required={true}
        label="Key"
        description="The name for this app argument"
      />
      <FormikInput
        name={`parameterSet.appArgs.${index}.arg`}
        required={true}
        label="Value"
        description="A value for this app argument"
      />
      <FormikInput
        name={`parameterSet.appArgs.${index}.description`}
        required={false}
        label="Description"
        description="A description for this app argument"
      />
      <FormikCheck
        name={`parameterSet.appArgs.${index}.include`}
        required={false}
        label="Include"
        description="If checked, this argument will be included"
      />
      <Button size="sm" onClick={() => arrayHelpers.remove(index)}>
        Remove
      </Button>
    </Collapse>
  );
};

const AppArgsRender: React.FC = () => {
  const { values } = useFormikContext();
  const appArgs =
    (values as Partial<Jobs.ReqSubmitJob>).parameterSet?.appArgs ?? [];
  return (
    <FieldArray
      name={'parameterSet.appArgs'}
      render={(arrayHelpers) => (
        <div>
          <h3>Environment Variables</h3>
          <div className={fieldArrayStyles['array-group']}>
            {appArgs.map((appArg, index) => (
              <AppArgField index={index} arrayHelpers={arrayHelpers} />
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

export const AppArgs: React.FC = () => {
  const { job } = useJobLauncher();

  const validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
      appArgs: Yup.array(
        Yup.object({
          name: Yup.string(),
          description: Yup.string(),
          include: Yup.boolean(),
          arg: Yup.string().min(1).required("The argument cannot be blank")
        })
      ),
    }),
  });

  const initialValues = useMemo(
    () => ({
      parameterSet: {
        appArgs: job.parameterSet?.appArgs,
      },
    }),
    [job]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <AppArgsRender />
    </FormikJobStepWrapper>
  );
};

export const AppArgsSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const appArgs = job.parameterSet?.appArgs ?? [];
  return (
    <div>
      <StepSummaryField
        field={`App Arguments: ${appArgs.length}`}
        key={`app-args-summary`}
      />
    </div>
  );
};
