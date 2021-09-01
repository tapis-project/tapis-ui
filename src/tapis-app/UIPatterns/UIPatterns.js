import React from 'react';
import UIPatternsMessage from './UIPatternsMessage';
import UIPatternsDescriptionList from './UIPatternsDescriptionList';
import UIPatternsDropdownSelector from './UIPatternsDropdownSelector';
import UIPatternsPill from './UIPatternsPill';
import UIPatternsReadMore from './UIPatternsReadMore';
import styles from './UIPatterns.module.scss';

function UIPatterns() {
  return (
    <div>
      <div className={styles.items}>
        <div className={styles['grid-item']}>
          <h6>Message &amp; Notification</h6>
          <UIPatternsMessage />
        </div>
        <div className={styles['grid-item']}>
          <h6>DropdownSelector</h6>
          <UIPatternsDropdownSelector />
        </div>
      </div>
      <div className={styles.items}>
        <div className={styles['grid-item']}>
          <h6>DescriptionList</h6>
          <UIPatternsDescriptionList />
        </div>
      </div>
      <div className={styles.items}>
        <div className={styles['grid-item']}>
          <h6>Pills</h6>
          <UIPatternsPill />
        </div>
      </div>
      <div className={styles.items}>
        <div className={styles['grid-item']}>
          <h6>Read More</h6>
          <UIPatternsReadMore />
        </div>
      </div>
    </div>
  );
}

export default UIPatterns;
