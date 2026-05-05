import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

EXTRACTION_PROMPT = """You are a professional recipe extraction and analysis assistant. Given the raw text or structured data scraped from a recipe webpage, extract and generate comprehensive recipe information.

INSTRUCTIONS:
- Extract ONLY information present in the text. Do not hallucinate ingredients or steps.
- For nutrition estimates, make reasonable approximations based on ingredients.
- Generate 3 practical ingredient substitutions.
- Group shopping list items by category (dairy, produce, pantry, protein, bakery, spices).
- Suggest 3 related recipes that pair well with this dish.
- Set difficulty: "easy" (< 30 min, few steps), "medium" (30-60 min), "hard" (> 60 min or complex).

RESPOND WITH ONLY VALID JSON — no markdown, no explanation, no preamble. Use this exact structure:

{
  "title": "Recipe Title",
  "cuisine": "Cuisine Type",
  "prep_time": "X mins",
  "cook_time": "X mins",
  "total_time": "X mins",
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {"quantity": "2", "unit": "cups", "item": "ingredient name"}
  ],
  "instructions": [
    "Step 1 description.",
    "Step 2 description."
  ],
  "nutrition_estimate": {
    "calories": 350,
    "protein": "12g",
    "carbs": "30g",
    "fat": "20g"
  },
  "substitutions": [
    "Replace X with Y for reason.",
    "Use A instead of B to achieve C.",
    "Swap C with D for a healthier version."
  ],
  "shopping_list": {
    "dairy": ["item1", "item2"],
    "produce": ["item3"],
    "pantry": ["item4"],
    "protein": [],
    "bakery": [],
    "spices": []
  },
  "related_recipes": [
    "Related Recipe 1",
    "Related Recipe 2",
    "Related Recipe 3"
  ]
}

SOURCE URL: {url}

SCRAPED CONTENT:
{content}"""


def extract_recipe_with_llm(page_text: str, url: str) -> dict:
    """
    Send scraped text to Claude API and extract structured recipe data.
    Returns a Python dict with all recipe fields.
    """
    prompt = EXTRACTION_PROMPT.format(
        url=url,
        content=page_text[:6000]  # Stay within token limits
    )

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    raw_text = response.content[0].text.strip()

    # Strip markdown fences if present
    raw_text = re.sub(r"^```json\s*", "", raw_text)
    raw_text = re.sub(r"\s*```$", "", raw_text)
    raw_text = raw_text.strip()

    try:
        recipe_data = json.loads(raw_text)
    except json.JSONDecodeError:
        # Try to find JSON block within response
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            recipe_data = json.loads(match.group())
        else:
            raise ValueError(f"LLM did not return valid JSON. Response: {raw_text[:500]}")

    # Ensure required fields exist with defaults
    recipe_data.setdefault("title", "Unknown Recipe")
    recipe_data.setdefault("cuisine", "Unknown")
    recipe_data.setdefault("prep_time", "N/A")
    recipe_data.setdefault("cook_time", "N/A")
    recipe_data.setdefault("total_time", "N/A")
    recipe_data.setdefault("servings", 1)
    recipe_data.setdefault("difficulty", "medium")
    recipe_data.setdefault("ingredients", [])
    recipe_data.setdefault("instructions", [])
    recipe_data.setdefault("nutrition_estimate", {})
    recipe_data.setdefault("substitutions", [])
    recipe_data.setdefault("shopping_list", {})
    recipe_data.setdefault("related_recipes", [])
    recipe_data["url"] = url

    return recipe_data
