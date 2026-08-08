import { useState } from "react";
import World from "./world/World";

function randomPlacement() {
  return {
    position: {
      x: Math.random() * 8 - 4,
      y: 0,
      z: Math.random() * 5 - 2.5,
    },
    scale: 0.9 + Math.random() * 0.5,
  };
}

export default function App() {
  const [creations, setCreations] = useState([]);

  function handlePngUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "image/png") {
      alert("Please select a PNG.");
      return;
    }

    const placement = randomPlacement();

    const newFlower = {
      id: `test-${Date.now()}`,
      name: file.name.replace(".png", ""),
      category: "flower",
      imageUrl: URL.createObjectURL(file),
      position: placement.position,
      scale: placement.scale,
      isPending: true,
    };

    setCreations((current) => [...current, newFlower]);

    // Allows selecting the same file again.
    event.target.value = "";
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <label style={uploadStyle}>
        Plant PNG
        <input
          type="file"
          accept="image/png"
          onChange={handlePngUpload}
          hidden
        />
      </label>

      <World creations={creations} />
    </div>
  );
}

const uploadStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 100,
  padding: "12px 20px",
  borderRadius: "999px",
  background: "#fffdf4",
  color: "#315638",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(42, 74, 45, 0.22)",
};
/*
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
import "./App.css";

export default function App() {
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
*/
