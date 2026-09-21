package com.mms4.smartcampus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="users", uniqueConstraints=@UniqueConstraint(columnNames="email"))
public class UserAccount {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false, unique=true) private String email;
    @Column(nullable=false) private String passwordHash;
    @Column(nullable=false) private String role = "STUDENT";
    private String department;
    private String schoolName;
    private String campusName;
    private String schoolType;
    private String schoolState;
    private boolean active = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
    public String getRole(){return role;} public void setRole(String v){role=v;}
    public String getDepartment(){return department;} public void setDepartment(String v){department=v;}
    public String getSchoolName(){return schoolName;} public void setSchoolName(String v){schoolName=v;}
    public String getCampusName(){return campusName;} public void setCampusName(String v){campusName=v;}
    public String getSchoolType(){return schoolType;} public void setSchoolType(String v){schoolType=v;}
    public String getSchoolState(){return schoolState;} public void setSchoolState(String v){schoolState=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
