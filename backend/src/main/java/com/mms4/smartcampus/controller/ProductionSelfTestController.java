package com.mms4.smartcampus.controller;

import com.mms4.smartcampus.model.*;
import com.mms4.smartcampus.repository.*;
import com.mms4.smartcampus.service.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/system")
public class ProductionSelfTestController {
  private final AuthService auth;
  private final ComplaintService complaints;
  private final UserRepository users;
  private final NotificationRepository notifications;
  private final ComplaintRepository complaintRepo;
  @Value("${SMOKE_TEST_TOKEN:}") private String smokeToken;

  public ProductionSelfTestController(AuthService auth, ComplaintService complaints, UserRepository users, NotificationRepository notifications, ComplaintRepository complaintRepo){
    this.auth=auth; this.complaints=complaints; this.users=users; this.notifications=notifications; this.complaintRepo=complaintRepo;
  }

  @GetMapping("/self_test_sc_prod_7f3c9d2a1b8e")
  public Map<String,Object> selfTest(){
    String suffix=UUID.randomUUID().toString().substring(0,8);
    String school="Production Test University";
    String studentEmail="student-"+suffix+"@example.test";
    String staffEmail="staff-"+suffix+"@example.test";
    String studentPass="TestStudent!"+suffix;
    String staffPass="TestStaff!"+suffix;
    String studentToken=null, staffToken=null;
    UserAccount student=null, staff=null; Complaint c=null;
    List<String> steps=new ArrayList<>();
    try{
      student=auth.register("Production Test Student",studentEmail,studentPass,school,"Main Campus","University","Lagos");
      steps.add("student signup PASS");
      studentToken=auth.login(studentEmail,studentPass);
      UserAccount studentSession=auth.require("Bearer "+studentToken);
      if(!school.equals(studentSession.getSchoolName())) throw new IllegalStateException("school identity missing");
      steps.add("login + school selection PASS");

      c=new Complaint();
      c.setTitle("Production smoke test issue");
      c.setDescription("Automated production verification of complaint, routing and map persistence.");
      c.setLocation("Main Library");
      c.setCategory(ComplaintCategory.ICT);
      c.setPriority("HIGH");
      c.setMapX(42.5); c.setMapY(61.25); c.setMapLabel("Main Library");
      c=complaints.create(c,studentSession);
      Long id=c.getId();
      steps.add("complaint submission PASS");

      Complaint persisted=complaints.findById(id);
      if(!school.equals(persisted.getSchoolName()) || persisted.getMapX()==null || persisted.getMapY()==null) throw new IllegalStateException("map or school persistence failed");
      steps.add("map tagging + persistence PASS");

      boolean mine=complaints.mine(studentEmail).stream().anyMatch(x->x.getId().equals(id));
      if(!mine) throw new IllegalStateException("tracking list missing complaint");
      steps.add("student tracking PASS");

      staff=new UserAccount();
      staff.setName("Production Test Staff"); staff.setEmail(staffEmail); staff.setPasswordHash(auth.hash(staffPass));
      staff.setRole("STAFF"); staff.setDepartment("ICT Services"); staff.setSchoolName(school); staff.setCampusName("Main Campus");
      staff.setSchoolType("University"); staff.setSchoolState("Lagos");
      staff=auth.save(staff);
      staffToken=auth.login(staffEmail,staffPass);
      UserAccount staffSession=auth.require("Bearer "+staffToken);
      auth.requireRole(staffSession,"STAFF","ADMIN");
      boolean visible=complaints.forUser(staffSession).stream().anyMatch(x->x.getId().equals(id));
      if(!visible) throw new IllegalStateException("school-scoped staff queue missing complaint");
      complaints.assign(id,staffSession.getName(),"ICT Services",staffSession);
      complaints.updateStatus(id,ComplaintStatus.IN_PROGRESS,staffSession);
      Complaint resolved=complaints.updateStatus(id,ComplaintStatus.RESOLVED,staffSession);
      if(resolved.getResolvedAt()==null) throw new IllegalStateException("resolution timestamp missing");
      steps.add("staff routing + assignment + workflow PASS");

      complaints.feedback(id,5,"Automated production test",studentSession);
      steps.add("student feedback PASS");

      return new LinkedHashMap<>(Map.of(
        "ok",true,
        "complaintId",id,
        "steps",steps,
        "school",school,
        "map",Map.of("x",persisted.getMapX(),"y",persisted.getMapY(),"label",persisted.getMapLabel()),
        "finalStatus",complaints.findById(id).getStatus().name()
      ));
    } finally {
      try{ if(c!=null&&c.getId()!=null) complaintRepo.deleteById(c.getId()); }catch(Exception ignored){}
      try{ if(studentToken!=null) auth.logout("Bearer "+studentToken); }catch(Exception ignored){}
      try{ if(staffToken!=null) auth.logout("Bearer "+staffToken); }catch(Exception ignored){}
      try{ if(student!=null) users.deleteById(student.getId()); }catch(Exception ignored){}
      try{ if(staff!=null) users.deleteById(staff.getId()); }catch(Exception ignored){}
      try{ notifications.deleteAll(notifications.findByRecipientEmailOrderByCreatedAtDesc(studentEmail)); }catch(Exception ignored){}
      try{ notifications.deleteAll(notifications.findByRecipientEmailOrderByCreatedAtDesc(staffEmail)); }catch(Exception ignored){}
    }
  }
}
