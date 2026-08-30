package com.government.subsidy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "workflow_stages")
public class WorkflowStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stageId;

    private String stageName;
    private Integer stageOrder;
    private String description;

    public WorkflowStage() {}

    public Long getStageId() { return stageId; }
    public void setStageId(Long stageId) { this.stageId = stageId; }

    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }

    public Integer getStageOrder() { return stageOrder; }
    public void setStageOrder(Integer stageOrder) { this.stageOrder = stageOrder; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}