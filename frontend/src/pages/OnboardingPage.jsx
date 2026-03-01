import { Link } from "react-router-dom";

const steps = [
  "Upload your latest resume PDF.",
  "Paste a job description to detect missing skills.",
  "Start the 30-question adaptive interview.",
  "Review weak topics and download your PDF report.",
  "Track score progress in the dashboard."
];

export default function OnboardingPage() {
  return (
    <section className="card">
      <h2>Quick Onboarding</h2>
      <p>This flow takes around 10-15 minutes for a complete first assessment.</p>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="row">
        <Link to="/resume">
          <button>Start With Resume</button>
        </Link>
        <Link to="/dashboard">
          <button>Go To Dashboard</button>
        </Link>
      </div>
    </section>
  );
}

