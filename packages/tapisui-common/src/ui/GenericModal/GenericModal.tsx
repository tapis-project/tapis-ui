import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export type GenericModalProps = {
  toggle: () => void;
  title: string;
  body: React.ReactNode;
  footer?: React.ReactNode;
  [key: string]: any;
};

const GenericModal: React.FC<GenericModalProps> = ({
  toggle,
  title,
  body,
  footer,
  ...props
}) => {
  return (
    <Modal
      backdrop={true} // Set to "static" to prevent closing on click outside
      keyboard={true}
      isOpen={true}
      toggle={toggle}
      // Bootstrap's default (1050) sits UNDER MUI's modal layer (1300), so a
      // reactstrap modal opened from a MUI dialog — the launcher's file
      // picker — rendered behind the thing that opened it. 1350 clears MUI
      // dialogs while staying under its snackbar (1400) and tooltip (1500).
      zIndex={1350}
      {...props}
    >
      <ModalHeader toggle={toggle} charCode="&#x2715;">
        <span>{title}</span>
      </ModalHeader>
      <ModalBody>{body}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </Modal>
  );
};

export default GenericModal;
