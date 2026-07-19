import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings as SettingsIcon, Shield, Bell, Key, Globe,
    Moon, Smartphone, Mail, LayoutGrid, LogOut
} from 'lucide-react';
import DashboardHeader from '../../components/DashboardHeader';
import { PlatformSettingsPanel } from '../StudentPlatformSettings';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const menuItems = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'platforms', label: 'Platforms', icon: LayoutGrid },
    ];

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="Settings" />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* 1. Sidebar Nav */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-[#1a1c23] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-2 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === item.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </button>
                            ))}
                            <hr className="border-white/5 my-2" />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Content Area */}
                <div className="flex-1 bg-[#1a1c23] rounded-2xl border border-white/5 p-6 min-h-[500px]">

                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">App Preferences</h2>
                                <p className="text-slate-500 text-sm">Customize your experience</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-[#13151b] rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                            <Moon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Appearance</p>
                                            <p className="text-slate-500 text-xs">Switch between Dark and Light mode</p>
                                        </div>
                                    </div>
                                    <div className="flex bg-[#0f1015] p-1 rounded-lg border border-white/5">
                                        <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium shadow">Dark</button>
                                        <button className="px-3 py-1 text-slate-500 hover:text-white rounded-md text-xs font-medium transition-colors">Light</button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[#13151b] rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Language</p>
                                            <p className="text-slate-500 text-xs">Select your interface language</p>
                                        </div>
                                    </div>
                                    <select className="bg-[#0f1015] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Security Settings</h2>
                                <p className="text-slate-500 text-sm">Manage your password and active sessions</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-[#13151b] rounded-xl border border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                                                <Key size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Password</p>
                                                <p className="text-slate-500 text-xs">Last changed 2 months ago</p>
                                            </div>
                                        </div>
                                        <button className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold px-3 py-1.5 bg-indigo-500/10 rounded-lg transition-colors">Change</button>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#13151b] rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Two-Factor Authentication</p>
                                                <p className="text-slate-500 text-xs">Not enabled</p>
                                            </div>
                                        </div>
                                        <ToggleSwitch checked={false} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Active Sessions</h3>
                                    <div className="bg-[#13151b] rounded-xl border border-white/5 overflow-hidden">
                                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={18} className="text-slate-500" />
                                                <div>
                                                    <p className="text-white text-sm font-medium">Android - Chrome</p>
                                                    <p className="text-emerald-500 text-xs flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active now
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-slate-600 text-xs">Chennai, India</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Notification Preferences</h2>
                                <p className="text-slate-500 text-sm">Choose what alerts you receive</p>
                            </div>

                            <div className="bg-[#13151b] rounded-xl border border-white/5 divide-y divide-white/5">
                                {[
                                    { title: 'Class Announcements', desc: 'New posts from teachers', icon: Bell, checked: true },
                                    { title: 'Assignment Due Dates', desc: 'Reminders 24h before', icon: Key, checked: true },
                                    { title: 'Exam Results', desc: 'Instant alert when results are out', icon: Mail, checked: true },
                                    { title: 'Attendance Alerts', desc: 'When marked absent', icon: Smartphone, checked: false },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{item.title}</p>
                                                <p className="text-slate-500 text-xs">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ToggleSwitch checked={item.checked} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PLATFORMS TAB */}
                    {activeTab === 'platforms' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <PlatformSettingsPanel />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// Helper Components
const ToggleSwitch = ({ checked }) => {
    const [isOn, setIsOn] = useState(checked);
    return (
        <button
            onClick={() => setIsOn(!isOn)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isOn ? 'bg-indigo-600' : 'bg-slate-700'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
};

export default Settings;
