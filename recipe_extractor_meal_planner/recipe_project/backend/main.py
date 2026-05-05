from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uvicorn

from database import SessionLocal, engine, Base
from models import Recipe
from scraper import scrape_url
from llm_service import extract_recipe_with_llm
import json

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Recipe Extractor & Meal Planner API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ExtractRequest(BaseModel):
    url: str


class MealPlanRequest(BaseModel):
    recipe_ids: list[int]


@app.get("/")
def root():
    return {"message": "Recipe Extractor & Meal Planner API is running!"}


@app.post("/extract")
def extract_recipe(request: ExtractRequest, db: Session = Depends(get_db)):
    """Scrape a recipe URL and extract structured data using LLM."""
    url = request.url.strip()
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL. Must start with http:// or https://")

    # Check if already extracted
    existing = db.query(Recipe).filter(Recipe.url == url).first()
    if existing:
        return json.loads(existing.data_json)

    # Scrape page
    try:
        page_text = scrape_url(url)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to scrape URL: {str(e)}")

    if not page_text or len(page_text) < 100:
        raise HTTPException(status_code=422, detail="Could not extract meaningful content from the page. Make sure it's a recipe blog URL.")

    # Extract with LLM
    try:
        recipe_data = extract_recipe_with_llm(page_text, url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM extraction failed: {str(e)}")

    # Save to DB
    recipe = Recipe(
        url=url,
        title=recipe_data.get("title", "Unknown Recipe"),
        cuisine=recipe_data.get("cuisine", "Unknown"),
        difficulty=recipe_data.get("difficulty", "medium"),
        data_json=json.dumps(recipe_data)
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    recipe_data["id"] = recipe.id
    recipe_data["created_at"] = recipe.created_at.isoformat()
    return recipe_data


@app.get("/recipes")
def list_recipes(db: Session = Depends(get_db)):
    """Return all saved recipes for history tab."""
    recipes = db.query(Recipe).order_by(Recipe.created_at.desc()).all()
    result = []
    for r in recipes:
        data = json.loads(r.data_json)
        result.append({
            "id": r.id,
            "url": r.url,
            "title": r.title,
            "cuisine": r.cuisine,
            "difficulty": r.difficulty,
            "created_at": r.created_at.isoformat(),
            "prep_time": data.get("prep_time", "N/A"),
            "cook_time": data.get("cook_time", "N/A"),
        })
    return result


@app.get("/recipes/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Get full details of a saved recipe."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    data = json.loads(recipe.data_json)
    data["id"] = recipe.id
    data["created_at"] = recipe.created_at.isoformat()
    return data


@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Delete a saved recipe."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}


@app.post("/meal-plan")
def generate_meal_plan(request: MealPlanRequest, db: Session = Depends(get_db)):
    """Generate a combined shopping list for selected recipes."""
    if len(request.recipe_ids) < 1:
        raise HTTPException(status_code=400, detail="Select at least 1 recipe")

    recipes_data = []
    for rid in request.recipe_ids:
        recipe = db.query(Recipe).filter(Recipe.id == rid).first()
        if recipe:
            recipes_data.append(json.loads(recipe.data_json))

    if not recipes_data:
        raise HTTPException(status_code=404, detail="No recipes found")

    # Merge shopping lists
    merged_shopping = {}
    for recipe in recipes_data:
        sl = recipe.get("shopping_list", {})
        for category, items in sl.items():
            if category not in merged_shopping:
                merged_shopping[category] = []
            for item in items:
                if item not in merged_shopping[category]:
                    merged_shopping[category].append(item)

    return {
        "recipes": [{"id": r.get("id"), "title": r.get("title")} for r in recipes_data],
        "merged_shopping_list": merged_shopping,
        "total_recipes": len(recipes_data)
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
