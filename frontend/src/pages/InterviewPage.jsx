import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function InterviewPage() {
  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timer, setTimer] = useState(120);
  const [status, setStatus] = useState("");
  const [weakTopics, setWeakTopics] = useState([]);
  const [explainable, setExplainable] = useState(null);
  const autosaveRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !question) return;
    const interval = setInterval(() => setTimer((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [sessionId, question?.questionId]);

  useEffect(() => {
    clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      if (answer.trim()) setStatus("Answer draft auto-saved locally.");
      if (question?.questionId) {
        localStorage.setItem(`draft:${sessionId}:${question.questionId}`, answer);
      }
    }, 800);
  }, [answer, sessionId, question?.questionId]);

  useEffect(() => {
    const onShortcut = (e) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (sessionId && question) submitCurrent();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });

  const start = async () => {
    const { data } = await api.post("/interview/start");
    setSessionId(data.sessionId);
    setQuestion(data.currentQuestion);
    setProgress(0);
    setWeakTopics([]);
    setTimer(120);
    setStatus("Interview started with adaptive difficulty. Press Alt+S to submit quickly.");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const submitCurrent = async () => {
    if (!question) return;
    const payload = { sessionId, questionId: question.questionId, answer };
    const { data } = await api.post("/interview/answer", payload);
    setStatus(
      `Scored ${data.evaluation.score}/100 | Next difficulty adapts from performance (${data.evaluation.embedding_mode}).`
    );
    setProgress(data.progress);
    setWeakTopics(data.weakTopics || []);
    setExplainable(data.explainable || null);
    setQuestion(data.nextQuestion);
    setAnswer("");
    setTimer(120);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const finish = async () => {
    const { data } = await api.post("/interview/complete", { sessionId });
    setStatus(`Completed. Total score: ${data.totalScore}. Report available in dashboard.`);
    setWeakTopics(data.weak_topics || []);
    setQuestion(null);
  };

  return (
    <div className="card">
      <h2>Real-Time Interview</h2>
      {!sessionId && <button onClick={start}>Start 30-Question Adaptive Interview</button>}
      {sessionId && question && (
        <>
          <p>
            Q{progress + 1}/30 | Skill: {question.skill} | Topic: {question.topic} | Difficulty:{" "}
            {question.difficulty}
          </p>
          <p className="question">{question.question}</p>
          <p>Timer: {timer}s</p>
          <textarea
            ref={textareaRef}
            rows={8}
            placeholder="Write your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="row">
            <button onClick={submitCurrent}>Submit Answer</button>
            <button onClick={finish}>Finish Interview</button>
          </div>
        </>
      )}
      {status && <p>{status}</p>}
      {explainable && (
        <section className="insight-panel">
          <h3>Explainable AI Score</h3>
          <p>Semantic similarity: {explainable.semanticSimilarity}</p>
          <p>Keyword coverage: {explainable.keywordCoverage}</p>
          <p>Embedding mode: {explainable.embeddingMode}</p>
          <p>Score formula: {explainable.formula}</p>
          <p>Matched concepts: {explainable.matchedKeywords?.join(", ") || "None"}</p>
          <p>Missing concepts: {explainable.missingKeywords?.join(", ") || "None"}</p>
        </section>
      )}
      {!!weakTopics.length && (
        <>
          <h3>Detected Weak Topics</h3>
          <ul>
            {weakTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </>
      )}
      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}
