import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { CircularProgress } from '@mui/material';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  caption?: string;
  count: number | string;
  color?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export default function StatCard({
  icon,
  label,
  caption,
  count,
  onClick,
  color = 'primary.main',
  isLoading,
}: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: {
          xs: '1 1 100%',
          sm: '1 1 calc(50% - 8px)',
          md: '1 1 calc(33.33% - 11px)',
        },
        minWidth: 0,
        cursor: 'pointer',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: color,
          width: 44,
          height: 44,
          '& .MuiSvgIcon-root': { fontSize: 22 },
        }}
      >
        {icon}
      </Avatar>
      <Stack spacing={0}>
        {isLoading ? (
          <CircularProgress aria-label="Loading…" />
        ) : (
          <span>
            <Typography
              variant="h6"
              display="inline"
              color="text.main"
              sx={{ fontWeight: 700 }}
            >
              {label}:
            </Typography>
            <Typography
              variant="h6"
              display="inline"
              color="text.secondary"
              sx={{ ml: '8px', fontWeight: 700 }}
            >
              {count.toLocaleString()}
            </Typography>
          </span>
        )}

        {caption && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 'normal' }}
          >
            {caption}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
