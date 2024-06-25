import React, { useState, useCallback } from 'react';
import { Button, Badge } from 'reactstrap';
import { Collapse as BootstrapCollapse } from 'reactstrap';
import { Icon } from '../../ui';
import styles from './Collapse.module.scss';

type CollapseProperties = React.PropsWithChildren<{
  title: string;
  note?: string;
  open?: boolean;
  requiredText?: string;
  isCollapsable?: boolean;
  className?: string;
}>;

const Collapse: React.FC<CollapseProperties> = ({
  title,
  note,
  open,
  requiredText,
  className,
  children,
  isCollapsable = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(open ?? false);
  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <div className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          {title}
          {requiredText && (
            <Badge
              color="danger"
              style={{ marginLeft: '10px', marginBottom: '10px' }}
            >
              {requiredText}
            </Badge>
          )}
        </div>
        <div className={styles.controls}>
          <div>{note ?? ''}</div>
          {isCollapsable && (
            <Button
              color="link"
              className={styles.expand}
              size="sm"
              onClick={toggle}
            >
              <Icon name={isOpen ? 'collapse' : 'expand'} />
            </Button>
          )}
        </div>
      </div>
      <BootstrapCollapse isOpen={isOpen || !isCollapsable}>
        {children}
      </BootstrapCollapse>
    </div>
  );
};

export default Collapse;
