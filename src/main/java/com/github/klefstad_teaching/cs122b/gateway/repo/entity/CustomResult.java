package com.github.klefstad_teaching.cs122b.gateway.repo.entity;

import org.springframework.http.HttpStatus;

public class CustomResult {
    private Integer code;
    private String message;
    private HttpStatus status;

    public Integer getCode() {
        return code;
    }

    public CustomResult setCode(Integer code) {
        this.code = code;
        return this;
    }

    public String getMessage() {
        return message;
    }

    public CustomResult setMessage(String message) {
        this.message = message;
        return this;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public CustomResult setStatus(HttpStatus status) {
        this.status = status;
        return this;
    }
}
