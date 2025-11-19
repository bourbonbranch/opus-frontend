import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupDirector } from '../lib/opusApi.js';

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'director',
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

    if (formData.password !== formData.confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const user = await signupDirector({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      console.log('Signup success:', user);

      // 🔹 Save the director in localStorage for later use
      try {
        localStorage.setItem('opusUser', JSON.stringify(user));
      } catch (storageErr) {
        console.warn('Could not save user to localStorage:', storageErr);
      }

      // Go to ensemble creation
      navigate('/ensembles/new');
    } catch (err) {
      console.error('Signup error:', err);
      setStatus(err.message || 'Sign up failed');
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
        padding: '2rem 1rem',
        color: 'white',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: '1.5rem',
            color: '#d1d5db',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Back
        </button>

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

        {/* Card */}
        <div
          style={{
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderRadius: 20,
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          }}
        >
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Create your account
          </h2>
          <p
            style={{
              opacity: 0.85,
              marginBottom: 20,
              fontSize: '0.9rem',
            }}
          >
            Start managing your ensemble today
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            {/* FIRST + LAST NAME */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
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
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Jane"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(30,41,59,0.7)',
                    color: 'white',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    marginBottom: 6,
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Director"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(30,41,59,0.7)',
                    color: 'white',
                  }}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem' }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jane@school.edu"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(30,41,59,0.7)',
                  color: 'white',
                }}
              />
            </div>

            {/* ROLE */}
            <div>
              <label
                style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem' }}
              >
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(30,41,59,0.7)',
                  color: 'white',
                }}
              >
                <option value="director">Director</option>
                <option value="assistant">Assistant Director</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* PASSWORD */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(30,41,59,0.7)',
                  color: 'white',
                }}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(30,41,59,0.7)',
                  color: 'white',
                }}
              />
            </div>

            {/* STATUS MESSAGE */}
            {status && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#fbbf24',
                  marginTop: '0.25rem',
                }}
              >
                {status}
              </p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 12,
                background:
                  'linear-gradient(to right, #a855f7, #3b82f6)',
                border: 'none',
                color: 'white',
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
                fontSize: '1rem',
                boxShadow: '0 20px 40px rgba(59,130,246,0.4)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p
            style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#d1d5db',
            }}
          >
            Already have an account?{' '}
            <button
              onClick={() => navigate('/director/today')}
              style={{
                background: 'none',
                border: 'none',
                color: '#c084fc',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

