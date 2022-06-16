package com.github.klefstad_teaching.cs122b.movies.model.response;

import com.github.klefstad_teaching.cs122b.core.result.Result;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.PersonDetails;

public class PersonSearchResponse {
    private Result result;
    private PersonDetails[] persons;

    public Result getResult() {
        return result;
    }

    public PersonSearchResponse setResult(Result result) {
        this.result = result;
        return this;
    }

    public PersonDetails[] getPersons() {
        return persons;
    }

    public PersonSearchResponse setPersons(PersonDetails[] persons) {
        this.persons = persons;
        return this;
    }
}
