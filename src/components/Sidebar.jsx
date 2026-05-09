import React from 'react';

const SEASONS = [
  { id: 'SPRING', label: 'Genesis' },
  { id: 'SUMMER', label: 'Canon' },
  { id: 'AUTUMN', label: 'Decon' },
  { id: 'WINTER', label: 'Reflect' }
];

export default function Sidebar({ chapters, currentId, onSelect }) {
  return (
    <div className="sidebar-sticky">
      <section className="panel">
        <div className="panel-head">
          <h2>Навігація</h2>
          <p>Оберіть главу атласу</p>
        </div>
        <nav className="chapter-nav">
          {SEASONS.map(season => {
            const seasonChapters = chapters.filter(c => c.season === season.id);
            if (seasonChapters.length === 0) return null;
            
            return (
              <div key={season.id} className="nav-season-group">
                <div className="mini-label" style={{ margin: '10px 16px 5px' }}>
                  {season.label}
                </div>
                {seasonChapters.map(chapter => (
                  <a
                    key={chapter.id}
                    href={`#chapter/${chapter.id}`}
                    className={`chapter-link ${currentId === chapter.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelect(chapter.id);
                    }}
                  >
                    <div className="link-title">{chapter.title}</div>
                  </a>
                ))}
              </div>
            );
          })}
        </nav>
      </section>
    </div>
  );
}
