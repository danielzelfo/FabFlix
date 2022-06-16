package com.github.klefstad_teaching.cs122b.gateway.model.response;

import com.github.klefstad_teaching.cs122b.gateway.repo.entity.CustomResult;

public class AuthResponse {
    private CustomResult result;

    public CustomResult getResult() {
        return result;
    }

    public AuthResponse setResult(CustomResult result) {
        this.result = result;
        return this;
    }
}
