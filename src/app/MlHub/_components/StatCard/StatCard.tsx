import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number | string;
  color?: string;
  onClick?: () => void;
}

export default function StatCard({
  icon,
  label,
  count,
  onClick,
  color = 'primary.main',
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          {count.toLocaleString()}
        </Typography>
      </Stack>
    </Paper>
  );
}
