package com.github.klefstad_teaching.cs122b.idm.component;

import com.github.klefstad_teaching.cs122b.core.security.JWTManager;
import com.github.klefstad_teaching.cs122b.idm.config.IDMServiceConfig;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.RefreshToken;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.User;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.type.TokenStatus;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class IDMJwtManager
{
    private final JWTManager jwtManager;

    @Autowired
    public IDMJwtManager(IDMServiceConfig serviceConfig)
    {
        this.jwtManager =
            new JWTManager.Builder()
                .keyFileName(serviceConfig.keyFileName())
                .accessTokenExpire(serviceConfig.accessTokenExpire())
                .maxRefreshTokenLifeTime(serviceConfig.maxRefreshTokenLifeTime())
                .refreshTokenExpire(serviceConfig.refreshTokenExpire())
                .build();
    }

    private SignedJWT buildAndSignJWT(JWTClaimsSet claimsSet)
        throws JOSEException
    {
        JWSHeader header =
                new JWSHeader.Builder(JWTManager.JWS_ALGORITHM)
                        .keyID(jwtManager.getEcKey().getKeyID())
                        .type(JWTManager.JWS_TYPE)
                        .build();

        SignedJWT signedJWT = new SignedJWT(header, claimsSet);
        signedJWT.sign(jwtManager.getSigner());

        return signedJWT;
    }

    private void verifyJWT(SignedJWT jwt)
            throws JOSEException, BadJOSEException {

        jwt.verify(jwtManager.getVerifier());
        jwtManager.getJwtProcessor().process(jwt, null);

    }

    public String buildAccessToken(User user)
    {
        try {
            JWTClaimsSet claimsSet =
                    new JWTClaimsSet.Builder()
                            .subject(user.getEmail())
                            .expirationTime(Date.from( Instant.now().plus(jwtManager.getAccessTokenExpire()) ) )
                            .issueTime(Date.from(Instant.now()))
                            .claim(JWTManager.CLAIM_ROLES, user.getRoles())
                            .claim(JWTManager.CLAIM_ID, user.getId())
                            .build();

            return buildAndSignJWT(claimsSet).serialize();
        } catch (IllegalStateException | JOSEException e) {
            return null;
        }
    }

    public void verifyAccessToken(String jws) throws ParseException, BadJOSEException, JOSEException {
        verifyJWT(SignedJWT.parse(jws));
    }

    public RefreshToken buildRefreshToken(User user)
    {
        String refreshTokenStr = UUID.randomUUID().toString();

        RefreshToken refreshToken = new RefreshToken()
                .setToken(refreshTokenStr)
                .setTokenStatus(TokenStatus.ACTIVE)
                .setUserId(user.getId())
                .setExpireTime(Instant.now().plus(jwtManager.getRefreshTokenExpire()))
                .setMaxLifeTime(Instant.now().plus(jwtManager.getMaxRefreshTokenLifeTime()));

        return refreshToken;
    }

    public boolean hasExpired(RefreshToken refreshToken)
    {
        return false;
    }

    public boolean needsRefresh(RefreshToken refreshToken)
    {
        return false;
    }

    public void updateRefreshTokenExpireTime(RefreshToken refreshToken)
    {

    }

    private UUID generateUUID()
    {
        return UUID.randomUUID();
    }
}
