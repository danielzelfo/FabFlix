package com.github.klefstad_teaching.cs122b.gateway.repo.entity;

import org.springframework.http.server.RequestPath;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.time.Instant;

public class GatewayRequestObject {
    private String ip_address;
    private Instant call_time;
    private RequestPath path;

    public String getIp_address() {
        return ip_address;
    }

    public GatewayRequestObject setIp_address(String ip_address) {
        this.ip_address = ip_address;
        return this;
    }

    public Instant getCall_time() {
        return call_time;
    }

    public GatewayRequestObject setCall_time(Instant call_time) {
        this.call_time = call_time;
        return this;
    }

    public RequestPath getPath() {
        return path;
    }

    public GatewayRequestObject setPath(RequestPath path) {
        this.path = path;
        return this;
    }
}
