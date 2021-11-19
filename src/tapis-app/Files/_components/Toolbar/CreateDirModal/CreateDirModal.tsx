import { useCallback } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useForm } from 'react-hook-form';
import { useMkdir } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useEffect } from 'react';

const CreateDirModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId,
  path,
}) => {
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const { mkdir, isLoading, error, isSuccess, reset } = useMkdir();

  useEffect(() => {
    reset();
  }, [reset]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { ref: dirnameRef, ...dirnameFieldProps } = register('dirname', {
    required: 'Directory name is a required field',
    maxLength: {
      value: 255,
      message: 'Directory name cannot be longer than 255 characters',
    },
    pattern: {
      value: /[a-zA-Z0-9_.-]+/,
      message:
        "Must contain only alphanumeric characters and the following: '.', '_', '-'",
    },
    disabled: isSuccess,
  });

  const onSubmit = ({ dirname }: { dirname: string }) =>
    mkdir(systemId ?? '', `${path ?? '/'}${dirname}`, { onSuccess });

  return (
    <GenericModal
      toggle={toggle}
      title="Create Directory"
      body={
        <div>
          <form id="newdirectory-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper
              label="Directory name"
              required={true}
              description={`Creates a directory in ${systemId}/${path}`}
              error={errors['dirname']}
            >
              <Input
                bsSize="sm"
                {...dirnameFieldProps}
                innerRef={dirnameRef}
                aria-label="Input"
              />
            </FieldWrapper>
          </form>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created directory` : ''}
          reverse={true}
        >
          <Button
            form="newdirectory-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create directory
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateDirModal;
