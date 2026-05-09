import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Reader({ chapter, onNext, onPrev, isFirst, isLast }) {
  const [content, setContent] = useState('');
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    fetch(chapter.file)
      .then(res => res.text())
      .then(text => {
        setContent(text);
        // Basic heading extraction for TOC
        const hMatch = text.match(/^##\s+.+$/gm) || [];
        setHeadings(hMatch.map(h => h.replace(/^##\s+/, '')));
      });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter]);

  const parseMarkdown = (md) => {
    const lines = md.replace(/\r/g, "").split("\n");
    const html = [];
    let inUl = false;
    
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) { if(inUl) { html.push(<ul key={`ul-end-${i}`}></ul>); inUl = false; } return; }

      if (trimmed.startsWith("## ")) {
        const title = trimmed.slice(3);
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        html.push(<h2 key={i} id={id}>{title}</h2>);
      } else if (trimmed.startsWith("### ")) {
        const title = trimmed.slice(4);
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        html.push(<h3 key={i} id={id}>{title}</h3>);
      } else if (trimmed.startsWith("- ")) {
        if (!inUl) { inUl = true; }
        html.push(<li key={i}>{trimmed.slice(2)}</li>);
      } else {
        html.push(<p key={i}>{trimmed}</p>);
      }
    });
    return html;
  };

  return (
    <section id="reader" className="panel reader-panel">
      <div className="reader-header">
        <div className="mini-label">{chapter.season}</div>
        <h2 className="gradient-text">{chapter.title}</h2>
      </div>
      
      <div className="reader-layout">
        <motion.div 
          key={chapter.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="reader-content"
        >
          {parseMarkdown(content)}
        </motion.div>

        <aside className="reader-toc">
          <div className="toc-title">У цій главі</div>
          <ul className="toc-list">
            {headings.map((h, i) => (
              <li 
                key={i} 
                className="toc-item"
                onClick={() => {
                  const id = h.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {h}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="reader-controls">
        <button 
          className="button secondary" 
          onClick={onPrev}
          style={{ visibility: isFirst ? 'hidden' : 'visible' }}
        >
          ← Назад
        </button>
        <button 
          className="button secondary" 
          onClick={onNext}
          style={{ visibility: isLast ? 'hidden' : 'visible' }}
        >
          Далі →
        </button>
      </div>
    </section>
  );
}
