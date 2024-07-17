# Tempo
Tempo Microservices multi-tenant deployment with OpenTelemetry collector (k8sattributes and spanmetrics) and HotROD, k6-tracing and MinIO.

## Setup
The following operators must be installed prior to applying the manifests:
* **Tempo Operator**
* **Red Hat build of OpenTelemetry**

To store spanmetrics, cluster monitoring must be enabled when using OpenShift Local (`crc config set enable-cluster-monitoring true`).

```
kubectl apply -f namespace.yaml
kubectl apply -f .
```

## Services
* Jaeger UI: https://tempo-platform-gateway-openshift-tempo-operator.apps-crc.testing/platform
* HotROD:    http://hotrod-tracing-apps.apps-crc.testing/

## Ingest Traces using telemetrygen
```
apiVersion: v1
kind: Pod
metadata:
  name: telemetrygen
  namespace: tracing-apps
spec:
  containers:
  - name: telemetrygen
    image: ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:v0.92.0
    args:
    - traces
    - --otlp-endpoint=platform-collector.openshift-tempo-operator:4317
    - --otlp-insecure
  restartPolicy: Never
```

## Query Tempo API
```
apiVersion: v1
kind: Pod
metadata:
  name: traceql-search
  namespace: tracing-apps
spec:
  containers:
  - name: traceql-search
    image: ghcr.io/grafana/tempo-operator/test-utils:main
    command:
      - /bin/bash
      - -eux
      - -c
    args:
      - |
        curl -G \
          --header "Authorization: Bearer $(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
          --cacert /var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt \
          --data-urlencode 'q={ resource.service.name="article-service" }' \
          https://tempo-platform-gateway.openshift-tempo-operator.svc.cluster.local:8080/api/traces/v1/platform/tempo/api/search | jq
  restartPolicy: Never
```
