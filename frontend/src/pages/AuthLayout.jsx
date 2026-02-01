import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./auth.css";

export default function AuthLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isMentor = location.pathname.includes("mentor");

  return (
    <div className="auth-wrapper">
      {/* LEFT: Flipping Card */}
      <div className="flip-wrapper">{children}</div>

      {/* RIGHT: Static Panel */}
      <div className="auth-right">
        <h1>Welcome Back!</h1>

        {isMentor ? (
          <p>Login as a mentor to continue</p>
        ) : (
          <p>Login as a student to continue</p>
        )}

        <div
          className="switch-box"
          onClick={() =>
            navigate(isMentor ? "/login/student" : "/login/mentor")
          }
        >
          <span>{isMentor ? "Student" : "Mentor"}</span>
          <p>☝🏻 click to switch</p>
        </div>
      </div>
    </div>
  );
}
