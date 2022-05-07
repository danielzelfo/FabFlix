package com.github.klefstad_teaching.cs122b.billing.rest;

import com.github.klefstad_teaching.cs122b.billing.model.request.MovieRequest;
import com.github.klefstad_teaching.cs122b.billing.model.response.BasicResponse;
import com.github.klefstad_teaching.cs122b.billing.repo.BillingRepo;
import com.github.klefstad_teaching.cs122b.billing.util.Validate;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.BillingResults;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.core.security.JWTManager;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
public class CartController
{
    private final BillingRepo repo;
    private final Validate    validate;

    @Autowired
    public CartController(BillingRepo repo, Validate validate)
    {
        this.repo = repo;
        this.validate = validate;
    }

    @PostMapping("/cart/insert")
    public ResponseEntity<BasicResponse> endpoint(@AuthenticationPrincipal SignedJWT user, @RequestBody MovieRequest movieRequest)
    {
        Integer userId;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        if (movieRequest.getQuantity() == null || movieRequest.getQuantity() < 1)
            throw new ResultError(BillingResults.INVALID_QUANTITY);
        else if (movieRequest.getQuantity() > 10)
            throw new ResultError(BillingResults.MAX_QUANTITY);

        this.repo.addToCart(userId, movieRequest);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponse()
                        .setResult(BillingResults.CART_ITEM_INSERTED));
    }
}
