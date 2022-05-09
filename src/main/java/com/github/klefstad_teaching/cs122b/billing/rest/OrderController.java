package com.github.klefstad_teaching.cs122b.billing.rest;

import com.github.klefstad_teaching.cs122b.billing.model.request.PaymentIntentRequest;
import com.github.klefstad_teaching.cs122b.billing.model.response.BasicResponse;
import com.github.klefstad_teaching.cs122b.billing.model.response.ItemListResponse;
import com.github.klefstad_teaching.cs122b.billing.model.response.PaymentResponse;
import com.github.klefstad_teaching.cs122b.billing.model.response.SalesResponse;
import com.github.klefstad_teaching.cs122b.billing.repo.BillingRepo;
import com.github.klefstad_teaching.cs122b.billing.repo.entity.Item;
import com.github.klefstad_teaching.cs122b.billing.repo.entity.Order;
import com.github.klefstad_teaching.cs122b.billing.util.Validate;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.BillingResults;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.core.security.JWTManager;
import com.nimbusds.jwt.SignedJWT;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.websocket.server.PathParam;
import java.math.BigDecimal;
import java.text.ParseException;
import java.util.List;

@RestController
public class OrderController
{
    private final BillingRepo repo;
    private final Validate    validate;

    @Autowired
    public OrderController(BillingRepo repo,Validate validate)
    {
        this.repo = repo;
        this.validate = validate;
    }

    @GetMapping("/order/payment")
    public ResponseEntity<PaymentResponse> orderPayments(@AuthenticationPrincipal SignedJWT user) {
        Integer userId;
        List<String> roles;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
            roles = user.getJWTClaimsSet().getStringListClaim(JWTManager.CLAIM_ROLES);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        PaymentIntent paymentIntent = this.repo.orderPayment(userId, roles);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new PaymentResponse()
                        .setResult(BillingResults.ORDER_PAYMENT_INTENT_CREATED)
                        .setPaymentIntentId(paymentIntent.getId())
                        .setClientSecret(paymentIntent.getClientSecret()));
    }

    @PostMapping("/order/complete")
    public ResponseEntity<BasicResponse> updateCart(@AuthenticationPrincipal SignedJWT user, @RequestBody PaymentIntentRequest paymentIntentRequest)
    {
        Integer userId;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        this.repo.completeOrder(userId, paymentIntentRequest);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new BasicResponse()
                        .setResult(BillingResults.ORDER_COMPLETED));
    }

    @GetMapping("/order/list")
    public ResponseEntity<SalesResponse> listOrders(@AuthenticationPrincipal SignedJWT user) {
        Integer userId;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        Order[] userOrders = this.repo.getRecentUserOrders(userId);
        if (userOrders.length == 0) {
            throw new ResultError(BillingResults.ORDER_LIST_NO_SALES_FOUND);
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(new SalesResponse()
                        .setResult(BillingResults.ORDER_LIST_FOUND_SALES)
                        .setSales(userOrders));
    }

    @GetMapping("/order/detail/{saleId}")
    public ResponseEntity<ItemListResponse> orderDetails(@AuthenticationPrincipal SignedJWT user, @PathVariable Long saleId) {
        Integer userId;
        List<String> roles;
        try {
            userId = user.getJWTClaimsSet().getIntegerClaim(JWTManager.CLAIM_ID);
            roles = user.getJWTClaimsSet().getStringListClaim(JWTManager.CLAIM_ROLES);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        Item[] orderItems = this.repo.getOrderItems(userId, saleId);
        if (orderItems.length == 0) {
            throw new ResultError(BillingResults.ORDER_DETAIL_NOT_FOUND);
        }

        BigDecimal total = BigDecimal.ZERO;
        if (roles.contains("PREMIUM")) {
            for (Item orderItem : orderItems) {
                orderItem.setUnitPrice(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(1 - orderItem.getPremiumDiscount()/100.0)).setScale(2, BigDecimal.ROUND_DOWN));
                orderItem.setPremiumDiscount(null); // remove discount attribute
                total = total.add(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
            }
        } else {
            for (Item orderItem : orderItems) {
                orderItem.setUnitPrice(orderItem.getUnitPrice().setScale(2));
                orderItem.setPremiumDiscount(null); // remove discount attribute
                total = total.add(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
            }
        }

        total = total.setScale(2);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ItemListResponse()
                        .setResult(BillingResults.ORDER_DETAIL_FOUND)
                        .setItems(orderItems)
                        .setTotal(total));
    }
}
