import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEnsemble } from '../lib/opusApi.js';

const AddEnsemble = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'choir',
    school: '',
    level: 'high-school',
    size: '',
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      await createEnsemble({
        name: formData.name,
        type: formData.type,
        school: formData.school,
        level: formData.level,
        size: formData.size,
      });
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
        background:
          'linear-gradient(to bottom right, #111827, #4c1d95, #1d4ed8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: 'white',
      }}
    >
      <div style={{ width: '100%', maxWidth: 700 }}>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.75rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background:
                'linear-gradient(to bottom right, #a855f7, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            ♪
          </div>
          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: 700,
              textShadow: '0 4px 10px rgba(0,0,0,0.6)',
            }}
          >
            Opus
          </h1>
        </div>

        {/* Progress */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.75rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background:
                  'linear-gradient(to right, #a855f7, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <span style={{ opacity: 0.8 }}>Account</span>
          </div>
          <div
            style={{ width: 50, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background:
                  'linear-gradient(to right, #a855f7, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              2
            </div>
            <span style={{ fontWeight: 600 }}>Ensemble</span>
          </div>
          <div
            style={{ width: 50, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              3
            </div>
            <span style={{ color: '#9ca3af' }}>Dashboard</span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'rgba(15,23,42,0.9)',
            borderRadius: 18,
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>
            Create your ensemble
          </h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.85, marginBottom: 20 }}>
            Tell us about your choir, band, or orchestra.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'grid', gap: '1rem' }}
          >
            {/* Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  marginBottom: 6,
                }}
              >
                Ensemble Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Varsity Choir, Concert Band"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(15,23,42,0.8)',
                  color: 'white',
                  outline: 'none',
                }}
              />
            </div>

            {/* Type + Level */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(0,1fr))',
                gap: '0.9rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    marginBottom: 6,
                  }}
                >
                  Ensemble Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(15,23,42,0.8)',
                    color: 'white',
                    outline: 'none',
                  }}
                >
                  <option value="choir">Choir</option>
                  <option value="band">Band</option>
                  <option value="orchestra">Orchestra</option>
                  <option value="jazz-band">Jazz Band</option>
                  <option value="marching-band">Marching Band</option>
                  <option value="chamber">Chamber Ensemble</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    marginBottom: 6,
                  }}
                >
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(15,23,42,0.8)',
                    color: 'white',
                    outline: 'none',
                  }}
                >
                  <option value="elementary">Elementary</option>
                  <option value="middle-school">Middle School</option>
                  <option value="high-school">High School</option>
                  <option value="college">College</option>
                  <option value="community">Community</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>

            {/* School */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  marginBottom: 6,
                }}
              >
                School or Organization
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                required
                placeholder="e.g., Lincoln High School"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(15,23,42,0.8)',
                  color: 'white',
                  outline: 'none',
                }}
              />
            </div>

            {/* Size */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  marginBottom: 6,
                }}
              >
                Approximate Size
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(15,23,42,0.8)',
                  color: 'white',
                  outline: 'none',
                }}
              >
                <option value="">Select size</option>
                <option value="1-25">1-25 members</option>
                <option value="26-50">26-50 members</option>
                <option value="51-75">51-75 members</option>
                <option value="76-100">76-100 members</option>
                <option value="100+">100+ members</option>
              </select>
            </div>

            {status && (
              <p style={{ fontSize: '0.85rem', color: '#fbbf24' }}>{status}</p>
            )}

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                paddingTop: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.25)',
                  backgroundColor: 'rgba(15,23,42,0.7)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: 'none',
                  background:
                    'linear-gradient(to right, #a855f7, #3b82f6)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: loading ? 'default' : 'pointer',
                  boxShadow: '0 14px 35px rgba(59,130,246,0.6)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Saving…' : 'Continue'}
              </button>
            </div>
          </form>
        </div>

        <p
          style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#9ca3af',
          }}
        >
          You can add more ensembles later from your dashboard.
        </p>
      </div>
    </div>
  );
};

export default AddEnsemble;
