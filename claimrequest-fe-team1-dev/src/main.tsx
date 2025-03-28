import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { ThemeProvider } from "./hooks/use-theme";
import "./index.scss";
import { worker } from "./mocks/browser";
import { persistor, store } from "./services/store/store";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

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
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
              <ToastContainer />
              <App />
            </I18nextProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>,
  );
});
