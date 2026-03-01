from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer

SKILL_DICTIONARY = [
    "python",
    "java",
    "c++",
    "javascript",
    "typescript",
    "react",
    "node.js",
    "express",
    "mongodb",
    "sql",
    "aws",
    "docker",
    "kubernetes",
    "machine learning",
    "deep learning",
    "nlp",
    "tensorflow",
    "pytorch",
    "fastapi",
    "flask",
    "redis",
    "git",
]


def extract_skills(text: str):
    corpus = [text]
    vec = TfidfVectorizer(vocabulary=SKILL_DICTIONARY, ngram_range=(1, 2))
    tfidf_matrix = vec.fit_transform(corpus)
    tfidf_scores = tfidf_matrix.toarray()[0]
    features = vec.get_feature_names_out()

    token_counts = Counter(text.split())
    skill_scores = []
    for i, skill in enumerate(features):
        tfidf_score = float(tfidf_scores[i])
        freq = token_counts.get(skill, 0)
        freq_boost = min(freq / 5, 1.0) * 0.3
        confidence = min(tfidf_score + freq_boost, 1.0)
        if confidence > 0:
            skill_scores.append({"name": skill, "confidence": round(confidence, 2)})

    skill_scores.sort(key=lambda x: x["confidence"], reverse=True)
    return skill_scores[:10]

