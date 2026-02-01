import Hackathon from "../models/Hackathon.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import Mentor from "../models/Mentor.js";

export const addHackathon = async (req, res) => {
    try {
        const { title, description, link, registrationDate, submissionDate } = req.body;
        const mentorId = req.user.id; // From auth middleware

        // Create Hackathon
        const newHackathon = new Hackathon({
            mentorId,
            title,
            description,
            link,
            registrationDate,
            submissionDate
        });
        await newHackathon.save();

        // Find Mentor to get the section code
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        // Find linked Students
        const students = await Student.find({ mentorId: mentor.section });

        // Create Notifications
        const notifications = students.map(student => ({
            recipientId: student._id,
            senderId: mentorId,
            type: 'HACKATHON_ADDED',
            message: `New Hackathon: ${title}`,
            relatedId: newHackathon._id
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ message: "Hackathon added and students notified", hackathon: newHackathon });
    } catch (err) {
        res.status(500).json({ message: "Error adding hackathon", error: err.message });
    }
};

export const getHackathons = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role; // "student" or "mentor"

        let targetMentorId;

        if (role === 'student') {
            // 1. Find the student to get their assigned mentor section code
            const student = await Student.findById(userId);
            if (!student) return res.status(404).json({ message: "Student not found" });

            // 2. Find the mentor by that section code
            const mentor = await Mentor.findOne({ section: student.mentorId });
            if (!mentor) {
                // If no mentor linked, return empty or error? Empty list is safer.
                return res.status(200).json([]);
            }
            targetMentorId = mentor._id;

        } else {
            // If mentor, they want to see their own hackathons
            targetMentorId = userId;
        }

        const hackathons = await Hackathon.find({ mentorId: targetMentorId }).sort({ createdAt: -1 });
        res.status(200).json(hackathons);
    } catch (err) {
        console.error("Error in getHackathons:", err);
        res.status(500).json({ message: "Error fetching hackathons", error: err.message });
    }
};
