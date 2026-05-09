import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Share2, ExternalLink, Award, Info, Zap } from 'lucide-react';

export default function EntryModal({ entry, onClose, onReadChapter }) {
  if (!entry) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          className="modal-content"
          onClick={e => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>

          <header className="modal-header">
            <div className="mini-label" style={{ color: 'var(--accent)', letterSpacing: '0.2em' }}>
              {entry.season} • СТАН {entry.index}
            </div>
            <h2 className="gradient-text" style={{ fontSize: '3.5rem', marginTop: '10px' }}>
              {entry.label}
            </h2>
          </header>

          <div className="modal-body">
            <section className="modal-section">
              <div className="section-head">
                <Info size={18} />
                <h3>Сутність та опис</h3>
              </div>
              <div className="modal-summary-expanded">
                <p>{entry.description}</p>
              </div>
            </section>

            <section className="modal-section">
              <div className="section-head">
                <Zap size={18} />
                <h3>Музикознавчий аналіз</h3>
              </div>
              <div className="modal-analysis">
                <p>{entry.analysis}</p>
              </div>
              <ul className="analysis-tags">
                <li>#Віолончель</li>
                <li>#Музикознавство</li>
                <li>#Історія_Звуку</li>
                <li>#Майстерність</li>
              </ul>
            </section>

            <section className="modal-section">
              <div className="section-head">
                <Award size={18} />
                <h3>Рекомендоване дослідження</h3>
              </div>
              <div className="modal-links">
                <button className="nav-btn" onClick={() => { onReadChapter('history'); onClose(); }}>
                  < BookOpen size={16} /> Глава: Історія та Еволюція
                </button>
                <button className="nav-btn" onClick={() => { onReadChapter('organology'); onClose(); }}>
                  <ExternalLink size={16} /> Глава: Органологія та Акустика
                </button>
              </div>
            </section>
          </div>

          <footer className="modal-footer">
            <button className="button secondary" onClick={onClose}>Закрити</button>
            <button className="button primary">
              <Share2 size={16} style={{marginRight: '8px'}} /> Експортувати дані
            </button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
