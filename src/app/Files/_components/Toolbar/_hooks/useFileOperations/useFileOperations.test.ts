import '@testing-library/jest-dom/extend-expect';
import { MutationFunction } from '@tapis/tapisui-hooks';
import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';
import useFileOperations from './useFileOperations';

describe('useFileOperations', () => {
  it('runs a sequence of file operations', async () => {
    type MockType = {
      path: string;
    };
    const mockOperation: MutationFunction<MockType, any> = (item) =>
      new Promise((resolve) => resolve({}));

    const mockOnComplete = jest.fn();

    const hook = renderHook(() =>
      useFileOperations<MockType, any>({
        fn: mockOperation,
        onComplete: mockOnComplete,
      })
    );

    const { run } = hook.result.current;

    await act(async () => {
      run([{ path: 'path1' }, { path: 'path2' }]);
    });
    hook.rerender();
    expect(hook.result.current.state).toEqual({
      path1: { status: 'success', error: undefined },
      path2: { status: 'success', error: undefined },
    });
    expect(mockOnComplete).toHaveBeenCalled();
  });
});
