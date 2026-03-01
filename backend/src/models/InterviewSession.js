import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    skill: { type: String, required: true },
    topic: { type: String, default: "" },
    difficulty: { type: String, default: "medium" },
    userAnswer: { type: String, default: "" },
    idealAnswer: { type: String, default: "" },
    score: { type: Number, default: 0 },
    strength: { type: String, default: "" },
    weakness: { type: String, default: "" },
    feedback: { type: String, default: "" },
    semanticSimilarity: { type: Number, default: 0 },
    keywordCoverage: { type: Number, default: 0 },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    scoringExplanation: { type: String, default: "" }
  },
  { _id: false }
);

const poolQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    skill: { type: String, required: true },
    topic: { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    idealAnswer: { type: String, required: true }
  },
  { _id: false }
);

const recruiterNoteSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 }
  },
  { _id: true, timestamps: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    extractedSkills: { type: [String], default: [] },
    questionsAsked: { type: [String], default: [] },
    questionPools: {
      easy: { type: [poolQuestionSchema], default: [] },
      medium: { type: [poolQuestionSchema], default: [] },
      hard: { type: [poolQuestionSchema], default: [] }
    },
    currentQuestionId: { type: String, default: null },
    currentQuestion: { type: poolQuestionSchema, default: null },
    askedQuestionIds: { type: [String], default: [] },
    nextDifficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    targetCounts: {
      easy: { type: Number, default: 10 },
      medium: { type: Number, default: 10 },
      hard: { type: Number, default: 10 }
    },
    askedCounts: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 }
    },
    answers: { type: [answerSchema], default: [] },
    weakTopics: { type: [String], default: [] },
    recruiterNotes: { type: [recruiterNoteSchema], default: [] },
    totalScore: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSession", interviewSessionSchema);
