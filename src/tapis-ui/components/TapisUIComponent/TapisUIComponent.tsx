import React from 'react';
import { LoadingSpinner, Message } from 'tapis-ui/_common';
import { TapisError } from 'tapis-api/types';

type TapisUIComponentProps = React.PropsWithChildren<{
  error: TapisError | Error | null,
  isLoading: boolean,
  className?: string
}>

const TapisUIComponent: React.FC<TapisUIComponentProps> = ({ error, isLoading, children, className='' }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{error?.message ?? error}</Message>
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}

export default TapisUIComponent;