import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { applicationService } from '../services/applicationService';

const TrackStatus = () => {
  const [appIdInput, setAppIdInput] = useState('');
  const [activeApp, setActiveApp] = useState(null);
  const [allApps, setAllApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const userRole = (localStorage.getItem('userRole') || 'CITIZEN').toUpperCase();

  const friendlyStatus = (status) => {
    if (!status) return 'Unknown';
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let data = [];
      if (userRole === 'FIELD_OFFICER') {
        data = await applicationService.getFieldQueue();
      } else if (userRole === 'DISTRICT_OFFICER') {
        data = await applicationService.getDistrictQueue();
      } else if (userRole === 'FINANCE_OFFICER') {
        data = await applicationService.getFinanceQueue();
      } else {
        data = await applicationService.getApplications();
      }

      setAllApps(data || []);
      if (data && data.length > 0) {
        setActiveApp(data[0]);
      }
    } catch (e) {
      console.error('Error fetching tracker data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!appIdInput.trim()) return;

    const cleanId = appIdInput.replace(/\D/g, '');
    if (!cleanId) {
      setErrorMsg('Please enter a valid numeric Application ID (e.g. 1, 2).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const found = await applicationService.getApplicationById(cleanId);
      if (found && found.id) {
        setActiveApp(found);
      } else {
        setErrorMsg(`Application #APP-${cleanId} not found.`);
        setActiveApp(null);
      }
    } catch (err) {
      setErrorMsg(`Application #APP-${cleanId} not found or access restricted.`);
      setActiveApp(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageStepState = (stageIndex, currentStatus) => {
    if (!currentStatus) return 'pending';

    if (currentStatus === 'FIELD_REJECTED' || currentStatus === 'DISTRICT_REJECTED' || currentStatus === 'REJECTED') {
      return 'rejected';
    }

    const statusMap = {
      'SUBMITTED': 1,
      'PENDING_FIELD_VERIFICATION': 1,
      'CORRECTION_REQUIRED': 1,
      'FIELD_VERIFIED': 2,
      'FORWARDED_TO_DISTRICT': 2,
      'DISTRICT_VERIFIED': 3,
      'APPROVED_FOR_PAYMENT': 4,
      'PAYMENT_PENDING': 4,
      'PAYMENT_SUCCESSFUL': 4
    };

    const currentLevel = statusMap[currentStatus] || 1;

    if (stageIndex < currentLevel) return 'completed';
    if (stageIndex === currentLevel) return 'active';
    return 'pending';
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', padding: '0.5rem 0' }}>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <span className="badge badge-submitted" style={{ marginBottom: '0.5rem' }}>Real-Time Verification Tracking</span>
        <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Application Lifecycle Tracker</h2>
        <p style={{ color: '#475569' }}>Enter any Application ID to inspect step-by-step 3-tier officer verification and disbursement status.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ maxWidth: '550px', margin: '0 auto 2rem auto', display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Application ID (e.g. 1, 2, 101)"
          value={appIdInput}
          onChange={(e) => setAppIdInput(e.target.value)}
          style={{ borderColor: '#93c5fd', fontSize: '1rem', padding: '0.75rem 1rem' }}
        />
        <button type="submit" className="btn-brand" style={{ padding: '0.75rem 1.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaSearch /> Search
        </button>
      </form>

      {errorMsg && (
        <div style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto', padding: '1rem', background: '#fef2f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '0.5rem', textAlign: 'center' }}>
          <FaExclamationCircle style={{ marginRight: '0.5rem' }} /> {errorMsg}
        </div>
      )}

      {/* Quick Application Selection Pills if present */}
      {allApps.length > 0 && (
        <div style={{ maxWidth: '850px', margin: '0 auto 2rem auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', marginRight: '0.5rem' }}>Quick View Applications:</span>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {allApps.slice(0, 5).map(app => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  border: activeApp?.id === app.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: activeApp?.id === app.id ? '#e0f2fe' : '#ffffff',
                  color: activeApp?.id === app.id ? '#0369a1' : '#334155',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                #APP-{app.id} ({friendlyStatus(app.status)})
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading application lifecycle details...
        </div>
      ) : activeApp ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2.5rem', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <div>
              <span className="badge badge-submitted" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                Status: {friendlyStatus(activeApp.status)}
              </span>
              <h3 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 700, margin: '0.25rem 0' }}>
                #APP-{activeApp.id} - {activeApp.scheme?.name || 'Government Subsidy Scheme'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                Submitted on: {activeApp.submittedDate ? new Date(activeApp.submittedDate).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>

          {/* Stepper Chain */}
          <div className="workflow-stepper" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap' }}>

            <div className={`workflow-step ${getStageStepState(1, activeApp.status)}`} style={{ flex: 1, textAlign: 'center' }}>
              <div className="step-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: getStageStepState(1, activeApp.status) === 'completed' ? '#10b981' : '#0284c7', color: '#fff' }}>1</div>
              <div className="step-label" style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>Citizen Submitted</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Level 0 Auto-Score</span>
            </div>

            <div className={`workflow-step ${getStageStepState(2, activeApp.status)}`} style={{ flex: 1, textAlign: 'center' }}>
              <div className="step-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: getStageStepState(2, activeApp.status) === 'completed' ? '#10b981' : getStageStepState(2, activeApp.status) === 'active' ? '#0284c7' : '#cbd5e1', color: '#fff' }}>2</div>
              <div className="step-label" style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>Field Officer Review</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Level 1 Verification</span>
            </div>

            <div className={`workflow-step ${getStageStepState(3, activeApp.status)}`} style={{ flex: 1, textAlign: 'center' }}>
              <div className="step-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: getStageStepState(3, activeApp.status) === 'completed' ? '#10b981' : getStageStepState(3, activeApp.status) === 'active' ? '#0284c7' : '#cbd5e1', color: '#fff' }}>3</div>
              <div className="step-label" style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>District Officer Review</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Level 2 Approval</span>
            </div>

            <div className={`workflow-step ${getStageStepState(4, activeApp.status)}`} style={{ flex: 1, textAlign: 'center' }}>
              <div className="step-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: getStageStepState(4, activeApp.status) === 'completed' ? '#10b981' : getStageStepState(4, activeApp.status) === 'active' ? '#0284c7' : '#cbd5e1', color: '#fff' }}>4</div>
              <div className="step-label" style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>Finance Disbursement</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Level 3 Stage Tranche</span>
            </div>

          </div>

          {/* Payment & Milestone Progress */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700, marginBottom: '1.25rem' }}>Payment & Milestone Progress</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>

              {/* Stage 1 */}
              <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>Stage 1 (Initial)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Amount: ₹{((activeApp.scheme?.budget || 100000) * 0.4).toLocaleString()}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: activeApp.status === 'PAYMENT_SUCCESSFUL' ? '#10b981' : (['PAYMENT_ELIGIBLE', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(activeApp.status) ? '#f59e0b' : '#94a3b8') }}>
                  {activeApp.status === 'PAYMENT_SUCCESSFUL' ? '✅ Released' : (['PAYMENT_ELIGIBLE', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(activeApp.status) ? '🔄 Pending Release' : ((['FIELD_REJECTED', 'DISTRICT_REJECTED', 'REJECTED'].includes(activeApp.status)) ? '❌ Cancelled' : '🔒 Locked'))}
                </div>
              </div>

              <div style={{ color: '#cbd5e1', fontSize: '1.25rem', fontWeight: 'bold' }}>→</div>

              {/* Stage 2 */}
              <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>Stage 2 (Milestone 1)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Amount: ₹{((activeApp.scheme?.budget || 100000) * 0.3).toLocaleString()}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: activeApp.status !== 'PAYMENT_SUCCESSFUL' ? '#94a3b8' : '#f59e0b' }}>
                  {activeApp.status !== 'PAYMENT_SUCCESSFUL' ? '🔒 Locked' : '🔄 Needs Verification'}
                </div>
              </div>

              <div style={{ color: '#cbd5e1', fontSize: '1.25rem', fontWeight: 'bold' }}>→</div>

              {/* Stage 3 */}
              <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>Stage 3 (Milestone 2)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Amount: ₹{((activeApp.scheme?.budget || 100000) * 0.3).toLocaleString()}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
                  🔒 Locked
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No Application Selected</h3>
          <p style={{ color: '#64748b' }}>Enter an Application ID in the search box above (e.g. 1) to track verification status.</p>
        </div>
      )}

    </div>
  );
};

export default TrackStatus;
