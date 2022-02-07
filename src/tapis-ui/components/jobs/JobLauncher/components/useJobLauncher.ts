import { useState } from 'react';
import { Jobs, Apps } from '@tapis/tapis-typescript';
import withBuilder from 'tapis-ui/utils/withBuilder';

const { useBuilderContext, Provider } = withBuilder<Jobs.ReqSubmitJob>();

export const useJobLauncher = () => {
  const { data, add, set, clear } = useBuilderContext();
  return {
    job: data,
    add,
    set,
    clear,
  };
};

export const JobLauncherProvider = Provider;

export default useJobLauncher;
