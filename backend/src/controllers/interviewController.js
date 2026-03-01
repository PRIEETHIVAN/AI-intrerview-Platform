import Resume from "../models/Resume.js";
import InterviewSession from "../models/InterviewSession.js";
import { evaluateAnswerAI, feedbackAI, generateQuestionsAI } from "../services/aiClient.js";
import PDFDocument from "pdfkit";

const DIFFICULTIES = ["easy", "medium", "hard"];

const buildPoolQuestion = (q, difficulty, index) => ({
  questionId: `${difficulty}-${index}-${Math.random().toString(36).slice(2, 8)}`,
  question: q.question,
  skill: q.skill,
  topic: q.topic || "General",
  difficulty,
  idealAnswer: q.idealAnswer
});

const pickDifficulty = (session) => {
  const answered = session.answers.filter((a) => a.userAnswer.trim().length > 0);
  const avgScore = answered.length
    ? answered.reduce((sum, a) => sum + a.score, 0) / answered.length
    : 50;

  if (avgScore > 75) return "hard";
  if (avgScore < 40) return "easy";
  return "medium";
};

const selectNextQuestion = (session) => {
  const preferred = pickDifficulty(session);
  const ordered = [preferred, "medium", "easy", "hard"].filter(
    (v, idx, arr) => arr.indexOf(v) === idx
  );

  for (const difficulty of ordered) {
    const pool = session.questionPools[difficulty] || [];
    if (!pool.length) continue;

    const shouldHonorTarget = session.askedCounts[difficulty] < session.targetCounts[difficulty];
    if (shouldHonorTarget || DIFFICULTIES.every((d) => (session.questionPools[d] || []).length === 0)) {
      const next = pool.shift();
      session.askedCounts[difficulty] += 1;
      session.nextDifficulty = preferred;
      return next;
    }
  }
  return null;
};

const updateWeakTopics = (session) => {
  const topicScores = {};
  for (const ans of session.answers) {
    if (!ans.userAnswer) continue;
    if (!topicScores[ans.topic]) topicScores[ans.topic] = [];
    topicScores[ans.topic].push(ans.score);
  }
  session.weakTopics = Object.entries(topicScores)
    .map(([topic, scores]) => ({
      topic,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    }))
    .filter((item) => item.avg < 55)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5)
    .map((item) => item.topic);
};

export const startInterview = async (req, res) => {
  const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  if (!resume) {
    return res.status(400).json({ message: "Upload resume before interview" });
  }

  const skills = resume.skills.map((s) => s.name);
  const [easyBatch, mediumBatch, hardBatch] = await Promise.all([
    generateQuestionsAI(skills, "easy", 10),
    generateQuestionsAI(skills, "medium", 10),
    generateQuestionsAI(skills, "hard", 10)
  ]);

  const session = await InterviewSession.create({
    userId: req.user._id,
    extractedSkills: skills,
    questionsAsked: [],
    questionPools: {
      easy: easyBatch.questions.map((q, i) => buildPoolQuestion(q, "easy", i)),
      medium: mediumBatch.questions.map((q, i) => buildPoolQuestion(q, "medium", i)),
      hard: hardBatch.questions.map((q, i) => buildPoolQuestion(q, "hard", i))
    },
    answers: []
  });

  const firstQuestion = selectNextQuestion(session);
  if (!firstQuestion) {
    return res.status(500).json({ message: "Unable to create interview questions" });
  }
  session.currentQuestionId = firstQuestion.questionId;
  session.currentQuestion = firstQuestion;
  session.questionsAsked.push(firstQuestion.question);
  session.askedQuestionIds.push(firstQuestion.questionId);
  await session.save();

  res.status(201).json({
    sessionId: session._id,
    totals: { easy: 10, medium: 10, hard: 10, all: 30 },
    currentQuestion: {
      questionId: firstQuestion.questionId,
      question: firstQuestion.question,
      skill: firstQuestion.skill,
      topic: firstQuestion.topic,
      difficulty: firstQuestion.difficulty
    }
  });
};

