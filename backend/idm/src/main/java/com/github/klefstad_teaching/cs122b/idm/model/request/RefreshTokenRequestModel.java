package com.github.klefstad_teaching.cs122b.idm.model.request;

public class RefreshTokenRequestModel {
    private String refreshToken;

    public String getRefreshToken() {
        return refreshToken;
    }

    public RefreshTokenRequestModel setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
        return this;
    }
}
