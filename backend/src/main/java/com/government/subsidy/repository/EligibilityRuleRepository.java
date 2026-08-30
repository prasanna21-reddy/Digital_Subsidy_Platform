package com.government.subsidy.repository;

import com.government.subsidy.model.EligibilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EligibilityRuleRepository extends JpaRepository<EligibilityRule, Long> {
    List<EligibilityRule> findBySchemeIdAndIsActiveTrue(Long schemeId);
}