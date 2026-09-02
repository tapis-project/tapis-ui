import { createTheme } from '@mui/material/styles';

// Deliberately NOT using CSS variables. A CSS-variables theme resolves palette
// tokens (background.default, text.primary, ...) to `var(--mui-*)`, which lets
// an outer/preview theme running in `system` mode (dark on a dark OS) leak its
// dark CSS variables onto :root and override this app.
//
// Instead we hard-code a light palette with cssVariables:false. Every color
// token then resolves to a concrete JS hex value (no var() indirection), so the
// app is deterministically light regardless of system preference.
const theme = createTheme({
  cssVariables: false,
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#64748b' },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
    info: { main: '#0284c7' },
    warning: { main: '#d97706' },
  },
});

export default theme;
