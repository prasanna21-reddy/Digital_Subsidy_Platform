import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaFileInvoice, FaCheckCircle, FaUpload, FaArrowRight,
  FaTractor, FaGraduationCap, FaStore, FaTools, FaIdCard,
  FaUserCheck, FaBuilding, FaLeaf, FaWrench, FaBookOpen,
  FaChevronDown, FaInfoCircle
} from 'react-icons/fa';
import { schemeService } from '../services/schemeService';
import { applicationService } from '../services/applicationService';
import { beneficiaryService } from '../services/beneficiaryService';

/* ─────────────────────────────────────────
   Scheme-type detection based on name / category
   ───────────────────────────────────────── */
const detectSchemeType = (scheme) => {
  if (!scheme) return 'GENERAL';
  const text = `${scheme.name} ${scheme.category} ${scheme.description || ''}`.toLowerCase();

  if (/farm|kisan|agricultur|crop|land|equipment|tractor|soil|irrigation/i.test(text)) return 'FARMER';
  if (/education|student|scholarship|college|university|course|tuition|school/i.test(text)) return 'STUDENT';
  if (/business|msme|entrepreneur|startup|enterprise|udyam|trade|commerce/i.test(text)) return 'BUSINESS';
  if (/housing|awas|home|shelter|construction|residential/i.test(text)) return 'HOUSING';
  if (/health|medical|welfare|disability|pension|senior/i.test(text)) return 'WELFARE';
  return 'GENERAL';
};

/* ─────────────────────────────────────────
   Scheme-type → specific fields config
   ───────────────────────────────────────── */
