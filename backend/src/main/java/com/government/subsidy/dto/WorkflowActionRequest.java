package com.government.subsidy.dto;

public class WorkflowActionRequest {
    private String action;
    private String comments;
    private String targetStatus;

    public WorkflowActionRequest() {
    }

    public WorkflowActionRequest(String action, String comments, String targetStatus) {
        this.action = action;
        this.comments = comments;
        this.targetStatus = targetStatus;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getTargetStatus() {
        return targetStatus;
    }

    public void setTargetStatus(String targetStatus) {
        this.targetStatus = targetStatus;
    }
}
