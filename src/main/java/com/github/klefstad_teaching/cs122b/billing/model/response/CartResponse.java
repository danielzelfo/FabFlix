package com.github.klefstad_teaching.cs122b.billing.model.response;

import com.github.klefstad_teaching.cs122b.billing.repo.entity.Item;
import com.github.klefstad_teaching.cs122b.core.result.Result;

import java.math.BigDecimal;

public class CartResponse {
    private Result result;
    private BigDecimal total;
    private Item[] items;

    public Result getResult() {
        return result;
    }

    public CartResponse setResult(Result result) {
        this.result = result;
        return this;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public CartResponse setTotal(BigDecimal total) {
        this.total = total;
        return this;
    }

    public Item[] getItems() {
        return items;
    }

    public CartResponse setItems(Item[] items) {
        this.items = items;
        return this;
    }
}
