import React from 'react';
import PropTypes from 'prop-types';
import { Fade } from 'reactstrap';
import Icon from '../Icon';

import styles from './Message.module.scss';

export const ERROR_TEXT = {
  mismatchCanDismissScope:
    'For a <(Section)Message> to use `canDismiss`, `scope` must equal `section`.',
  deprecatedType:
    'In a <(Section|Inline)Message> `type="warn"` is deprecated. Use `type="warning"` instead.',
  missingScope:
    'A <Message> without a `scope` should become an <InlineMessage>. (If <Message> must be used, then explicitely set `scope="inline"`.)',
};

export const TYPE_MAP = {
  info: {
    iconName: 'conversation',
    className: 'is-info',
    iconText: 'Notice',
  },
  success: {
    iconName: 'approved-reverse',
    className: 'is-success',
    iconText: 'Notice',
  },
  warning: {
    iconName: 'alert',
    className: 'is-warn',
    iconText: 'Warning',
  },
  error: {
    iconName: 'alert',
    className: 'is-error',
    iconText: 'Error',
  },
};
TYPE_MAP.warn = TYPE_MAP.warning; // FAQ: Deprecated support for `type="warn"`
export const TYPES = Object.keys(TYPE_MAP);

export const SCOPE_MAP = {
  inline: {
    className: 'is-scope-inline',
    role: 'status',
    tagName: 'span',
  },
  section: {
    className: 'is-scope-section',
    role: 'status',
    tagName: 'p',
  },
  // app: { … } // FAQ: Do not use; instead, use a <NotificationToast>
};
export const SCOPES = ['', ...Object.keys(SCOPE_MAP)];
export const DEFAULT_SCOPE = 'inline'; // FAQ: Historical support for default

/**
 * Show an event-based message to the user
 * @todo Document examples
 * @example
 * // Blah blah…
 * <Sample jsx>
 */
const Message = ({
  children,
  className,
  onDismiss,
  canDismiss,
  isVisible,
  scope,
  type,
}) => {
  const typeMap = TYPE_MAP[type];
  const scopeMap = SCOPE_MAP[scope || DEFAULT_SCOPE];
  const { iconName, iconText, className: typeClassName } = typeMap;
  const { role, tagName, className: scopeClassName } = scopeMap;

  const hasDismissSupport = scope === 'section';

  // Manage prop warnings
  /* eslint-disable no-console */
  if (canDismiss && !hasDismissSupport) {
    // Component will work, except `canDismiss` is ineffectual
    console.error(ERROR_TEXT.mismatchCanDismissScope);
  }
  if (type === 'warn') {
    // Component will work, but `warn` is deprecated value
    console.info(ERROR_TEXT.deprecatedType);
  }
  if (!scope) {
    // Component will work, but `scope` should be defined
    console.info(ERROR_TEXT.missingScope);
  }
  /* eslint-enable no-console */

  // Manage class names
  const modifierClassNames = [];
  modifierClassNames.push(typeClassName);
  modifierClassNames.push(scopeClassName);
  const containerStyleNames = ['container', ...modifierClassNames]
    .map((name) => styles[name])
    .join(' ');

  // Manage disappearance
  // FAQ: Design does not want fade, but we still use <Fade> to manage dismissal
  // TODO: Consider replacing <Fade> with a replication of `unmountOnExit: true`
  const shouldFade = false;
  const fadeProps = {
    ...Fade.defaultProps,
    unmountOnExit: true,
    baseClass: shouldFade ? Fade.defaultProps.baseClass : '',
    timeout: shouldFade ? Fade.defaultProps.timeout : 0,
  };

  return (
    <Fade
      // Avoid manually syncing Reactstrap <Fade>'s default props
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...fadeProps}
      tag={tagName}
      className={`${className} ${containerStyleNames}`}
      role={role}
      in={isVisible}
    >
      <Icon
        className={`${styles['icon']} ${styles['type-icon']}`}
        name={iconName}
      >
        {iconText}
      </Icon>
      <span className={styles.text} data-testid="text">
        {children}
      </span>
      {canDismiss && hasDismissSupport ? (
        <button
          type="button"
          className={styles['close-button']}
          aria-label="Close"
          onClick={onDismiss}
        >
          <Icon
            className={`${styles.icon} ${styles['close-icon']}`}
            name="close"
          />
        </button>
      ) : null}
    </Fade>
  );
};
Message.propTypes = {
  /** Whether an action can be dismissed (requires scope equals `section`) */
  canDismiss: PropTypes.bool,
  /** Message text (as child node) */
  /* FAQ: We can support any values, even a component */
  children: PropTypes.node.isRequired, // This checks for any render-able value
  /** Additional className for the root element */
  className: PropTypes.string,
  /** Whether message is visible (pair with `onDismiss`) */
  isVisible: PropTypes.bool,
  /** Action on message dismissal (pair with `isVisible`) */
  onDismiss: PropTypes.func,
  /** How to place the message within the layout */
  scope: PropTypes.oneOf(SCOPES), // RFE: Require scope; change all instances
  /** Message type or severity */
  type: PropTypes.oneOf(TYPES).isRequired,
};
Message.defaultProps = {
  className: '',
  canDismiss: false,
  isVisible: true,
  onDismiss: () => {},
  scope: '', // RFE: Require scope; remove this line
};

export default Message;
