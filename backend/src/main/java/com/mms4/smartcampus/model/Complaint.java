package com.mms4.smartcampus.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
public class Complaint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String title;
    @NotBlank @Column(length = 4000) private String description;
    @NotBlank private String location;
    @NotNull @Enumerated(EnumType.STRING) private ComplaintCategory category;
    @Enumerated(EnumType.STRING) private ComplaintStatus status = ComplaintStatus.SUBMITTED;
    private String submittedBy;
    private String submittedByEmail;
    private String assignedTo;
    private String department;
    private String priority = "MEDIUM";
    private Integer slaHours = 48;
    private String evidenceName;
    private String evidenceType;
    @Lob @Column(columnDefinition = "TEXT") private String evidenceData;
    private Integer rating;
    @Column(length = 2000) private String feedback;
    private Integer reopenedCount = 0;
    private LocalDateTime dueAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name="complaint_comments", joinColumns=@JoinColumn(name="complaint_id"))
    @Column(name="comment_text", length=3000)
    private List<String> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name="complaint_audit", joinColumns=@JoinColumn(name="complaint_id"))
    @Column(name="event_text", length=2000)
    private List<String> auditTrail = new ArrayList<>();

    @PrePersist void onCreate(){
        createdAt=LocalDateTime.now(); updatedAt=createdAt;
        if(status==null) status=ComplaintStatus.SUBMITTED;
        if(slaHours==null) slaHours=48;
        if(reopenedCount==null) reopenedCount=0;
        dueAt=createdAt.plusHours(slaHours);
        auditTrail.add(createdAt+"|SYSTEM|Complaint submitted");
    }
    @PreUpdate void onUpdate(){ updatedAt=LocalDateTime.now(); }

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public String getLocation(){return location;} public void setLocation(String v){location=v;}
    public ComplaintCategory getCategory(){return category;} public void setCategory(ComplaintCategory v){category=v;}
    public ComplaintStatus getStatus(){return status;} public void setStatus(ComplaintStatus v){status=v;}
    public String getSubmittedBy(){return submittedBy;} public void setSubmittedBy(String v){submittedBy=v;}
    public String getSubmittedByEmail(){return submittedByEmail;} public void setSubmittedByEmail(String v){submittedByEmail=v;}
    public String getAssignedTo(){return assignedTo;} public void setAssignedTo(String v){assignedTo=v;}
    public String getDepartment(){return department;} public void setDepartment(String v){department=v;}
    public String getPriority(){return priority;} public void setPriority(String v){priority=v;}
    public Integer getSlaHours(){return slaHours;} public void setSlaHours(Integer v){slaHours=v;}
    public String getEvidenceName(){return evidenceName;} public void setEvidenceName(String v){evidenceName=v;}
    public String getEvidenceType(){return evidenceType;} public void setEvidenceType(String v){evidenceType=v;}
    public String getEvidenceData(){return evidenceData;} public void setEvidenceData(String v){evidenceData=v;}
    public Integer getRating(){return rating;} public void setRating(Integer v){rating=v;}
    public String getFeedback(){return feedback;} public void setFeedback(String v){feedback=v;}
    public Integer getReopenedCount(){return reopenedCount;} public void setReopenedCount(Integer v){reopenedCount=v;}
    public LocalDateTime getDueAt(){return dueAt;} public void setDueAt(LocalDateTime v){dueAt=v;}
    public LocalDateTime getResolvedAt(){return resolvedAt;} public void setResolvedAt(LocalDateTime v){resolvedAt=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
    public List<String> getComments(){return comments;} public void setComments(List<String> v){comments=v;}
    public List<String> getAuditTrail(){return auditTrail;} public void setAuditTrail(List<String> v){auditTrail=v;}
}
