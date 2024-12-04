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

const DescriptionListArray = ({ value }) => {
  if (value.length === 0) {
    return (
      <dd className={styles.value}>
        <i>None</i>
      </dd>
    );
  }
  return (
    <dl>
      {value.map((val, index) => (
        <div key={uuidv4()} className={styles['array-entry']}>
          <dt className={styles.key}>
            <i>{index}</i>
          </dt>
          <dd className={styles.value} data-testid="value">
            <DescriptionListValue value={val} />
          </dd>
        </div>
      ))}
    </dl>
  );
};

const DescriptionListValue = ({ value }) => {
  if (value === undefined) {
    return <i>Undefined</i>;
  }
  if (Array.isArray(value)) {
    return <DescriptionListArray value={value} />;
  }
  if (value instanceof Set) {
    return <DescriptionListArray value={Array.from(value)} />;
  }
  if (typeof value === 'object') {
    return <DescriptionList data={value} />;
  }
  if (typeof value === 'string') {
    return <>{value}</>;
  }
  return <>{JSON.stringify(value)}</>;
};

const DescriptionList = ({
  className = '',
  data,
  density = DEFAULT_DENSITY,
  direction = DEFAULT_DIRECTION,
}) => {
  const modifierClasses = [];
  modifierClasses.push(DENSITY_CLASS_MAP[density]);
  modifierClasses.push(DIRECTION_CLASS_MAP[direction]);
  const containerStyleNames = ['container', ...modifierClasses]
    .map((name) => styles[name])
    .join(' ');
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <div>
        <i>Empty object</i>
      </div>
    );
  }
  return (
    <dl className={`${className} ${containerStyleNames}`} data-testid="list">
      {entries.map(([key, value]) => (
        <React.Fragment key={key}>
          <dt className={styles.key} data-testid="key">
            {key}
          </dt>
          <dd className={styles.value} data-testid="value">
            <DescriptionListValue value={value} />
          </dd>
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

export default DescriptionList;
