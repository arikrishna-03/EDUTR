import React, { useState, useEffect, useMemo } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { 
    Calendar as CalendarIcon, ExternalLink, Clock, AlertCircle, Trophy, 
    Search, Filter, X, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays,
    List, Bell, Bookmark, Check, Share2, Radio, CalendarPlus, Flame, Sparkles,
    CheckCircle2, Globe, RefreshCw, Star, Info
} from 'lucide-react';
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    eachDayOfInterval, isSameMonth, isSameDay 
} from 'date-fns';

// Platform Brand Styling Configuration
const PLATFORM_CONFIG = {
    LeetCode: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        gradient: 'from-amber-500/20 to-orange-500/10',
        accent: 'bg-amber-500',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        logoText: 'LC',
        color: '#FFA116'
    },
    CodeChef: {
        bg: 'bg-amber-800/10',
        text: 'text-amber-300',
        border: 'border-amber-700/30',
        gradient: 'from-amber-800/20 to-yellow-800/10',
        accent: 'bg-amber-700',
        badgeBg: 'bg-amber-800/20 text-amber-300 border-amber-700/30',
        logoText: 'CC',
        color: '#5B4638'
    },
    Codeforces: {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        gradient: 'from-sky-500/20 to-blue-600/10',
        accent: 'bg-sky-500',
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        logoText: 'CF',
        color: '#1F8ACB'
    },
    AtCoder: {
        bg: 'bg-slate-500/10',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        gradient: 'from-slate-600/20 to-zinc-700/10',
        accent: 'bg-slate-600',
        badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        logoText: 'AC',
        color: '#475569'
    },
    HackerRank: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500/20 to-teal-600/10',
        accent: 'bg-emerald-500',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        logoText: 'HR',
        color: '#2EC4B6'
    },
    GeeksforGeeks: {
        bg: 'bg-green-600/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
        gradient: 'from-green-600/20 to-emerald-700/10',
        accent: 'bg-green-600',
        badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30',
        logoText: 'GFG',
        color: '#2F8D46'
    },
    Custom: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        gradient: 'from-purple-600/20 to-indigo-600/10',
        accent: 'bg-purple-600',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        logoText: 'ET',
        color: '#8B5CF6'
    }
};

