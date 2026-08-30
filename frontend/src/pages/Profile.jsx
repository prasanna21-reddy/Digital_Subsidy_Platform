import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaIdBadge, FaUserCircle, FaEnvelope, FaPhone, FaAward } from 'react-icons/fa';
import '../styles/Dashboard.css';
import { beneficiaryService } from '../services/beneficiaryService';

function ProfileDetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid #e2e8f0' }}>
      <span style={{ color: '#64748b', fontWeight: '500' }}>{label}</span>
      <span style={{ color: '#0f172a', fontWeight: '700' }}>{value || 'N/A'}</span>
    </div>
  );
}

const Profile = () => {
  const userRole = localStorage.getItem('userRole') || 'CITIZEN';
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const beneficiaryType = localStorage.getItem('beneficiaryType') || '';

  const rawDetails = localStorage.getItem('beneficiaryDetails');
  const specificDetails = rawDetails ? JSON.parse(rawDetails) : {};

  const isOfficer = userRole !== 'CITIZEN';

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editPhone, setEditPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await beneficiaryService.getProfile();
      if (data) {
        setProfileData(data);
        if (data.phone) setEditPhone(data.phone);
        if (data.email) setEditEmail(data.email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!editEmail) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editEmail)) {
      newErrors.email = "Invalid email format";
    }

    if (!editPhone) {
      newErrors.phone = "Phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await beneficiaryService.updateProfile({ email: editEmail, phone: editPhone });
        if (response && response.success !== false) {
          localStorage.setItem('userEmail', editEmail);
          setIsEditing(false);
          fetchProfile();
        }
      } catch (error) {
        console.error("Update failed", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="dashboard animate-fade-in" style={{ padding: '2rem', background: '#ffffff', minHeight: '80vh' }}>

      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#0f172a', fontWeight: 800 }}>Account Profile</h2>
        <p style={{ color: '#475569' }}>Manage your portal identity and direct benefit transfer details</p>
      </div>

      <div className="dashboard-content-grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>

        {/* Left Column - User Overview */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <FaUserCircle style={{ fontSize: '6rem', color: isOfficer ? '#059669' : '#2563eb', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 700 }}>{userName}</h3>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span className="badge badge-submitted" style={{ padding: '0.4rem 0.85rem' }}>
              {userRole.replace('_', ' ')}
            </span>
            {!isOfficer && beneficiaryType && (
              <span className="badge badge-approved" style={{ padding: '0.4rem 0.85rem' }}>
                <FaAward /> {beneficiaryType.replace('_', ' ')}
              </span>
            )}
          </div>

          <div style={{ width: '100%', marginTop: '1rem', textAlign: 'left' }}>
            {isEditing ? (
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Email</label>
                  <input className="form-control" value={editEmail} onChange={(e) => { setEditEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }} />
                  {errors.email && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.email}</span>}
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Phone</label>
                  <input className="form-control" value={editPhone} onChange={(e) => { setEditPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }} />
                  {errors.phone && <span style={{ color: '#be123c', fontSize: '0.8rem' }}>{errors.phone}</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-brand" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => { setIsEditing(false); setErrors({}); }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#475569' }}>
                  <FaEnvelope style={{ marginRight: '10px', color: '#2563eb' }} />
                  <span>{userEmail || 'No email provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#475569' }}>
                  <FaPhone style={{ marginRight: '10px', color: '#2563eb' }} />
                  <span>{editPhone || 'No phone provided'}</span>
                </div>
                <button className="btn-outline" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} onClick={() => setIsEditing(true)}>Edit Contact Info</button>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Real Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {isOfficer ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#059669', fontWeight: 700 }}>
                <FaIdBadge style={{ marginRight: '10px' }} /> Official Employment Credentials
              </h3>
              <ProfileDetailRow label="Officer Designation" value={userRole.replace('_', ' ')} />
              <ProfileDetailRow label="Official Email" value={userEmail} />
              <ProfileDetailRow label="Department" value="Government Subsidy Administration" />
              <ProfileDetailRow label="Authorization Status" value="Active Verification Clearance" />
            </div>
          ) : (
            <>
              {/* Beneficiary Specific Category Details */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#1d4ed8', fontWeight: 700 }}>
                  <FaAward style={{ marginRight: '10px' }} /> {beneficiaryType ? beneficiaryType.replace('_', ' ') : 'BENEFICIARY'} Attributes
                </h3>
                {Object.keys(specificDetails).length > 0 ? (
                  Object.entries(specificDetails).map(([k, v]) => (
                    <ProfileDetailRow key={k} label={k.replace(/([A-Z])/g, ' $1').toUpperCase()} value={String(v)} />
                  ))
                ) : (
                  <ProfileDetailRow label="Beneficiary Type" value={beneficiaryType ? beneficiaryType.replace('_', ' ') : 'CITIZEN'} />
                )}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#1d4ed8', fontWeight: 700 }}>
                  <FaUser style={{ marginRight: '10px' }} /> Profile Information
                </h3>
                <ProfileDetailRow label="Account Holder" value={userName} />
                <ProfileDetailRow label="Registered Email" value={userEmail} />
                <ProfileDetailRow label="Aadhaar Verification" value={profileData?.aadhaarNumber ? `Aadhaar ending in ****${profileData.aadhaarNumber.slice(-4)}` : 'Submitted upon applying'} />
                <ProfileDetailRow label="Income Bracket" value={profileData?.annualIncome ? `₹${profileData.annualIncome}` : 'Submitted upon applying'} />
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#1d4ed8', fontWeight: 700 }}>
                  <FaBuilding style={{ marginRight: '10px' }} /> Direct Benefit Transfer Bank Details
                </h3>
                <ProfileDetailRow label="Bank Account" value={profileData?.bankAccountNumber ? `****${profileData.bankAccountNumber.slice(-4)}` : 'Submitted upon applying'} />
                <ProfileDetailRow label="IFSC Code" value={profileData?.ifscCode || 'Submitted upon applying'} />
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
