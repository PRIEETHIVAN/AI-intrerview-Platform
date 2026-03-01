import InterviewSession from "../models/InterviewSession.js";
import Resume from "../models/Resume.js";
import CodingSession from "../models/CodingSession.js";
import { cleanText } from "../utils/textCleaner.js";
import { extractSkillsAI } from "../services/aiClient.js";

export const getMyAnalytics = async (req, res) => {
  const sessions = await InterviewSession.find({ userId: req.user._id, status: "completed" }).sort({
    createdAt: 1
  });

  const overallScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.totalScore, 0) / sessions.length)
    : 0;

  const skillMap = {};
  for (const session of sessions) {
    for (const answer of session.answers) {
      if (!answer.userAnswer) continue;
      if (!skillMap[answer.skill]) skillMap[answer.skill] = [];
      skillMap[answer.skill].push(answer.score);
    }
  }

  const skillPerformance = Object.entries(skillMap).map(([skill, values]) => ({
    skill,
    score: Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  }));

  const trend = sessions.map((s) => ({
    date: s.createdAt.toISOString().slice(0, 10),
    score: s.totalScore
  }));

  const weakTopicMap = {};
  for (const session of sessions) {
    for (const answer of session.answers) {
      if (!answer.userAnswer) continue;
      if (!weakTopicMap[answer.topic]) weakTopicMap[answer.topic] = [];
      weakTopicMap[answer.topic].push(answer.score);
    }
  }

  const weakTopics = Object.entries(weakTopicMap)
    .map(([topic, values]) => ({
      topic,
      score: Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    }))
    .filter((entry) => entry.score < 55)
    .sort((a, b) => a.score - b.score)
    .slice(0, 6);

  res.json({
    overallScore,
    interviews: sessions.length,
    skillPerformance,
    trend,
    weakTopics,
    history: sessions.map((s) => ({
      id: s._id,
      date: s.createdAt.toISOString().slice(0, 10),
      score: s.totalScore,
      weakTopics: s.weakTopics,
      notes: s.recruiterNotes
    }))
  });
};

export const getRoleReadiness = async (req, res) => {
  const { jobDescription = "", targetRole = "General Software Engineer" } = req.body;
  if (!jobDescription.trim()) {
    return res.status(400).json({ message: "jobDescription is required" });
  }

  const [resume, interviews, coding] = await Promise.all([
    Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 }),
    InterviewSession.find({ userId: req.user._id, status: "completed" }).sort({ createdAt: -1 }).limit(5),
    CodingSession.findOne({ userId: req.user._id, status: "completed" }).sort({ createdAt: -1 })
  ]);

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  const { cleanedText } = cleanText(jobDescription);
  const jd = await extractSkillsAI(cleanedText);

  const requiredSkills = (jd.skills || []).map((s) => s.name.toLowerCase());
  const resumeSkills = resume.skills.map((s) => s.name.toLowerCase());
  const matchedSkills = requiredSkills.filter((s) => resumeSkills.includes(s));
  const missingSkills = requiredSkills.filter((s) => !resumeSkills.includes(s));

  const resumeMatchScore = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const interviewScore = interviews.length
    ? Math.round(interviews.reduce((sum, i) => sum + i.totalScore, 0) / interviews.length)
    : 0;
  const codingScore = coding?.totalScore || 0;

  const readinessScore = Math.round(
    resumeMatchScore * 0.35 + interviewScore * 0.4 + codingScore * 0.25
  );
  const readinessBand =
    readinessScore >= 80 ? "Strong" : readinessScore >= 60 ? "Moderate" : "Not Ready";

  res.json({
    targetRole,
    readinessScore,
    readinessBand,
    components: {
      resumeMatchScore,
      interviewScore,
      codingScore
    },
    requiredSkills,
    matchedSkills,
    missingSkills,
    recommendation:
      readinessBand === "Strong"
        ? "Candidate is interview-ready with minor refinements."
        : readinessBand === "Moderate"
          ? "Improve missing skills and coding consistency for stronger readiness."
          : "Focus on fundamentals, project depth, and coding practice before applying."
  });
};
