package com.github.klefstad_teaching.cs122b.idm.util;

import org.springframework.stereotype.Component;

@Component
public final class Validate
{
    public boolean passwordMeetsLengthRequirement(char[] password) {
        return password.length >= 10 && password.length <= 20;
    }

    public boolean emailMeetsLengthRequirement(String email) {
        return email.length() >= 6 && email.length() <= 32;
    }

    public boolean passwordMeetsCharacterRequirement(char[] password) {
        return new String(password).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{10,20}$");
    }

    public boolean emailMeetsCharacterRequirement(String email) {
        return email.matches("^([a-zA-Z0-9]+)@([a-zA-Z0-9]+)\\.([a-zA-Z0-9]+)$");
    }
}
