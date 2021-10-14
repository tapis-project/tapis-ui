import React from 'react';
import { Button } from 'reactstrap';

import { Icon } from 'tapis-ui/_common';
import styles from './Toolbar.module.scss';

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  icon,
  onClick,
  disabled = true,
}) => {
  return (
    <div>
      <Button
        disabled={disabled}
        onClick={onClick}
        className={styles.toolbar_btn}
      >
        <Icon name={icon}></Icon>
        <span> {text}</span>
      </Button>
    </div>
  );
};

const Toolbar: React.FC = () => {
  return (
    <div className={styles.toolbar_wrapper}>
      <ToolbarButton
        text="Rename"
        icon="rename"
        disabled={false}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Move"
        icon="move"
        disabled={true}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Copy"
        icon="copy"
        disabled={true}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Download"
        icon="download"
        disabled={true}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Upload"
        icon="upload"
        disabled={true}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Folder"
        icon="add"
        disabled={true}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Trash"
        icon="trash"
        disabled={true}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
    </div>
  );
};

export default Toolbar;
