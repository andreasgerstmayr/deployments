# Tempo

Tempo Microservices deployment with metrics-generator and Prometheus, Grafana, HotROD, k6-tracing and MinIO.

```
docker compose -f /path/to/deployments/docker-compose/tempo/docker-compose.yaml up -d
```

* Tempo API: http://localhost:3200
* Jaeger UI: http://localhost:16686
* Grafana:   http://localhost:3001/explore
* HotROD:    http://localhost:8081

Based on https://github.com/grafana/tempo/tree/main/example/docker-compose/distributed
