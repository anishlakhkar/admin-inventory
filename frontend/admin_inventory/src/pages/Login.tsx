import { ArrowRight, BarChart3, Eye, EyeOff, Package, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../sevices/authService';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved email if remember me was checked previously
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      console.log('[Login] Attempting to login with email:', email);
      const response = await authService.login({ email, password });
      
      console.log('[Login] ✅ Login successful:', {
        userId: response.userId,
        email: response.email,
        userTypes: response.userTypes,
        hasToken: !!localStorage.getItem('accessToken')
      });

      // Check if user is admin - only admins can access this admin panel
      if (!authService.isAdminUser(response.userTypes || [])) {
        // Clear any stored tokens/data
        authService.logout();
        setError('Access denied. This system is only accessible to administrators. Please contact your system administrator.');
        console.warn('[Login] ⚠️ Non-admin user attempted to login:', {
          email: response.email,
          userTypes: response.userTypes
        });
        return;
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Store user info for future use
      if (response.userId) {
        localStorage.setItem('userId', response.userId.toString());
      }
      if (response.email) {
        localStorage.setItem('userEmail', response.email);
      }
      if (response.userTypes && response.userTypes.length > 0) {
        localStorage.setItem('userTypes', JSON.stringify(response.userTypes));
      }

      // Navigate to dashboard (only for admin users)
      console.log('[Login] ✅ Admin user logged in, navigating to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[Login] ❌ Login failed:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        code: err.code
      });

      let errorMessage = 'Invalid email or password. Please try again.';
      
      // Handle different error scenarios
      if (err.response) {
        // Server responded with an error
        const status = err.response.status;
        const responseData = err.response.data;
        
        // Extract message from error response
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (status === 401 || status === 403) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (status === 404) {
          errorMessage = 'User not found. Please check your email address.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = responseData?.error || `Login failed (${status}). Please try again.`;
        }
      } else if (err.request) {
        // Request was made but no response received (network error)
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:9090';
      } else if (err.message) {
        // Error in request setup
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
      {/* Left Side - Purple Panel */}
      <div style={{
        width: '50%',
        backgroundColor: '#5B21B6',
        color: 'white',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }} className="hidden lg:flex">
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              BW
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>BlueWall Drugs</div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Admin and Inventory Management System
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '2.5rem',
            lineHeight: '1.3'
          }}>
            Manage Your Back Office and<br />Inventory with Ease
          </h1>

          {/* Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Feature 1 - Inventory Management */}
            <div style={{
              backgroundColor: 'rgba(139, 92, 246, 0.3)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(167, 139, 250, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Package size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '15px' }}>
                  Inventory Management
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Real-time stock tracking
                </div>
              </div>
            </div>

            {/* Feature 2 - Analytics Dashboard */}
            <div style={{
              backgroundColor: 'rgba(139, 92, 246, 0.3)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(167, 139, 250, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BarChart3 size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '15px' }}>
                  Analytics Dashboard
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Comprehensive insights
                </div>
              </div>
            </div>

            {/* Feature 3 - Compliance Ready */}
            <div style={{
              backgroundColor: 'rgba(139, 92, 246, 0.3)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(167, 139, 250, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '15px' }}>
                  Compliance Ready
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Regulatory adherence
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
          © 2026 BlueWall Drugs. All rights reserved.<br />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        width: '50%',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative'
      }} className="w-full lg:w-1/2">
        
        {/* Mobile Logo */}
        <div className="lg:hidden" style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem'
        }}>
        </div>

        {/* Login Card */}
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '2.5rem'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#171717',
                marginBottom: '0.5rem'
              }}>
                Welcome Back
              </h2>
              <p style={{ color: '#737373', fontSize: '14px' }}>Sign in to access your dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Error Message */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '2px solid #dc2626',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    color: '#991b1b',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)',
                    animation: 'fadeIn 0.3s ease-in'
                  }}
                >
                  <div style={{
                    fontSize: '20px',
                    lineHeight: '1',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    ⚠️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: '0.375rem',
                      fontSize: '15px',
                      color: '#991b1b'
                    }}>
                      Login Failed
                    </div>
                    <div style={{ 
                      color: '#dc2626', 
                      lineHeight: '1.6',
                      fontSize: '13px'
                    }}>
                      {error}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#991b1b',
                      cursor: 'pointer',
                      fontSize: '20px',
                      lineHeight: '1',
                      padding: '0',
                      flexShrink: 0,
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    aria-label="Dismiss error"
                    title="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Email Field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#404040',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (error) {
                      setError(null);
                    }
                  }}
                  placeholder="admin@bluewal.com"
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: error ? '1px solid #dc2626' : '1px solid #d4d4d4',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: loading ? '#f5f5f5' : 'white',
                    cursor: loading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#5B21B6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(91, 33, 182, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? '#dc2626' : '#d4d4d4';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <label htmlFor="password" style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#404040'
                  }}>
                    Password
                  </label>
                  <button
                    type="button"
                    style={{
                      fontSize: '13px',
                      color: '#5B21B6',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Forgot?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Clear error when user starts typing
                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem 3rem 0.75rem 1rem',
                      border: error ? '1px solid #dc2626' : '1px solid #d4d4d4',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: loading ? '#f5f5f5' : 'white',
                      cursor: loading ? 'not-allowed' : 'text'
                    }}
                    onFocus={(e) => {
                      if (!loading) {
                        e.target.style.borderColor = '#5B21B6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(91, 33, 182, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? '#dc2626' : '#d4d4d4';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#737373',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    marginRight: '0.5rem',
                    cursor: 'pointer',
                    accentColor: '#5B21B6'
                  }}
                />
                <label htmlFor="remember" style={{
                  fontSize: '13px',
                  color: '#404040',
                  cursor: 'pointer'
                }}>
                  Remember me for 30 days
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#9ca3af' : '#5B21B6',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s',
                  marginBottom: '1.25rem',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#4C1D95';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#5B21B6';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Info Box */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#d97706',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  ⚠
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <span style={{ color: '#404040' }}>Admin access only. </span>
                  <span style={{ color: '#92400e', fontWeight: '500' }}>
                    This system is restricted to administrators only. Only users with ADMIN role can login.
                  </span>
                </div>
              </div>
            </form>

            {/* Contact Admin */}
            {/* <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '13px',
              color: '#737373'
            }}>
              Don't have an account?{' '}
              <button style={{
                color: '#5B21B6',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                Contact Admin
              </button>
            </div> */}
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden" style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '12px',
            color: '#737373',
            lineHeight: '1.5'
          }}>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
