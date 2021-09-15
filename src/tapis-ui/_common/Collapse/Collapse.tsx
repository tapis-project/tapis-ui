import React, { useState, useCallback } from 'react';
import { Button } from 'reactstrap';
import { Collapse as BootstrapCollapse } from 'reactstrap';
import { Icon } from 'tapis-ui/_common';
import styles from './Collapse.module.scss';

type CollapseProperties = React.PropsWithChildren<{
  title: string;
  note?: string;
  open?: boolean;
  className?: string;
}>;

const Collapse: React.FC<CollapseProperties> = ({
  title,
  note,
  open,
  className,
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(open ?? false);
  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <div className={className}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.controls}>
          <div>{note ?? ''}</div>
          <Button
            color="link"
            className={styles.expand}
            size="sm"
            onClick={toggle}
          >
            <Icon name={isOpen ? 'collapse' : 'expand'} />
          </Button>
        </div>
      </div>
      <BootstrapCollapse isOpen={isOpen}>{children}</BootstrapCollapse>
    </div>
  );
};

export default Collapse;
