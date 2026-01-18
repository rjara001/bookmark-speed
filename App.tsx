
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bookmark } from './types';
import { getBookmarks, openBookmark } from './services/bookmarkService';
import BookmarkItem from './components/BookmarkItem';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (err) {
        console.error('Bookmark error:', err);
        setError('Error al acceder a los marcadores de Chrome.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Asegurar el foco después de que el cargando desaparezca
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks.slice(0, 50);
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(query) || 
      (b.url && b.url.toLowerCase().includes(query))
    ).slice(0, 100);
  }, [bookmarks, searchQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (filteredBookmarks.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredBookmarks.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredBookmarks.length) % filteredBookmarks.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredBookmarks[selectedIndex];
      if (selected && selected.url) {
        openBookmark(selected.url);
      }
    } else if (e.key === 'Escape') {
      window.close();
    }
  }, [filteredBookmarks, selectedIndex]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-gray-800 font-medium">{error}</p>
        <p className="text-gray-500 text-xs mt-2">Asegúrate de haber aceptado los permisos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white shadow-2xl">
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-4 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl text-gray-800 placeholder-gray-400 text-lg outline-none transition-all"
            placeholder="Buscar marcador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-grow overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBookmarks.length > 0 ? (
          filteredBookmarks.map((bookmark, index) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              isSelected={index === selectedIndex}
              onSelect={openBookmark}
              onMouseEnter={() => setSelectedIndex(index)}
            />
          ))
        ) : (
          <div className="p-20 text-center">
            <p className="text-gray-400">Sin coincidencias</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex gap-3 text-[9px] font-bold text-gray-400 uppercase">
          <span>↑↓ Navegar</span>
          <span>↵ Enter</span>
          <span>Esc Salir</span>
        </div>
        <span className="text-[10px] text-blue-500 font-bold">{filteredBookmarks.length} Items</span>
      </div>
    </div>
  );
};

export default App;
