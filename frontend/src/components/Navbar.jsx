import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { logout } from "../services/authService";
import LogoutModal from "./LogoutModal";

export default function Navbar({ onLogout }) {
  const { user } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function handleConfirmLogout() {
    logout();
    setShowLogoutModal(false);
    window.location.href = "/login";
    if (onLogout) onLogout();
  }

  return (
    <>
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="brand">EduTrack</div>
        </div>
        <div className="top-actions">
          <div className="profile small">
            <div>{user?.name || "Guest"}</div>
            <button className="btn small cursor-pointer" onClick={() => setShowLogoutModal(true)}>Logout</button>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
