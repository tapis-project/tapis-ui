import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface PodsContextType {
  lastPodId?: string;
  lastPodTab?: string;
  lastVolumeId?: string;
  lastSnapshotId?: string;
  lastTemplateId?: string;
  lastImageId?: string;
  currentPage?: string;
  setIds: (ids: {
    lastPodId?: string;
    lastPodTab?: string;
    lastVolumeId?: string;
    lastSnapshotId?: string;
    lastTemplateId?: string;
    lastImageId?: string;
    currentPage?: string;
  }) => void;
}

// Create the context with a default value
const PodsContext = createContext<PodsContextType>({ setIds: () => {} });

interface PodsContextProviderProps {
  children: ReactNode; // This allows any valid React child (string, number, JSX, null, etc.)
}

// Create a provider component
export const PodsContextProvider: React.FC<PodsContextProviderProps> = ({
  children,
}) => {
  const [ids, setIds] = useState<{
    lastPodId?: string;
    lastPodTab?: string;
    lastVolumeId?: string;
    lastSnapshotId?: string;
    lastTemplateId?: string;
    lastImageId?: string;
    currentPage?: string;
  }>({
    currentPage: 'pods',
  });

  // This makes it so context is updated and not overwritten each time.
  const updateIds = (newIds: {
    lastPodId?: string;
    lastPodTab?: string;
    lastVolumeId?: string;
    lastSnapshotId?: string;
    lastTemplateId?: string;
    lastImageId?: string;
    currentPage?: string;
  }) => {
    setIds((prevIds) => ({
      ...prevIds,
      ...newIds,
    }));
  };

  return (
    <PodsContext.Provider value={{ ...ids, setIds: updateIds }}>
      {children}
    </PodsContext.Provider>
  );
};

// Custom hook to use the context
export const usePodsContext = () => useContext(PodsContext);
