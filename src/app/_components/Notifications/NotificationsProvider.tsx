import React, { useReducer } from 'react';
import {
  NotificationsContextType,
  NotificationRecord,
  Notification,
  NotificationToast,
} from '.';
import NotificationsContext from './NotificationsContext';

export const reducer = (
  state: Array<NotificationRecord>,
  action: {
    operation: 'add' | 'markread' | 'remove' | 'set';
    notification?: Notification;
    id: string;
  }
): Array<NotificationRecord> => {
  const { operation, notification, id } = action;
  if (operation === 'add') {
    if (!notification) {
      throw new Error('notification field missing');
    }
    return [{ notification, id, read: false }, ...state];
  }
  const index = state.findIndex((existing) => existing.id === id);
  if (index === -1) {
    throw new Error(`Could not find notification with id ${id}`);
  }
  if (operation === 'markread') {
    state[index].read = true;
    return [...state];
  }
  if (operation === 'set') {
    if (!notification) {
      throw new Error('notification field missing');
    }
    state[index].notification = { ...notification! };
    return [...state];
  }
  if (operation === 'remove') {
    state.splice(index, 1);
    return [...state];
  }
  return state;
};

const NotificationsProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [notifications, dispatch] = useReducer(
    reducer,
    [] as Array<NotificationRecord>
  );

  // Provide a context state for the rest of the application, including
  // a way of modifying the state
  const contextValue: NotificationsContextType = {
    notifications,
    dispatch,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      <NotificationToast />
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
