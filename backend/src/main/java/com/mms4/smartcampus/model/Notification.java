package com.mms4.smartcampus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="notifications")
public class Notification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private String recipientEmail;
    @Column(length=2000) private String message;
    private String type;
    private Long complaintId;
    private boolean readFlag = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getRecipientEmail(){return recipientEmail;} public void setRecipientEmail(String v){recipientEmail=v;}
    public String getMessage(){return message;} public void setMessage(String v){message=v;}
    public String getType(){return type;} public void setType(String v){type=v;}
    public Long getComplaintId(){return complaintId;} public void setComplaintId(Long v){complaintId=v;}
    public boolean isReadFlag(){return readFlag;} public void setReadFlag(boolean v){readFlag=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
