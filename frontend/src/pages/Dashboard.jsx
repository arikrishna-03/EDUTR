import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import ChartArea from "../components/ChartArea";
import Leaderboard from "../components/Leaderboard";
import Badges from "../components/Badges";
import FetchStatsButton from "../components/FetchStatsButton";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/dashboard/summary");
        setStats(res.data.stats);
        setLeaderboard(res.data.leaderboard || []);
        setBadges(res.data.badges || []);
      } catch (err) {
        setStats({
          problems: 234,
          contests: 12,
          rating: 1760,
          attendance: "88%"
        });
        setLeaderboard([
          { name: "Student A", score: 2600 },
          { name: "Student B", score: 1980 },
          { name: "Student C", score: 1760 }
        ]);
        setBadges(["Hackathon Hero", "Coding Champ"]);
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
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <h2>Overview</h2>
            <FetchStatsButton onDone={(d)=>console.log("fetch done", d)} />
          </div>

          <div className="cards">
            <Card title="Problems Solved" value={stats ? stats.problems : "..."} />
            <Card title="Contests" value={stats ? stats.contests : "..."} />
            <Card title="Rating" value={stats ? stats.rating : "..."} />
            <Card title="Attendance" value={stats ? stats.attendance : "..."} />
          </div>

          <div className="charts">
            <ChartArea />
            <div className="right-stack">
              <Leaderboard items={leaderboard} />
              <Badges list={badges} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