const SCHEME_FIELDS = {
  FARMER: {
    label: 'Farmer / Agriculture Scheme',
    icon: <FaTractor />,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    fields: [
      { id: 'landHolding', label: 'Landholding Area (in Acres)', type: 'text', placeholder: 'e.g. 2.5 acres', required: true },
      { id: 'surveyNumber', label: 'Survey / Khasra Number', type: 'text', placeholder: 'e.g. SY-204/B', required: true },
      { id: 'cropDetails', label: 'Crop Details (current season)', type: 'text', placeholder: 'e.g. Paddy, Wheat, Cotton', required: true },
      { id: 'equipmentRequired', label: 'Equipment / Machinery Required', type: 'text', placeholder: 'e.g. Power Tiller, Sprayer', required: true },
      { id: 'equipmentCost', label: 'Estimated Equipment Cost (₹)', type: 'number', placeholder: 'e.g. 85000', required: true },
    ],
    docs: [
      'Land Pattadar Passbook & Khasra Record (Verified PDF)',
      'PM-KISAN Farmer Registration & Aadhaar Copy',
      'Soil Health Card & Bank Account Passbook',
    ],
  },
  STUDENT: {
    label: 'Education / Scholarship Scheme',
    icon: <FaGraduationCap />,
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#e9d5ff',
    fields: [
      { id: 'institutionName', label: 'College / Institution Name', type: 'text', placeholder: 'e.g. Osmania University', required: true },
      { id: 'courseName', label: 'Course / Programme', type: 'text', placeholder: 'e.g. B.Tech (CSE)', required: true },
      { id: 'yearOfStudy', label: 'Year of Study', type: 'select', options: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'], required: true },
      { id: 'courseFee', label: 'Annual Course Fee (₹)', type: 'number', placeholder: 'e.g. 75000', required: true },
      { id: 'studentId', label: 'Student ID / Enrollment Number', type: 'text', placeholder: 'e.g. 22BCE1004', required: true },
    ],
    docs: [
      'Current Semester Marksheet & Bonafide Certificate',
      'College Identity Card & Admission Fee Receipt',
      'Income Certificate & Student Bank Passbook',
    ],
  },
  BUSINESS: {
    label: 'Business / MSME Development Scheme',
    icon: <FaStore />,
    color: '#0891b2',
    bg: '#f0fdff',
    border: '#a5f3fc',
    fields: [
      { id: 'businessName', label: 'Business / Enterprise Name', type: 'text', placeholder: 'e.g. Sri Lakshmi Traders', required: true },
      { id: 'businessType', label: 'Business Type', type: 'select', options: ['Sole Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Self-Help Group', 'Cooperative'], required: true },
      { id: 'registrationNumber', label: 'Registration / Udyam Number', type: 'text', placeholder: 'e.g. UDYAM-AP-01-0012345', required: true },
      { id: 'businessAddress', label: 'Business Address', type: 'textarea', placeholder: 'Full registered business address', required: true },
      { id: 'investmentRequired', label: 'Investment Required (₹)', type: 'number', placeholder: 'e.g. 200000', required: true },
      { id: 'businessPlan', label: 'Business Plan Summary', type: 'textarea', placeholder: 'Brief description of the project / expansion', required: false },
    ],
    docs: [
      'Udyam MSME Registration Certificate (Verified)',
      'Business Project Report & GST Identification',
      'Bank Statement (Last 6 Months) & PAN Card',
    ],
  },
  HOUSING: {
    label: 'Housing / Shelter Scheme',
    icon: <FaBuilding />,
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    fields: [
      { id: 'plotNumber', label: 'Plot / Survey Number', type: 'text', placeholder: 'e.g. Plot No. 42-B', required: true },
      { id: 'houseType', label: 'Type of House Required', type: 'select', options: ['New Construction', 'Renovation/Upgrade', 'Kutcha to Pucca Upgrade'], required: true },
      { id: 'estimatedCost', label: 'Estimated Construction Cost (₹)', type: 'number', placeholder: 'e.g. 150000', required: true },
      { id: 'landOwnership', label: 'Land Ownership Document Reference', type: 'text', placeholder: 'e.g. Pattadar No. 1234', required: true },
    ],
    docs: [
      'Land Ownership / Pattadar Passbook',
      'Municipal/Gram Panchayat Approval & Site Map',
      'Aadhaar Card & Income Certificate',
    ],
  },
  WELFARE: {
    label: 'Welfare / Pension Scheme',
    icon: <FaTools />,
    color: '#dc2626',
    bg: '#fff1f2',
    border: '#fecdd3',
    fields: [
      { id: 'disabilityType', label: 'Category / Condition', type: 'select', options: ['Senior Citizen (60+)', 'Differently Abled', 'Widow', 'Below Poverty Line', 'Other'], required: true },
      { id: 'pensionAccount', label: 'Existing Pension Account (if any)', type: 'text', placeholder: 'Pension ID or N/A', required: false },
      { id: 'dependents', label: 'Number of Dependents', type: 'number', placeholder: 'e.g. 3', required: true },
    ],
    docs: [
      'Senior Citizen / Disability Certificate (Competent Authority)',
      'Medical Certificate & Pension Passbook (if any)',
      'Aadhaar Card & Household Income Proof',
    ],
  },
  GENERAL: {
    label: 'General Welfare Scheme',
    icon: <FaLeaf />,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    fields: [
      { id: 'purposeOfGrant', label: 'Purpose / Use of Grant', type: 'textarea', placeholder: 'Describe how you will use this subsidy', required: true },
      { id: 'estimatedAmount', label: 'Estimated Amount Required (₹)', type: 'number', placeholder: 'e.g. 50000', required: true },
    ],
    docs: [
      'Identity Proof (Aadhaar / Voter ID / PAN)',
      'Income Certificate from Competent Authority',
      'Bank Passbook & Address Proof',
    ],
  },
};

/* ─────────────────────────────────────────
   Apply Component
   ───────────────────────────────────────── */
const Apply = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedSchemeId = location.state?.schemeId || new URLSearchParams(location.search).get('schemeId');

  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeType, setSchemeType] = useState('GENERAL');

  // Common fields
  const [beneficiaryName, setBeneficiaryName] = useState(localStorage.getItem('userName') || '');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [income, setIncome] = useState('');
  const [socialCategory, setSocialCategory] = useState('GENERAL');

  // Specific field values (dynamic)
  const [specificValues, setSpecificValues] = useState({});
  const [docChecks, setDocChecks] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSchemes();
    loadBeneficiaryProfile();
  }, []);

  const loadBeneficiaryProfile = async () => {
    try {
      const profile = await beneficiaryService.getProfile();
      if (!profile) return;

      if (profile.aadhaarNumber) setAadhaarNumber(profile.aadhaarNumber);
      if (profile.phone) setMobile(profile.phone);
      if (profile.address) setAddress(profile.address);
      if (profile.bankAccountNumber) setBankAccount(profile.bankAccountNumber);
      if (profile.ifscCode) setIfscCode(profile.ifscCode);
      if (profile.annualIncome != null) setIncome(String(profile.annualIncome));
      if (profile.socialCategory) setSocialCategory(profile.socialCategory.toUpperCase());
      if (localStorage.getItem('userName')) setBeneficiaryName(localStorage.getItem('userName'));
    } catch (error) {
      console.warn('Profile prefill unavailable; using blank form values', error);
    }
  };

  const fetchSchemes = async () => {
    try {
      const data = await schemeService.getSchemes();
      setSchemes(data || []);
      if (data && data.length > 0) {
        const matched = preSelectedSchemeId
          ? data.find(s => String(s.id) === String(preSelectedSchemeId))
          : null;
        const target = matched || data[0];
        setSelectedSchemeId(String(target.id));
        setSelectedScheme(target);
        const type = detectSchemeType(target);
        setSchemeType(type);
        // Initialise all doc checkboxes as unchecked
        const initChecks = {};
        (SCHEME_FIELDS[type]?.docs || []).forEach((_, i) => { initChecks[i] = false; });
        setDocChecks(initChecks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSchemeChange = (e) => {
    const id = e.target.value;
    setSelectedSchemeId(id);
    const scheme = schemes.find(s => String(s.id) === String(id));
    setSelectedScheme(scheme);
    const type = detectSchemeType(scheme);
    setSchemeType(type);
    setSpecificValues({});
    // Re-initialise doc checkboxes for new scheme type
    const initChecks = {};
    (SCHEME_FIELDS[type]?.docs || []).forEach((_, i) => { initChecks[i] = false; });
    setDocChecks(initChecks);
    setErrors({});
  };

  const handleSpecificChange = (fieldId, value) => {
    setSpecificValues(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!beneficiaryName.trim()) errs.beneficiaryName = 'Name is required';
    if (!/^\d{12}$/.test(aadhaarNumber)) errs.aadhaarNumber = 'Aadhaar must be exactly 12 digits';
    if (!/^\d{10}$/.test(mobile)) errs.mobile = 'Mobile must be exactly 10 digits';
    if (!address.trim() || address.trim().length < 10) errs.address = 'Please enter complete address (min 10 chars)';
    if (!bankAccount.trim()) errs.bankAccount = 'Bank account number is required';
    if (!ifscCode.trim()) errs.ifscCode = 'IFSC code is required';
    if (!income || parseInt(income) < 0) errs.income = 'Please enter annual household income';

    // Validate scheme-specific required fields
    const config = SCHEME_FIELDS[schemeType];
    if (config) {
      config.fields.forEach(f => {
        if (f.required && !specificValues[f.id]?.toString().trim()) {
          errs[f.id] = `${f.label} is required`;
        }
      });
      // All document checkboxes must be ticked
      const allChecked = config.docs.every((_, i) => docChecks[i]);
      if (!allChecked) errs.docs = 'Please confirm you have all required documents';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      // scroll to first error
      const firstErrEl = document.querySelector('.field-error');
      if (firstErrEl) firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        schemeId: selectedSchemeId,
        schemeName: selectedScheme?.name || 'Government Welfare Scheme',
        userEmail: localStorage.getItem('userEmail'),
        beneficiaryName,
        aadhaarNumber,
        mobile,
        address,
        bankAccount,
        ifscCode,
        income,
        socialCategory,
        documentType: typeConfig.docs.filter((_, i) => docChecks[i]).join(' | '),
        schemeType,
        specificDetails: specificValues,
      };

      const result = await applicationService.applyForScheme(payload);
      if (result.success || result.id) {
        setSuccessMessage(`Application #APP-${result.id || '101'} submitted! Sent for Field Officer review.`);
        setTimeout(() => navigate('/dashboard'), 2500);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeConfig = SCHEME_FIELDS[schemeType] || SCHEME_FIELDS.GENERAL;
  const maskedAadhaar = aadhaarNumber.length === 12
    ? 'XXXX XXXX ' + aadhaarNumber.slice(8)
    : '';
  const maskedBank = bankAccount.length > 4
    ? 'XXXX XXXX ' + bankAccount.slice(-4)
    : '';

  // ── Render a dynamic field ──
  const renderField = (f) => {
    const val = specificValues[f.id] || '';
    const err = errors[f.id];
    return (
      <div className="form-group" key={f.id}>
        <label htmlFor={f.id} style={{ fontWeight: 600, color: '#334155' }}>{f.label}</label>
        {f.type === 'select' ? (
          <select
            id={f.id}
            className="form-control"
            value={val}
            onChange={e => handleSpecificChange(f.id, e.target.value)}
          >
            <option value="">— Select —</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : f.type === 'textarea' ? (
          <textarea
            id={f.id}
            className="form-control"
            rows="2"
            placeholder={f.placeholder}
            value={val}
            onChange={e => handleSpecificChange(f.id, e.target.value)}
          />
        ) : (
          <input
            id={f.id}
            type={f.type}
            className="form-control"
            placeholder={f.placeholder}
            value={val}
            onChange={e => handleSpecificChange(f.id, e.target.value)}
          />
        )}
        {err && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{err}</div>}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem 0', background: '#f8fafc', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Apply for Government Subsidy</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Select a scheme — the form will automatically load the relevant fields for that scheme type.</p>
      </div>

      {successMessage && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#047857', padding: '1.1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700, maxWidth: '780px', margin: '0 auto 1.5rem' }}>
          <FaCheckCircle style={{ marginRight: 8 }} />{successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Scheme Selector ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
            <FaFileInvoice style={{ color: '#0284c7', marginRight: 8 }} />Step 1 — Select Scheme
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1rem' }}>Choose the scheme you want to apply for. Fields will update automatically.</p>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="scheme">Welfare Scheme</label>
            <div style={{ position: 'relative' }}>
              <select
                id="scheme"
                className="form-control"
                value={selectedSchemeId}
                onChange={handleSchemeChange}
                style={{ paddingRight: '2.5rem', appearance: 'none' }}
              >
                {schemes.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Max ₹{(s.budget || s.maxAmount || 0).toLocaleString()}
                  </option>
                ))}
              </select>
              <FaChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Scheme type badge */}
          {selectedScheme && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.1rem', background: typeConfig.bg, border: `1px solid ${typeConfig.border}`, borderRadius: '10px' }}>
              <span style={{ fontSize: '1.4rem', color: typeConfig.color }}>{typeConfig.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: typeConfig.color, fontSize: '0.92rem' }}>{typeConfig.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{selectedScheme.description || selectedScheme.eligibilityCriteria || 'Scheme-specific fields loaded below'}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Scheme-Specific Fields ── */}
        {typeConfig.fields.length > 0 && (
          <div style={{ background: '#fff', border: `2px solid ${typeConfig.border}`, borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: typeConfig.color, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>{typeConfig.icon}</span>
              Step 2 — {typeConfig.label} Details
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Scheme-specific information required for this application.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0 1.25rem' }}>
              {typeConfig.fields.map(f => renderField(f))}
            </div>
          </div>
        )}

        {/* ── Common Fields ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
            <FaIdCard style={{ color: '#0284c7', marginRight: 8 }} />Step 3 — Personal & Banking Details
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Common details required for all scheme applications.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.25rem' }}>
            {/* Beneficiary Name */}
            <div className="form-group">
              <label htmlFor="beneficiaryName">Full Name (as per Aadhaar)</label>
              <input id="beneficiaryName" type="text" className="form-control" placeholder="e.g. Srinivas Rao" value={beneficiaryName} onChange={e => { setBeneficiaryName(e.target.value); if (errors.beneficiaryName) setErrors(p => ({ ...p, beneficiaryName: null })); }} />
              {errors.beneficiaryName && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.beneficiaryName}</div>}
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input id="mobile" type="text" className="form-control" placeholder="10-digit mobile number" maxLength="10" value={mobile} onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); if (errors.mobile) setErrors(p => ({ ...p, mobile: null })); }} />
              {errors.mobile && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.mobile}</div>}
            </div>

            {/* Aadhaar */}
            <div className="form-group">
              <label htmlFor="aadhaar">Aadhaar Card Number (12 Digits)</label>
              <input id="aadhaar" type="text" className="form-control" placeholder="e.g. 987654321012" maxLength="12" value={aadhaarNumber} onChange={e => { setAadhaarNumber(e.target.value.replace(/\D/g, '')); if (errors.aadhaarNumber) setErrors(p => ({ ...p, aadhaarNumber: null })); }} />
              {maskedAadhaar && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>Will be stored as: <strong>{maskedAadhaar}</strong></div>}
              {errors.aadhaarNumber && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.aadhaarNumber}</div>}
            </div>

            {/* Social Category */}
            <div className="form-group">
              <label htmlFor="socialCat">Social Category</label>
              <select id="socialCat" className="form-control" value={socialCategory} onChange={e => setSocialCategory(e.target.value)}>
                <option value="GENERAL">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            {/* Bank Account */}
            <div className="form-group">
              <label htmlFor="bankAccount">Bank Account Number</label>
              <input id="bankAccount" type="text" className="form-control" placeholder="e.g. 1234567890123" value={bankAccount} onChange={e => { setBankAccount(e.target.value.replace(/\D/g, '')); if (errors.bankAccount) setErrors(p => ({ ...p, bankAccount: null })); }} />
              {maskedBank && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>Stored as: <strong>{maskedBank}</strong></div>}
              {errors.bankAccount && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.bankAccount}</div>}
            </div>

            {/* IFSC */}
            <div className="form-group">
              <label htmlFor="ifsc">Bank IFSC Code</label>
              <input id="ifsc" type="text" className="form-control" placeholder="e.g. SBIN0001234" maxLength="11" value={ifscCode} onChange={e => { setIfscCode(e.target.value.toUpperCase()); if (errors.ifscCode) setErrors(p => ({ ...p, ifscCode: null })); }} />
              {errors.ifscCode && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.ifscCode}</div>}
            </div>

            {/* Income */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="income">Annual Household Income (₹)</label>
              <input id="income" type="number" className="form-control" placeholder="e.g. 150000" value={income} onChange={e => { setIncome(e.target.value); if (errors.income) setErrors(p => ({ ...p, income: null })); }} />
              {errors.income && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.income}</div>}
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">Permanent Residential Address</label>
            <textarea id="address" className="form-control" rows="2" placeholder="Enter full address as per Aadhaar Card" value={address} onChange={e => { setAddress(e.target.value); if (errors.address) setErrors(p => ({ ...p, address: null })); }} />
            {errors.address && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>{errors.address}</div>}
          </div>

          {/* Documents Checklist */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: '#1d4ed8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
              <FaUpload /> Required Supporting Documents
            </label>
            <div style={{ background: errors.docs ? '#fff1f2' : '#f0f9ff', border: `1px solid ${errors.docs ? '#fecdd3' : '#bae6fd'}`, borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, marginBottom: '0.25rem' }}>
                Tick each document to confirm you have it ready. Physical copies must be submitted at the district office.
              </p>
              {typeConfig.docs.map((doc, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1e3a5f', fontWeight: docChecks[idx] ? 600 : 400 }}>
                  <input
                    type="checkbox"
                    checked={!!docChecks[idx]}
                    onChange={e => {
                      setDocChecks(prev => ({ ...prev, [idx]: e.target.checked }));
                      if (errors.docs) setErrors(p => ({ ...p, docs: null }));
                    }}
                    style={{ marginTop: '2px', accentColor: '#0284c7', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ textDecoration: docChecks[idx] ? 'none' : 'none', opacity: docChecks[idx] ? 1 : 0.8 }}>
                    {docChecks[idx] ? '✅ ' : '📄 '}{doc}
                  </span>
                </label>
              ))}
            </div>
            {errors.docs && <div className="field-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.docs}</div>}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          className="btn-brand"
          style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontWeight: 700, fontSize: '1rem', borderRadius: '12px' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'} <FaArrowRight style={{ marginLeft: 8 }} />
        </button>

        {/* ── Pipeline Info ── */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.25rem 1.5rem', fontSize: '0.88rem', color: '#0369a1', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <FaUserCheck style={{ fontSize: '1.3rem', marginTop: 2, flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#0c4a6e', marginBottom: '0.4rem', fontWeight: 700 }}>3-Stage Verification Pipeline</h4>
            <ol style={{ paddingLeft: '1.1rem', lineHeight: '1.9', margin: 0 }}>
              <li>Field Officer conducts ground visit &amp; document review.</li>
              <li>District Officer performs secondary scrutiny.</li>
              <li>Finance Approver signs off &amp; credits bank account.</li>
            </ol>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Apply;
