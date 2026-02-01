import React from "react";
import "./auth.css";

export default function MentorLogin() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mentor Login</h2>

        <input type="text" placeholder="Name" className="auth-input" />
        <input type="email" placeholder="Email" className="auth-input" />
        <input type="password" placeholder="Password" className="auth-input" />

        <button className="auth-btn">Login</button>

        <div className="divider">or</div>

        <button className="google-btn">Login with Google</button>
      </div>
    </div>
  );
}
