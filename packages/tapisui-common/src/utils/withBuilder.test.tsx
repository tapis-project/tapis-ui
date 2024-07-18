import { expect, describe, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-hooks';
import withBuilder from './withBuilder';

type MockType = {
  field1: string;
  field2: string;
};

describe('withFragment', () => {
  it('generates a hook and a Provider', () => {
    const { useBuilderContext, Provider } = withBuilder<MockType>();
    const hook = renderHook(() => useBuilderContext());
    expect(Provider).toBeDefined();
    expect(hook.result.current.data).toBeDefined();
    expect(hook.result.current.add).toBeDefined();
  });
});
