# Tempo
Tempo Microservices multi-tenant (`platform` and `user` tenants) deployment with OpenTelemetry collector (k8sattributes and spanmetrics) and multiple applications instrumented with traces.

## Base Setup
To store spanmetrics, cluster monitoring must be enabled when using OpenShift Local (`crc config set enable-cluster-monitoring true`).

```
kubectl apply -f base
```

### Jaeger UI
* `platform` tenant: https://tempo-tempo-gateway-openshift-tracing.apps-crc.testing/platform
* `user` tenant: https://tempo-tempo-gateway-openshift-tracing.apps-crc.testing/user

## Addons
### Tracing Apps
```
kubectl apply -f tracing-apps
```

HotROD: http://hotrod-tracing-app-hotrod.apps-crc.testing/

The k8-tracing load generator and telemetrygen continuously create traces.
HotROD creates traces if any button in the HotROD UI (see above) is clicked.

### OpenTelemetry auto-instrumentation
```
kubectl apply -f auto_instrumentation
```

PetClinic: http://petclinic-tracing-app-petclinic.apps-crc.testing

### OpenShift Console Plugins
```
kubectl apply -f ocp_console
```

The plugin is available in the Observe > Traces section.

Note: Tempo instances without multi-tenancy are not supported by the tracing UI plugin.

## curl
### Ingest Traces using telemetrygen
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

### Run TraceQL Query
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
          https://tempo-tempo-gateway.openshift-tracing.svc.cluster.local:8080/api/traces/v1/user/tempo/api/search | jq
  restartPolicy: Never
```

#### Run query from outside the cluster
kubectl create serviceaccount demo
TOKEN=$(kubectl create token demo)
curl -G -k \
  --header "Authorization: Bearer $TOKEN" \
  --data-urlencode 'q={ resource.service.name="article-service" }' \
  https://tempo-tempo-gateway-openshift-tracing.apps-crc.testing/api/traces/v1/user/tempo/api/search | jq
