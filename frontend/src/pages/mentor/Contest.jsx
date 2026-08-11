import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import { 
    Plus, X, Calendar as CalendarIcon, Link as LinkIcon, Clock, Trash2, Search, 
    Trophy, ExternalLink, Bookmark, Send, Edit3, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays,
    Code, Download, CheckSquare, Square, Users, BarChart2
} from 'lucide-react';
import { 
    format, addMonths, subMonths, startOfMonth, endOfMonth, 
    eachDayOfInterval, isSameMonth, isSameDay 
} from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const platforms = [
    { name: 'LeetCode', url: 'https://leetcode.com', id: 'leetcode' },
    { name: 'TakeUForward', url: 'https://takeuforward.org', id: 'takeuforward' },
    { name: 'CodeStudio', url: 'https://www.codingninjas.com/codestudio', id: 'codestudio' },
    { name: 'GeeksForGeeks', url: 'https://www.geeksforgeeks.org', id: 'geeksforgeeks' },
    { name: 'InterviewBit', url: 'https://www.interviewbit.com', id: 'interviewbit' },
    { name: 'CodeChef', url: 'https://www.codechef.com', id: 'codechef' },
    { name: 'CodeForces', url: 'https://codeforces.com', id: 'codeforces' },
    { name: 'HackerRank', url: 'https://www.hackerrank.com', id: 'hackerrank' },
    { name: 'AtCoder', url: 'https://atcoder.jp', id: 'atcoder' },
];

const availableMetrics = [
    { id: 'currentRating', label: 'Current Rating', type: 'numerical' },
    { id: 'highestRating', label: 'Highest Rating', type: 'numerical' },
    { id: 'division', label: 'Division', type: 'categorical' },
    { id: 'starRating', label: 'Star Rating', type: 'categorical' },
    { id: 'globalRank', label: 'Global Ranking', type: 'ranking' },
    { id: 'countryRank', label: 'Country Ranking', type: 'ranking' },
    { id: 'contestsAttended', label: 'Contests Participated', type: 'numerical' },
    { id: 'totalSolved', label: 'Total Problems Solved', type: 'numerical' },
];

