import React from 'react';
import { LoadingSpinner, Message } from 'tapis-ui/_common';
import styles from './SubmitWrapper.module.scss';

type SubmitWrapperProps = React.PropsWithChildren<{
  isLoading: boolean,
  success: string | undefined,
  error: Error | null
}>;

const SubmitWrapper: React.FC<SubmitWrapperProps> = ({isLoading, error, success, children}) => {
  return (
    <div className={styles.wrapper}>
      {children}
      {isLoading && <LoadingSpinner className={styles["loading-spinner"]} placement="inline"/>}
      {
        error
          ? <Message canDismiss={false} type="error" scope="inline">{(error as any)?.message ?? error}</Message>
          : success && <Message canDismiss={false} type="success" scope="inline">{success}</Message>
      }
    </div>
  )
}

export default SubmitWrapper;