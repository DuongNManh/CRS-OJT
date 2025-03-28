import { createRoot } from "react-dom/client";
import { QueryClient } from "react-query";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { ThemeProvider } from "./hooks/use-theme";
import "./index.scss";
import { worker } from "./mocks/browser";
import { persistor, store } from "./services/store/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3, // limit retry attempts
    },
  },
});

export async function enableMocking(isEnable: boolean) {
  if (isEnable) {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "production"
    ) {
      return worker.start({
        onUnhandledRequest: "bypass",
      });
    }
  }
}

enableMocking(false).then(() => {
  createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <ToastContainer />
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>,
  );
});
