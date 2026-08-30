package com.government.subsidy.repository;

import com.government.subsidy.model.Verification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, Long> {
    List<Verification> findByDocumentDocumentId(Long documentId);
    List<Verification> findByOfficerId(Long officerId);
}