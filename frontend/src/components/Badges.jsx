import React from "react";

export default function Badges({ list = [] }) {
  return (
    <div className="mini-card">
      <h4>Badges</h4>
      <ul>
        {list.length === 0 ? <li className="small">No badges yet</li> :
          list.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}
