import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routers";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { LanguageProvider } from "./providers/LanguageProvider";

function App() {
  return (
    <LanguageProvider>
      <LoadingProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </LoadingProvider>
    </LanguageProvider>
  );
}

export default App;
