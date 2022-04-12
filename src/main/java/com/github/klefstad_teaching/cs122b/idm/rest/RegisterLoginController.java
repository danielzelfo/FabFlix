package com.github.klefstad_teaching.cs122b.idm.rest;

import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.idm.component.IDMAuthenticationManager;
import com.github.klefstad_teaching.cs122b.idm.component.IDMJwtManager;
import com.github.klefstad_teaching.cs122b.idm.model.request.RegisterLoginRequestModel;
import com.github.klefstad_teaching.cs122b.idm.model.response.BasicResponseModel;
import com.github.klefstad_teaching.cs122b.idm.model.response.LoginResponseModel;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.RefreshToken;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.User;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.type.UserStatus;
import com.github.klefstad_teaching.cs122b.idm.util.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RegisterLoginController
{
    private final IDMAuthenticationManager authManager;
    private final IDMJwtManager            jwtManager;
    private final Validate                 validate;

    @Autowired
    public RegisterLoginController(IDMAuthenticationManager authManager,
                                   IDMJwtManager jwtManager,
                                   Validate validate)
    {
        this.authManager = authManager;
        this.jwtManager = jwtManager;
        this.validate = validate;
    }


    private void validateRequestCredentials(RegisterLoginRequestModel request) throws ResultError {
        if (!validate.passwordMeetsLengthRequirement(request.getPassword())) {
            throw new ResultError(IDMResults.PASSWORD_DOES_NOT_MEET_LENGTH_REQUIREMENTS);
        }

        if (!validate.emailMeetsLengthRequirement(request.getEmail())) {
            throw new ResultError(IDMResults.EMAIL_ADDRESS_HAS_INVALID_LENGTH);
        }

        if (!validate.passwordMeetsCharacterRequirement(request.getPassword()) ) {
            throw new ResultError(IDMResults.PASSWORD_DOES_NOT_MEET_CHARACTER_REQUIREMENT);
        }

        if (!validate.emailMeetsCharacterRequirement(request.getEmail())) {
            throw new ResultError(IDMResults.EMAIL_ADDRESS_HAS_INVALID_FORMAT);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<BasicResponseModel> register(@RequestBody RegisterLoginRequestModel request) {
        try {
            validateRequestCredentials(request);
        } catch( ResultError exception ) {
            throw exception;
        }

        try {
            authManager.createAndInsertUser(request.getEmail(), request.getPassword());
        } catch( DuplicateKeyException kde ) {
            throw new ResultError(IDMResults.USER_ALREADY_EXISTS);
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponseModel()
                        .setResult(IDMResults.USER_REGISTERED_SUCCESSFULLY));
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponseModel> login(@RequestBody RegisterLoginRequestModel request) {
        User user;

        try {
            validateRequestCredentials(request);
            user = authManager.selectAndAuthenticateUser(request.getEmail(), request.getPassword());
        } catch (ResultError exception) {
            throw exception;
        }

        if (user.getUserStatus().equals(UserStatus.LOCKED)) {
            throw new ResultError(IDMResults.USER_IS_LOCKED);
        }

        if (user.getUserStatus().equals(UserStatus.BANNED)) {
            throw new ResultError(IDMResults.USER_IS_BANNED);
        }

        String accessToken = jwtManager.buildAccessToken(user);

        RefreshToken refreshToken = jwtManager.buildRefreshToken(user);

        authManager.insertRefreshToken( refreshToken );

        LoginResponseModel loginResponseModel = new LoginResponseModel();
        loginResponseModel.setResult(IDMResults.USER_LOGGED_IN_SUCCESSFULLY);

        return ResponseEntity.status(HttpStatus.OK)
                .body(loginResponseModel
                        .setAccessToken(accessToken)
                        .setRefreshToken(refreshToken.getToken())
                );
    }

}
