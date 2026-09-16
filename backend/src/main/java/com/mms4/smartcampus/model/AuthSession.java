package com.mms4.smartcampus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="auth_sessions")
public class AuthSession {
    @Id private String token;
    @ManyToOne(optional=false) private UserAccount user;
    private LocalDateTime expiresAt;
    public String getToken(){return token;} public void setToken(String v){token=v;}
    public UserAccount getUser(){return user;} public void setUser(UserAccount v){user=v;}
    public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime v){expiresAt=v;}
}
