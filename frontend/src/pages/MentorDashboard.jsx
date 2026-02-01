import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";
import { fetchStudentsForDemo } from "../services/studentService";

export default function MentorDashboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/mentors/my-students");
        setStudents(res.data.students);
      } catch (err) {
        const demo = await fetchStudentsForDemo();
        setStudents(demo.students);
      }
    }
    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("edu_token");
    window.location.href = "/login";
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar onLogout={handleLogout} />
        <div className="content">
          <h2>Mentor Dashboard</h2>
          <p className="small">Quick list of your students</p>
          <table className="table" style={{ marginTop: 12 }}>
            <thead><tr><th>Name</th><th>Problems</th><th>Rating</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id}>
                  <td><a href={`/student/${s._id}`}>{s.name}</a></td>
                  <td>{s.problems}</td>
                  <td>{s.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
