import React, { useState } from 'react';
import {
  FaFileAlt, FaCheckCircle, FaUpload, FaInfoCircle,
  FaChevronDown, FaCalendarAlt, FaRupeeSign, FaClipboardList
} from 'react-icons/fa';

/* ─── Static demo data ─────────────────────────────────────────── */
const SCHEMES = [
  {
    id: 'SCH-001',
    name: 'Farmer Subsidy Scheme',
    appId: 'APP001',
    stages: [
      { id: 'S1', label: 'Stage 1 – ₹20,000 – Released', amount: 20000, date: '10 Aug 2026', status: 'Released' },
      { id: 'S2', label: 'Stage 2 – ₹15,000 – Pending', amount: 15000, date: '—', status: 'Pending' },
    ],
  },
  {
    id: 'SCH-002',
    name: 'Women Entrepreneurship Grant',
    appId: 'APP002',
    stages: [
      { id: 'S1', label: 'Stage 1 – ₹50,000 – Released', amount: 50000, date: '01 Jul 2026', status: 'Released' },
    ],
  },
  {
    id: 'SCH-003',
    name: 'Higher Education Scholarship',
    appId: 'APP003',
    stages: [
      { id: 'S1', label: 'Stage 1 – ₹25,000 – Released', amount: 25000, date: '15 Jun 2026', status: 'Released' },
    ],
  },
];

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmt = (n) => '₹' + n.toLocaleString('en-IN');

const initialForm = { amountUtilized: '', purpose: '', description: '', date: '', file: null, confirmed: false };

