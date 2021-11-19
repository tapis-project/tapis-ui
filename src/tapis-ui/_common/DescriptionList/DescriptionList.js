import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import styles from './DescriptionList.module.scss';

export const DIRECTION_CLASS_MAP = {
  vertical: 'is-vert',
  horizontal: 'is-horz',
};
export const DEFAULT_DIRECTION = 'vertical';
export const DIRECTIONS = ['', ...Object.keys(DIRECTION_CLASS_MAP)];

export const DENSITY_CLASS_MAP = {
  compact: 'is-narrow',
  default: 'is-wide',
};
export const DEFAULT_DENSITY = 'default';
export const DENSITIES = ['', ...Object.keys(DENSITY_CLASS_MAP)];

const DescriptionList = ({ className, data, density, direction }) => {
  const modifierClasses = [];
  modifierClasses.push(DENSITY_CLASS_MAP[density || DEFAULT_DENSITY]);
  modifierClasses.push(DIRECTION_CLASS_MAP[direction || DEFAULT_DIRECTION]);
  const containerStyleNames = ['container', ...modifierClasses]
    .map((name) => styles[name])
    .join(' ');

  return (
    <dl className={`${className} ${containerStyleNames}`} data-testid="list">
      {Object.entries(data).map(([key, value]) => (
        <React.Fragment key={key}>
          <dt className={styles.key} data-testid="key">
            {key}
          </dt>
          {Array.isArray(value) ? (
            value.map((val) => (
              <dd className={styles.value} data-testid="value" key={uuidv4()}>
                {typeof val === 'object' ? <DescriptionList data={val} /> : val}
              </dd>
            ))
          ) : (
            <dd className={styles.value} data-testid="value">
              {typeof value === 'object' ? (
                <DescriptionList data={value} />
              ) : (
                value
              )}
            </dd>
          )}
        </React.Fragment>
      ))}
    </dl>
  );
};
DescriptionList.propTypes = {
  /** Additional className for the root element */
  className: PropTypes.string,
  /** Selector type */
  /* FAQ: We can support any values, even a component */
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  /** Layout density */
  density: PropTypes.oneOf(DENSITIES),
  /** Layout direction */
  direction: PropTypes.oneOf(DIRECTIONS),
};
DescriptionList.defaultProps = {
  className: '',
  density: DEFAULT_DENSITY,
  direction: DEFAULT_DIRECTION,
};

export default DescriptionList;
