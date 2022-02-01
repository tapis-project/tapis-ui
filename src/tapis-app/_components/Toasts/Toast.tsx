import React, { useState, useEffect } from 'react';
import { ToastRecord, ToastType, useToasts, useToastActions } from '.';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import { Icon } from 'tapis-ui/_common';
import styles from './Toast.module.scss';

const Toast = () => {
  type TransitionType =
    | React.ComponentType<
        SlideProps & {
          children?: React.ReactElement<any, any> | undefined;
        }
      >
    | undefined;
  const { toasts } = useToasts();
  const { markread } = useToastActions();
  const [open, setOpen] = useState(false);
  const [toastRecord, setToastRecord] = useState<ToastRecord | null>(null);
  const [transition, setTransition] = React.useState<TransitionType>(undefined);

  useEffect(() => {
    if (toasts.length && !toastRecord) {
      // Set a new toast when we don't have an active one
      setToastRecord({ ...toasts[0] });
      setTransition(() => (props: SlideProps) => (
        <Slide {...props} direction="right" />
      ));
      setOpen(true);
    } else if (toasts.length && toastRecord && open) {
      // Close an active toast when a new one is added
      setOpen(false);
      markread(toastRecord?.id!);
      setToastRecord({ ...toasts[0] });
      setTransition(() => (props: SlideProps) => (
        <Slide {...props} direction="right" />
      ));
      setOpen(true);
    }
    /* eslint-disable-next-line */
  }, [toasts]);

  const handleExited = () => {
    setToastRecord(null);
    markread(toastRecord?.id!);
  };

  type HandleCloseType = (
    event: React.SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
  ) => void;

  const handleClose: HandleCloseType = (_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return toastRecord && !toastRecord.read ? (
    <Snackbar
      key={toastRecord ? toastRecord.id : undefined}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      TransitionComponent={transition}
      open={open}
      autoHideDuration={3500}
      onClose={handleClose}
      TransitionProps={{
        onExited: handleExited,
      }}
      classes={{
        anchorOriginBottomLeft: styles['toast-container'],
      }}
      ContentProps={{
        classes: {
          root: styles['toast'],
          message: styles['toast-body'],
        },
      }}
      message={<ToastMessage toast={toastRecord!.toast} />}
    />
  ) : null;
};

export const ToastMessage: React.FC<{ toast: ToastType }> = ({ toast }) => {
  return (
    <>
      <div className={styles['toast-icon-wrapper']}>
        <Icon
          name={toast.icon}
          className={toast.status === 'ERROR' ? styles['toast-is-error'] : ''}
        />
      </div>
      <div className={styles['toast-content']}>
        <span>{toast.message}</span>
      </div>
    </>
  );
};

export default Toast;