/* ─── Component ────────────────────────────────────────────────── */
const UtilizationReport = () => {
  const [selectedSchemeId, setSelectedSchemeId] = useState(SCHEMES[0].id);
  const [selectedStageId, setSelectedStageId] = useState(SCHEMES[0].stages[0].id);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState('');

  const scheme = SCHEMES.find(s => s.id === selectedSchemeId) || SCHEMES[0];
  const stage = scheme.stages.find(st => st.id === selectedStageId) || scheme.stages[0];

  /* When scheme changes, reset stage to first available */
  const handleSchemeChange = (e) => {
    const s = SCHEMES.find(x => x.id === e.target.value);
    setSelectedSchemeId(s.id);
    setSelectedStageId(s.stages[0].id);
    setSubmitted(false);
    setForm(initialForm);
    setErrors({});
    setFileName('');
  };

  const handleStageChange = (e) => {
    setSelectedStageId(e.target.value);
    setSubmitted(false);
    setForm(initialForm);
    setErrors({});
    setFileName('');
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setForm(p => ({ ...p, file: f })); setFileName(f.name); }
  };

  const validate = () => {
    const errs = {};
    const amt = parseFloat(form.amountUtilized);
    if (!form.amountUtilized || isNaN(amt) || amt <= 0) errs.amountUtilized = 'Enter a valid amount.';
    else if (amt > stage.amount) errs.amountUtilized = `Amount cannot exceed ${fmt(stage.amount)}.`;
    if (!form.purpose.trim()) errs.purpose = 'Purpose is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.date) errs.date = 'Date is required.';
    if (!form.confirmed) errs.confirmed = 'Please confirm the declaration.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
  };

  const isReleased = stage.status === 'Released';

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0', background: '#ffffff', minHeight: '80vh' }}>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={styles.headerIcon}><FaFileAlt /></div>
          <div>
            <h2 style={styles.headerTitle}>Utilization Report</h2>
            <p style={styles.headerSub}>Submit details of how your subsidy was used</p>
          </div>
        </div>
        <span style={{ ...styles.badge, background: '#dbeafe', color: '#1d4ed8' }}>
          <FaClipboardList style={{ marginRight: 5 }} /> Fund Utilization
        </span>
      </div>

      {/* ── Main Card ───────────────────────────────────────────── */}
      <div style={styles.card}>

        {/* ─ Scheme & Stage Selectors ─────────────────────────── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><FaChevronDown style={styles.sectionIcon} /> Select Scheme &amp; Stage</h3>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Select Scheme</label>
            <div style={styles.selectWrap}>
              <select
                id="scheme-select"
                value={selectedSchemeId}
                onChange={handleSchemeChange}
                style={styles.select}
              >
                {SCHEMES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <FaChevronDown style={styles.selectArrow} />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Select Disbursement Stage</label>
            <div style={styles.selectWrap}>
              <select
                id="stage-select"
                value={selectedStageId}
                onChange={handleStageChange}
                style={styles.select}
              >
                {scheme.stages.map(st => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
              <FaChevronDown style={styles.selectArrow} />
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* ─ Payment Details ──────────────────────────────────── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><FaRupeeSign style={styles.sectionIcon} /> Payment Details</h3>
          <div style={styles.detailGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Application ID</span>
              <span style={styles.detailValue}>{scheme.appId}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Amount Received</span>
              <span style={{ ...styles.detailValue, color: '#0369a1', fontWeight: 700 }}>{fmt(stage.amount)}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Release Date</span>
              <span style={styles.detailValue}>{stage.date}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Stage Status</span>
              <span style={{
                ...styles.detailValue,
                color: isReleased ? '#059669' : '#b45309',
                background: isReleased ? '#d1fae5' : '#fef3c7',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {stage.status}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* ─ The form (only if stage is Released) ─────────────── */}
        {!isReleased ? (
          <div style={styles.notReleasedBox}>
            <FaInfoCircle style={{ color: '#b45309', fontSize: '1.2rem' }} />
            <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem' }}>
              This disbursement stage has <strong>not yet been released</strong>. You may submit a utilization report only after funds are disbursed.
            </p>
          </div>
        ) : submitted ? (
          <SuccessPanel form={form} stage={stage} fileName={fileName} onReset={() => { setSubmitted(false); setForm(initialForm); setFileName(''); }} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* ─ Utilization Details ─────────────────────────── */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}><FaClipboardList style={styles.sectionIcon} /> Utilization Details</h3>

              <div style={styles.formGrid}>

                {/* Amount Utilized */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="amount-utilized">Amount Utilized <span style={{ color: '#e11d48' }}>*</span></label>
                  <div style={styles.inputWrap}>
                    <span style={styles.inputPrefix}>₹</span>
                    <input
                      id="amount-utilized"
                      type="number"
                      placeholder="Enter amount"
                      value={form.amountUtilized}
                      onChange={e => setForm(p => ({ ...p, amountUtilized: e.target.value }))}
                      style={{ ...styles.input, paddingLeft: '2.4rem' }}
                    />
                  </div>
                  {errors.amountUtilized && <span style={styles.error}>{errors.amountUtilized}</span>}
                </div>

                {/* Purpose */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="purpose">Purpose <span style={{ color: '#e11d48' }}>*</span></label>
                  <input
                    id="purpose"
                    type="text"
                    placeholder="e.g. Purchased seeds, Equipment, etc."
                    value={form.purpose}
                    onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                    style={styles.input}
                  />
                  {errors.purpose && <span style={styles.error}>{errors.purpose}</span>}
                </div>

                {/* Description */}
                <div style={{ ...styles.fieldGroup, gridColumn: '1 / -1' }}>
                  <label style={styles.label} htmlFor="description">Description <span style={{ color: '#e11d48' }}>*</span></label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Briefly describe how the funds were utilized…"
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
                  />
                  {errors.description && <span style={styles.error}>{errors.description}</span>}
                </div>

                {/* Date */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="util-date">
                    <FaCalendarAlt style={{ marginRight: 5, color: '#6366f1' }} />
                    Date of Utilization <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input
                    id="util-date"
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    style={styles.input}
                  />
                  {errors.date && <span style={styles.error}>{errors.date}</span>}
                </div>

              </div>
            </div>

            <div style={styles.divider} />

            {/* ─ Supporting Document ─────────────────────────── */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}><FaUpload style={styles.sectionIcon} /> Supporting Document</h3>

              <label htmlFor="doc-upload" style={styles.uploadArea}>
                <FaUpload style={{ fontSize: '1.6rem', color: '#6366f1', marginBottom: '0.5rem' }} />
                {fileName
                  ? <><strong style={{ color: '#1e293b' }}>{fileName}</strong><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Click to change file</span></>
                  : <><span style={{ color: '#475569', fontWeight: 600 }}>Upload Bill / Receipt</span><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>PDF, JPG, PNG — max 5 MB</span></>
                }
                <input id="doc-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={styles.divider} />

            {/* ─ Declaration & Submit ────────────────────────── */}
            <div style={{ ...styles.section, paddingBottom: '1.5rem' }}>
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  id="confirm-declaration"
                  checked={form.confirmed}
                  onChange={e => setForm(p => ({ ...p, confirmed: e.target.checked }))}
                  style={{ width: 17, height: 17, accentColor: '#6366f1', cursor: 'pointer' }}
                />
                <span style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.4 }}>
                  I confirm that the information provided above is accurate and the funds were utilized solely for the declared purpose.
                </span>
              </label>
              {errors.confirmed && <span style={{ ...styles.error, marginTop: 6 }}>{errors.confirmed}</span>}

              <button id="submit-report-btn" type="submit" style={styles.submitBtn}>
                <FaCheckCircle /> Submit Report
              </button>
            </div>

          </form>
        )}

        {/* ─ Status Footer ────────────────────────────────────── */}
        <div style={styles.statusFooter}>
          <FaInfoCircle style={{ color: submitted ? '#059669' : '#94a3b8' }} />
          <span style={{ fontWeight: 600, color: submitted ? '#059669' : '#64748b' }}>
            Status: {submitted ? 'Submitted Successfully' : 'Not Submitted'}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Success Panel ────────────────────────────────────────────── */
