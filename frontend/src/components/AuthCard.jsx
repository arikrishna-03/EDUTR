// src/components/AuthCard.jsx
import React, { useState } from "react";

export default function AuthCard({ initialMode = "student", onLogin }) {
  // mode: "student" or "mentor"
  const [mode, setMode] = useState(initialMode);
  const [flipped, setFlipped] = useState(initialMode === "mentor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  function toggleTo(m) {
    setMode(m);
    setFlipped(m === "mentor");
  }

  function handleSubmit(e) {
    e.preventDefault();
    // call parent login handler (will call backend). For now pass demo object.
    const payload = { role: mode, email, password, username };
    if (onLogin) onLogin(payload);
  }

  return (
    <div
      className="auth-wrap"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <div
        className={`flip-card ${flipped ? "flipped" : ""}`}
        // small hover preview: rotate slightly toward other side on hover
      >
        {/* FRONT - Student */}
        <div className="card-side card-front" onMouseEnter={() => {}}>
          <div className="left">
            <h3 className="card-title">Student Login</h3>
            <form className="form" onSubmit={handleSubmit}>
              <label className="field">
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </label>

              <label className="field">
                <input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                />
              </label>

              <button className="btn primary" type="submit">
                Login as Student
              </button>
            </form>

            <div className="social-row">
              <span className="small muted">or sign in with</span>
              <div className="socials">
                <a className="social-btn" href="#" onClick={(e)=>e.preventDefault()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12.3c0-.7-.1-1.4-.3-2.1H12v4h5.4c-.2 1-1 2.3-2.3 3l.1.7 3.4 2.6.2.1c2-1.9 3.2-4.6 3.2-7.3z" fill="#4285F4"/>
                    <path d="M12 22c2.7 0 5-1 6.7-2.6l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.2H3.8v.8C5.5 19.6 8.5 22 12 22z" fill="#34A853"/>
                    <path d="M6.2 13.7A6.8 6.8 0 016 12c0-.7.1-1.3.2-1.7V9.5H3.8A10 10 0 002 12c0 1.6.4 3.2 1.2 4.7l2.9-2z" fill="#FBBC05"/>
                    <path d="M12 6.5c1.4 0 2.6.5 3.6 1.5l2.7-2.7A10 10 0 0012 2 9.9 9.9 0 005.5 7.1L8.4 9c.8-2.3 3.1-4.5 6-4.5z" fill="#EA4335"/>
                  </svg>
                </a>

                <a className="social-btn" href="#" onClick={(e)=>e.preventDefault()}>
                  {/* GitHub */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 .5C5.7.5.9 5.3.9 11.6c0 4.7 3 8.6 7.2 10-.1-.9-.2-2.3.1-3.3.2-.7 1.4-4.6 1.4-4.6s-.4-.8-.4-2c0-1.9 1.1-3.3 2.4-3.3 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.8-1.1 4.3-.3 1.3.7 2.4 2 2.4 2.4 0 4-3.1 4-7.6 0-3.1-2.1-5.2-5.4-5.2-3.7 0-6 .8-6 3.6 0 .8.3 1.7.8 2.2.1.1.1.2.1.4 0 .4-.3 1.4-.4 2.1-.1.7-.4 1-.9 1.5-1.1.9-1.5.6-1.5.6.8 2.4 3.1 4 5.6 4 .4 0 .9 0 1.3-.1 2.8-.7 4.7-3.3 4.7-6.1C23.1 5.3 18.3.5 12 .5z" fill="#ffffff"/>
                  </svg>
                </a>

                <a className="social-btn" href="#" onClick={(e)=>e.preventDefault()}>
                  {/* LinkedIn */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.98H7v12H3v-12zM9.7 8.98h3.7v1.6h.1c.5-.9 1.8-1.9 3.6-1.9 3.8 0 4.5 2.5 4.5 5.7v6.6h-4v-5.9c0-1.4 0-3.2-2-3.2-2 0-2.4 1.6-2.4 3v6.1H9.7v-12z" fill="#0077B5"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="switch-row">
              <span className="small muted">Are you a Mentor?</span>
              <button className="btn ghost" onClick={() => toggleTo("mentor")}>Mentor Login</button>
            </div>
          </div>

          <div className="right purple-panel">
            <h2 className="welcome-title">Welcome Back!</h2>
            <p className="welcome-sub">Login as a student to continue</p>
            <button className="btn outline" onClick={() => toggleTo("mentor")}>Mentor</button>
          </div>
        </div>

        {/* BACK - Mentor */}
        <div className="card-side card-back" onMouseEnter={() => {}}>
          <div className="left">
            <h3 className="card-title">Mentor Login</h3>
            <form className="form" onSubmit={handleSubmit}>
              <label className="field">
                <input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  required
                />
              </label>

              <label className="field">
                <input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                />
              </label>

              <button className="btn primary" type="submit">
                Login as Mentor
              </button>
            </form>

            <div className="social-row">
              <span className="small muted">or sign in with</span>
              <div className="socials">
                <a className="social-btn" href="#" onClick={(e)=>e.preventDefault()}>
                  {/* same Google icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12.3c0-.7-.1-1.4-.3-2.1H12v4h5.4c-.2 1-1 2.3-2.3 3l.1.7 3.4 2.6.2.1c2-1.9 3.2-4.6 3.2-7.3z" fill="#4285F4"/>
                    <path d="M12 22c2.7 0 5-1 6.7-2.6l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.2H3.8v.8C5.5 19.6 8.5 22 12 22z" fill="#34A853"/>
                    <path d="M6.2 13.7A6.8 6.8 0 016 12c0-.7.1-1.3.2-1.7V9.5H3.8A10 10 0 002 12c0 1.6.4 3.2 1.2 4.7l2.9-2z" fill="#FBBC05"/>
                    <path d="M12 6.5c1.4 0 2.6.5 3.6 1.5l2.7-2.7A10 10 0 0012 2 9.9 9.9 0 005.5 7.1L8.4 9c.8-2.3 3.1-4.5 6-4.5z" fill="#EA4335"/>
                  </svg>
                </a>

                <a className="social-btn" href="#" onClick={(e)=>e.preventDefault()}>
                  {/* GitHub */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 .5C5.7.5.9 5.3.9 11.6c0 4.7 3 8.6 7.2 10-.1-.9-.2-2.3.1-3.3.2-.7 1.4-4.6 1.4-4.6s-.4-.8-.4-2c0-1.9 1.1-3.3 2.4-3.3 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.8-1.1 4.3-.3 1.3.7 2.4 2 2.4 2.4 0 4-3.1 4-7.6 0-3.1-2.1-5.2-5.4-5.2-3.7 0-6 .8-6 3.6 0 .8.3 1.7.8 2.2.1.1.1.2.1.4 0 .4-.3 1.4-.4 2.1-.1.7-.4 1-.9 1.5-1.1.9-1.5.6-1.5.6.8 2.4 3.1 4 5.6 4 .4 0 .9 0 1.3-.1 2.8-.7 4.7-3.3 4.7-6.1C23.1 5.3 18.3.5 12 .5z" fill="#ffffff"/>
                  </svg>
                </a>

                <a className="social-btn" href="#" onClick={(e)=>e.preventDefault()}>
                  {/* LinkedIn */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.98H7v12H3v-12zM9.7 8.98h3.7v1.6h.1c.5-.9 1.8-1.9 3.6-1.9 3.8 0 4.5 2.5 4.5 5.7v6.6h-4v-5.9c0-1.4 0-3.2-2-3.2-2 0-2.4 1.6-2.4 3v6.1H9.7v-12z" fill="#0077B5"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="switch-row">
              <span className="small muted">Go back to Student?</span>
              <button className="btn ghost" onClick={() => toggleTo("student")}>Student Login</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
