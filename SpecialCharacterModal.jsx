/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './SpecialCharacterModal.css';

const CATEGORIES = [
  { id: 'All', name: 'All' },
  { id: 'Symbol', name: 'Symbol', ranges: [[0x2190, 0x21FF], [0x2200, 0x22FF], [0x27F0, 0x27FF], [0x2900, 0x297F], [0x2980, 0x29FF], [0x2A00, 0x2AFF], [0x2B00, 0x2BFF]] },
  { id: 'Punctuation', name: 'Punctuation', ranges: [[0x0021, 0x002F], [0x003A, 0x0040], [0x005B, 0x0060], [0x007B, 0x007E], [0x00A0, 0x00BF], [0x2010, 0x2027], [0x2030, 0x205E], [0x2E00, 0x2E7F]] },
  { id: 'Letter', name: 'Letter', ranges: [[0x0041, 0x005A], [0x0061, 0x007A], [0x00C0, 0x024F], [0x0370, 0x03FF], [0x0400, 0x052F], [0x1E00, 0x1EFF]] },
  { id: 'Mark', name: 'Mark', ranges: [[0x0300, 0x036F], [0x1AB0, 0x1AFF], [0x1DC0, 0x1DFF], [0x20D0, 0x20FF], [0xFE20, 0xFE2F]] },
  { id: 'Number', name: 'Number', ranges: [[0x0030, 0x0039], [0x2070, 0x209F], [0x2150, 0x218F], [0x2460, 0x24FF]] },
  { id: 'Phonetic', name: 'Phonetic', ranges: [[0x0250, 0x02AF], [0x02B0, 0x02FF], [0x1D00, 0x1D7F]] },
  { id: 'Other', name: 'Other', ranges: [[0x20A0, 0x20CF], [0x2100, 0x214F], [0x2300, 0x23FF], [0x2500, 0x257F], [0x2580, 0x259F], [0x25A0, 0x25FF]] }
];

const isUnwantedEmojiCodePoint = (codePoint) =>
  (codePoint >= 0x2600 && codePoint <= 0x27BF) ||
  (codePoint >= 0x1F000 && codePoint <= 0x1FAFF);

const isBlankStandaloneMarkCodePoint = (codePoint) =>
  codePoint === 0x034F ||
  (codePoint >= 0x20DD && codePoint <= 0x20FF);

const isCategoryCodePoint = (categoryId, codePoint) => {
  const char = String.fromCodePoint(codePoint);
  switch (categoryId) {
    case 'Letter':
      return /\p{Letter}/u.test(char);
    case 'Mark':
      return /\p{Mark}/u.test(char);
    case 'Number':
      return /\p{Number}/u.test(char);
    case 'Phonetic':
      return /[\p{Letter}\p{Modifier_Letter}]/u.test(char);
    case 'Punctuation':
      return /\p{Punctuation}/u.test(char);
    case 'Symbol':
    case 'Other':
      return /\p{Symbol}/u.test(char);
    default:
      return true;
  }
};

const generateCharacters = () => {
  const chars = [];
  CATEGORIES.slice(1).forEach(cat => {
    cat.ranges.forEach(range => {
      for (let i = range[0]; i <= range[1]; i++) {
        if (i >= 0x007F && i <= 0x009F) continue;
        if (isUnwantedEmojiCodePoint(i)) continue;
        if (cat.id === 'Mark' && isBlankStandaloneMarkCodePoint(i)) continue;
        if (!isCategoryCodePoint(cat.id, i)) continue;
        chars.push({
          code: i.toString(16).toUpperCase().padStart(4, '0'),
          char: String.fromCodePoint(i),
          category: cat.id
        });
      }
    });
  });
  return chars;
};

const ALL_CHARACTERS = generateCharacters();
const MODAL_WIDTH = 225;
const MODAL_HEIGHT = 300;
const VIEWPORT_GAP = 10;

export default function SpecialCharacterModal({ isOpen, onClose, onInsert, position }) {
  const [searchCode, setSearchCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      setSearchCode('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  const filteredCharacters = useMemo(() => {
    let filtered = ALL_CHARACTERS;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (searchCode.trim()) {
      const codeUpper = searchCode.trim().toUpperCase();
      filtered = filtered.filter(c => c.code.includes(codeUpper));
    }
    return filtered;
  }, [selectedCategory, searchCode]);

  const groupedCharacters = useMemo(() => {
    if (selectedCategory !== 'All' && !searchCode.trim()) {
      return { [selectedCategory]: filteredCharacters };
    }
    
    const groups = {};
    filteredCharacters.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredCharacters, selectedCategory, searchCode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  let modalStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  if (position) {
    let x = position.x;
    let y = position.y;
    const footerTop = document.querySelector('.cme-popup-footer')?.getBoundingClientRect().top;
    const editorBottom = document.querySelector('.cme-mathfield-container')?.getBoundingClientRect().bottom;
    const localBottom = Number.isFinite(footerTop)
      ? footerTop
      : editorBottom;
    const bottomBoundary = Number.isFinite(localBottom)
      ? Math.min(localBottom - 6, window.innerHeight - VIEWPORT_GAP)
      : window.innerHeight - VIEWPORT_GAP;
    const height = Math.min(MODAL_HEIGHT, Math.max(188, bottomBoundary - y));
    
    // Prevent modal from overflowing the left edge
    if (x < VIEWPORT_GAP) {
      x = VIEWPORT_GAP;
    }
    // Prevent modal from overflowing the right edge
    if (x + MODAL_WIDTH > window.innerWidth - VIEWPORT_GAP) {
      x = window.innerWidth - MODAL_WIDTH - VIEWPORT_GAP;
    }
    // Keep a tall picker visible inside the available editor/viewport area.
    if (y + height > bottomBoundary) {
      y = Math.max(VIEWPORT_GAP, bottomBoundary - height);
    }
    modalStyle = { top: `${y}px`, left: `${x}px`, height: `${height}px` };
  }

  return createPortal(
    <div className="scm-overlay" onMouseDown={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="scm-modal" style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
        <div className="scm-toolbar">
          <input
            type="text"
            placeholder="Code"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="scm-code-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="scm-category-select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="scm-body">
          <div className="scm-grid-container">
            {Object.entries(groupedCharacters).map(([catName, chars]) => (
              <div key={catName} className="scm-category-group">
                <div className="scm-char-grid">
                  {chars.map(c => (
                    <button
                      key={c.code}
                      className="scm-char-btn"
                      onClick={() => { onInsert(c.char); onClose(); }}
                      title={`U+${c.code}`}
                    >
                      {c.char}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredCharacters.length === 0 && (
              <div className="scm-no-results">No characters found.</div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
