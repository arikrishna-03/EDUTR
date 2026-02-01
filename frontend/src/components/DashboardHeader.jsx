import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const DashboardHeader = ({ title, children }) => {
    const location = useLocation();
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const isStudent = location.pathname.startsWith('/student');

    React.useEffect(() => {
        if (isStudent) {
            fetchNotifications();
        }
    }, [isStudent]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token'); // Assuming token is stored here
            if (!token) return;

            // Simple fetch, in real app use axios instance with interceptors
            const response = await fetch('http://localhost:5000/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };



    return (
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">{title}</h1>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex items-center bg-[#1a1c23] border border-white/10 rounded-lg px-3 py-2 w-64">
                    <Search size={18} className="text-slate-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm w-full focus:outline-none text-slate-300 placeholder-slate-600"
                    />
                </div>

                {/* Extra Actions (e.g. Download) */}
                {children}

                {/* Notification */}
                <Link to={isStudent ? "/student/notifications" : "/mentor/notifications"} className="relative">
                    <button
                        className="w-10 h-10 rounded-lg bg-[#1a1c23] hover:bg-[#252830] border border-white/10 flex items-center justify-center text-amber-500 transition-colors relative"
                    >
                        <Bell size={20} fill={unreadCount > 0 ? "currentColor" : "none"} />
                        {unreadCount > 0 && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1a1c23]"></div>
                        )}
                    </button>
                </Link>

                {/* Profile Avatar */}
                <Link to={location.pathname.startsWith('/student') ? '/student/profile' : '/mentor/profile'}>
                    <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-[#0f1015] shadow-sm overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default DashboardHeader;
