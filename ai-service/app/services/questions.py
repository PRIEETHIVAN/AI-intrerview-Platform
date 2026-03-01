import random

QUESTION_BANK = {
    "react": {
        "easy": [
            (
                "React Basics",
                "What is JSX in React?",
                "JSX is a syntax extension that lets you write UI markup in JavaScript.",
            ),
            (
                "React Components",
                "What are props in React?",
                "Props are read-only inputs passed from parent to child components.",
            ),
        ],
        "medium": [
            (
                "Virtual DOM",
                "How does the virtual DOM improve performance?",
                "It diffs UI changes and updates only necessary DOM nodes.",
            ),
            (
                "React Hooks",
                "Explain useEffect dependencies.",
                "Dependencies control when effect code reruns after render.",
            ),
        ],
        "hard": [
            (
                "React Performance",
                "How would you optimize a large React app?",
                "Use memoization, code splitting, profiling, and state boundaries.",
            ),
            (
                "Concurrent Rendering",
                "Describe concurrent rendering in React.",
                "It allows interruptible rendering and better UI responsiveness.",
            ),
        ],
    },
    "node.js": {
        "easy": [
            (
                "Event Loop",
                "What is Node.js event loop?",
                "It handles async callbacks on a single thread.",
            ),
            ("Node Tooling", "What is npm used for?", "It manages packages and project scripts."),
        ],
        "medium": [
            (
                "Async Scheduling",
                "Difference between process.nextTick and setImmediate?",
                "nextTick runs earlier in microtask queue.",
            ),
            (
                "REST API Design",
                "How do you secure Express APIs?",
                "Use JWT, validation, rate limits, and secure headers.",
            ),
        ],
        "hard": [
            (
                "Microservices",
                "How do you design scalable Node microservices?",
                "Use stateless services, message queues, and observability.",
            ),
            (
                "Streams",
                "Explain backpressure in streams.",
                "It controls producer speed to avoid memory overflow.",
            ),
        ],
    },
    "python": {
        "easy": [
            ("Python Functions", "What are Python decorators?", "They wrap functions to extend behavior."),
            (
                "Python Syntax",
                "What is list comprehension?",
                "Compact syntax to create transformed lists.",
            ),
        ],
        "medium": [
            (
                "Concurrency",
                "Explain GIL in Python.",
                "It allows one thread to execute Python bytecode at a time.",
            ),
            (
                "Memory Model",
                "Difference between deep copy and shallow copy?",
                "Deep copy duplicates nested objects; shallow copy references nested data.",
            ),
        ],
        "hard": [
            (
                "Performance",
                "How do you optimize Python performance?",
                "Profile first, then improve algorithms and use native extensions if needed.",
            ),
            (
                "Async Python",
                "When would you use async in Python?",
                "For I/O-heavy concurrent workloads.",
            ),
        ],
    },
    "mongodb": {
        "easy": [
            ("Mongo Basics", "What is a document in MongoDB?", "A document is a JSON-like record stored in a collection."),
            ("Indexes", "Why do we create indexes?", "Indexes improve read performance for frequent queries."),
        ],
        "medium": [
            ("Aggregation", "What is MongoDB aggregation pipeline?", "It processes data in stages for analytics."),
            ("Schema Design", "How do you model one-to-many in MongoDB?", "Use embedding or references based on query patterns."),
        ],
        "hard": [
            ("Transactions", "When should you use MongoDB transactions?", "For multi-document atomic operations."),
            ("Sharding", "How does MongoDB sharding scale writes?", "It partitions data across shards using shard keys."),
        ],
    },
}

FALLBACK = [
    (
        "Problem Solving",
        "Explain your approach to problem solving in software projects.",
        "Discuss structure, tradeoffs, and validation.",
    ),
    (
        "Debugging",
        "Describe a challenging bug and how you fixed it.",
        "Provide context, diagnosis, fix, and learning.",
    ),
]


def generate_questions(skills, difficulty="medium", count=5):
    cleaned = [s.lower() for s in skills if s]
    if not cleaned:
        cleaned = ["python"]

    pool = []
    for skill in cleaned:
        bank = QUESTION_BANK.get(skill)
        if not bank:
            continue
        for topic, q, a in bank.get(difficulty, []):
            pool.append(
                {
                    "skill": skill,
                    "topic": topic,
                    "difficulty": difficulty,
                    "question": q,
                    "idealAnswer": a,
                }
            )

    while len(pool) < count:
        for topic, q, a in FALLBACK:
            pool.append(
                {
                    "skill": cleaned[0],
                    "topic": topic,
                    "difficulty": difficulty,
                    "question": q,
                    "idealAnswer": a,
                }
            )
            if len(pool) >= count:
                break

    random.shuffle(pool)
    return pool[:count]
