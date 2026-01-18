
import { Bookmark } from '../types';

// Declare chrome global for TypeScript as it's provided by the extension environment
declare const chrome: any;

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
        folderPath: path
      });
    }
    if (node.children) {
      results = results.concat(flattenBookmarks(node.children, [...path, node.title]));
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
  // Check if we are in a Chrome extension environment
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((tree) => {
        resolve(flattenBookmarks(tree));
      });
    });
  }
  
  // Return mock data for development preview
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
    window.close(); // Close the popup/extension UI
  } else {
    // Development preview behavior
    window.open(url, '_blank');
  }
};
