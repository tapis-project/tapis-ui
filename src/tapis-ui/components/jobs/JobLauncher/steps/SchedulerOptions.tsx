import React, { useMemo } from "react";
import { Apps, Jobs } from "@tapis/tapis-typescript";
import { Button } from "reactstrap";
import { useJobLauncher, StepSummaryField } from "../components";
import fieldArrayStyles from "../FieldArray.module.scss";
import { Collapse } from "tapis-ui/_common";
import { FieldArray, useField, FieldArrayRenderProps } from "formik";
import { FormikJobStepWrapper } from "../components";
import { FormikInput } from "tapis-ui/_common";
import { FormikCheck } from "tapis-ui/_common/FieldWrapperFormik";
import { getArgMode } from "tapis-api/utils/jobArgs";
import { ArgField, argsSchema } from "./AppArgs";
import * as Yup from "yup";

const SchedulerProfiles: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { schedulerProfiles } = useJobLauncher();
  const { values } = useField("parameterSet.schedulerOptions");
  return (
    <div className={fieldArrayStyles.array}>
      <h3>Scheduler Profiles</h3>
      {schedulerProfiles.map(
        ({
          name,
          description,
          moduleLoadCommand,
          hiddenOptions,
          modulesToLoad,
          owner,
          tenant,
        }) => (
          <Collapse
            key={`scheduler-profiles-${name}`}
            className={fieldArrayStyles["array-group"]}
            title={name}
          >
            <div>{description}</div>
            <Button
              size="sm"
              onClick={() =>
                arrayHelpers.push({
                  name: `${name} Scheduler Profile`,
                  description,
                  include: true,
                  arg: `--tacc-profile ${name}`,
                })
              }
            >
              Use This Profile
            </Button>
          </Collapse>
        )
      )}
    </div>
  );
};

const SchedulerOptionArray: React.FC = () => {
  const { app } = useJobLauncher();
  const [field] = useField("parameterSet.schedulerOptions");
  const args = useMemo(
    () => (field.value as Array<Jobs.JobArgSpec>) ?? [],
    [field]
  );

  const schedulerOptionSpecs = useMemo(
    () => app.jobAttributes?.parameterSet?.schedulerOptions ?? [],
    [app]
  );
  return (
    <FieldArray
      name="parameterSet.schedulerOptions"
      render={(arrayHelpers) => (
        <>
          <div className={fieldArrayStyles.array}>
            <h3>{`Scheduler Arguments`}</h3>
            <div className={fieldArrayStyles["array-group"]}>
              {args.map((arg, index) => {
                const inputMode = arg.name
                  ? getArgMode(arg.name, schedulerOptionSpecs)
                  : undefined;
                return (
                  <ArgField
                    index={index}
                    arrayHelpers={arrayHelpers}
                    name={`parameterSet.schedulerOptions.${index}`}
                    argType={"scheduler option"}
                    inputMode={inputMode}
                  />
                );
              })}
            </div>
            <Button
              onClick={() =>
                arrayHelpers.push({
                  name: "",
                  description: "",
                  include: true,
                  arg: "",
                })
              }
              size="sm"
            >
              + Add
            </Button>
          </div>
          <SchedulerProfiles arrayHelpers={arrayHelpers} />
        </>
      )}
    />
  );
};

export const SchedulerOptions: React.FC = () => {
  const { job, app } = useJobLauncher();

  const validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
      scheduleOptions: argsSchema,
    }),
  });

  const initialValues = useMemo(
    () => ({
      parameterSet: {
        schedulerOptions: job.parameterSet?.schedulerOptions,
      },
    }),
    [job]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <h2>Scheduler Options</h2>
      <SchedulerOptionArray />
    </FormikJobStepWrapper>
  );
};

export const SchedulerOptionsSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const appArgs = job.parameterSet?.appArgs ?? [];
  const containerArgs = job.parameterSet?.containerArgs ?? [];
  const schedulerOptions = job.parameterSet?.schedulerOptions ?? [];
  return (
    <div>
      <StepSummaryField
        field={`App Arguments: ${appArgs.length}`}
        key={`app-args-summary`}
      />
      <StepSummaryField
        field={`Container Arguments: ${containerArgs.length}`}
        key={`container-args-summary`}
      />
      <StepSummaryField
        field={`Scheduler Options: ${schedulerOptions.length}`}
        key={`scheduler-options-summary`}
      />
    </div>
  );
};
