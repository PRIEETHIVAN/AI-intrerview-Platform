import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 }
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    cleanedText: { type: String, required: true },
    tokens: { type: [String], default: [] },
    skills: { type: [skillSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);

