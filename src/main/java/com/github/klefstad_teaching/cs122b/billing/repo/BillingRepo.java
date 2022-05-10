package com.github.klefstad_teaching.cs122b.billing.repo;

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
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;

@Component
public class BillingRepo {
    private final NamedParameterJdbcTemplate template;

    @Autowired
    public BillingRepo(NamedParameterJdbcTemplate template) {
        this.template = template;
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

    private Item defaultItem(ResultSet rs) throws SQLException {
        return new Item()
                .setQuantity(rs.getInt("quantity"))
                .setMovieId(rs.getLong("movieId"))
                .setMovieTitle(rs.getString("movieTitle"))
                .setBackdropPath(rs.getString("backdropPath"))
                .setPosterPath(rs.getString("posterPath"));
    }

    private Item adjustedItem(ResultSet rs, List<String> roles) throws SQLException {
        return roles.contains("PREMIUM") ?
                defaultItem(rs).setUnitPrice(rs.getBigDecimal("unitPrice").multiply(BigDecimal.valueOf(1 - rs.getInt("premiumDiscount") / 100.0)).setScale(2, BigDecimal.ROUND_DOWN))
                :
                defaultItem(rs).setUnitPrice(rs.getBigDecimal("unitPrice").setScale(2));
    }

    private Item[] itemQuery(String sql, MapSqlParameterSource source, List<String> roles) {
        return this.template.query(
                sql,
                source,
                (rs, rowNum) -> adjustedItem(rs, roles)
        ).toArray(new Item[0]);
    }

    public Item[] retrieveUserCart(Integer userId, List<String> roles) {
        MapSqlParameterSource source = new MapSqlParameterSource()
                .addValue("user_id", userId, Types.INTEGER);
        String sql = "SELECT mp.unit_price AS unitPrice, c.quantity, c.movie_id AS movieId, m.title AS movieTitle, m.backdrop_path AS backdropPath, m.poster_path AS posterPath, mp.premium_discount AS premiumDiscount " +
                "FROM billing.cart c " +
                "JOIN billing.movie_price mp ON c.movie_id = mp.movie_id " +
                "JOIN movies.movie m ON c.movie_id = m.id " +
                "WHERE c.user_id = :user_id;";

        return itemQuery(sql, source, roles);
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

    private PaymentIntent processPaymentIntent(Long amountInTotalCents, String description, String userId) throws StripeException {
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
        Item[] cartItems = retrieveUserCart(userId, roles);
        if (cartItems.length == 0) {
            throw new ResultError(BillingResults.CART_EMPTY);
        }

        // calculate total and generate description
        BigDecimal total = BigDecimal.ZERO;
        String description = "";
        for (Item cartItem : cartItems) {
            description += cartItem.getMovieTitle() + ", ";
            total = total.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        total = total.setScale(2);
        description = description.substring(0, description.length() - 2); // remove extra ", "

        String userIdStr = Integer.toString(userId);
        // this is assuming the scale is set to 2!!!
        Long amountInCents = Long.valueOf(total.toString().replace(".", ""));

        try {
            return processPaymentIntent(amountInCents, description, userIdStr);
        } catch (StripeException exc) {
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

    private void recordItemsSale(Integer userId) {
        String sql = "INSERT INTO billing.sale_item (sale_id, movie_id, quantity) " +
                "SELECT MAX(s.id) AS sale_id, c.movie_id AS movie_id, c.quantity " +
                "FROM billing.cart c " +
                "JOIN billing.sale s ON s.user_id = c.user_id " +
                "WHERE c.user_id = :user_id " +
                "GROUP BY c.movie_id;";

        MapSqlParameterSource source = new MapSqlParameterSource()
                .addValue("user_id", userId, Types.INTEGER);

        this.template.update(sql, source);
    }

    @Transactional
    protected void recordSaleTransaction(Integer userId, BigDecimal total) {
        recordSale(userId, total);
        recordItemsSale(userId);
    }

    public void completeOrder(Integer userId, PaymentIntentRequest paymentIntentRequest) {
        PaymentIntent retrievedPaymentIntent;
        try {
            retrievedPaymentIntent = PaymentIntent.retrieve(paymentIntentRequest.getPaymentIntentId());
        } catch (StripeException exc) {
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

        recordSaleTransaction(userId, total);
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

        return this.template.query(
                sql,
                source,

                (rs, rowNum) ->
                        new Order()
                                .setSaleId(rs.getLong("id"))
                                .setTotal(rs.getBigDecimal("total").setScale(2))
                                .setOrderDate(rs.getTimestamp("order_date").toInstant())
        ).toArray(new Order[0]);
    }

    public Item[] getOrderItems(Integer userId, Long saleId, List<String> roles) {
        MapSqlParameterSource source = new MapSqlParameterSource()
                .addValue("user_id", userId, Types.INTEGER)
                .addValue("sale_id", saleId, Types.INTEGER);
        String sql = "SELECT mp.unit_price AS unitPrice, si.quantity, si.movie_id AS movieId, m.title AS movieTitle, m.backdrop_path AS backdropPath, m.poster_path AS posterPath, mp.premium_discount AS premiumDiscount " +
                "FROM billing.sale_item si " +
                "JOIN billing.sale s ON s.id = si.sale_id " +
                "JOIN billing.movie_price mp ON si.movie_id = mp.movie_id " +
                "JOIN movies.movie m ON si.movie_id = m.id " +
                "WHERE si.sale_id = :sale_id AND s.user_id = :user_id;";

        return itemQuery(sql, source, roles);
    }
}
