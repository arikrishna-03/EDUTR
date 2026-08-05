import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { 
    Calendar as CalendarIcon, ExternalLink, Clock, AlertCircle, Trophy, 
    Search, Filter, X, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays 
} from 'lucide-react';
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    eachDayOfInterval, isSameMonth, isSameDay 
} from 'date-fns';

export default function StudentContest() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [selectedDate, setSelectedDate] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    const defaultContests = [
        {
            id: 'c1',
            title: 'LeetCode Weekly Contest 410',
            platform: 'LeetCode',
            startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            startTime: '20:00',
            duration: '1.5 Hours',
            link: 'https://leetcode.com/contest/',
            description: 'Weekly algorithmic problem-solving challenge with 4 coding questions ranging from Easy to Hard.'
        },
        {
            id: 'c2',
            title: 'CodeChef Starters 145',
            platform: 'CodeChef',
            startDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
            startTime: '20:00',
            duration: '2 Hours',
            link: 'https://www.codechef.com/contests',
            description: 'Division 1, 2, 3 & 4 rated contest for beginner and advanced competitive programmers.'
        },
        {
            id: 'c3',
            title: 'EduTrack College Coding League - Round 1',
            platform: 'Custom',
            startDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
            startTime: '10:00',
            duration: '3 Hours',
            link: 'https://hackerrank.com',
            description: 'Exclusive intra-college competitive programming challenge. Top 10 qualify for Finals.'
        }
    ];

    const fetchContests = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('http://localhost:5000/api/contests', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setContests(data);
                        setLoading(false);
                        return;
                    }
                }
            }
        } catch (err) {
            console.warn("Backend offline or error fetching student contests, loading local data", err);
        }

        const local = JSON.parse(localStorage.getItem('contests') || 'null');
        if (local && local.length > 0) {
            setContests(local);
        } else {
            setContests(defaultContests);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContests();
        const handleStorageChange = () => fetchContests();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const filteredContests = contests.filter(contest => {
        const matchesSearch = (contest.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (contest.platform || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (contest.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = selectedPlatform === 'All' || contest.platform === selectedPlatform;
        const matchesDate = !selectedDate || contest.startDate === selectedDate;
        return matchesSearch && matchesPlatform && matchesDate;
    });

    const platforms = ['All', 'LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'Custom'];

    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay();
    const emptyPaddingDays = Array.from({ length: startDayOfWeek });

    return (
        <div className="space-y-6 text-slate-100 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="Coding Contests & Challenges" />

            {/* Filter and Date Chooser */}
            <div className="flex flex-col gap-4 bg-[#1a1c23] p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[200px] md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search contests by title or platform..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#13151b] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Date Chooser Input */}
                        <div className="flex items-center gap-2 bg-[#13151b] px-3 py-1.5 rounded-xl border border-white/10 text-slate-300">
                            <CalendarIcon size={18} className="text-indigo-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="bg-transparent border-none text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                    title="Clear date"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5">
                    <span className="text-xs text-slate-500 font-medium mr-1">Platform:</span>
                    {platforms.map(platform => (
                        <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                selectedPlatform === platform
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-[#13151b] border border-white/10 text-slate-400 hover:text-white'
                            }`}
                        >
                            {platform}
                        </button>
                    ))}
                    {selectedDate && (
                        <span className="ml-auto text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1.5">
                            Selected Date: <strong>{selectedDate}</strong>
                        </span>
                    )}
                </div>
            </div>

            {/* Calendar Chooser View */}
            {viewMode === 'calendar' && (
                <div className="bg-[#1a1c23] rounded-2xl border border-white/5 p-6 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <CalendarDays className="text-indigo-400" size={24} />
                            <h3 className="text-lg font-bold text-white">
                                {format(calendarMonth, 'MMMM yyyy')}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedDate('')}
                                className="px-3 py-1.5 bg-[#13151b] border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
                            >
                                Show All Dates
                            </button>
                            <button
                                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                                className="p-2 bg-[#13151b] border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCalendarMonth(new Date())}
                                className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                                className="p-2 bg-[#13151b] border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {emptyPaddingDays.map((_, idx) => (
                            <div key={`empty-${idx}`} className="h-24 rounded-xl bg-white/[0.01] border border-transparent"></div>
                        ))}

                        {daysInMonth.map((dayDate) => {
                            const dateStr = format(dayDate, 'yyyy-MM-dd');
                            const dayContests = contests.filter(c => c.startDate === dateStr);
                            const isSelected = selectedDate === dateStr;
                            const isToday = isSameDay(dayDate, new Date());

                            return (
                                <div
                                    key={dateStr}
                                    onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                                    className={`h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                                        isSelected
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                                            : isToday
                                            ? 'bg-white/5 border-purple-500/50'
                                            : 'bg-[#13151b] border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                                            isToday
                                                ? 'bg-purple-500 text-white'
                                                : isSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-400 group-hover:text-white'
                                        }`}>
                                            {format(dayDate, 'd')}
                                        </span>
                                        {dayContests.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30">
                                                {dayContests.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 flex-1 overflow-hidden mt-1">
                                        {dayContests.slice(0, 2).map((c, i) => (
                                            <div
                                                key={i}
                                                className="text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium"
                                                title={c.title}
                                            >
                                                {c.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Contests Cards */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh] bg-[#13151b] rounded-3xl border border-white/5">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : filteredContests.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#13151b] rounded-3xl border border-white/5">
                    <div className="bg-indigo-500/10 p-4 rounded-full mb-4 text-indigo-400">
                        <Trophy size={48} />
                    </div>
                    <p className="text-xl text-slate-400 font-medium">No contests found.</p>
                    {selectedDate && (
                        <button
                            onClick={() => setSelectedDate('')}
                            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                        >
                            Clear Date Filter ({selectedDate})
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContests.map((contest) => (
                        <div key={contest.id || contest._id} className="bg-[#13151b] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                                        {contest.platform || 'Coding'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-wider">
                                        Upcoming
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                                    {contest.title}
                                </h3>

                                <p className="text-slate-400 text-xs mb-6 line-clamp-3 leading-relaxed">
                                    {contest.description || 'Join this competitive programming contest to enhance your problem solving skills.'}
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon size={14} className="text-indigo-400" />
                                        <span>{contest.startDate || 'TBA'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <Clock size={14} className="text-purple-400" />
                                        <span>{contest.duration || '2 Hours'}</span>
                                    </div>
                                </div>

                                {contest.link && (
                                    <a
                                        href={contest.link.startsWith('http') ? contest.link : `https://${contest.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all text-xs shadow-md shadow-indigo-500/20"
                                    >
                                        Participate Now <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
