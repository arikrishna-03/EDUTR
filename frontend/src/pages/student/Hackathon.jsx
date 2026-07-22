import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import axios from 'axios';
import { Calendar, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Hackathon() {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:5000/api/hackathons', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                        setHackathons(response.data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.warn("Backend offline or error fetching student hackathons, loading local data", err);
            }

            const local = JSON.parse(localStorage.getItem('hackathons') || '[]');
            setHackathons(local);
            setLoading(false);
        };

        fetchHackathons();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="Hackathons & Events" />

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] bg-[#13151b] rounded-3xl border border-white/5">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] bg-[#13151b] rounded-3xl border border-white/5 text-center p-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-xl text-red-400 font-medium">{error}</p>
                </div>
            ) : hackathons.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-[#13151b] rounded-3xl border border-white/5">
                    <div className="bg-indigo-500/10 p-4 rounded-full mb-4 text-indigo-400">
                        <Calendar size={48} />
                    </div>
                    <p className="text-xl text-slate-400 font-medium">Mentor didn't add anything yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathons.map((hackathon) => (
                        <div key={hackathon._id} className="bg-[#13151b] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                                    {hackathon.title}
                                </h3>
                                {(hackathon.registrationDate && new Date(hackathon.registrationDate) > new Date()) && (
                                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 whitespace-nowrap">
                                        Open
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                                {hackathon.description || "No description provided."}
                            </p>

                            <div className="space-y-3 mb-6">
                                {hackathon.registrationDate && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={14} className="text-indigo-400" />
                                        <span>Reg. Deadline: <span className="text-slate-300 font-medium">{format(new Date(hackathon.registrationDate), 'MMM d, yyyy')}</span></span>
                                    </div>
                                )}
                                {hackathon.submissionDate && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock size={14} className="text-purple-400" />
                                        <span>Submission: <span className="text-slate-300 font-medium">{format(new Date(hackathon.submissionDate), 'MMM d, yyyy')}</span></span>
                                    </div>
                                )}
                            </div>

                            {hackathon.link && (
                                <a
                                    href={hackathon.link.startsWith('http') ? hackathon.link : `https://${hackathon.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white font-medium transition-all text-sm"
                                >
                                    Visit Link <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
