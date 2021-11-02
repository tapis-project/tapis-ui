import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export type GenericModalProps = {
  toggle: () => void;
  title: string;
  body: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
};

const GenericModal: React.FC<GenericModalProps> = ({
  toggle,
  title,
  body,
  footer,
  /**
   * @NOTE contentClassName is the means by which you can change the style
   * of the modal content of a reactstrap Modal. However, it is not found in the
   * documentation.
   */
  contentClassName,
}) => {
  return (
    <Modal isOpen={true} toggle={toggle} contentClassName={contentClassName}>
      <ModalHeader toggle={toggle} charCode="&#x2715;">
        <span>{title}</span>
      </ModalHeader>
      <ModalBody>{body}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </Modal>
  );
};

export default GenericModal;
