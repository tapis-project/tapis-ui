import '@testing-library/jest-dom/extend-expect';
import { renderHook } from '@testing-library/react-hooks';
import withFragment from './withFragment';

type MockType = {
  field1: string;
  field2: string;
};

describe('withFragment', () => {
  it('generates a hook and a Provider', () => {
    const { useFragmentContext, Provider } = withFragment<MockType>();
    const hook = renderHook(() => useFragmentContext());
    expect(Provider).toBeDefined();
    expect(hook.result.current.data).toBeDefined();
    expect(hook.result.current.dispatch).toBeDefined();
  });
});
