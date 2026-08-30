package com.government.subsidy.dto;

import com.government.subsidy.model.Role;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String fullName;
    private Role role;

    public JwtResponse() {}

    public JwtResponse(String token, String email, String fullName, Role role) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
