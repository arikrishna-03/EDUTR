import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { 
    Plus, X, Calendar as CalendarIcon, Link as LinkIcon, Clock, Trash2, Search, 
    Trophy, ExternalLink, Bookmark, Send, Edit3, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays
} from 'lucide-react';
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    eachDayOfInterval, isSameMonth, isSameDay, parseISO 
} from 'date-fns';

const MentorContest = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [contests, setContests] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');
    const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD string
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'calendar'
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [editingDraftId, setEditingDraftId] = useState(null);
    const [loading, setLoading] = useState(true);

    const defaultContests = [
        {
            id: 'c1',
            title: 'LeetCode Weekly Contest 410',
            platform: 'LeetCode',
            startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            startTime: '20:00',
            duration: '1.5 Hours',
            link: 'https://leetcode.com/contest/',
            description: 'Weekly algorithmic problem-solving challenge with 4 coding questions ranging from Easy to Hard.',
            createdAt: new Date().toISOString()
        },
        {
            id: 'c2',
            title: 'CodeChef Starters 145',
            platform: 'CodeChef',
            startDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
            startTime: '20:00',
            duration: '2 Hours',
            link: 'https://www.codechef.com/contests',
            description: 'Division 1, 2, 3 & 4 rated contest for beginner and advanced competitive programmers.',
            createdAt: new Date().toISOString()
        },
        {
            id: 'c3',
            title: 'EduTrack College Coding League - Round 1',
            platform: 'Custom',
            startDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
            startTime: '10:00',
            duration: '3 Hours',
            link: 'https://hackerrank.com',
            description: 'Exclusive intra-college competitive programming challenge. Top 10 qualify for Finals.',
            createdAt: new Date().toISOString()
        }
    ];

    const fetchContests = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('http://localhost:5000/api/contests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setContests(data);
                        localStorage.setItem('contests', JSON.stringify(data));
                        setLoading(false);
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn("API offline or error fetching contests, using local data", error);
        }

        const local = JSON.parse(localStorage.getItem('contests') || 'null');
        if (local && local.length > 0) {
            setContests(local);
        } else {
            setContests(defaultContests);
            localStorage.setItem('contests', JSON.stringify(defaultContests));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContests();
        const savedDrafts = JSON.parse(localStorage.getItem('contest_drafts') || '[]');
        setDrafts(savedDrafts);
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        platform: 'LeetCode',
        startDate: '',
        startTime: '18:00',
        duration: '2 Hours',
        link: '',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenAddModal = (dateStr = '') => {
        const initialDate = dateStr || selectedDate || new Date().toISOString().split('T')[0];
        setFormData({
            title: '',
            platform: 'LeetCode',
            startDate: initialDate,
            startTime: '18:00',
            duration: '2 Hours',
            link: '',
            description: ''
        });
        setEditingDraftId(null);
        setIsModalOpen(true);
    };

    const handleSaveDraft = (e) => {
        e.preventDefault();
        if (!formData.title && !formData.link && !formData.startDate) {
            alert("Please fill in at least one field before saving as draft.");
            return;
        }

        const draftItem = {
            id: editingDraftId || 'draft_' + Date.now(),
            title: formData.title || 'Untitled Contest Draft',
            platform: formData.platform || 'LeetCode',
            startDate: formData.startDate || '',
            startTime: formData.startTime || '',
            duration: formData.duration || '',
            link: formData.link || '',
            description: formData.description || '',
            savedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setDrafts(prev => {
            const filtered = prev.filter(d => d.id !== draftItem.id);
            const updated = [draftItem, ...filtered];
            localStorage.setItem('contest_drafts', JSON.stringify(updated));
            return updated;
        });

        setFormData({
            title: '',
            platform: 'LeetCode',
            startDate: '',
            startTime: '18:00',
            duration: '2 Hours',
            link: '',
            description: ''
        });
        setEditingDraftId(null);
        setIsModalOpen(false);
    };

    const handlePublishDraft = async (draft) => {
        const formattedLink = draft.link
            ? (draft.link.startsWith('http://') || draft.link.startsWith('https://') ? draft.link : `https://${draft.link}`)
            : '';

        const newItem = {
            id: 'contest_' + Date.now(),
            title: draft.title || 'Untitled Contest',
            platform: draft.platform || 'Custom',
            startDate: draft.startDate || new Date().toISOString().split('T')[0],
            startTime: draft.startTime || '18:00',
            duration: draft.duration || '2 Hours',
            link: formattedLink,
            description: draft.description || '',
            createdAt: new Date().toISOString()
        };

        let updatedList = [newItem, ...contests];
        setContests(updatedList);
        localStorage.setItem('contests', JSON.stringify(updatedList));

        const updatedDrafts = drafts.filter(d => d.id !== draft.id);
        setDrafts(updatedDrafts);
        localStorage.setItem('contest_drafts', JSON.stringify(updatedDrafts));
        setIsDraftModalOpen(false);

        window.dispatchEvent(new Event('storage'));
        alert('Contest published successfully!');
    };

    const handleDeleteDraft = (id) => {
        const updated = drafts.filter(d => d.id !== id);
        setDrafts(updated);
        localStorage.setItem('contest_drafts', JSON.stringify(updated));
    };

    const handleEditDraft = (draft) => {
        setFormData({
            title: draft.title || '',
            platform: draft.platform || 'LeetCode',
            startDate: draft.startDate || '',
            startTime: draft.startTime || '18:00',
            duration: draft.duration || '2 Hours',
            link: draft.link || '',
            description: draft.description || ''
        });
        setEditingDraftId(draft.id);
        setIsDraftModalOpen(false);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedLink = formData.link
            ? (formData.link.startsWith('http://') || formData.link.startsWith('https://') ? formData.link : `https://${formData.link}`)
            : '';

        const newContest = {
            id: 'contest_' + Date.now(),
            title: formData.title,
            platform: formData.platform,
            startDate: formData.startDate,
            startTime: formData.startTime,
            duration: formData.duration,
            link: formattedLink,
            description: formData.description,
            createdAt: new Date().toISOString()
        };

        let updatedList = [newContest, ...contests];
        setContests(updatedList);
        localStorage.setItem('contests', JSON.stringify(updatedList));

        if (editingDraftId) {
            const updatedDrafts = drafts.filter(d => d.id !== editingDraftId);
            setDrafts(updatedDrafts);
            localStorage.setItem('contest_drafts', JSON.stringify(updatedDrafts));
            setEditingDraftId(null);
        }

        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('http://localhost:5000/api/contests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newContest)
                });
            }
        } catch (error) {
            console.warn("Backend offline, saved locally", error);
        }

        setIsModalOpen(false);
        window.dispatchEvent(new Event('storage'));
        alert('Contest posted successfully!');
    };

    const handleDeleteContest = (id) => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            const updated = contests.filter(c => c.id !== id && c._id !== id);
            setContests(updated);
            localStorage.setItem('contests', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
        }
    };

    // Filtering logic
    const filteredContests = contests.filter(c => {
        const matchesQuery = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.platform || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPlatform = platformFilter === 'All' || c.platform === platformFilter;
        const matchesDate = !selectedDate || c.startDate === selectedDate;
        return matchesQuery && matchesPlatform && matchesDate;
    });

    const platforms = ['All', 'LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'Custom'];

    // Calendar Days Generator
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay(); // 0 = Sun, 1 = Mon ...
    const emptyPaddingDays = Array.from({ length: startDayOfWeek });

    return (
        <div className="space-y-6 text-slate-100 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="Contests & Coding Competitions" />

            {/* Top Action Bar, Date Chooser & Filters */}
            <div className="flex flex-col gap-4 bg-[#1a1c23] p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    {/* Left: Search & Date Chooser */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search contests..."
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
                                    title="Clear date filter"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Platform Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5">
                    <span className="text-xs text-slate-500 font-medium mr-1">Platform:</span>
                    {platforms.map(p => (
                        <button
                            key={p}
                            onClick={() => setPlatformFilter(p)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                platformFilter === p
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-[#13151b] border border-white/10 text-slate-400 hover:text-white'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    {selectedDate && (
                        <span className="ml-auto text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1.5">
                            Selected Date: <strong>{selectedDate}</strong>
                        </span>
                    )}
                </div>
            </div>

            {/* Interactive Calendar Date Chooser View */}
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

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    {/* Calendar Days Grid */}
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
                                                {dayContests.length} Contest
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
                                        {dayContests.length > 2 && (
                                            <div className="text-[9px] text-slate-500 font-semibold px-1">
                                                +{dayContests.length - 2} more
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenAddModal(dateStr);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-400 hover:text-white font-bold text-right pt-1"
                                    >
                                        + Add
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Contests Grid */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh] bg-[#13151b] rounded-3xl border border-white/5">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
            ) : filteredContests.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[45vh] text-center p-8 bg-[#13151b] rounded-3xl border border-white/5">
                    <div className="bg-indigo-500/10 p-4 rounded-full mb-4 text-indigo-400">
                        <Trophy size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">No Contests Found</h3>
                    <p className="text-slate-400 text-sm max-w-md mb-6">
                        {selectedDate
                            ? `No contests scheduled on ${selectedDate}.`
                            : searchQuery || platformFilter !== 'All'
                            ? 'No contests match your search criteria.'
                            : 'Click "Add Contest" to post upcoming coding challenges.'}
                    </p>
                    {selectedDate ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedDate('')}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                            >
                                Clear Date Filter
                            </button>
                            <button
                                onClick={() => handleOpenAddModal(selectedDate)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                            >
                                Post Contest for {selectedDate}
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContests.map((contest) => (
                        <div key={contest.id || contest._id} className="bg-[#13151b] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                                        {contest.platform || 'Coding'}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteContest(contest.id || contest._id)}
                                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                                        title="Delete contest"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                                    {contest.title}
                                </h3>
                                <p className="text-slate-400 text-xs mb-4 line-clamp-3 leading-relaxed">
                                    {contest.description || 'No additional details provided.'}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon size={14} className="text-indigo-400" />
                                        {contest.startDate || 'TBD'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-purple-400" />
                                        {contest.duration || '2 Hours'}
                                    </span>
                                </div>

                                {contest.link && (
                                    <a
                                        href={contest.link.startsWith('http') ? contest.link : `https://${contest.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white font-medium transition-all text-xs"
                                    >
                                        Open Contest Page <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Contest Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="text-indigo-500" size={22} />
                                {editingDraftId ? 'Edit Contest Draft' : 'Post New Contest'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Contest Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="e.g. LeetCode Weekly Contest 410"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Platform</label>
                                    <select
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="LeetCode">LeetCode</option>
                                        <option value="CodeChef">CodeChef</option>
                                        <option value="Codeforces">Codeforces</option>
                                        <option value="HackerRank">HackerRank</option>
                                        <option value="GeeksforGeeks">GeeksforGeeks</option>
                                        <option value="Custom">Custom / Internal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        placeholder="e.g. 2 Hours"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        style={{ colorScheme: 'dark' }}
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        style={{ colorScheme: 'dark' }}
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Contest Link</label>
                                <input
                                    type="url"
                                    name="link"
                                    placeholder="https://..."
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Rules</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    placeholder="Add details, instructions, or target batch..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-amber-400 rounded-xl text-sm font-medium transition-colors"
                                >
                                    <Bookmark size={16} />
                                    Save as Draft
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                                    >
                                        <Send size={16} />
                                        Publish Contest
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Drafts Modal */}
            {isDraftModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Bookmark className="text-amber-400" size={22} />
                                Saved Contest Drafts ({drafts.length})
                            </h3>
                            <button
                                onClick={() => setIsDraftModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {drafts.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 text-sm">
                                    No saved drafts yet.
                                </div>
                            ) : (
                                drafts.map((draft) => (
                                    <div key={draft.id} className="bg-[#13151b] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-white text-base mb-1">
                                                {draft.title || 'Untitled Draft'}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                                <span className="text-indigo-400 font-semibold">{draft.platform || 'LeetCode'}</span>
                                                {draft.startDate && <span>Start: {draft.startDate}</span>}
                                                <span>Saved: {draft.savedAt}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            <button
                                                onClick={() => handleEditDraft(draft)}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors"
                                                title="Edit Draft"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handlePublishDraft(draft)}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                Publish
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDraft(draft.id)}
                                                className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                                title="Delete Draft"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorContest;
