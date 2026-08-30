package com.government.subsidy.repository;

import com.government.subsidy.model.Application;
import com.government.subsidy.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    List<Application> findByStatus(ApplicationStatus status);

    List<Application> findByStatusIn(Collection<ApplicationStatus> statuses);

    @Query("SELECT a FROM Application a WHERE a.beneficiary.user.email = :email OR a.beneficiary.user.phone = :email")
    List<Application> findByCitizenEmailOrPhone(@Param("email") String email);

    @Query("SELECT COUNT(a) > 0 FROM Application a WHERE (a.beneficiary.user.email = :email OR a.beneficiary.user.phone = :email) AND a.scheme.id = :schemeId AND a.status NOT IN :finalStatuses")
    boolean existsActiveApplicationForScheme(@Param("email") String email, @Param("schemeId") Long schemeId, @Param("finalStatuses") Collection<ApplicationStatus> finalStatuses);

    long countByStatus(ApplicationStatus status);

    long countByStatusIn(Collection<ApplicationStatus> statuses);
}
