package com.github.klefstad_teaching.cs122b.movies.util;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class Validate
{
    private List<Integer> limitOptions;
    private List<String> movieOrderbyOptions;
    private List<String> directionOptions;
    private List<String> rolesCanSeeHidden;
    private List<String> personOrderbyOptions;

    public Validate(){
        this.limitOptions = new ArrayList<Integer>();
        this.limitOptions.add(10);
        this.limitOptions.add(25);
        this.limitOptions.add(50);

        this.movieOrderbyOptions = new ArrayList<String>();
        this.movieOrderbyOptions.add("title");
        this.movieOrderbyOptions.add("rating");
        this.movieOrderbyOptions.add("year");

        this.directionOptions = new ArrayList<String>();
        this.directionOptions.add("ASC");
        this.directionOptions.add("DESC");

        this.rolesCanSeeHidden = new ArrayList<String>();
        this.rolesCanSeeHidden.add("ADMIN");
        this.rolesCanSeeHidden.add("EMPLOYEE");

        this.personOrderbyOptions = new ArrayList<String>();
        this.personOrderbyOptions.add("name");
        this.personOrderbyOptions.add("popularity");
        this.personOrderbyOptions.add("birthday");
    }

    public Boolean validLimit(Integer limit) {
        return limitOptions.contains(limit);
    }

    public Boolean validMovieOrderBy(String orderBy) {
        return movieOrderbyOptions.contains(orderBy);
    }

    public Boolean validPersonOrderBy(String orderBy) {
        return personOrderbyOptions.contains(orderBy);
    }

    public Boolean validDirection(String direction) {
        return directionOptions.contains(direction);
    }

    public Boolean canSeeHiddenMovies(List<String> roles) {
        return !Collections.disjoint(roles, this.rolesCanSeeHidden);
    }
}
