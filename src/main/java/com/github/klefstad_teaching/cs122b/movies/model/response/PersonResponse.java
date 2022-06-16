package com.github.klefstad_teaching.cs122b.movies.model.response;

import com.github.klefstad_teaching.cs122b.core.result.Result;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.PersonDetails;

public class PersonResponse {
    private Result result;
    private PersonDetails person;

    public Result getResult() {
        return result;
    }

    public PersonResponse setResult(Result result) {
        this.result = result;
        return this;
    }

    public PersonDetails getPerson() {
        return person;
    }

    public PersonResponse setPerson(PersonDetails person) {
        this.person = person;
        return this;
    }
}
