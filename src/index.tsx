import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import App from 'app';
import { TapisProvider } from '@tapis/tapisui-hooks';
import 'styles/index.css';
import { resolveBasePath } from 'utils/resolveBasePath';
import reportWebVitals from './reportWebVitals';
import { ExtensionsProvider } from './extensions';
import { Extension } from '@tapis/tapisui-extensions-core';
import { extension as icicleExtension } from '@icicle/tapisui-extension';

const initializedExtensions: { [key: string]: Extension } = {
  '@icicle/tapisui-extension': icicleExtension,
};

import { createRoot } from 'react-dom/client';
const container = document.getElementById('react-root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

root.render(
  <React.StrictMode>
    <ExtensionsProvider extensions={initializedExtensions}>
      <TapisProvider basePath={resolveBasePath()}>
        <Router>
          <App />
        </Router>
      </TapisProvider>
    </ExtensionsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
