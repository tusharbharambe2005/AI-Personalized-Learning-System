# 🎓 PersonaLearn Platform Architecture & Flow

PersonaLearn is a highly adaptive, personalized EdTech platform built with Django. It dynamically adjusts educational content and AI interactions based on a student's unique learning preferences.

---

## 1. Core Learning Styles
Every piece of content and interaction is mapped to five core learning styles:
1. **Analogy** (Metaphors, comparisons, real-world mapping)
2. **Diagram** (Visual flow, charts, structure)
3. **Example** (Concrete scenarios, practical cases)
4. **Logic** (Step-by-step reasoning, deductions, proofs)
5. **Theory** (Formal definitions, concepts, academic text)

---

## 2. Content Delivery System

### The `Subject` -> `Topic` -> `ContentVersion` Hierarchy
Each Subject contains multiple Topics. Instead of a single static text, each Topic contains multiple `ContentVersions`, each heavily leaning into specific learning styles.

### Delivery Flow
1. **First-Time Topic Visit (No History):**
   When a student opens a topic for the first time, they are shown content in a fixed default order:
   *Priority 1 → Analogy | Priority 2 → Diagram | Priority 3 → Example | Priority 4 → Logic | Priority 5 → Theory*
2. **Returning Visit (Personalized Priority):**
   If the student has interaction history, the recommendation engine (`recommendations/engine.py`) calculates their personal style rankings and dynamically reorders the `ContentVersions`. Their preferred learning style is shown first.
3. **Sequential Viewing:**
   Only one version is shown at a time. The student navigates through them sequentially.

---

## 3. The Preference Engine (Feedback Loop)

When a student finishes reading a `ContentVersion`, they submit a rating (1 to 5 stars).

**How it works:**
1. A `UserInteraction` record is saved to the database.
2. The `UserPreference` profile for that student is instantly recalculated.
3. **The Math:**
   - The engine subtracts 3.0 from the rating to determine positive/negative sentiment (e.g., 5 stars = +2.0, 1 star = -2.0).
   - This score is distributed across the `ContentVersion`'s tagged learning styles.
   - Over time, if a user consistently rates `Example` content 5 stars, their `example_score` skyrockets, ensuring future topics load Example-heavy content first.

---

## 4. Subject-Aware Video Recommendations
Instead of a global feed, video recommendations are context-aware.
- The platform queries `VideoResource` objects mapped to the student's *current Subject*.
- It then calculates a match score between the Video's tagged learning styles and the student's `UserPreference` profile.
- Videos are sorted by highest match score, ensuring the student gets visually and stylistically appropriate supplemental learning.

---

## 5. The Pro Upgrade System

PersonaLearn features a gated premium tier.
1. **Request:** A user goes to `/upgrade/` and inputs the coupon code `TUSHAR123`.
2. **Pending State:** Their `UserProfile.pro_requested` flag is set to True. Their dashboard shows a ⏳ Pending badge.
3. **Admin Approval:** An administrator logs into the Django Admin panel, selects the pending users, and runs the custom bulk action: *"Approve selected Pro upgrade requests"*.
4. **Activation:** The user becomes a Pro member, unlocking premium features.

---

## 6. Personalized AI Chatbot (Pro Feature)

The crown jewel of the Pro tier is the **PersonaLearn AI Mentor**.

- **Tech Stack:** Powered by the Google Gemini API (`google-generativeai`).
- **Dynamic System Prompting:** Before sending a user's message to Gemini, the backend (`chatbot_engine.py`) intercepts the request and injects a hidden system prompt.
- **True Personalization:** The system prompt reads the user's highest-ranked learning styles. If a user is an "Analogy Learner", Gemini is explicitly instructed: *"You are tutoring Tushar. They learn best through Analogies. Explain concepts using vivid real-world metaphors."*
- **Premium UI:** The chatbot interface features a highly polished, responsive, glassmorphic design with animated background blobs, royal gradients, and smooth typing indicators.

---

## 7. Tech Stack Summary
- **Backend:** Python, Django 6.x
- **Database:** SQLite (development)
- **Frontend:** HTML, Vanilla CSS (Variables, Flexbox/Grid, CSS Animations), Vanilla JavaScript
- **AI Integration:** Google Gemini SDK (`genai`)
- **Design System:** Custom "Royal/Parchment" UI with `Cinzel Decorative` and `MedievalSharp` typography.
