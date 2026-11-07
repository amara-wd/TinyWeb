export interface Person {
  _id: string;
  name: string;
}

export interface Site {
  _id: string;
  address: string;
  title: string;
  html?: string;
  searchableText?: string;
  authorId: Person | string;
  createdAt?: string;
}

export interface Visit {
  _id: string;
  personId: string;
  siteId: string | null;
  address: string;
  title?: string;
  method: 'typed' | 'link' | 'back' | 'forward' | 'history' | 'search';
  status: 'found' | 'not_found';
  visitedAt: string;
}

export interface SearchResult {
  _id: string;
  address: string;
  title: string;
  author: Person | null;
  score?: number;
  snippet: string;
}