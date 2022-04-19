package com.github.klefstad_teaching.cs122b.movies.repo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.MoviesResults;
import com.github.klefstad_teaching.cs122b.movies.model.request.MovieSearchRequest;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Movie;
import com.github.klefstad_teaching.cs122b.movies.util.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Types;
import java.util.List;

@Component
public class MovieRepo
{
    private ObjectMapper objectMapper;
    private NamedParameterJdbcTemplate template;
    private Validate validate;

    @Autowired
    public MovieRepo(ObjectMapper objectMapper, NamedParameterJdbcTemplate template, Validate validate)
    {
        this.objectMapper = objectMapper;
        this.template = template;
        this.validate = validate;
    }


    public Movie[] getMovies(MovieSearchRequest movieRequest, List<String> roles) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();

        String sql = "SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'title', t.title, 'year', t.year, 'director', t.director_name, 'rating', t.rating, 'backdropPath', t.backdrop_path, 'posterPath', t.poster_path, 'hidden', t.hidden)) FROM "
                + "( "
                + "SELECT m.id, m.title, m.year, director.name AS director_name, m.rating, m.backdrop_path, m.poster_path, m.hidden "
                + "FROM movies.movie m "
                + "JOIN movies.person director ON director.id = m.director_id ";
        if (movieRequest.getGenre() != null) {
            sql += "JOIN movies.movie_genre mg on mg.movie_id = m.id JOIN movies.genre g on g.id = mg.genre_id ";
        }
        Boolean whereAdded = false;
        if (movieRequest.getTitle() != null) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "m.title LIKE :title ";
            source.addValue("title", "%"+movieRequest.getTitle()+"%", Types.VARCHAR);
        }
        if (movieRequest.getGenre() != null) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "g.name LIKE :genre ";
            source.addValue("genre", "%"+movieRequest.getGenre()+"%", Types.VARCHAR);
        }
        if (movieRequest.getDirector() != null) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "director.name LIKE :director ";
            source.addValue("director", "%"+movieRequest.getDirector()+"%", Types.VARCHAR);
        }
        if (movieRequest.getYear() != null) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "m.year = :year ";
            source.addValue("year", movieRequest.getYear(), Types.INTEGER);
        }
        if(!validate.canSeeHiddenMovies(roles)) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "m.hidden = 0 ";
        }

        if (validate.validOrderBy(movieRequest.getOrderBy())) {
            sql += "ORDER BY m." + movieRequest.getOrderBy() + " ";
            if (validate.validDirection(movieRequest.getDirection().toUpperCase())) {
                sql += movieRequest.getDirection().toUpperCase() + ", m.id ASC ";
            } else {
                throw new ResultError(MoviesResults.INVALID_DIRECTION);
            }
        } else {
            throw new ResultError(MoviesResults.INVALID_ORDER_BY);
        }
        sql += "LIMIT :startpoint, :limit ";
        source.addValue("startpoint", (movieRequest.getPage()-1)*movieRequest.getLimit(), Types.INTEGER);
        source.addValue("limit", movieRequest.getLimit(), Types.INTEGER);

        sql += ") t; ";
        System.out.println(sql);
        String jsonArrayString = "";
        try {
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_MOVIES_FOUND_WITHIN_SEARCH);
        }
        if (jsonArrayString == null) {
            throw new ResultError(MoviesResults.NO_MOVIES_FOUND_WITHIN_SEARCH);
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, Movie[].class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_MOVIES_FOUND_WITHIN_SEARCH);
        }
    }
}
