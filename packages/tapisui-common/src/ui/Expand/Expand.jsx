import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CardHeader, CardBody, Card, Collapse } from 'reactstrap';
import Icon from '../Icon';
import './Expand.global.scss';
import styles from './Expand.module.scss';

const Expand = ({ className = '', detail, message }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleCallback = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  // TODO: Use `details/summary` tags, when `onToggle` support is "last 2 versions"
  // SEE: https://github.com/facebook/react/issues/15486#issuecomment-669674869
  return (
    /* eslint-disable-next-line */
    <Card className={className ?? styles.container} tag="div">
      <CardHeader className={styles.summary} onClick={toggleCallback} tag="div">
        <strong className={styles.header}>{detail}</strong>
        <Icon name={isOpen ? 'collapse' : 'expand'} />
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody>{message}</CardBody>
      </Collapse>
    </Card>
  );
};

Expand.propTypes = {
  /** Additional className for the root element */
  className: PropTypes.string,

  detail: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default Expand;
