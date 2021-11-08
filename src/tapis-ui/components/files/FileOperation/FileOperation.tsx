import React, { useCallback, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon, InfiniteScrollTable } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Row, Column, CellProps } from 'react-table';
import sizeFormat from 'utils/sizeFormat';
import { Button } from 'reactstrap';
import { formatDateTimeFromValue } from 'utils/timeFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckSquare,
  faSquare as filledSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { useStat, usePermissions } from 'tapis-hooks/files';
import { useTapisConfig } from 'tapis-hooks';
import { DescriptionList } from 'tapis-ui/_common';
import { useForm } from 'react-hook-form';
import { FieldWrapper } from 'tapis-ui/_common';
import { Input } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import styles from './FileStat.module.scss';

type FileOperationProps = {
  systemId: string;
  path: string;
  className?: string;
}

const FileOperation: React.FC<FileOperationProps> = ({
  systemId,
  path,
  className = ''
}) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Files.RunLinuxNativeOpRequest>({
    defaultValues: {
      systemId,
      path,
      nativeLinuxOpRequest: {
        operation: Files.NativeLinuxOpRequestOperationEnum.Chmod,
        argument: ''
      },
    },
  });

  const { ref: operationRef, ...operationFieldProps } = register('nativeLinuxOpRequest.operation');
  const { ref: argumentRef, ...argumentFieldProps } = register('nativeLinuxOpRequest.argument');

  const onSubmit = useCallback(
    (data: Files.RunLinuxNativeOpRequest) => {
      console.log(data);
    },
    []
  );

  return (
    <form id="nativeoperation-form" onSubmit={handleSubmit(onSubmit)} className={className}>
      <FieldWrapper
        label="Linux Operation"
        required={true}
        description="Native operation to execute"
        error={errors.nativeLinuxOpRequest?.operation}
      >
        <Input bsSize="sm" type="select" id="operationSelect"
          {...operationFieldProps}
          innerRef={operationRef}
          aria-label="Operation"
        >
          <option value={Files.NativeLinuxOpRequestOperationEnum.Chmod}>CHMOD</option>
          <option value={Files.NativeLinuxOpRequestOperationEnum.Chown}>CHOWN</option>
          <option value={Files.NativeLinuxOpRequestOperationEnum.Chgrp}>CHGRP</option>
        </Input>
      </FieldWrapper>
      <FieldWrapper
        label="Arguments"
        required={false}
        description="Arguments for the native file operation"
        error={errors.nativeLinuxOpRequest?.operation}
      >
        <Input bsSize="sm" id="argumentInput"
          {...argumentFieldProps}
          innerRef={argumentRef}
          aria-label="Arguments" />
      </FieldWrapper>
      <SubmitWrapper
          isLoading={false}
          error={null}
          success={true ? `Successfully submitted operation` : ''}
          reverse={true}
        >
          <Button
            form="nativeoperation-form"
            color="primary"
            disabled={false}
            aria-label="Submit"
            type="submit"
          >
            Run Operation
          </Button>
        </SubmitWrapper>
    </form>
  )

};

export default FileOperation;
