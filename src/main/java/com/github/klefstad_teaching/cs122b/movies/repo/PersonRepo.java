package com.github.klefstad_teaching.cs122b.movies.repo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.MoviesResults;
import com.github.klefstad_teaching.cs122b.movies.repo.entity.Person;
import com.github.klefstad_teaching.cs122b.movies.util.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Types;

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

    public Person getPersonDetails(Long personId) {

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
            return this.objectMapper.readValue(jsonArrayString, Person.class);
        } catch( JsonProcessingException exc ) {
            //this shouldn't happen
            throw new ResultError(MoviesResults.NO_PERSON_WITH_ID_FOUND);
        }
    }
}
