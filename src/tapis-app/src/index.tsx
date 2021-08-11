import * as React from 'react';
import 'react-hot-loader';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import configureStore from '../../tapis-redux/src/store';
import App from './App';
import { SectionHeader } from 'tapis-ui/src/_common';
import TapisProvider from 'tapis-hooks/src/provider';
import './index.css';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';

const store = configureStore();

ReactDOM.render(
  <TapisProvider basePath="https://tacc.tapis.io">
    <Provider store={store}>
      <Router>
        <SectionHeader className="tapis-ui__header">TAPIS UI</SectionHeader>
        <App />
      </Router>
    </Provider>
  </TapisProvider>,
  document.getElementById('react-root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
