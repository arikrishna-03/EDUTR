import React, { useState } from "react";
import LogoutModal from "./LogoutModal";

export default function Topbar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    window.location.href = "/login";
  };

  return (
    <>
      <header style={{ height: 64, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 20px" }}>
        <button onClick={() => setShowLogoutModal(true)} style={{ padding: "8px 12px", borderRadius: 8 }} className="cursor-pointer">Logout</button>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
