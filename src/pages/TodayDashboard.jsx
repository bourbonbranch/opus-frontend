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

  // Friendlier error text for auth-related issues
  const isAuthError =
    error &&
    (error.toLowerCase().includes('director_id') ||
      error.toLowerCase().includes('sign in') ||
      error.toLowerCase().includes('create an account'));

  const friendlyError = isAuthError
    ? 'You need to create an account before viewing your ensembles.'
    : error;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '20px',
              }}
            >
              ♪
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '800',
                margin: 0,
                color: '#333',
              }}
            >
              Opus
            </h1>
          </div>

          <Link
            to="/add-ensemble"
            style={{
              padding: '10px 18px',
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              fontWeight: 600,
              fontSize: '14px',
              color: '#111827',
              textDecoration: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
            }}
          >
            + Add Ensemble
          </Link>
        </header>

        {/* Title / Date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '700',
              margin: 0,
              color: '#111827',
            }}
          >
            Today&apos;s Overview
          </h2>
          <span
            style={{
              fontSize: '13px',
              color: '#6b7280',
            }}
          >
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* Content states */}
        {loading && (
          <p
            style={{
              color: '#6b7280',
              margin: 0,
            }}
          >
            Loading ensembles…
          </p>
        )}

        {error && (
          <div
            style={{
              background: '#fee',
              border: '1px solid #fcc',
              padding: '12px',
              borderRadius: '5px',
              marginBottom: '16px',
              color: '#c33',
              fontWeight: 500,
            }}
          >
            {friendlyError}
            {isAuthError && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#7f1d1d',
                }}
              >
                <span>Go to </span>
                <Link
                  to="/signup"
                  style={{
                    color: '#b91c1c',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Sign Up
                </Link>
                <span> to create your director account.</span>
              </div>
            )}
          </div>
        )}

        {!loading && !error && ensembles.length === 0 && (
          <p
            style={{
              color: '#6b7280',
              margin: 0,
            }}
          >
            You don&apos;t have any ensembles yet. Start by{' '}
            <Link
              to="/add-ensemble"
              style={{
                color: '#667eea',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              creating your first ensemble
            </Link>
            .
          </p>
        )}

        {!loading && !error && ensembles.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ display: 'grid', gap: '15px' }}>
              <Link
                to="/rooms"
                style={{
                  display: 'block',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#111827',
                  fontWeight: '600',
                  textAlign: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
              >
                Manage Rooms & Attendance →
              </Link>
            </div>
            {ensembles.map((ensemble) => (
              <div
                key={ensemble.id}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Top info */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: '#111827',
                      }}
                    >
                      {ensemble.name}{' '}
                      <span
                        style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: 400,
                        }}
                      >
                        ({ensemble.type})
                      </span>
                    </p>
                    {ensemble.organization_name && (
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontSize: '13px',
                          color: '#4b5563',
                        }}
                      >
                        {ensemble.organization_name}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#9ca3af',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Created{' '}
                    {ensemble.created_at
                      ? new Date(ensemble.created_at).toLocaleDateString()
                      : '—'}
                  </span>
                </div>

                {/* Actions row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  {/* View roster button */}
                  <Link
                    to={`/ensembles/${ensemble.id}/roster`}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      background: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#111827',
                      textDecoration: 'none',
                    }}
                  >
                    View roster
                  </Link>

                  {/* Placeholder for future attendance feature */}
                  <button
                    type="button"
                    disabled
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'white',
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  >
                    Take attendance (coming soon)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer tip */}
        <p
          style={{
            marginTop: '24px',
            fontSize: '12px',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          Tip: Use &ldquo;+ Add Ensemble&rdquo; to build your program and see it
          appear here.
        </p>
      </div>
    </div>
  );
};

export default TodayDashboard;
