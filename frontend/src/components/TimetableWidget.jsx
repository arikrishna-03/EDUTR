import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { parseTimeTableImage, parseTimeTablePDF } from '../utils/calendarParser';

const TimetableWidget = ({ mentorId, isEditable = false }) => {
    const [timetable, setTimetable] = useState(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay()); // 0-6 (Sun-Sat)
    const [isUploading, setIsUploading] = useState(false);
    const timetableInputRef = useRef(null);

    // Sync: Load timetable for this mentorId on mount and listen for storage changes
    useEffect(() => {
        const loadData = () => {
            if (mentorId) {
                const allMentorData = JSON.parse(localStorage.getItem('mentorData') || '{}');
                const thisMentorData = allMentorData[mentorId] || {};
                if (thisMentorData.timetable) {
                    setTimetable(thisMentorData.timetable);
                } else {
                    setTimetable(null);
                }
            }
        };

        loadData();

        const handleStorageChange = (e) => {
            if (e.key === 'mentorData') {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [mentorId]);

    const saveTimetable = (data) => {
        setTimetable(data);
        if (mentorId) {
            const allMentorData = JSON.parse(localStorage.getItem('mentorData') || '{}');
            const thisMentorData = allMentorData[mentorId] || {};

            thisMentorData.timetable = data;
            allMentorData[mentorId] = thisMentorData;

            localStorage.setItem('mentorData', JSON.stringify(allMentorData));
        }
    };

    const handleTimetableUpload = async (e) => {
        if (!isEditable) return;
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            let timetableData = null;
            if (file.type === 'application/pdf') {
                timetableData = await parseTimeTablePDF(file);
            } else if (file.type.startsWith('image/')) {
                timetableData = await parseTimeTableImage(file);
            }

            if (timetableData && Object.keys(timetableData).length > 0) {
                saveTimetable(timetableData);
                alert("Timetable uploaded and saved successfully!");
            } else {
                alert("Could not detect Timetable data (days).");
            }
        } catch (error) {
            console.error("Error parsing timetable:", error);
            alert("Failed to parse timetable.");
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset input
        }
    };

    return (
        <div className="bg-[#13151b] p-6 rounded-xl border border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Daily Timetable</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedDayIndex(prev => (prev === 0 ? 6 : prev - 1))}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium w-24 text-center">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDayIndex]}
                    </span>
                    <button
                        onClick={() => setSelectedDayIndex(prev => (prev === 6 ? 0 : prev + 1))}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Upload Section - ONLY IF EDITABLE */}
                {isEditable && (
                    <>
                        <input
                            type="file"
                            ref={timetableInputRef}
                            className="hidden"
                            onChange={handleTimetableUpload}
                            accept="image/*,.pdf"
                        />
                        <button
                            onClick={() => {
                                if (timetableInputRef.current) {
                                    timetableInputRef.current.click();
                                }
                            }}
                            disabled={isUploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Upload size={14} />
                            {isUploading ? '...' : 'Upload'}
                        </button>
                    </>
                )}
            </div>

            <div className="mt-2 space-y-3">
                {timetable ? (
                    <div>
                        {(timetable[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDayIndex]] || []).length > 0 ? (
                            timetable[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDayIndex]].map((slot, idx) => {
                                // Parse Time string "8:40 AM - 9:30 AM" -> ["8:40 AM", "9:30 AM"]
                                const timeParts = slot.time.includes('-') ? slot.time.split('-').map(t => t.trim()) : [slot.time, ''];
                                const startTime = timeParts[0];
                                const endTime = timeParts[1];

                                // Cycle accent colors
                                const colors = ['border-emerald-500', 'border-pink-500', 'border-indigo-500', 'border-cyan-500', 'border-orange-500'];
                                const accentColor = colors[idx % colors.length];

                                return (
                                    <div key={idx} className="flex gap-3 group">
                                        {/* Time Column */}
                                        <div className="flex flex-col items-end w-16 pt-1 flex-shrink-0">
                                            <span className="text-white font-medium text-sm leading-tight">{startTime}</span>
                                            <span className="text-slate-500 text-[10px] mt-0.5">{endTime}</span>
                                        </div>

                                        {/* Card */}
                                        <div className={`flex-1 relative bg-[#1a1c23] hover:bg-[#20222b] transition-colors rounded-r-lg p-3 border-l-[3px] ${accentColor} shadow-sm group-hover:shadow-md`}>
                                            {/* Optional Tag or Icon could go here */}
                                            {idx === 2 && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>} {/* Mock active indicator */}

                                            <h4 className="font-semibold text-white text-[15px]">{slot.subject}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-slate-500 text-xs font-medium">Class</span>
                                                <span className="text-slate-600 text-[10px]">•</span>
                                                <span className="text-slate-400 text-xs flex items-center gap-1">
                                                    Room A-10{idx + 1}
                                                </span>
                                            </div>
                                            {/* Optional Teacher Name Mock */}
                                            <div className="mt-2 flex items-center gap-1.5">
                                                <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-white">T</div>
                                                <span className="text-xs text-slate-400">Instructor {idx + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full text-center text-slate-500 py-8 text-sm italic">
                                No classes scheduled for this day.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 px-4 text-slate-500 text-sm border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                        <p className="mb-2">No timetable loaded.</p>
                        <p className="text-xs text-slate-600">Upload an image or PDF to see your schedule.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimetableWidget;
