import { Link } from "react-router-dom";

export default function PaymentFailure() {
  return (
    <div className="page">
      <div className="card">
        <h1>Payment Failed ❌</h1>
        <p>Your payment was not completed. Please try again.</p>
        <Link className="primary-link" to="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}