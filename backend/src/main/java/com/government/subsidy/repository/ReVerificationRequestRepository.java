package com.government.subsidy.repository;

import com.government.subsidy.model.ReVerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReVerificationRequestRepository extends JpaRepository<ReVerificationRequest, Long> {
    List<ReVerificationRequest> findByApplicationId(Long applicationId);
}