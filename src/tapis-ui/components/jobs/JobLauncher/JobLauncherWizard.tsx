import React, { useReducer } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useDetail } from 'tapis-hooks/apps';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import AppSelectStep from './AppSelectStep';
import FileInputsStep from './FileInputsStep';

type StepWrapperProps = React.PropsWithChildren<{
  dispatch: React.Dispatch<Partial<Jobs.ReqSubmitJob>>;
}> &
  Partial<StepWizardChildProps>;

const StepWrapper: React.FC<StepWrapperProps> = ({
  dispatch,
  children,
  previousStep,
  nextStep,
}) => {
  const formMethods = useForm<Jobs.ReqSubmitJob>();
  const { handleSubmit } = formMethods;
  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(dispatch)}>
        {children}
        <Button className="btn btn-secondary" onClick={previousStep}>
          Previous
        </Button>
        <Button type="submit" className="btn btn-primary" onClick={nextStep}>
          Next
        </Button>
      </form>
    </FormProvider>
  );
};

interface JobLauncherProps {
  appId: string;
  appVersion: string;
  name: string;
  execSystemId?: string;
}

const JobLauncherWizard: React.FC<JobLauncherProps> = ({
  appId,
  appVersion,
  name,
  execSystemId,
}) => {
  const {
    data: respSystems,
    isLoading: systemsLoading,
    error: systemsError,
  } = useList();
  const {
    data: respApp,
    isLoading: appLoading,
    error: appError,
  } = useDetail({
    appId,
    appVersion,
    select: 'jobAttributes',
  });

  const app = respApp?.result;
  const systems = respSystems?.result ?? [];

  const reducer = (
    state: Partial<Jobs.ReqSubmitJob>,
    fragment: Partial<Jobs.ReqSubmitJob>
  ) => {
    return { ...state, ...fragment };
  };
  const [jobSubmission, dispatch] = useReducer(
    reducer,
    {} as Partial<Jobs.ReqSubmitJob>
  );
  console.log('Current job submission state', jobSubmission);
  return (
    <QueryWrapper isLoading={appLoading || systemsLoading} error={appError ?? systemsError}>
      <StepWizard>
        <StepWrapper dispatch={dispatch}>
          <AppSelectStep
            app={app}
            name={name}
            systems={systems}
            execSystemId={execSystemId}
          />
        </StepWrapper>
        <StepWrapper dispatch={dispatch}>
          <FileInputsStep app={app} systems={systems} />
        </StepWrapper>
      </StepWizard>
    </QueryWrapper>
  );
};

export default JobLauncherWizard;
