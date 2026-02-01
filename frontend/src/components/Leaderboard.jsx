import React from "react";

export default function Leaderboard({ items = [] }) {
  return (
    <div className="mini-card">
      <h4>Leaderboard</h4>
      <ol>
        {items.length === 0 ? <li className="small">No data</li> :
          items.map((it, i) => <li key={i}>{it.name} — {it.score}</li>)}
      </ol>
    </div>
  );
}
