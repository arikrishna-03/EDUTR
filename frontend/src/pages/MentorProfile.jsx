import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";

export default function MentorProfile() {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/mentors/${id}`);
        setMentor(res.data.mentor);
      } catch (err) {
        setMentor({ name: "Demo Mentor", email: "mentor@edu" });
      }
    }
    load();
  }, [id]);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content">
          <h2>{mentor?.name}</h2>
          <div className="small">{mentor?.email}</div>
          <div style={{ marginTop: 12 }}>
            <p>Mentor details and actions will be shown here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
