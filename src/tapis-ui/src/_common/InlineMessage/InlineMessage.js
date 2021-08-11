import React from 'react';
import Message from '../Message';

/**
 * Show an event-based message to the user
 * @todo Document examples
 * @example
 * // Blah blah…
 * <Sample jsx>
 */
const InlineMessage = (props) => {
  // Override default props
  const messageProps = {
    ...Message.defaultProps,
    ...props,
    canDismiss: false,
    scope: 'inline',
  };

  // Avoid manually syncing <Message>'s props
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Message {...messageProps} />;
};
InlineMessage.propTypes = Message.propTypes;
InlineMessage.defaultProps = Message.defaultProps;

export default InlineMessage;
