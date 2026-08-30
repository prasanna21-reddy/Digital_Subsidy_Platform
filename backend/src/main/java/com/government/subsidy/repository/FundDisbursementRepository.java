package com.government.subsidy.repository;

import com.government.subsidy.model.FundDisbursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FundDisbursementRepository extends JpaRepository<FundDisbursement, Long> {
    Optional<FundDisbursement> findByApplicationId(Long applicationId);
}