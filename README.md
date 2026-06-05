# 🎓 PersonaLearn — AI-Powered Personalized Learning System

A full-stack web app that recommends learning content based on each student's unique learning style using a **rule-based recommendation engine** and a **Personalized AI Mentor** powered by Google Gemini.

---

## 🎯 Project Overview

PersonaLearn solves a core educational challenge: the same topic explained in different ways works for different students. The system:

1. Presents **multiple explanation styles** (Diagram, Analogy, Example, Theory, Logic) for every topic.
2. Lets the student **rate the explanation** (1–5 stars) to indicate how well it helped them learn.
3. **Updates the student's preference profile** using the content's style scores.
4. Uses a **weighted match score** to sort future content and video recommendations.
5. Features a **Personalized AI Chatbot** that adapts its teaching style to the student's learning preference.

---

## ✨ Features

| Feature | Description |
|---|---|
| Auth | Register, Login, Logout with JWT |
| Subjects | Admin-created subjects with icons and colors |
| Topics | Multiple topics per subject with ordering |
| Content Versions | 5 explanation styles per topic |
| Video Resources | YouTube videos tagged with style scores |
| Preference Engine | Cumulative weighted preference profile per user |
| Recommendation | Rule-based match scoring |
| Personalized AI Chatbot | Gemini-powered AI Mentor adapting to learning style |
| Dashboard | Radar chart, progress %, recommended topics & videos |
| History | Full interaction log with style badges & star ratings |
| React Frontend | Modern SPA with responsive design |
| REST API | DRF endpoints for all major resources |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.x, Django 5.x, Django REST Framework |
| **Frontend** | React 18, Vite, Vanilla CSS |
| **AI** | Google Gemini API (`google-generativeai`) |
| **Auth** | JWT (SimpleJWT) |
| **Database** | SQLite (dev) |
| **Deployment** | Render (Backend + Frontend) |

---

## 📁 Project Structure

```
mini project/
├── backend/                         # Django Backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── personalized_learning/       # Django project config (settings, urls)
│   ├── accounts/                    # User auth + profile
│   ├── chatbot/                     # AI Chatbot (Gemini integration & API)
│   ├── learning/                    # Subjects, Topics, Content, Videos
│   ├── recommendations/             # Recommendation engine
│   ├── templates/                   # Django HTML templates
│   └── static/                      # CSS, JS assets
│
├── frontend/                        # React Frontend
│   ├── src/
│   │   ├── pages/                   # Dashboard, Topics, Chatbot, History...
│   │   ├── components/              # Navbar, Cards, etc.
│   │   ├── context/                 # Auth context
│   │   └── services/                # API layer (api.js)
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd "mini project"
```

---

### 🐍 Backend (Django)

```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your-gemini-api-key" > .env

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

---

### ⚛️ Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=" > .env    # Leave empty for local (uses Vite proxy)

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> ℹ️ The Vite proxy in `vite.config.js` automatically forwards `/api` requests to `localhost:8000` in development.

---

## 🌐 Production Deployment (Render)

### Backend (Web Service)
| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` |
| Start Command | `gunicorn personalized_learning.wsgi:application` |

**Environment Variables:**
```
DJANGO_SECRET_KEY    = <your-secret-key>
DJANGO_DEBUG         = False
GEMINI_API_KEY       = <your-gemini-key>
CORS_ALLOWED_ORIGIN  = https://your-react-app.onrender.com
```

### Frontend (Static Site)
| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

**Environment Variables:**
```
VITE_API_URL = https://your-django-backend.onrender.com
```

---

## 🔑 Admin Access

Go to `/admin/` on your deployed backend URL to:
- Create Subjects & Topics
- Add Content Versions for each topic
- Manage users

---

## 🧠 How the Recommendation Engine Works

1. Every content version has **style scores** (0–100) for 5 styles: Diagram, Analogy, Example, Theory, Logic.
2. When a user rates content, their **preference profile** (5 scores) is updated using a weighted average.
3. Future content is **ranked by dot-product** between user profile and content style scores.
4. The AI Chatbot reads the user's **top-ranked style** and adapts its explanation approach accordingly.

---

## 🚀 Future Scope

- [ ] Collaborative filtering (users with similar styles → shared recommendations)
- [ ] Automated content generation using Gemini
- [ ] PDF/Notes export per topic
- [ ] Leaderboard and gamification badges

---

## 📝 License

MIT — free to use for academic and personal projects.