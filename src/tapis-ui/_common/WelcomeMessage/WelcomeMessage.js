import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';

/**
 * Whether to show a welcome message
 * @param {String} messageName - The name of the message to check
 */
export function useShouldShowMessage(messageName) {
  const welcomeMessages = {};
  return welcomeMessages && welcomeMessages[messageName];
}

/**
 * A message which, when dismissed, will not appear again unless browser storage is cleared
 *
 * _This message is designed for user introduction to sections, but can be abstracted further into a `<DismissableMessage>` or abstracted less such that a message need not be passed in._
 *
 * @example
 * // message with custom text, class, and identifier
 * <WelcomeMessage
 *   className="external-message-class"
 *   messageName={identifierForMessageLikeRouteName}
 * >
 *   Introductory text (defined externally).
 * </WelcomeMessage>
 */
function WelcomeMessage({ children, className, messageName }) {
  const shouldShow = useShouldShowMessage(messageName);
  const welcomeMessages = {};

  function onDismiss(name) {
    const newMessagesState = {
      ...welcomeMessages,
      [name]: false,
    };
    return newMessagesState;
  }

  return (
    <Alert
      isOpen={shouldShow}
      toggle={() => onDismiss(messageName)}
      color="secondary"
      className={className}
    >
      {children}
    </Alert>
  );
}
WelcomeMessage.propTypes = {
  /** Message as text or element(s) */
  children: PropTypes.node.isRequired,
  /** Additional className for the root element */
  className: PropTypes.string,
  /** A unique identifier for the message */
  messageName: PropTypes.string.isRequired,
};
WelcomeMessage.defaultProps = {
  className: '',
};

export default WelcomeMessage;
