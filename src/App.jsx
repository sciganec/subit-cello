import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Home, ChevronRight, ChevronLeft, LayoutGrid, X } from 'lucide-react';
import CelloViz from './components/CelloViz';
import Sidebar from './components/Sidebar';
import Reader from './components/Reader';
import Matrix from './components/Matrix';
import EntryModal from './components/EntryModal';

const CHAPTERS = [
  { id: "history", file: "content/history.md", title: "Історія", season: "SPRING", description: "Від ранніх басових інструментів до сучасної глобальної екосистеми віолончелі." },
  { id: "organology", file: "content/organology.md", title: "Будова і акустика", season: "SPRING", description: "Корпус, душа, підставка, струни, смичок, регістри, тембр і тілесність гри." },
  { id: "schools", file: "content/schools.md", title: "Виконавські школи", season: "SPRING", description: "Національні та педагогічні лінії, що формують школу звуку і смаку." },
  { id: "composers", file: "content/composers-and-works.md", title: "Композитори і твори", season: "SUMMER", description: "Канон віолончельного репертуару від Баха до модерного і сучасного корпусу." },
  { id: "orchestra", file: "content/orchestra.md", title: "В оркестрі", season: "SUMMER", description: "Бас, мелодичний центр, гармонічне тіло і солістична присутність." },
  { id: "chamber", file: "content/chamber-music.md", title: "Камерна музика", season: "SUMMER", description: "Соната, квартет, тріо й мистецтво ансамблевого діалогу." },
  { id: "cellists", file: "content/cellists.md", title: "Віолончелісти", season: "SUMMER", description: "Постаті, які змінили історію інструмента через звук, смак і присутність." },
  { id: "modern", file: "content/modern-styles.md", title: "Сучасні стилі", season: "AUTUMN", description: "Кросовер, кіно, електрична віолончель, цифрові медіа і нові контексти." },
  { id: "extended-techniques", file: "content/extended-techniques.md", title: "Extended Techniques", season: "AUTUMN", description: "Розширені техніки як лабораторія майбутнього звуку." },
  { id: "pedagogy", file: "content/pedagogy.md", title: "Педагогіка", season: "WINTER", description: "Навчальний канон, школа тіла, етика звуку і передача традиції." },
  { id: "diskography", file: "content/diskography.md", title: "Дискографія", season: "WINTER", description: "Запис як архів інтерпретацій, пам'ять шкіл і друга історія віолончелі." },
];

export default function App() {
  const [currentChapterId, setCurrentChapterId] = useState('history');
  const [isZenMode, setIsZenMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matrixEntries, setMatrixEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const currentChapter = useMemo(() => 
    CHAPTERS.find(c => c.id === currentChapterId) || CHAPTERS[0]
  , [currentChapterId]);

  useEffect(() => {
    fetch('src/data/matrix_details.json')
      .then(res => res.json())
      .then(data => {
        setMatrixEntries(data);
      });

    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isZenMode ? 'bg-black' : ''}`}>
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <span className="brand-subit">SUBIT</span>
            <span className="brand-atlas">ATLAS</span>
          </div>
          <div className="nav-breadcrumbs">Атлас / {currentChapter.title}</div>
          <div className="nav-actions">
            <button className={`nav-btn ${isZenMode ? 'active' : ''}`} onClick={() => setIsZenMode(!isZenMode)} title="Zen Mode">
              {isZenMode ? <Home size={18} /> : <BookOpen size={18} />}
            </button>
            <div className="search-trigger">
              <Search size={18} />
              <input type="text" placeholder="Пошук..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </nav>

      <div className="page-shell">
        <AnimatePresence>
          {!isZenMode && (
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="hero">
              <div className="hero-copy">
                <p className="eyebrow">SUBIT × CELLO</p>
                <h1 className="gradient-text">Атлас віолончелі</h1>
                <p className="hero-text">{currentChapter.description}</p>
                <div className="hero-actions">
                  <button className="button primary" onClick={() => document.getElementById('reader').scrollIntoView({behavior:'smooth'})}>Читати</button>
                  <button className="button secondary" onClick={() => document.getElementById('matrix').scrollIntoView({behavior:'smooth'})}>Матриця</button>
                </div>
              </div>
              <div className="hero-panel">
                <CelloViz entries={matrixEntries} onSelectNode={setSelectedEntry} />
                <div className="viz-overlay">
                  <div className="axis-label top">ПРОСТІР</div>
                  <div className="axis-label left">ЧАС</div>
                  <div className="axis-core">СУБ'ЄКТ</div>
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <main className={`layout ${isZenMode ? 'zen' : ''}`}>
          {!isZenMode && (
            <aside className="sidebar">
              <Sidebar chapters={CHAPTERS} currentId={currentChapterId} onSelect={setCurrentChapterId} />
            </aside>
          )}
          <section className="content">
            <Reader 
              chapter={currentChapter} 
              onNext={() => {
                const idx = CHAPTERS.findIndex(c => c.id === currentChapterId);
                if (idx < CHAPTERS.length - 1) setCurrentChapterId(CHAPTERS[idx+1].id);
              }}
              onPrev={() => {
                const idx = CHAPTERS.findIndex(c => c.id === currentChapterId);
                if (idx > 0) setCurrentChapterId(CHAPTERS[idx-1].id);
              }}
              isFirst={currentChapterId === CHAPTERS[0].id}
              isLast={currentChapterId === CHAPTERS[CHAPTERS.length-1].id}
            />
            {!isZenMode && (
              <Matrix 
                entries={matrixEntries} 
                searchQuery={searchQuery}
                onSelectChapter={setCurrentChapterId}
                onSelectEntry={setSelectedEntry}
              />
            )}
          </section>
        </main>
        {!isZenMode && (
          <footer className="site-footer">
            <div className="footer-content"><div className="footer-brand">SUBIT CELLO</div><p>Analytical Atlas of Cello Culture. 2026</p></div>
          </footer>
        )}
      </div>

      <EntryModal 
        entry={selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
        onReadChapter={(id) => { setCurrentChapterId(id); document.getElementById('reader').scrollIntoView({behavior:'smooth'}); }}
      />
    </div>
  );
}
