package main

import (
	"context"
	"log"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

var (
	tracer = otel.Tracer("tracegen")
)

func main() {
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}

func run() (err error) {
	ctx := context.Background()
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return
	}

	root_spanlinks()
	root_escaping()
	root_k8sattrs()

	otelShutdown(ctx)
	return nil
}

func root_spanlinks() {
	ctx, span := tracer.Start(context.Background(), "root-spanlinks")
	defer span.End()

	generate(ctx)
}

func generate(rootCtx context.Context) {
	ctx, span := tracer.Start(rootCtx, "generate")
	defer span.End()

	queue1(rootCtx)
	queue2(rootCtx, ctx)
}

func queue1(rootCtx context.Context) {
	_, span := tracer.Start(context.Background(), "async-queue-task1")

	span.AddLink(trace.LinkFromContext(rootCtx, attribute.String("key1", "link to root span")))
	span.AddEvent("some-event1", trace.WithAttributes(attribute.String("key1", "val1"), attribute.String("key2", "val2")))

	defer span.End()
}

func queue2(rootCtx context.Context, innerCtx context.Context) {
	_, span := tracer.Start(context.Background(), "async-queue-task2")

	span.AddLink(trace.LinkFromContext(rootCtx, attribute.String("key1", "link to root")))
	span.AddLink(trace.LinkFromContext(innerCtx, attribute.String("key1", "link to generate")))
	span.AddEvent("some-event1", trace.WithAttributes(attribute.String("key1", "val1"), attribute.String("key2", "val2")))
	time.Sleep(123 * time.Millisecond)
	span.AddEvent("some-event2", trace.WithAttributes(attribute.String("key1", "val1"), attribute.String("key2", "val2")))

	defer span.End()
}

func root_escaping() {
	_, span1 := tracer.Start(context.Background(), `root-escaping of " and \ end`, trace.WithAttributes(
		attribute.String("http.route", `/v2/<repopath:repository>/blobs/<regex("([A-Za-z0-9_+.-]+):([A-Fa-f0-9]+)"):digest>`),
	))
	defer span1.End()

	_, span2 := tracer.Start(context.Background(), "root-escaping of \" and \\ and ` end", trace.WithAttributes(
		attribute.String("http.route", `/v2/<repopath:repository>/blobs/<regex("([A-Za-z0-9_+.-]+):([A-Fa-f0-9]+)"):digest>`),
	))
	defer span2.End()
}

func root_k8sattrs() {
	_, span := tracer.Start(context.Background(), "span-with-k8s-attrs", trace.WithAttributes(
		attribute.String("k8s.namespace.name", "openshift-tempo-operator"),
		attribute.String("k8s.node.name", "ip-10-0-235-91.ec2.internal"),
		attribute.String("k8s.deployment.name", "tempo-operator-controller"),
		attribute.String("k8s.pod.name", "tempo-operator-controller-56b5fdf58c-4tzf6"),
	))
	defer span.End()
}
