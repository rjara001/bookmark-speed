export interface Bookmark {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  dateAdded?: number;
  folderPath?: string[];
}

export interface CapturedValue {
  id: string;
  value: string;
  timestamp: number;
  sourceUrl: string;
}

export interface StorageData {
  capturedValues: CapturedValue[];
  config: {
    excludeSecrets: boolean;
    autoAutocomplete: boolean;
  };
}