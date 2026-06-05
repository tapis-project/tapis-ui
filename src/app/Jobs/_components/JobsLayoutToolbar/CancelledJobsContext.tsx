import React, { createContext, useContext, useState } from 'react';

type CancelledJobsContextType = {
  cancelledUuids: Set<string>;
  markCancelled: (uuid: string) => void;
};

const CancelledJobsContext = createContext<CancelledJobsContextType>({
  cancelledUuids: new Set(),
  markCancelled: () => {},
});

export const CancelledJobsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cancelledUuids, setCancelledUuids] = useState<Set<string>>(new Set());

  const markCancelled = (uuid: string) => {
    setCancelledUuids((prev) => new Set(prev).add(uuid));
  };

  return (
    <CancelledJobsContext.Provider value={{ cancelledUuids, markCancelled }}>
      {children}
    </CancelledJobsContext.Provider>
  );
};

export const useCancelledJobs = () => useContext(CancelledJobsContext);

export default CancelledJobsContext;
