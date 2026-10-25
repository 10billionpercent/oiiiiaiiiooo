import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src="/logo.png"
          alt="Yuragi logo"
          className="navbar-logo"
        />

        <div className="navbar-brand-text">
          <h1>YURAGI</h1>
          <p>Wind forecast decision support</p>
        </div>
      </div>

      <div className="navbar-links">
        <NavLink
          to="/forecast"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          Forecast
        </NavLink>

        <NavLink
          to="/accuracy"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          Accuracy
        </NavLink>
      </div>
    </nav>
  );
}