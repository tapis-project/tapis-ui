import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './PodFunctionBar.module.scss';
import { useLocation } from 'react-router-dom';
import StartPodModal from './StartPodModal';
import RestartPodModal from './RestartPodModal';
import StopPodModal from './StopPodModal';

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
  color?: string;
};

export type ToolbarModalProps = {
  toggle: () => void;
};

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  icon,
  onClick,
  color,
  disabled = true,
  ...rest
}) => {
  return (
    <div>
      <Button
        disabled={disabled}
        onClick={onClick}
        className={styles['toolbar-btn']}
        {...rest}
      >
        {icon && <Icon name={icon}></Icon>}
        <span> {text}</span>
      </Button>
    </div>
  );
};

const PodFunctionBar: React.FC = () => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { pathname } = useLocation();

  const toggle = () => {
    setModal(undefined);
  };

  return (
    <div id="file-operation-toolbar">
      {pathname && (
        <div className={styles['toolbar-wrapper']}>
          <ToolbarButton
            text="Start"
            icon=""
            color="primary"
            disabled={false}
            onClick={() => setModal('startpod')}
            aria-label="startpod"
          />
          <ToolbarButton
            text="Restart"
            icon=""
            disabled={false}
            onClick={() => setModal('restartpod')}
            aria-label="restartpod"
          />
          <ToolbarButton
            text="Stop"
            icon=""
            disabled={false}
            onClick={() => setModal('stoppod')}
            aria-label="stoppod"
          />

          {modal === 'startpod' && <StartPodModal toggle={toggle} />}
          {modal === 'restartpod' && <RestartPodModal toggle={toggle} />}
          {modal === 'stoppod' && <StopPodModal toggle={toggle} />}
        </div>
      )}
    </div>
  );
};

export default PodFunctionBar;
