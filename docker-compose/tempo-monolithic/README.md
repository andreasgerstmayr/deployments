# Tempo
Tempo deployment with metrics-generator, Prometheus and Grafana.

## Setup
```
docker compose up -d
```

## Services
* Grafana:   http://localhost:3000/explore
* Tempo API: http://localhost:3200
* OTLP/gRPC ingest: `localhost:4317`
* OTLP/HTTP ingest: `http://localhost:4318`

## Ingest Traces using telemetrygen
```
docker run --network host ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen traces --otlp-http --otlp-insecure --otlp-endpoint=localhost:4318
```

## Credits
Based on https://github.com/grafana/tempo/tree/main/example/docker-compose/local
