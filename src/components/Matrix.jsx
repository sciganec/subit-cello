import React, { useState } from 'react';

export default function Matrix({ entries, searchQuery, onSelectChapter, onSelectEntry }) {
  const [currentSeason, setCurrentSeason] = useState('ALL');

  const filteredEntries = entries.filter(e => 
    (currentSeason === 'ALL' || e.season === currentSeason) &&
    (searchQuery === '' || 
     e.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
     e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const seasons = ['ALL', ...new Set(entries.map(e => e.season))];

  return (
    <section id="matrix" className="panel matrix-panel">
      <div className="matrix-head">
        <div>
          <p className="eyebrow">The Matrix</p>
          <h2>SUBIT-стани</h2>
        </div>
      </div>

      <div className="season-filter">
        {seasons.map(s => (
          <button 
            key={s}
            className={`season-chip ${currentSeason === s ? 'active' : ''}`}
            onClick={() => setCurrentSeason(s)}
          >
            {s === 'ALL' ? 'Усі сезони' : s}
          </button>
        ))}
      </div>

      <div className="matrix-grid">
        {filteredEntries.map(e => (
          <article 
            key={e.index} 
            className="matrix-card"
            onClick={() => onSelectEntry(e)}
          >
            <span className="season-tag">{e.season}</span>
            <h3>{e.index}. {e.label}</h3>
            <p>{e.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
