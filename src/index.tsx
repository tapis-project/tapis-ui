import React from 'react';
import ReactDOM from 'react-dom';
import App from 'tapis-app';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router } from 'react-router-dom';
import TapisAppProvider from 'tapis-app/provider';
import 'tapis-ui/index.css';

ReactDOM.render(
  <React.StrictMode>
    <TapisAppProvider basePath="https://tacc.tapis.io">
      <Router>
        <App />
      </Router>
    </TapisAppProvider>
  </React.StrictMode>,
  document.getElementById('react-root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
