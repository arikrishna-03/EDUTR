import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/students/${id}`);
        setStudent(res.data.student);
      } catch (err) {
        setStudent({ name: "Demo Student", roll: "711524BAD001", email: "demo@edu", problems: 120, rating: 1500 });
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
          <h2>{student?.name}</h2>
          <div className="small">Roll: {student?.roll}</div>
          <div style={{ marginTop: 12 }}>
            <table className="table">
              <tbody>
                <tr><th>Email</th><td>{student?.email}</td></tr>
                <tr><th>Problems</th><td>{student?.problems}</td></tr>
                <tr><th>Rating</th><td>{student?.rating}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
