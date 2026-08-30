import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileInvoice, FaCheckCircle, FaUpload, FaArrowRight,
  FaTractor, FaGraduationCap, FaHeartbeat, FaStore, FaTools, FaIdCard, FaUserCheck
} from 'react-icons/fa';
import { schemeService } from '../services/schemeService';
import { applicationService } from '../services/applicationService';

const Apply = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [income, setIncome] = useState('150000');
  const [category, setCategory] = useState('GENERAL');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');

  // Beneficiary Type details from session/localStorage
  const beneficiaryType = localStorage.getItem('beneficiaryType') || 'FARMER';
  const rawDetails = localStorage.getItem('beneficiaryDetails');
  const specificDetails = rawDetails ? JSON.parse(rawDetails) : {};

  // Custom document options tailored per Beneficiary Type
  const getDocumentOptions = () => {
    switch (beneficiaryType) {
      case 'FARMER':
        return [
          'Land Pattadar Passbook & Khasra Record (Verified PDF)',
          'PM-KISAN Farmer Registration & Aadhaar Copy',
          'Soil Health Card & Bank Account Passbook'
        ];
      case 'STUDENT':
        return [
          'Current Semester Marksheet & Bonafide Certificate',
          'College Identity Card & Admission Fee Receipt',
          'Income Certificate & Student Bank Passbook'
        ];
      case 'SENIOR_CITIZEN':
        return [
          'Senior Citizen Identity Card & Age Proof',
          'Medical Fitness Certificate & Pension Passbook',
          'Aadhaar Card & Household Income Proof'
        ];
      case 'ENTREPRENEUR':
        return [
          'Udyam MSME Registration Certificate (Verified)',
          'Business Project Report & GST Identification',
          'Bank Statement (Last 6 Months) & PAN Card'
        ];
      case 'WORKER':
      default:
        return [
          'E-Shram Labour Smart Card & Aadhaar Verification',
          'Trade Union Membership Certificate & Bank Passbook',
          'Income Certificate & Residential Address Proof'
        ];
    }
  };

  const docOptions = getDocumentOptions();
  const [documentType, setDocumentType] = useState(docOptions[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const data = await schemeService.getSchemes();
      setSchemes(data || []);
      if (data && data.length > 0) setSelectedSchemeId(data[0].id);
    } catch (e) {
      console.error(e);
    }
  };



  const validateForm = () => {
    const newErrors = {};
    if (!aadhaarNumber.trim() || !/^\d{12}$/.test(aadhaarNumber)) {
      newErrors.aadhaar = 'Aadhaar must be exactly 12 digits (numeric)';
    }
    if (!income.trim() || parseInt(income) < 0) {
      newErrors.income = 'Please enter a valid household income';
    }
    if (!address.trim() || address.trim().length < 10) {
      newErrors.address = 'Please enter complete permanent address (min 10 chars)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const selectedScheme = schemes.find(s => String(s.id) === String(selectedSchemeId));
      const payload = {
        schemeId: selectedSchemeId || 1,
        schemeName: selectedScheme?.name || 'Government Welfare Scheme',
        beneficiaryType,
        specificDetails,
        income,
        category,
        aadhaarNumber,
        address,
        documentType
      };

      const result = await applicationService.applyForScheme(payload);

      if (result.success || result.id) {
        setSuccessMessage(`Application #APP-${result.id || '101'} submitted successfully! Your application has been sent for Field Officer review.`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBeneficiaryIcon = () => {
    switch (beneficiaryType) {
      case 'FARMER': return <FaTractor style={{ color: '#2563eb' }} />;
      case 'STUDENT': return <FaGraduationCap style={{ color: '#a855f7' }} />;
      case 'SENIOR_CITIZEN': return <FaHeartbeat style={{ color: '#ca8a04' }} />;
      case 'ENTREPRENEUR': return <FaStore style={{ color: '#059669' }} />;
      case 'WORKER': default: return <FaTools style={{ color: '#0891b2' }} />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Apply for Government Subsidy</h2>
        <p style={{ color: '#475569' }}>Complete the digital application tailored for your beneficiary profile</p>
      </div>

      {/* Beneficiary Type Banner */}
      <div style={{ maxWidth: '1050px', margin: '0 auto 1.5rem auto' }}>
        <div style={{ background: '#ffffff', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '5px solid #2563eb', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
              {getBeneficiaryIcon()}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Applicant Category Profile
              </span>
              <h4 style={{ color: '#0f172a', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
                {beneficiaryType.replace('_', ' ')} Beneficiary
              </h4>
            </div>
          </div>
          <span className="badge badge-submitted" style={{ padding: '0.4rem 0.85rem' }}>
            Profile Verified
          </span>
        </div>
      </div>

      {successMessage && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700, maxWidth: '1050px', margin: '0 auto 1.5rem auto' }}>
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '750px', margin: '0 auto' }}>

        {/* Main Application Form */}
        <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>

          <div className="form-group">
            <label htmlFor="scheme">Select Targeted Welfare Scheme</label>
            <select
              id="scheme"
              className="form-control"
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Max Amount: ₹{s.budget || s.maxAmount || '250000'})
                </option>
              ))}
            </select>
          </div>

          {/* Specific Attributes Display */}
          {Object.keys(specificDetails).length > 0 && (
            <div style={{ background: '#fffbeb', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '0.82rem', color: '#854d0e', marginBottom: '0.5rem', fontWeight: 700 }}>
                ATTACHED BENEFICIARY DETAILS:
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#334155' }}>
                {Object.entries(specificDetails).map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                    <strong style={{ color: '#0f172a' }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="aadhaar"><FaIdCard /> Aadhaar Card Number (12 Digits)</label>
            <input
              type="text"
              id="aadhaar"
              className="form-control"
              placeholder="e.g. 987654321012"
              maxLength="12"
              value={aadhaarNumber}
              onChange={(e) => { setAadhaarNumber(e.target.value); if (errors.aadhaar) setErrors({ ...errors, aadhaar: null }) }}
              required
            />
            {errors.aadhaar && <div style={{ color: '#be123c', fontSize: '0.82rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.aadhaar}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="income">Annual Household Income (₹)</label>
              <input
                type="number"
                id="income"
                className="form-control"
                value={income}
                onChange={(e) => { setIncome(e.target.value); if (errors.income) setErrors({ ...errors, income: null }) }}
                required
              />
              {errors.income && <div style={{ color: '#be123c', fontSize: '0.82rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.income}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Social Category</label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="GENERAL">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Permanent Residential Address</label>
            <textarea
              id="address"
              className="form-control"
              rows="3"
              placeholder="Enter full address as per Aadhaar Card"
              value={address}
              onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors({ ...errors, address: null }) }}
              required
            />
            {errors.address && <div style={{ color: '#be123c', fontSize: '0.82rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.address}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="docs" style={{ color: '#1d4ed8', fontWeight: 700 }}>
              <FaUpload /> Tailored Supporting Document Package ({beneficiaryType.replace('_', ' ')})
            </label>
            <select
              id="docs"
              className="form-control"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={{ borderColor: '#bfdbfe' }}
            >
              {docOptions.map((doc, idx) => (
                <option key={idx} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-brand" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem', fontWeight: 700 }} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting Application...' : `Submit Application as ${beneficiaryType.replace('_', ' ')}`} <FaArrowRight />
          </button>
        </form>

        {/* 3-Stage Verification Pipeline Info */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.75rem', fontSize: '0.88rem', color: '#475569', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <FaUserCheck style={{ color: '#2563eb', fontSize: '1.3rem', marginTop: 2, flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#0f172a', marginBottom: '0.4rem', fontSize: '0.95rem', fontWeight: 700 }}>3-Stage Verification Pipeline</h4>
            <ol style={{ paddingLeft: '1.1rem', lineHeight: '1.8', margin: 0 }}>
              <li>Field Officer conducts ground visit &amp; document review.</li>
              <li>District Officer performs secondary scrutiny.</li>
              <li>Finance Approver signs off &amp; credits bank account.</li>
            </ol>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Apply;
