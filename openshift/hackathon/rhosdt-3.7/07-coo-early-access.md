# Run the following commands to deploy a dev preview of the observability-operator:
```
kubectl create namespace openshift-cluster-observability-operator
operator-sdk run bundle quay.io/agerstmayr/observability-operator-bundle:1.3.0-1758224296-dev --namespace openshift-cluster-observability-operator
```
**Note: the Perses dashboard integration is currently broken**
