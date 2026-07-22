import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { Search, Filter, Save, Check, X, Calendar, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Attendance = () => {
    const [students, setStudents] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const getActiveMentorId = () => {
        try {
            const savedProfile = JSON.parse(localStorage.getItem('mentorProfile') || '{}');
            if (savedProfile.mentorId) return savedProfile.mentorId.trim().toUpperCase();

            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (user.id) return user.id.trim().toUpperCase();
            if (user.mentorId) return user.mentorId.trim().toUpperCase();
        } catch (e) {
            console.error(e);
        }
        return 'MENTOR123';
    };

    const currentMentorId = getActiveMentorId();

    // 1. Load students on mount
    useEffect(() => {
        const activeId = getActiveMentorId();
        const allStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
        const myStudents = allStudents.filter(
            s => s.mentorId && s.mentorId.trim().toUpperCase() === activeId
        );
        const seen = new Set();
        const uniqueStudents = myStudents.filter(s => {
            const key = s.email || s.id || s.name;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const studentsWithReg = uniqueStudents.map((s, index) => ({
            ...s,
            regNo: s.regNo || `REG${2024000 + index + 1}`
        }));
        setStudents(studentsWithReg);
    }, []);

    // 2. Load attendance status for the selected date
    useEffect(() => {
        if (students.length === 0) return;

        const history = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
        const existingRecord = history.find(h => h.date === currentDate && h.mentorId === currentMentorId);

        const initialStatus = {};
        if (existingRecord) {
            existingRecord.records.forEach(r => {
                initialStatus[r.studentId] = r.status === 'Present';
            });
            students.forEach(s => {
                if (initialStatus[s.id] === undefined) {
                    initialStatus[s.id] = true;
                }
            });
        } else {
            students.forEach(s => {
                initialStatus[s.id] = true;
            });
        }
        setAttendanceStatus(initialStatus);
    }, [currentDate, students]);

    const handleToggle = (studentId) => {
        setAttendanceStatus(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleSubmit = () => {
        const record = {
            date: currentDate,
            mentorId: currentMentorId,
            records: Object.entries(attendanceStatus).map(([studentId, isPresent]) => ({
                studentId,
                status: isPresent ? 'Present' : 'Absent',
                timestamp: new Date().toISOString()
            }))
        };

        // Save to local storage (Mock Backend) - prevent duplicates for same date
        const existingHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
        const existingIndex = existingHistory.findIndex(h => h.date === currentDate && h.mentorId === currentMentorId);

        if (existingIndex > -1) {
            existingHistory[existingIndex] = record;
        } else {
            existingHistory.push(record);
        }

        localStorage.setItem('attendanceHistory', JSON.stringify(existingHistory));
        alert('Attendance submitted successfully!');
    };

    const handleDownloadCSV = () => {
        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Register No,Student Name,Date,Status\n";

        // CSV Rows
        filteredStudents.forEach(student => {
            const status = attendanceStatus[student.id] ? 'Present' : 'Absent';
            const row = `${student.regNo},${student.name},${currentDate},${status}`;
            csvContent += row + "\n";
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_${currentDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text(`Student Attendance - ${currentDate}`, 14, 22);

        // Table Data
        const tableBody = filteredStudents.map(student => [
            student.regNo,
            student.name,
            attendanceStatus[student.id] ? 'Present' : 'Absent'
        ]);

        // Generate Table
        autoTable(doc, {
            head: [['Register No', 'Student Name', 'Status']],
            body: tableBody,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            styles: { fontSize: 10 },
            didParseCell: function (data) {
                // Color code Status column
                if (data.section === 'body' && data.column.index === 2) {
                    const status = data.cell.raw;
                    if (status === 'Present') {
                        data.cell.styles.textColor = [16, 185, 129]; // Emerald-500
                    } else {
                        data.cell.styles.textColor = [239, 68, 68]; // Red-500
                    }
                }
            }
        });

        doc.save(`attendance_${currentDate}.pdf`);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <DashboardHeader title="Student Attendance" />

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1a1c23] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#13151b] px-4 py-2 rounded-xl border border-white/10 text-slate-300">
                        <Calendar size={18} />
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            style={{ colorScheme: 'dark' }}
                            className="bg-transparent border-none text-slate-300 font-mono text-sm focus:outline-none cursor-pointer"
                        />
                    </div>
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Name or Reg No..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#13151b] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadCSV}
                            className="p-2 bg-[#13151b] border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            title="Download CSV"
                        >
                            <FileText size={18} />
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-[#13151b] border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            <Download size={16} />
                            Download PDF
                        </button>
                    </div>
                    <div className="text-slate-400 text-sm font-medium">
                        Total Students: <span className="text-white">{students.length}</span>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-[#1a1c23] rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium border-b border-white/5">Register No</th>
                                <th className="p-4 font-medium border-b border-white/5">Student Name</th>
                                <th className="p-4 font-medium border-b border-white/5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-500">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-slate-300 font-mono text-sm">
                                            {student.regNo}
                                        </td>
                                        <td className="p-4 text-white font-medium">
                                            {student.name}
                                        </td>
                                        <td className="p-4 flex justify-center">
                                            <button
                                                onClick={() => handleToggle(student.id)}
                                                className={`relative w-32 h-10 rounded-xl flex items-center transition-all duration-300 ${attendanceStatus[student.id]
                                                    ? 'bg-emerald-500/20 border border-emerald-500/50'
                                                    : 'bg-red-500/20 border border-red-500/50'
                                                    }`}
                                            >
                                                <div className={`absolute w-[48%] h-8 rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center font-bold text-xs ${attendanceStatus[student.id]
                                                        ? 'left-1 bg-emerald-500 text-white'
                                                        : 'left-[50%] bg-red-500 text-white'
                                                    }`}>
                                                    {attendanceStatus[student.id] ? 'PRESENT' : 'ABSENT'}
                                                </div>

                                                <span className={`absolute right-3 text-xs font-semibold uppercase transition-opacity duration-300 ${attendanceStatus[student.id] ? 'opacity-100 text-emerald-500' : 'opacity-0'}`}>

                                                </span>
                                                <span className={`absolute left-4 text-xs font-semibold uppercase transition-opacity duration-300 ${!attendanceStatus[student.id] ? 'opacity-100 text-red-500' : 'opacity-0'}`}>

                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-1"
                >
                    <Save size={20} />
                    Submit Attendance
                </button>
            </div>
        </div>
    );
};

export default Attendance;
