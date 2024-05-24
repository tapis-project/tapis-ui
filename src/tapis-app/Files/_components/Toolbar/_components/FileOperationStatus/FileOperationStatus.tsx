import React from 'react';
import { FileOpEventStatusEnum } from '../../_hooks/useFileOperations';
import { LoadingSpinner, Icon } from '@tapis/tapisui-common';

const FileOperationStatus: React.FC<{ status: FileOpEventStatusEnum }> = ({
  status,
}) => {
  switch (status) {
    case FileOpEventStatusEnum.loading:
      return <LoadingSpinner placement="inline" />;
    case FileOpEventStatusEnum.success:
      return <Icon name="approved-reverse" className="success" />;
    case FileOpEventStatusEnum.error:
      return <Icon name="alert" />;
  }
  return <div>Unknown status!</div>;
};

export default FileOperationStatus;
