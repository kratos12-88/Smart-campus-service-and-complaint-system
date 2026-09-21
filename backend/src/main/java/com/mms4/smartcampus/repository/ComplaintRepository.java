package com.mms4.smartcampus.repository;

import com.mms4.smartcampus.model.Complaint;
import com.mms4.smartcampus.model.ComplaintCategory;
import com.mms4.smartcampus.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint,Long>{
    long countByStatus(ComplaintStatus status);
    List<Complaint> findBySubmittedByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<Complaint> findTop20ByOrderByCreatedAtDesc();
    List<Complaint> findBySchoolNameIgnoreCaseOrderByCreatedAtDesc(String schoolName);
    List<Complaint> findByCategoryAndLocationIgnoreCase(ComplaintCategory category,String location);
}
