package com.github.klefstad_teaching.cs122b.idm.rest;

import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.idm.component.IDMAuthenticationManager;
import com.github.klefstad_teaching.cs122b.idm.component.IDMJwtManager;
import com.github.klefstad_teaching.cs122b.idm.model.request.RefreshTokenRequestModel;
import com.github.klefstad_teaching.cs122b.idm.model.response.BasicResponseModel;
import com.github.klefstad_teaching.cs122b.idm.util.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<BasicResponseModel> refresh(@RequestBody RefreshTokenRequestModel request) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponseModel()
                        .setResult(IDMResults.RENEWED_FROM_REFRESH_TOKEN));
    }
}
