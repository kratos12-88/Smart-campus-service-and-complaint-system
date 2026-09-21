package com.mms4.smartcampus.repository;

import com.mms4.smartcampus.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<UserAccount,Long>{
    Optional<UserAccount> findByEmailIgnoreCase(String email);
    List<UserAccount> findBySchoolNameIgnoreCaseAndRoleIn(String schoolName, List<String> roles);
}
