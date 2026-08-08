import { useEffect, useRef, useState } from "react";
import "./App.css";

const fakeDiscovery = {
  name: "Mossy",
  category: "Flora",
  species: "Whimsical Forest Flower",
  biome: "Forest",
  behaviour: "Sways gently in the breeze",
  creator: "You",
  traits: ["Friendly", "Sun-loving", "Very silly"],
};

function App() {
  const [screen, setScreen] = useState("landing");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [discovery, setDiscovery] = useState(null);
  const canvasRef = useRef(null);
  const lastPoint = useRef(null);

  // ---------- DRAWING ----------

  useEffect(() => {
    if (screen !== "drawing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#263b2c";
  }, [screen]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event) => {
    setIsDrawing(true);
    lastPoint.current = getPoint(event);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getPoint(event);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPoint.current = point;
    setHasDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setHasDrawing(false);
  };

  // ---------- BRING TO LIFE ----------

  const bringToLife = () => {
    if (!hasDrawing) return;

    setScreen("processing");

    setTimeout(() => {
      setDiscovery(fakeDiscovery);
      setScreen("discovery");
    }, 1800);
  };

  // ---------- SCREENS ----------

  if (screen === "landing") {
    return (
      <main className="app">
        <Navbar onWorld={() => setScreen("world")} />

        <section className="hero">
          <div className="hero-copy">
            <h1>
              Draw something.
              <br />
              <span>We'll give it a home.</span>
            </h1>

            <p className="hero-description">
              ScribblePark is a living world where your drawings become
              creatures, plants, and strange little things that live forever.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => setScreen("drawing")}
              >
                Start Drawing
                <span>✦</span>
              </button>

              <button
                className="text-button"
                onClick={() => setScreen("world")}
              >
                Explore the world →
              </button>
            </div>

          </div>

          <div className="hero-world">
            <div className="sun" />

            <div className="cloud cloud-one" />
            <div className="cloud cloud-two" />

            <div className="hill hill-back" />
            <div className="hill hill-front" />

            <div className="floating-flower flower-one">
              <div className="flower-head">✿</div>
              <div className="stem" />
            </div>

            <div className="floating-flower flower-two">
              <div className="flower-head">✿</div>
              <div className="stem" />
            </div>

            <div className="butterfly">🦋</div>

            <div className="hero-creature">
              <div className="creature-shadow" />
              <div className="creature-body">
                <div className="eye eye-left" />
                <div className="eye eye-right" />
                <div className="creature-mouth" />
                <div className="ear ear-left" />
                <div className="ear ear-right" />
              </div>
            </div>

            <div className="world-label">
              <span>✦</span>
              YOUR WORLD IS WAITING
            </div>
          </div>
        </section>

        <section className="how-section">
          <div className="section-heading">
            <span>HOW IT WORKS</span>
            <h2>One little scribble.<br />A whole new life.</h2>
          </div>

          <div className="steps">
            <Step
              number="01"
              icon="✏️"
              title="Draw"
              text="Put anything you can imagine on the canvas."
            />
            <Step
              number="02"
              icon="✨"
              title="Discover"
              text="AI figures out what your creation might be."
            />
            <Step
              number="03"
              icon="🌱"
              title="Give it a home"
              text="Your creation joins a shared living world."
            />
          </div>
        </section>

        <footer>
          <span>SCRIBBLEPARK</span>
          <span>Drawn by humans. Powered by imagination.</span>
        </footer>
      </main>
    );
  }

  if (screen === "drawing") {
    return (
      <main className="app drawing-screen">
        <Navbar onWorld={() => setScreen("world")} />

        <section className="drawing-layout">
          <div className="drawing-intro">
            <button className="back-button" onClick={() => setScreen("landing")}>
              ← Back
            </button>

            <div className="eyebrow">CREATE A DISCOVERY</div>

            <h1>
              What lives
              <br />
              in your head?
            </h1>

            <p>
              Draw a creature, flower, mushroom, monster, or something that
              doesn't have a name yet.
            </p>

            <div className="tiny-tip">
              <span>✦</span>
              Don't overthink it. Weird is welcome.
            </div>
          </div>

          <div className="drawing-area">
            <div className="paper">
              <div className="paper-label">
                <span>SCRIBBLE #001</span>
                <span>✦</span>
              </div>

              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="drawing-canvas"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
              />

              <div className="paper-corner">DRAW ME A FRIEND</div>
            </div>

            <div className="drawing-controls">
              <button className="secondary-button" onClick={clearDrawing}>
                Clear
              </button>

              <button
                className={`primary-button ${!hasDrawing ? "disabled" : ""}`}
                onClick={bringToLife}
                disabled={!hasDrawing}
              >
                Bring it to life
                <span>✦</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "processing") {
    return (
      <main className="app processing-screen">
        <div className="processing-content">
          <div className="processing-orbit">
            <div className="orbit-dot" />
            <div className="processing-scribble">✦</div>
          </div>

          <div className="eyebrow">DISCOVERING...</div>

          <h1>
            Giving your
            <br />
            scribble a life.
          </h1>

          <div className="processing-steps">
            <span className="complete">✓ Reading your drawing</span>
            <span className="active">✦ Finding its home</span>
            <span>○ Creating its personality</span>
          </div>
        </div>
      </main>
    );
  }

  if (screen === "discovery" && discovery) {
    return (
      <main className="app discovery-screen">
        <Navbar onWorld={() => setScreen("world")} />

        <section className="discovery-layout">
          <div className="discovery-art">
            <div className="discovery-glow" />

            <div className="discovery-creature">
              <div className="creature-body large">
                <div className="eye eye-left" />
                <div className="eye eye-right" />
                <div className="creature-mouth" />
                <div className="ear ear-left" />
                <div className="ear ear-right" />
              </div>
            </div>

            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✧</span>
            <span className="spark spark-three">·</span>
          </div>

          <div className="discovery-card">
            <div className="discovery-number">
              SPECIES DISCOVERY #001
            </div>

            <h1>{discovery.name}</h1>

            <p className="species-name">{discovery.species}</p>

            <div className="discovery-details">
              <Detail label="Category" value={discovery.category} />
              <Detail label="Habitat" value={`🌲 ${discovery.biome}`} />
              <Detail label="Behaviour" value={discovery.behaviour} />
              <Detail label="Creator" value={discovery.creator} />
            </div>

            <div className="traits">
              {discovery.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>

            <button
              className="primary-button full-width"
              onClick={() => setScreen("world")}
            >
              Place {discovery.name} in the world
              <span>→</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "world") {
    return (
      <main className="app world-placeholder">
        <Navbar onWorld={() => setScreen("world")} />

        <div className="fake-world">
          <div className="fake-sky" />
          <div className="fake-hill one" />
          <div className="fake-hill two" />

          <div className="world-tree tree-one">🌳</div>
          <div className="world-tree tree-two">🌲</div>
          <div className="world-flower flower-a">🌸</div>
          <div className="world-flower flower-b">🌼</div>
          <div className="world-flower flower-c">🌷</div>

          <div className="world-creature">🐸</div>

          <div className="world-overlay">
            <div>
              <span className="eyebrow">THE LIVING WORLD</span>
              <h1>ScribblePark</h1>
              <p>Every little drawing has a place here.</p>
            </div>

            <button
              className="primary-button"
              onClick={() => setScreen("drawing")}
            >
              Draw something new
              <span>✦</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}

function Navbar({ onWorld }) {
  return (
    <nav className="navbar">
      <button className="logo" onClick={() => window.location.reload()}>
        <span className="logo-mark">✿</span>
        <span>ScribblePark</span>
      </button>

      <div className="nav-right">
        <button className="nav-link" onClick={onWorld}>
          Explore World
        </button>

        <div className="nav-status">
          <span />
          1,284 discoveries
        </div>
      </div>
    </nav>
  );
}

function Step({ number, icon, title, text }) {
  return (
    <div className="step">
      <div className="step-top">
        <span>{number}</span>
        <span className="step-icon">{icon}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;