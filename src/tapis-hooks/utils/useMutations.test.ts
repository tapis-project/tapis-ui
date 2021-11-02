import '@testing-library/jest-dom/extend-expect';
import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';
import useMutations from './useMutations';

jest.mock('tapis-hooks/systems');
jest.mock('tapis-hooks/files');

describe('useMutations', () => {
  it('runs a sequence of mutations', async () => {
    const params = {
      onSuccess: jest.fn(),
      onStart: jest.fn(),
      onError: jest.fn(),
      onComplete: jest.fn(),
      fn: (item: any) => new Promise((resolve) => resolve(item)),
    };
    const { result } = renderHook(() => useMutations<any, any>(params));
    const { run } = result.current;

    await act(async () => {
      run(['item1', 'item2']);
    });

    expect(params.onStart).toHaveBeenCalledWith('item1');
    expect(params.onStart).toHaveBeenCalledWith('item2');
    expect(params.onSuccess).toHaveBeenCalledWith('item1', 'item1');
    expect(params.onSuccess).toHaveBeenCalledWith('item2', 'item2');
    expect(params.onComplete).toHaveBeenCalled();
  });
  it('runs a sequence of mutations and catches errors', async () => {
    const params = {
      onSuccess: jest.fn(),
      onStart: jest.fn(),
      onError: jest.fn(),
      onComplete: jest.fn(),
      fn: (item: any) => new Promise((_, reject) => reject(item)),
    };
    const { result } = renderHook(() => useMutations<any, any>(params));
    const { run } = result.current;

    await act(async () => {
      run(['item1', 'item2']);
    });

    expect(params.onStart).toHaveBeenCalledWith('item1');
    expect(params.onStart).toHaveBeenCalledWith('item2');
    expect(params.onError).toHaveBeenCalledWith('item1', 'item1');
    expect(params.onError).toHaveBeenCalledWith('item2', 'item2');
    expect(params.onComplete).toHaveBeenCalled();
  });
});
