import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { useTapisConfig } from 'tapis-hooks';
import { useForm } from 'react-hook-form';

const NewFileModal: React.FC<ToolbarModalProps> = ({
  toggle,
  isOpen = false,
}) => {
  const { pathname } = useLocation()
  const { accessToken } = useTapisConfig()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { foldername: null } });

  const { ref: foldernameRef, ...foldernameFieldProps } = register('foldername', {
    required: 'Folder name is a required field',
  });

  const onSubmit = ({
    foldername,
  }: {
    foldername: string;
  }) => alert(foldername);

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
              error={errors["foldername"]}
            >
              <Input
                bsSize="sm"
                {...foldernameFieldProps}
                innerRef={foldernameRef}
              />
            </FieldWrapper>
          </form>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={false}
          error={null}
          success={""}
        >
          <Button
            form="newfolder-form"
            color="primary"
            disabled={false}
          >
              Create folder
          </Button>
        </SubmitWrapper>
        
      }
    />
  );
};

export default NewFileModal;
