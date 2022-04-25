package com.github.klefstad_teaching.cs122b.movies.model.response;

import com.github.klefstad_teaching.cs122b.core.result.Result;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Person;

public class PersonResponse {
    private Result result;
    private Person person;

    public Result getResult() {
        return result;
    }

    public PersonResponse setResult(Result result) {
        this.result = result;
        return this;
    }

    public Person getPerson() {
        return person;
    }

    public PersonResponse setPerson(Person person) {
        this.person = person;
        return this;
    }
}
