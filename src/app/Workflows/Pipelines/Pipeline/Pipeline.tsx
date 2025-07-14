import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import styles from './Pipeline.module.scss';
import { DagView } from './_components';
import { EnvTab, ExecutionProfileTab } from './_components/Tabs';
import { ParametersTab } from './_components/Tabs/ParametersTab';
import { InheritenceTab } from './_components/Tabs/InheritenceTab';
import { Workflows as State, useAppDispatch } from '@redux';

type PipelineProps = {
  groupId: string;
  pipelineId: string;
  tab?: string;
};

const Pipeline: React.FC<PipelineProps> = ({
  groupId,
  pipelineId,
  tab = 'tasks',
}) => {
  const dispatch = useAppDispatch();

  const {
    data: pipelineData,
    isLoading: isLoadingPipeline,
    error: pipelineError,
  } = Hooks.Pipelines.useDetails({ groupId, pipelineId });

  const { isLoading: isLoadingGroups, error: isLoadingError } =
    Hooks.Groups.useList({
      onSuccess: (data: Workflows.RespGroupList) => {
        dispatch(State.updateState({ groups: data.result }));
      },
    });

  const pipeline: Workflows.Pipeline = pipelineData?.result!;

  return (
    <QueryWrapper
      isLoading={isLoadingPipeline || isLoadingGroups}
      error={[pipelineError, isLoadingError]}
    >
      {pipeline && (
        <div id={`pipeline`} className={styles['grid']}>
          {tab === 'tasks' && <DagView pipeline={pipeline} groupId={groupId} />}
          {/* {tab === 'env' && <EnvTab pipeline={pipeline} groupId={groupId} />}
          {tab === 'params' && (
            <ParametersTab pipeline={pipeline} groupId={groupId} />
          )}
          {tab === 'execprofile' && (
            <ExecutionProfileTab pipeline={pipeline} groupId={groupId} />
          )}
          {tab === 'uses' && (
            <InheritenceTab pipeline={pipeline} groupId={groupId} />
          )} */}
        </div>
      )}
    </QueryWrapper>
  );
};

export default Pipeline;
