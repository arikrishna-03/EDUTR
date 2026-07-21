import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/layout';
import MentorHome from './pages/mentor/Home';
import MentorProfile from './pages/mentor/Profile';
import MentorSettings from './pages/mentor/Settings';
import MentorHackathon from './pages/mentor/Hackathon';
import MentorStudents from './pages/mentor/Students';
import MentorDashboard from './pages/mentor/Dashboard';
import MentorAttendance from './pages/mentor/Attendance';
import StudentHome from './pages/student/Home';
import Hackathon from './pages/student/Hackathon';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/student/Profile';
import StudentSettings from './pages/student/Settings';
import StudentPlatformSettings from './pages/StudentPlatformSettings';
import Notifications from './pages/student/Notifications';

import MentorNotifications from './pages/mentor/Notifications';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Mentor Routes */}
      <Route path="/mentor" element={<Layout />}>
        <Route index element={<Navigate to="/mentor/home" replace />} />
        <Route path="home" element={<MentorHome />} />
        {/* Placeholder routes for other sidebar items */}
        <Route path="dashboard" element={<MentorDashboard />} />
        <Route path="students" element={<MentorStudents />} />
        <Route path="student/:studentId" element={<StudentDashboard />} />
        <Route path="attendance" element={<MentorAttendance />} />
        <Route path="hackathon" element={<MentorHackathon />} />
        <Route path="profile" element={<MentorProfile />} />
        <Route path="settings" element={<MentorSettings />} />
        <Route path="notifications" element={<MentorNotifications />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<Layout />}>
        <Route index element={<Navigate to="/student/home" replace />} />
        <Route path="home" element={<StudentHome />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="students" element={<div className="p-4 text-white">Student List Coming Soon</div>} />
        <Route path="attendance" element={<div className="p-4 text-white">Attendance View Coming Soon</div>} />
        <Route path="hackathon" element={<Hackathon />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="settings" element={<StudentSettings />} />
        <Route path="settings/platforms" element={<StudentPlatformSettings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Default redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
