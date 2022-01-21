import React, { useReducer, useContext, Dispatch } from 'react';

export type FragmentContextType<T> = {
  data: Partial<T>;
  dispatch: Dispatch<Partial<T>>;
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
    dispatch: (value: Partial<T>) => {},
  });

  const useFragmentContext = () => useContext(context);
  const Provider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const reducer = (state: Partial<T>, fragment: Partial<T>) => {
      return {
        ...state,
        ...fragment,
      };
    };
    const [data, dispatch] = useReducer(reducer, {});
    const contextValue: FragmentContextType<T> = { data, dispatch };
    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  return {
    useFragmentContext,
    Provider,
  };
};

export default withFragment;
