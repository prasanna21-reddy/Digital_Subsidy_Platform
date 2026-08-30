package com.government.subsidy.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "officers")
public class Officer extends User {

    private String designation;
    private String department;
    private String district;

    public Officer() {}

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
}