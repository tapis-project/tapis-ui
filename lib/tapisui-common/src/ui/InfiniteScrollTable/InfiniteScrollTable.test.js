import React from 'react';
import { render } from '@testing-library/react';
import InfiniteScrollTable from '../../ui/InfiniteScrollTable';
import '@testing-library/jest-dom/extend-expect';


const tableData = [
  {
    col1: 'Hello',
    col2: 'World',
  },
  {
    col1: 'react-table',
    col2: 'rocks',
  },
  {
    col1: 'whatever',
    col2: 'you want',
  },
];

const tableColumns = [
  {
    Header: 'Column 1',
    accessor: 'col1', // accessor is the "key" in the data
  },
  {
    Header: 'Column 2',
    accessor: 'col2',
  },
];

describe('InfiniteScrollTable', () => {
  it('renders a table', () => {
    const { getByText } = render(
      <InfiniteScrollTable
        tableColumns={tableColumns}
        tableData={tableData}
      />
    );

    expect(getByText(/Hello/)).toBeDefined();
  });

  it('renders a loading spinner', () => {
    const { getByTestId } = render(
      <InfiniteScrollTable
        tableColumns={tableColumns}
        tableData={tableData}
        isLoading={true}
      />
    )

    expect(getByTestId(/loading-spinner/)).toBeDefined();
  });
});
