import Student from "../models/Student.js";
import Mentor from "../models/Mentor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, mentorId } = req.body;

    // verify mentorId exists (section)
    const mentor = await Mentor.findOne({ section: mentorId });
    if (!mentor) return res.status(400).json({ message: "Invalid mentor ID" });

    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: "Student already exists" });

    const hash = await bcrypt.hash(password, 10);
    const newStudent = new Student({ name, email, password: hash, mentorId });
    await newStudent.save();

    res.status(201).json({ message: "Student registered successfully", student: { _id: newStudent._id, name, email, mentorId }});
  } catch (err) {
    res.status(500).json({ message: "Error registering student", error: err.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password, mentorId } = req.body;
    // ensure student belongs or uses mentorId (optional)
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // optionally verify mentorId if provided
    if (mentorId && student.mentorId !== mentorId) {
      return res.status(401).json({ message: "Mentor ID does not match student record" });
    }

    const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "8h" });

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        mentorId: student.mentorId
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in student", error: err.message });
  }
};

export const getStudentsByMentor = async (req, res) => {
  try {
    const students = await Student.find({ mentorId: req.params.mentorId }).select("-password").sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students", error: err.message });
  }
};