export const submitAnswer = async (req, res) => {
  const { sessionId, questionId, answer } = req.body;
  const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }
  if (session.status !== "active") {
    return res.status(400).json({ message: "Session is already completed" });
  }

  if (!session.currentQuestionId || session.currentQuestionId !== questionId) {
    return res.status(400).json({ message: "Question is not active for this session" });
  }

  const sourced = session.currentQuestion;
  if (!sourced || sourced.questionId !== questionId) {
    return res.status(404).json({ message: "Question payload mismatch" });
  }

  const evaluation = await evaluateAnswerAI({
    question: sourced.question,
    skill: sourced.skill,
    ideal_answer: sourced.idealAnswer,
    user_answer: answer
  });

  const feedback = await feedbackAI({
    skill: sourced.skill,
    score: evaluation.score,
    user_answer: answer,
    weakness: evaluation.weakness
  });

  session.answers.push({
    questionId: sourced.questionId,
    question: sourced.question,
    skill: sourced.skill,
    topic: sourced.topic,
    difficulty: sourced.difficulty,
    userAnswer: answer,
    idealAnswer: sourced.idealAnswer,
    score: evaluation.score,
    strength: evaluation.strength,
    weakness: evaluation.weakness,
    feedback: feedback.improvement,
    semanticSimilarity: evaluation.semantic_similarity || 0,
    keywordCoverage: evaluation.keyword_coverage || 0,
    matchedKeywords: evaluation.matched_keywords || [],
    missingKeywords: evaluation.missing_keywords || [],
    scoringExplanation: evaluation.explanation?.final_formula || ""
  });

  const answered = session.answers.filter((a) => a.userAnswer.trim().length > 0);
  session.totalScore = answered.length
    ? Math.round(answered.reduce((sum, a) => sum + a.score, 0) / answered.length)
    : 0;

  updateWeakTopics(session);

  const nextQuestion = selectNextQuestion(session);
  session.currentQuestionId = nextQuestion?.questionId || null;
  session.currentQuestion = nextQuestion || null;
  if (nextQuestion) {
    session.questionsAsked.push(nextQuestion.question);
    session.askedQuestionIds.push(nextQuestion.questionId);
  }
  await session.save();

  res.json({
    evaluation,
    feedback,
    explainable: {
      semanticSimilarity: evaluation.semantic_similarity,
      keywordCoverage: evaluation.keyword_coverage,
      matchedKeywords: evaluation.matched_keywords || [],
      missingKeywords: evaluation.missing_keywords || [],
      embeddingMode: evaluation.embedding_mode,
      formula: evaluation.explanation?.final_formula
    },
    totalScore: session.totalScore,
    progress: session.answers.length,
    totalQuestions: 30,
    weakTopics: session.weakTopics,
    nextQuestion: nextQuestion
      ? {
          questionId: nextQuestion.questionId,
          question: nextQuestion.question,
          skill: nextQuestion.skill,
          topic: nextQuestion.topic,
          difficulty: nextQuestion.difficulty
        }
      : null
  });
};

export const completeInterview = async (req, res) => {
  const { sessionId } = req.body;
  const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }
  session.status = "completed";
  session.currentQuestionId = null;
  session.currentQuestion = null;
  updateWeakTopics(session);
  await session.save();
  res.json({
    message: "Interview completed",
    totalScore: session.totalScore,
    weak_topics: session.weakTopics
  });
};

export const getMySessions = async (req, res) => {
  const sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ sessions });
};

export const getSessionReportPdf = async (req, res) => {
  const { sessionId } = req.params;
  const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=interview-report-${sessionId}.pdf`);

  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(res);

  doc.fontSize(20).text("Interview Performance Report");
  doc.moveDown();
  doc.fontSize(12).text(`Session ID: ${session._id}`);
  doc.text(`Date: ${session.createdAt.toISOString().slice(0, 10)}`);
  doc.text(`Overall Score: ${session.totalScore}/100`);
  doc.text(`Questions Answered: ${session.answers.length}`);
  doc.moveDown();

  doc.fontSize(14).text("Weak Topics");
  if (!session.weakTopics.length) {
    doc.fontSize(11).text("No weak topics detected.");
  } else {
    session.weakTopics.forEach((topic) => doc.fontSize(11).text(`- ${topic}`));
  }
  doc.moveDown();

  doc.fontSize(14).text("Question-wise Breakdown");
  session.answers.forEach((a, i) => {
    doc
      .fontSize(11)
      .text(
        `${i + 1}. [${a.difficulty.toUpperCase()}] ${a.skill} / ${a.topic} | Score: ${a.score} | ${a.feedback}`
      );
  });

  doc.end();
};

export const addRecruiterNote = async (req, res) => {
  const { sessionId } = req.params;
  const { note, rating } = req.body;
  const session = await InterviewSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  session.recruiterNotes.push({
    authorId: req.user._id,
    note,
    rating
  });
  await session.save();
  res.status(201).json({ message: "Note added" });
};
