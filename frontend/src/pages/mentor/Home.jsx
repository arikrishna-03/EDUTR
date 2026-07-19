import React, { useState, useEffect } from 'react';
import {

    Search,
    Bell,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Upload
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { parseCalendarPDF, parseCalendarImage, parseTimeTableImage, parseTimeTablePDF } from '../../utils/calendarParser';
import DashboardHeader from '../../components/DashboardHeader';
import CalendarWidget from '../../components/CalendarWidget';
import TimetableWidget from '../../components/TimetableWidget';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

const Home = () => {

    // --- STATE ---
    const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
    const [mentorId, setMentorId] = useState('MENTOR123'); // Default fallback, updated on mount
    const [calendarView, setCalendarView] = useState('weekly'); // 'weekly' | 'monthly'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [parsedEvents, setParsedEvents] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [timetable, setTimetable] = useState(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay()); // 0-6 (Sun-Sat)
    const calendarInputRef = React.useRef(null);
    const timetableInputRef = React.useRef(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        // If the logged in user is a mentor, their ID is 'id'. 
        // We handle different formats based on Login.jsx storage logic.
        // Login.jsx stores: { role: 'mentor', id: 'MENTOR123', name: '...' }
        // Profile.jsx defines ID as 'MNT-2024-001' effectively through UI, but Login uses hardcoded.
        // We will prioritize the ID currently in session storage.
        if (user && user.role === 'mentor' && user.id) {
            setMentorId(user.id);
        } else if (user && user.role === 'mentor' && user.mentorId) {
            // Fallback if schema changes
            setMentorId(user.mentorId);
        }
    }, []);

    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0
    });

    useEffect(() => {
        const allStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
        const myStudents = allStudents.filter(s => s.mentorId === mentorId);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const history = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
        
        // Find today's record for this mentor
        const todayRecord = history.find(h => h.date === todayStr && h.mentorId === mentorId);
        
        let present = 0;
        let absent = 0;
        
        if (todayRecord) {
            todayRecord.records.forEach(r => {
                if (r.status === 'Present') present++;
                else if (r.status === 'Absent') absent++;
            });
        } else {
            // If no record submitted yet for today, default all to Present
            present = myStudents.length;
            absent = 0;
        }
        
        setStats({
            totalStudents: myStudents.length,
            presentToday: present,
            absentToday: absent
        });
    }, [mentorId]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    // Calendar event handlers removed as they are now in CalendarWidget

    // Timetable handlers moved to TimetableWidget

    // --- DATA ---
    const attendanceData = [
        { name: 'Mon', present: 85 },
        { name: 'Tue', present: 88 },
        { name: 'Wed', present: 82 },
        { name: 'Thu', present: 86 },
        { name: 'Fri', present: 92 },
        { name: 'Sat', present: 88 },
        { name: 'Sun', present: 90 },
    ];

    const messages = [
        { id: 1, name: 'Ravi', msg: 'Can you share notes?', time: '1h', avatar: 'R', color: 'bg-indigo-500' },
        { id: 2, name: 'Sonal', msg: 'Will attend tomorrow.', time: '3h', avatar: 'S', color: 'bg-blue-500' },
        { id: 3, name: 'Class A', msg: 'Group discussion scheduled', time: 'yesterday', avatar: 'C', color: 'bg-cyan-500' },
    ];

    const upcomingClasses = [
        { subject: 'AIDS - A', time: '10:00 AM - 11:00 AM' },
        { subject: 'Elective', time: '2:00 PM - 3:00 PM' },
    ];

    // Helper for Calendar Days
    // const daysInMonth = 31; // REPLACED by dynamic daysInMonth
    // const currentDays = [...Array(daysInMonth).keys()].map(i => i + 1); // REPLACED
    // Mock week: 7th to 13th
    const weekDays = [7, 8, 9, 10, 11, 12, 13];
    const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-6 text-slate-100">
            {/* 
        Unified Header Row 
        Contains "Class Tracker" Title AND the Global Controls (Search, Profile, etc.)
      */}
            {/* 
        Unified Header Row 
        Contains "Class Tracker" Title AND the Global Controls (Search, Profile, etc.)
      */}
            <DashboardHeader title="Class Tracker">

            </DashboardHeader>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#13151b] p-6 rounded-xl border border-white/5 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Total Students</h3>
                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
                </div>
                <div className="bg-[#13151b] p-6 rounded-xl border border-white/5 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Present Today</h3>
                    <p className="text-3xl font-bold">{stats.presentToday}</p>
                </div>
                <div className="bg-[#13151b] p-6 rounded-xl border border-white/5 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Absent Today</h3>
                    <p className="text-3xl font-bold">{stats.absentToday}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Areas (2 cols) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Attendance Trends Chart */}
                    <div className="bg-[#13151b] p-6 rounded-xl border border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg">Attendance Trends (7 days)</h3>
                            {/* List / Bar Toggle */}
                            <div className="flex items-center gap-4 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="chartType"
                                        className="accent-cyan-400"
                                        checked={chartType === 'line'}
                                        onChange={() => setChartType('line')}
                                    />
                                    <span className={chartType === 'line' ? 'text-white' : 'text-slate-400'}>Line</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="chartType"
                                        className="accent-cyan-400"
                                        checked={chartType === 'bar'}
                                        onChange={() => setChartType('bar')}
                                    />
                                    <span className={chartType === 'bar' ? 'text-white' : 'text-slate-400'}>Bar</span>
                                </label>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'line' ? (
                                    <AreaChart data={attendanceData}>
                                        <defs>
                                            <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="present" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorCyan)" />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="present" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                            <div className="text-center text-xs text-slate-500 mt-2 font-mono">Attendance (Last 7 days)</div>
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <CalendarWidget isEditable={true} mentorId={mentorId} />
                </div>

                {/* Right Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Messages */}
                    <div className="bg-[#13151b] p-6 rounded-xl border border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Messages</h3>
                            <span className="text-xs text-slate-500">Recent chats</span>
                        </div>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                                    <div className={`w-10 h-10 rounded-full ${msg.color} flex items-center justify-center text-white font-bold`}>
                                        {msg.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-medium text-sm text-white">{msg.name}</h4>
                                            <span className="text-xs text-slate-500">{msg.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate group-hover:text-slate-300">{msg.msg}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg text-sm transition-colors">
                            View All Messages
                        </button>
                    </div>

                    {/* Daily Timetable Widget */}
                    <TimetableWidget isEditable={true} mentorId={mentorId} />
                </div>
            </div>
        </div>
    );
};

export default Home;
