package com.github.klefstad_teaching.cs122b.movies.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MovieSearchRequest {
    private String title;//	String	The movie's title (Search by substring)
    private Integer year;//	Integer	The movie's release year
    private String director;//	String	The movie's director (Search by substring)
    private String genre;//	String	The movie's genre (Search by substring)
    private Integer limit;//	Integer	Number of movies to list at one time: 10 (default), 25, 50, or 100
    private Integer page;//	Integer	The page for pagination: 1 (default) or any positive number over 0
    private String orderBy;//	String	Sorting parameter: title (default) or rating or year
    private String direction;//	String	Sorting direction: asc (default) or desc

    public String getTitle() {
        return title;
    }

    public MovieSearchRequest setTitle(String title) {
        this.title = title;
        return this;
    }

    public Integer getYear() {
        return year;
    }

    public MovieSearchRequest setYear(Integer year) {
        this.year = year;
        return this;
    }

    public String getDirector() {
        return director;
    }

    public MovieSearchRequest setDirector(String director) {
        this.director = director;
        return this;
    }

    public String getGenre() {
        return genre;
    }

    public MovieSearchRequest setGenre(String genre) {
        this.genre = genre;
        return this;
    }

    public Integer getLimit() {
        return limit;
    }

    public MovieSearchRequest setLimit(Integer limit) {
        this.limit = limit;
        return this;
    }

    public Integer getPage() {
        return page;
    }

    public MovieSearchRequest setPage(Integer page) {
        this.page = page;
        return this;
    }

    public String getOrderBy() {
        return orderBy;
    }

    public MovieSearchRequest setOrderBy(String orderBy) {
        this.orderBy = orderBy;
        return this;
    }

    public String getDirection() {
        return direction;
    }

    public MovieSearchRequest setDirection(String direction) {
        this.direction = direction;
        return this;
    }
}
