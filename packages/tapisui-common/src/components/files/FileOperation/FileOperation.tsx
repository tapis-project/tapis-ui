import React, { useCallback, useEffect } from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { Form, Formik } from 'formik';
import {
  FormikInput,
  FormikSelect,
  FormikCheck,
} from '../../../ui-formik/FieldWrapperFormik';
import { SubmitWrapper } from '../../../wrappers';
import { focusManager } from 'react-query';
import * as Yup from 'yup';

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
  const onSuccess = useCallback(() => {
    focusManager.setFocused(true);
  }, []);

  const { nativeOp, isLoading, error, isSuccess, reset } = Hooks.useNativeOp();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    recursive: Yup.boolean(),
    operation: Yup.string().required('An operation is required'),
    argument: Yup.string(),
  });

  const initialValues = {
    recursive: false,
    operation: Files.NativeLinuxOpRequestOperationEnum.Chmod,
    argument: '',
  };

  const onSubmit = useCallback(
    ({
      recursive,
      operation,
      argument,
    }: {
      recursive: boolean;
      operation: Files.NativeLinuxOpRequestOperationEnum;
      argument: string;
    }) => {
      nativeOp(
        { systemId, path, recursive, operation, argument },
        { onSuccess }
      );
    },
    [nativeOp, onSuccess, systemId, path]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form className={className}>
        <FormikSelect
          name="operation"
          label="Linux Operation"
          required={true}
          description="Native operation to execute"
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
        </FormikSelect>
        <FormikInput
          name="argument"
          label="Arguments"
          required={false}
          description="Arguments for the native file operation"
          aria-label="Arguments"
        />
        <FormikCheck
          name="recursive"
          label="Recursive"
          required={false}
          description="Run operation recursively"
          aria-label="Recursive"
        />
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully submitted operation` : ''}
        >
          <Button
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Run Operation
          </Button>
        </SubmitWrapper>
      </Form>
    </Formik>
  );
};

export default FileOperation;
