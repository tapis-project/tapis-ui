import React, { useCallback, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import PropTypes from 'prop-types';
//import { Button } from 'reactstrap';
import Icon from '../Icon';
import styles from './CopyButton.module.scss';
import { Button } from '@mui/material';

const CopyButton = ({ value, className }) => {
  const transitionDuration = 0.15; // second(s)
  const stateDuration = 1; // second(s)
  const stateTimeout = transitionDuration + stateDuration; // second(s)

  const [isCopied, setIsCopied] = useState(false);

  const onCopy = useCallback(() => {
    setIsCopied(true);

    const timeout = setTimeout(() => {
      setIsCopied(false);
      clearTimeout(timeout);
    }, stateTimeout * 1000);
  }, [setIsCopied, stateTimeout]);
  const isEmpty = !value || value.length === 0;

  return (
    <CopyToClipboard text={value}>
      <Button
        className={`${styles['copy-button']} ${
          isCopied ? styles['is-copied'] : ''
        } ${className}`}
        // RFE: Avoid manual JS ↔ CSS sync of transition duration by using:
        //      - `data-attribute` and `attr()` (pending browser support)
        //      - PostCSS and JSON variables (pending greater need for this)
        style={{ '--transition-duration': `${transitionDuration}s` }}
        onClick={onCopy}
        disabled={isEmpty}
        type="button"
        size="sm"
      >
        <Icon
          name={isCopied ? 'approved-reverse' : 'copy'}
          className={styles['button__icon']}
        />
        <span className={styles['button__text']}>Copy</span>
      </Button>
    </CopyToClipboard>
  );
};

CopyButton.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
};

export default CopyButton;
