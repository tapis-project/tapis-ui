import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import styles from './Paginator.module.scss';

const PaginatorPage = ({ number, callback, current }) => {
  return (
    <div className={styles['page-root']}>
      <Button
        className={`${styles.page} ${number === current ? styles.current : ''}`}
        onClick={() => callback(number)}
      >
        {number}
      </Button>
    </div>
  );
};

PaginatorPage.propTypes = {
  number: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  current: PropTypes.number.isRequired,
};

const Paginator = ({ pages, current, callback, spread }) => {
  let start, end;
  if (pages === 1) {
    end = 0;
    start = 1;
  } else if (pages > 2 && pages <= spread) {
    start = 2;
    end = pages - 1;
  } else if (pages > spread && current <= 4) {
    start = 2;
    end = spread - 1;
  } else if (pages > spread && current > pages - (spread - 2)) {
    start = pages - (spread - 2);
    end = pages - 1;
  } else {
    const delta = Math.floor((spread - 2) / 2);
    start = current - delta;
    end = current + delta;
  }
  const middle = end - start + 1;
  const middlePages =
    middle > 0
      ? Array(middle)
          .fill()
          .map((_, index) => start + index)
      : [];
  return (
    <div className={styles.root}>
      <Button
        color="link"
        className={styles.root}
        onClick={() => callback(current - 1)} // eslint-disable-line
        disabled={current === 1}
      >
        <span>&lt; Previous</span>
      </Button>
      <PaginatorPage number={1} callback={callback} current={current} />
      {middlePages[0] > 2 && <span>...</span>}
      {middlePages.map((number) => {
        return (
          <PaginatorPage
            number={number}
            key={number}
            current={current}
            callback={callback}
          />
        );
      })}
      {middlePages[middlePages.length - 1] < pages - 1 && <span>...</span>}
      {pages > 1 && (
        <PaginatorPage number={pages} callback={callback} current={current} />
      )}
      <Button
        color="link"
        className={styles.endcap}
        onClick={() => callback(current + 1)} // eslint-disable-line
        disabled={current === pages}
      >
        <span>Next &gt;</span>
      </Button>
    </div>
  );
};

Paginator.propTypes = {
  pages: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  spread: PropTypes.number, // Number of page buttons to show
};

Paginator.defaultProps = {
  spread: 11,
};

export default Paginator;
