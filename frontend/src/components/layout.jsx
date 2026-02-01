import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Code2,
  UserCircle,
  Settings,
  LogOut,
} from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if we are in Student View or Mentor View
  const isStudent = location.pathname.startsWith('/student');

  const mentorMenuItems = [
    { icon: Home, label: 'Home', path: '/mentor/home' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor/dashboard' },
    { icon: Users, label: 'Students', path: '/mentor/students' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/mentor/attendance' },
    { icon: Code2, label: 'Hackathon', path: '/mentor/hackathon' },
  ];

  const studentMenuItems = [
    { icon: Home, label: 'Home', path: '/student/home' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: Code2, label: 'Hackathon', path: '/student/hackathon' },
  ];

  const menuItems = isStudent ? studentMenuItems : mentorMenuItems;

  const bottomItems = isStudent ? [
    // specific student bottom items if any, or shared
    { icon: UserCircle, label: 'Profile', path: '/student/profile' }, // Assuming student profile route
    { icon: Settings, label: 'Settings', path: '/student/settings' },
  ] : [
    { icon: UserCircle, label: 'Profile', path: '/mentor/profile' },
    { icon: Settings, label: 'Settings', path: '/mentor/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0f1015] font-sans text-slate-100 overflow-hidden">
      {/* 
        Fixed Sidebar 
      */}
      <aside
        className="fixed top-0 left-0 h-full bg-[#0b0c10] border-r border-white/5 z-50 transition-all duration-300 ease-in-out w-20 hover:w-64 flex flex-col shadow-2xl group/sidebar"
      >
        {/* Logo Area */}
        <div
          onClick={() => navigate(isStudent ? '/student/dashboard' : '/mentor/home')}
          className="h-20 flex items-center px-6 border-b border-white/5 overflow-hidden whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="min-w-[32px] w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            E
          </div>
          <span className="ml-3 font-bold text-xl text-white opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
            EduTracker
          </span>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 mb-1
                  ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={22} className="min-w-[22px]" />
              <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-white/5 bg-black/20 overflow-hidden">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 mb-1
                  ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={22} className="min-w-[22px]" />
              <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75">
                {item.label}
              </span>
            </NavLink>
          ))}
          <button
            onClick={() => {
              localStorage.removeItem('currentUser');
              navigate('/login');
            }}
            className="w-full mt-2 flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <LogOut size={22} className="min-w-[22px]" />
            <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-75">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative ml-20 transition-all duration-300 scroll-smooth">
        {/* 
            Global Header REMOVED. 
            The page content (Home.jsx, etc.) will handle its own header row 
            to avoid duplication and match the 'Class Tracker' SPA look.
        */}

        {/* Page Content */}
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
