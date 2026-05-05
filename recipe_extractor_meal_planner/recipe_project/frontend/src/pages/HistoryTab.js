import React, { useState, useEffect, useCallback } from 'react';
import { listRecipes, deleteRecipe } from '../api';
import RecipeModal from '../components/RecipeModal';

function difficultyBadge(d) {
  if (!d) return <span className="badge badge-blue">N/A</span>;
  const cls = d === 'easy' ? 'badge-green' : d === 'hard' ? 'badge-red' : 'badge-orange';
  return <span className={`badge ${cls}`}>{d}</span>;
}

export default function HistoryTab() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRecipes();
      setRecipes(data);
    } catch (e) {
      setError('Failed to load recipes. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this recipe from history?')) return;
    setDeleting(id);
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete recipe.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>📚 Saved Recipes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              All previously extracted recipes — click a row for full details.
            </p>
          </div>
          <button className="btn btn-outline" onClick={loadRecipes} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Loading recipes...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-box">⚠️ {error}</div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No recipes yet</h3>
            <p>Go to "Extract Recipe" tab and paste a recipe URL to get started.</p>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Recipe Name</th>
                  <th>Cuisine</th>
                  <th>Difficulty</th>
                  <th>Prep</th>
                  <th>Date Extracted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(r.id)}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>#{r.id}</td>
                    <td style={{ fontWeight: 600, maxWidth: 200 }}>{r.title}</td>
                    <td>{r.cuisine || 'N/A'}</td>
                    <td>{difficultyBadge(r.difficulty)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.prep_time || 'N/A'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(r.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedId(r.id); }}
                        >
                          Details
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={(e) => handleDelete(r.id, e)}
                          disabled={deleting === r.id}
                        >
                          {deleting === r.id ? '...' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId && (
        <RecipeModal recipeId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
