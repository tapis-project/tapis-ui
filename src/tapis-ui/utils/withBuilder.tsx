import React, { useReducer, useContext } from 'react';

export type FragmentContextType<T> = {
  data: Partial<T>;
  add: (fragment: Partial<T>) => void;
  set: (fragment: Partial<T>) => void;
  clear: () => void;
};

/**
 * Creates a Provider and context hook for a given data type
 * that builds a structure from slices of the provided data type
 *
 * @returns A Provider and a context hook
 */
const withBuilder = <T extends unknown>() => {
  const context = React.createContext<FragmentContextType<T>>({
    data: {},
    add: (fragment: Partial<T>) => {},
    set: (fragment: Partial<T>) => {},
    clear: () => {},
  });

  const useBuilderContext = () => useContext(context);
  const Provider: React.FC<React.PropsWithChildren<{ value?: Partial<T> }>> = ({
    children,
    value,
  }) => {
    const reducer = (
      state: Partial<T>,
      payload: {
        action: 'add' | 'set' | 'clear';
        slice?: Partial<T>;
      }
    ) => {
      const { action, slice } = payload;
      switch (action) {
        case 'add':
          return { ...state, ...slice };
        case 'set':
          return { ...slice };
        case 'clear':
          return {};
        default:
          return { ...state };
      }
    };
    const [data, dispatch] = useReducer(reducer, { ...value });
    const contextValue: FragmentContextType<T> = {
      data,
      add: (slice) => dispatch({ action: 'add', slice }),
      set: (slice) => dispatch({ action: 'set', slice }),
      clear: () => dispatch({ action: 'clear' }),
    };
    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  return {
    useBuilderContext,
    Provider,
  };
};

export default withBuilder;
