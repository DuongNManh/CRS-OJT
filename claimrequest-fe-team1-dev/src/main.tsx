import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./apps/App";
import { PersistGate } from "redux-persist/integration/react";
import "./apps/index.css";
import { ThemeProvider } from "./hooks/use-theme";
import { persistor, store } from "./services/store/store";

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider>
        <ToastContainer />
        <App />
      </ThemeProvider>
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
