package com.mms4.smartcampus.service;

import com.mms4.smartcampus.model.AuthSession;
import com.mms4.smartcampus.model.UserAccount;
import com.mms4.smartcampus.repository.AuthSessionRepository;
import com.mms4.smartcampus.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository users;
    private final AuthSessionRepository sessions;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository users, AuthSessionRepository sessions){this.users=users;this.sessions=sessions;}

    public UserAccount register(String name,String email,String password,String schoolName,String campusName){
        if(email==null||password==null||name==null||schoolName==null||schoolName.isBlank()) throw new IllegalArgumentException("Name, email, password and school are required");
        if(users.findByEmailIgnoreCase(email).isPresent()) throw new IllegalArgumentException("An account with that email already exists");
        UserAccount u=new UserAccount();u.setName(name.trim());u.setEmail(email.trim().toLowerCase());u.setPasswordHash(encoder.encode(password));u.setRole("STUDENT");u.setSchoolName(schoolName.trim());u.setCampusName(campusName==null?"":campusName.trim());return users.save(u);
    }

    public String login(String email,String password){
        UserAccount u=users.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("Invalid email or password"));
        if(!u.isActive()||!encoder.matches(password,u.getPasswordHash())) throw new IllegalArgumentException("Invalid email or password");
        AuthSession s=new AuthSession();s.setToken(UUID.randomUUID().toString()+UUID.randomUUID());s.setUser(u);s.setExpiresAt(LocalDateTime.now().plusDays(7));sessions.save(s);return s.getToken();
    }

    public UserAccount require(String authorization){
        String token=bearer(authorization);
        AuthSession s=sessions.findById(token).orElseThrow(()->new IllegalArgumentException("Authentication required"));
        if(s.getExpiresAt()==null||s.getExpiresAt().isBefore(LocalDateTime.now())){sessions.delete(s);throw new IllegalArgumentException("Session expired");}
        return s.getUser();
    }

    public UserAccount optional(String authorization){try{return require(authorization);}catch(Exception e){return null;}}
    public void requireRole(UserAccount u,String...roles){for(String r:roles)if(r.equalsIgnoreCase(u.getRole()))return;throw new IllegalArgumentException("You do not have permission for this action");}
    public void logout(String authorization){sessions.deleteById(bearer(authorization));}
    public UserAccount findByEmail(String email){return users.findByEmailIgnoreCase(email).orElse(null);}
    public UserAccount save(UserAccount u){return users.save(u);}
    public String hash(String password){return encoder.encode(password);}
    private String bearer(String h){if(h==null||!h.startsWith("Bearer "))throw new IllegalArgumentException("Authentication required");return h.substring(7).trim();}
}
