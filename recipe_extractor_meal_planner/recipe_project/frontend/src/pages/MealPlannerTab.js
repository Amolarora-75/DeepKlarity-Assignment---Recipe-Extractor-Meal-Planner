import React, { useState, useEffect } from 'react';
import { listRecipes, generateMealPlan } from '../api';

export default function MealPlannerTab() {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listRecipes()
      .then(setRecipes)
      .catch(() => setError('Failed to load saved recipes.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setPlan(null);
  };

  const handleGenerate = async () => {
    if (selected.length < 1) { setError('Select at least 1 recipe.'); return; }
    setError('');
    setGenerating(true);
    try {
      const data = await generateMealPlan(selected);
      setPlan(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to generate meal plan.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>
          🗓️ Meal Planner
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
          Select 1–5 saved recipes and generate a combined shopping list.
        </p>

        {loading && (
          <div className="loading"><div className="spinner" /><p>Loading recipes...</p></div>
        )}

        {!loading && recipes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No recipes saved yet</h3>
            <p>Extract some recipes first, then come back here to plan your meals.</p>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              {selected.length} selected — pick up to 5 recipes
            </p>
            <div className="recipe-select-grid">
              {recipes.map((r) => (
                <div
                  key={r.id}
                  className={`recipe-select-card ${selected.includes(r.id) ? 'selected' : ''}`}
                  onClick={() => toggleSelect(r.id)}
                >
                  {selected.includes(r.id) && <div className="check">✓</div>}
                  <h4>{r.title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.cuisine} · {r.difficulty}
                  </p>
                </div>
              ))}
            </div>

            {error && <div className="error-box" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating || selected.length === 0}
            >
              {generating ? '⏳ Generating...' : '🛒 Generate Combined Shopping List'}
            </button>
          </>
        )}
      </div>

      {/* Meal Plan Result */}
      {plan && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>
            🛒 Combined Shopping List
          </h3>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Recipes included:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {plan.recipes?.map((r) => (
                <span key={r.id} className="badge badge-green">{r.title}</span>
              ))}
            </div>
          </div>

          {plan.merged_shopping_list && Object.keys(plan.merged_shopping_list).length > 0 ? (
            <div>
              {Object.entries(plan.merged_shopping_list).map(([cat, items]) =>
                items && items.length > 0 ? (
                  <div key={cat} className="shopping-category">
                    <div className="shopping-category-title">📦 {cat}</div>
                    <div className="shopping-items">
                      {items.map((item, i) => (
                        <span key={i} className="shopping-item">✓ {item}</span>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No shopping list data available for selected recipes.</p>
          )}
        </div>
      )}
    </div>
  );
}
