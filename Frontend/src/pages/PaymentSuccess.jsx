import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="page">
      <div className="card">
        <h1>Payment Successful ✅</h1>
        <p>Your booking has been confirmed successfully.</p>
        <Link className="primary-link" to="/bookings">
          Go to Bookings
        </Link>
      </div>
    </div>
  );
}