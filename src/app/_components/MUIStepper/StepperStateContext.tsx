import { createContext, useContext } from 'react';

export type StepperStateContextType = {
  state: Record<any, any>;
  updateState: (state: Partial<Record<any, any>>) => void;
};

export const useStepperState = () => {
  const context = useContext(StepperStateContext);
  if (!context)
    throw new Error(
      'useStepperState must be used within a StepperStateProvider'
    );
  return context;
};

const StepperStateContext = createContext<StepperStateContextType | undefined>(
  undefined
);

export default StepperStateContext;
