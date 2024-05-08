import React, { useState, useEffect, SyntheticEvent } from 'react';
import { useNotifications, NotificationRecord, Notification } from '.';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Slide, { SlideProps } from '@mui/material/Slide';
import { Icon } from 'tapis-ui/_common';
import styles from './NotificationToast.module.scss';

const NotificationToast = () => {
  type TransitionType =
    | React.ComponentType<
        SlideProps & {
          children?: React.ReactElement<any, any> | undefined;
        }
      >
    | undefined;
  const { notifications, markread } = useNotifications();
  const [open, setOpen] = useState(false);
  const [notificationRecord, setNotificationRecord] =
    useState<NotificationRecord | null>(null);
  const [transition, setTransition] = React.useState<TransitionType>(undefined);

  useEffect(() => {
    if (notifications.length && !notificationRecord) {
      // Set a new toast when we don't have an active one
      setNotificationRecord({ ...notifications[0] });
      setTransition(() => (props: SlideProps) => (
        <Slide {...props} direction="right" />
      ));
      setOpen(true);
    } else if (notifications.length && notificationRecord && open) {
      // Close an active toast when a new one is added
      setOpen(false);
      markread(notificationRecord?.id!);
      setNotificationRecord({ ...notifications[0] });
      setTransition(() => (props: SlideProps) => (
        <Slide {...props} direction="right" />
      ));
      setOpen(true);
    }
    /* eslint-disable-next-line */
  }, [notifications]);

  const handleExited = () => {
    setNotificationRecord(null);
    markread(notificationRecord?.id!);
  };

  const handleClose = (
    _event: Event | SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return notificationRecord && !notificationRecord.read ? (
    <Snackbar
      key={notificationRecord ? notificationRecord.id : undefined}
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
        anchorOriginBottomLeft: styles['notification-toast-container'],
      }}
      ContentProps={{
        classes: {
          root: styles['notification-toast'],
          message: styles['notification-toast-body'],
        },
      }}
      message={<ToastMessage notification={notificationRecord!.notification} />}
    />
  ) : null;
};

export const ToastMessage: React.FC<{ notification: Notification }> = ({
  notification,
}) => {
  return (
    <>
      <div className={styles['notification-toast-icon-wrapper']}>
        <Icon
          name={notification.icon}
          className={
            notification.status === 'ERROR' ? styles['toast-is-error'] : ''
          }
        />
      </div>
      <div className={styles['notification-toast-content']}>
        <span>{notification.message}</span>
      </div>
    </>
  );
};

export default NotificationToast;
