package com.github.klefstad_teaching.cs122b.billing.repo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.klefstad_teaching.cs122b.billing.model.request.MovieRequest;
import com.github.klefstad_teaching.cs122b.billing.model.request.PaymentIntentRequest;
import com.github.klefstad_teaching.cs122b.billing.repo.entity.Item;
import com.github.klefstad_teaching.cs122b.billing.repo.entity.Order;
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
import java.time.Instant;
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

        if (roles.contains("PREMIUM")) {
            for (Item cartItem : cartItems) {
                description += cartItem.getMovieTitle() + ", ";
                cartItem.setUnitPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(1 - cartItem.getPremiumDiscount()/100.0)).setScale(2, BigDecimal.ROUND_DOWN));
                cartItem.setPremiumDiscount(null); // remove discount attribute
                total = total.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            }
        } else {
            for (Item cartItem : cartItems) {
                description += cartItem.getMovieTitle() + ", ";
                cartItem.setUnitPrice(cartItem.getUnitPrice().setScale(2));
                cartItem.setPremiumDiscount(null); // remove discount attribute
                total = total.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            }
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

    private void recordSale(Integer userId, BigDecimal total) {
        String sql = "INSERT INTO billing.sale (user_id, total) " +
                "VALUES (:user_id, :total);";
        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("user_id", userId, Types.INTEGER)
                        .addValue("total", total, Types.DECIMAL);
        this.template.update(sql, source);
    }

    private Integer getPreviousUserSaleId(Integer userId) {
        // note: this must run after recordSale
        String sql = "SELECT id FROM billing.sale " +
                "WHERE user_id = :user_id " +
                "ORDER BY id DESC LIMIT 1;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("user_id", userId, Types.INTEGER);

        return this.template.queryForObject(sql, source, (rs, rowNum)->rs.getInt(1));
    }

    private void recordItemsSale(Integer userId) {
        Item[] cartItems = retrieveUserCart(userId);

        Integer saleId = getPreviousUserSaleId(userId);

        String sql = "INSERT INTO billing.sale_item (sale_id, movie_id, quantity) " +
                "VALUES (:sale_id, :movie_id, :quantity);";

        for (Item cartItem : cartItems) {
            this.template.update(sql, new MapSqlParameterSource()
                    .addValue("sale_id", saleId, Types.INTEGER)
                    .addValue("movie_id", cartItem.getMovieId(), Types.INTEGER)
                    .addValue("quantity", cartItem.getQuantity(), Types.INTEGER));
        }

    }

    public void completeOrder(Integer userId, PaymentIntentRequest paymentIntentRequest) {
        PaymentIntent retrievedPaymentIntent;
        try {
            retrievedPaymentIntent = PaymentIntent.retrieve(paymentIntentRequest.getPaymentIntentId());
        } catch (StripeException exc ) {
            throw new ResultError(BillingResults.STRIPE_ERROR);
        }

        String retrievedUserId = retrievedPaymentIntent.getMetadata().get("userId");

        if (!retrievedUserId.equals(Integer.toString(userId))) {
            throw new ResultError(BillingResults.ORDER_CANNOT_COMPLETE_WRONG_USER);
        }

        String status = retrievedPaymentIntent.getStatus();

        if (!status.equals("succeeded")) {
            throw new ResultError(BillingResults.ORDER_CANNOT_COMPLETE_NOT_SUCCEEDED);
        }

        BigDecimal total = BigDecimal.valueOf(retrievedPaymentIntent.getAmount()).divide(BigDecimal.valueOf(100)).setScale(2);

        recordSale(userId, total);

        recordItemsSale(userId);

        clearCart(userId);

    }

    public Order[] getRecentUserOrders(Integer userId) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();

        String sql = "SELECT id, total, order_date " +
                "FROM billing.sale " +
                "WHERE user_id = :user_id " +
                "ORDER BY id DESC LIMIT 5;";
        source.addValue("user_id", userId, Types.INTEGER);

        List<Order> orders =
                this.template.query(
                        sql,
                        source,

                        (rs, rowNum) ->
                                new Order()
                                        .setSaleId(rs.getLong("id"))
                                        .setTotal(rs.getBigDecimal("total"))
                                        .setOrderDate(rs.getTimestamp("order_date").toInstant())
                );

        //return as array
        return orders.toArray(new Order[0]);
    }
}
