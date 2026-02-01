import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MentorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/mentors/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("mentor", JSON.stringify(data.mentor));
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      window.location.href = "/mentor-dashboard"; // ✅ Redirect
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Error connecting to server");
  }
};

  return (
    <div className="login-container">
      <h2>Mentor Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default MentorLogin;
