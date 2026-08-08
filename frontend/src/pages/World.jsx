import Navbar from "../components/Navbar";

function WorldPage({ setPage }) {
  return (
    <main className="page world-page">
      <Navbar setPage={setPage} />

      <div className="world-container">

        {/* 
          JUDE'S THREE.JS WORLD GOES HERE

          Eventually:

          <World creations={creations} />

        */}

        <div className="world-placeholder">
          <div>
            <span className="eyebrow">
              ✦ THE LIVING WORLD
            </span>

            <h1>ScribblePark</h1>

            <p>
              The Three.js world will live here.
            </p>

            <button
              className="primary-button"
              onClick={() => setPage("drawing")}
            >
              Draw something new ✦
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

export default WorldPage;