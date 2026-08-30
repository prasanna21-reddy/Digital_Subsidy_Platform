import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCheck, FaCheckCircle } from 'react-icons/fa';
import { authService } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();

  // Core Identity Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Identity & Banking Details
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [income, setIncome] = useState('150000');
  const [address, setAddress] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    setErrors({});
    setServerMessage('');
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid format (e.g., user@example.com)';
    }

    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number starting with 6-9';
    }

    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!aadhaarNumber.trim() || !/^\d{12}$/.test(aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
    }

    if (!income.toString().trim() || isNaN(income) || parseFloat(income) < 0) {
      newErrors.income = 'Please enter a valid positive income amount';
    }

    if (bankAccountNumber && !/^\d{9,18}$/.test(bankAccountNumber)) {
      newErrors.bankAccountNumber = 'Bank account number must be between 9 and 18 digits';
    }

    if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
    }

    if (!address.trim()) newErrors.address = 'Residential address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setServerMessage('');

    if (validate()) {
      setIsLoading(true);
      try {
        const payload = {
          fullName,
          email,
          phone,
          password,
          role: 'CITIZEN',
          aadhaarNumber,
          category,
          income: parseFloat(income) || 150000,
          address,
          bankAccountNumber,
          ifscCode
        };

        const response = await authService.register(payload);

        if (response.success || typeof response === 'string') {
          alert(`Account Registered Successfully! Please sign in.`);
          navigate('/login');
        } else {
          setServerMessage(response.error || 'Registration failed.');
        }
      } catch (error) {
        setServerMessage(error.message || 'Error saving registration details.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1rem', background: '#ffffff', minHeight: '85vh' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-submitted" style={{ marginBottom: '0.75rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
            <FaUserCheck /> Citizen Registration Portal
          </span>
          <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 800 }}>Beneficiary Account Registration</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem' }}>
            Create a beneficiary account to apply for subsidy grants.
          </p>
        </div>

        {/* Card Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)'
        }}>

          {serverMessage && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
              {serverMessage}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>

            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', fontWeight: 700 }}>
              1. Basic Account Credentials
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

              <div className="form-group">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>10-Digit Mobile Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
              </div>

            </div>

            <h3 style={{ fontSize: '1.15rem', color: '#0369a1', marginBottom: '1.25rem', borderBottom: '2px solid #bae6fd', paddingBottom: '0.5rem', fontWeight: 700 }}>
              2. Identity & DBT Direct Bank Account
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>

              <div className="form-group">
                <label>12-Digit Aadhaar Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123456789012"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                />
                {errors.aadhaarNumber && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.aadhaarNumber}</span>}
              </div>

              <div className="form-group">
                <label>Social Category *</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="GENERAL">General Category</option>
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Annual Family Income (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
                {errors.income && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.income}</span>}
              </div>

              <div className="form-group">
                <label>Bank Account Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bank account number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
                {errors.bankAccountNumber && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.bankAccountNumber}</span>}
              </div>

              <div className="form-group">
                <label>Bank IFSC Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                />
                {errors.ifscCode && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.ifscCode}</span>}
              </div>

            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Residential Address *</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.address}</span>}
            </div>

            <button
              type="submit"
              className="btn-brand"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '2rem',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)',
                color: '#ffffff'
              }}
              disabled={isLoading}
            >
              <FaCheckCircle /> {isLoading ? 'Processing Registration...' : 'Complete Beneficiary Registration'}
            </button>

          </form>

          {/* Dedicated Sign In Link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#0284c7', fontWeight: 700 }}
            >
              Sign In to Beneficiary Portal
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
