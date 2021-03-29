import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Message from '../Message';

/**
 * Show an event-based message to the user
 * @todo Document examples
 * @example
 * // Blah blah…
 * <Sample jsx>
 */
const SectionMessage = (props) => {
  const [isVisible, setIsVisible] = useState(true);

  // Manage visibility
  const onDismiss = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  // Override default props
  const messageProps = {
    ...Message.defaultProps,
    ...props,
    isVisible,
    onDismiss,
    scope: 'section',
  };

  // Avoid manually syncing <Message>'s props
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Message {...messageProps} />;
};
SectionMessage.propTypes = {
  ...Message.propTypes,
  isVisible: PropTypes.bool,
  onDismiss: PropTypes.func,
};
SectionMessage.defaultProps = Message.defaultProps;

export default SectionMessage;
