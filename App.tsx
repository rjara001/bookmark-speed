
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bookmark } from './types';
import { getBookmarks, openBookmark } from './services/bookmarkService';
import BookmarkItem from './components/BookmarkItem';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detectar plataforma para mostrar el símbolo correcto
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const loadBookmarks = async () => {
      const data = await getBookmarks();
      setBookmarks(data);
      setLoading(false);
    };
    loadBookmarks();
    
    // Auto-enfocar el buscador al abrir
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const filteredBookmarks = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return bookmarks.slice(0, 50);
    
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(term) || 
      b.url.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [bookmarks, search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredBookmarks.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      const selected = filteredBookmarks[selectedIndex];
      if (selected) {
        openBookmark(selected.url);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 overflow-hidden" onKeyDown={handleKeyDown}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic flex-shrink-0 shadow-sm">J</div>
        <div className="relative flex-grow">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2 text-base border-none focus:ring-0 outline-none placeholder-gray-400 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-2 top-2.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Shortcut Badges */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
             <div className="flex gap-1">
                <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-gray-500 bg-gray-100 border border