package com.github.klefstad_teaching.cs122b.billing.model.response;

import com.github.klefstad_teaching.cs122b.billing.repo.entity.Item;
import com.github.klefstad_teaching.cs122b.core.result.Result;

import java.math.BigDecimal;

public class ItemListResponse {
    private Result result;
    private BigDecimal total;
    private Item[] items;

    public Result getResult() {
        return result;
    }

    public ItemListResponse setResult(Result result) {
        this.result = result;
        return this;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public ItemListResponse setTotal(BigDecimal total) {
        this.total = total;
        return this;
    }

    public Item[] getItems() {
        return items;
    }

    public ItemListResponse setItems(Item[] items) {
        this.items = items;
        return this;
    }
}
