import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import DrawingPage from "./pages/DrawingPage";
import WorldPage from "./pages/WorldPage";
import "./App.css";

function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing" && (
        <LandingPage setPage={setPage} />
      )}

      {page === "drawing" && (
        <DrawingPage setPage={setPage} />
      )}

      {page === "world" && (
        <WorldPage setPage={setPage} />
      )}
    </>
  );
}

export default App;