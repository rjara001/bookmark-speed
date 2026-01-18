
import React from 'react';
import { Bookmark } from '../types';

interface BookmarkItemProps {
  bookmark: Bookmark;
  isSelected: boolean;
  onSelect: (url: string) => void;
  onMouseEnter: () => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, isSelected, onSelect, onMouseEnter }) => {
  // Get favicon from URL if possible
  const faviconUrl = bookmark.url 
    ? `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`
    : 'https://picsum.photos/32/32';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onClick={() => bookmark.url && onSelect(bookmark.url)}
      className={`group flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-150 border-l-4 ${
        isSelected 
          ? 'bg-blue-50 border-blue-500' 
          : 'bg-white border-transparent hover:bg-gray-50'
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
          src={faviconUrl} 
          alt="" 
          className="w-5 h-5 object-contain"
          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/32/32')}
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
            {bookmark.title}
          </span>
          {bookmark.folderPath && bookmark.folderPath.length > 0 && (
            <div className="flex items-center gap-1">
              {bookmark.folderPath.filter(p => p && p !== 'Bookmarks Bar' && p !== 'Other Bookmarks').map((folder, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider font-bold">
                  {folder}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 truncate mt-0.5">
          {bookmark.url}
        </div>
      </div>

      {isSelected && (
        <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-50 px-2 py-1 rounded border border-blue-100 animate-pulse">
          <span>PRESS ENTER</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default BookmarkItem;
