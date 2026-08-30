package com.government.subsidy.repository;

import com.government.subsidy.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedDateDesc(Long userId);
    boolean existsByUserIdAndMessageContaining(Long userId, String keyword);
}