import React, { useState, useCallback } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import styles from './ReadMore.module.scss';

const ReadMore = ({ className, children }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleCallback = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const { height, ref } = useResizeDetector();

  const hasOverflow =
    ref && ref.current ? ref.current.scrollHeight > height : false;

  return (
    <>
      {
        <div
          className={`${
            expanded ? styles.expanded : styles.clamped
          } ${className}`}
          ref={ref}
        >
          {children}
        </div>
      }
      {(hasOverflow || expanded) && (
        <Button color="link" onClick={toggleCallback}>
          {expanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
    </>
  );
};

ReadMore.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

ReadMore.defaultProps = {
  className: '',
};

export default ReadMore;
