package com.github.klefstad_teaching.cs122b.billing.repo.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Item {
    private BigDecimal unitPrice;
    private Integer quantity;
    private Long movieId;
    private String movieTitle;
    private String backdropPath;
    private String posterPath;
    private Integer premiumDiscount;

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public Item setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        return this;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Item setQuantity(Integer quantity) {
        this.quantity = quantity;
        return this;
    }

    public Long getMovieId() {
        return movieId;
    }

    public Item setMovieId(Long movieId) {
        this.movieId = movieId;
        return this;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public Item setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
        return this;
    }

    public String getBackdropPath() {
        return backdropPath;
    }

    public Item setBackdropPath(String backdropPath) {
        this.backdropPath = backdropPath;
        return this;
    }

    public String getPosterPath() {
        return posterPath;
    }

    public Item setPosterPath(String posterPath) {
        this.posterPath = posterPath;
        return this;
    }

    public Integer getPremiumDiscount() {
        return premiumDiscount;
    }

    public Item setPremiumDiscount(Integer premiumDiscount) {
        this.premiumDiscount = premiumDiscount;
        return this;
    }
}
