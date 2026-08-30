package com.government.subsidy.repository;

import com.government.subsidy.model.WorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowHistoryRepository extends JpaRepository<WorkflowHistory, Long> {
    List<WorkflowHistory> findByApplicationIdOrderByActionDateDesc(Long applicationId);
}