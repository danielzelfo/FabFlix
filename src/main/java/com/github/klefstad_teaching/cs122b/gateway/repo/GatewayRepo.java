package com.github.klefstad_teaching.cs122b.gateway.repo;

import com.github.klefstad_teaching.cs122b.gateway.repo.entity.GatewayRequestObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;

@Component
public class GatewayRepo
{
    private NamedParameterJdbcTemplate template;

    @Autowired
    public GatewayRepo(NamedParameterJdbcTemplate template)
    {
        this.template = template;
    }

    private MapSqlParameterSource[] createSources(List<GatewayRequestObject> requests) {
        GatewayRequestObject[] requestsArr = requests.toArray(new GatewayRequestObject[0]);
        MapSqlParameterSource[] sources = new MapSqlParameterSource[requests.size()];
        for(int i = 0; i < requests.size(); ++i) {
            sources[i] = new MapSqlParameterSource()
                    .addValue("call_time", Timestamp.from(requestsArr[i].getCall_time()), Types.TIMESTAMP)
                    .addValue("ip_address", requestsArr[i].getIp_address(), Types.VARCHAR)
                    .addValue("path", requestsArr[i].getPath(), Types.VARCHAR);
        }
        return sources;
    }

    public Mono<int[]> insertRequests(List<GatewayRequestObject> requests)
    {
        return Mono.fromCallable( () -> {
            MapSqlParameterSource[] arrayOfSources = createSources(requests);
            return this.template.batchUpdate(
                    "INSERT INTO `gateway`.`request` (ip_address, call_time, path) VALUES (:ip_address, :call_time, :path)",
                    arrayOfSources);
            }
        );
    }
}