// Helper to get platform metrics for students
const getStudentPlatformStats = (studentsList, platformId) => {
    const defaultStudents = [
        {
            id: 'sample_1',
            name: 'user',
            email: 'user@example.com',
            rollNo: '22CS100',
            currentRating: 1448,
            highestRating: 1696,
            division: 'Div 3',
            starRating: '4★',
            globalRank: 4249,
            countryRank: 249,
            contestsAttended: 13,
            solved: 40,
            totalSolved: 398,
            streak: 15,
            handle: '@user',
            isConnected: true
        }
    ];

    const listToUse = (studentsList && studentsList.length > 0) ? studentsList : defaultStudents;

    const platformObj = platforms.find(p => p.id === platformId);
    const platformName = platformObj ? platformObj.name : platformId;

    return listToUse.map((student, index) => {
        if (student.id === 'sample_1') {
            const keyStr = `${student.id}_${platformId}`;
            let hash = 0;
            for (let i = 0; i < keyStr.length; i++) {
                hash = keyStr.charCodeAt(i) + ((hash << 5) - hash);
            }
            const posHash = Math.abs(hash);

            const isLeetCode = platformId === 'leetcode';
            return {
                id: student.id,
                name: student.name,
                email: student.email,
                rollNo: student.rollNo,
                currentRating: isLeetCode ? 1448 : (posHash % 800) + 1200,
                highestRating: isLeetCode ? 1696 : (posHash % 600) + 1500,
                division: isLeetCode ? 'Div 3' : `Div ${(posHash % 3) + 1}`,
                starRating: isLeetCode ? '4★' : `${(posHash % 5) + 1}★`,
                globalRank: isLeetCode ? 4249 : (posHash % 5000) + 100,
                countryRank: isLeetCode ? 249 : (posHash % 500) + 10,
                contestsAttended: isLeetCode ? 13 : (posHash % 30) + 5,
                solved: isLeetCode ? 40 : (posHash % 50) + 10,
                totalSolved: isLeetCode ? 398 : (posHash % 500) + 100,
                streak: 15,
                handle: `@${student.name}`,
                isConnected: true,
                platformName
            };
        }

        const keyStr = `${student.id || student._id || student.email || index}_${platformId}`;
        let hash = 0;
        for (let i = 0; i < keyStr.length; i++) {
            hash = keyStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const posHash = Math.abs(hash);

        const currentRating = (posHash % 1500) + 1200;
        const highestRating = currentRating + (posHash % 500);
        const divNum = (posHash % 3) + 1;
        const starNum = (posHash % 5) + 1;
        const globalRank = (posHash % 5000) + 1;
        const countryRank = (posHash % 500) + 1;
        const contestsAttended = (posHash % 40) + 5;
        const totalSolved = (posHash % 800) + 150;

        const connectedPlatforms = student.connectedPlatforms || JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');
        const connectedInfo = connectedPlatforms[platformName] || connectedPlatforms[platformId];
        const isConnected = !!connectedInfo?.status || !!connectedInfo?.connected || true;
        const handle = connectedInfo?.url 
            ? connectedInfo.url.split('/').filter(Boolean).pop() 
            : `@${(student.name || '').toLowerCase().replace(/\s+/g, '')}`;

        return {
            id: student.id || student._id || index,
            name: student.name || `Student ${index + 1}`,
            email: student.email || '',
            rollNo: student.regNo || student.rollNo || `22CS${100 + index}`,
            currentRating,
            highestRating,
            division: `Div ${divNum}`,
            starRating: `${starNum}★`,
            globalRank,
            countryRank,
            contestsAttended,
            solved: Math.floor(totalSolved / 10),
            totalSolved,
            streak: posHash % 30,
            handle,
            isConnected,
            platformName
        };
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
};

const MentorContest = () => {
    const navigate = useNavigate();

    // Tab state: 'leaderboard' (matching screenshot) or 'scheduled' (calendar/contests)
    const [activeTab, setActiveTab] = useState('leaderboard');

    // Leaderboard state
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState(availableMetrics.map(m => m.id));
    const [realStudents, setRealStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Scheduled Contests State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [contests, setContests] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');
    const [selectedDate, setSelectedDate] = useState('');
    const [viewMode, setViewMode] = useState('grid');
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
            title: 'Codeforces Round 964 (Div. 2)',
            platform: 'Codeforces',
            startDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
            startTime: '20:05',
            duration: '2 Hours',
            link: 'https://codeforces.com/contests',
            description: 'Div 2 competitive programming round on Codeforces.',
            createdAt: new Date().toISOString()
        }
    ];

    // Fetch real students
    useEffect(() => {
        const fetchStudents = async () => {
            let loaded = [];
            try {
                const savedProfile = JSON.parse(localStorage.getItem('mentorProfile') || '{}');
                const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const currentMentorId = (savedProfile.mentorId || user.id || user.mentorId || 'MENTOR123').trim().toUpperCase();

                const localLinked = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
                const localFiltered = localLinked.filter(s => s.mentorId && s.mentorId.trim().toUpperCase() === currentMentorId);
                loaded.push(...localFiltered);

                const userSection = user.section || user.mentorId || user.id;
                if (userSection) {
                    try {
                        const response = await axios.get(`http://localhost:5000/api/student/mentor/${userSection}`);
                        if (Array.isArray(response.data)) {
                            loaded.push(...response.data);
                        }
                    } catch (e) {}
                }
            } catch (error) {
                console.error("Error loading students:", error);
            }

            const seen = new Set();
            const unique = loaded.filter(s => {
                const key = s.email || s._id || s.id || s.name;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            }).sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

            setRealStudents(unique);
        };

        fetchStudents();
    }, []);

    // Fetch Contests
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

    const stats = useMemo(() => {
        return getStudentPlatformStats(realStudents, selectedPlatform.id);
    }, [realStudents, selectedPlatform.id]);

    const filteredStats = useMemo(() => {
        if (!searchTerm.trim()) return stats;
        const term = searchTerm.toLowerCase();
        return stats.filter(s => 
            s.name.toLowerCase().includes(term) || 
            s.rollNo.toLowerCase().includes(term) ||
            s.handle.toLowerCase().includes(term)
        );
    }, [stats, searchTerm]);

    const toggleMetric = (id) => {
        setSelectedMetrics(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const downloadPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        const activeMetrics = availableMetrics.filter(m => selectedMetrics.includes(m.id));

        doc.setFontSize(24);
        doc.text(`${selectedPlatform.name} Performance Report`, 14, 20);
        doc.setFontSize(14);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Metrics Included: ${activeMetrics.length}`, 14, 40);

        doc.addPage();
        doc.setFontSize(16);
        doc.text("Detailed Data Table", 14, 20);

        autoTable(doc, {
            startY: 30,
            head: [['S.No', 'Name', ...activeMetrics.map(m => m.label)]],
            body: stats.map((student, index) => [
                index + 1,
                student.name,
                ...activeMetrics.map(m => student[m.id])
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [26, 28, 35] },
        });

        doc.save(`${selectedPlatform.name}_Custom_Report.pdf`);
        setIsReportModalOpen(false);
    };

    // Scheduled Contests logic
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
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const filteredContests = contests.filter(c => {
        const matchesQuery = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.platform || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPlatform = platformFilter === 'All' || c.platform === platformFilter;
        const matchesDate = !selectedDate || c.startDate === selectedDate;
        return matchesQuery && matchesPlatform && matchesDate;
    });

    const contestPlatforms = ['All', 'LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'Custom'];

    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay();
    const emptyPaddingDays = Array.from({ length: startDayOfWeek });

    return (
        <div className="space-y-6 text-slate-100 animate-in fade-in zoom-in duration-300 relative">
            {/* Header matching screenshot title */}
            <DashboardHeader title="Mentor Dashboard" />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                        activeTab === 'leaderboard'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-[#1a1c23] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                    }`}
                >
                    <BarChart2 size={18} />
                    Platform Performance Leaderboard
                </button>
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                        activeTab === 'scheduled'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-[#1a1c23] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                    }`}
                >
                    <Trophy size={18} />
                    Contest Calendar & Schedule
                </button>
            </div>

            {/* Customize PDF Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Customize Report</h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-400 mb-4">Select the metrics you want to include in the PDF report logic.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableMetrics.map(metric => (
                                    <div
                                        key={metric.id}
                                        onClick={() => toggleMetric(metric.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                                            selectedMetrics.includes(metric.id)
                                                ? 'bg-indigo-500/10 border-indigo-500/50'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className={`text-indigo-400 ${selectedMetrics.includes(metric.id) ? 'opacity-100' : 'opacity-40'}`}>
                                            {selectedMetrics.includes(metric.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </div>
                                        <span className={selectedMetrics.includes(metric.id) ? 'text-white font-medium' : 'text-slate-400'}>
                                            {metric.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                            <button onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white font-medium">
                                Cancel
                            </button>
                            <button onClick={downloadPDF} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-colors">
                                <Download size={18} /> Compute & Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: Platform Leaderboard & Performance View (Matching Screenshot) */}
            {activeTab === 'leaderboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Main Content Area - Platform Leaderboard */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-[#1a1c23] rounded-2xl border border-white/5 p-6 min-h-[500px] flex flex-col shadow-xl">

                            {/* Platform Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {selectedPlatform.name}
                                    </h2>
                                    <p className="text-slate-400 text-xs mt-1">Real-time performance & platform tracking</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-56">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search by student or handle..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-[#13151b] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors"
                                    >
                                        <Download size={16} />
                                        Download Report
                                    </button>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-center">
                                        <div className="text-[10px] text-emerald-400 font-bold uppercase">TOTAL STUDENTS</div>
                                        <div className="text-white font-bold text-sm">{stats.length}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Leaderboard Table matching screenshot exactly */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-white/5 text-slate-400 text-[11px] uppercase tracking-wider">
                                            <th className="py-4 pl-4 font-medium">REG NO</th>
                                            <th className="py-4 font-medium">NAME</th>
                                            <th className="py-4 font-medium text-center">CUR RATING</th>
                                            <th className="py-4 font-medium text-center">HIGH RATING</th>
                                            <th className="py-4 font-medium text-center">DIV</th>
                                            <th className="py-4 font-medium text-center">STAR</th>
                                            <th className="py-4 font-medium text-center">G-RANK</th>
                                            <th className="py-4 font-medium text-center">C-RANK</th>
                                            <th className="py-4 font-medium text-center">CONTESTS</th>
                                            <th className="py-4 font-medium text-center">TOTAL PROBLEM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredStats.length === 0 ? (
                                            <tr>
                                                <td colSpan="10" className="py-12 text-center text-slate-500 font-medium">
                                                    No student records found for "{searchTerm}".
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStats.map((student) => (
                                                <tr key={student.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-slate-300">
                                                    <td className="py-4 pl-4 font-mono text-xs text-slate-400">
                                                        {student.rollNo}
                                                    </td>
                                                    <td className="py-4 font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                        {student.name}
                                                    </td>
                                                    <td className="py-4 text-center font-bold text-yellow-400">
                                                        {student.currentRating}
                                                    </td>
                                                    <td className="py-4 text-center text-slate-400">
                                                        {student.highestRating}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded text-xs">{student.division}</span>
                                                    </td>
                                                    <td className="py-4 text-center text-yellow-500 font-semibold">
                                                        {student.starRating}
                                                    </td>
                                                    <td className="py-4 text-center text-slate-300">
                                                        #{student.globalRank}
                                                    </td>
                                                    <td className="py-4 text-center text-slate-300">
                                                        #{student.countryRank}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className="bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-500/20">
                                                            {student.contestsAttended}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center font-bold text-white">
                                                        {student.totalSolved}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>

                    {/* Right Sidebar - Coding Platforms list */}
                    <div className="lg:col-span-1 bg-[#1a1c23] rounded-2xl border border-white/5 p-6 h-fit sticky top-6 shadow-xl">
                        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                            <Code size={18} className="text-indigo-500" />
                            Platforms
                        </h3>
                        <div className="space-y-2">
                            {platforms.map((platform, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedPlatform(platform)}
                                    className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                                        selectedPlatform.name === platform.name
                                            ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/20'
                                            : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                                    }`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                        selectedPlatform.name === platform.name ? 'bg-white' : 'bg-slate-700 group-hover:bg-indigo-500'
                                    }`}></div>

                                    <span className={`flex-1 text-left text-sm font-medium transition-colors ${
                                        selectedPlatform.name === platform.name ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                    }`}>
                                        {platform.name}
                                    </span>

                                    <a
                                        href={platform.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                            selectedPlatform.name === platform.name ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-white'
                                        }`}
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {/* TAB 2: Scheduled Contests & Calendar View */}
            {activeTab === 'scheduled' && (
                <div className="space-y-6">
                    {/* Filter & Actions Bar */}
                    <div className="flex flex-col gap-4 bg-[#1a1c23] p-4 rounded-2xl border border-white/5 shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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
                                        <button onClick={() => setSelectedDate('')} className="p-1 text-slate-400 hover:text-white">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                                <div className="flex bg-[#13151b] p-1 rounded-xl border border-white/10">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                                            viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <LayoutGrid size={14} /> Grid View
                                    </button>
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                                            viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <CalendarDays size={14} /> Calendar
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleOpenAddModal()}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    <Plus size={16} /> Post New Contest
                                </button>
                            </div>
                        </div>

                        {/* Platform Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5">
                            <span className="text-xs text-slate-500 font-medium mr-1">Platform:</span>
                            {contestPlatforms.map(p => (
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
                        </div>
                    </div>

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <div className="bg-[#1a1c23] rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="text-indigo-400" size={24} />
                                    <h3 className="text-lg font-bold text-white">
                                        {format(calendarMonth, 'MMMM yyyy')}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setSelectedDate('')} className="px-3 py-1.5 bg-[#13151b] border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white">
                                        Show All Dates
                                    </button>
                                    <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="p-2 bg-[#13151b] border border-white/10 rounded-xl text-slate-400 hover:text-white">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={() => setCalendarMonth(new Date())} className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-semibold hover:bg-indigo-600 hover:text-white">
                                        Today
                                    </button>
                                    <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="p-2 bg-[#13151b] border border-white/10 rounded-xl text-slate-400 hover:text-white">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase py-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day}>{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {emptyPaddingDays.map((_, idx) => (
                                    <div key={`empty-${idx}`} className="h-24 rounded-xl bg-white/[0.01]"></div>
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
                                                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg'
                                                    : isToday
                                                    ? 'bg-white/5 border-purple-500/50'
                                                    : 'bg-[#13151b] border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                                                    isToday ? 'bg-purple-500 text-white' : isSelected ? 'bg-indigo-600 text-white' : 'text-slate-400 group-hover:text-white'
                                                }`}>
                                                    {format(dayDate, 'd')}
                                                </span>
                                                {dayContests.length > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                                                        {dayContests.length} Contest
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1 flex-1 overflow-hidden mt-1">
                                                {dayContests.slice(0, 2).map((c, i) => (
                                                    <div key={i} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium" title={c.title}>
                                                        {c.title}
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenAddModal(dateStr); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-400 hover:text-white font-bold text-right pt-1">
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
                            <Trophy size={48} className="text-indigo-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-1">No Contests Found</h3>
                            <p className="text-slate-400 text-sm max-w-md mb-6">
                                {selectedDate ? `No contests scheduled on ${selectedDate}.` : 'Click "Post New Contest" to add competitive challenges.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredContests.map((contest) => (
                                <div key={contest.id || contest._id} className="bg-[#13151b] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all flex flex-col justify-between group relative overflow-hidden shadow-lg">
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                                                {contest.platform || 'Coding'}
                                            </span>
                                            <button onClick={() => handleDeleteContest(contest.id || contest._id)} className="text-slate-500 hover:text-red-400 p-1 transition-colors">
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
                </div>
            )}

            {/* Post/Edit Contest Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="text-indigo-500" size={22} />
                                {editingDraftId ? 'Edit Contest Draft' : 'Post New Contest'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
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
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. LeetCode Weekly Contest 410"
                                    className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Platform *</label>
                                    <select
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="LeetCode">LeetCode</option>
                                        <option value="CodeChef">CodeChef</option>
                                        <option value="Codeforces">Codeforces</option>
                                        <option value="HackerRank">HackerRank</option>
                                        <option value="GeeksforGeeks">GeeksforGeeks</option>
                                        <option value="Custom">Custom College Contest</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 2 Hours"
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Contest URL Link</label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    placeholder="https://leetcode.com/contest/..."
                                    className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Instructions</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief overview or rules of the contest..."
                                    className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20"
                                >
                                    Publish Contest
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorContest;
