
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
 * Interface representing a value captured from an input field
 */
export interface CapturedValue {
  id: string;
  value: string;
  timestamp: number;
  sourceUrl: string;
}

/**
 * Configuration settings for the storage service
 */
export interface StorageConfig {
  excludeSecrets: boolean;
  autoAutocomplete: boolean;
}

/**
 * Root structure for storage data
 */
export interface StorageData {
  capturedValues: CapturedValue[];
  config: StorageConfig;
}
