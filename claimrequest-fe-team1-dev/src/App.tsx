import { LoadingProvider } from "@/contexts/LoadingContext";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./components/error/ErrorBoundary";
import Loading from "./components/Loading/Loading";
import { LanguageProvider } from "./providers/LanguageProvider";
import useRouteElement from "./useRouteElement";

function App() {
  const routeElement = useRouteElement();

  return (
    <LanguageProvider>
      <LoadingProvider>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary>
            {routeElement}
            <ToastContainer />
          </ErrorBoundary>
        </Suspense>
      </LoadingProvider>
    </LanguageProvider>
  );
}

export default App;
