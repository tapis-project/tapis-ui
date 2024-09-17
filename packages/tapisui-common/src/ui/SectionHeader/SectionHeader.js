import React from 'react';
import PropTypes, { any } from 'prop-types';

import styles from './SectionHeader.module.css';

/**
 * A header for a `Section[…]` component
 *
 * - heading text
 * - actions (e.g. links, buttons, form)
 * - automatic styles or markup for given context (ex: within a form or a table)
 *
 * @example
 * // a section header with heading text
 * <SectionHeader>
 *   <a href="…">Hyperlinked Name of Section</a>
 * </SectionHeader>
 * @example
 * // a form header with actions and heading text
 * <SectionHeader
 *   actions={<button type="reset">Reset</button>}
 *   isForForm
 * >
 *   Name of Form
 * </SectionHeader>
 * @example
 * // a table header with actions and heading text
 * <SectionHeader
 *   actions={<input type="search" />}
 *   isForTable
 * >
 *   Name of Table
 * </SectionHeader>
 */
function SectionHeader({
  actions = '',
  children,
  className = '',
  isForForm = false,
  isForTable = false,
}) {
  let styleName = '';
  const styleNameList = [styles['root']];
  const HeadingTagName = isForForm || isForTable ? 'h3' : 'h2';

  if (isForForm) styleNameList.push(styles['for-form']);
  if (isForTable) styleNameList.push(styles['for-table']);

  // Do not join inside JSX (otherwise arcane styleName error occurs)
  styleName = styleNameList.join(' ');

  return (
    <header className={`${styleName} ${className}`}>
      {children && (
        <HeadingTagName className={styles.heading}>{children}</HeadingTagName>
      )}
      {actions}
    </header>
  );
}
SectionHeader.propTypes = {
  /** Any actions (buttons, links, forms, etc) */
  actions: PropTypes.any,
  /** The text a.k.a. title */
  // TODO Fix the error below and un comment the line below the error and delete the line below that 'children: PropTypes.any,'
  //   src/ui/LayoutSections/LayoutSections.tsx:10:28 - error TS2322: Type 'ReactNode' is not assignable to type 'ReactNodeLike'.
  //   Type '{}' is not assignable to type 'ReactNodeLike'.

  // 10       <CommonSectionHeader>{children}</CommonSectionHeader>
  //                               ~~~~~~~~~~

  //   src/ui/SectionHeader/SectionHeader.js:65:3
  //     65   children: PropTypes.node,
  //          ~~~~~~~~~~~~~~~~~~~~~~~~
  //     The expected type comes from property 'children' which is declared here on type 'IntrinsicAttributes & Pick<Pick<{ actions: any; children: any; className: any; isForForm: any; isForTable: any; }, never> & Pick<InferProps<{ actions: Requireable<ReactNodeLike>; children: Requireable<...>; className: Requireable<...>; isForForm: Requireable<...>; isForTable: Requireable<...>; }>, "children" | ... 3...'
  // children: PropTypes.node,
  children: PropTypes.any,
  /** Any additional className(s) for the root element */
  className: PropTypes.string,
  /** Whether this header is for a form */
  isForForm: PropTypes.bool,
  /** Whether this header is for a table */
  isForTable: PropTypes.bool,
};

export default SectionHeader;
