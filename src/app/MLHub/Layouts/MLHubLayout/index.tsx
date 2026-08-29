import * as React from 'react';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../../theme';
import MLHubAppBar from './MLHubAppBar';

/* ─── Shared Layout (App Bar + content area) ──────────────────── */
interface MLHubLayoutProps {
  children: React.ReactNode;
  fullBleed?: boolean;
}

export default function MLHubLayout({
  children,
  fullBleed = false,
}: MLHubLayoutProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <MLHubAppBar />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            ...(fullBleed
              ? {}
              : {
                  maxWidth: 1400,
                  mx: 'auto',
                  px: { xs: 2, sm: 3 },
                  py: 3,
                }),
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
