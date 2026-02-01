import express from "express";
import { registerMentor, loginMentor, updateMentorSection, getMentorById } from "../controllers/mentorController.js";

const router = express.Router();

router.post("/signup", registerMentor);
router.post("/login", loginMentor);
router.put("/update-id/:id", updateMentorSection);
router.get("/:id", getMentorById);

export default router;
