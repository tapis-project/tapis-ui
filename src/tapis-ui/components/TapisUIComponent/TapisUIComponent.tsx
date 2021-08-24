import React from 'react';
import { LoadingSpinner, Message } from 'tapis-ui/_common';
import { TapisError } from 'tapis-api/types';

type TapisUIComponentProps = React.PropsWithChildren<{
  error: TapisError,
  isLoading: boolean
}>

const TapisUIComponent: React.FC<TapisUIComponentProps> = ({ error, isLoading, children }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{error?.message ?? error}</Message>
  }

  return (
    <>
      {children}
    </>
  )
}

export default TapisUIComponent;