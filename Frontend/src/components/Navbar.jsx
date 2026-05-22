import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Hostel Finder</Link>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        {user && <NavLink to="/bookings">Bookings</NavLink>}
        {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <>
            <span className="welcome">Hi, {user.name}</span>
            <button onClick={handleLogout} className="danger-btn">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}