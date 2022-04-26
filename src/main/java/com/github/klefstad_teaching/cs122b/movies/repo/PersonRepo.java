package com.github.klefstad_teaching.cs122b.movies.repo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.MoviesResults;
import com.github.klefstad_teaching.cs122b.movies.model.request.PersonSearchRequest;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.PersonDetails;
import com.github.klefstad_teaching.cs122b.movies.util.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Types;
import java.util.List;

@Component
public class PersonRepo
{
    private ObjectMapper objectMapper;
    private NamedParameterJdbcTemplate template;
    private Validate validate;

    @Autowired
    public PersonRepo(ObjectMapper objectMapper, NamedParameterJdbcTemplate template, Validate validate)
    {
        this.objectMapper = objectMapper;
        this.template = template;
        this.validate = validate;
    }

    public PersonDetails getPersonDetails(Long personId) {

        MapSqlParameterSource source =
                new MapSqlParameterSource();
        String sql = "SELECT JSON_OBJECT('id', p.id, 'name', p.name, 'birthday', p.birthday, 'biography', p.biography, 'birthplace', p.birthplace, 'popularity', p.popularity, 'profilePath', p.profile_path) " +
                "FROM movies.person p " +
                "WHERE p.id = :personId ";

        source.addValue("personId", personId, Types.INTEGER);

        String jsonArrayString = "";
        try {
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_PERSON_WITH_ID_FOUND);
        }
        if (jsonArrayString == null) {
            throw new ResultError(MoviesResults.NO_PERSON_WITH_ID_FOUND);
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, PersonDetails.class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_PERSON_WITH_ID_FOUND);
        }
    }

    public PersonDetails[] getPersons(PersonSearchRequest personRequest, List<String> roles) {
        MapSqlParameterSource source =
                new MapSqlParameterSource();

        String sql = "SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name, 'birthday', t.birthday, 'biography', t.biography, 'birthplace', t.birthplace, 'popularity', t.popularity, 'profilePath', t.profile_path)) " +
                "FROM " +
                "( " +
                "SELECT DISTINCT p.id, p.name, p.birthday, p.biography, p.birthplace, p.popularity, p.profile_path " +
                "FROM movies.person p\n";

        if (personRequest.getMovieTitle() != null) {
            sql += "JOIN movies.movie_person mp ON mp.person_id = p.id " +
                    "JOIN movies.movie m on m.id = mp.movie_id ";
        }
        Boolean whereAdded = false;
        if (personRequest.getName() != null) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "p.name LIKE :name ";
            source.addValue("name", "%"+personRequest.getName()+"%", Types.VARCHAR);
        }
        if (personRequest.getBirthday() != null) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "p.birthday = :birthday ";
            source.addValue("birthday", personRequest.getBirthday(), Types.VARCHAR);
        }
        if (personRequest.getMovieTitle() != null) {
            if (whereAdded) {
                sql += "AND ";
            } else {
                sql += "WHERE ";
                whereAdded = true;
            }
            sql += "m.title LIKE :movieTitle ";
            source.addValue("movieTitle", "%"+personRequest.getMovieTitle()+"%", Types.VARCHAR);
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

        if (validate.validPersonOrderBy(personRequest.getOrderBy())) {
            sql += "ORDER BY p." + personRequest.getOrderBy() + " ";
            if (validate.validDirection(personRequest.getDirection().toUpperCase())) {
                sql += personRequest.getDirection().toUpperCase() + ", p.id ASC ";
            } else {
                throw new ResultError(MoviesResults.INVALID_DIRECTION);
            }
        } else {
            throw new ResultError(MoviesResults.INVALID_ORDER_BY);
        }
        sql += "LIMIT :startpoint, :limit ";
        source.addValue("startpoint", (personRequest.getPage()-1)*personRequest.getLimit(), Types.INTEGER);
        //LIMIT ASSUMED TO BE VALIDATED!!!
        source.addValue("limit", personRequest.getLimit(), Types.INTEGER);

        sql += ") t; ";

        String jsonArrayString = "";
        try {
            jsonArrayString = this.template.queryForObject(sql, source, (rs, rowNum)->rs.getString(1));
        } catch (EmptyResultDataAccessException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_PERSONS_FOUND_WITHIN_SEARCH);
        }
        if (jsonArrayString == null) {
            throw new ResultError(MoviesResults.NO_PERSONS_FOUND_WITHIN_SEARCH);
        }

        try {
            return this.objectMapper.readValue(jsonArrayString, PersonDetails[].class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_PERSONS_FOUND_WITHIN_SEARCH);
        }
    }
}
