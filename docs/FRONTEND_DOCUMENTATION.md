# Frontend Documentation

## Project
**Development of Digital Subsidy & Grant Administration Platform**

## 1. Overview
The frontend is a role-based React web application that provides separate interfaces for beneficiaries, Field Officers, District Officers, Finance Officers, and Administrators.

## 2. Technology Stack
- React
- Vite
- JavaScript
- React Router DOM
- React Icons
- CSS
- REST API integration with the Spring Boot backend

## 3. Main Modules

### Beneficiary Portal
- Beneficiary registration and login
- View available schemes
- Scheme-specific application forms
- Application tracking
- Profile management
- Utilization and milestone report submission
- View submitted reports and document information

### Field Officer Portal
- View assigned applications
- Review application details
- Use internal eligibility/priority score for prioritization
- Verify applications and supporting information
- Verify milestone/utilization reports
- Forward verified applications/reports to District Officer
- Request re-verification or reject where applicable

### District Officer Portal
- Review applications forwarded by Field Officers
- Approve or reject applications
- Review milestone/utilization reports
- Approve, reject, or request re-verification
- Approve progression to the next disbursement stage

### Finance Officer Portal
- View eligible disbursement stages
- Review approved payment information
- Release approved payment stages
- View payment history

### Admin Portal
- System Control Panel
- Scheme Management
- Disbursement monitoring
- Reports
- Audit Logs
- Profile management

## 4. Application Flow

```text
Beneficiary Registration/Login
        ↓
Available Schemes
        ↓
Select Scheme
        ↓
Scheme-Specific Application
        ↓
Application Submitted
        ↓
Field Officer Verification
        ↓
District Officer Approval
        ↓
Finance Officer Disbursement
        ↓
Beneficiary Milestone & Utilization Report
        ↓
Field Officer Verification
        ↓
District Officer Approval
        ↓
Next Disbursement Stage
```

## 5. Scheme-Specific Application
The application form displays common beneficiary information and additional fields required for the selected scheme. Required supporting documents are shown according to the scheme.

## 6. Eligibility / Priority Score
The eligibility score is an internal backend-calculated score used by authorized officers to prioritize applications. It is not displayed to beneficiaries.

## 7. Frontend Security
- Role-based routing and navigation
- Protected pages
- Sensitive information displayed only where required
- Backend remains the final authority for authentication and authorization

## 8. Service Layer
API communication is separated into service modules such as authentication, schemes, applications, beneficiaries, payments, and audit logs. This keeps components maintainable and makes future API changes easier.

## 9. Future Enhancements
- Secure document upload and storage
- Government identity verification
- SMS/email notifications
- Authorized banking/payment API integration
- OCR-based document processing
