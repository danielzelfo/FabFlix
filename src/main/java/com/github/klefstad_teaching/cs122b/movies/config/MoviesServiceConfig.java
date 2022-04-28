package com.github.klefstad_teaching.cs122b.movies.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@ConstructorBinding
@ConfigurationProperties(prefix = "movie")
public class MoviesServiceConfig extends WebSecurityConfigurerAdapter
{
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .httpBasic();
    }
}
