import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useMutations from './useMutations';

describe('useMutations', () => {
  it('runs a sequence of mutations', async () => {
    const params = {
      onSuccess: vi.fn(),
      onStart: vi.fn(),
      onError: vi.fn(),
      onComplete: vi.fn(),
      fn: (item: any) => new Promise((resolve) => resolve(item)),
    };
    const { result } = renderHook(() => useMutations<any, any>(params));

    waitFor(() => {
      const { run } = result.current;
      run(['item1', 'item2']);
      expect(params.onStart).toHaveBeenCalledWith('item1');
      expect(params.onStart).toHaveBeenCalledWith('item2');
      expect(params.onSuccess).toHaveBeenCalledWith('item1', 'item1');
      expect(params.onSuccess).toHaveBeenCalledWith('item2', 'item2');
      expect(params.onComplete).toHaveBeenCalled();
    });
  });

  it('runs a sequence of mutations and catches errors', async () => {
    const params = {
      onSuccess: vi.fn(),
      onStart: vi.fn(),
      onError: vi.fn(),
      onComplete: vi.fn(),
      fn: (item: any) => new Promise((_, reject) => reject(item)),
    };
    const { result } = renderHook(() => useMutations<any, any>(params));

    waitFor(() => {
      const { run } = result.current;
      run(['item1', 'item2']);
      expect(params.onStart).toHaveBeenCalledWith('item1');
      expect(params.onStart).toHaveBeenCalledWith('item2');
      expect(params.onError).toHaveBeenCalledWith('item1', 'item1');
      expect(params.onError).toHaveBeenCalledWith('item2', 'item2');
      expect(params.onComplete).toHaveBeenCalled();
    });
  });
});
