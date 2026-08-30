package com.government.subsidy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "schemes")
public class Scheme {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;

    private Double budget;

    @Column(nullable = false)
    private Double budgetUsed = 0.0;

    private String district;

    @Column(nullable = false)
    private boolean active = true;

    public Scheme() {}

    public Scheme(Long id, String name, String category, String description, String eligibilityCriteria, Double budget, boolean active) {
        this.id = id;
        this.name = name;
        this.category = category != null ? category : "General";
        this.description = description;
        this.eligibilityCriteria = eligibilityCriteria;
        this.budget = budget;
        this.budgetUsed = 0.0;
        this.active = active;
    }

    public Scheme(Long id, String name, String description, String eligibilityCriteria, Double budget, boolean active) {
        this(id, name, "General", description, eligibilityCriteria, budget, active);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category != null ? category : "General"; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public Double getBudgetUsed() { return budgetUsed != null ? budgetUsed : 0.0; }
    public void setBudgetUsed(Double budgetUsed) { this.budgetUsed = budgetUsed; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
