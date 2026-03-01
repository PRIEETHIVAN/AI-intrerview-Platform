import User from "../models/User.js";
import InterviewSession from "../models/InterviewSession.js";

export const getAdminSummary = async (req, res) => {
  const [users, sessions] = await Promise.all([
    User.countDocuments(),
    InterviewSession.countDocuments()
  ]);

  const weakSkillAgg = await InterviewSession.aggregate([
    { $unwind: "$answers" },
    { $match: { "answers.userAnswer": { $ne: "" } } },
    {
      $group: {
        _id: "$answers.skill",
        avgScore: { $avg: "$answers.score" }
      }
    },
    { $sort: { avgScore: 1 } },
    { $limit: 10 }
  ]);

  const weakTopicAgg = await InterviewSession.aggregate([
    { $unwind: "$answers" },
    { $match: { "answers.userAnswer": { $ne: "" } } },
    {
      $group: {
        _id: "$answers.topic",
        avgScore: { $avg: "$answers.score" }
      }
    },
    { $sort: { avgScore: 1 } },
    { $limit: 10 }
  ]);

  res.json({
    users,
    sessions,
    weakSkills: weakSkillAgg.map((s) => ({ skill: s._id, avgScore: Math.round(s.avgScore) })),
    weakTopics: weakTopicAgg.map((s) => ({ topic: s._id, avgScore: Math.round(s.avgScore) }))
  });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
};

export const getAllSessions = async (req, res) => {
  const sessions = await InterviewSession.find({ status: "completed" })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ sessions });
};
