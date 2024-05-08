import React, { useCallback, useMemo } from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { QueryWrapper, Wizard } from 'tapis-ui/_wrappers';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import generateJobDefaults from 'tapis-api/utils/jobDefaults';
import {
  useList as useSystemsList,
  useSchedulerProfiles,
} from 'tapis-hooks/systems';
import { useJobLauncher, JobLauncherProvider } from './components';
import { JobStep } from '.';
import jobSteps from './steps';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};

export const JobLauncherWizardRender: React.FC<{
  jobSteps: Array<JobStep>;
}> = ({ jobSteps }) => {
  const { add, job, app, systems } = useJobLauncher();

  const formSubmit = useCallback(
    (value: Partial<Jobs.ReqSubmitJob>) => {
      if (value.jobType === Apps.JobTypeEnum.Fork) {
        value.execSystemLogicalQueue = undefined;
      }
      if (value.isMpi) {
        value.cmdPrefix = undefined;
      } else {
        value.mpiCmd = undefined;
      }
      if (value.parameterSet) {
        value.parameterSet = {
          ...job.parameterSet,
          ...value.parameterSet,
        };
      }
      add(value);
    },
    [add, job]
  );

  // Map Array of JobSteps into an array of WizardSteps
  const steps: Array<WizardStep<Jobs.ReqSubmitJob>> = useMemo(() => {
    return jobSteps.map((jobStep) => {
      const { generateInitialValues, validateThunk, ...stepProps } = jobStep;
      return {
        initialValues: generateInitialValues({ job, app, systems }),
        // generate a validation function from the JobStep's validateThunk, given the current hook values
        validate: validateThunk
          ? validateThunk({ job, app, systems })
          : undefined,
        ...stepProps,
      };
    });
  }, [app, job, systems, jobSteps]);

  return (
    <Wizard
      steps={steps}
      memo={`${app.id}${app.version}`}
      formSubmit={formSubmit}
    />
  );
};

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({
  appId,
  appVersion,
}) => {
  const { data, isLoading, error } = useAppDetail(
    { appId, appVersion },
    { refetchOnWindowFocus: false }
  );
  const {
    data: systemsData,
    isLoading: systemsIsLoading,
    error: systemsError,
  } = useSystemsList(
    { select: 'allAttributes' },
    { refetchOnWindowFocus: false }
  );
  const {
    data: schedulerProfilesData,
    isLoading: schedulerProfilesIsLoading,
    error: schedulerProfilesError,
  } = useSchedulerProfiles({ refetchOnWindowFocus: false });
  const app = data?.result;
  const systems = useMemo(() => systemsData?.result ?? [], [systemsData]);
  const schedulerProfiles = useMemo(
    () => schedulerProfilesData?.result ?? [],
    [schedulerProfilesData]
  );
  const defaultValues = useMemo(
    () => generateJobDefaults({ app, systems }),
    [app, systems]
  );

  return (
    <QueryWrapper
      isLoading={isLoading || systemsIsLoading || schedulerProfilesIsLoading}
      error={error || systemsError || schedulerProfilesError}
    >
      {app && (
        <JobLauncherProvider
          value={{ app, systems, defaultValues, schedulerProfiles }}
        >
          <JobLauncherWizardRender jobSteps={jobSteps} />
        </JobLauncherProvider>
      )}
    </QueryWrapper>
  );
};

export default JobLauncherWizard;
