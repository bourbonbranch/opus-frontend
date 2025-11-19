import React from 'react';
import { Link } from 'react-router-dom';

const TodayDashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        Today
      </h1>
      <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
        Simple placeholder dashboard for Opus.
      </p>

      <Link
        to="/ensembles/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: '#2563eb',
          textDecoration: 'none',
          color: 'white',
          fontWeight: 500
        }}
      >
        Add Ensemble
      </Link>
    </div>
  );
};

export default TodayDashboard;

