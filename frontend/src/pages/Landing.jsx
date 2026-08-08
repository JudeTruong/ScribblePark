import Navbar from "../components/Navbar";

function LandingPage({ setPage }) {
  return (
    <main className="page landing-page">
      <Navbar setPage={setPage} />

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            ✦ A WORLD MADE BY EVERYONE
          </div>

          <h1>
            Draw something.
            <br />
            <span>We'll give it a home.</span>
          </h1>

          <p>
            Draw a creature, plant, or anything you can imagine.
            We'll bring it to life and give it a place in our
            shared world.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() => setPage("drawing")}
            >
              Start Drawing ✦
            </button>

            <button
              className="text-button"
              onClick={() => setPage("world")}
            >
              Explore the World →
            </button>
          </div>
        </div>

        <div className="hero-world-preview">
          {/* Your cute CSS/illustration stuff goes here */}
          🌳 🦋 🌼 🐸
        </div>
      </section>
    </main>
  );
}

export default LandingPage;