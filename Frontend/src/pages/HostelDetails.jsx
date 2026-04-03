import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

import hostel1 from "../assets/hostel1.jpg";
import hostel2 from "../assets/hostel2.png";
import hostel3 from "../assets/hostel3.jpg";
import hostel4 from "../assets/hostel4.jpg";

function HostelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eSewa");

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hostelImages = {
    "Peace Hostel": hostel1,
    "Everest Hostel": hostel2,
    "Hamro Swarnim Sansar Girls Hostel": hostel3,
    "Sunrise Hostel": hostel4,
  };

  useEffect(() => {
    document.title = "Hostel Details - Hostel Finder";
    fetchHostel();
  }, [id]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchHostel = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hostels");
      const allHostels = Array.isArray(res.data) ? res.data : [];
      const found = allHostels.find((item) => item._id === id);
      setHostel(found || null);
    } catch (err) {
      console.log(err);
      setHostel(null);
    } finally {
      setLoading(false);
    }
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
        hostelName: hostel.name,
        studentName: cleanName,
        phone: cleanPhone,
        paymentMethod,
      });

      setMessage(res.data.message || "Booking successful");
      setStudentName("");
      setPhone("");
      setPaymentMethod("eSewa");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  };

  const addReview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first to add review");
      return;
    }

    if (!comment.trim() || !rating) {
      setError("Comment and rating are required");
      return;
    }

    try {
      const res = await api.post(`/hostels/${hostel._id}/reviews`, {
        comment: comment.trim(),
        rating: Number(rating),
      });

      setMessage(res.data.message || "Review added successfully");
      setComment("");
      setRating("");
      fetchHostel();
    } catch (err) {
      setError(err.response?.data?.message || "Review failed");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#eef2f7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        Loading hostel details...
      </div>
    );
  }

  if (!hostel) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#eef2f7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>Hostel not found</h2>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "12px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const imageSrc = hostelImages[hostel.name] || hostel1;

  return (
    <div
      style={{
        background: "#eef2f7",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
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
          maxWidth: "1150px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 10px 28px rgba(0,0,0,0.10)",
        }}
      >
        <img
          src={imageSrc}
          alt={hostel.name}
          onError={(e) => {
            e.target.src = hostel1;
          }}
          style={{
            width: "100%",
            height: "430px",
            objectFit: "cover",
          }}
        />

        <div style={{ padding: "28px" }}>
          <button
            onClick={() => navigate("/home")}
            style={{
              marginBottom: "18px",
              padding: "10px 16px",
              background: "#0f172a",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ← Back
          </button>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize: "46px",
              color: "#0f172a",
            }}
          >
            {hostel.name}
          </h1>

          {Number(hostel.rating) >= 4.5 && (
            <p
              style={{
                color: "#15803d",
                fontWeight: "bold",
                background: "#dcfce7",
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "999px",
                marginBottom: "18px",
              }}
            >
              Recommended Hostel
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "14px",
              }}
            >
              <strong>Location</strong>
              <p style={{ margin: "8px 0 0" }}>{hostel.location}</p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "14px",
              }}
            >
              <strong>Price</strong>
              <p style={{ margin: "8px 0 0", color: "green", fontWeight: "bold" }}>
                Rs. {hostel.price}
              </p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "14px",
              }}
            >
              <strong>Rating</strong>
              <p style={{ margin: "8px 0 0" }}>
                {"⭐".repeat(Math.floor(hostel.rating || 0))} ({hostel.rating || 0})
              </p>
            </div>
          </div>

          <a
            href={hostel.mapLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginBottom: "28px",
              color: "#2563eb",
              fontWeight: "bold",
              textDecoration: "none",
              fontSize: "18px",
            }}
          >
            View on Google Maps
          </a>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Book This Hostel</h2>

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
                  if (onlyNumbers.length <= 10) setPhone(onlyNumbers);
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

              <button
                onClick={submitBooking}
                style={{
                  padding: "12px 18px",
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

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Add Review</h2>

              <textarea
                placeholder="Write your review"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "90px",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />

              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              >
                <option value="">Select rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>

              <button
                onClick={addReview}
                style={{
                  padding: "12px 18px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Submit Review
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "14px" }}>All Reviews</h2>

            {!Array.isArray(hostel.reviews) || hostel.reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              hostel.reviews.map((review, index) => (
                <div
                  key={index}
                  style={{
                    background: "white",
                    padding: "14px",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <strong>{review.userName}</strong> - {"⭐".repeat(review.rating)}
                  <p style={{ margin: "8px 0 0" }}>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostelDetails;