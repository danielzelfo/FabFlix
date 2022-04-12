package com.github.klefstad_teaching.cs122b.idm.model.request;

public class RegisterLoginRequestModel {
    String email;
    char[] password;

    public String getEmail() {
        return email;
    }

    public RegisterLoginRequestModel setEmail(String email) {
        this.email = email;
        return this;
    }

    public char[] getPassword() {
        return password;
    }

    public RegisterLoginRequestModel setPassword(char[] password) {
        this.password = password;
        return this;
    }
}
