import React, { useCallback, useEffect } from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { SubmitWrapper, QueryWrapper } from '../../../wrappers';
import { focusManager } from 'react-query';

type TransferCancelProps = {
  transferTaskId: string;
  className?: string;
};

const FileOperation: React.FC<TransferCancelProps> = ({
  transferTaskId,
  className = '',
}) => {
  const {
    data,
    isLoading: detailsIsLoading,
    error: detailsError,
  } = Hooks.Transfers.useDetails(transferTaskId);

  const transfer: Files.TransferTask | undefined = data?.result;
  const cancelableStatuses = [
    Files.TransferTaskStatusEnum.Accepted,
    Files.TransferTaskStatusEnum.InProgress,
    Files.TransferTaskStatusEnum.Paused,
    Files.TransferTaskStatusEnum.Staged,
    Files.TransferTaskStatusEnum.Staging,
  ];
  const cancelable = cancelableStatuses.some(
    (status) => status === transfer?.status
  );

  const { cancel, isLoading, error, isSuccess, reset } =
    Hooks.Transfers.useCancel();

  const onClick = useCallback(() => {
    cancel(transferTaskId);
    focusManager.setFocused(true);
  }, [cancel, transferTaskId]);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <QueryWrapper
      isLoading={detailsIsLoading}
      error={detailsError}
      className={className}
    >
      <div>
        Transfer task {transferTaskId} is {transfer?.status}
      </div>
      <SubmitWrapper
        isLoading={isLoading}
        error={error}
        success={isSuccess ? `Successfully canceled transfer` : ''}
        reverse
      >
        <Button
          color="warning"
          disabled={!cancelable || isLoading || isSuccess}
          aria-label="Cancel"
          type="submit"
          onClick={onClick}
        >
          Cancel Transfer
        </Button>
      </SubmitWrapper>
    </QueryWrapper>
  );
};

export default FileOperation;
