
export interface Bookmark {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  dateAdded?: number;
  folderPath?: string[];
}

export enum ViewMode {
  LIST = 'LIST',
  GRID = 'GRID'
}
