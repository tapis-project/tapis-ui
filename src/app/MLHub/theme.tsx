import { createTheme } from '@mui/material/styles';
import { yellow } from '@mui/material/colors';
import '@mui/material/SvgIcon';

// Add a yellow to the theme pallet
declare module '@mui/material/styles' {
  interface Palette {
    yellow: Palette['primary'];
  }
  interface PaletteOptions {
    yellow?: PaletteOptions['primary'];
  }
}

// Add yellow as an option for color on MUI svg icons
declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    yellow: true;
  }
}

const theme = createTheme({
  cssVariables: true,
  palette: {
    yellow: {
      main: yellow[800], // Using 600 ensures decent visibility
      light: yellow[600],
      dark: yellow[900],
      contrastText: '#000000',
    },
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
