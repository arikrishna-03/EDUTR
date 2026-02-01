import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const studentId = req.user.id;
        const notifications = await Notification.find({ recipientId: studentId })
            .sort({ createdAt: -1 })
            .populate('senderId', 'name')
            .populate('relatedId'); // Populate Hackathon details if needed
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notifications", error: err.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notification", error: err.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const studentId = req.user.id;
        await Notification.updateMany({ recipientId: studentId, isRead: false }, { isRead: true });
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notifications", error: err.message });
    }
}
