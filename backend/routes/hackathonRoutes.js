import express from "express";
import { addHackathon, getHackathons } from "../controllers/hackathonController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addHackathon);
router.get("/", verifyToken, getHackathons);

export default router;
