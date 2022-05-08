package com.github.klefstad_teaching.cs122b.billing.rest;

import com.github.klefstad_teaching.cs122b.billing.model.request.MovieRequest;
import com.github.klefstad_teaching.cs122b.billing.model.response.BasicResponse;
import com.github.klefstad_teaching.cs122b.billing.model.response.CartResponse;
import com.github.klefstad_teaching.cs122b.billing.repo.BillingRepo;
import com.github.klefstad_teaching.cs122b.billing.repo.entity.Item;
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
import org.springframework.web.bind.annotation.*;


import java.math.BigDecimal;
import java.text.ParseException;
import java.util.List;

@RestController
public class CartController
{
    private final BillingRepo repo;
    private final Validate validate;

    @Autowired
    public CartController(BillingRepo repo, Validate validate)
    {
        this.repo = repo;
        this.validate = validate;
    }

    @PostMapping("/cart/insert")
    public ResponseEntity<BasicResponse> insertCart(@AuthenticationPrincipal SignedJWT user, @RequestBody MovieRequest movieRequest)
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

    @PostMapping("/cart/update")
    public ResponseEntity<BasicResponse> updateCart(@AuthenticationPrincipal SignedJWT user, @RequestBody MovieRequest movieRequest)
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

        this.repo.updateCart(userId, movieRequest);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponse()
                        .setResult(BillingResults.CART_ITEM_UPDATED));
    }

    @DeleteMapping("/cart/delete/{movieId}")
    public ResponseEntity<BasicResponse> updateCart(@AuthenticationPrincipal SignedJWT user, @PathVariable Long movieId)
    {
        Integer userId;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        this.repo.deleteFromCart(userId, movieId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponse()
                        .setResult(BillingResults.CART_ITEM_DELETED));
    }

    @GetMapping("/cart/retrieve")
    public ResponseEntity<CartResponse> retreiveCart(@AuthenticationPrincipal SignedJWT user) {
        Integer userId;
        List<String> roles;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
            roles = user.getJWTClaimsSet().getStringListClaim(JWTManager.CLAIM_ROLES);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        Item[] cartItems = this.repo.retrieveUserCart(userId);
        if (cartItems.length == 0) {
            throw new ResultError(BillingResults.CART_EMPTY);
        }

        BigDecimal total = BigDecimal.ZERO;
        if (roles.contains("PREMIUM")) {
            for (Item cartItem : cartItems) {
                cartItem.setUnitPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(1 - cartItem.getPremiumDiscount()/100.0)).setScale(2, BigDecimal.ROUND_DOWN));
                cartItem.setPremiumDiscount(null); // remove discount attribute
                total = total.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            }
        } else {
            for (Item cartItem : cartItems) {
                cartItem.setUnitPrice(cartItem.getUnitPrice().setScale(2));
                cartItem.setPremiumDiscount(null); // remove discount attribute
                total = total.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            }
        }

        total = total.setScale(2);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new CartResponse()
                        .setResult(BillingResults.CART_RETRIEVED)
                        .setItems(cartItems)
                        .setTotal(total));

    }


    @PostMapping("/cart/clear")
    public ResponseEntity<BasicResponse> updateCart(@AuthenticationPrincipal SignedJWT user)
    {
        Integer userId;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        this.repo.clearCart(userId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponse()
                        .setResult(BillingResults.CART_CLEARED));
    }
}
