import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { FileListing } from 'tapis-ui/components/files';
import { useList } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/files');

describe('Files', () => {
  it('renders File Listing component', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [ fileInfo ],
      isLoading: false,
      error: null
    })

    const { getAllByText } = renderComponent(<FileListing systemId={"system"} path={"/"} />);
    expect(getAllByText(/file1/).length).toEqual(1);
  });
});
