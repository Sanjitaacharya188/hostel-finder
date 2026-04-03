import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

import hostel1 from "../assets/hostel1.jpg";
import hostel2 from "../assets/hostel2.png";
import hostel3 from "../assets/hostel3.jpg";
import hostel4 from "../assets/hostel4.jpg";

function Home() {
  const navigate = useNavigate();

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHostel, setSelectedHostel] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eSewa");

  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("priceLow");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [reviewComment, setReviewComment] = useState({});
  const [reviewRating, setReviewRating] = useState({});

  const hostelImages = {
    "Peace Hostel": hostel1,
    "Everest Hostel": hostel2,
    "Hamro Swarnim Sansar Girls Hostel": hostel3,
    "Sunrise Hostel": hostel4,
  };

  useEffect(() => {
    document.title = "Hostel Finder - Find Hostels";
    fetchHostels();
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hostels");
      setHostels(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setError("Failed to load hostels");
      setHostels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (hostelName) => {
    setSelectedHostel(hostelName);
    setStudentName(localStorage.getItem("userName") || "");
    setPhone("");
    setPaymentMethod("eSewa");
    setMessage("");
    setError("");
  };

  const closePopup = () => {
    setSelectedHostel(null);
    setStudentName("");
    setPhone("");
    setPaymentMethod("eSewa");
  };

  const submitBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first");
      return;
    }

    const cleanName = studentName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError("Enter your name");
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(cleanName)) {
      setError("Name must contain only letters");
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const res = await api.post("/book", {
        hostelName: selectedHostel,
        studentName: cleanName,
        phone: cleanPhone,
        paymentMethod,
      });

      setMessage(res.data.message || "Booking successful");
      setError("");
      closePopup();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  const addReview = async (hostelId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first to add review");
      return;
    }

    try {
      const res = await api.post(`/hostels/${hostelId}/reviews`, {
        comment: reviewComment[hostelId] || "",
        rating: Number(reviewRating[hostelId] || 5),
      });

      setMessage(res.data.message || "Review added successfully");
      setError("");
      setReviewComment((prev) => ({ ...prev, [hostelId]: "" }));
      setReviewRating((prev) => ({ ...prev, [hostelId]: "" }));
      fetchHostels();
    } catch (err) {
      setError(err.response?.data?.message || "Review failed");
    }
  };

  let filteredHostels = (Array.isArray(hostels) ? hostels : []).filter((h) => {
    const combinedText = `${h.name || ""} ${h.location || ""}`.toLowerCase();
    const matchesSearch = combinedText.includes(search.toLowerCase());
    const matchesPrice = maxPrice === "" || Number(h.price) <= Number(maxPrice);
    return matchesSearch && matchesPrice;
  });

  if (sortBy === "priceLow") {
    filteredHostels.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === "priceHigh") {
    filteredHostels.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === "ratingHigh") {
    filteredHostels.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Segoe UI, sans-serif",
        background: "#eef2f7",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #2563eb, #1e40af)",
          color: "white",
          padding: "48px 20px",
          borderRadius: "28px",
          textAlign: "center",
          marginBottom: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "58px", fontWeight: 800 }}>Hostel Finder</h1>
        <p style={{ marginTop: "14px", fontSize: "22px" }}>
          Find safe, affordable and recommended hostels easily
        </p>
      </div>

      {message && (
        <div
          style={{
            background: "#16a34a",
            color: "white",
            fontWeight: "bold",
            padding: "12px 18px",
            borderRadius: "10px",
            width: "fit-content",
            margin: "0 auto 20px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#dc2626",
            color: "white",
            fontWeight: "bold",
            padding: "12px 18px",
            borderRadius: "10px",
            width: "fit-content",
            margin: "0 auto 20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "18px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Search by hostel name or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "16px",
            width: "320px",
            borderRadius: "14px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            padding: "16px",
            width: "220px",
            borderRadius: "14px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "16px",
            width: "220px",
            borderRadius: "14px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        >
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="ratingHigh">Top Rated</option>
        </select>
      </div>

      {selectedHostel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Book {selectedHostel}</h2>

            <input
              type="text"
              placeholder="Your Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                if (onlyNumbers.length <= 10) {
                  setPhone(onlyNumbers);
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            >
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Cash">Cash</option>
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={submitBooking}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Pay & Book
              </button>

              <button
                onClick={closePopup}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", fontSize: "18px", fontWeight: 600 }}>
          Loading hostels...
        </p>
      ) : filteredHostels.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "20px", fontWeight: 600 }}>
          No hostels found 😔
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "25px",
          }}
        >
          {filteredHostels.map((h) => (
            <div
              key={h._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "22px",
                padding: "20px",
                background: "white",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
              }}
            >
              <img
                src={hostelImages[h.name] || hostel1}
                alt={h.name}
                onError={(e) => {
                  e.target.src = hostel1;
                }}
                style={{
                  width: "100%",
                  height: "240px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  marginBottom: "16px",
                }}
              />

              <h2 style={{ marginBottom: "12px", fontSize: "26px" }}>{h.name}</h2>

              <p>
                <strong>Location:</strong> {h.location}
              </p>

              <p>
                <strong>Price:</strong>{" "}
                <span style={{ color: "green", fontWeight: "bold" }}>
                  Rs. {h.price}
                </span>
              </p>

              <p>
                <strong>Rating:</strong> {"⭐".repeat(Math.floor(h.rating || 0))} ({h.rating || 0})
              </p>

              {Number(h.rating) >= 4.5 && (
                <p
                  style={{
                    color: "#15803d",
                    fontWeight: "bold",
                    background: "#dcfce7",
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    marginBottom: "12px",
                  }}
                >
                  Recommended
                </p>
              )}

              <div style={{ margin: "14px 0" }}>
                <h4 style={{ marginBottom: "10px" }}>Latest Reviews</h4>
                {!Array.isArray(h.reviews) || h.reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  h.reviews.slice(0, 2).map((r, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#f8fafc",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <strong>{r.userName}</strong> - {"⭐".repeat(r.rating)}
                      <p style={{ margin: "6px 0 0" }}>{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate(`/hostels/${h._id}`)}
                  style={{
                    padding: "10px 16px",
                    background: "#0f172a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  View Details
                </button>

                <button
                  onClick={() => handleBook(h.name)}
                  style={{
                    padding: "10px 16px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;