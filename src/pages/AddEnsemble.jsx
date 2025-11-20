// src/pages/AddEnsemble.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEnsemble } from '../lib/opusApi';

const AddEnsemble = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'choir',
    school: '',
    level: 'high-school',
    size: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const directorId = localStorage.getItem('directorId');

      if (!directorId) {
        setError('You are not signed in. Please create an account first.');
        navigate('/signup');
        return;
      }

      await createEnsemble({
        name: formData.name,
        type: formData.type,
        organization_name: formData.school || null,
        level: formData.level || null,
        size: formData.size || null,
        director_id: Number(directorId),
      });

      navigate('/director/today');
    } catch (err) {
      console.error('Create ensemble error:', err);
      setError(err.message || 'Failed to create ensemble');
    } finally {
      setSaving(false);
    }
  };

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
          maxWidth: '600px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              marginRight: '10px',
              fontSize: '18px',
              fontWeight: 700,
            }}
            aria-hidden
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

        {/* Progress indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
            color: '#666',
            fontSize: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              ✓
            </div>
            <span>Account</span>
          </div>
          <div style={{ height: 1, width: 40, background: '#e5e7eb' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              2
            </div>
            <span style={{ fontWeight: 600 }}>Ensemble</span>
          </div>
          <div style={{ height: 1, width: 40, background: '#e5e7eb' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '999px',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              3
            </div>
            <span>Dashboard</span>
          </div>
        </div>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: '800',
            margin: 0,
            color: '#333',
          }}
        >
          Create your ensemble
        </h2>
        <p style={{ color: '#666', marginTop: '6px', marginBottom: '24px' }}>
          Tell us about your choir, band, or orchestra
        </p>

        {error && (
          <div
            style={{
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              color: '#9A3412',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Ensemble Name */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 600,
                color: '#333',
                fontSize: '14px',
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
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {/* Two columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '18px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '14px',
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
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: 'white',
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
                  marginBottom: '6px',
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '14px',
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
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: 'white',
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

          {/* School or Organization */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 600,
                color: '#333',
                fontSize: '14px',
              }}
            >
              School or Organization
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="e.g., Lincoln High School"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {/* Size */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 600,
                color: '#333',
                fontSize: '14px',
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
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
                background: 'white',
              }}
            >
              <option value="">Select size</option>
              <option value="1-25">1–25 members</option>
              <option value="26-50">26–50 members</option>
              <option value="51-75">51–75 members</option>
              <option value="76-100">76–100 members</option>
              <option value="100+">100+ members</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f8fafc',
                color: '#111827',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '12px',
                background: saving
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 30px rgba(102,126,234,0.35)',
              }}
            >
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '18px', color: '#666' }}>
          You can add more ensembles later from your dashboard
        </p>
      </div>
    </div>
  );
};

export default AddEnsemble;
