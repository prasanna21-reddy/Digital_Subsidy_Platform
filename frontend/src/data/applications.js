export const applicationsData = [
  {
    id: 'APP-2024-001',
    schemeId: 'SCH-001',
    schemeName: 'Solar Panel Subsidy',
    applicantName: 'Ramesh Kumar',
    dateApplied: '2024-10-12',
    status: 'Approved',
    timeline: [
      { step: 'Submitted', status: 'completed', date: '2024-10-12' },
      { step: 'Eligibility Check', status: 'completed', date: '2024-10-14' },
      { step: 'Field Officer Review', status: 'completed', date: '2024-10-20' },
      { step: 'District Officer Approval', status: 'completed', date: '2024-10-25' },
      { step: 'Finance Approval', status: 'completed', date: '2024-10-28' },
      { step: 'Fund Disbursed', status: 'pending', date: null }
    ]
  },
  {
    id: 'APP-2024-045',
    schemeId: 'SCH-003',
    schemeName: 'Higher Education Scholarship',
    applicantName: 'Sunita Devi',
    dateApplied: '2024-11-15',
    status: 'Pending Verification',
    timeline: [
      { step: 'Submitted', status: 'completed', date: '2024-11-15' },
      { step: 'Eligibility Check', status: 'completed', date: '2024-11-16' },
      { step: 'Field Officer Review', status: 'in-progress', date: null },
      { step: 'District Officer Approval', status: 'pending', date: null },
      { step: 'Finance Approval', status: 'pending', date: null },
      { step: 'Fund Disbursed', status: 'pending', date: null }
    ]
  }
];
