import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileListing from './FileListing';
import { useList } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/files');

describe('Files', () => {
  it('renders File Listing component', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [fileInfo],
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(
      <FileListing systemId={'system'} path={'/'} />
    );
    expect(getAllByText(/file1/).length).toEqual(1);
    expect(getAllByText(/01\/01\/2020/).length).toEqual(1);
    expect(getAllByText(/29.3 kB/).length).toEqual(1);
  });
});
