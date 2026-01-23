
// Declaración global para evitar errores de 'chrome is not defined' en TS
declare global {
  const chrome: any;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  dateAdded?: number;
  folderPath?: string[];
}

/**
 * Fix: Added missing CapturedValue interface used for data persistence
 */
export interface CapturedValue {
  id: string;
  value: string;
  timestamp: number;
  sourceUrl: string;
}

/**
 * Fix: Added missing StorageData interface representing the local storage schema
 */
export interface StorageData {
  capturedValues: CapturedValue[];
  config: {
    excludeSecrets: boolean;
    autoAutocomplete: boolean;
  };
}
