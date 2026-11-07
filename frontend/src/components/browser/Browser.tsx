
'use client';

import { useEffect, useRef, useState } from 'react';

import {
  getPeople,
  getSiteByAddress,
  createVisit,
  getVisits,
} from '@/lib/api';

import type { Person, Site, Visit } from '@/types';

type NavigationMethod =
  | 'typed'
  | 'link'
  | 'back'
  | 'forward'
  | 'history'
  | 'search';

interface HistoryEntry {
  address: string;
  scrollY: number;
}

export default function Browser() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');

  const [address, setAddress] = useState('');
  const [site, setSite] = useState<Site | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [visits, setVisits] = useState<Visit[]>([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState('');
const [historyRefresh, setHistoryRefresh] = useState(0);

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Refs keep the latest navigation state available to event handlers.
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const entriesRef = useRef<HistoryEntry[]>([]);
  const currentIndexRef = useRef(-1);

  // The scroll position to restore after the next page loads.
  const pendingScrollRef = useRef(0);

  // Prevent an older, slower request from replacing a newer page.
  const navigationIdRef = useRef(0);

  // Load available people.
  useEffect(() => {
    async function loadPeople() {
      try {
        const data = await getPeople();

        setPeople(data);

        if (data.length > 0) {
          setSelectedPerson(data[0]._id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load people.',
        );
      }
    }

    loadPeople();
  }, []);
// Load browsing history for the selected person.
useEffect(() => {
  if (!selectedPerson) {
    setVisits([]);
    return;
  }

  let cancelled = false;

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const data = await getVisits(selectedPerson);

      if (!cancelled) {
        setVisits(data);
      }
    } catch (err) {
      if (!cancelled) {
        setHistoryError(
          err instanceof Error
            ? err.message
            : 'Could not load browsing history.',
        );
      }
    } finally {
      if (!cancelled) {
        setHistoryLoading(false);
      }
    }
  }

  loadHistory();

  return () => {
    cancelled = true;
  };
}, [selectedPerson, historyRefresh]);
  // Save the current page's scroll position in its stack entry.

  // Save the current page's scroll position in its stack entry.
  function saveCurrentScroll() {
    const index = currentIndexRef.current;

    if (index < 0 || !entriesRef.current[index]) {
      return;
    }

    const iframe = iframeRef.current;
    const document = iframe?.contentDocument;

    if (!iframe || !document) return;

    // Read the scroll position from the iframe's document.
    const scrollY = Math.max(
      iframe.contentWindow?.scrollY ?? 0,
      document.documentElement?.scrollTop ?? 0,
      document.body?.scrollTop ?? 0,
    );

    const updatedEntries = [...entriesRef.current];

    updatedEntries[index] = {
      ...updatedEntries[index],
      scrollY,
    };

    entriesRef.current = updatedEntries;
    setEntries(updatedEntries);

    console.log(
      'Saved scroll position:',
      entriesRef.current[index].address,
      scrollY,
    );
  }


  
  // Navigate to a website.
  async function navigate(
    targetAddress: string,
    method: NavigationMethod = 'typed',
    addToStack = true,
    restoreScroll = 0,
  ) {
    const normalizedAddress = targetAddress.trim().toLowerCase();

    if (!normalizedAddress || !selectedPerson) return;

    if (addToStack) {
      // Save the page we are leaving before creating a new entry.
      saveCurrentScroll();

      // Discard the forward branch when navigating from an older entry.
      const newEntries = [
        ...entriesRef.current.slice(0, currentIndexRef.current + 1),
        {
          address: normalizedAddress,
          scrollY: 0,
        },
      ];

      entriesRef.current = newEntries;
      setEntries(newEntries);

      const newIndex = newEntries.length - 1;

      currentIndexRef.current = newIndex;
      setCurrentIndex(newIndex);

      // New websites always start at the top.
      pendingScrollRef.current = 0;
    } else {
      // Back and Forward restore the destination's saved position.
      pendingScrollRef.current = restoreScroll;
    }

    const requestId = ++navigationIdRef.current;

    setAddress(normalizedAddress);
    setLoading(true);
    setError('');
    setSite(null);

    let loadedSite: Site | null = null;

    try {
      loadedSite = await getSiteByAddress(normalizedAddress);
    } catch (err) {
      if (requestId !== navigationIdRef.current) return;

      setError(
        err instanceof Error
          ? err.message
          : 'This website could not be found.',
      );
    }

    if (requestId !== navigationIdRef.current) return;

    setSite(loadedSite);

    // Record the visit whether the website exists or not.
   try {
  await createVisit({
    personId: selectedPerson,
    address: normalizedAddress,
    method,
  });

  // Reload the selected person's browsing history.
  setHistoryRefresh((current) => current + 1);
} catch (err) {
  console.error('Could not record browsing visit:', err);
}

    if (requestId === navigationIdRef.current) {
      setLoading(false);
    }
  }

  // Browser Back.
  function goBack() {
    if (currentIndexRef.current <= 0 || loading) return;

    // Save the current page before moving to the previous entry.
    saveCurrentScroll();

    const nextIndex = currentIndexRef.current - 1;
    const entry = entriesRef.current[nextIndex];

    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    navigate(entry.address, 'back', false, entry.scrollY);
  }

  // Browser Forward.
  function goForward() {
    if (
      currentIndexRef.current >= entriesRef.current.length - 1 ||
      loading
    ) {
      return;
    }

    // Save the current page before moving to the next entry.
    saveCurrentScroll();

    const nextIndex = currentIndexRef.current + 1;
    const entry = entriesRef.current[nextIndex];

    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    navigate(entry.address, 'forward', false, entry.scrollY);
  }


  // Change browsing identity.
  function changePerson(personId: string) {
    navigationIdRef.current++;

    setSelectedPerson(personId);

    entriesRef.current = [];
    currentIndexRef.current = -1;

    setEntries([]);
    setCurrentIndex(-1);

    setSite(null);
    setAddress('');
    setError('');
    setLoading(false);
  }

  // Intercept internal links inside the sandboxed website.
 
  // Intercept internal links and restore scroll position.
  function handleFrameLoad() {
    const iframe = iframeRef.current;
    const document = iframe?.contentDocument;

    if (!iframe || !document) return;

    const scrollY = pendingScrollRef.current;

    console.log('Restoring scroll position:', address, scrollY);

    // Wait for the iframe document to render before restoring.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const frameWindow = iframe.contentWindow;
        const scrollingElement = document.scrollingElement;

        frameWindow?.scrollTo({
          top: scrollY,
          left: 0,
          behavior: 'instant',
        });

        if (scrollingElement) {
          scrollingElement.scrollTop = scrollY;
        }

        document.documentElement.scrollTop = scrollY;
        document.body.scrollTop = scrollY;
      });
    });

    // Intercept links inside the website.
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest('a');

      if (!link) return;

      event.preventDefault();

      const href = link.getAttribute('href');

      if (!href) return;

      try {
        const url = new URL(href, `http://${address}`);

        const targetAddress = url.hostname.toLowerCase();

        if (
          url.protocol !== 'http:' &&
          url.protocol !== 'https:'
        ) {
          return;
        }

        if (!/^[a-z0-9-]+\.zz$/.test(targetAddress)) {
          return;
        }

        navigate(targetAddress, 'link');
      } catch {
        console.error('Invalid website link:', href);
      }
    });
  }


  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(address, 'typed');
  }

  return (
 <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">

      {/* Browser toolbar */}
    <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">

          <div className="mr-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              TinyWeb
            </h1>
            <p className="text-xs text-slate-500">
              Your miniature web browser
            </p>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goBack}
              disabled={currentIndex <= 0 || loading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Go back"
              title="Go back"
            >
              ←
            </button>

            <button
              type="button"
              onClick={goForward}
              disabled={
                currentIndex >= entries.length - 1 || loading
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Go forward"
              title="Go forward"
            >
              →
            </button>
          </div>

          {/* Address bar */}
          <form
            onSubmit={handleSubmit}
            className="flex min-w-0 flex-1 gap-2"
          >
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter a website address, e.g. tidepool.zz"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading || !selectedPerson}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Go
            </button>
          </form>

          {/* Browsing person */}
          <select
            value={selectedPerson}
            onChange={(event) => changePerson(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            aria-label="Select browsing person"
          >
            {people.map((person) => (
              <option key={person._id} value={person._id}>
                {person.name}
              </option>
            ))}
          </select>

        </div>
      </header>

      {/* Website viewer */}
{/* History panel and website viewer */}
<section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-4">
  <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">

    {/* Browsing history */}
    <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:w-80">

      <div className="shrink-0 border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold text-slate-800">
          Browsing History
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {visits.length} recorded visits
        </p>
      </div>

      <div className="min-h-0 max-h-64 flex-1 overflow-y-auto lg:max-h-none">

        {historyLoading && (
          <p className="p-4 text-sm text-slate-500">
            Loading history...
          </p>
        )}

        {!historyLoading && historyError && (
          <p className="p-4 text-sm text-red-600">
            {historyError}
          </p>
        )}

        {!historyLoading && !historyError && visits.length === 0 && (
          <p className="p-4 text-sm text-slate-500">
            No browsing history yet. Visit a website to get started.
          </p>
        )}

        {!historyLoading && !historyError && visits.length > 0 && (
          <div className="divide-y divide-slate-100">
            {visits.map((visit) => (
              <button
                key={visit._id}
                type="button"
                onClick={() => navigate(visit.address, 'history')}
                disabled={loading}
                className="w-full px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="break-all text-sm font-medium text-slate-800">
                    {visit.title || visit.address}
                  </span>

                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs ${
                      visit.status === 'found'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {visit.status === 'found' ? 'Found' : 'Not found'}
                  </span>
                </div>

                <p className="mt-1 break-all text-xs text-slate-500">
                  {visit.address}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400">
                  <span>
                    {new Date(visit.visitedAt).toLocaleString()}
                  </span>

                  <span className="capitalize">
                    {visit.method}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>

    {/* Website viewer */}
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      <div className="shrink-0 border-b border-slate-200 px-5 py-3">
        {site ? (
          <div>
            <h2 className="font-semibold text-slate-800">
              {site.title}
            </h2>

            <p className="text-xs text-slate-500">
              {site.address}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {loading
              ? 'Loading website...'
              : 'Enter a .zz address to start browsing.'}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white">

        {loading && (
          <div className="flex h-full min-h-[400px] items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading website...
            </p>
          </div>
        )}

        {!loading && site && (
          <iframe
            ref={iframeRef}
            key={site._id}
            title={site.title}
            srcDoc={site.html}
            sandbox="allow-same-origin"
            referrerPolicy="no-referrer"
            onLoad={handleFrameLoad}
            className="block h-full w-full border-0"
          />
        )}

        {!loading && error && (
          <div className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">
            <h2 className="text-2xl font-semibold text-slate-800">
              Website not found
            </h2>

            <p className="mt-3 max-w-md text-sm text-slate-500">
              {error}
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Check the address or try another .zz website.
            </p>
          </div>
        )}

        {!loading && !site && !error && (
          <div className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">
              Welcome to TinyWeb
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              Explore a miniature web of interconnected websites.
              Enter an address above to begin.
            </p>

            <button
              type="button"
              onClick={() => navigate('tidepool.zz')}
              className="mt-6 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
            >
              Explore Tidepool
            </button>
          </div>
        )}

      </div>
    </div>

  </div>
</section>
    </main>
  );
}
