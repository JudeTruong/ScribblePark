import { useState } from "react";
import LandingPage from "./pages/Landing";
import DrawingPage from "./pages/Drawing";
import WorldPage from "./pages/World";
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