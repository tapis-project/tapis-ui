import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  ThemeProvider,
  createTheme,
  Button, // Added Button component
} from '@mui/material';
// // using anything from tapisui-common breaks everything
// import { SectionHeader } from '@tapis/tapisui-common';
// // tapisui-hooks is dandy!
// import { TapisProvider } from '@tapis/tapisui-hooks';



var theme = createTheme({})


// const Theme: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
//   return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
// };

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
  {/* <TapisProvider basePath='https://dev.develop.tapis.io'> */}
  <StrictMode>
    <App />
    {/* <SectionHeader></SectionHeader> */}
    <Button variant="contained">Hello</Button>
  </StrictMode>
  {/* </TapisProvider> */}
  </ThemeProvider>
)
