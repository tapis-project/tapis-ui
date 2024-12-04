import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { SectionHeader, SectionContent } from '..';
import SectionMessages from './SectionMessages';
import { LAYOUTS, DEFAULT_LAYOUT } from '../SectionContent';

import styles from './Section.module.css';

/**
 * A section layout structure that supports:
 *
 * - messages (automatically loads welcome message)
 * - header (with actions, e.g. links, buttons, form)
 * - content (that will be arranged in the layout you choose)
 * - manual or automatic sub-components (i.e. header, content)
 *
 * @example
 * // manually build messages, automatically build welcome message
 * <Section
 *   routeName="DASHBOARD"
 *   messages={<>…</>}
 * />
 * @example
 * // overwrite text of an automatic welcome message, no additional messages
 * <Section
 *   routeName="DASHBOARD"
 *   welcomeMessageText={`We welcome you to the dashboard, ${givenName}`}
 * />
 * @example
 * // define text for a manual welcome message, no additional messages
 * <Section
 *   welcomeMessageText={`We welcome you to this page, ${givenName}`}
 * />
 * @example
 * // add class to <body>, automatically build sub-components
 * // FAQ: class on <body> + `Bob.global.css` + `body.global-bob-class`
 * //      = unlimited, explicit, isolated CSS side effects
 * <Section
 *   bodyClassName="has-loaded-some_section"
 *   content={…}
 * />
 * @example
 * // automatically build sub-components, with some customization
 * <Section
 *   header="Dashboard"
 *   headerStyleName="header"
 *   headerActions={…}
 *   content={…}
 *   contentStyleName="items"
 *   contentLayoutName="twoColumn"
 * />
 * @example
 * // alternate syntax to automatically build content
 * <Section
 *   contentStyleName="items"
 *   contentLayoutName="twoColumn"
 * >
 *   {…} <!-- i.e. content -->
 * </Section>
 * @example
 * // manually build sub-components
 * // WARNING: This component's styles are NOT applied to manual sub-components
 * // FAQ: The <SectionHeader> offers auto-built header's layout styles
 * // FAQ: The <SectionContent> offers auto-built content's layout styles
 * <Section
 *   manualHeader={
 *     <SectionHeader {…} />
 *   }
 *   manualContent={
 *     <SectionContent {…} />
 *   }
 * />
 * @example
 * // manually build content (alternate method)
 * // WARNING: This component's styles are NOT applied to manual sub-components
 * // FAQ: The <SectionContent> offers auto-built content's layout options
 * <Section manualContent>
 *   <SectionContent {…} />
 * />
 */
function Section({
  bodyClassName,
  children,
  className,
  content,
  contentClassName,
  contentLayoutName,
  contentShouldScroll,
  header,
  headerActions,
  headerClassName,
  manualContent,
  manualHeader,
  // manualSidebar,
  // sidebar,
  // sidebarClassName,
  messages,
  messagesClassName,
  routeName,
  welcomeMessageText,
}) {
  const shouldBuildHeader = header || headerClassName || headerActions;

  // Allowing ineffectual prop combinations would lead to confusion
  if (
    manualContent &&
    (content || contentClassName || contentLayoutName || contentShouldScroll)
  ) {
    throw new Error(
      'When passing `manualContent`, the following props are ineffectual: `content`, `contentClassName`, `contentLayoutName`, `contentShouldScroll`'
    );
  }
  if (manualHeader && (header || headerClassName || headerActions)) {
    throw new Error(
      'When passing `manualHeader`, the following props are ineffectual: `header`, `headerClassName`, `headerActions`'
    );
  }
  // if (manualSidebar && (sidebar || sidebarClassName)) {
  //   throw new Error(
  //     'When passing `manualSidebar`, the following props are ineffectual: `sidebar`, `sidebarClassName`'
  //   );
  // }

  useEffect(() => {
    if (bodyClassName) document.body.classList.add(bodyClassName);

    return function cleanup() {
      if (bodyClassName) document.body.classList.remove(bodyClassName);
    };
  }, [bodyClassName]);

  return (
    <section className={`${className} ${styles.root}`}>
      {/* eslint-disable */}
      <SectionMessages
        className={messagesClassname || styles.messages}
        routeName={routeName}
        welcomeText={welcomeMessageText}
      >
        {messages}
      </SectionMessages>
      {/* {manualSidebar ? (
        <>{manualSidebar}</>
      ) : (
        <Sidebar styleName="sidebar" className={sidebarClassName}>
          {sidebar}
        </Sidebar>
      )} */}
      {manualHeader ? (
        <>{manualHeader}</>
      ) : (
        shouldBuildHeader && (
          <SectionHeader
            className={`${headerClassName} ${styles.header}`}
            actions={headerActions}
          >
            {header}
          </SectionHeader>
        )
      )}
      {manualContent ? (
        <>
          {manualContent}
          {children}
        </>
      ) : (
        <SectionContent
          tagName="main"
          className={`${contentClassName} ${styles.content}`}
          layoutName={contentLayoutName || DEFAULT_LAYOUT}
          shouldScroll={contentShouldScroll}
        >
          {content}
          {children}
        </SectionContent>
      )}
    </section>
  );
}
Section.propTypes = {
  /** Name of class to append to body when section is active */
  bodyClassName: PropTypes.string,
  /** Alternate way to pass `manualContent` and `content` */
  children: PropTypes.node,
  /** Any additional className(s) for the root element */
  className: PropTypes.string,
  /** The section content children (content element built automatically) */
  content: PropTypes.node,
  /** Any additional className(s) for the content element */
  contentClassName: PropTypes.string,
  /** The name of the layout by which to arrange the content children */
  contentLayoutName: PropTypes.oneOf(LAYOUTS.concat('')),
  /** Whether to allow content to scroll */
  contentShouldScroll: PropTypes.bool,
  /** The section header text (header element built automatically) */
  header: PropTypes.node,
  /** Any section actions for the header element */
  headerActions: PropTypes.node,
  /** Any additional className(s) for the header element */
  headerClassName: PropTypes.string,
  /** The section content (built by user) flag or element */
  /* RFE: Ideally, limit these to one relevant `Section[…]` component */
  /* SEE: https://github.com/facebook/react/issues/2979 */
  manualContent: PropTypes.oneOfType([PropTypes.bool, PropTypes.element]),
  /** The section header (built by user) element */
  manualHeader: PropTypes.element,
  // /** The page-specific sidebar */
  // sidebar: PropTypes.node,
  // /** Additional className for the sidebar element */
  // sidebarClassName: PropTypes.string,
  /** Any component-based message(s) (e.g. <Alert>, <Message>) (welcome message found automatically, given `routeName`) */
  messages: PropTypes.node,
  /** Any additional className(s) for the message list */
  messagesClassName: PropTypes.string,
  /** The name of the route section (to search for a welcome message) */
  routeName: PropTypes.string,
  /** Any additional className(s) for the sidebar list */
  // sidebarClassName: '',
  /** Custom welcome text (can overwrite `routeName`-based welcome message) */
  welcomeMessageText: PropTypes.string,
};
Section.defaultProps = {
  bodyClassName: '',
  children: '',
  className: '',
  content: '',
  contentClassName: '',
  contentLayoutName: '',
  contentShouldScroll: false,
  header: '',
  headerActions: '',
  headerClassName: '',
  manualContent: undefined,
  manualHeader: undefined,
  messages: '',
  messagesClassName: '',
  routeName: '',
  // sidebarClassName: '',
  welcomeMessageText: '',
};

export default Section;
