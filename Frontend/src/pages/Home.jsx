import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Home() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    seat: "",
    payment: "",
    sort: "",
  });

  const getImage = (name) => {
    if (name === "Hamro Swarnim Sansar Girls Hostel") {
      return "/assets/hostel3.jpg";
    }
    if (name === "Peace Hostel") {
      return "/assets/hostel2.png";
    }
    if (name === "Everest Hostel") {
      return "/assets/hostel4.jpg";
    }
    if (name === "Student Stay Hub") {
      return "/assets/hostel1.jpg";
    }
    return "/assets/hostel2.png";
  };

  const fetchHostels = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/hostels", {
        params: filters,
      });

      const sorted = [...data].sort((a, b) => {
        if (a.name === "Hamro Swarnim Sansar Girls Hostel") return -1;
        if (b.name === "Hamro Swarnim Sansar Girls Hostel") return 1;
        return 0;
      });

      setHostels(sorted);
    } catch (err) {
      setError("Failed to fetch hostels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, [filters.search, filters.seat, filters.payment, filters.sort]);

  return (
    <div className="page">
      <section className="hero">
        <h1>Find safe and affordable hostels</h1>
        <p>Search, compare and book your stay with confidence.</p>
      </section>

      <div className="card filters">
        <input
          placeholder="Search by location or hostel name"
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
        />

        <select
          value={filters.seat}
          onChange={(e) =>
            setFilters({ ...filters, seat: e.target.value })
          }
        >
          <option value="">All Seats</option>
          <option value="fourSeat">4 Seat</option>
          <option value="threeSeat">3 Seat</option>
          <option value="twoSeat">2 Seat</option>
          <option value="singleRoom">Single Room</option>
        </select>

        <select
          value={filters.payment}
          onChange={(e) =>
            setFilters({ ...filters, payment: e.target.value })
          }
        >
          <option value="">All Payment</option>
          <option value="Cash">Cash</option>
          <option value="eSewa">eSewa</option>
          <option value="Khalti">Khalti</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) =>
            setFilters({ ...filters, sort: e.target.value })
          }
        >
          <option value="">Sort</option>
          <option value="priceLow">Price Low to High</option>
          <option value="ratingHigh">Rating High to Low</option>
        </select>
      </div>

      {loading ? (
        <p>Loading hostels...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="grid">
          {hostels.length === 0 ? (
            <p>No hostels found</p>
          ) : (
            hostels.map((hostel) => (
              <div className="card hostel-card" key={hostel._id}>
                <div style={{ position: "relative" }}>
                  <img src={getImage(hostel.name)} alt={hostel.name} />
                  {hostel.name === "Hamro Swarnim Sansar Girls Hostel" && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>

                <h3>{hostel.name}</h3>
                <p>{hostel.location}</p>
                <p>⭐ {hostel.rating}</p>

                <Link
                  className="primary-link"
                  to={`/hostels/${hostel._id}`}
                >
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}