package com.mms4.smartcampus.service;

import com.mms4.smartcampus.model.*;
import com.mms4.smartcampus.repository.ComplaintRepository;
import com.mms4.smartcampus.repository.NotificationRepository;
import com.mms4.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.*;

@Service
public class ComplaintService {
    private final ComplaintRepository repository;
    private final NotificationRepository notifications;
    private final UserRepository users;
    public ComplaintService(ComplaintRepository repository,NotificationRepository notifications,UserRepository users){this.repository=repository;this.notifications=notifications;this.users=users;}

    public List<Complaint> findAll(){return repository.findAll();}
    public List<Complaint> forUser(UserAccount user){if(user==null)return recent();if("ADMIN".equalsIgnoreCase(user.getRole())&& (user.getSchoolName()==null||user.getSchoolName().isBlank()))return findAll();if(("STAFF".equalsIgnoreCase(user.getRole())||"ADMIN".equalsIgnoreCase(user.getRole()))&&user.getSchoolName()!=null&&!user.getSchoolName().isBlank())return repository.findBySchoolNameIgnoreCaseOrderByCreatedAtDesc(user.getSchoolName());return recent();}
    public List<Complaint> recent(){return repository.findTop20ByOrderByCreatedAtDesc();}
    public List<Complaint> mine(String email){return repository.findBySubmittedByEmailIgnoreCaseOrderByCreatedAtDesc(email);}
    public Complaint findById(Long id){return repository.findById(id).orElseThrow(()->new IllegalArgumentException("Complaint not found: "+id));}

    public Complaint create(Complaint c,UserAccount user){
        c.setId(null);c.setStatus(ComplaintStatus.SUBMITTED);
        if(user!=null){c.setSubmittedBy(user.getName());c.setSubmittedByEmail(user.getEmail());c.setSchoolName(user.getSchoolName());c.setCampusName(user.getCampusName());}
        if(c.getSchoolName()==null||c.getSchoolName().isBlank()) throw new IllegalArgumentException("School is required. Sign in or provide your school before reporting.");
        c.setSlaHours(slaFor(c.getCategory()));c.setDepartment(departmentFor(c.getCategory()));
        Complaint saved=repository.save(c);notify(saved.getSubmittedByEmail(),"Complaint #"+saved.getId()+" submitted successfully","SUBMITTED",saved.getId());notifySchool(saved);return saved;
    }

    public Complaint updateStatus(Long id,ComplaintStatus status,UserAccount actor){
        Complaint c=findById(id);ComplaintStatus old=c.getStatus();c.setStatus(status);
        if(status==ComplaintStatus.RESOLVED)c.setResolvedAt(LocalDateTime.now());
        if(status!=ComplaintStatus.RESOLVED&&old==ComplaintStatus.RESOLVED)c.setResolvedAt(null);
        audit(c,actor,"Status changed from "+old+" to "+status);
        Complaint saved=repository.save(c);notify(c.getSubmittedByEmail(),"Complaint #"+id+" is now "+status.toString().replace('_',' '),"STATUS",id);return saved;
    }

    public Complaint assign(Long id,String assignedTo,String department,UserAccount actor){
        Complaint c=findById(id);c.setAssignedTo(assignedTo);if(department!=null&&!department.isBlank())c.setDepartment(department);if(c.getStatus()==ComplaintStatus.SUBMITTED)c.setStatus(ComplaintStatus.ASSIGNED);audit(c,actor,"Assigned to "+assignedTo);Complaint saved=repository.save(c);notify(c.getSubmittedByEmail(),"Complaint #"+id+" has been assigned to "+assignedTo,"ASSIGNED",id);return saved;
    }

    public Complaint comment(Long id,String text,UserAccount actor){
        if(text==null||text.isBlank())throw new IllegalArgumentException("Comment cannot be empty");Complaint c=findById(id);String by=actor==null?"Guest":actor.getName();c.getComments().add(LocalDateTime.now()+"|"+by+"|"+text.trim());audit(c,actor,"Comment added");Complaint saved=repository.save(c);notify(c.getSubmittedByEmail(),"New comment on complaint #"+id,"COMMENT",id);return saved;
    }

    public Complaint feedback(Long id,int rating,String feedback,UserAccount user){
        if(rating<1||rating>5)throw new IllegalArgumentException("Rating must be between 1 and 5");Complaint c=findById(id);if(user!=null&&c.getSubmittedByEmail()!=null&&!c.getSubmittedByEmail().equalsIgnoreCase(user.getEmail()))throw new IllegalArgumentException("Only the submitting student can rate this complaint");c.setRating(rating);c.setFeedback(feedback);audit(c,user,"Resolution rated "+rating+"/5");return repository.save(c);
    }

