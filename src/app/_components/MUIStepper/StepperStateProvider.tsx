import React from 'react';
import { default as StepperStateContext } from './StepperStateContext';

type State = Record<any, any>;

type StepperStateProviderProps = {
  state: State;
  updateState: (state: Partial<State>) => void;
};

const StepperStateProvider = ({
  children,
  updateState,
  state,
}: React.PropsWithChildren<StepperStateProviderProps>) => {
  return (
    <StepperStateContext.Provider
      value={{
        state,
        updateState,
      }}
    >
      {children}
    </StepperStateContext.Provider>
  );
};

export default StepperStateProvider;
