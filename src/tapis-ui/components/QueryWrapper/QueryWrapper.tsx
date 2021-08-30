import React from 'react';
import { LoadingSpinner, Message } from 'tapis-ui/_common';

type QueryWrapperProps = React.PropsWithChildren<{
  isLoading: boolean,
  error: Error | null
}>;

const QueryWrapper: React.FC<QueryWrapperProps> = ({isLoading, error, children}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Message canDismiss={false} type="error" scope="inline">
        {(error as any).message ?? error}
      </Message>
    );
  }
  return <>{children}</>
}

export default QueryWrapper;