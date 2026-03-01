import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer, util

MODEL = None


def _get_model():
    global MODEL
    if MODEL is None:
        MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return MODEL


def _keywords(text: str):
    tokens = re.findall(r"[a-zA-Z0-9+#.]+", text.lower())
    return [t for t in tokens if len(t) > 3]


def evaluate_answer(question: str, skill: str, ideal_answer: str, user_answer: str):
    if not user_answer.strip():
        return {
            "score": 0,
            "strength": "No answer submitted",
            "weakness": "Missing response",
            "semantic_similarity": 0.0,
            "keyword_coverage": 0.0,
        }

    semantic = 0.0
    embedding_mode = "sentence-transformers"
    try:
        model = _get_model()
        embeddings = model.encode([ideal_answer, user_answer], convert_to_tensor=True)
        semantic = float(util.cos_sim(embeddings[0], embeddings[1]).item())
    except Exception:
        # Safe fallback if model download/runtime fails.
        embedding_mode = "tfidf-fallback"
        vec = TfidfVectorizer()
        matrix = vec.fit_transform([ideal_answer, user_answer])
        semantic = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])

    ideal_kw = set(_keywords(ideal_answer))
    user_kw = set(_keywords(user_answer))
    matched = sorted(list(ideal_kw & user_kw))
    missing = sorted(list(ideal_kw - user_kw))
    coverage = (len(matched) / len(ideal_kw)) if ideal_kw else 0.0

    length_penalty = 1.0
    if len(user_answer.split()) < 8:
        length_penalty = 0.85
    elif len(user_answer.split()) > 180:
        length_penalty = 0.9

    score = round((semantic * 0.6 + coverage * 0.4) * 100 * length_penalty)
    score = max(0, min(100, score))

    strength = "Good conceptual clarity" if semantic >= 0.5 else "Basic understanding shown"
    weakness = "Lacks real-world example" if coverage < 0.45 else "Can improve depth and precision"

    return {
        "score": int(score),
        "strength": strength,
        "weakness": weakness,
        "embedding_mode": embedding_mode,
        "semantic_similarity": round(semantic, 3),
        "keyword_coverage": round(coverage, 3),
        "matched_keywords": matched[:12],
        "missing_keywords": missing[:12],
        "explanation": {
            "semantic_weight": 0.6,
            "keyword_weight": 0.4,
            "length_penalty": length_penalty,
            "final_formula": "((semantic*0.6)+(keyword*0.4))*100*length_penalty",
        },
    }
