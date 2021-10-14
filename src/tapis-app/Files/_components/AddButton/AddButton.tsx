import React, { useState } from 'react';
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import { Icon } from 'tapis-ui/_common';
import styles from './AddButton.module.scss';

const AddButton: React.FC = () => {
  const [dropdownOpen, setDropdown] = useState(false);

  return (
    <div className={styles.wrapper}>
      <ButtonDropdown
        isOpen={dropdownOpen}
        toggle={() => {
          setDropdown(!dropdownOpen);
        }}
        className={styles.dropdown}
      >
        <DropdownToggle color="primary" className={styles.toggle}>
          + Add
        </DropdownToggle>
        <DropdownMenu className={styles.menu}>
          <DropdownItem>
            <Icon name="folder" className={styles.icon} /> Folder
          </DropdownItem>
          <DropdownItem>
            <Icon name="upload" className={styles.icon} /> Upload File
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    </div>
  );
};

export default AddButton;
