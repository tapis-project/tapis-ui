import React, { useCallback, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Icon from '../Icon';
import styles from './TextCopyField.module.scss';

const TextCopyField = ({ value, placeholder }) => {
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
  const onChange = (event) => {
    // Swallow keyboard events on the Input control, but
    // still allow selecting the text. readOnly property of
    // Input is not adequate for this purpose because it
    // prevents text selection
    event.preventDefault();
  };

  return (
    <div className="input-group">
      <div className="input-group-prepend">
        <CopyToClipboard text={value}>
          <Button
            className={`${styles['copy-button']} ${
              isCopied ? styles['is-copied'] : ''
            }`}
            // RFE: Avoid manual JS ↔ CSS sync of transition duration by using:
            //      - `data-attribute` and `attr()` (pending browser support)
            //      - PostCSS and JSON variables (pending greater need for this)
            style={{ '--transition-duration': `${transitionDuration}s` }}
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
        </CopyToClipboard>
      </div>
      <input
        type="text"
        onChange={onChange}
        value={value}
        className={`form-control ${styles.input}`}
        placeholder={placeholder}
        data-testid="input"
        readOnly
      />
    </div>
  );
};

TextCopyField.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
};

TextCopyField.defaultProps = {
  value: '',
  placeholder: '',
};

export default TextCopyField;
