import React from 'react';
import { LoadingSpinner, Message } from '../../ui';

type QueryWrapperProps = React.PropsWithChildren<{
  isLoading: boolean;
  error: Error | null;
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

  if (error) {
    return (
      <div className={className}>
        <Message canDismiss={false} type="error" scope="inline">
          {(error as any).message ?? error}
        </Message>
      </div>
    );
  }
  return <div className={className}>{children}</div>;
};

export default QueryWrapper;
