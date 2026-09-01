import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/applicationService';
import {
  FaMoneyCheckAlt, FaRupeeSign, FaCheckCircle, FaCalendarAlt,
  FaEye, FaTimes, FaSearch, FaFilter, FaClock, FaChartBar
} from 'react-icons/fa';

const readStoredMilestonePayments = () => {
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('utilizationReports_')) continue;
    try {
      const reports = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(reports)) continue;
      reports.forEach((report) => {
        if (!(report.financeEligible || report.status === 'DISTRICT_VERIFIED' || report.status === 'VERIFIED' || report.status === 'PAYMENT_SUCCESSFUL')) return;
        items.push({
          realId: report.id,
          id: `APP${String(report.id).padStart(3, '0')}`,
          beneficiary: report.beneficiaryName || key.replace('utilizationReports_', ''),
          scheme: report.schemeName || 'Government Scheme',
          stage: report.disbursementStage || 'Stage 1',
          amount: Number(report.amountUtilized || 0),
          milestoneStatus: 'Completed',
          districtApproval: 'Approved',
          paymentStatus: report.status === 'PAYMENT_SUCCESSFUL' ? 'Released' : 'Pending',
          bank: report.bankAccountNumber || 'Bank details unavailable',
          accountName: report.beneficiaryName || 'Citizen',
          ifsc: report.ifscCode || 'IFSC unavailable',
          releaseDate: report.verifiedOn || '—'
        });
      });
    } catch (e) {
      console.warn('Could not read finance milestone queue', e);
    }
  }
  return items;
};

/* ─── Helpers ─── */
const totalDisbursed = 0;
const totalPending = 0;

const tabStyle = (active) => ({
  background: 'none', border: 'none',
  padding: '0.6rem 1.5rem',
  fontWeight: 700, fontSize: '0.93rem',
  cursor: 'pointer',
  color: active ? '#2563eb' : '#64748b',
  borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
  marginBottom: '-2px',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
});

