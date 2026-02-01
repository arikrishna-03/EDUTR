import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: 40 }}>
      <h2>404 — Not Found</h2>
      <p>The page you're looking for does not exist.</p>
      <p><Link to="/">Go home</Link></p>
    </div>
  );
}
