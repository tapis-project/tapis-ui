import React, { useCallback, useMemo } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from '../../../../ui';
import { FieldArray, useField, useFormikContext } from 'formik';
import { getArgMode } from '../../../../utils/jobArgs';
import { ArgField, argsSchema, assembleArgSpec } from './AppArgs';
import { DescriptionList } from '../../../../ui';
import * as Yup from 'yup';
import styles from './SchedulerOptions.module.scss';
import { JobStep } from '..';

const findSchedulerProfile = (values: Partial<Jobs.ReqSubmitJob>) => {
  // Look at current schedulerOptions
  const argSpecs = values.parameterSet?.schedulerOptions ?? [];
  // Find any scheduler option that has --tapis-profile set
  const profile = argSpecs.find((argSpec) =>
    argSpec.arg?.includes('--tapis-profile')
  );
  if (profile) {
    // Return the name of the profile after --tapis-profile
    const args = profile.arg?.split(' ');
    if (args && args.length >= 2) {
      return args[1];
    }
  }
  return undefined;
};

const SchedulerProfiles: React.FC = () => {
  const { schedulerProfiles } = useJobLauncher();
  const { values, setValues } = useFormikContext();
  const setSchedulerProfile = useCallback(
    (newProfile: Jobs.JobArgSpec) => {
      const argSpecs =
        (values as Partial<Jobs.ReqSubmitJob>).parameterSet?.schedulerOptions ??
        [];
      setValues({
        parameterSet: {
          schedulerOptions: [
            newProfile,
            ...argSpecs.filter(
              (existing) => !existing.arg?.includes('--tapis-profile')
            ),
          ],
        },
      });
    },
    [values, setValues]
  );
  const currentProfile = useMemo(
    () => findSchedulerProfile(values as Partial<Jobs.ReqSubmitJob>),
    [values]
  );

  return (
    <div className={fieldArrayStyles.array}>
      <h3>Scheduler Profiles</h3>
      {schedulerProfiles.map(
        ({ name, description, hiddenOptions, moduleLoads, owner, tenant }) => (
          <Collapse
            key={`scheduler-profiles-${name}`}
            className={fieldArrayStyles['array-group']}
            title={`${name} ${name === currentProfile ? '(selected)' : ''}`}
          >
            <div className={styles['scheduler-option']}>
              <div>{description}</div>
              <DescriptionList
                data={{
                  moduleLoads,
                  hiddenOptions,
                  owner,
                  tenant,
                }}
                className={styles['scheduler-option-list']}
              />
            </div>
            <Button
              size="sm"
              onClick={() =>
                setSchedulerProfile({
                  name: `${name} Scheduler Profile`,
                  description,
                  include: true,
                  arg: `--tapis-profile ${name}`,
                })
              }
              disabled={name === currentProfile}
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
  const [field] = useField('parameterSet.schedulerOptions');
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
            <div className={fieldArrayStyles['array-group']}>
              {args.map((arg, index) => {
                const inputMode = arg.name
                  ? getArgMode(arg.name, schedulerOptionSpecs)
                  : undefined;
                return (
                  <ArgField
                    index={index}
                    arrayHelpers={arrayHelpers}
                    name={`parameterSet.schedulerOptions.${index}`}
                    argType={'scheduler option'}
                    inputMode={inputMode}
                  />
                );
              })}
            </div>
            <Button
              onClick={() =>
                arrayHelpers.push({
                  name: '',
                  description: '',
                  include: true,
                  arg: '',
                })
              }
              size="sm"
            >
              + Add
            </Button>
          </div>
          <SchedulerProfiles />
        </>
      )}
    />
  );
};

export const SchedulerOptions: React.FC = () => {
  return (
    <div>
      <h2>Scheduler Options</h2>
      <SchedulerOptionArray />
    </div>
  );
};

export const SchedulerOptionsSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const schedulerOptions = job.parameterSet?.schedulerOptions ?? [];
  return (
    <div>
      <StepSummaryField
        field={`Scheduler Profile: ${
          findSchedulerProfile(job) ?? 'none selected'
        }`}
        key={`scheduler-profile-summary`}
      />
      <StepSummaryField
        field={`Scheduler Args: ${assembleArgSpec(schedulerOptions)}`}
        key={`scheduler-args-summary`}
      />
    </div>
  );
};

const validationSchema = Yup.object().shape({
  parameterSet: Yup.object({
    scheduleOptions: argsSchema,
  }),
});

const step: JobStep = {
  id: 'schedulerOptions',
  name: 'Scheduler Options',
  render: <SchedulerOptions />,
  summary: <SchedulerOptionsSummary />,
  validationSchema,
  generateInitialValues: ({ job }) => ({
    parameterSet: {
      schedulerOptions: job.parameterSet?.schedulerOptions,
    },
  }),
};

export default step;
