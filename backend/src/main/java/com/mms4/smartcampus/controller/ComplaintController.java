package com.mms4.smartcampus.controller;

import com.mms4.smartcampus.model.*;
import com.mms4.smartcampus.service.AuthService;
import com.mms4.smartcampus.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins={"http://localhost:5173","https://smart-campus-service-and-complaint.vercel.app"})
public class ComplaintController {
    private final ComplaintService service;
    private final AuthService auth;
    public ComplaintController(ComplaintService service,AuthService auth){this.service=service;this.auth=auth;}

    @GetMapping
    public List<Complaint> all(@RequestHeader(value="Authorization",required=false)String h){UserAccount u=auth.optional(h);if(u!=null&&("STAFF".equals(u.getRole())||"ADMIN".equals(u.getRole())))return service.findAll();return service.recent();}
    @GetMapping("/recent") public List<Complaint> recent(){return service.recent();}
    @GetMapping("/mine") public List<Complaint> mine(@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);return service.mine(u.getEmail());}
    @GetMapping("/{id}") public Complaint one(@PathVariable Long id){return service.findById(id);}

    @PostMapping
    public Complaint create(@Valid @RequestBody Complaint complaint,@RequestHeader(value="Authorization",required=false)String h){return service.create(complaint,auth.optional(h));}

    @GetMapping("/duplicates/check")
    public List<Complaint> duplicates(@RequestParam ComplaintCategory category,@RequestParam String location,@RequestParam(required=false)String title){return service.duplicates(category,location,title);}

    @PutMapping("/{id}/status")
    public Complaint updateStatus(@PathVariable Long id,@RequestBody Map<String,String> body,@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);auth.requireRole(u,"STAFF","ADMIN");return service.updateStatus(id,ComplaintStatus.valueOf(body.get("status").toUpperCase()),u);}

    @PutMapping("/{id}/assignment")
    public Complaint assign(@PathVariable Long id,@RequestBody Map<String,String> body,@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);auth.requireRole(u,"STAFF","ADMIN");return service.assign(id,body.getOrDefault("assignedTo",u.getName()),body.get("department"),u);}

    @PostMapping("/{id}/comments")
    public Complaint comment(@PathVariable Long id,@RequestBody Map<String,String> body,@RequestHeader(value="Authorization",required=false)String h){return service.comment(id,body.get("text"),auth.optional(h));}

    @PostMapping("/{id}/feedback")
    public Complaint feedback(@PathVariable Long id,@RequestBody Map<String,Object> body,@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);int rating=Integer.parseInt(String.valueOf(body.get("rating")));return service.feedback(id,rating,String.valueOf(body.getOrDefault("feedback","")),u);}

    @PostMapping("/{id}/reopen")
    public Complaint reopen(@PathVariable Long id,@RequestBody(required=false)Map<String,String> body,@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);return service.reopen(id,body==null?null:body.get("reason"),u);}

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);auth.requireRole(u,"ADMIN");service.delete(id);}
}
