import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMkdir } from 'tapis-hooks/files';

const CreateDirModal: React.FC<ToolbarModalProps> = ({
  toggle,
  isOpen = false,
}) => {
  const { pathname } = useLocation();

  const systemId = pathname.split('/')[2];
  const currentPath = pathname.split('/').splice(3).join('/');
  const { mkdir, isLoading, error } = useMkdir(systemId, currentPath);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { dirname: null } });

  const { ref: dirnameRef, ...dirnameFieldProps } = register('dirname', {
    required: 'Folder name is a required field',
  });

  const onSubmit = ({ dirname }: { dirname: string }) =>
    mkdir({ systemId, mkdirRequest: { path: currentPath + dirname + '/' } });

  return (
    <GenericModal
      isOpen={isOpen}
      toggle={toggle}
      title="New Folder"
      body={
        <div>
          <form id="newfolder-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper
              label="Folder name"
              required={true}
              description={`New folder in ${pathname}`}
              error={errors['dirname']}
            >
              <Input bsSize="sm" {...dirnameFieldProps} innerRef={dirnameRef} />
            </FieldWrapper>
          </form>
        </div>
      }
      footer={
        <SubmitWrapper isLoading={isLoading} error={error} success={''}>
          <Button form="newfolder-form" color="primary" disabled={isLoading}>
            Create folder
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateDirModal;
