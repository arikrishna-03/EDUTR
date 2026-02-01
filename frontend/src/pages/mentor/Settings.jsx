import React, { useState } from 'react';
import {
    Settings as SettingsIcon, Shield, Bell, Key, Globe,
    Moon, Sun, Smartphone, LogOut, Link, Check, AlertCircle,
    ChevronRight, Mail
} from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const menuItems = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'integrations', label: 'Integrations', icon: Link },
    ];

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

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
                                                <p className="text-slate-500 text-xs">Last changed 3 months ago</p>
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
                                                <p className="text-slate-500 text-xs">Add an extra layer of security</p>
                                            </div>
                                        </div>
                                        <ToggleSwitch checked={true} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Active Sessions</h3>
                                    <div className="bg-[#13151b] rounded-xl border border-white/5 overflow-hidden">
                                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={18} className="text-slate-500" />
                                                <div>
                                                    <p className="text-white text-sm font-medium">Windows PC - Chrome</p>
                                                    <p className="text-emerald-500 text-xs flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active now
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-slate-600 text-xs">Chennai, India</span>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={18} className="text-slate-500" />
                                                <div>
                                                    <p className="text-white text-sm font-medium">iPhone 14 Pro - Safari</p>
                                                    <p className="text-slate-500 text-xs">Active 2h ago</p>
                                                </div>
                                            </div>
                                            <button className="text-red-400 hover:text-red-300 text-xs font-semibold">Revoke</button>
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
                                    { title: 'Email Alerts', desc: 'Receive daily summaries and critical updates', icon: Mail, checked: true },
                                    { title: 'Push Notifications', desc: 'Real-time alerts for student attendance', icon: Bell, checked: true },
                                    { title: 'SMS Updates', desc: 'Urgent security alerts only', icon: Smartphone, checked: false },
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

                    {/* INTEGRATIONS TAB */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Connected Apps</h2>
                                <p className="text-slate-500 text-sm">Supercharge your workflow</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <IntegrationCard
                                    name="Google Classroom"
                                    desc="Sync student rosters and assignments"
                                    icon="https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png"
                                    connected={true}
                                />
                                <IntegrationCard
                                    name="Zoom"
                                    desc="Auto-generate meeting links for classes"
                                    icon="https://upload.wikimedia.org/wikipedia/commons/2/25/Zoom_Logo_2022.jpg" // placeholder, maybe use simple div
                                    connected={false}
                                />
                                <IntegrationCard
                                    name="Slack"
                                    desc="Send class notifications to channels"
                                    icon="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
                                    connected={false}
                                />
                            </div>
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

const IntegrationCard = ({ name, desc, icon, connected }) => (
    <div className="p-4 bg-[#13151b] rounded-xl border border-white/5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center overflow-hidden">
                    {/* Naive image fallback */}
                    {icon ? <img src={icon} alt={name} className="w-full h-full object-contain" /> : <div className="font-bold text-black">A</div>}
                </div>
                <div>
                    <h3 className="text-white font-medium">{name}</h3>
                    <p className="text-slate-500 text-xs leading-tight">{desc}</p>
                </div>
            </div>
            {connected && <div className="text-emerald-500"><Check size={18} /></div>}
        </div>
        <button className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${connected
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
            {connected ? 'Disconnect' : 'Connect'}
        </button>
    </div>
);

export default Settings;
