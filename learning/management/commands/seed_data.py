"""
Management command to load demo seed data.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from learning.models import Subject, Topic, ContentVersion, VideoResource
from recommendations.models import UserPreference


class Command(BaseCommand):
    help = 'Load demo seed data for PersonaLearn'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('🌱 Seeding demo data...'))

        # ── Admin user ──────────────────────────────────────────
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('  ✓ Admin user created (admin/admin123)'))

        # ── Demo student ────────────────────────────────────────
        if not User.objects.filter(username='student').exists():
            student = User.objects.create_user(
                'student', 'student@example.com', 'student123',
                first_name='Demo', last_name='Student'
            )
            UserPreference.objects.get_or_create(user=student)
            self.stdout.write(self.style.SUCCESS('  ✓ Demo student created (student/student123)'))

        # ── SUBJECT 1: DBMS ─────────────────────────────────────
        dbms, _ = Subject.objects.get_or_create(
            slug='dbms',
            defaults={
                'name': 'Database Management Systems',
                'description': 'Learn relational databases, SQL, normalization, transactions, and database design.',
                'icon': 'bi-database-fill',
                'color': '#6c63ff',
            }
        )

        dbms_topics = [
            ('Introduction to DBMS', 'intro-dbms', 0),
            ('Relational Model & Keys', 'relational-model', 1),
            ('SQL Basics', 'sql-basics', 2),
            ('Normalization', 'normalization', 3),
            ('Transactions & ACID', 'transactions-acid', 4),
        ]

        for title, slug, order in dbms_topics:
            topic, created = Topic.objects.get_or_create(
                slug=slug, subject=dbms,
                defaults={'title': title, 'order': order,
                          'description': f'Master {title} with multiple learning styles.'}
            )
            if created:
                self._add_content(topic)
                self._add_videos(topic)

        self.stdout.write(self.style.SUCCESS(f'  ✓ DBMS: {dbms.topics.count()} topics'))

        # ── SUBJECT 2: DSA ──────────────────────────────────────
        dsa, _ = Subject.objects.get_or_create(
            slug='dsa',
            defaults={
                'name': 'Data Structures & Algorithms',
                'description': 'Arrays, linked lists, trees, graphs, sorting, searching and dynamic programming.',
                'icon': 'bi-diagram-3-fill',
                'color': '#00d4ff',
            }
        )

        dsa_topics = [
            ('Arrays & Complexity', 'arrays-complexity', 0),
            ('Linked Lists', 'linked-lists', 1),
            ('Binary Trees', 'binary-trees', 2),
            ('Graph Traversal (BFS/DFS)', 'graph-traversal', 3),
            ('Dynamic Programming', 'dynamic-programming', 4),
        ]

        for title, slug, order in dsa_topics:
            topic, created = Topic.objects.get_or_create(
                slug=slug, subject=dsa,
                defaults={'title': title, 'order': order,
                          'description': f'Understand {title} across all explanation styles.'}
            )
            if created:
                self._add_content(topic)
                self._add_videos(topic)

        self.stdout.write(self.style.SUCCESS(f'  ✓ DSA: {dsa.topics.count()} topics'))

        # ── SUBJECT 3: Engineering Mathematics ──────────────────
        em, _ = Subject.objects.get_or_create(
            slug='engineering-mathematics',
            defaults={
                'name': 'Engineering Mathematics',
                'description': 'Linear algebra, calculus, probability, discrete math for engineers.',
                'icon': 'bi-infinity',
                'color': '#06d6a0',
            }
        )

        em_topics = [
            ('Linear Algebra Basics', 'linear-algebra', 0),
            ('Differential Calculus', 'differential-calculus', 1),
            ('Probability & Statistics', 'probability-statistics', 2),
            ('Graph Theory', 'graph-theory', 3),
            ('Discrete Mathematics', 'discrete-mathematics', 4),
        ]

        for title, slug, order in em_topics:
            topic, created = Topic.objects.get_or_create(
                slug=slug, subject=em,
                defaults={'title': title, 'order': order,
                          'description': f'Study {title} with visual, logical, and example-based methods.'}
            )
            if created:
                self._add_content(topic)
                self._add_videos(topic)

        self.stdout.write(self.style.SUCCESS(f'  ✓ Engineering Maths: {em.topics.count()} topics'))

        total_cv = ContentVersion.objects.count()
        total_vid = VideoResource.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Seed complete: {Subject.objects.count()} subjects, '
            f'{Topic.objects.count()} topics, '
            f'{total_cv} content versions, '
            f'{total_vid} videos.'
        ))

    def _add_content(self, topic):
        """Add 4 content versions per topic (one for each major style)."""
        name = topic.title

        versions = [
            {
                'style_type': 'diagram',
                'title': f'{name} — Visual Diagram Approach',
                'content': (
                    f'📊 DIAGRAM-BASED EXPLANATION: {name}\n\n'
                    f'Think of {name} as a visual structure.\n\n'
                    f'[Structure]\n'
                    f'  Input ──► Process ──► Output\n'
                    f'              │\n'
                    f'           [Core Concept]\n\n'
                    f'Key visual relationships:\n'
                    f'• Each component maps to a clear role\n'
                    f'• Arrows show the flow of data or logic\n'
                    f'• Boxes represent states or entities\n\n'
                    f'Imagine drawing this on a whiteboard — start with the main entity in the center, '
                    f'then connect related parts with labeled arrows. This is how {name} works visually.'
                ),
                'diagram_score': 90, 'analogy_score': 10, 'example_score': 20,
                'theory_score': 20, 'logic_score': 30,
            },
            {
                'style_type': 'analogy',
                'title': f'{name} — Real-World Analogy',
                'content': (
                    f'💡 ANALOGY-BASED EXPLANATION: {name}\n\n'
                    f'Think of {name} like a library.\n\n'
                    f'Just as a library:\n'
                    f'• Has a catalog system (index) to find books quickly\n'
                    f'• Organizes books by category (structure)\n'
                    f'• Has rules for borrowing (constraints/rules)\n'
                    f'• Lets multiple readers access at once (concurrency)\n\n'
                    f'Similarly, {name} works by:\n'
                    f'• Organizing data in a structured, retrievable way\n'
                    f'• Enforcing rules to maintain consistency\n'
                    f'• Allowing multiple operations efficiently\n\n'
                    f'Once you see this parallel, the concept of {name} becomes intuitive!'
                ),
                'diagram_score': 10, 'analogy_score': 90, 'example_score': 30,
                'theory_score': 20, 'logic_score': 15,
            },
            {
                'style_type': 'example',
                'title': f'{name} — Hands-On Example',
                'content': (
                    f'💻 EXAMPLE-BASED EXPLANATION: {name}\n\n'
                    f'Let us walk through a concrete example of {name}.\n\n'
                    f'Scenario: Consider a Student database system.\n\n'
                    f'Step 1: Define your data\n'
                    f'  Student(id, name, grade, department)\n\n'
                    f'Step 2: Apply the concept of {name}\n'
                    f'  → Identify the key operation\n'
                    f'  → Apply rules systematically\n'
                    f'  → Verify the result\n\n'
                    f'Step 3: Test with real values\n'
                    f'  Input:  Student(101, "Alice", "A", "CS")\n'
                    f'  Output: Expected result based on {name}\n\n'
                    f'Practice Exercise: Try applying this to 3 more examples. '
                    f'Variation is the key to mastering {name}.'
                ),
                'diagram_score': 20, 'analogy_score': 15, 'example_score': 90,
                'theory_score': 20, 'logic_score': 40,
            },
            {
                'style_type': 'theory',
                'title': f'{name} — Formal Theory',
                'content': (
                    f'📖 THEORY-BASED EXPLANATION: {name}\n\n'
                    f'Definition:\n'
                    f'{name} is formally defined as a systematic approach to organizing, '
                    f'processing, and retrieving information efficiently and consistently.\n\n'
                    f'Formal Properties:\n'
                    f'1. Completeness — all cases are covered\n'
                    f'2. Consistency — no contradictions exist\n'
                    f'3. Independence — components are modular\n'
                    f'4. Efficiency — operations run in optimal time\n\n'
                    f'Theorem: {name} guarantees correctness when all formal properties hold.\n\n'
                    f'Historical Context:\n'
                    f'This concept was formalized in the 1970s and has since become a '
                    f'foundational principle in computer science and engineering.\n\n'
                    f'Reference: Refer to Silberschatz, Korth & Sudarshan for detailed proofs.'
                ),
                'diagram_score': 15, 'analogy_score': 10, 'example_score': 20,
                'theory_score': 90, 'logic_score': 50,
            },
        ]

        for v in versions:
            ContentVersion.objects.get_or_create(
                topic=topic,
                style_type=v['style_type'],
                defaults={
                    'title': v['title'],
                    'content': v['content'],
                    'diagram_score': v['diagram_score'],
                    'analogy_score': v['analogy_score'],
                    'example_score': v['example_score'],
                    'theory_score': v['theory_score'],
                    'logic_score': v['logic_score'],
                }
            )

    def _add_videos(self, topic):
        """Add 3 sample YouTube videos per topic — subject-specific URLs."""
        name = topic.title
        subject_slug = topic.subject.slug

        # ── Subject-specific video pools ──────────────────────────
        if subject_slug == 'dbms':
            videos = [
                {
                    'title': f'{name} — SQL Full Course (freeCodeCamp)',
                    'youtube_url': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
                    'description': 'Complete SQL tutorial with database design, queries and normalization.',
                    'diagram_score': 70, 'analogy_score': 20, 'example_score': 80,
                    'theory_score': 40, 'logic_score': 50,
                },
                {
                    'title': f'{name} — DBMS by Gate Smashers',
                    'youtube_url': 'https://www.youtube.com/watch?v=kBdlM6hNDAE',
                    'description': 'Structured DBMS theory ideal for exam preparation and GATE.',
                    'diagram_score': 30, 'analogy_score': 20, 'example_score': 40,
                    'theory_score': 85, 'logic_score': 60,
                },
                {
                    'title': f'{name} — DBMS Neso Academy',
                    'youtube_url': 'https://www.youtube.com/watch?v=4Z9KEBexzcM',
                    'description': 'Clear visual and logical explanation of database concepts.',
                    'diagram_score': 60, 'analogy_score': 30, 'example_score': 55,
                    'theory_score': 70, 'logic_score': 65,
                },
            ]
        elif subject_slug == 'dsa':
            videos = [
                {
                    'title': f'{name} — Abdul Bari Algorithms',
                    'youtube_url': 'https://www.youtube.com/watch?v=0IAPZzGSbME',
                    'description': 'Logic-first approach with pseudocode and step-by-step reasoning.',
                    'diagram_score': 35, 'analogy_score': 25, 'example_score': 70,
                    'theory_score': 40, 'logic_score': 85,
                },
                {
                    'title': f'{name} — Data Structures (mycodeschool)',
                    'youtube_url': 'https://www.youtube.com/watch?v=92S4zgXEozk',
                    'description': 'Visual diagram-based explanation of data structures.',
                    'diagram_score': 85, 'analogy_score': 30, 'example_score': 60,
                    'theory_score': 35, 'logic_score': 50,
                },
                {
                    'title': f'{name} — freeCodeCamp DSA Full Course',
                    'youtube_url': 'https://www.youtube.com/watch?v=zg9ih6SVACc',
                    'description': 'Complete data structures and algorithms with examples.',
                    'diagram_score': 50, 'analogy_score': 35, 'example_score': 85,
                    'theory_score': 45, 'logic_score': 75,
                },
            ]
        elif subject_slug == 'engineering-mathematics':
            videos = [
                {
                    'title': f'{name} — MIT OCW Linear Algebra (Gilbert Strang)',
                    'youtube_url': 'https://www.youtube.com/watch?v=7UJ4CFRGd-U',
                    'description': 'Visual and intuitive approach to engineering mathematics.',
                    'diagram_score': 80, 'analogy_score': 40, 'example_score': 60,
                    'theory_score': 70, 'logic_score': 55,
                },
                {
                    'title': f'{name} — Engineering Maths (GATE) by RK Kanodia',
                    'youtube_url': 'https://www.youtube.com/watch?v=MaKRBtKAdHQ',
                    'description': 'Structured maths theory and problem solving for GATE exam.',
                    'diagram_score': 30, 'analogy_score': 25, 'example_score': 60,
                    'theory_score': 85, 'logic_score': 70,
                },
                {
                    'title': f'{name} — Math for Engineers (Khan Academy style)',
                    'youtube_url': 'https://www.youtube.com/watch?v=EKvHQc3QPVY',
                    'description': 'Step-by-step worked examples with logical reasoning.',
                    'diagram_score': 40, 'analogy_score': 50, 'example_score': 80,
                    'theory_score': 45, 'logic_score': 75,
                },
            ]
        else:
            # Generic fallback
            videos = [
                {
                    'title': f'{name} — Visual Explanation',
                    'youtube_url': 'https://www.youtube.com/watch?v=7UJ4CFRGd-U',
                    'description': 'Visual walkthrough with diagrams and worked examples.',
                    'diagram_score': 80, 'analogy_score': 30, 'example_score': 60,
                    'theory_score': 40, 'logic_score': 50,
                },
                {
                    'title': f'{name} — Exam Prep & Theory',
                    'youtube_url': 'https://www.youtube.com/watch?v=kBdlM6hNDAE',
                    'description': 'Structured theory explanation ideal for exam preparation.',
                    'diagram_score': 30, 'analogy_score': 20, 'example_score': 40,
                    'theory_score': 85, 'logic_score': 60,
                },
                {
                    'title': f'{name} — Logic & Coding',
                    'youtube_url': 'https://www.youtube.com/watch?v=0IAPZzGSbME',
                    'description': 'Logic-first approach with pseudocode and step-by-step reasoning.',
                    'diagram_score': 35, 'analogy_score': 25, 'example_score': 70,
                    'theory_score': 40, 'logic_score': 85,
                },
            ]

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

