# Backend Documentation

## Project
**Development of Digital Subsidy & Grant Administration Platform**

## 1. Overview
The backend is a Spring Boot REST API that manages users, beneficiaries, schemes, applications, eligibility/priority scoring, verification workflows, disbursements, utilization reports, and audit logging.

## 2. Technology Stack
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- JWT authentication
- MySQL
- Maven

## 3. Architecture

```text
React Frontend
      ↓
REST Controllers
      ↓
Service Layer
      ↓
JPA Repositories
      ↓
MySQL Database
```

## 4. Main Backend Modules

### Authentication and Authorization
- Beneficiary registration
- Login
- JWT token generation and validation
- Role-based authorization
- Protected REST endpoints

Public registration is intended for beneficiaries. Officer and Admin accounts are provisioned as official accounts rather than being created through public registration.

### Scheme Management
Admin can create and manage schemes including:
- Scheme name
- Category
- Description
- Grant amount
- Total budget
- Eligibility rules
- Required documents
- Disbursement stages
- Milestone requirements

### Application Management
The backend manages:
- Application creation
- Application retrieval
- Application status
- Officer verification
- Forwarding
- District approval/rejection
- Re-verification

### Eligibility / Priority Scoring
The backend evaluates the applicant's submitted information against the selected scheme's eligibility rules and calculates an internal score. The score is stored with the application and is visible only to authorized officers for priority-based review.

### Milestone and Utilization
After a payment stage is released, the beneficiary submits implementation/milestone and utilization details for that stage.

```text
Beneficiary
    ↓
Milestone + Utilization Report
    ↓
Field Officer Verification
    ↓
District Officer Approval
    ↓
Next Payment Stage Eligible
```

### Disbursement
Finance Officers can release payment for an eligible approved stage. A payment record stores information such as:
- Application
- Scheme
- Stage
- Amount
- Payment status
- Transaction/reference ID
- Payment date

For development/demo purposes, payment processing may be simulated until an authorized banking or government payment service is integrated.

### Audit Logging
Important actions are recorded for traceability, including:
- Application submission
- Verification
- Forwarding
- Approval/rejection
- Milestone actions
- Payment release

## 5. Database
The main data areas include:
- Users and roles
- Beneficiary profiles
- Schemes
- Eligibility rules
- Applications
- Documents
- Workflow/stage records
- Utilization reports
- Disbursements/payment records
- Audit logs

Relationships are maintained using database foreign keys and JPA entity relationships.

## 6. API Security
Authentication identifies the user, while authorization determines what the user can access.

For example, changing `/api/applications/101` to `/api/applications/102` must not expose another beneficiary's application. The backend must verify ownership, officer assignment, role, and workflow permissions before returning protected data.

## 7. Configuration
Database credentials, JWT secrets, and environment-specific settings should be supplied through environment variables or secure configuration rather than committed as production secrets in source code.

## 8. Testing
Backend testing should cover:
- Authentication
- Authorization
- Application workflow
- Eligibility scoring
- Milestone workflow
- Disbursement
- Error handling
- Database persistence

## 9. Future Enhancements
- Real government identity verification
- Secure document storage
- Authorized banking/payment API
- OTP-based verification where required
- Rate limiting
- Production secret management
