import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import { Icon } from '..';
import styles from './GenericModal.module.scss'

type ModalProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
  body: any;
  footer?: React.PropsWithChildren<{}>;
};

const GenericModal: React.FC<ModalProps> = ({
  isOpen = false,
  toggle,
  title,
  body,
  footer,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader>
        <span className={styles.header}>
          <span style={{"textAlign": "left"}}>{title}</span>
          <span style={{"textAlign": "right"}} className={styles.close} onClick={toggle}>
            <Icon name="close" />
          </span>
        </span>
      </ModalHeader>
      <ModalBody>{body.children}</ModalBody>
      {footer && <ModalFooter>{footer.children}</ModalFooter>}
    </Modal>
  );
};

export default GenericModal;
