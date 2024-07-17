# Tempo
Tempo Microservices deployment with metrics-generator and Prometheus, Grafana, HotROD, k6-tracing and MinIO.

## Setup
```
docker compose up -d
```

## Services
* Tempo API: http://localhost:3200
* Jaeger UI: http://localhost:16686
* Grafana:   http://localhost:3001/explore
* HotROD:    http://localhost:8081

## Ingest Traces using telemetrygen
```
telemetrygen traces --otlp-http --otlp-insecure --otlp-endpoint=localhost:4318
```

## Credits
Based on https://github.com/grafana/tempo/tree/main/example/docker-compose/distributed
