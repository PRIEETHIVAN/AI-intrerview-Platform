import { useEffect, useState } from "react";
import api from "../api/client";

export default function AdminPage() {
  const [summary, setSummary] = useState({ users: 0, sessions: 0, weakSkills: [] });
  const [sessions, setSessions] = useState([]);
  const [draftNotes, setDraftNotes] = useState({});

  useEffect(() => {
    Promise.all([api.get("/admin/summary"), api.get("/admin/sessions")]).then(([summaryRes, sessionsRes]) => {
      setSummary(summaryRes.data);
      setSessions(sessionsRes.data.sessions || []);
    });
  }, []);

  const addNote = async (sessionId) => {
    const payload = draftNotes[sessionId];
    if (!payload?.note?.trim()) return;
    await api.post(`/interview/sessions/${sessionId}/notes`, payload);
    setDraftNotes((prev) => ({ ...prev, [sessionId]: { note: "", rating: 3 } }));
    const { data } = await api.get("/admin/sessions");
    setSessions(data.sessions || []);
  };

  return (
    <div className="card">
      <h2>Admin Panel</h2>
      <p>Total Users: {summary.users}</p>
      <p>Total Sessions: {summary.sessions}</p>
      <h3>Most Common Weak Skills</h3>
      <ul>
        {summary.weakSkills.map((item) => (
          <li key={item.skill}>
            {item.skill}: {item.avgScore}
          </li>
        ))}
      </ul>
      <h3>Weak Topics</h3>
      <ul>
        {summary.weakTopics?.map((item) => (
          <li key={item.topic}>
            {item.topic}: {item.avgScore}
          </li>
        ))}
      </ul>

      <h3>Recruiter Notes</h3>
      {sessions.map((s) => (
        <div key={s._id} className="history-item">
          <p>
            {s.userId?.name} ({s.userId?.email}) | Score: {s.totalScore}
          </p>
          <textarea
            rows={3}
            placeholder="Add recruiter note..."
            value={draftNotes[s._id]?.note || ""}
            onChange={(e) =>
              setDraftNotes((prev) => ({
                ...prev,
                [s._id]: { note: e.target.value, rating: prev[s._id]?.rating || 3 }
              }))
            }
          />
          <input
            type="number"
            min="1"
            max="5"
            value={draftNotes[s._id]?.rating || 3}
            onChange={(e) =>
              setDraftNotes((prev) => ({
                ...prev,
                [s._id]: { note: prev[s._id]?.note || "", rating: Number(e.target.value) }
              }))
            }
          />
          <button onClick={() => addNote(s._id)}>Save Note</button>
          <ul>
            {(s.recruiterNotes || []).map((n) => (
              <li key={n._id}>
                {n.note} {n.rating ? `(rating ${n.rating}/5)` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
