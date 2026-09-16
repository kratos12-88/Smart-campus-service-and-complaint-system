package com.mms4.smartcampus.controller;

import com.mms4.smartcampus.model.ComplaintStatus;
import com.mms4.smartcampus.model.UserAccount;
import com.mms4.smartcampus.repository.ComplaintRepository;
import com.mms4.smartcampus.service.AuthService;
import com.mms4.smartcampus.service.ComplaintService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins={"http://localhost:5173","https://smart-campus-service-and-complaint.vercel.app"})
public class DashboardController {
    private final ComplaintRepository repository;
    private final ComplaintService complaints;
    private final AuthService auth;
    public DashboardController(ComplaintRepository repository,ComplaintService complaints,AuthService auth){this.repository=repository;this.complaints=complaints;this.auth=auth;}

    @GetMapping("/summary")
    public Map<String,Long> summary(){Map<String,Long>d=new LinkedHashMap<>();d.put("total",repository.count());d.put("submitted",repository.countByStatus(ComplaintStatus.SUBMITTED));d.put("assigned",repository.countByStatus(ComplaintStatus.ASSIGNED));d.put("inProgress",repository.countByStatus(ComplaintStatus.IN_PROGRESS));d.put("resolved",repository.countByStatus(ComplaintStatus.RESOLVED));return d;}

    @GetMapping("/analytics")
    public Map<String,Object> analytics(@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);auth.requireRole(u,"STAFF","ADMIN");return complaints.analytics();}
}
