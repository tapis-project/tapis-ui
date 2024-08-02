import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from 'app';
import { TapisProvider } from '@tapis/tapisui-hooks';
import 'styles/index.css';
import { resolveBasePath } from 'utils/resolveBasePath';
import reportWebVitals from './reportWebVitals';
import { ExtensionsProvider } from './extensions';
import { Extension } from '@tapis/tapisui-extensions-core';
import { extension as icicleExtension } from '@icicle/tapisui-extension';
import { NotificationsProvider } from 'app/_components/Notifications';
import Theme from './theme'; // Import the Theme component

const initializedExtensions: { [key: string]: Extension } = {
  '@icicle/tapisui-extension': icicleExtension,
};

const container = document.getElementById('react-root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ExtensionsProvider extensions={initializedExtensions}>
      <TapisProvider basePath={resolveBasePath()}>
        <Theme>
          <NotificationsProvider>
            <Router>
              <App />
            </Router>
          </NotificationsProvider>
        </Theme>
      </TapisProvider>
    </ExtensionsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
