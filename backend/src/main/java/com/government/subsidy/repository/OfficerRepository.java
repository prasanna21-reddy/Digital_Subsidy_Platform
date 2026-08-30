package com.government.subsidy.repository;

import com.government.subsidy.model.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, Long> {
    List<Officer> findByDistrict(String district);

    List<Officer> findByDepartment(String department);
}