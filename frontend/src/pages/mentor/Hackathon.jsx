import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { Plus, X, Calendar, Link as LinkIcon, Clock } from 'lucide-react';

const Hackathon = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHackathons = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/hackathons', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHackathons(data);
            }
        } catch (error) {
            console.error("Error fetching hackathons", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHackathons();
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        lastRegistrationDate: '',
        link: '',
        lastSubmissionDate: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Map formData to backend expectation (title vs name)
            const payload = {
                title: formData.name,
                registrationDate: formData.lastRegistrationDate,
                submissionDate: formData.lastSubmissionDate,
                link: formData.link,
                description: "No Description" // or add field
            };

            const response = await fetch('http://localhost:5000/api/hackathons/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                // Add to list or refetch
                setHackathons(prev => [data.hackathon, ...prev]);

                // Reset form and close modal
                setFormData({
                    name: '',
                    lastRegistrationDate: '',
                    link: '',
                    lastSubmissionDate: ''
                });
                setIsModalOpen(false);
                alert("Hackathon Added Successfully!");
            } else {
                const errorData = await response.json();
                console.error("Failed to add hackathon", errorData);
                alert(`Failed to add hackathon: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error adding hackathon", error);
            alert(`An error occurred: ${error.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <DashboardHeader title="Hackathon Management">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Add Hackathon
                </button>
            </DashboardHeader>

            {/* Hackathon Table */}
            <div className="bg-[#1a1c23] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-semibold text-slate-300 w-16">S.No</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Hackathon Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Last Date</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Hackathon Link</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : Array.isArray(hackathons) && hackathons.length > 0 ? (
                                hackathons.map((hackathon, index) => (
                                    <tr key={hackathon._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-slate-400 font-medium">{index + 1}</td>
                                        <td className="p-4 text-slate-300 font-medium text-lg">{hackathon.title}</td>
                                        <td className="p-4 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-purple-400" />
                                                <span>{hackathon.registrationDate ? new Date(hackathon.registrationDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <a
                                                href={hackathon.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-2"
                                            >
                                                <LinkIcon size={14} />
                                                {hackathon.link}
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-500">
                                        No hackathons found. Click "Add Hackathon" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Hackathon Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1a1c23] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus size={24} className="text-indigo-500" />
                                Add New Hackathon
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Hackathon Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Hackathon Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter Hackathon Name"
                                    className="w-full bg-[#13151b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                />
                            </div>

                            {/* Last Registration Date - With Month/Year UI hint (Native Date Picker covers this well) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Last Registration Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="date"
                                        name="lastRegistrationDate"
                                        required
                                        value={formData.lastRegistrationDate}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all scheme-dark"
                                    />
                                </div>
                            </div>

                            {/* Hackathon Link */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Hackathon Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="url"
                                        name="link"
                                        required
                                        value={formData.link}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                        className="w-full bg-[#13151b] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Bottom Row - Split Layout */}
                            <div className="grid grid-cols-1 gap-6 pt-2">

                                {/* Left Corner: Last Submission Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Last Submission Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="date"
                                            name="lastSubmissionDate"
                                            required
                                            value={formData.lastSubmissionDate}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#13151b] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all scheme-dark"
                                        />
                                    </div>
                                </div>



                            </div>

                            {/* Submit Actions */}
                            <div className="flex justify-end pt-6 border-t border-white/10 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                                >
                                    Add Hackathon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hackathon;
