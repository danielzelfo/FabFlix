package com.github.klefstad_teaching.cs122b.billing.model.response;

import com.github.klefstad_teaching.cs122b.billing.repo.entity.Order;
import com.github.klefstad_teaching.cs122b.core.result.Result;

public class SalesResponse {
    private Result result;
    private Order[] sales;

    public Result getResult() {
        return result;
    }

    public SalesResponse setResult(Result result) {
        this.result = result;
        return this;
    }

    public Order[] getSales() {
        return sales;
    }

    public SalesResponse setSales(Order[] sales) {
        this.sales = sales;
        return this;
    }
}
