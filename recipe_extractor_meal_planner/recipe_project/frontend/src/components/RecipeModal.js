import React, { useEffect, useState } from 'react';
import { getRecipe } from '../api';
import RecipeDisplay from './RecipeDisplay';

export default function RecipeModal({ recipeId, onClose }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!recipeId) return;
    setLoading(true);
    getRecipe(recipeId)
      .then(setRecipe)
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load recipe'))
      .finally(() => setLoading(false));
  }, [recipeId]);

  // Close on escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{recipe?.title || 'Recipe Details'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p>Loading recipe...</p>
            </div>
          )}
          {error && (
            <div className="error-box">⚠️ {error}</div>
          )}
          {recipe && !loading && (
            <RecipeDisplay recipe={recipe} />
          )}
        </div>
      </div>
    </div>
  );
}
