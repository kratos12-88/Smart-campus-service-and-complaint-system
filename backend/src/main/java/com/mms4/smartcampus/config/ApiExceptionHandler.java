package com.mms4.smartcampus.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,Object>> badRequest(IllegalArgumentException ex){
        return ResponseEntity.badRequest().body(Map.of("message",ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex){
        Map<String,Object> body=new LinkedHashMap<>();body.put("message","Please check the highlighted fields and try again.");
        body.put("fields",ex.getBindingResult().getFieldErrors().stream().collect(java.util.stream.Collectors.toMap(e->e.getField(),e->e.getDefaultMessage()==null?"Invalid value":e.getDefaultMessage(),(a,b)->a)));
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> server(Exception ex){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message","The service could not complete this request right now."));
    }
}
