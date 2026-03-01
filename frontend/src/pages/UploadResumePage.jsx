import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function UploadResumePage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [skillGap, setSkillGap] = useState(null);
  const [error, setError] = useState("");

  const upload = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) return;
    const form = new FormData();
    form.append("resume", file);
    try {
      const { data } = await api.post("/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  const runSkillGap = async () => {
    setError("");
    try {
      const { data } = await api.post("/resume/skill-gap", { jobDescription });
      setSkillGap(data);
    } catch (err) {
      setError(err.response?.data?.message || "Skill gap check failed");
    }
  };

  return (
    <div className="card">
      <h2>Resume Upload & Parsing</h2>
      <form onSubmit={upload}>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0])} />
        <button type="submit">Upload PDF</button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <>
          <p>Resume processed. Skills extracted:</p>
          <ul>
            {result.skills.map((s) => (
              <li key={s.name}>
                {s.name} ({s.confidence})
              </li>
            ))}
          </ul>
          <Link to="/interview">
            <button>Start Interview</button>
          </Link>
        </>
      )}

      <hr />
      <h3>Skill Gap vs Job Description</h3>
      <textarea
        rows={6}
        placeholder="Paste job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <button onClick={runSkillGap}>Analyze Skill Gap</button>
      {skillGap && (
        <>
          <p>Missing Skills:</p>
          <ul>
            {skillGap.missing_skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
