# 🎬 Video Data Format Guide — PersonaLearn

How to add YouTube video resources to the database correctly.

---

## 📦 VideoResource Model Fields

```python
# learning/models.py → class VideoResource
topic        = ForeignKey(Topic)   # Which topic this video belongs to
title        = CharField           # Video title (max 300 chars)
youtube_url  = URLField            # Full YouTube URL
description  = TextField           # Short description (optional)
diagram_score  = IntegerField(0–100)  # How visual/diagram-heavy
analogy_score  = IntegerField(0–100)  # How analogy-based
example_score  = IntegerField(0–100)  # How example/demo-based
theory_score   = IntegerField(0–100)  # How theory/lecture-based
logic_score    = IntegerField(0–100)  # How logic/code-based
```

---

## ✅ Correct Python Dict Format (used in seed_data.py)

```python
{
    'title': 'SQL Full Course — freeCodeCamp',
    'youtube_url': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    'description': 'Complete SQL tutorial covering queries, joins, and normalization.',
    'diagram_score': 70,
    'analogy_score': 20,
    'example_score': 80,
    'theory_score': 40,
    'logic_score': 50,
},
```

---

## 📺 Accepted YouTube URL Formats

Both formats are accepted — the model auto-converts them to embed URLs:

```
✅ https://www.youtube.com/watch?v=HXV3zeQKqGY   ← standard watch URL
✅ https://youtu.be/HXV3zeQKqGY                  ← short URL
❌ https://www.youtube.com/embed/HXV3zeQKqGY     ← do NOT store embed URL
```

---

## 🎯 Style Score Guide (0–100)

| Score | Meaning |
|-------|---------|
| 80–100 | Primary style — video is mostly this style |
| 50–79  | Secondary — noticeable but not dominant |
| 20–49  | Minor presence |
| 0–19   | Barely or not present |

**Rule:** Each video should have **at least one score ≥ 70** (its dominant style).

### Score Examples by Channel Type

| Channel / Style | diagram | analogy | example | theory | logic |
|-----------------|---------|---------|---------|--------|-------|
| Animated/Visual | 85 | 30 | 50 | 30 | 40 |
| Lecture/Theory  | 25 | 20 | 40 | 90 | 55 |
| Coding/Demo     | 30 | 15 | 85 | 30 | 75 |
| Story/Analogy   | 20 | 85 | 40 | 25 | 20 |
| Step-by-step    | 50 | 35 | 80 | 45 | 70 |

---

## 📂 Where to Add Videos in seed_data.py

Open `learning/management/commands/seed_data.py` and find the `_add_videos` method.
Add your subject block like this:

```python
def _add_videos(self, topic):
    subject_slug = topic.subject.slug

    if subject_slug == 'dbms':
        videos = [
            {
                'title': 'SQL Full Course — freeCodeCamp',
                'youtube_url': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
                'description': 'Complete SQL with queries, joins, normalization.',
                'diagram_score': 70, 'analogy_score': 20, 'example_score': 80,
                'theory_score': 40, 'logic_score': 50,
            },
            {
                'title': 'DBMS Full Course — Gate Smashers',
                'youtube_url': 'https://www.youtube.com/watch?v=kBdlM6hNDAE',
                'description': 'Structured DBMS theory for exam prep.',
                'diagram_score': 30, 'analogy_score': 20, 'example_score': 40,
                'theory_score': 85, 'logic_score': 60,
            },
            {
                'title': 'DBMS Playlist — Neso Academy',
                'youtube_url': 'https://www.youtube.com/watch?v=4Z9KEBexzcM',
                'description': 'Visual and logical explanation of database concepts.',
                'diagram_score': 60, 'analogy_score': 30, 'example_score': 55,
                'theory_score': 70, 'logic_score': 65,
            },
        ]

    elif subject_slug == 'dsa':
        videos = [
            {
                'title': 'Algorithms — Abdul Bari',
                'youtube_url': 'https://www.youtube.com/watch?v=0IAPZzGSbME',
                'description': 'Logic-first DSA with pseudocode and reasoning.',
                'diagram_score': 35, 'analogy_score': 25, 'example_score': 70,
                'theory_score': 40, 'logic_score': 85,
            },
            {
                'title': 'Data Structures — mycodeschool',
                'youtube_url': 'https://www.youtube.com/watch?v=92S4zgXEozk',
                'description': 'Visual diagram-based data structures.',
                'diagram_score': 85, 'analogy_score': 30, 'example_score': 60,
                'theory_score': 35, 'logic_score': 50,
            },
            {
                'title': 'DSA Full Course — freeCodeCamp',
                'youtube_url': 'https://www.youtube.com/watch?v=zg9ih6SVACc',
                'description': 'Complete DSA with examples in Python.',
                'diagram_score': 50, 'analogy_score': 35, 'example_score': 85,
                'theory_score': 45, 'logic_score': 75,
            },
        ]

    elif subject_slug == 'engineering-mathematics':
        videos = [
            {
                'title': 'Linear Algebra — MIT OCW (Gilbert Strang)',
                'youtube_url': 'https://www.youtube.com/watch?v=7UJ4CFRGd-U',
                'description': 'Intuitive approach to linear algebra by MIT professor.',
                'diagram_score': 80, 'analogy_score': 40, 'example_score': 60,
                'theory_score': 70, 'logic_score': 55,
            },
            {
                'title': 'Engineering Maths — GATE by RK Kanodia',
                'youtube_url': 'https://www.youtube.com/watch?v=MaKRBtKAdHQ',
                'description': 'Structured maths for GATE exam preparation.',
                'diagram_score': 30, 'analogy_score': 25, 'example_score': 60,
                'theory_score': 85, 'logic_score': 70,
            },
            {
                'title': 'Mathematics for Engineers — Khan Academy Style',
                'youtube_url': 'https://www.youtube.com/watch?v=EKvHQc3QPVY',
                'description': 'Step-by-step worked examples with logical reasoning.',
                'diagram_score': 40, 'analogy_score': 50, 'example_score': 80,
                'theory_score': 45, 'logic_score': 75,
            },
        ]

    # Save to database
    for v in videos:
        VideoResource.objects.get_or_create(
            topic=topic,
            title=v['title'],
            defaults={
                'youtube_url': v['youtube_url'],
                'description': v['description'],
                'diagram_score': v['diagram_score'],
                'analogy_score': v['analogy_score'],
                'example_score': v['example_score'],
                'theory_score': v['theory_score'],
                'logic_score': v['logic_score'],
            }
        )
```

