import type {
  Person,
  Site,
  Visit,
  SearchResult,
} from '@/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message || `Request failed: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

// People

export function getPeople() {
  return request<Person[]>('/people');
}

// Websites

export function getSites() {
  return request<Site[]>('/sites');
}

export function getSiteByAddress(address: string) {
  return request<Site>(
    `/sites/${encodeURIComponent(address)}`,
  );
}

export function publishSite(data: {
  address: string;
  title: string;
  html: string;
  authorId: string;
}) {
  return request<Site>('/sites', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Browsing history

export function createVisit(data: {
  personId: string;
  address: string;
  method: Visit['method'];
}) {
  return request<Visit>('/visits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getVisits(personId: string) {
  return request<Visit[]>(
    `/visits/${encodeURIComponent(personId)}`,
  );
}

// Content search

export function searchSites(query: string) {
  return request<SearchResult[]>(
    `/search?q=${encodeURIComponent(query)}`,
  );
}