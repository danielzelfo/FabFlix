package com.github.klefstad_teaching.cs122b.idm.rest;

import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.idm.component.IDMAuthenticationManager;
import com.github.klefstad_teaching.cs122b.idm.component.IDMJwtManager;
import com.github.klefstad_teaching.cs122b.idm.model.request.RefreshTokenRequestModel;
import com.github.klefstad_teaching.cs122b.idm.model.response.TokensResponseModel;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.RefreshToken;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.User;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.type.TokenStatus;
import com.github.klefstad_teaching.cs122b.idm.util.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
public class RefreshController {
    private final IDMAuthenticationManager authManager;
    private final IDMJwtManager jwtManager;
    private final Validate validate;

    @Autowired
    public RefreshController(IDMAuthenticationManager authManager,
                             IDMJwtManager jwtManager,
                             Validate validate) {
        this.authManager = authManager;
        this.jwtManager = jwtManager;
        this.validate = validate;
    }


    @PostMapping("/refresh")
    public ResponseEntity<TokensResponseModel> refresh(@RequestBody RefreshTokenRequestModel request) {

        String refreshTokenGiven = request.getRefreshToken();

        if (!validate.refreshTokenHasValidLength(refreshTokenGiven)) {
            throw new ResultError(IDMResults.REFRESH_TOKEN_HAS_INVALID_LENGTH);
        }
        if (!validate.refreshTokenHasValidFormat(refreshTokenGiven)) {
            throw new ResultError(IDMResults.REFRESH_TOKEN_HAS_INVALID_FORMAT);
        }

        RefreshToken refreshToken = authManager.verifyRefreshToken(refreshTokenGiven);

        if (validate.refreshTokenStatusExpired(refreshToken))
            throw new ResultError(IDMResults.REFRESH_TOKEN_IS_EXPIRED);

        if( validate.refreshTokenStatusRevoked(refreshToken) )
            throw new ResultError(IDMResults.REFRESH_TOKEN_IS_REVOKED);

        if ( !validate.refreshTokenCanRefresh(refreshToken) ) {
            authManager.expireRefreshToken(refreshToken);
            throw new ResultError(IDMResults.REFRESH_TOKEN_IS_EXPIRED);
        }

        // needs refresh

        TokensResponseModel tokensResponseModel = new TokensResponseModel();
        tokensResponseModel.setResult(IDMResults.RENEWED_FROM_REFRESH_TOKEN);

        User user = authManager.getUserFromRefreshToken(refreshToken);
        jwtManager.updatedRefreshTokenExpireTime(refreshToken);

        if (validate.refreshTokenExpireTimePastMax(refreshToken)){
            // you revoke the refresh token in DB
            authManager.revokeRefreshToken(refreshToken);

            // generate new refresh token
            RefreshToken newRefreshToken = jwtManager.buildRefreshToken(user);
            // insert new refresh token in DB
            authManager.insertRefreshToken( newRefreshToken );

            tokensResponseModel.setRefreshToken(newRefreshToken.getToken());
        } else {
            // update same refresh token in DB
            authManager.updateRefreshTokenExpireTime(refreshToken);

            tokensResponseModel.setRefreshToken(refreshToken.getToken());
        }

        String accessToken = jwtManager.buildAccessToken(user);

        return ResponseEntity.status(HttpStatus.OK)
            .body(tokensResponseModel.setAccessToken(accessToken));

    }
}
