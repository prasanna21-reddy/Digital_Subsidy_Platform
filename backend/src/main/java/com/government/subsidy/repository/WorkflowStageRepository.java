package com.government.subsidy.repository;

import com.government.subsidy.model.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WorkflowStageRepository extends JpaRepository<WorkflowStage, Long> {
    Optional<WorkflowStage> findByStageOrder(Integer stageOrder);
}