---

## 🛠️ Add Videos via Django Shell (without re-seeding)

```python
# Run: python manage.py shell

from learning.models import Topic, VideoResource

# Get the topic you want to add a video to
topic = Topic.objects.get(slug='sql-basics')  # change slug as needed

# Add the video
VideoResource.objects.create(
    topic=topic,
    title='SQL Tutorial Full Course — Beginners to Expert',
    youtube_url='https://www.youtube.com/watch?v=HXV3zeQKqGY',
    description='Complete SQL course covering all major concepts.',
    diagram_score=70,
    analogy_score=20,
    example_score=80,
    theory_score=40,
    logic_score=50,
)

print("Video added!")
```

---

## 🗑️ Delete & Re-seed All Videos

```bash
# In Django shell
python manage.py shell

from learning.models import VideoResource
VideoResource.objects.all().delete()
exit()

# Then re-seed
python manage.py seed_data
```

---

## 🔗 Verify via Django Admin

Go to: **http://127.0.0.1:8000/admin/learning/videoresource/**

You can add/edit/delete videos directly from the admin panel without touching code.

**Login:** `admin` / `admin123`

---

## ✅ Checklist Before Adding a Video

- [ ] `youtube_url` is a valid `watch?v=` or `youtu.be/` URL
- [ ] `title` is descriptive (include channel name)
- [ ] At least one score is ≥ 70 (dominant style)
- [ ] `topic` slug is correct (check admin panel)
- [ ] No duplicate title for the same topic

---

---

# 🤖 GEMINI PROMPTS — Copy & Paste to Generate Rich Video Data

> **How to use:** Copy any prompt below → Paste into Gemini → Get 5 real YouTube videos in correct Python dict format → Paste into `seed_data.py`

---

## 📌 Master Format (Gemini ko ye format follow karna hai)

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,   # How visual/diagram-heavy is this video
    'analogy_score': 0-100,   # How analogy/story-based is this video
    'example_score': 0-100,   # How example/demo/code-heavy is this video
    'theory_score':  0-100,   # How lecture/theory-heavy is this video
    'logic_score':   0-100,   # How logic/algorithm/math-heavy is this video
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70 (its dominant learning style)
- Mix the styles: include 1 visual, 1 theory, 1 example/coding, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: [TOPIC NAME HERE]
SUBJECT: [SUBJECT NAME HERE]
```

---

---

# 📚 SUBJECT 1: Database Management Systems (DBMS)

---

## 🎯 Topic 1: Introduction to DBMS

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Introduction to DBMS
SUBJECT: Database Management Systems
```

---

