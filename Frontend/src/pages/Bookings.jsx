import { useEffect, useState } from "react";
import api from "../api";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingBooking, setEditingBooking] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    document.title = "My Bookings - Hostel Finder";
    fetchBookings();
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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setError("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this booking?");
    if (!ok) return;

    try {
      const res = await api.delete(`/bookings/${id}`);
      setMessage(res.data.message || "Booking deleted successfully");
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const startEdit = (booking) => {
    setEditingBooking(booking);
    setEditName(booking.studentName);
    setEditPhone(booking.phone);
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setEditName("");
    setEditPhone("");
  };

  const updateBooking = async () => {
    const cleanName = editName.trim();
    const cleanPhone = editPhone.trim();

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
      const res = await api.put(`/bookings/${editingBooking._id}`, {
        studentName: cleanName,
        phone: cleanPhone,
      });

      setMessage(res.data.message || "Booking updated successfully");
      closeEdit();
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

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
          padding: "38px 20px",
          borderRadius: "24px",
          textAlign: "center",
          marginBottom: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "46px", fontWeight: 800 }}>Booking History</h1>
        <p style={{ marginTop: "10px", fontSize: "20px" }}>
          View, edit and manage hostel bookings
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

      {editingBooking && (
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
            <h2 style={{ marginTop: 0 }}>Edit {editingBooking.hostelName}</h2>

            <input
              type="text"
              placeholder="Your Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
              value={editPhone}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                if (onlyNumbers.length <= 10) {
                  setEditPhone(onlyNumbers);
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

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={updateBooking}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Update
              </button>

              <button
                onClick={closeEdit}
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
          Loading bookings...
        </p>
      ) : bookings.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "20px", fontWeight: 600 }}>
          No bookings yet.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {bookings.map((booking, index) => (
            <div
              key={booking._id}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "18px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#1e3a8a", fontSize: "24px" }}>
                Booking #{index + 1}
              </h3>

              <p><strong>Hostel:</strong> {booking.hostelName}</p>
              <p><strong>Name:</strong> {booking.studentName}</p>
              <p><strong>Phone:</strong> {booking.phone}</p>
              <p><strong>Payment Method:</strong> {booking.paymentMethod || "Not set"}</p>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span
                  style={{
                    color: booking.paymentStatus?.toLowerCase().includes("paid")
                      ? "#16a34a"
                      : "#f59e0b",
                    fontWeight: 700,
                  }}
                >
                  {booking.paymentStatus || "Pending"}
                </span>
              </p>
              <p><strong>Date:</strong> {booking.date}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                <button
                  onClick={() => startEdit(booking)}
                  style={{
                    padding: "10px 16px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Edit Booking
                </button>

                <button
                  onClick={() => deleteBooking(booking._id)}
                  style={{
                    padding: "10px 16px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Delete Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;