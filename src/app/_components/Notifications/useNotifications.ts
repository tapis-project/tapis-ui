import { useContext, useMemo } from 'react';
import NotificationsContext from './NotificationsContext';
import { NotificationSeverity } from '.';

/** The shape the previous toast system took. Kept because callers still
 *  written against it exist — the V2 file explorer is the live one. */
type LegacyNotification = {
  icon?: string;
  status?: string;
  message: string;
};

/**
 * `add` is a compatibility shim, not the interface to write new code against.
 *
 * This provider replaced a dispatch-based toast system whose hook returned
 * `add({ icon, status, message })`. The file explorer V2 still calls it that
 * way, and silently dropping the method would have compiled on dev and broken
 * only at runtime, in the download path, where nobody looks until a user
 * reports a missing toast. New callers should use `addNotification`, which
 * takes a real title and severity instead of an icon name.
 */
const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  return useMemo(
    () => ({
      ...ctx,
      add: (notification: LegacyNotification) => {
        // the old shape carried no title, and its `status` was a loose
        // string; map the ones that mean something and let the rest be info
        const severity: NotificationSeverity =
          notification.status === 'error'
            ? 'error'
            : notification.status === 'warning'
            ? 'warning'
            : notification.status === 'success'
            ? 'success'
            : 'info';
        return ctx.addNotification('Files', notification.message, severity);
      },
    }),
    [ctx]
  );
};

export default useNotifications;
