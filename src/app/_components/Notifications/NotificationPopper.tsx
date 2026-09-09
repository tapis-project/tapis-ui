import React from 'react';
import { Box, Slide } from '@mui/material';
import { useNotifications } from '.';
import NotificationCard from './NotificationCard';

const NotificationPopper: React.FC = () => {
  const { notifications, dismiss, remove } = useNotifications();
  const active = notifications.filter((n) => !n.dismissed);
  const visible = active.slice(0, 6);

  if (visible.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 1,
        maxWidth: 520,
        width: '100%',
        pointerEvents: 'none',
        '& > *': { pointerEvents: 'auto' },
      }}
    >
      {visible.map((n) => (
        <Slide key={n.id} direction="up" in mountOnEnter unmountOnExit>
          <Box>
            <NotificationCard
              notification={n}
              onDismiss={() => dismiss(n.id)}
              onRemove={() => remove(n.id)}
            />
          </Box>
        </Slide>
      ))}
    </Box>
  );
};

export default NotificationPopper;
