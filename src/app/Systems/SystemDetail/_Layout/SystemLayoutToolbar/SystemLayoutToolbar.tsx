import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Icon } from '@tapis/tapisui-common';
import styles from './SystemLayoutToolbar.module.scss';
import { useLocation } from 'react-router-dom';
import ShareSystemPublicModal from './ShareSystemPublicModal';
import UnShareSystemPublicModal from './UnShareSystemPublicModal';
import CreateChildSystemModal from './CreateChildSystemModal';

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
        <Icon name={icon}></Icon>
        <span> {text}</span>
      </Button>
    </div>
  );
};

const SystemLayoutToolbar: React.FC = () => {
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
            text="Share System Publicly"
            icon="unlock"
            disabled={false}
            onClick={() => setModal('sharesystempublic')}
            aria-label="shareSystemPublic"
          />
          <ToolbarButton
            text="UnShare System Publicly"
            icon="lock"
            disabled={false}
            onClick={() => setModal('unsharesystempublic')}
            aria-label="unShareSystemPublic"
          />
          <ToolbarButton
            text="Create Child System"
            icon="add"
            disabled={false}
            onClick={() => setModal('ConfirmModal-CreateChildSystem')}
            aria-label="unShareSystemPublic"
          />
          {modal === 'sharesystempublic' && (
            <ShareSystemPublicModal toggle={toggle} />
          )}
          {modal === 'unsharesystempublic' && (
            <UnShareSystemPublicModal toggle={toggle} />
          )}
          {modal === 'ConfirmModal-CreateChildSystem' && (
            <CreateChildSystemModal toggle={toggle} />
          )}
        </div>
      )}
    </div>
  );
};

export default SystemLayoutToolbar;
