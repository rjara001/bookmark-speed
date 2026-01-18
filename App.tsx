
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bookmark } from './types';
import { getBookmarks, openBookmark } from './services/bookmarkService';
import BookmarkItem from './components/BookmarkItem';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error('Failed to load bookmarks', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Filter bookmarks based on search query
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks.slice(0, 50); // Show recent or first few when empty
    
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(query) || 
      (b.url && b.url.toLowerCase().includes(query)) ||
      (b.folderPath && b.folderPath.some(f => f.toLowerCase().includes(query)))
    );
  }, [bookmarks, searchQuery]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (filteredBookmarks.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredBookmarks.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredBookmarks.length) % filteredBookmarks.length);
        break;
      case 'Enter':
        e.preventDefault();
        const selected = filteredBookmarks[selectedIndex];
        if (selected && selected.url) {
          openBookmark(selected.url);
        }
        break;
      case 'Escape':
        // In extension context, this closes the popup
        window.close();
        break;
    }
  }, [filteredBookmarks, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const activeItem = scrollContainerRef.current?.children[selectedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-[500px] bg-white shadow-2xl overflow-hidden ring-1 ring-black/5 rounded-xl border border-gray-100">
      {/* Search Header */}
      <div className="relative flex-shrink-0 bg-white border-b border-gray-100 px-4 py-4">
        <div className="relative flex items-center">
          <svg className="absolute left-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 text-lg outline-none transition-all"
            placeholder="Search bookmarks by name, URL, or folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </div>

      {/* Results Body */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto no-scrollbar bg-white"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">Fetching your bookmarks...</p>
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
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold">No bookmarks found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term or check your browser bookmarks.</p>
          </div>
        )}
      </div>

      {/* Footer / Status Bar */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="bg-white border border-gray-300 rounded px-1 py-0.5 text-[9px] shadow-sm">↑↓</span>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-white border border-gray-300 rounded px-1 py-0.5 text-[9px] shadow-sm">↵</span>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-white border border-gray-300 rounded px-1 py-0.5 text-[9px] shadow-sm">ESC</span>
            <span>Close</span>
          </div>
        </div>
        <div>
          {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'result' : 'results'} found
        </div>
      </div>
    </div>
  );
};

export default App;
