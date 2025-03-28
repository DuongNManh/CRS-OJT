import React from 'react';
import ReactDOM from 'react-dom';
import './apps/index.css';
import App from './apps/App';
import { Provider } from 'react-redux';
import { store, persistor } from './services/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './hooks/use-theme';

ReactDOM.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
        <ToastContainer />
        <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>,
  document.getElementById('root')
);