import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HostelDetails from "./pages/HostelDetails";

function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "20px",
        background: "#0f172a",
        color: "white",
        marginTop: "40px",
        fontWeight: "500",
      }}
    >
      © 2026 Hostel Finder | Find safe and affordable hostels easily
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hostels/:id" element={<HostelDetails />} />

        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;