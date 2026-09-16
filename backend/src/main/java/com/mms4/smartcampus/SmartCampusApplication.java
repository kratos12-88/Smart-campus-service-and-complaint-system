package com.mms4.smartcampus;

import com.mms4.smartcampus.model.UserAccount;
import com.mms4.smartcampus.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SmartCampusApplication {
    public static void main(String[] args){SpringApplication.run(SmartCampusApplication.class,args);}

    @Bean
    CommandLineRunner seedUsers(AuthService auth){return args->{
        seed(auth,"Student Demo","student@campus.edu","Student123!","STUDENT",null);
        seed(auth,"ICT Support Officer","staff@campus.edu","Staff123!","STAFF","ICT Services");
        seed(auth,"System Administrator","admin@campus.edu","Admin123!","ADMIN","Administration");
    };}

    private void seed(AuthService auth,String name,String email,String password,String role,String department){
        if(auth.findByEmail(email)!=null)return;
        UserAccount u=new UserAccount();u.setName(name);u.setEmail(email);u.setPasswordHash(auth.hash(password));u.setRole(role);u.setDepartment(department);auth.save(u);
    }
}
