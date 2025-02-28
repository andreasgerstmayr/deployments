.DEFAULT_GOAL := all
.ONESHELL:
.SHELLFLAGS += -e

IMG_PREFIX := quay.io/agerstmayr
SOURCES := ../../..

help:
	@echo "Available targets:"
	@for t in `grep -oP '^([a-zA-Z-]+)(?=:.*$$)' Makefile`; do \
        echo "  make $$t"; done

setup-dns:
	ip r | grep 10.96.0.0 || (echo ERROR: Please start 'minikube tunnel' before. && exit 1)
	iface=`ip r | grep 10.96.0.0 | awk '{print $$NF}'`
	sudo resolvectl dns    $$iface 10.96.0.10
	sudo resolvectl domain $$iface cluster.local

install-cert-manager:
	kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.0/cert-manager.yaml

install-monitoring-stack:
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm repo update
	helm upgrade -i kube-prometheus-stack1 prometheus-community/kube-prometheus-stack -n kube-prometheus-stack1 --create-namespace -f helm/kube-prometheus-stack.yaml

install-tempo-operator:
	cd $(SOURCES)/tempo-operator
	eval `minikube docker-env`
	IMG_PREFIX=$(IMG_PREFIX) OPERATOR_VERSION=`date +%s`.0.0 make docker-build deploy reset

install-opentelemetry-operator:
	cd $(SOURCES)/opentelemetry-operator
	eval `minikube docker-env`
	IMG=$(IMG_PREFIX)/opentelemetry-operator:`date +%s` make generate container deploy

apply:
	kubectl apply -f .

all: install-cert-manager install-monitoring-stack install-tempo-operator install-opentelemetry-operator apply
