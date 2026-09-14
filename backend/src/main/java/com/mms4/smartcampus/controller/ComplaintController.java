package com.mms4.smartcampus.controller;

import com.mms4.smartcampus.model.Complaint;
import com.mms4.smartcampus.model.ComplaintStatus;
import com.mms4.smartcampus.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://smart-campus-service-and-complaint.vercel.app"
})
public class ComplaintController {
    private final ComplaintService service;

    public ComplaintController(ComplaintService service) { this.service = service; }

    @GetMapping
    public List<Complaint> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public Complaint one(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Complaint create(@Valid @RequestBody Complaint complaint) { return service.create(complaint); }

    @PutMapping("/{id}/status")
    public Complaint updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        ComplaintStatus status = ComplaintStatus.valueOf(payload.get("status").toUpperCase());
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
