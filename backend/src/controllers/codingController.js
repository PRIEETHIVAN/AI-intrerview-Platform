import CodingSession from "../models/CodingSession.js";

const PROBLEM_BANK = [
  {
    problemId: "two-sum",
    title: "Two Sum Variant",
    difficulty: "easy",
    prompt: "Return the index pair of two numbers whose sum equals target.",
    expectedConcepts: ["hashmap", "loop", "time complexity"],
    tests: [
      { input: [2, 7, 11, 15], output: 9 },
      { input: [3, 2, 4], output: 6 }
    ]
  },
  {
    problemId: "max-subarray",
    title: "Maximum Subarray Sum",
    difficulty: "medium",
    prompt: "Find maximum sum of a contiguous subarray.",
    expectedConcepts: ["kadane", "dynamic programming", "loop"],
    tests: [
      { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], output: 6 },
      { input: [5, 4, -1, 7, 8], output: 23 }
    ]
  },
  {
    problemId: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "hard",
    prompt: "Merge overlapping intervals after sorting by start value.",
    expectedConcepts: ["sorting", "intervals", "edge cases"],
    tests: [
      { input: [1, 3, 2, 6], output: 2 },
      { input: [1, 4, 4, 5], output: 1 }
    ]
  }
];

const scoreSubmission = (problem, code = "") => {
  const low = code.toLowerCase();
  const conceptMatches = problem.expectedConcepts.filter((c) => low.includes(c.split(" ")[0]));
  const passed = Math.min(problem.tests.length, conceptMatches.length);
  const score = Math.round((passed / problem.tests.length) * 100);
  const feedback =
    score >= 80
      ? "Good solution structure with expected concepts."
      : "Add stronger handling for expected concepts and explain complexity.";
  return { passed, total: problem.tests.length, score, feedback };
};

export const startCodingRound = async (req, res) => {
  const session = await CodingSession.create({
    userId: req.user._id,
    problems: PROBLEM_BANK,
    submissions: []
  });
  res.status(201).json({
    sessionId: session._id,
    durationMinutes: session.durationMinutes,
    problems: session.problems.map((p) => ({
      problemId: p.problemId,
      title: p.title,
      difficulty: p.difficulty,
      prompt: p.prompt
    }))
  });
};

export const submitCodingAnswer = async (req, res) => {
  const { sessionId, problemId, language = "javascript", code = "" } = req.body;
  const session = await CodingSession.findOne({ _id: sessionId, userId: req.user._id, status: "active" });
  if (!session) {
    return res.status(404).json({ message: "Active coding session not found" });
  }

  const problem = session.problems.find((p) => p.problemId === problemId);
  if (!problem) {
    return res.status(404).json({ message: "Problem not found" });
  }

  const result = scoreSubmission(problem, code);
  const existing = session.submissions.find((s) => s.problemId === problemId);
  if (existing) {
    existing.code = code;
    existing.language = language;
    existing.passed = result.passed;
    existing.total = result.total;
    existing.score = result.score;
    existing.feedback = result.feedback;
  } else {
    session.submissions.push({
      problemId,
      title: problem.title,
      language,
      code,
      passed: result.passed,
      total: result.total,
      score: result.score,
      feedback: result.feedback
    });
  }

  session.totalScore = session.submissions.length
    ? Math.round(session.submissions.reduce((sum, s) => sum + s.score, 0) / session.submissions.length)
    : 0;
  await session.save();

  res.json({
    result,
    totalScore: session.totalScore,
    submitted: session.submissions.length,
    totalProblems: session.problems.length
  });
};

export const completeCodingRound = async (req, res) => {
  const { sessionId } = req.body;
  const session = await CodingSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ message: "Coding session not found" });
  }
  session.status = "completed";
  session.completedAt = new Date();
  await session.save();
  res.json({ message: "Coding round completed", totalScore: session.totalScore });
};

export const getMyCodingSessions = async (req, res) => {
  const sessions = await CodingSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ sessions });
};

