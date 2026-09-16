package com.mms4.smartcampus.repository;

import com.mms4.smartcampus.model.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthSessionRepository extends JpaRepository<AuthSession,String>{}
