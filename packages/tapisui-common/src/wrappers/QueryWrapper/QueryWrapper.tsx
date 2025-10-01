import React from 'react';
import { LoadingSpinner } from '../../ui';
import { Alert, AlertTitle } from '@mui/material';

type QueryWrapperProps = React.PropsWithChildren<{
  isLoading: boolean;
  error: Error | Array<Error | null> | null;
  className?: string;
}>;

const QueryWrapper: React.FC<QueryWrapperProps> = ({
  isLoading,
  error,
  children,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        <LoadingSpinner />
      </div>
    );
  }
  if (error && error instanceof Error) {
    return (
      <div className={className}>
        <Alert severity="error">
          <AlertTitle>An error occured</AlertTitle>
          {(error as Error).message}
        </Alert>
      </div>
    );
  }

  if (error && error instanceof Array && !error.includes(null)) {
    return (
      <div className={className}>
        {(error as Array<Error>).map((e) => {
          if (e) {
            return (
              <Alert severity="error">
                <AlertTitle>An error occured</AlertTitle>
                {(e as Error).message}
              </Alert>
            );
          }
        })}
      </div>
    );
  }
  return <div className={className}>{children}</div>;
};

export default QueryWrapper;
