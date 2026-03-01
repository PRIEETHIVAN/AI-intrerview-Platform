import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  timeout: 30000
});

export const extractSkillsAI = async (cleanedText) => {
  const { data } = await aiClient.post("/extract-skills", { text: cleanedText });
  return data;
};

export const generateQuestionsAI = async (skills, difficulty = "medium", count = 5) => {
  const { data } = await aiClient.post("/generate-questions", {
    skills,
    difficulty,
    count
  });
  return data;
};

export const evaluateAnswerAI = async (payload) => {
  const { data } = await aiClient.post("/evaluate-answer", payload);
  return data;
};

export const feedbackAI = async (payload) => {
  const { data } = await aiClient.post("/feedback", payload);
  return data;
};

