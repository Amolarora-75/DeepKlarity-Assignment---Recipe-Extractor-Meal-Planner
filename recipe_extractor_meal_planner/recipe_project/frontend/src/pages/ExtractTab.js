import React, { useState } from 'react';
import { extractRecipe } from '../api';
import RecipeDisplay from '../components/RecipeDisplay';

const SAMPLE_URLS = [
  'https://www.allrecipes.com/recipe/23891/grilled-cheese-sandwich/',
  'https://www.allrecipes.com/recipe/25080/mmm-cookies/',
  'https://www.allrecipes.com/recipe/17481/simple-white-cake/',
];

export default function ExtractTab() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState(null);

  const handleExtract = async () => {
    const trimmed = url.trim();
    if (!trimmed) { setError('Please enter a recipe URL.'); return; }
    if (!trimmed.startsWith('http')) { setError('URL must start with http:// or https://'); return; }

    setError('');
    setRecipe(null);
    setLoading(true);

    try {
      const data = await extractRecipe(trimmed);
      setRecipe(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to extract recipe. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleExtract(); };

  return (
    <div>
      {/* URL Input Card */}
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>
          🔍 Extract Recipe from URL
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
          Paste any recipe blog URL and we'll extract structured data, nutrition info, substitutions, and more using AI.
        </p>

        <div className="extract-url-form">
          <div className="input-wrap">
            <input
              className="input"
              type="url"
              placeholder="https://www.allrecipes.com/recipe/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleExtract}
            disabled={loading || !url.trim()}
          >
            {loading ? '⏳ Extracting...' : '✨ Extract Recipe'}
          </button>
        </div>

        {/* Sample URLs */}
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Try a sample URL:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SAMPLE_URLS.map((u) => (
              <button
                key={u}
                className="btn btn-outline"
                style={{ fontSize: 12, padding: '5px 10px' }}
                onClick={() => setUrl(u)}
                disabled={loading}
              >
                {u.split('/recipe/')[1]?.replace(/\//g, '').replace(/-/g, ' ').substring(0, 30) || u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-box" style={{ marginTop: 16 }}>
          ⚠️ <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="loading">
            <div className="spinner" />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600 }}>Analyzing recipe...</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Scraping page → Extracting with AI → Building nutrition & shopping data
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {recipe && !loading && (
        <div className="card recipe-result">
          <div className="recipe-result-header">
            <div>
              <h2 className="recipe-result-title">{recipe.title}</h2>
              {recipe.url && (
                <a href={recipe.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: 'var(--blue)', wordBreak: 'break-all' }}>
                  {recipe.url}
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {recipe.id && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  ✅ Saved to history (ID #{recipe.id})
                </span>
              )}
            </div>
          </div>
          <RecipeDisplay recipe={recipe} />
        </div>
      )}
    </div>
  );
}
