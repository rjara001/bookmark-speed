
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
  if (typeof chrome !== 'undefined' && chrome.bookmarks) {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((tree: any[]) => {
        resolve(flattenBookmarks(tree));
      });
    });
  }
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_BOOKMARKS), 300));
};

/**
 * Abre un marcador. 
 * Si ya está abierto en una pestaña, cambia a esa pestaña (Justifica el permiso 'tabs').
 */
export const openBookmark = async (url: string, newTab: boolean = true) => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    // Buscar si ya existe una pestaña con esta URL
    const tabs = await chrome.tabs.query({});
    const existingTab = tabs.find((t: any) => t.url === url);

    if (existingTab && existingTab.id) {
      // Si existe, hacemos foco en ella
      await chrome.tabs.update(existingTab.id, { active: true });
      if (existingTab.windowId) {
        await chrome.windows.update(existingTab.windowId, { focused: true });
      }
    } else {
      // Si no existe, abrimos nueva o actualizamos la actual
      if (newTab) {
        await chrome.tabs.create({ url });
      } else {
        await chrome.tabs.update({ url });
      }
    }
    window.close();
  } else {
    window.open(url, '_blank');
  }
};
