import { CapturedValue, StorageData } from '../types';

declare const chrome: any;

const DEFAULT_DATA: StorageData = {
  capturedValues: [],
  config: {
    excludeSecrets: true,
    autoAutocomplete: true
  }
};

export const getStorageData = async (): Promise<StorageData> => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['capturedValues', 'config'], (result: any) => {
        resolve({
          capturedValues: result.capturedValues || [],
          config: result.config || DEFAULT_DATA.config
        });
      });
    });
  }
  // Mock para dev
  const local = localStorage.getItem('jetstorage_mock');
  return local ? JSON.parse(local) : DEFAULT_DATA;
};

export const saveValue = async (val: string, sourceUrl: string): Promise<boolean> => {
  if (!val || val.trim().length < 2) return false;
  
  const data = await getStorageData();
  const exists = data.capturedValues.some(item => item.value.toLowerCase() === val.toLowerCase());
  
  if (exists) return false;

  const newValue: CapturedValue = {
    id: crypto.randomUUID(),
    value: val.trim(),
    timestamp: Date.now(),
    sourceUrl
  };

  const updatedValues = [newValue, ...data.capturedValues];

  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ capturedValues: updatedValues });
  } else {
    localStorage.setItem('jetstorage_mock', JSON.stringify({ ...data, capturedValues: updatedValues }));
  }
  
  return true;
};

export const removeValue = async (id: string) => {
  const data = await getStorageData();
  const updatedValues = data.capturedValues.filter(v => v.id !== id);
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ capturedValues: updatedValues });
  } else {
    localStorage.setItem('jetstorage_mock', JSON.stringify({ ...data, capturedValues: updatedValues }));
  }
};

export const clearAll = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ capturedValues: [] });
  } else {
    localStorage.removeItem('jetstorage_mock');
  }
};