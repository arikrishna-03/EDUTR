import express from "express";
import { registerStudent, loginStudent, getStudentsByMentor } from "../controllers/studentController.js";

const router = express.Router();

router.post("/signup", registerStudent);
router.post("/login", loginStudent);
router.get("/mentor/:mentorId", getStudentsByMentor);

export default router;
