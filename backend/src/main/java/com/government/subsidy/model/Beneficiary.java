package com.government.subsidy.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "beneficiaries")
public class Beneficiary extends User {

    @Column(length = 12, nullable = false)
    private String aadhaarNumber;

    private String category;
    private Double income;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String bankAccountNumber;
    private String ifscCode;

    public Beneficiary() {}

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
}