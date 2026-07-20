import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseCalendarPDF, parseCalendarImage } from '../utils/calendarParser';

const CalendarWidget = ({ mentorId, isEditable = false }) => {
    const [calendarView, setCalendarView] = useState('weekly'); // 'weekly' | 'monthly'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [parsedEvents, setParsedEvents] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const calendarInputRef = useRef(null);

    // Sync: Load events for this mentorId on mount/update and listen for storage changes
    useEffect(() => {
        const loadData = () => {
            if (mentorId) {
                const allMentorData = JSON.parse(localStorage.getItem('mentorData') || '{}');
                const thisMentorData = allMentorData[mentorId] || {};

                if (thisMentorData.calendarEvents && thisMentorData.calendarEvents.length > 0) {
                    setParsedEvents(thisMentorData.calendarEvents);
                } else if (mentorId === 'MENTOR123') {
                    // Seed Demo Events for MENTOR123 if empty
                    const today = new Date();
                    const demoEvents = [
                        {
                            title: 'Internal Review',
                            day: today.getDate(),
                            month: today.getMonth(),
                            year: today.getFullYear(),
                            type: 'exam',
                            dateDisplay: format(today, 'MMM d')
                        },
                        {
                            title: 'Lab Evaluation',
                            day: today.getDate() + 2,
                            month: today.getMonth(),
                            year: today.getFullYear(),
                            type: 'lab',
                            dateDisplay: format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), 'MMM d')
                        },
                        {
                            title: 'Hackathon Kickoff',
                            day: today.getDate() + 5,
                            month: today.getMonth(),
                            year: today.getFullYear(),
                            type: 'cia',
                            dateDisplay: format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), 'MMM d')
                        }
                    ];
                    setParsedEvents(demoEvents);
                } else {
                    setParsedEvents([]);
                }
            }
        };

        loadData();

        // Listen for cross-tab updates
        const handleStorageChange = (e) => {
            if (e.key === 'mentorData') {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [mentorId]);

    const saveEvents = (newEvents) => {
        setParsedEvents(newEvents);
        if (mentorId) {
            const allMentorData = JSON.parse(localStorage.getItem('mentorData') || '{}');
            const thisMentorData = allMentorData[mentorId] || {};

            thisMentorData.calendarEvents = newEvents;
            allMentorData[mentorId] = thisMentorData;

            localStorage.setItem('mentorData', JSON.stringify(allMentorData));
        }
    };

    const handleNext = () => {
        if (calendarView === 'monthly') {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const handlePrev = () => {
        if (calendarView === 'monthly') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const daysInWeek = eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });

    const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handleCalendarUpload = async (e) => {
        if (!isEditable) return; // Guard clause
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            if (file.type === 'application/pdf') {
                const events = await parseCalendarPDF(file);
                // Replace or Append? Let's append for now or replace? Request implies "changes seen", typically replace state or merge.
                // Logic: For simplicity in demo, append unique or just set. Let's set.
                saveEvents(events);
                alert("Calendar PDF parsed and saved!");
            } else if (file.type.startsWith('image/')) {
                const events = await parseCalendarImage(file);
                if (events.length > 0) {
                    // Merge logic
                    const updatedEvents = [...parsedEvents, ...events];
                    saveEvents(updatedEvents);
                    alert("Calendar events parsed and saved!");
                } else {
                    alert("Could not detect Calendar events.");
                }
            }
        } catch (error) {
            console.error("Error parsing calendar:", error);
            alert("Failed to parse calendar.");
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    return (
        <div className="bg-[#13151b] p-6 rounded-xl border border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold">{format(currentDate, 'd')}</div>
                    <div className="text-lg font-semibold uppercase tracking-wide text-slate-300">
                        {format(currentDate, 'MMMM yyyy')}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <div className="bg-[#1a1c23] rounded-lg p-1 flex items-center text-xs font-medium border border-white/10">
                        <button
                            onClick={() => setCalendarView('weekly')}
                            className={`px-3 py-1 rounded-md transition-colors ${calendarView === 'weekly' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setCalendarView('monthly')}
                            className={`px-3 py-1 rounded-md transition-colors ${calendarView === 'monthly' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                    </div>

                    {/* Nav */}
                    <div className="flex gap-1 ml-2">
                        <div className="flex gap-1 ml-2">
                            <button onClick={handlePrev} className="p-1.5 hover:bg-white/10 rounded border border-white/10 text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
                            <button onClick={handleNext} className="p-1.5 hover:bg-white/10 rounded border border-white/10 text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    {/* Upload for Calendar - ONLY IF EDITABLE */}
                    {isEditable && (
                        <>
                            <input
                                type="file"
                                ref={calendarInputRef}
                                className="hidden"
                                onChange={handleCalendarUpload}
                                accept=".pdf,image/*"
                            />
                            <button
                                onClick={() => calendarInputRef.current.click()}
                                disabled={isUploading}
                                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isUploading ? 'Parsing...' : 'Upload'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Calendar Grid View */}
            <div className="transition-all duration-300">
                {calendarView === 'monthly' ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="grid grid-cols-7 gap-2">
                            {/* Weekday Headers */}
                            {weekDayNames.map((name, idx) => (
                                <div key={`header-${idx}`} className="text-center text-xs font-semibold text-slate-400 py-2 border-b border-white/5 mb-1">
                                    {name}
                                </div>
                            ))}

                            {/* Padding days for the start of the month */}
                            {Array.from({ length: (startOfMonth(currentDate).getDay() + 6) % 7 }).map((_, idx) => (
                                <div key={`pad-${idx}`} className="min-h-[6rem] h-auto rounded-lg p-2 border border-transparent bg-transparent" />
                            ))}

                            {/* Actual days in the month */}
                            {daysInMonth.map((day, i) => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                    <div key={i} className={`min-h-[6rem] h-auto rounded-lg p-2 border border-white/5 bg-[#1a1c23] ${isToday ? 'bg-indigo-500/10 border-indigo-500/50' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {parsedEvents
                                                .filter(evt =>
                                                    evt.day === parseInt(format(day, 'd')) &&
                                                    evt.month === day.getMonth() &&
                                                    evt.year === day.getFullYear()
                                                )
                                                .map((evt, idx) => {
                                                    let bgClass = 'bg-blue-500/20 text-blue-200'; // Default
                                                    if (evt.type === 'holiday') bgClass = 'bg-red-500/20 text-red-200';
                                                    else if (evt.type === 'cia') bgClass = 'bg-yellow-500/20 text-yellow-200';
                                                    else if (evt.type === 'exam') bgClass = 'bg-purple-500/20 text-purple-200';
                                                    else if (evt.type === 'lab') bgClass = 'bg-green-500/20 text-green-200';

                                                    return (
                                                        <div key={idx} className={`text-[10px] p-1 rounded leading-snug ${bgClass}`}>
                                                            {evt.title}
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 text-sm text-slate-500">
                            <h4 className="font-semibold text-white mb-1">Month Events</h4>
                            {parsedEvents.length > 0 ? (
                                <ul className="space-y-1 mt-2 max-h-40 overflow-y-auto">
                                    {parsedEvents
                                        .filter(evt => evt.month === currentDate.getMonth() && evt.year === currentDate.getFullYear())
                                        .map((evt, i) => {
                                            let textClass = 'text-slate-300';
                                            if (evt.type === 'holiday') textClass = 'text-red-400';
                                            else if (evt.type === 'cia') textClass = 'text-yellow-400';
                                            else if (evt.type === 'exam') textClass = 'text-purple-400';
                                            else if (evt.type === 'lab') textClass = 'text-green-400';

                                            return (
                                                <li key={i} className="flex justify-between items-center text-xs p-1 hover:bg-white/5 rounded">
                                                    <span className={textClass}>
                                                        {evt.dateDisplay}: {evt.title}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                </ul>
                            ) : (
                                <p>No parsed events yet {isEditable && '— upload a PDF/Image to populate schedule'}.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        {/* Weekly Strip */}
                        <div className="grid grid-cols-7 gap-2 mb-6">
                            {daysInWeek.map((day, i) => {
                                const isToday = isSameDay(day, new Date());
                                const dateNumber = parseInt(format(day, 'd'));
                                return (
                                    <div key={i} className={`rounded-xl border border-white/5 bg-[#1a1c23] p-4 flex flex-col items-center justify-center gap-1 ${isToday ? 'bg-indigo-500/10 border-indigo-500/50 relative overflow-hidden' : ''}`}>
                                        {isToday && <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500"></div>}
                                        <span className={`text-xs ${isToday ? 'text-indigo-300' : 'text-slate-500'}`}>{weekDayNames[i]}</span>
                                        <span className={`text-xl font-bold ${isToday ? 'text-white' : 'text-slate-300'}`}>{dateNumber}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Week Events Section */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Week Events</h4>
                            <div className="space-y-2">
                                {daysInWeek.map((day, i) => {
                                    const dayEvents = parsedEvents.filter(evt =>
                                        evt.day === parseInt(format(day, 'd')) &&
                                        evt.month === day.getMonth() &&
                                        evt.year === day.getFullYear()
                                    );

                                    if (dayEvents.length === 0) return null;

                                    return (
                                        <div key={i} className="bg-[#1a1c23] p-3 rounded-xl border border-white/5">
                                            <h5 className="text-xs font-semibold text-slate-400 mb-2">{format(day, 'EEEE, MMM d')}</h5>
                                            <div className="space-y-2">
                                                {dayEvents.map((evt, idx) => {
                                                    let bgClass = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
                                                    if (evt.type === 'holiday') bgClass = 'bg-red-500/10 text-red-300 border-red-500/20';
                                                    else if (evt.type === 'cia') bgClass = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
                                                    else if (evt.type === 'exam') bgClass = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
                                                    else if (evt.type === 'lab') bgClass = 'bg-green-500/10 text-green-300 border-green-500/20';

                                                    return (
                                                        <div key={idx} className={`text-sm p-2 rounded border ${bgClass}`}>
                                                            {evt.title}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                {parsedEvents.filter(evt => {
                                    const evtDate = new Date(evt.year, evt.month, evt.day);
                                    return daysInWeek.some(day => isSameDay(day, evtDate));
                                }).length === 0 && (
                                        <div className="bg-[#1a1c23] p-8 rounded-xl border border-white/5 text-center text-slate-500 border-dashed">
                                            No events this week {isEditable && '— upload a PDF to populate schedule'}.
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarWidget;
