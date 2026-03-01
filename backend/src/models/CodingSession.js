import mongoose from "mongoose";

const codingAnswerSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true },
    title: { type: String, required: true },
    language: { type: String, enum: ["javascript", "python"], required: true },
    code: { type: String, required: true },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" }
  },
  { _id: false }
);

const codingSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    durationMinutes: { type: Number, default: 45 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    problems: {
      type: [
        {
          problemId: String,
          title: String,
          difficulty: String,
          prompt: String,
          expectedConcepts: [String],
          tests: [{ input: [Number], output: Number }]
        }
      ],
      default: []
    },
    submissions: { type: [codingAnswerSchema], default: [] },
    totalScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("CodingSession", codingSessionSchema);

