import React, { useCallback, useMemo } from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { QueryWrapper, Wizard } from 'tapis-ui/_wrappers';
import { WizardSubmitWrapper } from 'tapis-ui/_wrappers/Wizard';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import {
  generateRequiredFileInputsFromApp,
  fileInputsComplete,
} from 'tapis-api/utils/jobFileInputs';
import {
  generateRequiredFileInputArraysFromApp,
  fileInputArraysComplete,
} from 'tapis-api/utils/jobFileInputArrays';

import { generateJobArgsFromSpec } from 'tapis-api/utils/jobArgs';
import { jobRequiredFieldsComplete } from 'tapis-api/utils/jobRequiredFields';
import { Button } from 'reactstrap';
import { useSubmit } from 'tapis-hooks/jobs';
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import {
  useList as useSystemsList,
  useSchedulerProfiles,
} from 'tapis-hooks/systems';
import { useJobLauncher, JobLauncherProvider } from './components';
import jobSteps from './steps';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};

const generateDefaultValues = ({
  app,
  systems,
}: {
  app?: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
}): Partial<Jobs.ReqSubmitJob> => {
  if (!app) {
    return {};
  }
  const systemDefaultQueue = systems.find(
    (system) => system.id === app.jobAttributes?.execSystemId
  )?.batchDefaultLogicalQueue;
  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
    description: app.description,
    appId: app.id,
    appVersion: app.version,
    archiveOnAppError: app.jobAttributes?.archiveOnAppError ?? true,
    archiveSystemId: app.jobAttributes?.archiveSystemId,
    archiveSystemDir: app.jobAttributes?.archiveSystemDir,
    nodeCount: app.jobAttributes?.nodeCount,
    coresPerNode: app.jobAttributes?.coresPerNode,
    jobType: app.jobType,
    memoryMB: app.jobAttributes?.memoryMB,
    maxMinutes: app.jobAttributes?.maxMinutes,
    isMpi: app.jobAttributes?.isMpi,
    mpiCmd: app.jobAttributes?.mpiCmd,
    cmdPrefix: app.jobAttributes?.cmdPrefix,
    execSystemId: app.jobAttributes?.execSystemId,
    execSystemLogicalQueue:
      app.jobAttributes?.execSystemLogicalQueue ?? systemDefaultQueue,
    fileInputs: generateRequiredFileInputsFromApp(app),
    fileInputArrays: generateRequiredFileInputArraysFromApp(app),
    parameterSet: {
      appArgs: generateJobArgsFromSpec(
        app.jobAttributes?.parameterSet?.appArgs ?? []
      ),
      containerArgs: generateJobArgsFromSpec(
        app.jobAttributes?.parameterSet?.containerArgs ?? []
      ),
      schedulerOptions: generateJobArgsFromSpec(
        app.jobAttributes?.parameterSet?.schedulerOptions ?? []
      ),
      archiveFilter: app.jobAttributes?.parameterSet?.archiveFilter,
      envVariables: app.jobAttributes?.parameterSet?.envVariables,
    },
  };
  return defaultValues;
};

const JobLauncherWizardSubmit: React.FC<{ app: Apps.TapisApp }> = ({ app }) => {
  const { job } = useJobLauncher();
  const isComplete =
    jobRequiredFieldsComplete(job) &&
    fileInputsComplete(app, job.fileInputs ?? []) &&
    fileInputArraysComplete(app, job.fileInputArrays ?? []);
  const { isLoading, error, isSuccess, submit, data } = useSubmit(
    app.id!,
    app.version!
  );
  const onSubmit = useCallback(() => {
    submit(job as Jobs.ReqSubmitJob);
  }, [submit, job]);
  return (
    <WizardSubmitWrapper
      isLoading={isLoading}
      error={error}
      success={
        isSuccess
          ? `Successfully submitted job ${data?.result?.uuid ?? ''}`
          : ''
      }
      title={`Job Submission Summary`}
    >
      <Button disabled={!isComplete} color="primary" onClick={onSubmit}>
        Submit
      </Button>
    </WizardSubmitWrapper>
  );
};

const JobLauncherWizardRender: React.FC = () => {
  const { add, job, app, systems } = useJobLauncher();

  const formSubmit = useCallback(
    (value: Partial<Jobs.ReqSubmitJob>) => {
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

  const steps: Array<WizardStep<Jobs.ReqSubmitJob>> = useMemo(
    () => jobSteps.map(
      (jobStep) => {
        const { generateInitialValues, validateThunk, ...stepProps } = jobStep;
        return {
          initialValues: generateInitialValues({ job, app, systems }),
          validate: validateThunk ? validateThunk({ job, app, systems }) : undefined,
          ...stepProps
        } 
      }
    ),
    [ app, job, systems ]
  )
  /*
  const steps: Array<WizardStep<Jobs.ReqSubmitJob>> = useMemo(() => [
    {
      id: 'schedulerOptions',
      name: 'Scheduler Options',
      render: <SchedulerOptions />,
      summary: <SchedulerOptionsSummary />,
    },
    {
      id: 'archiving',
      name: 'Archiving',
      render: <Archive />,
      summary: <ArchiveSummary />,
    },
    {
      id: 'jobJson',
      name: 'Job JSON',
      render: <JobJson />,
      summary: <JobJsonSummary />,
      validationSchema: {},
      initialValues: {}
    },
    ],
    [ job, app, systems ]
  );
  */
  return (
    <Wizard
      steps={steps}
      memo={`${app.id}${app.version}`}
      renderSubmit={<JobLauncherWizardSubmit app={app} />}
      formSubmit={formSubmit}
    />
  )
}

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
    () => generateDefaultValues({ app, systems }),
    [app, systems]
  );

  return (
    <QueryWrapper
      isLoading={isLoading || systemsIsLoading || schedulerProfilesIsLoading}
      error={error || systemsError || schedulerProfilesError}
    >
      {app && (
        <JobLauncherProvider value={{ app, systems, defaultValues, schedulerProfiles }}>
          <JobLauncherWizardRender />
        </JobLauncherProvider>
      )}
    </QueryWrapper>
  );
};

export default JobLauncherWizard;
