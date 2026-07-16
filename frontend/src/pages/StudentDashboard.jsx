import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Linkedin,
  Twitter,
  Globe,
  BookOpen,
  Share2,
  Info,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [verifiedPlatforms, setVerifiedPlatforms] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('Total');
  const [selectedContestPlatform, setSelectedContestPlatform] = useState('LeetCode');

  // Platform Specific Mock Data
  const platformStats = {
    'Total': {
      questions: 916,
      activeDays: 120,
      streak: 66,
      submissions: 1671,
      easy: 540,
      medium: 312,
      hard: 64,
      awards: 6
    },
    'LeetCode': {
      questions: 450,
      activeDays: 85,
      streak: 45,
      submissions: 820,
      easy: 210,
      medium: 180,
      hard: 60,
      awards: 4
    },
    'CodeChef': {
      questions: 320,
      activeDays: 20,
      streak: 12,
      submissions: 540,
      easy: 240,
      medium: 75,
      hard: 5,
      awards: 2
    },
    'CodeForces': {
      questions: 110,
      activeDays: 10,
      streak: 5,
      submissions: 210,
      easy: 80,
      medium: 25,
      hard: 5,
      awards: 0
    },
    'CodeStudio': {
      questions: 36,
      activeDays: 5,
      streak: 4,
      submissions: 101,
      easy: 10,
      medium: 26,
      hard: 0,
      awards: 0
    }
  };

  // Mock Rating Data per Platform
  const platformRatingData = {
    'LeetCode': {
      rating: 1547,
      lastContest: 'Weekly Contest 476',
      date: '16 Nov 2025',
      rank: 7019,
      data: [
        { date: 'Oct 25', rating: 1470 },
        { date: 'Nov 01', rating: 1490 },
        { date: 'Nov 08', rating: 1520 },
        { date: 'Nov 15', rating: 1510 },
        { date: 'Nov 22', rating: 1545 },
        { date: 'Nov 29', rating: 1555 },
        { date: 'Dec 06', rating: 1530 },
        { date: 'Dec 13', rating: 1500 },
        { date: 'Dec 20', rating: 1485 },
        { date: 'Dec 27', rating: 1450 },
      ]
    },
    'CodeChef': {
      rating: 1840,
      lastContest: 'Starters 121',
      date: '12 Feb 2026',
      rank: 1205,
      data: [
        { date: 'Dec 10', rating: 1700 },
        { date: 'Dec 25', rating: 1720 },
        { date: 'Jan 05', rating: 1750 },
        { date: 'Jan 15', rating: 1780 },
        { date: 'Jan 25', rating: 1810 },
        { date: 'Feb 05', rating: 1840 },
      ]
    },
    'CodeForces': {
      rating: 1420,
      lastContest: 'Round 932 (Div. 2)',
      date: '20 Jan 2026',
      rank: 4500,
      data: [
        { date: 'Dec 01', rating: 1350 },
        { date: 'Dec 15', rating: 1380 },
        { date: 'Jan 05', rating: 1410 },
        { date: 'Jan 20', rating: 1420 },
      ]
    },
    'CodeStudio': {
      rating: 1200,
      lastContest: 'Weekend Contest 50',
      date: '05 Jan 2026',
      rank: 200,
      data: [
        { date: 'Dec 01', rating: 1100 },
        { date: 'Dec 15', rating: 1150 },
        { date: 'Jan 05', rating: 1200 },
      ]
    }
  };

  const currentStats = platformStats[selectedPlatform] || platformStats['Total'];
  const currentRating = platformRatingData[selectedContestPlatform] || platformRatingData['LeetCode'];

  // Mock Rating Data
  const ratingData = [
    { date: 'Oct 25', rating: 1470 },
    { date: 'Nov 01', rating: 1490 },
    { date: 'Nov 08', rating: 1520 },
    { date: 'Nov 15', rating: 1510 },
    { date: 'Nov 22', rating: 1545 },
    { date: 'Nov 29', rating: 1555 },
    { date: 'Dec 06', rating: 1530 },
    { date: 'Dec 13', rating: 1500 },
    { date: 'Dec 20', rating: 1485 },
    { date: 'Dec 27', rating: 1450 },
  ];

  // Mock Contests
  const platformContests = [
    { name: 'LeetCode', count: 7, color: '#FFA116' },
    { name: 'CodeChef', count: 23, color: '#5B4638' },
    { name: 'CodeForces', count: 3, color: '#1F8ACB' },
    { name: 'CodeStudio', count: 1, color: '#FF6F00' },
  ];

  useEffect(() => {
    if (studentId) {
      const allStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
      const foundStudent = allStudents.find(s => s.id === studentId);
      if (foundStudent) {
        setStudentData(foundStudent);
      }
    } else {
      const saved = localStorage.getItem('connectedPlatforms');
      if (saved) {
        const parsed = JSON.parse(saved);
        const verifiedList = Object.entries(parsed)
          .filter(([_, data]) => data.connected)
          .map(([name, data]) => ({ name, ...data }));
        setVerifiedPlatforms(verifiedList);
      }
    }
  }, [studentId]);

  const profile = studentData ? {
    name: studentData.name,
    handle: "@" + studentData.name.toLowerCase().replace(/\s/g, ''),
    avatar: studentData.name.charAt(0).toUpperCase(),
    location: "India",
    college: "Student University",
  } : {
    name: "Arikrishnan A",
    handle: "@im_ari.ak03",
    avatar: "A",
    location: "India",
    college: "Kalaignar Karunanidhi Institut...",
  };

  const heatmapData = React.useMemo(() => {
    const weeks = 20;
    const days = 7;
    const grid = [];
    for (let i = 0; i < weeks; i++) {
      const week = [];
      for (let j = 0; j < days; j++) {
        // Seed random based on platform name to keep it stable
        const seed = (selectedPlatform.length + i + j) % 10;
        week.push(seed > 7 ? Math.floor(Math.random() * 4) : 0);
      }
      grid.push(week);
    }
    return grid;
  }, [selectedPlatform]);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E0E0E0] font-sans p-6 flex gap-6 relative">

      {/* --- Left Column: Profile Sidebar --- */}
      <div className="w-72 flex flex-col gap-6 shrink-0">

        {/* Profile Card */}
        <div className="bg-[#15161B] rounded-xl p-6 flex flex-col items-center border border-white/5 relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#1F2025] mb-3 shadow-lg">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arik"
              alt="Profile"
              className="w-full h-full object-cover bg-slate-800"
            />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
          <p className="text-[#8FB6FF] text-sm mb-4 flex items-center gap-1">
            {profile.handle} <Check size={14} className="text-blue-400 fill-blue-400/20" />
          </p>

          <button className="w-full py-2 bg-[#E67700]/10 text-[#E67700] border border-[#E67700]/30 rounded-lg text-xs font-bold mb-6 hover:bg-[#E67700]/20 transition-colors">
            Get your Codolio Card
          </button>

          <div className="w-full space-y-3 text-sm text-slate-400 border-t border-white/5 pt-4 mb-6">
            <div className="flex items-center gap-3">
              <MapPin size={16} /> {profile.location}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 flex justify-center"><span className="text-xs">🎓</span></div> {profile.college}
            </div>
          </div>

          {/* Social Row */}
          <div className="flex gap-4 mb-6 text-slate-400">
            <Linkedin size={18} className="hover:text-white cursor-pointer" />
            <Twitter size={18} className="hover:text-white cursor-pointer" />
            <Globe size={18} className="hover:text-white cursor-pointer" />
            <BookOpen size={18} className="hover:text-white cursor-pointer" />
          </div>

          {/* Problem Solving Stats */}
          <div className="w-full mb-6">
            <div className="py-2.5 px-3 bg-white/5 rounded-t-lg border border-white/5 text-sm font-medium text-slate-300 flex justify-between items-center">
              Problem Solving Stats
            </div>
            <div className="bg-white/5 border-x border-b border-white/5 rounded-b-lg p-2 space-y-1">
              <div
                onClick={() => setSelectedPlatform('Total')}
                className={`flex items-center justify-between p-2 rounded cursor-pointer group transition-colors ${selectedPlatform === 'Total' ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
              >
                <span className={`text-sm ${selectedPlatform === 'Total' ? 'text-white font-bold' : 'text-slate-300'}`}>Total Stats</span>
                {selectedPlatform === 'Total' && <Check size={14} className="text-blue-500" />}
              </div>
              {verifiedPlatforms.length === 0 ? (
                <>
                  <div
                    onClick={() => setSelectedPlatform('LeetCode')}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer group transition-colors ${selectedPlatform === 'LeetCode' ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                  >
                    <span className={`text-sm ${selectedPlatform === 'LeetCode' ? 'text-white font-bold' : 'text-slate-300'}`}>LeetCode</span>
                    <Check size={14} className="text-green-500" />
                  </div>
                  <div
                    onClick={() => setSelectedPlatform('CodeChef')}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer group transition-colors ${selectedPlatform === 'CodeChef' ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                  >
                    <span className={`text-sm ${selectedPlatform === 'CodeChef' ? 'text-white font-bold' : 'text-slate-300'}`}>CodeChef</span>
                    <Check size={14} className="text-green-500" />
                  </div>
                </>
              ) : (
                verifiedPlatforms.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => setSelectedPlatform(p.name)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer group transition-colors ${selectedPlatform === p.name ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                  >
                    <span className={`text-sm ${selectedPlatform === p.name ? 'text-white font-bold' : 'text-slate-300'}`}>{p.name}</span>
                    <Check size={14} className="text-green-500" />
                  </div>
                ))
              )}
            </div>
          </div>

          {!studentId && (
            <button
              onClick={() => navigate('/student/settings/platforms')}
              className="w-full py-2.5 border border-[#E67700] text-[#E67700] hover:bg-[#E67700]/10 font-semibold rounded-lg text-sm transition-colors"
            >
              + Add Platform
            </button>
          )}
        </div>

        {/* Global Rank Widget */}
        <div className="bg-[#15161B] rounded-xl p-4 border border-white/5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-white">Global Rank</h3>
            <span className="text-[10px] text-[#8FB6FF] cursor-pointer hover:underline">How it works?</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Based on C Score</p>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg"><BookOpen size={20} className="text-slate-400" /></div>
            <div className="text-2xl font-bold text-white">12005</div>
          </div>
          <button className="w-full mt-4 py-2 bg-[#E67700] text-white rounded-lg text-xs font-bold hover:bg-[#CC6A00] transition-colors">
            View Leaderboard
          </button>
        </div>

      </div>

      {/* --- Right Column: Main Stats --- */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">

        {/* Top Row: General Stats & Heatmap */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center relative h-40">
            <Info size={14} className="absolute top-4 right-4 text-slate-600 cursor-pointer" />
            <p className="text-slate-400 font-medium mb-1">{selectedPlatform === 'Total' ? 'Total Questions' : `${selectedPlatform} Questions`}</p>
            <p className="text-5xl font-bold text-white">{currentStats.questions}</p>
          </div>

          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center relative h-40">
            <Info size={14} className="absolute top-4 right-4 text-slate-600 cursor-pointer" />
            <p className="text-slate-400 font-medium mb-1">Active Days</p>
            <p className="text-5xl font-bold text-white">{currentStats.activeDays}</p>
          </div>

          {/* Heatmap Widget */}
          <div className="bg-[#15161B] rounded-xl p-4 border border-white/5 flex flex-col relative xl:col-span-2 h-40">
            <div className="flex justify-between items-start mb-2 px-1">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{currentStats.submissions} Submissions in past 6 months</span>
              <div className="text-[10px] text-slate-400 flex gap-4">
                <span>Max.Streak <strong className="text-white">{currentStats.streak}</strong></span>
                <span>Current.Streak <strong className="text-white">{currentStats.streak}</strong></span>
              </div>
              <Info size={12} className="text-slate-600" />
            </div>

            <div className="flex-1 flex items-center justify-center gap-1 overflow-hidden">
              {heatmapData.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((level, dIdx) => (
                    <div
                      key={dIdx}
                      className={`w-2.5 h-2.5 rounded-[1px] ${level === 0 ? 'bg-[#2A2B30]' :
                        level === 1 ? 'bg-[#0E4429]' :
                          level === 2 ? 'bg-[#006D32]' :
                            level === 3 ? 'bg-[#26A641]' : 'bg-[#39D353]'
                        }`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-between px-2 text-[8px] text-slate-500 mt-1 font-mono uppercase">
              <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
            </div>
          </div>
        </div>

        {/* Second Row: Total Contests & Rating Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Contests Breakdown */}
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-center text-slate-400 font-medium mb-2">Total Contests</h3>
            <div className="text-center text-6xl font-bold text-white mb-6">34</div>

            <div className="space-y-3">
              {platformContests.map(platform => (
                <div
                  key={platform.name}
                  onClick={() => setSelectedContestPlatform(platform.name)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-sm cursor-pointer transition-all ${selectedContestPlatform === platform.name ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }}></div>
                    <span className="text-slate-300 font-medium">{platform.name}</span>
                  </div>
                  <span className="text-white font-bold">{platform.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Line Chart */}
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 lg:col-span-2 flex flex-col h-[320px]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-0.5">Rating ({selectedContestPlatform})</p>
                  <p className="text-xl font-bold text-white">{currentRating.rating}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-0.5">{currentRating.date}</p>
                  <p className="text-sm font-bold text-slate-300">{currentRating.lastContest}</p>
                  <p className="text-[10px] text-slate-500">Rank: {currentRating.rank}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentRating.data}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E67700" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E67700" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2025', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#E67700' }}
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="#E67700"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRating)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Third Row: Awards & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 relative h-64">
            <h3 className="text-slate-400 font-medium mb-4 flex justify-between items-center">
              Awards <span className="text-slate-500 text-xs font-bold">{currentStats.awards}</span>
            </h3>

            <div className="flex flex-wrap gap-4 justify-center items-center h-[calc(100%-2rem)]">
              {currentStats.awards > 0 && Array.from({ length: Math.min(currentStats.awards, 4) }).map((_, i) => {
                const colors = [
                  'bg-yellow-400/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]',
                  'bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
                  'bg-amber-600/20 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.2)]',
                  'bg-slate-700/40 border-slate-600 text-slate-300'
                ];
                const icons = ['🔥', '⭐', '🏆', 'C'];
                return (
                  <div key={i} className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold ${colors[i % colors.length]}`}>
                    {icons[i % icons.length]}
                  </div>
                );
              })}
              {currentStats.awards === 0 && <div className="text-slate-600 text-sm">No awards yet</div>}
            </div>
            <button className="absolute bottom-4 left-1/2 -translate-x-1/2 text-blue-400 text-xs hover:underline">show more</button>
          </div>

          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 flex items-center gap-8 h-64">
            <div className="relative w-36 h-36 rounded-full border-[14px] border-[#1F2025] flex items-center justify-center shrink-0 shadow-inner">
              <div className="absolute inset-0 rounded-full border-[14px] border-yellow-500/30 border-t-yellow-500 border-r-emerald-500 border-l-red-500 -rotate-45"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white">{currentStats.questions}</span>
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-emerald-500 font-bold text-sm">Easy</span>
                <span className="text-white font-bold text-sm">{currentStats.easy}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-yellow-500 font-bold text-sm">Medium</span>
                <span className="text-white font-bold text-sm">{currentStats.medium}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-red-500 font-bold text-sm">Hard</span>
                <span className="text-white font-bold text-sm">{currentStats.hard}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
