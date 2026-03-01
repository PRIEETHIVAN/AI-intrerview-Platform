import express from "express";
import {
  addRecruiterNote,
  completeInterview,
  getMySessions,
  getSessionReportPdf,
  startInterview,
  submitAnswer
} from "../controllers/interviewController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/start", protect, asyncHandler(startInterview));
router.post("/answer", protect, asyncHandler(submitAnswer));
router.post("/complete", protect, asyncHandler(completeInterview));
router.get("/sessions", protect, asyncHandler(getMySessions));
router.get("/report/:sessionId", protect, asyncHandler(getSessionReportPdf));
router.post(
  "/sessions/:sessionId/notes",
  protect,
  authorizeRoles("admin"),
  asyncHandler(addRecruiterNote)
);

export default router;
