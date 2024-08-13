# Tempo
Tempo Microservices multi-tenant deployment with OpenTelemetry collector (k8sattributes and spanmetrics) and HotROD, k6-tracing and MinIO.

## Setup
The following operators must be installed prior to applying the manifests:
* **Tempo Operator**
* **Red Hat build of OpenTelemetry**

To store spanmetrics, cluster monitoring must be enabled when using OpenShift Local (`crc config set enable-cluster-monitoring true`).

```
kubectl apply -f base/namespaces.yaml
kubectl apply -f base
```

The k8-tracing load generator continuously create traces.
HotROD creates traces if any button in the HotROD UI (see below) is clicked.

## Services
* Jaeger UI: https://tempo-platform-gateway-openshift-tracing.apps-crc.testing/platform
* HotROD:    http://hotrod-tracing-app-hotrod.apps-crc.testing/

## Ingest Traces using telemetrygen
```
apiVersion: v1
kind: Pod
metadata:
  name: telemetrygen
spec:
  containers:
  - name: telemetrygen
    image: ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:v0.92.0
    args:
    - traces
    - --otlp-endpoint=platform-collector.openshift-tracing:4317
    - --otlp-insecure
  restartPolicy: Never
```

## Run TraceQL Query
```
apiVersion: v1
kind: Pod
metadata:
  name: traceql-search
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
          https://tempo-platform-gateway.openshift-tracing.svc.cluster.local:8080/api/traces/v1/platform/tempo/api/search | jq
  restartPolicy: Never
```

## Addons
### Tracing UI Plugin
Install the **Cluster Observability Operator** and enable the Tracing plugin:
```
kubectl apply -f ui_plugin/tracing.yaml
```

Note: Tempo instances with multi-tenancy are not yet supported by the tracing UI plugin.

### Perses Service Performance Monitoring dashboard
Apply the RBAC rules:
```
kubectl apply -f perses/rbac.yaml
```

Start a reverse proxy to access Thanos querier in CRC from a local Perses installation
```
mitmdump -p 9091 --mode "reverse:https://thanos-querier-openshift-monitoring.apps-crc.testing" --ssl-insecure \
  --modify-headers "/~q/Authorization/Bearer $(kubectl -n perses create token perses)"
```

Start a reverse proxy to access Tempo in CRC from a local Perses installation
```
kubectl port-forward -n openshift-tracing svc/tempo-platform-gateway 8081:8080
mitmdump -p 3200 --mode "reverse:https://localhost:8081" --ssl-insecure \
  --modify-headers "/~q/Authorization/Bearer $(kubectl -n perses create token perses)" \
  --map-remote "|/api|/api/traces/v1/platform/tempo/api"
```

Open Perses and import the dashboards from the [perses/dashboards](perses/dashboards) folder.
