import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { Plus, X, Calendar, Link as LinkIcon, Clock, Trash2, Search, FileText, Bookmark, Send, Edit3 } from 'lucide-react';

const Hackathon = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [hackathons, setHackathons] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingDraftId, setEditingDraftId] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHackathons = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('http://localhost:5000/api/hackathons', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setHackathons(data);
                        localStorage.setItem('hackathons', JSON.stringify(data));
                        setLoading(false);
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn("API offline or error fetching hackathons, falling back to localStorage", error);
        }

        // Fallback to local storage
        const local = JSON.parse(localStorage.getItem('hackathons') || '[]');
        setHackathons(local);
        setLoading(false);
    };

    useEffect(() => {
        fetchHackathons();
        const savedDrafts = JSON.parse(localStorage.getItem('hackathon_drafts') || '[]');
        setDrafts(savedDrafts);
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

    const handleSaveDraft = (e) => {
        e.preventDefault();
        if (!formData.name && !formData.link && !formData.lastRegistrationDate && !formData.lastSubmissionDate) {
            alert("Please fill in at least one field before saving as draft.");
            return;
        }

        const draftItem = {
            id: editingDraftId || 'draft_' + Date.now(),
            name: formData.name || 'Untitled Draft',
            lastRegistrationDate: formData.lastRegistrationDate || '',
            link: formData.link || '',
            lastSubmissionDate: formData.lastSubmissionDate || '',
            savedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setDrafts(prev => {
            const filtered = prev.filter(d => d.id !== draftItem.id);
            const updated = [draftItem, ...filtered];
            localStorage.setItem('hackathon_drafts', JSON.stringify(updated));
            return updated;
        });

        setFormData({
            name: '',
            lastRegistrationDate: '',
            link: '',
            lastSubmissionDate: ''
        });
        setEditingDraftId(null);
        setIsModalOpen(false);
    };

    const handlePublishDraft = async (draft) => {
        const formattedLink = draft.link
            ? (draft.link.startsWith('http://') || draft.link.startsWith('https://') ? draft.link : `https://${draft.link}`)
            : '';

        const newItem = {
            _id: 'hack_' + Date.now(),
            title: draft.name || 'New Hackathon',
            registrationDate: draft.lastRegistrationDate,
            submissionDate: draft.lastSubmissionDate,
            link: formattedLink,
            description: "Hackathon Event"
        };

        setHackathons(prev => {
            const updated = [newItem, ...prev.filter(h => h._id !== newItem._id)];
            localStorage.setItem('hackathons', JSON.stringify(updated));
            return updated;
        });

        handleDeleteDraft(draft.id);

        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('http://localhost:5000/api/hackathons/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newItem)
                });
            }
        } catch (err) {
            console.warn("Backend add draft failed", err);
        }
    };

    const handleEditDraft = (draft) => {
        setFormData({
            name: draft.name || '',
            lastRegistrationDate: draft.lastRegistrationDate || '',
            link: draft.link || '',
            lastSubmissionDate: draft.lastSubmissionDate || ''
        });
        setEditingDraftId(draft.id);
        setIsDraftModalOpen(false);
        setIsModalOpen(true);
    };

    const handleDeleteDraft = (draftId) => {
        setDrafts(prev => {
            const updated = prev.filter(d => d.id !== draftId);
            localStorage.setItem('hackathon_drafts', JSON.stringify(updated));
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formattedLink = formData.link.startsWith('http://') || formData.link.startsWith('https://') 
            ? formData.link 
            : `https://${formData.link}`;

        const fallbackItem = {
            _id: 'hack_' + Date.now(),
            title: formData.name,
            registrationDate: formData.lastRegistrationDate,
            submissionDate: formData.lastSubmissionDate,
            link: formattedLink,
            description: "Hackathon Event"
        };

        let newItem = fallbackItem;

        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payload = {
                    title: formData.name,
                    registrationDate: formData.lastRegistrationDate,
                    submissionDate: formData.lastSubmissionDate,
                    link: formattedLink,
                    description: "Hackathon Event"
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
                    if (data.hackathon) {
                        newItem = data.hackathon;
                    }
                }
            }
        } catch (error) {
            console.warn("Backend post failed, adding locally", error);
        }

        // Update state & localStorage
        setHackathons(prev => {
            const updated = [newItem, ...prev.filter(item => item._id !== newItem._id)];
            localStorage.setItem('hackathons', JSON.stringify(updated));
            return updated;
        });

        // Remove draft if editing a draft
        if (editingDraftId) {
            handleDeleteDraft(editingDraftId);
        }

        // Reset form and close modal
        setFormData({
            name: '',
            lastRegistrationDate: '',
            link: '',
            lastSubmissionDate: ''
        });
        setEditingDraftId(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        setHackathons(prev => {
            const updated = prev.filter(item => item._id !== id);
            localStorage.setItem('hackathons', JSON.stringify(updated));
            return updated;
        });

        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`http://localhost:5000/api/hackathons/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.warn("Backend delete skipped", error);
        }
    };

    const filteredHackathons = hackathons.filter(h => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (h.title && h.title.toLowerCase().includes(q)) ||
            (h.link && h.link.toLowerCase().includes(q))
        );
    });

    return (
        <div className="space-y-6">
            <DashboardHeader title="Hackathon Management">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#13151b] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all w-48 md:w-56 placeholder:text-slate-500"
                        />
                    </div>

                    {/* Drafts Button */}
                    <button
                        onClick={() => setIsDraftModalOpen(true)}
                        className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer relative"
                    >
                        <FileText size={18} />
                        <span>Drafts</span>
                        {drafts.length > 0 && (
                            <span className="bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {drafts.length}
                            </span>
                        )}
                    </button>

                    {/* Add Hackathon Button */}
                    <button
                        onClick={() => {
                            setEditingDraftId(null);
                            setFormData({ name: '', lastRegistrationDate: '', link: '', lastSubmissionDate: '' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={18} />
                        Add Hackathon
                    </button>
                </div>
            </DashboardHeader>

            {/* Hackathon Table */}
            <div className="bg-[#1a1c23] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-semibold text-slate-300 w-16">S.No</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Hackathon Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Last Date</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Hackathon Link</th>
                                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : Array.isArray(filteredHackathons) && filteredHackathons.length > 0 ? (
                                filteredHackathons.map((hackathon, index) => (
                                    <tr key={hackathon._id || index} className="hover:bg-white/5 transition-colors group">
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
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(hackathon._id)}
                                                title="Delete Hackathon"
                                                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-500">
                                        {searchQuery ? "No matching hackathons found." : 'No hackathons found. Click "Add Hackathon" to create one.'}
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
                                {editingDraftId ? 'Edit Draft Hackathon' : 'Add New Hackathon'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingDraftId(null);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
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

                            {/* Last Registration Date */}
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
                                {/* Last Submission Date */}
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
                            <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/10 gap-3">
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-sm transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <Bookmark size={16} />
                                    Save Draft
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingDraftId(null);
                                        }}
                                        className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 cursor-pointer"
                                    >
                                        {editingDraftId ? 'Publish Draft' : 'Add Hackathon'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Drafts Modal */}
            {isDraftModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1a1c23] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText size={22} className="text-amber-400" />
                                Saved Drafts ({drafts.length})
                            </h2>
                            <button
                                onClick={() => setIsDraftModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {drafts.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <FileText size={48} className="mx-auto mb-3 text-slate-600 opacity-50" />
                                    <p className="text-base font-medium text-slate-400">No saved drafts</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        You can save hackathon drafts while filling out the form to publish or edit them later.
                                    </p>
                                </div>
                            ) : (
                                drafts.map((draft) => (
                                    <div
                                        key={draft.id}
                                        className="p-4 rounded-xl bg-[#13151b] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-base">
                                                    {draft.name || 'Untitled Draft'}
                                                </h4>
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    Draft
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                                {draft.lastRegistrationDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-purple-400" />
                                                        Reg: {draft.lastRegistrationDate}
                                                    </span>
                                                )}
                                                {draft.lastSubmissionDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} className="text-pink-400" />
                                                        Sub: {draft.lastSubmissionDate}
                                                    </span>
                                                )}
                                                {draft.link && (
                                                    <span className="flex items-center gap-1 text-indigo-400 truncate max-w-[200px]">
                                                        <LinkIcon size={12} />
                                                        {draft.link}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 pt-0.5">Saved: {draft.savedAt}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handlePublishDraft(draft)}
                                                title="Publish Draft"
                                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                                            >
                                                <Send size={14} />
                                                Publish
                                            </button>
                                            <button
                                                onClick={() => handleEditDraft(draft)}
                                                title="Edit Draft"
                                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                <Edit3 size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDraft(draft.id)}
                                                title="Delete Draft"
                                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hackathon;
