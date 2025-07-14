import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './PodToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import DeletePodModal from '../Modals/DeletePodModal';
import SavePodAsTagModal from '../Modals/SavePodAsTagModal';
import {
  StartPodModal,
  RestartPodModal,
  StopPodModal,
} from '../PodFunctionBar';
import { useAppDispatch, updateState } from '@redux';

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

export type ToolbarModalProps = {
  toggle: () => void;
};

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  icon,
  onClick,
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

const PodToolbar: React.FC = () => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

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
          <ToolbarButton
            text="Create"
            icon="add"
            disabled={false}
            onClick={() => {
              window.location.href = `/#/pods`;
              dispatch(updateState({ podRootTab: 'createPod' }));
            }}
            aria-label="createPod"
          />
          <ToolbarButton
            text="Save as Tag"
            icon="save"
            disabled={false}
            onClick={() => setModal('savepodastag')}
            aria-label="savePodAsTag"
          />
          <ToolbarButton
            text="Delete"
            icon="trash"
            disabled={false}
            onClick={() => setModal('deletepod')}
            aria-label="deletePod"
          />
          {modal === 'startpod' && <StartPodModal toggle={toggle} />}
          {modal === 'restartpod' && <RestartPodModal toggle={toggle} />}
          {modal === 'stoppod' && <StopPodModal toggle={toggle} />}
          {modal === 'deletepod' && <DeletePodModal toggle={toggle} />}
          {modal === 'savepodastag' && <SavePodAsTagModal toggle={toggle} />}
        </div>
      )}
    </div>
  );
};

export default PodToolbar;
