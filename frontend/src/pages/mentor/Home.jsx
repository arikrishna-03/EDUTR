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
        const savedProfile = JSON.parse(localStorage.getItem('mentorProfile') || '{}');
        if (savedProfile.mentorId) {
            setMentorId(savedProfile.mentorId.trim().toUpperCase());
            return;
        }

        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user && user.id) {
            setMentorId(user.id.trim().toUpperCase());
        } else if (user && user.mentorId) {
            setMentorId(user.mentorId.trim().toUpperCase());
        }
    }, []);

    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0
    });

    useEffect(() => {
        const activeId = mentorId.trim().toUpperCase();
        const allStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
        const myStudents = allStudents.filter(
            s => s.mentorId && s.mentorId.trim().toUpperCase() === activeId
        );
        
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



                    {/* Calendar Widget */}
                    <CalendarWidget isEditable={true} mentorId={mentorId} />
                </div>

                {/* Right Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Daily Timetable Widget */}
                    <TimetableWidget isEditable={true} mentorId={mentorId} />
                </div>
            </div>
        </div>
    );
};

export default Home;
