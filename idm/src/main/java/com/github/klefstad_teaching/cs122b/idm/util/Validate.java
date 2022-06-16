package com.github.klefstad_teaching.cs122b.idm.util;

import com.github.klefstad_teaching.cs122b.idm.repo.entity.RefreshToken;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.type.TokenStatus;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Component;
import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

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

    public boolean signedJWTExpired(SignedJWT signedJWT) throws ParseException {
        return signedJWT.getJWTClaimsSet().getExpirationTime().before(Date.from(Instant.now()));
    }

    public boolean refreshTokenExpireTimePastMax(RefreshToken refreshToken) {
        return refreshToken.getExpireTime().isAfter(refreshToken.getMaxLifeTime());
    }

    public boolean refreshTokenHasValidLength(String refreshToken) {
        return refreshToken.length() == 36;
    }

    public boolean refreshTokenHasValidFormat(String refreshToken) {
        try {
            return UUID.fromString(refreshToken).toString().equals(refreshToken);
        } catch (IllegalArgumentException exception) {
            return false;
        }

    }

    public boolean refreshTokenStatusExpired(RefreshToken refreshToken) {
        return refreshToken.getTokenStatus().equals(TokenStatus.EXPIRED);
    }

    public boolean refreshTokenStatusRevoked(RefreshToken refreshToken) {
        return refreshToken.getTokenStatus().equals(TokenStatus.REVOKED);
    }

    public boolean refreshTokenCanRefresh(RefreshToken refreshToken) {
        return refreshToken.getExpireTime().isAfter(Instant.now()) && refreshToken.getMaxLifeTime().isAfter(Instant.now());
    }
}
