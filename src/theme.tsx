import React from 'react';
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from '@mui/material/styles';

var theme = createTheme({
  palette: {
    // primary: {
    //   main: '#2a9461',
    // },
    // secondary: {
    //   main: '#494c7d',
    // },
  },
  // typography: {
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        // Apply general styles that should affect all variants
        root: {
          // Styles here will apply to all variants including h6
        },
      },
      variants: [
        {
          props: { variant: 'body1' }, // Target the base case explicitly if it's 'body1' or adjust as needed
          style: {
            lineHeight: '1',
            fontSize: '.9rem',
            color: '#333333',
          },
        },
        // You can add more variants here if needed
      ],
    },
  },
});

// Makes font sizes responsive, might help with things, might make them better.
// Should just plug and play with MUI Typography
// https://mui.com/material-ui/customization/typography/#responsive-font-sizes
theme = responsiveFontSizes(theme, {
  breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'], // Custom breakpoints
  disableAlign: false, // Use the default value
  factor: 2, // Custom factor for font size adjustment
  variants: ['h1', 'body1'], // Specify which typography variants to include
});

// const Theme: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
//   return <>{children}</>;
// };

const Theme: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default Theme;
