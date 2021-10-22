import { useCallback } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMkdir } from 'tapis-hooks/files';
import { focusManager } from 'react-query'

const CreateDirModal: React.FC<ToolbarModalProps> = ({
  toggle,
  isOpen = false,
}) => {
  const { pathname } = useLocation();

  const systemId = pathname.split('/')[2];
  const currentPath = pathname.split('/').splice(3).join('/');
  
  const onSuccess = useCallback(
    () => {
      focusManager.setFocused(true);
    },
    [ focusManager ]
  );

  const { mkdir, isLoading, error } = useMkdir();

  const formInitialState = { dirname: null }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues: formInitialState });

  const { ref: dirnameRef, ...dirnameFieldProps } = register('dirname', {
    required: 'Directory name is a required field',
  });

  const onSubmit = ({ dirname }: { dirname: string }) =>
    mkdir(systemId, `${currentPath}${dirname}`, { onSuccess });

  return (
    <GenericModal
      isOpen={isOpen}
      toggle={() => {
        reset(formInitialState);
        toggle();
      }}
      title="New Directory"
      body={
        <div>
          <form id="newdirectory-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper
              label="Directory name"
              required={true}
              description={`New directory in ${systemId}/${currentPath}`}
              error={errors['dirname']}
            >
              <Input bsSize="sm" {...dirnameFieldProps} innerRef={dirnameRef} />
            </FieldWrapper>
          </form>
        </div>
      }
      footer={
        <SubmitWrapper isLoading={isLoading} error={error} success={''}>
          <Button form="newdirectory-form" color="primary" disabled={isLoading}>
            Create directory
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateDirModal;
