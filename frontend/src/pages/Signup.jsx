import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", mentorId: "" });
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register(form);
      nav("/login");
    } catch (err) {
      console.error("signup failed", err);
      nav("/login");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <label>Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <label>Mentor ID
          <input value={form.mentorId} onChange={(e) => setForm({ ...form, mentorId: e.target.value })} />
        </label>
        <button className="btn" type="submit">Sign up</button>
        <div className="muted">Already have an account? <Link to="/login">Sign in</Link></div>
      </form>
    </div>
  );
}
