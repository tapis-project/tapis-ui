import React from 'react';
import 'react-hot-loader';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from './components';
import './index.css';
import * as serviceWorker from './serviceWorker';
import store from '../tapis-redux/store';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react-root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();