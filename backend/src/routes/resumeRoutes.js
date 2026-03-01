import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { detectSkillGap, getMyLatestResume, uploadResume } from "../controllers/resumeController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
      return;
    }
    cb(null, true);
  }
});

router.post("/upload", protect, upload.single("resume"), asyncHandler(uploadResume));
router.get("/latest", protect, asyncHandler(getMyLatestResume));
router.post("/skill-gap", protect, asyncHandler(detectSkillGap));

export default router;
