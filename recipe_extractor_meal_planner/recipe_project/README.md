# 🍽️ Recipe Extractor & Meal Planner

A full-stack web application that scrapes recipe blog URLs and uses AI (Claude / Anthropic API) to extract structured recipe data, nutritional estimates, substitutions, and shopping lists.

---

## 📁 Project Structure

```
recipe_project/
├── backend/
│   ├── main.py           # FastAPI app with all endpoints
│   ├── database.py       # SQLAlchemy DB connection
│   ├── models.py         # ORM models (Recipe)
│   ├── scraper.py        # BeautifulSoup web scraper
│   ├── llm_service.py    # Anthropic Claude API integration
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment variable template
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js                      # Root component with tab navigation
│   │   ├── api.js                      # Axios API calls
│   │   ├── styles/globals.css          # Design system & styles
│   │   ├── pages/
│   │   │   ├── ExtractTab.js           # Tab 1: Extract recipe
│   │   │   ├── HistoryTab.js           # Tab 2: Saved recipes
│   │   │   └── MealPlannerTab.js       # Tab 3: Meal planner
│   │   └── components/
│   │       ├── RecipeDisplay.js        # Full recipe card layout
│   │       └── RecipeModal.js          # Details modal
│   └── package.json
├── sample_data/
│   ├── tested_urls.txt
│   └── grilled_cheese_output.json
├── prompts/
│   └── prompt_templates.md
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Anthropic API key (free at https://console.anthropic.com)

---

### 1. Database Setup

```bash
# Start PostgreSQL and create database
psql -U postgres
CREATE DATABASE recipe_db;
\q
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in:
#   ANTHROPIC_API_KEY=your_key_here
#   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/recipe_db

# Start the server
python main.py
# OR: uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/extract` | Scrape URL + extract recipe with AI |
| GET | `/recipes` | List all saved recipes |
| GET | `/recipes/{id}` | Get full recipe by ID |
| DELETE | `/recipes/{id}` | Delete a recipe |
| POST | `/meal-plan` | Generate combined shopping list |

### POST `/extract` — Request body:
```json
{ "url": "https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/" }
```

### POST `/meal-plan` — Request body:
```json
{ "recipe_ids": [1, 2, 3] }
```

---

## 🤖 LLM Integration

This project uses the **Anthropic Claude API** (`claude-sonnet-4-20250514`).

The extraction prompt:
- Grounds output in scraped content (minimizes hallucination)
- Returns strictly formatted JSON
- Extracts ingredients with quantity/unit/item separated
- Generates nutritional estimates, substitutions, shopping list, related recipes

See `prompts/prompt_templates.md` for full prompt templates.

---

## 🧪 Testing

1. Start both backend and frontend
2. Go to http://localhost:3000
3. Paste a recipe URL in Tab 1, e.g.:
   - `https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/`
4. Click "Extract Recipe"
5. View result, check Tab 2 for history, Tab 3 for meal planning

---

## ⚠️ Error Handling

The system handles:
- Invalid or non-recipe URLs → HTTP 422 with clear message
- Scraping failures (timeout, 403) → descriptive error
- LLM returning invalid JSON → retry with regex extraction
- Missing DB → meaningful startup error
- Duplicate URLs → returns cached result instead of re-scraping

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | PostgreSQL + SQLAlchemy |
| Scraping | BeautifulSoup4 + requests |
| LLM | Anthropic Claude API |
| Frontend | React 18 |
| HTTP client | Axios |
| Fonts | DM Sans + DM Serif Display |
