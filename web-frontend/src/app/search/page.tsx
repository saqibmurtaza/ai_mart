// web-frontend/src/app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        fetchResults(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchResults = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Products</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, category, etc."
        className="w-full p-2 border rounded-lg mb-6"
      />

      {loading && <p>Loading...</p>}
      {!loading && results.length === 0 && query.length >= 2 && (
        <p>No results found.</p>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((product) => (
          <li key={product._id} className="border p-4 rounded-lg shadow">
            <Link href={`/products/${product.slug}`}>
              <h2 className="text-lg font-semibold text-blue-600 hover:underline">
                {product.name}
              </h2>
              <p className="text-sm text-gray-600">{product.category}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
