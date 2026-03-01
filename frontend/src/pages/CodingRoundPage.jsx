import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function CodingRoundPage() {
  const [sessionId, setSessionId] = useState("");
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("// Write your solution here");
  const [language, setLanguage] = useState("javascript");
  const [status, setStatus] = useState("");

  const start = async () => {
    const { data } = await api.post("/coding/start");
    setSessionId(data.sessionId);
    setProblems(data.problems || []);
    setSelected(data.problems?.[0] || null);
    setStatus(`Coding round started: ${data.durationMinutes} minutes`);
  };

  const submit = async () => {
    if (!selected) return;
    const { data } = await api.post("/coding/submit", {
      sessionId,
      problemId: selected.problemId,
      language,
      code
    });
    setStatus(
      `Problem score: ${data.result.score}/100 (${data.result.passed}/${data.result.total} checks). Total: ${data.totalScore}`
    );
  };

  const complete = async () => {
    const { data } = await api.post("/coding/complete", { sessionId });
    setStatus(`Coding round completed. Total score: ${data.totalScore}`);
  };

  return (
    <div className="card">
      <h2>Coding Round Engine</h2>
      {!sessionId && <button onClick={start}>Start Coding Round</button>}
      {!!problems.length && (
        <>
          <p>Select Problem</p>
          <div className="row">
            {problems.map((p) => (
              <button key={p.problemId} onClick={() => setSelected(p)}>
                {p.title} ({p.difficulty})
              </button>
            ))}
          </div>
        </>
      )}
      {selected && (
        <section className="insight-panel">
          <h3>{selected.title}</h3>
          <p>{selected.prompt}</p>
          <label htmlFor="lang">Language</label>
          <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <textarea rows={14} value={code} onChange={(e) => setCode(e.target.value)} />
          <div className="row">
            <button onClick={submit}>Submit Code</button>
            <button onClick={complete}>Finish Coding Round</button>
          </div>
        </section>
      )}
      {status && <p>{status}</p>}
      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

