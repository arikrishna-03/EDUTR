import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';

const MentorNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                        <Bell className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Mentor Notifications</h1>
                        <p className="text-slate-400">Updates and system alerts</p>
                    </div>
                </div>

                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1c23] hover:bg-[#252830] border border-white/10 rounded-lg text-slate-300 transition-colors"
                    >
                        <Check size={18} />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1c23] border border-white/5 rounded-xl">
                        <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">No Notifications</h3>
                        <p className="text-slate-500">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${!notification.isRead
                                ? 'bg-indigo-500/5 border-indigo-500/20'
                                : 'bg-[#1a1c23] border-white/5 opacity-75'
                                }`}
                        >
                            <div className={`mt-1 w-2 h-2 rounded-full ${!notification.isRead ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                            <div className="flex-1">
                                <h4 className={`font-medium ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                                    {notification.type === 'HACKATHON_ADDED' ? 'New Hackathon Added' : 'Notification'}
                                </h4>
                                <p className="text-slate-400 mt-1">{notification.message}</p>
                                <p className="text-xs text-slate-500 mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {!notification.isRead && (
                                <button
                                    onClick={() => markAsRead(notification._id)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Mark as read"
                                >
                                    <Check size={18} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MentorNotifications;
