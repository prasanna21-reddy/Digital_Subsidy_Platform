import React, { useState, useEffect, useRef } from 'react';
import {
  FaFileAlt, FaCheckCircle, FaUpload, FaInfoCircle,
  FaChevronDown, FaCalendarAlt, FaRupeeSign, FaClipboardList,
  FaEye, FaFolderOpen, FaPlusCircle, FaListAlt, FaClock,
  FaExclamationCircle, FaTimesCircle, FaFileInvoiceDollar
} from 'react-icons/fa';
import { applicationService } from '../services/applicationService';
import { auditService } from '../services/auditService';

/* ─────────────────────────────────────────────────────────────────
   Local Storage helpers  (per-user, keyed by email)
   ───────────────────────────────────────────────────────────────── */
const getStorageKey = () => {
  const email = localStorage.getItem('userEmail') || 'guest';
  return `utilizationReports_${email}`;
};

const loadReports = () => {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveReport = (report) => {
  const existing = loadReports();
  existing.unshift(report);          // newest first
  localStorage.setItem(getStorageKey(), JSON.stringify(existing));
};

/* ─────────────────────────────────────────────────────────────────
   Status badge helper
   ───────────────────────────────────────────────────────────────── */
const UrStatusBadge = ({ status }) => {
  const map = {
    PENDING: { bg: '#fef3c7', color: '#92400e', icon: <FaClock />, label: 'Pending Review' },
    VERIFIED: { bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle />, label: 'Verified' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b', icon: <FaTimesCircle />, label: 'Rejected' },
    SUBMITTED: { bg: '#ede9fe', color: '#4c1d95', icon: <FaExclamationCircle />, label: 'Submitted' },
  };
  const s = map[status] || map.SUBMITTED;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, background: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  );
};

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

/* ─────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────── */
const UtilizationReport = () => {
  const [activeTab, setActiveTab] = useState('submit');   // 'submit' | 'history'

  /* ── backend applications (for the submit form dropdown) ── */
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  /* ── Submit-form state ── */
  const [selectedAppId, setSelectedAppId] = useState('');
  const [amountUtilized, setAmountUtilized] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [utilizationDate, setUtilizationDate] = useState('');
  const [disbursementStage, setDisbursementStage] = useState('Stage 1');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileRef = useRef();

  /* ── History state ── */
  const [reports, setReports] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [docModal, setDocModal] = useState(null);   // { name, dataUrl }

  /* ── Load ── */
  useEffect(() => {
    (async () => {
      try {
        const data = await applicationService.getApplications();
        const paid = (data || []).filter(a =>
          ['PAYMENT_SUCCESSFUL', 'APPROVED_FOR_PAYMENT', 'DISTRICT_VERIFIED', 'PAYMENT_PENDING'].includes(a.status)
        );
        setApplications(paid);
        if (paid.length > 0) setSelectedAppId(String(paid[0].id));
      } catch (e) { console.error(e); }
      finally { setLoadingApps(false); }
    })();
    setReports(loadReports());
  }, []);

  const refreshReports = () => setReports(loadReports());

  /* ── File handler – convert to base64 for localStorage ── */
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, file: 'File must be under 5 MB' })); return; }
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFile({ name: f.name, dataUrl: ev.target.result, type: f.type });
    reader.readAsDataURL(f);
  };

  /* ── Validate ── */
  const validate = () => {
    const errs = {};
    if (!selectedAppId) errs.app = 'Select an application';
    const amt = parseFloat(amountUtilized);
    if (!amountUtilized || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid positive amount';
    if (!purpose.trim()) errs.purpose = 'Purpose is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!utilizationDate) errs.date = 'Date of utilization is required';
    if (!confirmed) errs.confirmed = 'Please confirm the declaration';
    if (!file) errs.file = 'Please upload a supporting document (bill / receipt / invoice)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const app = applications.find(a => String(a.id) === String(selectedAppId));
    const beneficiaryName = localStorage.getItem('userName') || 'Citizen';
    const report = {
      id: Date.now(),
      applicationId: selectedAppId,
      schemeName: app?.scheme?.name || app?.schemeName || 'Government Scheme',
      schemeId: app?.scheme?.id || '',
      beneficiaryName,
      status: 'SUBMITTED',
      amountUtilized: parseFloat(amountUtilized),
      purpose,
      description,
      utilizationDate,
      disbursementStage,
      submittedAt: new Date().toISOString(),
      document: file || null,
    };

    setTimeout(() => {
      saveReport(report);
      refreshReports();
      auditService.logAction(
        `Utilization Report submitted for ${report.schemeName} (${report.disbursementStage}) — Amount: ₹${report.amountUtilized}`,
        'Utilization Report',
        'Success'
      );
      setSubmitSuccess(true);
      setSubmitting(false);
      setAmountUtilized(''); setPurpose(''); setDescription('');
      setUtilizationDate(''); setFile(null); setFileName('');
      setConfirmed(false); setErrors({});
      if (fileRef.current) fileRef.current.value = '';
    }, 800);
  };

  /* ── Group reports by applicationId ── */
  const grouped = reports.reduce((acc, r) => {
    const key = r.applicationId;
    if (!acc[key]) acc[key] = { schemeName: r.schemeName, schemeId: r.schemeId, appId: key, items: [] };
    acc[key].items.push(r);
    return acc;
  }, {});

  const selectedApp = applications.find(a => String(a.id) === String(selectedAppId));

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0', background: '#f8fafc', minHeight: '80vh' }}>

      {/* ── Page Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 24px rgba(99,102,241,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.18)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#fff' }}><FaFileAlt /></div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>Utilization Reports</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', margin: '4px 0 0' }}>Submit and track how your disbursed funds were utilized</p>
          </div>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>
          <FaClipboardList style={{ marginRight: 5 }} /> Fund Utilization
        </span>
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.4rem', width: 'fit-content' }}>
        <button onClick={() => { setActiveTab('submit'); setSubmitSuccess(false); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0.55rem 1.25rem', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s', background: activeTab === 'submit' ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'transparent', color: activeTab === 'submit' ? '#fff' : '#64748b' }}>
          <FaPlusCircle /> Submit New Report
        </button>
        <button onClick={() => setActiveTab('history')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0.55rem 1.25rem', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s', background: activeTab === 'history' ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'transparent', color: activeTab === 'history' ? '#fff' : '#64748b' }}>
          <FaListAlt /> My Submitted Reports {reports.length > 0 && <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 7px', fontSize: '0.78rem' }}>{reports.length}</span>}
        </button>
      </div>

      {/* ════════════════════════════════════════
          TAB 1 — SUBMIT NEW REPORT
         ════════════════════════════════════════ */}
      {activeTab === 'submit' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {submitSuccess && (
            <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 12, margin: '1.5rem 2rem 0', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <FaCheckCircle style={{ color: '#059669', fontSize: '1.3rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#065f46' }}>Report submitted successfully!</div>
                <div style={{ color: '#047857', fontSize: '0.85rem' }}>Your utilization report is now visible in "My Submitted Reports". A field officer will verify it shortly.</div>
              </div>
              <button onClick={() => setSubmitSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>×</button>
            </div>
          )}

          {/* Application Selector */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaChevronDown style={{ color: '#6366f1' }} /> Step 1 — Select Application &amp; Disbursement Stage
            </h3>

            {loadingApps ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading your applications…</p>
            ) : applications.length === 0 ? (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                <FaInfoCircle style={{ color: '#b45309' }} />
                <span style={{ color: '#92400e', fontSize: '0.9rem' }}>No disbursed applications found. Utilization reports can only be submitted after funds have been released.</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.87rem', fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>Application / Scheme</label>
                  <div style={{ position: 'relative' }}>
                    <select value={selectedAppId} onChange={e => setSelectedAppId(e.target.value)} style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.9rem', border: '1.5px solid #cbd5e1', borderRadius: 10, fontSize: '0.92rem', color: '#1e293b', background: '#f8fafc', appearance: 'none', cursor: 'pointer', outline: 'none' }}>
                      {applications.map(a => (
                        <option key={a.id} value={a.id}>
                          #APP-{a.id} — {a.scheme?.name || a.schemeName || 'Scheme'}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', fontSize: '0.8rem' }} />
                  </div>
                  {errors.app && <span style={{ color: '#e11d48', fontSize: '0.8rem' }}>{errors.app}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.87rem', fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' }}>Disbursement Stage</label>
                  <div style={{ position: 'relative' }}>
                    <select value={disbursementStage} onChange={e => setDisbursementStage(e.target.value)} style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.9rem', border: '1.5px solid #cbd5e1', borderRadius: 10, fontSize: '0.92rem', color: '#1e293b', background: '#f8fafc', appearance: 'none', cursor: 'pointer', outline: 'none' }}>
                      <option value="Stage 1">Stage 1 — Initial Release</option>
                      <option value="Stage 2">Stage 2 — Mid-Term Release</option>
                      <option value="Stage 3">Stage 3 — Final Release</option>
                    </select>
                    <FaChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', fontSize: '0.8rem' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Selected app info card */}
            {selectedApp && (
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Application ID', value: `#APP-${selectedApp.id}` },
                  { label: 'Scheme', value: selectedApp.scheme?.name || 'N/A' },
                  { label: 'Status', value: selectedApp.status?.replace(/_/g, ' ') || 'N/A' },
                  { label: 'Submitted', value: selectedApp.submittedDate ? new Date(selectedApp.submittedDate).toLocaleDateString() : 'N/A' },
                ].map(d => (
                  <div key={d.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{d.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {applications.length > 0 && (
            <form onSubmit={handleSubmit} noValidate>

              {/* Utilization Details */}
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaRupeeSign style={{ color: '#6366f1' }} /> Step 2 — Utilization Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                  <div>
                    <label style={lbl}>Amount Utilized <span style={{ color: '#e11d48' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 700 }}>₹</span>
                      <input type="number" placeholder="Enter amount" value={amountUtilized} onChange={e => { setAmountUtilized(e.target.value); if (errors.amount) setErrors(p => ({ ...p, amount: null })); }} style={{ ...inp, paddingLeft: '2rem' }} />
                    </div>
                    {errors.amount && <span style={err}>{errors.amount}</span>}
                  </div>

                  <div>
                    <label style={lbl}>Purpose <span style={{ color: '#e11d48' }}>*</span></label>
                    <input type="text" placeholder="e.g. Purchased seeds, Equipment maintenance…" value={purpose} onChange={e => { setPurpose(e.target.value); if (errors.purpose) setErrors(p => ({ ...p, purpose: null })); }} style={inp} />
                    {errors.purpose && <span style={err}>{errors.purpose}</span>}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Description <span style={{ color: '#e11d48' }}>*</span></label>
                    <textarea rows={3} placeholder="Briefly describe how the funds were utilized…" value={description} onChange={e => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: null })); }} style={{ ...inp, resize: 'vertical', minHeight: 80 }} />
                    {errors.description && <span style={err}>{errors.description}</span>}
                  </div>

                  <div>
                    <label style={lbl}><FaCalendarAlt style={{ marginRight: 5, color: '#6366f1' }} /> Date of Utilization <span style={{ color: '#e11d48' }}>*</span></label>
                    <input type="date" value={utilizationDate} onChange={e => { setUtilizationDate(e.target.value); if (errors.date) setErrors(p => ({ ...p, date: null })); }} style={inp} />
                    {errors.date && <span style={err}>{errors.date}</span>}
                  </div>

                </div>
              </div>

              {/* Document Upload */}
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaUpload style={{ color: '#6366f1' }} /> Step 3 — Supporting Document <span style={{ color: '#e11d48' }}>*</span>
                </h3>
                <label htmlFor="doc-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed #a5b4fc', borderRadius: 14, padding: '1.75rem 1rem', background: '#f5f3ff', cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s' }}>
                  <FaUpload style={{ fontSize: '1.6rem', color: '#6366f1' }} />
                  {fileName
                    ? <><strong style={{ color: '#1e293b' }}>{fileName}</strong><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Click to change</span></>
                    : <><span style={{ color: '#475569', fontWeight: 600 }}>Upload Bill / Receipt / Invoice</span><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>PDF, JPG, PNG — max 5 MB</span></>
                  }
                  <input id="doc-upload" ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
                {errors.file && <span style={err}>{errors.file}</span>}
              </div>

              {/* Declaration & Submit */}
              <div style={{ padding: '1.5rem 2rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
                  <input type="checkbox" id="confirm-declaration" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); if (errors.confirmed) setErrors(p => ({ ...p, confirmed: null })); }} style={{ width: 17, height: 17, accentColor: '#6366f1', cursor: 'pointer', marginTop: 2 }} />
                  <span style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.4 }}>
                    I confirm that the above information is accurate and the funds were utilized solely for the declared purpose as per scheme guidelines.
                  </span>
                </label>
                {errors.confirmed && <span style={{ ...err, display: 'block', marginBottom: 10 }}>{errors.confirmed}</span>}

                <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.35)', opacity: submitting ? 0.75 : 1 }}>
                  {submitting ? 'Submitting…' : <><FaCheckCircle /> Submit Utilization Report</>}
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB 2 — MY SUBMITTED REPORTS
         ════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div>
          {reports.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center' }}>
              <FaFolderOpen style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>No Reports Submitted Yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Once you submit a utilization report, it will appear here grouped by scheme and application.</p>
              <button onClick={() => setActiveTab('submit')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                <FaPlusCircle /> Submit Your First Report
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {Object.values(grouped).map(group => (
                <div key={group.appId} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

                  {/* Group header */}
                  <div style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', borderBottom: '1px solid #bae6fd', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FaFileInvoiceDollar style={{ color: '#0284c7', fontSize: '1.2rem' }} />
                      <div>
                        <div style={{ fontWeight: 800, color: '#0c4a6e', fontSize: '1rem' }}>{group.schemeName}</div>
                        <div style={{ color: '#0369a1', fontSize: '0.8rem' }}>Application #APP-{group.appId}</div>
                      </div>
                    </div>
                    <span style={{ background: '#bae6fd', color: '#0369a1', borderRadius: 20, padding: '3px 12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {group.items.length} Report{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Individual reports */}
                  {group.items.map((r, idx) => (
                    <div key={r.id} style={{ borderBottom: idx < group.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>

                      {/* Report row */}
                      <div
                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                        style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '1rem', alignItems: 'center', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'background 0.15s', background: expandedId === r.id ? '#fafafe' : '#fff' }}
                      >
                        <div style={{ width: 38, height: 38, background: '#ede9fe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', fontSize: '1rem', flexShrink: 0 }}>
                          <FaClipboardList />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{r.disbursementStage} — {r.purpose}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            Submitted {new Date(r.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            &nbsp;·&nbsp; Utilization date: {r.utilizationDate || 'N/A'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '1.05rem' }}>{fmt(r.amountUtilized)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>utilized</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <UrStatusBadge status={r.status} />
                          <FaChevronDown style={{ color: '#94a3b8', fontSize: '0.75rem', transform: expandedId === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>

                      {/* Expanded detail panel */}
                      {expandedId === r.id && (
                        <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                          {/* Description */}
                          <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Description</div>
                            <p style={{ color: '#334155', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{r.description}</p>
                          </div>

                          {/* Details grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem' }}>
                            {[
                              { label: 'Amount Utilized', value: fmt(r.amountUtilized) },
                              { label: 'Disbursement Stage', value: r.disbursementStage },
                              { label: 'Utilization Date', value: r.utilizationDate || '—' },
                              { label: 'Submitted On', value: new Date(r.submittedAt).toLocaleDateString('en-IN') },
                              { label: 'Verification Status', value: <UrStatusBadge status={r.status} /> },
                            ].map(d => (
                              <div key={d.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem' }}>
                                <div style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{d.label}</div>
                                <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{d.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Supporting Document */}
                          <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Supporting Document</div>
                            {r.document ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem' }}>
                                <FaFileAlt style={{ color: '#6366f1', fontSize: '1.25rem', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.document.name}</div>
                                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Submitted with report</div>
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); setDocModal(r.document); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 1rem', background: '#ede9fe', color: '#6366f1', border: '1px solid #c4b5fd', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                                >
                                  <FaEye /> View Document
                                </button>
                              </div>
                            ) : (
                              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 10, padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.88rem' }}>
                                No supporting document submitted with this report.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Document View Modal ── */}
      {docModal && (
        <div onClick={() => setDocModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 760, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaFileAlt style={{ color: '#6366f1', fontSize: '1.1rem' }} />
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{docModal.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: 6 }}>View Only</span>
              </div>
              <button onClick={() => setDocModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>×</button>
            </div>
            {/* Document content */}
            <div style={{ flex: 1, overflow: 'auto', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              {docModal.type && docModal.type.startsWith('image/') ? (
                <img src={docModal.dataUrl} alt={docModal.name} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
              ) : docModal.type === 'application/pdf' ? (
                <iframe src={docModal.dataUrl} title={docModal.name} style={{ width: '100%', height: '75vh', border: 'none' }} />
              ) : (
                <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                  <FaFileAlt style={{ fontSize: '3rem', marginBottom: 10 }} />
                  <p>Preview not supported. File: {docModal.name}</p>
                </div>
              )}
            </div>
            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDocModal(null)} style={{ padding: '0.5rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── tiny style constants ── */
const lbl = { fontSize: '0.87rem', fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' };
const inp = {
  width: '100%', padding: '0.65rem 0.9rem',
  border: '1.5px solid #cbd5e1', borderRadius: 10,
  fontSize: '0.92rem', color: '#1e293b', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const err = { color: '#e11d48', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginTop: 3 };

export default UtilizationReport;
