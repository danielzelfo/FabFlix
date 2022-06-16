package com.github.klefstad_teaching.cs122b.movies.rest;

import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.core.result.MoviesResults;
import com.github.klefstad_teaching.cs122b.core.security.JWTManager;
import com.github.klefstad_teaching.cs122b.movies.model.request.MovieSearchRequest;
import com.github.klefstad_teaching.cs122b.movies.model.request.PersonSearchRequest;
import com.github.klefstad_teaching.cs122b.movies.model.response.MovieSearchResponse;
import com.github.klefstad_teaching.cs122b.movies.model.response.PersonResponse;
import com.github.klefstad_teaching.cs122b.movies.model.response.PersonSearchResponse;
import com.github.klefstad_teaching.cs122b.movies.repo.PersonRepo;
import com.github.klefstad_teaching.cs122b.movies.util.Validate;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.List;

@RestController
public class PersonController
{
    private final PersonRepo repo;
    private final Validate validate;

    @Autowired
    public PersonController(PersonRepo repo, Validate validate)
    {
        this.repo = repo;
        this.validate = validate;
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<PersonResponse> movieSearch(@PathVariable Long personId) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(new PersonResponse()
                        .setResult(MoviesResults.PERSON_WITH_ID_FOUND)
                        .setPerson(repo.getPersonDetails(personId)));
    }

    @GetMapping("/person/search")
    public ResponseEntity<PersonSearchResponse> movieSearch(@AuthenticationPrincipal SignedJWT user, PersonSearchRequest personRequest) {
        List<String> roles;
        try {
            roles = user.getJWTClaimsSet().getStringListClaim(JWTManager.CLAIM_ROLES);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        if (personRequest.getLimit() == null)
            personRequest.setLimit(10);
        else if (!validate.validLimit(personRequest.getLimit()))
            throw new ResultError(MoviesResults.INVALID_LIMIT);

        if (personRequest.getPage() == null)
            personRequest.setPage(1);
        else if (personRequest.getPage() < 1)
            throw new ResultError(MoviesResults.INVALID_PAGE);

        if (personRequest.getOrderBy() == null)
            personRequest.setOrderBy("name");
        if (personRequest.getDirection() == null)
            personRequest.setDirection("asc");

        return ResponseEntity.status(HttpStatus.OK)
                .body(new PersonSearchResponse()
                        .setResult(MoviesResults.PERSONS_FOUND_WITHIN_SEARCH)
                        .setPersons(repo.getPersons(personRequest, roles)));
    }
}
