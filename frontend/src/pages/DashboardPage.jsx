import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [data, setData] = useState({
    overallScore: 0,
    interviews: 0,
    skillPerformance: [],
    trend: [],
    weakTopics: [],
    history: []
  });
  const [readinessInput, setReadinessInput] = useState({
    targetRole: "AI/ML Developer",
    jobDescription: ""
  });
  const [readiness, setReadiness] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/dashboard/me").then((res) => setData(res.data));
  }, []);

  const downloadReport = async (id) => {
    const res = await api.get(`/interview/report/${id}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-report-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const runReadiness = async () => {
    const { data: resp } = await api.post("/dashboard/readiness", readinessInput);
    setReadiness(resp);
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Dashboard</h2>
        <p>Overall Score: {data.overallScore}</p>
        <p>Completed Interviews: {data.interviews}</p>
        <div className="row">
          <Link to="/onboarding">
            <button>Onboarding</button>
          </Link>
          <Link to="/resume">
            <button>Upload Resume</button>
          </Link>
          <Link to="/interview">
            <button>Start Interview</button>
          </Link>
          <Link to="/coding">
            <button>Coding Round</button>
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin">
              <button>Admin Panel</button>
            </Link>
          )}
        </div>
      </section>
      <section className="card">
        <h3>Role Readiness Score</h3>
        <input
          placeholder="Target role"
          value={readinessInput.targetRole}
          onChange={(e) => setReadinessInput((p) => ({ ...p, targetRole: e.target.value }))}
        />
        <textarea
          rows={5}
          placeholder="Paste target job description for readiness scoring..."
          value={readinessInput.jobDescription}
          onChange={(e) => setReadinessInput((p) => ({ ...p, jobDescription: e.target.value }))}
        />
        <button onClick={runReadiness}>Calculate Readiness</button>
        {readiness && (
          <div className="insight-panel">
            <p>
              <strong>{readiness.targetRole}</strong> readiness: {readiness.readinessScore} (
              {readiness.readinessBand})
            </p>
            <p>
              Resume match: {readiness.components.resumeMatchScore} | Interview:{" "}
              {readiness.components.interviewScore} | Coding: {readiness.components.codingScore}
            </p>
            <p>Missing skills: {readiness.missingSkills.join(", ") || "None"}</p>
            <p>{readiness.recommendation}</p>
          </div>
        )}
      </section>
      <section className="card">
        <h3>Weak Topics</h3>
        {data.weakTopics.length ? (
          <ul>
            {data.weakTopics.map((item) => (
              <li key={item.topic}>
                {item.topic}: {item.score}
              </li>
            ))}
          </ul>
        ) : (
          <p>No weak topics detected yet.</p>
        )}
      </section>
      <section className="card chart">
        <h3>Score Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.trend}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#d04f4f" />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className="card chart">
        <h3>Skill-wise Performance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.skillPerformance}>
            <XAxis dataKey="skill" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#1f6f8b" />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="card">
        <h3>Interview History & Reports</h3>
        {data.history.map((item) => (
          <div key={item.id} className="history-item">
            <p>
              {item.date} | Score: {item.score}
            </p>
            <p>Weak topics: {item.weakTopics?.join(", ") || "None"}</p>
            <button onClick={() => downloadReport(item.id)}>Download PDF Report</button>
            {!!item.notes?.length && (
              <ul>
                {item.notes.map((n) => (
                  <li key={n._id}>
                    Recruiter note: {n.note} {n.rating ? `(rating ${n.rating}/5)` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
