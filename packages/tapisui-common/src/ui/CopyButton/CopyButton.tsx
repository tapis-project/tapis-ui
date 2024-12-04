import React, { useCallback, useState } from 'react';
import copy from 'copy-to-clipboard';
import Icon from '../Icon';
import styles from './CopyButton.module.scss';
import { Button } from '@mui/material';

const CopyButton: React.FC<{ value: string; className: string }> = ({
  value,
  className,
}) => {
  const transitionDuration = 0.15; // second(s)
  const stateDuration = 1; // second(s)
  const stateTimeout = transitionDuration + stateDuration; // second(s)

  const [isCopied, setIsCopied] = useState(false);

  const onCopy = useCallback(() => {
    copy(value);
    setIsCopied(true);

    const timeout = setTimeout(() => {
      setIsCopied(false);
      clearTimeout(timeout);
    }, stateTimeout * 1000);
  }, [setIsCopied, stateTimeout]);
  const isEmpty = !value || value.length === 0;

  return (
    <Button
      onClick={() => {
        onCopy();
      }}
      disabled={isEmpty}
      type="button"
      size="small"
    >
      <Icon
        name={isCopied ? 'approved-reverse' : 'copy'}
        className={styles['button__icon']}
      />
      <span className={styles['button__text']}>Copy</span>
    </Button>
  );
};

export default CopyButton;
