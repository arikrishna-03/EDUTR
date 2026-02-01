import React from "react";

export default function Topbar() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <header style={{ height: 64, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 20px" }}>
      <button onClick={handleLogout} style={{ padding: "8px 12px", borderRadius: 8 }}>Logout</button>
    </header>
  );
}
