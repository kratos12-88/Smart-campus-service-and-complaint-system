package com.mms4.smartcampus.service;

import com.mms4.smartcampus.model.Complaint;
import com.mms4.smartcampus.model.ComplaintStatus;
import com.mms4.smartcampus.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ComplaintService {
    private final ComplaintRepository repository;

    public ComplaintService(ComplaintRepository repository) {
        this.repository = repository;
    }

    public List<Complaint> findAll() { return repository.findAll(); }

    public Complaint findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + id));
    }

    public Complaint create(Complaint complaint) {
        complaint.setId(null);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        return repository.save(complaint);
    }

    public Complaint updateStatus(Long id, ComplaintStatus status) {
        Complaint complaint = findById(id);
        complaint.setStatus(status);
        return repository.save(complaint);
    }

    public void delete(Long id) { repository.deleteById(id); }
}
