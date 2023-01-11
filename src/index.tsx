import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import App from 'tapis-app';
import TapisProvider from 'tapis-hooks/provider';
import 'tapis-ui/index.css';
import { resolveBasePath } from 'utils/resloveBasePath';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <TapisProvider basePath={resolveBasePath()}>
      <Router>
        <App />
      </Router>
    </TapisProvider>
  </React.StrictMode>,
  document.getElementById('react-root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
