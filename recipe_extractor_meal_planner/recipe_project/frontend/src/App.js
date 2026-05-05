import React, { useState } from 'react';
import './styles/globals.css';
import ExtractTab from './pages/ExtractTab';
import HistoryTab from './pages/HistoryTab';
import MealPlannerTab from './pages/MealPlannerTab';

function App() {
  const [activeTab, setActiveTab] = useState('extract');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🍽️</span>
            <div>
              <h1 className="logo-title">Recipe Extractor</h1>
              <p className="logo-sub">& Meal Planner</p>
            </div>
          </div>
          <nav className="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'extract' ? 'active' : ''}`}
              onClick={() => setActiveTab('extract')}
            >
              <span>🔍</span> Extract Recipe
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span>📚</span> Saved Recipes
            </button>
            <button
              className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => setActiveTab('planner')}
            >
              <span>🗓️</span> Meal Planner
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'extract' && <ExtractTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'planner' && <MealPlannerTab />}
      </main>
    </div>
  );
}

export default App;
