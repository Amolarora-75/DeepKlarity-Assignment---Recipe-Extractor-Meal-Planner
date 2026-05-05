import requests
from bs4 import BeautifulSoup
import re


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def scrape_url(url: str, timeout: int = 15) -> str:
    """
    Scrape a recipe blog URL and return meaningful text content.
    Tries to extract recipe-relevant sections first, then falls back to full body text.
    """
    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise ValueError("Request timed out. The site may be slow or blocking scrapers.")
    except requests.exceptions.HTTPError as e:
        raise ValueError(f"HTTP error {e.response.status_code}: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Network error: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove noise elements
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "form", "noscript", "iframe", "ads",
                     "[class*='ad-']", "[id*='ad-']"]):
        tag.decompose()

    # Try structured recipe markup first (schema.org)
    recipe_json_ld = _extract_json_ld_recipe(soup)
    if recipe_json_ld:
        return recipe_json_ld

    # Try known recipe container selectors
    recipe_selectors = [
        "article[class*='recipe']",
        "div[class*='recipe']",
        "div[id*='recipe']",
        "section[class*='recipe']",
        ".recipe-content",
        ".recipe-card",
        ".wprm-recipe",
        ".tasty-recipe",
        ".mv-recipe-card",
        ".recipe-box",
        "main",
        "article",
    ]

    for selector in recipe_selectors:
        element = soup.select_one(selector)
        if element:
            text = element.get_text(separator="\n", strip=True)
            if len(text) > 200:
                return _clean_text(text)

    # Fallback: get all body text
    body = soup.find("body")
    if body:
        return _clean_text(body.get_text(separator="\n", strip=True))

    return soup.get_text(separator="\n", strip=True)


def _extract_json_ld_recipe(soup: BeautifulSoup) -> str:
    """Extract recipe data from JSON-LD structured markup."""
    import json
    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        try:
            data = json.loads(script.string or "")
            # Handle single object or list
            items = data if isinstance(data, list) else [data]
            for item in items:
                # Handle @graph wrapper
                if item.get("@type") == "ItemList" or "@graph" in item:
                    items = item.get("@graph", items)
                if isinstance(item.get("@type"), str) and "Recipe" in item.get("@type", ""):
                    return f"[STRUCTURED DATA]\n{json.dumps(item, indent=2)}"
                elif isinstance(item.get("@type"), list) and "Recipe" in item.get("@type", []):
                    return f"[STRUCTURED DATA]\n{json.dumps(item, indent=2)}"
        except Exception:
            continue
    return ""


def _clean_text(text: str) -> str:
    """Clean up extracted text."""
    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove very long lines of repeated characters
    text = re.sub(r"(.)\1{10,}", "", text)
    # Trim
    text = text.strip()
    # Limit size to avoid token overflow (keep first 8000 chars)
    if len(text) > 8000:
        text = text[:8000] + "\n...[content truncated]"
    return text
