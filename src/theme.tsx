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

const Theme: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default Theme;
