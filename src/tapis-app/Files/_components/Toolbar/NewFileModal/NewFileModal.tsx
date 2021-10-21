import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';

const NewFileModal: React.FC<ToolbarModalProps> = ({
  toggle,
  isOpen = false,
}) => {
  const { pathname } = useLocation()

  return (
    <GenericModal
      isOpen={isOpen}
      toggle={toggle}
      title="New Folder"
      body={
        <div>
          <form id="newfolder-form" onSubmit={() => {alert("Form submitted")}}>
            <FieldWrapper
              label="Folder name"
              required={true}
              description={`New folder in ${pathname}`}
            >
              <Input bsSize="sm" />
            </FieldWrapper>
          </form>
        </div>
      }
      footer={
        <Button
          form="newfolder-form"
          color="primary">
            Create folder
          </Button>
      }
    />
  );
};

export default NewFileModal;
