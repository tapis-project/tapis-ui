import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // primary: {
    //   main: '#2a9461',
    // },
    // secondary: {
    //   main: '#494c7d',
    // },
  },
});

const Theme: React.FC = ({ children }: React.PropsWithChildren<{}>) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default Theme;