# PersonaLearn — AI-Inspired Personalized Learning System

A complete MVP Django web application that recommends learning content based on each student's unique learning style — using **no external AI APIs**. Pure rule-based, weighted-score personalization.

---

## 🎯 Project Overview

PersonaLearn solves a core educational challenge: the same topic explained in different ways works for different students. The system:

1. Presents **multiple explanation styles** (Diagram, Analogy, Example, Theory, Logic) for every topic
2. Lets the student **select the version that helped most** (with optional 1–5 star rating)
3. **Updates the student's preference profile** incrementally using the content's style scores
4. Uses a **weighted dot-product match score** to sort future content and video recommendations

---

## ✨ Features

| Feature | Description |
|---|---|
| Auth | Register, Login, Logout with Django built-in auth |
| Subjects | Admin-created subjects with icons and colors |
| Topics | Multiple topics per subject with ordering |
| Content Versions | 5 explanation styles per topic with style scores |
| Video Resources | YouTube videos tagged with style scores |
| Preference Engine | Cumulative weighted preference profile per user |
| Recommendation | Rule-based match scoring — no AI APIs |
| Dashboard | Radar chart, progress %, recommended topics & videos |
| History | Full interaction log with style badges & star ratings |
| REST API | DRF endpoints for all major resources |
| Admin Panel | Full Django admin for all models |
| Seed Data | 3 subjects × 5 topics × 4 versions + 3 videos each |

---

## 🛠 Tech Stack

- **Backend**: Python 3.x, Django 6, Django REST Framework
- **Database**: SQLite (default) — switchable to PostgreSQL
- **Frontend**: Django Templates, Bootstrap 5, Bootstrap Icons
- **Charts**: Chart.js (CDN, radar chart for preference profile)
- **Fonts**: Google Fonts (Inter + Space Grotesk)
- **Auth**: Django built-in authentication

---

## 📁 Project Structure

```
mini project/
├── personalized_learning/       # Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── accounts/                    # User auth + profile
│   ├── models.py               # UserProfile
│   ├── views.py                # Register, Login, Logout
│   ├── forms.py
│   ├── admin.py
│   └── urls.py
├── learning/                    # Core learning content
│   ├── models.py               # Subject, Topic, ContentVersion, VideoResource
│   ├── views.py                # All template views
│   ├── api_views.py            # DRF API views
│   ├── serializers.py
│   ├── admin.py
│   ├── urls.py
│   ├── api_urls.py
│   └── management/commands/
│       └── seed_data.py        # Demo data loader
├── recommendations/             # Recommendation engine
│   ├── models.py               # UserPreference, UserInteraction
│   ├── engine.py               # Core match scoring logic
│   ├── api_views.py
│   ├── serializers.py
│   ├── admin.py
│   └── api_urls.py
├── templates/
│   ├── base.html               # Navbar, footer, messages
│   ├── accounts/               # login.html, register.html
│   └── learning/               # home, dashboard, subject_list,
│                                 topic_list, topic_detail,
│                                 video_recommendations,
│                                 interaction_history
├── static/
│   ├── css/style.css           # Dark glass theme, animations
│   └── js/main.js              # Scroll effects, card selection
├── db.sqlite3                   # Auto-created SQLite database
├── requirements.txt
└── README.md
```

---

## 🚀 Installation & Setup

### 1. Clone / Navigate to Project
```bash
cd "mini project"
```

### 2. Create & Activate Virtual Environment
```bash
python3 -m venv venvMiniModel
source venvMiniModel/bin/activate   # macOS/Linux
# venvMiniModel\Scripts\activate     # Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Migrations
```bash
python manage.py makemigrations accounts learning recommendations
python manage.py migrate
```

### 5. Load Demo Seed Data
```bash
python manage.py seed_data
```
This creates:
- **Admin** user: `admin / admin123`
- **Student** user: `student / student123`
- 3 subjects, 15 topics, 60 content versions, 45 videos

### 6. Start Development Server
```bash
python manage.py runserver
```

Visit: **http://127.0.0.1:8000/**

---

## 🔑 Default Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | `admin` | `admin123` | All pages + `/admin/` |
| Student | `student` | `student123` | All student pages |

---

## 🔌 REST API Endpoints

| Method | URL | Description |
|---|---|---|
| GET | `/api/subjects/` | List all subjects |
| GET | `/api/subjects/<slug>/` | Subject detail with topics |
| GET | `/api/subjects/<slug>/topics/` | Topics for a subject |
| GET | `/api/topics/<id>/` | Topic detail with content versions |
| GET | `/api/preferences/` | Current user's preference profile |
| POST | `/api/submit-interaction/` | Submit content selection + rating |
| GET | `/api/recommended-topics/` | Get recommended topics |
| GET | `/api/recommended-videos/` | Get recommended videos |
| GET | `/api/interaction-history/` | User's interaction log |

---

## 🧠 How the Recommendation Engine Works

### Step 1 — Tagging Content
Every `ContentVersion` and `VideoResource` has five style scores (0–100):
- `diagram_score`, `analogy_score`, `example_score`, `theory_score`, `logic_score`

### Step 2 — Recording Interactions
When a student clicks **"This helped me most"**, a `UserInteraction` is created and `UserPreference` is updated:

```python
preference.diagram_preference += content_version.diagram_score * rating_multiplier
preference.analogy_preference += content_version.analogy_score * rating_multiplier
# ... and so on for each style
```

### Step 3 — Computing Match Score
For any new content or video:

```
match_score = (user.diagram_pref × item.diagram_score)
            + (user.analogy_pref × item.analogy_score)
            + (user.example_pref × item.example_score)
            + (user.theory_pref  × item.theory_score)
            + (user.logic_pref   × item.logic_score)
