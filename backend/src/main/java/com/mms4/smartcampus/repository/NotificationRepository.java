package com.mms4.smartcampus.repository;

import com.mms4.smartcampus.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification,Long>{
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);
}
