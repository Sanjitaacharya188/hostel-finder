import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("All fields are required");
      return;
    }

    if (password.trim().length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await api.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      setMessage(res.data.message || "Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "420px", margin: "40px auto" }}>
      <h1>Register</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
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
          Register
        </button>
      </form>

      {message && <p style={{ marginTop: "12px", fontWeight: "bold" }}>{message}</p>}

      <p>
        Already have account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;