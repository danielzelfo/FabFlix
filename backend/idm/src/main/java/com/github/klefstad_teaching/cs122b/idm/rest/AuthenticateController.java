package com.github.klefstad_teaching.cs122b.idm.rest;

import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.idm.component.IDMAuthenticationManager;
import com.github.klefstad_teaching.cs122b.idm.component.IDMJwtManager;
import com.github.klefstad_teaching.cs122b.idm.model.request.AccessTokenRequestModel;
import com.github.klefstad_teaching.cs122b.idm.model.response.BasicResponseModel;
import com.github.klefstad_teaching.cs122b.idm.util.Validate;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.proc.BadJOSEException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.text.ParseException;

@RestController
public class AuthenticateController
{
    private final IDMAuthenticationManager authManager;
    private final IDMJwtManager            jwtManager;
    private final Validate                 validate;

    @Autowired
    public AuthenticateController(IDMAuthenticationManager authManager,
                                  IDMJwtManager jwtManager,
                                  Validate validate)
    {
        this.authManager = authManager;
        this.jwtManager = jwtManager;
        this.validate = validate;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<BasicResponseModel> authenticate(@RequestBody AccessTokenRequestModel request) {
        try {
            if (validate.signedJWTExpired(jwtManager.verifiedSignedJWT(request.getAccessToken()))) {
                throw new ResultError(IDMResults.ACCESS_TOKEN_IS_EXPIRED);
            }
        } catch (ParseException | BadJOSEException | JOSEException e) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }


        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponseModel()
                        .setResult(IDMResults.ACCESS_TOKEN_IS_VALID));
    }
}
