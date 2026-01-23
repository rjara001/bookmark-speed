
// Declaración global para evitar errores de 'chrome is not defined' en TS
declare var chrome: any;

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  dateAdded?: number;
  folderPath?: string[];
}

// Fix: Added CapturedValue interface required by storageService.ts
export interface CapturedValue {
  id: string;
  value: string;
  timestamp: number;
  sourceUrl: string;
}

// Fix: Added StorageData interface required by storageService.ts
export interface StorageData {
  capturedValues: CapturedValue[];
  config: {
    excludeSecrets: boolean;
    autoAutocomplete: boolean;
  };
}
