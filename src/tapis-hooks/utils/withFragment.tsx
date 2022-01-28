import React, { useReducer, useContext } from 'react';

export type FragmentContextType<T> = {
  data: Partial<T>;
  add: (fragment: Partial<T>) => void;
  set: (fragment: Partial<T>) => void;
  clear: () => void;
};

/**
 * Creates a Provider and context hook for a given data type
 * that assembles a Partial fragment of the provided data type
 *
 * @returns A Provider and a context hook
 */
const withFragment = <T extends unknown>() => {
  const context = React.createContext<FragmentContextType<T>>({
    data: {},
    add: (fragment: Partial<T>) => {},
    set: (fragment: Partial<T>) => {},
    clear: () => {},
  });

  const useFragmentContext = () => useContext(context);
  const Provider: React.FC<React.PropsWithChildren<{ value?: Partial<T> }>> = ({
    children,
    value,
  }) => {
    const reducer = (
      state: Partial<T>,
      payload: {
        action: 'add' | 'set' | 'clear';
        fragment?: Partial<T>;
      }
    ) => {
      const { action, fragment } = payload;
      switch (action) {
        case 'add':
          return { ...state, ...fragment };
        case 'set':
          return { ...fragment };
        case 'clear':
          return {};
        default:
          return { ...state };
      }
    };
    const [data, dispatch] = useReducer(reducer, { ...value });
    const contextValue: FragmentContextType<T> = {
      data,
      add: (fragment) => dispatch({ action: 'add', fragment }),
      set: (fragment) => dispatch({ action: 'set', fragment }),
      clear: () => dispatch({ action: 'clear' }),
    };
    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  return {
    useFragmentContext,
    Provider,
  };
};

export default withFragment;
