import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

type CreateUserCredentialModalProps = {
  toggle: () => void;
  isOpen: boolean;
};

const CreateUserCredentialModal: React.FC<CreateUserCredentialModalProps> = ({
  toggle,
  isOpen,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create User Credential</ModalHeader>
      <ModalBody>{/* Form inputs and logic here */}</ModalBody>
    </Modal>
  );
};

export default CreateUserCredentialModal;
