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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { studentId } = useParams(); // Get studentId from URL if present
  const [verifiedPlatforms, setVerifiedPlatforms] = useState([]);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    // If viewing as mentor (studentId present), load that student's data
    if (studentId) {
      const allStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
      const foundStudent = allStudents.find(s => s.id === studentId);
      if (foundStudent) {
        setStudentData(foundStudent);
        // Load platforms for this specific student if we had them stored separately
        // For now, we'll just mock or use empty for linked students as we don't have their platform data in this demo structure
      }
    } else {
      // Normal student view - load own connected platforms
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

  // Default Profile (Current User)
  const defaultProfile = {
    name: "Arikrishnan A",
    handle: "@sample test",
    avatar: "A",
    location: "India",
    college: "N/A",
  };

  // Merge loaded student data with default structure
  const profile = studentData ? {
    name: studentData.name,
    handle: "@" + studentData.name.toLowerCase().replace(/\s/g, ''),
    avatar: studentData.name.charAt(0).toUpperCase(),
    location: "India", // Mock
    college: "Student University", // Mock
  } : defaultProfile;

  // Heatmap Data Generation (Mock)
  const generateHeatmap = () => {
    const weeks = 20;
    const days = 7;
    const grid = [];
    for (let i = 0; i < weeks; i++) {
      const week = [];
      for (let j = 0; j < days; j++) {
        // Randomly assign activity level 0-4
        week.push(Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0);
      }
      grid.push(week);
    }
    return grid;
  };
  const heatmapData = generateHeatmap();

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E0E0E0] font-sans p-6 flex gap-6 relative">

      {/* --- Left Column: Profile Sidebar --- */}
      <div className="w-72 flex flex-col gap-6 shrink-0">

        {/* Profile Card */}
        <div className="bg-[#15161B] rounded-xl p-6 flex flex-col items-center border border-white/5 relative">
          <div className="w-24 h-24 rounded-full bg-[#E65100] flex items-center justify-center text-4xl font-bold text-white mb-3 shadow-lg">
            {profile.avatar}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
          <p className="text-[#8FB6FF] text-sm mb-4">{profile.handle}</p>

          {/* Social Row */}
          <div className="flex gap-4 mb-6 text-slate-400">
            <div className="p-2 bg-white/5 rounded-lg hover:text-white cursor-pointer"><Share2 size={16} /></div>
            <div className="p-2 bg-white/5 rounded-lg hover:text-white cursor-pointer"><Linkedin size={16} /></div>
            <div className="p-2 bg-white/5 rounded-lg hover:text-white cursor-pointer"><Twitter size={16} /></div>
            <div className="p-2 bg-white/5 rounded-lg hover:text-white cursor-pointer"><Globe size={16} /></div>
            <div className="p-2 bg-white/5 rounded-lg hover:text-white cursor-pointer"><BookOpen size={16} /></div>
          </div>

          <div className="w-full space-y-3 text-sm text-slate-400 border-t border-white/5 pt-4 mb-6">
            <div className="flex items-center gap-3">
              <MapPin size={16} /> {profile.location}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 flex justify-center"><span className="text-xs">🎓</span></div> {profile.college}
            </div>
          </div>

          {/* Problem Solving Stats & Verified Platforms */}
          <div className="w-full mb-6">
            <div className="py-2.5 px-3 bg-white/5 rounded-t-lg border border-white/5 text-sm font-medium text-slate-300 flex justify-between items-center">
              Problem Solving Stats
            </div>

            {/* Dynamic Verified Platforms List */}
            <div className="bg-white/5 border-x border-b border-white/5 rounded-b-lg p-2 space-y-1">
              {verifiedPlatforms.length === 0 ? (
                <p className="text-xs text-slate-500 p-2 text-center">No platforms connected</p>
              ) : (
                verifiedPlatforms.map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer group">
                    <span className="text-sm text-slate-300">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-green-500" />
                      <ExternalLink size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Platform Button - Only show if NOT in mentor view (no studentId) */}
          {!studentId && (
            <button
              onClick={() => navigate('/student/settings/platforms')}
              className="w-full py-2.5 border border-[#E67700] text-[#E67700] hover:bg-[#E67700]/10 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center"
            >
              + Add Platform
            </button>
          )}
        </div>
        {/* Global Rank */}
        <div className="bg-[#15161B] rounded-xl p-4 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-1">Global Rank</h3>
          <p className="text-xs text-slate-500 mb-3">Based on C Score</p>
          <div className="text-2xl font-bold text-slate-600">0</div>
        </div>

      </div>

      {/* --- Right Column: Main Stats --- */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">

        {/* Top Row: General Stats & Heatmap */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-48">
          {/* Stat 1 */}
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center relative">
            <Info size={14} className="absolute top-4 right-4 text-slate-600" />
            <p className="text-slate-400 font-medium mb-2">Total Questions</p>
            <p className="text-4xl font-bold text-white">0</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center relative">
            <Info size={14} className="absolute top-4 right-4 text-slate-600" />
            <p className="text-slate-400 font-medium mb-2">Total Active Days</p>
            <p className="text-4xl font-bold text-white">0</p>
          </div>

          {/* Heatmap */}
          <div className="bg-[#15161B] rounded-xl p-4 border border-white/5 flex flex-col relative xl:col-span-1">
            <div className="flex justify-between items-start mb-2 px-1">
              <span className="text-[10px] text-slate-400 font-medium">0 Submissions in past 6 months</span>
              <div className="text-[10px] text-slate-400 flex gap-4">
                <span>Max.Streak <strong className="text-white">0</strong></span>
                <span>Current.Streak <strong className="text-white">0</strong></span>
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

              {/* Month Labels (Mock) */}
            </div>
            <div className="flex justify-between px-2 text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
              <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Awards & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
          {/* Awards */}
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 relative">
            <h3 className="text-slate-400 font-medium mb-4">Awards</h3>
            <div className="text-4xl font-bold text-white mb-2">0</div>

            <div className="h-full flex flex-col items-center justify-center -mt-12 opacity-50">
              {/* Placeholder Hexagon Badge */}
              <div className="w-20 h-20 border-2 border-slate-700 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl pt-1">50</span>
              </div>
              <span className="text-xs text-slate-500">No Badge found</span>
            </div>
          </div>

          {/* Difficulty Stats */}
          <div className="bg-[#15161B] rounded-xl p-6 border border-white/5 flex items-center gap-8">
            {/* Donut Chart Placeholder */}
            <div className="relative w-32 h-32 rounded-full border-[12px] border-[#1F2025] flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white">0</span>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-emerald-500 font-bold text-sm">Easy</span>
                <span className="text-white font-bold text-sm">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-500 font-bold text-sm">Medium</span>
                <span className="text-white font-bold text-sm">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-500 font-bold text-sm">Hard</span>
                <span className="text-white font-bold text-sm">0</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
