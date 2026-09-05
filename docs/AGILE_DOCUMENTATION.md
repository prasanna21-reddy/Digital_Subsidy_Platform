# Agile Documentation

## Project
**Development of Digital Subsidy & Grant Administration Platform**

## 1. Agile Approach
The project follows an iterative Agile approach. Work is divided into milestones, features are developed incrementally, and completed work is reviewed and improved based on feedback.

```text
Planning
   ↓
Development
   ↓
Integration
   ↓
Testing
   ↓
Review
   ↓
Improvement
   ↺
```

## 2. Team Responsibilities

| Area | Responsibility |
|---|---|
| Frontend | React pages, dashboards, forms, routing and API integration |
| Backend | Spring Boot APIs, business logic, security and workflow |
| Database | Schema, relationships and database management |
| Integration | Frontend-backend connection and end-to-end workflow |
| Testing | Functional, security and integration testing |
| Review | Mentor/team review and feedback |

## 3. Milestone 1 – Requirement Analysis and Design

### Activities
- Requirement analysis
- Business workflow
- ER diagram
- Database schema
- API design
- Eligibility workflow
- GitHub repository setup

### Deliverables
- R&D / Business Workflow Document
- API Design Document
- ER Diagram
- Database Schema
- Eligibility Workflow Diagram
- GitHub repository and branch setup

## 4. Milestone 2 – Frontend Development

### Activities
- Beneficiary registration and login
- Officer login
- Beneficiary dashboard
- Available schemes
- Scheme-specific application
- Application tracking
- Field Officer dashboard
- District Officer dashboard
- Finance Officer dashboard
- Admin dashboard
- Utilization/milestone interface
- Role-based routing

### Outcome
A role-based frontend was developed for the major users of the platform.

## 5. Milestone 3 – Backend, Security and Integration

### Activities
- Spring Boot REST APIs
- MySQL integration
- JPA entities and repositories
- JWT authentication
- Role-based authorization
- Scheme management
- Application workflow
- Eligibility/priority scoring
- Officer verification
- District approval
- Disbursement workflow
- Audit logging
- Error handling

### Outcome
The frontend was connected to backend services and persistent database operations.

## 6. Milestone 4 – Testing and Finalization

### Activities
- Frontend-backend integration testing
- Authentication and authorization testing
- Application workflow testing
- Eligibility score testing
- Milestone/utilization testing
- Disbursement testing
- Audit log verification
- Error handling
- UI review
- Documentation
- Final GitHub cleanup

## 7. End-to-End Workflow

```text
Beneficiary Registration/Login
        ↓
View Available Schemes
        ↓
Select Scheme
        ↓
Submit Application
        ↓
Eligibility/Priority Score
        ↓
Field Officer Verification
        ↓
District Officer Approval
        ↓
Finance Officer Payment
        ↓
Beneficiary Milestone + Utilization
        ↓
Field Officer Verification
        ↓
District Officer Approval
        ↓
Next Payment Stage
```

## 8. Definition of Done
A feature is considered complete when:
- Frontend is implemented.
- Required backend API is implemented.
- Database persistence works.
- Authorization is enforced.
- Validation and error handling are implemented.
- The feature is tested.
- The workflow works after refresh/re-login.
- Changes are committed to GitHub.
- Required documentation is updated.

## 9. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| API mismatch | Maintain a shared API contract |
| Merge conflicts | Use feature branches and pull requests |
| Unauthorized privileged registration | Provision officer/Admin accounts |
| Unauthorized application access | Perform backend ownership and role checks |
| Payment API unavailable | Use pending/retry handling or a simulated payment service |
| Sensitive data exposure | Mask data and enforce authorization |
| Environment differences | Use environment-specific configuration |
| Incorrect workflow status | Persist workflow state and history |

## 10. Git Collaboration

```text
Feature Branch
      ↓
Commit
      ↓
Push
      ↓
Pull Request
      ↓
Review
      ↓
Merge
```

Team members should avoid directly overwriting other members' work and should resolve conflicts before merging.

## 11. Final Outcome
The Agile development process produced a platform covering beneficiary onboarding, scheme management, application processing, officer verification, district approval, staged disbursement, milestone/utilization tracking, audit logging and role-based security.
