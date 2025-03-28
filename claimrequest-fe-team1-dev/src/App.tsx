import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routers";
import { LoadingProvider } from "@/contexts/LoadingContext";

function App() {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
