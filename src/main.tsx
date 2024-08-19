import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { SectionHeader } from '@tapis/tapisui-common';

var theme = createTheme({})


// const Theme: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
//   return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
// };

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
  <StrictMode>
    <App />
  </StrictMode>
  </ThemeProvider>
)