    public Complaint reopen(Long id,String reason,UserAccount user){
        Complaint c=findById(id);if(c.getStatus()!=ComplaintStatus.RESOLVED&&c.getStatus()!=ComplaintStatus.CLOSED)throw new IllegalArgumentException("Only resolved complaints can be reopened");c.setStatus(ComplaintStatus.IN_PROGRESS);c.setResolvedAt(null);c.setReopenedCount(c.getReopenedCount()==null?1:c.getReopenedCount()+1);c.setDueAt(LocalDateTime.now().plusHours(Math.max(12,c.getSlaHours()/2)));audit(c,user,"Complaint reopened: "+(reason==null?"No reason provided":reason));notify(c.getSubmittedByEmail(),"Complaint #"+id+" was reopened","REOPENED",id);return repository.save(c);
    }

    public List<Complaint> duplicates(ComplaintCategory category,String location,String title){
        if(category==null||location==null)return List.of();String needle=title==null?"":title.toLowerCase();return repository.findByCategoryAndLocationIgnoreCase(category,location).stream().filter(c->!Set.of(ComplaintStatus.RESOLVED,ComplaintStatus.CLOSED,ComplaintStatus.REJECTED).contains(c.getStatus())).filter(c->needle.isBlank()||c.getTitle().toLowerCase().contains(needle)||needle.contains(c.getTitle().toLowerCase())).limit(5).toList();
    }

    public Map<String,Object> analytics(){
        List<Complaint> all=findAll();long overdue=all.stream().filter(c->!Set.of(ComplaintStatus.RESOLVED,ComplaintStatus.CLOSED,ComplaintStatus.REJECTED).contains(c.getStatus())&&c.getDueAt()!=null&&c.getDueAt().isBefore(LocalDateTime.now())).count();double avg=all.stream().filter(c->c.getResolvedAt()!=null&&c.getCreatedAt()!=null).mapToLong(c->Duration.between(c.getCreatedAt(),c.getResolvedAt()).toMinutes()).average().orElse(0)/60.0;double rating=all.stream().filter(c->c.getRating()!=null).mapToInt(Complaint::getRating).average().orElse(0);Map<String,Long> byCategory=new LinkedHashMap<>();for(ComplaintCategory cat:ComplaintCategory.values())byCategory.put(cat.name(),all.stream().filter(c->c.getCategory()==cat).count());Map<String,Long> byLocation=new LinkedHashMap<>();all.stream().map(Complaint::getLocation).filter(Objects::nonNull).distinct().forEach(l->byLocation.put(l,all.stream().filter(c->l.equals(c.getLocation())).count()));return Map.of("total",all.size(),"overdue",overdue,"averageResolutionHours",Math.round(avg*10)/10.0,"averageRating",Math.round(rating*10)/10.0,"byCategory",byCategory,"byLocation",byLocation);
    }

    public boolean isOverdue(Complaint c){return c.getDueAt()!=null&&c.getDueAt().isBefore(LocalDateTime.now())&&!Set.of(ComplaintStatus.RESOLVED,ComplaintStatus.CLOSED,ComplaintStatus.REJECTED).contains(c.getStatus());}
    public void delete(Long id){repository.deleteById(id);}
    private void audit(Complaint c,UserAccount actor,String action){c.getAuditTrail().add(LocalDateTime.now()+"|"+(actor==null?"SYSTEM":actor.getName())+"|"+action);}
    private void notify(String email,String message,String type,Long complaintId){if(email==null||email.isBlank())return;Notification n=new Notification();n.setRecipientEmail(email);n.setMessage(message);n.setType(type);n.setComplaintId(complaintId);notifications.save(n);}
    private void notifySchool(Complaint c){if(c.getSchoolName()==null||c.getSchoolName().isBlank())return;for(UserAccount u:users.findBySchoolNameIgnoreCaseAndRoleIn(c.getSchoolName(),List.of("STAFF","ADMIN")))notify(u.getEmail(),"New "+c.getCategory().name().replace('_',' ')+" complaint #"+c.getId()+" at "+c.getLocation(),"SCHOOL_REPORT",c.getId());}
    private int slaFor(ComplaintCategory c){if(c==null)return 48;return switch(c){case SECURITY->1;case ICT->12;case WATER->24;case ELECTRICITY->24;case HOSTEL_MAINTENANCE->72;case CLASSROOM->48;default->48;};}
    private String departmentFor(ComplaintCategory c){if(c==null)return"General Services";return switch(c){case SECURITY->"Campus Security";case ICT->"ICT Services";case WATER,ELECTRICITY->"Facilities & Maintenance";case HOSTEL_MAINTENANCE->"Student Affairs";case CLASSROOM->"Academic Facilities";default->"General Services";};}
}
