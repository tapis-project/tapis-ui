import React from 'react';
import {
  Button,
} from 'reactstrap';
import { TapisResult, TapisError } from 'tapis-api/types';
import {
  LoadingSpinner,
  Message
} from 'tapis-ui/_common'
import styles from './TapisUISubmit.module.scss';

type TapisUISubmitProps = {
  disabled: boolean,
  isLoading: boolean,
  data: TapisResult,
  error: TapisError,
  className?: string
}

const TapisUISubmit: React.FC<TapisUISubmitProps> = (
  {
    disabled=false, isLoading=false, data=undefined, 
    error=undefined, className=''
  }) => {
    
  return (
    <div className={className}>
      <Button
        type="submit"
        className="btn btn-primary"
        disabled={disabled || isLoading || !!error}>
        Submit Job
      </Button>
      {
        isLoading && <LoadingSpinner className="tapis-ui-submit__loading-spinner" placement="inline" />
      }
      { data && (
        <div className={styles.message}>
          <Message canDismiss={false} type="success" scope="inline">Successfully submitted job {data.result?.uuid || ''}</Message>
        </div>
      )}
      {error && (
        <div className={styles.message}>
          <Message canDismiss={false} type="error" scope="inline">{error?.message ?? error}</Message>
        </div>
      )}
    </div>
  )

}