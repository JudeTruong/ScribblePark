function Navbar({ setPage }) {
  return (
    <nav className="navbar">

      <button
        className="logo"
        onClick={() => setPage("landing")}
      >
        <span>✿</span>
        ScribblePark
      </button>

      <div className="nav-right">

        <button
          className="nav-link"
          onClick={() => setPage("world")}
        >
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

export default Navbar;