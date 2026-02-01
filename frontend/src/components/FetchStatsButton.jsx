import React, { useState } from "react";
import api from "../api/axiosConfig";

export default function FetchStatsButton({ onDone }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleFetch() {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post("/fetch-coding-stats"); // backend endpoint to trigger scraping/update
      setMsg(res.data?.message || "Fetch started");
      if (onDone) onDone(res.data);
    } catch (err) {
      console.error("fetch stats failed", err);
      setMsg("Failed to fetch (see console)");
    }
    setLoading(false);
  }

  return (
    <div>
      <button className="btn" onClick={handleFetch} disabled={loading}>
        {loading ? "Fetching..." : "Fetch Stats Now"}
      </button>
      {msg && <div className="small" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
