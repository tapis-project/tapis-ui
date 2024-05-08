import React from 'react';
import { useTable } from 'react-table';
import PropTypes from 'prop-types';
import LoadingSpinner from '../LoadingSpinner';
import './InfiniteScrollTable.scss';

const rowContentPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.element,
  PropTypes.oneOf([React.Fragment]),
]);

const InfiniteScrollLoadingRow = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }
  return (
    <tr className="-status">
      <td>
        <LoadingSpinner placement="inline" />
      </td>
    </tr>
  );
};
InfiniteScrollLoadingRow.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

const InfiniteScrollNoDataRow = ({ display, noDataText }) => {
  if (!display) {
    return null;
  }
  return (
    <tr className="-status">
      <td>
        <span className="-status__message">{noDataText}</span>
      </td>
    </tr>
  );
};
InfiniteScrollNoDataRow.propTypes = {
  display: PropTypes.bool.isRequired,
  noDataText: rowContentPropType.isRequired,
};

const InfiniteScrollTable = ({
  tableColumns,
  tableData,
  onInfiniteScroll,
  isLoading,
  className,
  noDataText,
  getRowProps,
  columnMemoProps,
}) => {
  const columns = React.useMemo(
    () => tableColumns,
    /* eslint-disable-next-line */
    [columnMemoProps, tableColumns]
  );
  const data = React.useMemo(() => tableData, [tableData]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  const onScroll = ({ target }) => {
    const bottom =
      target.scrollHeight - target.scrollTop === target.clientHeight;
    if (bottom && target.scrollTop > 0) {
      onInfiniteScroll(tableData.length);
    }
  };

  return (
    <table {...getTableProps()} className={`${className} InfiniteScrollTable`}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} onScroll={onScroll}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} {...getRowProps(row)}>
              {row.cells.map((cell) => {
                return (
                  <td
                    {...cell.getCellProps({ className: cell.column.className })}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
        <InfiniteScrollLoadingRow isLoading={isLoading} />
        <InfiniteScrollNoDataRow
          display={!isLoading && tableData.length === 0}
          noDataText={noDataText}
        />
      </tbody>
    </table>
  );
};

InfiniteScrollTable.propTypes = {
  tableColumns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  tableData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onInfiniteScroll: PropTypes.func,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  noDataText: rowContentPropType,
  getRowProps: PropTypes.func,
  columnMemoProps: PropTypes.arrayOf(PropTypes.any),
};
InfiniteScrollTable.defaultProps = {
  onInfiniteScroll: (offset) => {},
  isLoading: false,
  className: '',
  noDataText: '',
  getRowProps: (row) => {},
  columnMemoProps: [],
};

export default InfiniteScrollTable;
