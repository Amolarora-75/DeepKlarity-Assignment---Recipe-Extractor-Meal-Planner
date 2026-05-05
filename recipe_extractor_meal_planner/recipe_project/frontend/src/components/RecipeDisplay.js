import React from 'react';

function difficultyBadge(d) {
  if (!d) return null;
  const cls = d === 'easy' ? 'badge-green' : d === 'hard' ? 'badge-red' : 'badge-orange';
  return <span className={`badge ${cls}`}>{d}</span>;
}

export default function RecipeDisplay({ recipe }) {
  if (!recipe) return null;

  return (
    <div>
      {/* Meta chips */}
      <div className="recipe-meta">
        {recipe.cuisine && <div className="meta-chip"><span className="label">Cuisine</span>{recipe.cuisine}</div>}
        {recipe.prep_time && <div className="meta-chip"><span className="label">Prep</span>{recipe.prep_time}</div>}
        {recipe.cook_time && <div className="meta-chip"><span className="label">Cook</span>{recipe.cook_time}</div>}
        {recipe.total_time && <div className="meta-chip"><span className="label">Total</span>{recipe.total_time}</div>}
        {recipe.servings && <div className="meta-chip"><span className="label">Serves</span>{recipe.servings}</div>}
        {recipe.difficulty && <div className="meta-chip"><span className="label">Difficulty</span>{difficultyBadge(recipe.difficulty)}</div>}
      </div>

      <div className="recipe-grid">
        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div>
            <h3 className="section-title">🥘 Ingredients</h3>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  <span className="ingredient-qty">
                    {ing.quantity} {ing.unit}
                  </span>{' '}
                  {ing.item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nutrition */}
        {recipe.nutrition_estimate && Object.keys(recipe.nutrition_estimate).length > 0 && (
          <div>
            <h3 className="section-title">📊 Nutrition (per serving)</h3>
            <div className="nutrition-grid">
              {recipe.nutrition_estimate.calories != null && (
                <div className="nutrition-card">
                  <div className="nutrition-value">{recipe.nutrition_estimate.calories}</div>
                  <div className="nutrition-label">Calories</div>
                </div>
              )}
              {recipe.nutrition_estimate.protein && (
                <div className="nutrition-card">
                  <div className="nutrition-value">{recipe.nutrition_estimate.protein}</div>
                  <div className="nutrition-label">Protein</div>
                </div>
              )}
              {recipe.nutrition_estimate.carbs && (
                <div className="nutrition-card">
                  <div className="nutrition-value">{recipe.nutrition_estimate.carbs}</div>
                  <div className="nutrition-label">Carbs</div>
                </div>
              )}
              {recipe.nutrition_estimate.fat && (
                <div className="nutrition-card">
                  <div className="nutrition-value">{recipe.nutrition_estimate.fat}</div>
                  <div className="nutrition-label">Fat</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {recipe.instructions?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 className="section-title">📋 Instructions</h3>
          <div className="steps-list">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{i + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substitutions */}
      {recipe.substitutions?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 className="section-title">🔄 Substitutions</h3>
          <div className="substitutions-list">
            {recipe.substitutions.map((sub, i) => (
              <div key={i} className="substitution-item">
                <span>💡</span>
                <span>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping list */}
      {recipe.shopping_list && Object.keys(recipe.shopping_list).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 className="section-title">🛒 Shopping List</h3>
          {Object.entries(recipe.shopping_list).map(([cat, items]) =>
            items && items.length > 0 ? (
              <div key={cat} className="shopping-category">
                <div className="shopping-category-title">{cat}</div>
                <div className="shopping-items">
                  {items.map((item, i) => (
                    <span key={i} className="shopping-item">{item}</span>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Related recipes */}
      {recipe.related_recipes?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 className="section-title">✨ You Might Also Like</h3>
          <div className="related-recipes">
            {recipe.related_recipes.map((r, i) => (
              <div key={i} className="related-recipe-item">
                <span>🍴</span> {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
