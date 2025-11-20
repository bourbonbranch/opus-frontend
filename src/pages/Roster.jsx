// src/pages/Roster.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRoster, addRosterMember } from '../lib/opusApi';

const Roster = () => {
  const { ensembleId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getRoster(ensembleId);
        if (isMounted) setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading roster:', err);
        if (isMounted) setError(err.message || 'Failed to load roster');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [ensembleId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ensemble_id: Number(ensembleId),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
      };

      const newMember = await addRosterMember(payload);
      setMembers((prev) => [...prev, newMember]);

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      });
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err.message || 'Failed to add member');
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
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background:
                  'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
              }}
            >
              ♪
            </div>
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  margin: 0,
                  color: '#111827',
                }}
              >
                Roster
              </h1>
              <p
                style={{
                  margin: 0,
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#6b7280',
                }}
              >
                Manage members for this ensemble
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/director/today')}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            ← Back to Today
          </button>
        </div>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              padding: '10px 12px',
              borderRadius: '6px',
              marginBottom: '16px',
              color: '#B91C1C',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Layout: form on left, list on right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)',
            gap: '24px',
          }}
        >
          {/* Add member form */}
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '12px',
                color: '#111827',
              }}
            >
              Add Member
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  Email (optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  Phone (optional)
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: saving
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                }}
              >
                {saving ? 'Adding…' : 'Add Member'}
              </button>
            </form>
          </div>

          {/* Roster list */}
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '12px',
                color: '#111827',
              }}
            >
              Current Roster
            </h2>

            {loading && <p style={{ color: '#6b7280' }}>Loading roster…</p>}

            {!loading && members.length === 0 && (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                No members yet. Add your first member on the left.
              </p>
            )}

            {!loading && members.length > 0 && (
              <div
                style={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                  }}
                >
                  <thead
                    style={{
                      background: '#f9fafb',
                      textAlign: 'left',
                    }}
                  >
                    <tr>
                      <th style={{ padding: '8px 10px' }}>Name</th>
                      <th style={{ padding: '8px 10px' }}>Email</th>
                      <th style={{ padding: '8px 10px' }}>Phone</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr
                        key={m.id}
                        style={{
                          borderTop: '1px solid #e5e7eb',
                          background: 'white',
                        }}
                      >
                        <td style={{ padding: '8px 10px' }}>
                          {m.first_name} {m.last_name}
                        </td>
                        <td style={{ padding: '8px 10px', color: '#6b7280' }}>
                          {m.email || '—'}
                        </td>
                        <td style={{ padding: '8px 10px', color: '#6b7280' }}>
                          {m.phone || '—'}
                        </td>
                        <td style={{ padding: '8px 10px', color: '#6b7280' }}>
                          {m.status || 'active'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roster;
