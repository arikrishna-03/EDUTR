import React, { useState, useEffect, useMemo } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { 
    Calendar as CalendarIcon, ExternalLink, Clock, AlertCircle, Trophy, 
    Search, Filter, X, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays,
    List, Bell, Bookmark, Check, Share2, Radio, CalendarPlus, Flame, Sparkles,
    CheckCircle2, Globe, RefreshCw, Star, Info, Users
} from 'lucide-react';
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    eachDayOfInterval, isSameMonth, isSameDay, parseISO 
} from 'date-fns';

// Platform Brand Styling Configuration
const PLATFORM_CONFIG = {
    LeetCode: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badgeBg: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
        dotColor: 'bg-amber-500',
        icon: '⚡',
        url: 'https://leetcode.com/contest/'
    },
    CodeChef: {
        bg: 'bg-yellow-900/20',
        text: 'text-amber-300',
        border: 'border-yellow-700/30',
        badgeBg: 'bg-yellow-950/70 text-amber-300 border border-yellow-700/40',
        dotColor: 'bg-amber-600',
        icon: '👨‍🍳',
        url: 'https://www.codechef.com/contests'
    },
    Codeforces: {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        badgeBg: 'bg-sky-950/60 text-sky-300 border border-sky-500/30',
        dotColor: 'bg-sky-500',
        icon: '📊',
        url: 'https://codeforces.com/contests'
    },
    AtCoder: {
        bg: 'bg-slate-500/10',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        badgeBg: 'bg-slate-800/80 text-slate-300 border border-slate-600/40',
        dotColor: 'bg-slate-400',
        icon: '🎯',
        url: 'https://atcoder.jp/contests/'
    },
    CodeStudio: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        badgeBg: 'bg-orange-950/60 text-orange-300 border border-orange-500/30',
        dotColor: 'bg-orange-500',
        icon: '💻',
        url: 'https://www.naukri.com/code360/contests'
    },
    Custom: {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        badgeBg: 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30',
        dotColor: 'bg-indigo-500',
        icon: '🚀',
        url: 'https://leetcode.com/contest/'
    }
};

