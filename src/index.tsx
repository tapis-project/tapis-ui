import React from 'react';
import ReactDOM from 'react-dom';
import App from 'tapis-app';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router } from 'react-router-dom';
import TapisProvider from 'tapis-hooks/provider';
import 'tapis-ui/index.css';

ReactDOM.render(
  <React.StrictMode>
    <TapisProvider basePath="https://tacc.tapis.io">
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
