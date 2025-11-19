import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEnsembles } from '../lib/opusApi.js';

const TodayDashboard = () => {
  const [ensembles, setEnsembles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await getEnsembles();
        // if your API returns { ensembles: [...] } instead of [...], adjust here
        setEnsembles(Array.isArray(data) ? data : data.ensembles || []);
      } catch (err) {
        setError(err.message || 'Failed to load ensembles');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(to bottom right, #111827, #4c1d95, #1d4ed8)',
        padding: '2.5rem 1rem',
        color: 'white'
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto'
        }}
      >
        {/* Top bar / "Opus" logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background:
                'linear-gradient(to bottom right, #a855f7, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              boxShadow: '0 10px 25px rgba(0,0,0,0.55)'
            }}
          >
            ♪
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 700
            }}
          >
            Opus Director
          </h1>
        </div>

        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                marginBottom: 4
              }}
            >
              Today
            </h2>
            <p
              style={{
                fontSize: '0.95rem',
                opacity: 0.9
              }}
            >
              Overview of your ensembles and activity.
            </p>
          </div>

          <Link
            to="/ensembles/new"
            style={{
              textDecoration: 'none',
              borderRadius: 999,
              padding: '0.6rem 1.3rem',
              background:
                'linear-gradient(to right, #a855f7, #3b82f6)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 12px 30px rgba(37, 99, 235, 0.55)'
            }}
          >
            + New Ensemble
          </Link>
        </div>

        {/* Main card */}
        <div
          style={{
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderRadius: 18,
            padding: '1.75rem',
            border: '1px solid rgba(148,163,184,0.4)',
            boxShadow: '0 24px 60px rgba(15,23,42,0.9)'
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: 12
            }}
          >
            Ensembles
          </h3>

          {loading && (
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Loading ensembles…</p>
          )}

          {error && !loading && (
            <p style={{ fontSize: '0.9rem', color: '#fbbf24' }}>
              {error}
            </p>
          )}

          {!loading && !error && ensembles.length === 0 && (
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              You don't have any ensembles yet.{' '}
              <Link
                to="/ensembles/new"
                style={{ color: '#93c5fd', textDecoration: 'underline' }}
              >
                Create your first ensemble.
              </Link>
            </p>
          )}

          {!loading && !error && ensembles.length > 0 && (
            <div
              style={{
                marginTop: '0.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.85rem'
              }}
            >
              {ensembles.map((ens) => (
                <div
                  key={ens.id || ens._id || ens.name}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: 12,
                    backgroundColor: '#020617',
                    border: '1px solid rgba(30,64,175,0.6)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.98rem'
                      }}
                    >
                      {ens.name}
                    </div>
                    {ens.type && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 999,
                          backgroundColor: '#1d4ed8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {ens.type}
                      </span>
                    )}
                  </div>

                  {ens.school && (
                    <div
                      style={{
                        fontSize: '0.85rem',
                        opacity: 0.9,
                        marginBottom: 2
                      }}
                    >
                      {ens.school}
                    </div>
                  )}

                  {ens.level && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        opacity: 0.75
                      }}
                    >
                      Level: {ens.level}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayDashboard;