/* ─── Payment Detail Modal ─── */
const PaymentModal = ({ payment, onClose, onRelease }) => {
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  // Determine unlocked stages based on utilization reports (milestones)
  // Stage 1 is always unlocked for an eligible application.
  // We check localStorage for any district-verified milestones to unlock further stages.
  let stage2Unlocked = false;
  let stage3Unlocked = false;

  try {
    let verifiedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('utilizationReports_')) {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.forEach(r => {
          // If it belongs to this beneficiary and is verified by district
          if ((r.beneficiaryName === payment.beneficiary || r.beneficiaryName === payment.accountName || key.includes(payment.beneficiary)) &&
            (r.status === 'DISTRICT_VERIFIED' || r.status === 'VERIFIED')) {
            verifiedCount++;
          }
        });
      }
    }
    if (verifiedCount >= 1) stage2Unlocked = true;
    if (verifiedCount >= 2) stage3Unlocked = true;
  } catch (e) {
    console.warn("Could not determine milestone stages");
  }

  // Pre-select the highest unlocked stage that hasn't been released (or default to Stage 1)
  // We'll let the officer explicitly select it as requested.
  const [selectedStage, setSelectedStage] = useState(payment.stage || 'Stage 1');

  const handleRelease = async () => {
    setReleasing(true);
    try {
      await applicationService.processFinanceAction(payment.realId, 'RELEASE', 'Payment successful');
      setReleased(true);
      // Pass the selected stage so we can log it if needed
      onRelease(payment.id, payment.realId, selectedStage);
    } catch (e) {
      console.error(e);
      setReleased(false);
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeIn 0.2s ease' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Payment Details</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.84rem' }}>{payment.id} · Stage-wise Disbursement</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem', lineHeight: 1 }}><FaTimes /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Divider line */}
          <div style={{ borderBottom: '1px dashed #e2e8f0', marginBottom: '1.5rem' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              ['Beneficiary', payment.beneficiary],
              ['Application ID', payment.id],
              ['Scheme', payment.scheme],
              ['Bank Account', payment.bank],
              ['Account Name', payment.accountName],
              ['IFSC Code', payment.ifsc],
            ].map(([label, value]) => (
              <div key={label}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</span>
                <span style={{ fontWeight: 700, color: label === 'Amount to Release' ? '#0284c7' : '#0f172a', fontSize: label === 'Amount to Release' ? '1.1rem' : '0.92rem' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, marginBottom: '0.75rem' }}>
              Select Disbursement Stage to Release
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedStage('Stage 1')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600, border: selectedStage === 'Stage 1' ? '2px solid #3b82f6' : '1px solid #cbd5e1', background: selectedStage === 'Stage 1' ? '#eff6ff' : '#fff', color: selectedStage === 'Stage 1' ? '#1d4ed8' : '#334155', cursor: 'pointer' }}
              >
                Stage 1<br /><span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>Initial Release</span>
              </button>
              <button
                type="button"
                onClick={() => stage2Unlocked ? setSelectedStage('Stage 2') : null}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600, border: selectedStage === 'Stage 2' ? '2px solid #3b82f6' : '1px solid #cbd5e1', background: selectedStage === 'Stage 2' ? '#eff6ff' : (stage2Unlocked ? '#fff' : '#f1f5f9'), color: selectedStage === 'Stage 2' ? '#1d4ed8' : (stage2Unlocked ? '#334155' : '#94a3b8'), opacity: stage2Unlocked ? 1 : 0.6, cursor: stage2Unlocked ? 'pointer' : 'not-allowed' }}
              >
                Stage 2<br /><span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{stage2Unlocked ? 'Milestone Approved' : 'Locked'}</span>
              </button>
              <button
                type="button"
                onClick={() => stage3Unlocked ? setSelectedStage('Stage 3') : null}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600, border: selectedStage === 'Stage 3' ? '2px solid #3b82f6' : '1px solid #cbd5e1', background: selectedStage === 'Stage 3' ? '#eff6ff' : (stage3Unlocked ? '#fff' : '#f1f5f9'), color: selectedStage === 'Stage 3' ? '#1d4ed8' : (stage3Unlocked ? '#334155' : '#94a3b8'), opacity: stage3Unlocked ? 1 : 0.6, cursor: stage3Unlocked ? 'pointer' : 'not-allowed' }}
              >
                Stage 3<br /><span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{stage3Unlocked ? 'Milestone Approved' : 'Locked'}</span>
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount to Release</span>
              <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.3rem' }}>₹{payment.amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Status row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#16a34a', borderRadius: 20, padding: '0.3rem 0.9rem', fontSize: '0.83rem', fontWeight: 700 }}>
              <FaCheckCircle /> Milestone: {payment.milestoneStatus} ✓
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, padding: '0.3rem 0.9rem', fontSize: '0.83rem', fontWeight: 700 }}>
              <FaCheckCircle /> District: {payment.districtApproval} ✓
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#d97706', borderRadius: 20, padding: '0.3rem 0.9rem', fontSize: '0.83rem', fontWeight: 700 }}>
              <FaClock style={{ fontSize: '0.8rem' }} /> Payment: {payment.paymentStatus}
            </span>
          </div>

          {/* Action */}
          {released ? (
            <div style={{ textAlign: 'center', padding: '1rem', background: '#dcfce7', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <FaCheckCircle style={{ color: '#16a34a', fontSize: '2rem', marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 700, color: '#16a34a', fontSize: '1rem' }}>Payment Released Successfully!</p>
              <p style={{ margin: '0.25rem 0 0', color: '#166534', fontSize: '0.83rem' }}>₹{payment.amount.toLocaleString()} disbursed to {payment.accountName}</p>
            </div>
          ) : (
            <button
              onClick={handleRelease}
              disabled={releasing}
              style={{
                width: '100%', padding: '0.85rem', border: 'none', borderRadius: 10, cursor: releasing ? 'not-allowed' : 'pointer',
                background: releasing ? '#94a3b8' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s', boxShadow: releasing ? 'none' : '0 4px 14px rgba(22,163,74,0.35)'
              }}
            >
              {releasing ? (
                <><span style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Processing...</>
              ) : (
                <><FaMoneyCheckAlt /> Release {selectedStage} Payment</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Dashboard ─── */
const FinanceOfficerDashboard = () => {
  const [tab, setTab] = useState('PENDING');
  const [viewPayment, setViewPayment] = useState(null);
  const [releasedIds, setReleasedIds] = useState([]);

  const [activePending, setActivePending] = useState([]);
  const [allReleased, setAllReleased] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const localMilestoneQueue = readStoredMilestonePayments();
      const res = await applicationService.getFinanceQueue();
      const pending = [];
      const released = [];
      const history = [];

      localMilestoneQueue.forEach((item) => {
        history.push(item);
        if (item.paymentStatus === 'Released') {
          released.push(item);
        } else {
          pending.push(item);
        }
      });

      if (Array.isArray(res)) {
        res.forEach(app => {
          let benefName = app.beneficiary?.user?.fullName || app.beneficiary?.fullName || app.beneficiary?.email || app.beneficiaryName || '';
          if (!benefName || benefName === 'Citizen') benefName = app.beneficiary?.user?.email || app.beneficiary?.email || 'Beneficiary';
          if (benefName.includes('@')) benefName = benefName.split('@')[0];

          const mapped = {
            realId: app.id,
            id: `APP${String(app.id).padStart(3, '0')}`,
            beneficiary: benefName,
            scheme: app.scheme?.name || 'Unknown Scheme',
            stage: 'Stage 1',
            amount: app.scheme?.budget || 10000,
            milestoneStatus: 'Completed',
            districtApproval: 'Approved',
            paymentStatus: app.status === 'PAYMENT_SUCCESSFUL' ? 'Released' : 'Pending',
            bank: app.beneficiary?.bankAccountNumber ? `Acc: ${app.beneficiary.bankAccountNumber}` : 'Bank details unavailable',
            accountName: benefName,
            ifsc: app.beneficiary?.ifscCode || 'IFSC unavailable',
            releaseDate: app.status === 'PAYMENT_SUCCESSFUL' ? new Date().toLocaleDateString('en-IN') : '—'
          };
          history.push(mapped);
          if (app.status === 'PAYMENT_SUCCESSFUL') {
            released.push(mapped);
          } else if (['PAYMENT_ELIGIBLE', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(app.status)) {
            pending.push(mapped);
          }
        });
      }

      setActivePending(pending);
      setAllReleased(released);
      setFilteredHistory(history);
      setSchemes([...new Set(history.map(s => s.scheme))]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // History filters
  const [filterDate, setFilterDate] = useState('');
  const [filterScheme, setFilterScheme] = useState('');
  const [filterBeneficiary, setFilterBeneficiary] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleRelease = async (id, realId, stage) => {
    // Immediately move the payment from pending to released in state
    const released = activePending.find(p => p.id === id);
    if (released) {
      const releasedEntry = {
        ...released,
        paymentStatus: 'Released',
        stage: stage || released.stage,
        releaseDate: new Date().toLocaleDateString('en-IN'),
      };
      setActivePending(prev => prev.filter(p => p.id !== id));
      setAllReleased(prev => [releasedEntry, ...prev]);
      setFilteredHistory(prev => {
        const updated = prev.map(p => p.id === id ? releasedEntry : p);
        // Add if not already in history
        if (!updated.find(p => p.id === id)) updated.unshift(releasedEntry);
        return updated;
      });
    }
    // Attempt to update local storage milestones as well
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('utilizationReports_')) {
          const reports = JSON.parse(localStorage.getItem(key) || '[]');
          let modified = false;
          reports.forEach(r => {
            if (r.id === realId && (r.status === 'DISTRICT_VERIFIED' || r.status === 'VERIFIED')) {
              r.status = 'PAYMENT_SUCCESSFUL';
              modified = true;
            }
          });
          if (modified) {
            localStorage.setItem(key, JSON.stringify(reports));
          }
        }
      }
    } catch (e) {
      console.warn("Could not update local milestone", e);
    }

    setReleasedIds(prev => [...prev, id]);
    setTimeout(() => {
      setViewPayment(null);
      loadData(); // Fresh fetch after delay to sync with backend
    }, 1800);
  };

  const applyFilters = () => {
    return filteredHistory.filter(p => {
      const matchDate = !filterDate || p.releaseDate.toLowerCase().includes(filterDate.toLowerCase());
      const matchScheme = !filterScheme || p.scheme.toLowerCase().includes(filterScheme.toLowerCase());
      const matchBeneficiary = !filterBeneficiary || p.beneficiary.toLowerCase().includes(filterBeneficiary.toLowerCase());
      const matchStage = !filterStage || p.stage.toLowerCase().includes(filterStage.toLowerCase());
      const matchStatus = !filterStatus || p.paymentStatus === filterStatus;
      return matchDate && matchScheme && matchBeneficiary && matchStage && matchStatus;
    });
  };
  const filteredOutput = applyFilters();

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', padding: '1.75rem 2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>
            <FaMoneyCheckAlt />
          </div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.7rem', color: '#0f172a' }}>Finance Officer Dashboard</h2>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage disbursements — release approved payments and track history.</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 2rem' }}>

        {/* ── Summary Cards ── */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card" onClick={() => setTab('PENDING')} style={{ cursor: 'pointer', border: tab === 'PENDING' ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
            <div className="stat-icon amber"><FaClock /></div>
            <div className="stat-info">
              <h4>{activePending.length}</h4>
              <p>Pending Release</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => setTab('RELEASED')} style={{ cursor: 'pointer', border: tab === 'RELEASED' ? '2px solid #22c55e' : '1px solid #e2e8f0' }}>
            <div className="stat-icon emerald"><FaCheckCircle /></div>
            <div className="stat-info">
              <h4>{allReleased.length}</h4>
              <p>Released Payments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', color: '#1d4ed8' }}><FaRupeeSign /></div>
            <div className="stat-info">
              <h4>₹{(activePending.reduce((s, p) => s + p.amount, 0) + allReleased.reduce((s, p) => s + p.amount, 0)).toLocaleString()}</h4>
              <p>Total Disbursed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><FaCalendarAlt /></div>
            <div className="stat-info">
              <h4>₹{activePending.reduce((s, p) => s + p.amount, 0).toLocaleString()}</h4>
              <p>Scheduled (Pending Value)</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', overflowX: 'auto', padding: '0 1rem' }}>
            {[
              ['PENDING', `Pending Release (${activePending.length})`],
              ['RELEASED', `Released Payments (${allReleased.length})`],
              ['HISTORY', 'Payment History'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={tabStyle(tab === key)}>{label}</button>
            ))}
          </div>

          <div style={{ padding: '1.75rem' }}>

            {/* ── Pending Release Tab ── */}
            {tab === 'PENDING' && (
              <div className="animate-fade-in">
                <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Pending Release</h3>
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.87rem', color: '#64748b' }}>
                  Payments that have passed the full workflow: Beneficiary proof → Field Officer verified → District Officer approved → <strong>Ready for release.</strong>
                </p>
                {activePending.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <FaCheckCircle style={{ fontSize: '2.5rem', color: '#22c55e', marginBottom: 12 }} />
                    <p style={{ fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>All payments released!</p>
                    <p style={{ margin: 0, fontSize: '0.87rem' }}>No pending disbursements at this time.</p>
                  </div>
                ) : (
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Beneficiary</th>
                          <th>Scheme</th>
                          <th>Stage</th>
                          <th>Amount</th>
                          <th>Milestone Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePending.map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.beneficiary}</strong></td>
                            <td>{p.scheme}</td>
                            <td><span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 6, padding: '0.15rem 0.6rem', fontSize: '0.82rem', fontWeight: 700 }}>{p.stage}</span></td>
                            <td><strong style={{ color: '#0284c7', fontSize: '1rem' }}>₹{p.amount.toLocaleString()}</strong></td>
                            <td><span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 6, padding: '0.15rem 0.6rem', fontSize: '0.82rem', fontWeight: 700 }}>✓ {p.milestoneStatus}</span></td>
                            <td>
                              <button onClick={() => setViewPayment(p)} className="btn-outline" style={{ padding: '0.3rem 0.9rem', fontSize: '0.83rem' }}>
                                <FaEye /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Released Payments Tab ── */}
            {tab === 'RELEASED' && (
              <div className="animate-fade-in">
                <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Released Payments</h3>
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.87rem', color: '#64748b' }}>All payments that have been successfully disbursed. For tracking and history.</p>
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Beneficiary</th>
                        <th>Scheme</th>
                        <th>Stage</th>
                        <th>Amount</th>
                        <th>Release Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allReleased.map((p, i) => (
                        <tr key={p.id + i}>
                          <td><strong>{p.beneficiary}</strong></td>
                          <td>{p.scheme}</td>
                          <td><span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 6, padding: '0.15rem 0.6rem', fontSize: '0.82rem', fontWeight: 700 }}>{p.stage}</span></td>
                          <td><strong style={{ color: '#0284c7' }}>₹{p.amount.toLocaleString()}</strong></td>
                          <td>{p.releaseDate || 'Just now'}</td>
                          <td><span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 6, padding: '0.2rem 0.7rem', fontSize: '0.82rem', fontWeight: 700 }}>🟢 Released</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Payment History Tab ── */}
            {tab === 'HISTORY' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Payment History</h3>
                    <p style={{ margin: 0, fontSize: '0.87rem', color: '#64748b' }}>Searchable and filterable record of all payments.</p>
                  </div>
                  <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.83rem', fontWeight: 700 }}>
                    <FaChartBar style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    {filteredOutput.length} record{filteredOutput.length !== 1 ? 's' : ''}
                  </span>
                </div>



                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>App ID</th>
                        <th>Beneficiary</th>
                        <th>Scheme</th>
                        <th>Stage</th>
                        <th>Amount</th>
                        <th>Release Date</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOutput.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontStyle: 'italic' }}>No records match the selected filters.</td></tr>
                      ) : filteredOutput.map((p, i) => (
                        <tr key={p.id + i}>
                          <td><strong>{p.id}</strong></td>
                          <td>{p.beneficiary}</td>
                          <td>{p.scheme}</td>
                          <td><span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 6, padding: '0.15rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}>{p.stage}</span></td>
                          <td><strong style={{ color: '#0284c7' }}>₹{p.amount.toLocaleString()}</strong></td>
                          <td style={{ color: p.releaseDate === '—' ? '#94a3b8' : '#0f172a' }}>{p.releaseDate}</td>
                          <td>
                            <span style={{
                              background: p.paymentStatus === 'Released' ? '#dcfce7' : '#fef3c7',
                              color: p.paymentStatus === 'Released' ? '#16a34a' : '#d97706',
                              borderRadius: 6, padding: '0.2rem 0.7rem', fontSize: '0.8rem', fontWeight: 700
                            }}>
                              {p.paymentStatus === 'Released' ? '🟢' : '🟡'} {p.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {viewPayment && (
        <PaymentModal
          payment={viewPayment}
          onClose={() => setViewPayment(null)}
          onRelease={handleRelease}
        />
      )}

      <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
            `}</style>
    </div>
  );
};

export default FinanceOfficerDashboard;
