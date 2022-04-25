package com.github.klefstad_teaching.cs122b.movies.rest;

import com.github.klefstad_teaching.cs122b.core.result.MoviesResults;
import com.github.klefstad_teaching.cs122b.movies.model.response.PersonResponse;
import com.github.klefstad_teaching.cs122b.movies.repo.PersonRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PersonController
{
    private final PersonRepo repo;

    @Autowired
    public PersonController(PersonRepo repo)
    {
        this.repo = repo;
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<PersonResponse> movieSearch(@PathVariable Long personId) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(new PersonResponse()
                        .setResult(MoviesResults.PERSON_WITH_ID_FOUND)
                        .setPerson(repo.getPersonDetails(personId)));
    }
}
