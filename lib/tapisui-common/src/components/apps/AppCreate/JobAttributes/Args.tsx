import React, { useMemo } from 'react';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from '../../../../ui';
import {
  FieldArray,
  useField,
  FieldArrayRenderProps,
  useFormikContext,
} from 'formik';
import {
  FormikCheck,
  FormikInput,
} from '../../../../ui-formik/FieldWrapperFormik';
import { getArgMode } from '../../../../utils/jobArgs';
import * as Yup from 'yup';

type ArgFieldProps = {
  index: number;
  name: string;
  argType: string;
  arrayHelpers: FieldArrayRenderProps;
  inputMode?: Apps.ArgInputModeEnum;
};

export const ArgField: React.FC<ArgFieldProps> = ({
  index,
  name,
  argType,
  arrayHelpers,
  inputMode,
}) => {
  const [field] = useField(`${name}.name`);
  const argName = useMemo(() => field.value, [field]);
  return (
    <Collapse
      key={`${argType}.${index}`}
      title={!!argName && argName.length ? argName : argType}
      className={fieldArrayStyles.item}
    >
      <FormikInput
        name={`${name}.name`}
        required={true}
        label="Name"
        disabled={!!inputMode}
        description={`The name for this ${argType} ${
          !!inputMode
            ? 'is defined in the application and cannot be changed'
            : ''
        }`}
      />
      <FormikInput
        name={`${name}.arg`}
        required={true}
        label="Value"
        disabled={inputMode === Apps.ArgInputModeEnum.Fixed}
        description={`A value for this ${argType}`}
      />
      <FormikInput
        name={`${name}.description`}
        required={false}
        label="Description"
        disabled={inputMode === Apps.ArgInputModeEnum.Fixed}
        description={`A description for this ${argType}`}
      />
      <FormikCheck
        name={`${name}.include`}
        required={false}
        label="Include"
        disabled={
          inputMode === Apps.ArgInputModeEnum.Fixed ||
          inputMode === Apps.ArgInputModeEnum.Required
        }
        description={
          inputMode === Apps.ArgInputModeEnum.Fixed ||
          inputMode === Apps.ArgInputModeEnum.Required
            ? `This ${argType} must be included`
            : `If checked, this ${argType} will be included`
        }
      />
      <Button size="sm" onClick={() => arrayHelpers.remove(index)}>
        Remove
      </Button>
    </Collapse>
  );
};

type ArgsFieldArrayProps = {
  argSpecs: Array<Apps.AppArgSpec>;
  name: string;
  argType: string;
};

export const ArgsFieldArray: React.FC<ArgsFieldArrayProps> = ({
  argSpecs,
  name,
  argType,
}) => {
  const [field] = useField(name);
  const args = useMemo(
    () => (field.value as Array<Apps.AppArgSpec>) ?? [],
    [field]
  );
  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div className={fieldArrayStyles.array}>
          <h3>{`${argType}s`}</h3>
          <div className={fieldArrayStyles['array-group']}>
            {args.map((arg, index) => {
              const inputMode = arg.name
                ? getArgMode(arg.name, argSpecs)
                : undefined;
              return (
                <ArgField
                  index={index}
                  arrayHelpers={arrayHelpers}
                  name={`${name}.${index}`}
                  argType={argType}
                  inputMode={inputMode}
                />
              );
            })}
          </div>
          <Button
            onClick={() =>
              arrayHelpers.push({
                include: true,
              })
            }
            size="sm"
          >
            + Add
          </Button>
        </div>
      )}
    />
  );
};

export const argsSchema = Yup.array(
  Yup.object({
    name: Yup.string(),
    description: Yup.string(),
    include: Yup.boolean(),
    arg: Yup.string().min(1).required('The argument cannot be blank'),
  })
);

export const Args: React.FC = () => {
  const { values } = useFormikContext();

  const appArgSpecs = useMemo(
    () =>
      (values as Partial<Apps.ReqPostApp>).jobAttributes?.parameterSet
        ?.appArgs ?? [],
    [values]
  );
  const containerArgSpecs = useMemo(
    () =>
      (values as Partial<Apps.ReqPostApp>).jobAttributes?.parameterSet
        ?.containerArgs ?? [],
    [values]
  );

  return (
    <div>
      {/* delete? */}
      <ArgsFieldArray
        name="jobAttributes.parameterSet.appArgs"
        argType="App Argument"
        argSpecs={appArgSpecs}
      />
      <ArgsFieldArray
        name="jobAttributes.parameterSet.containerArgs"
        argType="Container Argument"
        argSpecs={containerArgSpecs}
      />
    </div>
  );
};

export const assembleArgSpec = (argSpecs: Array<Jobs.JobArgSpec>) =>
  argSpecs.reduce(
    (previous, current) =>
      `${previous}${current.include ? ` ${current.arg}` : ``}`,
    ''
  );

export default Args;
