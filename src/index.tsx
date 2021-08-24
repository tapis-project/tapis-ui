import React from 'react';
import ReactDOM from 'react-dom';
import App from 'tapis-app/App';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router } from 'react-router-dom';
import { SectionHeader } from 'tapis-ui/_common';
import TapisProvider from 'tapis-hooks/provider';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tapis-app/index.css';


ReactDOM.render(
  <React.StrictMode>
    <TapisProvider basePath="https://tacc.tapis.io">
      <Router>
        <SectionHeader className="tapis-ui__header">TAPIS UI</SectionHeader>
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
