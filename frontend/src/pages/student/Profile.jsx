import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { User, Camera, Upload, Calendar, Eye, EyeOff } from 'lucide-react';

const StudentProfile = () => {
    const [activeTab, setActiveTab] = useState('Personal Information');
    const [showPassword, setShowPassword] = useState(false);

    // Mock Data - In real app, fetch from API based on currentUser
    const STUDENT_DB = {
        'STU-1001': { // Arikrishna
            firstName: 'ARIKRISHNA',
            lastName: 'A',
            gender: 'MALE',
            dob: '2007-03-28',
            bloodGroup: 'A1+',
            mobile: '9843009181',
            email: 'akarishak182@gmail.com',
            maritalStatus: 'SINGLE',
            altMobile: '',
            altEmail: 'akarishak182@gmail.com',
            panNo: '',
            aadhaarNo: '238021752320',
            geoClassification: 'RURAL',
            community: 'MBC',
            caste: 'VANNAR',
            religion: 'HINDU',
            motherTongue: 'TAMIL',
            nationality: 'INDIAN',
            nativity: 'TAMIL NADU',
            profileStatus: 'ACTIVE',
            loginRequired: 'YES',
            username: '711524BAD018',
            password: 'Password123'
        },
        'STU-1002': { // Harry Potter
            firstName: 'HARRY',
            lastName: 'POTTER',
            gender: 'MALE',
            dob: '1980-07-31',
            bloodGroup: 'O+',
            mobile: '+44 7911 123456',
            email: 'harry.potter@hogwarts.edu',
            maritalStatus: 'SINGLE',
            altMobile: '',
            altEmail: '',
            panNo: '',
            aadhaarNo: 'MAGIC-1234',
            geoClassification: 'URBAN',
            community: 'WIZARD',
            caste: 'GRYFFINDOR',
            religion: 'OTHER',
            motherTongue: 'ENGLISH',
            nationality: 'OTHER',
            nativity: 'OTHER',
            profileStatus: 'ACTIVE',
            loginRequired: 'YES',
            username: 'HP_SEEKER',
            password: 'Expelliarmus!'
        }
    };

    const DEFAULT_PROFILE = {
        firstName: '',
        lastName: '',
        gender: 'MALE',
        dob: '',
        bloodGroup: '',
        mobile: '',
        email: '',
        maritalStatus: 'SINGLE',
        altMobile: '',
        altEmail: '',
        panNo: '',
        aadhaarNo: '',
        geoClassification: 'RURAL',
        community: 'OC',
        caste: 'OTHER',
        religion: 'OTHER',
        motherTongue: 'ENGLISH',
        nationality: 'INDIAN',
        nativity: 'TAMIL NADU',
        profileStatus: 'ACTIVE',
        loginRequired: 'YES',
        username: '',
        password: ''
    };

    const [formData, setFormData] = useState(DEFAULT_PROFILE);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'student') {
            const studentProfile = STUDENT_DB[user.id];
            if (studentProfile) {
                setFormData(studentProfile);
            } else {
                // Pre-fill email/name for new generic users
                setFormData(prev => ({
                    ...prev,
                    firstName: user.name?.split(' ')[0] || '',
                    lastName: user.name?.split(' ')[1] || '',
                    email: user.email || '',
                    username: user.email?.split('@')[0] || ''
                }));
            }
        }
    }, []);

    const tabs = [
        'Personal Information',
        'Previous work experience',
        'Miscellaneous',
        'Academic Information',
        'Certificates',
        'Other Info',
        'Entrance exam'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const InputField = ({ label, name, type = "text", required = false, className = "" }) => (
        <div className={`space-y-1 ${className}`}>
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                {name === 'dob' && <Calendar className="absolute right-3 top-2.5 text-slate-500" size={16} />}
            </div>
        </div>
    );

    const SelectField = ({ label, name, options, required = false }) => (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="Student Profile" />

            <div className="bg-[#13151b] p-8 rounded-xl border border-white/5 shadow-xl relative overflow-hidden">
                {/* Decorative Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
                    Edit User
                </h2>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Photo */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-4">
                        <div className="w-40 h-48 bg-[#1a1c23] border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center relative overflow-hidden group">
                            {/* Mock Image based on screenshot context - usually a placeholder or real img */}
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">
                                <User size={64} strokeWidth={1} />
                            </div>
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form Grid */}
                    <div className="flex-grow space-y-6">

                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <InputField label="First Name" name="firstName" required className="md:col-span-1" />
                            <InputField label="Last Name" name="lastName" required className="md:col-span-1" />

                            {/* Gender Radio */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4 pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value="MALE" checked={formData.gender === 'MALE'} onChange={handleInputChange} className="accent-purple-500" />
                                        <span className="text-sm text-slate-300">MALE</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value="FEMALE" checked={formData.gender === 'FEMALE'} onChange={handleInputChange} className="accent-purple-500" />
                                        <span className="text-sm text-slate-300">FEMALE</span>
                                    </label>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer mt-1">
                                    <input type="radio" name="gender" value="TRANSGENDER" checked={formData.gender === 'TRANSGENDER'} onChange={handleInputChange} className="accent-purple-500" />
                                    <span className="text-sm text-slate-300">TRANSGENDER</span>
                                </label>
                            </div>

                            <InputField label="Date of Birth(dd-mm-yyyy)" name="dob" type="date" />
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <SelectField label="Blood Group" name="bloodGroup" options={['A1+', 'A+', 'B+', 'O+', 'AB+']} />
                            <InputField label="Mobile Number" name="mobile" required />
                            <InputField label="Email" name="email" required />
                            <SelectField label="Marital Status" name="maritalStatus" options={['SINGLE', 'MARRIED']} />
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <InputField label="Alternative Mobile Number" name="altMobile" />
                            <InputField label="Alternative Email" name="altEmail" />
                            <InputField label="PAN No" name="panNo" />
                            <InputField label="Aadhaar No" name="aadhaarNo" />
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <SelectField label="Geographic Classification" name="geoClassification" options={['RURAL', 'URBAN']} />
                            <SelectField label="Community" name="community" options={['BC', 'MBC', 'SC', 'ST', 'OC']} required />
                            <SelectField label="Caste" name="caste" options={['VANNAR', 'OTHER']} required />
                            <SelectField label="Religion" name="religion" options={['HINDU', 'CHRISTIAN', 'MUSLIM']} />
                        </div>

                        {/* Row 5 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <SelectField label="Mother Tongue" name="motherTongue" options={['TAMIL', 'ENGLISH', 'HINDI']} />
                            <SelectField label="Nationality" name="nationality" options={['INDIAN', 'OTHER']} required />
                            <SelectField label="Nativity" name="nativity" options={['TAMIL NADU', 'KERALA', 'OTHER']} />

                            {/* Signature Upload */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                                    Signature
                                </label>
                                <div className="flex bg-[#1a1c23] border border-white/10 rounded overflow-hidden">
                                    <button className="bg-white/10 text-slate-300 px-3 py-2 text-xs font-medium border-r border-white/10 hover:bg-white/20 transition-colors">Choose file</button>
                                    <span className="px-3 py-2 text-xs text-slate-500 italic flex items-center">No file chosen</span>
                                </div>
                                <p className="text-[10px] text-green-500 mt-1">(Only allowed and size less than 20 KB)</p>
                            </div>
                        </div>

                        {/* Row 6 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                            <SelectField label="Profile Status" name="profileStatus" options={['ACTIVE', 'INACTIVE']} required />

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                                    Login Required? <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="loginRequired" value="YES" checked={formData.loginRequired === 'YES'} onChange={handleInputChange} className="accent-purple-500" />
                                        <span className="text-sm text-slate-300">YES</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="loginRequired" value="NO" checked={formData.loginRequired === 'NO'} onChange={handleInputChange} className="accent-purple-500" />
                                        <span className="text-sm text-slate-300">NO</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Row 7: Auth Credentials */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-dashed border-white/10 pt-6 mt-4">
                            <InputField label="User Name" name="username" required className="bg-slate-900/50" />

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#1a1c23] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Tabs */}
                <div className="mt-12 border-b border-white/10">
                    <div className="flex flex-wrap gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-medium transition-all relative ${activeTab === tab
                                    ? 'text-white border-b-2 border-red-500'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="py-6 min-h-[100px] text-slate-500 text-sm">
                    {/* Tab functionality could be implemented here */}
                    {activeTab === 'Personal Information' ? null : (
                        <div className="text-center italic">Content for {activeTab} section...</div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StudentProfile;
