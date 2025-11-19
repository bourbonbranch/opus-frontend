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
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Ambient background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
              <span className="text-xl text-white">♪</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Opus</h1>
          </div>

          <Link
            to="/add-ensemble"
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition shadow-md"
          >
            + Add Ensemble
          </Link>
        </header>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Today's Overview</h2>
            <span className="text-xs md:text-sm text-gray-300">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* States */}
          {loading && (
            <div className="text-gray-300">Loading ensembles…</div>
          )}

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-100 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && ensembles.length === 0 && (
            <div className="text-gray-300">
              You don't have any ensembles yet. Start by{' '}
              <Link
                to="/add-ensemble"
                className="text-purple-300 underline hover:text-purple-200"
              >
                creating your first ensemble
              </Link>
              .
            </div>
          )}

          {!loading && !error && ensembles.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ensembles.map((ensemble) => (
                <li
                  key={ensemble.id}
                  className="group bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {ensemble.name}{' '}
                        <span className="text-sm text-gray-300">
                          ({ensemble.type})
                        </span>
                      </p>
                      {ensemble.organization_name && (
                        <p className="text-sm text-gray-300 mt-1">
                          {ensemble.organization_name}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs uppercase tracking-wide text-gray-400">
                      Created{' '}
                      {new Date(ensemble.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-center text-xs text-gray-300/90">
          Tip: Click “+ Add Ensemble” to build your program and see it here.
        </p>
      </div>
    </div>
  );
};

export default TodayDashboard;
