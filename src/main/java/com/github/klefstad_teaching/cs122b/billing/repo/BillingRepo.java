package com.github.klefstad_teaching.cs122b.billing.repo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.klefstad_teaching.cs122b.billing.model.request.MovieRequest;
import com.github.klefstad_teaching.cs122b.billing.repo.entity.Item;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.BillingResults;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Types;
import java.util.List;

@Component
public class BillingRepo
{
    private final NamedParameterJdbcTemplate template;
    private final ObjectMapper objectMapper;

    @Autowired
    public BillingRepo(NamedParameterJdbcTemplate template, ObjectMapper objectMapper)
    {
        this.template = template;
        this.objectMapper = objectMapper;
    }

    public void addToCart(Integer userId, MovieRequest movieRequest) {
        String sql =
                "INSERT INTO billing.cart (user_id, movie_id, quantity)" +
                        "VALUES (:user_id, :movie_id, :quantity);";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("user_id", userId, Types.INTEGER)
                        .addValue("movie_id", movieRequest.getMovieId(), Types.INTEGER)
                        .addValue("quantity", movieRequest.getQuantity(), Types.INTEGER);
        try {
            this.template.update(sql, source);
        } catch (DuplicateKeyException exc) {
            throw new ResultError(BillingResults.CART_ITEM_EXISTS);
        }
    }

    public void updateCart(Integer userId, MovieRequest movieRequest) {
        String sql =
                "UPDATE billing.cart " +
                "SET quantity = :quantity " +
                "WHERE user_id = :user_id AND  movie_id = :movie_id;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("user_id", userId, Types.INTEGER)
                        .addValue("movie_id", movieRequest.getMovieId(), Types.INTEGER)
                        .addValue("quantity", movieRequest.getQuantity(), Types.INTEGER);

        if (this.template.update(sql, source) == 0)
            throw new ResultError(BillingResults.CART_ITEM_DOES_NOT_EXIST);
    }

    public void deleteFromCart(Integer userId, Long movieId) {
        String sql =
            "DELETE FROM billing.cart " +
            "WHERE user_id = :user_id AND  movie_id = :movie_id;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("user_id", userId, Types.INTEGER)
                        .addValue("movie_id", movieId, Types.INTEGER);

        if (this.template.update(sql, source) == 0)
            throw new ResultError(BillingResults.CART_ITEM_DOES_NOT_EXIST);
    }

    public Item[] retrieveUserCart(Integer userId) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();

        String sql = "SELECT JSON_ARRAYAGG(JSON_OBJECT( 'unitPrice', mp.unit_price, 'quantity', c.quantity, 'movieId', c.movie_id, 'movieTitle', m.title, 'backdropPath', m.backdrop_path, 'posterPath', m.poster_path, 'premiumDiscount', mp.premium_discount )) " +
                "FROM billing.cart c " +
                "JOIN billing.movie_price mp ON c.movie_id = mp.movie_id " +
                "JOIN movies.movie m ON c.movie_id = m.id " +
                "WHERE c.user_id = :user_id;";
        source.addValue("user_id", userId, Types.INTEGER);

        String jsonArrayString = "";
        try {
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            return new Item[0];
        }
        if (jsonArrayString == null) {
            return new Item[0];
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, Item[].class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            return new Item[0];
        }
    }

    public void clearCart(Integer userId) {
        String sql =
                "DELETE FROM billing.cart " +
                "WHERE user_id = :user_id;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("user_id", userId, Types.INTEGER);

        if (this.template.update(sql, source) == 0)
            throw new ResultError(BillingResults.CART_EMPTY);
    }

    private PaymentIntent processPaymentIntent(Long amountInTotalCents, String description, String userId ) throws StripeException {
        PaymentIntentCreateParams paymentIntentCreateParams =
                PaymentIntentCreateParams
                        .builder()
                        .setCurrency("USD") // This will always be the same for our project
                        .setDescription(description)
                        .setAmount(amountInTotalCents)
                        // We use MetaData to keep track of the user that should pay for the order
                        .putMetadata("userId", userId)
                        .setAutomaticPaymentMethods(
                                // This will tell stripe to generate the payment methods automatically
                                // This will always be the same for our project
                                PaymentIntentCreateParams.AutomaticPaymentMethods
                                        .builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .build();
        return PaymentIntent.create(paymentIntentCreateParams);
    }

    public PaymentIntent orderPayment(Integer userId, List<String> roles) {


        Item[] cartItems = retrieveUserCart(userId);
        if (cartItems.length == 0) {
            throw new ResultError(BillingResults.CART_EMPTY);
        }

        BigDecimal total = BigDecimal.ZERO;
        String description = "";
        for (Item cartItem : cartItems) {
            description += cartItem.getMovieTitle() + ", ";
            if (roles.contains("PREMIUM")) {
                cartItem.setUnitPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(1 - cartItem.getPremiumDiscount()/100.0)).setScale(2, BigDecimal.ROUND_DOWN));
            } else {
                cartItem.setUnitPrice(cartItem.getUnitPrice().setScale(2));
            }
            cartItem.setPremiumDiscount(null); // remove discount attribute

            total = total.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        total = total.setScale(2);
        description = description.substring(0, description.length() - 2); // remove extra ", "

        String userIdStr = Integer.toString(userId);
        // this is assuming the scale is set to 2!!!
        Long amountInCents = Long.valueOf(total.toString().replace(".", ""));

        try {
            return processPaymentIntent(amountInCents, description, userIdStr);
        } catch( StripeException exc ) {
            throw new ResultError(BillingResults.STRIPE_ERROR);
        }
    }
}
