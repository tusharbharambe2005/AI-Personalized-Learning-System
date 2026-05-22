# 👑 PersonaLearn — AI-Powered Personalized Learning System

A complete MVP Django web application that not only recommends learning content based on each student's unique learning style using a **rule-based engine**, but also features a **Personalized AI Mentor** powered by Google Gemini for premium users.

---

## 🎯 Project Overview

PersonaLearn solves a core educational challenge: the same topic explained in different ways works for different students. The system:

1. Presents **multiple explanation styles** (Diagram, Analogy, Example, Theory, Logic) for every topic.
2. Lets the student **rate the version** (1–5 stars) to indicate how well it helped them learn.
3. **Updates the student's preference profile** incrementally using the content's style scores.
4. Uses a **weighted dot-product match score** to sort future content and subject-specific video recommendations.
5. Offers a **Pro Upgrade** tier, unlocking a **Personalized AI Chatbot** that adapts its teaching style to the student's highest-ranked learning preference.

---

## ✨ Features

| Feature | Description |
|---|---|
| Auth | Register, Login, Logout with Django built-in auth |
| Subjects | Admin-created subjects with icons and colors |
| Topics | Multiple topics per subject with ordering |
| Content Versions | 5 explanation styles per topic with style scores |
| Video Resources | Subject-aware YouTube videos tagged with style scores |
| Preference Engine | Cumulative weighted preference profile per user |
| Recommendation | Rule-based match scoring |
| Pro Upgrade System | Coupon-based upgrade request (`TUSHAR123`) with Admin approval flow |
| Personalized AI Chatbot | Gemini-powered AI Mentor that dynamically adapts to user learning styles |
| Dashboard | Radar chart, progress %, recommended topics & videos |
| History | Full interaction log with style badges & star ratings |
| Premium UI/UX | "Royal/Medieval" design system, glassmorphism, fluid animations |
| REST API | DRF endpoints for all major resources |

---

## 🛠 Tech Stack

- **Backend**: Python 3.x, Django 6.x, Django REST Framework
- **AI Integration**: Google GenAI SDK (`google-generativeai`), Gemini API
- **Database**: SQLite (default)
- **Frontend**: Django Templates, Vanilla CSS, Vanilla JS, Bootstrap 5
- **Charts**: Chart.js (CDN, radar chart for preference profile)
- **Fonts**: Google Fonts (`Cinzel Decorative`, `MedievalSharp`, `Inter`)
- **Auth**: Django built-in authentication

---

## 📁 Project Structure

```
mini project/
├── personalized_learning/       # Django project config
├── accounts/                    # User auth + Pro Upgrade models/views
├── chatbot/                     # AI Chatbot app (Gemini integration & API)
├── learning/                    # Core learning content (Subjects, Topics, Videos)
├── recommendations/             # Core recommendation engine logic
├── templates/
│   ├── base.html               # Navbar, footer, floating chatbot UI
│   ├── accounts/               # login, register, upgrade
│   ├── chatbot/                # Chatbot glassmorphism interface
│   └── learning/               # home, dashboard, subjects, videos, history
├── static/
│   ├── css/style.css           # Royal glassmorphism theme, animations
│   └── js/main.js              # Scroll effects, card selection
├── requirements.txt
├── ai_presnlize_info.md         # Detailed engine & logic documentation
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
*(Make sure `google-generativeai` is installed for the chatbot to work).*

### 4. Environment Variables
To use the AI Chatbot, set your Gemini API key in your environment (or hardcode it in `chatbot_engine.py` for local testing):
```bash
export GEMINI_API_KEY="your-api-key-here"
```

### 5. Run Migrations
```bash
python manage.py makemigrations accounts chatbot learning recommendations
python manage.py migrate
```

### 6. Load Demo Seed Data
```bash
python manage.py seed_data
```
This creates:
- **Admin** user: `admin / admin123`
- **Student** user: `student / student123`
- 3 subjects, 15 topics, 60 content versions, 45 videos

### 7. Start Development Server
```bash
python manage.py runserver
```

Visit: **http://127.0.0.1:8000/**

---

## 🔑 Default Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | `admin` | `admin123` | All pages + `/admin/` + Approve Pro Requests |
| Student | `student` | `student123` | All student pages |

---

## 👑 How to Test Pro & AI Features

1. Login as a student.
2. Go to your Profile dropdown -> **Upgrade to Pro**.
3. Enter the coupon code: `TUSHAR123`.
4. Your status will change to **Pending**.
5. Login as an `admin` (or use a superuser account).
6. Go to the Django Admin panel (`/admin/`).
7. Navigate to `User Profiles`, select your student account, and use the Action dropdown: **"Approve selected Pro upgrade requests"**.
8. Log back in as the student. You will now see the floating 🔮 AI Chatbot icon on all pages!
9. Open it to experience a personalized AI tutor that adapts its system prompt to your highest learning style score (e.g., Analogy, Diagram).

---

## 🧠 Recommendation Engine Flow

Check the included `ai_presnlize_info.md` file for a deep dive into the math, logic, and architecture of the personalization engine and chatbot system.

---

## 🚀 Future Scope

- [ ] Collaborative filtering (users with similar styles → shared recommendations)
- [ ] Automated content generation (using Gemini to generate the 5 topic versions)
- [ ] PDF/Notes export per topic
- [ ] Leaderboard and gamification badges
- [ ] Mobile app (React Native) using the DRF APIs

---

## 📝 License

MIT — free to use for academic and competition projects.