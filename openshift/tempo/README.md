# Tempo
Tempo Microservices multi-tenant (`platform` and `user` tenants) deployment with OpenTelemetry collector (k8sattributes and spanmetrics) and multiple applications instrumented with traces.

## Base Setup
To store spanmetrics, cluster monitoring must be enabled when using OpenShift Local (`crc config set enable-cluster-monitoring true`).

```
kubectl apply -f base
```

### Jaeger UI
* `platform` tenant: https://tempo-platform-gateway-openshift-tracing.apps-crc.testing/platform
* `user` tenant: https://tempo-platform-gateway-openshift-tracing.apps-crc.testing/user

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

### Tracing Plugin for OpenShift Console
```
kubectl apply -f ocp_tracing_plugin_stable
# or
kubectl apply -f ocp_tracing_plugin_latest
```

The plugin is available in the Observe > Traces section.

Note: Tempo instances without multi-tenancy are not supported by the tracing UI plugin. When installing the latest version, enable the plugin at: https://console-openshift-console.apps-crc.testing/k8s/cluster/operator.openshift.io~v1~Console/cluster/console-plugins

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
          https://tempo-platform-gateway.openshift-tracing.svc.cluster.local:8080/api/traces/v1/platform/tempo/api/search | jq
  restartPolicy: Never
```
