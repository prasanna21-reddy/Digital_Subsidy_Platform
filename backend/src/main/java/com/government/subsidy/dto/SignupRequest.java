package com.government.subsidy.dto;

public class SignupRequest {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String role;
    
    private String aadhaarNumber;
    private String category;
    private Double income;
    private String address;
    private String bankAccountNumber;
    private String ifscCode;

    private String designation;
    private String department;
    private String district;

    public SignupRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getIncome() { return income; }
    public void setIncome(Double income) { this.income = income; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
}
