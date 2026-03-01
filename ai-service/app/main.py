from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List

from app.services.nlp import extract_skills
from app.services.questions import generate_questions
from app.services.evaluation import evaluate_answer
from app.services.feedback import generate_feedback

app = FastAPI(title="Interview AI Service", version="1.0.0")


class SkillExtractRequest(BaseModel):
    text: str


class QuestionRequest(BaseModel):
    skills: List[str]
    difficulty: str = "medium"
    count: int = 5


class EvalRequest(BaseModel):
    question: str
    skill: str
    ideal_answer: str = Field(..., alias="ideal_answer")
    user_answer: str = Field(..., alias="user_answer")


class FeedbackRequest(BaseModel):
    skill: str
    score: int
    user_answer: str
    weakness: str = ""


@app.get("/health")
def health():
    return {"ok": True, "service": "ai-service"}


@app.post("/extract-skills")
def skill_extract(payload: SkillExtractRequest):
    return {"skills": extract_skills(payload.text)}


@app.post("/generate-questions")
def questions(payload: QuestionRequest):
    return {"questions": generate_questions(payload.skills, payload.difficulty, payload.count)}


@app.post("/evaluate-answer")
def evaluate(payload: EvalRequest):
    return evaluate_answer(
        question=payload.question,
        skill=payload.skill,
        ideal_answer=payload.ideal_answer,
        user_answer=payload.user_answer,
    )


@app.post("/feedback")
def feedback(payload: FeedbackRequest):
    return generate_feedback(
        skill=payload.skill,
        score=payload.score,
        user_answer=payload.user_answer,
        weakness=payload.weakness,
    )

