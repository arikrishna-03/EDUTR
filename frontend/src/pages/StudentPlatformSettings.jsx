import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    User,
    LayoutGrid,
    Eye,
    Settings,
    Github,
    Link as LinkIcon,
    AlertCircle,
    Check,
    X,
    Copy,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerificationModal = ({ isOpen, onClose, onVerify, platformName, profileUrl }) => {
    const [step, setStep] = useState(1);
    const [isVerifying, setIsVerifying] = useState(false);
    const [code] = useState('ycaHMgaD'); // Mock random code

    if (!isOpen) return null;

    const handleVerifyClick = () => {
        setIsVerifying(true);
        // Mock network delay for verification
        setTimeout(() => {
            setIsVerifying(false);
            onVerify();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#15161B] border border-white/10 rounded-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Verify Profile</h2>

                <div className="space-y-6">
                    <div>
                        <p className="text-slate-300 text-sm mb-1"><span className="font-bold text-white">Step 1:</span> Go to the profile</p>
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm underline truncate block">
                            {profileUrl}
                        </a>
                    </div>

                    <div>
                        <p className="text-slate-300 text-sm mb-2"><span className="font-bold text-white">Step 2:</span> Edit the "First Name" section and paste the following code:</p>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-slate-300 font-mono text-sm">
                                {code}
                            </div>
                            <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-slate-300 text-sm"><span className="font-bold text-white">Step 3:</span> Save your profile.</p>
                    </div>

                    <div>
                        <p className="text-slate-300 text-sm"><span className="font-bold text-white">Step 4:</span> Click on the verify button below.</p>
                        <p className="text-xs text-slate-500 mt-1">Note: After verification, you may change your first name back to normal.</p>
                    </div>
                </div>

                <button
                    onClick={handleVerifyClick}
                    disabled={isVerifying}
                    className="w-full mt-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {isVerifying ? (
                        <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                    ) : (
                        'Verify'
                    )}
                </button>
            </div>
        </div>
    );
};

