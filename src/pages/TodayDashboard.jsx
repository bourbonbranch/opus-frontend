// src/pages/TodayDashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEnsembles } from '../lib/opusApi';

const TodayDashboard = () => {
  const [ensembles, setEnsembles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getEnsembles();
        if (isMounted) {
          setEnsembles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error loading ensembles:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load ensembles');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
              <span className="text-xl text-white">♪</span>
            </div>
            <h1 className="text-2xl font-bold">Opus</h1>
          </div>

          <Link
            to="/add-ensemble"
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
          >
            + Add Ensemble
          </Link>
        </header>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Overview</h2>

          {loading && <p className="text-gray-300">Loading ensembles…</p>}

          {error && (
            <p className="text-red-400 font-medium mb-4">
              {error}
            </p>
          )}

          {!loading && !error && ensembles.length === 0 && (
            <p className="text-gray-300">
              You don&apos;t have any ensembles yet. Start by{' '}
              <Link
                to="/add-ensemble"
                className="text-purple-300 underline hover:text-purple-200"
              >
                creating your first ensemble
              </Link>
              .
            </p>
          )}

          {!loading && !error && ensembles.length > 0 && (
            <ul className="space-y-3">
              {ensembles.map((ensemble) => (
                <li
                  key={ensemble.id}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                >
                  <div>
                    <p className="font-medium">
                      {ensemble.name}{' '}
                      <span className="text-sm text-gray-300">
                        ({ensemble.type})
                      </span>
                    </p>
                    {ensemble.organization_name && (
                      <p className="text-sm text-gray-300">
                        {ensemble.organization_name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    Created {new Date(ensemble.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayDashboard;

