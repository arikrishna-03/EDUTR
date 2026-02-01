import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., AID-A
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Section", sectionSchema);
