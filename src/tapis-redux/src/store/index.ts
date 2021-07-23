import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer'; 
import rootSaga from '../sagas';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [];

if (process.env.NODE_ENV === 'development') {
  //middlewares.push(createLogger());
}

middlewares.push(sagaMiddleware);

const configureStore = () => {
  const store = createStore(rootReducer, applyMiddleware(...middlewares));
  sagaMiddleware.run(rootSaga);
  return store;
} 

export default configureStore;