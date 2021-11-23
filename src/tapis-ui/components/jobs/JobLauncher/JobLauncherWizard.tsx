import React, { useReducer } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useDetail } from 'tapis-hooks/apps';

import StepWizard from 'react-step-wizard';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import AppSelectStep from './AppSelectStep';
import FileInputsStep from './FileInputsStep';

interface JobLauncherProps {
  appId: string;
  appVersion: string;
  name: string;
  execSystemId?: string;
}

const JobLauncherWizard: React.FC<JobLauncherProps> = ({ appId, appVersion, name, execSystemId }) => {
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

  const reducer = (state: Partial<Jobs.ReqSubmitJob>, fragment: Partial<Jobs.ReqSubmitJob>) => {
    return { ...state, ...fragment }
  }
  const [ jobSubmission, dispatch ] = useReducer(reducer, {} as Partial<Jobs.ReqSubmitJob>);
  console.log("Current job submission state", jobSubmission);
  return (
    <StepWizard>
      <AppSelectStep app={app} name={name} systems={systems} execSystemId={execSystemId} dispatch={dispatch} />
      <FileInputsStep app={app} systems={systems} dispatch={dispatch} />
    </StepWizard>
  )
}

export default JobLauncherWizard;