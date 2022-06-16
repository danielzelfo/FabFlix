package com.github.klefstad_teaching.cs122b.billing.model.response;

import com.github.klefstad_teaching.cs122b.core.result.Result;

public class BasicResponse {
    private Result result;

    public Result getResult() {
        return result;
    }

    public BasicResponse setResult(Result result) {
        this.result = result;
        return this;
    }
}
