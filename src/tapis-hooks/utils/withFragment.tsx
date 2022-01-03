import React, { useReducer, useContext, Dispatch } from 'react';

export type FragmentContextType<T> = {
  data: Partial<T>;
  set: Dispatch<Partial<T>>;
  reset: () => void;
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
    set: (value: Partial<T>) => {},
    reset: () => {}
  });

  const useFragmentContext = () => useContext(context);
  const Provider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const reducer = (state: Partial<T>, dispatch: { action: 'FRAGMENT' | 'RESET'; fragment?: Partial<T> }) => {
      if (dispatch.action === 'FRAGMENT') {
        return {
          ...state,
          ...dispatch.fragment,
        };
      }
      if (dispatch.action === 'RESET') {
        return { }
      }
      return { ...state };
    };
    const [data, dispatch] = useReducer(reducer, {});
    const contextValue: FragmentContextType<T> = {
      data,
      set: (value) => { dispatch({ action: 'FRAGMENT', fragment: value })},
      reset: () => { dispatch({ action: 'RESET' }) }
    };
    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  return {
    useFragmentContext,
    Provider,
  };
};

export default withFragment;
