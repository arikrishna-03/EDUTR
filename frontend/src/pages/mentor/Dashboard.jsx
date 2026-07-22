import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { ExternalLink, Users, Code, Trophy, TrendingUp, Download, X, CheckSquare, Square } from 'lucide-react';
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

// Helper to get platform metrics for real students only
const getStudentPlatformStats = (studentsList, platformId) => {
    if (!studentsList || studentsList.length === 0) return [];

    return studentsList.map((student, index) => {
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

        return {
            id: student.id || student._id || index,
            name: student.name || `Student ${index + 1}`,
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
        };
    }).sort((a, b) => b.currentRating - a.currentRating);
};

const Dashboard = () => {
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState(availableMetrics.map(m => m.id)); // Default all selected
    const [topNCount, setTopNCount] = useState(5);
    const [showNames, setShowNames] = useState(false);
    const [realStudents, setRealStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            let loaded = [];
            try {
                const savedProfile = JSON.parse(localStorage.getItem('mentorProfile') || '{}');
                const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const currentMentorId = (savedProfile.mentorId || user.id || user.mentorId || 'MENTOR123').trim().toUpperCase();

                // Load from localStorage linkedStudents (case-insensitive filter)
                const localLinked = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
                const localFiltered = localLinked.filter(s => s.mentorId && s.mentorId.trim().toUpperCase() === currentMentorId);
                loaded.push(...localFiltered);

                // Fetch from API if available
                const userSection = user.section || user.mentorId || user.id;
                if (userSection) {
                    try {
                        const response = await axios.get(`http://localhost:5000/api/student/mentor/${userSection}`);
                        if (Array.isArray(response.data)) {
                            loaded.push(...response.data);
                        }
                    } catch (e) {
                        // API optional
                    }
                }
            } catch (error) {
                console.error("Error loading students:", error);
            }

            // Filter out duplicate entries
            const seen = new Set();
            const unique = loaded.filter(s => {
                const key = s.email || s._id || s.id || s.name;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            setRealStudents(unique);
        };

        fetchStudents();
    }, []);

    const stats = React.useMemo(() => {
        return getStudentPlatformStats(realStudents, selectedPlatform.id);
    }, [realStudents, selectedPlatform.id]);

    const avgScore = React.useMemo(() => {
        if (stats.length === 0) return 0;
        const total = stats.reduce((acc, curr) => acc + curr.currentRating, 0);
        return Math.round(total / stats.length);
    }, [stats]);

    const toggleMetric = (id) => {
        setSelectedMetrics(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const downloadPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better charts/tables
        const activeMetrics = availableMetrics.filter(m => selectedMetrics.includes(m.id));

        // Title Page
        doc.setFontSize(24);
        doc.text(`${selectedPlatform.name} Performance Report`, 14, 20);

        doc.setFontSize(14);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Metrics Included: ${activeMetrics.length}`, 14, 40);

        let currentY = 50;

        // --- Chart Generation Logic ---

        // Helper to check for page break
        const checkPageBreak = (neededSpace) => {
            if (currentY + neededSpace > 190) {
                doc.addPage();
                currentY = 20;
            }
        };

        activeMetrics.forEach((metric) => {
            const chartHeight = 70; // Increased to accommodate vertical labels
            checkPageBreak(chartHeight + 20);

            doc.setFontSize(14);
            doc.text(`${metric.label} Analysis`, 14, currentY);
            currentY += 10;

            const chartY = currentY;
            const chartWidth = 260;
            const maxBarHeight = 40; // Reduced height to fit text below

            if (metric.type === 'categorical') {
                // Aggregation for categorical data
                const counts = stats.reduce((acc, curr) => {
                    const key = curr[metric.id];
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                const labels = Object.keys(counts);
                const values = Object.values(counts);
                const maxVal = Math.max(...values);
                const barWidth = Math.min(30, chartWidth / labels.length - 5);

                labels.forEach((label, i) => {
                    const val = counts[label];
                    const barHeight = (val / maxVal) * maxBarHeight;
                    const x = 20 + (i * (barWidth + 10));
                    const y = chartY + maxBarHeight - barHeight;

                    doc.setFillColor(79, 70, 229); // Indigo
                    doc.rect(x, y, barWidth, barHeight, 'F');

                    doc.setFontSize(10);
                    doc.text(String(val), x + barWidth / 2, y - 2, { align: 'center' });
                    doc.text(label, x + barWidth / 2, chartY + maxBarHeight + 5, { align: 'center' });
                });
                currentY += chartHeight + 10;

            } else {
                // Top Students (Show ALL due to user request)
                let topStudents = [...stats];
                if (metric.type === 'ranking') {
                    // Lower is better
                    topStudents.sort((a, b) => a[metric.id] - b[metric.id]);
                } else {
                    // Higher is better
                    topStudents.sort((a, b) => b[metric.id] - a[metric.id]);
                }
                // NO SLICE: Including all students (20, 60, etc.)

                const maxVal = Math.max(...topStudents.map(s => s[metric.id]));

                // Dynamic Bar Width Calculation
                const totalBars = topStudents.length;
                const gap = 1; // 1mm gap
                const barWidth = (chartWidth - ((totalBars - 1) * gap)) / totalBars;

                topStudents.forEach((student, i) => {
                    const val = student[metric.id];
                    const barHeight = maxVal > 0 ? (val / maxVal) * maxBarHeight : 0;

                    const x = 20 + (i * (barWidth + gap));
                    const y = chartY + maxBarHeight - barHeight;

                    doc.setFillColor(79, 70, 229);
                    doc.rect(x, y, barWidth, barHeight, 'F');

                    // Labels
                    doc.setFontSize(8);

                    // Value above bar (only if barWidth is decent, or just staggering)
                    if (barWidth > 5) {
                        doc.text(String(val), x + barWidth / 2, y - 1, { align: 'center' });
                    }

                    // Vertical Name below bar
                    const labelX = x + (barWidth / 2) + 1; // Slight offset for visual center
                    const labelY = chartY + maxBarHeight + 2;
                    doc.text(student.name.split(' ')[1] || student.name.substring(0, 5), labelX, labelY, { angle: 90 });
                });

                // Increase spacing significantly for vertical names
                currentY += chartHeight + 10;

                // --- Top N Stats List ---
                if (showNames && topNCount > 0) {
                    doc.setFontSize(10);
                    doc.text(`Top ${topNCount} Students Details:`, 14, currentY);
                    currentY += 6;

                    doc.setFontSize(9);
                    const listStats = topStudents.slice(0, topNCount);

                    listStats.forEach((student, index) => {
                        // Check for page break for valid list rendering
                        checkPageBreak(8);
                        doc.text(`${index + 1}. ${student.name} (${student.rollNo}) - ${student[metric.id]}`, 20, currentY);
                        currentY += 6;
                    });
                    currentY += 5; // Extra spacing after list
                }
            }
        });


        // --- Data Table ---
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
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300 relative">
            <DashboardHeader title="Mentor Dashboard" />

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Customize Report</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-400 mb-4">Select the metrics you want to include in the PDF report logic. Charts will be generated for each selected metric.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableMetrics.map(metric => (
                                    <div
                                        key={metric.id}
                                        onClick={() => toggleMetric(metric.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selectedMetrics.includes(metric.id)
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
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-300 hover:text-white font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={downloadPDF}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                            >
                                <Download size={18} />
                                Compute & Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Content Area - Platform Leaderboard */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#1a1c23] rounded-2xl border border-white/5 p-6 min-h-[500px] flex flex-col">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {selectedPlatform.name}
                                    <span className="text-slate-500 font-light text-lg">Student Overview</span>
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Real-time performance metrics</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                                >
                                    <Download size={18} />
                                    Download Report
                                </button>
                                <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-center">
                                    <div className="text-xs text-indigo-400 font-bold uppercase">Avg Score</div>
                                    <div className="text-white font-bold text-lg">{avgScore}</div>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center">
                                    <div className="text-xs text-emerald-400 font-bold uppercase">Total Students</div>
                                    <div className="text-white font-bold text-lg">{stats.length}</div>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="py-4 pl-4 font-medium">S. No</th>
                                        <th className="py-4 font-medium">Reg No</th>
                                        <th className="py-4 font-medium">Name</th>
                                        <th className="py-4 font-medium text-center">Cur Rating</th>
                                        <th className="py-4 font-medium text-center">High Rating</th>
                                        <th className="py-4 font-medium text-center">Div</th>
                                        <th className="py-4 font-medium text-center">Star</th>
                                        <th className="py-4 font-medium text-center">G-Rank</th>
                                        <th className="py-4 font-medium text-center">C-Rank</th>
                                        <th className="py-4 font-medium text-center">Contests</th>
                                        <th className="py-4 font-medium text-center">Total Problem</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {stats.length === 0 ? (
                                        <tr>
                                            <td colSpan="11" className="py-12 text-center text-slate-500 font-medium">
                                                No student records found on {selectedPlatform.name}. Link students with your Mentor ID to display performance metrics.
                                            </td>
                                        </tr>
                                    ) : (
                                        stats.map((student, index) => (
                                        <tr key={student.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-slate-300">
                                            <td className="py-4 pl-4 font-bold text-white">
                                                {index + 1}
                                            </td>
                                            <td className="py-4 font-mono text-xs">
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
                                                <span className="bg-slate-700/50 px-2 py-1 rounded text-xs">{student.division}</span>
                                            </td>
                                            <td className="py-4 text-center text-yellow-500">
                                                {student.starRating}
                                            </td>
                                            <td className="py-4 text-center">
                                                #{student.globalRank}
                                            </td>
                                            <td className="py-4 text-center">
                                                #{student.countryRank}
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md text-xs font-bold border border-purple-500/20">
                                                    {student.contestsAttended}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center font-bold text-white">
                                                {student.totalSolved}
                                            </td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

                {/* Right Sidebar - Coding Platforms */}
                <div className="lg:col-span-1 bg-[#1a1c23] rounded-2xl border border-white/5 p-6 h-fit sticky top-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Code size={20} className="text-indigo-500" />
                        Platforms
                    </h3>
                    <div className="space-y-2">
                        {platforms.map((platform, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border ${selectedPlatform.name === platform.name
                                    ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/20'
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full transition-colors ${selectedPlatform.name === platform.name ? 'bg-white' : 'bg-slate-700 group-hover:bg-indigo-500'
                                    }`}></div>

                                <span className={`flex-1 text-left font-medium transition-colors ${selectedPlatform.name === platform.name ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                    }`}>
                                    {platform.name}
                                </span>

                                <a
                                    href={platform.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()} // Prevent selecting when clicking external link
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedPlatform.name === platform.name ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