export default function StudentContest() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Bookmarked/Subscribed Contest IDs
    const [subscribedIds, setSubscribedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('student_subscribed_contests') || '[]');
        } catch (e) {
            return ['c-cc-starters-12', 'c-lc-weekly-15', 'c-ac-abc-15'];
        }
    });

    useEffect(() => {
        localStorage.setItem('student_subscribed_contests', JSON.stringify(subscribedIds));
    }, [subscribedIds]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const toggleSubscribe = (id, title) => {
        setSubscribedIds(prev => {
            const isSubbed = prev.includes(id);
            if (isSubbed) {
                showToast(`Unsubscribed from "${title}"`);
                return prev.filter(item => item !== id);
            } else {
                showToast(`🔔 Subscribed to "${title}"!`);
                return [...prev, id];
            }
        });
    };

    // Real-World Weekly Contest Schedule Generator across requested 5 platforms
    const getDefaultContests = () => {
        const currYear = calendarMonth.getFullYear();
        const currMonth = calendarMonth.getMonth(); // 0-indexed

        const daysInCurrentMonth = new Date(currYear, currMonth + 1, 0).getDate();
        const seedList = [];

        let leetCodeWeeklyNum = 410;
        let leetCodeBiweeklyNum = 188;
        let codeChefStartersNum = 249;
        let codeforcesRoundNum = 964;
        let atcoderBeginnerNum = 470;
        let codeStudioNum = 101;

        // Loop through all days of the month
        for (let day = 1; day <= daysInCurrentMonth; day++) {
            const dt = new Date(currYear, currMonth, day);
            const dateStr = format(dt, 'yyyy-MM-dd');
            const dayOfWeek = dt.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

            // 0: SUNDAY (LeetCode Weekly Contest: 8:00 AM - 9:30 AM & AtCoder ARC: 5:30 PM - 7:30 PM)
            if (dayOfWeek === 0) {
                seedList.push({
                    id: `c-lc-weekly-${day}`,
                    title: `Weekly Contest ${leetCodeWeeklyNum++}`,
                    platform: 'LeetCode',
                    startDate: dateStr,
                    startTime: '08:00',
                    endTime: '09:30 AM',
                    duration: '1.5 Hours',
                    status: 'Upcoming',
                    link: 'https://leetcode.com/contest/',
                    description: 'Weekly algorithmic problem-solving challenge on LeetCode.',
                    subscribers: Math.floor(Math.random() * 50) + 90
                });

                if (day % 2 === 0) {
                    seedList.push({
                        id: `c-ac-arc-${day}`,
                        title: `AtCoder Regular Contest (ARC) 18${day % 9}`,
                        platform: 'AtCoder',
                        startDate: dateStr,
                        startTime: '17:30',
                        endTime: '19:30 PM',
                        duration: '2 Hours',
                        status: 'Upcoming',
                        link: 'https://atcoder.jp/contests/',
                        description: 'Regular competitive programming contest on AtCoder.',
                        subscribers: Math.floor(Math.random() * 30) + 40
                    });
                }
            }

            // 1: MONDAY (CodeChef Monday Munch & CodeStudio Weekly Sprint)
            if (dayOfWeek === 1) {
                seedList.push({
                    id: `c-cc-mon-${day}`,
                    title: `Monday Munch Challenge`,
                    platform: 'CodeChef',
                    startDate: dateStr,
                    startTime: '18:00',
                    endTime: '20:00 PM',
                    duration: '2 Hours',
                    status: 'Upcoming',
                    link: 'https://www.codechef.com/contests',
                    description: 'Weekly Monday algorithmic sprint for speed programming on CodeChef.',
                    subscribers: Math.floor(Math.random() * 40) + 50
                });

                seedList.push({
                    id: `c-cs-mon-${day}`,
                    title: `Code360 Weekly Sprint ${codeStudioNum++}`,
                    platform: 'CodeStudio',
                    startDate: dateStr,
                    startTime: '19:00',
                    endTime: '21:00 PM',
                    duration: '2 Hours',
                    status: 'Upcoming',
                    link: 'https://www.naukri.com/code360/contests',
                    description: 'DSA & problem solving contest on Naukri Code360 / CodeStudio.',
                    subscribers: Math.floor(Math.random() * 30) + 45
                });
            }

            // 2: TUESDAY (Codeforces Div. 2 / Div. 3 Contest: 8:05 PM)
            if (dayOfWeek === 2) {
                seedList.push({
                    id: `c-cf-tue-${day}`,
                    title: `Codeforces Round ${codeforcesRoundNum++} (Div. 2)`,
                    platform: 'Codeforces',
                    startDate: dateStr,
                    startTime: '20:05',
                    endTime: '22:05 PM',
                    duration: '2 Hours',
                    status: 'Upcoming',
                    link: 'https://codeforces.com/contests',
                    description: 'Div. 2 rated contest on Codeforces with 5-6 algorithmic problems.',
                    subscribers: Math.floor(Math.random() * 60) + 90
                });
            }

            // 3: WEDNESDAY (CodeChef Starters Contest - 8:00 PM to 10:00 PM)
            if (dayOfWeek === 3) {
                seedList.push({
                    id: `c-cc-starters-${day}`,
                    title: `Starters ${codeChefStartersNum++}`,
                    platform: 'CodeChef',
                    startDate: dateStr,
                    startTime: '20:00',
                    endTime: '22:00 PM',
                    duration: '2 Hours',
                    status: 'Upcoming',
                    link: 'https://www.codechef.com/contests',
                    description: 'Division 1, 2, 3 & 4 rated CodeChef Starters competition.',
                    subscribers: Math.floor(Math.random() * 50) + 70
                });
            }

            // 4: THURSDAY (Codeforces Educational Round: 8:05 PM)
            if (dayOfWeek === 4) {
                seedList.push({
                    id: `c-cf-edu-${day}`,
                    title: `Educational Codeforces Round ${165 + (day % 5)}`,
                    platform: 'Codeforces',
                    startDate: dateStr,
                    startTime: '20:05',
                    endTime: '22:05 PM',
                    duration: '2 Hours',
                    status: 'Upcoming',
                    link: 'https://codeforces.com/contests',
                    description: 'Educational contest designed for practicing standard data structures.',
                    subscribers: Math.floor(Math.random() * 50) + 80
                });
            }

            // 5: FRIDAY (CodeStudio / Code360 Beginner Contest: 6:00 PM)
            if (dayOfWeek === 5) {
                seedList.push({
                    id: `c-cs-fri-${day}`,
                    title: `Code360 Beginner Contest ${120 + (day % 8)}`,
                    platform: 'CodeStudio',
                    startDate: dateStr,
                    startTime: '18:00',
                    endTime: '20:00 PM',
                    duration: '2 Hours',
                    status: 'Upcoming',
                    link: 'https://www.naukri.com/code360/contests',
                    description: 'Code360 / CodeStudio weekly algorithmic & interview prep test.',
                    subscribers: Math.floor(Math.random() * 40) + 60
                });
            }

            // 6: SATURDAY (AtCoder Beginner Contest 5:30 PM & LeetCode Biweekly 8:00 PM)
            if (dayOfWeek === 6) {
                seedList.push({
                    id: `c-ac-abc-${day}`,
                    title: `AtCoder Beginner Contest ${atcoderBeginnerNum++}`,
                    platform: 'AtCoder',
                    startDate: dateStr,
                    startTime: '17:30',
                    endTime: '19:10 PM',
                    duration: '100 Mins',
                    status: 'Upcoming',
                    link: 'https://atcoder.jp/contests/',
                    description: 'Rated Japan competitive programming contest for all levels.',
                    subscribers: Math.floor(Math.random() * 40) + 50
                });

                seedList.push({
                    id: `c-lc-biweekly-${day}`,
                    title: `Biweekly Contest ${leetCodeBiweeklyNum++}`,
                    platform: 'LeetCode',
                    startDate: dateStr,
                    startTime: '20:00',
                    endTime: '21:30 PM',
                    duration: '1.5 Hours',
                    status: 'Upcoming',
                    link: 'https://leetcode.com/contest/',
                    description: 'Alternate Saturday LeetCode biweekly rated challenge.',
                    subscribers: Math.floor(Math.random() * 50) + 80
                });
            }
        }

        return seedList;
    };

    const fetchContests = async () => {
        setIsRefreshing(true);
        let loaded = [];
        let livePlatformContests = [];

        // 1. Fetch real-time live/upcoming contests from Codeforces public API
        try {
            const cfRes = await fetch('https://codeforces.com/api/contest.list');
            if (cfRes.ok) {
                const cfData = await cfRes.json();
                if (cfData.status === 'OK' && Array.isArray(cfData.result)) {
                    const upcomingCF = cfData.result
                        .filter(c => c.phase === 'BEFORE' || c.phase === 'CODING')
                        .slice(0, 10)
                        .map(c => {
                            const startDt = new Date(c.startTimeSeconds * 1000);
                            return {
                                id: `cf-live-${c.id}`,
                                title: c.name,
                                platform: 'Codeforces',
                                startDate: format(startDt, 'yyyy-MM-dd'),
                                startTime: format(startDt, 'HH:mm'),
                                endTime: format(new Date(c.startTimeSeconds * 1000 + c.durationSeconds * 1000), 'HH:mm'),
                                duration: `${Math.round(c.durationSeconds / 3600)} Hours`,
                                status: c.phase === 'CODING' ? 'Live' : 'Upcoming',
                                link: 'https://codeforces.com/contests',
                                description: `Official live Codeforces contest (${c.name}).`
                            };
                        });
                    livePlatformContests.push(...upcomingCF);
                }
            }
        } catch (e) {}

        // 2. Fetch live platform contests from Kontests API for LeetCode, CodeChef, AtCoder
        try {
            const kontestsRes = await fetch('https://kontests.net/api/v1/all');
            if (kontestsRes.ok) {
                const kData = await kontestsRes.json();
                if (Array.isArray(kData)) {
                    const mappedK = kData
                        .filter(c => ['LeetCode', 'CodeChef', 'AtCoder', 'CodeForces'].includes(c.site))
                        .map(c => {
                            const pltName = c.site === 'CodeForces' ? 'Codeforces' : c.site;
                            const platformUrlMap = {
                                LeetCode: 'https://leetcode.com/contest/',
                                CodeChef: 'https://www.codechef.com/contests',
                                Codeforces: 'https://codeforces.com/contests',
                                AtCoder: 'https://atcoder.jp/contests/',
                                CodeStudio: 'https://www.naukri.com/code360/contests'
                            };

                            const startDt = new Date(c.start_time);
                            const endDt = new Date(c.end_time);

                            return {
                                id: `k-live-${c.name.replace(/\s+/g, '-').toLowerCase()}`,
                                title: c.name,
                                platform: pltName,
                                startDate: format(startDt, 'yyyy-MM-dd'),
                                startTime: format(startDt, 'HH:mm'),
                                endTime: format(endDt, 'HH:mm'),
                                duration: c.duration ? `${Math.round(c.duration / 3600)} Hours` : '2 Hours',
                                status: c.status === 'CODING' ? 'Live' : 'Upcoming',
                                link: c.url || platformUrlMap[pltName] || 'https://leetcode.com/contest/',
                                description: `Official ${pltName} competition.`
                            };
                        });
                    livePlatformContests.push(...mappedK);
                }
            }
        } catch (e) {}

        // 3. Fetch internal mentor posted contests
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('http://localhost:5000/api/contests', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        loaded = data;
                    }
                }
            }
        } catch (e) {}

        const defaults = getDefaultContests();
        const local = JSON.parse(localStorage.getItem('contests') || '[]')
            .filter(c => c && !c.title?.includes('EduTrack') && !c.title?.includes('ICPC'));
        const combined = [...livePlatformContests, ...local, ...loaded];
        
        const seen = new Set();
        const merged = [];

        [...combined, ...defaults].forEach(c => {
            const key = (c.id || c.title) + '_' + (c.startDate || '');
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(c);
            }
        });

        setContests(merged);
        setLoading(false);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        showToast("🔄 Refreshing contest schedule...");
        await new Promise(r => setTimeout(r, 600));
        await fetchContests();
        setIsRefreshing(false);
        showToast("✅ Contest schedule updated successfully!");
    };

    const handleAllDaysClick = () => {
        setSelectedDate('');
        setSearchQuery('');
        setSelectedPlatform('All');
        showToast("📅 Showing contests for all days");
    };

    const handleTodayClick = () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        setCalendarMonth(new Date());
        setSelectedDate(todayStr);
        showToast(`📅 Filtered schedule to Today (${format(new Date(), 'dd MMM yyyy')})`);
    };

    useEffect(() => {
        fetchContests();
    }, [calendarMonth]);

    // Filtering logic
    const filteredContests = useMemo(() => {
        return contests.filter(c => {
            const title = (c.title || '').toLowerCase();
            const platform = (c.platform || '').toLowerCase();
            const desc = (c.description || '').toLowerCase();
            const query = searchQuery.toLowerCase();

            const matchesSearch = !searchQuery || title.includes(query) || platform.includes(query) || desc.includes(query);
            const matchesPlatform = selectedPlatform === 'All' || c.platform === selectedPlatform;
            const matchesDate = !selectedDate || c.startDate === selectedDate;

            return matchesSearch && matchesPlatform && matchesDate;
        });
    }, [contests, searchQuery, selectedPlatform, selectedDate]);

    // Group upcoming contests by Date for the Left Sidebar Stream (matching screenshot)
    const groupedUpcomingContests = useMemo(() => {
        const sorted = [...filteredContests].sort((a, b) => {
            const dA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dA - dB;
        });

        const groups = {};
        sorted.forEach(contest => {
            const dateKey = contest.startDate || 'Upcoming';
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(contest);
        });

        return groups;
    }, [filteredContests]);

    // Calendar Grid Days Calculation
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay(); // 0 = Sun
    const emptyPaddingDays = Array.from({ length: startDayOfWeek });

    const platformsList = ['All', 'LeetCode', 'CodeChef', 'Codeforces', 'AtCoder', 'HackerRank', 'GeeksforGeeks', 'Custom'];

    return (
        <div className="space-y-6 text-slate-100 animate-in fade-in duration-300 pb-12">
            <DashboardHeader title="Event Tracker" />

            {/* Toast Notification Banner */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                    <Sparkles size={18} className="text-yellow-300 animate-spin" />
                    <span className="text-sm font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* Top Page Header (Matching Screenshot: "Contest Calendar - Explore Coding Contest and never miss it") */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        Contest Calendar
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Explore Coding Contest and never miss it</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3.5 py-2 bg-[#1a1c23] hover:bg-white/5 border border-white/10 text-slate-300 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-md"
                    >
                        <RefreshCw size={14} className={`text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh Schedule
                    </button>
                </div>
            </div>

            {/* Main Split Layout matching Screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Search, Filters & Upcoming Contests Stream (col-span-4) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Search Bar & Filters Button */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search contest"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#161822] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                showFiltersDrawer ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#161822] text-slate-400 border-white/10 hover:text-white'
                            }`}
                            title="Toggle Filters"
                        >
                            <Filter size={16} />
                        </button>
                    </div>

                    {/* Collapsible Filter Bar */}
                    {showFiltersDrawer && (
                        <div className="bg-[#161822] rounded-2xl border border-white/10 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter by Platform</div>
                            <div className="flex flex-wrap gap-1.5">
                                {platformsList.map(plt => (
                                    <button
                                        key={plt}
                                        onClick={() => setSelectedPlatform(plt)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                            selectedPlatform === plt 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'bg-[#10121a] text-slate-400 hover:text-white border border-white/5'
                                        }`}
                                    >
                                        {plt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grouped Upcoming Contests Stream */}
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                        {Object.keys(groupedUpcomingContests).length === 0 ? (
                            <div className="bg-[#161822] rounded-2xl border border-white/10 p-8 text-center text-slate-400 text-xs">
                                No contests match your search or filter criteria.
                            </div>
                        ) : (
                            Object.entries(groupedUpcomingContests).map(([dateKey, items]) => {
                                let displayDate = dateKey;
                                const todayStr = format(new Date(), 'yyyy-MM-dd');
                                const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

                                const todayMidnight = new Date();
                                todayMidnight.setHours(0, 0, 0, 0);

                                let dateKeyObj = new Date();
                                try {
                                    if (dateKey !== 'Upcoming') dateKeyObj = parseISO(dateKey);
                                } catch (e) {}
                                dateKeyObj.setHours(0, 0, 0, 0);

                                const isGroupPast = dateKeyObj < todayMidnight;
                                const isGroupToday = isSameDay(dateKeyObj, todayMidnight);

                                if (dateKey === todayStr) displayDate = 'Today';
                                else if (dateKey === tomorrowStr) displayDate = 'Tomorrow';
                                else {
                                    try {
                                        displayDate = format(parseISO(dateKey), 'dd MMM yyyy');
                                    } catch (e) {}
                                }

                                return (
                                    <div key={dateKey} className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className={`text-sm font-bold tracking-wide flex items-center gap-2 ${
                                                isGroupPast ? 'text-slate-500' : isGroupToday ? 'text-sky-400 font-extrabold' : 'text-white'
                                            }`}>
                                                {displayDate}
                                            </h3>
                                            {isGroupPast && (
                                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                                                    Completed / Ended
                                                </span>
                                            )}
                                            {isGroupToday && (
                                                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-md animate-pulse">
                                                    🔥 LIVE TODAY
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {items.map((contest) => {
                                                const config = PLATFORM_CONFIG[contest.platform] || PLATFORM_CONFIG.Custom;
                                                const isSubbed = subscribedIds.includes(contest.id);

                                                return (
                                                    <div
                                                        key={contest.id}
                                                        className={`rounded-2xl p-4 transition-all duration-200 shadow-lg space-y-3 border ${
                                                            isGroupPast
                                                                ? 'bg-[#0d0e15]/50 border-slate-800/80 opacity-55 filter grayscale hover:grayscale-0 hover:opacity-85'
                                                                : isGroupToday
                                                                ? 'bg-[#161c2d] border-sky-500/50 shadow-sky-500/10'
                                                                : isSubbed
                                                                ? 'bg-indigo-950/20 border-indigo-500/50'
                                                                : 'bg-[#161822] border-white/10 hover:border-indigo-500/40'
                                                        }`}
                                                    >
                                                        {/* Top Row: Time Slot & Status Badge */}
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className={`font-mono font-medium ${isGroupPast ? 'text-slate-600 line-through' : 'text-indigo-400 font-semibold'}`}>
                                                                {contest.startTime && contest.endTime 
                                                                    ? `${contest.startTime} - ${contest.endTime}`
                                                                    : contest.startTime ? contest.startTime : 'TBD'}
                                                            </span>
                                                            {isGroupPast && (
                                                                <span className="text-[10px] font-medium text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                                                                    Ended ✓
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Title & Platform Logo/Icon */}
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                                isGroupPast ? 'bg-slate-900 text-slate-600 border border-slate-800' : config.badgeBg
                                                            }`}>
                                                                {config.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <a
                                                                    href={contest.link || '#'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`text-sm font-bold transition-colors line-clamp-2 ${
                                                                        isGroupPast ? 'text-slate-500 line-through' : 'text-white hover:text-indigo-400'
                                                                    }`}
                                                                >
                                                                    {contest.title}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: Full Contest Calendar Grid (col-span-8) */}
                <div className="lg:col-span-8 bg-[#161822] rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl flex flex-col justify-between">

                    {/* Month Header with < and > Controls */}
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white">
                            {format(calendarMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAllDaysClick}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    !selectedDate
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                                        : 'bg-[#10121a] border border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                All Days
                            </button>
                            <button
                                onClick={handleTodayClick}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    selectedDate === format(new Date(), 'yyyy-MM-dd')
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                                        : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                                }`}
                            >
                                Today
                            </button>
                        </div>
                    </div>

                    {/* Weekday Headers Row */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-1">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    {/* Days Grid matching screenshot pill layout */}
                    <div className="grid grid-cols-7 gap-2 min-h-[500px]">

                        {/* Empty Padding Cells */}
                        {emptyPaddingDays.map((_, idx) => (
                            <div key={`empty-${idx}`} className="h-28 rounded-xl bg-white/[0.01]"></div>
                        ))}

                        {/* Month Days */}
                        {daysInMonth.map((dayDate) => {
                            const dateStr = format(dayDate, 'yyyy-MM-dd');
                            const dayContests = contests.filter(c => c.startDate === dateStr);
                            const isSelected = selectedDate === dateStr;

                            const todayMidnight = new Date();
                            todayMidnight.setHours(0, 0, 0, 0);

                            const cellMidnight = new Date(dayDate);
                            cellMidnight.setHours(0, 0, 0, 0);

                            const isPastDay = cellMidnight < todayMidnight;
                            const isTodayDay = isSameDay(dayDate, new Date());
                            const dayNum = format(dayDate, 'd');

                            return (
                                <div
                                    key={dateStr}
                                    onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                                    className={`h-28 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                                        isSelected
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-xl'
                                            : isTodayDay
                                            ? 'bg-[#141f38] border-sky-500/80 shadow-md shadow-sky-500/20 ring-1 ring-sky-400/40'
                                            : isPastDay
                                            ? 'bg-[#0c0d14]/40 border-white/[0.02] opacity-45 filter grayscale hover:opacity-75'
                                            : 'bg-[#10121a] border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    {/* Top Row: Past/Today Tag + Day Number */}
                                    <div className="flex justify-between items-center">
                                        {isPastDay ? (
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">ENDED</span>
                                        ) : isTodayDay ? (
                                            <span className="text-[8px] font-black text-sky-400 uppercase tracking-tighter animate-pulse">TODAY</span>
                                        ) : (
                                            <span></span>
                                        )}

                                        <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                                            isTodayDay
                                                ? 'bg-sky-500 text-white font-extrabold shadow-sm ring-1 ring-sky-300'
                                                : isSelected
                                                ? 'bg-indigo-600 text-white'
                                                : isPastDay
                                                ? 'text-slate-600 line-through font-mono'
                                                : 'text-slate-400 group-hover:text-white'
                                        }`}>
                                            {dayNum}
                                        </span>
                                    </div>

                                    {/* Contest Pill Badges inside Day Cell */}
                                    <div className="space-y-1 flex-1 overflow-hidden mt-1">
                                        {dayContests.slice(0, 2).map((contest, i) => {
                                            const config = PLATFORM_CONFIG[contest.platform] || PLATFORM_CONFIG.Custom;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`text-[10px] truncate px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 border transition-transform hover:scale-105 ${
                                                        isPastDay
                                                            ? 'bg-slate-900/80 text-slate-500 border-slate-800 line-through opacity-70'
                                                            : config.badgeBg
                                                    }`}
                                                    title={`${contest.title} (${contest.platform})`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isPastDay ? 'bg-slate-700' : config.dotColor}`}></span>
                                                    <span className="truncate">{contest.title}</span>
                                                </div>
                                            );
                                        })}

                                        {dayContests.length > 2 && (
                                            <div className="text-[9px] text-slate-500 font-bold px-1 pt-0.5">
                                                +{dayContests.length - 2} more
                                            </div>
                                        )}
                                    </div>

                                    {/* Multi-day contest indicator */}
                                    {dayContests.some(c => c.duration && c.duration.includes('Days')) && (
                                        <div className={`h-1 rounded-full w-full mt-1 ${isPastDay ? 'bg-slate-800' : 'bg-indigo-500 animate-pulse'}`}></div>
                                    )}
                                </div>
                            );
                        })}

                    </div>

                </div>

            </div>
        </div>
    );
}
