import React, { useEffect, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import CalendarWidget from "../../components/CalendarWidget";
import TimetableWidget from "../../components/TimetableWidget";
import api from "../../api/axiosConfig";
import { Edit2, X, MapPin, Phone, Building, User, Award, Trophy } from 'lucide-react';

export default function StudentHome() {
    const [profile, setProfile] = useState(null);
    const [mentorId, setMentorId] = useState(null);

    // Change Mentor Modal State
    const [showMentorModal, setShowMentorModal] = useState(false);
    const [tempMentorId, setTempMentorId] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.mentorId) {
            setMentorId(user.mentorId);
            setTempMentorId(user.mentorId);
        }
    }, []);

    const handleUpdateMentor = () => {
        if (!tempMentorId.trim()) return;

        // Update local storage
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = { ...user, mentorId: tempMentorId.trim().toUpperCase() };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Update linkedStudents if found
        const linkedStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
        const updatedStudents = linkedStudents.map(s =>
            (s.email === user.email || s.id === user.id) ? { ...s, mentorId: tempMentorId.trim().toUpperCase() } : s
        );
        localStorage.setItem('linkedStudents', JSON.stringify(updatedStudents));

        // Update State
        setMentorId(tempMentorId.trim().toUpperCase());
        setShowMentorModal(false);
    };

    // Mock Mentor Database (Shared)
    const MENTOR_DB = {
        'MENTOR123': {
            name: 'Prof. Albus Dumbledore',
            dept: 'Computer Science Dept',
            room: 'Room 305, Main Block',
            phone: '+91 98765 43210',
            designation: 'Sr. Professor',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dumbledore',
            availability: 'Available'
        },
        'MENTOR456': {
            name: 'Prof. Minerva McGonagall',
            dept: 'Transfiguration Dept',
            room: 'Room 101, Tower A',
            phone: '+91 98765 11111',
            designation: 'Head Mistress',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minerva',
            availability: 'Busy'
        },
        'MNT-2024-001': {
            name: 'Dr. Sarah Wilson',
            dept: 'Computer Science',
            room: 'Block A, Room 304',
            phone: '+1 (555) 123-4567',
            designation: 'Senior Professor',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
            availability: 'Available'
        }
    };

    const mentorDetails = MENTOR_DB[mentorId] || {
        name: 'Assigned Mentor',
        dept: 'Department',
        room: 'Campus',
        phone: 'Contact Office',
        designation: 'Faculty',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentorId || 'default'}`,
        availability: 'Available'
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="Home">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Welcome back, Student</span>
                </div>
            </DashboardHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Mentor & Calendar */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Mentor Details Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1c23] to-[#13151b] border border-white/5 shadow-2xl group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="relative shrink-0">
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[3px] shadow-lg shadow-indigo-500/30">
                                    <div className="w-full h-full rounded-[20px] bg-[#1a1c23] overflow-hidden">
                                        <img
                                            src={mentorDetails.avatar}
                                            alt="Mentor"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold border-2 border-[#1a1c23] ${mentorDetails.availability === 'Available' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {mentorDetails.availability}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 pt-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight mb-1">{mentorDetails.name}</h2>
                                        <p className="text-indigo-400 font-medium text-sm">{mentorDetails.designation} • {mentorDetails.dept}</p>
                                    </div>

                                    <button
                                        onClick={() => setShowMentorModal(true)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center gap-2 group/btn"
                                    >
                                        <Edit2 size={16} className="text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                                        <span>Change</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Office</p>
                                            <p className="text-slate-200 font-medium truncate">{mentorDetails.room}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Contact</p>
                                            <p className="text-slate-200 font-medium truncate">{mentorDetails.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CalendarWidget mentorId={mentorId} isEditable={false} />
                </div>

                {/* Right Column: Timetable */}
                <div className="space-y-8">
                    <TimetableWidget mentorId={mentorId} isEditable={false} />
                </div>
            </div>

            {/* Change Mentor Modal */}
            {showMentorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMentorModal(false)}></div>
                    <div className="bg-[#1a1c23] border border-white/10 w-full max-w-sm rounded-2xl shadow-xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Change Mentor</h3>
                            <button onClick={() => setShowMentorModal(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">New Mentor ID</label>
                                <input
                                    type="text"
                                    value={tempMentorId}
                                    onChange={(e) => setTempMentorId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#13151b] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. MENTOR123"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Enter the unique ID provided by your mentor (e.g., MNT-2024-001).
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowMentorModal(false)}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateMentor}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Update Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
