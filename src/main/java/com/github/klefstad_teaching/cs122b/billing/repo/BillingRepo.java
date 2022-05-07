package com.github.klefstad_teaching.cs122b.billing.repo;

import com.github.klefstad_teaching.cs122b.billing.model.request.MovieRequest;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.BillingResults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Types;

@Component
public class BillingRepo
{
    private NamedParameterJdbcTemplate template;

    @Autowired
    public BillingRepo(NamedParameterJdbcTemplate template)
    {
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
}