const SuccessPanel = ({ form, stage, fileName, onReset }) => (
  <div style={styles.successPanel}>
    <div style={styles.successIcon}><FaCheckCircle /></div>
    <h3 style={{ color: '#065f46', fontWeight: 800, fontSize: '1.2rem', margin: '0.5rem 0 0.25rem' }}>
      Report Submitted Successfully!
    </h3>
    <p style={{ color: '#047857', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
      Your utilization report has been recorded. A field officer will verify it shortly.
    </p>
    <div style={styles.successDetails}>
      <Detail label="Amount Utilized" value={'₹' + parseFloat(form.amountUtilized).toLocaleString('en-IN')} />
      <Detail label="Purpose" value={form.purpose} />
      <Detail label="Date" value={form.date} />
      {fileName && <Detail label="Document" value={fileName} />}
    </div>
    <button onClick={onReset} style={{ ...styles.submitBtn, marginTop: '1.25rem', background: '#6366f1' }}>
      Submit Another Report
    </button>
  </div>
);

const Detail = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #d1fae5' }}>
    <span style={{ color: '#065f46', fontSize: '0.85rem' }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>{value}</span>
  </div>
);

/* ─── Inline Styles ────────────────────────────────────────────── */
const styles = {
  header: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    borderRadius: 'var(--radius-xl, 16px)',
    padding: '1.75rem 2rem',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    boxShadow: '0 4px 24px rgba(99,102,241,0.25)',
  },
  headerIcon: {
    width: 46, height: 46,
    background: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.25rem', color: '#fff',
  },
  headerTitle: { fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', margin: '4px 0 0' },
  badge: {
    display: 'flex', alignItems: 'center',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 'var(--radius-xl, 16px)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  section: { padding: '1.5rem 2rem' },
  sectionTitle: {
    fontSize: '1rem', fontWeight: 700, color: '#1e293b',
    marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: 8,
  },
  sectionIcon: { color: '#6366f1', fontSize: '0.95rem' },
  divider: { height: 1, background: '#f1f5f9', margin: '0' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.87rem', fontWeight: 600, color: '#334155' },
  selectWrap: { position: 'relative' },
  select: {
    width: '100%',
    padding: '0.65rem 2.5rem 0.65rem 0.9rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: 10,
    fontSize: '0.92rem',
    color: '#1e293b',
    background: '#f8fafc',
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  selectArrow: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    color: '#64748b', pointerEvents: 'none', fontSize: '0.8rem',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '1rem',
  },
  detailItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '0.9rem 1.1rem',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  detailLabel: { fontSize: '0.77rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: '0.95rem', color: '#0f172a', fontWeight: 600 },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.1rem',
  },
  inputWrap: { position: 'relative' },
  inputPrefix: {
    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
    color: '#64748b', fontWeight: 600, fontSize: '0.95rem',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.9rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: 10,
    fontSize: '0.92rem',
    color: '#1e293b',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  error: { color: '#e11d48', fontSize: '0.8rem', fontWeight: 500 },
  uploadArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    border: '2px dashed #a5b4fc',
    borderRadius: 14,
    padding: '1.75rem 1rem',
    background: '#f5f3ff',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
    textAlign: 'center',
  },
  checkboxRow: {
    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
    cursor: 'pointer', marginBottom: '1.4rem',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%',
    padding: '0.85rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
    transition: 'opacity 0.2s',
  },
  statusFooter: {
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    padding: '0.9rem 2rem',
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '0.9rem',
  },
  notReleasedBox: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    margin: '0 2rem 1.5rem',
    padding: '1rem 1.25rem',
    background: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: 12,
    fontSize: '0.92rem',
  },
  successPanel: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '2.5rem 2rem',
    textAlign: 'center',
  },
  successIcon: {
    width: 64, height: 64,
    background: '#d1fae5',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', color: '#059669',
    marginBottom: '0.75rem',
  },
  successDetails: {
    width: '100%', maxWidth: 420,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 12,
    padding: '0.75rem 1.25rem',
  },
};

export default UtilizationReport;
