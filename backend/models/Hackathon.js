import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    registrationDate: { type: Date },
    submissionDate: { type: Date },
}, { timestamps: true });

const Hackathon = mongoose.model("Hackathon", hackathonSchema);
export default Hackathon;
