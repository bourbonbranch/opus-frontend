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
        setSaving(false);
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
          maxWidth: '500px',
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333',
          }}
        >
          Create Ensemble
        </h1>
        <p
          style={{
            color: '#666',
            marginBottom: '24px',
          }}
        >
          Tell us about your choir, band, or orchestra. You can add more ensembles later.
        </p>

        {error && (
          <div
            style={{
              background: '#fee',
              border: '1px solid #fcc',
              padding: '12px',
              borderRadius: '5px',
              marginBottom: '20px',
              color: '#c33',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Ensemble Name */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
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
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
              }}
              placeholder="e.g., Varsity Choir, Wind Ensemble"
            />
          </div>

          {/* Ensemble Type */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
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
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
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

          {/* Level */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
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
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
              }}
            >
              <option value="elementary">Elementary</option>
              <option value="middle-school">Middle School</option>
              <option value="high-school">High School</option>
              <option value="college">College/University</option>
              <option value="community">Community</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {/* School or Organization */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
              }}
            >
              School or Organization
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
              }}
              placeholder="e.g., Lincoln High School"
            />
          </div>

          {/* Size */}
          <div style={{ marginBottom: '30px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#333',
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
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
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

          {/* Primary button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              background: saving
                ? '#999'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving Ensemble...' : 'Save Ensemble & Continue'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            color: '#666',
          }}
        >
          Want to change your account details?{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Edit account
          </button>
        </p>
      </div>
    </div>
  );
};

export default AddEnsemble;
