package com.github.klefstad_teaching.cs122b.idm.model.request;

public class CredentialsRequestModel {
    String email;
    char[] password;

    public String getEmail() {
        return email;
    }

    public CredentialsRequestModel setEmail(String email) {
        this.email = email;
        return this;
    }

    public char[] getPassword() {
        return password;
    }

    public CredentialsRequestModel setPassword(char[] password) {
        this.password = password;
        return this;
    }
}
