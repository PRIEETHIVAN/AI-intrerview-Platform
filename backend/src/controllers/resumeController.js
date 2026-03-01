import fs from "fs/promises";
import pdfParse from "pdf-parse";
import Resume from "../models/Resume.js";
import { cleanText } from "../utils/textCleaner.js";
import { extractSkillsAI } from "../services/aiClient.js";

export const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Resume PDF is required" });
  }

  const buffer = await fs.readFile(req.file.path);
  const parsed = await pdfParse(buffer);
  const rawText = parsed.text || "";
  const { cleanedText, tokens } = cleanText(rawText);
  const skillResult = await extractSkillsAI(cleanedText);

  const resume = await Resume.create({
    userId: req.user._id,
    fileName: req.file.filename,
    rawText,
    cleanedText,
    tokens,
    skills: skillResult.skills || []
  });

  res.status(201).json({
    message: "Resume uploaded and parsed",
    resumeId: resume._id,
    skills: resume.skills
  });
};

export const getMyLatestResume = async (req, res) => {
  const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  if (!resume) {
    return res.status(404).json({ message: "No resume found" });
  }
  res.json(resume);
};

export const detectSkillGap = async (req, res) => {
  const { jobDescription = "" } = req.body;
  if (!jobDescription.trim()) {
    return res.status(400).json({ message: "jobDescription is required" });
  }

  const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  if (!resume) {
    return res.status(404).json({ message: "Upload resume before skill-gap analysis" });
  }

  const { cleanedText: jdText } = cleanText(jobDescription);
  const jdSkills = await extractSkillsAI(jdText);

  const resumeSkills = new Set(resume.skills.map((s) => s.name.toLowerCase()));
  const requiredSkills = (jdSkills.skills || []).map((s) => s.name.toLowerCase());
  const missingSkills = requiredSkills.filter((skill) => !resumeSkills.has(skill));

  res.json({
    resume_skills: Array.from(resumeSkills),
    required_skills: requiredSkills,
    missing_skills: missingSkills
  });
};