const PlatformRow = ({ icon: Icon, name, placeholder, status, url, onSubmit, onVerifyOpen }) => {
    const [inputValue, setInputValue] = useState(url || '');

    // Update local input if url prop changes (e.g. from localStorage load)
    useEffect(() => {
        if (url) setInputValue(url);
    }, [url]);

    return (
        <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-3 w-48 shrink-0">
                {Icon ? <Icon size={20} className="text-white" /> : <div className="w-5 h-5 rounded-full bg-slate-700"></div>}
                <span className="text-slate-300 font-medium">{name}</span>
            </div>

            {status === 'verified' ? (
                <div className="flex-1 flex items-center gap-3 justify-end">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={inputValue}
                            title={inputValue}
                            disabled
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                        <Check size={16} />
                    </div>
                    {/* Delete button could go here */}
                </div>
            ) : (
                <div className="flex-1 flex gap-4">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={status === 'submitted'}
                        className={`flex-1 bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 ${status === 'submitted' ? 'text-slate-400' : ''}`}
                    />

                    {status === 'submitted' ? (
                        <button
                            onClick={() => onVerifyOpen(inputValue)}
                            className="px-6 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors"
                        >
                            Verify
                        </button>
                    ) : (
                        <button
                            onClick={() => onSubmit(inputValue)}
                            className="px-6 py-2 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition-colors"
                        >
                            Submit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export const PlatformSettingsPanel = () => {
    // State structure: { [platformName]: { status: 'submitted' | 'verified', url: '...' } }
    const [platformsData, setPlatformsData] = useState({});
    const [modalState, setModalState] = useState({ isOpen: false, platform: '', url: '' });

    useEffect(() => {
        const saved = localStorage.getItem('connectedPlatforms');
        if (saved) {
            setPlatformsData(JSON.parse(saved));
        }
    }, []);

    const saveToStorage = (newData) => {
        setPlatformsData(newData);
        localStorage.setItem('connectedPlatforms', JSON.stringify(newData));
    };

    const handleSubmit = (platformName, url) => {
        if (!url.trim()) return;
        const newData = {
            ...platformsData,
            [platformName]: { ...platformsData[platformName], status: 'submitted', url, connected: false }
        };
        saveToStorage(newData);
    };

    const handleOpenVerify = (platformName, url) => {
        setModalState({ isOpen: true, platform: platformName, url });
    };

    const handleConfirmVerification = () => {
        const { platform } = modalState;
        const newData = {
            ...platformsData,
            [platform]: { ...platformsData[platform], status: 'verified', connected: true } // Connected true for Dashboard compatibility
        };
        saveToStorage(newData);
        setModalState({ ...modalState, isOpen: false });
    };

    const problemSolvingPlatforms = [
        { name: 'LeetCode', placeholder: 'https://leetcode.com/u/ johndoe' },
        { name: 'TakeUForward', placeholder: 'https://takeuforward.org/plus/profile/ johndoe' },
        { name: 'CodeStudio', placeholder: 'https://www.naukri.com/code360/profile/ johndoe' },
        { name: 'GeeksForGeeks', placeholder: 'https://www.geeksforgeeks.org/user/ johndoe' },
        { name: 'InterviewBit', placeholder: 'https://www.interviewbit.com/profile/ johndoe' },
        { name: 'CodeChef', placeholder: 'https://www.codechef.com/users/ johndoe' },
        { name: 'CodeForces', placeholder: 'https://codeforces.com/profile/ johndoe' },
        { name: 'HackerRank', placeholder: 'https://www.hackerrank.com/profile/ johndoe' },
        { name: 'AtCoder', placeholder: 'https://atcoder.jp/users/ johndoe' },
    ];

    return (
        <div className="h-full">
            {/* Verification Modal */}
            <VerificationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onVerify={handleConfirmVerification}
                platformName={modalState.platform}
                profileUrl={modalState.url}
            />

            <h1 className="text-2xl font-bold text-white mb-2">Platforms</h1>
            <p className="text-slate-400 text-sm mb-10">You can update and verify your platform details here.</p>

            {/* Development Section */}
            <div className="mb-12">
                <h2 className="text-lg font-semibold text-white mb-6">Development</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 w-48 shrink-0">
                        <Github size={24} className="text-white" />
                        <span className="text-slate-300 font-medium">Github</span>
                    </div>
                    <button className="px-6 py-1.5 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition-colors">
                        Connect
                    </button>
                </div>
            </div>

            {/* Problem Solving Section */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-6">Problem Solving</h2>
                <div className="space-y-4">
                    {problemSolvingPlatforms.map((platform) => (
                        <PlatformRow
                            key={platform.name}
                            name={platform.name}
                            placeholder={platform.placeholder}
                            status={platformsData[platform.name]?.status}
                            url={platformsData[platform.name]?.url}
                            onSubmit={(url) => handleSubmit(platform.name, url)}
                            onVerifyOpen={(url) => handleOpenVerify(platform.name, url)}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-warning text-xs text-orange-400/80">
                <AlertCircle size={14} />
                <span>If you are getting this warning, please check the <a href="#" className="underline">FAQ</a> to know why this happens and how to fix it.</span>
            </div>
        </div>
    );
};

export default function StudentPlatformSettings() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0B0C10] text-slate-200 flex font-sans">
            {/* Sidebar Settings Menu */}
            <div className="w-64 border-r border-white/5 p-6 flex flex-col gap-2">
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="flex items-center gap-2 text-[#E67700] text-sm font-medium mb-8 hover:opacity-80 transition-opacity"
                >
                    <ArrowLeft size={16} /> Back to Profile
                </button>

                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 text-white rounded-xl cursor-pointer transition-colors">
                    <LayoutGrid size={18} /> <span className="text-sm font-medium">Platform</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <PlatformSettingsPanel />
            </div>
        </div>
    );
}