export default function StudentContest() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [statusTab, setStatusTab] = useState('All'); // 'All', 'Live', 'Upcoming', 'Past', 'Bookmarked'
    const [selectedDate, setSelectedDate] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'calendar'
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [bookmarkedIds, setBookmarkedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('codolio_reminders') || '[]');
        } catch (e) {
            return [];
        }
    });
    const [toastMessage, setToastMessage] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Save bookmarks to localStorage
    useEffect(() => {
        localStorage.setItem('codolio_reminders', JSON.stringify(bookmarkedIds));
    }, [bookmarkedIds]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const toggleBookmark = (id, title) => {
        setBookmarkedIds(prev => {
            const exists = prev.includes(id);
            if (exists) {
                showToast(`Removed reminder for "${title}"`);
                return prev.filter(item => item !== id);
            } else {
                showToast(`🔔 Reminder set for "${title}"!`);
                return [...prev, id];
            }
        });
    };

    // Default Seed Contests with realistic live/upcoming schedule
    const getDefaultContests = () => {
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        
        const day2 = new Date(now.getTime() + 86400000 * 2);
        const day3 = new Date(now.getTime() + 86400000 * 3);
        const day5 = new Date(now.getTime() + 86400000 * 5);
        const day7 = new Date(now.getTime() + 86400000 * 7);
        const pastDay = new Date(now.getTime() - 86400000 * 2);

        return [
            {
                id: 'c-live-1',
                title: 'LeetCode Weekly Contest 412',
                platform: 'LeetCode',
                startDate: todayStr,
                startTime: '10:30',
                duration: '1.5 Hours',
                status: 'Live',
                link: 'https://leetcode.com/contest/',
                description: 'Weekly algorithmic contest featuring 4 brand new problem challenges from Easy to Hard.',
                participants: 12450
            },
            {
                id: 'c-upcoming-1',
                title: 'CodeChef Starters 148 (Div 1, 2, 3 & 4)',
                platform: 'CodeChef',
                startDate: format(day2, 'yyyy-MM-dd'),
                startTime: '20:00',
                duration: '2 Hours',
                status: 'Upcoming',
                link: 'https://www.codechef.com/contests',
                description: 'Division 1, 2, 3 and 4 rated competitive programming challenge for all skill levels.',
                participants: 8900
            },
            {
                id: 'c-upcoming-2',
                title: 'Codeforces Round 965 (Div. 2)',
                platform: 'Codeforces',
                startDate: format(day3, 'yyyy-MM-dd'),
                startTime: '17:35',
                duration: '2 Hours',
                status: 'Upcoming',
                link: 'https://codeforces.com/contests',
                description: 'Official Div. 2 rated contest on Codeforces featuring 5-6 problem-solving tasks.',
                participants: 15200
            },
            {
                id: 'c-upcoming-3',
                title: 'EduTrack College Championship - Grand Finals',
                platform: 'Custom',
                startDate: format(day5, 'yyyy-MM-dd'),
                startTime: '09:00',
                duration: '3.5 Hours',
                status: 'Upcoming',
                link: 'https://hackerrank.com',
                description: 'Exclusive intra-college programming league finals. Top 3 coders win cash prizes and badges!',
                participants: 340
            },
            {
                id: 'c-upcoming-4',
                title: 'AtCoder Beginner Contest 367',
                platform: 'AtCoder',
                startDate: format(day7, 'yyyy-MM-dd'),
                startTime: '17:30',
                duration: '1.4 Hours',
                status: 'Upcoming',
                link: 'https://atcoder.jp/contests/',
                description: 'Japan’s premier competitive programming contest site. 8 mathematical and algorithmic tasks.',
                participants: 9100
            },
            {
                id: 'c-upcoming-5',
                title: 'GeeksforGeeks Weekly Contest 165',
                platform: 'GeeksforGeeks',
                startDate: format(day3, 'yyyy-MM-dd'),
                startTime: '19:00',
                duration: '1.5 Hours',
                status: 'Upcoming',
                link: 'https://practice.geeksforgeeks.org/events',
                description: 'GFG weekly contest featuring DSA problems designed for interview prep.',
                participants: 6700
            },
            {
                id: 'c-past-1',
                title: 'HackerRank World CodeSprint 2026',
                platform: 'HackerRank',
                startDate: format(pastDay, 'yyyy-MM-dd'),
                startTime: '14:00',
                duration: '3 Hours',
                status: 'Past',
                link: 'https://www.hackerrank.com/contests',
                description: 'Global coding sprint featuring algorithmic puzzles, data structures and optimization.',
                participants: 11000
            }
        ];
    };

    const fetchContests = async () => {
        setIsRefreshing(true);
        let loadedContests = [];

        try {
            // 1. Attempt internal backend fetch
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('http://localhost:5000/api/contests', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        loadedContests = data;
                    }
                }
            }
        } catch (err) {
            console.warn("Backend API offline for contests, using fallback data.");
        }

        // 2. Fetch public real-world Kontests API if reachable
        try {
            const extRes = await fetch('https://kontests.net/api/v1/all', { cache: 'no-store' });
            if (extRes.ok) {
                const extData = await extRes.json();
                if (Array.isArray(extData) && extData.length > 0) {
                    const mapped = extData.slice(0, 15).map((c, i) => {
                        let platform = 'Custom';
                        const site = (c.site || '').toLowerCase();
                        if (site.includes('leetcode')) platform = 'LeetCode';
                        else if (site.includes('codeforces')) platform = 'Codeforces';
                        else if (site.includes('codechef')) platform = 'CodeChef';
                        else if (site.includes('atcoder')) platform = 'AtCoder';
                        else if (site.includes('hackerrank')) platform = 'HackerRank';
                        else if (site.includes('geeks')) platform = 'GeeksforGeeks';

                        const st = new Date(c.start_time);
                        const isLive = c.status === 'CODING' || (c.in_24_hours === 'Yes' && new Date() >= st);

                        return {
                            id: `kontest-${i}-${c.name}`,
                            title: c.name,
                            platform: platform,
                            startDate: !isNaN(st.getTime()) ? format(st, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                            startTime: !isNaN(st.getTime()) ? format(st, 'HH:mm') : '18:00',
                            duration: c.duration ? `${(parseFloat(c.duration) / 3600).toFixed(1)} Hours` : '2 Hours',
                            status: isLive ? 'Live' : 'Upcoming',
                            link: c.url || 'https://leetcode.com',
                            description: `Live coding event aggregated from ${c.site || platform}.`,
                            participants: Math.floor(Math.random() * 5000) + 1200
                        };
                    });

                    // Merge external with internal
                    const existingIds = new Set(loadedContests.map(c => c.id || c.title));
                    const uniqueMapped = mapped.filter(m => !existingIds.has(m.id) && !existingIds.has(m.title));
                    loadedContests = [...uniqueMapped, ...loadedContests];
                }
            }
        } catch (e) {
            console.log("Kontests external API call skipped or offline.");
        }

        // 3. Fallback to localStorage or curated seed
        if (loadedContests.length === 0) {
            const local = JSON.parse(localStorage.getItem('contests') || 'null');
            if (local && local.length > 0) {
                loadedContests = local;
            } else {
                loadedContests = getDefaultContests();
            }
        }

        setContests(loadedContests);
        setLoading(false);
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchContests();
        const handleStorageChange = () => fetchContests();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Filter & Search Logic
    const filteredContests = useMemo(() => {
        return contests.filter(contest => {
            const title = (contest.title || '').toLowerCase();
            const platform = (contest.platform || '').toLowerCase();
            const desc = (contest.description || '').toLowerCase();
            const query = searchQuery.toLowerCase();

            const matchesSearch = !searchQuery || title.includes(query) || platform.includes(query) || desc.includes(query);
            const matchesPlatform = selectedPlatform === 'All' || contest.platform === selectedPlatform;
            const matchesDate = !selectedDate || contest.startDate === selectedDate;

            // Status Filter
            let matchesStatus = true;
            const isBookmarked = bookmarkedIds.includes(contest.id || contest._id);

            if (statusTab === 'Live') matchesStatus = contest.status === 'Live';
            else if (statusTab === 'Upcoming') matchesStatus = contest.status === 'Upcoming';
            else if (statusTab === 'Past') matchesStatus = contest.status === 'Past';
            else if (statusTab === 'Bookmarked') matchesStatus = isBookmarked;

            return matchesSearch && matchesPlatform && matchesDate && matchesStatus;
        });
    }, [contests, searchQuery, selectedPlatform, selectedDate, statusTab, bookmarkedIds]);

    // Metric Summary Counts
    const counts = useMemo(() => {
        const live = contests.filter(c => c.status === 'Live').length;
        const upcoming = contests.filter(c => c.status === 'Upcoming').length;
        const bookmarked = bookmarkedIds.length;
        return { total: contests.length, live, upcoming, bookmarked };
    }, [contests, bookmarkedIds]);

    const platformsList = ['All', 'LeetCode', 'CodeChef', 'Codeforces', 'AtCoder', 'HackerRank', 'GeeksforGeeks', 'Custom'];

    // Google Calendar URL helper
    const getGoogleCalendarUrl = (contest) => {
        try {
            const title = encodeURIComponent(contest.title || 'Coding Contest');
            const details = encodeURIComponent(
                `${contest.description || 'Competitive Programming Contest'}\n\nPlatform: ${contest.platform}\nDirect Link: ${contest.link}`
            );

            let startIso = '';
            let endIso = '';

            if (contest.startDate) {
                const timeStr = contest.startTime || '18:00';
                const startDt = new Date(`${contest.startDate}T${timeStr}:00`);
                if (!isNaN(startDt.getTime())) {
                    startIso = startDt.toISOString().replace(/-|:|\.\d\d\d/g, "");
                    const endDt = new Date(startDt.getTime() + 2 * 60 * 60 * 1000);
                    endIso = endDt.toISOString().replace(/-|:|\.\d\d\d/g, "");
                }
            }

            if (!startIso) {
                const now = new Date();
                startIso = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
                endIso = new Date(now.getTime() + 7200000).toISOString().replace(/-|:|\.\d\d\d/g, "");
            }

            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${encodeURIComponent(contest.platform || 'Online')}`;
        } catch (e) {
            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.title || 'Coding Contest')}`;
        }
    };

    // Calendar logic
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay();
    const emptyPaddingDays = Array.from({ length: startDayOfWeek });

    return (
        <div className="space-y-6 text-slate-100 animate-in fade-in duration-300 pb-12">
            <DashboardHeader title="Event Tracker" />

            {/* Toast Notification Banner */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 border border-indigo-400/30 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                    <Sparkles size={18} className="text-yellow-300 animate-spin" />
                    <span className="text-sm font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* Codolio Banner Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-[#161b26] to-[#13151b] rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wide flex items-center gap-1.5">
                                <Radio size={14} className="text-emerald-400 animate-pulse" />
                                Codolio Event Tracker
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Globe size={13} className="text-slate-500" /> Aggregated Live Calendar
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Coding Contests & Competitions
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Stay ahead of scheduled competitive programming contests across LeetCode, Codeforces, CodeChef, AtCoder, HackerRank, GeeksforGeeks & EduTrack. Set instant reminders & sync with your Google Calendar.
                        </p>
                    </div>

                    <button
                        onClick={fetchContests}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-2xl text-xs font-semibold transition-all hover:border-indigo-500/40 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Syncing Contests...' : 'Refresh Contests'}
                    </button>
                </div>

                {/* Metrics Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-white/10">
                    <div className="bg-[#13151b]/80 backdrop-blur-md p-3.5 md:p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">Total Events</div>
                            <div className="text-xl md:text-2xl font-bold text-white">{counts.total}</div>
                        </div>
                    </div>

                    <div className="bg-[#13151b]/80 backdrop-blur-md p-3.5 md:p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                            <Radio size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">Live Now</div>
                            <div className="text-xl md:text-2xl font-bold text-emerald-400">{counts.live}</div>
                        </div>
                    </div>

                    <div className="bg-[#13151b]/80 backdrop-blur-md p-3.5 md:p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">Upcoming</div>
                            <div className="text-xl md:text-2xl font-bold text-sky-400">{counts.upcoming}</div>
                        </div>
                    </div>

                    <div className="bg-[#13151b]/80 backdrop-blur-md p-3.5 md:p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                            <Bell size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 font-medium">My Reminders</div>
                            <div className="text-xl md:text-2xl font-bold text-amber-400">{counts.bookmarked}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Navigation Control Bar */}
            <div className="bg-[#161822] p-4 md:p-5 rounded-2xl border border-white/10 space-y-4 shadow-lg">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-[#10121a] p-1 rounded-xl border border-white/5 overflow-x-auto w-full lg:w-auto">
                        {[
                            { id: 'All', label: 'All Contests', icon: Trophy, count: counts.total },
                            { id: 'Live', label: 'Live Now', icon: Radio, count: counts.live, color: 'text-emerald-400' },
                            { id: 'Upcoming', label: 'Upcoming', icon: Clock, count: counts.upcoming, color: 'text-sky-400' },
                            { id: 'Past', label: 'Past', icon: CalendarIcon, count: null },
                            { id: 'Bookmarked', label: 'Saved Reminders', icon: Bell, count: counts.bookmarked, color: 'text-amber-400' }
                        ].map(tab => {
                            const TabIcon = tab.icon;
                            const isActive = statusTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatusTab(tab.id)}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <TabIcon size={14} className={isActive ? 'text-white' : tab.color || 'text-slate-400'} />
                                    <span>{tab.label}</span>
                                    {tab.count !== null && tab.count !== undefined && (
                                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* View Switcher & Search Bar */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[200px] md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search by contest title or platform..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#10121a] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Date Picker Input */}
                        <div className="flex items-center gap-2 bg-[#10121a] px-3 py-1.5 rounded-xl border border-white/10 text-slate-300">
                            <CalendarIcon size={16} className="text-indigo-400" />
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
                                    className="p-0.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                    title="Clear date filter"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* View Mode Toggle Buttons */}
                        <div className="flex items-center bg-[#10121a] p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg text-xs transition-all ${
                                    viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg text-xs transition-all ${
                                    viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                                title="List View"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-1.5 rounded-lg text-xs transition-all ${
                                    viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                                title="Calendar View"
                            >
                                <CalendarDays size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Platform Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-1">Platform:</span>
                    {platformsList.map(platform => {
                        const isSelected = selectedPlatform === platform;
                        const pStyle = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.Custom;
                        return (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'bg-[#10121a] border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                }`}
                            >
                                {platform !== 'All' && (
                                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : pStyle.accent}`}></span>
                                )}
                                {platform}
                            </button>
                        );
                    })}

                    {selectedDate && (
                        <span className="ml-auto text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1.5 whitespace-nowrap">
                            Date: <strong>{selectedDate}</strong>
                        </span>
                    )}
                </div>
            </div>

            {/* Calendar Interactive View */}
            {viewMode === 'calendar' && (
                <div className="bg-[#161822] rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                                <CalendarDays size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                {format(calendarMonth, 'MMMM yyyy')}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 transition-colors"
                                >
                                    Show All Dates
                                </button>
                            )}
                            <button
                                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                                className="p-2 bg-[#10121a] border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
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
                                className="p-2 bg-[#10121a] border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
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
                            <div key={`empty-${idx}`} className="h-28 rounded-2xl bg-white/[0.01] border border-transparent"></div>
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
                                    className={`h-28 p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                                        isSelected
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                                            : isToday
                                            ? 'bg-purple-900/10 border-purple-500/50'
                                            : 'bg-[#10121a] border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                                            isToday
                                                ? 'bg-purple-600 text-white'
                                                : isSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-400 group-hover:text-white'
                                        }`}>
                                            {format(dayDate, 'd')}
                                        </span>
                                        {dayContests.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30">
                                                {dayContests.length} {dayContests.length === 1 ? 'event' : 'events'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 flex-1 overflow-hidden mt-1.5">
                                        {dayContests.slice(0, 2).map((c, i) => {
                                            const pStyle = PLATFORM_CONFIG[c.platform] || PLATFORM_CONFIG.Custom;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`text-[10px] truncate px-1.5 py-0.5 rounded-md font-semibold ${pStyle.badgeBg}`}
                                                    title={c.title}
                                                >
                                                    {c.platform}: {c.title}
                                                </div>
                                            );
                                        })}
                                        {dayContests.length > 2 && (
                                            <div className="text-[9px] text-slate-400 font-bold">
                                                +{dayContests.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] bg-[#161822] rounded-3xl border border-white/10 p-8 space-y-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                        <Radio size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">Loading contests feed...</p>
                </div>
            ) : filteredContests.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center min-h-[45vh] text-center p-8 bg-[#161822] rounded-3xl border border-white/10 shadow-xl space-y-4">
                    <div className="bg-indigo-500/10 p-5 rounded-3xl border border-indigo-500/20 text-indigo-400">
                        <Trophy size={48} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">No Contests Found</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            No contests match your current search query or filter parameters. Try resetting your search or selecting another platform/tab.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {statusTab !== 'All' && (
                            <button
                                onClick={() => setStatusTab('All')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all"
                            >
                                Switch to All Contests
                            </button>
                        )}
                        {(selectedPlatform !== 'All' || searchQuery || selectedDate) && (
                            <button
                                onClick={() => {
                                    setSelectedPlatform('All');
                                    setSearchQuery('');
                                    setSelectedDate('');
                                }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            ) : viewMode === 'list' ? (
                /* List View Layout */
                <div className="bg-[#161822] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#10121a] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                                <tr>
                                    <th className="py-4 px-6">Contest & Platform</th>
                                    <th className="py-4 px-4">Date & Time</th>
                                    <th className="py-4 px-4">Duration</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-4 text-center">Coders</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-200">
                                {filteredContests.map((contest) => {
                                    const pStyle = PLATFORM_CONFIG[contest.platform] || PLATFORM_CONFIG.Custom;
                                    const isBookmarked = bookmarkedIds.includes(contest.id || contest._id);
                                    const isLive = contest.status === 'Live';

                                    return (
                                        <tr key={contest.id || contest._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${pStyle.badgeBg}`}>
                                                        {pStyle.logoText}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                            {contest.title}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${pStyle.accent}`}></span>
                                                            {contest.platform}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                                                    <CalendarIcon size={14} className="text-indigo-400" />
                                                    <span>{contest.startDate || 'TBA'}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {contest.startTime || '18:00'} IST
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 font-medium text-slate-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-purple-400" />
                                                    <span>{contest.duration || '2 Hours'}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                {isLive ? (
                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                                        LIVE NOW
                                                    </span>
                                                ) : contest.status === 'Upcoming' ? (
                                                    <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                                                        UPCOMING
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[10px] font-bold">
                                                        PAST
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-4 px-4 text-center">
                                                <span className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1">
                                                    <Flame size={13} className="text-orange-400" />
                                                    {(contest.participants || 1200).toLocaleString()}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleBookmark(contest.id || contest._id, contest.title)}
                                                        className={`p-2 rounded-xl border transition-all ${
                                                            isBookmarked
                                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                                                : 'bg-[#10121a] text-slate-400 border-white/10 hover:text-white'
                                                        }`}
                                                        title={isBookmarked ? "Remove reminder" : "Set reminder"}
                                                    >
                                                        <Bell size={14} className={isBookmarked ? 'fill-amber-400' : ''} />
                                                    </button>

                                                    <a
                                                        href={getGoogleCalendarUrl(contest)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl bg-[#10121a] border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                                                        title="Add to Google Calendar"
                                                    >
                                                        <CalendarPlus size={14} />
                                                    </a>

                                                    {contest.link && (
                                                        <a
                                                            href={contest.link.startsWith('http') ? contest.link : `https://${contest.link}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                                                        >
                                                            Join <ExternalLink size={13} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid View (Cards Layout) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContests.map((contest) => {
                        const pStyle = PLATFORM_CONFIG[contest.platform] || PLATFORM_CONFIG.Custom;
                        const isBookmarked = bookmarkedIds.includes(contest.id || contest._id);
                        const isLive = contest.status === 'Live';

                        return (
                            <div 
                                key={contest.id || contest._id} 
                                className={`bg-gradient-to-b ${pStyle.gradient} to-[#161822] border border-white/10 rounded-3xl p-6 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between group relative overflow-hidden`}
                            >
                                <div className="space-y-4">
                                    {/* Card Header: Platform Tag & Status */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${pStyle.badgeBg}`}>
                                                {pStyle.logoText}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${pStyle.badgeBg}`}>
                                                {contest.platform}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isLive ? (
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                                    LIVE NOW
                                                </span>
                                            ) : contest.status === 'Upcoming' ? (
                                                <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                                                    UPCOMING
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[10px] font-bold">
                                                    PAST
                                                </span>
                                            )}

                                            <button
                                                onClick={() => toggleBookmark(contest.id || contest._id, contest.title)}
                                                className={`p-1.5 rounded-xl border transition-all ${
                                                    isBookmarked
                                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-md shadow-amber-500/20'
                                                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                                                }`}
                                                title={isBookmarked ? "Remove reminder" : "Set reminder"}
                                            >
                                                <Bell size={15} className={isBookmarked ? 'fill-amber-400' : ''} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contest Title */}
                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                                        {contest.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                                        {contest.description || 'Join this competitive programming contest to enhance your problem solving skills.'}
                                    </p>

                                    {/* Attendees Badge */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                                            <Flame size={13} className="text-orange-400" />
                                            {(contest.participants || 1200).toLocaleString()} coders attending
                                        </span>
                                    </div>
                                </div>

                                {/* Metadata Footer & Actions */}
                                <div className="space-y-4 pt-5 mt-4 border-t border-white/10">
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                        <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl border border-white/5">
                                            <CalendarIcon size={14} className="text-indigo-400" />
                                            <span className="font-medium truncate">{contest.startDate || 'TBA'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl border border-white/5 justify-end">
                                            <Clock size={14} className="text-purple-400" />
                                            <span className="font-medium truncate">{contest.duration || '2 Hours'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Google Calendar Link Button */}
                                        <a
                                            href={getGoogleCalendarUrl(contest)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-indigo-400 transition-all"
                                            title="Add to Google Calendar"
                                        >
                                            <CalendarPlus size={16} />
                                        </a>

                                        {/* Direct Contest Link */}
                                        {contest.link && (
                                            <a
                                                href={contest.link.startsWith('http') ? contest.link : `https://${contest.link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95"
                                            >
                                                Participate Now <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
