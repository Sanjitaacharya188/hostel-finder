import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const seatMap = {
  fourSeat: "4 Seat",
  threeSeat: "3 Seat",
  twoSeat: "2 Seat",
  singleRoom: "Single Room",
};

const getImage = (name) => {
  if (name === "Hamro Swarnim Sansar Girls Hostel") return "/assets/hostel3.jpg";
  if (name === "Peace Hostel") return "/assets/hostel2.png";
  if (name === "Everest Hostel") return "/assets/hostel4.jpg";
  if (name === "Student Stay Hub") return "/assets/hero.png";
  return "/assets/hostel2.png";
};

export default function HostelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    seatType: "fourSeat",
    paymentMethod: "Cash",
  });

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const { data } = await api.get(`/hostels/${id}`);
        setHostel(data);
      } catch (error) {
        toast.error("Failed to fetch hostel");
      } finally {
        setLoading(false);
      }
    };

    fetchHostel();
  }, [id]);

  const price = useMemo(() => {
    return hostel?.seatPricing?.[form.seatType]?.price || 0;
  }, [hostel, form.seatType]);

  const available = useMemo(() => {
    return hostel?.seatPricing?.[form.seatType]?.available || 0;
  }, [hostel, form.seatType]);

  const submit = async (e) => {
  e.preventDefault();

  if (!user) {
    navigate("/login");
    return;
  }

  if (!form.customerName.trim()) {
    toast.error("Name is required");
    return;
  }

  if (!/^\d{10}$/.test(form.phone)) {
    toast.error("Phone must be 10 digits");
    return;
  }

  try {
    setBookingLoading(true);

    const { data } = await api.post("/bookings", {
      hostelId: id,
      customerName: form.customerName,
      phone: form.phone,
      seatType: form.seatType,
      paymentMethod: form.paymentMethod,
    });

    // Khalti payment redirect
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    // eSewa payment auto-submit form
    if (data.esewaForm) {
      const formEl = document.createElement("form");
      formEl.method = "POST";
      formEl.action = data.esewaForm.action;

      Object.entries(data.esewaForm.fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        formEl.appendChild(input);
      });

      document.body.appendChild(formEl);
      formEl.submit();
      return;
    }

    toast.success("Booking successful");
    navigate("/bookings");
  } catch (error) {
    toast.error(error.response?.data?.message || "Booking failed");
  } finally {
    setBookingLoading(false);
  }
};

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (!hostel) {
    return <div className="page">Hostel not found</div>;
  }

  return (
    <div className="page details-layout">
      <div className="card">
        <img
          src={getImage(hostel.name)}
          alt={hostel.name}
          className="details-image"
        />

        <h2>{hostel.name}</h2>
        <p>{hostel.location}</p>
        <p>{hostel.description}</p>
        <p>⭐ {hostel.rating}</p>

        <div className="badge-row">
          {hostel.facilities?.map((f) => (
            <span className="badge" key={f}>
              {f}
            </span>
          ))}
        </div>

        <div className="price-list">
          <div>
            <span>4 Seat Room</span>
            <strong>Rs. {hostel.seatPricing.fourSeat.price}</strong>
          </div>
          <div>
            <span>3 Seat Room</span>
            <strong>Rs. {hostel.seatPricing.threeSeat.price}</strong>
          </div>
          <div>
            <span>2 Seat Room</span>
            <strong>Rs. {hostel.seatPricing.twoSeat.price}</strong>
          </div>
          <div>
            <span>Single Room</span>
            <strong>Rs. {hostel.seatPricing.singleRoom.price}</strong>
          </div>
        </div>
      </div>

      <form className="card" onSubmit={submit}>
        <h2>Book Hostel</h2>

        <label>Seat Type</label>
        <select
          value={form.seatType}
          onChange={(e) => setForm({ ...form, seatType: e.target.value })}
        >
          <option value="fourSeat">
            4 Seat (Rs. {hostel.seatPricing.fourSeat.price})
          </option>
          <option value="threeSeat">
            3 Seat (Rs. {hostel.seatPricing.threeSeat.price})
          </option>
          <option value="twoSeat">
            2 Seat (Rs. {hostel.seatPricing.twoSeat.price})
          </option>
          <option value="singleRoom">
            Single Room (Rs. {hostel.seatPricing.singleRoom.price})
          </option>
        </select>

        <label>Payment</label>
        <select
          value={form.paymentMethod}
          onChange={(e) =>
            setForm({ ...form, paymentMethod: e.target.value })
          }
        >
          <option value="Cash">Cash</option>
          <option value="eSewa">eSewa</option>
          <option value="Khalti">Khalti</option>
        </select>

        <label>Name</label>
        <input
          type="text"
          value={form.customerName}
          onChange={(e) =>
            setForm({ ...form, customerName: e.target.value })
          }
          placeholder="Enter name"
        />

        <label>Phone</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="10 digit number"
        />

        <div className="summary-box">
          <div>
            <span>Hostel</span>
            <strong>{hostel.name}</strong>
          </div>
          <div>
            <span>Seat</span>
            <strong>{seatMap[form.seatType]}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{form.paymentMethod}</strong>
          </div>
          <div>
            <span>Available</span>
            <strong>{available} left</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>Rs. {price}</strong>
          </div>
        </div>

        <button type="submit" disabled={bookingLoading || available <= 0}>
          {bookingLoading
            ? "Processing..."
            : available <= 0
            ? "Sold Out"
            : "Book Now"}
        </button>
      </form>
    </div>
  );
}