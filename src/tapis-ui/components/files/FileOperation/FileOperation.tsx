import React, { useCallback, useEffect } from 'react';
import { useNativeOp } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Button, FormGroup, Label } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { FieldWrapper } from 'tapis-ui/_common';
import { Input } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { NativeOpParams } from 'tapis-hooks/files';
import { focusManager } from 'react-query';

type FileOperationProps = {
  systemId: string;
  path: string;
  className?: string;
};

const FileOperation: React.FC<FileOperationProps> = ({
  systemId,
  path,
  className = '',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NativeOpParams>({
    defaultValues: {
      systemId,
      path,
      recursive: false,
      operation: Files.NativeLinuxOpRequestOperationEnum.Chmod,
      argument: '',
    },
  });

  const onSuccess = useCallback(() => {
    focusManager.setFocused(true);
  }, []);

  const { nativeOp, isLoading, error, isSuccess, reset } = useNativeOp();

  useEffect(() => {
    reset();
  }, [reset]);

  const { ref: recursiveRef, ...recursiveFieldProps } = register('recursive');
  const { ref: operationRef, ...operationFieldProps } = register('operation');
  const { ref: argumentRef, ...argumentFieldProps } = register('argument');

  const onSubmit = useCallback(
    (data: NativeOpParams) => {
      nativeOp(data, { onSuccess });
    },
    [nativeOp, onSuccess]
  );

  return (
    <form
      id="nativeoperation-form"
      onSubmit={handleSubmit(onSubmit)}
      className={className}
    >
      <FieldWrapper
        label="Linux Operation"
        required={true}
        description="Native operation to execute"
        error={errors.operation}
      >
        <Input
          bsSize="sm"
          type="select"
          id="operationSelect"
          {...operationFieldProps}
          innerRef={operationRef}
          aria-label="Operation"
        >
          <option value={Files.NativeLinuxOpRequestOperationEnum.Chmod}>
            CHMOD
          </option>
          <option value={Files.NativeLinuxOpRequestOperationEnum.Chown}>
            CHOWN
          </option>
          <option value={Files.NativeLinuxOpRequestOperationEnum.Chgrp}>
            CHGRP
          </option>
        </Input>
      </FieldWrapper>
      <FieldWrapper
        label="Arguments"
        required={false}
        description="Arguments for the native file operation"
        error={errors.argument}
      >
        <Input
          bsSize="sm"
          id="argumentInput"
          {...argumentFieldProps}
          innerRef={argumentRef}
          aria-label="Arguments"
        />
      </FieldWrapper>
      <FormGroup check>
        <Label check>
          <Input
            type="checkbox"
            id="recursive"
            {...recursiveFieldProps}
            innerRef={recursiveRef}
            aria-label="Recursive"
          />{' '}
          Run operation recursively
        </Label>
      </FormGroup>
      <SubmitWrapper
        isLoading={isLoading}
        error={error}
        success={isSuccess ? `Successfully submitted operation` : ''}
      >
        <Button
          form="nativeoperation-form"
          color="primary"
          disabled={isLoading || isSuccess}
          aria-label="Submit"
          type="submit"
        >
          Run Operation
        </Button>
      </SubmitWrapper>
    </form>
  );
};

export default FileOperation;
