import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable no-unused-vars */
import styles from './SectionContent.module.css';
import layoutStyles from './SectionContent.layouts.module.css';
/* eslint-enable no-unused-vars */

/**
 * Map of layout names to CSS classes
 * @enum {number}
 */
export const LAYOUT_CLASS_MAP = {
  /** One full-height row of flexible blocks */
  oneRow: 'one-row',
  /** One full-width column of flexible blocks */
  oneColumn: 'one-column',
  /**
   * Two left/right columns (wide/narrow) of flexible blocks
   *
   * (On narrow screens, this behaves like `oneColumn`)
   */
  twoColumn: 'two-column',
};
export const DEFAULT_LAYOUT = 'oneRow';
export const LAYOUTS = [...Object.keys(LAYOUT_CLASS_MAP)];

/**
 * A content panel wrapper that supports:
 *
 * - lay out panels (based on layout name and panel position)
 * - change element tag (like `section` instead of `div`)
 * - scroll root element (overflow of panel content is not managed)
 * - debug layout (via color-coded panels)
 *
 * @example
 * // features: lay out panels, change tag, allow content scroll, color-coded
 * <SectionContent
 *   layoutName="oneColumn"
 *   tagName="main",
 *   shouldScroll,
 *   shouldDebugLayout
 * >
 *   <div>Thing 1</div>
 *   <div>Thing 2</div>
 *   <div>Thing 3</div>
 * </SectionContent>
 */
function SectionContent({
  className,
  children,
  layoutName,
  shouldScroll,
  shouldDebugLayout,
  tagName,
}) {
  let styleName = '';
  const styleNameList = ['styles.root'];
  const layoutClass = LAYOUT_CLASS_MAP[layoutName];
  const TagName = tagName;

  if (shouldScroll) styleNameList.push(styles['should-scroll']);
  if (shouldDebugLayout) styleNameList.push(styles['should-debug-layout']);
  if (layoutClass) styleNameList.push(layoutStyles[layoutClass]);

  // Do not join inside JSX (otherwise arcane styleName error occurs)
  styleName = styleNameList.join(' ');

  return <TagName className={`${className} ${styleName}`}>{children}</TagName>;
}
SectionContent.propTypes = {
  /** Any additional className(s) for the root element */
  className: PropTypes.string,
  /** Content nodes where each node is a block to be laid out */
  children: PropTypes.node.isRequired,
  /** The name of the layout by which to arrange the nodes */
  layoutName: PropTypes.oneOf(LAYOUTS).isRequired,
  /** Whether to allow root element to scroll */
  shouldScroll: PropTypes.bool,
  /** Whether to allow panel debugging (highlight each panel with unique hue) */
  shouldDebugLayout: PropTypes.bool,
  /** Override tag of the root element */
  tagName: PropTypes.string,
};
SectionContent.defaultProps = {
  className: '',
  shouldScroll: false,
  shouldDebugLayout: false,
  tagName: 'div',
};

export default SectionContent;
