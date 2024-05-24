import React from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { DescriptionList } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';

const SystemDetail: React.FC<{
  transferTaskId: string;
  className?: string;
}> = ({ transferTaskId, className = '' }) => {
  const { data, isLoading, error } = Hooks.Transfers.useDetails(transferTaskId);
  const task: Files.TransferTask | undefined = data?.result;
  return (
    <QueryWrapper isLoading={isLoading} error={error} className={className}>
      <h3>{task?.tag ?? task?.id}</h3>
      {task && <DescriptionList data={task} />}
    </QueryWrapper>
  );
};

export default SystemDetail;
