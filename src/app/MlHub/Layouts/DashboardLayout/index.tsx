import * as React from 'react';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../../theme';
import DashboardAppBar from './DashboardAppBar';

/* ─── Shared Layout (App Bar + content area) ──────────────────── */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <DashboardAppBar />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            maxWidth: 1400,
            mx: 'auto',
            width: '100%',
            px: { xs: 2, sm: 3 },
            py: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
