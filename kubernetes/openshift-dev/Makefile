.DEFAULT_GOAL := all
.ONESHELL:
.SHELLFLAGS += -e

IMG_PREFIX := quay.io/agerstmayr
SOURCES := ../../..

help:
	@echo "Available targets:"
	@for t in `grep -oP '^([a-zA-Z-]+)(?=:.*$$)' Makefile`; do \
        echo "  make $$t"; done

install-cert-manager:
	kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.0/cert-manager.yaml

install-tempo-operator:
	cd $(SOURCES)/tempo-operator
	IMG_PREFIX=$(IMG_PREFIX) OPERATOR_VERSION=`date +%s`.0.0 BUNDLE_VARIANT=openshift make docker-build docker-push deploy reset

install-opentelemetry-operator:
	cd $(SOURCES)/opentelemetry-operator
	IMG=$(IMG_PREFIX)/opentelemetry-operator:`date +%s` make generate container container-push deploy

enable-uiplugin:
	kubectl patch consoles.operator.openshift.io cluster --type=json -p='[{"op": "add", "path": "/spec/plugins/-", "value": "distributed-tracing-console-plugin"}]'

apply:
	kubectl apply -f .

all: install-cert-manager install-tempo-operator install-opentelemetry-operator apply
