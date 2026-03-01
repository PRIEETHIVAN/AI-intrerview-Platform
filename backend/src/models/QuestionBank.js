import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, index: true, lowercase: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    question: { type: String, required: true },
    idealAnswer: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("QuestionBank", questionSchema);

