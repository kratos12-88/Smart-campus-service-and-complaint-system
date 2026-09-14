package com.mms4.smartcampus.controller;

import com.mms4.smartcampus.model.ComplaintStatus;
import com.mms4.smartcampus.repository.ComplaintRepository;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {
    private final ComplaintRepository repository;

    public DashboardController(ComplaintRepository repository) { this.repository = repository; }

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        Map<String, Long> data = new LinkedHashMap<>();
        data.put("total", repository.count());
        data.put("submitted", repository.countByStatus(ComplaintStatus.SUBMITTED));
        data.put("assigned", repository.countByStatus(ComplaintStatus.ASSIGNED));
        data.put("inProgress", repository.countByStatus(ComplaintStatus.IN_PROGRESS));
        data.put("resolved", repository.countByStatus(ComplaintStatus.RESOLVED));
        return data;
    }
}
