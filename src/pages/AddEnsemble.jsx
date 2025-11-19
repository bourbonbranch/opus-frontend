import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEnsemble } from '../lib/opusApi.js';

const AddEnsemble = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      await createEnsemble({ name, description });
      setStatus('Ensemble created ✅');
      navigate('/director/today');
    } catch (err) {
      setStatus(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'rgba(15,23,42,0.95)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Add Ensemble
        </h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '1rem' }}>
          Create a new ensemble for your program.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>
              Ensemble Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.4rem',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'block' }}>
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.4rem',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: 'white',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {status && (
            <p style={{ fontSize: '0.85rem', color: '#fbbf24' }}>{status}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: loading ? '#1d4ed8aa' : '#2563eb',
              color: 'white',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer'
            }}
          >
            {loading ? 'Saving…' : 'Save Ensemble'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEnsemble;

