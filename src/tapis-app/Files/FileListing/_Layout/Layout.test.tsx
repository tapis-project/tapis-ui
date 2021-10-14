import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import FileListing from './Layout';
import { useList } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/files');

describe('FileListing layout', () => {
  it('renders FileListing component with an Up link', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [fileInfo],
      isLoading: false,
      error: null,
    });

    const component = (
      <FileListing
        systemId="test.system"
        path="dir/"
        location="/files/test.system/dir/"
      />
    );
  });
});
