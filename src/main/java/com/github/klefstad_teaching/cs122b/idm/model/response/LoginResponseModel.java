package com.github.klefstad_teaching.cs122b.idm.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;

public class LoginResponseModel extends BasicResponseModel {
    private String accessToken;
    private String refreshToken;

    public String getAccessToken() {
        return accessToken;
    }

    public LoginResponseModel setAccessToken(String accessToken) {
        this.accessToken = accessToken;
        return this;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public LoginResponseModel setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
        return this;
    }
}
