import React from 'react';
import { Button } from 'reactstrap';
import { TapisError } from 'tapis-api/types';
import { LoadingSpinner, Message } from 'tapis-ui/_common'
import styles from './TapisUISubmit.module.scss';

type TapisUISubmitMessageProps = React.PropsWithChildren<
  {
    type: string
  }
>;

const TapisUISubmitMessage: React.FC<TapisUISubmitMessageProps> = ({ type, children }) => {
  return (
    <div className={styles.message}>
      <Message canDismiss={false} type={type} scope="inline">
        <div className={styles.messageContent}>
          {children ?? ''}
        </div>
      </Message>
    </div>
  )
}

type TapisUISubmitProps = {
  disabled?: boolean,
  isLoading?: boolean,
  success?: string | null,
  error?: TapisError | Error,
  click?: Function,
  className?: string
}

const TapisUISubmit: React.FC<React.PropsWithChildren<TapisUISubmitProps>> = (
  {
    disabled=false, isLoading=false, success=undefined,
    error=null, className='', click=undefined,
    children=undefined
  }) => {

  return (
    <div className={styles.status}>
      <Button
        type="submit"
        className="btn btn-primary"
        disabled={disabled || isLoading || !!error}
        click={click}>
        {children ?? ''}
      </Button>
      {
        isLoading && <LoadingSpinner className={styles.spinner} placement="inline" />
      }
      {
        // This will display error messages, or if no errors exist the success message
        error && <TapisUISubmitMessage type="error">{error?.message ?? error}</TapisUISubmitMessage>
        || success && <TapisUISubmitMessage type="success">{success}</TapisUISubmitMessage>
      }
    </div>
  )
}

export default TapisUISubmit;