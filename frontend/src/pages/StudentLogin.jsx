import React from "react";
import "./auth.css";

export default function StudentLogin() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Student Login</h2>

        <input className="auth-input" type="email" placeholder="Email" />
        <input className="auth-input" type="password" placeholder="Password" />

        <button className="auth-btn">Login as Student</button>

       

        <div className="switch-text">Go to Mentor Login</div>
      </div>
    </div>
  );
}
