import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { useMemo, type PropsWithChildren } from 'react';

export const agentControlPlaneColors = {
  canvas: '#f8fafc',
  surface: '#ffffff',
  mutedSurface: '#f1f5f9',
  codeSurface: '#0f172a',
  border: '#e2e8f0',
  strongText: '#0f172a',
  mutedText: '#475569',
  success: '#047857',
  successSurface: '#ecfdf5',
  error: '#be123c',
  errorSurface: '#fff1f2',
  info: '#1d4ed8',
  infoSurface: '#eff6ff',
  secondary: '#0e7490',
  secondarySurface: '#ecfeff',
  warning: '#b45309',
  warningSurface: '#fffbeb',
} as const;

export const lightSurfaceBorder = `1px solid ${agentControlPlaneColors.border}`;

export const AgentControlPlaneTheme = ({ children }: PropsWithChildren) => {
  const parentTheme = useTheme();
  const theme = useMemo(
    () =>
      createTheme(parentTheme, {
        palette: {
          mode: 'light',
          background: {
            default: agentControlPlaneColors.canvas,
            paper: agentControlPlaneColors.surface,
          },
          text: {
            primary: agentControlPlaneColors.strongText,
            secondary: agentControlPlaneColors.mutedText,
          },
          divider: agentControlPlaneColors.border,
          success: { main: agentControlPlaneColors.success },
          error: { main: agentControlPlaneColors.error },
          warning: { main: agentControlPlaneColors.warning },
          info: { main: agentControlPlaneColors.info },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: `${agentControlPlaneColors.surface} !important`,
                backgroundImage: 'none',
                color: agentControlPlaneColors.strongText,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderColor: `${agentControlPlaneColors.border} !important`,
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderColor: `${agentControlPlaneColors.border} !important`,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderColor: `${agentControlPlaneColors.border} !important`,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: agentControlPlaneColors.border,
              },
              head: {
                backgroundColor: agentControlPlaneColors.mutedSurface,
                color: agentControlPlaneColors.mutedText,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: `${agentControlPlaneColors.surface} !important`,
              },
              notchedOutline: {
                borderColor: `${agentControlPlaneColors.border} !important`,
              },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                backgroundColor: agentControlPlaneColors.mutedSurface,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                color: `${agentControlPlaneColors.strongText} !important`,
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: `${agentControlPlaneColors.border} !important`,
              },
            },
          },
        },
      }),
    [parentTheme]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
