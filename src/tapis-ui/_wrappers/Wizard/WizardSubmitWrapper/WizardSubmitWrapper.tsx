import React from 'react';
import { LoadingSpinner, Message } from 'tapis-ui/_common';
import styles from './WizardSubmitWrapper.module.scss';

type WizardSubmitWrapperProps = React.PropsWithChildren<{
  isLoading: boolean;
  title: string;
  success: string | undefined;
  error: Error | null;
  className?: string;
}>;

const WizardSubmitWrapper: React.FC<WizardSubmitWrapperProps> = ({
  isLoading,
  title,
  error,
  success,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className={styles.header}>
        <div>
          <h2>{title}</h2>
        </div>
        <div className={styles.submit}>
          {children}
          {isLoading && (
            <LoadingSpinner
              className={styles['loading-spinner']}
              placement="inline"
            />
          )}
        </div>
      </div>
      <div className={styles.message}>
        {error ? (
          <Message canDismiss={false} type="error" scope="inline">
            {(error as any)?.message ?? error}
          </Message>
        ) : (
          success && (
            <Message canDismiss={false} type="success" scope="inline">
              {success}
            </Message>
          )
        )}
      </div>
    </div>
  );
};

export default WizardSubmitWrapper;
