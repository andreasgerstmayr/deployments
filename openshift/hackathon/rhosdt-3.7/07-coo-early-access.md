# Run the following commands to deploy a dev preview of the observability-operator:
```
kubectl create namespace openshift-cluster-observability-operator
operator-sdk run bundle quay.io/agerstmayr/observability-operator-bundle:1758642721.0.0 --namespace openshift-cluster-observability-operator
```
