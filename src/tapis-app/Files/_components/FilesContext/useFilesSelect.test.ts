import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';
import { fileInfo } from 'fixtures/files.fixtures';
import useFilesSelect from './useFilesSelect';

const file1 = { ...fileInfo, path: '/file1.txt' };
const file2 = { ...fileInfo, path: '/file2.txt' };
const file3 = { ...fileInfo, path: '/file3.txt' };

describe('useFilesSelect', () => {
  it('performs single selection', async () => {
    const selectedFiles = [file1];
    const setSelectedFiles = jest.fn();

    const mockUseContext = jest.fn().mockImplementation(() => ({
      selectedFiles,
      setSelectedFiles,
    }));

    React.useContext = mockUseContext;

    const { result } = renderHook(() => useFilesSelect());
    const { select } = result.current;

    await act(async () => {
      select([file2], 'single');
    });
    expect(setSelectedFiles).toHaveBeenCalledWith([file2]);
  });

  it('performs single selection of a file already selected', async () => {
    const selectedFiles = [file1];
    const setSelectedFiles = jest.fn();

    const mockUseContext = jest.fn().mockImplementation(() => ({
      selectedFiles,
      setSelectedFiles,
    }));

    React.useContext = mockUseContext;
    const { result } = renderHook(() => useFilesSelect());
    const { select } = result.current;

    await act(async () => {
      select([file1], 'single');
    });
    expect(setSelectedFiles).toHaveBeenCalledWith([file1]);
  });

  it('performs multiselection', async () => {
    const selectedFiles = [file1];
    const setSelectedFiles = jest.fn();

    const mockUseContext = jest.fn().mockImplementation(() => ({
      selectedFiles,
      setSelectedFiles,
    }));

    React.useContext = mockUseContext;
    const { result } = renderHook(() => useFilesSelect());
    const { select } = result.current;

    await act(async () => {
      select([file2], 'multi');
    });
    expect(setSelectedFiles).toHaveBeenCalledWith([file1, file2]);
  });

  it('performs unselection', async () => {
    const selectedFiles = [file1, file2, file3];
    const setSelectedFiles = jest.fn();

    const mockUseContext = jest.fn().mockImplementation(() => ({
      selectedFiles,
      setSelectedFiles,
    }));

    React.useContext = mockUseContext;
    const { result } = renderHook(() => useFilesSelect());
    const { unselect } = result.current;

    await act(async () => {
      unselect([file2]);
    });
    expect(setSelectedFiles).toHaveBeenCalledWith([file1, file3]);
  });

  it('performs clearing', async () => {
    const selectedFiles = [file1, file2];
    const setSelectedFiles = jest.fn();

    const mockUseContext = jest.fn().mockImplementation(() => ({
      selectedFiles,
      setSelectedFiles,
    }));

    React.useContext = mockUseContext;
    const { result } = renderHook(() => useFilesSelect());
    const { clear } = result.current;

    await act(async () => {
      clear();
    });
    expect(setSelectedFiles).toHaveBeenCalledWith([]);
  });
});
