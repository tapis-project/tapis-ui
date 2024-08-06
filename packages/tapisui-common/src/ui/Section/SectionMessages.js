import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  WelcomeMessage,
  useShouldShowMessage as useShouldShowWelcomeMessage,
} from '..';
import * as MESSAGES from '../../constants/welcomeMessages';

import styles from './SectionMessages.module.css';
import './SectionMessages.css';

/**
 * A list for section messages that supports:
 *
 * - manual messages
 * - manual welcome message
 * - automatic welcome message
 * - automatic welcome message with custom text
 *
 * @example
 * // an automatic welcome message (if found), no additional messages
 * <SectionMessages routeName="DASHBOARD" />
 * @example
 * // overwrite text of an automatic welcome message, no additional messages
 * <SectionMessages
 *   routeName="DASHBOARD"
 *   welcomeText={`We welcome you to the dashboard, ${givenName}`} />
 * @example
 * // define text for a manual welcome message, no additional messages
 * <SectionMessages welcomeText={`We welcome you to this page, ${givenName}`} />
 * @example
 * // an automatic welcome message (if found), some additional messages
 * <SectionMessages routeName="DASHBOARD">
 *   <Alert color="success">You win!</Alert>
 *   <Alert color="secondary">
 *     <button>Claim your prize.</button>
 *   </Alert>
 * </SectionMessages>
 * @example
 * // no automatic welcome message, some additional messages
 * <SectionMessages>
 *   <Alert color="success">You win!</Alert>
 *   <Alert color="secondary">
 *     <button>Claim your prize.</button>
 *   </Alert>
 * </SectionMessages>
 */
function SectionMessages({ children, className, routeName, welcomeText }) {
  const welcomeMessageText = welcomeText || MESSAGES[routeName];
  /* FAQ: An alternate message name allows tracking custom message dismissal */
  const welcomeMessageName = routeName || welcomeMessageText;
  const welcomeMessage = welcomeMessageText && (
    <WelcomeMessage messageName={welcomeMessageName}>
      {welcomeMessageText}
    </WelcomeMessage>
  );
  const hasMessage =
    useShouldShowWelcomeMessage(routeName) || children.length > 0;
  const hasMessageClass = 'has-message';

  useEffect(() => {
    if (hasMessage) {
      document.body.classList.add(hasMessageClass);
    } else {
      document.body.classList.remove(hasMessageClass);
    }
  }, [hasMessage]);

  return (
    <aside className={`${styles.root} ${className}`}>
      {welcomeMessage}
      {children}
    </aside>
  );
}
SectionMessages.propTypes = {
  /** Component-based message(s) (e.g. <Alert>, <Message>) (welcome message found automatically, given `routeName`) */
  children: PropTypes.node,
  /** Any additional className(s) for the root element */
  className: PropTypes.string,
  /** The name of the route section (to search for required welcome message) */
  routeName: PropTypes.string,
  /** Custom welcome text (can overwrite `routeName`-based welcome message) */
  welcomeText: PropTypes.string,
};
SectionMessages.defaultProps = {
  children: '',
  className: '',
  routeName: '',
  welcomeText: '',
};

export default SectionMessages;
