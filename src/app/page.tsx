'use client';

import { useState } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

export default function Home() {
  const [url, setUrl] = useState('');
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMdxSource(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (response.ok) {
        const mdxSource = await serialize(result.analysis);
        setMdxSource(mdxSource);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while analyzing the video.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Enter YouTube Video URL for Analysis
          </h1>
          <input
            type="text"
            id="url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter YouTube URL"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Analyze
          </button>
        </form>
        {mdxSource && (
          <div className="mt-6 p-4 bg-green-100 rounded">
            <h2 className="text-2xl font-semibold text-green-800">Analysis</h2>
            <MDXRemote {...mdxSource} />
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-100 rounded">
            <h2 className="text-2xl font-semibold text-red-800">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
