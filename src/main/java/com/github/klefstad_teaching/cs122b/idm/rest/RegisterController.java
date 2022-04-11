package com.github.klefstad_teaching.cs122b.idm.rest;

import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.idm.component.IDMAuthenticationManager;
import com.github.klefstad_teaching.cs122b.idm.component.IDMJwtManager;
import com.github.klefstad_teaching.cs122b.idm.model.request.RegisterRequestModel;
import com.github.klefstad_teaching.cs122b.idm.model.response.BasicResponseModel;
import com.github.klefstad_teaching.cs122b.idm.util.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RegisterController
{
    private final IDMAuthenticationManager authManager;
    private final IDMJwtManager            jwtManager;
    private final Validate                 validate;
    private NamedParameterJdbcTemplate template;

    @Autowired
    public RegisterController(IDMAuthenticationManager authManager,
                              IDMJwtManager jwtManager,
                              Validate validate,
                              NamedParameterJdbcTemplate template)
    {
        this.authManager = authManager;
        this.jwtManager = jwtManager;
        this.validate = validate;
        this.template = template;
    }

    @PostMapping("/register")
    public ResponseEntity<BasicResponseModel> register(@RequestBody RegisterRequestModel request) {
        if (request.getPassword().length < 10 || request.getPassword().length > 20) {
            throw new ResultError(IDMResults.PASSWORD_DOES_NOT_MEET_LENGTH_REQUIREMENTS);
        }

        if (request.getEmail().length() < 6 || request.getEmail().length() > 32) {
            throw new ResultError(IDMResults.EMAIL_ADDRESS_HAS_INVALID_LENGTH);
        }

        if (! ( new String(request.getPassword()).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{10,20}$") ) ) {
            throw new ResultError(IDMResults.PASSWORD_DOES_NOT_MEET_CHARACTER_REQUIREMENT);
        }

        if (! request.getEmail().matches("^([a-zA-Z0-9]+)@([a-zA-Z0-9]+)\\.([a-zA-Z0-9]+)$") ) {
            throw new ResultError(IDMResults.EMAIL_ADDRESS_HAS_INVALID_FORMAT);
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
}
