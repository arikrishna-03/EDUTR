import Mentor from "../models/Mentor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const registerMentor = async (req, res) => {
  try {
    const { name, email, password, section } = req.body;
    const exists = await Mentor.findOne({ email });
    if (exists) return res.status(400).json({ message: "Mentor already exists" });

    const hash = await bcrypt.hash(password, 10);
    const newMentor = new Mentor({ name, email, password: hash, section });
    await newMentor.save();
    res.status(201).json({ message: "Mentor registered successfully", mentor: { _id: newMentor._id, name, email, section }});
  } catch (err) {
    res.status(500).json({ message: "Error registering mentor", error: err.message });
  }
};

export const loginMentor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    const match = await bcrypt.compare(password, mentor.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: mentor._id, role: "mentor" }, process.env.JWT_SECRET, { expiresIn: "8h" });

    res.status(200).json({
      message: "Login successful",
      token,
      mentor: {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        section: mentor.section
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

export const updateMentorSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { section } = req.body;
    const mentor = await Mentor.findById(id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    mentor.section = section;
    await mentor.save();
    res.status(200).json({ message: "Mentor section updated", mentor });
  } catch (err) {
    res.status(500).json({ message: "Error updating mentor", error: err.message });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).select("-password");
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.status(200).json(mentor);
  } catch (err) {
    res.status(500).json({ message: "Error fetching mentor", error: err.message });
  }
};
