import * as Models from '@mlhub/models-ts-sdk';
import { useState, useContext, createContext, PropsWithChildren } from 'react';

// Context type definition
export type ModelFilterContextType = {
  libraries: string[];
  setLibraries: (libraries: string[]) => void;
  taskTypes: Models.Task[];
  setTaskTypes: (taskTypes: Models.Task[]) => void;
  limit: number;
  setLimit: (limit: number) => void;
};

// Create the context
const ModelFilterContext = createContext<ModelFilterContextType | undefined>(
  undefined
);

// Create a Provider wrapper component
export const ModelFilterProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [taskTypes, setTaskTypes] = useState<Models.Task[]>([]);
  const [libraries, setLibraries] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);

  const setTaskTypesInternal = (tasks: Models.Task[]) => {
    setTaskTypes(tasks);
  };

  const setLibrariesInternal = (libs: string[]) => {
    setLibraries(libs);
  };

  const setLimitInternal = (lim: number) => {
    setLimit(lim);
  };

  // Pass both state and updater into the value object
  return (
    <ModelFilterContext.Provider
      value={{
        libraries,
        setLibraries: setLibrariesInternal,
        limit,
        setLimit: setLimitInternal,
        taskTypes,
        setTaskTypes: setTaskTypesInternal,
      }}
    >
      {children}
    </ModelFilterContext.Provider>
  );
};

export const useModelFilter = () => {
  const context = useContext(ModelFilterContext);

  if (!context) {
    throw new Error('useModelFilter must be used within a ModelFilterProvider');
  }

  return context;
};

export default ModelFilterContext;
