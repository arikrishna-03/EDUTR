import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { logout } from "../services/authService";

export default function Navbar({ onLogout }) {
  const { user } = useContext(AuthContext);

  function handleLogout() {
    logout();
    window.location.href = "/login";
    if (onLogout) onLogout();
  }

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="brand">EduTrack</div>
      </div>
      <div className="top-actions">
        <div className="profile small">
          <div>{user?.name || "Guest"}</div>
          <button className="btn small" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}
