export { default as useNotifications } from './useNotifications';
export { default as NotificationsProvider } from './NotificationsProvider';

export type NotificationSeverity = 'error' | 'warning' | 'success' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: number;
  dismissed: boolean;
  autoDismissMs?: number;
  statusCode?: number;
}

export interface NotificationsContextType {
  notifications: AppNotification[];
  addNotification: (
    title: string,
    message: unknown,
    severity?: NotificationSeverity
  ) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  remove: (id: string) => void;
  clear: () => void;
}
