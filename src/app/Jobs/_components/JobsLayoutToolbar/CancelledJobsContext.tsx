import React, { createContext } from 'react';

export type CancelledJobsContext<T> = {
  job_uuid: string;
  job_status: string;
  job_cancel_request: boolean;
};

export default CancelledJobsContext;
