import Navbar from "../components/NavBar";

function DrawingPage({ setPage }) {
  return (
    <main className="page drawing-page">
      <Navbar setPage={setPage} />

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">✦ START DRAWING</div>
          <h1>Create your own park piece.</h1>
          <p>
            This space will host the drawing canvas and your creation tools.
          </p>

          <button className="primary-button" onClick={() => setPage("world")}>
            See the world ✦
          </button>
        </div>
      </section>
    </main>
  );
}

export default DrawingPage;
