package com.github.klefstad_teaching.cs122b.movies.repo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.MoviesResults;
import com.github.klefstad_teaching.cs122b.movies.model.request.MovieSearchRequest;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Genre;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Movie;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Person;
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

        if (validate.validMovieOrderBy(movieRequest.getOrderBy())) {
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
        //LIMIT ASSUMED TO BE VALIDATED!!!
        source.addValue("limit", movieRequest.getLimit(), Types.INTEGER);

        sql += ") t; ";


        return getMoviesFromDB(sql, source, new ResultError(MoviesResults.NO_MOVIES_FOUND_WITHIN_SEARCH));
    }


    public Movie[] getMoviesByPersonId(Long personId, List<String> roles, MovieSearchRequest movieRequest) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();

        String sql = "SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'title', t.title, 'year', t.year, 'director', t.director_name, 'rating', t.rating, 'backdropPath', t.backdrop_path, 'posterPath', t.poster_path, 'hidden', t.hidden)) FROM " +
                "( " +
                "SELECT m.id, m.title, m.year, director.name AS director_name, m.rating, m.backdrop_path, m.poster_path, m.hidden " +
                "FROM movies.movie_person p " +
                "JOIN movies.movie m ON m.id = p.movie_id " +
                "JOIN movies.person director ON director.id = m.director_id " +
                "WHERE p.person_id = :personId ";
        source.addValue("personId", personId, Types.INTEGER);
        if(!validate.canSeeHiddenMovies(roles)) {
            sql += "AND m.hidden = 0 ";
        }


        if (validate.validMovieOrderBy(movieRequest.getOrderBy())) {
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
        //LIMIT ASSUMED TO BE VALIDATED!!!
        source.addValue("limit", movieRequest.getLimit(), Types.INTEGER);


        sql += ") t;";

        return getMoviesFromDB(sql, source, new ResultError(MoviesResults.NO_MOVIES_WITH_PERSON_ID_FOUND));
    }

    private Movie[] getMoviesFromDB(String sql, MapSqlParameterSource source, ResultError throwOtherwise) {
        String jsonArrayString = "";
        try {
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            throw throwOtherwise;
        }
        if (jsonArrayString == null) {
            throw throwOtherwise;
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, Movie[].class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            throw throwOtherwise;
        }
    }

    public Movie getMovieDetails(Long movieId, List<String> roles) {   //, List<String> roles) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();
        String sql = "SELECT JSON_OBJECT('id', m.id, 'title', m.title, 'year', m.year, 'director', director.name, 'rating', m.rating, 'numVotes', m.num_votes, 'budget', m.budget, 'revenue', m.revenue, 'overview', m.overview, 'backdropPath', m.backdrop_path, 'posterPath', m.poster_path, 'hidden', m.hidden) " +
                "FROM movies.movie m " +
                "JOIN movies.person director ON director.id = m.director_id " +
                "WHERE m.id = :movieId ";
        if(!validate.canSeeHiddenMovies(roles)) {
            sql += "AND m.hidden = 0;";
        }
        source.addValue("movieId", movieId, Types.INTEGER);

        String jsonArrayString = "";
        try {
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_MOVIE_WITH_ID_FOUND);
        }
        if (jsonArrayString == null) {
            throw new ResultError(MoviesResults.NO_MOVIE_WITH_ID_FOUND);
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, Movie.class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_MOVIE_WITH_ID_FOUND);
        }
    }

    public Genre[] getGenresFromMovieId(Long movieId, List<String> roles) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();
        String sql = "SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name) ) FROM " +
                "( " +
                "SELECT DISTINCT g.id, g.name " +
                "FROM movies.movie_genre mg " +
                "JOIN movies.genre g on g.id = mg.genre_id ";

        // if the user cannot see hidden movies -- m.hidden must be 0
        if(!validate.canSeeHiddenMovies(roles)) {
            sql += "JOIN movies.movie m on m.id = mg.movie_id " +
                    "WHERE m.id = :movieId " +
                    "AND m.hidden = 0 ";
        } else {
            sql += "WHERE mg.movie_id = :movieId ";
        }

        sql += "ORDER BY g.name ASC ) t;";
        source.addValue("movieId", movieId, Types.INTEGER);

        String jsonArrayString = "";
        try {
            System.out.println(sql);
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            return new Genre[0];
        }
        if (jsonArrayString == null) {
            return new Genre[0];
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, Genre[].class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            return new Genre[0];
        }
    }

    public Person[] getPersonsFromMovieId(Long movieId, List<String> roles) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();
        String sql = "SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name)) FROM " +
                "(" +
                "SELECT DISTINCT p.id, p.name, p.popularity " +
                "FROM movies.movie_person mp " +
                "JOIN movies.person p ON p.id = mp.person_id ";

        // if the user cannot see hidden movies -- m.hidden must be 0
        if(!validate.canSeeHiddenMovies(roles)) {
            sql += "JOIN movies.movie m ON m.id = mp.movie_id " +
                    "WHERE m.id = :movieId " +
                    "AND m.hidden = 0 ";
        } else {
            sql += "WHERE mp.movie_id = :movieId ";
        }

        sql += "ORDER BY p.popularity DESC, p.id ASC ) t;";
        source.addValue("movieId", movieId, Types.INTEGER);

        String jsonArrayString = "";
        try {
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            return new Person[0];
        }
        if (jsonArrayString == null) {
            return new Person[0];
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, Person[].class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            return new Person[0];
        }
    }
}
