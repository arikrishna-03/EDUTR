import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar,
    Shield, Bell, Moon, Lock, Camera,
    Save, X, Award, BookOpen, Users, Pencil, Copy, Check
} from 'lucide-react';
import DashboardHeader from '../../components/DashboardHeader';

const MENTOR_PROFILES = {
    'MNT-2024-001': {
        fullName: 'Dr. Sarah Wilson',
        role: 'Senior Professor',
        mentorId: 'MNT-2024-001',
        department: 'Computer Science',
        email: 'sarah.wilson@edutrack.edu',
        phone: '+1 (555) 123-4567',
        location: 'Block A, Room 304',
        bio: 'Passionate about AI and Machine Learning. Dedicated to mentoring the next generation of software engineers.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4'
    },
    'MENTOR123': {
        fullName: 'Prof. Albus Dumbledore',
        role: 'Headmaster',
        mentorId: 'MENTOR123',
        department: 'Transfiguration',
        email: 'albus.dumbledore@hogwarts.edu',
        phone: '+44 20 7946 0123',
        location: 'Headmaster\'s Tower',
        bio: 'Greatest sorcerer in the world. Enjoying lemon drops and chamber music. Determined to fight the dark arts.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dumbledore'
    }
};

const DEFAULT_PROFILE = MENTOR_PROFILES['MNT-2024-001'];

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [formData, setFormData] = useState(DEFAULT_PROFILE);
    const [copied, setCopied] = useState(false);

    const handleCopyMentorId = () => {
        if (formData.mentorId) {
            navigator.clipboard.writeText(formData.mentorId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const savedProfile = localStorage.getItem('mentorProfile');
        if (savedProfile) {
            setFormData(JSON.parse(savedProfile));
            return;
        }

        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const mentorId = user.id || user.mentorId;

        if (mentorId && MENTOR_PROFILES[mentorId]) {
            setFormData(MENTOR_PROFILES[mentorId]);
        } else if (user.role === 'mentor' && user.id) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || prev.fullName,
                email: user.email || prev.email,
                mentorId: user.id
            }));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('mentorProfile', JSON.stringify(formData));
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.role === 'mentor') {
            localStorage.setItem('currentUser', JSON.stringify({
                ...currentUser,
                name: formData.fullName,
                email: formData.email
            }));
        }
        setIsEditing(false);
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300 space-y-6">
            <DashboardHeader title="My Profile" />

            {/* 1. Header Section */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1a1c23] border border-white/5 shadow-xl">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-8 pb-8 relative flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl border-4 border-[#1a1c23] overflow-hidden bg-slate-800 shadow-2xl">
                            <img
                                src={formData.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button className="absolute bottom-2 right-2 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                            <Camera size={16} />
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 pt-2 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">{formData.fullName}</h1>
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                                        {formData.role}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {formData.location}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {/* Mentor ID Badge */}
                                <div className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono text-sm font-semibold flex items-center gap-2 shadow-inner">
                                    <Shield size={16} className="text-indigo-400" />
                                    <span>Mentor ID: <strong className="text-white font-mono">{formData.mentorId}</strong></span>
                                </div>

                                {/* Copy Mentor ID Button */}
                                <button
                                    onClick={handleCopyMentorId}
                                    title={copied ? "Copied!" : "Copy Mentor ID"}
                                    className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center active:scale-95 ${
                                        copied
                                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'
                                    }`}
                                >
                                    {copied ? (
                                        <Check size={18} className="animate-in zoom-in duration-200" />
                                    ) : (
                                        <Copy size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Personal Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#1a1c23] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-white">Personal Information</h3>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <X size={14} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <Save size={14} /> Save Changes
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    title="Edit Personal Information"
                                    className="p-2 rounded-lg bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all cursor-pointer"
                                >
                                    <Pencil size={18} />
                                </button>
                            )}
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormGroup label="Mentor ID" value={formData.mentorId} name="mentorId" icon={Shield} isEditing={false} onChange={() => { }} disabled />
                                <FormGroup label="Full Name" value={formData.fullName} name="fullName" icon={User} isEditing={isEditing} onChange={handleInputChange} />
                                <FormGroup label="Department" value={formData.department} name="department" icon={BookOpen} isEditing={isEditing} onChange={handleInputChange} />
                                <FormGroup label="Email Address" value={formData.email} name="email" icon={Mail} isEditing={isEditing} onChange={handleInputChange} />
                                <FormGroup label="Phone Number" value={formData.phone} name="phone" icon={Phone} isEditing={isEditing} onChange={handleInputChange} />
                                <FormGroup label="Office Location" value={formData.location} name="location" icon={MapPin} isEditing={isEditing} onChange={handleInputChange} />
                                <FormGroup label="Join Date" value="August 24, 2020" name="joinDate" icon={Calendar} isEditing={false} onChange={() => { }} disabled />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Bio</label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm leading-relaxed resize-none"
                                    />
                                ) : (
                                    <p className="text-slate-300 text-sm leading-relaxed bg-[#13151b] p-4 rounded-xl border border-transparent">
                                        {formData.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                    <div className="bg-[#1a1c23] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="font-semibold text-lg text-white">Account Settings</h3>
                        </div>
                        <div className="p-6 space-y-6">

                            {/* Toggle Item */}
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Notifications</p>
                                        <p className="text-slate-500 text-xs">Email alerts & updates</p>
                                    </div>
                                </div>
                                <ToggleSwitch checked={notifications} onChange={() => setNotifications(!notifications)} />
                            </div>

                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                        <Moon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Dark Mode</p>
                                        <p className="text-slate-500 text-xs">Adjust app appearance</p>
                                    </div>
                                </div>
                                <ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                            </div>

                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">2FA Security</p>
                                        <p className="text-slate-500 text-xs">Extra layer of protection</p>
                                    </div>
                                </div>
                                <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Setup</button>
                            </div>

                        </div>
                        <div className="p-4 bg-[#13151b]/50 border-t border-white/5">
                            <button className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
                                Sign Out All Devices
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper Components

const FormGroup = ({ label, value, name, icon: Icon, isEditing, onChange, disabled }) => (
    <div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
            <Icon size={12} /> {label}
        </label>
        {isEditing && !disabled ? (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
            />
        ) : (
            <div className="w-full bg-transparent border-b border-white/10 px-0 py-2.5 text-slate-200 text-sm font-medium truncate">
                {value}
            </div>
        )}
    </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-indigo-600' : 'bg-slate-700'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

export default Profile;
