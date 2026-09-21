package com.mms4.smartcampus.controller;

import com.mms4.smartcampus.model.Notification;
import com.mms4.smartcampus.model.UserAccount;
import com.mms4.smartcampus.repository.NotificationRepository;
import com.mms4.smartcampus.service.AuthService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins={"http://localhost:5173","https://smart-campus-service-and-complaint.vercel.app"})
public class AuthController {
    private final AuthService auth;
    private final NotificationRepository notifications;
    public AuthController(AuthService auth,NotificationRepository notifications){this.auth=auth;this.notifications=notifications;}

    @PostMapping("/register")
    public Map<String,Object> register(@RequestBody Map<String,String> b){UserAccount u=auth.register(b.get("name"),b.get("email"),b.get("password"),b.get("schoolName"),b.get("campusName"),b.get("schoolType"),b.get("schoolState"));String token=auth.login(u.getEmail(),b.get("password"));return session(u,token);}

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Map<String,String> b){String token=auth.login(b.get("email"),b.get("password"));UserAccount u=auth.require("Bearer "+token);return session(u,token);}

    @GetMapping("/me")
    public Map<String,Object> me(@RequestHeader("Authorization")String h){return userMap(auth.require(h));}

    @PostMapping("/logout") public void logout(@RequestHeader("Authorization")String h){auth.logout(h);}

    @GetMapping("/notifications")
    public List<Notification> notifications(@RequestHeader("Authorization")String h){UserAccount u=auth.require(h);return notifications.findByRecipientEmailOrderByCreatedAtDesc(u.getEmail());}

    @PutMapping("/notifications/{id}/read")
    public Notification read(@PathVariable Long id,@RequestHeader("Authorization")String h){auth.require(h);Notification n=notifications.findById(id).orElseThrow();n.setReadFlag(true);return notifications.save(n);}

    private Map<String,Object> session(UserAccount u,String token){Map<String,Object> m=userMap(u);m.put("token",token);return m;}
    private Map<String,Object> userMap(UserAccount u){Map<String,Object> m=new LinkedHashMap<>();m.put("id",u.getId());m.put("name",u.getName());m.put("email",u.getEmail());m.put("role",u.getRole());m.put("department",u.getDepartment());m.put("schoolName",u.getSchoolName());m.put("campusName",u.getCampusName());m.put("schoolType",u.getSchoolType());m.put("schoolState",u.getSchoolState());return m;}
}