```

Items with higher match scores appear first. **No AI API needed** — pure weighted arithmetic.

### Step 4 — Preferred Style
The category with the highest cumulative score becomes the `preferred_style`:
```python
preferred_style = max({'diagram', 'analogy', 'example', 'theory', 'logic'},
                      key=lambda s: getattr(preference, f'{s}_preference'))
```

---

## 🔄 Switching to PostgreSQL (Optional)

In `personalized_learning/settings.py`, replace the DATABASES block:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'personalized_learning_db',
        'USER': 'postgres',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Then install the driver:
```bash
pip install psycopg2-binary
```

---

## 🚀 Future Scope

- [ ] Collaborative filtering (users with similar styles → shared recommendations)
- [ ] GPT/Gemini content generation toggle (when API available)
- [ ] PDF/Notes export per topic
- [ ] Leaderboard and gamification badges
- [ ] Mobile app (React Native) using the DRF APIs
- [ ] Topic prerequisites / learning path builder
- [ ] Admin analytics dashboard with Chart.js
- [ ] Email notifications for new recommended content
- [ ] Social learning — share preferred explanations with peers

---

## 📝 License

MIT — free to use for academic and competition projects.



+++++++++++++++++++






✅ PersonaLearn — Build Complete
Server is live at: http://127.0.0.1:8000/

📋 Everything Built
Section	Files	Status
Project Config	settings.py, urls.py	✅
accounts app	models.py, views.py, forms.py, admin.py, urls.py	✅
learning app	models.py, views.py, forms.py, admin.py, urls.py, api_views.py, api_urls.py, serializers.py	✅
recommendations app	models.py, engine.py, admin.py, api_views.py, api_urls.py, serializers.py	✅
Templates	base.html, home.html, dashboard.html, subject_list.html, topic_list.html, topic_detail.html, video_recommendations.html, interaction_history.html, login.html, register.html	✅
Static	style.css (dark glass theme), main.js	✅
Seed Data	seed_data.py — 3 subjects × 5 topics × 4 content versions + 3 videos	✅
Migrations	All tables created in SQLite	✅
README	Full setup + API docs + engine explanation	✅
🔑 Credentials
User	Username	Password
Admin	admin	admin123
Demo Student	student	student123
🌐 Key URLs
Page	URL
Home	http://127.0.0.1:8000/
Login	http://127.0.0.1:8000/accounts/login/
Register	http://127.0.0.1:8000/accounts/register/
Dashboard	http://127.0.0.1:8000/dashboard/
Subjects	http://127.0.0.1:8000/subjects/
Videos	http://127.0.0.1:8000/videos/
History	http://127.0.0.1:8000/history/
Admin Panel	http://127.0.0.1:8000/admin/
API Subjects	http://127.0.0.1:8000/api/subjects/
API Submit	POST /api/submit-interaction/
▶️ Commands to remember
bash
# Start server (from project dir, venv active)
source venvMiniModel/bin/activate
python manage.py runserver
# Re-seed data (if DB wiped)
python manage.py seed_data
# Access admin
# → http://127.0.0.1:8000/admin/  (admin / admin123)
🧠 How to demo the recommendation engine
Login as student / student123
Go to Subjects → DBMS → Introduction to DBMS
Read the explanation cards, click "This helped me most" on e.g. the Analogy one, rate it ⭐⭐⭐⭐⭐
Go back to Dashboard → watch the radar chart shift toward Analogy
The next recommended topics will now be sorted with Analogy-heavy content first