
import { Bookmark } from '../types';
import { getStorageData, incrementBookmarkUsage } from './storageService';

/**
 * Recursively flattens the bookmark tree provided by Chrome.
 */
const flattenBookmarks = (nodes: any[], path: string[] = []): Bookmark[] => {
  let results: Bookmark[] = [];
  for (const node of nodes) {
    if (node.url) {
      results.push({
        id: node.id,
        title: node.title || node.url,
        url: node.url,
        parentId: node.parentId,
        dateAdded: node.dateAdded,
        folderPath: path.filter(p => p && p !== 'root' && p !== 'Roots')
      });
    }
    if (node.children) {
      const nextPath = node.title ? [...path, node.title] : path;
      results = results.concat(flattenBookmarks(node.children, nextPath));
    }
  }
  return results;
};

/**
 * Mock data for development
 */
const MOCK_BOOKMARKS: Bookmark[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', folderPath: ['Work', 'Dev'] },
  { id: '2', title: 'Stack Overflow', url: 'https://stackoverflow.com', folderPath: ['Work', 'Dev'] },
  { id: '3', title: 'Gmail', url: 'https://mail.google.com', folderPath: ['Personal'] },
  { id: '5', title: 'Gemini AI', url: 'https://gemini.google.com', folderPath: ['AI'] },
  { id: '7', title: 'React Docs', url: 'https://react.dev', folderPath: ['Docs', 'Frontend'] },
];

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const storage = await getStorageData();
  const stats = storage.bookmarkStats || {};
  const shortcuts = storage.bookmarkShortcuts || {};

  let bookmarks: Bookmark[] = [];

  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    bookmarks = await new Promise((resolve) => {
      chrome.bookmarks.getTree((tree: any[]) => {
        resolve(flattenBookmarks(tree));
      });
    });
  } else {
    bookmarks = [...MOCK_BOOKMARKS];
  }

  // Merge stats, shortcuts and sort
  return bookmarks.map(b => {
    // Generate a default shortcut if not exists (first 3 chars of title)
    const defaultShortcut = b.title.toLowerCase().replace(/\s+/g, '').substring(0, 3);
    return {
      ...b,
      usageCount: stats[b.id] || 0,
      shortcut: shortcuts[b.id] || defaultShortcut
    };
  }).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
};

/**
 * Abre un marcador de forma sencilla.
 * chrome.tabs.create y update (para la pestaña actual) NO requieren el permiso "tabs".
 */
export const openBookmark = async (url: string, id?: string, newTab: boolean = true) => {
  if (id) {
    await incrementBookmarkUsage(id);
  }

  if (typeof chrome !== 'undefined' && chrome.tabs) {
    if (newTab) {
      chrome.tabs.create({ url });
    } else {
      // Actualiza la pestaña donde el usuario hizo clic en la extensión
      chrome.tabs.update({ url });
    }
    window.close();
  } else {
    window.open(url, '_blank');
  }
};
