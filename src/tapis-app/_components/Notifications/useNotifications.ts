import { useContext } from 'react';
import NotificationsContext from './NotificationsContext';
import { Notification } from '.';
import { v4 as uuidv4 } from 'uuid';

const useNotifications = () => {
  const { notifications, dispatch } = useContext(NotificationsContext);

  const add = (notification: Notification) => {
    const id = uuidv4();
    dispatch({ operation: 'add', notification, id });
    return id;
  };

  const markread = (id: string) => {
    dispatch({ operation: 'markread', id });
  };

  const remove = (id: string) => {
    dispatch({ operation: 'remove', id });
  };

  const set = (id: string, notification: Notification) => {
    dispatch({ operation: 'set', id, notification });
  };

  return {
    notifications,
    add,
    markread,
    remove,
    set,
  };
};

export default useNotifications;
