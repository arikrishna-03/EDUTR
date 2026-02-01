import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const handleContinue = () => {
    if (role === "mentor") navigate("/mentor-login");
    if (role === "student") navigate("/student-login");
  };
  return (
    <div className="hero-screen">
      <div className="hero-inner">
        <h1>Welcome to Student & Mentor Portal</h1>
        <p>Please select your role to continue</p>
        <div className="role-card">
          <label style={{ display: "block", marginBottom: 8 }}>I am a:</label>
          <select value={role} onChange={(e)=>setRole(e.target.value)} style={{ padding:10, width:320, borderRadius:8 }}>
            <option value="">-- Select Role --</option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>
          <div style={{ marginTop:12 }}>
            <button className="btn-primary" onClick={handleContinue}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}
