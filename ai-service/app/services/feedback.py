def generate_feedback(skill: str, score: int, user_answer: str, weakness: str):
    if score >= 80:
        confidence = "High"
        improvement = f"Strong answer in {skill}. Add one measurable production result to make it excellent."
    elif score >= 60:
        confidence = "Medium"
        improvement = f"Good start in {skill}. Improve by adding architecture choices and tradeoff reasoning."
    else:
        confidence = "Low"
        improvement = f"Revisit {skill} fundamentals and practice with 3 scenario-based questions."

    if weakness:
        improvement = f"{improvement} Focus area: {weakness}."

    return {
        "confidence": confidence,
        "improvement": improvement,
    }

