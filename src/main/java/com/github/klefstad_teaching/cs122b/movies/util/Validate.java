package com.github.klefstad_teaching.cs122b.movies.util;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class Validate
{
    private List<Integer> limitOptions;
    private List<String> orderbyOptions;
    private List<String> directionOptions;
    private List<String> rolesCanSeeHidden;

    public Validate(){
        this.limitOptions = new ArrayList<Integer>();
        this.limitOptions.add(10);
        this.limitOptions.add(25);
        this.limitOptions.add(50);

        this.orderbyOptions = new ArrayList<String>();
        this.orderbyOptions.add("title");
        this.orderbyOptions.add("rating");
        this.orderbyOptions.add("year");

        this.directionOptions = new ArrayList<String>();
        this.directionOptions.add("ASC");
        this.directionOptions.add("DESC");

        this.rolesCanSeeHidden = new ArrayList<String>();
        this.rolesCanSeeHidden.add("Admin");
        this.rolesCanSeeHidden.add("Employee");
    }

    public Boolean validLimit(Integer limit) {
        return limitOptions.contains(limit);
    }

    public Boolean validOrderBy(String orderBy) {
        return orderbyOptions.contains(orderBy);
    }

    public Boolean validDirection(String direction) {
        return directionOptions.contains(direction);
    }

    public Boolean canSeeHiddenMovies(List<String> roles) {
        return Collections.disjoint(roles, this.rolesCanSeeHidden);
    }
}
