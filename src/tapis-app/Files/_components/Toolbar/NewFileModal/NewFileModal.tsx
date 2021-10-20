import { Button } from 'reactstrap';
import { GenericModal } from 'tapis-ui/_common';
import { ToolbarModalProps } from '../Toolbar';

const NewFileModal: React.FC<ToolbarModalProps> = ({
  toggle,
  isOpen = false,
}) => {
  return (
    <GenericModal
      isOpen={isOpen}
      toggle={toggle}
      title="New Folder"
      body={<Button>Test</Button>}
      footer={<Button>Test</Button>}
    />
  );
};

export default NewFileModal;
