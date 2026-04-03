import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate("/home")}>
        Hostel Finder
      </div>

      <div className="nav-links">
        <Link className={isActive("/home") || isActive("/") ? "active-link" : ""} to="/home">
          Home
        </Link>

        {token && (
          <Link className={isActive("/bookings") ? "active-link" : ""} to="/bookings">
            Bookings
          </Link>
        )}

        {!token ? (
          <>
            <Link className={isActive("/login") ? "active-link" : ""} to="/login">
              Login
            </Link>
            <Link className={isActive("/register") ? "active-link" : ""} to="/register">
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="welcome-text">Hi, {userName || "User"}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;