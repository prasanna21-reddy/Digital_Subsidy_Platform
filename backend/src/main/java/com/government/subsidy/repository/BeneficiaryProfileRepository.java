package com.government.subsidy.repository;

import com.government.subsidy.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BeneficiaryProfileRepository extends JpaRepository<BeneficiaryProfile, Long> {
    Optional<BeneficiaryProfile> findByUser(User user);
    Optional<BeneficiaryProfile> findByUserId(Long userId);
}
