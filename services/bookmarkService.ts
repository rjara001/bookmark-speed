
import { Bookmark } from '../types';

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
      // Evitamos añadir nombres vacíos o genéricos a la ruta
      const nextPath = node.title ? [...path, node.title] : path;
      results = results.concat(flattenBookmarks(node.children, nextPath));
    }
  }
  return results;
};

/**
 * Mock data for when running outside of a Chrome Extension environment.
 */
const MOCK_BOOKMARKS: Bookmark[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', folderPath: ['Work', 'Dev'] },
  { id: '2', title: 'Stack Overflow', url: 'https://stackoverflow.com', folderPath: ['Work', 'Dev'] },
  { id: '3', title: 'Gmail', url: 'https://mail.google.com', folderPath: ['Personal'] },
  { id: '4', title: 'YouTube', url: 'https://youtube.com', folderPath: ['Entertainment'] },
  { id: '5', title: 'Gemini AI', url: 'https://gemini.google.com', folderPath: ['AI'] },
  { id: '6', title: 'Tailwind CSS', url: 'https://tailwindcss.com', folderPath: ['Docs'] },
  { id: '7', title: 'React Documentation', url: 'https://react.dev', folderPath: ['Docs', 'Frontend'] },
  { id: '8', title: 'Netflix', url: 'https://netflix.com', folderPath: ['Entertainment'] },
];

export const getBookmarks = async (): Promise<Bookmark[]> => {
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((tree: any[]) => {
        resolve(flattenBookmarks(tree));
      });
    });
  }
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_BOOKMARKS), 300);
  });
};

export const openBookmark = (url: string, newTab: boolean = true) => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    if (newTab) {
      chrome.tabs.create({ url });
    } else {
      chrome.tabs.update({ url });
    }
    window.close();
  } else {
    window.open(url, '_blank');
  }
};
