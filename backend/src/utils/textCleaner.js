import { STOPWORDS } from "./stopwords.js";

export const cleanText = (text = "") => {
  const lowered = text.toLowerCase();
  const normalized = lowered.replace(/[^a-z0-9+#.\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const filtered = tokens.filter((token) => !STOPWORDS.has(token));
  return {
    cleanedText: filtered.join(" "),
    tokens: filtered
  };
};

