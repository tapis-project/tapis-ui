import { Jobs } from '@tapis/tapis-typescript';
import React, { useReducer } from 'react';
import {
  JobLauncherContextType
} from '.';
import JobLauncherContext from './JobLauncherContext';

export const reducer = (
  state: Partial<Jobs.ReqSubmitJob>,
  action: {
    operation: 'add' | 'set' | 'clear';
    fragment?: Partial<Jobs.ReqSubmitJob>
  }
): Partial<Jobs.ReqSubmitJob> => {
  const { operation, fragment } = action;
  switch(operation) {
    case 'add': {
      return {
        ...state,
        ...fragment
      }
    };
    case 'set': {
      return {
        ...fragment
      }
    };
    case 'clear': {
      return {}
    };
  }
  return state;
};

const JobLauncherProvider: React.FC<React.PropsWithChildren<{ value?: Partial<Jobs.ReqSubmitJob>} >> = ({
  children,
  value
}) => {
  const [job, dispatch] = useReducer(
    reducer,
    { ...value }
  );

  // Provide a context state for the rest of the application, including
  // a way of modifying the state
  const contextValue: JobLauncherContextType = {
    job,
    dispatch
  };

  return (
    <JobLauncherContext.Provider value={contextValue}>
      {children}
    </JobLauncherContext.Provider>
  );
};

export default JobLauncherProvider;
