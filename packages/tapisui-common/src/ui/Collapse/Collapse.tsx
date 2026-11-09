import React, { useState, useCallback, useEffect } from 'react';
import { Button, Badge } from 'reactstrap';
import { Collapse as BootstrapCollapse } from 'reactstrap';
import Icon from '../Icon';
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

  // While a section is force-opened (isCollapsable=false, e.g. it holds a
  // validation error) the internal open state is bypassed. Record it as open so
  // that the moment it becomes collapsable again -- the user fixed the error --
  // the section does not snap shut underneath them.
  useEffect(() => {
    if (!isCollapsable) {
      setIsOpen(true);
    }
  }, [isCollapsable]);

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