## 🎯 Topic 2: Relational Model & Keys

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Relational Model and Keys (Primary Key, Foreign Key, Candidate Key, Super Key)
SUBJECT: Database Management Systems
```

---

## 🎯 Topic 3: SQL Basics

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: SQL Basics (SELECT, INSERT, UPDATE, DELETE, WHERE, JOINs)
SUBJECT: Database Management Systems
```

---

## 🎯 Topic 4: Normalization

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Database Normalization (1NF, 2NF, 3NF, BCNF)
SUBJECT: Database Management Systems
```

---

## 🎯 Topic 5: Transactions & ACID

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Database Transactions and ACID Properties (Atomicity, Consistency, Isolation, Durability)
SUBJECT: Database Management Systems
```

---

---

# 📚 SUBJECT 2: Data Structures & Algorithms (DSA)

---

## 🎯 Topic 1: Arrays & Complexity

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Arrays and Time Complexity (Big O Notation, O(n), O(log n), O(n²))
SUBJECT: Data Structures and Algorithms
```

---

## 🎯 Topic 2: Linked Lists

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Linked Lists (Singly, Doubly, Circular — insert, delete, traverse)
SUBJECT: Data Structures and Algorithms
```

---

## 🎯 Topic 3: Binary Trees

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Binary Trees and Binary Search Trees (BST — insert, delete, inorder, preorder, postorder traversal)
SUBJECT: Data Structures and Algorithms
```

---

## 🎯 Topic 4: Graph Traversal (BFS/DFS)

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Graph Traversal — Breadth First Search (BFS) and Depth First Search (DFS)
SUBJECT: Data Structures and Algorithms
```

---

## 🎯 Topic 5: Dynamic Programming

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Dynamic Programming (Memoization, Tabulation, Fibonacci, Knapsack, LCS)
SUBJECT: Data Structures and Algorithms
```

---

---

# 📚 SUBJECT 3: Engineering Mathematics

---

## 🎯 Topic 1: Linear Algebra Basics

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Linear Algebra Basics (Vectors, Matrices, Determinants, Eigenvalues)
SUBJECT: Engineering Mathematics
```

---

## 🎯 Topic 2: Differential Calculus

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Differential Calculus (Limits, Derivatives, Chain Rule, Applications)
SUBJECT: Engineering Mathematics
```

---

## 🎯 Topic 3: Probability & Statistics

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Probability and Statistics (Mean, Variance, Bayes Theorem, Normal Distribution)
SUBJECT: Engineering Mathematics
```

---

## 🎯 Topic 4: Graph Theory

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Graph Theory (Vertices, Edges, Paths, Spanning Trees, Euler and Hamiltonian paths)
SUBJECT: Engineering Mathematics
```

---

## 🎯 Topic 5: Discrete Mathematics

```
I am building a Django web app called PersonaLearn — an AI Personalized Learning System.
I need YouTube video data in this EXACT Python dict format:

{
    'title': 'Video Title — Channel Name',
    'youtube_url': 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
    'description': 'One line description of what this video covers.',
    'diagram_score': 0-100,
    'analogy_score': 0-100,
    'example_score': 0-100,
    'theory_score':  0-100,
    'logic_score':   0-100,
}

Rules:
- Give me 5 videos for the topic mentioned
- Use REAL, working YouTube URLs (watch?v= format)
- At least one score per video must be >= 70
- Mix styles: 1 visual, 1 theory, 1 coding demo, 1 analogy, 1 logic video
- Title must include the YouTube channel name
- Output ONLY a Python list of 5 dicts, nothing else

TOPIC: Discrete Mathematics (Sets, Logic, Propositional Calculus, Permutations, Combinations)
SUBJECT: Engineering Mathematics
```

---

---

## 💡 Gemini se Output milne ke baad kya karo?

### Step 1 — Gemini output copy karo
Gemini will return something like:
```python
[
    {
        'title': 'SQL Tutorial — Programming with Mosh',
        'youtube_url': 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
        'description': 'Complete SQL tutorial from beginner to advanced.',
        'diagram_score': 50,
        'analogy_score': 30,
        'example_score': 90,
        'theory_score': 40,
        'logic_score': 60,
    },
    # ... 4 more
]
```

### Step 2 — seed_data.py mein paste karo
`_add_videos()` method ke sahi `subject_slug` block mein `videos = [...]` ke andar paste karo.

### Step 3 — Database refresh karo
```bash
source venvMiniModel/bin/activate
python manage.py shell -c "from learning.models import VideoResource; VideoResource.objects.all().delete()"
python manage.py seed_data
```

### Step 4 — Verify karo
Admin panel: **http://127.0.0.1:8000/admin/learning/videoresource/**
