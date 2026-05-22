import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    seatType: "",
    paymentMethod: "",
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/bookings/mine");
      setBookings(data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const startEdit = (booking) => {
    setEditing(booking);

    setForm({
      customerName: booking.customerName,
      phone: booking.phone,
      seatType: booking.seatType,
      paymentMethod: booking.paymentMethod,
    });
  };

  const updateBooking = async () => {
    try {
      if (!form.customerName.trim()) {
        return toast.error("Name is required");
      }

      if (!/^\d{10}$/.test(form.phone)) {
        return toast.error("Phone must be 10 digits");
      }

      await api.put(`/bookings/${editing._id}`, form);

      toast.success("Booking updated");
      setEditing(null);
      fetchBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Update failed"
      );
    }
  };

  const deleteBooking = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/bookings/${id}`);

      toast.success("Booking deleted");
      fetchBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  return (
    <div className="page">
      <h1>Booking History</h1>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b, index) => (
            <div className="booking-card" key={b._id}>
              <div className="booking-top">
                <h2>Booking #{index + 1}</h2>

                <span
                  className={`status ${
                    b.paymentStatus === "Paid"
                      ? "paid"
                      : "pending"
                  }`}
                >
                  {b.paymentStatus}
                </span>
              </div>

              <p>
                <strong>Hostel:</strong>{" "}
                {b.hostelName}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {b.customerName}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {b.phone}
              </p>

              <p>
                <strong>Seat:</strong>{" "}
                {b.seatLabel || b.seatType}
              </p>

              <p>
                <strong>Price:</strong> Rs.{" "}
                {b.price}
              </p>

              <p>
                <strong>Payment Method:</strong>{" "}
                {b.paymentMethod}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  b.createdAt
                ).toLocaleString()}
              </p>

              <div className="booking-buttons">
                <button
                  className="edit-btn"
                  onClick={() => startEdit(b)}
                >
                  Edit Booking
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteBooking(b._id)
                  }
                >
                  Delete Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Edit Booking</h2>

            <label>Name</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerName:
                    e.target.value,
                })
              }
            />

            <label>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />

            <label>Seat Type</label>
            <select
              value={form.seatType}
              onChange={(e) =>
                setForm({
                  ...form,
                  seatType:
                    e.target.value,
                })
              }
            >
              <option value="fourSeat">
                4 Seat
              </option>
              <option value="threeSeat">
                3 Seat
              </option>
              <option value="twoSeat">
                2 Seat
              </option>
              <option value="singleRoom">
                Single Room
              </option>
            </select>

            <label>Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentMethod:
                    e.target.value,
                })
              }
            >
              <option value="Cash">
                Cash
              </option>
              <option value="eSewa">
                eSewa
              </option>
              <option value="Khalti">
                Khalti
              </option>
            </select>

            <div className="modal-buttons">
              <button
                className="save-btn"
                onClick={updateBooking}
              >
                Update
              </button>

              <button
                className="cancel-btn"
                onClick={() =>
                  setEditing(null)
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}