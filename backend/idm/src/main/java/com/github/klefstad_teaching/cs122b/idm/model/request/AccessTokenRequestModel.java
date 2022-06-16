package com.github.klefstad_teaching.cs122b.idm.model.request;

public class AccessTokenRequestModel {
    private String accessToken;

    public String getAccessToken() {
        return accessToken;
    }

    public AccessTokenRequestModel setAccessToken(String accessToken) {
        this.accessToken = accessToken;
        return this;
    }
}
