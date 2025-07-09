import React, { useCallback, useState } from 'react';
import copy from 'copy-to-clipboard';
import { Button } from 'reactstrap';
import Icon from '../Icon';
import styles from './TextCopyField.module.scss';

const TextCopyField: React.FC<{ value: string; placeholder: string }> = ({
  value,
  placeholder,
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
    <div className="input-group">
      <div className="input-group-prepend">
        <Button
          className={`${styles['copy-button']} ${
            isCopied ? styles['is-copied'] : ''
          }`}
          onClick={onCopy}
          disabled={isEmpty}
          type="button"
        >
          <Icon
            name={isCopied ? 'approved-reverse' : 'link'}
            className={styles['button__icon']}
          />
          <span className={styles['button__text']}>Copy</span>
        </Button>
      </div>
      <input
        type="text"
        onChange={(event) => {
          // Swallow keyboard events on the Input control, but
          // still allow selecting the text. readOnly property of
          // Input is not adequate for this purpose because it
          // prevents text selection
          event.preventDefault();
        }}
        value={value}
        className={`form-control ${styles.input}`}
        placeholder={placeholder}
        data-testid="input"
        readOnly
      />
    </div>
  );
};

export default TextCopyField;
