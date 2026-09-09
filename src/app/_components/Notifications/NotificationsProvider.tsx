import React, { useReducer, useCallback } from 'react';
import {
  AppNotification,
  NotificationsContextType,
  NotificationSeverity,
} from '.';
import NotificationsContext from './NotificationsContext';
import NotificationPopper from './NotificationPopper';

type Action =
  | { type: 'ADD'; notification: AppNotification }
  | { type: 'DISMISS'; id: string }
  | { type: 'DISMISS_ALL' }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

export function reducer(
  state: AppNotification[],
  action: Action
): AppNotification[] {
  switch (action.type) {
    case 'ADD':
      return [action.notification, ...state].slice(0, 50);
    case 'DISMISS':
      return state.map((n) =>
        n.id === action.id ? { ...n, dismissed: true } : n
      );
    case 'DISMISS_ALL':
      return state.map((n) => ({ ...n, dismissed: true }));
    case 'REMOVE':
      return state.filter((n) => n.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

let idCounter = 0;

const NotificationsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [notifications, dispatch] = useReducer(reducer, []);

  const addNotification = useCallback(
    (
      title: string,
      message: unknown,
      severity: NotificationSeverity = 'info'
    ) => {
      const id = `notif-${++idCounter}-${Date.now()}`;

      const push = (msg: string, statusCode?: number) =>
        dispatch({
          type: 'ADD',
          notification: {
            id,
            title,
            message: msg,
            severity,
            timestamp: Date.now(),
            dismissed: false,
            statusCode,
          },
        });

      // Handle fetch Response objects (e.g. from tapis-typescript SDK errors)
      const err = message as Record<string, unknown>;
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response instanceof Response
      ) {
        const resp = err.response.clone();
        const code = resp.status;
        resp
          .text()
          .then((body) => push(body, code))
          .catch(() => push(String(message), code));
      } else {
        const msg =
          message instanceof Error
            ? message.message
            : typeof message === 'string'
            ? message
            : JSON.stringify(message, null, 2);
        push(msg);
      }

      return id;
    },
    []
  );

  const dismiss = useCallback(
    (id: string) => dispatch({ type: 'DISMISS', id }),
    []
  );
  const dismissAll = useCallback(() => dispatch({ type: 'DISMISS_ALL' }), []);
  const remove = useCallback(
    (id: string) => dispatch({ type: 'REMOVE', id }),
    []
  );
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const contextValue: NotificationsContextType = {
    notifications,
    addNotification,
    dismiss,
    dismissAll,
    remove,
    clear,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      <NotificationPopper />
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
