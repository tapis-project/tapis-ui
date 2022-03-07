import React from 'react';
import { NotificationsContextType } from '.';

export const notificationsContext: NotificationsContextType = {
  notifications: [],
  dispatch: () => {},
};

const NotificationsContext: React.Context<NotificationsContextType> =
  React.createContext<NotificationsContextType>(notificationsContext);

export default NotificationsContext;
