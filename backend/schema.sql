-- 1. ROLES & USERS
CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 2. ACTORS
CREATE TABLE beneficiaries (
    beneficiary_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    aadhaar_no VARCHAR(20) NOT NULL UNIQUE,
    dob DATE,
    gender VARCHAR(10),
    income DECIMAL(12, 2),
    category VARCHAR(50),
    address TEXT,
    phone VARCHAR(20),
    bank_account_no VARCHAR(30),
    bank_ifsc VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE officers (
    officer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    designation VARCHAR(100),
    department VARCHAR(100),
    district VARCHAR(100),
    joining_date DATE,
    status VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE accountants (
    accountant_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    designation VARCHAR(100),
    status VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 3. SCHEMES & RULES
CREATE TABLE schemes (
    scheme_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scheme_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    budget DECIMAL(15, 2),
    max_amount DECIMAL(12, 2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20)
);

CREATE TABLE eligibility_rules (
    rule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scheme_id BIGINT NOT NULL,
    rule_description TEXT,
    criteria_type VARCHAR(50),
    min_value DECIMAL(12, 2),
    max_value DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id)
);

-- 4. WORKFLOW & APPLICATIONS
CREATE TABLE workflow_stages (
    stage_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stage_name VARCHAR(100),
    stage_order INT,
    description TEXT
);

CREATE TABLE applications (
    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id BIGINT NOT NULL,
    scheme_id BIGINT NOT NULL,
    application_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(50),
    eligibility_score DECIMAL(5, 2),
    current_stage_id BIGINT,
    remarks TEXT,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id),
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id),
    FOREIGN KEY (current_stage_id) REFERENCES workflow_stages(stage_id)
);

CREATE TABLE documents (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    document_type VARCHAR(50),
    file_path VARCHAR(255),
    uploaded_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (application_id) REFERENCES applications(application_id)
);

CREATE TABLE verifications (
    verification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    officer_id BIGINT NOT NULL,
    verification_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(20),
    remarks TEXT,
    FOREIGN KEY (document_id) REFERENCES documents(document_id),
    FOREIGN KEY (officer_id) REFERENCES officers(officer_id)
);

CREATE TABLE workflow_history (
    workflow_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    stage_id BIGINT NOT NULL,
    officer_id BIGINT,
    action VARCHAR(50),
    comments TEXT,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (stage_id) REFERENCES workflow_stages(stage_id),
    FOREIGN KEY (officer_id) REFERENCES officers(officer_id)
);

CREATE TABLE re_verification_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    officer_id BIGINT NOT NULL,
    reason TEXT,
    request_date DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(20),
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (officer_id) REFERENCES officers(officer_id)
);

-- 5. DISBURSEMENT & SYSTEM LOGS
CREATE TABLE fund_disbursements (
    disbursement_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    scheme_id BIGINT NOT NULL,
    officer_id BIGINT,
    accountant_id BIGINT,
    amount DECIMAL(12, 2),
    payment_mode VARCHAR(50),
    transaction_ref_no VARCHAR(100),
    payment_date DATE,
    status VARCHAR(20),
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id),
    FOREIGN KEY (officer_id) REFERENCES officers(officer_id),
    FOREIGN KEY (accountant_id) REFERENCES accountants(accountant_id)
);

CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT,
    message TEXT,
    status VARCHAR(20) DEFAULT 'UNREAD',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (application_id) REFERENCES applications(application_id)
);

CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100),
    entity_name VARCHAR(100),
    entity_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);