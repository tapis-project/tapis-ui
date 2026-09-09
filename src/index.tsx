import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from 'app';
import { TapisProvider } from '@tapis/tapisui-hooks';
import 'styles/index.css';
import { resolveBasePath } from 'utils/resolveBasePath';
import { resolveMLHubBasePath } from 'utils/resolveMLHubBasePath';
import reportWebVitals from './reportWebVitals';
import { ExtensionsProvider, initializedExtensions } from './extensions';
import { NotificationsProvider } from 'app/_components/Notifications';
import Theme from './theme'; // Import the Theme component
import { registerModuleHeaders } from '@tapis/tapisui-api';
import { Pods as PodsModule } from '@tapis/tapis-typescript';
import { getPodsAdminMode } from 'utils/podsAdminMode';

// Register Pods admin header provider — injects X-Pods-Admin: true
// on every Pods API call when admin mode is active.
registerModuleHeaders(
  PodsModule,
  (): Record<string, string> =>
    getPodsAdminMode() ? { 'X-Pods-Admin': 'true' } : {}
);

// icicle.tapis.io is archived — redirect to icicleai.tapis.io.
if (window.location.hostname === 'icicle.tapis.io') {
  window.location.replace(
    window.location.href.replace('icicle.tapis.io', 'icicleai.tapis.io')
  );
}

const container = document.getElementById('react-root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ExtensionsProvider extensions={initializedExtensions}>
      <TapisProvider
        basePath={resolveBasePath()}
        mlHubBasePath={resolveMLHubBasePath()}
      >
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
