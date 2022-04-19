package com.github.klefstad_teaching.cs122b.movies.rest;

import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.core.result.MoviesResults;
import com.github.klefstad_teaching.cs122b.core.security.JWTManager;
import com.github.klefstad_teaching.cs122b.movies.model.request.MovieSearchRequest;
import com.github.klefstad_teaching.cs122b.movies.model.response.MovieSearchResponse;
import com.github.klefstad_teaching.cs122b.movies.repo.MovieRepo;
import com.github.klefstad_teaching.cs122b.movies.util.Validate;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.List;

@RestController
public class MovieController
{
    private final MovieRepo repo;
    private final Validate validate;

    @Autowired
    public MovieController(MovieRepo repo, Validate validate)
    {
        this.repo = repo;
        this.validate = validate;
    }

    @GetMapping("/movie/search")
    public ResponseEntity<MovieSearchResponse> movieSearch(@AuthenticationPrincipal SignedJWT user, MovieSearchRequest movieRequest) {

        List<String> roles;
        try {
            roles = user.getJWTClaimsSet().getStringListClaim(JWTManager.CLAIM_ROLES);
        } catch (ParseException exc) {
            throw new ResultError(IDMResults.ACCESS_TOKEN_IS_INVALID);
        }

        if (movieRequest.getLimit() == null)
            movieRequest.setLimit(10);
        else if (!validate.validLimit(movieRequest.getLimit()))
            throw new ResultError(MoviesResults.INVALID_LIMIT);

        if (movieRequest.getPage() == null)
            movieRequest.setPage(1);
        else if (movieRequest.getPage() < 1)
            throw new ResultError(MoviesResults.INVALID_PAGE);

        if (movieRequest.getOrderBy() == null)
            movieRequest.setOrderBy("title");
        if (movieRequest.getDirection() == null)
            movieRequest.setDirection("asc");


        return ResponseEntity.status(HttpStatus.OK)
                .body(new MovieSearchResponse()
                        .setResult(MoviesResults.MOVIES_FOUND_WITHIN_SEARCH)
                        .setMovies(repo.getMovies(movieRequest, roles)));
    }
}
