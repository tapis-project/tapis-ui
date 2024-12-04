import React from 'react';
import { GenericModal } from '../../ui';
import styles from './TooltipModal.module.scss';

export type TooltipModalProps = {
  toggle: () => void;
};

const TooltipModal: React.FC<
  TooltipModalProps & { tooltipText: string; tooltipTitle?: string }
> = ({ toggle, tooltipText, tooltipTitle = 'default tooltip title' }) => {
  return (
    <GenericModal
      toggle={toggle}
      title={tooltipTitle}
      backdrop={true}
      size="sm"
      body={
        <div className={`${styles['modal-settings']} ${styles['pre-wrap']}`}>
          {tooltipText}
        </div>
      }
    />
  );
};

export default TooltipModal;
