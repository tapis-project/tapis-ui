import React from 'react';
import { LoadingSpinner, Message } from '../../ui';
import styles from './SubmitWrapper.module.scss';

type SubmitWrapperProps = React.PropsWithChildren<{
  isLoading: boolean;
  success: string | undefined;
  error: Error | null;
  className?: string;
  reverse?: boolean;
}>;

const SubmitWrapper: React.FC<SubmitWrapperProps> = ({
  isLoading,
  error,
  success,
  children,
  className = '',
  reverse = false,
}) => {
  return (
    <div
      className={`${className} ${styles.wrapper} ${reverse && styles.reverse}`}
    >
      {children}
      {isLoading && (
        <LoadingSpinner
          className={styles['loading-spinner']}
          placement="inline"
        />
      )}
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
  );
};

export default SubmitWrapper;
