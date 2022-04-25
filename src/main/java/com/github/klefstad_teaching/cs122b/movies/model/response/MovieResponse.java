package com.github.klefstad_teaching.cs122b.movies.model.response;

import com.github.klefstad_teaching.cs122b.core.result.Result;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Genre;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Movie;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Person;

public class MovieResponse {
    private Result result;
    private Movie movie;
    private Genre[] genres;
    private Person[] persons;

    public Result getResult() {
        return result;
    }

    public MovieResponse setResult(Result result) {
        this.result = result;
        return this;
    }

    public Movie getMovie() {
        return movie;
    }

    public MovieResponse setMovie(Movie movie) {
        this.movie = movie;
        return this;
    }

    public Genre[] getGenres() {
        return genres;
    }

    public MovieResponse setGenres(Genre[] genres) {
        this.genres = genres;
        return this;
    }

    public Person[] getPersons() {
        return persons;
    }

    public MovieResponse setPersons(Person[] persons) {
        this.persons = persons;
        return this;
    }
}
