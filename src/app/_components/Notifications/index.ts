export { default } from './NotificationToast';
export { default as useNotifications } from './useNotifications';
export { default as NotificationToast } from './NotificationToast';
export { default as NotificationsProvider } from './NotificationsProvider';

export type Notification = {
  icon?: string;
  status?: string;
  message: string;
};

export type NotificationRecord = {
  id: string;
  read: boolean;
  notification: Notification;
};

export type NotificationsContextType = {
  notifications: Array<NotificationRecord>;
  dispatch: React.Dispatch<{
    operation: 'add' | 'markread' | 'remove' | 'set';
    notification?: Notification | undefined;
    id: string;
  }>;
};
