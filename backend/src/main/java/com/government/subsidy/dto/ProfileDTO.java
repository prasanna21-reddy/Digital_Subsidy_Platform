package com.government.subsidy.dto;

public class ProfileDTO {
    private String email;
    private String phone;
    private String aadhaarNumber;
    private String bankAccountNumber;
    private String ifscCode;
    private Double annualIncome;
    private String socialCategory;
    private String address;

    // Getters
    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public Double getAnnualIncome() {
        return annualIncome;
    }

    public String getSocialCategory() {
        return socialCategory;
    }

    public String getAddress() {
        return address;
    }

    // Setters
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public void setAnnualIncome(Double annualIncome) {
        this.annualIncome = annualIncome;
    }

    public void setSocialCategory(String socialCategory) {
        this.socialCategory = socialCategory;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
