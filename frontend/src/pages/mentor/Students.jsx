import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import { User, Mail, Calendar, Search, Filter, MoreVertical, GraduationCap, Trash2 } from 'lucide-react';

const Students = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);

    // For demo purposes, we'll assume the currently logged-in mentor is 'MENTOR123'
    // In a real app, this would come from auth context
    const currentMentorId = 'MENTOR123';

    useEffect(() => {
        // Load students from local storage
        const loadStudents = () => {
            const allStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
            // Filter students linked to this mentor
            // For broader demo visualization, if no specific ID is enforced, we might show all, 
            // but requirements say "login using respective mentor id".

            // If the user entered 'MENTOR123', we show them here.
            // If we are testing as MENTOR123, we should see them.
            const myStudents = allStudents.filter(s => s.mentorId === currentMentorId);
            setStudents(myStudents);
        };

        loadStudents();
        // Add event listener for storage changes (in case of multiple tabs)
        window.addEventListener('storage', loadStudents);
        return () => window.removeEventListener('storage', loadStudents);
        return () => window.removeEventListener('storage', loadStudents);
    }, []);

    const handleRemoveStudent = (studentId) => {
        if (window.confirm('Are you sure you want to remove this student?')) {
            const updatedStudents = students.filter(s => s.id !== studentId);
            setStudents(updatedStudents);

            // Update local storage (update the full list logic needed)
            const allStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
            const remainingStudents = allStudents.filter(s => s.id !== studentId || s.mentorId !== currentMentorId);
            localStorage.setItem('linkedStudents', JSON.stringify(remainingStudents));
        }
        setActiveMenuId(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="My Students" />

            {/* Stats/Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1a1c23] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full bg-[#13151b] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <button className="p-2 bg-[#13151b] border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
                <div className="text-slate-400 text-sm font-medium">
                    Total Students: <span className="text-white">{students.length}</span>
                </div>
            </div>

            {/* Students Grid */}
            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-[#1a1c23] rounded-2xl border border-white/5 border-dashed">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <User size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Students Found</h3>
                    <p className="text-slate-500 text-center max-w-sm">
                        Students who login with your Mentor ID ({currentMentorId}) will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {students.map((student) => (
                        <div key={student.id} className="group bg-[#1a1c23] rounded-2xl border border-white/5 p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 relative overflow-hidden">

                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === student.id ? null : student.id);
                                        }}
                                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {activeMenuId === student.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-[#1a1c23] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveStudent(student.id);
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-2 text-red-500 hover:bg-white/5 text-sm font-medium transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Remove Student
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 mb-4 shadow-lg shadow-indigo-500/20">
                                    <div className="w-full h-full bg-[#1a1c23] rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white uppercase">{student.name.substring(0, 2)}</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1 truncate w-full">{student.name}</h3>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                                    <Mail size={12} />
                                    <span className="truncate max-w-[150px]">{student.email}</span>
                                </div>

                                <div className="w-full h-px bg-white/5 mb-4"></div>

                                <div className="w-full flex justify-between items-center text-xs font-medium">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-slate-500">Joined</span>
                                        <div className="flex items-center gap-1 text-slate-300">
                                            <Calendar size={12} /> {student.joinedAt}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-slate-500">Status</span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            Active
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/mentor/student/${student.id}`)}
                                    className="w-full mt-6 py-2 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 text-sm font-medium transition-all duration-200 border border-white/5 hover:border-indigo-500 flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white">
                                    <GraduationCap size={16} />
                                    View Progress
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Students;
