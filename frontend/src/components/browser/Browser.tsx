
'use client';

import { useEffect, useState } from 'react';

import {
  getPeople,
  getSiteByAddress,
  createVisit,
} from '@/lib/api';

import type { Person, Site } from '@/types';

type NavigationMethod =
  | 'typed'
  | 'link'
  | 'back'
  | 'forward'
  | 'history'
  | 'search';

interface HistoryEntry {
  address: string;
}

export default function Browser() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');

  const [address, setAddress] = useState('');
  const [site, setSite] = useState<Site | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

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

  // Navigate to a website.
  async function navigate(
    targetAddress: string,
    method: NavigationMethod = 'typed',
    addToStack = true,
  ) {
    const normalizedAddress = targetAddress.trim().toLowerCase();

    if (!normalizedAddress || !selectedPerson) return;

    setAddress(normalizedAddress);
    setLoading(true);
    setError('');
    setSite(null);

    if (addToStack) {
      const newEntries = [
        ...entries.slice(0, currentIndex + 1),
        { address: normalizedAddress },
      ];

      setEntries(newEntries);
      setCurrentIndex(newEntries.length - 1);
    }

    try {
      const result = await getSiteByAddress(normalizedAddress);

      setSite(result);

      await createVisit({
        personId: selectedPerson,
        address: normalizedAddress,
        method,
      });
    } catch (err) {
      setSite(null);

      setError(
        err instanceof Error
          ? err.message
          : 'This website could not be found.',
      );

      try {
        await createVisit({
          personId: selectedPerson,
          address: normalizedAddress,
          method,
        });
      } catch {
        console.error('Could not record browsing visit.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Browser back button.
  function goBack() {
    if (currentIndex <= 0) return;

    const nextIndex = currentIndex - 1;
    setCurrentIndex(nextIndex);

    navigate(
      entries[nextIndex].address,
      'back',
      false,
    );
  }

  // Browser forward button.
  function goForward() {
    if (currentIndex >= entries.length - 1) return;

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    navigate(
      entries[nextIndex].address,
      'forward',
      false,
    );
  }

  // Change browsing identity.
  function changePerson(personId: string) {
    setSelectedPerson(personId);

    setEntries([]);
    setCurrentIndex(-1);

    setSite(null);
    setAddress('');
    setError('');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(address, 'typed');
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* Browser toolbar */}
      <header className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">

          {/* Browser name */}
          <div className="mr-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              TinyWeb
            </h1>
            <p className="text-xs text-slate-500">
              Your miniature web browser
            </p>
          </div>

          {/* Back and forward */}
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

          {/* Person selector */}
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

      {/* Main browser area */}
      <section className="mx-auto max-w-7xl px-4 py-6">

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Page information */}
          <div className="border-b border-slate-200 px-5 py-3">

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

          {/* Website viewer */}
          <div className="min-h-[600px] bg-white">

            {loading && (
              <div className="flex min-h-[600px] items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading website...
                </p>
              </div>
            )}

            {!loading && site && (
              <iframe
                key={site._id}
                title={site.title}
                srcDoc={site.html}
                sandbox=""
                referrerPolicy="no-referrer"
                className="min-h-[600px] w-full border-0"
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

      </section>

    </main>
  );
}
