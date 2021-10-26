import { useCallback } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMkdir } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useEffect } from 'react';

const RenameModal: React.FC<ToolbarModalProps> = ({ toggle }) => {

  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  // const { mkdir, isLoading, error, isSuccess, reset } = useMkdir();

  // useEffect(() => {
  //   reset();
  // }, [reset]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { ref: nameRef, ...nameFieldProps } = register('name', {
    required: 'Name is a required field',
    maxLength: {
      value: 255,
      message: 'Name cannot be longer than 255 characters',
    },
    pattern: {
      value: /[a-zA-Z0-9_.-]+/,
      message:
        "Must contain only alphanumeric characters and the following: '.', '_', '-'",
    },
    disabled: false/** isSuccess */,
  });

  const onSubmit = ({ name }: { name: string }) => {
    /**
     * @TODO Call rename function returned from rename hook
     */
  }

  return (
    <GenericModal
      toggle={toggle}
      title="Rename"
      body={
        <div>
          <form id="rename-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper
              label="Name"
              required={true}
              description={`Renames a file or directory`}
              error={errors['name']}
            >
              <Input
                bsSize="sm"
                {...nameFieldProps}
                innerRef={nameRef}
                aria-label="Input"
              />
            </FieldWrapper>
          </form>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={false}
          error={null}
          success={false ? `Successfully renamed` : ''}
          reverse={true}
        >
          <Button
            form="rename-form"
            color="primary"
            disabled={false/*isLoading || isSuccess*/}
            aria-label="Submit"
            type="submit"
          >
            Rename
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default RenameModal;
