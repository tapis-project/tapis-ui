import React from 'react';
import ReactDOM from 'react-dom';
import App from 'tapis-app/src/App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import configureStore from 'tapis-redux/src/store';
import { SectionHeader } from 'tapis-ui/src/_common';
import TapisProvider from 'tapis-hooks/src/provider';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tapis-app/src/index.css';

const store = configureStore();

ReactDOM.render(
  <React.StrictMode>
    <TapisProvider basePath="https://tacc.tapis.io">
      <Provider store={store}>
        <Router>
          <SectionHeader className="tapis-ui__header">TAPIS UI</SectionHeader>
          <App />
        </Router>
      </Provider>
    </TapisProvider>
  </React.StrictMode>,
  document.getElementById('react-root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
