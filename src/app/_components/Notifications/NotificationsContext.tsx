import React from 'react';
import { NotificationsContextType } from '.';

const NotificationsContext = React.createContext<NotificationsContextType>({
  notifications: [],
  addNotification: () => '',
  dismiss: () => {},
  dismissAll: () => {},
  remove: () => {},
  clear: () => {},
});

export default NotificationsContext;
