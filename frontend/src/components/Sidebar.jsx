import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, LayoutGrid, Code, Users, ClipboardCheck, Settings, User } from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isMentor = user?.role === "mentor";

  // Sidebar Items Definition
  const mentorItems = [
    { path: '/mentor/home', label: 'Home', icon: Home },
    { path: '/mentor/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { path: '/mentor/students', label: 'Students', icon: Users },
    { path: '/mentor/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/mentor/hackathon', label: 'Hackathon', icon: Code },
  ];

  const studentItems = [
    { path: '/student/home', label: 'Home', icon: Home },
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutGrid }, // Analytics
    { path: '/student/students', label: 'Students', icon: Users },
    { path: '/student/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/student/hackathon', label: 'Hackathon', icon: Code },
  ];

  const items = isMentor ? mentorItems : studentItems;

  return (
    <aside className="sidebar flex flex-col h-full bg-[#0B0C10] border-r border-white/5 w-64 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">ET</div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">EduTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className="pt-4 border-t border-white/5 space-y-1">
        <NavLink
          to={isMentor ? "/mentor/profile" : "/student/profile"}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? "bg-white/5 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`
          }
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
        <NavLink
          to={isMentor ? "/mentor/settings" : "/student/settings"}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? "bg-white/5 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>

      <div className="mt-4 px-4 text-xs text-slate-600">
        Logged in as {user?.role || "Guest"}
      </div>
    </aside>
  );
}
