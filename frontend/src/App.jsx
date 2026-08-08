import { useState } from "react";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("landing");

  return (
    <div className="app">
      {screen === "landing" && (
        <div>
          <h1>ScribblePark</h1>
          <p>Draw something. Bring it to life.</p>
          <button onClick={() => setScreen("drawing")}>
            Start Drawing
          </button>
        </div>
      )}

      {screen === "drawing" && (
        <div>
          <h1>Draw your creation</h1>

          {/* Person 1's DrawingCanvas goes here */}

          <button onClick={() => setScreen("world")}>
            Bring to Life
          </button>
        </div>
      )}

      {screen === "world" && (
        <div>
          <h1>The Living World</h1>

          {/* Jude's Three.js World goes here */}

          <button onClick={() => setScreen("drawing")}>
            Draw Another
          </button>
        </div>
      )}
    </div>
  );
}

export default App;