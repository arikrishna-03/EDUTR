import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    type: { type: String, enum: ['HACKATHON_ADDED', 'OTHER'], default: 'HACKATHON_ADDED' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" }, // Optional link to the object
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
