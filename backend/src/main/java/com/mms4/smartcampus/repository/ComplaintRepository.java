package com.mms4.smartcampus.repository;

import com.mms4.smartcampus.model.Complaint;
import com.mms4.smartcampus.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    long countByStatus(ComplaintStatus status);
}
